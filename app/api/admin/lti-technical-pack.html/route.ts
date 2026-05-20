import { requireAdminAccess } from "@/lib/adminAuth";
import { renderLtiTechnicalPackHtml } from "@/lib/readinessLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderLtiTechnicalPackHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-lti-technical-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
