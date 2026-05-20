import { requireAdminAccess } from "@/lib/adminAuth";
import { renderLtiTechnicalBuildHtml } from "@/lib/productionLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;

  return new Response(await renderLtiTechnicalBuildHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-lti-technical-build.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
