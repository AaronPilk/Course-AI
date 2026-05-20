---
module: 2
position: 2
title: "Code review patterns"
objective: "What good reviews look like."
estimated_minutes: 7
---

# Code review patterns

## Why code review

Code review serves several purposes:

- **Catch bugs.** Another set of eyes finds issues the author missed.
- **Share knowledge.** Reviewers learn the code; authors learn from feedback.
- **Maintain quality.** Norms get enforced consistently.
- **Distribute ownership.** Multiple people understand each part.
- **Improve design.** Discussion of approach catches structural issues early.

Done well, code review compounds team capability. Done badly, it's a bottleneck and morale killer.

## What good reviewers do

**Read the PR description first.** Understand the goal before diving into diffs.

**Check the tests.** New behavior should have tests; refactors shouldn't lose coverage.

**Run the code mentally.** Trace through the change with realistic inputs.

**Look for what's not there.** Missing error handling, edge cases, type safety.

**Suggest, don't dictate.** "Consider X" or "What about Y?" rather than "Change to X."

**Distinguish blocking from nits.** Use labels like `nit:` for minor preference; `blocking:` for must-fix.

**Respond timely.** Within 24 hours typically; faster for small PRs. Stale reviews kill velocity.

## What good authors do

**Self-review first.** Read your own diff before requesting review. Catch obvious issues.

**Write a clear description.** Reviewer shouldn't have to guess intent.

**Respond to every comment.** Either change the code or explain why not.

**Resolve comments after addressing.** Reviewer doesn't have to re-check.

**Push small follow-ups.** Don't accumulate 50 comments before responding.

**Be open to feedback.** Suggestions aren't attacks.

## Comment patterns

Use prefixes to signal intent:

- **`nit:`** — minor preference, not blocking. "nit: prefer const here."
- **`question:`** — clarifying, not necessarily change. "question: any reason not to use the util?"
- **`suggestion:`** — proposed alternative. "suggestion: extract this to a helper."
- **`blocking:`** — must address. "blocking: this breaks the existing API."
- **`praise:`** — when something's particularly good. Builds positive culture.

Without prefixes, every comment can feel like criticism. Prefixes give context.

## GitHub suggestions

For small fixes, use suggestion blocks:

````markdown
```suggestion
const userName = user.displayName || user.email;
```
````

The author can apply with one click — Git commit auto-created. Faster than back-and-forth on tiny changes.

## Approve vs request changes

GitHub PR reviews have three states:

- **Approve** — looks good; ready to merge (subject to other approvals if required).
- **Comment** — leaving feedback without explicit approval or block.
- **Request changes** — blocks merge until resolved.

Use "Request changes" sparingly. It blocks the PR; the author must request re-review after fixing. For minor issues, just "Comment." Reserve "Request changes" for substantive concerns.

A common pattern: approve with comments. The author addresses comments after merge if they're minor; or before merge if they're substantive.

## Reviewing tests

Some reviewers focus on code and skim tests. Reviewing tests is equally important:

- Do tests cover the new behavior?
- Are tests testing behavior, not implementation?
- Do edge cases get tested (empty, max, error)?
- Are tests readable as documentation?

A code change with weak tests is high risk. Push back on test coverage gaps.

## Reviewing safety

For security-sensitive code (auth, payments, PII handling):

- Check for SQL injection, XSS, CSRF.
- Verify auth checks before sensitive operations.
- Look for hardcoded secrets.
- Verify input validation.
- Check for race conditions.

Some teams require security review for changes in specific areas. CODEOWNERS (Module 5) can route automatically.

## Reviewing performance

Not every PR needs perf review, but for hot paths:

- N+1 queries.
- Unbounded loops.
- Synchronous heavy work in render.
- Missing indexes.
- Memory leaks (event listeners, subscriptions).

A perf concern is worth raising even if speculative. Better to discuss before merge than debug in production.

## When to escalate

Some PRs need more than one reviewer:

- Cross-team changes.
- Architectural decisions.
- High-risk areas.
- Security/compliance concerns.

Mark as "Request more reviewers"; assign specific people. Branch protection can require multiple approvals for certain paths.

## Asynchronous review etiquette

Most reviews happen async (not real-time). Norms:

- **Don't ping repeatedly.** One reminder after 24 hours is OK; more is harassment.
- **Block carve-out time.** "Code review hour" daily prevents reviews from being interruption-driven.
- **Set timezone expectations.** Across-timezone teams may need 24h+ turnaround.

## Pair-review sessions

For complex PRs (large refactor, architectural change), schedule a 30-min walk-through:

- Author shares screen.
- Walks through the change live.
- Reviewers ask questions in real time.

Saves async back-and-forth for complex stuff. Don't do this for routine PRs.

## Handling disagreement

Sometimes author and reviewer disagree on approach. Approaches:

**Discuss in the PR.** Often resolves once both sides explain reasoning.

**Pair on it.** 15-min call clarifies faster than 20 comment threads.

**Escalate to lead.** If the disagreement is substantive and stuck.

**Document the decision.** Whatever you decide, leave breadcrumbs (in code comment, in PR description, in design doc).

Bringing emotion into reviews — defensiveness, sarcasm, condescension — burns trust quickly. Lead with curiosity: "I'm thinking about it differently; help me understand X."

## What NOT to do in code review

- **Bike-shed naming.** Once it's clear; let it go.
- **Demand stylistic conformity.** Use a linter; don't review style manually.
- **Block on personal preference.** Distinguish "different" from "wrong."
- **Pile-on.** If three people commented the same thing, you don't need to add yours.
- **Vague comments.** "This feels off" without specifics is unhelpful.

## Linters and formatters

Automate the boring stuff:

- **Formatter** (Prettier, Black, gofmt): run on save / commit; no formatting in review.
- **Linter** (ESLint, ruff): catches common bugs and style issues.
- **Type checker** (TypeScript, mypy): catches type errors.
- **Pre-commit hooks** (Husky, pre-commit): block commits with lint errors.

When the machine catches it, humans don't have to. Frees review for substance.

## Conventional review labels

Some teams use Conventional Comments (conventionalcomments.org):

```
nit: prefer const here
issue (non-blocking): this might fail with empty input
suggestion: extract to helper
praise: nice use of generics
```

A standard vocabulary. Tools can parse it for metrics.

## Mistakes to avoid

- **Slow reviews.** Velocity dies.
- **Approve without reading.** Defeats the purpose.
- **Rubber-stamp culture.** "LGTM" without reading.
- **Hostile tone.** Drives engineers away.
- **No norms.** Reviews vary wildly by reviewer.

## Summary

- Code review catches bugs, shares knowledge, enforces quality.
- Use prefixes (nit:, blocking:, question:) for clarity.
- Approve with comments for minor issues; Request changes for substantive.
- Review tests with the same rigor as code.
- Automate style/lint/format; humans focus on substance.
- Pair on complex PRs; async for routine.
- Set norms; document them; enforce gently.

Next: branch protection and required checks.
