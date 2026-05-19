import { requireAdminAccess } from "@/lib/adminAuth";
import { renderMoodleSecurityHardeningHtml } from "@/lib/moodleSecurityHardening";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(renderMoodleSecurityHardeningHtml(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-moodle-security-hardening.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
