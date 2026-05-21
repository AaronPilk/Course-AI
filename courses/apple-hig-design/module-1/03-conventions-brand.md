---
module: 1
position: 3
title: "Platform conventions vs brand expression"
objective: "When to follow Apple's playbook and when to depart."
estimated_minutes: 5
---

# Platform conventions vs brand expression

## The tension

Apple wants apps to feel native — like extensions of the OS. Brand teams want apps to feel distinctively theirs. These pull in opposite directions.

Good apps resolve this tension: native enough to feel familiar, expressive enough to feel like a brand. The pattern is to express brand in restricted, well-chosen places, and respect convention everywhere else.

## What "native" feels like

A user navigates a well-built iOS app:
- Back button at top left.
- Tab bar at bottom with system icons / labels.
- Search at top, pull-to-refresh on lists.
- System sheet for modal forms.
- Swipe-to-delete on rows.
- Standard keyboard with system spell-check.

Each is convention. The user doesn't think about navigation; muscle memory carries them through.

Native is invisible. Users notice when it's broken, not when it's right.

## Where brand belongs

Three places brand expresses naturally:

1. **App icon.** First impression. Single best place for brand identity.
2. **Accent color.** System-wide tint for active items, buttons, links. iOS supports per-app accent (`tintColor`).
3. **Marketing surfaces.** Onboarding, paywall, settings header.

Each is brand-appropriate. Each respects users.

Where brand DOESN'T belong:
- **Custom navigation patterns.** Confuses users.
- **Custom keyboards / controls.** Loses platform features.
- **Heavy marketing chrome throughout the app.** Tires users.
- **Brand color on every surface.** Becomes wallpaper; loses meaning.

## SF Symbols and custom icons

Apple's SF Symbols (5000+ icons) are designed to fit SF Pro typography. Use them whenever possible:
- **Free.** No licensing.
- **Aligned with Apple's icon style.** Feels native.
- **Multi-weight.** Scales with text size.
- **Multicolor / hierarchical variants.** Modern iOS supports.

Reserve custom icons for things that don't exist in SF Symbols. Don't replace standard icons with custom versions of the same thing.

## Accent color — the brand thumbprint

iOS's accent color is the cleanest brand expression:

```swift
.tint(Color.brand)
```

Applied: buttons, links, switches, navigation items. Suddenly the whole app has your brand's accent while still respecting iOS conventions everywhere else.

Pick wisely:
- Sufficient contrast against backgrounds.
- Works in both light and dark mode.
- Distinctive (avoid generic blue).
- Tested for color-blindness.

This is your highest-leverage brand decision. One color choice, applied systemically, ties the whole app together.

## Typography decisions

SF Pro is Apple's system font. Most apps use it for everything:
- Free; pre-installed; renders perfectly.
- Engineered for screens; legible at any size.
- Dynamic Type support.

Custom typography is brand expression but costs:
- License fees (sometimes).
- Performance (font loading).
- Compatibility (Dynamic Type tricky).
- Familiarity (users expect SF).

Reserve custom typography for:
- **Display-only usage.** Marketing copy; large headlines.
- **Distinctive editorial feel.** Magazine-style apps.
- **Brand obligation.** Specific corporate typeface.

For body text: SF Pro. For UI controls: SF Pro. For navigation: SF Pro. Custom typography in specific surfaces; SF everywhere else.

## Custom controls — danger zone

Apple's controls (UIButton, UISwitch, UITableView, NavigationStack) are battle-tested, accessible, and conventional. Custom replacements lose:

- **Accessibility.** VoiceOver works automatically with system controls; custom needs reimplementation.
- **Dark mode.** System controls adapt; custom needs explicit handling.
- **Dynamic Type.** System controls scale; custom needs scaling logic.
- **Haptics.** Built-in for switches, sliders; custom needs to add.
- **Right-to-left layout.** Automatic for system; manual for custom.

Build custom controls only when:
- The system control genuinely can't do what you need.
- You're prepared to handle every edge case.
- The custom control is integral to your product.

For ~90% of apps, system controls + accent color is the right answer.

## When custom UI wins

Some categories of app justify custom UI:

- **Creative tools.** Procreate's brush UI, Figma's canvas. Domain demands custom.
- **Games.** Different paradigm entirely.
- **Immersive experiences.** Music, podcasts, video editors.
- **Brand-led utility.** Spotify, Netflix have brand-distinctive layouts.

In these: ground in HIG principles even when departing from system controls. Clarity, deference (to creative work), and depth still apply.

## Cross-platform considerations

Many apps target iOS + Android + web. Each platform has its conventions:
- iOS: tab bar bottom, back top-left.
- Android: bottom nav, back via system gesture.
- Web: top nav, hyperlinks underlined.

Three options:
1. **Native per platform.** Most expensive; best UX per platform.
2. **Native-ish.** Use platform-respecting conventions in cross-platform tooling (Flutter Material/Cupertino, React Native).
3. **Unified custom.** Brand-first; same UI everywhere; loses native feel.

Apple prefers option 1; many businesses pick 2 or 3 for engineering economics. Acceptable; just understand the trade-off.

## The "looks like Apple" trap

Some apps deliberately mimic Apple's visual style (translucency, SF Pro, system colors). Compliments to Apple; sometimes successful (Bear, Things, Tot are explicitly Apple-loving).

Risk: confusing Apple's restraint with Apple's brand. Restraint is the value; copying SF Pro doesn't grant it.

For your app: adopt principles (clarity, deference, depth, restraint); deploy them in your brand expression. Don't ape Apple's visual signatures unless your product specifically benefits.

## Mistakes to avoid

- **Custom everything.** Lose familiarity, accessibility, dark mode.
- **No brand expression.** App feels generic; no differentiation.
- **Brand everywhere.** Feels desperate.
- **Custom controls without effort.** Worse-than-stock in accessibility.
- **iOS conventions on Android.** Wrong platform's playbook.

## Summary

- Resolve convention vs brand by being native almost everywhere + brand in restricted places.
- Icon, accent color, marketing surfaces = brand-appropriate.
- SF Symbols + SF Pro = free, native, accessible foundation.
- Custom controls only when system can't deliver; expensive to do well.
- Cross-platform: native per platform is best UX; cost trade-off is real.
- Adopt principles, not visual signatures.

Next: reading the HIG.
