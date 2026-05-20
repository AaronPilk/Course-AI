---
module: 2
position: 2
title: "XSS, CSRF, and the browser security model"
objective: "The vulnerabilities specific to the browser-server contract."
estimated_minutes: 7
---

# XSS, CSRF, and the browser security model

## The browser is a strange execution environment

A browser loads code from many origins and runs them all in tabs. The Same-Origin Policy (SOP) keeps them isolated — a page from `evil.com` can't read your `bank.com` tab. But the model has gaps, and XSS and CSRF are the two classic ways to exploit them.

## Cross-Site Scripting (XSS)

XSS = injecting JavaScript that runs in someone else's browser session on your site.

**Reflected XSS.** User-controlled input in the URL gets reflected in the response.

```html
<!-- vulnerable -->
<p>Search results for: <%= request.query.q %></p>
```

URL: `/search?q=<script>alert(1)</script>` → script runs.

**Stored XSS.** Input is saved server-side then served to other users.

```html
<!-- comment displayed without escaping -->
<div class="comment"><%= comment.body %></div>
```

Attacker submits a comment containing `<script>stealCookie()</script>`. Every viewer runs it.

**DOM-based XSS.** Client-side JS uses untrusted data unsafely.

```js
document.getElementById('greeting').innerHTML = location.hash.substring(1);
```

URL: `#<img src=x onerror=alert(1)>` → script runs without ever hitting the server.

## What XSS lets attackers do

- **Steal cookies.** `document.cookie` → exfiltrate to attacker server. If cookies have `HttpOnly`, this is blocked.
- **Make authenticated requests.** As the victim user.
- **Capture keystrokes.** Read form inputs.
- **Phish.** Display fake login on real domain (HTTPS lock + real URL).
- **Defacement.** Modify the page content.

Once an attacker controls JS on your page, they have full power within the browser security model. XSS is high-severity.

## Defending against XSS

**1. Context-aware output encoding.** When inserting user data into HTML, encode it:

```html
<!-- Encode for HTML context -->
<p>Hello, {{ escape(user.name) }}</p>

<!-- Different encoding for attribute context -->
<input value="{{ attr_escape(user.name) }}" />

<!-- Different again for JS context -->
<script>const u = {{ js_escape(user.name) }};</script>

<!-- And URL context -->
<a href="/profile?u={{ url_escape(user.name) }}">
```

Every modern framework (React, Vue, Angular, Rails, Django) auto-encodes by default for the appropriate context. Don't use `innerHTML`, `dangerouslySetInnerHTML`, `bypassSecurityTrustHtml` unless you understand what you're doing.

**2. Content Security Policy (CSP).** A response header that restricts what the page can do:

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com; style-src 'self' 'unsafe-inline'
```

Tells the browser: only load scripts from these origins. Even if an attacker injects `<script src=//evil.com>`, the browser refuses.

CSP doesn't fix XSS but limits its impact when it slips through. Defense in depth.

**3. HttpOnly cookies.** Cookies with this flag aren't readable from JavaScript. XSS can't steal them.

**4. Sanitize HTML when you must accept it.** For rich text fields, use a library like DOMPurify:

```js
const clean = DOMPurify.sanitize(userInput);
element.innerHTML = clean;
```

Allowlist of safe HTML tags; everything else stripped.

## Cross-Site Request Forgery (CSRF)

CSRF tricks a logged-in user's browser into making requests they didn't intend.

```html
<!-- on attacker's site -->
<img src="https://bank.com/transfer?to=attacker&amount=1000">
```

If the victim has an active bank.com session, their browser sends cookies along with this request. The bank sees a properly-authenticated transfer — but the user never clicked anything except a forum link.

## Defending against CSRF

**1. SameSite cookies.** Modern default (browsers since ~2020): cookies aren't sent with cross-origin requests.

```
Set-Cookie: session=abc; SameSite=Lax; Secure; HttpOnly
```

`SameSite=Lax` (default) blocks cross-origin POSTs but allows top-level navigation (typing the URL). `SameSite=Strict` blocks even navigation. Either prevents CSRF.

SameSite alone catches most CSRF in 2026. Browsers default to Lax if not specified.

**2. CSRF tokens.** A random value in the form that must match a server-side stored value:

```html
<form action="/transfer" method="post">
  <input type="hidden" name="csrf_token" value="random_uuid_per_session" />
  ...
</form>
```

The token isn't sent on cross-origin requests (the attacker doesn't know it). Frameworks (Django, Rails) include this automatically.

**3. Re-authentication for sensitive actions.** Money transfers, password changes, account deletion require re-entering password.

## CORS — the related but different mechanism

Same-Origin Policy blocks `bank.com` JS from reading `evil.com` responses. Cross-Origin Resource Sharing (CORS) is the *opt-in* to allow specific cross-origin access:

```
Access-Control-Allow-Origin: https://trusted-partner.com
```

CORS allows reading; CSRF is about making writes. Different problems, different protections. Some developers configure `Access-Control-Allow-Origin: *` and think it solves CSRF — it doesn't.

## Clickjacking

Embed your site in an invisible iframe; trick user into clicking what they think is a benign button. The click actually hits your sensitive UI.

Defense:

```
X-Frame-Options: DENY
# or
Content-Security-Policy: frame-ancestors 'none'
```

Tells the browser: don't render this page inside a frame. Modern frameworks set this by default for authenticated pages.

## CSP Level 2/3

Modern CSP supports nonces and hashes — safer than blanket `unsafe-inline`:

```
Content-Security-Policy: script-src 'nonce-abc123' 'strict-dynamic'
```

```html
<script nonce="abc123">/* inline script with matching nonce runs */</script>
<script>/* without nonce: blocked */</script>
```

Modern best-practice CSP. Hard to retrofit; easier to design in from the start.

## Subresource Integrity (SRI)

For CDN-loaded scripts, verify they haven't been tampered with:

```html
<script src="https://cdn.example.com/lib.js" 
        integrity="sha384-..."></script>
```

If the CDN serves a modified file, the browser rejects it. Defense against supply-chain attacks at the script level.

## Common mistakes

- **Trusting framework auto-escaping universally.** Most frameworks have escape hatches (`dangerouslySetInnerHTML`, `mark_safe`); they reintroduce XSS.
- **Long-lived JWTs in localStorage.** XSS = JWT compromise. HttpOnly cookies safer.
- **Same-origin cookies without SameSite.** Old defaults; explicit is safer.
- **CSP allowing `unsafe-inline`.** Defeats the purpose. Use nonces.
- **No CSP at all.** Easy to add; meaningful protection.

## Summary

- XSS: injecting JS into someone's session. Reflected, stored, DOM-based.
- Defenses: framework auto-escaping, CSP, HttpOnly cookies, sanitize when accepting HTML.
- CSRF: tricking the browser to make authenticated requests. Defenses: SameSite cookies + CSRF tokens.
- Clickjacking: frame the site invisibly. Defense: X-Frame-Options / frame-ancestors.
- SRI: verify CDN scripts haven't been tampered with.

Next: authentication and session management.
