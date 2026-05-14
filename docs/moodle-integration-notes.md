# Moodle Integration Notes

## Recommended User Experience

Students should not leave Moodle. The assistant should appear inside the FYEC100 course shell as a panel, drawer, modal, embedded page, or LTI launch.

## Current Prototype Embed Route

Use this route for early Moodle embed testing:

```text
http://localhost:4100/embed
```

For controlled pilot testing, the route can also receive course, role, and
launch-source context:

```text
http://localhost:4100/embed?courseId=FYEC100&courseShortName=FYEC100&role=student&launchSource=iframe
```

For a hosted environment, replace the hostname with the approved deployment URL.

The `/admin` page provides copy-ready iframe, Moodle HTML block, and fallback
link snippets for pilot setup, including a sample context-aware iframe.

This query-string context is not trusted authentication. It is a Phase 2 pilot
scaffold only. Production should use a Moodle block plugin or LTI 1.3 launch to
pass trusted course and role context.

The embedded assistant view is compact and Moodle-friendly. It keeps COSTAATT
branding visible while reducing standalone site chrome inside the iframe.

For hosted iframe security, configure:

```bash
MOODLE_ORIGIN=https://moodle.costaatt.edu.tt
```

See `docs/moodle-iframe-security.md`.

## Student Responsible Use Notice

The chat interface displays a short notice reminding students that the assistant:

- Supports learning but does not grade work
- Does not replace lecturer guidance
- Must not be used to write or submit full assignments
- Should not receive sensitive personal information
- May provide imperfect AI-generated guidance

## Pilot Feedback

The assistant includes lightweight pilot feedback buttons after responses:

- Helpful
- Not helpful
- Needs lecturer follow-up

Feedback is stored locally for pilot review only. Before production deployment,
COSTAATT should approve the official logging, retention, privacy notice, and
support workflow.

## Integration Options

### Option 1: Moodle Page with iframe

Fastest pilot approach. Create a Moodle Page resource or HTML block that embeds the assistant URL.

Example iframe:

```html
<iframe src="http://localhost:4100/embed" width="100%" height="760" style="border:0; width:100%; min-height:760px;" title="FYEC100 AI Academic Support Assistant"></iframe>
```

Pros:

- Fast to pilot
- No custom Moodle plugin required
- Keeps students inside Moodle

Considerations:

- Moodle security settings must allow the assistant domain
- Authentication context is limited unless additional work is added
- Best for pilot use, not final enterprise deployment

### Option 2: Custom Moodle Block

Create a Moodle block plugin that displays an "Ask FYEC100 Assistant" button and opens the assistant in a panel or modal.

The repository now includes a starter scaffold at:

```text
moodle/block_fyec100assistant
```

See `docs/moodle-block-plugin-scaffold.md`.

Pros:

- Better course-level experience
- Cleaner than a raw iframe page
- Can be managed by Moodle administrators

Considerations:

- Requires Moodle plugin development and testing
- Requires approval before production deployment
- Should pass trusted course and role context from Moodle

### Option 3: LTI 1.3 Tool

Register the assistant as an LTI tool launched from Moodle.

Pros:

- Stronger enterprise pattern
- Can receive trusted launch context
- Better future path for analytics, roles, and secure integration

Considerations:

- More setup and governance
- Requires LTI configuration and security review
- Requires launch validation before trusting user or course context

## Suggested Phase 2 Pilot

Start with the `/embed` route inside a Moodle pilot course. If the user experience is approved, move toward either a Moodle block plugin or LTI 1.3 integration.

Before using a hosted pilot URL, check `/api/health` and confirm the Moodle
domain/iframe settings with the LMS administrator.

The admin dashboard includes an integration decision matrix and the protected
`/api/admin/integration-decision` endpoint to compare iframe, Moodle block, and
LTI 1.3 paths.

See `docs/lti-integration-scaffold.md` for the current LTI placeholder fields
and trust-boundary notes.
