# FYEC100 Pilot Analytics Summary

Phase 2 includes a privacy-light analytics summary for controlled Moodle pilot
review. It uses local files only and does not require a database.

## Sources

- `data/pilot-feedback.jsonl`
- `data/moodle-launch-audit.jsonl`
- `data/pilot-sessions.json`

## Admin Endpoints

```text
/api/admin/pilot-analytics
/api/admin/pilot-analytics.md
```

Use `x-admin-token` or `?adminToken=...` when `ADMIN_ACCESS_TOKEN` is configured.

## What It Shows

- total launches
- launches by role
- launches by source
- total feedback
- embedded vs standalone feedback
- feedback by category
- escalation candidates
- recommended owner counts
- risk signals for project-team review

## Privacy Boundary

The analytics summary uses aggregate counts and short feedback excerpts only. It
does not intentionally store student names, emails, grades, student IDs, or
student-record data.

Do not treat this Phase 2 artifact as production analytics, student records,
grading evidence, or an institutional reporting system.
