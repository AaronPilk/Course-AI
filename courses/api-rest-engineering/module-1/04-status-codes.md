---
module: 1
position: 4
title: "Status codes: the conversation with the client"
objective: "Pick the right code; consumers depend on it."
estimated_minutes: 6
---

# Status codes: the conversation with the client

## The five families

HTTP status codes are organized by leading digit:

- **1xx — Informational.** Continue, processing. Rarely visible.
- **2xx — Success.** Request succeeded.
- **3xx — Redirection.** Resource elsewhere; follow.
- **4xx — Client error.** You sent something wrong.
- **5xx — Server error.** Something on my end broke.

Knowing roughly what each code means lets consumers handle failures intelligently. Misusing them turns "I need to retry vs fix my request" into a guessing game.

## 2xx — the success codes

- **200 OK.** Generic success. Returning a body.
- **201 Created.** Resource created. Include `Location` header pointing to it.
- **202 Accepted.** Request received, not processed yet (async).
- **204 No Content.** Success, no body to return (typical for DELETE, some PATCHes).
- **206 Partial Content.** For range requests (downloading parts of a file).

For most operations: 200 (read/update with body) or 201 (create) or 204 (delete/update no body).

## 3xx — redirects

- **301 Moved Permanently.** This URL is now elsewhere; update your bookmarks.
- **302 Found.** Temporary redirect; keep using the original.
- **303 See Other.** "Result is at this URL." Used for POST-Redirect-GET pattern.
- **304 Not Modified.** Conditional GET; the resource hasn't changed since your cached copy.
- **307 Temporary Redirect.** Like 302 but preserves the HTTP method.
- **308 Permanent Redirect.** Like 301 but preserves method.

304 is heavily used in caching (browser sends If-None-Match; server responds 304 if unchanged). 301/308 for URL changes; 302/307 for temporary moves.

## 4xx — client errors

The most important to get right. The list:

- **400 Bad Request.** Malformed request (bad JSON, wrong types, missing required field). Client must fix.
- **401 Unauthorized.** Need authentication (or auth failed). "Who are you?"
- **403 Forbidden.** Authenticated but not allowed. "I know who you are; you can't do that."
- **404 Not Found.** Resource doesn't exist.
- **405 Method Not Allowed.** Wrong HTTP method for this resource (`POST /users/123` when only GET/PATCH/DELETE are valid).
- **406 Not Acceptable.** Client wants a format the server can't produce.
- **409 Conflict.** Request conflicts with current state (duplicate email, concurrent edit).
- **410 Gone.** Resource used to exist; permanently deleted.
- **411 Length Required.** Missing Content-Length.
- **413 Payload Too Large.** Request body exceeds server limit.
- **415 Unsupported Media Type.** Wrong Content-Type.
- **422 Unprocessable Entity.** Semantically wrong data (validation errors). Use when 400 isn't specific enough.
- **429 Too Many Requests.** Rate-limited. Include Retry-After header.

The 401 vs 403 distinction: 401 = "log in"; 403 = "you're logged in but can't access this."

The 400 vs 422 distinction: 400 = the request itself is malformed (parser error); 422 = the request is well-formed but semantically invalid (validation error).

## 5xx — server errors

- **500 Internal Server Error.** Generic server failure. "Something went wrong; not your fault."
- **501 Not Implemented.** This method isn't supported.
- **502 Bad Gateway.** Upstream returned an invalid response.
- **503 Service Unavailable.** Server overloaded or down; try again. Include Retry-After.
- **504 Gateway Timeout.** Upstream didn't respond in time.

For consumers: 5xx means retry with backoff. 4xx means fix the request.

## Status code semantics in practice

For a typical `POST /users` endpoint:

| Scenario | Code |
|----------|------|
| Created successfully | 201 |
| Validation error (bad email format) | 422 |
| Already exists (unique constraint) | 409 |
| Missing auth | 401 |
| Insufficient permissions | 403 |
| Server error | 500 |
| Database temporarily down | 503 |

For `GET /users/123`:

| Scenario | Code |
|----------|------|
| Found | 200 |
| Not found | 404 |
| Not authorized to view | 403 |
| Auth required | 401 |
| Server error | 500 |

## Granularity — when one code isn't enough

Sometimes 4xx + body is the right combination. The body conveys *why*:

```json
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "error": "validation_failed",
  "fields": {
    "email": "must be a valid email",
    "age": "must be at least 18"
  }
}
```

The 422 says "bad input"; the body specifies what.

For 4xx errors, returning a structured body is essential. "Bad request" without details means the client can't fix it.

## Don't use 200 for everything

A common antipattern:

```json
HTTP/1.1 200 OK
{"status": "error", "message": "something failed"}
```

200 means success. Clients written expecting standard semantics will treat this as a success and proceed wrongly. Use real codes:

```json
HTTP/1.1 422 Unprocessable Entity
{"error": "validation_failed", "field": "email"}
```

Some teams justify 200-with-error-body for "easier client code." It backfires — every client now needs custom unwrapping, breaks tooling that respects HTTP semantics, makes monitoring harder (5xx alerting is built in).

## Granular errors with RFC 7807

RFC 7807 defines "Problem Details for HTTP APIs":

```json
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json

{
  "type": "https://example.com/probs/validation",
  "title": "Validation failed",
  "status": 422,
  "detail": "Email must be valid",
  "instance": "/users/create-attempt-123"
}
```

Standardized fields; extensible. Becoming the convention for new APIs. Stripe, GitHub, and others use similar but pre-RFC formats; new APIs should consider adopting RFC 7807.

## Headers that go with statuses

- **Location.** With 201, points to the created resource. With 3xx, points to the new URL.
- **Retry-After.** With 429 or 503, when to retry (seconds or HTTP date).
- **WWW-Authenticate.** With 401, indicates how to authenticate.
- **Allow.** With 405, lists allowed methods.

Include these where appropriate; consumers use them.

## Mistakes to avoid

- **200 OK for errors.** Misleads clients; breaks tooling.
- **404 vs 403 ambiguity.** Be consistent ("404 if you can't see it" leaks less; "403 if you can't access" is cleaner).
- **Generic 500 with no detail.** Hard to debug; consumers retry forever.
- **No body on 4xx.** Consumer can't fix without re-reading docs.
- **Wrong methods returning 404 instead of 405.** "Method not allowed" is more informative.

## Summary

- 2xx = success; 3xx = redirect; 4xx = your bad; 5xx = my bad.
- 200, 201, 204 for normal success scenarios.
- 401 (auth missing/failed) vs 403 (auth fine, access denied).
- 400 (malformed) vs 422 (validation failed).
- 429 (rate limited) + Retry-After header.
- Use structured error bodies; consider RFC 7807.
- Never 200 for errors.

Module 1 complete. Next module: authentication.
