---
module: 5
position: 3
title: "Bug bounty and responsible disclosure"
objective: "The economic and ethical structure for finding bugs."
estimated_minutes: 5
---

# Bug bounty and responsible disclosure

## The basic idea

Companies pay external researchers to find vulnerabilities in their products. Both sides win: the researcher gets paid and reputation; the company finds bugs before attackers do, often cheaper than internal red teams.

The model has matured into a real industry. Bug bounty platforms (HackerOne, Bugcrowd, Intigriti) host programs for thousands of companies; some researchers earn six- to seven-figure incomes annually.

## Program structure

A bug bounty program typically defines:

- **Scope.** Which assets are in (domains, apps, products). Anything not listed is out of scope.
- **Reward ranges.** Critical: $X-Y; high: $A-B; medium: $C-D; low: token / swag.
- **Rules.** No DoS testing, no social engineering, no testing payment flows with real money.
- **Disclosure policy.** When can researchers publish? After fix; with company permission; never.
- **Safe harbor.** Legal protection for in-scope testing.

Sample reward range for a mid-size SaaS:
- Critical (full DB takeover): $10,000-50,000
- High (privilege escalation): $2,500-10,000
- Medium (sensitive XSS): $500-2,500
- Low (info disclosure): $100-500

For trillion-dollar companies (Apple, Google), top bounties reach $500K-$2M for full-chain zero-clicks.

## Safe harbor

The critical legal element. Without it, finding a vulnerability legally exposes the researcher (CFAA, etc.). With safe harbor, the program authorizes specific testing:

```
Safe Harbor: We will not pursue civil or criminal action against researchers
who comply with this program's policies. Research is authorized only
within the defined scope and rules.
```

Read every program's safe harbor before testing. Outside scope = no protection.

Some companies have safe-harbor policies even without paying bounties — "we won't sue if you responsibly report."

## How to participate

1. **Choose a platform.** HackerOne (most volume), Bugcrowd, Intigriti, YesWeHack. Each has different programs and policies.
2. **Build profile.** Solve labs (PortSwigger Web Security Academy, HackTheBox), report low-hanging fruit, build reputation.
3. **Choose programs that match your skills.** Web exploits, mobile, IoT, etc.
4. **Read scope carefully.** Out-of-scope reports get duplicated/closed.
5. **Test responsibly.** Don't break things; don't exfil data; don't impact real users.
6. **Report well.** Steps to reproduce, impact, suggested fix. Clear PoC.

## Writing a good report

The difference between a $500 and $5000 payout is often the quality of the report:

```
TITLE: Stored XSS in profile bio allows session theft

SUMMARY:
The profile bio field at /api/profile is rendered without sanitization
in user-visible contexts (/u/<username>), allowing any user to inject
JavaScript that executes in viewers' browsers.

STEPS TO REPRODUCE:
1. Authenticate as User A.
2. PATCH /api/profile with body {"bio": "<script>alert(1)</script>"}.
3. As User B, visit /u/userA.
4. The script executes in User B's browser.

IMPACT:
- Steal session cookies (HttpOnly=false on session cookie).
- Make authenticated requests as the victim.
- Display fake login form on real domain.

SUGGESTED FIX:
HTML-encode the bio field on render. Sanitize stored values with DOMPurify
or framework's built-in escaping.

ATTACHMENTS:
- video: 30-second screen recording of exploit
```

Concise, reproducible, actionable. Triage teams love it; bounties reflect that.

## What gets duplicated

Many programs receive identical reports from multiple researchers. First valid report wins. To win:

- Hunt fresh features (just released).
- Hunt areas others avoid (mobile, IoT, internal tools that became public).
- Combine known issues for higher impact ("XSS + IDOR = account takeover").
- Move fast on disclosures of CVEs in dependencies the target uses.

Duplicates are part of the game. Most hunters get many dupes for every paid bounty.

## Vulnerability Disclosure Programs (VDPs)

Not all programs pay bounties. Vulnerability Disclosure Programs are "we accept reports; we don't pay; we won't sue if you follow our rules." Common for governments, smaller companies, public-interest organizations.

Reporting to VDPs still builds skill and reputation; some researchers do them for non-monetary reasons (notoriety, the satisfaction of helping).

## Responsible disclosure timeline

For vulnerabilities discovered without a formal program:

1. **Find security contact.** `security@`, `/.well-known/security.txt`, the company's vulnerability disclosure page.
2. **Report privately.** Include reproduction steps, impact assessment.
3. **Wait for fix.** Industry standard: 90 days. Google Project Zero popularized this.
4. **Coordinate disclosure.** Joint announcement when patched.
5. **Public disclosure.** Even if they don't fix.

Each step has nuances. If the company ignores you, escalating to a national CERT (US-CERT, ENISA) often gets a response.

## Bad behavior on both sides

Researchers behaving badly:
- Public disclosure without giving time to fix.
- Demanding payment to keep quiet (extortion, not research).
- Testing out of scope; impacting real users.

Companies behaving badly:
- Threatening legal action against good-faith researchers.
- Slow fixes, dragging disclosure.
- Trying to suppress publication.

Mature programs have policies that protect both sides. Trust matters; both sides remember.

## Bug bounty as career

For talented researchers, bug bounty can be:

- **A side income.** A few hours weekly, occasional payouts.
- **A full-time job.** Top bounty hunters work full-time on platforms.
- **A path to security engineering.** Strong bounty history opens doors to internal teams.

It's a meritocracy in a way most fields aren't — the reports speak for themselves. Geographic location, formal credentials matter less than demonstrated skill.

## Mistakes to avoid

- **Reporting out of scope.** Closed as N/A; no payout; reputation damage.
- **Vague reports.** Triage closes them; no payout.
- **Testing on real users.** Out of scope; possibly violates terms.
- **Demanding payment to keep quiet.** Extortion; criminal.
- **Disclosing publicly before fix.** Loses payout; harms users; angers company.

## Summary

- Bug bounty programs pay researchers to find vulnerabilities responsibly.
- Read scope and safe harbor before testing.
- Write clear, reproducible reports with impact statements.
- Industry standard disclosure: 90 days, coordinated.
- VDPs accept reports without paying.
- Career path for talented researchers; meritocracy via reports.

Next: building a security mindset.
