---
module: 3
position: 1
title: "Supabase Auth architecture"
objective: "JWTs, sessions, refresh tokens."
estimated_minutes: 7
---

# Supabase Auth architecture

## The auth stack

Supabase Auth provides a complete authentication system: user signup, password hashing, JWT issuance, session management, OAuth provider integration, magic links, OTP, and multi-factor auth. It lives in a separate service (GoTrue) that integrates with the Postgres database via the `auth` schema.

Users are stored in `auth.users`. The schema is owned by the Supabase platform — you read from it but don't usually write to it directly. Custom data about users (preferences, profile fields) goes in a `public.profiles` table linked by `auth.users.id`.

## How JWTs work in Supabase

When a user logs in, Supabase issues two tokens:

- **Access token** — JWT containing the user's ID (`sub`), role (`authenticated`), and other claims. Short-lived (typically 1 hour). Used to authenticate every API request.
- **Refresh token** — long-lived (default 30 days), opaque token used to obtain a new access token when the current one expires.

The supabase-js client manages both automatically. It refreshes the access token in the background; you don't see expirations under normal use.

JWT structure:

```json
{
  "sub": "user-uuid-here",
  "role": "authenticated",
  "aud": "authenticated",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234571490,
  "app_metadata": {
    "provider": "email",
    "providers": ["email", "google"]
  },
  "user_metadata": {
    "full_name": "Jane Doe"
  }
}
```

RLS policies read these claims via `auth.uid()` (returns `sub`) and `auth.jwt()` (returns the full payload).

## app_metadata vs user_metadata

Two metadata buckets:

- **app_metadata** — server-controlled. Only the Supabase service or trusted backend code can write to it. Use for roles, subscription tier, internal flags, anything that affects authorization.
- **user_metadata** — user-controlled. Users can update via signup or `updateUser`. Use for display preferences, profile fields the user owns.

Critical rule: **never put authorization-affecting data in user_metadata.** The user can change it. Roles, plan tiers, admin flags all belong in app_metadata, set by your server.

## The session model

A session is the period a user is logged in. supabase-js stores the session (access token + refresh token + user info) in localStorage by default; configurable for cookies (SSR scenarios).

Session lifecycle:

1. **Sign in.** Auth returns tokens; client stores them.
2. **API requests.** Client attaches access token in Authorization header.
3. **Auto-refresh.** Before access token expires, client uses refresh token to get a new one.
4. **Sign out.** Client deletes tokens locally and calls the server to invalidate the refresh token.

The default refresh interval is shorter than the access token's lifetime — the client refreshes proactively, not on expiration. This prevents UX glitches mid-flow.

## Server-side rendering and cookies

For SSR (Next.js App Router, Remix, etc.), localStorage isn't accessible on the server. Supabase provides cookie-based session helpers:

```ts
import { createServerClient } from '@supabase/ssr';

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: cookieStore }
);

const { data: { user } } = await supabase.auth.getUser();
```

The `@supabase/ssr` package handles cookie sync between client and server, refresh-token rotation, and session validation server-side.

## Identifying the user — getUser vs getSession

`getSession()` reads the locally-stored session. Fast but doesn't verify the JWT against the server. Use for UI state (is anyone logged in?).

`getUser()` verifies the JWT against the auth server. Slower (one network call) but trusted. Use for authorization decisions on the server.

For server-side code, always use `getUser()`. For client-side rendering, `getSession()` is fine and faster.

```ts
// Server-side: verify
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/login');

// Client-side: trust local session
const { data: { session } } = await supabase.auth.getSession();
```

## Token refresh edge cases

A few quirks to know:

- **Tab inactivity.** If a tab is open for >30 days inactive, the refresh token expires; user must sign in again.
- **Concurrent refresh.** Multiple tabs sharing localStorage can race on refresh; supabase-js handles this with a lock mechanism.
- **Clock skew.** JWTs have `iat` and `exp` claims; large clock skew between client and server can cause spurious failures. Servers should tolerate ±30s.
- **Token rotation.** Each refresh issues a new refresh token; the old one is invalidated. Stolen refresh tokens self-destruct quickly.

## auth.users schema

A user row contains:

- `id` — UUID, primary key.
- `email` — email address (nullable; some providers don't return email).
- `phone` — phone number for SMS auth.
- `encrypted_password` — bcrypt hash if password auth.
- `email_confirmed_at`, `phone_confirmed_at` — timestamp when verified.
- `last_sign_in_at` — last login time.
- `app_metadata`, `user_metadata` — JSONB buckets.
- `aud`, `role` — JWT-related fields.
- `created_at`, `updated_at`.

You can `select` from `auth.users` but only via service_role (anon/authenticated roles don't have access). Common pattern: create a `public.profiles` table mirroring or extending the auth user.

## The public.profiles pattern

The standard pattern for user-facing data:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are public"
  on public.profiles for select
  using (true);

create policy "Users update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
```

Create the profile row when a user signs up — typically via a database trigger:

```sql
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

The trigger fires on every new user, automatically creating the profile.

## Email verification

By default Supabase requires email verification before login. The flow:

1. User signs up → email sent with confirmation link.
2. User clicks link → email marked confirmed.
3. User can now log in.

Configurable:

- **Disable confirmation** (development only): Auth → Email → Confirm email = off.
- **Custom email templates** for branding.
- **Custom SMTP** for production deliverability (default uses Supabase's SMTP with rate limits).

For production, set up custom SMTP via SendGrid, Postmark, Resend, or similar. The default mailer has low limits unsuitable for production volume.

## Multi-factor authentication

Supabase supports TOTP-based MFA (Google Authenticator, Authy, 1Password):

```ts
// Enroll a factor.
const { data } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
// Show data.totp.qr_code to the user.

// Verify enrollment.
await supabase.auth.mfa.challengeAndVerify({
  factorId: data.id,
  code: userEnteredCode,
});

// On next sign-in:
const { data: { session } } = await supabase.auth.signInWithPassword({ ... });
if (session.user.factors.length > 0) {
  // Request MFA.
  await supabase.auth.mfa.challengeAndVerify({
    factorId: session.user.factors[0].id,
    code: userEnteredCode,
  });
}
```

MFA tokens have a special claim that policies can require (`aal2` for second-factor auth). RLS can check this for sensitive operations.

## Mistakes to avoid

- **Putting roles in user_metadata.** The user can edit it. Authorization escalation.
- **Using getSession() for server-side authorization.** Doesn't verify JWT.
- **Not creating profile rows for new users.** Orphan auth.users without public profiles.
- **Default SMTP for production.** Rate limits will bite.
- **Long-lived JWTs.** Default 1 hour is good; longer increases stolen-token impact.

## Summary

- Supabase Auth = GoTrue + Postgres `auth` schema.
- Two tokens: short-lived access JWT + long-lived refresh token.
- app_metadata for server-controlled fields; user_metadata for user-controlled.
- getUser() verifies; getSession() trusts local. Use getUser() server-side.
- Mirror auth.users into public.profiles via trigger.
- MFA via TOTP supported.
- Custom SMTP required for production email volume.

Next: email/password, magic links, OTP flows.
