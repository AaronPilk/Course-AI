---
module: 1
position: 2
title: "Reconnaissance: what the internet already knows"
objective: "See your organization the way an attacker does."
estimated_minutes: 6
---

# Reconnaissance: what the internet already knows

## Recon is the first step of every attack

Before exploiting anything, attackers gather information. The internet hands out a lot of it for free:

- Your public DNS records.
- Employees on LinkedIn.
- Source code in public GitHub repos.
- Subdomains via certificate transparency.
- Cloud assets via Shodan / Censys.
- Past breaches on Have-I-Been-Pwned.

Each piece is innocuous; combined, they form an attack surface. Smart defenders do the same recon — find what attackers will find, fix what shouldn't be there.

## Passive vs active recon

**Passive.** No interaction with the target. Public data only. Not detectable by the target. Legal almost everywhere.

**Active.** Touches the target's systems. Port scans, login attempts, vulnerability probes. Detectable. Legal only with permission.

Most recon starts passive. Active recon happens during authorized engagements only.

## DNS — the public face

DNS reveals architecture:

```
$ dig example.com ANY
$ dig example.com NS                # who runs DNS
$ dig example.com MX                # mail provider
$ dig example.com TXT               # SPF, DKIM hints
$ dig _dmarc.example.com TXT        # DMARC policy
```

MX → "we use Google Workspace." NS → "we host on Cloudflare." TXT records leak app integrations (Atlassian, Salesforce, Slack).

For subdomains, certificate transparency logs reveal all certs ever issued:

```
$ curl -s "https://crt.sh/?q=%25.example.com&output=json" | jq -r '.[].name_value' | sort -u
```

Outputs every subdomain that ever had a public cert. Often surprises companies — `admin-staging.example.com`, `backup.example.com`, etc.

Tools: `crt.sh`, `subfinder`, `amass`, `assetfinder`. They aggregate from multiple sources and produce a subdomain list.

## OSINT on people

LinkedIn, Twitter, GitHub, conference talks, podcasts. Attackers build org charts:

- Who's the CFO? (Finance department phishing target.)
- Who joined recently? (Less likely to spot phishing.)
- Who has admin in the title? (High-value target.)
- Who Tweets about being on vacation? (Window when systems matter most.)

The information is public. Awareness training helps, but you can't make LinkedIn private.

## GitHub

Public repos sometimes contain:

- API keys committed accidentally.
- Internal URLs and architectural details.
- Outdated framework versions (signal for known exploits).
- Comments revealing pain points or skipped security work.

```
$ grep -r "API_KEY\|api_key\|secret" .
$ truffleHog --regex --entropy=true repo_url     # tool for finding secrets
```

Defensively: secret-scanning on commit, plus periodic scans of org repos. GitHub has built-in secret scanning that auto-revokes detected leaked tokens for many providers.

## Shodan and Censys

Internet-wide port scanners with searchable indexes. Searching "exposed Redis" or "default Mongo" returns thousands of public-facing instances:

```
Shodan search: "Redis" port:6379 has_password:false
```

Returns Redis instances with no password — historically pre-pwned and used for crypto mining or ransomware.

Defenders should know: anything you put on the public internet is in these indexes within hours. Search yourself — `org:"your-company"` — find what's exposed.

## Wayback Machine and Google dorks

The Internet Archive caches old versions of sites:

```
$ curl "https://web.archive.org/web/*/example.com/*"
```

Cached versions sometimes reveal endpoints or admin panels you forgot to take down.

Google dorks (advanced operators):

```
site:example.com filetype:pdf
site:example.com inurl:admin
site:example.com "API key"
site:example.com -inurl:www
```

Google indexes more than you'd think. "Confidential" memos hosted on public S3 buckets get found.

## Have I Been Pwned

```
$ curl https://haveibeenpwned.com/api/v3/breachedaccount/aaron@example.com
```

Returns breaches that included that email. Knowing which breach an account appeared in tells attackers which passwords might still work.

Defensively: HIBP partners with password managers — you can check whether your password has appeared in any breach. If so, change it.

## Tools that automate recon

For authorized red-team engagements:

- **recon-ng** — modular OSINT framework.
- **theHarvester** — emails, subdomains, hosts.
- **Maltego** — graph-based intel.
- **SpiderFoot** — automated OSINT.

These compose dozens of data sources into a structured profile. Most have free / community tiers.

## Defender's perspective

Run the recon on yourself quarterly:

1. **DNS audit.** Pull all subdomains; map to active services; decommission unused ones.
2. **GitHub scan.** Audit public repos for secrets; remove obsolete ones.
3. **Shodan check.** Find any exposed services you didn't intend to expose.
4. **Employee OSINT.** Who's a high-value target? Apply MFA, training, monitoring.
5. **HIBP.** Check organizational domain; force password reset on impacted accounts.

The recon doesn't replace deep security work — it shrinks the attack surface attackers see.

## Mistakes to avoid

- **Public repos with secrets.** Even if revoked, sometimes still valuable.
- **Forgotten subdomains.** `dev.example.com` from 2018 still points to a vulnerable server.
- **Default-exposed services.** Redis, Mongo, Elasticsearch — never trust defaults.
- **Treating obscurity as security.** "No one knows about this URL" doesn't last. Cert transparency makes it findable.

## Summary

- Recon = gathering attack-surface info; passive (legal anywhere) vs active (authorized only).
- DNS, cert transparency, GitHub, Shodan, Wayback Machine are public goldmines.
- HIBP and OSINT on employees inform phishing targets.
- Run recon on yourself; shrink attack surface before attackers find it.
- Obscurity isn't security — assume attackers see what the internet sees.

Next: the CIA triad.
