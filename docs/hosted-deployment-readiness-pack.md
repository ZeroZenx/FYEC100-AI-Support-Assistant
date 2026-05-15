# FYEC100 Hosted Deployment Readiness Pack

The hosted deployment readiness pack supports Phase 2 review before moving the
FYEC100 AI Support Assistant from a local Mac prototype to a controlled hosted
pilot URL.

## Admin Endpoints

```text
/api/admin/hosted-deployment-pack
/api/admin/hosted-deployment-pack.md
```

Use `x-admin-token` or `?adminToken=...` when `ADMIN_ACCESS_TOKEN` is configured.

## What It Includes

- Environment readiness matrix
- Hosted URL and HTTPS checks
- Moodle origin readiness
- Admin token status
- AI provider configuration status
- Rate limit status
- Deployment target options
- Production caveats
- Hosted pilot verification steps
- Current deployment readiness checks

## Deployment Target Options

- Internal VM or campus server
- Approved cloud host
- Future container deployment
- Local Mac for demos only

## Required Review Before Hosted Moodle Pilot

- Use HTTPS.
- Configure `NEXT_PUBLIC_APP_BASE_URL`.
- Configure `MOODLE_ORIGIN`.
- Configure `ADMIN_ACCESS_TOKEN`.
- Confirm OpenAI, Ollama, or DeepSeek provider variables.
- Confirm writable storage or approved replacement storage.
- Run `PILOT_BASE_URL=<hosted-url> npm run smoke:pilot`.
- Keep `/admin` and `/api/admin/*` internal or protected.

## Trust Boundary

This pack supports a controlled Phase 2 hosted pilot. It is not a production
security approval, privacy assessment, or final Moodle/LTI authentication design.
