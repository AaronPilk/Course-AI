---
module: 5
position: 4
title: "Maintaining a design system over time"
objective: "Keep your design system healthy as the org and product grow."
estimated_minutes: 5
---

# Maintaining a design system over time

## Design systems are products

A design system isn't a one-time deliverable; it's a product with:
- **Users.** Designers + engineers consuming components.
- **Roadmap.** New components; refactors; theming.
- **Releases.** Library updates ship periodically.
- **Documentation.** Usage guides; examples.
- **Support.** Slack channel; office hours; reviews.

Treat with product rigor; outcomes follow.

## Ownership

Who owns the design system?
- **Dedicated team.** Best for large orgs (50+ designers); design system is a full-time role.
- **Embedded.** A senior designer + senior engineer on rotation.
- **Federated.** Multiple teams contribute; one team coordinates.
- **No owner.** System decays; drift accelerates.

Define ownership early; mature into a team as org grows.

## Process

Mature design systems use:
- **PR-style reviews.** Proposed changes via branch; team reviews; merge.
- **Office hours.** Weekly consumer questions answered.
- **Component requests.** Backlog of needed components; prioritized.
- **Versioning.** Semver; release notes; deprecation timelines.
- **Adoption metrics.** Library coverage in consumer files.

Process scales the team; without it, every decision is ad-hoc.

## Documentation

Documentation lives in:
- **Figma file.** Component descriptions; cover pages; in-line annotations.
- **Storybook.** Live component examples for engineering.
- **Notion / Confluence.** Guidelines; design principles; usage examples.
- **Internal site.** Custom design system docs (Material's m3.material.io; Polaris's polaris.shopify.com).

Multi-channel: designers + engineers + PMs all find what they need.

## Component lifecycle

Each component goes through stages:
1. **Proposed.** Someone needs it; discussed.
2. **Drafted.** Designer + engineer prototype.
3. **In progress.** Refinement; review.
4. **Ready for dev.** Production-grade.
5. **Released.** Published in library.
6. **Deprecated.** Replaced; migrate consumers.
7. **Archived.** Removed from library.

Status visible in Figma; consumers reference accordingly.

## Adoption

Build for adoption:
- **Migrate active consumers.** Pair with product teams.
- **Onboard new designers.** Walk through library.
- **Office hours.** Lower the friction barrier.
- **Examples.** Show how components compose.

A system nobody uses is worse than no system. Adoption metrics matter.

## Versioning

Semver:
- **Major (X.0.0).** Breaking changes. Deprecation + migration.
- **Minor (X.Y.0).** Non-breaking additions. New components / props.
- **Patch (X.Y.Z).** Bug fixes / tweaks.

Ship release notes with each version. "v2.3.0: Adds Snackbar component. Updates Button hover state."

## Breaking changes

A breaking change to a widely-used component:
- **Deprecate first.** Rename `Button` to `Button-Legacy`; ship new `Button`.
- **Announce.** Slack channel; release notes; office hours.
- **Migrate.** Help consumers update; provide migration scripts if possible.
- **Sunset.** Remove deprecated after grace period (3-6 months).

Don't break things abruptly. Trust = lifeblood of the design system.

## Token governance

Variables / tokens need rules:
- **Naming convention.** Strict; rejected if violated.
- **Add via PR.** New tokens reviewed before adding.
- **Audit.** Quarterly check for unused / duplicate.
- **Cleanup.** Cull orphans; consolidate.

Without governance, token sprawl → 1000+ variables → unmanageable.

## Component governance

Same for components:
- **Add via proposal.** New components proposed in backlog.
- **Review.** Design + engineering + DS team.
- **Build with system patterns.** Variants + properties + tokens.
- **Document.** Description + examples.

Avoid: "We need a Card-Special; just clone Card." Now you have two Cards.

## Adoption metrics

Track:
- **Library coverage.** % of consumer file content using library components.
- **Hardcoded value rate.** % of fills / spacing using variables vs. hex.
- **Deprecated usage.** Instances still using deprecated components.

Tools: Figma's library analytics (paid); plugins; manual audits.

Metrics drive decisions: low coverage → improve docs / onboarding; high deprecated usage → push migration.

## Health checks

Quarterly:
- **Audit components.** Any unused? Any near-duplicates?
- **Audit variables.** Same.
- **Audit consumer files.** Hardcoded values? Detached instances?
- **Survey users.** What's frustrating? What's missing?
- **Plan.** Prioritize next quarter.

Health checks catch decay before it accelerates.

## Communication

Design system team communicates with:
- **Designers.** Slack channel; office hours; updates.
- **Engineers.** Code Connect; tokens sync; release notes.
- **PMs.** What's coming; what's deprecated.
- **Leadership.** Adoption + impact metrics.

Multi-audience; tailor the message; over-communicate.

## Tools

- **Figma.** Source of truth for components.
- **Storybook.** Code documentation.
- **Tokens Studio.** Variables → code pipeline.
- **Slack channel.** Live support.
- **GitHub / Linear.** Issue tracking; backlog.
- **Notion / Confluence.** Guidelines.
- **Loom / videos.** Walkthroughs.

Toolset evolves with team size; start small.

## Anti-patterns

- **One-shot design system.** Built once; never updated.
- **No deprecation policy.** Old components linger forever.
- **No documentation.** Adopters guess.
- **No adoption metrics.** Don't know if it's working.
- **Closed system.** No contributions accepted; calcifies.

## Mature system signs

- Consistent visual language across products.
- Designers + engineers reference tokens by name.
- New screens assemble from existing components.
- Theming flips at a flag.
- New designers ramp in 1-2 weeks instead of months.

The system pays off in compound efficiency; the early effort is up-front.

## Mistakes to avoid

- **Build everything Day 1.** Start small (foundations + 10 atoms); grow.
- **Build in isolation.** Without product input, irrelevant.
- **No governance.** Sprawl.
- **No metrics.** Working in the dark.
- **No advocates.** Without champions in product teams, adoption stalls.

## Summary

- Design systems are products: ownership, roadmap, releases, docs, support.
- Component lifecycle: proposed → drafted → in-progress → ready → released → deprecated → archived.
- Token governance + component governance prevent sprawl.
- Adoption metrics drive priorities.
- Quarterly health checks.
- Communication across designers, engineers, PMs, leadership.

## Course complete

You've covered Figma end-to-end: file structure + keyboard speed; Auto Layout for responsive design; components + variants + properties for systems; variables + modes for theming; tokens to code; prototyping; Dev Mode handoff; collaboration; design system maintenance.

Next steps:
1. Pick a product / portfolio piece. Rebuild it in Figma using these patterns.
2. Audit any existing Figma file for taxonomy and token coverage.
3. If on a team: propose one improvement (start with auto layout adoption or a token audit).

The patterns compound — each lesson builds on the previous. Auto Layout enables variants; variants enable properties; properties enable tokenization; tokens enable theming; theming enables handoff. Designers who master the chain ship faster, more consistently, and at higher quality.

Figma's pace of feature release is significant; revisit Figma's release notes for new capabilities (especially in variables, modes, and Dev Mode). The principles in this course stay relevant; the specific UI may shift.
