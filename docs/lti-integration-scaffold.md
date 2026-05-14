# LTI Integration Scaffold

## Purpose

This document records the Phase 2 placeholder structure for a future Moodle LTI
1.3 integration. The current app does not implement production LTI
authentication yet. It only defines the fields and behavior the assistant will
need when Moodle becomes the trusted launch point.

## Current Pilot Context

The `/embed` route accepts optional query-string context for controlled pilot
testing:

```text
/embed?courseId=FYEC100&courseShortName=FYEC100&role=student&launchSource=iframe
```

Accepted fields:

- `courseId`
- `courseShortName`
- `role`
- `launchSource`

Supported roles:

- `student`
- `lecturer`
- `lms-admin`
- `unknown`

Supported launch sources:

- `iframe`
- `moodle-block`
- `lti`
- `direct`

## Important Trust Boundary

Query-string context is not authentication. It is suitable only for local
testing or a controlled pilot. The assistant uses it to tailor tone and
escalation guidance, but it must not be used for private records, grades,
official identity, or student-specific decisions.

## Future LTI 1.3 Fields

A production Moodle LTI implementation should define and validate:

- issuer
- client ID
- deployment ID
- JWKS URL
- login URL
- redirect URI
- launch ID token
- nonce and state
- course ID
- context label
- user role
- Moodle user ID or anonymized identifier

## Current Readiness Scaffold

The app now exposes a protected LTI readiness endpoint:

```text
/api/admin/lti-readiness
```

The app also exposes placeholder LTI tool endpoints:

```text
/api/lti/login
/api/lti/launch
/api/lti/jwks
```

These endpoints are not production LTI authentication. They exist so the project
team can plan Moodle external tool registration values and see the expected URL
shape.

## Environment Variables

```bash
LTI_PLATFORM_ISSUER=https://moodle.example.edu
LTI_CLIENT_ID=your_lti_client_id
LTI_DEPLOYMENT_ID=your_lti_deployment_id
LTI_PLATFORM_AUTH_URL=https://moodle.example.edu/mod/lti/auth.php
LTI_PLATFORM_TOKEN_URL=https://moodle.example.edu/mod/lti/token.php
LTI_PLATFORM_JWKS_URL=https://moodle.example.edu/mod/lti/certs.php
```

## Future Behavior

When LTI is implemented, Moodle should provide trusted launch context. The app
should then:

- Verify the LTI launch before opening the assistant.
- Map Moodle roles to assistant roles.
- Keep students inside the Moodle course shell.
- Avoid exposing private student records.
- Record only approved pilot or production analytics.
- Escalate course content issues to lecturers.
- Escalate LMS access or navigation issues to the LMS administrator.

## Current Code Touchpoints

- `lib/moodleContext.ts` defines pilot context types and parsing.
- `lib/moodleIntegrationDecision.ts` compares iframe, Moodle block, and LTI 1.3 paths.
- `moodle/block_fyec100assistant` contains the starter Moodle block plugin scaffold.
- `app/embed/page.tsx` reads pilot context from URL parameters.
- `components/ChatAssistant.tsx` displays embedded context and sends it to the chat API.
- `app/api/chat/route.ts` normalizes context before building the assistant prompt.
- `lib/guardrails.ts` adds context-aware guidance to the system prompt.
- `/admin` shows accepted context fields and sample embed snippets.
- `/api/admin/integration-decision` exposes the current integration decision matrix.
- `/api/admin/lti-readiness` exposes required platform values, tool endpoints, and remaining validation warnings.
- `/api/lti/login`, `/api/lti/launch`, and `/api/lti/jwks` are placeholder tool endpoints.
