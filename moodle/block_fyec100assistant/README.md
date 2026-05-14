# FYEC100 AI Support Assistant Moodle Block

This is a Phase 2 scaffold for a Moodle block plugin that embeds the COSTAATT FYEC100 AI Support Assistant inside a Moodle course shell.

## Plugin Name

```text
block_fyec100assistant
```

## Install Location

Copy this folder into Moodle:

```text
blocks/fyec100assistant
```

Then visit Moodle site administration notifications to complete plugin installation.

## Configuration

After installation, configure:

```text
Site administration > Plugins > Blocks > FYEC100 AI Support Assistant
```

Set the assistant embed URL:

```text
https://fyec100-assistant.example.edu/embed
```

For local pilot testing, use the local or tunnelled pilot URL approved by IT.

## What The Block Does

- Adds an FYEC100 assistant block to a Moodle course page
- Shows responsible-use guidance
- Opens or embeds the configured assistant URL
- Passes pilot context values for course ID, course short name, launch source, and role
- Declares that the block itself does not store personal data in Moodle

## Trust Boundary

This is not production LTI authentication. The context values are useful for pilot support and diagnostics only. Production deployment should use an approved Moodle block security model or LTI 1.3 launch validation before trusting user identity, role, or course context.
