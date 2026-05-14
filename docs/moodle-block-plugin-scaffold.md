# Moodle Block Plugin Scaffold

Phase 2 now includes a starter Moodle block plugin for the FYEC100 AI Support Assistant.

## Location

```text
moodle/block_fyec100assistant
```

## Moodle Install Path

Copy the folder into a Moodle test environment as:

```text
blocks/fyec100assistant
```

Then visit Moodle site administration notifications to complete plugin installation.

## Included Files

- `version.php`
- `block_fyec100assistant.php`
- `classes/privacy/provider.php`
- `settings.php`
- `db/access.php`
- `lang/en/block_fyec100assistant.php`
- `styles.css`
- `README.md`

## What The Block Does

- Adds a course-level FYEC100 AI Support Assistant block
- Displays responsible-use guidance
- Embeds the configured assistant `/embed` URL
- Opens the assistant in a new tab as a fallback
- Passes pilot launch context:
  - `courseId`
  - `courseShortName`
  - `launchSource=moodle-block`
  - `role`

## Moodle Configuration

After installation, configure:

```text
Site administration > Plugins > Blocks > FYEC100 AI Support Assistant
```

Set:

```text
Assistant embed URL = https://fyec100-assistant.example.edu/embed
Iframe height = 760
```

## Admin Status Endpoint

The Next.js app exposes plugin scaffold metadata at:

```text
/api/admin/moodle-block
```

The `/admin` dashboard also shows the plugin files, Moodle install path, and trust-boundary notice.

## Trust Boundary

This scaffold does not implement LTI 1.3 authentication. It passes pilot context only. Do not treat course ID, role, or user context from this block as verified identity until Moodle-side validation or LTI launch validation is implemented and approved.

## Review Before Moodle Testing

- Confirm Moodle version compatibility.
- Install only in a Moodle test environment first.
- Confirm iframe policy allows the assistant host.
- Confirm `MOODLE_ORIGIN` is configured in the assistant app.
- Confirm the responsible-use notice is acceptable.
- Confirm the block can be removed quickly if a pilot needs to stop.
