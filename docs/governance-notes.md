# Governance Notes

## Academic Integrity

The assistant is a learning support tool. It must not complete assignments for students, generate full submissions, or encourage students to submit AI-generated work as their own.

## Human Oversight

Lecturers remain the authoritative source for course content, assignment interpretation, deadlines, and grading. LMS administrators remain the support path for LMS access and technical issues.

## Data and Privacy

Phase 1 does not use a database and does not intentionally store chat history. Students should avoid entering sensitive personal information into the prototype.

Phase 2 pilot feedback capture stores limited local JSONL records for testing:
rating, optional note, mode, timestamp, and short excerpts of the relevant
question and response. It does not intentionally capture student names, IDs, or
full chat transcripts. This pilot mechanism should be replaced by an approved
enterprise logging and analytics approach before production use.

The Phase 2 admin page includes a pilot review workflow that automatically
categorizes feedback into lecturer follow-up, LMS administrator, knowledge base
update, technical/provider issue, or no immediate escalation. This categorization
is a review aid only. Human reviewers remain responsible for deciding whether an
item should be escalated.

See `docs/pilot-review-workflow.md` for the recommended pilot review rhythm,
ownership categories, and privacy boundary.

Pilot reporting is available as JSON and Markdown for project-team review
meetings. These reports should be treated as pilot governance artifacts, not
official student records. See `docs/pilot-reporting.md`.

## Knowledge Base Management

The Phase 1 knowledge base is stored in `data/fyec100-knowledge-base.md`. An admin-friendly process should be created in later phases to review, approve, and version course content updates.

## Future Governance Questions

- Who approves knowledge base changes?
- Who reviews pilot feedback after each Moodle pilot session?
- Where should escalated pilot issues live after the prototype stage?
- What AI usage statement should appear in FYEC100 assignment instructions?
- What student data may be processed in enterprise deployment?
- What monitoring and incident response process is required?
- How will accessibility, privacy, and cybersecurity reviews be completed?
