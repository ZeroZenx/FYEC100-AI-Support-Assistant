# Admin Action Register

## Purpose

The admin action register tracks Phase 2 pilot follow-up actions in one
admin-friendly place.

It is designed for actions that come out of pilot evidence reviews, sign-off
meetings, Moodle configuration checks, deployment readiness checks, and support
planning.

## Source File

```text
data/admin-actions.json
```

Update the file manually during Phase 2 pilot meetings. This keeps the
prototype simple and avoids adding a database before the enterprise deployment
phase requires one.

## Admin View

Open:

```text
http://localhost:4100/admin
```

The "Action Register" section shows:

- total actions
- open actions
- in-progress actions
- high-priority open actions
- owner, priority, status, source, due date, and notes

## Protected Endpoints

```text
http://localhost:4100/api/admin/actions
http://localhost:4100/api/admin/actions.md
```

If `ADMIN_ACCESS_TOKEN` is configured, pass it with `?adminToken=...` in the
browser or the `x-admin-token` header for API calls.

## Governance Note

Do not store student records, grades, student IDs, email addresses, or private
student information in this register. It is a project action tracker, not a
student support case-management system.
