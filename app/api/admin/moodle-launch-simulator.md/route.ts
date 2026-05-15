import { requireAdminAccess } from "@/lib/adminAuth";
import { renderMoodleLaunchSimulatorMarkdown } from "@/lib/moodleLaunchSimulator";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderMoodleLaunchSimulatorMarkdown(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-moodle-launch-simulator.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
