import { NextResponse } from "next/server";
import {
  getChatGptOAuthStateCookieName,
  startChatGptAuthorization,
  getChatGptAuthConfig
} from "@/lib/chatgptAuth";

export async function GET(request: Request) {
  try {
    const authorization = await startChatGptAuthorization(request);
    const response = NextResponse.redirect(authorization.authorizationUrl);

    response.cookies.set({
      httpOnly: true,
      maxAge: 10 * 60,
      name: getChatGptOAuthStateCookieName(),
      path: "/",
      sameSite: "lax",
      secure: false,
      value: authorization.state
    });

    return response;
  } catch (error) {
    const config = getChatGptAuthConfig();
    const message = error instanceof Error ? error.message : config.configError;
    return NextResponse.json(
      { error: message || "ChatGPT sign-in could not start." },
      { status: 503 }
    );
  }
}
