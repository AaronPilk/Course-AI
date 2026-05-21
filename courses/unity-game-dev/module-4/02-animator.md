---
module: 4
position: 2
title: "Animator — state machines for animation"
objective: "Drive character + object animations via state machines."
estimated_minutes: 5
---

# Animator — state machines for animation

## Animation Controller

Asset that defines an Animator state machine. Create: Project view → Animator Controller.

Open in Animator window (Window → Animation → Animator).

## States + transitions

- **States.** Each is an animation clip (Idle, Walk, Run, Jump, Attack).
- **Transitions.** Lines between states with conditions.
- **Default state.** Plays at start (orange).

Right-click → Create State → assign Animation Clip.

Drag from state to state → adds Transition.

## Parameters

For controlling transitions:
- **Float / Int.** Numeric (Speed = 5).
- **Bool.** Boolean (IsJumping = true).
- **Trigger.** One-shot signal (Attack!).

Set in code: `animator.SetFloat("Speed", currentSpeed);`. Transitions check parameter conditions; trigger when met.

## Common state machine patterns

**Walking character:**
- Idle ↔ Walk (transition on Speed > 0.1).
- Walk ↔ Run (transition on Speed > 5).
- Anywhere ↔ Jump (transition on IsJumping = true).
- Jump ↔ Land ↔ Idle.

**Combat:**
- Idle → Attack (trigger).
- Attack → Idle (after duration).

## Blend Trees

For smooth multi-animation blending:
- 1D Blend Tree: blend by single parameter (Speed → Idle / Walk / Run).
- 2D Blend Tree: blend by two parameters (X and Y movement → 8-direction movement).

For: locomotion (continuous transition between Walk + Run based on speed).

## Animation events

In Animation Clip:
- Add Events at specific frames.
- Each Event calls a method on a script attached to the GameObject.

For: footstep sounds; combat hit frames; spawn projectile at swing peak.

## IK (Inverse Kinematics)

For dynamic animation:
- Hands placed on objects (gun grip, climbing).
- Feet adjusted for terrain.

OnAnimatorIK callback in script; set IK targets.

For: realistic character interactions with environment.

## Avatar Masks

For partial animation:
- Upper-body shooting while running.
- Mask defines which body parts are animated by which layer.

For: layered animations (run + shoot simultaneously).

## Layers

Multiple animation layers:
- Base layer: locomotion.
- Upper body layer: shoot / reload.

Blend weights between layers. For: complex character behavior.

## Mistakes to avoid

- **Too many states.** State machine spaghetti.
- **No transition conditions.** Stuck in state.
- **Long blocking transitions.** Sluggish feel.
- **No Animator on GameObject.** Animations don't play.

## Summary

- Animator Controller = state machine for animation.
- States (clips) + transitions (with conditions) + parameters (floats / bools / triggers).
- Blend Trees for smooth blending between similar animations.
- Animation Events for synced code calls.
- IK + Avatar Masks + Layers for advanced animation.

Next: Timeline.
