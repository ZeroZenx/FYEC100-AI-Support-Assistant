# Knowledge Base Management

## Purpose

The FYEC100 assistant uses a local Markdown knowledge base in Phase 2:

```text
data/fyec100-knowledge-base.md
```

This keeps the pilot simple and auditable while avoiding a database before the
enterprise integration phase.

## Admin Metadata

The admin dashboard shows:

- file path
- last updated date
- size
- word count
- character count
- line count
- Markdown section headings
- preview excerpt
- review status

The same metadata is available through the protected endpoint:

```text
/api/admin/knowledge-base
```

Use `x-admin-token` or `?adminToken=...` when `ADMIN_ACCESS_TOKEN` is configured.

## Review Flag

Use this environment variable to mark the knowledge base as reviewed:

```bash
KNOWLEDGE_BASE_REVIEWED=true
```

Leave it as `false` until the lecturer or content owner has reviewed the
current Markdown file for pilot use.

## Suggested Review Workflow

1. Developer updates `data/fyec100-knowledge-base.md`.
2. Lecturer or content owner reviews the updated Markdown.
3. Project lead confirms the content is suitable for the controlled pilot.
4. Set `KNOWLEDGE_BASE_REVIEWED=true` in the hosted environment.
5. Rebuild/restart the hosted app if required by the hosting platform.
6. Run `/api/admin/deployment-readiness`.
7. Run `npm run smoke:pilot` against the hosted pilot URL.

## Content Rules

- Keep content specific to FYEC100.
- Do not add unofficial grading promises.
- Do not add unsupported policy details.
- Keep LMS support guidance general unless approved by the LMS administrator.
- Add escalation guidance where students should contact the lecturer, LMS administrator, or IT.
- Keep academic integrity reminders clear and student-friendly.

## Production Gap

This is a read-only governance scaffold. It does not provide web editing,
version approval, role-based publishing, or audit history. In production,
COSTAATT should decide whether content management belongs in Moodle, SharePoint,
GitHub pull requests, or a governed admin console.
