---
module: 3
position: 3
title: "OAuth providers and SSO"
objective: "Google, GitHub, Apple, and enterprise SAML."
estimated_minutes: 7
---

# OAuth providers and SSO

## Why OAuth

Modern users expect "Sign in with Google" / "Sign in with Apple" / "Sign in with GitHub" buttons. Benefits:

- **One-tap signup.** No email confirmation, no password creation.
- **Higher conversion.** Friction-free onboarding.
- **Verified identity.** Email comes from the provider, already verified.
- **No password management.** Provider handles security.

Supabase supports 20+ OAuth providers out of the box. Setup is straightforward but requires creating an app in each provider's developer console and copying credentials into Supabase dashboard.

## How OAuth works

The flow:

1. User clicks "Sign in with Google" in your app.
2. Supabase redirects to Google's OAuth consent page.
3. User approves; Google redirects back to Supabase with an authorization code.
4. Supabase exchanges the code for an access token + identity info.
5. Supabase creates (or finds) the user in `auth.users`.
6. Supabase issues a session JWT to your app.

You write very little code. supabase-js handles the redirect dance:

```ts
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://app.example.com/auth/callback',
  },
});
```

The redirect happens; user authenticates with Google; comes back signed in.

## Configuring providers

In Supabase dashboard → Authentication → Providers:

- Toggle the provider on.
- Add Client ID and Client Secret from the provider's developer console.
- Add the Supabase callback URL to the provider's allowed redirect URIs (it's shown in dashboard).
- Optionally configure scopes (what data you request from the provider).

Each provider has its own setup:

- **Google**: Google Cloud Console → OAuth 2.0 Client. Add Supabase's callback URL. Configure consent screen.
- **GitHub**: GitHub Settings → Developer Settings → OAuth Apps. Same idea.
- **Apple**: Apple Developer → Identifiers → Services ID. More involved (requires Apple Developer account).
- **Microsoft**: Azure AD → App Registrations.
- **Discord, Twitter, Facebook, etc.**: similar process.

Documentation in Supabase guides covers each.

## Scopes

OAuth providers expose user data via scopes. Default scopes give you email + name + avatar. Additional scopes give more:

```ts
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    scopes: 'email profile https://www.googleapis.com/auth/calendar.readonly',
  },
});
```

Be conservative — request only what you need. Excessive scope requests make users wary and can fail provider review (especially Google's verification process).

## Provider-specific user data

After OAuth signup, the user row in `auth.users` includes:

- `email` — from the provider.
- `user_metadata` — provider-specific fields like `full_name`, `avatar_url`, `provider_id`.
- `app_metadata.provider` — the primary provider used.
- `app_metadata.providers` — all linked providers.

In your `profiles` trigger, you can pull these into your profile row:

```sql
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'preferred_username', new.email),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;
```

## Account linking

A user might sign up with email/password, then later try Google with the same email. By default, Supabase treats these as separate accounts (different `id`s).

To link them, either:

1. **Auto-link on email match.** Configure in dashboard: Auth → Settings → "Auto-link accounts by email." Now matching emails get linked to one account. Caveat: if email isn't verified, this is a security risk (account takeover).

2. **Manual link.** While signed in, call `linkIdentity`:
   ```ts
   await supabase.auth.linkIdentity({ provider: 'google' });
   ```

Production approach: keep auto-link off, expose "link more providers" in account settings, require re-auth before linking.

## Enterprise SSO via SAML

For B2B apps selling to enterprises, customers want SAML SSO so their IT can manage user access via Okta, Azure AD, OneLogin, JumpCloud, Google Workspace.

Supabase supports SAML 2.0 (paid feature on Pro plans and above). Setup:

1. Customer provides their SAML metadata XML (or URL).
2. You configure a SAML connection in Supabase pointing at it.
3. Customer's users go to a unique URL; clicking signs in via their IdP.
4. JIT (just-in-time) provisioning creates users on first login.

```ts
await supabase.auth.signInWithSSO({
  domain: 'customer-company.com',
});
```

The `domain` matches the SAML connection you set up for that customer.

SAML SSO is a sales-driven feature — required to close mid-market and enterprise deals. The implementation is straightforward; the long pole is each customer's IT team being available to do the IdP-side setup.

## SCIM and provisioning

Some enterprises also want SCIM (system for cross-domain identity management) for user provisioning — automatically creating, updating, deactivating users via their IdP. Supabase has growing SCIM support; check current docs for status.

Without SCIM, users self-provision via SSO on first login (JIT). For most use cases JIT is enough; SCIM is required only when admins want full lifecycle control (e.g., immediate deactivation when an employee leaves).

## Callback URL handling

The OAuth callback URL is where Supabase sends the user after provider auth. It needs to:

1. Match an allowed redirect URL in your Supabase dashboard.
2. Be a route in your app that handles the auth code.

A typical Next.js callback:

```ts
// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createServerClient(/* config */);
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
```

The `exchangeCodeForSession` call trades the OAuth code for a session.

## OAuth on mobile

Mobile apps use deep links instead of HTTP callbacks. The flow:

1. App opens an in-app browser to the OAuth URL.
2. User authenticates.
3. Provider redirects to a custom URL scheme (e.g., `myapp://auth/callback`).
4. App intercepts the deep link; extracts the code; exchanges for session.

supabase-js has mobile-specific helpers; React Native via `@supabase/auth-helpers-react-native`, Expo via `expo-auth-session` or `@supabase/supabase-js` with proper redirect handling.

## What to expose to users

Most apps offer:

- 2-4 OAuth buttons (Google + GitHub for dev tools; Google + Apple for consumer; Microsoft for B2B).
- Email + password (or magic link) as a fallback.
- SSO for enterprise customers (B2B).

Decision tree:

- Consumer / B2C: Google + Apple primary, email magic link fallback.
- Developer tools: Google + GitHub primary, email/password fallback.
- B2B SaaS: Google + Microsoft + email/password; SAML SSO for enterprise.
- Enterprise sales motion: SAML SSO mandatory; everything else optional.

## Mistakes to avoid

- **Requesting too many scopes.** Reduces signup conversion; risks provider review.
- **Forgetting to add the redirect URL to allowed list.** OAuth callback fails silently.
- **Auto-linking accounts without verified email.** Account takeover vector.
- **No SAML for enterprise sales.** Lost deals at $50k+ ACVs.
- **Default callback URL pattern not handling code exchange.** Sessions never created.

## Summary

- OAuth providers via signInWithOAuth; Supabase handles the dance.
- Configure provider in dashboard + provider's developer console.
- Be conservative with scopes.
- Account linking: auto on verified email or manual via linkIdentity.
- SAML SSO for enterprise; required at mid-market+ deals.
- Mobile uses deep links; library helpers handle the details.

Next: custom claims and authorization patterns.
