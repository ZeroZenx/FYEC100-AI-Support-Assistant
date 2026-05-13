# Pilot Session Planning

Phase 2 includes a simple file-based pilot planner for controlled FYEC100 Moodle testing.

## Source File

Pilot sessions are listed in:

```text
data/pilot-sessions.json
```

Each session includes title, date, audience, mode, facilitator, status, goals, success criteria, pre-checks, and post-checks.

## Admin View

The `/admin` page displays planned sessions, readiness tasks, success criteria, and post-session review steps.

The protected JSON endpoint is:

```text
/api/admin/pilot-sessions
```

This is not a production scheduling system. It is a GitHub-friendly operational scaffold for controlled pilot planning.
