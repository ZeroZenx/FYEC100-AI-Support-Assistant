import { NextResponse } from "next/server";
import {
  getChatGptSessionCookieName,
  signOutChatGpt
} from "@/lib/chatgptAuth";

export async function POST(request: Request) {
  const result = await signOutChatGpt(request);
  const response = NextResponse.json({
    authenticated: false,
    message: result.revocationConfirmed
      ? "ChatGPT session signed out and revoked."
      : "ChatGPT session signed out locally. Remote revocation could not be confirmed; disconnect the app from ChatGPT Settings if needed."
  });

  response.cookies.set({
    maxAge: 0,
    name: getChatGptSessionCookieName(),
    path: "/",
    value: ""
  });

  return response;
}
