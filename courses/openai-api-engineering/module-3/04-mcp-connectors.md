---
module: 3
position: 4
title: "MCP and Connectors — the standard for tool ecosystems"
objective: "Use OpenAI's MCP support to plug into existing tool servers, and decide when to build your own MCP server."
estimated_minutes: 11
videos:
  - title: "OpenAI Developer Channel"
    url: "https://www.youtube.com/@OpenAI"
    source: "OpenAI"
---

# MCP and Connectors — the standard for tool ecosystems

## The puzzle

You build an agent with custom tools wired inline. It works.

Then you want the same tools available in:
- Claude
- Your internal AI assistant
- A new customer-facing agent
- Your team's various scripts

You re-implement them four times. Each time, you re-implement schemas, error handling, auth. The same Slack-search function exists in five different shapes across your codebase.

**MCP (Model Context Protocol)** is the standard that fixes this. Define a tool *once*, expose it via MCP, and any MCP-capable AI can call it. OpenAI supports MCP. Claude supports MCP. Most major agent frameworks do. This lesson covers when to use MCP and when not to.

## The simple version

MCP is a protocol for AI tool servers:

- A **tool server** exposes tools (and resources) over a standard interface.
- A **client** (OpenAI, Claude, your IDE, your agent framework) connects to the server and discovers what tools are available.
- The client invokes tools through the protocol; the server executes and returns results.

For OpenAI:

- The API supports MCP connectors directly. You point your agent at an MCP server (HTTP URL or other transport) and the tools become available.
- OpenAI also provides built-in "connectors" — pre-built MCP integrations to common services (GitHub, Slack, Linear, etc.).

When to reach for MCP:

- You're integrating with a service that already has an MCP server. Just connect — zero implementation cost.
- You're writing tools that multiple AIs will use. One MCP server feeds them all.
- You want a clean separation between tool implementation and agent code.

When to stick with inline tools:

- Single-use, agent-specific tools. The overhead of an MCP server isn't worth it.
- Tight latency requirements where the extra hop matters.
- Tools that need direct access to in-process state.

## The technical version

### Connecting to an existing MCP server

Most use cases start here: someone else already wrote the MCP server. You just connect.

In the Responses API or Agents SDK:

```python
agent = Agent(
    name="ResearchAgent",
    instructions="Use your tools to research the topic.",
    model="gpt-5-mini",
    mcp_servers=[
        {
            "type": "url",
            "url": "https://mcp.example.com/research",
            "auth": {"type": "bearer", "token": os.environ["RESEARCH_MCP_TOKEN"]}
        }
    ]
)
```

The SDK fetches the server's tool list, exposes them to the model, and routes tool calls through the protocol. You didn't define a single tool yourself.

Common public / first-party MCP servers worth knowing:

- GitHub MCP server — manipulate repos, PRs, issues.
- Slack MCP server — search/post messages.
- Filesystem MCP server — read/write files in a sandbox.
- Database MCP servers (Postgres, MongoDB, etc.).
- Notion / Linear / Asana — productivity tool integrations.

The ecosystem is growing fast. Before building a custom tool, check if an MCP server exists.

### Writing your own MCP server

When you have tools that multiple AIs should use:

A minimal MCP server (Python, hypothetical syntax for illustration):

```python
from mcp import Server, tool

server = Server("acme-tools")

@server.tool
def search_customers(query: str) -> list[dict]:
    """Searches the customer database."""
    return db.search(query)

@server.tool
def create_ticket(customer_id: str, subject: str, body: str) -> dict:
    """Creates a support ticket."""
    return tickets.create(customer_id, subject, body)

server.run()  # serves over HTTP / stdio / etc.
```

The server exposes:

- A list of available tools (with schemas).
- A way for clients to invoke them.

Any MCP-capable client can now connect — OpenAI agents, Claude, your IDE, your CI. Same tools, same auth, one place to maintain.

### Authentication

MCP servers typically support:

- **Bearer tokens** (simple, common).
- **OAuth** (for user-delegated access — e.g., "access this user's Slack").
- **API keys per call**.
- **Mutual TLS** (in higher-security environments).

When connecting from OpenAI agents, you pass credentials in the agent configuration. The model never sees them — credentials flow from your code, through the API, to the MCP server.

### Where MCP fits in the agent loop

Behaviorally, MCP tools look identical to inline tools from the model's perspective:

- The model sees tool names + schemas.
- It chooses to call them.
- Results come back.

The difference is in implementation:

- **Inline tool**: lives in your agent code; called via direct function call.
- **MCP tool**: lives in the MCP server; called via network protocol.

Latency differences are small (single-digit milliseconds for local MCP servers; modest for remote ones). Cost is identical from the OpenAI side.

### When MCP saves real work

Common patterns where MCP pays off:

**1. Cross-product reuse.** You build the same agent capabilities for internal AI + customer-facing AI + IDE assistants. MCP defines them once.

**2. Multi-team boundaries.** Different teams own different integrations. The "Slack team" owns the Slack MCP server; the "GitHub team" owns theirs. Agents consume; teams maintain.

**3. Plugin marketplaces.** If you want third parties to extend your AI product, MCP is the obvious plugin interface.

**4. Local-vs-cloud flexibility.** An MCP server can run locally (filesystem, IDE) or remotely (your prod APIs). Clients connect to either with the same protocol.

### When inline tools are simpler

For most single-product agents, MCP is overkill:

- One agent, used in one place.
- 10 or fewer tools.
- Tools tightly coupled to in-process state.
- No third-party plugin ambitions.

The Agents SDK's inline tool definition is shorter and faster to iterate on. Don't add an MCP server unless you're actually getting reuse benefit.

### Built-in connectors vs custom

OpenAI provides built-in "connectors" — pre-built MCP integrations to popular services. Enable them with a flag rather than running your own MCP server.

When a built-in connector covers your need (Google Drive, Slack, etc.), prefer it:

- Maintained by OpenAI.
- Already authenticated through your OpenAI account.
- Optimized for the model.

Build a custom MCP server only when the built-ins don't cover your need.

### MCP and security

Important things to know:

- **MCP servers expose tools to whoever can authenticate.** Treat them like APIs. Use proper auth, rate limiting, audit logging.
- **Tool descriptions are prompt content.** Don't put secrets in descriptions; the model sees them.
- **Limit each MCP server's scope.** A Slack MCP server shouldn't also have database admin tools. Separate by domain.
- **Be cautious with public MCP servers.** They run code on your behalf. Audit before connecting.

In agent context: an MCP connection is a trust boundary. Treat it the same way you'd treat exposing an internal API to a partner.

### The trajectory of MCP

MCP is a relatively new standard but adopting fast. Likely future:

- More vendors adding native MCP client support.
- More services publishing official MCP servers.
- Marketplaces / discovery mechanisms emerging.
- Possibly standardization through a foundation.

For now: use MCP when it saves work. Watch the space; the answer might shift as the ecosystem matures.

## An analogy: USB

Before USB, every device had its own connector — serial, parallel, PS/2, ADB. Manufacturers integrated each one separately. Users had a drawer full of cables.

USB unified peripherals around one connector. Now any USB device works with any USB host. Manufacturers ship to one standard.

MCP is doing the same for AI tools. Before MCP, every tool integration was bespoke. With MCP, tools speak one protocol and clients (OpenAI, Claude, etc.) speak the same one.

You don't need USB if you only have one device and one computer. Most products with multiple devices and multiple computers benefit. The transition takes years; we're early. The direction is clear.

## Three real-world scenarios

**Scenario 1: The four-times-implemented Slack search.**
A company had internal AI tools, a customer support agent, an IDE plugin, and a CRM extension — all of which needed Slack search. Four implementations, four sets of auth handling, four maintenance burdens. Migrating to a single Slack MCP server (which they wrote once) reduced four codebases' integration code to a single connection line. Future Slack changes touched one place.

**Scenario 2: The MCP that wasn't worth it.**
A small startup with one agent and ~6 tools built an MCP server "for future flexibility." Six months later, they had one consumer (their one agent) and the MCP layer was pure overhead. They moved the tools inline. Net code reduction; same functionality.

**Scenario 3: The third-party MCP that leaked.**
A team connected their agent to a popular community-maintained MCP server. The server's auth handling had a bug; tool calls leaked metadata to a third party. The team didn't catch it until a routine security review. Lesson: vet public MCP servers; treat them like any third-party dependency.

## Common mistakes to avoid

- **Building an MCP server for a one-off use case.** Inline tools are simpler when there's only one consumer.
- **Skipping MCP when you'd actually benefit from reuse.** If you're building the same tools twice, MCP is the standard.
- **Connecting to unaudited public MCP servers.** Same security stance as any third-party API.
- **Exposing too much in one server.** Separate by domain; minimize blast radius.
- **Putting secrets in tool descriptions.** They're prompt content. Use the auth mechanism instead.

## Read more

- [MCP and Connectors](https://platform.openai.com/docs/guides/tools-connectors-mcp) — OpenAI's MCP reference
- [Model Context Protocol spec](https://modelcontextprotocol.io) — the protocol itself

## Summary

- MCP is the cross-vendor standard for AI tool servers: define once, use from any MCP-capable client.
- OpenAI supports MCP natively in the Responses API and Agents SDK.
- Use MCP when tools are reused across multiple AIs/products. Use inline tools for single-product use cases.
- Built-in connectors are pre-made MCP integrations to popular services — prefer them when they fit.
- Apply standard security practices: auth, rate limiting, audit logging, scope boundaries.
- The ecosystem is early. Use MCP when it saves work today; watch how the standard evolves.

Next: guardrails and approvals — the safety patterns you need before going live.
