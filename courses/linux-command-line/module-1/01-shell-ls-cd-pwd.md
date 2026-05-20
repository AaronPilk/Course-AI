---
module: 1
position: 1
title: "The shell, your home, and ls/cd/pwd"
objective: "Open a terminal and move around with confidence."
estimated_minutes: 6
---

# The shell, your home, and ls/cd/pwd

## What is the shell

The shell is a program that reads what you type, runs it, shows you the result. The default on most modern Linux distros is `bash`; macOS shipped `zsh` by default since 2019; many devs use `fish` for ergonomics. They all share the same basic ideas.

When you open a terminal, the shell is the program inside it taking input. Everything you type is either:

- A built-in shell command (`cd`, `export`).
- The name of a program to run (`ls`, `grep`, `python`).
- An alias or function you defined.

Knowing which is which is occasionally useful; mostly you just type.

## Your home directory

When you log in, the shell drops you into your home directory:

```
/home/yourname     # Linux
/Users/yourname    # macOS
```

This is "where you live." Configs, your personal files, anything you've installed for yourself.

Shortcut: `~` refers to your home directory. So `~/Documents` means `/home/yourname/Documents`.

## The prompt

What you see before each command. A typical Linux prompt:

```
yourname@hostname:~/projects$
```

- `yourname` — your username.
- `hostname` — your machine.
- `~/projects` — current working directory.
- `$` — you're a regular user. `#` means root.

You can customize this (`PS1` variable); for now, just know what you're reading.

## pwd — where am I?

```
$ pwd
/home/yourname/projects
```

`pwd` = "print working directory." Always tells you exactly where you are. Useful when you've lost track.

## ls — list contents

The most-used Unix command. Shows files in the current directory.

```
$ ls
README.md  src  test  package.json
```

Common flags:

```
$ ls -l           # long format (permissions, size, date)
$ ls -a           # all (including hidden files starting with .)
$ ls -la          # both
$ ls -lh          # human-readable sizes (KB, MB, not bytes)
$ ls -lt          # sort by modification time
$ ls -lS          # sort by size
$ ls -R           # recursive
```

`ls -la` is the standard "show me everything detailed."

## cd — change directory

```
$ cd projects               # go into ./projects
$ cd /var/log               # absolute path
$ cd ..                     # go up one level
$ cd ../sibling             # up then over
$ cd ~                      # home directory
$ cd ~/Documents            # home/Documents
$ cd -                      # back to previous directory
```

`cd -` is gold. Use it when you bounce between two directories.

## Absolute vs relative paths

**Absolute** — starts with `/`. Always points to the same place regardless of where you are.

```
/var/log/syslog
/home/yourname/.bashrc
```

**Relative** — based on current directory.

```
src/main.py        # ./src/main.py
../parent_file.txt
```

Both work; choose whichever is shorter for the task at hand.

## Hidden files

Files starting with `.` are hidden by default. Configuration files almost always do:

```
.bashrc
.vimrc
.git/
.env
```

`ls -a` shows them.

## Tab completion

The most important shortcut. Type a partial name and hit Tab — the shell completes it:

```
$ cd Doc<TAB>
$ cd Documents/
```

Hit Tab twice to see all options when there's ambiguity:

```
$ ls /usr/bin/py<TAB><TAB>
python3   python3.11   pyvenv-3.11
```

Use tab completion constantly. It eliminates typos and saves keystrokes.

## History

Press the up-arrow to recall previous commands. Or:

```
$ history          # show command history
$ !5               # re-run command #5 from history
$ !!               # re-run last command
$ !grep            # re-run last command starting with "grep"
```

Ctrl-R: incremental search through history. Type a few letters; matching commands appear. Very useful.

## Clear and reset

```
$ clear            # clear screen (cleaner; Ctrl-L does same)
$ reset            # reset terminal (use if it's garbled)
```

## Manual pages

Every command has a manual:

```
$ man ls
$ man cd
$ man bash         # the shell itself
```

Hit `q` to quit, `/word` to search inside, `n` for next match. `man -k topic` searches all manuals.

For learning, `tldr` is a community-driven faster reference:

```
$ tldr tar         # shows common tar usage examples
```

(Install via `apt install tldr` or `brew install tldr`.)

## A typical first session

```
$ pwd
/home/aaron

$ ls
Desktop  Documents  Downloads  projects

$ cd projects
$ ls
my-app  notes  scripts

$ cd my-app
$ ls -la
total 48
drwxrwxr-x 5 aaron aaron 4096 May 15 11:30 .
drwxrwxr-x 7 aaron aaron 4096 May 15 09:12 ..
drwxrwxr-x 8 aaron aaron 4096 May 15 11:30 .git
-rw-rw-r-- 1 aaron aaron  256 May 15 11:20 .gitignore
-rw-rw-r-- 1 aaron aaron 1421 May 15 11:25 README.md
drwxrwxr-x 4 aaron aaron 4096 May 15 11:30 src

$ cd ..        # back to projects
$ cd -         # back to my-app
```

That's most of moving-around in one shot.

## Mistakes to avoid

- **Not using tab completion.** Slower, error-prone.
- **`rm` carelessly.** No undo on the command line. Triple-check.
- **Confusing `~` and `/`.** `~` is your home; `/` is root of filesystem.
- **Living in one terminal pane.** Open multiple terminals (or use `tmux` later) for different tasks.

## Summary

- Shell reads commands, runs them, shows output. `bash`, `zsh`, `fish` all work.
- `~` = home directory, `/` = filesystem root.
- `pwd` = where am I; `ls` = what's here; `cd` = go somewhere.
- Tab completion is mandatory.
- `history`, `Ctrl-R`, `!!`, `!N` for recalling commands.
- `man name` for the manual; `tldr name` for examples.

Next: working with files — cp, mv, rm, ln, touch.
