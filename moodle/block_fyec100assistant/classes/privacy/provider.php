<?php
// This file is part of the FYEC100 AI Support Assistant Moodle block scaffold.

namespace block_fyec100assistant\privacy;

defined('MOODLE_INTERNAL') || die();

class provider implements \core_privacy\local\metadata\null_provider {
    public static function get_reason(): string {
        return 'privacy:metadata';
    }
}
