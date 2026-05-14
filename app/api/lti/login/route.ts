import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  return NextResponse.json(
    {
      error: "LTI OIDC login is not implemented in this Phase 2 scaffold.",
      received: {
        clientId: url.searchParams.get("client_id"),
        issuer: url.searchParams.get("iss"),
        loginHintPresent: Boolean(url.searchParams.get("login_hint")),
        targetLinkUri: url.searchParams.get("target_link_uri")
      },
      requiredNext:
        "Implement OIDC login initiation, state and nonce storage, and redirect to the Moodle authorization endpoint before pilot LTI use."
    },
    { status: 501 }
  );
}
