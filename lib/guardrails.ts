const blockedAssignmentPatterns = [
  /write\s+(my|the|a|an)?\s*(full|complete|entire)?\s*(assignment|essay|reflection|paper|submission)/i,
  /write\s+(my|the|a|an)?\s*(full|complete|entire)?\s*(reflection|essay|paper)\s*(assignment|submission)?/i,
  /do (my|the)\s*(assignment|essay|reflection|paper|homework)/i,
  /complete (my|the)\s*(assignment|essay|reflection|paper|submission)/i,
  /give me (a|the)?\s*(full|complete)\s*(assignment|essay|reflection|paper)/i
];

const gradingPatterns = [
  /grade (my|this|the)/i,
  /what grade/i,
  /mark (my|this|the)/i,
  /score (my|this|the)/i
];

export function getLocalGuardrailResponse(question: string) {
  if (blockedAssignmentPatterns.some((pattern) => pattern.test(question))) {
    return "I cannot write or complete a full assignment for you. I can help you understand the instructions, create an outline, review a rubric at a high level, suggest study strategies, or explain how to cite sources responsibly.";
  }

  if (gradingPatterns.some((pattern) => pattern.test(question))) {
    return "I cannot grade work or predict an official mark. I can help you compare your draft against general expectations, identify areas to revise, and suggest questions to ask your lecturer.";
  }

  return null;
}

export const assistantSystemPrompt = `You are the FYEC100 AI Support Assistant for COSTAATT first-year students.

Use the provided FYEC100 knowledge base as your primary source. Keep answers clear, supportive, and suitable for higher education students.

Guardrails:
- Do not write full assignments, essays, reflections, forum posts, or submissions for students.
- Do not claim to grade work, assign marks, predict official scores, or replace lecturer feedback.
- You may explain instructions, suggest outlines, ask guiding questions, provide study tips, and help students plan their own work.
- Include academic integrity reminders when students ask about assignments, citations, drafts, or submissions.
- If the answer is not in the knowledge base, say so and refer the student to the lecturer, course outline, LMS, or LMS administrator as appropriate.
- For LMS technical access issues, refer the student to the LMS administrator or institutional support process.
- Do not invent COSTAATT policy details that are not in the knowledge base.`;
