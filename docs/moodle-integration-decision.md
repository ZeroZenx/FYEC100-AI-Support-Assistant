# Moodle Integration Decision

Phase 2 uses a structured decision matrix to compare the three Moodle integration paths for the FYEC100 AI Support Assistant.

## Current Recommendation

Use the Moodle iframe pilot now, evaluate a custom Moodle block for a cleaner course-shell experience, and keep LTI 1.3 as the enterprise trust-boundary target.

## Admin Endpoint

```text
/api/admin/integration-decision
```

The same decision matrix appears in `/admin`.

## Options

### Moodle iframe pilot

Best for a fast controlled pilot in one FYEC100 Moodle course shell.

Strengths:

- Fastest to test
- Keeps students inside Moodle
- No custom Moodle plugin needed for early validation

Considerations:

- Limited trusted context unless Moodle passes extra data
- Depends on Moodle and browser iframe policy
- Not the preferred final enterprise pattern

### Custom Moodle block

Best for a cleaner Moodle course-level experience after the iframe pilot.

Strengths:

- Better course-shell fit
- Can be configured by Moodle administrators
- Natural next step after iframe UX approval

Considerations:

- Requires Moodle plugin development and testing
- Needs LMS administrator approval and maintenance path
- Still needs a trusted context design

### LTI 1.3 tool

Best for an enterprise launch with validated course and role context.

Strengths:

- Best trust boundary
- Supports stronger role and course context
- Most aligned with enterprise integration governance

Considerations:

- Requires LTI 1.3 registration, key management, and launch validation
- Needs security and privacy review
- Higher setup effort before student use

## Decision Criteria

- Students should remain inside Moodle.
- The pilot should start quickly without separate student accounts.
- Production must not trust query-string identity or role values.
- COSTAATT should preserve lecturer, LMS administrator, and IT oversight.
- The selected path should support future governance, logging, and privacy review.

## Recommended Evidence Before Final Decision

- Moodle launch audit confirms students open the assistant from the intended course context.
- Pilot feedback shows whether students understand the embedded workflow.
- Lecturer and LMS administrator confirm the escalation paths are workable.
- IT confirms hosting, iframe, authentication, and security requirements.
- Project sponsor approves whether the next step is Moodle block development or LTI 1.3 planning.
