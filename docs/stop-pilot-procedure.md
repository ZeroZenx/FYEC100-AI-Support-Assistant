# Stop Pilot Procedure

## Purpose

Use this procedure if the hosted FYEC100 assistant pilot needs to be paused,
rolled back, or removed from Moodle.

## Stop Conditions

Pause the pilot if:

- The assistant gives unsafe or repeatedly incorrect guidance.
- Moodle access or embedding fails for students.
- The AI provider becomes unreliable.
- Sensitive information appears in pilot feedback.
- The hosted app becomes unavailable or unstable.
- The project sponsor or project lead requests a pause.

## Immediate Steps

1. Remove or hide the Moodle iframe, page resource, block, or pilot link.
2. Replace it with a short Moodle notice directing students to the lecturer or LMS support.
3. Stop the hosted app service if the issue is technical or privacy-related.
4. Preserve logs and pilot feedback according to the approved handling process.
5. Notify the project sponsor, project lead, lecturer, LMS administrator, and technical support team.

## Review Steps

1. Use `/api/admin/report.md` if available to summarize the issue.
2. Review the feedback queue in `/admin`.
3. Identify whether the issue is content, Moodle, AI provider, hosting, privacy, or governance related.
4. Decide whether to update the knowledge base, change settings, patch code, or keep the pilot paused.

## Restart Criteria

Restart only after:

- The issue has an agreed owner.
- A fix or mitigation is applied.
- `/api/admin/deployment-readiness` has no blocking failures.
- Moodle embed behavior is re-tested.
- The project lead approves restarting the pilot.
