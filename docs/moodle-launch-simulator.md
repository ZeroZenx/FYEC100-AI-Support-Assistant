# FYEC100 Moodle Pilot Launch Simulator

The Moodle Pilot Launch Simulator is a Phase 2 admin tool for rehearsing how the
assistant should behave when it is opened from Moodle.

It is intentionally lightweight and local. It generates preview links for the
existing `/embed` route with pilot launch context values such as course ID,
course short name, Moodle role, and launch source.

## What It Simulates

- Student iframe launch from a FYEC100 course page
- Lecturer review launch from a hidden pilot review page
- LMS administrator launch from a Moodle block placement
- Future LTI launch rehearsal

## Admin Endpoints

```text
/api/admin/moodle-launch-simulator
/api/admin/moodle-launch-simulator.md
```

Use `x-admin-token` or `?adminToken=...` when `ADMIN_ACCESS_TOKEN` is configured.

## Trust Boundary

The simulator does not authenticate Moodle users. It uses URL query parameters
only so the project team can rehearse the embedded experience before real Moodle
integration.

Production role, course, and user trust should come from an approved Moodle
block validation path or LTI 1.3 launch validation.

## Pilot Use

1. Open the admin dashboard.
2. Review the Moodle Launch Simulator section.
3. Copy a preview URL or iframe snippet.
4. Test the embedded assistant locally.
5. Confirm the expected role-specific support behavior.
6. Record any issues in the admin action register or knowledge base workflow.

## Known Limitations

- The simulator is not SSO.
- The simulator is not LTI validation.
- The simulator does not read Moodle enrolments.
- The simulator should not be used as proof of production authentication.
