# Phase 2 Enterprise Integrated Deployment Plan

## Objective

Move the FYEC100 AI Support Assistant from a local prototype toward a Moodle-centered enterprise deployment while preserving academic integrity, human oversight, and institutional governance.

## Phase 2 Workstreams

### Moodle Embedded Experience

Students should remain inside Moodle. The assistant can be exposed through one of three integration paths:

- Moodle iframe or page resource for quick pilot testing
- Custom Moodle block plugin for a course-level assistant panel
- LTI 1.3 tool launch for a more enterprise-ready integration model

The current prototype includes `/embed`, a Moodle-friendly assistant view without standalone site navigation.

The current prototype also includes `/admin`, a project-team readiness view for checking provider configuration, Moodle embed URL, knowledge base status, and deployment checklist items.

The `/admin` page includes copy-ready Moodle pilot snippets and the chat
interface includes a responsible-use notice for students.

The `/embed` route now accepts pilot launch context fields for course ID, course
short name, user role, and launch source. This supports Moodle iframe or block
testing while keeping the trust boundary clear.

### Authentication and Context

Phase 2 should not ask students to create separate assistant accounts. Moodle should remain the front door. Later implementation can pass trusted context such as course ID, role, and launch source through Moodle plugin configuration or LTI.

Current query-string context is only a pilot scaffold. Production must replace
it with Moodle block or LTI 1.3 validation before trusting user, role, or course
identity.

### AI Provider Strategy

The app now supports provider configuration:

- `AI_PROVIDER=openai` for OpenAI API usage
- `AI_PROVIDER=ollama` for locally hosted Ollama models

This allows COSTAATT to test cloud and local AI options without rebuilding the chat interface.

### Governance and Support

Phase 2 should define:

- Knowledge base approval process
- Lecturer escalation process
- LMS administrator escalation process
- Privacy and cybersecurity review
- AI usage guidance for students
- Monitoring and incident response

The current prototype includes local-only pilot feedback capture. It is useful
for early testing but is not a production student record, analytics, or case
management system.

The current prototype also includes an admin pilot review workflow that
categorizes feedback and suggests escalation owners for lecturer follow-up, LMS
administrator issues, knowledge base updates, and technical/provider issues.

The current prototype includes pilot reporting endpoints that return JSON and
Markdown summaries for project-team review meetings.

The current prototype includes a pilot evidence dashboard that aggregates
readiness, knowledge base review, pilot feedback, Moodle launch audit, Moodle
block, and LTI readiness signals for sponsor go/no-go discussion.

The current prototype includes a file-based pilot sign-off pack for tracking
project-team approval owners and exporting a Markdown sign-off record.

The current prototype includes a pilot meeting pack that consolidates evidence,
sign-off, readiness, feedback, launch audit, knowledge base review, and Moodle
integration status into one Markdown briefing.

The current prototype includes a Moodle pilot configuration pack with LMS-ready
embed snippets, setup steps, preflight signals, and trust-boundary guidance.

The current prototype includes an admin action register for tracking pilot
follow-up items by owner, priority, status, source, and due date.

The current prototype includes a knowledge base change request workflow so
pilot feedback can become reviewed and approved FYEC100 content updates before
the live Markdown knowledge base is edited.

The current prototype includes knowledge base release notes for recording
content version snapshots, approval details, change request references, and
known limitations for each pilot stage.

The current prototype includes a file-based pilot session planner for dry runs,
small student pilots, pre-checks, success criteria, and post-session review.

The current prototype includes privacy-light Moodle launch audit diagnostics for
the embedded `/embed` route. This is only pilot telemetry and avoids intentional
capture of names, email addresses, grades, student IDs, or student record data.

The current prototype includes a support escalation playbook that maps common
pilot issues to lecturer, LMS administrator, knowledge base, technical, and
academic integrity owners.

The current prototype includes a Moodle integration decision matrix comparing
iframe pilot, custom Moodle block, and LTI 1.3 paths.

The current prototype includes a starter Moodle block plugin scaffold under
`moodle/block_fyec100assistant` for LMS administrator review in a Moodle test
environment.

The current prototype includes an LTI 1.3 readiness scaffold for required
Moodle platform values, placeholder tool endpoints, and launch validation
warnings. It does not implement production LTI authentication yet.

The current prototype includes deployment readiness checks for hosted URL,
HTTPS, provider configuration, pilot rate limits, knowledge base readability,
feedback storage, admin exposure, and controlled pilot scope.

The current prototype includes a pilot admin token scaffold for `/admin` and
`/api/admin/*`. This is a temporary Phase 2 safeguard and should be replaced by
approved authentication and authorization for production.

The current prototype includes Moodle iframe polish and configurable
`frame-ancestors` security headers through `MOODLE_ORIGIN`.

The current prototype includes student-facing accessibility and usability
improvements for keyboard navigation, status messaging, focus visibility, and
Moodle iframe review.

The current prototype includes an accessibility and Moodle usability review
pack for tracking keyboard, screen-reader, Moodle iframe, and student clarity
checks before pilot go-live.

The current prototype includes a read-only knowledge base management scaffold
for content metadata, section headings, preview, and review status.

The current prototype includes a file-based knowledge base review workflow with
reviewer, review date, approval status, content-owner notes, and Markdown export
for governance meetings.

The current prototype includes `/api/health` for deployment readiness checks.
It also includes `POST /api/admin/provider-test` to confirm the selected OpenAI
or Ollama model responds before Moodle pilot testing.

The current prototype includes lightweight in-memory rate limits for chat,
feedback, and provider test APIs. These are appropriate for a controlled pilot,
but a hosted production rollout should add platform-level protection.

### Production Readiness

Before enterprise launch, the project should add:

- Hosting plan
- HTTPS
- Environment secret management
- Logging policy
- Production-grade rate limiting
- Accessibility review
- Moodle pilot group
- Support handoff documentation
- Moodle block or LTI 1.3 implementation decision
- Hosted pilot go-live and stop-pilot procedures
- Admin access protection before hosted pilot use
- Moodle iframe security header review
- Accessibility and usability review inside Moodle
- Knowledge base content-owner review before hosted pilot

## Recommended Pilot Path

1. Host the assistant internally or on an approved cloud environment.
2. Configure the app with either OpenAI or Ollama.
3. Run `/api/admin/deployment-readiness` and resolve blocking failures.
4. Embed `/embed` inside a Moodle FYEC100 pilot course, optionally using pilot context fields.
5. Use `/admin` to confirm provider status, knowledge base status, and readiness items.
6. Review captured pilot feedback after each controlled session using the admin pilot review workflow.
7. Review launch audit diagnostics to confirm the assistant is being opened from the intended Moodle course context.
8. Review the pilot evidence dashboard and export the Markdown snapshot for project-team records.
9. Review the pilot sign-off pack and record project-team approval status.
10. Export the pilot meeting pack for sponsor and project-team review.
11. Export the Moodle pilot configuration pack for LMS setup.
12. Update the admin action register with follow-up items from the meeting.
13. Review knowledge base change requests before editing the FYEC100 Markdown content.
14. Record knowledge base release notes for the version used in the pilot.
15. Review the accessibility and Moodle usability pack inside the controlled Moodle shell.
16. Generate a pilot report for sponsor, lecturer, LMS administrator, and IT review.
17. Collect feedback from students, lecturers, LMS administration, and IT.
18. Use the integration decision matrix to decide whether to proceed with a Moodle block plugin or LTI integration.
