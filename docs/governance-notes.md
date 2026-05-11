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

## Knowledge Base Management

The Phase 1 knowledge base is stored in `data/fyec100-knowledge-base.md`. An admin-friendly process should be created in later phases to review, approve, and version course content updates.

## Future Governance Questions

- Who approves knowledge base changes?
- What AI usage statement should appear in FYEC100 assignment instructions?
- What student data may be processed in enterprise deployment?
- What monitoring and incident response process is required?
- How will accessibility, privacy, and cybersecurity reviews be completed?
