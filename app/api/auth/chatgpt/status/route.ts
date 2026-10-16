import { NextResponse } from "next/server";
import { getChatGptAuthSnapshot } from "@/lib/chatgptAuth";

export async function GET(request: Request) {
  return NextResponse.json({
    ...(await getChatGptAuthSnapshot(request)),
    selectedProvider: process.env.AI_PROVIDER?.trim().toLowerCase() || "openai"
  }, {
    headers: { "Cache-Control": "no-store" }
  });
}
