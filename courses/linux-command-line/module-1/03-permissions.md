---
module: 1
position: 3
title: "Permissions: chmod, chown, the octal model"
objective: "Read and modify file permissions correctly."
estimated_minutes: 6
---

# Permissions: chmod, chown, the octal model

## What permissions are for

Linux is multi-user. Every file has:

- An **owner** (user).
- A **group**.
- **Permissions** for owner, group, and "others" (everyone else).

Permissions control who can **read** (r), **write** (w), or **execute** (x) the file. For directories, x means "can enter / traverse."

Without permissions, web servers, databases, SSH would have no way to enforce that user A can't read user B's files. Critical for security; occasionally annoying for development.

## Reading permissions with ls -l

```
$ ls -l
-rw-r--r--  1 aaron aaron  1421 May 15 11:25 README.md
drwxrwxr-x  3 aaron aaron  4096 May 15 11:30 src/
-rwx------  1 aaron aaron   246 May 15 09:00 secret.sh
```

The first column is permissions. Breaking down `-rw-r--r--`:

- `-` first character: file type (`-` = regular file, `d` = directory, `l` = symlink).
- `rw-` next three: owner permissions.
- `r--` next three: group permissions.
- `r--` last three: others permissions.

So this file is owned by user `aaron` (in group `aaron`); owner can read+write; group and others can only read.

## Permission letters

- `r` (read) = 4
- `w` (write) = 2
- `x` (execute) = 1
- `-` = no permission

To execute a file (script or binary), you need `x` on it. To enter a directory, you need `x` on the directory.

## Octal notation

Sum the values:

- `rwx` = 4+2+1 = 7
- `rw-` = 4+2 = 6
- `r-x` = 4+1 = 5
- `r--` = 4
- `---` = 0

Three digits represent owner / group / others:

- `755` = owner rwx, group rx, others rx → typical for executables and most directories.
- `644` = owner rw, group r, others r → typical for regular files.
- `600` = owner rw, nobody else → private files like SSH keys.
- `700` = owner rwx, nobody else → private directories.
- `777` = everyone everything → almost never use.

## chmod — change mode

Two syntaxes. Octal is most common:

```
$ chmod 755 script.sh                  # rwxr-xr-x
$ chmod 644 readme.txt                 # rw-r--r--
$ chmod 600 ~/.ssh/id_rsa              # owner rw only
$ chmod -R 755 dir/                    # recursive
```

Or symbolic:

```
$ chmod u+x script.sh                  # add execute for user (owner)
$ chmod g-w file.txt                   # remove write for group
$ chmod o=r file.txt                   # set others to read-only
$ chmod a+r file.txt                   # all (u+g+o) get read
```

- `u` = user/owner, `g` = group, `o` = others, `a` = all.
- `+`, `-`, `=` to add, remove, set.

Symbolic is more readable for one-shot changes; octal is cleaner for setting precise values.

## chown — change owner

```
$ sudo chown aaron file.txt                # change owner to aaron
$ sudo chown aaron:developers file.txt     # owner aaron, group developers
$ sudo chown :developers file.txt          # only change group
$ sudo chown -R aaron:aaron /home/aaron    # recursive (own your home)
```

Requires root (`sudo`) for files you don't own. Owners can change group to any group they're a member of.

## Typical situations

**Make a script executable:**

```
$ chmod +x script.sh
```

**Lock down SSH keys:**

```
$ chmod 600 ~/.ssh/id_rsa
$ chmod 600 ~/.ssh/config
$ chmod 700 ~/.ssh
```

SSH refuses to use a private key with world-readable permissions. Common first-time-setup confusion.

**Web server can't read files:**

```
$ ls -l index.html
-rw------- 1 aaron aaron 1024 May 15 index.html

# nginx runs as user www-data and can't read aaron-only files
$ chmod 644 index.html         # or chmod o+r
```

**Make a shared directory writable by a team:**

```
$ sudo chown :developers /shared
$ sudo chmod 770 /shared      # owner+group rwx, others nothing
$ sudo chmod g+s /shared      # setgid: new files inherit group
```

## umask — defaults for new files

When you create a file, its initial permissions are determined by the system default minus your umask:

```
$ umask
0022                # this is the typical default
```

The umask masks out permissions. With umask 022:

- New files start at 666 - 022 = 644 (`rw-r--r--`).
- New directories start at 777 - 022 = 755 (`rwxr-xr-x`).

For more privacy by default:

```
$ umask 077                # new files: 600, new dirs: 700
```

Add to `.bashrc` to make permanent.

## Special bits — setuid, setgid, sticky

Three less-common bits:

- **setuid (4xxx).** When file is executed, runs as the owner of the file (not the user running it). Used for `passwd`, which needs root powers temporarily.
- **setgid (2xxx).** Same idea but for group. On directories: new files inherit the directory's group.
- **sticky bit (1xxx).** On directories: only the file's owner can delete it. Used on `/tmp` so users can write there but not delete each other's files.

```
$ ls -ld /tmp
drwxrwxrwt 16 root root 4096 May 15 11:30 /tmp     # the 't' is the sticky bit
```

You won't set these often, but recognizing them is important.

## Common errors

```
Permission denied
```

Usually because:
- Trying to execute a non-executable file. Fix: `chmod +x file`.
- Trying to read/write a file owned by someone else. Fix: `chown` or different user.
- Missing `x` on a parent directory you need to traverse. Fix: `chmod +x dir`.

```
Operation not permitted
```

Usually because:
- Trying to chown without root. Fix: `sudo`.
- Trying to delete a file in a directory you can write but where the sticky bit + you're not owner.

## Mistakes to avoid

- **`chmod 777` everywhere.** "Solves" permission errors by making everything world-writable. Massive security hole; many web exploits depend on it.
- **Recursive chmod on system dirs.** `chmod -R 644 /etc` breaks the system. Recursive only on your own directories.
- **SSH keys not 600.** SSH refuses to use them; clear error.
- **Not understanding the difference between owner and root.** Owner has permissions by default; root has everything.

## Summary

- Owner / group / others, each with rwx.
- Octal: `rwx`=7, `rw-`=6, `r-x`=5, `r--`=4.
- `755` for executables and dirs; `644` for files; `600` for secrets.
- `chmod` changes mode; `chown` changes ownership.
- umask sets defaults; 022 is typical.
- SSH keys must be 600 (`chmod 600 ~/.ssh/id_rsa`).
- Never `chmod 777` to "fix" things; it's almost always a security mistake.

Next: finding things with find, locate, which.
