import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      keys: [],
      warning:
        "LTI JWKS scaffold only. Production signing keys are not configured yet."
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
