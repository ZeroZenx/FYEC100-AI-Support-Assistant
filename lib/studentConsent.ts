import { readPilotFeedbackRecords } from "@/lib/pilotFeedback";
import { readSupportCases } from "@/lib/serviceDeskCases";

export function isConsentAcknowledged(value: unknown) {
  return value === true || value === "true" || value === "acknowledged";
}

export async function buildConsentEvidenceSummary() {
  const [feedback, cases] = await Promise.all([
    readPilotFeedbackRecords(),
    readSupportCases()
  ]);

  return {
    generatedAt: new Date().toISOString(),
    privacyNote:
      "Consent evidence is counted from privacy-aware feedback and escalation records. It does not identify students.",
    summary: {
      feedbackRecords: feedback.length,
      supportCases: cases.length,
      studentIdentityTracked: false
    }
  };
}
