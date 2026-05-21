---
module: 4
position: 2
title: "Rigging — armatures and weight painting"
objective: "Build a skeleton inside a character so it can pose and animate."
estimated_minutes: 5
---

# Rigging — armatures and weight painting

## What rigging is

Rigging = building the control system for a character. An armature (skeleton) of bones drives the mesh deformation.

- Move/rotate a bone → mesh moves/deforms.
- Bones can have constraints (limits, parents, IK).
- Animators don't touch the mesh; they animate the rig.

Without rigging: characters are static sculptures. With rigging: characters move + emote.

## Armature

Add an armature: Shift+A → Armature.

A single bone appears. Edit Mode (Tab): manipulate bones.

Add bones: E (extrude) — like extruding mesh, creates a connected child bone.

## Bone structure

A bone has:
- **Head.** Start point (root).
- **Tail.** End point.
- **Roll.** Rotation around bone axis.
- **Parent.** Hierarchical parent bone.

Standard character skeleton:
- **Hips (root).** Pelvis.
- **Spine.** 3-5 bones up the back.
- **Neck + Head.**
- **Shoulder + Upper Arm + Lower Arm + Hand.**
- **Hip + Thigh + Lower Leg + Foot.**

Mirror the limbs (left + right) — same structure.

## Bone naming

Standard: Bone.L / Bone.R for left/right. Mirror works on .L / .R suffix automatically.

Naming conventions enable:
- Mirror selection (Shift+select → select mirror).
- Rigify scripts (auto-generate rigs from naming).
- Animation retargeting.

## Parent mesh to armature

Select mesh + armature (last) → Ctrl+P → Armature Deform → With Automatic Weights (or other option).

Blender assigns weights — how much each bone influences each vertex.

Test: select armature → Pose Mode → grab a bone → mesh follows.

## Pose Mode

Armature → Tab → Pose Mode. Now bones are pose-able; the mesh deforms.

- G to move; R to rotate; S to scale (rare for bones).
- Standard transforms; mesh follows.

Animate by keyframing bone poses over time.

## Weight painting

If automatic weights miss the mark: enter Weight Paint mode (with mesh selected).

Paint colors on the mesh:
- **Red.** Full influence (1.0).
- **Blue.** No influence (0.0).
- **Yellow / green.** Partial.

Each bone has its own weight set. Switch between bones via right panel's Bone List.

For: refining where deformation comes from. A shoulder bend that pulls the chest — paint chest weights down.

## Weight painting tools

- **Brush.** Paint weights with brush size + strength.
- **Smooth.** Soften weight transitions.
- **Mix mode.** Add / subtract / multiply weights.

For complex characters: hours of weight painting per joint.

## Common rigging features

**Inverse Kinematics (IK).** Move the end (hand) → arm bones follow as a chain. Vs. Forward Kinematics (rotate shoulder, then elbow, then wrist).

IK is intuitive for animators (just move the hand); FK gives more control over arc.

Setup IK: in Pose Mode → select bone → Bone Constraint → IK → set chain length + target.

**Rigify addon.** Built-in auto-rig generator. Add a meta-rig template; generate the full rig in one click.

For most characters: use Rigify; gives industry-standard rig with IK / FK switching, twist bones, facial controls.

**Custom controls.** Custom shapes for animator interaction (sliders, sphere handles).

## Rigging workflow

1. Model character with deformation-aware topology (Module 1, Lesson 4).
2. Add armature at origin.
3. Position bones inside mesh (spine through center, limbs through limb interior, head bone in skull).
4. Parent mesh to armature with Automatic Weights.
5. Test in Pose Mode; verify deformation.
6. Paint weights to fix problem areas (knees, elbows, shoulders).
7. Add constraints (IK on limbs, twist on spine).
8. Add custom controls if needed.
9. Save as a template / asset for reuse.

For first rig: this takes 2-8 hours. For 100th rig: 30 minutes.

## Rigify

Enable in Preferences → Add-ons → search "Rigify". Then Shift+A → Armature → Human / Quadruped / etc.

Position the meta-rig bones in your character's body.

Click Generate Rig in the Properties panel → Rigify creates a fully-functional rig with controls.

For most characters: Rigify is faster and more capable than hand-rigging.

## Inverse Kinematics deep dive

IK simplifies posing limbs:
- **Without IK (FK).** Rotate shoulder → upper arm rotates → rotate elbow → forearm rotates → rotate wrist → hand rotates. Hand position derived from chain.
- **With IK.** Move IK target → upper arm + elbow + wrist + hand all rotate to reach target. Hand position drives chain.

For walking / reaching / grabbing: IK is natural.
For arc-driven motion (swing, throw): FK gives more control.

Pro rigs: IK with FK switching (animator picks which).

## Facial rigging

Faces are complex:
- **Shape keys.** Each facial expression saved as a vertex displacement. Mix to interpolate.
- **Bones for jaw / eyes.** Standard rigging for these.
- **Custom controls.** Sliders for "happy", "angry", "talking".

For animation-ready characters: combination of shape keys + bones.

## Pose libraries

Save common poses for reuse:
- Action Editor → save Action as pose.
- Apply to other characters or future animations.

For: walk cycles, idle stances, expressions.

## Animation on rigged characters

After rigging:
- Pose Mode → set keyframes on bones over time.
- Action Editor / NLA Editor for organizing.
- Dope Sheet for per-bone timing.

Same animation principles as Module 4 Lesson 1; just applied to bones.

## Mistakes to avoid

- **Bad mesh topology.** Even great rig + weights fail without joint loops.
- **Bones not oriented correctly.** Roll affects animation; check via Edit Mode → Armature → Recalculate Roll.
- **Automatic weights only.** Often need manual paint refinement.
- **No mirror.** Painting one side; opposite side stays default.
- **No constraints.** Limbs can rotate beyond physical limits.

## Summary

- Rigging = building a control system (armature) for a character.
- Bones drive mesh deformation via weight painting.
- Standard skeleton: hips, spine, neck, head, shoulders, arms, hips, legs.
- Automatic weights as start; manual weight paint to refine.
- IK simplifies limb posing; FK gives arc control.
- Rigify auto-generates production-grade rigs.
- Pose Mode for animation; Edit Mode for armature editing.

Next: physics simulations.
