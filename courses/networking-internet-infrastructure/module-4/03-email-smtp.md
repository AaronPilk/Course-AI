---
module: 4
position: 3
title: "Email: SMTP, IMAP, deliverability"
objective: "How email works and why it's so hard to send."
estimated_minutes: 5
---

# Email: SMTP, IMAP, deliverability

## The protocols

Email has been around since the 70s. The core protocols:

- **SMTP (Simple Mail Transfer Protocol).** Server-to-server delivery. Sometimes used by clients to send (port 587 with auth).
- **IMAP (Internet Message Access Protocol).** Clients read mail stored on the server. Standard since 1990s.
- **POP3.** Older; download-and-delete. Mostly obsolete.

## How email flows

When you send a message from `aaron@example.com` to `linus@othermail.com`:

1. Your mail client (Gmail web, Outlook, etc.) submits to your SMTP server via port 587 with authentication.
2. Your SMTP server looks up MX records for `othermail.com` (DNS).
3. Your server connects to the destination's mail server on port 25.
4. They exchange the message (SMTP commands: HELO/EHLO, MAIL FROM, RCPT TO, DATA).
5. Destination server accepts; stores in linus's inbox.
6. Linus opens his client; it talks to the mail server via IMAP; downloads/displays the message.

Authentication, encryption, and anti-spam happen at multiple points.

## SMTP protocol in detail

```
S: 220 mx.example.com ESMTP
C: EHLO sender.example.org
S: 250-mx.example.com
S: 250 STARTTLS
C: STARTTLS
S: 220 Ready
[TLS handshake]
C: MAIL FROM:<aaron@example.org>
S: 250 OK
C: RCPT TO:<linus@example.com>
S: 250 OK
C: DATA
S: 354 Send the message
C: From: Aaron <aaron@example.org>
C: Subject: Hello
C: 
C: Body text here.
C: .
S: 250 Message accepted
C: QUIT
```

Simple enough to talk to manually via netcat. SMTP is human-readable.

## Email deliverability — the real problem

Sending email is easy. Sending email that actually arrives in inboxes (not spam folders or rejected outright) is hard.

Reputational systems govern this:

- **Sender reputation.** Your sending IP / domain has a score. Send spam → bad score → rejected.
- **Engagement signals.** Recipients opening / replying improves; spam-flagging hurts.
- **Authentication signals.** SPF / DKIM / DMARC.
- **Content.** Spammy keywords, all-image emails, bad HTML — flagged.
- **Volume patterns.** Sudden burst from new IP = suspicious.

For your domain to reliably deliver mail:
1. SPF + DKIM + DMARC all configured.
2. Send from a domain with established reputation.
3. Use a reputable sending service (SendGrid, Mailgun, Postmark, Amazon SES) — they manage IP reputation.
4. Warm up new IPs / domains gradually.
5. Monitor bounces, complaints, and adjust.

## SPF, DKIM, DMARC recap

**SPF** (TXT record): authorized sending IPs.
```
v=spf1 include:_spf.google.com ~all
```

**DKIM** (TXT under selector._domainkey): public key for signing.
```
v=DKIM1; k=rsa; p=MIGfMA0...
```

**DMARC** (TXT at _dmarc): policy + reporting.
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com
```

All three required for modern mail deliverability. Gmail / Outlook 2024+ require them for bulk senders.

## Bounces and complaints

**Hard bounce.** Permanent failure (mailbox doesn't exist). Remove from list.

**Soft bounce.** Temporary (mailbox full, server down). Retry; remove after N failures.

**Complaint.** Recipient marked as spam. Remove and investigate.

Sending services provide webhooks for these events. Honor them — sending to invalid addresses or known spam-flaggers degrades your reputation fast.

## Transactional vs marketing

- **Transactional.** Triggered by user action (password reset, receipt). Usually high deliverability.
- **Marketing.** Bulk sends. Stricter requirements, higher complaint rates.

Some services (Postmark, Resend) specialize in transactional; others (Mailchimp, Klaviyo) in marketing. Mixing on the same domain can hurt the transactional side; use subdomains (`notifications.example.com` for transactional, `marketing.example.com` for marketing).

## IMAP — reading mail

```
$ openssl s_client -connect imap.example.com:993
* OK ready
a LOGIN user pass
a OK
a SELECT INBOX
* 12 EXISTS
a OK
a FETCH 1 BODY[]
* 1 FETCH (BODY[] {1234}
From: ...
)
```

Tag prefix lets you pipeline commands. Modern clients use IMAP IDLE for push notifications when new mail arrives.

For programmatic mail handling: Postfix / Dovecot (self-hosted), or APIs from Gmail / Microsoft Graph for SaaS-hosted mail.

## Anti-spam mechanisms

- **Blocklists.** Spamhaus, Spamcop, etc. List bad sending IPs.
- **Content scanners.** SpamAssassin, ProofPoint, etc. Score mail.
- **Behavioral.** Greylisting (temporary reject; spammers don't retry), tarpitting (slow connections).
- **Machine learning.** Gmail / Outlook use ML on content + sender history.

The cumulative effect: getting mail through is constant work. Treat email as a deliverability product.

## Common email mistakes

- **Sending from your own domain without SPF/DKIM/DMARC.** Goes to spam.
- **Sending from a noreply@ address.** Hurts engagement.
- **Embedding tracking pixels excessively.** Tagged as marketing/spam.
- **Image-only emails.** Spam filter red flag.
- **Long unsubscribe processes.** Recipients mark as spam; your reputation tanks.

## Summary

- SMTP = server-to-server transfer; IMAP = client reading.
- Deliverability = reputation + auth + content + engagement.
- SPF + DKIM + DMARC are mandatory in 2026.
- Use reputable sending services (SendGrid, Mailgun, Postmark, SES).
- Separate transactional vs marketing on subdomains.
- Handle bounces / complaints honestly.

Next: QUIC and the future of transport.
