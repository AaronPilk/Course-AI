---
module: 5
position: 3
title: "Package managers: apt, dnf, brew, pacman"
objective: "Install, update, and remove software across distros."
estimated_minutes: 5
---

# Package managers: apt, dnf, brew, pacman

## Why distros differ

Each distribution has a package manager. Same goal: install software safely with dependencies. Different syntax, different package repos.

Knowing the basics of each is enough to be productive on any modern Linux + macOS.

## apt — Debian, Ubuntu, Pop, Mint

```
$ sudo apt update                    # refresh package lists
$ sudo apt upgrade                   # upgrade all
$ sudo apt install nginx             # install
$ sudo apt remove nginx              # remove (keep config)
$ sudo apt purge nginx               # remove (delete config too)
$ sudo apt autoremove                # clean up unused deps
$ apt search nginx                   # find packages
$ apt show nginx                     # show details
$ apt list --installed               # what's installed
```

Sources are in `/etc/apt/sources.list` and `/etc/apt/sources.list.d/`. PPAs (Personal Package Archives) for Ubuntu add third-party repos:

```
$ sudo add-apt-repository ppa:user/repo
$ sudo apt update
$ sudo apt install thing
```

## dnf / yum — Fedora, RHEL, CentOS

```
$ sudo dnf update                    # refresh + upgrade
$ sudo dnf install nginx
$ sudo dnf remove nginx
$ sudo dnf search nginx
$ sudo dnf info nginx
$ dnf list installed
```

Older RHEL/CentOS used `yum`; modern Fedora and RHEL 8+ use `dnf` (same usage). Repos live in `/etc/yum.repos.d/`.

## pacman — Arch, Manjaro

```
$ sudo pacman -Syu                   # sync + update all (S=sync, y=refresh, u=upgrade)
$ sudo pacman -S nginx               # install
$ sudo pacman -R nginx               # remove
$ sudo pacman -Rs nginx              # remove + unneeded deps
$ pacman -Ss nginx                   # search
$ pacman -Si nginx                   # info
$ pacman -Q                          # list installed
```

Arch's syntax is terse. For AUR (community packages): `yay -S package` (yay is a common AUR helper).

## zypper — openSUSE

```
$ sudo zypper refresh
$ sudo zypper update
$ sudo zypper install nginx
$ sudo zypper remove nginx
$ zypper search nginx
```

Similar to apt/dnf in spirit.

## brew — macOS (and Linux)

```
$ brew update
$ brew upgrade
$ brew install nginx
$ brew uninstall nginx
$ brew search nginx
$ brew info nginx
$ brew list
$ brew services start nginx          # start as macOS service
```

`brew` (Homebrew) is the de facto package manager on macOS. Works on Linux too (parallel to apt/dnf). Casks for GUI apps:

```
$ brew install --cask firefox
```

## Cross-distro abstraction — universal package formats

For developers, three formats hop across distros:

**Snap (Ubuntu, originally).** Self-contained, includes its own deps.

```
$ sudo snap install code --classic
$ snap list
```

**Flatpak (cross-distro).** Sandboxed apps.

```
$ flatpak install flathub org.example.App
```

**AppImage.** Single-file portable app — download and run.

These bypass system package managers; convenient for GUI apps but not for system services. The trade-off is bigger downloads and slight performance hits.

## Language-specific package managers

Each language ecosystem has its own:

- **Python:** `pip install package`, or `uv add package`, or `poetry add package`.
- **Node:** `npm install package`, `pnpm add package`, `yarn add package`.
- **Rust:** `cargo install crate`.
- **Go:** `go install package@latest`.
- **Ruby:** `gem install package`.

Don't confuse these with system package managers. They install into user/project scopes, not system-wide.

For Python especially: avoid `sudo pip install` — pollutes system Python. Use `pip install --user`, `pipx`, virtual environments, or `uv` for clean isolation.

## Searching the right repo

When something's not findable:

- **Different distro spelling.** `nodejs` vs `node`; `python3-pip` vs `pip`.
- **Not in default repos.** May need a PPA / COPR / community repo.
- **Compile from source.** Last resort; documented in software's README.

For exotic software, web search "install $thing on $distro" reliably finds the right repo + command.

## Holding versions

To prevent a package from upgrading:

```
$ sudo apt-mark hold nginx                # apt
$ sudo dnf versionlock add nginx          # dnf (needs versionlock plugin)
```

Useful when a newer version breaks something and you need time to fix it.

## Cleaning up

```
$ sudo apt autoremove                # remove unused deps
$ sudo apt clean                     # clear downloaded .deb cache
$ sudo dnf autoremove
$ sudo dnf clean all
$ sudo pacman -Rns $(pacman -Qtdq)   # remove orphans (Arch)
$ brew cleanup                       # clean Homebrew caches
```

Worth running monthly to reclaim disk.

## Updates and security

For unattended security upgrades on servers:

```
$ sudo apt install unattended-upgrades    # Ubuntu/Debian
$ sudo dpkg-reconfigure unattended-upgrades
```

Automatic application of security updates without manual intervention. Default-on for many cloud-provider images.

## Mistakes to avoid

- **Mixing system and language package managers for the same tool.** `apt install python3-pandas` AND `pip install pandas` — system has one version, your venv has another, confusion ensues.
- **`sudo pip install` globally.** Pollutes system Python; conflicts with apt-managed Python packages.
- **Skipping `apt update` before `apt install`.** Installs outdated versions; security risk.
- **Forgetting `--cask` for GUI apps on brew.** Brew tries to find a CLI tool of that name and errors.

## Summary

- `apt` for Debian/Ubuntu; `dnf` for Fedora/RHEL; `pacman` for Arch; `brew` for macOS.
- Common pattern: update → install / remove → autoremove cleanup.
- Each has search, show/info, list-installed commands.
- Language package managers (pip, npm, cargo, etc.) are separate; don't mix scopes.
- Snap/Flatpak/AppImage for cross-distro portability.
- `unattended-upgrades` for hands-off security patches on servers.

Next: network diagnostics — ss, dig, traceroute.
