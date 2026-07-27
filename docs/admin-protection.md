# Admin Protection

## Purpose

Phase 2 protects staff pages and admin APIs with a signed local session backed
by a hosted admin access token. This supports a controlled pilot while COSTAATT
selects institutional SSO or trusted Moodle/LTI staff authorization.

## Configuration

Use different random values of at least 32 characters:

```bash
PROTECT_ADMIN_ROUTES=true
ADMIN_ACCESS_TOKEN=replace_with_a_strong_random_value
ADMIN_SESSION_SECRET=replace_with_a_different_strong_random_value
```

Hosted production mode fails closed when the access token or signing secret is
missing. Local development remains open only when route protection is
explicitly disabled.

## Staff Page Access

Open:

```text
http://localhost:4100/admin-login
```

The token is submitted in the `x-admin-token` request header and exchanged for
an HTTP-only, signed, eight-hour session cookie. Production does not accept
admin secrets in query strings.

## Admin API Access

Browser staff workflows use the signed session. Operational scripts may use:

```bash
curl -H "x-admin-token: replace_with_a_strong_random_value" \
  http://localhost:4100/api/admin/status
```

Do not put access tokens in URLs, logs, screenshots, reports, or Git.

## Production Boundary

The Phase 2 access model protects a controlled staff pilot. Before broad
institutional production, approve:

- Institutional SSO or trusted Moodle/LTI role authorization
- Centralized session invalidation and key rotation
- Role-specific route authorization
- Security monitoring and access review
