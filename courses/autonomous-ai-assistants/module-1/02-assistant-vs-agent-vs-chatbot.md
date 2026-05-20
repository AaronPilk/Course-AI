---
module: 1
position: 2
title: "Assistant vs. agent vs. chatbot — naming things clearly"
objective: "Distinguish the three patterns and what users expect from each."
estimated_minutes: 8
---

# Assistant vs. agent vs. chatbot — naming things clearly

## The puzzle

Three words get used interchangeably: **chatbot**, **agent**, **assistant**. They mean different things to users, set different expectations, and demand different engineering.

Calling your chatbot an "AI assistant" doesn't make it an assistant. Calling your agent a "chatbot" undersells it. Naming matters because it shapes what users expect — and unmet expectations are the fastest path to churn.

## The simple version

- **Chatbot**: synchronous Q&A in a chat surface. User talks; bot replies. Lives in the conversation.
- **Agent**: a model that takes actions across tools to complete a task, usually triggered by a user request. Lives in a workflow.
- **Assistant**: a model that maintains an ongoing relationship with a user across sessions, holding context, taking initiative within trust boundaries. Lives in the user's day.

Most products called "AI assistants" are actually agents. Most products called "agents" are actually chatbots. Use the word that matches reality.

## The technical version

### Chatbot — defining traits

- **Conversation as the surface**.
- **Stateless or short-lived state**.
- **Reactive**: only responds when prompted.
- **No tools or limited tools** that don't affect external state.
- Examples: FAQ bots, basic customer support, vanilla ChatGPT.

User expectation: "I ask something; I get an answer; we move on."

### Agent — defining traits

- **Task-oriented**: a goal to complete.
- **Multi-step**: loops through tools to get there.
- **Bounded scope**: works on one task at a time, then stops.
- **Tool-heavy**: the value is what it can do, not what it can say.
- Examples: customer support agents with refund tools, dev agents that edit code, research agents.

User expectation: "I give you a task; you complete it; you tell me when you're done."

### Assistant — defining traits

- **Persistent relationship** across sessions.
- **Long-term memory** of the user.
- **Initiative**: proactively surfaces work.
- **Cross-tool**: touches calendar, email, docs, code in coordinated ways.
- **Schedule and event-aware**: runs on time, reacts to triggers.
- Examples: aspirational executive assistants, personal AI like the early autonomous products.

User expectation: "You know me. You work on my behalf. You surface what matters when it matters."

### Comparison table

| Trait | Chatbot | Agent | Assistant |
| --- | --- | --- | --- |
| Reactive vs proactive | Reactive | Reactive | Proactive |
| State | Short | Per task | Long-term |
| Surface | Chat | Workflow | User's day |
| Trigger | User msg | User task | Schedule + events + user |
| Memory | None / short | Per task | Persistent |
| Tools | Limited | Many, task-scoped | Many, life-scoped |

### Why naming matters

User expectations shape product behavior. Call a thing a "chatbot" and users expect synchronous Q&A; if it's also auto-emailing their boss, that's a violation. Call it an "assistant" and users expect it to remember them; if it greets them like a stranger, that's a violation.

Pick the word; meet the expectation; ship.

### Why most "AI assistants" are agents

Many products marketed as "assistants" are really agents:

- Triggered only by user requests.
- No long-term memory.
- No schedule or events.
- No cross-tool initiative.

That's an agent. Calling it an assistant promises something it doesn't deliver. Users feel sold something they didn't get.

Reset by either:

- **Add assistant traits**: memory, schedule, initiative. Become what you named yourself.
- **Rename to "agent"**: match the actual capability.

### When chatbot is the right product

Many B2C and B2B products don't need an assistant. A great chatbot is enough:

- Customer support that answers most questions and escalates the rest.
- Knowledge product that answers questions from a corpus.
- Learning tool that explains concepts.

Don't oversell. A great chatbot delivers value; a mediocre "assistant" disappoints.

### When agent is the right product

Agents win when the task is well-bounded and benefits from multi-step automation:

- Process a single document end-to-end.
- Research a single topic deeply.
- Refactor a specific code section.
- Onboard a single user.

The agent runs, completes, done. No persistent relationship needed.

### When assistant is the right product

Assistants are for ongoing relationships with users where the value compounds over time:

- Daily executive support across calendar/email/docs.
- Long-term coaching with memory of past sessions.
- Background operators (level 4-5 from Lesson 1.1) for specific domains.

This is the highest bar. Requires real connectors, memory, scheduled tasks, approval flows, trust building. Most teams underestimate the work; ship as agent first; promote to assistant when the foundation is real.

### Hybrid products

Many products combine modes:

- A chatbot surface (level 1-2) that *also* offers scheduled tasks (level 4).
- An agent for specific workflows (level 3) inside an assistant product (level 4-5 across the rest).

Each mode should be clearly labeled in the UX so users know what to expect. Don't mix freely without indication.

## Three real-world scenarios

**Scenario 1: The marketing-led mislabel.**
A team built a great support chatbot and marketed it as "your AI assistant." Users tried to schedule meetings with it, asked it to remember preferences, expected proactive reach-outs. Each unmet expectation eroded trust. They renamed to "AI support agent" and adoption stabilized.

**Scenario 2: The under-named agent.**
A team built a powerful code agent (level 3, multi-step, modifies your codebase) but called it a "chat assistant." Developers thought it was a code Q&A bot, didn't realize it could actually do the work. After renaming to "agent mode," activation rates jumped.

**Scenario 3: The slow build to assistant.**
A team started with a chatbot (great support Q&A), added agent mode (multi-step automation for specific tasks), then layered assistant features (memory, scheduled briefings, opt-in background actions). Each layer expanded value without breaking earlier promises. Two years in, the product is a real assistant — but it earned each level.

## Common mistakes to avoid

- **Calling everything an "AI agent"** because it's the trending word.
- **Marketing "assistant" when the product is an agent.** Users feel oversold.
- **Mixing modes silently** in the same product. Users confused, trust degrades.
- **Skipping the chatbot/agent layers** trying to launch as an assistant. Foundation isn't there.
- **Hiding the mode** users are in. Always clear: "chatting with the assistant" vs "running an agent task."

## Read more

- [Anthropic — building effective agents](https://docs.anthropic.com/en/docs/agents-and-tools/building-effective-agents)
- [OpenAI Agents SDK](https://platform.openai.com/docs/guides/agents)
- [The AI Engineer's Guide to AI Assistants](https://www.anthropic.com/engineering) (Anthropic engineering blog)

## Summary

- **Chatbot** = reactive Q&A in a chat surface.
- **Agent** = task-oriented multi-step actor; runs, completes, done.
- **Assistant** = persistent relationship with memory, schedule, and initiative.
- Use the word that **matches reality** — not the trendy one.
- **Most "AI assistants" are agents.** That's fine — name accurately.
- **Hybrid products are fine** if each mode is clearly labeled in UX.

Next: the trust budget — what users will let an assistant do.
