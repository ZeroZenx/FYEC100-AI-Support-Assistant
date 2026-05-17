# Pilot Data Cleanup Tool

## Purpose

The Pilot Data Cleanup Tool helps admins review and reset local demo or pilot
telemetry before a clean demo, rehearsal, or controlled Moodle pilot start.

It only targets local Phase 2 telemetry files:

- `data/pilot-feedback.jsonl`
- `data/moodle-launch-audit.jsonl`

It does not reset the FYEC100 knowledge base, Moodle configuration, docs, source
code, sign-off records, action register, or governance files.

## Admin Endpoints

```text
/api/admin/pilot-data-cleanup
/api/admin/pilot-data-cleanup.md
```

`GET /api/admin/pilot-data-cleanup` returns a preview with file status, record
counts, byte counts, scope, and the required confirmation phrase.

`POST /api/admin/pilot-data-cleanup` resets selected local telemetry only when
the request includes the confirmation phrase.

## Reset Example

```bash
curl -X POST http://localhost:4100/api/admin/pilot-data-cleanup \
  -H 'Content-Type: application/json' \
  -d '{"confirmation":"RESET PILOT DATA","target":"all"}'
```

Allowed targets:

- `all`
- `feedback`
- `launch-audit`

## Governance Notes

- Export any reports needed for review before resetting pilot data.
- Use this for demos, rehearsals, and pre-pilot cleanup.
- Do not use this as a production records-retention process.
- Keep sensitive student record details out of pilot feedback and launch audit
  data.
