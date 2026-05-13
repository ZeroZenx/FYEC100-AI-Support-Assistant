export type SupportPlaybookItem = {
  category: string;
  examples: string[];
  firstResponse: string;
  owner: string;
  priority: "low" | "medium" | "high";
  resolutionTarget: string;
};

const supportPlaybook: SupportPlaybookItem[] = [
  {
    category: "Lecturer follow-up",
    examples: [
      "Assignment instructions are unclear",
      "A student needs interpretation of course expectations",
      "A response may conflict with lecturer guidance"
    ],
    firstResponse:
      "Acknowledge the issue, avoid grading or rewriting the assignment, and refer the student to the lecturer for official direction.",
    owner: "Lecturer / Project Lead",
    priority: "high",
    resolutionTarget: "Before the next affected class activity"
  },
  {
    category: "LMS navigation or access",
    examples: [
      "Student cannot find the FYEC100 course shell",
      "Materials, uploads, or links are not visible",
      "Moodle iframe or embedded view is blocked"
    ],
    firstResponse:
      "Confirm the Moodle course area and route the issue to the LMS administrator with the course shell and launch context.",
    owner: "LMS Administrator",
    priority: "high",
    resolutionTarget: "Same pilot session where possible"
  },
  {
    category: "Knowledge base update",
    examples: [
      "The assistant says information is missing",
      "Course schedule or policy wording needs correction",
      "Repeated questions reveal a content gap"
    ],
    firstResponse:
      "Capture the question, proposed content update, and lecturer/content-owner review requirement before changing the knowledge base.",
    owner: "Developer / Lecturer reviewer",
    priority: "medium",
    resolutionTarget: "Before the next pilot session"
  },
  {
    category: "Technical or AI provider issue",
    examples: [
      "Assistant times out or returns provider errors",
      "Ollama or OpenAI configuration is unavailable",
      "Hosted app, HTTPS, or iframe headers fail readiness checks"
    ],
    firstResponse:
      "Run the provider test and deployment readiness checks, then escalate configuration or hosting issues to the technical lead and system administrator.",
    owner: "Technical Lead / System Administrator",
    priority: "high",
    resolutionTarget: "Before continuing pilot use"
  },
  {
    category: "Academic integrity concern",
    examples: [
      "A student asks the assistant to write a full submission",
      "A response appears too close to completed assignment work",
      "Students are unsure how to cite or use AI responsibly"
    ],
    firstResponse:
      "Reinforce that the assistant supports learning, planning, and clarification only, and route policy questions to the lecturer.",
    owner: "Lecturer / Project Sponsor",
    priority: "high",
    resolutionTarget: "Immediate student-facing clarification"
  }
];

export function getSupportPlaybook() {
  return {
    items: supportPlaybook,
    summary: {
      highPriority: supportPlaybook.filter((item) => item.priority === "high").length,
      total: supportPlaybook.length
    }
  };
}
