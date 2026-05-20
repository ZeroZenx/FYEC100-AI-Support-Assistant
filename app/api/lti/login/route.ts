import { NextResponse } from "next/server";
import { createLtiLaunchState } from "@/lib/ltiLaunch";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const launch = await createLtiLaunchState({
    clientId: url.searchParams.get("client_id"),
    issuer: url.searchParams.get("iss"),
    loginHint: url.searchParams.get("login_hint"),
    ltiMessageHint: url.searchParams.get("lti_message_hint"),
    targetLinkUri: url.searchParams.get("target_link_uri")
  });

  if (!launch.configured) {
    return NextResponse.json(
      {
        message:
          "LTI OIDC state was created, but the Moodle authorization redirect is not configured yet.",
        missing: launch.missing,
        stateRecord: launch.stateRecord,
        requiredNext:
          "Set LTI_PLATFORM_AUTH_URL and LTI_CLIENT_ID, then retry from Moodle or the LTI test harness."
      },
      { status: 409 }
    );
  }

  return NextResponse.redirect(launch.authorizationUrl);
}
