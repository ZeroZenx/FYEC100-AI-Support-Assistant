import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "LTI launch validation is not implemented in this Phase 2 scaffold.",
      requiredNext:
        "Validate the LTI ID token signature, issuer, audience/client ID, deployment ID, nonce, message type, roles, and target link URI before trusting launch context."
    },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      error: "LTI launch expects a validated POST from Moodle in a future implementation."
    },
    { status: 405 }
  );
}
