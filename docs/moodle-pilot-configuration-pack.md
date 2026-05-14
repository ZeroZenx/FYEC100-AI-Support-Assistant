# Moodle Pilot Configuration Pack

## Purpose

The Moodle pilot configuration pack gives the LMS administrator and technical
team the key settings for placing the FYEC100 AI Support Assistant inside a
controlled Moodle course.

It focuses on Phase 2 pilot setup. It is not production LTI authentication.

## Admin View

Open:

```text
http://localhost:4100/admin
```

The "Moodle Pilot Configuration" section shows:

- deployment preflight failures and warnings
- LMS setup steps
- Moodle iframe snippet
- Markdown export endpoint
- trust-boundary guidance

## Protected Endpoints

```text
http://localhost:4100/api/admin/moodle-pilot-config
http://localhost:4100/api/admin/moodle-pilot-config.md
```

If `ADMIN_ACCESS_TOKEN` is configured, pass it with `?adminToken=...` in the
browser or the `x-admin-token` header for API calls.

## Configuration Items

- `NEXT_PUBLIC_APP_BASE_URL`: approved assistant base URL
- `MOODLE_ORIGIN`: approved Moodle HTTPS origin
- `/embed`: Moodle-friendly assistant route
- optional query-string pilot context: `courseId`, `courseShortName`, `role`,
  and `launchSource`

## Trust Boundary

Iframe and Moodle block pilot context is not authenticated identity. Production
should use approved Moodle-side validation or LTI 1.3 launch validation before
trusting role, course, or user context.
