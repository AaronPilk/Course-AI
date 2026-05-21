---
module: 1
position: 2
title: "Designing for humans, not for designers"
objective: "Apple's people-first design discipline."
estimated_minutes: 5
---

# Designing for humans, not for designers

## The end-user is the boss

Apple's design culture has a recurring refrain: the user comes first. Not the designer's aesthetic preference, not the engineer's convenience, not the brand team's wishes. The user — what they need, what they feel, what they're trying to accomplish.

This sounds obvious. It's frequently violated.

## Designs that look pretty but fail people

Common failure modes:

- **Beautiful empty states** that don't explain what to do.
- **Slick onboarding** that's slow and skippable.
- **Custom controls** that look distinctive but confuse anyone who's used iOS before.
- **Gesture-only navigation** with hidden affordances.
- **Tiny targets** for fingers.
- **Color choices** that look great in figma + ignore people with low vision.

Each of these wins design Twitter and loses users. Apple's discipline: optimize for the user even when the design is uglier for it.

## The accessibility lens

Designing for humans means designing for ALL humans:

- **Vision impaired.** VoiceOver users; low contrast users; Dynamic Type readers.
- **Motor impaired.** Large touch targets; alternative input methods.
- **Cognitive variation.** Clear language; consistent patterns; reduced motion option.
- **Hearing impaired.** Captions; visual alerts.

Apple's tools (VoiceOver, Voice Control, Switch Control, Dynamic Type, Reduce Motion, Differentiate without Color) make this practical. Designers who plan for accessibility from the start ship products that work for more people.

This isn't charity. It's good design that incidentally helps everyone — Dynamic Type also helps reading on a sunlit beach; large touch targets help everyone with cold hands; captions help everyone in noisy environments.

## Don't make me think (or wait)

Cognitive load matters. Each decision the user makes is cost:
- How many fields do I have to fill in?
- Where's the button I want?
- Does this mean what I think it means?
- Will this action be undoable?

Reduce decisions where possible:
- **Sensible defaults.** Most users want X; pre-select X; let advanced users change.
- **Single primary action per screen.** "Continue" is obvious.
- **Reversible actions.** Undo, restore, "cancel within 5 seconds."
- **Progressive disclosure.** Hide advanced options until needed.

Apple's apps tend toward fewer choices on screen at once. Mature design preferred over feature checklists.

## Performance is design

A slow interface is a bad interface, even if visually beautiful.

- **Sub-100ms response.** Feels instant.
- **Sub-1s render.** Feels fast.
- **2-10s.** Loading states; show progress.
- **>10s.** Something's wrong.

Apple's hardware/software integration optimizes for instant; their UI patterns assume instant. A flagship iPad keyboard appears in <100ms; comparable Android keyboards often take 200-500ms; the difference is felt.

Design for the latency target. Plan for fallbacks (offline, slow networks) but design the happy path to feel fast.

## Familiarity over novelty

A user who knows iOS knows your app. Use the conventions:
- Back button at top-left.
- Tab bar at bottom.
- Search at top.
- Pull to refresh.
- Swipe-to-delete on lists.

Novelty has costs — every custom pattern is something the user has to learn. Reserve novelty for the genuinely new (your unique value); use conventions for everything else.

The trap: designers tire of conventions before users do. You see a tab bar daily; the user sees it for the first time when they open your app. Don't innovate where conventions work.

## Direct manipulation

Apple's interfaces favor direct manipulation: you touch the thing you want to act on. Drag a photo to move it; tap a song to play it; pinch to zoom.

Compare: command-line style ("type the name of the photo, then type the destination"). Indirect; harder for novices.

When designing: ask "can the user touch the thing directly?" Often yes. Indirect controls (menus, command palettes) are useful but should complement, not replace, direct manipulation.

## Forgiveness

Mistakes happen. Design for recovery:
- **Confirmation for destructive actions.** "Delete account? This can't be undone."
- **Undo for ambiguous actions.** A toast: "Item deleted. [Undo]."
- **Drafts and autosave.** Don't lose work.
- **Empty trash, not auto-delete.** Files held for X days.

Apple's apps tend to forgive — you can almost always undo. This builds confidence; users explore more because they're safe.

The opposite — rigid systems with hard-to-reverse actions — make users tentative and frustrated.

## Respecting attention

Notifications, popups, modals all interrupt. Apple's standard: only interrupt for what matters.

- **Critical.** Bank wants verification of large purchase.
- **Important.** A meeting starts in 5 minutes.
- **Useful.** Friend messaged you.
- **Marketing.** Almost never push-notify; user came to you, not the other way around.

iOS's notification controls give users heavy power over what interrupts them. Apps that abuse notifications get muted.

Same for in-app: don't pop modals to ask for ratings; don't auto-play videos with sound; don't surprise users with promotional content. Each interruption is a withdrawal from the user-trust account.

## Empathy is iterative

Apple's designers spend significant time with users:
- Watching people use products.
- Reviewing accessibility feedback.
- Internal testing against diverse use cases.

The principle: you are not the user. Your designed flow makes sense to you; you built it. The user is meeting it cold.

Test on real people. Watch them silently. Note where they hesitate, click the wrong thing, miss the affordance you thought was obvious. Iterate.

## When to break conventions

Sometimes new patterns are justified:
- A genuinely new interaction (the iPhone introduced pinch-to-zoom).
- A novel use case where conventions don't apply.
- Improvement that the user will appreciate.

The bar: it must be clearly better than the convention for enough users to justify the cost of learning.

Most novelty fails this bar. Convention wins.

## Mistakes to avoid

- **Designing for the portfolio.** Award-bait that confuses users.
- **Over-customizing platform controls.** Lose familiarity.
- **Ignoring accessibility.** Excludes millions.
- **Tiny touch targets.** Apple's HIG specifies minimum 44×44pt.
- **Heavy notifications / interruptions.** Users mute or uninstall.

## Summary

- Design for users, not for designers.
- Accessibility is good design, not extra work.
- Reduce decisions; sensible defaults; reversible actions.
- Performance is design; instant feels right.
- Conventions over novelty for the 90% case.
- Forgiveness builds confidence; respect for attention builds trust.

Next: platform conventions vs brand.
