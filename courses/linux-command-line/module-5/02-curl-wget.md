---
module: 5
position: 2
title: "curl, wget, and HTTP in the shell"
objective: "Make and inspect HTTP requests from the command line."
estimated_minutes: 6
---

# curl, wget, and HTTP in the shell

## curl — the Swiss Army HTTP tool

```
$ curl https://example.com                          # GET; print body
$ curl -i https://example.com                       # include response headers
$ curl -I https://example.com                       # HEAD only (headers only)
$ curl -v https://example.com                       # verbose: full request + response
$ curl -o page.html https://example.com             # save to file
$ curl -O https://example.com/file.tar.gz           # save with server-provided name
$ curl -L https://example.com                       # follow redirects
```

`-i` for headers in output; `-v` for full diagnostic; `-L` because so many URLs redirect.

## HTTP methods

```
$ curl -X POST -d "name=Aaron&age=37" https://api.example.com/users
$ curl -X PUT -d "..." https://api.example.com/users/1
$ curl -X DELETE https://api.example.com/users/1
```

`-X` sets the method. `-d` is the body (default content type: application/x-www-form-urlencoded).

For JSON:

```
$ curl -X POST \
       -H "Content-Type: application/json" \
       -d '{"name":"Aaron","age":37}' \
       https://api.example.com/users
```

`-H` sets headers; can be repeated.

## Auth

Basic auth:

```
$ curl -u user:password https://api.example.com
```

Bearer token:

```
$ curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com
```

Cookies:

```
$ curl -c cookies.txt -b cookies.txt https://example.com
```

`-c` saves cookies to file; `-b` loads them. Useful for session-based APIs.

## File uploads

```
$ curl -F "file=@local.txt" https://api.example.com/upload
$ curl -F "field=value" -F "file=@local.png" https://api.example.com/upload
```

`-F` sends multipart/form-data; `@filename` reads a file as that field's value.

## Saving responses for inspection

```
$ curl -i https://api.example.com/data -o response.txt
$ curl https://api.example.com/data | jq .
$ curl -s https://api.example.com/data | jq '.users[].name'
```

`-s` silences the progress bar — combine with pipes for clean output.

## wget vs curl

`wget` is simpler for "download this URL":

```
$ wget https://example.com/file.tar.gz
$ wget -c https://example.com/big.iso          # continue partial download
$ wget -r https://example.com                  # recursive (mirror site)
```

`curl` is for HTTP-tool tasks: APIs, headers, methods, auth. `wget` is for downloads.

In practice: most engineers use `curl` for everything, but `wget` is friendlier for mass downloads and supports recursive mirroring out of the box.

## httpie — friendlier curl

```
$ pip install httpie
$ http GET https://api.example.com/users
$ http POST https://api.example.com/users name=Aaron age:=37
```

Sane defaults: JSON content type, pretty output, colored. Shortcuts like `name=Aaron` for string fields, `age:=37` for integer (no JSON quoting needed).

If you do a lot of API testing, httpie is a quality-of-life upgrade.

## Inspecting requests with -v

```
$ curl -v https://api.example.com/users

* Trying 93.184.216.34:443...
* Connected to api.example.com (93.184.216.34) port 443
* TLS connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
> GET /users HTTP/2
> Host: api.example.com
> user-agent: curl/8.0.1
> accept: */*
>
< HTTP/2 200
< content-type: application/json
< content-length: 1234
<
[response body]
```

`-v` shows the full request and response. The most useful tool when an API isn't returning what you expect — you see exactly what you sent and what you got.

## Timing

```
$ curl -o /dev/null -s -w "%{http_code} %{time_total}\n" https://example.com
200 0.142
```

`-w` formats a custom output. Other variables: `%{time_namelookup}`, `%{time_connect}`, `%{time_appconnect}`, `%{time_pretransfer}`, `%{time_starttransfer}`, `%{size_download}`, `%{speed_download}`.

For load testing:

```
$ for i in {1..10}; do
    curl -o /dev/null -s -w "%{time_total}\n" https://example.com
  done
```

## TLS / SSL inspection

```
$ curl --cert-status -v https://example.com    # OCSP stapling check
$ curl --tlsv1.3 https://example.com           # specific TLS version
$ curl -k https://self-signed.example.com      # ignore cert errors (DANGEROUS)
```

`-k` disables TLS verification — useful for testing self-signed certs locally, dangerous in production.

For certificate details, openssl is the right tool:

```
$ echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | openssl x509 -text -noout
```

Shows the cert: subject, issuer, validity dates, SANs, etc.

## Inspecting JSON responses

```
$ curl -s https://api.github.com/users/torvalds | jq .
$ curl -s https://api.github.com/users/torvalds | jq '.public_repos'
$ curl -s https://api.github.com/users/torvalds/repos | jq -r '.[].full_name'
```

jq is the indispensable partner to curl for JSON APIs.

## Retries and timeouts

For unreliable networks:

```
$ curl --max-time 30 --retry 3 --retry-delay 5 https://example.com
```

`--max-time` caps total time; `--retry N` retries N times; `--retry-delay S` waits between retries. `--retry-all-errors` retries on any failure, not just network ones.

For scripts hitting potentially-flaky APIs, these are essential.

## Common idioms

**Save cookies for later:**

```
$ curl -c jar.txt -d "user=x&pass=y" https://example.com/login
$ curl -b jar.txt https://example.com/dashboard
```

**Test from a specific IP / interface:**

```
$ curl --interface eth1 https://example.com
$ curl --resolve example.com:443:1.2.3.4 https://example.com  # override DNS
```

**Stream large response:**

```
$ curl -s https://big.example.com/stream | while read -r line; do
    process "$line"
done
```

## Mistakes to avoid

- **No -L on redirects.** Many URLs redirect; without -L you see a 301 instead of content.
- **No -s in scripts.** Progress bars contaminate stdout.
- **No timeout.** Hung connections wedge your script.
- **`-k` in production.** Disables TLS — defeats the purpose.
- **Sending passwords in URL.** They show up in logs and history.

## Summary

- `curl` for HTTP requests of any shape; `wget` for downloads.
- `-i` headers; `-v` full diagnostic; `-L` follow redirects; `-s` silent.
- Methods via `-X`; headers via `-H`; body via `-d`.
- `-u` for basic auth; `-H "Authorization: Bearer ..."` for tokens.
- `httpie` for nicer ergonomics in API testing.
- Pair with `jq` for JSON; use `-w` for timing diagnostics.
- Add `--max-time` and `--retry` for production scripts.

Next: package managers across distros.
