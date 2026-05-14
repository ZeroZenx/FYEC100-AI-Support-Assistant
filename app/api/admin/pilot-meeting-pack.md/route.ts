import { requireAdminAccess } from "@/lib/adminAuth";
import { renderPilotMeetingPackMarkdown } from "@/lib/pilotMeetingPack";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return new Response(await renderPilotMeetingPackMarkdown(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-pilot-meeting-pack.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
