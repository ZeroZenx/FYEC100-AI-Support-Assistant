# Knowledge Base Release Notes

## Purpose

Knowledge base release notes record which FYEC100 knowledge base version is used
for a pilot stage, what changed, who reviewed it, who approved it, and what
limitations remain.

This creates a simple audit trail between change requests, lecturer/content
owner review, and the live Markdown knowledge base.

## Source File

```text
data/kb-release-notes.json
```

Use this file to track:

- release ID
- version label
- release status
- pilot stage
- knowledge base path
- release date
- reviewer
- approver
- related change request IDs
- changes
- known limitations
- notes

## Admin View

Open:

```text
http://localhost:4100/admin
```

The "Knowledge Base Releases" section shows the latest snapshot, changes,
known limitations, related review status, and export links.

## Protected Endpoints

```text
http://localhost:4100/api/admin/knowledge-base/releases
http://localhost:4100/api/admin/knowledge-base/releases.md
```

If `ADMIN_ACCESS_TOKEN` is configured, pass it with `?adminToken=...` in the
browser or the `x-admin-token` header for API calls.

## Governance Rule

Only approved knowledge base changes should be included in a released version.
Do not store student names, grades, IDs, email addresses, or private student
information in release notes.
