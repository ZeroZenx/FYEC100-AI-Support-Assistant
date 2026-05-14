# Pre-Pilot Go-Live Checklist

## Purpose

Use this checklist before allowing a controlled FYEC100 Moodle pilot group to
use the assistant.

## Technical Checks

- `/api/health` returns successfully.
- `/api/admin/deployment-readiness` has no `fail` checks.
- `/api/admin/pilot-evidence` has been reviewed by the project team.
- `/api/admin/pilot-evidence.md` has been exported for the pilot record.
- `/api/admin/pilot-signoff` has been reviewed by approval owners.
- `/api/admin/pilot-signoff.md` has been exported for the pilot record.
- `npm run smoke:pilot` passes against the hosted pilot URL.
- `NEXT_PUBLIC_APP_BASE_URL` is the hosted HTTPS URL.
- `MOODLE_ORIGIN` is the approved Moodle HTTPS origin.
- AI provider variables are configured.
- Provider test endpoint responds successfully.
- Rate limits are configured.
- Feedback storage is writable.
- Moodle launch audit storage is writable and acceptable for controlled pilot diagnostics.
- Knowledge base file is readable.
- Knowledge base metadata has been reviewed in `/admin`.
- `KNOWLEDGE_BASE_REVIEWED=true` is set only after lecturer/content-owner approval.
- `data/knowledge-base-review.json` is approved for pilot with reviewer name and review date.
- `/api/admin/knowledge-base/review.md` has been exported for the review record.
- `ADMIN_ACCESS_TOKEN` is configured.
- `/admin` and `/api/admin/*` are not publicly exposed without the pilot token or platform access controls.

## Moodle Checks

- Moodle allows iframe embedding from the assistant domain.
- Assistant response headers allow framing by the approved Moodle origin.
- `/embed` loads inside a controlled FYEC100 course shell.
- Moodle block scaffold has been reviewed in a test Moodle environment if used.
- Student responsible-use notice is visible.
- Keyboard navigation works inside the Moodle embed.
- Screen-reader status messages have been checked for loading, errors, and feedback saved state.
- Pilot launch context fields have been tested if used.
- Fallback link is available if iframe embedding fails.
- LTI readiness scaffold is reviewed if LTI testing is planned.

## Governance Checks

- Lecturer escalation path is confirmed.
- LMS administrator escalation path is confirmed.
- Technical support path is confirmed.
- Support escalation playbook owners are confirmed.
- Pilot feedback review schedule is confirmed.
- Planned pilot session exists in `data/pilot-sessions.json`.
- Pilot evidence dashboard status and recommended actions have been reviewed.
- Pilot sign-off pack approval owners and decision status have been reviewed.
- Integration decision criteria have been reviewed with the project team.
- Privacy notice and student guidance are approved.
- Accessibility and usability checklist has been reviewed.
- FYEC100 knowledge base content owner has approved the current Markdown file.
- Pilot group and dates are approved.

## Decision Point

Only proceed when blocking technical issues are resolved and the project sponsor,
project lead, lecturer, LMS administrator, and IT support path are aligned.
