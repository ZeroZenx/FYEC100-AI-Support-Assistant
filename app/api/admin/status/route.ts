import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/adminAuth";
import { getEnterpriseStatus } from "@/lib/enterpriseStatus";

export async function GET(request: Request) {
  const unauthorized = requireAdminAccess(request);

  if (unauthorized) {
    return unauthorized;
  }

  const status = await getEnterpriseStatus();

  return NextResponse.json(status);
}
