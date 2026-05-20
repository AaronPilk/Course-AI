---
module: 4
position: 1
title: "Symmetric vs asymmetric and when to use which"
objective: "The two big families of cryptography and what each is for."
estimated_minutes: 6
---

# Symmetric vs asymmetric and when to use which

## The two families

**Symmetric crypto.** One key. The same key encrypts and decrypts. Fast.

**Asymmetric (public-key) crypto.** Two keys: public + private. Encrypted with one, decrypted with the other. Slow.

Each has its strengths; most real systems combine them.

## Symmetric examples

- **AES (Advanced Encryption Standard).** The standard. 128/192/256-bit keys. Used everywhere.
- **ChaCha20.** Stream cipher; alternative to AES, often faster on devices without AES hardware.

```python
from cryptography.fernet import Fernet

key = Fernet.generate_key()
cipher = Fernet(key)

ciphertext = cipher.encrypt(b"hello")
plaintext = cipher.decrypt(ciphertext)
```

The same `key` both sides need. If you don't have a way to share the key securely, symmetric crypto alone doesn't solve the problem.

## Asymmetric examples

- **RSA.** Original, slow, large keys (2048-4096 bits).
- **ECDSA, Ed25519.** Modern, smaller keys (256-bit) with same security as 3072-bit RSA.
- **ECDH (Elliptic Curve Diffie-Hellman).** Key agreement.

```python
from cryptography.hazmat.primitives.asymmetric import ed25519

private_key = ed25519.Ed25519PrivateKey.generate()
public_key = private_key.public_key()

signature = private_key.sign(b"hello")
public_key.verify(signature, b"hello")  # verifies or raises
```

Anyone with the public key can verify signatures or encrypt messages; only the private key holder can sign or decrypt.

## What each is good for

**Symmetric:**
- Bulk data encryption (large files, network traffic).
- Where both parties already share a key.

**Asymmetric:**
- Distributing a session key between parties who don't share secrets.
- Digital signatures (signing code, JWTs, certificates).
- Authentication (you have the private key; prove it).

## Hybrid encryption — the real-world combination

TLS, SSH, GPG all do this:

1. Use asymmetric crypto to securely share a random symmetric key (key exchange).
2. Use symmetric crypto to encrypt the actual data with that key.

Why: asymmetric is slow; symmetric is fast. Use asymmetric for the small (key); symmetric for the big (data).

For a TLS handshake:
- Client + server use ECDH to derive a shared secret.
- They derive symmetric keys from the shared secret.
- The session uses AES-GCM with those symmetric keys.

## Key sizes — what's secure in 2026

- **AES:** 128 bits minimum, 256 bits for high-value. 128 is fine for almost everything.
- **RSA:** 2048 bits minimum, 3072+ for long-term. 1024 broken. Larger = slower.
- **ECDSA / Ed25519:** 256 bits is standard.
- **SHA-2 (SHA-256, SHA-512):** standard for hashing.
- **SHA-3 / BLAKE2 / BLAKE3:** modern alternatives.

Avoid: DES (broken), 3DES (deprecated), MD5 (broken), SHA-1 (broken for collisions), RSA-1024 (broken).

## Authenticated encryption (AEAD)

Plain encryption hides content but doesn't prevent tampering. Modern symmetric ciphers use AEAD modes:

- **AES-GCM.** AES in Galois/Counter Mode. Encrypts + authenticates. Standard.
- **ChaCha20-Poly1305.** Same idea, different primitives.

```python
# pseudo-API
ciphertext, tag = cipher.encrypt(key, nonce, plaintext, additional_data)
# decrypt — if tag doesn't match, error
plaintext = cipher.decrypt(key, nonce, ciphertext, tag, additional_data)
```

The "tag" detects tampering. Decrypt fails if anything was modified. AEAD is what you want for any new system — never plain CBC + manual HMAC.

## Nonces — the easy mistake

Most symmetric ciphers need a nonce (number used once) per encryption — random, never repeated with the same key.

**Reusing a nonce** with most ciphers is catastrophic — leaks the plaintext or allows forging messages. Famously, broken implementations have done this.

```python
# AES-GCM
nonce = os.urandom(12)        # NEVER reuse with same key
ciphertext = cipher.encrypt(key, nonce, plaintext)
# send: nonce + ciphertext (nonce is fine in plaintext; secrecy isn't required)
```

Random 96-bit nonces are safe up to about 2^32 messages per key before collision probability becomes meaningful. Beyond that, rotate keys or use a counter-based nonce scheme.

## Digital signatures

Signing proves: this message came from someone with the private key, and hasn't been modified.

```python
# Sign
signature = private_key.sign(message)

# Verify (anyone with public key)
public_key.verify(signature, message)
```

Used in:
- Code signing (binaries, npm packages).
- JWTs (RS256, ES256).
- TLS certificates.
- Git commit signing.
- Cryptocurrency transactions.

## Key management — the hardest part

Crypto is easy; managing keys is hard:

- Where are private keys stored?
- Who has access?
- How are they rotated?
- What happens if compromised?
- How do you back up without exposing?

For new projects:

- **Cloud KMS.** AWS KMS, GCP Cloud KMS, Azure Key Vault. Hardware-backed; access via IAM.
- **HashiCorp Vault.** Self-hosted secrets store with crypto APIs.
- **Hardware tokens.** YubiKey for personal; HSMs for production.

Storing keys in environment variables / config files / git is the common-but-wrong approach.

## Mistakes to avoid

- **Rolling your own crypto.** Reuse battle-tested libraries; never invent ciphers, hashes, signatures, or protocols.
- **Reusing nonces.** Catastrophic. Always random or counter-based.
- **Plain CBC without HMAC.** Predates AEAD; use AES-GCM instead.
- **RSA 1024.** Broken. 2048+ for new keys.
- **Keys in git / config files.** Use a real secret store.

## Summary

- Symmetric (AES) = fast, both parties share key.
- Asymmetric (RSA, Ed25519) = slow, public/private split.
- Hybrid = real systems combine: asymmetric for key exchange, symmetric for data.
- AEAD modes (AES-GCM, ChaCha20-Poly1305) encrypt + authenticate together.
- Never reuse nonces. Never roll your own crypto.
- Key management is the hardest part — use a KMS.

Next: hashing, salts, and password storage.
