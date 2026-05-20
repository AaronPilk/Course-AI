---
module: 2
position: 1
title: "Injection: SQL, command, template"
objective: "The vulnerability class that built modern security awareness."
estimated_minutes: 7
---

# Injection: SQL, command, template

## The pattern

Injection happens when an app builds a structured string (SQL query, shell command, HTML template, file path) by concatenating user input — without proper escaping. Attackers inject characters that change the structure's meaning.

The class is decades old and #3 on the 2021 OWASP Top 10 (down from #1 in years past — because the fix is well-known, but injection still appears in new code constantly).

## SQL injection — the classic

```python
# ❌ Vulnerable
username = request.form['username']
password = request.form['password']
query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
cursor.execute(query)
```

If the user enters username `admin' --` and any password:

```sql
SELECT * FROM users WHERE username='admin' --' AND password='whatever'
```

The `--` comments out the rest of the query. Logged in as admin.

Other classic payloads:

- `' OR 1=1 --` → matches all rows.
- `'; DROP TABLE users; --` → executes a second query (if the driver allows stacked statements).
- `' UNION SELECT credit_card FROM payments --` → exfiltrate other tables.

## The fix: parameterized queries

```python
# ✅ Safe
query = "SELECT * FROM users WHERE username = %s AND password = %s"
cursor.execute(query, (username, password))
```

The database driver knows `%s` are *values*, not part of the query structure. No amount of escaping or injecting in the input changes the query's structure. The attacker's input is treated as a string literal, full stop.

Every modern database driver supports parameterized queries. Use them universally.

ORMs (SQLAlchemy, Django ORM, Drizzle, Prisma) abstract this — `User.objects.filter(username=user_input)` is automatically parameterized.

## Why "just escape the input" doesn't work

Tempting to write:

```python
username = username.replace("'", "''")
query = f"SELECT * FROM users WHERE username='{username}'"
```

Problems:
- Database-specific quoting rules — what's safe in MySQL isn't in Postgres.
- Multi-byte encodings can defeat naive escapes.
- Comments, control characters, edge cases.
- Maintenance — every developer must remember to escape.

Parameterized queries solve this once. Manual escaping introduces bugs forever.

## Command injection

Same pattern, different target:

```python
# ❌ Vulnerable
filename = request.form['filename']
os.system(f"cat /var/log/{filename}")
```

Input `secret.log; rm -rf /` → `cat /var/log/secret.log; rm -rf /`. The shell happily runs both commands.

The fix:

```python
# ✅ Safe — pass arguments as a list
import subprocess
subprocess.run(['cat', f'/var/log/{filename}'], check=True)
```

Better: validate filename against an allowlist. Even better: don't shell out — use library functions when possible (`open()` instead of `cat`).

## Path traversal

A subset of injection — user input becomes part of a file path:

```python
# ❌ Vulnerable
file = request.args.get('file')
content = open(f'/var/data/{file}').read()
```

Input `../../etc/passwd` → reads `/etc/passwd`.

Fixes:

```python
import os
safe_path = os.path.realpath(os.path.join('/var/data', file))
if not safe_path.startswith('/var/data/'):
    abort(400)
content = open(safe_path).read()
```

Resolve the path, verify it's still under the allowed root. Or use an opaque token → look up the real path server-side.

## Template injection

Modern frameworks have templates (Jinja2, ERB, Handlebars, etc.). Sometimes user input ends up *as the template itself*:

```python
# ❌ Vulnerable
template = f"Hello, {request.args['name']}"
return render_template_string(template)
```

User input `{{ 7*7 }}` evaluates → "Hello, 49". Worse: `{{ ''.__class__.__mro__[1].__subclasses__() }}` in Jinja2 can break out and execute arbitrary Python.

Server-Side Template Injection (SSTI) is a serious-but-rarer vulnerability. Fix: never pass user input AS a template; only pass it as DATA into a fixed template.

## NoSQL injection

MongoDB, etc. have their own variants:

```js
// ❌ Vulnerable
db.users.find({ username: req.body.username, password: req.body.password })
```

If `req.body.username` is `{ $ne: null }`, the query becomes "find a user where username is not null" — bypassed.

Fix: enforce types. Use schema validation; reject non-string inputs.

## LDAP, XPath, GraphQL injection

The pattern repeats for any query language. LDAP filter syntax, XPath expressions, GraphQL queries — same vulnerability class.

The defense is always the same: separate the *structure* from the *data*. Parameterize where the language supports it; validate / sanitize where it doesn't.

## SQL injection in practice — finding it

Code review for injection:

- Search for string concatenation building queries: `f"SELECT ... {var}"`, `"SELECT ... " + var`.
- Look for ORM "raw SQL escape hatches" with user input.
- Check old code — modern frameworks make injection harder, but legacy code lingers.

Tools:
- **sqlmap** — automates SQLi exploitation against vulnerable apps (use on authorized targets only).
- **Static analysis** — Semgrep, CodeQL, Snyk catch concatenated queries.
- **Web application firewalls** (WAF) — catch some injection at the perimeter. Not a substitute for fixes.

## Mass-assignment — related

```python
# ❌ Vulnerable
user.update(**request.json)
```

If request.json includes `{"is_admin": true}`, the user just promoted themselves. Defense: explicit allowlist of updatable fields.

```python
ALLOWED_FIELDS = {'name', 'email', 'avatar_url'}
update_data = {k: v for k, v in request.json.items() if k in ALLOWED_FIELDS}
user.update(**update_data)
```

This isn't strict injection but follows the same principle: trust no user input; explicit allow > implicit accept.

## Defense in depth

For database-touching apps:

1. **Parameterize all queries.** Mandatory.
2. **Least-privilege database accounts.** App connects with a user that can SELECT/INSERT/UPDATE but not DROP/CREATE/GRANT.
3. **Input validation.** Don't accept random JSON; type-check every field.
4. **Output encoding.** Even if injection slips through, escape before display.
5. **Logging.** Detect anomalous query patterns.
6. **Code review + static analysis.** Catch new injection before merge.

## Mistakes to avoid

- **"Stored procedures fix everything."** They don't if the proc itself concatenates input.
- **"My ORM is safe."** Mostly true; not for raw query escape hatches.
- **"Input validation at the form is enough."** Doesn't protect when the same data is used elsewhere.
- **"WAF will catch it."** WAFs miss novel payloads; defense in depth.

## Summary

- Injection = mixing user input into a query/command/template without proper separation.
- Fix: parameterized queries, argument-list subprocess calls, never input-as-template.
- ORMs handle SQL injection automatically; raw SQL escape hatches reintroduce risk.
- Path traversal, NoSQL injection, template injection are variants of the same pattern.
- Defense in depth: least privilege, input validation, output encoding, detection.

Next: XSS and the browser security model.
