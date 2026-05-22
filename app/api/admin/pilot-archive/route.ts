import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { buildPilotArchive, readArchiveHistory } from "@/lib/pilotArchive";

export async function GET(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  return NextResponse.json({ history: await readArchiveHistory() });
}

export async function POST(request: Request) {
  const denied = requireAdminAccess(request);
  if (denied) return denied;
  const body = await request.json().catch(() => ({})) as { redact?: boolean };
  return NextResponse.json(await buildPilotArchive({ redact: Boolean(body.redact) }));
}
