---
module: 5
position: 3
title: "Team Projects and collaborative editing"
objective: "Edit alongside other editors on the same project simultaneously."
estimated_minutes: 5
---

# Team Projects and collaborative editing

## What Team Projects is

Team Projects = Adobe's collaborative editing system. Multiple editors work on the same project file from anywhere; changes sync; conflicts surface; integrate cleanly.

Comparable to Google Docs for video editing — built into Creative Cloud Pro / Teams subscriptions.

## When you need it

For solo editors: skip. Local project files + manual backups work fine.

For teams:
- **Multi-editor projects.** Editor A on Module 1; Editor B on Module 2; same file.
- **Editor + assistant.** Assistant ingests / organizes; editor cuts; same file.
- **Remote editors.** Geographically distributed; need cloud-based collaboration.
- **Hand-off chains.** Editor → Colorist → Audio engineer.

For these: Team Projects saves enormous coordination friction.

## Setting up a Team Project

1. File → New → Team Project.
2. Name + select participants (their Adobe accounts).
3. Premiere creates a cloud-hosted project.
4. Each participant: File → Open Team Project; sees the shared project.

Media files live on shared storage (typically a NAS, SAN, or cloud storage with sync); Team Projects manages metadata + sequences + bins; media accessible via consistent paths across machines.

## Concurrent editing

Multiple editors can be in the same Team Project simultaneously:
- Each editor sees others' actions in near-real-time.
- Cursor indicators show who's where.
- Conflicts surface (two editors changing same sequence).

The collaborative model is sequence-locking: when an editor opens a sequence, they have exclusive edit rights; others see read-only.

For parallel work: split into multiple sequences; each editor takes one.

## Sequence locking

When you open a sequence in Team Projects, you "claim" it — others see it as locked.

When you close: lock releases.

For long edit sessions: keep the sequence claimed; others work on different sequences.

For brief peeks: close the sequence so others can edit.

## Sharing changes

Team Projects tracks individual changes:
- **Auto-save.** Every 5-10 min, Premiere saves to the cloud project.
- **Manual share.** File → Share Changes; pushes immediately.
- **Receive changes.** Click Receive Changes in upper-right; pulls others' updates.

For active collaboration: share frequently; receive frequently.

## Conflicts

When two editors edit the same sequence offline / simultaneously: conflict on next share.

Premiere prompts:
- Take yours.
- Take theirs.
- Keep both (rename one).

For Team Projects to work smoothly: avoid same-sequence concurrent editing; assign sequences per editor.

## Media management

Critical for Team Projects:
- **All media on shared storage.** All editors access same paths.
- **No local-only media.** Files specific to one editor break Team Project.
- **Consistent ingest workflow.** Naming + folder structure same across the team.

The most common Team Projects breakage: editor adds media from their local Desktop; others can't access; project shows "offline media" for everyone else.

## NAS / SAN / Cloud storage

Options for shared media:
- **NAS (Network Attached Storage).** Local network; LAN speeds.
- **SAN (Storage Area Network).** Higher bandwidth; SAS / fiber channels.
- **Cloud (Adobe Creative Cloud Storage, AWS S3 + sync clients).** Internet speeds; remote-friendly.

For LAN-based teams: NAS / SAN (best performance).
For remote teams: cloud storage with desktop sync clients (slower but accessible).

## Frame.io integration

Frame.io is Adobe's review + collaboration tool. Integrated with Premiere:
- Upload Premiere exports / sequences to Frame.io directly.
- Clients / reviewers comment with timecode-anchored notes.
- Comments import back into Premiere as markers.

For client review cycles: Frame.io is the modern standard. Replaces "email me an MP4" with annotated review.

## Productions

Productions = Premiere's alternative to Team Projects, for teams that prefer file-based workflows over cloud-based.

- **Production folder.** Contains multiple Premiere projects + shared media.
- **Multiple editors work on different projects** within the same Production simultaneously.
- **Shared bin** for cross-project assets.

For broadcast / film teams accustomed to NAS-based shared workflows: Productions matches that model. No cloud dependency.

Choose Team Projects (cloud, modern, real-time sync) or Productions (file-based, traditional) based on team setup.

## Versioning Team Projects

Team Projects has its own version history:
- Roll back to any previous saved version.
- See change attribution (who did what when).
- Restore deleted sequences.

For accidental damage / dispute resolution: rollback is the safety net.

## Backup strategy

Even with cloud / shared storage:
- **Local backup of source media.** External drive copy.
- **Project file backup.** Periodic export to local .prproj or zip of the Production folder.
- **Off-site cloud backup.** Time Machine, Backblaze, etc.

Cloud / NAS storage can fail or corrupt; multiple-redundancy is the standard for production environments.

## Permissions

Team Projects (and Productions) have permission tiers:
- **Owner.** Full control; can delete project.
- **Editor.** Modify sequences + bins.
- **Viewer.** Read-only.

For client / executive review: Viewer access via Frame.io rather than Premiere directly.

## Remote workflow

For distributed teams:
1. Shared media on cloud storage (sync to local for performance).
2. Team Project for editing.
3. Frame.io for review.
4. Slack / Teams for communication.
5. Adobe Creative Cloud Pro subscription for everyone.

This stack works globally; latency for media access is the main bottleneck.

## Communication conventions

For team workflows:
- **Naming conventions.** Sequences: "S01_E03_RoughCut_v02_Editor1.prproj"
- **Sequence ownership.** Slack / chat announces "I'm taking S01_E03."
- **Daily standup.** Quick sync; what's blocking.
- **Frame.io reviews.** Threaded comments per cut.
- **Final QA.** Single editor / producer runs the final delivery checklist.

Process matters more than tools at scale.

## When Team Projects fails

Internet drops, sync conflicts, corrupted media — Team Projects can fail. Recovery:
- **Have local backup of latest project state.**
- **Document the conflict (screenshot).** Adobe support can help.
- **For media issues:** re-ingest from camera cards / archive.

Production-critical work always has a backup path.

## Mistakes to avoid

- **Local media in Team Project.** Breaks for everyone else.
- **Two editors on same sequence simultaneously.** Conflicts.
- **No naming conventions.** Sequence chaos.
- **Skipping Receive Changes.** Diverged versions.
- **No backup.** All eggs in cloud basket.

## Summary

- Team Projects = cloud-based collaborative editing for multi-editor work.
- Sequence locking: claim a sequence to edit; release for others.
- Share Changes / Receive Changes for sync.
- All media on shared storage; no local-only files.
- Frame.io for client review with timecode-anchored comments.
- Productions = file-based alternative for traditional NAS-based teams.
- Permissions: Owner / Editor / Viewer.
- Process + naming conventions + backup matter more than tooling at scale.

Next: the editor's mindset and craft.
