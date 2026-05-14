<?php
// This file is part of the FYEC100 AI Support Assistant Moodle block scaffold.

defined('MOODLE_INTERNAL') || die();

class block_fyec100assistant extends block_base {
    public function init() {
        $this->title = get_string('pluginname', 'block_fyec100assistant');
    }

    public function applicable_formats() {
        return [
            'course-view' => true,
            'site-index' => false,
            'my' => false,
        ];
    }

    public function has_config() {
        return true;
    }

    public function get_content() {
        global $COURSE, $USER;

        if ($this->content !== null) {
            return $this->content;
        }

        $this->content = new stdClass();

        $assistanturl = trim((string) get_config('block_fyec100assistant', 'assistanturl'));
        $frameheight = (int) get_config('block_fyec100assistant', 'frameheight') ?: 760;

        if ($assistanturl === '') {
            $this->content->text = html_writer::div(
                get_string('missingconfig', 'block_fyec100assistant'),
                'fyec100assistant-warning'
            );
            $this->content->footer = '';

            return $this->content;
        }

        $launchurl = new moodle_url($assistanturl, [
            'courseId' => $COURSE->id,
            'courseShortName' => $COURSE->shortname,
            'launchSource' => 'moodle-block',
            'role' => $this->get_launch_role(),
        ]);

        $notice = html_writer::tag(
            'p',
            get_string('responsibleuse', 'block_fyec100assistant'),
            ['class' => 'fyec100assistant-notice']
        );

        $button = html_writer::link(
            $launchurl,
            get_string('openassistant', 'block_fyec100assistant'),
            [
                'class' => 'fyec100assistant-button',
                'target' => '_blank',
                'rel' => 'noopener',
            ]
        );

        $iframe = html_writer::tag('iframe', '', [
            'class' => 'fyec100assistant-frame',
            'height' => $frameheight,
            'loading' => 'lazy',
            'src' => $launchurl->out(false),
            'title' => get_string('iframetitle', 'block_fyec100assistant'),
            'width' => '100%',
        ]);

        $this->content->text = html_writer::div(
            $notice . $button . $iframe,
            'fyec100assistant-container'
        );
        $this->content->footer = get_string('footer', 'block_fyec100assistant');

        return $this->content;
    }

    private function get_launch_role() {
        $context = context_course::instance($this->page->course->id);

        if (has_capability('moodle/site:config', context_system::instance())) {
            return 'lms-admin';
        }

        if (has_capability('moodle/course:update', $context)) {
            return 'lecturer';
        }

        return 'student';
    }
}
