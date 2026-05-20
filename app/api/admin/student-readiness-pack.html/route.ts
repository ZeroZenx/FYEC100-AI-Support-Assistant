import { requireAdminAccess } from "@/lib/adminAuth";
import { renderStudentReadinessHtml } from "@/lib/readinessLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderStudentReadinessHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-student-readiness-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
