# Pilot Evidence Dashboard

## Purpose

The pilot evidence dashboard gives the project sponsor and project team one
place to review whether the FYEC100 AI Support Assistant is ready for the next
controlled Moodle pilot step.

It aggregates existing Phase 2 artifacts rather than creating a production
analytics system.

## Included Evidence

- Deployment readiness checks
- Knowledge base review status
- Student feedback summary
- Moodle launch audit counts
- Moodle integration decision status
- Moodle block scaffold readiness
- LTI 1.3 readiness warnings

## Admin View

Open the protected admin dashboard:

```text
http://localhost:4100/admin
```

The "Pilot Evidence" section shows:

- go/no-go recommendation
- ready, watch, and blocked signal counts
- helpful feedback rate
- evidence signals with owners
- recommended next actions
- JSON and Markdown export endpoints

## Protected Endpoints

```text
http://localhost:4100/api/admin/pilot-evidence
http://localhost:4100/api/admin/pilot-evidence.md
```

If `ADMIN_ACCESS_TOKEN` is configured, pass it with `?adminToken=...` in the
browser or the `x-admin-token` header for API calls.

## Governance Note

This is a Phase 2 governance snapshot for controlled pilot review. It must not
include student names, grades, IDs, email addresses, or production analytics
claims. Final go/no-go approval remains a human decision by the project sponsor
and project team.
