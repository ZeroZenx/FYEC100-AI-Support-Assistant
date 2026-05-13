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

## Recommended Pilot Path

1. Host the assistant internally or on an approved cloud environment.
2. Configure the app with either OpenAI or Ollama.
3. Embed `/embed` inside a Moodle FYEC100 pilot course, optionally using pilot context fields.
4. Use `/admin` to confirm provider status, knowledge base status, and readiness items.
5. Review captured pilot feedback after each controlled session using the admin pilot review workflow.
6. Collect feedback from students, lecturers, LMS administration, and IT.
7. Decide whether to proceed with a Moodle block plugin or LTI integration.
