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

## OpenAI Integration

The chat assistant can use OpenAI or Ollama through a Next.js API route. The route reads `data/fyec100-knowledge-base.md` and passes it to the model as context. If the selected provider is not configured, the chat page still loads and returns a setup reminder.

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

Provider test endpoint:

```text
POST http://localhost:4100/api/admin/provider-test
```

See `docs/ollama-local-setup.md` for local Ollama setup.

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
```

Related checklists:

- `docs/internal-hosting-checklist.md`
- `docs/pre-pilot-go-live-checklist.md`
- `docs/stop-pilot-procedure.md`
- `docs/admin-protection.md`
- `docs/moodle-iframe-security.md`
- `docs/pilot-smoke-test.md`
- `docs/accessibility-usability-checklist.md`
- `docs/knowledge-base-management.md`
- `docs/pilot-session-planning.md`
- `docs/moodle-launch-audit.md`
- `docs/support-escalation-playbook.md`
- `docs/moodle-integration-decision.md`
- `docs/moodle-block-plugin-scaffold.md`
- `docs/lti-readiness-scaffold.md`

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

Phase 2 includes local-only feedback capture for pilot testing. Students can mark
assistant replies as helpful, not helpful, or needing lecturer follow-up, with an
optional note.

Feedback is stored locally in:

```text
data/pilot-feedback.jsonl
```

This file is ignored by Git and should not be treated as a production analytics
or student record system.

The `/admin` page includes a pilot review workflow that categorizes feedback and
suggests escalation owners. See `docs/pilot-review-workflow.md`.

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
http://localhost:4100/api/admin/integration-decision
http://localhost:4100/api/admin/lti-readiness
http://localhost:4100/api/admin/moodle-block
http://localhost:4100/api/admin/pilot-sessions
http://localhost:4100/api/admin/launch-audit
http://localhost:4100/api/admin/support-playbook
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
