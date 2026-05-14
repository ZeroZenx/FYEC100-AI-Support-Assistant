export type MoodleIntegrationOptionId = "iframe" | "moodle-block" | "lti-13";

export type MoodleIntegrationOption = {
  bestFor: string;
  considerations: string[];
  description: string;
  effort: "low" | "medium" | "high";
  id: MoodleIntegrationOptionId;
  label: string;
  phaseFit: "pilot" | "transition" | "enterprise";
  recommendation: string;
  score: number;
  strengths: string[];
};

export type MoodleIntegrationDecision = {
  decisionCriteria: string[];
  nextActions: string[];
  options: MoodleIntegrationOption[];
  recommendedOption: MoodleIntegrationOption;
  summary: string;
};

const options: MoodleIntegrationOption[] = [
  {
    bestFor: "Fast controlled pilot in one FYEC100 Moodle course shell",
    considerations: [
      "Limited trusted context unless Moodle passes extra data",
      "Depends on Moodle and browser iframe policy",
      "Not the preferred final enterprise pattern"
    ],
    description:
      "Embed the existing /embed route in a Moodle page, label, HTML block, drawer, or modal.",
    effort: "low",
    id: "iframe",
    label: "Moodle iframe pilot",
    phaseFit: "pilot",
    recommendation:
      "Use this for the immediate Phase 2 pilot while the project team validates student experience and support workflow.",
    score: 82,
    strengths: [
      "Fastest to test",
      "Keeps students inside Moodle",
      "No custom Moodle plugin needed for early validation"
    ]
  },
  {
    bestFor: "Cleaner Moodle course-level experience after the iframe pilot",
    considerations: [
      "Requires Moodle plugin development and testing",
      "Needs LMS administrator approval and maintenance path",
      "Still needs a trusted context design"
    ],
    description:
      "Create a Moodle block plugin that opens the assistant in a course panel, drawer, or modal.",
    effort: "medium",
    id: "moodle-block",
    label: "Custom Moodle block",
    phaseFit: "transition",
    recommendation:
      "Use this if COSTAATT wants a Moodle-native user experience without the full LTI implementation burden.",
    score: 74,
    strengths: [
      "Better course-shell fit",
      "Can be configured by Moodle administrators",
      "Natural next step after iframe UX approval"
    ]
  },
  {
    bestFor: "Enterprise launch with validated course and role context",
    considerations: [
      "Requires LTI 1.3 registration, key management, and launch validation",
      "Needs security and privacy review",
      "Higher setup effort before student use"
    ],
    description:
      "Register the assistant as an LTI 1.3 tool launched from Moodle with validated launch context.",
    effort: "high",
    id: "lti-13",
    label: "LTI 1.3 tool",
    phaseFit: "enterprise",
    recommendation:
      "Target this for the enterprise path if trusted launch validation, role mapping, and governance are required.",
    score: 88,
    strengths: [
      "Best trust boundary",
      "Supports stronger role and course context",
      "Most aligned with enterprise integration governance"
    ]
  }
];

const decisionCriteria = [
  "Students should remain inside Moodle.",
  "The pilot should start quickly without separate student accounts.",
  "Production must not trust query-string identity or role values.",
  "COSTAATT should preserve lecturer, LMS administrator, and IT oversight.",
  "The selected path should support future governance, logging, and privacy review."
];

const nextActions = [
  "Use iframe embedding for the next controlled Moodle pilot.",
  "Capture launch audit, feedback, and support issues from the pilot session.",
  "Review whether the user experience needs a Moodle block for a cleaner course-level panel.",
  "Start LTI 1.3 security planning if trusted roles and enterprise governance become required.",
  "Record the final Moodle integration decision before wider student rollout."
];

export function getMoodleIntegrationDecision(): MoodleIntegrationDecision {
  const recommendedOption =
    options.find((option) => option.id === "iframe") ?? options[0];

  return {
    decisionCriteria,
    nextActions,
    options,
    recommendedOption,
    summary:
      "Recommended Phase 2 path: use the Moodle iframe pilot now, evaluate Moodle block for a cleaner course-shell experience, and keep LTI 1.3 as the enterprise trust-boundary target."
  };
}
