---
module: 2
position: 4
title: "Cameras and composition"
objective: "Frame your renders intentionally; use camera fundamentals from photography."
estimated_minutes: 5
---

# Cameras and composition

## Adding a camera

Shift+A → Camera. Or use the default Camera in starting scenes (Cube + Camera + Light).

The active camera (orange dashed line in viewport) is what renders.

Press Numpad 0 to view through the camera ("camera view").

## Camera properties

Camera tab in Properties panel:
- **Lens.** Type (Perspective, Orthographic, Panoramic).
- **Focal Length.** mm — Wider = more in frame; Narrower = compressed perspective.
- **Sensor.** Width / Height — virtual sensor size.
- **Clipping.** Start / End — depth range rendered.
- **Depth of Field.** Focus distance + aperture (f-stop).
- **Camera Display.** Visibility helpers (passepartout, composition guides).

## Focal length matters

Like real cameras:
- **18-24mm.** Wide-angle. Lots in frame; perspective distortion at edges.
- **35-50mm.** Standard / "natural" view. Most realistic look.
- **85-135mm.** Portrait. Slight compression; flattering for faces.
- **200mm+.** Telephoto. Background compressed; distant subjects.

For character portraits: 85-135mm.
For landscape / architecture: 24-35mm.
For wide establishing shots: 18-24mm.
For product close-ups: 50-100mm.

## Focal length affects perspective

Wide lenses exaggerate depth (foreground big, background small).
Long lenses compress depth (foreground + background appear closer together).

For a portrait: wide lens (24mm) close-up = big nose, distorted face. Same subject with 85mm lens from further back = flattering.

Pick focal length based on intent, not just framing.

## Camera position

In viewport: select Camera → G to move; R to rotate; numpad 0 to verify view.

Lock the view to camera: N panel → View → "Camera to View" — moving viewport now moves camera.

Or: select camera + view through it; use Walkthrough Mode (Shift+`) for game-like navigation.

## Composition rules

Centuries of art / photography give us:

**Rule of Thirds.** Divide frame into 3x3 grid. Place key elements on grid lines / intersections, not centered.

**Leading Lines.** Lines in the scene (roads, fences, perspective edges) guiding eye to subject.

**Framing.** Foreground elements (doorways, branches) framing subject.

**Symmetry.** Centered composition; for monumental / formal subjects.

**Diagonal.** Diagonal compositions feel dynamic; horizontal/vertical feel stable.

Enable composition guides: Camera tab → Camera Display → Composition Guides → toggle (Rule of Thirds, Golden Ratio, Diagonals).

## Depth of field

DoF = which depth range is in focus; rest blurs.

Setup:
- Camera tab → Depth of Field → enable.
- Set Focus Distance (or pick a target object to focus on).
- Set Aperture (f-stop): low (f/1.4) = shallow DoF; high (f/16) = deep DoF.

For portraits: shallow DoF blurs background; subject pops.
For landscape: deep DoF; everything sharp.
For product macro: very shallow; selective focus.

DoF adds production value; flat-focused images often look "rendered" while DoF feels "photographed."

## Aspect ratio

The render's width:height. Common:
- **16:9.** YouTube / film.
- **4:3.** Older TV.
- **1:1.** Instagram square.
- **9:16.** Vertical (TikTok, Reels).
- **2.35:1 (Cinemascope).** Cinematic widescreen.

Set in Output Properties → Format → Resolution X/Y.

Sequence + framing change per ratio; design composition for the ratio.

## Field of view (FOV)

Alternative to focal length. Specifies the cone of view in degrees.

- 90° = wide.
- 50° = normal.
- 20° = telephoto.

Adjust in Camera tab → Lens → Field of View.

Most artists use focal length; FOV is alternative for those used to game-camera terminology.

## Camera animation (preview)

Cameras can be animated:
- Move + rotate over time (keyframes).
- Follow paths (Constrain to curve).
- Track objects (Tracking constraint).

Covered in Module 4 (animation).

## Multiple cameras

Multiple cameras in scene:
- Different views / shots.
- Switch active camera: select camera → Ctrl+Numpad 0.

For producing multiple renders from same scene: one camera per shot.

## Composition for character portraits

Standard approaches:
- **Headshot.** Tight on face; eyes on upper-third line.
- **Mid-shot.** Chest up; subject takes ~60% of frame.
- **Full body.** Head-to-toe; subject ~75% of frame height.
- **Action shot.** Wider; subject + environment.

## Composition for environments

- **Wide.** Establishes location; lots of detail.
- **Medium.** Specific area; some context.
- **Detail.** Tight on objects within the environment.

For a scene: one wide + several mediums + several details = a story sequence.

## The horizon line

Where the horizon falls in frame matters:
- **Center.** Balanced; static.
- **Upper third.** Foreground prominent.
- **Lower third.** Sky / atmosphere prominent.

For wide landscapes: lower-third or upper-third horizon often more compelling than centered.

## Camera shake

For dynamic shots:
- Add Camera Shake addon (or animate small random motion).
- Used for action sequences, found-footage style.

Subtle (0.5° rotation, 0.05 unit position) adds life.
Heavy shake (2°, 0.1 unit) implies action/chaos.

## Lens distortion

For stylized renders:
- Add Lens Distortion effect (Compositing).
- Adds barrel / pincushion distortion mimicking real lenses.

Useful for VFX integration with live-action footage.

## Camera position helpers

For complex framing:
- **Look at a target.** Object Constraints → Track To (camera always points at target).
- **Follow a path.** Object Constraints → Follow Path.
- **Lock to object.** Parent camera to a moving object.

For dolly shots: animate camera + parent to subject.

## Mistakes to avoid

- **Default camera position never changed.** Boring framing.
- **Wide lens too close to subject.** Distortion; unflattering.
- **No composition guide use.** Random framing.
- **No DoF on close-ups.** Renders look flat.
- **Wrong aspect ratio for target.** Cropping disaster.

## Summary

- Camera = focal length + position + DoF + aspect ratio.
- 50mm "natural"; wide for landscape; long for portrait.
- Rule of Thirds and other composition guides for framing.
- DoF separates subject; adds production value.
- Multiple cameras for different shots in one scene.
- Composition for stories: wide → medium → detail.

Module 3 next: rendering — Cycles vs. Eevee.
