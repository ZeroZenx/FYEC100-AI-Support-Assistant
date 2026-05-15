# FYEC100 Moodle Security Hardening

This Phase 2 pack helps the project team and LMS/System administrators prepare
the assistant for controlled Moodle iframe testing.

## Admin Endpoints

```text
/api/admin/moodle-security-hardening
/api/admin/moodle-security-hardening.md
```

Use `x-admin-token` or `?adminToken=...` when `ADMIN_ACCESS_TOKEN` is configured.

## What It Checks

- `MOODLE_ORIGIN` configuration
- hosted assistant URL readiness
- expected `Content-Security-Policy` frame-ancestors value
- rebuild/redeploy requirement after changing `MOODLE_ORIGIN`
- admin route exposure
- pilot context trust boundary

## Key Rule

Set `MOODLE_ORIGIN` to the Moodle origin only:

```bash
MOODLE_ORIGIN=https://moodle.costaatt.edu.tt
```

Do not include a Moodle course path such as `/course/view.php`.

## Verification

After setting `MOODLE_ORIGIN`, rebuild and redeploy. Then run:

```bash
PILOT_BASE_URL=https://fyec100-assistant.example.edu MOODLE_ORIGIN=https://moodle.costaatt.edu.tt npm run smoke:pilot
```

The smoke test should confirm the `/embed` response includes a
`Content-Security-Policy` header with the Moodle origin in `frame-ancestors`.
