# FYEC100 Role-Aware Assistant Behavior

Phase 2 includes role-aware pilot behavior for the embedded Moodle assistant.
The role comes from launch context passed into `/embed`, such as:

```text
/embed?courseId=FYEC100&courseShortName=FYEC100&role=student&launchSource=iframe
```

## Supported Pilot Roles

- `student`: learning support, assignment clarification, study planning, Moodle navigation, and academic integrity reminders
- `lecturer`: pilot testing support, content review, escalation planning, and student-facing guidance review
- `lms-admin`: Moodle placement checks, iframe or block troubleshooting, fallback links, and LMS navigation support
- `unknown`: conservative general pilot support when the role is missing or not recognized

## What Changes

- Embedded assistant introduction
- Role/context badge
- Responsible-use notice
- Starter prompt suggestions
- Role-aware focus notes in the embedded UI
- System prompt instructions sent to the selected AI provider

## Guardrails

Role-aware behavior does not weaken academic integrity rules. The assistant must
still refuse to write full assignments, claim official grading authority, expose
private student information, or invent COSTAATT policy details.

## Trust Boundary

This is pilot context only. Query-string roles are not authenticated Moodle
identity. Production should use Moodle-side validation or LTI 1.3 launch
validation before trusting role, course, or user context.

## Verification

Use the Moodle launch simulator to open student, lecturer, LMS administrator,
and future LTI preview links. Confirm the assistant shows the expected role
badge, starter prompts, and responsible-use guidance.
