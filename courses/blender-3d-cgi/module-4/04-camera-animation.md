---
module: 4
position: 4
title: "Camera animation and rendering motion"
objective: "Move the camera intentionally; render the result smoothly."
estimated_minutes: 5
---

# Camera animation and rendering motion

## Why animate the camera

Static cameras feel CGI. Camera motion adds:
- **Cinematic feel.** Pans, dollies, tilts mimic film.
- **Storytelling.** Reveal, follow, push-in for impact.
- **Engagement.** Subtle movement keeps the eye.
- **Discovery.** Lead viewer through the scene.

Even a slight rotating push-in adds production value vs. a static frame.

## Basic camera animation

Same as object animation:
1. Select camera.
2. Frame 1: set position + rotation; press I → Location + Rotation.
3. Move to later frame.
4. Move / rotate camera; press I again.
5. Play timeline → camera animates.

For simple pushes / pans / tilts: keyframes on Location + Rotation.

## Common camera moves

**Push in.** Move camera forward toward subject. Builds intensity.

**Pull out.** Move camera back from subject. Reveals context.

**Pan.** Rotate camera horizontally on Z axis (yaw). Look around the scene.

**Tilt.** Rotate camera vertically on local X axis (pitch). Look up/down.

**Dolly.** Move camera horizontally (sideways). Follows subject.

**Truck.** Move camera horizontally on its own X axis.

**Crane / Boom.** Vertical movement.

Each move has cinematic feel; combine for complex shots.

## Animated focal length

For zoom effects: keyframe Focal Length over time.
- Wide (24mm) → narrow (85mm) over 24 frames = zoom in.
- Reverse = zoom out.

For dramatic emphasis: combined push-in + zoom-out = "vertigo effect" / "dolly zoom" (Hitchcock).

## Camera tracking a subject

For follow shots:
- Add Track To constraint: camera always points at target.
- Configure target + axis (e.g., Track Y toward target).
- Move camera or subject; camera auto-points.

For: chasing characters, vehicle follow shots, orbit around subject.

## Camera follows a path

For complex moves:
- Create a curve (Shift+A → Curve → Bezier).
- Shape the curve through the scene.
- Add Follow Path constraint to camera.
- Camera follows the curve over time.

For: dolly shots through environments, complex arc moves, swooping reveals.

## Camera in vehicles / mounts

For: camera attached to character / vehicle:
- Parent camera to the vehicle (Ctrl+P).
- Camera inherits vehicle's motion + adds its own.
- Use case: helmet cam, dashboard cam, drone shots.

For: first-person POV; over-the-shoulder shots.

## Smoothing camera motion

Raw keyframes can look jerky. Smooth via Graph Editor:
- Select camera location / rotation curves.
- Adjust Bezier handles for smooth ease.
- Or: F-Curve Modifiers → Smooth.

For cinematic motion: gradual ease-in + ease-out feels professional.

## Anticipation in camera

Before a quick camera move: pause briefly to anticipate.

Before a fast pan: hold steady for 8-12 frames; then snap.

Before a push-in to dramatic moment: small backward "wind-up" → then push in.

## Stabilization

Tools like Camera Tracker in Blender (or external like Camera Tracker addon):
- Track 2D points in footage.
- Solve camera move.
- Apply to 3D camera.

For: matching CGI camera to live-action footage; integrating 3D into film.

## Camera shake

For dynamic / handheld feel:
- Add small random keyframes to position / rotation.
- Or use noise modifier on F-curves.
- Or attach camera to a mover with random motion.

Subtle (0.5° rotation, 0.05 unit position) = handheld.
Heavy (3° rotation, 0.2 unit) = action / chaos.

## Motion blur

For motion blur on moving objects + moving camera:
- Render Properties → Motion Blur → enable.
- Shutter Speed (default 0.5; 1.0 = longer blur; 0.25 = shorter).

Motion blur adds production value; static still images don't need it, but animation benefits.

Cycles motion blur is more accurate; Eevee approximates.

## Render motion

For animation with camera motion:
- Verify camera move via viewport playback first.
- Test render single frame for color / lighting.
- Test render 5-10 frames for animation smoothness.
- If happy: Render Animation (Ctrl+F12).

Per-frame consistency matters; jerky simulation cache = visible flicker.

## Output for camera moves

Best practice:
- Render PNG sequence (per-frame).
- Verify each frame in the sequence.
- Assemble in post (Premiere / Resolve) with motion blur.

For motion graphics: Eevee renders fast enough that direct animation works.

## Composition during camera moves

As camera moves: framing changes. Plan compositions for both:
- Start position: composition X.
- End position: composition Y.

Both should be intentional. Use composition guides (Camera tab → Camera Display → Composition Guides) at start + end positions.

## Camera cuts

For multi-shot sequences in one .blend file:
- Multiple cameras in scene.
- Use Markers (M key) on the timeline at the frame each shot starts.
- Right-click Marker → "Bind Camera to Markers".
- During render: cameras switch at marker frames.

For: short film sequences in one project.

## Mistakes to avoid

- **Static camera throughout.** Misses cinematic potential.
- **Too much camera motion.** Distracting; viewers lose subject.
- **No ease.** Linear motion feels mechanical.
- **No anticipation.** Sudden moves jarring.
- **Inconsistent moves.** Style drift within a piece.

## Summary

- Camera animation = keyframe Position + Rotation over time.
- Common moves: push, pull, pan, tilt, dolly, truck, crane.
- Track To constraint for follow shots; Follow Path for complex moves.
- Bezier handles + ease for smooth motion.
- Anticipation before fast moves.
- Motion blur in Render Properties for moving footage.
- Render PNG sequence; assemble in post.

Module 5 next: Geometry Nodes, sculpting, production workflow.
