import { requireAdminAccess } from "@/lib/adminAuth";
import { renderPilotSignoffMarkdown } from "@/lib/pilotSignoff";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  return new Response(await renderPilotSignoffMarkdown(), {
    headers: {
      "Content-Disposition": "inline; filename=\"fyec100-pilot-signoff.md\"",
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
