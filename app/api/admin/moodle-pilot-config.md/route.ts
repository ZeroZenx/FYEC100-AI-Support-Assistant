import { requireAdminAccess } from "@/lib/adminAuth";
import { renderMoodlePilotConfigMarkdown } from "@/lib/moodlePilotConfig";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return new Response(await renderMoodlePilotConfigMarkdown(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-moodle-pilot-config.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
