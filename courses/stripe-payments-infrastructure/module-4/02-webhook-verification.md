---
module: 4
position: 2
title: "Verification and security — the signature header that prevents disasters"
objective: "Verify webhook signatures so attackers can't forge events."
estimated_minutes: 7
---

# Verification and security — the signature header that prevents disasters

## The puzzle

Your webhook URL is public. Anyone on the internet can POST to it. Without verification, an attacker could craft a fake `payment_intent.succeeded` and your code would fulfill orders that were never paid.

The fix is a one-line check using Stripe's signature header. Every webhook handler needs it.

## The simple version

Stripe signs every webhook with HMAC. Verify the signature before trusting the event:

```js
const event = stripe.webhooks.constructEvent(
  rawBody,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

If signature is invalid, `constructEvent` throws. Reject. Don't process. Done.

## The technical version

### How signature verification works

When Stripe sends a webhook, it includes a `Stripe-Signature` header:

```
Stripe-Signature: t=1719859200,v1=abc123def456...
```

The signature is an HMAC-SHA256 of the timestamp + raw body, signed with your webhook secret. Stripe knows the secret; you know the secret; nobody else does. So:

- Your code recomputes the HMAC using the raw body and the secret.
- Compares to what Stripe sent.
- If match: legitimate Stripe event.
- If mismatch: forged or corrupted.

`stripe.webhooks.constructEvent` does all of this for you.

### Raw body matters

A common bug: parsing JSON before verification.

```js
// WRONG
const body = await req.json();  // parses, alters whitespace
stripe.webhooks.constructEvent(body, signature, secret);  // fails — body modified

// RIGHT
const body = await req.text();  // raw string
stripe.webhooks.constructEvent(body, signature, secret);  // passes
```

The signature is over the raw bytes. Any reformatting (parsing + restringifying) changes the bytes and breaks verification.

In Express: `app.use("/webhook", express.raw({ type: "application/json" }), handler);`
In Next.js App Router: use `request.text()`.
In other frameworks: ensure the raw body is preserved on the webhook route only.

### Replay protection

The signature includes a timestamp. By default, `constructEvent` rejects events older than 5 minutes. Prevents replay attacks where someone captures a real webhook and resends it later.

You can configure the tolerance:

```js
stripe.webhooks.constructEvent(body, signature, secret, 300)  // 300 seconds
```

Default 5 minutes is usually right. Tighten for high-security; relax only if clock skew between your servers and Stripe is significant.

### Signing secret management

Treat the signing secret like any other secret:

- Store in env vars (`STRIPE_WEBHOOK_SECRET=whsec_...`).
- Never commit to git.
- Rotate periodically.

If a secret is compromised, rotate it via Stripe Dashboard → Webhooks → roll signing secret. Update your env var. Brief overlap to handle in-flight events: dashboard supports both old and new during rotation.

### Multiple endpoints, multiple secrets

If you have multiple webhook endpoints (prod / staging / localhost), each has its own secret. Don't share. Don't reuse.

The Stripe CLI gives you a local-only secret for `stripe listen` testing.

### Constant-time comparison

Stripe's SDK uses constant-time comparison internally. If you ever roll your own verification (don't), use a constant-time comparison library to prevent timing attacks. Most failures are bugs, not attacks, but it's the right pattern.

### What NOT to do

- **Skip verification "for speed"**: the verification is microseconds; the risk is unbounded.
- **Verify only some routes**: every webhook URL needs verification.
- **Trust IP allowlisting alone**: Stripe publishes IP ranges but they change; signature is the durable answer.
- **Log signing secrets**: even briefly.

### What forgery looks like

If an attacker tries to forge a webhook:

```
POST /api/stripe/webhook
Content-Type: application/json
Stripe-Signature: t=1719859200,v1=...made up...

{"type": "payment_intent.succeeded", "data": {...}}
```

Without verification: your code fulfills a fake order. With verification: `constructEvent` throws because the signature doesn't match. Handler returns 400. Nothing bad happens.

This isn't theoretical. Stripe webhook URLs end up in public places (architecture docs, error logs, security tools). Discovery is easy. Verification is the defense.

### Logging considerations

Don't log:

- Signing secrets.
- Full webhook bodies that contain PII (card details, full names + emails together).
- Stripe API keys.

Do log:

- Event IDs (for debugging).
- Event types.
- Handler outcomes (success / error).

For sensitive content, hash or mask before logging.

### Testing verification locally

Stripe CLI helps:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI provides a local signing secret. Use it in `STRIPE_WEBHOOK_SECRET` for development. Real production signing secret comes from your hosting platform's env vars.

### Edge cases

- **Large bodies**: very large events (rare). Make sure raw body parsing has high enough size limits.
- **Slow body reads**: ensure you read the entire body before verification.
- **Framework middleware modifying body**: some middleware silently re-parses; debug by logging the raw bytes if verification fails unexpectedly.

### Other security layers

Verification is the foundation. Other layers:

- **HTTPS only**: never accept webhooks over HTTP.
- **Endpoint isolation**: webhook URL doesn't expose internal info.
- **Rate limiting**: prevent flooding even from "legitimate" sources.
- **Monitoring**: alert on verification failures (might indicate attack).

Verification + HTTPS + rate limits = the practical baseline.

## Three real-world scenarios

**Scenario 1: The signature catch.**
A team got an alert for failed webhook signatures. Investigation: an attacker had found their webhook URL in public docs and was attempting to forge `payment_intent.succeeded` events to fulfill orders. Verification rejected all attempts. No damage.

**Scenario 2: The body-parsing bug.**
A new framework upgrade silently changed body parsing — JSON was parsed before reaching the webhook handler. Verification started failing. Took a day to diagnose. The fix was preserving raw body on the webhook route. Lesson: when verification breaks unexpectedly, the body has probably been touched.

**Scenario 3: The leaked secret rotation.**
A team's signing secret leaked in a debug log shared in Slack. Rotated via dashboard; updated env vars in 5 minutes; verified production with `stripe listen`. Brief overlap during rotation handled in-flight events. Clean incident response because the rotation flow was documented.

## Common mistakes to avoid

- **No verification** — webhook URL is a backdoor.
- **JSON parsing before verification** — bytes change; signature mismatch.
- **Signing secret in code** — committed to git; leaked.
- **Same secret across environments** — staging compromise leaks prod.
- **Logging webhook bodies with PII** — privacy / compliance issues.
- **No alerts on verification failures** — attacks go unnoticed.

## Read more

- [Webhook signature verification](https://docs.stripe.com/webhooks/signatures)
- [Rotating signing secrets](https://docs.stripe.com/webhooks/configure#rotate-webhook-signing-secrets)
- [Webhook best practices](https://docs.stripe.com/webhooks/best-practices)

## Summary

- **Stripe signs every webhook**; verify before trusting.
- **`stripe.webhooks.constructEvent`** does signature verification for you.
- **Raw body required** — don't parse JSON before verification.
- **Default 5-minute replay tolerance**; configurable.
- **One signing secret per endpoint**; rotate periodically.
- **Alert on verification failures** — might indicate attack.
- Verification + HTTPS + rate limits = the practical baseline.

Next: idempotency, retries, and event ordering.
