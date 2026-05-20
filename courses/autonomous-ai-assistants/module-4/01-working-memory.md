---
module: 4
position: 1
title: "Working memory across sessions"
objective: "Carry context from one interaction to the next without re-asking."
estimated_minutes: 8
---

# Working memory across sessions

## The puzzle

A user opens the assistant Monday: "Help me draft this email to Sarah." Assistant does it. Tuesday: "Same kind of email, different person." The assistant should already know your tone preferences, your relationship with Sarah, the kind of email it drafted yesterday — but most assistants greet the user like strangers.

Working memory is what makes an assistant feel like it knows you. It's a layer between session-level history and long-term identity — what the assistant remembers from the last few interactions that's still relevant now.

## The simple version

Working memory is the "recent past" of the assistant-user relationship:

1. **Recent sessions** — last few conversations summarized.
2. **Active tasks** — things in flight ("you said you'd review the deck by Friday").
3. **Stated preferences** — things the user told the assistant recently ("I'm using they/them pronouns this week").
4. **Recent decisions** — choices made together ("we decided to go with the lower-priced vendor").

Load this at session start, intuit when to update it, expire it gracefully.

## The technical version

### Working memory vs. long-term memory

Different layers:

- **Conversation history**: the current session.
- **Working memory**: last few sessions; active tasks; recent preferences. Usually rolling window of days-to-weeks.
- **Long-term memory**: durable user profile, episodic memories tagged by topic, lessons learned (covered in next lesson).

Working memory is the bridge. It's what makes Tuesday's session feel like a continuation of Monday's, not a fresh start.

### What to put in working memory

- **Active task state**: things the assistant or user committed to do (with deadlines).
- **Recent session summaries** (last 5-10 sessions, 1-3 lines each).
- **Recent stated preferences** (within last 30 days; longer = long-term).
- **Recent named entities** (people, projects, accounts mentioned).
- **Recent decisions** (choices made or proposed).

What NOT to put in working memory:

- Full conversation text (too big; goes in conversation history or summarized to long-term).
- Stale preferences (more than ~30 days old; promote to long-term or expire).
- Inferred but unverified facts (push to long-term with low confidence).

### Loading working memory at session start

When the user opens the assistant:

```
[load user profile from long-term]
[load working memory: last 5 session summaries, active tasks, recent prefs]
[inject into system prompt as context]
```

The assistant starts the conversation already oriented. No "what was I working on" recap from the user.

### Format in the system prompt

```
Active tasks:
- Review deck for Q4 plan (due Friday)
- Follow up with Acme Co. (no deadline)

Recent sessions:
- 3 days ago: drafted intro email to Sarah Chen at FitTrack
- 1 day ago: prepped questions for tomorrow's product review

Recent preferences:
- Tone: friendly but concise; no exclamation marks
- Pronouns: they/them
```

Compact, structured, immediately usable.

### Updating working memory

Update points:

- **End of session**: summarize what happened in 1-3 lines; add to working memory ring buffer.
- **Decisions made**: explicitly capture ("we decided X").
- **Stated preferences**: capture and tag with date.
- **Task created or resolved**: track lifecycle.

Don't update every turn. Discrete events. Otherwise memory becomes noise.

### Expiration

Working memory should age out:

- Session summaries: keep last 5-10; older ones either promote to long-term episodic memory or drop.
- Tasks: drop when resolved (or move to history).
- Preferences: after 30+ days, prompt for confirmation or promote to long-term.
- Decisions: same as preferences.

Without expiration, working memory becomes long-term memory by accident. Keep the boundary sharp.

### The "what did we talk about?" pattern

A common assistant interaction: user opens, doesn't quite remember where they left off. The assistant offers:

```
Welcome back. Want to continue any of these?
- Reviewing the Q4 deck (you mentioned Friday)
- Following up with Acme Co.
- Or something new?
```

That's working memory surfacing as UX. Powerful when done well.

### Conflicts with the active session

What if the user says something this session that contradicts working memory?

- "Use formal tone" (this session) vs. "casual" (recent preference). Honor this session; ask if the preference should update.
- "Cancel that task" while working memory still tracks it. Mark resolved; surface "noted."

Treat the active session as authoritative; sync working memory to match.

### Privacy

Working memory is user-specific data. Treat it accordingly:

- Encrypt at rest.
- Scope strictly per user.
- Let users see and edit ("here's what I remember about you recently").
- Auto-delete if the user disconnects or deletes their account.

A "what I remember" UI is the user's way to keep memory accurate. It's not optional in trust-sensitive assistants.

## Three real-world scenarios

**Scenario 1: The continuity win.**
A team's assistant loaded last 5 session summaries on open. Users felt the assistant "knew" them; session-to-session feel was continuous. Engagement metrics rose. No new features — just better continuity.

**Scenario 2: The stale preference.**
The user said "I'm out of office this week" once. Working memory carried it for 2 months. Assistant kept signing off "enjoy your time off!" months later. They added explicit expiration on temporal preferences (1-2 weeks). Fixed.

**Scenario 3: The unwanted recall.**
User opened the assistant and saw "Want to continue: [embarrassing past topic]?" right at the top. Felt invasive. They added user controls: "hide this session," "don't surface this in continuation suggestions." Trust restored.

## Common mistakes to avoid

- **No working memory** — every session feels like the first.
- **Working memory that never expires** — stale facts mislead the assistant.
- **No user controls** — users can't curate their memory.
- **Continuation prompts surfacing private/embarrassing topics**.
- **Cross-user leak of working memory** — major privacy incident.

## Read more

- [Anthropic — long context use cases](https://docs.anthropic.com/en/docs/about-claude/use-cases/long-context)
- [OpenAI memory in ChatGPT](https://help.openai.com/en/articles/8590148-memory-faq)

## Summary

- **Working memory** = recent past of the user-assistant relationship.
- Includes **active tasks, session summaries, recent preferences, recent decisions, recent entities**.
- **Load at session start**; **update on discrete events**, not every turn.
- **Expire gracefully**: temporal prefs (1-2 weeks), older sessions (drop or promote to long-term).
- **Show users what's stored**; let them edit and delete.
- **Continuation UX** ("welcome back, want to continue X?") is one of the highest-value working-memory features.

Next: long-term memory and personalization.
