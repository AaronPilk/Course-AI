---
module: 5
position: 2
title: "Cloudflare Tunnel — internal services without public IPs"
objective: "Set up secure tunnels from on-prem or cloud to Cloudflare's edge."
estimated_minutes: 8
---

# Cloudflare Tunnel — internal services without public IPs

## The puzzle

You have an internal service. You want it accessible from the internet, securely, without:

- Opening firewall ports.
- Exposing a public IP.
- Maintaining a VPN.
- Configuring DDNS / dynamic DNS.

Cloudflare Tunnel is the answer. A daemon on your origin opens an outbound connection to Cloudflare; Cloudflare routes incoming traffic to it.

## The simple version

1. Install `cloudflared` on your origin server.
2. Create a tunnel (`cloudflared tunnel create my-tunnel`).
3. Route a DNS name to the tunnel.
4. Run `cloudflared tunnel run my-tunnel`.

Now `your-name.example.com` reaches your local service — through Cloudflare, with no inbound ports.

## The technical version

### Why it matters

Traditional inbound exposure:

```
Internet → public IP → firewall (port open) → service
```

Problems:

- Public IP can be attacked directly.
- Firewall rules to manage.
- NAT traversal for home / many cloud setups.
- ISP-blocked ports (residential ISPs block 80/443).

With Cloudflare Tunnel:

```
Service → cloudflared dials out → Cloudflare → user
```

Outbound only. Service can be behind NAT, on a residential network, on a laptop. As long as it can reach Cloudflare (outbound HTTPS), it works.

### Setup walkthrough

```bash
# 1. Install cloudflared (Mac, Linux, Windows, Docker, Helm, etc.)
brew install cloudflare/cloudflare/cloudflared

# 2. Authenticate with your Cloudflare account
cloudflared tunnel login
# Opens browser; select zone; downloads cert to ~/.cloudflared/

# 3. Create a tunnel
cloudflared tunnel create my-tunnel
# Tunnel ID: ab12cd34-...

# 4. Configure routes (DNS)
cloudflared tunnel route dns my-tunnel internal.example.com

# 5. Run the tunnel
cloudflared tunnel run my-tunnel
```

By default, the tunnel forwards traffic to `http://localhost:80`. Configure other targets in `~/.cloudflared/config.yml`:

```yaml
tunnel: ab12cd34-...
credentials-file: /root/.cloudflared/ab12cd34.json

ingress:
  - hostname: app.example.com
    service: http://localhost:3000
  - hostname: api.example.com
    service: http://localhost:8080
  - hostname: db-ui.example.com
    service: tcp://localhost:5432
  - service: http_status:404  # catch-all
```

Multiple hostnames, multiple services — one tunnel.

### Running as a service

For production, run `cloudflared` as a systemd service / Docker container / Kubernetes deployment:

```bash
# systemd
sudo cloudflared service install
sudo systemctl start cloudflared

# Docker
docker run -d --name cloudflared \
  -v ~/.cloudflared:/etc/cloudflared \
  cloudflare/cloudflared:latest tunnel run my-tunnel
```

Auto-restart, log management, monitoring — same as any service.

### Combining with Access

The full pattern: Tunnel + Access:

```yaml
# In tunnel config
ingress:
  - hostname: app.example.com
    service: http://localhost:3000
```

```
# In Access dashboard
Application: app.example.com
Identity provider: Google SSO
Policy: Allow users in engineering@company.com
```

Now `app.example.com` requires SSO; only authorized users pass through the tunnel.

### TCP and non-HTTP services

Tunnels support TCP for non-HTTP services:

```yaml
ingress:
  - hostname: ssh.example.com
    service: ssh://localhost:22
```

For SSH, users need to access via Cloudflare's `cloudflared access` client (or Cloudflare Access for SSH via Browser Rendering for browser-based SSH).

Same pattern works for databases (Postgres, MySQL), RDP, internal HTTP services with non-standard ports.

### High availability

For HA: run multiple `cloudflared` instances. Cloudflare load-balances across them automatically. If one goes down, others continue serving.

```bash
# On three different servers
cloudflared tunnel run my-tunnel
```

Same tunnel ID; each instance creates a connection; Cloudflare distributes.

### Network architecture

Many production deployments use tunnels for the entire stack:

- **Origin app** behind tunnel (no public IP).
- **Database** accessed via tunnel from authorized services.
- **Admin tools** behind tunnel + Access.
- **CI / monitoring** accessing internal services via tunnel.

The result: zero inbound ports. Origin servers have no public IPs. Attack surface from the internet: only Cloudflare.

### Monitoring

`cloudflared` logs connection status. Cloudflare dashboard shows tunnel health (connected, last seen, etc.).

For alerting: parse logs locally; send to your monitoring system. Or use Cloudflare's tunnel health webhooks (paid).

### Limits

Free tier:

- Unlimited tunnels per account.
- Unlimited bandwidth.
- Standard HTTP / TCP support.

Most teams never hit limits.

### Common patterns

- **Single dev machine** exposing a local service for testing.
- **Internal admin tools** for the team.
- **IoT devices** reporting back via outbound-only.
- **On-prem services** integrated with cloud apps.
- **CI runners** that need to be reachable.
- **Migrations** — gradually move services behind tunnels without touching firewall configs.

### When NOT to use tunnel

- **Public-facing high-traffic services**: regular A records pointing at origin work fine; tunnel adds a hop.
- **Latency-critical TCP services** where the extra hop matters.
- **Services that need to receive direct connections from non-Cloudflare networks**.

For 90%+ of internal-service use cases, tunnel is the right answer.

## Three real-world scenarios

**Scenario 1: The home lab access.**
A developer ran services on their home machine; wanted access from anywhere. ISP blocks port 80. Cloudflare Tunnel + free DNS = global access with zero firewall changes. Five minutes of setup.

**Scenario 2: The DB exposure incident avoided.**
A team needed remote DB access for a contractor. Old way: open Postgres port to the internet briefly. With tunnel + Access: tunnel the DB connection, gate via SSO, time-limited policy. No public exposure ever.

**Scenario 3: The cloud-to-on-prem.**
A team had services split between AWS and an on-prem data center. Used tunnels to bridge: on-prem services reachable from AWS workloads via Cloudflare. No VPN; no peering. Simple, secure, auditable.

## Common mistakes to avoid

- **Running tunnel without restarting on failure.** Use systemd / process supervisor.
- **One tunnel for everything.** Split by app for blast-radius limiting; easier rollout.
- **Forgetting Access on top.** Tunnel alone makes the service reachable; Access gates who reaches it.
- **No HA tunnels.** Single point of failure if the tunnel host goes down.
- **TCP tunnels exposed without auth.** Tunnel + Access is the pattern.

## Read more

- [Cloudflare Tunnel docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [cloudflared CLI](https://github.com/cloudflare/cloudflared)
- [Access + Tunnel](https://developers.cloudflare.com/cloudflare-one/applications/)

## Summary

- **Cloudflare Tunnel** = outbound connection from origin to Cloudflare; no public IP / inbound ports.
- `cloudflared` daemon dials out; routes specified in config.
- **Combine with Access** for identity-aware gating.
- **HA via multiple cloudflared instances** with the same tunnel.
- Supports HTTP, TCP, SSH, RDP, etc.
- **Free tier covers unlimited tunnels and bandwidth.**
- Replaces VPN for most internal-service access patterns.

Next: deployment patterns.
