import { requireAdminAccess } from "@/lib/adminAuth";
import { renderMoodleTestEvidenceHtml } from "@/lib/connectionAuthStorageEvaluationLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderMoodleTestEvidenceHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-moodle-test-evidence-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
