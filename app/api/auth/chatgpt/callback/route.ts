import { NextResponse } from "next/server";
import {
  completeChatGptAuthorization,
  getChatGptOAuthStateCookieName,
  getChatGptSessionCookieName
} from "@/lib/chatgptAuth";

export async function GET(request: Request) {
  try {
    const result = await completeChatGptAuthorization(request);
    const redirectUrl = new URL("/chat?chatgpt_auth=success", request.url);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set({
      httpOnly: true,
      maxAge: 8 * 60 * 60,
      name: getChatGptSessionCookieName(),
      path: "/",
      sameSite: "lax",
      secure: false,
      value: result.sessionId
    });
    response.cookies.set({
      maxAge: 0,
      name: getChatGptOAuthStateCookieName(),
      path: "/",
      value: ""
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "ChatGPT sign-in could not be completed.";
    const redirectUrl = new URL("/chat?chatgpt_auth=error", request.url);
    redirectUrl.searchParams.set("message", message);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set({
      maxAge: 0,
      name: getChatGptOAuthStateCookieName(),
      path: "/",
      value: ""
    });

    return response;
  }
}
