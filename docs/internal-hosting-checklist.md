# Internal Hosting Checklist

## Target Architecture

```text
Student browser
  -> Public Moodle over HTTPS
  -> Public FYEC100 assistant hostname over HTTPS
  -> IIS ARR / URL Rewrite on the Windows VM
  -> Next.js on 127.0.0.1:4100
  -> Selected AI provider or internal Ollama service
```

The iframe URL must be reachable from student devices. Moodle being public does
not make a private assistant URL reachable through the iframe.

## VM Prerequisites

- Supported Windows Server release with current patches
- Node.js 20.9 or later
- Git for Windows
- IIS with approved ARR and URL Rewrite configuration
- Public DNS record and trusted TLS certificate
- Persistent writable `data/` location with backup coverage
- Approved outbound provider connectivity
- Service account with minimum filesystem and service permissions

## Required Environment

Use `scripts/windows/fyec100-env.example.ps1` as the template. At minimum:

```powershell
$env:NEXT_PUBLIC_APP_BASE_URL = "https://fyec100-assistant.example.edu"
$env:MOODLE_ORIGIN = "https://moodle.costaatt.edu.tt"
$env:MOODLE_INTEGRATION_MODE = "iframe"
$env:PILOT_MODE = "pilot"
$env:PROTECT_ADMIN_ROUTES = "true"
$env:ADMIN_ACCESS_TOKEN = "random_value_at_least_32_characters"
$env:ADMIN_SESSION_SECRET = "different_random_value_at_least_32_characters"
$env:TRUST_PROXY_HEADERS = "true"
```

Add the selected provider secret through COSTAATT's approved secret process. Do
not place production secrets in Git, screenshots, HTML packs, or support cases.

## Build and Service

```powershell
cd C:\Apps\FYEC100-AI-Support-Assistant
npm ci
npm run lint
npm run build
npm run start:pilot
```

Configure NSSM, PM2, or approved Windows service tooling with:

- Working directory: `C:\Apps\FYEC100-AI-Support-Assistant`
- Command: `npm run start:pilot`
- Host: `127.0.0.1`
- Port: `4100`
- Automatic restart after failure with a bounded restart policy
- Stdout/stderr directed to an approved rotating log location

## IIS and Moodle Checks

1. Terminate HTTPS at IIS.
2. Reverse proxy only to `http://127.0.0.1:4100`.
3. Preserve the original host and forwarded protocol.
4. Confirm `/embed` returns a `Content-Security-Policy` containing the exact
   configured Moodle origin.
5. Do not add a global `X-Frame-Options: DENY`; `/embed` must be frameable by
   the approved Moodle origin.
6. Test the iframe from a student device outside the server network.
7. Confirm fallback navigation opens the same public HTTPS hostname.

## Acceptance Commands

```powershell
Invoke-WebRequest https://fyec100-assistant.example.edu/api/health
Invoke-WebRequest https://fyec100-assistant.example.edu/api/ready
$env:PILOT_BASE_URL = "https://fyec100-assistant.example.edu"
npm run smoke:pilot
```

Expected:

- `/api/health` returns `200`.
- `/api/ready` returns `200` with no failed checks.
- `npm run smoke:pilot` reports zero failures.
- A provider test succeeds.
- Student chat, feedback, support handoff, admin login, archive export, KB
  workflow, and Moodle iframe are manually accepted.

## Backup and Rollback

- Back up `.env` through approved secret management, not source control.
- Back up `data/` before every release and KB publish.
- Keep the previous application release available.
- Record the previous commit and KB snapshot.
- Verify the rollback command and post-rollback smoke test before launch.

## Scaling Boundary

Local JSON/JSONL storage and in-process rate limiting support one controlled app
instance. Do not deploy multiple active instances behind a load balancer until
shared storage, session, nonce, audit, and rate-limit implementations are
approved and tested.
