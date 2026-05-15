import { requireAdminAccess } from "@/lib/adminAuth";
import { renderPilotOperationsRunbookMarkdown } from "@/lib/pilotOperationsRunbook";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return new Response(await renderPilotOperationsRunbookMarkdown(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-pilot-operations-runbook.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
