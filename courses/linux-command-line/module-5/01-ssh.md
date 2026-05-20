---
module: 5
position: 1
title: "SSH: keys, config, jumping"
objective: "Connect to remote machines like a pro."
estimated_minutes: 6
---

# SSH: keys, config, jumping

## SSH basics

```
$ ssh user@host                    # connect
$ ssh user@host command            # run command and disconnect
$ ssh -p 2222 user@host            # custom port
$ ssh -v user@host                 # verbose (debug)
```

You're dropped into a shell on the remote machine. Exit with `exit` or Ctrl-D.

## Key-based auth

Passwords are slow and insecure. Use keys.

```
$ ssh-keygen -t ed25519 -C "your_email@example.com"
```

Default location: `~/.ssh/id_ed25519` (private) and `~/.ssh/id_ed25519.pub` (public). Use a passphrase for extra protection.

ed25519 keys are modern, small, fast. Older RSA keys still work but ed25519 is preferred.

Copy your public key to the server:

```
$ ssh-copy-id user@host
```

This appends to `~/.ssh/authorized_keys` on the server. Now `ssh user@host` doesn't ask for a password.

## ssh-agent

Don't enter your passphrase every connection. Run `ssh-agent` and add your key once:

```
$ eval "$(ssh-agent -s)"
$ ssh-add ~/.ssh/id_ed25519
```

Subsequent SSH connections use the agent automatically.

On macOS, add to `~/.ssh/config`:

```
Host *
    UseKeychain yes
    AddKeysToAgent yes
    IdentityFile ~/.ssh/id_ed25519
```

Keychain integration remembers your passphrase across reboots.

## ~/.ssh/config

The config file is where SSH ergonomics live. Example:

```
Host work
    HostName 203.0.113.50
    User aaron
    Port 2222
    IdentityFile ~/.ssh/work_key

Host bastion
    HostName bastion.example.com
    User aaron

Host internal-*
    ProxyJump bastion
    User aaron
```

Now:

- `ssh work` connects to 203.0.113.50:2222 as aaron with the work key.
- `ssh internal-db` connects through the bastion to internal-db (any host matching internal-*).

Aliases save typing; ProxyJump removes the need for nested ssh commands.

## ProxyJump — jumping through bastions

Common pattern: a bastion server gates access to internal hosts. Use `-J`:

```
$ ssh -J bastion.example.com internal-host
```

Or, in config:

```
Host internal-db
    HostName db.internal
    ProxyJump bastion.example.com
```

The bastion routes; you connect end-to-end to internal-db. All hops use SSH; the bastion never sees your private key (key auth happens at each hop independently).

## scp and rsync — copy files

```
$ scp local.txt user@host:/tmp/                # local → remote
$ scp user@host:/tmp/remote.txt ./             # remote → local
$ scp -r local_dir/ user@host:/tmp/            # recursive
```

`rsync` is smarter — resumable, only-changed-files:

```
$ rsync -av local_dir/ user@host:/tmp/dest/    # sync directory
$ rsync -av --delete local/ user@host:/dest/   # mirror (delete extras on remote)
$ rsync -azP local user@host:/dest             # compressed, with progress
```

For repeated transfers (development sync), rsync beats scp on every metric.

`-a` = archive (preserves perms, timestamps, symlinks); `-v` = verbose; `-z` = compress; `-P` = progress + partial.

## SSH tunneling — local port forwarding

Access a remote service as if it were local:

```
$ ssh -L 5432:localhost:5432 user@host
```

Now connecting to `localhost:5432` on your machine reaches port 5432 on the remote (loopback). Useful for tunneling databases through SSH:

```
$ psql -h localhost -p 5432 ...      # actually connects to remote postgres
```

In config:

```
Host db-tunnel
    HostName db.internal
    LocalForward 5432 localhost:5432
```

## Remote port forwarding

The reverse — expose a local service to the remote:

```
$ ssh -R 8080:localhost:3000 user@host
```

Now on the remote, port 8080 reaches port 3000 on your local machine. Useful for sharing a local dev server with someone on another network.

## SOCKS proxy via SSH

```
$ ssh -D 8080 user@host
```

Creates a SOCKS proxy on local port 8080 that routes through the SSH server. Configure your browser to use SOCKS5 localhost:8080 → all traffic exits via the remote host. Handy on restricted networks.

## Connection multiplexing

For lots of frequent connections, multiplex:

```
# ~/.ssh/config
Host *
    ControlMaster auto
    ControlPath ~/.ssh/cm-%r@%h:%p
    ControlPersist 10m
```

First connection opens a master; subsequent connections to the same host reuse it (instant). Persist 10 minutes after last connection closes.

Massive speedup for tooling that opens many SSH connections (Ansible, rsync loops, etc.).

## Key management hygiene

```
$ ls -l ~/.ssh
drwx------  aaron aaron .                  # 700
-rw-------  aaron aaron id_ed25519         # 600
-rw-r--r--  aaron aaron id_ed25519.pub     # 644
-rw-------  aaron aaron known_hosts        # 600
-rw-------  aaron aaron config             # 600
-rw-------  aaron aaron authorized_keys    # 600
```

SSH refuses to use private keys or config with lax permissions. If you see "Permissions too open," `chmod 600` the file.

For new machines:

```
$ ssh-keygen -t ed25519                    # generate
$ ssh-copy-id user@host                    # publish public key
$ ssh user@host                            # test passwordless
```

## Per-project keys

Use separate keys for personal vs work vs servers:

```
$ ssh-keygen -t ed25519 -f ~/.ssh/work_key
$ ssh-keygen -t ed25519 -f ~/.ssh/personal_key
```

Reference in config:

```
Host work-*
    IdentityFile ~/.ssh/work_key

Host personal-*
    IdentityFile ~/.ssh/personal_key
```

If a key is compromised, you can rotate without touching others.

## Known hosts and fingerprints

On first connection:

```
The authenticity of host 'host.example.com (1.2.3.4)' can't be established.
ED25519 key fingerprint is SHA256:abc123...
Are you sure you want to continue connecting (yes/no)?
```

This is SSH asking you to verify the server. The fingerprint should match the server's expected one (admin would publish, or you'd see it locally on the server). If you've never connected before, you have to trust it (TOFU — trust on first use).

The host's key is then stored in `~/.ssh/known_hosts`. Future connections verify against it.

If the key changes (server reinstall, key rotation, MITM attack), SSH refuses to connect. Update `~/.ssh/known_hosts` with `ssh-keygen -R hostname` after confirming the change is legitimate.

## Mistakes to avoid

- **Password auth in 2026.** Use keys.
- **Same key everywhere.** Compartmentalize per-purpose keys.
- **Weak keys.** RSA 2048 is the floor; ed25519 is the modern default.
- **Not using ~/.ssh/config.** Aliases save typing and embed correct settings.
- **Ignoring "key changed" warnings.** They occasionally mean MITM. Verify.

## Summary

- ed25519 keys; `ssh-keygen`, `ssh-copy-id`, ssh-agent for setup.
- `~/.ssh/config` for aliases, custom ports, and ProxyJump.
- scp / rsync for files; rsync is better.
- `-L`, `-R`, `-D` for port forwarding and SOCKS proxies.
- ControlMaster for connection multiplexing.
- chmod 600 keys + config; SSH enforces strict permissions.

Next: curl, wget, and HTTP in the shell.
