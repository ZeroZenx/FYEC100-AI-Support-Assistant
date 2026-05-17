import { requireAdminAccess } from "@/lib/adminAuth";
import { renderPilotExportBundleHtml } from "@/lib/pilotExportBundle";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderPilotExportBundleHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-pilot-export-bundle.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
