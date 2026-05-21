---
module: 5
position: 2
title: "Character movement and input"
objective: "Build responsive character controls."
estimated_minutes: 5
---

# Character movement and input

## Character class

Character = specialized Pawn for humanoid players:
- **Capsule component.** Collision shape (default ~96cm tall × 34cm radius).
- **Skeletal Mesh component.** Visible character mesh.
- **Character Movement Component.** Handles physics-based movement.
- **Camera support.** Spring Arm + Camera often attached.

Created via Blueprint Class → Character.

## Character Movement Component

The workhorse:
- **Walking.** Standard movement on ground.
- **Falling.** Gravity affects.
- **Swimming.** Different physics in water volumes.
- **Flying.** Free movement.
- **Custom.** Define your own.

Most movement just works out of the box.

## Movement properties

Configurable in Character Movement Component:
- **Max Walk Speed.** Default 600 cm/s (~ jogging pace).
- **Max Acceleration.** How fast they reach max speed.
- **Braking Deceleration.** How fast they stop.
- **Jump Z Velocity.** Jump height.
- **Air Control.** Movement while airborne (0-1).
- **Gravity Scale.** Gravity multiplier.

Tune for character feel: heavier = lower acceleration; lighter = higher.

## Enhanced Input setup

Modern UE5 uses Enhanced Input System:
1. **Input Action.** What you want to do (Move, Look, Jump, Interact).
2. **Input Mapping Context.** Which keys / buttons trigger which Input Actions.
3. **In Player Controller (or Character).** Add Input Mapping Context on BeginPlay; bind action events.

## Common Input Actions

For third / first person character:
- **IA_Move (Value Type: Axis 2D).** WASD or left stick.
- **IA_Look (Value Type: Axis 2D).** Mouse or right stick.
- **IA_Jump (Value Type: Digital).** Space or Bottom Face Button.
- **IA_Interact (Value Type: Digital).** E or Right Face Button.
- **IA_Sprint (Value Type: Digital).** Shift or Left Trigger.
- **IA_Crouch (Value Type: Digital).** Ctrl or Right Stick Click.

For: standard control scheme; remappable.

## Movement Blueprint

In Character Blueprint:
1. Enhanced Input Action event for IA_Move.
2. Get input value (Axis 2D → X (left/right), Y (forward/back)).
3. Add Movement Input (forward direction × Y; right direction × X).
4. Character Movement Component handles physics.

For: standard movement; works for first / third person.

## Look Blueprint

1. Enhanced Input Action event for IA_Look.
2. Get input value (Axis 2D → X (yaw), Y (pitch)).
3. Add Controller Yaw Input (X).
4. Add Controller Pitch Input (Y, inverted depending on convention).

For: standard mouse / right-stick look.

## Jump

1. Enhanced Input Action event for IA_Jump (Started phase).
2. Call Character.Jump() function.
3. Stop event: Character.StopJumping() function.

For: standard jump.

## Camera setup

For third person:
- Spring Arm component attached to character.
- Camera component at end of Spring Arm.
- Spring Arm follows + lags behind character; camera looks at character.

For first person:
- Camera component attached at head height.
- No Spring Arm needed.

## Spring Arm

For smooth camera following:
- **Target Arm Length.** Distance behind character.
- **Lag.** Smooth follow (Camera Lag = true; Camera Lag Speed = 10 typical).
- **Inherit Rotation.** Whether arm rotates with character.

For polished third-person camera.

## Aim Offset

For: character upper body aims with mouse / right stick.

Use Aim Offset Blend Space in Animation Blueprint; drives upper body rotation independent of lower body movement.

For: shooters, action games.

## Crouching

Character has built-in crouching:
- Crouch() / UnCrouch() functions.
- Character automatically adjusts capsule + mesh.
- Movement Component handles crouched walk speed.

For: stealth / shooters.

## Sprinting

Standard pattern:
- IA_Sprint → set Character Movement Component → Max Walk Speed = 900 (or higher).
- IA_Sprint Released → restore default 600.

For: variable movement speed.

## Animation Blueprint

For driving animations from movement:
- Animation Blueprint linked to Character.
- Variables for Speed, Direction, IsCrouching, IsJumping.
- State machines transition between animations based on variables.

For: smooth character animation.

## Walk-jog-run blendspace

For varying movement speeds:
- Blend Space (1D) with input = Speed.
- Animations: Walk (200), Jog (400), Run (600).
- Engine interpolates based on actual speed.

For: realistic movement animation.

## Locomotion

Locomotion = the complete movement + animation system. Include:
- Walking + running.
- Jumping + landing.
- Sliding / crouching.
- Climbing (if applicable).
- Vaulting (if applicable).
- Idle variations.

For polished characters: Locomotion is a substantial system. Marketplace asset packs help.

## Input mapping contexts at runtime

Switch active Input Mapping Context for different gameplay modes:
- IMC_Walking active when on foot.
- IMC_Vehicle active when driving.
- IMC_Menu active when UI is open.

Add / Remove via Blueprint.

For: contextual input (driving vs. walking has different controls).

## Multiplayer movement

Movement Component handles networking:
- Client predicts movement.
- Server validates.
- Replicates to other clients.

For multiplayer: works out of the box. For polish: tune prediction settings.

## Mistakes to avoid

- **Tick-based movement code.** Use input events.
- **No animation blueprint.** Character T-poses.
- **Default Movement Component values.** Often too generic.
- **No spring arm camera lag.** Jerky camera.
- **All input via legacy axis mappings.** Use Enhanced Input.

## Summary

- Character = specialized Pawn with movement system.
- Enhanced Input System: Input Actions + Input Mapping Context.
- Common actions: Move, Look, Jump, Interact, Sprint, Crouch.
- Character Movement Component handles physics.
- Spring Arm + Camera for third person; Camera attached to head for first person.
- Animation Blueprint drives character animation from movement variables.
- Locomotion systems polish movement + animation.

Next: saving and loading.
