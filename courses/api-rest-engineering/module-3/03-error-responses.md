---
module: 3
position: 3
title: "Error responses worth debugging"
objective: "Make failures actionable, not mysterious."
estimated_minutes: 5
---

# Error responses worth debugging

## Why error responses matter so much

When an API call fails, the response is the only debugging artifact the consumer has. Bad error response = consumer's day blocked, support ticket, churn. Good error response = consumer fixes it themselves in 30 seconds.

The same API code paths run for both. The error response format is a 10-line decision that compounds across millions of consumer hours.

## The shape

A good error response includes:

1. **HTTP status code.** Correct 4xx or 5xx.
2. **Stable error code.** Machine-readable identifier.
3. **Human-readable message.** What went wrong.
4. **Field-level details.** Which fields failed and why.
5. **Request ID.** For correlating with server logs.
6. **Links to docs.** Optional but kind.

Example:

```json
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json
X-Request-Id: req_abc123

{
  "error": {
    "code": "validation_failed",
    "message": "The request failed validation.",
    "fields": {
      "email": "must be a valid email address",
      "age": "must be at least 18"
    },
    "request_id": "req_abc123",
    "doc_url": "https://docs.example.com/errors/validation_failed"
  }
}
```

Everything a consumer needs to fix the problem is in this response.

## Stable error codes

The code (`"validation_failed"`) is the consumer's switch statement input:

```js
if (err.code === 'rate_limited') retry_with_backoff();
else if (err.code === 'validation_failed') show_user_form_errors();
```

Properties:
- **Stable.** Don't change once shipped. Consumers depend on them.
- **Snake_case strings.** Not enum numbers (which break on reorder).
- **Hierarchical possible.** `auth.invalid_token`, `auth.expired_token`.
- **Documented.** Every code in the API docs.

Bad: error messages change between API versions, consumers grep for English text, breaks.

## RFC 7807 — problem details

The IETF standard:

```json
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json

{
  "type": "https://example.com/probs/validation",
  "title": "Validation failed",
  "status": 422,
  "detail": "Email must be a valid email address.",
  "instance": "/users/create-attempt-123",
  "fields": {
    "email": "invalid format"
  }
}
```

Fields:
- `type` — URI identifying the problem class.
- `title` — short human-readable summary.
- `status` — HTTP status (also in the status line).
- `detail` — explanation specific to this occurrence.
- `instance` — URI identifying this specific occurrence.

Extensible — add your own fields. Growing convention; some APIs use it, many use custom formats. Either works; consistency matters.

## Per-field errors for forms

Validation errors typically have multiple fields. Structure them so clients can highlight each:

```json
{
  "error": {
    "code": "validation_failed",
    "fields": {
      "email": "must be a valid email",
      "password": "must be at least 8 characters",
      "agreed_to_terms": "must be accepted"
    }
  }
}
```

Vs flat:

```json
{
  "error": {
    "code": "validation_failed",
    "errors": [
      {"field": "email", "message": "must be a valid email"},
      {"field": "password", "message": "must be at least 8 characters"}
    ]
  }
}
```

Array form is more flexible (multiple errors per field, error codes per error). Pick the shape your clients need.

## Request IDs

Every request gets a unique ID, included in response and logs:

```
HTTP/1.1 500 Internal Server Error
X-Request-Id: req_abc123def456
```

Now when a consumer reports "I got an error," they include the request_id. You grep logs by it; see exactly what happened. Without this, support is mostly guessing.

Generate at the API gateway / load balancer level so the ID is consistent across logs from every internal service that touched the request.

## What NOT to include

- **Internal stack traces.** Leaks code paths, file names, versions. Helpful for attackers.
- **Database error messages verbatim.** "duplicate key value violates unique constraint 'users_email_key'" → translate to "email already in use."
- **PII.** Don't echo back sensitive data in errors.
- **Long debug payloads.** Save those for logs; keep API responses lean.

Sanitize messages. Internal logs get full detail; external responses get user-appropriate detail.

## Error envelope vs flat

```json
// Envelope
{"error": {"code": "...", "message": "..."}}

// Flat
{"code": "...", "message": "..."}
```

Envelope makes errors easy to distinguish from success responses ("if `error` key exists, it failed"). Flat is simpler but mixes success/error shapes in client code.

Most modern APIs envelope. Whatever you pick, be consistent.

## Differentiating client errors from server errors

```
4xx — your bad, fix the request
5xx — my bad, try again later
```

Consumers should treat them differently:
- 4xx: don't retry; fix the request.
- 5xx: retry with backoff; may succeed.

If your "service unavailable" is a 500 vs 503, consumers handle it differently. Use the right family.

## Throttling responses

For 429:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1716200000

{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests. Try again in 60 seconds."
  }
}
```

`Retry-After` is standard HTTP. Custom rate limit headers (`X-RateLimit-*`) help consumers understand their budget.

## Localization

For consumer-facing APIs, error messages might need translation:

```
Accept-Language: fr

{"error": {"code": "validation_failed", "message": "La validation a échoué."}}
```

Stable error codes let clients translate too: `code: "validation_failed"` → French label client-side. Either approach works; pick based on whether your API has many languages.

## Mistakes to avoid

- **200 OK with error body.** Discussed before; breaks everything.
- **Stack traces in production responses.** Security risk + ugly UX.
- **Different error shapes per endpoint.** Consumers can't generalize.
- **Mutable error codes.** Breaking consumers between API versions.
- **No request ID.** Support is guessing.

## Summary

- HTTP status + stable code + human message + field details + request ID.
- Stable error codes (snake_case, documented, never change).
- Consider RFC 7807 for new APIs.
- Sanitize: no stack traces, no DB errors verbatim, no PII.
- Request ID on every response; consumers report; you grep.
- 4xx for client errors (don't retry); 5xx for server (retry).

Next: idempotency and retries.
