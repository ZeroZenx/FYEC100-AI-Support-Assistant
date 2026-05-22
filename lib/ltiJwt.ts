import { createHmac, createVerify } from "crypto";

export function verifyLtiJwtSignature(idToken: string) {
  const [headerPart, payloadPart, signaturePart] = idToken.split(".");
  const header = decodePart(headerPart) as { alg?: string; kid?: string };
  const signingInput = `${headerPart}.${payloadPart}`;

  if (!header.alg || !signaturePart) {
    return { message: "Token header or signature is missing.", ok: false };
  }

  if (header.alg === "HS256" && process.env.LTI_JWT_SHARED_SECRET) {
    const expected = createHmac("sha256", process.env.LTI_JWT_SHARED_SECRET)
      .update(signingInput)
      .digest("base64url");
    return {
      message: expected === signaturePart ? "HS256 signature valid." : "HS256 signature mismatch.",
      ok: expected === signaturePart
    };
  }

  if (header.alg === "RS256" && process.env.LTI_PLATFORM_PUBLIC_KEY_PEM) {
    const verifier = createVerify("RSA-SHA256");
    verifier.update(signingInput);
    verifier.end();
    const ok = verifier.verify(process.env.LTI_PLATFORM_PUBLIC_KEY_PEM, signaturePart, "base64url");
    return {
      message: ok ? "RS256 signature valid with configured PEM." : "RS256 signature mismatch.",
      ok
    };
  }

  return {
    message: `Signature algorithm ${header.alg} needs configured validation material.`,
    ok: false
  };
}

function decodePart(value?: string) {
  if (!value) return {};
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}
