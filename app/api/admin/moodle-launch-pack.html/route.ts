import { requireAdminAccess } from "@/lib/adminAuth";
import { renderMoodleLaunchPackHtml } from "@/lib/phaseImplementationPacks";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderMoodleLaunchPackHtml(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-moodle-launch-pack.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
