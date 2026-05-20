---
module: 5
position: 1
title: "Self-serve onboarding flows"
objective: "Convert signups to active users without manual handholding."
estimated_minutes: 5
---

# Self-serve onboarding flows

## Why onboarding matters

A user signs up. Within minutes, they decide: is this useful or am I closing the tab? Onboarding is the bridge between "signed up" and "habitual user."

Bad onboarding: high signup, low activation, high churn at day 1. Good onboarding: signup → quick win → reason to come back tomorrow.

For SaaS economics: activation rate compounds. 20% → 40% activation doubles your customer base for same marketing spend.

## The onboarding funnel

```
Visit landing page
  ↓
Signup
  ↓
Email verification
  ↓
First login
  ↓
Setup / config
  ↓
First action (the "aha")
  ↓
Habit formation (3-5 sessions)
  ↓
Conversion to paid (if freemium)
```

Each step has drop-off; reducing drop-off at each compounds. Track each as a separate metric.

## Activation events

Define what "activated" means for your product. The minimum action that means the user has experienced value:

- **Notion.** Created a page with content.
- **Slack.** Sent N messages to N teammates.
- **Linear.** Created N issues.
- **Stripe.** First successful charge.

This is your activation metric. Aim activation flow at it; measure relentlessly.

## Reducing signup friction

- **Email-only signup.** No "fill 12 fields" form. Just email + password (or email + verification link).
- **Social login.** "Sign in with Google" / "Sign in with Apple." Reduces password creation friction.
- **Magic links.** Skip password entirely. Email → click link → logged in.
- **Phone number for B2C.** Some apps prefer phone.

Each removed field improves signup conversion. Test in your context.

## Onboarding patterns

**Empty state guidance.** No projects yet? Show "Create your first project" button prominently.

**Sample data.** Auto-populate with example content so the empty UI isn't intimidating. User explores; deletes; replaces with own.

**Interactive tour.** Modal walks user through key features. Skippable. Don't make 8 modals; 2-3 max.

**Checklist.** "Complete these 5 steps to set up your workspace." Gamification + progress bar.

**Quick-win first.** Pick the simplest task that demonstrates value; defer complex setup.

The right pattern depends on product. Test variants.

## Personalization at signup

Ask 2-3 questions during signup to customize:

- "What's your role?" → Adjust suggestions.
- "What size company?" → Pricing context.
- "What are you trying to do?" → Curate templates.

Trade-off: more questions = more drop-off. Pick the highest-signal questions; keep total to 2-3.

Some products skip this entirely; others use it to drive personalized onboarding.

## Email sequences

After signup, scheduled emails reinforce engagement:

- **Day 0.** Welcome; here's how to get started.
- **Day 1.** "Did you try X? Here's a 2-min tutorial."
- **Day 3.** "Customers love this feature." (For activated users.)
- **Day 7.** Check in; offer help.
- **Day 14.** Re-engagement if inactive.

Tools: Customer.io, Loops, Resend, Postmark. Often integrated with product analytics so emails target user state.

Personalize on user attributes; skip emails for already-engaged users (don't bother people who don't need it).

## Aha moments and time to value

"Time to value" = signup → first meaningful win. Cut this aggressively:

- Slack: send first message (under 5 minutes).
- Notion: create your first page (instant).
- Figma: open a design (instant).

Long setup = drop-off. Workspace name? Pre-fill. Profile photo? Skip; ask later. Inviting teammates? Optional; do later.

The Y Combinator advice "do things that don't scale" applies to onboarding for early SaaS: literally watch users sign up; see where they're confused; fix that.

## Onboarding for B2B vs B2C

**B2C.** Individual signs up; immediately uses; quick activation.

**B2B.** Often a "buyer" signs up + invites teammates. Two distinct flows:
- **Initial admin.** Creates workspace; configures settings; invites team.
- **Invited users.** Already inside a workspace; just need to learn the tool.

Different paths through onboarding. Invited users skip workspace creation; admin skips "join existing workspace" prompts.

## In-app guidance

Tooltips, walkthroughs, contextual help. Tools:

- **Intercom.** Tours + chat support combined.
- **Pendo.** Heavy guides + feature analytics.
- **Userflow / Userpilot.** Onboarding flows; no-code.

Built-in own: feasible but ongoing work; tools handle the UX patterns + iteration speed.

## Empty states

When sections are empty, don't show "no data" — show a call to action:

```
[Empty Projects section]
You don't have any projects yet.
[Create your first project] | [Import from template]
```

Empty states are onboarding micro-moments. Use them.

## Conversion to paid

For freemium SaaS, conversion happens after the customer hits limits or sees premium features:

- **Limits.** "You've reached 3 projects (Free limit). Upgrade for unlimited."
- **Feature gating.** "SSO is on the Enterprise plan."
- **Usage prompts.** "Your team is heavy users; consider Pro for better support."

Time it well: not on day 1 (they haven't seen value); not after they've left.

## Sales-assisted onboarding for enterprise

Some customers need handholding. Patterns:

- **Sales-assisted signup.** Demo first; then signup with sales help.
- **Implementation services.** Pay for onboarding (sometimes free first 90 days for big customers).
- **Dedicated CSM (Customer Success Manager).** Account-bound; helps configure and roll out.

Pricing reflects: enterprise tier includes implementation; self-serve tier does not.

## Onboarding metrics

Track:

- **Signup → activation rate.** % of signups that complete activation event within N days.
- **Time to activation.** Median time from signup to activation.
- **Funnel drop-offs.** Where do users abandon?
- **D1, D7, D30 retention.** % returning N days later.
- **Conversion to paid.** % free → paid over time.

Tools: Amplitude, Mixpanel, PostHog. Set up these funnels; track over time; iterate.

## Mistakes to avoid

- **Too many onboarding modals.** Annoying; skipped.
- **Long forms at signup.** High drop-off.
- **Delayed value.** Hours of setup before any benefit.
- **No re-engagement emails.** Users lapse silently.
- **Same onboarding for all users.** Role / use case matters.

## Summary

- Onboarding = signup to habit; activation is the bridging metric.
- Reduce friction: minimal signup fields, social login, magic links.
- Show value fast: pre-filled data, quick wins, deferred complex setup.
- Email sequences re-engage; track funnel drop-offs.
- Empty states as onboarding moments.
- Conversion to paid happens after value demonstrated.
- Tools (Customer.io, Intercom, Userflow) accelerate building this.

Next: support and customer success.
