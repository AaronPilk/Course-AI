---
module: 4
position: 3
title: "TLS: how HTTPS actually works"
objective: "Understand what happens when you type https://."
estimated_minutes: 7
---

# TLS: how HTTPS actually works

## What TLS provides

TLS (Transport Layer Security, the modern name for SSL) gives a connection:

- **Confidentiality.** Eavesdroppers can't read the data.
- **Integrity.** Tampering is detected.
- **Authentication of the server.** You're talking to the real bank.com, not an impostor.
- **Optional authentication of the client.** Mutual TLS for high-trust contexts.

HTTPS = HTTP over TLS. Same goes for SMTPS (mail), FTPS (file transfer), etc.

## The handshake — TLS 1.3 (modern)

When you connect to `https://example.com`:

1. **ClientHello.** Client sends supported cipher suites, protocols, and a random value.
2. **ServerHello.** Server picks cipher suite, sends its certificate, sends its key share (for ECDH key exchange).
3. **Key derivation.** Client + server independently derive the same shared secret from the key exchange.
4. **Finished.** Both sides confirm the handshake and switch to encrypted communication.
5. **Application data.** HTTP requests/responses now encrypted with AES-GCM (typically) using keys derived from the shared secret.

TLS 1.3 does this in one round trip (vs two for TLS 1.2). Modern, faster, simpler, more secure. Use it.

## Certificates

A certificate proves the server is who it claims:

```
Subject: example.com
Issuer: Let's Encrypt Authority X3
Valid: 2026-01-15 to 2026-04-15
Public Key: ...
Signature: <signed by Let's Encrypt>
```

The certificate contains the server's public key, signed by a Certificate Authority (CA). The browser trusts certain CAs (the "trust store" shipping with the OS / browser); transitively trusts certificates they sign.

Your browser has ~150 trusted root CAs. Each CA can issue certs for any domain (with restrictions). It's a centralized system with known weaknesses, but it works.

## Certificate Authorities

Public CAs:
- **Let's Encrypt.** Free, automated, dominant for general web.
- **DigiCert, Sectigo, GlobalSign.** Commercial. Used for EV certificates, code signing.
- **Cloud-provider CAs.** AWS Certificate Manager, GCP Managed Certs.

To get a certificate:
1. Generate a key pair.
2. Create a Certificate Signing Request (CSR) with your public key + domain.
3. Prove you control the domain (DNS validation, HTTP validation, email validation).
4. CA issues the cert.

Let's Encrypt automates this entirely via ACME protocol; certbot or your web server does the dance.

## Certificate transparency

After Symantec's CA issued bad certs in 2017-ish, browsers required certificate transparency (CT). Every issued cert must be published to public append-only logs. Now:

- Domain owners can monitor for misissued certs.
- Attackers can't quietly get a cert for your domain without showing up in CT logs.

Tools: `crt.sh`. Companies set alerts on their own domains via Censys or Cert Spotter.

## What if a cert is bad

- **Self-signed.** Browser warning; user has to click through. Good for internal/dev; not for production.
- **Expired.** Same warning.
- **Wrong domain.** Same.
- **Untrusted CA.** Same.
- **Revoked.** CRL / OCSP — browser checks, blocks if revoked.

Production HTTPS: always trusted, valid, matching cert. Renew before expiry. Automate via certbot / Caddy / cloud CA.

## TLS misconfigurations

Common issues:

- **Weak ciphers.** Old TLS configs allow RC4, 3DES, CBC modes without authentication. Tools like SSL Labs (ssllabs.com/ssltest) grade your config.
- **Old protocols.** TLS 1.0/1.1 deprecated; disable. TLS 1.2 minimum; 1.3 preferred.
- **Missing HSTS.** Without HTTP Strict Transport Security, first visit can be MITM'd.
- **Mixed content.** HTTPS page loading HTTP resources — browser warnings.

Run `nmap --script ssl-enum-ciphers -p 443 example.com` or SSL Labs to check. Aim for A+ rating.

## HSTS

Header that tells browsers: "always use HTTPS for this domain":

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

- `max-age` — how long the directive lasts.
- `includeSubDomains` — applies to subdomains too.
- `preload` — submit to browser preload lists so even first-time visitors are HTTPS-only.

After HSTS, a typo or attacker pointing the user at HTTP gets immediate redirect; never plain HTTP risk.

## Cipher suites — what's good in 2026

For TLS 1.3, cipher suites are:

- TLS_AES_256_GCM_SHA384
- TLS_CHACHA20_POLY1305_SHA256
- TLS_AES_128_GCM_SHA256

All three are strong. ChaCha20 is faster on devices without AES hardware (mobile).

For TLS 1.2 (fallback):

- ECDHE-* with AES-GCM or ChaCha20.
- Avoid CBC, RC4, 3DES, anything with SHA-1.

Modern web servers (nginx, Caddy, Apache) have sane defaults. Don't customize without strong reason.

## Mutual TLS (mTLS)

Both client and server present certificates. Used in:

- Service-to-service auth in microservices.
- API gateway auth.
- VPN client auth.

For your app's internal services: mTLS between services via a service mesh (Istio, Linkerd) is the modern best practice. Each service has an identity; no shared secrets.

## TLS termination

Often offloaded:

- **Load balancer terminates TLS.** Decrypts; passes plain HTTP to backends.
- **Service mesh proxies handle TLS.** App speaks plain HTTP; sidecar handles TLS.

Trade-offs: simpler backend code; introduces a "trust this internal traffic" zone. Modern setups use mTLS between proxies and backends too.

## Common mistakes

- **Self-signed certs in production.** Browser warnings; users click through or bounce.
- **Allowing TLS 1.0/1.1.** Deprecated; protocol downgrades possible.
- **No HSTS.** First-visit MITM risk.
- **Expired certs.** Set up monitoring with email alerts 30 days out.
- **Disabling cert validation in code.** `verify=False` in requests. Same as plain HTTP.

## Summary

- TLS provides confidentiality, integrity, authentication.
- Handshake: key exchange (ECDH) → shared secret → symmetric encryption (AES-GCM).
- Certificates prove server identity; signed by trusted CAs.
- Let's Encrypt automates issuance; pair with cert renewal.
- HSTS for "always HTTPS"; preload for first-visit.
- TLS 1.3 only; disable older protocols.
- mTLS for service-to-service auth.

Next: cryptographic pitfalls — what not to do.
