---
module: 4
position: 4
title: "Titles, lower thirds, Essential Graphics"
objective: "Add text + graphics that match pro production value."
estimated_minutes: 5
---

# Titles, lower thirds, Essential Graphics

## What Essential Graphics is

Window → Essential Graphics. Premiere's panel for titles, lower thirds, and motion graphics templates (MOGRTs).

Replaces the old Title Tool entirely. Modern; component-based; integrates with After Effects.

## Creating text

Quick method:
1. Select the Type tool (T) in the toolbox.
2. Click in the program monitor; type.
3. A text layer appears in the timeline + the project panel.

For more control: New Item → Graphics → text frame.

## Text properties

With text selected: Essential Graphics → Edit tab shows:
- **Font.** Family + style + weight.
- **Size.** Type size.
- **Color.** Fill color.
- **Stroke.** Outline color + width.
- **Shadow.** Drop shadow.
- **Background.** Solid color box behind text.

Standard typography controls.

## Type tool basics

While Type tool active:
- Click + type = single-line text.
- Click + drag = text box (multi-line; wraps).

For headers: single-line.
For body copy: text box.

## Animating text — keyframes

In the Essential Graphics panel: each property is keyframeable (the stopwatch icon).

To animate:
1. Position playhead at start.
2. Click stopwatch on (e.g.) Position → records keyframe.
3. Move playhead later; change Position value → records second keyframe.
4. Playback: text moves between keyframes.

For fade-in: Opacity stopwatch; 0% at start, 100% at end.

## Roll / Crawl titles

For end credits or news ticker:
- Select text → Essential Graphics → toggle "Roll" → set scroll direction + speed.
- "Crawl" for horizontal scroll.

Defaults are set up; tune timing as needed.

## Layers within a graphic

A single graphic clip can contain multiple layers:
- Text layer (the headline).
- Shape layer (background rectangle).
- Image layer (logo).

Build composite graphics within Essential Graphics; treat as single clip on timeline.

## Shapes

Type tool dropdown → Rectangle, Ellipse, Polygon tools. Draw on monitor; styles in Essential Graphics.

Use for backgrounds, dividers, accent shapes.

## Lower thirds

The classic news-style lower-third (name + title in the lower portion of frame):
1. Create rectangle (background bar).
2. Add text layer on top (the name).
3. Add second text layer (the title / role).
4. Position in lower third of frame.
5. Animate in: rectangle slides in from left → text fades in after.

Or: use a MOGRT (next section) that does this in one drag-drop.

## MOGRTs (Motion Graphics Templates)

A MOGRT is a pre-built motion graphic with adjustable properties. Place in timeline; customize text/colors via Essential Graphics; ship.

Sources:
- **Adobe Stock.** Subscription includes MOGRTs.
- **Built-in.** Premiere ships with some.
- **Custom (After Effects).** Build in AE; export as MOGRT; use in Premiere.
- **Third-party.** Envato, MotionElements; many free + paid.

For YouTubers: MOGRT packs ($30-100) give consistent lower thirds, intros, transitions across episodes.

## Using a MOGRT

1. Drag .mogrt file into Premiere's Essential Graphics panel.
2. Now it appears in the Browse tab.
3. Drag into timeline like any clip.
4. Select clip; Essential Graphics → Edit tab → adjustable properties (text, colors, scale, position).
5. Customize; the underlying animation runs.

Way faster than building motion graphics from scratch.

## Building custom lower thirds

A reusable pattern:
1. New Graphic.
2. Add rectangle: width 400, height 80, semi-transparent black.
3. Add text: name (24pt, white).
4. Add text: title (16pt, gray).
5. Animate background sliding in from left (0.3s).
6. Animate text fading in 0.2s after background settles.
7. Save as Motion Graphics Template: Export As → MOGRT.

Now drag-drop on any clip; replace text; done.

## Responsive design

Essential Graphics supports responsive properties:
- **Responsive Design - Position.** Lock graphic to a corner / edge — when video resolution changes, the graphic stays positioned.
- **Responsive Design - Time.** Lock intro / outro animation timing — when the clip duration changes, the animation duration stays the same.

For multi-platform content (16:9 + 9:16 + 1:1 versions): responsive graphics scale across.

## Text safe areas

Title-safe and action-safe zones:
- **Title safe.** Inner 80% of frame — text inside this area is safe on all displays.
- **Action safe.** Inner 90% — important visuals safe.

Toggle in program monitor: right-click → Safe Margins.

Critical for broadcast (TV may crop edges); web is more forgiving.

## Color and contrast

For text legibility:
- **High contrast.** White text on dark; dark text on light.
- **Shadow / Stroke.** Adds readability against busy backgrounds.
- **Background bar.** When text must overlay variable content (interview B-roll).

Test on multiple devices; small phone screens are the toughest test.

## Typography choices

For brand consistency:
- **Sans-serif** (Helvetica, Inter, Roboto): modern, clean.
- **Serif** (Times, Garamond, Playfair): editorial, classic.
- **Display fonts**: for big titles only; avoid for body.

Stick to 1-2 fonts in a project; consistency > variety.

## Importing fonts

Add fonts to your system: install via Font Book (Mac) / Fonts folder (Win) / Adobe Fonts (web-syncable).

Adobe Fonts (formerly Typekit) integrates with Creative Cloud: enable a font → available in Premiere immediately.

For commercial work: license fonts properly.

## Graphics in Essential Graphics panel

Essential Graphics is the layer panel for the graphic clip. Selecting different layers in the panel changes what you're editing.

For complex multi-layer graphics: think of it as a mini-After-Effects timeline inside Premiere.

## Master clips

Convert a graphic to a master clip (right-click in Project panel → Convert to Master Clip). Changes to the master propagate to all instances.

For a lower-third design used 50 times in a series: master clip means one edit; everywhere updates.

## After Effects integration

For complex motion graphics:
- Create graphic in After Effects.
- Export as MOGRT (.mogrt file).
- Use in Premiere.

Or:
- Dynamic Link from Premiere to After Effects (covered Module 5).
- Edit AE comp; changes reflected in Premiere live.

For sophisticated motion: AE is the right tool. Essential Graphics for in-Premiere work.

## Mistakes to avoid

- **Too many fonts.** Visual chaos.
- **Low contrast.** Unreadable.
- **No safe zones.** Text cropped on TVs.
- **Static graphics in dynamic content.** Feels disconnected from edit.
- **Custom-building everything.** MOGRTs save hours.

## Summary

- Essential Graphics replaces old Title Tool; component-based; Adobe Fonts integration.
- Type tool (T) + Essential Graphics panel = create + style.
- Keyframe properties for animations (Position, Opacity, Scale).
- MOGRTs (Motion Graphics Templates) for fast pre-built graphics.
- Responsive design for cross-resolution / cross-duration adaptation.
- Title-safe + action-safe zones for broadcast compatibility.
- Master clips for graphics used many times.
- After Effects integration for advanced motion.

Module 5 next: workflow, integration, export.
