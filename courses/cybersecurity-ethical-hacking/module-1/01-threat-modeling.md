---
module: 1
position: 1
title: "What is a threat model?"
objective: "Define what you're protecting and from whom — the foundation of every security decision."
estimated_minutes: 7
---

# What is a threat model?

## Security starts with a question

Most security mistakes are made by skipping a single question: "Protect what, from whom?"

Without that, every "best practice" is a shot in the dark. With it, security becomes a series of design decisions rather than a checklist.

A threat model answers four questions:

1. **What are we building?** (Architecture, data, users.)
2. **What can go wrong?** (Threats — concrete bad outcomes.)
3. **What are we doing about it?** (Mitigations.)
4. **Did we do a good job?** (Review — known gaps, residual risk.)

That's it. Threat modeling is just structured paranoia.

## A worked example

Imagine: a small SaaS that stores customer invoices.

**What are we building?**
- Web app + API + Postgres database.
- Customers sign in to view their invoices.
- Admins (us) can see all invoices.

**What can go wrong?**
- An external attacker steals customer credentials and reads their invoices.
- A customer accidentally accesses another customer's invoices (broken access control).
- An employee with database access copies all invoices and leaks them.
- A bug exposes invoices to search engines.
- The database is held for ransom (ransomware).
- A third-party dependency we use is compromised (supply chain).

**What are we doing about it?**
- Passwords hashed with bcrypt; require MFA for admins.
- Per-tenant scoping enforced in every query (RLS in Postgres).
- Database access logged; production DB access requires approval.
- Cache headers prevent invoice URLs from being indexed; canonical 404 for unauthorized.
- Encrypted backups, off-site retention.
- Dependency scanning + signed commits.

**Did we do a good job?**
- Documented in a threat-model doc.
- Re-reviewed when architecture changes.

The model isn't proof of security — but it makes the gaps visible. A team that has done this is wildly better positioned than one that hasn't.

## STRIDE — a framework for "what can go wrong"

Microsoft's STRIDE acronym helps generate threats:

- **S**poofing — impersonating someone or something.
- **T**ampering — modifying data or code.
- **R**epudiation — denying you did an action.
- **I**nformation disclosure — leaking data.
- **D**enial of service — making the system unavailable.
- **E**levation of privilege — gaining higher access than allowed.

Walk through each component of your system. Ask: which STRIDE threats apply here?

- Login endpoint? S (credential stuffing), T (parameter manipulation), D (resource exhaustion).
- Database? T (unauthorized writes), I (read everything if compromised).
- Logging system? R (attacker erases logs), I (logs contain sensitive data).

You generate a list of plausible threats — many of which have known mitigations.

## DREAD — prioritizing them

Once you have threats, prioritize them. DREAD scores each one:

- **D**amage — how bad is it if exploited?
- **R**eproducibility — how easy is it to trigger?
- **E**xploitability — how skilled does the attacker need to be?
- **A**ffected users — how many?
- **D**iscoverability — how easy to find?

High DREAD = fix now. Low DREAD = ticket it.

In practice, security teams skip the numeric scoring (it's not very rigorous) and use intuitive judgment plus damage + likelihood. The point is to differentiate "we should fix this today" from "tracked, low priority."

## The attacker as designer

The mindset shift: stop thinking like a defender; think like an attacker designing an attack.

Attackers don't break security; they find paths around it. If you think only about "preventing unauthorized access," you miss credential stuffing (legitimate auth, illegitimate user). Thinking like an attacker — "how could I get a real password?" — surfaces this.

Common attacker techniques:
- **Brute force / credential stuffing.** Try known leaked passwords.
- **Phishing.** Trick someone into giving up credentials.
- **Supply chain.** Compromise a dependency.
- **Insider threat.** Be (or socially engineer) the insider.
- **Misconfiguration.** Find the S3 bucket left public.
- **Forgotten endpoints.** Find /admin still exposed.

Run your threat model through these. If "an attacker tries all leaked passwords against our login" isn't on your list, your threat model is incomplete.

## Where threat models live

For a small team: a markdown doc in the repo. Update when the architecture changes.

For larger orgs: a security review process. Major features require a threat model before they ship. Security team consults.

The artifact matters less than the activity. Even a one-hour whiteboard session covering STRIDE for your highest-risk components produces value.

## Common mistakes

- **Skipping threat modeling.** "We'll think about security at the end" never produces secure systems.
- **Threat modeling once and forgetting.** Architecture changes; threats change.
- **Over-modeling.** Every possible threat — paralysis. Focus on plausible and high-impact.
- **Ignoring insiders.** Most catastrophic incidents involve insiders or compromised accounts, not random hackers.
- **Treating compliance as security.** SOC 2 and PCI compliance aren't threat models; they're starting points.

## How attackers think about value

A useful exercise: rank what an attacker would want from your system.

- **Customer credentials.** Reusable elsewhere (people reuse passwords).
- **Customer data.** Saleable on markets; ransomable.
- **Source code.** Reveals more vulnerabilities; valuable IP.
- **Infrastructure access.** Mine crypto on your bill; pivot to your customers.
- **Brand damage.** Reputational; ransom for non-disclosure.

Defending all of these costs effort. Prioritize based on what you have and what attackers want.

## Summary

- Threat model = "Protect what, from whom?" + mitigations + review.
- STRIDE generates threats per component; DREAD prioritizes them.
- Think like an attacker — credential stuffing, phishing, supply chain, insider, misconfiguration.
- Update threat models as architecture evolves.
- The activity matters more than the artifact.

Next: reconnaissance — what attackers can already see.
