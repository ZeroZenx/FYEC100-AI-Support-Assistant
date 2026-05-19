import { requireAdminAccess } from "@/lib/adminAuth";
import {
  buildPilotEvidenceDashboard,
  renderPilotEvidenceHtml
} from "@/lib/pilotEvidence";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  const dashboard = await buildPilotEvidenceDashboard();

  return new Response(renderPilotEvidenceHtml(dashboard), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-pilot-evidence.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
