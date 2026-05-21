---
module: 3
position: 2
title: "Critical Path Method (CPM)"
objective: "Find the activities that drive project duration."
estimated_minutes: 5
---

# Critical Path Method (CPM)

## Concept

Network diagram of activities with dependencies:
- Each activity has duration.
- Predecessors must complete first.
- Some activities in parallel; others sequential.

Critical path: longest chain through network = minimum total duration.

For: schedule analysis.

## Activity dependencies

- **Finish-to-Start (FS).** Most common: B starts after A finishes.
- **Start-to-Start (SS).** B starts when A starts.
- **Finish-to-Finish (FF).** B finishes when A finishes.
- **Start-to-Finish (SF).** Rare.

Lags: delay after relationship.

For: temporal relationships.

## Forward pass

Calculate earliest dates:
```
Early Start (ES) = predecessor's Early Finish
Early Finish (EF) = ES + Duration
```

Work from start to end.

For: earliest possible.

## Backward pass

Calculate latest dates:
```
Late Finish (LF) = successor's Late Start
Late Start (LS) = LF - Duration
```

Work from end back.

For: latest acceptable.

## Float

```
Total Float = LS - ES = LF - EF
Free Float = duration available without delaying successor
```

Activities with zero float = critical path.

For: schedule slack.

## Critical path properties

- Longest path.
- Zero total float.
- Delaying any critical activity delays project.
- Non-critical activities can slip up to their float.

For: focus areas.

## Multiple critical paths

Common: ties for longest path.

All have zero float. All activities on them are critical.

For: complex projects.

## Near-critical activities

Activities with small float (e.g., < 5 days):
- May become critical if delayed.
- Watch closely.

Risk-based attention.

For: pragmatic management.

## Resource constraints

CPM assumes unlimited resources. Reality:
- Limited crew.
- Limited equipment.

Resource-leveling shifts non-critical activities to balance load.

For: real-world adjustment.

## Crashing

Reduce project duration by adding resources to critical activities:
- Extra crew (overtime, weekends).
- Pre-fab off-site.
- Multiple shifts.

Costs more per day saved.

For: schedule recovery.

## Fast-tracking

Overlap activities normally sequential:
- Pour foundation while completing design.
- Start framing 2nd floor while finishing 1st.

Risk: rework if design changes.

For: schedule recovery option 2.

## Software

- **Primavera P6 (Oracle).** Industry standard for large projects.
- **Microsoft Project.** SMB.
- **Procore.** Cloud-based.
- **Asta Powerproject.** UK/global.

All implement CPM.

For: tool selection.

## CPM in practice

- Build network of activities.
- Set durations + dependencies.
- Run forward + backward pass.
- Identify critical path.
- Monitor weekly.
- Update with actuals.
- Recalculate.

For: workflow.

## Mistakes to avoid

- **Too coarse activities.** Loose tracking.
- **Wrong dependencies.** Wrong critical path.
- **No baseline.** Can't measure variance.

## Summary

- CPM identifies activities driving total duration.
- Forward pass = earliest; backward = latest.
- Float = slack; zero float = critical.
- Crashing + fast-tracking for recovery.
- Software: P6 for big, MS Project + Procore for SMB.

Next: Gantt + MS Project.
