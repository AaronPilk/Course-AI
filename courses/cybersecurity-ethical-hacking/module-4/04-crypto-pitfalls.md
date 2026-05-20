---
module: 4
position: 4
title: "Pitfalls: never roll your own crypto"
objective: "The mistakes that make broken crypto look like working crypto."
estimated_minutes: 6
---

# Pitfalls: never roll your own crypto

## The rule

If you find yourself writing custom cryptographic code, stop. Use libraries. The history of crypto is littered with brilliant people implementing schemes that were broken in subtle ways no one caught for years.

Even if you understand the math, the implementation details are full of side channels, timing leaks, and footguns that take years to learn.

## Common mistakes

### 1. Using deprecated algorithms

- **MD5.** Collision attacks known since 2004. Don't use for anything security-relevant.
- **SHA-1.** Collisions demonstrated in 2017 (SHAttered). Migrating away from it.
- **DES.** 56-bit key; brute-forceable on commodity hardware.
- **3DES.** Deprecated by NIST in 2023; sweet32 attack.
- **RC4.** Biases in keystream; broken.

If you see these in code, replace with modern equivalents:

| Old | Modern |
|-----|--------|
| MD5 | SHA-256, SHA-3, BLAKE3 |
| SHA-1 | SHA-256, SHA-512 |
| DES/3DES | AES-256 |
| RC4 | ChaCha20 |

### 2. Insecure random numbers

```python
# ❌ Bad
import random
token = random.randint(0, 10**16)        # predictable!

# ✅ Good
import secrets
token = secrets.token_hex(32)             # cryptographically secure
```

`random` in Python (and many languages) is a non-CSPRNG (cryptographically secure pseudo-random number generator) — fine for games, terrible for security.

For tokens, IVs, salts, keys: `secrets` (Python), `crypto.randomBytes` (Node), `rand.Reader` (Go), `os.urandom` (any). Always.

### 3. Encrypting then "signing" with same key

Don't use the same key for multiple purposes. Use separate keys (or derive them via HKDF from a master key).

```python
# ❌ Bad — same key for encryption and HMAC
encrypt(key, data)
mac = hmac(key, data)

# ✅ Good — derive separate keys
enc_key = hkdf(master, "encryption")
mac_key = hkdf(master, "authentication")
```

This is why AEAD modes (AES-GCM) exist — they handle the encrypt-then-authenticate composition correctly internally.

### 4. ECB mode

AES in Electronic Codebook (ECB) mode encrypts each block independently — same plaintext block produces same ciphertext block. Patterns in the data are visible in the ciphertext.

The famous "ECB penguin" image — a Linux logo encrypted with ECB looks like a colored version of the original. The structure leaks.

Use GCM (or CBC with separate HMAC, but GCM is better). Never ECB.

### 5. CBC without HMAC (padding oracle)

```python
# ❌ Bad
ciphertext = aes_cbc_encrypt(key, iv, plaintext)
# No MAC means tampering goes undetected
```

CBC mode + missing authentication enables padding oracle attacks — attacker tweaks the ciphertext, watches error messages or timing differences, learns the plaintext byte by byte.

Use AES-GCM. It does encryption + authentication in one operation. Designed for this.

### 6. Timing attacks

```python
# ❌ Vulnerable
def check_password(input, stored):
    return input == stored                # short-circuits on first difference

# ✅ Safe
import hmac
def check_password(input, stored):
    return hmac.compare_digest(input, stored)    # constant-time
```

Naive string comparison returns early when a byte differs. Attacker measures how long the check takes; the longer it takes, the more bytes match — recover the password byte by byte. Demonstrated in many real systems.

Use `hmac.compare_digest` or equivalents (`crypto.timingSafeEqual` in Node) for any secret comparison.

### 7. Weak passwords / keys via key derivation

Deriving an encryption key from a user's password without proper KDF:

```python
# ❌ Bad
key = sha256(password).digest()           # fast hash; brute-forceable

# ✅ Good
key = argon2.kdf(password, salt, ...)     # slow, memory-hard
```

The attacker who has the encrypted data and wants to crack the password key uses the same KDF; if it's slow, brute force is expensive.

### 8. JWT alg=none / algorithm confusion

JWTs include an algorithm in the header (`alg: HS256`, `alg: RS256`). Bugs in libraries have allowed:

- `alg: none` accepted as valid (no signature verification).
- `alg: HS256` confused with `RS256` — server uses RSA public key as HMAC secret, attacker forges tokens.

Modern libraries fix this. But: enforce the expected algorithm; never trust the alg field from the token.

### 9. Hardcoded keys / IVs

```python
# ❌
KEY = b'my_secret_key_123'
IV = b'fixed_iv_value_xx'
```

Hardcoded keys end up in git, get leaked. Fixed IVs (especially with CBC/CTR/GCM) are catastrophic — reusing IV with same key in stream ciphers leaks plaintext via XOR.

Generate keys randomly; store in KMS / secrets manager. Generate IVs randomly per encryption.

### 10. Trusting client-side crypto for security

Client-side encryption in browser JS = the server can't trust it; another client could lie. Useful for end-to-end encryption (signal-style), useless for "client encrypts password before sending so the server doesn't see it" (you trust the server with the encrypted version anyway).

## The libraries to use

**Python:** `cryptography`, `pynacl`, `argon2-cffi`.

**Node:** built-in `crypto` module; `libsodium-wrappers` for high-level.

**Go:** standard library `crypto/*` packages.

**Rust:** `ring`, `rustls`, `argon2`.

All high-level: ChaCha20-Poly1305 for encryption, Ed25519 for signatures, argon2 for password hashing, HKDF for key derivation, BLAKE3 for hashing. Don't go below this layer.

## When to call a cryptographer

If your project involves:

- Custom protocols (not using TLS, SSH, established standards).
- New encryption schemes.
- Zero-knowledge proofs.
- Multi-party computation.
- Anything you can't find a battle-tested library for.

Get a real cryptographer to review. They cost money; the alternative costs more.

## What "battle-tested" means

A library used by major systems for years, audited multiple times, with a track record of bugs being found and fixed publicly. NaCl/libsodium, OpenSSL/LibreSSL, BoringSSL, the AWS / GCP / Azure crypto SDKs.

A new library with great marketing and no track record is not battle-tested.

## Mistakes to avoid (recap)

- **Implementing crypto yourself.** Almost always wrong.
- **Using deprecated algorithms.** MD5, SHA-1, DES, RC4.
- **Insecure RNG.** `random` instead of `secrets`/`crypto`.
- **ECB mode.** Use GCM.
- **String == for secrets.** Timing attacks. Use compare_digest.
- **Hardcoded keys/IVs.** KMS or secrets manager.
- **Trusting JWT alg field.** Enforce expected algorithm.

## Summary

- Never roll your own crypto; use battle-tested libraries.
- AES-GCM for symmetric encryption (or ChaCha20-Poly1305).
- Ed25519 for signatures, X25519 for key exchange.
- SHA-256/SHA-3/BLAKE3 for hashing; argon2 for password hashing.
- `secrets`/`crypto.randomBytes` for random; never `random`.
- `compare_digest` for secret comparisons; never `==`.
- Use KMS for keys; never hardcode.

Module 4 complete. Next module: detection and incident response.
