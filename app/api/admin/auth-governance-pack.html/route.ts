import { requireAdminAccess } from "@/lib/adminAuth";
import { renderAuthGovernanceHtml } from "@/lib/connectionAuthStorageEvaluationLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderAuthGovernanceHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-auth-governance-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
