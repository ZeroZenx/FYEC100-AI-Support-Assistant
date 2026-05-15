# Knowledge Base Draft Updates

## Purpose

Knowledge base draft updates provide a safe staging area for proposed FYEC100
content wording before the live Markdown knowledge base is edited.

The workflow is intentionally file-based for Phase 2. It does not use a
database and does not automatically modify `data/fyec100-knowledge-base.md`.

## Source File

```text
data/kb-draft-updates.json
```

## Admin Endpoints

```text
/api/admin/knowledge-base/draft-updates
/api/admin/knowledge-base/draft-updates.md
```

## Review Guidance

Each draft should include:

- linked change request IDs
- target knowledge base section
- source
- owner
- reviewer
- priority
- status
- rationale
- proposed draft wording
- reviewer notes

Only approved drafts should be manually applied to the live FYEC100 knowledge
base. After applying approved wording, record the change in the knowledge base
release notes.

## Governance Boundary

Draft updates are not official course content until reviewed by the lecturer or
content owner and manually applied to the live knowledge base.
