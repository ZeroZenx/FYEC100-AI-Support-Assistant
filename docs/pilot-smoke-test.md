# Pilot Smoke Test

## Purpose

Use the pilot smoke test after building or deploying the FYEC100 AI Support
Assistant. It confirms the key pages and readiness endpoints respond before the
assistant is embedded in Moodle.

## Commands

Build the app:

```bash
npm run build
```

Start the production server locally:

```bash
npm run start:pilot
```

Run the smoke test in another terminal:

```bash
npm run smoke:pilot
```

By default, the smoke test checks:

```text
http://localhost:4100
```

For a hosted pilot URL:

```bash
PILOT_BASE_URL=https://fyec100-assistant.example.edu npm run smoke:pilot
```

## Admin Token

If `ADMIN_ACCESS_TOKEN` is configured, the smoke test automatically sends it to
admin endpoints as:

```text
x-admin-token: <ADMIN_ACCESS_TOKEN>
```

Example:

```bash
ADMIN_ACCESS_TOKEN=replace_with_secure_random_value npm run smoke:pilot
```

## Moodle Header Check

If `MOODLE_ORIGIN` is configured, the smoke test checks that `/embed` includes a
`Content-Security-Policy` header containing that Moodle origin.

Example:

```bash
MOODLE_ORIGIN=https://moodle.costaatt.edu.tt npm run smoke:pilot
```

Remember: rebuild and redeploy after changing `MOODLE_ORIGIN`, because the
Next.js header configuration is applied at build time.

## Results

The script reports:

- `PASS`: the check completed successfully
- `WARN`: the check was skipped or needs human review
- `FAIL`: the check failed and should be fixed before a Moodle pilot

The script exits with a non-zero status if any check fails.
