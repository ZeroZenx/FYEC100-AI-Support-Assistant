# Pilot Reporting

## Purpose

Pilot reporting gives the FYEC100 project team a simple way to summarize
evidence from controlled Moodle pilot sessions. Reports are intended for project
review meetings, sponsor updates, and planning improvements before the pilot is
expanded.

## Report Locations

JSON report:

```text
http://localhost:4100/api/admin/report
```

Markdown report:

```text
http://localhost:4100/api/admin/report.md
```

The `/admin` page also includes a pilot report preview with totals, escalation
counts, suggested actions, and top review items.

## What the Report Includes

- Total feedback count
- Helpful rate
- Escalation candidate count
- Feedback rating counts
- Escalation category counts
- Suggested actions and owners
- Top review items
- Knowledge base update candidates
- Technical/provider issue candidates
- Privacy notice

## Recommended Meeting Use

Before each pilot review meeting:

1. Open `/admin` and review the report preview.
2. Open `/api/admin/report.md` for a Markdown summary.
3. Check lecturer follow-up and LMS administrator items first.
4. Decide which knowledge base updates are approved.
5. Record technical/provider issues for IT review.
6. Summarize decisions outside the prototype in the approved project record.

## Privacy Boundary

The report uses short excerpts from local pilot feedback. It must not include
student IDs, official grades, full submissions, or sensitive personal details.
If sensitive information appears in a pilot note or question excerpt, remove it
from the local pilot data and document the handling decision through the
approved institutional process.

## Production Gap

This reporting feature is suitable for a controlled Phase 2 pilot. Before
production, COSTAATT should decide whether reporting belongs in Moodle, an
approved analytics platform, a ticketing system, or a secured admin console with
authentication and role controls.
