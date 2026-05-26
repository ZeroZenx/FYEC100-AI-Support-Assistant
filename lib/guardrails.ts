const blockedAssignmentPatterns = [
  /write\s+(my|the|a|an)?\s*(full|complete|entire)?\s*(assignment|essay|reflection|paper|submission)/i,
  /write\s+(my|the|a|an)?\s*(full|complete|entire)?\s*(reflection|essay|paper)\s*(assignment|submission)?/i,
  /write\s+(my|the|a|an)?\s*(module\s*\d+\s*)?(journal|e-?portfolio|portfolio|caption|artifact|artefact)/i,
  /do (my|the)\s*(assignment|essay|reflection|paper|homework)/i,
  /complete (my|the)\s*(assignment|essay|reflection|paper|submission|journal|e-?portfolio|portfolio)/i,
  /give me (a|the)?\s*(full|complete)\s*(assignment|essay|reflection|paper|journal|e-?portfolio|portfolio)/i
];

const gradingPatterns = [
  /grade (my|this|the)/i,
  /what grade/i,
  /mark (my|this|the)/i,
  /score (my|this|the)/i
];

export function getLocalGuardrailResponse(question: string) {
  if (blockedAssignmentPatterns.some((pattern) => pattern.test(question))) {
    return "I cannot write or complete a full assignment, journal, reflection, e-portfolio caption, or submission for you. I can help you understand the instructions, create your own outline, review a rubric at a high level, suggest study strategies, or explain how to cite sources responsibly. For assignment-specific permission or interpretation, ask your lecturer.";
  }

  if (gradingPatterns.some((pattern) => pattern.test(question))) {
    return "I cannot grade work or predict an official mark. I can help you compare your draft against general expectations, identify areas to revise, and suggest questions to ask your lecturer.";
  }

  return null;
}

import {
  getMoodleContextSystemPrompt,
  type MoodleLaunchContext
} from "@/lib/moodleContext";
import { getRoleGuidanceSystemPrompt } from "@/lib/moodleRoleGuidance";
import { buildCourseSystemPrompt, type CourseChatContext } from "@/lib/courseResolver";

const baseAssistantSystemPrompt = `You are the FYEC100 AI Support Assistant for COSTAATT first-year students.

Use the provided FYEC100 knowledge base as your primary source. Keep answers clear, supportive, and suitable for higher education students.

Response style:
- Write for first-year students in a clean, human-readable way.
- Prefer one short opening sentence followed by 3-6 concise bullets when a list helps.
- Avoid raw Markdown-heavy formatting, especially "###" headings and long walls of bold text.
- Use short labels such as "Assessment", "What to do next", or "Academic integrity reminder" instead of large Markdown headings.
- Keep responses brief unless the student explicitly asks for a detailed explanation.

Guardrails:
- Do not write full assignments, essays, reflections, forum posts, or submissions for students.
- Do not claim to grade work, assign marks, predict official scores, or replace lecturer feedback.
- You may explain instructions, suggest outlines, ask guiding questions, provide study tips, and help students plan their own work.
- Include academic integrity reminders when students ask about assignments, citations, drafts, or submissions.
- If the answer is not in the knowledge base, say so and refer the student to the lecturer, course outline, LMS, or LMS administrator as appropriate.
- For LMS technical access issues, refer the student to the LMS administrator or institutional support process.
- Do not invent COSTAATT policy details that are not in the knowledge base.
- When you answer from the knowledge base, include one brief source label at the end, such as "Source: FYEC100 Course Outline - Assessment" or "Source: COSTAATT AI Statement - AI Use Levels."
- If the student asks about current deadlines, live sessions, or Zoom links, explain that historical dates in the knowledge base are not current unless confirmed, and direct the student to Moodle/eClassroom or the lecturer.`;

export function buildAssistantSystemPrompt(
  context?: MoodleLaunchContext,
  course?: CourseChatContext
) {
  const sections = [baseAssistantSystemPrompt];

  if (course) {
    sections.push(buildCourseSystemPrompt(course));
  }

  if (context) {
    sections.push(`${getMoodleContextSystemPrompt(context)}

${getRoleGuidanceSystemPrompt(context)}`);
  }

  return sections.join("\n\n");
}
