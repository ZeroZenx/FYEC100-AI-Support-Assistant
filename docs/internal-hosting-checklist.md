# Internal Hosting Checklist

## Purpose

Use this checklist when moving the FYEC100 AI Support Assistant from a local Mac
prototype to a controlled hosted pilot URL.

## Hosting Requirements

- Node.js 20.9 or later
- npm
- HTTPS-capable web hosting
- Approved environment secret storage
- Persistent writable storage if local JSONL pilot feedback remains enabled
- Outbound access to OpenAI if using `AI_PROVIDER=openai`
- Network access to the Ollama host if using `AI_PROVIDER=ollama`
- Platform access controls around `/admin` and `/api/admin/*`
- `ADMIN_ACCESS_TOKEN` configured before hosted testing
- `MOODLE_ORIGIN` configured to the approved Moodle origin

## Required Environment Settings

Set:

```bash
NEXT_PUBLIC_APP_BASE_URL=https://fyec100-assistant.example.edu
AI_PROVIDER=openai
```

For OpenAI:

```bash
OPENAI_API_KEY=replace_with_secure_secret
OPENAI_MODEL=gpt-4o-mini
```

For Ollama:

```bash
OLLAMA_BASE_URL=http://ollama.internal:11434
OLLAMA_MODEL=llama3.1
```

Set pilot rate limits:

```bash
CHAT_RATE_LIMIT_PER_MINUTE=12
FEEDBACK_RATE_LIMIT_PER_MINUTE=30
PROVIDER_TEST_RATE_LIMIT_PER_MINUTE=6
```

Set pilot admin protection:

```bash
ADMIN_ACCESS_TOKEN=replace_with_secure_random_value
```

Set Moodle iframe origin:

```bash
MOODLE_ORIGIN=https://moodle.costaatt.edu.tt
```

## Verification

After deployment:

1. Open `/api/health`.
2. Open `/api/admin/deployment-readiness`.
3. Confirm there are no `fail` checks.
4. Review warnings with the project lead and technical lead.
5. Run `POST /api/admin/provider-test`.
6. Open `/embed`.
7. Confirm Moodle can iframe the hosted `/embed` URL.
8. Confirm `/admin` requires `?adminToken=...` or platform controls.
9. Confirm `/api/admin/*` requires `x-admin-token` or platform controls.
10. Confirm the `Content-Security-Policy` frame-ancestors header includes the Moodle origin.
11. Rebuild the app after changing `MOODLE_ORIGIN`; header configuration is applied at build time.

## Notes

The current `/admin` page is not an authenticated production console. Do not
expose it openly on the internet. For a hosted pilot, protect it through hosting
platform controls, VPN, reverse proxy authentication, or another approved access
control.
