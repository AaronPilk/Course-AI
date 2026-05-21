---
module: 5
position: 3
title: "Comments, branching, version history"
objective: "Collaborate at scale without breaking the file."
estimated_minutes: 5
---

# Comments, branching, version history

## Comments

Anyone with view-or-comment access can comment on any layer. Click the comment tool (C); place on a layer or canvas region; type.

Comments thread; @-mention people to notify; resolve when addressed.

For asynchronous feedback: PMs review designs at their own pace; designers respond when ready; reduces meeting overhead.

## Comment best practices

- **Specific.** "Reduce padding here" not "this looks off."
- **Actionable.** Suggest the change, not just identify the problem.
- **Anchored.** Pin to the relevant layer, not the canvas.
- **Resolved when done.** Otherwise threads accumulate.
- **@-mention sparingly.** Notify only the relevant person.

For teams with active design review: comments are the lifeblood.

## Comment threads

Comments thread vertically. Reply to keep discussion grouped. Anyone with access can reply.

For long debates: take the discussion offline (Slack / call); link the resolution back in Figma comment.

## Branching

Branching (introduced in 2023) creates a copy of the main file for experimental changes; merge to main when ready. Similar to Git branches.

Use cases:
- Refactoring a component without affecting product designs.
- Trying a new direction.
- Multi-designer collaboration on a feature.

## Creating a branch

File menu → Create branch. Name it (`button-refactor-Q3`). The branch is a parallel copy; edits don't affect main.

Within the branch: design freely; iterate without consequence.

## Reviewing branches

In the file menu: see all open branches. Click one → review changes → diff view shows what's different from main.

For design system maintenance: review branches before merging; ensure consistency.

## Merging branches

When ready: merge branch → main. Figma overlays the branch's changes onto main.

For conflicts (rare): manual resolution. Most merges are clean.

After merge: branch can be archived or deleted; main is updated; library published.

## Version history

Every file has version history (auto-save snapshots + manual). Access via File → Show version history.

Sidebar lists snapshots; click one → preview that version; "Restore" to revert.

For accidents: roll back is one click. For experimental work: snapshot before destructive change.

## Named versions

Save a snapshot with a name + description (e.g., "Sprint 12 final designs"). Easy to find later.

Best practice: snapshot at the end of each design cycle / sprint. Documentation of progress.

## Collaboration in real-time

Multiple designers in the same file: see each other's cursors and selections. Edit different parts simultaneously; Figma syncs in real-time.

For pair design: voice + Figma; design together as if at the same screen.

## Multiplayer best practices

- **Communicate.** "I'm editing the components page; don't touch."
- **Branch for big changes.** Avoid stepping on each other.
- **Save versions.** Before a risky change, snapshot.
- **Comment instead of overwriting.** "What if we tried X?" → comment, not edit.

## Permissions

Figma access levels:
- **Owner.** Full control.
- **Editor (Edit access).** Modify designs.
- **Viewer (Can view).** Read-only.
- **Comment access (Can view + comment).** Read + comment.

Engineering: usually Viewer or Comment. PMs: Comment. Designers: Editor.

For libraries: Editor for design system team; Viewer or Comment for consumers.

## Shared projects

Files live in projects (folders). Set project-level permissions; files inherit.

For team organization: Design System project (libraries), Product project (product files), Marketing project, etc.

## File organization

Within a file:
- **Pages.** Top-level (cover, components, designs, archive).
- **Sections.** Group related frames within a page.
- **Frames.** Individual screens / components.

Use cover page with name, owner, status, last updated.

## Team libraries

Beyond per-file libraries: workspace-level libraries shared across all team files.

Workspace settings → Libraries → enable. Mature teams: one workspace library for tokens + components.

## Handoff cadence

For ongoing projects:
- **Sprint cycle.** Design 1-2 weeks ahead; handoff at sprint start.
- **Daily check-ins.** PM + designer + engineer 10-15min.
- **Async handoff.** Slack notification + Figma comment + spec doc.

Cadence depends on velocity; smaller teams sync more, larger teams async more.

## Design crit

Async or sync design critiques:
- **Async.** Designer ships work; team comments over 24-48h.
- **Sync.** Weekly hour-long review; designer presents; team feedback.

Both work; pick based on team preference + timezone overlap.

## Stakeholder reviews

For non-designers (PMs, executives, customers):
- Share prototype (not the messy design file).
- Add narrative (cover page or comment with context).
- Anticipate questions; pre-answer in comments.

Stakeholders react to polish; messy design files confuse.

## File hygiene

Keep files clean:
- **Archive.** Old work goes to an Archive page.
- **Delete drafts.** Don't accumulate.
- **Cover page.** Status + owner.
- **Naming.** Consistent across team.

A 200-page file with 5 active pages is harder than a 5-page file with everything current.

## File templates

For repeated work: template files. Onboarding flow template; pricing page template.

Duplicate the template → customize. Faster than starting from scratch; consistency baked in.

## Mistakes to avoid

- **No comments resolved.** Threads pile up; noise.
- **Branching never.** Big changes break main during active product work.
- **No version snapshots.** Recovery hard.
- **Real-time chaos.** Multiple designers stepping on each other.
- **Permissions too open.** Anyone edits; chaos.

## Summary

- Comments anchored to layers; thread; resolve when done.
- Branches isolate experimental work; merge to main when ready.
- Version history covers accidents + intentional snapshots.
- Real-time collaboration; communicate; branch for big changes.
- Permissions tiered (Owner / Editor / Viewer / Commenter).
- Async handoff for most; sync for complex.

Next: maintaining a design system over time.
