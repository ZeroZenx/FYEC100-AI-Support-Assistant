import { requireAdminAccess } from "@/lib/adminAuth";
import { renderScalingGovernanceHtml } from "@/lib/institutionalLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderScalingGovernanceHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-scaling-governance-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
