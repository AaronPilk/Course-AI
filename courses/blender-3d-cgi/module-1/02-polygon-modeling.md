---
module: 1
position: 2
title: "Polygon modeling fundamentals"
objective: "Build 3D shapes from primitives using the core modeling tools."
estimated_minutes: 5
---

# Polygon modeling fundamentals

## What polygon modeling is

A 3D mesh is built from polygons — flat shapes (triangles, quads) connected at shared edges and vertices.

Vertex = a point in 3D space (x, y, z).
Edge = a line between two vertices.
Face = a polygon enclosed by edges (usually 3 vertices = triangle, 4 = quad).

Polygon modeling = building shapes by manipulating these elements.

## Quads vs. tris

Most modeling uses quads (4-sided faces):
- **Easier to subdivide** cleanly.
- **Better for animation deformation.**
- **Cleaner topology** (predictable flow).

Triangles are fine for static models / game export but messier for ongoing modeling work.

Aim for all-quad models during modeling; tris are fine for final export.

## The starting cube

The default scene has a cube. It's polygons (6 quad faces, 12 edges, 8 vertices). The starting point for many models.

Delete it (X) and add a new primitive (Shift+A) — sphere, cylinder, cone, torus, plane, monkey (Suzanne — Blender's mascot).

## Primitives are starting shapes

Most models start from primitives. You modify into the shape you need:
- **Cube** → buildings, boxes, base for character bodies.
- **Sphere** → balls, heads, planets.
- **Cylinder** → pillars, bottles, limbs.
- **Plane** → ground, walls, fabric.

Sculpting (Module 5) lets you start with high-detail organic shapes from primitives.

## Core modeling operations

In Edit Mode:
- **Extrude (E).** Push selected faces out, creating new geometry. Most-used operation. Press E, drag, click to confirm.
- **Inset (I).** Inset a face into itself, creating a smaller face inside.
- **Bevel (Ctrl+B).** Round / chamfer edges and corners.
- **Loop Cut (Ctrl+R).** Add a loop of new edges around the mesh.
- **Knife (K).** Cut new edges by drawing.
- **Subdivide.** Right-click → Subdivide. Splits faces into smaller faces.
- **Merge (M).** Combine vertices into one.

Master these 7 and you can model 80% of shapes.

## Extrude in detail

E:
- E + Z + 2: extrude 2 units up Z.
- E then click without moving: creates a duplicated face on top of original (zero offset; useful as a setup move).
- E + S: extrude then scale (useful for tapered shapes).
- Alt+E: extrude with options (Region, Individual Faces, Along Normals).

Extrude is how organic + architectural forms grow.

## Inset

I:
- Click a face → I → drag inward → confirm. Creates a new inset face.
- I + Number: precise inset amount.
- I + I: individual face inset (each face inset separately).

Used for: window frames, panel details, ridges around button surfaces.

## Bevel

Ctrl+B on edges:
- Drag for amount.
- Scroll to add segments (multi-segment bevel = rounded look).
- B+S to limit bevel to specific edges.

For hard edges: 1-segment bevel hides the "razor sharp" look.
For soft / curved corners: 3-5 segments give pillowy bevel.

Real-world objects never have perfectly sharp edges; bevels add realism.

## Loop Cut

Ctrl+R:
- Hover over an edge to add a loop perpendicular to it.
- Click to confirm placement; drag to slide.
- Scroll to add multiple cuts at once.

Loop cuts add topology where you need detail / deformation control. Essential for adding edges where the mesh needs to bend (knees, elbows, lips).

## Knife

K:
- Click vertices to cut new edges.
- Enter to confirm; Esc to cancel.

For precise / non-loop cuts. Tedious for many cuts; useful for surgical work.

## Subdivide

Right-click → Subdivide:
- Each face splits into 4.
- More subdivisions = smoother / denser mesh.

Limit subdivisions; over-subdivision = laggy mesh.

Use Subdivision Surface Modifier (next lesson) for smooth surfaces without high polygon count.

## Selection growing / shrinking

- **Ctrl + numpad +.** Grow selection by adjacent vertices.
- **Ctrl + numpad -.** Shrink.

For organic propagation: start with one vertex; grow to surrounding region.

## Loop selection

Alt+click on an edge:
- Selects the edge loop (all edges in a continuous loop around the mesh).

Useful for: ring around a sphere, belt around a cylinder.

Edge ring selection: Ctrl+Alt+click — selects the perpendicular ring.

## Merge

M (in Edit Mode):
- **At Center.** Merge to average position.
- **At Cursor.** Merge to 3D cursor.
- **At First / Last.** Merge to specific vertex.
- **By Distance.** Merge vertices within a threshold (cleans up duplicates).

For cleanup: Merge By Distance removes hidden duplicate vertices.

## Mirror modeling

For symmetrical models (characters, vehicles):
- Mirror Modifier (next lesson).
- Or: model one half; duplicate + flip; merge along center.

Symmetry doubles your modeling efficiency for symmetric forms.

## Snap to vertices / edges / faces

Magnet icon in viewport header → Snap. Configure target (vertex, edge, face) and source (median, closest, etc.).

For precise alignment: snap vertices to neighbors; snap faces to faces.

## Proportional editing

O key toggles. With it on: moving a vertex pulls nearby vertices proportionally.

- Scroll to adjust falloff radius.
- Different falloff shapes (Smooth, Random, Sphere).

For organic shape adjustments: proportional editing creates smooth deformations.

## Apply transforms

After scaling / rotating / moving an object in Object Mode: Ctrl+A → Apply (Location / Rotation / Scale).

Without applying: weird behavior in later operations (modifiers, animation, scripting). Apply scales especially.

Pro habit: apply transforms before complex modifier setups.

## Origin

Each object has an origin point — orange dot. Transformations rotate around it.

Reset: Object → Set Origin → Origin to Geometry (places at center of mesh) or Origin to 3D Cursor.

For animation: origin point matters (rotates around it).

## Mistakes to avoid

- **N-gons (faces with 5+ vertices).** Behave weirdly in deformation + smoothing.
- **No quads.** All-triangle meshes harder to model.
- **Hidden duplicates.** Apply Merge By Distance.
- **Forgetting to apply scale.** Modifiers behave oddly.
- **Over-subdivided geometry.** Slow viewport.

## Summary

- Polygon modeling: build from vertices / edges / faces; modify primitives.
- Core operations: Extrude (E), Inset (I), Bevel (Ctrl+B), Loop Cut (Ctrl+R), Knife (K), Subdivide, Merge (M).
- Quads > tris for ongoing modeling.
- Edge loops for topology + deformation control.
- Proportional editing for organic adjustments.
- Apply transforms before complex modifier setups.

Next: modifiers — non-destructive modeling.
