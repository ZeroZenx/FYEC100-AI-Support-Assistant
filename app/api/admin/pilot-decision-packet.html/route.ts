import { requireAdminAccess } from "@/lib/adminAuth";
import { renderPilotDecisionPacketHtml } from "@/lib/pilotDecisionPacket";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);

  if (denied) {
    return denied;
  }

  return new Response(await renderPilotDecisionPacketHtml(), {
    headers: {
      "Content-Disposition":
        "inline; filename=\"fyec100-pilot-decision-packet.html\"",
      "Content-Type": "text/html; charset=utf-8"
    }
  });
}
