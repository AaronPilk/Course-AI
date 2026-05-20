---
module: 3
position: 3
title: "OS hardening: users, services, attack surface"
objective: "Reduce what attackers can do once they're on a box."
estimated_minutes: 6
---

# OS hardening: users, services, attack surface

## Why harden the OS

Even with perfect application security, a host is exposed: the OS itself runs services, has packages with their own vulnerabilities, has user accounts that can be compromised. Hardening means reducing the attack surface — fewer services running, tighter user permissions, faster patches.

For cloud VMs, container hosts, and bare-metal — same principles apply.

## User accounts

Principle of least privilege:

- Don't log in as root for daily work. Use a regular user; sudo for admin tasks.
- One user per human; one service account per service.
- Audit users periodically — remove accounts when people leave.

```
$ cat /etc/passwd                       # who has accounts
$ getent shadow username                 # password status
$ sudo passwd -l username                # lock an account
$ sudo userdel -r username               # delete + home dir
```

For SSH:

```
$ sudo nano /etc/ssh/sshd_config
PermitRootLogin no                        # root can't SSH
PasswordAuthentication no                 # keys only
AllowUsers aaron linus                    # explicit allowlist
```

Then restart sshd. Combined with key-based auth, this blocks the vast majority of SSH attacks (which assume password auth).

## Services — minimize what runs

```
$ systemctl list-units --type=service --state=running
```

Each running service is potential attack surface. Audit:

- Is this service needed?
- Is it bound to the right network interface (localhost vs 0.0.0.0)?
- Is it up-to-date?

Stop and disable unused:

```
$ sudo systemctl stop avahi-daemon
$ sudo systemctl disable avahi-daemon
```

For cloud-init images: many ship with services you don't need (Bluetooth, cups, avahi). Strip them for production VMs.

## Listening ports

```
$ sudo ss -tlnp
```

Every listening port → potential entry. Map each to a known service. Anything you didn't intend = problem.

Default-bind services to localhost (127.0.0.1) unless they explicitly need external access. Then a misconfigured firewall is one of two failures needed, not one.

## Sudo rules

`/etc/sudoers` (edit with `visudo`):

```
aaron ALL=(ALL) ALL                    # aaron can sudo to anything
deploy ALL=(www-data) /usr/bin/systemctl restart nginx    # deploy can only restart nginx as www-data
```

Granular sudo > blanket root. Service accounts that need a specific command shouldn't have full sudo.

For production systems: review sudoers periodically. Stale rules from old engineers, broad ALL=ALL grants — audit and tighten.

## SELinux / AppArmor

Mandatory Access Control adds another layer:

- **SELinux** (Red Hat / Fedora / CentOS). Policy-driven; complex.
- **AppArmor** (Debian / Ubuntu / SUSE). Profile-based; simpler.

Both confine processes to what they're explicitly allowed to do. A compromised process running as root in a tight SELinux profile can do less damage than the same process in permissive mode.

In practice: keep SELinux/AppArmor enabled (don't turn it off "to fix" a permission issue). Use vendor-provided profiles for common services. Custom profiles for custom apps.

## Patch management

OS patches address known vulnerabilities. Falling behind = exposure.

**Automated:**

```
$ sudo apt install unattended-upgrades       # Ubuntu/Debian
$ sudo dpkg-reconfigure unattended-upgrades
```

Automatically applies security patches. Default-on in many cloud images.

For production: stage in dev/staging first; promote to prod via CI/CD. Don't blindly auto-patch critical systems — test first.

Track CVEs:

- **CVE database** (cve.mitre.org).
- **Vendor security mailing lists** (Ubuntu security, Red Hat).
- **Tools:** Vuls, Lynis for periodic local audit.

## Logging and auditing

```
$ journalctl -u sshd -p err              # SSH errors (failed logins)
$ sudo cat /var/log/auth.log             # auth events
$ sudo grep "Failed password" /var/log/auth.log | wc -l
```

For deep audit, `auditd`:

```
$ sudo apt install auditd
$ sudo auditctl -w /etc/passwd -p wa        # alert on password file modifications
$ sudo ausearch -m USER_AUTH                # auth events
```

Ship logs to a SIEM (Splunk, Datadog, Elastic) so they're available after a breach (an attacker can clean local logs, harder to clean remote).

## Filesystem permissions

```
$ ls -la /etc/                          # who owns / can read
$ find / -perm -4000 2>/dev/null        # setuid binaries (escalation paths)
$ find / -perm -2 2>/dev/null            # world-writable
```

Setuid binaries are particularly dangerous — they run as their owner (often root), so bugs in them = privilege escalation. Audit them; remove what's not needed.

World-writable files in `/etc/` or shared dirs are escalation paths. Audit and tighten.

## Encrypted filesystem / disks

For laptops or servers with sensitive data:

- **LUKS** (Linux): full-disk encryption at boot.
- **FileVault** (macOS): same.
- **BitLocker** (Windows): same.

If a disk is stolen or improperly disposed of, encryption protects the data.

For cloud: enable EBS encryption (AWS), default-encrypted disks (GCP), Azure equivalents. Often free; default on for new accounts.

## Containers vs VMs — different hardening

**VMs:** harden the OS as above; HV provides isolation between VMs.

**Containers:** the host kernel is shared, so OS hardening matters on the host. Container-specific:

- Run as non-root inside the container.
- Read-only root filesystem when possible.
- Drop capabilities (CAP_NET_BIND_SERVICE, etc. — most apps don't need them).
- Use seccomp / AppArmor / SELinux container profiles.
- Don't mount the docker socket inside containers (massive escalation path).

Tools: `docker bench`, Trivy for container scanning, Falco for runtime detection.

## Mistakes to avoid

- **`chmod 777` everywhere.** Security hole.
- **Root logins enabled by default.** Disable.
- **Password SSH instead of keys.** Brute force eventually wins.
- **`SELinux=disabled` because "it broke something."** Fix the policy; don't disable the protection.
- **No patch management.** A known-vulnerable kernel running for months.
- **Mounting docker socket inside containers.** Lets the container break out and control the host.

## Summary

- Disable root SSH; password auth off; keys only.
- Minimize running services; bind to localhost unless external needed.
- Granular sudo; least privilege per user.
- Keep SELinux/AppArmor enabled.
- Automate security patches; test in staging first for prod.
- Audit setuid binaries, world-writable files, sudoers.
- Containers: non-root user, drop capabilities, never mount docker socket.

Next: supply chain risks.
