import { NextResponse } from "next/server";
import { getEnterpriseStatus } from "@/lib/enterpriseStatus";

export async function GET() {
  const status = await getEnterpriseStatus();

  return NextResponse.json(status);
}
