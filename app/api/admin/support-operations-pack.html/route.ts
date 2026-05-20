import { requireAdminAccess } from "@/lib/adminAuth";
import { renderStudentSupportOperationsHtml } from "@/lib/outcomesOperationsLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderStudentSupportOperationsHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-support-operations-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
