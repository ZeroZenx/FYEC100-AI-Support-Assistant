# Admin Protection Scaffold

## Purpose

Phase 2 includes a lightweight pilot admin token to reduce accidental exposure
of `/admin` and `/api/admin/*` during hosted testing. This is a bridge for a
controlled pilot, not production authentication.

## Environment Variable

Set this in `.env.local` or hosted environment settings:

```bash
ADMIN_ACCESS_TOKEN=replace_with_secure_random_value
```

Use a long random value for hosted pilots. Do not commit real tokens to Git.

## Admin Page Access

Open the admin page with:

```text
http://localhost:4100/admin?adminToken=replace_with_secure_random_value
```

If `ADMIN_ACCESS_TOKEN` is not configured, local development access is allowed
and the admin page shows a warning. Before hosted pilot use, configure the
token.

## Admin API Access

Admin API routes accept the token in either a header or query parameter.

Header example:

```bash
curl -H "x-admin-token: replace_with_secure_random_value" http://localhost:4100/api/admin/status
```

Query-string example:

```text
http://localhost:4100/api/admin/status?adminToken=replace_with_secure_random_value
```

Protected routes:

- `/api/admin/status`
- `/api/admin/provider-test`
- `/api/admin/report`
- `/api/admin/report.md`
- `/api/admin/deployment-readiness`

## Production Gap

This scaffold does not replace:

- Moodle role validation
- LTI 1.3 launch validation
- Single sign-on
- Role-based access control
- Audit logging
- Enterprise session management

Before production deployment, replace or wrap this scaffold with approved
institutional authentication and authorization.
