import { requireAdminAccess } from "@/lib/adminAuth";
import { renderMonitoringIncidentPackHtml } from "@/lib/phaseImplementationPacks";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderMonitoringIncidentPackHtml(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-monitoring-incident-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
