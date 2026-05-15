# Pilot Review Workflow

## Purpose

The pilot review workflow helps the project team review student feedback during
a controlled FYEC100 Moodle pilot. It is designed for early oversight,
triage, and knowledge base improvement. It is not a production ticketing system,
student record system, or official grading workflow.

## Review Location

Use the Phase 2 admin page:

```text
http://localhost:4100/admin
```

The pilot review section shows:

- Total feedback received
- Helpful, not helpful, LMS/navigation issue, missing course information, academic integrity concern, technical issue, and lecturer follow-up counts
- Escalation category counts
- Recommended owner counts
- Automatically categorized review queue
- Latest feedback excerpts
- Suggested owner for each item
- Suggested reason for escalation

For meeting-ready summaries, use the pilot reporting endpoints documented in
`docs/pilot-reporting.md`.

## Escalation Categories

### Lecturer Follow-Up

Use when feedback involves assignment interpretation, course expectations,
official academic guidance, or unclear FYEC100 guidance.

Suggested owner: Lecturer / Project Lead

### LMS Administrator

Use when feedback mentions Moodle, course shell navigation, login, access,
uploads, missing files, or other LMS support concerns.

Suggested owner: LMS Administrator

### Knowledge Base Update

Use when the assistant answer appears incomplete, outdated, incorrect, or not
covered by the current FYEC100 knowledge base.

Suggested owner: Developer / Lecturer reviewer

### Technical Provider Issue

Use when feedback points to errors, timeouts, model/provider problems, Ollama,
OpenAI, or server reliability.

Suggested owner: Technical Lead / System Administrator

### Academic Integrity

Use when feedback suggests students are unsure about acceptable AI use,
assignment-writing boundaries, grading authority, citation expectations, or
responsible-use guidance.

Suggested owner: Lecturer / Project Sponsor

### None

Use when the feedback does not require immediate escalation.

Suggested owner: Pilot review team

## Recommended Review Rhythm

During a controlled pilot:

- Review feedback after each pilot session.
- Check lecturer follow-up items first.
- Check LMS access or Moodle navigation issues before the next student session.
- Convert repeated missing-answer reports into knowledge base update requests.
- Route academic integrity concerns to the lecturer and project sponsor.
- Log technical/provider issues for IT review.
- Summarize findings for the project sponsor before expanding the pilot group.

## Privacy Boundary

The current pilot feedback file stores only short excerpts. Students should not
enter sensitive personal information. If sensitive data appears in a note or
question excerpt, the project team should remove it from local pilot records and
document the handling decision outside this prototype.

## Production Gap

Before production deployment, COSTAATT should decide whether this workflow moves
to:

- Moodle reporting
- An approved ticketing system
- A governed analytics store
- A custom admin console with authentication and role controls

The current local JSONL workflow is useful for pilot learning, but it should not
be treated as the enterprise operating model.
