# Pilot Export Bundle

## Purpose

The Pilot Export Bundle combines the most important Phase 2 admin reports into
one human-readable packet for project-team meetings, sponsor review, and
controlled Moodle pilot readiness discussion.

## Human-Readable HTML Report

Use this first for meetings:

```text
/api/admin/pilot-export-bundle.html
```

The HTML report includes:

- executive snapshot
- active pilot mode
- system flow diagram
- readiness signals
- Moodle integration and iframe security breakdown
- support triage summary
- pilot data cleanup warning
- export index for the detailed source reports

## Markdown Bundle

Use this for portable records:

```text
/api/admin/pilot-export-bundle.md
```

## Source Reports

The bundle summarizes and links to:

- pilot evidence
- pilot meeting pack
- pilot analytics
- support triage
- pilot data cleanup
- Moodle security hardening
- hosted deployment readiness
- pilot sign-off

## Privacy Boundary

This is an internal Phase 2 pilot artifact. It should not include student names,
student IDs, grades, or production analytics claims.
