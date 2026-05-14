<?php
// This file is part of the FYEC100 AI Support Assistant Moodle block scaffold.

defined('MOODLE_INTERNAL') || die();

if ($ADMIN->fulltree) {
    $settings->add(new admin_setting_configtext(
        'block_fyec100assistant/assistanturl',
        get_string('assistanturl', 'block_fyec100assistant'),
        get_string('assistanturl_desc', 'block_fyec100assistant'),
        'https://fyec100-assistant.example.edu/embed',
        PARAM_URL
    ));

    $settings->add(new admin_setting_configtext(
        'block_fyec100assistant/frameheight',
        get_string('frameheight', 'block_fyec100assistant'),
        get_string('frameheight_desc', 'block_fyec100assistant'),
        760,
        PARAM_INT
    ));
}
