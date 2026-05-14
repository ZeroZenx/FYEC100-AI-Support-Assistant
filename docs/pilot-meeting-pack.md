# Pilot Meeting Pack

## Purpose

The pilot meeting pack creates one sponsor/project-team briefing for FYEC100 AI
Support Assistant review meetings.

It consolidates the current pilot evidence, sign-off status, deployment
readiness, feedback report, Moodle launch audit, knowledge base review, and
Moodle integration decision into one exportable Markdown document.

## Admin View

Open:

```text
http://localhost:4100/admin
```

The "Pilot Meeting Pack" section shows:

- blocker count
- decisions needed
- feedback and Moodle launch evidence counts
- JSON and Markdown export endpoints

## Protected Endpoints

```text
http://localhost:4100/api/admin/pilot-meeting-pack
http://localhost:4100/api/admin/pilot-meeting-pack.md
```

If `ADMIN_ACCESS_TOKEN` is configured, pass it with `?adminToken=...` in the
browser or the `x-admin-token` header for API calls.

## Meeting Use

Use the Markdown export before pilot review meetings to align on:

- whether the pilot can expand
- what warnings or blockers remain
- what sign-off is pending
- whether Moodle should continue with iframe, move to block testing, or begin
  LTI planning

## Governance Note

This pack is an internal planning artifact. It should not contain student
names, grades, IDs, email addresses, or private student records.
