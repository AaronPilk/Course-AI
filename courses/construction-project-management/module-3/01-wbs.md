---
module: 3
position: 1
title: "Work Breakdown Structure (WBS)"
objective: "Decompose work into manageable pieces."
estimated_minutes: 5
---

# Work Breakdown Structure (WBS)

## What WBS is

Hierarchical decomposition of project deliverables:
```
Project
├── 1.0 Site
│   ├── 1.1 Excavation
│   ├── 1.2 Utilities
│   └── 1.3 Site work
├── 2.0 Substructure
│   ├── 2.1 Foundations
│   └── 2.2 Slab on grade
├── 3.0 Superstructure
│   ├── 3.1 Concrete framing
│   └── 3.2 Steel framing
... etc
```

For: organizational backbone.

## Levels

- **Level 1.** Project.
- **Level 2.** Major divisions.
- **Level 3.** Systems.
- **Level 4.** Components.
- **Level 5.** Activities (tasks for schedule).

Rule: each level fully contains the level above.

For: progressive detail.

## CSI MasterFormat

Construction Specifications Institute standard 50 divisions:
- Div 1: General requirements.
- Div 3: Concrete.
- Div 4: Masonry.
- Div 5: Metals.
- Div 9: Finishes.
- Div 23: HVAC.
- Div 26: Electrical.

Standard for organizing specs + estimates.

For: industry standard.

## UniFormat

Alternative by building system:
- Substructure.
- Shell.
- Interiors.
- Services.
- Equipment.

Used for: early estimates, owner perspective.

For: alternative framework.

## 100% rule

WBS must contain 100% of the work:
- All deliverables represented.
- No overlap between elements.
- Sum of children = parent.

Common error: missing scope.

For: completeness check.

## Activities

Level 5 typically:
- "Pour foundation footings."
- "Install electrical rough-in 2nd floor."
- "Hang drywall 1st floor."

Each activity:
- Duration.
- Resources.
- Predecessors.
- Constraints.

For: scheduling input.

## WBS dictionary

Document for each WBS element:
- Description.
- Deliverable.
- Acceptance criteria.
- Cost code.
- Responsible party.

For: clarity.

## Cost coding

WBS elements get codes for accounting:
- Track actual cost vs. estimate.
- Roll up to higher levels.
- Integrate with accounting software.

Standard codes per company.

For: financial tracking.

## Decomposition guidance

When to stop:
- Can be reasonably estimated.
- Can be reliably scheduled.
- Has a clear responsible party.
- Adds value at this granularity.

Typically: 8-80 hours per Level 5 activity.

For: rule of thumb.

## Software

- **Microsoft Project.** Built-in WBS view.
- **Primavera P6.** Industry standard for complex.
- **Excel.** Many small projects.
- **Procore.** Cloud-based.

For: tool choice.

## Mistakes to avoid

- **Too coarse.** Hard to track.
- **Too fine.** Maintenance burden.
- **Missing scope.** Pretend it's there.
- **Overlapping items.** Double-counting.

## Summary

- WBS = hierarchical work decomposition.
- 5 levels typical, MasterFormat 50 divisions standard.
- 100% rule: include all work.
- Activities (Level 5) are scheduling input.
- 8-80 hour rule for activity granularity.

Next: Critical Path Method.
