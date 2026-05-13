# Accessibility and Usability Checklist

## Purpose

Use this checklist before and during the FYEC100 controlled Moodle pilot. It
focuses on the student-facing assistant experience, especially inside Moodle
iframes, drawers, or panels.

## Keyboard Checks

- Tab reaches the responsible-use dismiss button.
- Tab reaches the chat input.
- Enter sends a question from the chat input.
- Shift+Enter creates a new line in the chat input.
- Tab reaches starter prompt buttons.
- Tab reaches feedback buttons after an assistant response.
- Focus is clearly visible on links, buttons, text areas, and feedback controls.
- Disabled buttons are visually distinct.

## Screen Reader Checks

- The chat area is announced as FYEC100 chat messages.
- Loading state is announced when the assistant is responding.
- Errors are announced as alerts.
- Feedback saved state is announced after feedback submission.
- Feedback buttons have clear names, such as helpful, not helpful, and lecturer follow-up.
- The responsible-use notice is understandable without visual context.

## Moodle Iframe Checks

- `/embed` loads without requiring students to leave Moodle.
- COSTAATT branding is visible but not oversized.
- The chat input remains visible and usable on laptop screens.
- The embedded view works in a narrow Moodle block or drawer.
- The responsible-use notice does not cover the input.
- Student can dismiss the responsible-use notice with keyboard only.

## Student Usability Checks

- A first-year student can identify what the assistant can and cannot do.
- Starter prompts are understandable.
- Academic integrity guidance is visible before assignment-related use.
- Error messages explain the issue without blaming the student.
- The assistant does not claim to grade or write assignments.
- The fallback response directs students to the lecturer, course outline, LMS, or LMS administrator.

## Known Phase 2 Limitations

- This is not a full WCAG audit.
- The admin page is a pilot tool, not a polished production console.
- The assistant does not yet use Moodle SSO, LTI role validation, or production analytics.
- Manual testing should be repeated after the app is hosted and embedded in Moodle.
