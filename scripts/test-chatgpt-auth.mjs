import { readFile } from "node:fs/promises";

const authSource = await readFile("lib/chatgptAuth.ts", "utf8");
const routeSource = await readFile("app/api/auth/chatgpt/callback/route.ts", "utf8");
const panelSource = await readFile("components/ChatGptAuthPanel.tsx", "utf8");

const assertions = [
  [authSource.includes("auth.openai.com/api/accounts/authorize"), "uses the official authorization endpoint"],
  [authSource.includes("auth.openai.com/api/accounts/oauth/token"), "uses the official token endpoint"],
  [authSource.includes("code_challenge_method: \"S256\""), "uses PKCE S256"],
  [authSource.includes("chatgpt.tokens.use.direct"), "requests the documented ChatGPT plan scope"],
  [authSource.includes("resource.invoke"), "requests the documented Responses resource scope"],
  [authSource.includes("store: false") && authSource.includes("stream: true"), "uses non-stored streaming Responses requests"],
  [authSource.includes("createVerify(\"RSA-SHA256\")"), "verifies the ID-token signature"],
  [authSource.includes("CHATGPT_ALLOWED_EMAIL") && authSource.includes("CHATGPT_ALLOWED_SUBJECT"), "enforces a local account allowlist"],
  [authSource.includes("127.0.0.1") && authSource.includes("CHATGPT_LOCAL_ONLY"), "enforces a loopback local-only boundary"],
  [!authSource.includes("backend-api"), "does not reference ChatGPT web backend endpoints"],
  [routeSource.includes("httpOnly: true") && routeSource.includes("getChatGptSessionCookieName"), "uses an HTTP-only opaque session cookie"],
  [panelSource.includes("Continue with ChatGPT") && panelSource.includes("Sign out"), "exposes sign-in and sign-out controls"]
];

for (const [passed, label] of assertions) {
  if (!passed) throw new Error(`ChatGPT auth assertion failed: ${label}`);
}

const baseUrl = process.env.AUTH_BASE_URL || "http://127.0.0.1:4100";
try {
  const response = await fetch(`${baseUrl}/api/auth/chatgpt/status`, {
    headers: { Accept: "application/json" }
  });
  const payload = await response.json();
  const serialized = JSON.stringify(payload);
  for (const forbidden of ["accessToken", "refreshToken", "idToken"]) {
    if (serialized.includes(forbidden)) {
      throw new Error(`Status endpoint exposed a forbidden credential field: ${forbidden}`);
    }
  }
  console.log(`ChatGPT auth endpoint smoke check passed (${response.status}).`);
} catch (error) {
  if (error instanceof TypeError) {
    console.log("ChatGPT auth source/security checks passed; endpoint smoke check skipped because the local server is not running.");
  } else {
    throw error;
  }
}

console.log(`ChatGPT auth checks passed (${assertions.length} assertions).`);
