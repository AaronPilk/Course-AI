---
module: 2
position: 4
title: "GitHub Issues and Projects"
objective: "Tracking work where the code lives."
estimated_minutes: 6
---

# GitHub Issues and Projects

## Why use GitHub for tracking

For software projects, tracking work in the same place as the code has real benefits:

- **Tight integration.** Link issues to PRs; close issues via PR merges; reference issues in commits.
- **No context switching.** One tool for code, review, and tracking.
- **Free for most teams.** Public and private repos include Issues.
- **API and automation.** Same API as the rest of GitHub.

Trade-offs vs Linear, Jira, etc.: less polish in some workflows, less custom workflow support, fewer enterprise reporting features. For most small-to-medium teams, GitHub Issues + Projects is enough.

## Issues — the unit

An issue is a unit of work or discussion:

- Bug report.
- Feature request.
- Task to do.
- Question or discussion.

Each issue has a title, description, labels, assignees, comments, status, and references to other issues/PRs.

Create one for every distinct piece of work. Granularity matters — issues should be small enough to complete in a few days at most.

## Issue templates

For consistent intake, define templates in `.github/ISSUE_TEMPLATE/`:

```yaml
# .github/ISSUE_TEMPLATE/bug.yml
name: Bug Report
description: Report a bug
labels: [bug]
body:
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What happened?
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
  - type: input
    id: version
    attributes:
      label: Version
```

When users click "New Issue," they pick a template. The template scaffolds the right fields.

Common templates:
- Bug Report.
- Feature Request.
- Documentation.
- Question (if you accept them; many projects redirect to Discussions).

## Labels

Labels categorize issues:

- **Type:** `bug`, `feature`, `chore`, `documentation`.
- **Priority:** `p0`, `p1`, `p2`, `p3`.
- **Status:** `needs-triage`, `in-progress`, `blocked`.
- **Area:** `frontend`, `backend`, `auth`, `payments`.
- **Difficulty:** `good-first-issue`, `help-wanted`.

Standard labels can be configured per repo or org-wide. Lighter is better — too many labels and people stop using them.

## Milestones

Group issues by release or sprint:

`v2.0 launch` milestone contains all the issues that need to ship for v2.0.

Issues outside the milestone don't block the release. Closing all milestone issues = ready to ship.

For longer-term planning, Projects (next section) are usually better.

## Projects (v2)

GitHub Projects v2 is a more flexible tracking layer on top of Issues:

- Multiple views: table, board, roadmap, calendar.
- Custom fields: priority, estimate, status, target date.
- Auto-add filters: "all issues with label `bug`."
- Spans multiple repos.

For most teams, set up:

- **Sprint board.** Issues in "Todo," "In progress," "In review," "Done."
- **Roadmap.** Issues grouped by quarter or milestone.
- **Bug triage.** All open bugs sorted by priority.

The flexibility is powerful; the discipline is keeping it actually used.

## Linking issues, PRs, and commits

GitHub auto-links references:

- In commit messages: `Fixes #1234` closes the issue when merged to default branch.
- In PR descriptions: same.
- In comments: `#1234` links without closing.

Convention: link the issue in the PR description; let the merge close it. One source of truth — the issue.

Cross-repo references: `org/repo#1234` for issues in other repos.

## Discussions

GitHub Discussions (separate from Issues) for:

- Q&A.
- Show & tell.
- General community conversation.
- Long-form threads.

Discussions don't have "open/closed" states like issues. They're more like a forum.

For software projects: Issues for actionable work; Discussions for community/support; Pull Requests for code changes.

Many open-source projects use Discussions for "Q&A" type issues that don't have a clear bug or feature.

## Issue triage

A consistent triage process:

1. **Label** the issue (type, priority, area).
2. **Assign** if you know who'll work on it.
3. **Milestone** if it's targeted for a release.
4. **Close** if invalid or duplicate.
5. **Mark `needs-info`** if more info is needed from the reporter.

Triage weekly (or daily for high-traffic projects). Untriaged issue queues fester.

For open source: a "good first issue" label attracts new contributors. Important — communities are built by lowering the friction of first contributions.

## Issue templates with forms

Modern issue templates (YAML-based) create structured forms:

```yaml
name: Feature Request
body:
  - type: dropdown
    id: priority
    attributes:
      label: Priority
      options:
        - Low
        - Medium
        - High
    validations:
      required: true
```

Users see a dropdown instead of free-form markdown. Structured intake means cleaner data; automation can route based on field values.

## Automation

GitHub Actions can automate issue management:

- Auto-label new issues based on title patterns.
- Close stale issues after N days of no activity.
- Move issues across project columns when status changes.
- Send Slack notifications on new high-priority issues.

```yaml
# .github/workflows/stale.yml
on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v9
        with:
          days-before-issue-stale: 60
          days-before-issue-close: 7
          stale-issue-message: 'This issue has been inactive for 60 days. It will close in 7 days.'
```

Reduces toil; keeps the issue queue clean.

## CODEOWNERS for issues

Some teams route specific issues to specific people via labels + automation. Not built into GitHub natively but easy to script:

```yaml
on:
  issues:
    types: [labeled]

jobs:
  assign:
    if: github.event.label.name == 'security'
    runs-on: ubuntu-latest
    steps:
      - run: gh issue edit ${{ github.event.issue.number }} --add-assignee security-team
```

When an issue gets labeled `security`, auto-assign the security team.

## Linking PRs to issues

In your PR description:

```
Closes #1234
```

Merging the PR (to default branch) auto-closes #1234. Saves the manual close step.

Multiple issues:

```
Closes #1234
Closes #5678
Fixes #9012
```

Keywords: `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves`, `resolved`.

## Search and filters

GitHub Issues search is powerful:

```
is:open label:bug
is:closed assignee:aaron
no:label
created:>2026-01-01
```

Combine filters. Save common queries as bookmarks. Useful queries:

- `is:open no:assignee no:milestone label:bug` — open bugs with no owner.
- `is:open assignee:@me` — my open issues.
- `is:open created:>2026-05-01` — recent additions.

## When NOT to use GitHub Issues

GitHub Issues isn't perfect. Consider alternatives when:

- **Complex workflow rules.** Jira's custom workflows.
- **Time tracking required.** GitHub doesn't have it natively.
- **Customer support.** Use a help-desk tool (Zendesk, Intercom).
- **Cross-tool sync.** Linear, Jira, Asana have ecosystems.
- **Reporting dashboards.** GitHub's reporting is basic.

For most software projects, GitHub Issues is enough. For larger orgs or specific workflow needs, a dedicated tracker can pay off.

## Mistakes to avoid

- **No labels.** No way to filter, prioritize.
- **No issue templates.** Inconsistent intake.
- **Stale queue.** Issues from 2 years ago that no one cares about.
- **Linking PRs without keywords.** Manual close required.
- **Using Issues for support requests.** Discussions or a help desk is better.

## Summary

- GitHub Issues for actionable work; Discussions for community Q&A.
- Templates ensure consistent intake.
- Labels categorize; milestones group by release.
- Projects v2 for flexible views (board, roadmap, table).
- Link PRs to issues via keywords (Closes #1234).
- Triage weekly; close stale issues.
- Automate where possible (labeling, stale handling).

Next module: GitHub Actions and CI/CD.
