---
module: 2
position: 3
title: "OAuth and permission scoping in practice"
objective: "Get the right permissions; ask for nothing more."
estimated_minutes: 8
---

# OAuth and permission scoping in practice

## The puzzle

Your assistant's consent screen pops up and asks for: full Gmail access, full Calendar access, full Drive access, full Contacts access. The user hesitates. Most close the tab.

Permission scoping isn't just security hygiene — it's an adoption problem. Ask for too much and users say no. Ask for too little and the assistant doesn't work. This lesson is how to walk that line.

## The simple version

Three rules for OAuth scoping in assistants:

1. **Ask narrowly.** Use the smallest scope that does the job.
2. **Ask incrementally.** Don't request everything up front; ask for write access when the user actually wants a write feature.
3. **Explain why.** The consent screen is part of your product UX; users need to understand what they're approving.

## The technical version

### Anatomy of an OAuth scope

OAuth scopes are strings the provider defines:

- `https://www.googleapis.com/auth/calendar.events.readonly`
- `https://www.googleapis.com/auth/calendar.events` (read + write)
- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.modify`

Each grants specific capabilities. Read the provider's scope catalog carefully — wider scopes look convenient but are often overkill.

### Narrow scoping in practice

Examples of narrowing:

**Calendar**: do you need to *create* events or just read them? Read-only is a much smaller ask.

**Gmail**: do you need to read all email or just send? `gmail.send` doesn't grant read access.

**GitHub**: do you need write access to all repos or just specific ones? Fine-grained PATs let you scope by repo.

**Drive**: do you need access to all files or just files your app creates? `drive.file` scope only sees app-created files.

The narrower the scope, the smaller the blast radius if anything goes wrong.

### Incremental authorization

Most providers support **incremental authorization**: ask for narrow scopes initially; ask for more when needed. Google does this; Microsoft does this; Salesforce does this.

Pattern:

```
Day 1: Connect → consent for read-only calendar.
Day 7: User clicks "Schedule a meeting for me" → consent for calendar.write.
Day 14: User clicks "Send the invite" → consent for gmail.send.
```

Each ask is tied to a specific value moment. Users see why they're approving more access. Trust ramps with autonomy.

Compare to "ask for everything up front" — most users reject; the few who don't, do so blindly.

### Google's verification process

For sensitive scopes (gmail.send, drive.file, contacts), Google requires verification:

- App must have a privacy policy URL.
- Brand verification (logo, app name, domain).
- For some scopes, a security assessment by an approved third party.

The process can take weeks-to-months for new apps. Plan accordingly. Start the verification *early* in your build, not the week before launch.

### Microsoft and admin consent

Microsoft 365 has admin-consent scopes for some sensitive operations (cross-mailbox access, admin tools). Individual users can't approve these — an org admin must.

For B2B assistants: design for admin-consent in your enterprise tier. For consumer/individual: stick to user-consent scopes only.

### Token scoping per user, always

Whatever your auth system looks like, ensure tokens are scoped strictly per user:

```js
// Bad: shared in a global cache by tool name
cache.set("google_calendar_token", token);

// Good: scoped to user
db.tokens.insert({ user_id: userId, provider: "google_calendar", token });
```

A bug that lets user A use user B's tokens is a privacy incident. Strict per-user scoping prevents it.

### Refresh token longevity

Refresh tokens are powerful — they let you renew access without user re-auth. Treat them with even more care than access tokens:

- Encrypt at rest with strong keys.
- Audit access to the encrypted store.
- Detect and revoke leaked refresh tokens fast.
- Some providers expire refresh tokens after a period of inactivity — handle gracefully with re-auth.

### Disconnect requires revoke

When a user disconnects:

1. Call the provider's revoke endpoint with the refresh token.
2. Delete tokens from your DB.
3. Halt any background tasks that depended on the connector.

If you skip step 1, the user's app authorization at the provider remains intact — they may not see the consent screen on next connect, and the apparent "disconnect" feels broken.

### Scope upgrade paths

When you add a feature that needs more scope:

1. Surface the upgrade clearly: "To send invites, your assistant needs Gmail send permission."
2. Send the user through the consent flow with the additional scope.
3. Handle decline gracefully ("OK, we won't send invites; you can do this yourself").
4. Store new scope grants so you don't ask again unnecessarily.

### Multi-account support

If users connect multiple accounts (work + personal Google, multiple GitHub orgs, etc.):

- Store accounts separately per user.
- Surface clearly which account each action uses.
- Let users designate a default per task type.

Single-account assistants are simpler; multi-account is a v2 feature for most products.

### Security audits

Some good practices:

- **Quarterly review** of all OAuth scopes you request — are they all still needed?
- **Annual security audit** including OAuth handling.
- **Penetration testing** if you handle sensitive data (financial, health).
- **SOC 2 / ISO 27001** for B2B if customers ask.

OAuth handling is one of the highest-risk parts of an assistant. Treat it like the production security surface it is.

## Three real-world scenarios

**Scenario 1: The scope reduction that boosted activation.**
A team's onboarding requested gmail.modify + calendar + drive + contacts. Drop-off at consent screen was 60%. They reduced initial ask to calendar.readonly only; added other scopes incrementally as users tried specific features. Drop-off fell to 18%; feature usage spread more evenly.

**Scenario 2: The Google verification surprise.**
A team built a Gmail assistant with `gmail.modify`. Two weeks before launch, they started Google's verification process — discovered it would take 8-12 weeks for sensitive scope review. They split the launch: a "calendar only" version shipped immediately, Gmail features came later after verification.

**Scenario 3: The leaked token.**
A team logged OAuth tokens to their general application log "for debugging." The logs were exposed via a separate incident. They had to revoke all user tokens, re-auth everyone, and disclose the breach. Lesson: tokens are passwords; treat them accordingly.

## Common mistakes to avoid

- **Asking for everything up front.** Kills activation; raises red flags.
- **Picking wider scopes for "simplicity."** Wider blast radius.
- **Skipping verification.** Required for sensitive scopes; takes weeks.
- **Logging tokens.** Massive security risk.
- **Cross-user token bugs.** Strict per-user scoping prevents privacy incidents.
- **Half-disconnects.** Revoke at provider, not just locally.

## Read more

- [OAuth 2.0 simplified](https://aaronparecki.com/oauth-2-simplified/)
- [Google OAuth verification](https://support.google.com/cloud/answer/9110914)
- [Microsoft admin consent](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-admin-consent)

## Summary

- **Ask narrowly**: smallest scope that does the job.
- **Ask incrementally**: tied to specific user value moments.
- **Explain why** on the consent screen — it's part of your product.
- **Verify early** for sensitive Google scopes; plan weeks of lead time.
- **Tokens are passwords**: encrypt, scope per user, never log, audit access.
- **Disconnect = revoke + delete + halt**: anything less is half-disconnect.

Next: tool inventory and surface area.
