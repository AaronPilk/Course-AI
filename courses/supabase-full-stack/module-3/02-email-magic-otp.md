---
module: 3
position: 2
title: "Email/password, magic links, OTP"
objective: "Passwordless and password flows."
estimated_minutes: 7
---

# Email/password, magic links, OTP

## Three primary email flows

Supabase supports three flavors of email authentication:

- **Email + password** — traditional flow with a stored password hash.
- **Magic link** — passwordless. User enters email; gets a click-to-sign-in link.
- **OTP (one-time password)** — passwordless. User enters email; gets a 6-digit code to enter back.

Each fits different UX needs. Many apps offer two: email/password as the primary, magic link or OTP as a fallback / passwordless option.

## Email + password

The classic flow:

```ts
// Sign up.
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'long-strong-password',
  options: {
    data: { full_name: 'Jane Doe' },
    emailRedirectTo: 'https://app.example.com/auth/confirm',
  },
});

// Sign in.
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'long-strong-password',
});
```

By default, Supabase requires email confirmation. After signup, the user gets a confirmation email; clicking the link confirms their email and lets them sign in.

Password requirements are configurable in dashboard: Auth → Policies → Password Settings. Default minimum is 6 chars; production should require longer with complexity rules.

## Password reset

```ts
// Initiate reset.
await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://app.example.com/reset-password',
});

// On the reset page (user clicked email link):
await supabase.auth.updateUser({ password: 'new-strong-password' });
```

The reset email contains a token in the URL; supabase-js parses it from the URL when the page loads and authenticates the session, allowing the password update.

## Magic links

User enters email; gets a one-tap sign-in link. No password to remember or forget.

```ts
await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://app.example.com/auth/callback',
  },
});

// User clicks the link in their email; redirected back to the app with a session.
```

Magic links work for both signup (first time) and sign-in (returning user). One flow, two purposes.

Trade-offs:
- **Pros**: No passwords; reduced support load; familiar UX (similar to "sign in with email"); high security (each link is single-use, short-lived).
- **Cons**: Requires checking email each login; some email providers flag the links as suspicious; doesn't work well for shared devices.

Magic links are excellent for B2B SaaS where users sign in occasionally and value not managing passwords.

## OTP (one-time password)

Similar to magic links but the user enters a 6-digit code instead of clicking a link.

```ts
// Request OTP.
await supabase.auth.signInWithOtp({
  email: 'user@example.com',
});

// User enters the code from email.
await supabase.auth.verifyOtp({
  email: 'user@example.com',
  token: '123456',
  type: 'email',
});
```

OTP works well for:
- Mobile apps where deep-link handling is fragile.
- Situations where users sign in from a device other than where the email is received.
- Higher-security contexts requiring step-up auth.

Tradeoffs: more friction than magic links (user has to copy a code) but more universal.

## Phone / SMS

Supabase supports SMS OTP via Twilio, MessageBird, or Vonage:

```ts
await supabase.auth.signInWithOtp({
  phone: '+15551234567',
});

await supabase.auth.verifyOtp({
  phone: '+15551234567',
  token: '123456',
  type: 'sms',
});
```

Requires configuring an SMS provider in dashboard. Costs per message; use thoughtfully.

## Email rate limits and abuse

Email-based flows are vulnerable to abuse:

- **Email enumeration.** Probing for valid emails. Supabase returns the same response whether the email exists or not — protects against enumeration.
- **Email bombing.** Triggering many emails to an address. Supabase rate-limits per-IP and per-email; production should add additional CAPTCHA or rate limits via Edge Functions for sensitive flows.
- **Bounce / spam complaints.** Repeatedly sending to invalid addresses hurts sender reputation. Custom SMTP providers (SendGrid, Postmark) handle this; default provider has stricter limits.

For production: turn on CAPTCHA for signup/reset (Supabase supports hCaptcha and Turnstile), use custom SMTP, monitor bounce rates.

## Choosing between flows

- **Email + password**: traditional users, accounts with stored sessions, password managers. Good default for most apps.
- **Magic link**: B2B SaaS, infrequent users, "click to sign in" UX. Reduces support load.
- **OTP code**: mobile apps, high-security flows, fallback when magic links don't work.
- **SMS OTP**: phone-first apps, MFA second factor.

Many apps offer all three. A common pattern: email/password as primary; magic link as "forgot password" alternative; OTP as MFA second factor.

## The email confirmation gotcha

By default, new users must confirm their email before signing in. This trips up developers in two ways:

1. **In development with no SMTP configured**, confirmation emails don't send; users can't log in. Disable confirmation in dev (Auth → Email → Confirm email = off).

2. **In production**, users sometimes don't get the email (spam folder, typos, dead addresses). Build a "resend confirmation" flow:

```ts
await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com',
});
```

## Redirect URLs and security

When a user clicks a magic link or confirmation link, they're redirected to your app via `emailRedirectTo`. Supabase verifies the redirect URL against an allowlist in dashboard settings (Auth → URL Configuration).

Critical: only add domains you control to the allowlist. Open redirects are a phishing risk — attackers can craft a magic link redirecting to a malicious site to capture the user's session.

```
Site URL: https://app.example.com
Redirect URLs:
  - https://app.example.com/**
  - http://localhost:3000/**  (dev only)
```

## Identity linking

A user might sign up with email/password, then later try to sign in with Google using the same email. Supabase can link them so it's one user with multiple identities.

```ts
// While signed in:
await supabase.auth.linkIdentity({ provider: 'google' });
```

Linked identities all sign into the same `auth.users` row. The `app_metadata.providers` array lists their providers.

## Custom email templates

Default emails are functional but not branded. Customize in dashboard: Auth → Email Templates. You can override:

- Confirm signup.
- Invite user.
- Magic link.
- Change email address.
- Reset password.

Supports template variables like `{{ .Token }}`, `{{ .ConfirmationURL }}`, `{{ .Email }}`.

For production, custom branded emails dramatically improve trust and deliverability (less likely to be marked spam).

## Mistakes to avoid

- **Default SMTP in production.** Low rate limits; deliverability suffers.
- **Open redirect URLs.** Phishing vector.
- **Storing passwords client-side.** They go to Supabase; don't cache locally.
- **No CAPTCHA on signup/reset.** Bot abuse.
- **Confusing magic link and OTP.** Pick one as the primary passwordless flow.

## Summary

- Email + password is the traditional flow; default in most apps.
- Magic link = click-link-to-sign-in; great for B2B/infrequent users.
- OTP code = enter-6-digits; good for mobile and step-up auth.
- SMS OTP requires Twilio/MessageBird/Vonage; costs per message.
- Email confirmation is on by default; configure SMTP for production.
- Rate limits, CAPTCHA, custom SMTP are production essentials.
- Restrict redirect URLs to domains you control.

Next: OAuth providers and SSO.
