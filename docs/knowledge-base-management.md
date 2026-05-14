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

## Review Record

Phase 2 uses this file as the review source of truth:

```text
data/knowledge-base-review.json
```

The review record includes:

- approval status
- content owner
- reviewer name
- reviewer role
- last reviewed date
- version label
- revision
- reviewer notes

Protected endpoints:

```text
/api/admin/knowledge-base/review
/api/admin/knowledge-base/review.md
```

The Markdown export can be used in project-team or governance meetings.

## Legacy Review Flag

Use this environment variable to mark the knowledge base as reviewed:

```bash
KNOWLEDGE_BASE_REVIEWED=true
```

The richer review record is preferred for Phase 2. Leave the environment flag
as `false` unless the hosted pilot process explicitly approves its use.

## Suggested Review Workflow

1. Developer updates `data/fyec100-knowledge-base.md`.
2. Lecturer or content owner reviews the updated Markdown.
3. Update `data/knowledge-base-review.json` with reviewer, date, status, and notes.
4. Set `approvalStatus` to `approved-for-pilot` only after content-owner approval.
5. Project lead confirms the content is suitable for the controlled pilot.
6. Run `/api/admin/deployment-readiness`.
7. Export `/api/admin/knowledge-base/review.md` for the review record.
8. Run `npm run smoke:pilot` against the hosted pilot URL.

## Content Rules

- Keep content specific to FYEC100.
- Do not add unofficial grading promises.
- Do not add unsupported policy details.
- Keep LMS support guidance general unless approved by the LMS administrator.
- Add escalation guidance where students should contact the lecturer, LMS administrator, or IT.
- Keep academic integrity reminders clear and student-friendly.

## Production Gap

This is a file-based governance scaffold. It does not provide web editing,
role-based publishing, electronic signatures, or a production audit log. In
production, COSTAATT should decide whether content management belongs in Moodle,
SharePoint, GitHub pull requests, or a governed admin console.
