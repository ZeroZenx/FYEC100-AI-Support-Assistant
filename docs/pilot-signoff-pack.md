# Pilot Sign-off Pack

## Purpose

The pilot sign-off pack is a lightweight Phase 2 governance artifact for
recording project-team approval before expanding the FYEC100 Moodle pilot.

It is intentionally file-based for the prototype. It is not an electronic
signature system, production workflow engine, or student record.

## Sign-off Source

```text
data/pilot-signoff.json
```

Update the file manually after project-team review meetings. Keep only pilot
approval status, owner notes, and decision notes in this file.

Do not store student names, student IDs, grades, email addresses, or other
student record information.

## Admin View

The `/admin` dashboard includes a "Pilot Sign-off" section with:

- approval owner list
- approved, pending, and changes-requested counts
- decision status
- decision notes
- JSON and Markdown export endpoints

## Protected Endpoints

```text
http://localhost:4100/api/admin/pilot-signoff
http://localhost:4100/api/admin/pilot-signoff.md
```

If `ADMIN_ACCESS_TOKEN` is configured, pass it with `?adminToken=...` in the
browser or the `x-admin-token` header for API calls.

## Approval Owners

- Kevin Ramsoobhag: Project Sponsor
- Darren Headley: Project Lead and Technical Lead
- Deborah Romero: Application Development
- Kester David: Moodle Pilot Setup
- Kevin Reece: Infrastructure Support

## Decision Rule

The sign-off pack is ready only when:

- pilot evidence is ready for controlled pilot decision
- all approval owners are marked `approved`
- no approval owner has `changes-requested`
- the decision status is `approved-for-controlled-pilot`
