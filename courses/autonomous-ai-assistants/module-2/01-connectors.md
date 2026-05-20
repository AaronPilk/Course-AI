---
module: 2
position: 1
title: "Connectors — how assistants plug into your tools"
objective: "Set up safe connections to calendar, email, docs, code, and chat."
estimated_minutes: 10
---

# Connectors — how assistants plug into your tools

## The puzzle

An assistant that can't read your calendar, email, or docs isn't an assistant — it's a chatbot. The moment you want it to *do useful work in your life*, you need it connected to your tools.

But "connected" is a loaded word. It means OAuth flows, permission scopes, secrets management, rate limits, version drift, and privacy implications. Get this layer right and the assistant becomes useful. Get it wrong and it becomes a security liability.

## The simple version

A **connector** is the bridge between the assistant and one of your tools (Google Calendar, Gmail, GitHub, Notion, etc.). Each connector:

1. **Authenticates** the user to the tool (usually OAuth).
2. **Caches a token** safely.
3. **Exposes specific actions** to the assistant (read calendar, send email — narrow, not "full access").
4. **Refreshes tokens** when they expire.
5. **Revokes cleanly** when the user disconnects.

Connectors are the assistant's hands. They need to be well-scoped, well-audited, and clearly visible to the user.

## The technical version

### Connector architecture

A connector typically has three layers:

**1. OAuth flow.** Standard: user clicks "Connect Google Calendar," gets sent to Google's consent screen, comes back with an authorization code, you exchange for access and refresh tokens.

**2. Token storage.** Encrypt at rest. Scope to the user. Rotate when refresh tokens are issued.

**3. Action layer.** Wrapped functions the assistant can call: `list_events(timeMin, timeMax)`, `create_event(...)`, `send_email(...)`. Each one mediates between the assistant's intent and the tool's actual API.

### Choose scopes carefully

OAuth scopes determine what the assistant can do. Two principles:

**Principle of least privilege.** Ask for the smallest scope that does the job. `calendar.events.readonly` if you only need to read. `gmail.send` only if you're sending. Each broader scope is a wider blast radius for incidents.

**Read-only first.** For early autonomy levels, read-only scopes are enough. Add write scopes when level-3+ features require them, with clear user consent at the upgrade.

### The consent screen is part of your product

Users see the OAuth consent screen as part of your assistant's UX. It should:

- Be clear about why you're asking ("Connect calendar so your assistant can prep meetings").
- Match scopes to the user-facing capability.
- Show value before consent — let users see what they get *before* clicking "Allow."

A scary or unclear consent screen is the most common drop-off in assistant onboarding.

### Token security

Treat OAuth tokens like passwords:

- Encrypt at rest (Postgres with pgcrypto, KMS-managed keys, etc.).
- Never log them.
- Scope by user ID; never let one user's token be used in another user's context.
- Rotate when the tool issues refresh tokens.
- Delete on user disconnect.

The blast radius of a leaked OAuth token is huge — the assistant's full scope on the user's account. Build security in from the start.

### Wrapping the tool's API

The assistant doesn't see the raw Google Calendar API. It sees your wrapped action layer:

```js
// What the assistant sees
{
  name: "list_calendar_events",
  description: "Get calendar events between two dates for the connected calendar.",
  input_schema: {
    type: "object",
    properties: {
      start: { type: "string", format: "date-time" },
      end: { type: "string", format: "date-time" },
      max_results: { type: "integer", default: 50, maximum: 250 }
    },
    required: ["start", "end"]
  }
}

// What your code does
async function list_calendar_events({ start, end, max_results = 50 }) {
  const tokens = await getUserTokens(currentUserId, "google_calendar");
  return await google.calendar.events.list({
    auth: tokens.accessToken,
    timeMin: start,
    timeMax: end,
    maxResults: max_results,
    singleEvents: true,
    orderBy: "startTime"
  });
}
```

The wrapping layer:

- **Restricts** what the assistant can do (narrow tools instead of raw API).
- **Validates** inputs.
- **Logs** every call for audit.
- **Handles** token refresh, rate limits, errors.

Don't expose raw API clients to the assistant. Always wrap.

### Rate limits

Each tool has its own rate limits. Build them in:

- **Per-user rate limits** at your connector layer (be a good citizen).
- **Exponential backoff** on 429 errors.
- **Circuit breakers** if a tool's API is degraded.
- **Caching** of recent reads to reduce calls.

A poorly-behaved connector can get your app's API key throttled or banned by the provider.

### Refresh tokens

OAuth access tokens expire (often 1 hour). Refresh tokens (when issued) let you renew without user re-auth:

```js
async function getValidToken(userId, provider) {
  const tokens = await db.getTokens(userId, provider);
  if (Date.now() > tokens.expiresAt - 60_000) {  // refresh 1 min early
    const refreshed = await oauth.refresh(tokens.refreshToken, provider);
    await db.saveTokens(userId, provider, refreshed);
    return refreshed.accessToken;
  }
  return tokens.accessToken;
}
```

If the refresh fails (user revoked access, refresh token expired), surface clearly: "Reconnect Google Calendar to keep the assistant working."

### Disconnection

When a user disconnects:

- Revoke the token at the provider (if their API supports it).
- Delete tokens from your DB.
- Stop scheduled tasks that require the tool.
- Surface the impact clearly: "Calendar disconnected. Morning briefing won't include calendar context until you reconnect."

Clean disconnects build trust. Half-disconnected states (tokens deleted but background tasks still trying) are confusing and look broken.

### Per-tool gotchas

Some quirks to know:

- **Google**: OAuth scopes can be granular; consent screens trigger Google security review for sensitive scopes (gmail.send, drive.file, etc.). Plan time.
- **Microsoft 365**: similar to Google but with different scopes and admin-consent requirements for some endpoints.
- **Slack**: bot tokens vs user tokens; scopes per tool. Pick deliberately.
- **GitHub**: fine-grained PATs vs OAuth app installs; org-level vs user-level access.
- **Notion**: workspace-level connections; sharing model is different from typical OAuth.

Read each provider's docs before integrating. The pattern is the same; the details differ.

### MCP as connector layer

The Model Context Protocol (covered in the Anthropic and Agent Engineering courses) is increasingly the standard for connector layers. An MCP server wraps a tool; any MCP-compatible client uses it. As MCP matures, expect to build fewer custom integrations and more "drop in this MCP server."

For now (early 2026), custom integrations + a few MCP servers is the pragmatic mix.

## Three real-world scenarios

**Scenario 1: The scoping save.**
A team scoped Gmail at `gmail.modify` (read + write all). Reviewed by a security advisor; reduced to `gmail.readonly` + `gmail.send` (more limited). When a bug later mis-routed an action, the blast radius was much smaller than if they'd had full modify access.

**Scenario 2: The disconnect that didn't.**
A team's "disconnect Google" button deleted DB tokens but didn't revoke at Google. Users disconnected and reconnected expecting fresh consent — got back the same tokens because Google still considered the app authorized. Confusion and one privacy concern later, they implemented full revoke. Lesson: revoke at the provider, not just in your DB.

**Scenario 3: The rate-limit cascade.**
An assistant fetched user's calendar on every interaction. With 1,000 active users, they were near Google's per-app rate limit. Slowdowns cascaded. They added per-user caching (5-minute TTL on calendar reads), tightened the rate limit budget per request, alerted on usage. Fixed.

## Common mistakes to avoid

- **Over-scoped OAuth requests.** Asking for too much; users distrust the consent screen.
- **Logging tokens.** Major security incident waiting.
- **No token refresh.** Assistant breaks silently after first hour.
- **Half-disconnects.** Tokens deleted but tasks still running.
- **No per-user rate limits.** App-wide cascading failures.
- **Raw API exposed to assistant.** Wide action surface; no validation; no audit.

## Read more

- [OAuth 2.0 simplified](https://aaronparecki.com/oauth-2-simplified/)
- [Google OAuth scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Microsoft Graph permissions](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Model Context Protocol](https://modelcontextprotocol.io)

## Summary

- **Connectors** are the assistant's hands; design carefully.
- **Least-privilege OAuth scopes.** Read-only first; add write as needed.
- **Encrypt tokens at rest**, scope by user, rotate on refresh, delete on disconnect.
- **Wrap raw APIs** in narrow tool actions for the assistant; never expose raw clients.
- **Rate-limit at your layer**; cache where possible; alert on quota usage.
- **Refresh tokens automatically**; surface clearly when re-auth is needed.
- **Disconnect cleanly** — revoke at provider, halt dependent tasks, surface impact.

Next: MCP as the standard connector layer.
