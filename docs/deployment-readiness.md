# Deployment Readiness

## Purpose

This document supports Phase 2 planning for moving the FYEC100 AI Support Assistant from a local Mac prototype to a hosted pilot environment.

## Server Requirements

- Node.js 20.9 or later
- npm
- HTTPS-capable hosting
- Persistent writable storage for local pilot feedback if JSONL feedback capture remains enabled
- Outbound network access to OpenAI if using `AI_PROVIDER=openai`
- Network access to the Ollama host if using `AI_PROVIDER=ollama`

## Environment Variables

Use `.env.production.example` as the production template.

Required:

```bash
NEXT_PUBLIC_APP_BASE_URL=https://fyec100-assistant.example.edu
AI_PROVIDER=openai
```

OpenAI:

```bash
OPENAI_API_KEY=replace_with_secure_secret
OPENAI_MODEL=gpt-4o-mini
```

Ollama:

```bash
OLLAMA_BASE_URL=http://ollama.internal:11434
OLLAMA_MODEL=llama3.1
```

## Build and Run

```bash
npm install
npm run build
npm run start
```

For a production service, run the app behind a process manager or platform service that restarts on failure.

## Health Check

Use this endpoint for readiness checks:

```text
/api/health
```

The health check reports:

- application status
- selected AI provider
- provider configuration warning
- knowledge base readability
- pilot feedback storage writability
- timestamp

## Moodle Requirements

Before pilot embedding:

- Confirm Moodle allows iframe embedding from the assistant domain.
- Use HTTPS in any shared or hosted environment.
- Add the `/embed` URL to a controlled FYEC100 course shell.
- Confirm student responsible-use wording.
- Confirm lecturer and LMS administrator escalation contacts.
- Confirm the pilot group and feedback review schedule.

## Feedback Storage

The local pilot feedback file is:

```text
data/pilot-feedback.jsonl
```

This is useful for pilot testing only. Before production, COSTAATT should approve logging, retention, privacy notice, access controls, and reporting requirements.

## Knowledge Base Updates

The Phase 2 prototype still reads:

```text
data/fyec100-knowledge-base.md
```

Before production, define who can edit, review, approve, and publish knowledge base updates.

## Security Notes

- Do not commit `.env.local` or production secrets.
- Do not expose local development URLs to students.
- Do not treat the current `/admin` page as a secured production admin console.
- Add authentication and role controls before production use.
- Review privacy, accessibility, and cybersecurity requirements before a live pilot.
