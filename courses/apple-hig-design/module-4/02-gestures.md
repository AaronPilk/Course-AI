---
module: 4
position: 2
title: "Gestures: tap, swipe, drag, long-press, force"
objective: "Designing gestures that feel native."
estimated_minutes: 5
---

# Gestures: tap, swipe, drag, long-press, force

## Apple's gesture language

iOS users have learned a gesture vocabulary over a decade:
- **Tap.** Activate / select.
- **Double-tap.** Special action (zoom, like).
- **Swipe.** Navigate / dismiss / reveal.
- **Pinch.** Zoom.
- **Drag.** Move objects; scroll.
- **Long-press.** Context menu / drag start.
- **3D Touch / Haptic Touch.** Deeper press; previews / shortcuts.

Each has standard meaning. Reuse them where they fit; invent new ones rarely.

## Standard gestures map to UX

Apple-standard mappings:

- **Tap row.** Open detail.
- **Swipe row leading-to-trailing.** Delete / reveal actions.
- **Swipe row trailing-to-leading.** Custom actions.
- **Pull down to refresh.** Refresh list.
- **Swipe down from top edge.** Notification center.
- **Swipe up from bottom edge.** Control center / home.
- **Swipe right from left edge.** Back navigation.

These are system-reserved. Your app should respect them; not override.

## Building custom gestures

SwiftUI:

```swift
.onTapGesture { tap() }
.onLongPressGesture { longPress() }
.gesture(
  DragGesture()
    .onChanged { value in ... }
    .onEnded { value in ... }
)
```

For complex gestures (pinch + drag combined), use `GestureState` and `simultaneously()` modifiers. Reference: Apple's gesture documentation.

## Discoverability — the gesture problem

Gestures are powerful but invisible. Users can't see what they don't know exists.

Solutions:
- **Onboarding hints.** Brief intro showing "swipe to delete."
- **Visual affordances.** Drag indicators, swipe icons next to rows.
- **Hover hints** (iPad with trackpad / Mac).
- **Defaults that don't require gestures.** Tap to do main action; gesture as shortcut.

Apple sometimes fails at this; users discover gestures by accident. Don't compound the problem.

## Tap targets — 44pt minimum

Already covered in Module 1. Reiterating: 44×44pt for any tappable element. Smaller fails ergonomics.

Use the `.contentShape` modifier in SwiftUI to expand tap area beyond visible:

```swift
Image("icon")
  .frame(width: 24, height: 24)
  .contentShape(Rectangle().size(width: 44, height: 44))
  .onTapGesture { ... }
```

Visible 24pt icon; 44pt tap target. Best of both.

## Swipe actions

Standard on list rows:

```swift
List {
  ForEach(items) { item in
    ItemRow(item)
      .swipeActions(edge: .trailing) {
        Button(role: .destructive) { delete(item) } label: {
          Label("Delete", systemImage: "trash")
        }
      }
      .swipeActions(edge: .leading) {
        Button { mark(item) } label: {
          Label("Flag", systemImage: "flag")
        }
      }
  }
}
```

Trailing swipe (right-to-left): typically destructive (delete, archive).
Leading swipe (left-to-right): typically other actions (flag, mark read).

Color-code: red for destructive; blue / accent for actions.

## Long-press for context menu

Modern pattern: long-press an item to show context menu (preview + actions).

```swift
ItemRow(item)
  .contextMenu {
    Button("Edit") { edit() }
    Button("Share") { share() }
    Button("Delete", role: .destructive) { delete() }
  } preview: {
    PreviewView(item)
  }
```

Replaces 3D Touch / Peek-and-Pop (deprecated). Works on any device.

## Drag and drop

For iPad / Mac / sometimes iPhone:

```swift
Image("photo")
  .draggable(photo)

DropZone
  .dropDestination(for: Photo.self) { photos, location in
    handle(photos)
    return true
  }
```

Cross-app drag (drag from Photos to your app), reorder within app. iPad multitasking benefits enormously.

## Drag-to-reorder

Built-in on List:

```swift
List {
  ForEach(items) { item in
    ItemRow(item)
  }
  .onMove { source, dest in
    items.move(fromOffsets: source, toOffset: dest)
  }
}
.environment(\.editMode, .constant(.active))
```

The "edit mode" reveals drag handles; users drag to reorder. Standard UX; respect.

## Pinch to zoom

For photos, maps, custom canvases:

```swift
.gesture(
  MagnificationGesture()
    .onChanged { scale = $0 }
)
```

iOS expects pinch on photos / maps. If your app shows imagery and doesn't support pinch — users try and feel betrayed.

## Edge gestures and system

Some screen edges are reserved:
- Top edge (notification center / status bar interaction).
- Bottom edge (home gesture on Face ID devices).
- Left edge (back navigation in many apps).

Don't compete with these. Avoid gestures that conflict with system gestures at these edges.

## Reduce Motion impact

For users with Reduce Motion enabled, gesture-based animations should:
- Skip dramatic transitions.
- Show end state immediately (or with minimal motion).
- Avoid parallax / 3D effects.

Apply only to non-essential motion; the gesture itself remains.

## Pointer (trackpad / mouse on iPad / Mac)

iPad with trackpad + Mac apps have a pointer. Apple's pointer adapts:
- Hover over a button: pointer morphs to fill the button.
- Hover over text: I-beam cursor.
- Hover over draggable: hand.

```swift
.hoverEffect()                  // automatic morphing
.cursor(.pointingHand)          // Mac
```

Use hover affordances on iPad / Mac to show what's interactive. iPhone has no hover so this matters less there.

## Voice / accessibility input

Some users use Voice Control or Switch Control instead of gestures. These rely on standard control accessibility — VoiceOver labels, traits, hint text.

Custom gestures often break these. Plan: gestures should have non-gesture equivalents (tap a button to do the same thing). Power user via gesture; everyone else via button.

## Mistakes to avoid

- **Hidden critical actions behind gestures.** Discoverability disaster.
- **Custom gestures conflicting with system.** Back swipe doesn't work.
- **No tap fallback for gestures.** Excludes assistive input.
- **Tap targets < 44pt.** Mistaps.
- **Cluttered swipe actions.** 5+ swipe actions confusing; 1-3 max.

## Summary

- Standard gestures: tap, swipe, drag, pinch, long-press. Reuse meanings.
- Discoverability: provide visual hints + tap alternatives.
- 44pt minimum tap target; `.contentShape` to expand beyond visible.
- Swipe actions on lists; trailing for destructive.
- Long-press for context menus (replaces 3D Touch).
- Hover effects on iPad / Mac via `.hoverEffect()`.
- Always offer non-gesture path for accessibility input.

Next: motion design.
