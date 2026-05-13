# Moodle Iframe Security

## Purpose

This note explains how the FYEC100 AI Support Assistant can be safely embedded
inside Moodle during a controlled Phase 2 pilot.

## Moodle Origin

Set the approved Moodle origin in hosted environment settings:

```bash
MOODLE_ORIGIN=https://moodle.costaatt.edu.tt
```

Use only the origin, not a full course URL. Do not include a trailing path such
as `/course/view.php`.

## Frame Ancestors Header

When `MOODLE_ORIGIN` is configured, `next.config.mjs` adds a
`Content-Security-Policy` header for the embedded assistant and API routes:

```text
Content-Security-Policy: frame-ancestors 'self' https://moodle.costaatt.edu.tt;
```

This allows the assistant to be framed by the approved Moodle site while
reducing accidental framing by unrelated sites.

## Moodle HTML Block Example

Replace the URL with the hosted assistant URL:

```html
<div style="width:100%; min-height:760px;">
  <iframe
    src="https://fyec100-assistant.example.edu/embed?courseId=FYEC100&courseShortName=FYEC100&launchSource=iframe&role=student"
    width="100%"
    height="760"
    style="border:0; width:100%; min-height:760px;"
    title="FYEC100 AI Academic Support Assistant"
  ></iframe>
</div>
```

## IT Review Notes

- Use HTTPS for Moodle and the assistant.
- Confirm Moodle permits iframe content from the assistant domain.
- Configure `MOODLE_ORIGIN` before hosted pilot testing.
- Rebuild and redeploy the app after changing `MOODLE_ORIGIN`; Next.js applies these headers at build time.
- Keep `/admin` and `/api/admin/*` protected by token or platform controls.
- Treat query-string launch context as pilot-only, not trusted identity.

## Production Gap

For production, COSTAATT should decide whether the final integration should use
a Moodle block plugin or LTI 1.3. The iframe approach is useful for pilot
testing, but production should use stronger launch validation and role/context
trust.
