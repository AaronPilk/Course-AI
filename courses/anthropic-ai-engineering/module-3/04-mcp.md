---
module: 3
position: 4
title: "MCP — Model Context Protocol in production"
objective: "Connect Claude to external systems via MCP servers instead of one-off integrations."
estimated_minutes: 10
---

# MCP — Model Context Protocol in production

## The puzzle

You want Claude to access your team's Notion, your Slack, your CRM, your S3 bucket, and your internal API. You can build five custom tool integrations. Then your colleague wants the same five — they build them again. Then someone wants the same five plus three more — and you're maintaining ten copies of essentially the same integration.

This is the problem MCP solves. **Model Context Protocol** is an open standard from Anthropic for exposing tools, resources, and prompts to LLMs in a uniform way. Build the integration once as an MCP server; any MCP-aware client (Claude Desktop, Claude in Cursor, your own app) can use it.

## The simple version

**MCP server** = a small process that exposes tools and data to AI clients. It speaks a standard JSON-RPC protocol over stdio or HTTP.

**MCP client** = the AI app (Claude Desktop, Claude in your IDE, your custom Claude agent) that connects to one or more servers.

**Standard primitives**:

- **Tools** — callable functions (like the tool use we covered in Lesson 3.1).
- **Resources** — read-only data the model can reference (files, records).
- **Prompts** — reusable prompt templates the user can invoke.

Build it once; ship it everywhere; reuse across apps and teammates.

## The technical version

### Why MCP and not "just tools"

Tool calling (Lesson 3.1) is the in-API primitive. MCP is the *deployment* primitive that sits on top: how you package, distribute, and reuse tools across applications.

Without MCP, every Claude-powered app has to implement integrations from scratch. With MCP, integrations live in standalone servers and any compliant client picks them up.

### Anatomy of an MCP server

A server exposes some combination of:

- **Tools** — same shape as Anthropic API tools: name, description, input_schema.
- **Resources** — URIs the model can read (file://, db://, anything you define).
- **Prompts** — named templates that can take arguments.

The MCP SDK does most of the protocol work. Your job is to register handlers and run the server.

### Minimal MCP server (Python)

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("acme-internal")

@mcp.tool()
def get_user_profile(user_id: str) -> dict:
    """Look up a user's profile by ID."""
    # your DB call here
    return db.fetch_user(user_id)

@mcp.tool()
def create_ticket(title: str, body: str, priority: str = "normal") -> dict:
    """File a support ticket. priority: low | normal | high."""
    return ticket_system.create(title=title, body=body, priority=priority)

if __name__ == "__main__":
    mcp.run()  # stdio by default
```

That's a working MCP server. Anyone configured to use it gets two new tools available to Claude.

### Connecting a client

Claude Desktop, Claude in Cursor, and other MCP-aware clients have a config file listing servers:

```json
{
  "mcpServers": {
    "acme": {
      "command": "python",
      "args": ["/path/to/acme_mcp.py"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-filesystem", "/Users/me/projects"]
    }
  }
}
```

The client launches each server as a subprocess, talks JSON-RPC over stdio, and surfaces the tools to the model.

### Connecting from your own Claude app

If you're building a Claude-powered app (not Claude Desktop), you can use the MCP client SDK to load tools from servers at startup and pass them to the Messages API:

```js
import { Client } from "@modelcontextprotocol/sdk/client";

const client = new Client({ name: "my-app", version: "1.0.0" });
await client.connect(transport);   // stdio or HTTP

const tools = (await client.listTools()).tools;

// Map MCP tools into Anthropic tool definitions
const anthropicTools = tools.map(t => ({
  name: t.name,
  description: t.description,
  input_schema: t.inputSchema
}));

// Now call Claude with these tools — and when Claude calls one, route to MCP
async function runTool(name, input) {
  const result = await client.callTool({ name, arguments: input });
  return result.content;
}
```

Your agent loop (Lesson 3.2) stays the same — `runTool` just becomes a passthrough to the MCP client.

### Resources vs. tools

Tools are *actions*. Resources are *data* the model can read.

A `resource` looks like:

```python
@mcp.resource("policies://refund")
def refund_policy() -> str:
    return open("refund_policy.md").read()

@mcp.resource("file://customers/{customer_id}/profile")
def customer_profile(customer_id: str) -> str:
    return json.dumps(db.fetch_user(customer_id))
```

Clients can list available resources and feed them to the model as context. The model doesn't *call* resources directly — the application decides which to include.

In practice, many integrations are easier as tools (Claude can request them on demand). Use resources when the data is always-relevant (e.g. user-specific docs) or large and you want client-side selection.

### Prompts as MCP primitives

Prompts are named templates with arguments. They surface in the client UI as slash commands or quick actions:

```python
@mcp.prompt()
def code_review(language: str, code: str) -> list:
    return [{
        "role": "user",
        "content": f"Review this {language} code for bugs and style issues:\n\n{code}"
    }]
```

A user types `/code_review` in their MCP-aware client, fills in `language` and `code`, and the prompt fires.

### Real MCP servers you can run today

A small selection from the [registry](https://modelcontextprotocol.io):

- **filesystem** — read/write files in a sandboxed directory.
- **github** — search repos, issues, PRs.
- **postgres** — query a database read-only.
- **brave-search** — web search.
- **slack** — read channels, post messages.
- **memory** — persistent memory across sessions.

Most are open source; you can fork and adapt. For internal tools, you build your own.

### Security on MCP servers

MCP servers run as full subprocesses with whatever permissions you grant them. A few non-negotiables:

- **Don't expose destructive operations without approval gates.** Same rule as raw tool use.
- **Scope filesystem access** — limit to specific directories.
- **Use read-only DB credentials** unless writes are intentional.
- **Audit log every tool call** — name, args, who invoked, when, result.
- **Never embed secrets in the server description** — tool descriptions are visible to the model.

Treat each MCP server like a service: with auth, with logs, with limits.

### When to build an MCP server vs. inline tools

- **Inline tools** (defined in the Messages API call) — for one-off tools specific to your app.
- **MCP server** — for tools you want to reuse across multiple Claude-powered apps, or share with teammates, or run from Claude Desktop.

If you're not sure, start inline. Promote to MCP when you find yourself copying the integration into a second app.

## Three real-world scenarios

**Scenario 1: The team that consolidated 10 integrations.**
A team had Slack, Notion, and GitHub integrations duplicated across three Claude apps. They consolidated each into MCP servers. All three apps point at the same servers. New apps inherit all integrations for free. Maintenance dropped to one location per integration.

**Scenario 2: The Claude Desktop workflow.**
An engineer added a custom MCP server exposing their company's internal API (issue tracker, deploy logs, runbook search) to Claude Desktop. They now ask Claude "what's the status of incident #123?" or "show me failed deploys this week" without leaving the desktop client. Adoption beat any in-house tool.

**Scenario 3: The MCP server that exposed too much.**
A team's MCP server exposed a `run_sql` tool that took arbitrary SQL. Within a week, the model had run `DROP TABLE users` based on a misinterpreted user request (caught by test environment). They restricted to a whitelist of safe queries and added an approval gate on writes. Lesson: MCP servers are real services; treat them like production code.

## Common mistakes to avoid

- **Treating MCP servers as scripts.** They're services. Auth, logs, limits.
- **No approval gates on destructive MCP tools.** Same risk as raw tool use, harder to audit because of indirection.
- **Embedding secrets in tool descriptions.** The model sees them.
- **Building MCP for a single-use integration.** Inline tools are simpler if you're not sharing.
- **Forgetting timeouts.** A hung MCP tool hangs your agent.

## Read more

- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP specification](https://modelcontextprotocol.io/specification)
- [MCP servers (registry)](https://github.com/modelcontextprotocol/servers)
- [Building MCP servers](https://modelcontextprotocol.io/quickstart/server)

## Summary

- **MCP** is the open protocol for exposing tools, resources, and prompts to LLMs in a uniform way.
- **MCP servers** are reusable integrations; **MCP clients** (Claude Desktop, your app) connect to many servers.
- **Three primitives**: tools (actions), resources (read-only data), prompts (templates).
- Use **inline tools** for one-off, **MCP servers** for reusable cross-app integrations.
- Treat MCP servers as production services: auth, logs, approval gates, timeouts.
- The ecosystem is growing fast — official servers for Slack, GitHub, Postgres, filesystem, and more are open source today.

That wraps Module 3. Next module: long context, RAG, and documents — including Anthropic's Contextual Retrieval upgrade.
