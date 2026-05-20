---
module: 2
position: 4
title: "Tool inventory and surface area"
objective: "Decide what the assistant can and can't touch — and why."
estimated_minutes: 8
---

# Tool inventory and surface area

## The puzzle

Two assistants can both have access to "Google Calendar." One only lists events. The other lists, creates, modifies, deletes, invites people, declines on user's behalf, and shares calendars.

Same connector. Wildly different surface area. The first is constrained and safe. The second is powerful and risky. Most assistant teams build the second and only afterward realize the surface area is too wide.

This lesson is about deliberate inventory: a clear list of what the assistant *can* and *can't* do, and why.

## The simple version

For every connector, list each action and classify:

- **What it does** (single sentence).
- **Reversibility** (read-only, idempotent, non-idempotent, destructive).
- **Trust level required** (level 1-5 from Lesson 1.1).
- **Approval gate** (none, opt-in, always).

Then audit: do you have *all* of these in v1? Probably not. Cut the surface area to match your scope.

## The technical version

### The inventory table

For each connector, build a table:

| Tool | What | Reversibility | Trust | Approval |
| --- | --- | --- | --- | --- |
| list_events | Read calendar events | Read-only | 2 | None |
| create_event | Create event (no invites) | Non-idempotent | 3 | Opt-in |
| invite_attendees | Add attendees to event | Non-idempotent | 4 | Always |
| decline_event | RSVP no on user's behalf | Reversible-ish | 4 | Always |
| delete_event | Delete event | Destructive | 5 | Always |

This makes design decisions visible. You can see exactly what surface area you've granted the assistant.

### Surface area is risk

Every tool in the inventory is risk surface. Each:

- Has a failure mode if called wrongly.
- Has eval needs.
- Has approval / audit needs.
- Adds tokens to the prompt on every call (the tool definition lives in input).

Wider surface = more eval cases, more failure modes, slower response (more tools in the prompt), higher cost. Cut aggressively.

### Cut the inventory hard for v1

For v1, you almost certainly don't need everything. Start with:

- **Read-heavy**: lots of read tools (list, search, get).
- **Write-light**: only the writes essential for the JTBD.
- **No destructive in v1**: deletes can come later with approval.

Examples:

- Calendar assistant v1: `list_events`, `find_free_time`. No creates yet. Once users like the read features, add `propose_event` (drafts, no commit). Eventually `create_event` with approval.
- Email assistant v1: `list_inbox`, `search_emails`, `summarize_thread`. No drafts yet. Once trusted, add `draft_reply`. Eventually `send_reply` with approval.

Trust ramps; surface area expands; you keep control.

### Surface area vs. value

The temptation: "more tools = more value." Not true.

A 5-tool assistant with great UX is more valuable than a 25-tool assistant where users don't trust any of them. Each tool you add has to earn its place on the trust budget (Lesson 1.3).

### Multi-account surface area

If your assistant supports multiple accounts (work Gmail + personal Gmail), each account multiplies the surface area:

- Tools must be scoped per account.
- The assistant must know which account to use.
- The user must be able to set defaults.

Multi-account is real work; v1 should usually be single-account.

### Internal tools

Beyond external connectors, internal tools matter:

- **User profile / preferences**: read and update.
- **Memory / notes**: write durable notes about the user.
- **Scheduled task management**: create / pause / disable schedules.
- **Approval queue**: enqueue approval requests.

These are tools just like Gmail or Calendar. Inventory them too. Often forgotten in the design phase.

### Tool versioning

Tools evolve over time. Plan for it:

- **Add a `tool_version` field** in your inventory.
- **Eval against tool version** so changes are intentional.
- **Deprecate slowly** if a tool is replaced — give the assistant time to learn the new name.

A tool rename can subtly break agent behavior; treat it like an API breaking change.

### Documentation

For each tool in your inventory, document:

- The user-facing description ("Your assistant can: list your calendar events").
- The internal description (what the LLM sees in the tool def).
- The implementation (the actual function).
- The eval cases.
- The known failure modes.

This becomes onboarding material for new engineers and the basis for permission UIs the user sees.

## Three real-world scenarios

**Scenario 1: The surface-area cut.**
A team's v1 had 28 tools across 6 connectors. Pre-launch review trimmed to 14. Of the 14 deleted, 10 had never been actually needed for the v1 JTBD — they were "while we're at it" additions. Launch went smoother because there was less to test, less surface to defend.

**Scenario 2: The destructive-tool incident.**
An assistant had `delete_event` in v1 with an approval gate. A bug in the approval flow let a delete go through without approval. Calendar event vanished. Even with single-incident damage, the user lost trust. They removed `delete_event` from v1 entirely; will reintroduce in a later phase with stronger audit.

**Scenario 3: The multi-account oversight.**
A team's v1 supported one Google account per user. v2 added "connect a second account." But tools weren't scoped per account — actions sometimes used the wrong one. They reworked the tool layer to require an `account_id` parameter on every relevant tool. Multi-account is more design work than expected.

## Common mistakes to avoid

- **No explicit inventory.** Surface area drifts; nobody knows the full set.
- **Including destructive tools in v1.** Even with approval, bugs happen — start without.
- **One tool that does many things.** Wide tools = bigger blast radius per call.
- **Forgetting internal tools.** Memory and scheduling tools are first-class.
- **No versioning plan.** Renames break behavior subtly.
- **No user-facing permission surface.** Users can't see what the assistant can do.

## Read more

- [Anthropic — tool use overview](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
- [OAuth scope best practices](https://developers.google.com/identity/protocols/oauth2/policies#permissions)

## Summary

- **Build an inventory table** for every connector: tool, what, reversibility, trust required, approval.
- **Cut surface area hard for v1**: read-heavy, write-light, no destructive.
- **Expand surface area with trust** — each new tool earns its place.
- **Multi-account multiplies** the surface; default single-account in v1.
- **Internal tools** (memory, scheduling, approvals) are first-class — include them.
- **Document each tool** for engineering AND user-facing permission UIs.

That wraps Module 2. Next module: scheduled and background tasks.
