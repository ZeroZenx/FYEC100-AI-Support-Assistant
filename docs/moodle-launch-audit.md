# Moodle Launch Audit

Phase 2 includes a lightweight launch audit scaffold for the embedded Moodle view.

## Purpose

The audit helps the project team confirm whether the assistant is being opened through the expected Moodle context during controlled pilot testing.

It captures timestamp, embedded route path, launch source, course ID, course short name, role, browser user agent excerpt, and referrer excerpt.

It does not intentionally capture names, email addresses, grades, student IDs, or student record data.

## Storage

Pilot launch records are stored locally in:

```text
data/moodle-launch-audit.jsonl
```

This file is ignored by Git.

## Endpoints

```text
POST /api/launch-audit
GET /api/admin/launch-audit
```

## Rate Limit

```bash
LAUNCH_AUDIT_RATE_LIMIT_PER_MINUTE=60
```

## Production Note

This is pilot telemetry only. A production Moodle block or LTI deployment should define an approved logging policy, retention period, access controls, and privacy review.
