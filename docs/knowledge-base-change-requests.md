# Knowledge Base Change Requests

## Purpose

The knowledge base change request workflow gives COSTAATT a lightweight Phase 2
process for proposing, reviewing, approving, and implementing FYEC100 knowledge
base updates.

It keeps pilot feedback and content governance separate from the live Markdown
knowledge base.

## Source File

```text
data/kb-change-requests.json
```

Use this file to track:

- request ID and title
- requester
- owner
- priority
- review status
- source
- affected knowledge base section
- rationale
- recommended change
- reviewer and decision date

## Admin View

Open:

```text
http://localhost:4100/admin
```

The "Knowledge Base Change Requests" section shows pending requests, priority,
owner, rationale, recommended change, and export links.

## Protected Endpoints

```text
http://localhost:4100/api/admin/knowledge-base/change-requests
http://localhost:4100/api/admin/knowledge-base/change-requests.md
```

If `ADMIN_ACCESS_TOKEN` is configured, pass it with `?adminToken=...` in the
browser or the `x-admin-token` header for API calls.

## Governance Rule

Only approved requests should be copied into
`data/fyec100-knowledge-base.md`. Do not add student names, grades, IDs, email
addresses, or private student information to change requests.
