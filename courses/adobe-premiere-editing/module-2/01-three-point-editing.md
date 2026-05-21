---
module: 2
position: 1
title: "Source/program monitor and three-point editing"
objective: "Master the foundational editing workflow pro editors use 80% of the time."
estimated_minutes: 5
---

# Source/program monitor and three-point editing

## The two monitors

**Source monitor (left).** Previews unedited clips from your project panel.

**Program monitor (right).** Previews the timeline at playhead position.

This dual-monitor setup is the heart of Premiere's editing model. Source has the raw material; Program shows the cut. Three-point editing connects them.

## Why three-point editing

Without it: drag clips onto the timeline; trim by hand. Slow; imprecise.

With it: set in/out points on source; set in (or out) on timeline; press a key → clip inserts at the exact spot, with exact duration. Fast; surgical.

Pro editors use three-point for the majority of edits. Drag-and-drop is for rough layout; three-point is for refinement.

## The three points

- **Source In + Source Out** — defines the segment of the source clip.
- **Timeline In** — defines where the segment lands.

Premiere computes the fourth (timeline out) automatically based on source duration.

Or:
- **Source In** — segment start.
- **Timeline In + Timeline Out** — defines the slot on timeline.

Premiere computes source out based on timeline slot duration.

Either way: 3 points known → 4th derived.

## Setting in/out on source

1. Open clip in source monitor (double-click in Project panel).
2. Use J / K / L to navigate.
3. At the desired in point: press I.
4. At the desired out point: press O.
5. Source monitor highlights the range.

## Setting in/out on timeline

1. Move playhead with click or arrow keys.
2. Press I for in-point at playhead.
3. Press O for out-point at playhead.

Timeline range highlighted in the ruler.

## Insert vs. Overwrite

After setting points:
- **, (comma)** — Insert. Adds clip; shifts existing clips right to make room.
- **. (period)** — Overwrite. Adds clip; overwrites whatever was there.

Use Insert when extending the cut; Overwrite when replacing a section.

Both respect track targeting; clip lands on the targeted tracks.

## Backspace edits

- **Lift (;)** — Removes content from timeline range; leaves gap.
- **Extract (')** — Removes content from timeline range; closes gap (ripple delete).

Pair with three-point: select range with I/O, lift or extract.

## J/K/L mastery

The transport shortcuts:
- **J** — Reverse play. Tap repeatedly = speed up reverse.
- **K** — Pause.
- **L** — Forward play. Tap repeatedly = speed up forward (2x, 4x, 8x).
- **K + J** or **K + L** — Frame-by-frame in either direction.
- **Shift + J/L** — 1/4 speed (slow scrub).

Editors live in JKL; thumb on space is amateur, fingers on JKL is pro.

## Match frame (F)

In timeline: select a clip; press F → opens source monitor with the same clip, at the same frame. Useful for:
- "Where does this clip come from?"
- Building a tight cut around a specific frame.
- Source playback to find more usable content.

## Sync settings

When source has multiple audio channels (e.g., 2-channel boom + 1-channel lavalier), the source's V/A targeting indicators (left of source monitor) determine which channels go to which timeline tracks.

Drag source V1 to timeline V2; source A1 to A3 — clip lands on those tracks specifically.

## The ripple delete

Select a clip; Shift+Delete → ripple delete. Removes clip + closes the gap.

vs. Delete (just removes; leaves gap).

For most editing: ripple. Gaps are usually unwanted.

## Edit on the fly

For interview-style content:
1. Play source in source monitor.
2. As speaker says useful sentence: hit I.
3. At end of useful sentence: hit O.
4. Press , (insert) → segment lands in timeline.
5. Continue playing; repeat.

Builds a rough cut in real-time as you listen. Refinement comes later.

## Roughing in vs. fine cutting

**Rough cut.** All usable segments in approximate order. Don't fuss; capture material.

**Fine cut.** Trim each edit; smooth transitions; remove unnecessary frames.

Don't conflate. Rough cut for structure; fine cut for polish.

## Adding cuts

In timeline: position playhead → Cmd+K (Mac) / Ctrl+K (Win) → adds an edit at playhead. Splits the clip into two.

For "add cuts on every selected track": Shift+Cmd+K (or Shift+Ctrl+K).

Useful for:
- Breaking a long clip into editable segments.
- Setting up J/L cuts (next lesson).
- Preparing for transitions.

## Edit indicators

The blue line where two clips meet is an edit point. Tools (Ripple, Rolling) work on these points.

Hover over an edit point with Ripple tool — both sides highlight. Drag → trim.

## Slip edit (Y)

Hold Y; click and drag a clip's middle. The clip's in/out shift simultaneously — content changes but clip duration + position stay the same.

Use when: clip's start/end is wrong, but the clip is in the right place on the timeline.

## Slide edit (U)

Hold U; click and drag a clip. The clip moves on timeline; adjacent clips' edges adjust to fill the gap.

Use when: clip needs to move on timeline but you want surrounding clips' content unchanged (their trim points adjust, not their content shown).

## The toolbox + keyboard hybrid

Pros switch tools constantly:
- V (Selection) most of the time.
- B (Ripple) for trim edits.
- N (Rolling) for adjusting cut points.
- Y (Slip) for content shifts.
- U (Slide) for placement shifts.
- C (Razor) for surgical cuts.

V, B, N, C → master these four; covers 80% of editing.

## Keyboard customization

Editors customize:
- ,/. for insert/overwrite (default).
- Q/W for ripple-to-playhead from start/end (default; useful).
- Add/Edit shortcut to E if you use ripple often.
- Match frame to F is great default.

Premiere → Keyboard Shortcuts → search any command → assign key.

## Source clip transport

In source monitor: Spacebar plays. JKL navigates. Left/Right arrow = frame-by-frame. Shift+Left/Right = 5-frame jumps.

Same shortcuts in program monitor for timeline.

## Mistakes to avoid

- **Drag-and-drop for everything.** Slow + imprecise.
- **No JKL.** Editing in slow motion.
- **Forgetting track targeting.** Clips land wrong.
- **No in/out points.** Manual trimming clips.
- **Lift instead of Extract by mistake.** Gaps accumulate.

## Summary

- Source + Program monitor = Premiere's dual-monitor editing model.
- Three-point editing: set in/out on source + in (or out) on timeline → insert/overwrite.
- JKL transport + I/O in/out are core mechanics.
- Insert (,) shifts existing clips; Overwrite (.) replaces.
- Lift (;) leaves gap; Extract (') closes gap.
- Slip (Y), Slide (U), Match Frame (F), Add Edit (Cmd+K) round out the kit.

Next: the blade, ripple, and rolling edits.
