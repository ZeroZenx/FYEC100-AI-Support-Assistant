import { requireAdminAccess } from "@/lib/adminAuth";
import { renderEvaluationEvidenceHtml } from "@/lib/connectionAuthStorageEvaluationLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderEvaluationEvidenceHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-evaluation-evidence-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
