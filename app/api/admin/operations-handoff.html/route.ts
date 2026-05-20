import { requireAdminAccess } from "@/lib/adminAuth";
import { renderOperationsHandoffHtml } from "@/lib/institutionalLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderOperationsHandoffHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-operations-handoff.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
