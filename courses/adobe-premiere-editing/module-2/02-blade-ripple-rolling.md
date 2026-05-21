---
module: 2
position: 2
title: "The blade, ripple, and rolling edits"
objective: "Use the right tool for each kind of edit; refine the timeline surgically."
estimated_minutes: 5
---

# The blade, ripple, and rolling edits

## The blade (Razor) — C

Click in the middle of a clip → splits into two clips at the click point. With Shift held, cuts all targeted tracks at the click point.

Use for:
- Breaking long clips into editable segments.
- Preparing transitions (cut at start + end).
- Setting up J/L cuts.

The blade is the surgical scalpel of Premiere; without it, you're confined to clip boundaries.

## Add Edit shortcut

Cmd+K (Mac) / Ctrl+K (Win) at playhead → adds an edit at playhead on targeted tracks.

Shift+Cmd+K → adds edit across ALL tracks (V + A).

Faster than Razor for cuts at the playhead. Razor for cuts you want to make visually elsewhere.

## Ripple Edit (B)

The most-used trim tool. With Ripple tool active:
- Click on a clip's start or end → trim that edge.
- Adjacent clips on the same track ripple (shift) to maintain edit relationships.

Example: end of Clip A pulled left by 1 second → Clip A is 1s shorter → Clip B moves left by 1s to close the gap → C moves left → etc.

Sequence duration changes by your trim amount.

## Ripple to playhead (Q / W)

- **Q** — Ripple-trim from clip start TO playhead (clip becomes "playhead → end").
- **W** — Ripple-trim from clip end FROM playhead (clip becomes "start → playhead").

Faster than dragging with Ripple tool; position playhead → press key → done.

Pro editors use Q/W constantly; far faster than dragging.

## Rolling Edit (N)

The trim tool that doesn't change sequence duration. With Rolling tool active:
- Click an edit point between two clips.
- Drag → extends one clip while shrinking the other by the same amount.
- Sequence duration unchanged; only the cut point moves.

Use when:
- Adjusting where a cut falls without affecting downstream timing.
- Music-locked sections (downstream timing must stay).
- Refining the exact moment of a cut.

## Trim mode (the Trim Edit panel)

Double-click an edit point in timeline → opens Trim Edit panel.

In Trim mode:
- Plus/Minus buttons for fine adjustment (1 frame, 5 frames).
- "Play around edit" to preview the cut.
- Click "Out shot" (left) or "In shot" (right) to choose which clip you're trimming.

For surgical adjustments. Editor's microscope.

## J / L cuts setup

Cut in audio earlier than video (J cut) or later (L cut). Two methods:

**Method A — Razor + nudge:**
1. Position playhead.
2. Cmd+K targeting V only (audio stays uncut).
3. With Selection tool, drag the new video edit point separately.

**Method B — Unlink + trim:**
1. Select clip → right-click → Unlink (or Cmd+L).
2. Trim video edge separately from audio edge with Ripple.
3. Re-link if desired (select both → right-click → Link).

Method B is faster for many J/L cuts. Covered more next lesson.

## Slip (Y) revisited

Slip changes which portion of the source you're using without moving the clip on the timeline.

Click + drag clip middle (with Slip tool) → preview shows two thumbnails (the new in + out points). Release.

Use for: "this is the right placement on timeline but wrong content of the source."

## Slide (U) revisited

Slide moves the clip on the timeline; adjacent clips' edges adjust to fit.

Click + drag clip (with Slide tool) → preview shows the new edges of the surrounding clips. Release.

Use for: "this clip needs to move on the timeline; I want to keep the surrounding clips' content visible (just less or more of them)."

## Visual diff: Ripple vs. Rolling vs. Slip vs. Slide

| Tool      | Moves clip? | Trims clip duration? | Affects adjacent? | Changes timeline length? |
|-----------|-------------|----------------------|-------------------|--------------------------|
| Ripple    | No          | Yes                  | Yes (shift)       | Yes                      |
| Rolling   | No          | Yes (one clip up + other down)| Yes (counterbalance) | No                |
| Slip      | No          | No (content only)    | No                | No                       |
| Slide     | Yes         | No                   | Yes (trim)        | No                       |

Picking the right tool: which dimensions matter, which should stay?

## Selection (V) + drag

Default tool. Drag clip end = trim like Ripple but WITHOUT rippling adjacents (leaves gap behind). Drag clip body = move; can overlap or replace adjacent.

For surgical work: use specific tools (B/N/Y/U). For quick drag: V.

## Snapping

Snap (S) toggle: clips snap to edit points, playhead, markers when dragging.

With snap on: drag clip near another → snaps to align. Helpful for closing gaps perfectly.

Toggle snap off (S) when you want fine-tuned manual positioning.

## Ripple delete

Select clip → Shift+Delete → ripple delete (removes + closes gap).

Equivalent to selecting clip then Extracting its range.

Use heavily; gaps are usually unwanted.

## Clip selection variants

- **Single click.** Select one clip.
- **Cmd / Ctrl click.** Add to selection.
- **Shift click.** Range select (between two clicks).
- **Cmd+A.** Select all.
- **Track Select Forward (A).** Select everything on target tracks from click point right.
- **Track Select Backward (Shift+A).** Same, leftward.

Track Select is handy: click at point → A → select everything to the right → drag to move whole rest of sequence.

## Linked clips: linked vs. unlinked

Audio + video recorded together = linked by default. Move the video clip → audio moves; trim video → audio trims.

Unlink with Cmd+L (or right-click → Unlink). Useful for:
- J/L cuts.
- Replacing one element while keeping the other.
- Sync issues (audio doesn't match video — separate fixes).

Re-link when sync is final: select both → Cmd+L (or right-click → Link).

## Maintain sync warnings

When you ripple one part of linked content and the other gets out of sync, Premiere flags it with red markers on the clip — visual warning.

Click the red marker → Slip into Sync (re-aligns) or just dismiss.

For complex audio offsets: deliberate unlink + handle separately.

## Clipping the gap

Select gap (single click in empty space) → Delete → closes.

For unwanted micro-gaps from drag operations: select all gaps via Edit → Find Gaps in Sequence → delete.

## Mistakes to avoid

- **Selection tool for everything.** Slow.
- **Ripple tool when you wanted Rolling.** Downstream timing shifts.
- **Slip mistaken for Slide.** Wrong dimension affected.
- **Ignoring snap.** Gaps + overlaps drift.
- **No keyboard shortcuts.** Editing at half-speed.

## Summary

- Razor (C) splits clips; Cmd+K adds edit at playhead.
- Ripple (B) trims + shifts adjacents; sequence duration changes.
- Rolling (N) adjusts edit point between two clips; duration unchanged.
- Slip (Y) changes clip content without moving on timeline.
- Slide (U) moves clip on timeline; adjacents adjust to fit.
- Q/W ripple-trim to playhead from clip start/end.
- Linked clips move + trim together; unlink for surgical separation.

Next: J-cuts, L-cuts, and the rhythm of dialogue.
