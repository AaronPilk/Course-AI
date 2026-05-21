---
module: 4
position: 1
title: "Standard controls and when to use each"
objective: "Apple's UI vocabulary and when to reach for each."
estimated_minutes: 5
---

# Standard controls and when to use each

## Why standard controls matter

Apple's standard controls (UIButton, UISwitch, UISlider, UIPickerView, etc., plus SwiftUI equivalents) come with:
- Pixel-perfect rendering across devices.
- Accessibility built in (VoiceOver labels, traits).
- Dark mode adaptation.
- Dynamic Type scaling.
- Haptics on interaction.
- Right-to-left layout.
- Future OS adaptation.

Reimplementing these from scratch loses all of the above — and most reimplementations still look "off" because Apple's renderers have subtleties.

For the 90% of UI needs: use standard controls.

## Buttons

```swift
Button("Continue") { ... }
Button { ... } label: { Label("Save", systemImage: "tray") }
```

Variants via `.buttonStyle`:
- `.borderedProminent` — filled accent color; primary CTAs.
- `.bordered` — outlined; secondary actions.
- `.borderless` — text only; tertiary.
- `.plain` — minimal; e.g., toolbar items.

```swift
Button("Save") { save() }
  .buttonStyle(.borderedProminent)
```

iOS uses prominent (filled) for primary action; bordered or plain for secondary. One primary action per screen ideal.

## Toggles (switches)

```swift
Toggle("Enable notifications", isOn: $isEnabled)
```

iOS draws a UISwitch. Use for boolean settings (on / off). Don't repurpose for multi-state.

Tint with accent:
```swift
Toggle("...", isOn: $value)
  .tint(.brand)
```

## Pickers

For "choose one from many":

```swift
Picker("Color", selection: $color) {
  Text("Red").tag(Color.red)
  Text("Blue").tag(Color.blue)
  Text("Green").tag(Color.green)
}
```

Default style varies by context:
- In `Form`: navigation link to sub-screen.
- Inline: dropdown / wheel.
- Segmented: side-by-side tabs.

```swift
.pickerStyle(.segmented)
```

For 2-5 options with short labels, segmented. More than 5, use menu or navigation.

## Sliders

```swift
Slider(value: $volume, in: 0...100, step: 5)
```

For analog values where precise number matters less than relative position. Volume, brightness, photo filter strength.

Don't use sliders for discrete values needing exact entry — use a number field or stepper.

## Text fields

```swift
TextField("Email", text: $email)
  .textFieldStyle(.roundedBorder)
  .keyboardType(.emailAddress)
  .textContentType(.emailAddress)
  .autocorrectionDisabled()
  .textInputAutocapitalization(.never)
```

`textContentType` enables AutoFill (passwords, addresses, etc.) — huge UX win. Use it.

`keyboardType` shows the right keyboard layout (numeric for codes, email for emails).

## Steppers

```swift
Stepper("Quantity: \(qty)", value: $qty, in: 0...100)
```

For "+1 / -1" increments. Quantity, count, settings adjustments. Where slider feels imprecise + numeric input is overkill.

## Date pickers

```swift
DatePicker("Date", selection: $date)
DatePicker("Time", selection: $time, displayedComponents: .hourAndMinute)
```

Pickerstyles: `.wheel`, `.compact` (default), `.graphical` (full calendar).

Use compact in forms; graphical when a calendar view is the focus.

## Lists

```swift
List {
  ForEach(items) { item in
    NavigationLink(destination: Detail(item)) {
      ItemRow(item)
    }
  }
}
.listStyle(.insetGrouped)
```

Styles:
- `.plain` — flat list.
- `.grouped` — sections with headers; classic settings style.
- `.insetGrouped` — modern grouped; default iOS 13+.
- `.sidebar` — iPad / Mac sidebar.

Match style to context. Settings? `.insetGrouped`. Feed? `.plain`.

## Tab views

```swift
TabView {
  HomeView().tabItem { Label("Home", systemImage: "house") }
  SearchView().tabItem { Label("Search", systemImage: "magnifyingglass") }
  SettingsView().tabItem { Label("Settings", systemImage: "gear") }
}
```

5 tabs max; reserve last for "More" if you have more (rarely needed).

Tab bar should reflect top-level destinations, not actions. Apple HIG explicit.

## Sheets

For self-contained modals:

```swift
.sheet(isPresented: $show) {
  EditView()
}
```

Use for:
- Forms.
- Editing.
- Self-contained workflows.

Avoid for:
- Critical alerts (use `.alert`).
- Quick action confirmations (use `.confirmationDialog`).
- Long sub-navigation (use NavigationStack push).

iOS 15+: detents control sheet height:
```swift
.sheet(isPresented: $show) {
  Content()
    .presentationDetents([.medium, .large])
}
```

## Alerts

```swift
.alert("Delete this item?", isPresented: $showAlert) {
  Button("Delete", role: .destructive) { delete() }
  Button("Cancel", role: .cancel) { }
} message: {
  Text("This can't be undone.")
}
```

Use for confirmations of destructive actions. Don't use for non-critical info (use toast or banner instead).

## Action sheets / confirmation dialogs

```swift
.confirmationDialog("Move to...", isPresented: $show) {
  Button("Archive") { archive() }
  Button("Delete", role: .destructive) { delete() }
  Button("Cancel", role: .cancel) { }
}
```

For "pick one action from a list." On iPhone: sheet from bottom; iPad / Mac: popover from anchor.

## Toolbars

```swift
.toolbar {
  ToolbarItem(placement: .topBarLeading) {
    Button("Back") { dismiss() }
  }
  ToolbarItem(placement: .topBarTrailing) {
    Button("Save") { save() }
  }
}
```

Standard toolbar placements adapt to platform. Avoid hand-positioning buttons in the navigation area.

## When to make custom controls

Some apps justify custom:
- **Brand-distinctive interactions** (Procreate's brush controls).
- **Domain-specific** (music DJ apps with vinyl spinners).
- **Genuinely novel** (the first iPhone introduced pinch-to-zoom).

For these: invest in accessibility, dark mode, haptics, RTL — match what system controls provide. Else: ship something worse than stock.

For everything else: use standard. Apply your accent color; respect Dynamic Type; let Apple do the work.

## Mistakes to avoid

- **Custom button styling that loses haptics / accessibility.**
- **Tab bar with 6+ items.** Cramped; users miss tabs.
- **Sheet for everything.** Sometimes navigation push is better.
- **No keyboard type / content type on text fields.** Loses AutoFill.
- **Wheel picker for things picker.menu fits.** Wheel is for time / date primarily.

## Summary

- Standard controls = accessibility + dark mode + haptics + RTL + Dynamic Type for free.
- Buttons: prominent for primary; bordered/plain for secondary.
- Toggles for boolean; pickers for choose-one; sliders for analog ranges.
- TextField with textContentType for AutoFill (mandatory for forms).
- Tab bar = top-level destinations, ≤5.
- Sheets for self-contained modals; alerts for critical confirmations.

Next: gestures.
