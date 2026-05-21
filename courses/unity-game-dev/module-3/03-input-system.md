---
module: 3
position: 3
title: "Input System (new) and player control"
objective: "Read player input across keyboard, mouse, gamepad, touch."
estimated_minutes: 5
---

# Input System (new) and player control

## The Input System package

Unity's modern input system (replacing legacy Input class). Install via Package Manager → Input System.

Benefits:
- **Cross-platform.** Keyboard, mouse, gamepad, touch, VR.
- **Rebinding.** Players customize keys.
- **Action-based.** Map actions (Move, Jump) to inputs.
- **Events.** Subscribe to input events.

## Input Actions asset

Create: Right-click Project view → Create → Input Actions.

Defines:
- **Action Maps.** Groups of actions (e.g., "Player", "UI").
- **Actions.** Named inputs (Move, Jump, Look).
- **Bindings.** Which physical inputs trigger actions (W=up, A=left, Space=Jump).

## Using Input Actions in scripts

```csharp
public class PlayerController : MonoBehaviour {
  public InputActionAsset inputActions;
  private InputAction moveAction;
  private InputAction jumpAction;

  void Awake() {
    moveAction = inputActions.FindActionMap("Player").FindAction("Move");
    jumpAction = inputActions.FindActionMap("Player").FindAction("Jump");
  }

  void OnEnable() {
    moveAction.Enable();
    jumpAction.Enable();
    jumpAction.performed += OnJump;
  }

  void OnDisable() {
    jumpAction.performed -= OnJump;
    moveAction.Disable();
    jumpAction.Disable();
  }

  void Update() {
    Vector2 move = moveAction.ReadValue<Vector2>();
    transform.Translate(new Vector3(move.x, 0, move.y) * speed * Time.deltaTime);
  }

  void OnJump(InputAction.CallbackContext ctx) {
    rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
  }
}
```

## PlayerInput component

Easier alternative — add PlayerInput component to GameObject:
- Reference the Input Actions asset.
- Behavior: Send Messages / Invoke Unity Events / Invoke C# Events.

Unity calls your script methods automatically (e.g., OnMove(InputValue value)).

For: simpler setup; designer-friendly.

## Action types

- **Value.** Continuous input (movement axis); returns Vector1/2/3.
- **Button.** Discrete (Jump, Fire); triggered phases.
- **Pass Through.** Direct value (for processing in script).

## Binding composites

For multi-key axes (WASD):
- 2D Vector → up/down/left/right bindings (W/S/A/D).
- Result: Vector2 input.

For: keyboard + gamepad equivalent input.

## Multiple Action Maps

For different contexts:
- **Player.** Walking controls.
- **Vehicle.** Driving controls.
- **UI.** Menu controls.

Enable/disable per context: `inputActions.FindActionMap("Vehicle").Enable();`.

## Touch input

For mobile:
- Use OnScreenStick / OnScreenButton (UI elements).
- Or Touch.activeTouches API.

Same Action system; bindings include touch.

## Rebinding

For player keybind customization:
```csharp
var rebindOperation = action.PerformInteractiveRebinding();
rebindOperation.Start();
// Wait for input; rebind saved automatically
```

For: settings UI.

## Common gameplay input pattern

For standard third-person character:
- IA_Move (Value 2D): WASD / left stick.
- IA_Look (Value 2D): mouse / right stick.
- IA_Jump (Button): Space / South button.
- IA_Interact (Button): E / West button.
- IA_Sprint (Button hold): Shift / Left trigger.

For: rebindable, cross-platform character control.

## Input via mobile + console

Unity Input System detects platform; switches bindings automatically:
- Keyboard + mouse on PC.
- Gamepad on console.
- Touch on mobile.

For: same gameplay code; different inputs per platform.

## Mistakes to avoid

- **Using legacy Input class.** Deprecated; doesn't support modern features.
- **No Action setup.** Hardcoded keys; can't rebind.
- **Forgetting Enable/Disable.** Input doesn't fire.
- **No mobile touch support.** Mobile builds fail.

## Summary

- Input System (new): cross-platform, rebindable, action-based.
- Input Actions asset defines actions + bindings.
- PlayerInput component for easy integration.
- Multiple Action Maps for context switching (Player/Vehicle/UI).
- Rebinding API for player customization.

Next: raycasting and detection.
