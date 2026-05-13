import { NextResponse } from "next/server";
import { buildPilotReport } from "@/lib/pilotReport";

export async function GET() {
  const report = await buildPilotReport();

  return NextResponse.json(report);
}
