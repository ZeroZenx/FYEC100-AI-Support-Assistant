# LTI 1.3 Readiness Scaffold

Phase 2 now includes an LTI 1.3 readiness scaffold for planning a future enterprise Moodle launch.

## What This Adds

- Protected admin readiness endpoint
- Placeholder tool endpoint URLs
- Environment variables for Moodle platform values
- Dashboard visibility for missing configuration
- Explicit trust-boundary warnings

## Admin Endpoint

```text
/api/admin/lti-readiness
```

## Placeholder Tool Endpoints

```text
/api/lti/login
/api/lti/launch
/api/lti/jwks
```

These are placeholders. They do not validate launches yet.

## Required Moodle Platform Values

```bash
LTI_PLATFORM_ISSUER=https://moodle.example.edu
LTI_CLIENT_ID=your_lti_client_id
LTI_DEPLOYMENT_ID=your_lti_deployment_id
LTI_PLATFORM_AUTH_URL=https://moodle.example.edu/mod/lti/auth.php
LTI_PLATFORM_TOKEN_URL=https://moodle.example.edu/mod/lti/token.php
LTI_PLATFORM_JWKS_URL=https://moodle.example.edu/mod/lti/certs.php
```

## Tool Values To Register In Moodle

Use the hosted assistant URL as the base URL.

```text
Tool URL: https://fyec100-assistant.example.edu/api/lti/launch
Initiate login URL: https://fyec100-assistant.example.edu/api/lti/login
Redirection URI: https://fyec100-assistant.example.edu/api/lti/launch
Public keyset/JWKS URL: https://fyec100-assistant.example.edu/api/lti/jwks
```

## Not Implemented Yet

- OIDC login initiation
- State and nonce storage
- ID token JWT validation
- JWKS signing key generation and rotation
- Deployment ID validation
- Moodle role mapping
- Trusted course/user launch context

## Trust Boundary

This is planning infrastructure only. Do not use it as production authentication. Before any real LTI pilot, the app must verify issuer, audience/client ID, deployment ID, nonce, message type, signature, roles, and target link URI.
