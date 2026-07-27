# FYEC100 AI Support Assistant

COSTAATT's course-grounded academic support assistant for FYEC100. The system
supports a controlled Moodle pilot with local Markdown knowledge, responsible AI
guardrails, student feedback, human support handoff, knowledge-base operations,
provider testing, evaluation, deployment evidence, and role-focused staff
workspaces.

## Current Status

- **Phase 1: Rapid MVP prototype** - Complete.
- **Phase 2: Enterprise integrated pilot** - Production candidate. The app,
  Moodle iframe path, staff workflows, security controls, and Windows VM tooling
  are implemented. Live readiness still depends on COSTAATT supplying approved
  HTTPS, Moodle, secret, provider, and hosting values.
- **Phase 3: Advanced AI learning ecosystem** - Planned after the controlled
  pilot passes its evidence and approval gate.

Phase 3 will focus on learning value: personalized study planning, reflection
support without grading, proactive support recommendations, richer quality
evaluation, and governed multi-course rollout.

## Project Team

- Kevin Ramsoobhag, VP Information Technology and Digital Transformation, Project Sponsor
- Darren Headley, Director | Technology Services, Project Lead and Technical Lead
- Deborah Romero, Developer
- Kester David, LMS Administrator
- Kevin Reece, System Administrator and Infrastructure Support

## Core Capabilities

- Student chat at `/chat` and focused Moodle iframe experience at `/embed`
- Course-specific knowledge-base routing with FYEC100 as the local default
- Curated source-of-truth content in `data/fyec100-knowledge-base.md`
- OpenAI, DeepSeek, and Ollama provider support with bounded requests and timeouts
- Academic integrity refusals and lecturer/LMS escalation guidance
- Feedback, support cases, evaluation, KB publish/rollback, and pilot archive workflows
- Role-aware staff access and protected internal routes in hosted environments
- Windows VM, IIS reverse proxy, service, smoke-test, and rollback tooling
- Production liveness at `/api/health` and deployment readiness at `/api/ready`

## Technology

- Next.js 16 App Router
- TypeScript and React 19
- Tailwind CSS
- Local Markdown and JSON/JSONL storage for the single-instance Phase 2 pilot
- No Banner integration and no grading or student-record access

## Local Setup on Mac

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:4100](http://localhost:4100).

Set one provider in `.env.local`:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

For Ollama:

```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

Never commit `.env.local` or API keys.

## Verification

```bash
npm run lint
npm run build
PILOT_BASE_URL=http://127.0.0.1:4100 npm run smoke:pilot
npm audit --omit=dev
```

The smoke suite can test protected hosted pages when `ADMIN_ACCESS_TOKEN` is
available in the shell.

## Hosted Pilot Configuration

Use different random values of at least 32 characters:

```bash
NEXT_PUBLIC_APP_BASE_URL=https://fyec100-assistant.example.edu
MOODLE_ORIGIN=https://moodle.costaatt.edu.tt
MOODLE_INTEGRATION_MODE=iframe
PILOT_MODE=pilot
PROTECT_ADMIN_ROUTES=true
ADMIN_ACCESS_TOKEN=replace_with_a_strong_random_value
ADMIN_SESSION_SECRET=replace_with_a_different_strong_random_value
STORAGE_ADAPTER=local
TRUST_PROXY_HEADERS=true
```

Run `/api/ready` after deployment. A `200` response means code-level required
configuration is present. A `503` response lists missing deployment values
without displaying secrets.

The local storage adapter is suitable for one controlled Windows VM app
instance. Before active-active server-farm scaling, COSTAATT must select an
approved shared SQL Server/PostgreSQL or equivalent storage adapter and a shared
rate-limit/session strategy.

## Moodle Delivery

The Phase 2 pilot uses the public HTTPS `/embed` URL inside Moodle. The
application does not need to share Moodle's server, but every student's browser
must be able to reach its HTTPS hostname. `MOODLE_ORIGIN` restricts which Moodle
origin may frame the assistant.

Course context supplied by iframe parameters supports pilot routing but is not
identity authentication. Keep `MOODLE_INTEGRATION_MODE=iframe` until the LTI
launch validation and institutional role mapping are formally approved.

## Windows VM Deployment

Windows assets are under `scripts/windows/`:

- `fyec100-env.example.ps1`
- `test-fyec100-preflight.ps1`
- `install-fyec100-service.ps1`
- `manage-fyec100-service.ps1`

The production process is started with:

```bash
npm run start:pilot
```

It binds to `127.0.0.1:4100` by default so IIS can terminate HTTPS and reverse
proxy to the app. See [docs/internal-hosting-checklist.md](docs/internal-hosting-checklist.md).

## Repository Structure

```text
app/          Next.js pages and API routes
components/   Shared student and staff UI
lib/          Providers, guardrails, routing, storage, auth, and workflows
data/         Approved KB and local pilot records
docs/         Governance, Moodle, RAG, and deployment guidance
public/       COSTAATT brand assets
scripts/      Smoke tests and Windows operations scripts
```

## Key Documentation

- [Project scope](docs/project-scope.md)
- [Phase roadmap](docs/phase-roadmap.md)
- [Governance notes](docs/governance-notes.md)
- [FYEC100 RAG source map](docs/fyec100-rag-source-map.md)
- [Internal hosting checklist](docs/internal-hosting-checklist.md)
- [Moodle integration notes](docs/moodle-integration-notes.md)

## GitHub Upload

```bash
git init
git add .
git commit -m "Initial FYEC100 AI support assistant MVP"
git branch -M main
git remote add origin https://github.com/ZeroZenx/FYEC100-AI-Support-Assistant.git
git push -u origin main
```

## Production Boundary

This repository can be deployed as a controlled single-instance Phase 2 pilot.
Calling it institutional production requires COSTAATT approval of the public
hostname and TLS certificate, Moodle placement, secrets, selected provider,
privacy/retention decisions, backup and rollback evidence, support ownership,
and the `/api/ready` and pilot smoke results.
