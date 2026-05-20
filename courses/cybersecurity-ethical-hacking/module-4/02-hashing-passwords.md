---
module: 4
position: 2
title: "Hashing, salts, and password storage"
objective: "How to store passwords so a leaked database doesn't ruin everyone."
estimated_minutes: 6
---

# Hashing, salts, and password storage

## What hashing is

A hash function takes input of any size and produces a fixed-size output. Properties:

- **Deterministic.** Same input → same output.
- **One-way.** Given output, can't compute input (practically).
- **Collision-resistant.** Different inputs almost never produce the same output.

Examples: SHA-256, SHA-512, BLAKE2, BLAKE3.

Hashes are used everywhere — file integrity, git commits, blockchain, deduplication, content-addressable storage.

## Why hashes alone aren't enough for passwords

```python
# ❌ Bad
hashed_password = sha256(password)
```

Problems:

**1. Rainbow tables.** Pre-computed tables of hashes for common passwords. If your hash matches one, the password is recovered instantly. The standard tables cover billions of common passwords.

**2. Speed.** SHA-256 is fast — GPUs compute billions per second. Brute-forcing a database of SHA-256 password hashes against a wordlist crack most passwords in hours.

**3. Same password = same hash.** Two users with "password123" have identical hashes. One crack reveals both.

## Salts

A salt is a random per-user value added before hashing:

```
hash(salt + password)
```

```python
import os, hashlib

salt = os.urandom(16)
hashed = hashlib.sha256(salt + password.encode()).digest()
# store: salt + hashed
```

Effects:
- Rainbow tables don't work (would need a table per salt).
- Two users with the same password get different hashes.
- Attackers must brute force each password independently.

Salts can be stored alongside hashes (they're not secret).

## But SHA-256 is still too fast

Even with salts, SHA-256 + GPUs cracks weak passwords quickly. Real password hashing uses *slow* hash functions designed for the job:

- **bcrypt.** Configurable work factor (cost). Standard since 1999.
- **scrypt.** Memory-hard. Resists GPU/ASIC attacks better.
- **argon2.** Winner of the Password Hashing Competition (2015). Modern best.
- **PBKDF2.** Older, still used for compatibility.

All include salts automatically (most implementations) and tunable work factors. Calibrate so login takes 100-500ms — slow enough for brute force to hurt, fast enough for real users.

```python
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12))
# verify
bcrypt.checkpw(password.encode(), hashed)
```

cost=12 means ~250ms per hash. As hardware improves, increase the cost factor.

## Argon2 — the modern default

```python
from argon2 import PasswordHasher

ph = PasswordHasher(time_cost=2, memory_cost=65536, parallelism=4)
hashed = ph.hash(password)
ph.verify(hashed, password)  # raises if wrong
```

Memory-hard means a GPU brute-force requires a lot of memory per parallel attempt — limits how many guesses an attacker can run in parallel. Calibrate for ~100ms wall time.

For new projects: argon2 is the default. bcrypt is fine if you already have it. Don't use PBKDF2 unless required for compatibility.

## Common mistakes in password storage

**Plain text.** Worst possible. Leaked → all passwords compromised. Still surprisingly common in legacy systems.

**Reversible encryption.** Encrypting passwords with a key you also store. If the key is leaked with the passwords, same as plain text.

**Plain SHA-256/MD5.** Hashed but cracked fast. Rainbow tables for common passwords.

**Same salt for everyone.** Single rainbow table works against all of them. Salts must be per-password.

**Custom hash functions.** "We added a special twist to SHA-256." Almost always weaker than standard algorithms. Use bcrypt/argon2.

## Verifying without revealing — login flows

```python
# Login
def authenticate(username, password):
    user = db.get_user(username)
    if not user:
        # Still compute a hash to prevent timing attacks
        bcrypt.hashpw(b"dummy", bcrypt.gensalt(rounds=12))
        return False
    return bcrypt.checkpw(password.encode(), user.hashed_password)
```

The dummy hash prevents timing side channels (attackers measure how long auth takes — short = user doesn't exist; long = user exists, password wrong).

## Password reset best practices

When a user forgets:

1. Email a random single-use token to their address.
2. Token valid for 1 hour, single-use.
3. Clicking the link prompts new password.
4. On set: invalidate all sessions (force re-login on other devices).

Never email the password (you don't have it; you have its hash). Never send the password back via "security question."

## Have I Been Pwned password check

Modern password security goes further: check whether the password has appeared in any known breach:

```
$ curl -s https://api.pwnedpasswords.com/range/$(echo -n "password" | sha1sum | cut -c1-5)
```

Uses k-anonymity — you send only the first 5 hex chars of the SHA-1; server returns all matches; client checks if the full hash is in the list. The full password never leaves the client.

NIST guidelines recommend rejecting passwords found in breaches. Implement this; users get warned at signup / change.

## Key derivation functions (KDFs)

A related family for deriving cryptographic keys from passwords / passphrases:

- **PBKDF2.** Used in WPA2, TLS sometimes.
- **scrypt.**
- **HKDF.** Derives multiple keys from one shared secret (used in TLS 1.3).
- **argon2id.** For password-based key derivation.

Use a KDF whenever you need to turn a password into an encryption key.

## Storage best practices

```
users table:
  id, email, hashed_password (string starting with "$argon2id$..."), created_at
```

The hash format includes the algorithm, salt, work factor:

```
$argon2id$v=19$m=65536,t=2,p=4$<salt>$<hash>
```

When you upgrade work factors later, you can detect old hashes by parsing this prefix and re-hash on next login.

## Multi-factor authentication

Even perfect password storage doesn't help if the user's password is "Password123!". MFA — required for sensitive accounts — adds a second factor that an attacker without the device can't bypass.

Covered in detail in Module 2. The summary: hash passwords well AND require MFA.

## Mistakes to avoid

- **Custom password hashing schemes.** Bcrypt/argon2 are battle-tested.
- **Salt reuse.** Per-user salts; never global.
- **Storing the password decryptable.** Hash, don't encrypt.
- **No password policy on weak passwords.** NIST recommends min length + breach-check; not character-class rules.
- **No MFA on admins.** Even good passwords aren't enough.

## Summary

- Hash + per-user salt for passwords; never plain or reversible.
- Use bcrypt / argon2 / scrypt — slow, memory-hard.
- Calibrate work factor for ~100ms per hash; adjust upward as hardware improves.
- Check against breach databases (HIBP) at signup / change.
- MFA on top of good password hashing — not instead of.

Next: TLS and HTTPS internals.
