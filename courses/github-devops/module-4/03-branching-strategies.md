---
module: 4
position: 3
title: "Trunk-based vs git-flow"
objective: "Branching strategies compared."
estimated_minutes: 6
---

# Trunk-based vs git-flow

## Two ends of a spectrum

How should branches relate to releases? Two famous models bracket the options:

- **Trunk-based development.** One main branch. Short-lived feature branches. Continuous deployment.
- **Git-flow.** Multiple long-lived branches: main, develop, release/*, hotfix/*, feature/*.

Most modern teams sit closer to trunk-based. Git-flow has fallen out of favor — too much process for most teams. Understanding both helps you pick.

## Trunk-based development

The simple model:

- `main` is the only long-lived branch.
- Developers branch off main; merge back in days (not weeks).
- Main is always deployable.
- Releases happen from main (cut a tag from a green commit).
- Hotfixes are just branches off main, merged back, tagged.

Variations:

- **Strict trunk-based:** developers commit directly to main; PRs are short.
- **Modified:** short-lived feature branches via PRs.

Most modern teams use modified trunk-based: PRs are required but live for hours-to-days, never weeks.

## Why trunk-based wins for most teams

**1. Less merge pain.** Short branches diverge less from main; fewer conflicts.

**2. Faster feedback.** Integration happens daily; bugs surface immediately.

**3. Simpler mental model.** One place to look; one branch to deploy from.

**4. Better for CI/CD.** Continuous deployment is easier when main is always shippable.

**5. Better for monorepos.** Multiple long-lived branches multiply complexity across packages.

Companies like Google, Facebook, Netflix run trunk-based at massive scale.

## Git-flow

The original Vincent Driessen model (2010):

```
main          (production releases, tagged)
develop       (integration branch, all features merge here)
feature/*     (off develop; merged back to develop)
release/*     (preparing a release; off develop; merged to main + develop)
hotfix/*      (off main; merged back to main + develop)
```

The PR flow:
1. Branch `feature/x` from develop.
2. Open PR to develop.
3. Merge to develop.
4. Develop accumulates features.
5. When ready to release: create `release/v1.5.0` from develop.
6. Polish in release branch (no new features; only fixes).
7. Merge release branch to main; tag.
8. Merge release branch back to develop.
9. Hotfixes: branch from main; merge to both main and develop.

Coordinated, formal, lots of branches. Each merge step is a decision point.

## Why git-flow fell out of favor

**1. Too much process.** For small teams shipping daily, the overhead is disproportionate.

**2. Long-lived develop branch.** Same divergence problem as long feature branches, at scale.

**3. Coordinated releases.** Doesn't fit continuous deployment.

**4. Multiple merge directions.** Hotfix → main → develop → release → main becomes confusing.

**5. Tools don't natively support it.** PR workflows assume simpler models.

Vincent Driessen himself wrote a 2020 note saying git-flow doesn't suit modern continuous-delivery teams. Most have moved on.

Git-flow still fits:
- Versioned products where customers run multiple versions.
- Coordinated quarterly/yearly releases.
- Highly regulated environments where every change needs formal release process.

## GitHub Flow

GitHub's own model — even simpler than trunk-based:

1. Branch from main.
2. PR.
3. Merge.
4. Deploy.

That's it. No separate develop branch. No release branches. Tags happen but they're metadata; main is always deployable.

For most apps, GitHub Flow is the right model. Pair with continuous deployment (auto-deploy on merge to main → staging; tag-based to prod).

## GitLab Flow

Slight variation: long-lived branches per environment:

```
main → deploys to production
staging → deploys to staging
```

Merges flow `feature → main → staging` (or vice versa depending on direction). Useful when you need explicit per-environment branches (compliance, infrastructure dependencies).

For most apps, overkill. The branch protection + environments features in GitHub Actions handle environment-specific deploys without needing separate branches.

## Feature flags as branch alternatives

The deepest pattern for trunk-based: **feature flags decouple deploy from release**.

```tsx
if (featureFlag('new-checkout')) {
  return <NewCheckout />;
} else {
  return <OldCheckout />;
}
```

Code ships to main; the flag determines who sees it. Roll out gradually; flip off if broken; A/B test variants.

With feature flags, long-lived feature branches become unnecessary. You merge incomplete features behind a flag; activate when ready.

Tools: LaunchDarkly, GrowthBook, Statsig, custom flag system.

For teams shipping rapidly, feature flags are the foundation.

## Hotfix workflow in trunk-based

When production breaks:

1. Branch off the production commit (whatever's currently deployed).
2. Make the minimal fix.
3. PR; review; merge to main.
4. CI runs; deploys.
5. Tag if your release process requires it.

No separate "hotfix branch family." Just a regular branch and PR with high urgency.

For teams with `main` ahead of production (you've merged stuff that hasn't deployed yet), you may need to:

1. Branch off the production tag (not main).
2. Make the fix.
3. Cherry-pick or merge the fix into main as well.
4. Deploy from the hotfix.

Less common; only matters when prod lags main by significant work.

## Release branches in trunk-based

Some teams use release branches lightly:

- `release/v2.5` branched off main.
- All v2.5.x patches go to this branch.
- Hotfixes for v2.5 cherry-pick to main if still relevant.

Used when customers run multiple versions (libraries, on-prem software, mobile apps where users don't auto-update).

For SaaS apps with one production version, no release branches needed.

## The decision

For most teams in 2026:

- **Web app, SaaS, mobile (with auto-update):** GitHub Flow or trunk-based modified.
- **Library with users on multiple versions:** trunk-based + occasional release branches.
- **Versioned product, on-prem:** trunk-based with release branches per major.
- **Highly regulated, ceremonial releases:** consider git-flow lite (release branches; not full multi-branch).

Default to GitHub Flow / trunk-based. Add complexity only when you have a concrete reason.

## Branch protection per strategy

For trunk-based / GitHub Flow:
- Protect `main`.
- Required PR + reviews + CI.

For git-flow:
- Protect `main` AND `develop`.
- Required PR + reviews + CI on both.
- May need different policies (stricter on main).

The more long-lived branches, the more protection rules to maintain. Another reason simpler models win.

## Common smells

When your branching is wrong, you'll see:

- **Long feature branches (weeks+).** Big merge conflicts; integration debt.
- **Multiple "release candidate" branches simultaneously.** Coordinate-and-pray.
- **Hotfixes need 5 merges.** Process complexity beyond what's helpful.
- **Develop branch always conflicts with main.** They've drifted too far.

Smell → simplify. Move toward trunk-based. Cut a release; abandon the rest of the complexity.

## Mistakes to avoid

- **Adopting git-flow for small teams.** Excessive overhead.
- **Long-lived feature branches without sync.** Merge pain compounds.
- **Multiple long-lived dev branches.** Same divergence problem at higher scale.
- **No deploy on merge.** Wastes the integration benefit.
- **Release branches without need.** Just main is enough for most.

## Summary

- Trunk-based: one main branch; short feature branches; continuous deployment.
- Git-flow: multiple long-lived branches; coordinated releases.
- Most modern teams: trunk-based or GitHub Flow.
- Git-flow fits versioned products, regulated environments, coordinated releases.
- Feature flags decouple deploy from release; enable trunk-based at scale.
- Hotfixes in trunk-based: just another branch with urgency.
- Default simple; add complexity only when justified.

Next: hotfixes and rollbacks.
