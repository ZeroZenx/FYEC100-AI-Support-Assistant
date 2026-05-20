import { requireAdminAccess } from "@/lib/adminAuth";
import { renderStudentExperienceHtml } from "@/lib/productionLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;

  return new Response(await renderStudentExperienceHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-student-experience-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
