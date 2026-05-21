---
module: 5
position: 1
title: "Prototyping flows and interactions"
objective: "Turn static frames into clickable prototypes for testing and review."
estimated_minutes: 5
---

# Prototyping flows and interactions

## Why prototype in Figma

A static mockup shows the destination. A prototype shows the journey: click → transition → next screen → back. For:
- **Usability tests.** Watch users navigate; spot confusion.
- **Stakeholder review.** Shows the experience, not just screens.
- **Engineer handoff.** Communicates interaction expectations.
- **Self-checks.** Click through your own design; spot dead ends.

Figma's prototype tab makes this fast — no code required.

## The Prototype tab

Right panel has tabs: Design / Prototype / Inspect. Click Prototype to enter prototyping mode.

In Prototype mode, you can:
- Draw connections between frames (drag from node).
- Set triggers (On click, On hover, On drag, After delay).
- Set actions (Navigate to, Open overlay, Change to, Close, Swap variant, Set variable).
- Set animations (Instant, Dissolve, Smart animate, Push, Slide).

## Drawing connections

Select a layer/frame → in Prototype mode → blue node appears on the side → drag to target frame.

A blue arrow shows the connection. Configure trigger + action + animation in right panel.

## Triggers

- **On click.** Most common; user taps.
- **On hover.** Pointer hovers (desktop / iPad with pointer).
- **On press / While pressed.** Touch and hold.
- **On drag.** Swipe gestures.
- **After delay.** Time-based (auto-advance after 2s).
- **Mouse enter / leave.** Hover regions.
- **On key/gamepad.** Keyboard shortcuts.

Pick based on what user behavior triggers the action.

## Actions

- **Navigate to.** Go to another frame.
- **Open overlay.** Modal / popover on top of current frame.
- **Swap with.** Replace current frame content.
- **Change to.** Switch variant of a component.
- **Set variable.** Update a variable value (advanced).
- **Conditional.** Branch based on variable.
- **Back.** Return to previous frame.
- **Close.** Dismiss an overlay.

Most flows use Navigate + Back + Open overlay.

## Animations

- **Instant.** No transition; just swap.
- **Dissolve.** Cross-fade.
- **Smart animate.** Figma interpolates between matching layers (same name) across frames — magical for state transitions.
- **Push.** Slide in from side.
- **Slide in / out.** Modal-style.
- **Move in / out.** Movement combined with transition.

For most flows: Smart animate is the workhorse. Match layer names across frames; Figma animates the changes (position, size, color).

## Smart animate

The killer feature. Two frames with similarly-named layers in different positions → Smart animate interpolates.

Example: Frame 1 has a card at left; Frame 2 has the same card (same layer name) expanded to fill screen. Click → Smart animate → the card smoothly scales + moves.

Layer-name matching is the secret. Get the names right (same name in both frames) and animations come for free.

## Flow starting points

Set a frame as a flow starting point (right-click → "Add starting point"). Multiple starting points per file for different user journeys (onboarding flow, settings flow, checkout flow).

The flow list in the right panel groups starting points; clicking presents the prototype from there.

## Presenting prototypes

Press Present (top right) or Shift+Space → full-screen prototype playback.

Share the prototype URL with stakeholders; they click without needing Figma access (depending on permissions).

For user testing: share via Maze, UserTesting, or in-person — they record interactions.

## Device frames

Wrap prototype in a device chrome (iPhone, iPad, Macbook) for visual context.

Right panel → device dropdown → pick. Shows phone bezel around the design.

Useful for stakeholder reviews where context matters.

## Overlays

For modals, dropdowns, popovers: use Open overlay action.

Set:
- **Position.** Center, top, bottom, custom.
- **Overlay background.** None, dim, blur.
- **Close on outside click.** Yes/no.

Cleaner than navigating to a full-screen frame for transient content.

## Fixed elements

Layers can be "fixed" — stay in place while content scrolls.

Common: navigation bars, floating action buttons. Select layer → Design tab → "Fix position when scrolling" toggle.

In prototype: the layer doesn't scroll with the rest; mimics real app behavior.

## Scroll behavior

Frames with content taller than the frame: scroll. Set overflow:
- **No scrolling.** Content clips.
- **Vertical scroll.** Common.
- **Horizontal.** Carousels.
- **Both.** Maps.

The frame becomes a scroll container in prototype.

## Component prototyping

Prototype interactions on the component, not per-instance:
- Button main component: On click → Change to variant "Pressed".
- Every instance inherits the interaction.

Saves manual wiring per instance.

## Conditional logic

For dynamic prototypes:
- Set variable based on user action (e.g., toggle theme on click).
- Conditional navigation: if variable=dark → go to dark frame.

Enables a single prototype to demonstrate state-aware behavior; advanced but powerful.

## Variables in prototypes

Number / string / boolean variables can drive prototypes:
- Increment a counter on click.
- Toggle a boolean to show/hide.
- Track form field values.

Brings prototypes closer to functional demos.

## Animation timing

Default: 300ms ease-out. Tune per interaction:
- **100-150ms.** Fast micro-interactions (button press).
- **200-300ms.** Standard transitions.
- **400-600ms.** Larger transitions (modal in/out).
- **800ms+.** Hero animations.

Too slow feels sluggish; too fast feels jarring. Test on devices.

## Prototyping for handoff

A clickable prototype communicates more than a static spec:
- Engineers see expected behavior.
- Designers see consistency gaps.
- PMs see the user journey.

Ship prototypes alongside specs; both formats serve different audiences.

## Prototyping for testing

For usability tests:
- Build the full happy-path flow.
- Optional: alternate paths for branching tests.
- Skip non-essential decoration.
- Test on the device users will use (mobile prototype on mobile).

Maze + Figma integration runs unmoderated tests; aggregates data.

## Mistakes to avoid

- **Static when interactive matters.** Demoing a flow without prototype.
- **Smart animate without matching names.** Animations don't work; layers jump.
- **Too many flows.** One file with 30 starting points is confusing.
- **Real data missing.** Lorem ipsum in prototype tests; users react to content.
- **Prototype only on desktop.** Mobile prototype on mobile devices.

## Summary

- Prototype = clickable flow connecting frames via triggers + actions + animations.
- Triggers: On click, hover, drag, delay; pick by user behavior.
- Smart animate is the workhorse; matching layer names enable interpolation.
- Overlays for modals; fixed elements for nav bars; scroll for long content.
- Component-level prototyping; conditional logic; variable-driven interactions.
- Prototype for testing, review, and handoff communication.

Next: Dev Mode and the engineer's view.
