import { requireAdminAccess } from "@/lib/adminAuth";
import { renderProviderGovernanceHtml } from "@/lib/institutionalLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderProviderGovernanceHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-provider-governance-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
