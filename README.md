# FYEC100 AI Support Assistant

A local Phase 1 MVP prototype for the COSTAATT FYEC100 AI Academic Support Assistant. The app demonstrates a simple AI-powered support assistant for first-year students taking FYEC100.

## Project Goal

Create a working prototype that helps students ask FYEC100 questions, understand course expectations, get study tips, navigate the LMS, and receive academic integrity guidance.

## Phase Status

### Phase 1: Rapid MVP prototype

Built in this repository. Includes a local Next.js app, TypeScript, Tailwind CSS, OpenAI API route, Markdown knowledge base, chat interface, guardrails, and documentation.

### Phase 2: Enterprise integrated deployment

Started. Includes initial Moodle embed route planning, configurable AI provider support, and enterprise deployment documentation. Later work may include institutional hosting, authentication, Moodle plugin or LTI integration, Banner-aware support pathways, governance, monitoring, privacy review, and production operations.

### Phase 3: Advanced AI learning ecosystem

Future phase. May include personalized learning support, proactive nudges, multilingual guidance, richer analytics, and broader student success integrations.

## Project Team

- Kevin Ramsoobhag, VP Information Technology and Digital Transformation, Project Sponsor
- Darren Headley, Director | Technology Services, Project Lead and Technical Lead
- Deborah Romero, Developer
- Kester David, LMS Administrator
- Kevin Reece, System Administrator and Infrastructure Support

## Phase 1 Features

- Home page
- Chat assistant page
- Phase 2 admin readiness page
- About page
- Roadmap page
- Local Markdown knowledge base at `data/fyec100-knowledge-base.md`
- OpenAI-powered chat route at `app/api/chat/route.ts`
- Guardrails against writing full assignments
- Guardrails against claiming to grade work
- Academic integrity guidance
- Fallback response when information is not in the knowledge base
- Admin-friendly folders for app, components, library code, data, docs, and public assets

## Not Included in Phase 1

- Database
- Authentication
- Moodle integration
- Banner integration
- Production hosting
- Official grading
- Student record access

## Folder Structure

```text
app/
components/
lib/
data/
docs/
public/
```

## Mac Setup

1. Install Node.js 18 or later.
2. Install dependencies:

```bash
npm install
```

3. Create a local environment file:

```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
```

5. Start the local development server:

```bash
npm run dev
```

6. Open the app:

```text
http://localhost:4100
```

## AI Provider Integration

The chat assistant can use OpenAI, Ollama, or DeepSeek through a Next.js API route. The route reads `data/fyec100-knowledge-base.md` and passes it to the model as context. If the selected provider is not configured, the chat page still loads and returns a setup reminder.

OpenAI example:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

Ollama example:

```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

DeepSeek example:

```bash
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_MODEL=deepseek-chat
```

Provider test endpoint:

```text
POST http://localhost:4100/api/admin/provider-test
```

See `docs/ollama-local-setup.md` for local Ollama setup.

## Pilot Mode

Use `PILOT_MODE` to distinguish rehearsals from controlled pilot use:

```bash
PILOT_MODE=demo
```

Use `demo` for rehearsals, sponsor walkthroughs, and resettable test data. Use
`pilot` when running a controlled FYEC100 Moodle pilot where feedback and launch
records should be exported and reviewed before cleanup.

## Pilot Admin Protection

Phase 2 admin pages and admin API routes can be protected with:

```bash
ADMIN_ACCESS_TOKEN=change_me_for_hosted_pilot
```

Admin page example:

```text
http://localhost:4100/admin?adminToken=change_me_for_hosted_pilot
```

Admin API routes also accept `x-admin-token`. See
`docs/admin-protection.md`.

## Moodle Embed Pilot

Phase 2 starts with an embedded assistant view intended for Moodle iframe, modal, drawer, or future LTI testing:

```text
http://localhost:4100/embed
```

For a controlled Moodle pilot, the embedded route can receive simple launch
context:

```text
http://localhost:4100/embed?courseId=FYEC100&courseShortName=FYEC100&role=student&launchSource=iframe
```

This is not authentication. It is a Phase 2 scaffold for testing course and role
aware behavior before a Moodle block plugin or LTI 1.3 implementation.

See `docs/moodle-integration-notes.md` and `docs/phase-2-enterprise-plan.md`.
See `docs/lti-integration-scaffold.md` for future LTI field planning.

## Phase 2 Admin Readiness Page

Use this local page to review the current embed URL, AI provider status,
knowledge base file status, and Phase 2 deployment checklist:

```text
http://localhost:4100/admin
```

The same status is available as JSON:

```text
http://localhost:4100/api/admin/status
```

The admin page also provides copy-ready Moodle iframe, Moodle HTML block, and
fallback link snippets for pilot setup.

The admin page includes a pilot evidence dashboard that aggregates readiness,
knowledge base review, feedback, Moodle launch audit, Moodle block, and LTI
signals for sponsor go/no-go discussion.

The admin page also includes a pilot analytics summary for privacy-light launch,
feedback, role/source, escalation, and session signals during controlled Moodle
testing.

The admin page also includes a student support triage panel for routing feedback
items to lecturer, LMS administrator, IT, knowledge base, or academic integrity
owners.

The admin page also includes a pilot data cleanup preview and guarded reset
endpoint for clearing local demo/test telemetry before clean rehearsals. In
pilot mode, the cleanup preview warns admins to export records before reset.

The admin page also includes a consolidated HTML pilot export bundle for
human-readable meeting review, with diagrams, technical breakdowns, and links
to the detailed source reports.

The app also includes a `/reports` library page that groups human-readable
project reports and staff workspaces by executive review, Moodle readiness,
support operations, technical deployment, and knowledge base governance.

The report library now opens high-value HTML reports first for non-technical
reviewers, while keeping Markdown source exports available for project-team
traceability:

```text
http://localhost:4100/api/admin/pilot-evidence.html
http://localhost:4100/api/admin/support-triage.html
http://localhost:4100/api/admin/moodle-security-hardening.html
http://localhost:4100/api/admin/hosted-deployment-pack.html
```

The admin page also includes a hosted deployment readiness pack for IT review
of environment variables, hosting targets, production caveats, and hosted pilot
verification steps.

The admin page also includes a pilot sign-off pack for tracking project-team
approval owners before expanding the controlled Moodle pilot.

The admin page also includes a pilot meeting pack and Moodle pilot
configuration pack for project-team briefings and LMS setup.

The admin page also includes a pilot operations runbook for before-session,
during-session, student support, incident response, post-session, and stop-pilot
procedures.

The admin page also includes a Moodle pilot launch simulator for generating
role, course, placement, and launch-source preview URLs before testing inside a
real Moodle course shell.

The admin page also includes a Moodle security hardening pack for Moodle origin,
frame-ancestors headers, rebuild requirements, and iframe trust-boundary review.

The embedded assistant also includes role-aware pilot behavior so student,
lecturer, LMS administrator, and general pilot launch contexts receive tailored
starter prompts, notices, and support guidance.

The admin page also includes an action register for tracking pilot follow-up
items by owner, priority, status, source, and due date.

The admin page also includes a knowledge base change request workflow for
reviewing proposed FYEC100 content updates before they are added to the live
Markdown knowledge base.

The admin page also includes a knowledge base draft update workflow for staging
proposed wording before approved manual edits are applied to the live Markdown
knowledge base.

The admin page also includes a knowledge base apply checklist for tracking the
manual review, edit, guardrail, smoke test, and release-note steps required
before approved draft wording becomes live course content.

The admin page also includes knowledge base release notes for recording content
version snapshots, approval details, change request references, and known
limitations.

The admin page also includes an accessibility and Moodle usability review pack
for keyboard, screen-reader, embedded Moodle, and student clarity checks.

Phase 2 also includes staff-friendly workspaces for day-to-day pilot review:

```text
http://localhost:4100/knowledge-base-review
http://localhost:4100/feedback-inbox
http://localhost:4100/moodle-preview
http://localhost:4100/go-live
http://localhost:4100/role-views
http://localhost:4100/decision-packet
http://localhost:4100/pilot-sessions
http://localhost:4100/production-hardening
http://localhost:4100/deployment-wizard
http://localhost:4100/moodle-copy-center
http://localhost:4100/pilot-export-center
http://localhost:4100/hosting-runbook
http://localhost:4100/windows-automation
http://localhost:4100/moodle-launch-pack
http://localhost:4100/monitoring-incident-pack
http://localhost:4100/enterprise-lti-pack
http://localhost:4100/windows-vm-readiness
http://localhost:4100/iis-reverse-proxy
http://localhost:4100/windows-service-config
http://localhost:4100/deployment-acceptance
http://localhost:4100/pilot-approval
http://localhost:4100/risk-register
http://localhost:4100/privacy-data-handling
http://localhost:4100/change-control
http://localhost:4100/student-pilot-welcome
http://localhost:4100/student-ai-guide
http://localhost:4100/student-feedback-follow-up
http://localhost:4100/accessibility-test
http://localhost:4100/lti-technical
http://localhost:4100/lti-admin-config
http://localhost:4100/lti-security-audit
http://localhost:4100/pilot-outcomes
http://localhost:4100/content-gap-analysis
http://localhost:4100/student-success-insights
http://localhost:4100/pilot-closeout
http://localhost:4100/content-authoring
http://localhost:4100/kb-version-comparison
http://localhost:4100/content-release-flow
http://localhost:4100/kb-quality-checks
http://localhost:4100/support-case-queue
http://localhost:4100/support-response-templates
http://localhost:4100/support-sla
http://localhost:4100/post-pilot-support-review
http://localhost:4100/production-auth-plan
http://localhost:4100/data-retention-storage
http://localhost:4100/audit-monitoring-plan
http://localhost:4100/production-readiness-gate
http://localhost:4100/lti-state-store
http://localhost:4100/lti-launch-flow
http://localhost:4100/lti-validation
http://localhost:4100/trusted-moodle-context
http://localhost:4100/lti-test-harness
http://localhost:4100/audit-viewer
http://localhost:4100/storage-adapter
http://localhost:4100/retention-controls
http://localhost:4100/governance-export
http://localhost:4100/service-desk-intake
http://localhost:4100/support-case-lifecycle
http://localhost:4100/support-sla-rules
http://localhost:4100/support-assignment-board
http://localhost:4100/case-resolution-notes
http://localhost:4100/service-desk-export
http://localhost:4100/kb-publish-workflow
http://localhost:4100/kb-preview
http://localhost:4100/kb-diff-viewer
http://localhost:4100/kb-publish-gate
http://localhost:4100/kb-rollback-snapshot
http://localhost:4100/kb-release-pack
http://localhost:4100/student-prompt-starters
http://localhost:4100/conversation-outcomes
http://localhost:4100/student-helpfulness-followup
http://localhost:4100/learning-support-themes
http://localhost:4100/intervention-recommendations
http://localhost:4100/student-experience-report
http://localhost:4100/operational-health
http://localhost:4100/incident-capture
http://localhost:4100/alerts-plan
http://localhost:4100/runbook-action-center
http://localhost:4100/windows-vm-operations
http://localhost:4100/operations-handoff
http://localhost:4100/sponsor-dashboard
http://localhost:4100/decision-log
http://localhost:4100/benefits-realization
http://localhost:4100/risk-issue-heatmap
http://localhost:4100/milestone-timeline
http://localhost:4100/sponsor-review-pack
http://localhost:4100/moodle-placement-planner
http://localhost:4100/student-journey-preview
http://localhost:4100/lecturer-course-support
http://localhost:4100/moodle-assets-v2
http://localhost:4100/course-experience-qa
http://localhost:4100/moodle-course-experience-pack
http://localhost:4100/migration-readiness
http://localhost:4100/environment-promotion
http://localhost:4100/production-config-blueprint
http://localhost:4100/data-migration-plan
http://localhost:4100/cutover-rollback
http://localhost:4100/production-handover-pack
http://localhost:4100/evaluation-question-set
http://localhost:4100/response-quality-rubric
http://localhost:4100/manual-evaluation-workspace
http://localhost:4100/provider-comparison
http://localhost:4100/safety-regression
http://localhost:4100/ai-quality-review-pack
http://localhost:4100/course-config-model
http://localhost:4100/course-selector-admin
http://localhost:4100/per-course-kb-routing
http://localhost:4100/per-course-guardrails
http://localhost:4100/course-level-analytics
http://localhost:4100/scaling-governance-pack
http://localhost:4100/provider-registry
http://localhost:4100/provider-policy-matrix
http://localhost:4100/provider-health-cost
http://localhost:4100/provider-safety-comparison
http://localhost:4100/provider-fallback-plan
http://localhost:4100/ai-provider-governance-pack
http://localhost:4100/moodle-platform-config
http://localhost:4100/lti-registration-checklist
http://localhost:4100/launch-diagnostics
http://localhost:4100/trusted-launch-preview
http://localhost:4100/moodle-test-evidence-pack
http://localhost:4100/role-authorization-matrix
http://localhost:4100/route-protection-policy
http://localhost:4100/request-context-inspector
http://localhost:4100/admin-access-upgrade
http://localhost:4100/role-based-navigation
http://localhost:4100/auth-governance-pack
http://localhost:4100/storage-provider-interface
http://localhost:4100/local-file-adapter
http://localhost:4100/production-adapter-scaffold
http://localhost:4100/storage-migration-readiness
http://localhost:4100/retention-policy-enforcement
http://localhost:4100/storage-operations-pack
http://localhost:4100/evaluation-runner
http://localhost:4100/automated-guardrail-checks
http://localhost:4100/evaluation-results
http://localhost:4100/evaluation-evidence-pack
http://localhost:4100/admin-session-access
http://localhost:4100/admin-access-audit
http://localhost:4100/security-review-dashboard
http://localhost:4100/admin-security-pack
http://localhost:4100/deployment-command-center
http://localhost:4100/windows-script-verification
http://localhost:4100/iis-proxy-verification
http://localhost:4100/service-restart-runbook
http://localhost:4100/deployment-evidence-pack
http://localhost:4100/operations-command-dashboard
http://localhost:4100/incident-timeline
http://localhost:4100/alert-rules-workspace
http://localhost:4100/runbook-action-links
http://localhost:4100/operations-pack
http://localhost:4100/role-command-center
http://localhost:4100/sponsor-command-center
http://localhost:4100/project-lead-command-center
http://localhost:4100/lms-admin-command-center
http://localhost:4100/lecturer-command-center
http://localhost:4100/it-command-center
http://localhost:4100/governance-command-center
http://localhost:4100/developer-command-center
http://localhost:4100/kb-draft-workspace
http://localhost:4100/section-diff-viewer
http://localhost:4100/review-approval-gate
http://localhost:4100/publish-preview
http://localhost:4100/release-rollback-snapshot
http://localhost:4100/kb-release-control-pack
http://localhost:4100/student-needs-dashboard
http://localhost:4100/intervention-workspace
http://localhost:4100/lecturer-action-brief
http://localhost:4100/support-content-loop
http://localhost:4100/student-success-pack
http://localhost:4100/scale-decision-dashboard
http://localhost:4100/pilot-closeout-scale-pack
```

The decision packet can also be opened as a standalone HTML report:

```text
http://localhost:4100/api/admin/pilot-decision-packet.html
```

The hosted pilot handoff is designed with a future Windows VM environment in
mind. The deployment wizard and Windows VM runbook cover environment variables,
Node.js build/start commands, IIS or reverse proxy expectations, secrets, logs,
backup/retention, and rollback.

The Windows VM automation starter scripts are under:

```text
scripts/windows/
```

They include an environment template, install/build helper, service control
helper, and preflight checker for Node, Git, environment variables, port 4100,
and the health endpoint.

## Pilot Rate Limiting

The public pilot APIs use lightweight in-memory rate limits. Configure them in
`.env.local` or production hosting settings:

```bash
CHAT_RATE_LIMIT_PER_MINUTE=12
FEEDBACK_RATE_LIMIT_PER_MINUTE=30
LAUNCH_AUDIT_RATE_LIMIT_PER_MINUTE=60
PROVIDER_TEST_RATE_LIMIT_PER_MINUTE=6
```

These limits are suitable for a local or small hosted pilot. Enterprise
production should replace or extend them with platform-level protection.

## Health Check

Use this endpoint to confirm deployment readiness signals:

```text
http://localhost:4100/api/health
```

See `docs/deployment-readiness.md` for hosted pilot guidance.

Before a hosted Moodle pilot, use the deployment readiness endpoint:

```text
http://localhost:4100/api/admin/deployment-readiness
http://localhost:4100/api/admin/hosted-deployment-pack
http://localhost:4100/api/admin/hosted-deployment-pack.md
```

Related checklists:

- `docs/internal-hosting-checklist.md`
- `docs/hosted-deployment-readiness-pack.md`
- `docs/pre-pilot-go-live-checklist.md`
- `docs/stop-pilot-procedure.md`
- `docs/admin-protection.md`
- `docs/moodle-iframe-security.md`
- `docs/moodle-security-hardening.md`
- `docs/pilot-smoke-test.md`
- `docs/accessibility-usability-checklist.md`
- `docs/knowledge-base-management.md`
- `docs/pilot-session-planning.md`
- `docs/moodle-launch-audit.md`
- `docs/support-escalation-playbook.md`
- `docs/moodle-integration-decision.md`
- `docs/moodle-block-plugin-scaffold.md`
- `docs/lti-readiness-scaffold.md`
- `docs/pilot-evidence-dashboard.md`
- `docs/pilot-analytics-summary.md`
- `docs/support-triage-panel.md`
- `docs/pilot-data-cleanup.md`
- `docs/pilot-export-bundle.md`
- `docs/pilot-signoff-pack.md`
- `docs/pilot-meeting-pack.md`
- `docs/pilot-operations-runbook.md`
- `docs/moodle-launch-simulator.md`
- `docs/role-aware-assistant-behavior.md`
- `docs/moodle-pilot-configuration-pack.md`
- `docs/admin-action-register.md`
- `docs/knowledge-base-apply-checklist.md`
- `docs/knowledge-base-change-requests.md`
- `docs/knowledge-base-draft-updates.md`
- `docs/knowledge-base-release-notes.md`

## Pilot Smoke Test

After building or deploying the app, run:

```bash
npm run smoke:pilot
```

For hosted environments:

```bash
PILOT_BASE_URL=https://fyec100-assistant.example.edu npm run smoke:pilot
```

## Pilot Feedback Capture

Phase 2 includes local-only feedback capture for pilot testing. Students can
categorize assistant replies as helpful, not helpful, LMS/navigation issue,
missing course information, academic integrity concern, technical issue, or
lecturer follow-up needed, with an optional note.

Feedback is stored locally in:

```text
data/pilot-feedback.jsonl
```

This file is ignored by Git and should not be treated as a production analytics
or student record system.

The `/admin` page includes a pilot review workflow that categorizes feedback and
suggests escalation owners while keeping feedback privacy-light. See
`docs/pilot-review-workflow.md`.

Pilot report endpoints are also available for project-team review meetings:

```text
http://localhost:4100/api/admin/report
http://localhost:4100/api/admin/report.md
```

See `docs/pilot-reporting.md`.

## Pilot Operations

Phase 2 now includes file-based operational scaffolds for controlled Moodle
testing:

- pilot session planning from `data/pilot-sessions.json`
- privacy-light Moodle launch audit records in `data/moodle-launch-audit.jsonl`
- support escalation guidance for lecturer, LMS, knowledge base, technical, and academic integrity issues

Protected admin endpoints:

```text
http://localhost:4100/api/admin/pilot-export-bundle.html
http://localhost:4100/api/admin/pilot-export-bundle.md
http://localhost:4100/api/admin/pilot-decision-packet.html
http://localhost:4100/api/admin/windows-hosting-runbook.html
http://localhost:4100/api/admin/windows-automation-pack.html
http://localhost:4100/api/admin/moodle-launch-pack.html
http://localhost:4100/api/admin/monitoring-incident-pack.html
http://localhost:4100/api/admin/enterprise-lti-pack.html
http://localhost:4100/api/admin/windows-vm-readiness
http://localhost:4100/api/admin/iis-reverse-proxy-pack.html
http://localhost:4100/api/admin/windows-service-pack.html
http://localhost:4100/api/admin/deployment-acceptance.html
http://localhost:4100/api/admin/governance-pack.html
http://localhost:4100/api/admin/student-readiness-pack.html
http://localhost:4100/api/admin/lti-technical-pack.html
http://localhost:4100/api/admin/pilot-outcomes-pack.html
http://localhost:4100/api/admin/kb-content-ops-pack.html
http://localhost:4100/api/admin/support-operations-pack.html
http://localhost:4100/api/admin/enterprise-hardening-pack.html
http://localhost:4100/api/admin/lti-technical-build.html
http://localhost:4100/api/admin/governance-audit-pack.html
http://localhost:4100/api/admin/service-desk-pack.html
http://localhost:4100/api/admin/kb-publishing-pack.html
http://localhost:4100/api/admin/student-experience-pack.html
http://localhost:4100/api/admin/audit-events
http://localhost:4100/api/admin/service-desk/cases
http://localhost:4100/api/admin/operations-health
http://localhost:4100/api/admin/operations-handoff.html
http://localhost:4100/api/admin/sponsor-review-pack.html
http://localhost:4100/api/admin/moodle-course-experience-pack.html
http://localhost:4100/api/admin/production-handover-pack.html
http://localhost:4100/api/admin/ai-quality-review-pack.html
http://localhost:4100/api/admin/scaling-governance-pack.html
http://localhost:4100/api/admin/provider-governance-pack.html
http://localhost:4100/api/admin/moodle-test-evidence-pack.html
http://localhost:4100/api/admin/auth-governance-pack.html
http://localhost:4100/api/admin/storage-operations-pack.html
http://localhost:4100/api/admin/evaluation-runner
http://localhost:4100/api/admin/evaluation-evidence-pack.html
http://localhost:4100/api/admin/session
http://localhost:4100/api/admin/windows-script-verification
http://localhost:4100/api/admin/admin-security-pack.html
http://localhost:4100/api/admin/deployment-evidence-pack.html
http://localhost:4100/api/admin/operations-pack.html
http://localhost:4100/api/admin/role-command-center-pack.html
http://localhost:4100/api/admin/kb-release-control-pack.html
http://localhost:4100/api/admin/student-success-pack.html
http://localhost:4100/api/admin/pilot-closeout-scale-pack.html
http://localhost:4100/api/admin/integration-decision
http://localhost:4100/api/admin/hosted-deployment-pack
http://localhost:4100/api/admin/hosted-deployment-pack.html
http://localhost:4100/api/admin/hosted-deployment-pack.md
http://localhost:4100/api/admin/lti-readiness
http://localhost:4100/api/admin/moodle-block
http://localhost:4100/api/admin/moodle-security-hardening
http://localhost:4100/api/admin/moodle-security-hardening.html
http://localhost:4100/api/admin/moodle-security-hardening.md
http://localhost:4100/api/admin/pilot-sessions
http://localhost:4100/api/admin/launch-audit
http://localhost:4100/api/admin/support-playbook
http://localhost:4100/api/admin/support-triage
http://localhost:4100/api/admin/support-triage.html
http://localhost:4100/api/admin/support-triage.md
http://localhost:4100/api/admin/pilot-data-cleanup
http://localhost:4100/api/admin/pilot-data-cleanup.md
http://localhost:4100/api/admin/pilot-evidence
http://localhost:4100/api/admin/pilot-evidence.html
http://localhost:4100/api/admin/pilot-evidence.md
http://localhost:4100/api/admin/pilot-analytics
http://localhost:4100/api/admin/pilot-analytics.md
http://localhost:4100/api/admin/pilot-signoff
http://localhost:4100/api/admin/pilot-signoff.md
http://localhost:4100/api/admin/pilot-meeting-pack
http://localhost:4100/api/admin/pilot-meeting-pack.md
http://localhost:4100/api/admin/moodle-launch-simulator
http://localhost:4100/api/admin/moodle-launch-simulator.md
http://localhost:4100/api/admin/moodle-pilot-config
http://localhost:4100/api/admin/moodle-pilot-config.md
http://localhost:4100/api/admin/actions
http://localhost:4100/api/admin/actions.md
http://localhost:4100/api/admin/knowledge-base/change-requests
http://localhost:4100/api/admin/knowledge-base/change-requests.md
http://localhost:4100/api/admin/knowledge-base/releases
http://localhost:4100/api/admin/knowledge-base/releases.md
```

## Moodle Block Plugin Scaffold

A starter Moodle block plugin is included at:

```text
moodle/block_fyec100assistant
```

For Moodle test installation, copy it to:

```text
blocks/fyec100assistant
```

See `docs/moodle-block-plugin-scaffold.md`. This is a Phase 2 scaffold for LMS
administrator review, not production LTI authentication.

## LTI 1.3 Readiness

Phase 2 includes LTI planning endpoints and configuration checks:

```text
http://localhost:4100/api/admin/lti-readiness
http://localhost:4100/api/lti/login
http://localhost:4100/api/lti/launch
http://localhost:4100/api/lti/jwks
```

These are readiness scaffolds only. They do not validate Moodle launches yet.
See `docs/lti-readiness-scaffold.md`.

## Knowledge Base Updates

Edit this file to update Phase 1 course content:

```text
data/fyec100-knowledge-base.md
```

After changes, restart the dev server if needed.

The admin dashboard and `/api/admin/knowledge-base` expose read-only metadata
for content governance. Set `KNOWLEDGE_BASE_REVIEWED=true` only after lecturer
or content-owner review.

Phase 2 also includes a file-based review record:

```text
data/knowledge-base-review.json
```

Protected review endpoints:

```text
http://localhost:4100/api/admin/knowledge-base/review
http://localhost:4100/api/admin/knowledge-base/review.md
```

## GitHub Upload Instructions

```bash
git init
git add .
git commit -m "Initial FYEC100 AI support assistant MVP"
git branch -M main
git remote add origin <GITHUB_REPO_URL>
git push -u origin main
```

For this project repository:

```bash
git remote add origin https://github.com/ZeroZenx/FYEC100-AI-Support-Assistant.git
git branch -M main
git push -u origin main
```

## Responsible Use

This assistant supports learning but does not replace lecturers, LMS administrators, official course outlines, or institutional policies. Students should not submit AI-generated content as their own work.
