---
module: 2
position: 2
title: "MCP for assistants — your tool ecosystem"
objective: "Use Model Context Protocol to standardize tool access."
estimated_minutes: 9
---

# MCP for assistants — your tool ecosystem

## The puzzle

Your assistant needs 8 tools. You build 8 custom integrations. The next assistant needs 10 tools, 6 of which are the same as the first. You build them again. The third assistant team in your company builds 12 of the same things.

This is what **MCP (Model Context Protocol)** solves. Build a tool once as an MCP server; any MCP-aware assistant uses it. The connectors stop being per-product.

## The simple version

- **MCP server**: a standalone process exposing tools (and optionally resources, prompts) over a standard protocol.
- **MCP client**: your assistant. Connects to one or more MCP servers; lists their tools; calls them on demand.

Build integrations as MCP servers. Reuse across products. Use community servers where they exist (filesystem, GitHub, Postgres, Slack, etc.).

## The technical version

### Why MCP for assistants specifically

Assistants benefit more than agents from MCP because they typically have:

- **More tools** (across calendar, email, docs, code, chat).
- **Longer lifespans** (built once, used for years).
- **Multiple deployment surfaces** (desktop, web, mobile).
- **Shared organizational integrations** (everyone connects to the same Notion, GitHub, Slack).

MCP turns tool integrations from per-product code into shared infrastructure.

### A minimal MCP server

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("calendar-mcp")

@mcp.tool()
def list_events(start: str, end: str, max_results: int = 50) -> list[dict]:
    """List calendar events between two ISO dates."""
    tokens = get_user_tokens()  # from your auth system
    return google_calendar.events.list(
        auth=tokens.access_token,
        timeMin=start,
        timeMax=end,
        maxResults=max_results
    )

@mcp.tool()
def create_event(title: str, start: str, end: str, attendees: list[str]) -> dict:
    """Create a calendar event."""
    # ... implementation
    pass

if __name__ == "__main__":
    mcp.run()
```

Runs as a subprocess. Standard input/output protocol. Your assistant connects, lists tools, calls them.

### Client integration

```js
import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";

const transport = new StdioClientTransport({
  command: "python",
  args: ["calendar_mcp.py"]
});

const client = new Client({ name: "my-assistant", version: "1.0.0" });
await client.connect(transport);

const tools = (await client.listTools()).tools;

// Pass these to your LLM as available tools
// When the LLM calls one, route to MCP
async function runTool(name, args) {
  const result = await client.callTool({ name, arguments: args });
  return result.content;
}
```

The agent loop (covered earlier in the catalog) stays the same — `runTool` becomes a thin passthrough to MCP.

### Resources — read-only data

MCP also supports resources: read-only data the LLM can reference. Example:

```python
@mcp.resource("calendar://today")
def todays_events() -> str:
    events = google_calendar.events.list(timeMin=today_start, timeMax=today_end)
    return json.dumps(events.items)
```

The assistant can ask for `calendar://today` as context without making a tool call. Useful for predictable always-relevant data.

In practice, most assistant integrations use tools (the LLM decides when to fetch); resources are used when the data is universally relevant per session.

### Prompts — reusable templates

MCP servers can also expose prompts — named templates with arguments:

```python
@mcp.prompt()
def daily_brief(date: str = "today") -> list[dict]:
    return [{
        "role": "user",
        "content": f"Generate a brief for {date} from my calendar, recent emails, and task tracker."
    }]
```

Users invoke `/daily-brief` in MCP-aware clients; the assistant runs the named prompt. Powerful for product-defined workflows.

### When to build vs. use community servers

The MCP ecosystem has growing community servers: filesystem, GitHub, Postgres, Slack, Brave search, Notion, Linear, and many more.

**Use community servers** for:

- Standard integrations where you have no special logic.
- Quick prototyping.
- Internal tools where reusability matters more than fine-grained customization.

**Build your own MCP server** when:

- Custom business logic is needed.
- You need specific tool descriptions tailored to your product.
- You need auth flows your community server doesn't handle.
- You need fine-grained scoping per user/role.

### Security considerations

MCP servers run as processes. Treat them as production services:

- **Auth**: server-side enforcement of who can call what.
- **Logging**: every tool call logged with user, args, result.
- **Sandboxing**: don't run untrusted MCP servers with full system access.
- **Versioning**: pin server versions; don't auto-update.

The shift to MCP makes integrations reusable but also widens the attack surface if you connect to community servers without review. Audit before trusting.

### Multi-MCP composition

A single assistant can connect to multiple MCP servers — your custom one, plus filesystem, plus GitHub, plus Slack. All show up as a unified tool set to the model.

```
Client connects to:
  - calendar-mcp (your custom server)
  - filesystem-mcp (official)
  - github-mcp (official)
  - slack-mcp (official)

Tools available to assistant:
  - list_events, create_event (calendar)
  - read_file, write_file (filesystem)
  - search_repos, create_issue (github)
  - list_channels, send_message (slack)
```

You get composability without building everything. Standard primitives across many tools.

### The future of MCP

As of writing (early 2026), MCP is rapidly becoming the standard. Anthropic, OpenAI, and most agent frameworks have MCP support. Expect:

- More official MCP servers from major providers.
- Better governance and auth standards.
- Marketplaces of community-built MCP servers.
- Tighter integration with desktop assistants (Claude Desktop, ChatGPT Desktop, etc.).

For new assistants, MCP-first is now the recommended pattern unless you have specific reasons to do custom integrations.

## Three real-world scenarios

**Scenario 1: The team that saved months.**
A team building an internal assistant standardized on MCP for all integrations. Used 4 community MCP servers (Slack, GitHub, filesystem, Postgres) plus 2 custom ones for proprietary tools. Built in weeks instead of months because the standard integrations were ready.

**Scenario 2: The unsandboxed community server.**
A team connected to a community MCP filesystem server with broad scope. A prompt injection later let an attacker exfiltrate sensitive files. They added a sandboxed wrapper that limited filesystem scope; reviewed all community servers before connecting. Lesson: MCP doesn't bypass the safety patterns from earlier — it just standardizes the integration layer.

**Scenario 3: The MCP-first refactor.**
A team had 12 custom tool integrations. As they built their second assistant product, they refactored each into an MCP server. Six months later, both products use the same integrations; the next product gets them for free. Maintenance happens in one place.

## Common mistakes to avoid

- **Custom integrations for everything.** Building what already exists wastes weeks.
- **Trusting community MCP servers without review.** Audit before connecting.
- **Treating MCP as security.** It's an integration standard; safety still requires the patterns from earlier modules.
- **Single-server lock-in.** Compose multiple servers per assistant for flexibility.
- **Not versioning.** Pin MCP server versions in production.

## Read more

- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP server registry](https://github.com/modelcontextprotocol/servers)
- [Anthropic on MCP](https://www.anthropic.com/news/model-context-protocol)

## Summary

- **MCP** standardizes tool/resource/prompt integration so the same connector works across many assistants.
- **MCP servers** are reusable; **MCP clients** are your assistants composing many servers.
- **Use community servers** for standard integrations; **build your own** for custom logic.
- **Security still applies**: sandbox untrusted servers, audit before connecting, pin versions.
- **Multi-server composition** is the production pattern: 2-3 community + 1-2 custom is typical for a v1 assistant.
- **MCP-first** is the recommended starting point for new assistants in 2026.

Next: OAuth and permission scoping in practice.
