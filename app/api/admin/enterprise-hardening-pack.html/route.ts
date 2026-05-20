import { requireAdminAccess } from "@/lib/adminAuth";
import { renderEnterpriseHardeningHtml } from "@/lib/outcomesOperationsLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderEnterpriseHardeningHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-enterprise-hardening-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
