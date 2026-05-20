---
module: 1
position: 4
title: "Legal and ethical lines you cannot cross"
objective: "What's lawful security work and what's a felony."
estimated_minutes: 5
---

# Legal and ethical lines you cannot cross

## Why this comes first

It's easy to confuse "I have the technical skill to do this" with "I'm allowed to do this." The internet is full of tutorials that show how to attack systems; many of those attacks, performed without permission, are crimes — felonies in many jurisdictions.

Learn the boundaries before learning the techniques. The skills are dual-use; the legal exposure is real.

## US laws that apply

**Computer Fraud and Abuse Act (CFAA, 1986).** The main US anti-hacking law. Criminalizes "unauthorized access" and "access exceeding authorization." Penalties: fines, prison up to 20+ years for serious cases.

The CFAA is broad — courts have repeatedly debated what "unauthorized" means. Pen-testing without explicit permission can fall under it. Even using a username/password belonging to someone else who shared it with you can be a crime depending on context.

**DMCA (Digital Millennium Copyright Act).** Criminalizes circumventing access controls on copyrighted works. Has security research exceptions but they're narrow.

**Wiretap Act.** Intercepting electronic communications (network traffic) without authorization.

**ECPA.** Stored Communications Act — accessing email or stored communications without authorization.

**State laws.** Most US states have their own computer crime laws on top of federal.

Outside the US, equivalents exist: UK Computer Misuse Act, EU laws under GDPR and member-state laws, Canada's Criminal Code, etc.

## What requires written authorization

If you're going to test someone else's system, you need explicit written permission. "Authorized to test" must specify:

- **Scope.** Which systems, IP ranges, domains.
- **Time window.** When the test runs.
- **Methods allowed.** What's in-scope (web app testing) vs out (DOS, social engineering).
- **Contacts.** Who to call if something breaks.
- **Reporting.** How findings will be communicated.

A signed contract or Rules of Engagement (RoE) document. Without it, you're not pen-testing — you're committing a crime.

Even for friends or family: "yes you can test my Wordpress site" texted casually isn't enough if it goes bad. Get it in writing.

## Bug bounty programs

Many companies run bug bounty programs (HackerOne, Bugcrowd, or self-hosted). They publish:

- A scope (which systems are in / out).
- Reward ranges.
- Disclosure rules.
- A "safe harbor" provision that authorizes testing within scope.

The safe harbor is the legal authorization. If you find a bug *within the published scope* and report it properly, you're protected. Outside the scope or after exfil — the protection doesn't apply.

Read the program rules. Stay inside them.

## CTFs and intentionally vulnerable environments

Practice safely:

- **HackTheBox, TryHackMe, RootMe** — intentionally vulnerable labs.
- **OverTheWire** — classic war games.
- **VulnHub** — VMs you download and attack offline.
- **PortSwigger Web Security Academy** — free, excellent for web attacks.
- **DVWA, OWASP Juice Shop** — local installs.

These are designed to be attacked. Practice every technique here first. Never on someone's real system.

## The "but I had permission" myth

Common patterns that aren't authorization:

- **"It was a default password."** Doesn't matter; access still unauthorized.
- **"They said I could pen-test 'their stuff' verbally."** Not in writing → not authorized.
- **"The site has a contact form."** Doesn't authorize testing the site.
- **"They published a security email."** Disclosure intake, not testing permission.
- **"It was already breached."** Doesn't matter; further access still illegal.

If in doubt — assume not authorized.

## What to do if you find a vulnerability accidentally

You stumble onto something — say, a misconfigured S3 bucket exposing customer data while doing normal work. Steps:

1. **Stop.** Don't poke around further. Don't download data.
2. **Document.** What you saw, when, how to find it again (URL, screenshot of the listing, NOT the contents).
3. **Report.** Find security@company or via published responsible-disclosure channel.
4. **Coordinate.** Let them fix it. Don't tell anyone else.
5. **Don't extort.** "Pay me to keep quiet" is extortion. Not security research.

Responsible disclosure: tell the company, give them time to fix it (90 days is standard), then publicly disclose if they don't respond or fix it. The "Google Project Zero" model.

## Hacking your own systems

Yours? Test freely. Some caveats:

- **Cloud provider terms.** AWS, GCP, etc. have specific rules for pen-testing in their environment. Often allowed but requires prior notification for noisy tests.
- **Shared infrastructure.** Don't test in ways that affect other tenants.
- **Production systems.** Even your own — risk of taking down legitimate users. Test in staging.

## The ethical layer above the legal layer

Legal compliance is the floor. Ethical practice adds:

- **Don't seek vulnerabilities you don't intend to report.** "Curiosity hacking" of strangers' systems is ethically murky.
- **Don't disclose without giving time to fix.** Even if technically legal.
- **Don't sell vulnerabilities to malicious actors.** Some bug-broker markets are legal but ethically suspect.
- **Respect user data.** If a vulnerability gives you access to other users' info, don't browse it. See the vuln; report it.

Professional security work has reputation as currency. Being known as the person who reports responsibly, helps fix things, and respects boundaries is the career.

## Common pitfalls

- **"I'll just look around."** That's the unauthorized access.
- **Testing on a friend's site without written OK.** Friendship doesn't grant legal authorization.
- **Scanning random IPs.** Most port scanning is legal in most jurisdictions, but vulnerability scanning without authorization is gray-to-illegal.
- **Posting POCs of unpatched vulnerabilities.** Get the vendor's response first.

## Career paths in security

Legitimate paths to use these skills:

- **Penetration tester / red team.** Companies hire to attack their own systems.
- **Bug bounty hunter.** Independent; rewards from published programs.
- **Security engineer / blue team.** Build defenses, run detection / response.
- **Security researcher.** Find new vulnerabilities; publish responsibly.
- **Forensics / incident response.** Investigate after breaches.

All build on the foundations of threat modeling, web/network/system understanding, cryptography, and operational discipline. None require crime.

## Summary

- Unauthorized access is a felony in most jurisdictions (US CFAA + state + international).
- "Authorized testing" requires written scope, time, methods, contacts.
- Bug bounty programs provide safe harbor — read the rules; stay in scope.
- Practice on intentionally vulnerable platforms (HackTheBox, OWASP Juice Shop, etc.), never strangers' systems.
- Responsible disclosure: report → wait → publish. Don't extort.
- Ethics extends beyond legality; reputation is career currency.

Module 1 complete. Next module: web application security.
