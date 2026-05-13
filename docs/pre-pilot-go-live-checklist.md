# Pre-Pilot Go-Live Checklist

## Purpose

Use this checklist before allowing a controlled FYEC100 Moodle pilot group to
use the assistant.

## Technical Checks

- `/api/health` returns successfully.
- `/api/admin/deployment-readiness` has no `fail` checks.
- `NEXT_PUBLIC_APP_BASE_URL` is the hosted HTTPS URL.
- AI provider variables are configured.
- Provider test endpoint responds successfully.
- Rate limits are configured.
- Feedback storage is writable.
- Knowledge base file is readable.
- `/admin` and `/api/admin/*` are not publicly exposed.

## Moodle Checks

- Moodle allows iframe embedding from the assistant domain.
- `/embed` loads inside a controlled FYEC100 course shell.
- Student responsible-use notice is visible.
- Pilot launch context fields have been tested if used.
- Fallback link is available if iframe embedding fails.

## Governance Checks

- Lecturer escalation path is confirmed.
- LMS administrator escalation path is confirmed.
- Technical support path is confirmed.
- Pilot feedback review schedule is confirmed.
- Privacy notice and student guidance are approved.
- Pilot group and dates are approved.

## Decision Point

Only proceed when blocking technical issues are resolved and the project sponsor,
project lead, lecturer, LMS administrator, and IT support path are aligned.
