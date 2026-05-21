---
module: 1
position: 4
title: "Topology and edge flow"
objective: "Build meshes that deform well and look right at every angle."
estimated_minutes: 5
---

# Topology and edge flow

## What topology is

Topology = the arrangement of polygons + edges in a mesh. Good topology has:
- **Clean, predictable flow.** Edge loops follow form curves (around eyes, lips, joints).
- **All quads** (when possible).
- **No N-gons** (5+ sided faces).
- **Even density.** Not 1000 polygons in one cm² and 5 in another.
- **No long, thin triangles.** Cause shading artifacts.

Bad topology shows up in: animation deformation, smoothing artifacts, texture stretching.

## Quad-dominant meshes

Aim for ~95% quads + small amount of triangles (where unavoidable).

Triangles tolerable on flat surfaces or in tight corners. Avoid in deformation areas (joints, face).

For final game export: meshes get triangulated automatically; modeling stays quad-friendly.

## Edge loops

A loop = chain of edges that forms a closed ring or follows a continuous path. Loops define topology:
- **Face loops** around eyes / mouth / nostrils.
- **Body loops** at joints (shoulders, elbows, knees).
- **Object loops** following primary curves.

Good models have loops that look like flow lines around the form.

## Why edge flow matters

Edge flow follows the underlying form. For a face:
- Loops around the eye (eye socket curve).
- Loops around the mouth (lip curve).
- Loops following the cheekbone.
- Loops down the jawline.

This means when the face deforms (smile, frown, talk), the geometry has the right topology to deform smoothly. Random topology = ugly deformation.

For mechanical objects: loops follow primary form lines (around a bolt, along a panel edge).

## Avoid pinches and N-gons

A pinch = vertex with too many edges meeting (e.g., 6+). Causes shading artifacts; hard to deform.

An N-gon = face with 5+ vertices. Subsurf produces weird results.

Refactor: split N-gons into quads via knife cuts; redistribute pinches by adding loops.

## Subdivision Surface and topology

Subsurf is unforgiving of bad topology. It exaggerates:
- N-gons → distortion at face center.
- Pinches → smoothing artifacts.
- Triangles in subdivision flow → pinched bumps.

Models intended for Subsurf must have clean topology. The "cube + Subsurf" approach common in YouTube tutorials only works because the cube is already topologically clean.

## Topology in practice

For a character head:
- Loops around eye (3-5 concentric).
- Loops around mouth (3-5).
- Loops down jaw to neck.
- Loops across forehead.
- Density: more loops near features (eye, mouth); fewer on smooth cheek.

For a mechanical arm:
- Loops around elbow (3-5 for joint).
- Loops along forearm (cylinder topology).
- Loops at wrist (transition point).

For a chair:
- Loops following seat curve.
- Loops along legs.
- Loops at joints (where leg meets seat).

## Loop direction matters

Two ways to add a loop:
- **Loop Cut (Ctrl+R).** Adds perpendicular to clicked edge.
- **Adjacent loops.** Add by extruding edge ring.

For deformation: loop direction should be perpendicular to the deformation direction. Knee bends front-to-back; loops should be around the knee (perpendicular to leg axis).

## Pole types

A pole = vertex with non-standard valence (3 or 5+ edges meeting, vs. standard 4).

Common pole types:
- **N-pole.** 3 edges meeting. Acceptable at "convergence" points (top of sphere).
- **E-pole.** 5 edges meeting. Acceptable but produces a "star" pattern.
- **Six+-pole.** Avoid; pinch artifacts.

Pro modelers manage pole placement intentionally; hide poles in non-visible areas, on flat surfaces.

## Quad sphere

A standard UV sphere has triangular poles at top and bottom — bad topology for subdivision.

A quad sphere (subdivide a cube + sphere modifier) has all quads + no poles. Better for modeling.

For sculpting / character heads: start from a quad sphere.

## Retopology

For sculpted high-detail models: retopology = creating clean low-poly topology over the sculpt for animation / game use.

Tools:
- **Shrinkwrap modifier.** Wraps new mesh to surface of sculpt.
- **Snap to surface.** Modeling snap mode.
- **Retopo tools (Quad Remesher addon, RetopoFlow addon).** Automated + assisted retopo.

For sculpt → animation-ready pipeline: retopology is the bridge.

## Topology for game vs. film

- **Game.** Low-poly count; tight quads; LODs (multiple resolution versions).
- **Film.** Higher polygon counts; complex topology; less budget-constrained.

Game modeling is constrained art; film modeling is more permissive.

## Checking topology

In Edit Mode:
- **Select by Trait → All Triangles / N-gons.** Highlights problem faces.
- **Mesh → Cleanup → Merge by Distance.** Removes hidden duplicates.
- **Statistics in viewport overlay.** Shows total vertices / edges / faces.

For dense meshes: spot N-gons quickly via these tools.

## Cleaning up topology

Common cleanup operations:
- **Merge by Distance.** Removes overlap.
- **Knife (K).** Cut N-gons into quads.
- **Bridge Edge Loops.** Connects two edge loops with quads.
- **Grid Fill.** Fills a hole with quads in a grid pattern.
- **Triangulate / Untriangulate.** Convert between.

For inherited / imported meshes with bad topology: cleanup is the first step.

## Smooth shading

After modeling: right-click → Shade Smooth. Faces appear smooth instead of faceted.

For mixed: Shade Smooth on most; Mark Sharp on hard edges (Edge menu → Mark Sharp).

Auto Smooth (Object Data Properties → Normals): smooths edges below threshold angle (default 30°), sharp above.

For mechanical objects with mixed sharp + smooth: Auto Smooth is the modern standard.

## Mistakes to avoid

- **Random topology.** Loops don't follow form.
- **N-gons everywhere.** Subsurf artifacts.
- **Triangles in deformation areas.** Joints fold wrong.
- **Pinches at character joints.** Animation looks bad.
- **No edge loops at joints.** Insufficient deformation control.

## Summary

- Topology = arrangement of polygons / edges in a mesh.
- Good topology: quad-dominant, even density, edge loops following form.
- Edge loops define deformation (around eyes, joints, lips).
- Subsurf demands clean topology to look right.
- Poles (3 or 5+ edges) should be hidden / managed.
- Retopology bridges sculpting to animation-ready meshes.
- Smooth shading + Mark Sharp + Auto Smooth for mixed surface treatment.

Module 2 next: materials, lighting, cameras.
