---
module: 4
position: 1
title: "Keyframe animation and the Graph Editor"
objective: "Animate objects via keyframes; understand how motion is shaped."
estimated_minutes: 5
---

# Keyframe animation and the Graph Editor

## What animation is

Animation = changing properties over time. Position, rotation, scale, color, material properties — anything keyframeable.

Blender represents time in frames. At 24 fps, 1 second = 24 frames.

Keyframes mark "at this frame, this property = this value." Between keyframes, Blender interpolates.

## Adding keyframes

Set the playhead at a frame; change a property value; press I → menu of property types → pick (Location, Rotation, Scale, all of them).

Or: keyframe any property by hover + I.

Or: right-click on the property in the panel → Insert Keyframe.

A keyframe appears as a yellow / orange dot on the property and in the Timeline / Dope Sheet / Graph Editor.

## Auto-keyframing

Toggle the small record (red circle) button in the timeline. Now any property change automatically inserts a keyframe at the current frame.

Pro habit: use Auto-Keyframing for iterative animation; turn off when not animating.

## The Timeline

Bottom panel. Shows:
- **Playhead** (vertical line at current frame).
- **Frame range** (start + end).
- **Keyframes** (markers).
- **Play / pause** controls.

Spacebar plays / pauses. Arrow keys step by 1 frame; Shift+arrow steps by 10.

## The Dope Sheet

Window → Dope Sheet. Lists all keyframes for the selected object.

Visualize when each property keyframes.

Edit:
- Drag keyframes to retime.
- Select + Delete to remove.
- Copy / paste keyframes.

For overall timing adjustments: Dope Sheet is the tool.

## The Graph Editor

Window → Graph Editor. Visual curves showing property values over time.

X axis = time (frames); Y axis = value.

Each curve = how a property changes:
- Flat = constant value.
- Linear = constant rate of change.
- Curved = ease-in / ease-out.

Edit curves: drag keyframe points, drag handles to change tangent.

## Interpolation modes

Each keyframe has an interpolation mode (T key in Graph Editor):
- **Constant.** Hold value until next keyframe.
- **Linear.** Constant rate of change.
- **Bezier.** Smooth curve through keyframes (default; "ease").

For mechanical motion: Linear.
For organic motion: Bezier (default).
For step animation (claymation feel): Constant.

## Ease in / out

Bezier interpolation creates "ease":
- Slow at start; fast in middle; slow at end (natural feel).
- Default behavior; mostly fine for organic movement.

For sharper / sudden motion: manually flatten the curve's handles or set to Linear.

For exaggerated ease: stretch handles farther.

## The 12 principles of animation

Classic Disney animation principles (Frank Thomas & Ollie Johnston):
1. **Squash and Stretch.** Shapes deform with motion.
2. **Anticipation.** Wind-up before action.
3. **Staging.** Pose / framing tells story clearly.
4. **Straight Ahead vs. Pose to Pose.** Two animation methods.
5. **Follow Through and Overlap.** Things continue after primary motion.
6. **Slow In, Slow Out.** Ease (default in 3D).
7. **Arcs.** Motion follows curved paths.
8. **Secondary Action.** Smaller movements complement primary.
9. **Timing.** Spacing of frames creates pace.
10. **Exaggeration.** Push the motion past realism.
11. **Solid Drawing.** 3D-aware posing.
12. **Appeal.** Subjects are interesting to watch.

These apply to 3D animation; learning them deepens craft.

## Pose-to-pose vs. straight-ahead

**Pose-to-pose.** Set key poses first; fill in between.
- Plan the major beats; refine between.
- Better for character animation, narrative.

**Straight-ahead.** Animate frame by frame from start.
- Continuous flow; less planning.
- Used for effects animation, fluid motion.

Most 3D character animation: pose-to-pose.

## Timing — the 24 fps grid

At 24 fps, each frame = 1/24 second = ~42ms.

A quick movement: 6-12 frames (0.25-0.5 sec).
A slow movement: 24-48 frames (1-2 sec).
A pose hold: 12-24 frames.

For natural motion: vary timing; don't keyframe everything at uniform intervals.

## Rendering animations

After animating: Ctrl+F12 (Render Animation). Renders all frames in the range.

Output to PNG sequence; assemble in Premiere / Resolve / FFmpeg.

For preview: viewport playback shows real-time animation.

For rendered preview: Render → OpenGL Render (faster than full render).

## Driving animation with constraints

Object Constraints offer rules:
- **Copy Location / Rotation / Scale.** Object follows another.
- **Track To.** Object looks at target.
- **Limit Location / Rotation.** Cap range.
- **Follow Path.** Animate along curve.

For: cameras tracking subjects; objects parented to riggings; complex motion via simple rules.

## Animation layers (NLA — Nonlinear Action)

For complex sequences: actions stored as separate "strips" in NLA Editor.

Walk action + wave action = combine on different layers.

For: blending pre-made actions, motion capture data, action library.

## Drivers

Drivers connect one property to another:
- Move arm bone X → rotate hand bone Y.
- Slider value → emission strength.

Right-click property → Add Driver. Configure in Drivers panel.

For: rigging, mechanical relationships, parametric setups.

## Animation workflow

For a character walking:
1. Plan: how many steps; how long; mood (fast / slow / heavy).
2. Set timeline to needed length (e.g., 48 frames at 24 fps = 2 sec walk).
3. Pose at key frames: contact pose (foot down); pass pose (mid step); contact (other foot).
4. Refine: arms swing; head turn; body roll.
5. Add personality: idle hands, looking around, breathing.
6. Render preview.
7. Iterate.

Each pass adds detail; iterate from blocking → polish.

## Common animation tasks

**Camera animation.** Move camera through scene.

**Object motion.** Bouncing ball, falling object, vehicle drive.

**Character animation.** Walks, gestures, expressions.

**Material animation.** Color shifts, emission pulses.

**Camera tracking subject.** Track To constraint.

## Mistakes to avoid

- **No timing variation.** Uniform speed feels mechanical.
- **No ease.** Linear motion feels robotic.
- **All keyframes at integers.** Sub-frame timing is also valuable.
- **No secondary action.** Movement feels stiff.
- **No anticipation.** Sudden movement; no setup.

## Summary

- Animation = keyframes over time; properties change.
- I key inserts keyframes; Auto-Keyframing makes them automatic.
- Timeline, Dope Sheet, Graph Editor for editing.
- Bezier interpolation = default ease; adjust for mechanical / sharp / step motion.
- 12 principles of animation guide craft.
- Pose-to-pose for character; straight-ahead for effects.
- 24 fps = 42ms per frame.
- Render animation: Ctrl+F12 → PNG sequence → assemble in post.

Next: rigging — armatures and weight painting.
