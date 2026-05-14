import { requireAdminAccess } from "@/lib/adminAuth";
import {
  buildPilotEvidenceDashboard,
  renderPilotEvidenceMarkdown
} from "@/lib/pilotEvidence";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const dashboard = await buildPilotEvidenceDashboard();

  return new Response(renderPilotEvidenceMarkdown(dashboard), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-pilot-evidence.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
