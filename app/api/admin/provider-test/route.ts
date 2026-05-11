import { NextResponse } from "next/server";
import { testSelectedProvider } from "@/lib/aiProvider";

export async function POST() {
  const result = await testSelectedProvider();

  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
