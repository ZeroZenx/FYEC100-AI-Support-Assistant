import { requireAdminAccess } from "@/lib/adminAuth";
import { renderMoodleSecurityHardeningMarkdown } from "@/lib/moodleSecurityHardening";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(renderMoodleSecurityHardeningMarkdown(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-moodle-security-hardening.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
