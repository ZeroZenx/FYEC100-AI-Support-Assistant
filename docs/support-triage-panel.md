# Student Support Triage Panel

## Purpose

The Student Support Triage Panel helps the project team review FYEC100 pilot
feedback and route student support issues to the right owner.

It is a Phase 2 pilot scaffold. It is not a case management system, ticketing
system, student record, or replacement for official COSTAATT support channels.

## Admin Endpoints

```text
/api/admin/support-triage
/api/admin/support-triage.md
```

## Triage Categories

The panel uses existing privacy-light feedback classifications:

- lecturer follow-up
- LMS administrator
- knowledge base update
- technical/provider issue
- academic integrity

Each queue item includes:

- category
- owner
- priority
- short question excerpt
- escalation reason
- recommended action

## Intended Workflow

1. Review the support triage drawer in `/admin`.
2. Check high-priority items before each pilot session.
3. Route items to the named owner.
4. Use `/api/admin/support-triage.md` for meeting notes.
5. Keep student identity and sensitive record details out of feedback notes.
6. Export needed triage notes before using the pilot data cleanup tool.

## Privacy Boundary

Use short excerpts only. Do not place names, IDs, grades, medical details,
disciplinary details, or other sensitive student record information in pilot
feedback.
