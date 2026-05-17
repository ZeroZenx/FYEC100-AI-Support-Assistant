import { requireAdminAccess } from "@/lib/adminAuth";
import { renderPilotDataCleanupMarkdown } from "@/lib/pilotDataCleanup";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderPilotDataCleanupMarkdown(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-pilot-data-cleanup.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
