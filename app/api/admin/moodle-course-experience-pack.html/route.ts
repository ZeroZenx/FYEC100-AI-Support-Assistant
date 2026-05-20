import { requireAdminAccess } from "@/lib/adminAuth";
import { renderMoodleCourseExperienceHtml } from "@/lib/institutionalLayers";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return new Response(await renderMoodleCourseExperienceHtml(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-moodle-course-experience-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
