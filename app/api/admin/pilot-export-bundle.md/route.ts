import { requireAdminAccess } from "@/lib/adminAuth";
import { renderPilotExportBundleMarkdown } from "@/lib/pilotExportBundle";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderPilotExportBundleMarkdown(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-pilot-export-bundle.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
