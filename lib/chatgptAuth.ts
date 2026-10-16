import {
  createHash,
  createPublicKey,
  createVerify,
  randomBytes,
  randomUUID
} from "crypto";
import { chmod, mkdir, readFile, rename, writeFile } from "fs/promises";
import os from "os";
import path from "path";

const AUTHORIZE_URL = "https://auth.openai.com/api/accounts/authorize";
const TOKEN_URL = "https://auth.openai.com/api/accounts/oauth/token";
const OPENAI_RESOURCE = "https://api.openai.com/v1";
const OPENAI_API_BASE_URL = "https://api.openai.com/v1";
const SESSION_COOKIE = "fyec100_chatgpt_session";
const OAUTH_STATE_COOKIE = "fyec100_chatgpt_oauth_state";
const DYNAMIC_CLIENT_ID = "dynamic_agent_client";
const CALLBACK_PATH = "/api/auth/chatgpt/callback";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const ACCESS_TOKEN_REFRESH_WINDOW_MS = 60 * 1000;
const REQUIRED_PLAN_SCOPE = "chatgpt.tokens.use.direct";
const REQUIRED_RESOURCE_SCOPE = "resource.invoke";
const DEFAULT_REDIRECT_URI = `http://127.0.0.1:4100${CALLBACK_PATH}`;
const OIDC_CONFIGURATION_URL = "https://auth.openai.com/.well-known/openid-configuration";

type OpenIdConfiguration = {
  issuer?: string;
  jwks_uri?: string;
  revocation_endpoint?: string;
};

type JwtHeader = {
  alg?: string;
  kid?: string;
  typ?: string;
};

type IdTokenClaims = {
  aud?: string | string[];
  email?: string;
  exp?: number;
  iss?: string;
  name?: string;
  nonce?: string;
  picture?: string;
  sub?: string;
};

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
};

export type ChatGptCredentialRecord = {
  accessToken?: string;
  clientId: string;
  email?: string;
  extAgentHostId: string;
  expiresAt?: number;
  idToken?: string;
  issuer: string;
  name?: string;
  picture?: string;
  refreshToken?: string;
  savedAt: string;
  scopes: string[];
  subject: string;
  tokenType?: string;
};

type CredentialStore = {
  accounts: Record<string, ChatGptCredentialRecord>;
  hostId: string;
  version: 1;
};

type PendingAuthorization = {
  clientId: string;
  codeVerifier: string;
  createdAt: number;
  extAgentHostId: string;
  nonce: string;
  redirectUri: string;
  state: string;
};

type ActiveSession = {
  clientId: string;
  expiresAt: number;
};

type ChatGptAuthRuntime = {
  pending: Map<string, PendingAuthorization>;
  refreshLocks: Map<string, Promise<ChatGptCredentialRecord>>;
  sessions: Map<string, ActiveSession>;
};

export type ChatGptAccountSummary = {
  email?: string;
  name?: string;
  subject: string;
};

export type ChatGptAuthSnapshot = {
  account?: ChatGptAccountSummary;
  authenticated: boolean;
  configured: boolean;
  enabled: boolean;
  error?: string;
  localOnly: boolean;
  provider: "chatgpt";
};

export class ChatGptAuthError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ChatGptAuthError";
    this.code = code;
  }
}

const runtimeKey = "__fyec100ChatGptAuthRuntime";
const globalRuntime = globalThis as typeof globalThis & {
  [runtimeKey]?: ChatGptAuthRuntime;
};
const runtime: ChatGptAuthRuntime =
  globalRuntime[runtimeKey] ?? {
    pending: new Map(),
    refreshLocks: new Map(),
    sessions: new Map()
  };

globalRuntime[runtimeKey] = runtime;

export function getChatGptAuthConfig() {
  const enabled = parseBoolean(process.env.CHATGPT_AUTH_ENABLED, false);
  const localOnly = parseBoolean(process.env.CHATGPT_LOCAL_ONLY, true);
  const redirectUri = process.env.CHATGPT_REDIRECT_URI?.trim() || DEFAULT_REDIRECT_URI;
  const allowedEmail = process.env.CHATGPT_ALLOWED_EMAIL?.trim().toLowerCase();
  const allowedSubject = process.env.CHATGPT_ALLOWED_SUBJECT?.trim();
  const configError = !enabled
    ? "ChatGPT authentication is disabled. Set CHATGPT_AUTH_ENABLED=true for local development."
    : localOnly && !isLoopbackRedirectUri(redirectUri)
      ? "ChatGPT local-only mode requires CHATGPT_REDIRECT_URI to use an HTTP 127.0.0.1 loopback callback."
      : !allowedEmail && !allowedSubject
        ? "Set CHATGPT_ALLOWED_EMAIL or CHATGPT_ALLOWED_SUBJECT to restrict this local prototype to your account."
        : "";

  return {
    agentName: process.env.CHATGPT_AGENT_NAME?.trim() || "FYEC100 AI Support Assistant",
    allowedEmail,
    allowedSubject,
    configured: !configError,
    configError,
    credentialsPath: getCredentialsPath(),
    enabled,
    localOnly,
    model: process.env.CHATGPT_MODEL?.trim() || "",
    redirectUri
  };
}

export function getChatGptAuthConfigStatus() {
  const config = getChatGptAuthConfig();

  return {
    configured: config.configured,
    enabled: config.enabled,
    error: config.configError || undefined,
    localOnly: config.localOnly,
    provider: "chatgpt" as const
  };
}

export function getChatGptSessionCookieName() {
  return SESSION_COOKIE;
}

export function getChatGptOAuthStateCookieName() {
  return OAUTH_STATE_COOKIE;
}

export async function getChatGptAuthSnapshot(request: Request): Promise<ChatGptAuthSnapshot> {
  const config = getChatGptAuthConfig();

  if (!config.configured) {
    return {
      authenticated: false,
      configured: false,
      enabled: config.enabled,
      error: config.configError,
      localOnly: config.localOnly,
      provider: "chatgpt"
    };
  }

  let session;
  try {
    session = await getSessionForRequestAsync(request);
  } catch (error) {
    return {
      authenticated: false,
      configured: true,
      enabled: true,
      error:
        error instanceof ChatGptAuthError
          ? error.message
          : "The local ChatGPT session could not be renewed.",
      localOnly: config.localOnly,
      provider: "chatgpt"
    };
  }

  if (!session) {
    return {
      authenticated: false,
      configured: true,
      enabled: true,
      localOnly: config.localOnly,
      provider: "chatgpt"
    };
  }

  return {
    account: toAccountSummary(session.credential),
    authenticated: true,
    configured: true,
    enabled: true,
    localOnly: config.localOnly,
    provider: "chatgpt"
  };
}

export async function startChatGptAuthorization(request: Request) {
  const config = getChatGptAuthConfig();
  ensureRequestIsAllowed(request, config);

  const store = await loadCredentialStore();
  const savedAccount = findAllowedAccount(store, config);
  const clientId = savedAccount?.clientId || DYNAMIC_CLIENT_ID;
  const codeVerifier = randomBase64Url(32);
  const state = randomBase64Url(32);
  const nonce = randomBase64Url(32);
  const pending: PendingAuthorization = {
    clientId,
    codeVerifier,
    createdAt: Date.now(),
    extAgentHostId: store.hostId,
    nonce,
    redirectUri: config.redirectUri,
    state
  };

  pruneRuntimeState();
  runtime.pending.set(state, pending);

  const authorizationUrl = new URL(AUTHORIZE_URL);
  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    code_challenge: base64UrlSha256(codeVerifier),
    code_challenge_method: "S256",
    ext_agent_host_id: store.hostId,
    nonce,
    redirect_uri: config.redirectUri,
    resource: OPENAI_RESOURCE,
    response_type: "code",
    scope:
      "openid profile email offline_access resource.invoke chatgpt.tokens.use.direct",
    state
  }).toString();

  if (clientId === DYNAMIC_CLIENT_ID) {
    authorizationUrl.searchParams.set("agent_name_hint", config.agentName);
  } else {
    if (savedAccount?.idToken) {
      authorizationUrl.searchParams.set("id_token_hint", savedAccount.idToken);
    }

    if (savedAccount?.email) {
      authorizationUrl.searchParams.set("login_hint", savedAccount.email);
    }
  }

  return {
    authorizationUrl: authorizationUrl.toString(),
    state
  };
}

export async function completeChatGptAuthorization(request: Request) {
  const config = getChatGptAuthConfig();
  ensureRequestIsAllowed(request, config);

  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const oauthStateCookie = getCookie(request, OAUTH_STATE_COOKIE);
  const pending = state ? runtime.pending.get(state) : undefined;

  if (!state || !pending || state !== oauthStateCookie) {
    throw new ChatGptAuthError(
      "invalid_state",
      "The ChatGPT authorization state was missing or expired. Start sign-in again."
    );
  }

  runtime.pending.delete(state);

  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    throw new ChatGptAuthError(
      oauthError,
      oauthError === "access_denied"
        ? "ChatGPT plan access was not granted. You can try again and approve the requested permissions."
        : "ChatGPT sign-in was not completed. Start sign-in again."
    );
  }

  const code = url.searchParams.get("code");
  if (!code) {
    throw new ChatGptAuthError(
      "missing_code",
      "ChatGPT did not return an authorization code. Start sign-in again."
    );
  }

  const callbackClientId = url.searchParams.get("client_id");
  const clientId = callbackClientId || pending.clientId;

  if (!clientId || clientId === DYNAMIC_CLIENT_ID) {
    throw new ChatGptAuthError(
      "missing_client_id",
      "ChatGPT client registration did not complete. Start sign-in again."
    );
  }

  if (pending.clientId !== DYNAMIC_CLIENT_ID && callbackClientId && callbackClientId !== pending.clientId) {
    throw new ChatGptAuthError(
      "client_mismatch",
      "ChatGPT returned a different client registration than the one selected. Start sign-in again."
    );
  }

  const tokenResponse = await exchangeAuthorizationCode({
    clientId,
    code,
    codeVerifier: pending.codeVerifier,
    redirectUri: pending.redirectUri
  });
  const scopes = parseScopes(tokenResponse.scope || url.searchParams.get("scope") || "");

  if (!scopes.includes(REQUIRED_PLAN_SCOPE) || !scopes.includes(REQUIRED_RESOURCE_SCOPE)) {
    await revokeRefreshToken(tokenResponse.refresh_token, clientId);
    throw new ChatGptAuthError(
      "plan_scope_missing",
      "ChatGPT sign-in succeeded, but ChatGPT plan inference permission was not granted."
    );
  }

  const claims = await validateIdToken(
    tokenResponse.id_token,
    clientId,
    pending.nonce
  );
  const store = await loadCredentialStore();
  const existing = store.accounts[clientId];

  if (existing && existing.subject !== claims.sub) {
    await revokeRefreshToken(tokenResponse.refresh_token, clientId);
    throw new ChatGptAuthError(
      "account_mismatch",
      "The returned ChatGPT account does not match the saved local account registration."
    );
  }

  if (!isAllowedAccount(claims)) {
    await revokeRefreshToken(tokenResponse.refresh_token, clientId);
    throw new ChatGptAuthError(
      "account_not_allowed",
      "This ChatGPT account is not the locally allowed account. Set CHATGPT_ALLOWED_EMAIL or CHATGPT_ALLOWED_SUBJECT for the intended account."
    );
  }

  const credential: ChatGptCredentialRecord = {
    accessToken: tokenResponse.access_token,
    clientId,
    email: claims.email,
    extAgentHostId: pending.extAgentHostId,
    expiresAt: Date.now() + Math.max(0, (tokenResponse.expires_in || 0) * 1000),
    idToken: tokenResponse.id_token,
    issuer: claims.iss || "https://auth.openai.com",
    name: claims.name,
    picture: claims.picture,
    refreshToken: tokenResponse.refresh_token,
    savedAt: new Date().toISOString(),
    scopes,
    subject: claims.sub,
    tokenType: tokenResponse.token_type || "Bearer"
  };

  if (!credential.accessToken || !credential.refreshToken) {
    throw new ChatGptAuthError(
      "incomplete_token_response",
      "ChatGPT did not return the renewable credentials required for this local integration."
    );
  }

  store.accounts[clientId] = credential;
  await saveCredentialStore(store);

  const sessionId = randomBase64Url(32);
  runtime.sessions.set(sessionId, {
    clientId,
    expiresAt: Date.now() + SESSION_TTL_MS
  });

  return {
    account: toAccountSummary(credential),
    sessionId
  };
}

export async function getChatGptAccessToken(request: Request) {
  const config = getChatGptAuthConfig();
  ensureRequestIsAllowed(request, config);
  const session = await getSessionForRequestAsync(request);

  if (!session?.credential.accessToken) {
    throw new ChatGptAuthError(
      "not_authenticated",
      "Sign in with ChatGPT before using the ChatGPT provider."
    );
  }

  return session.credential.accessToken;
}

export async function getChatGptModel(accessToken: string) {
  const config = getChatGptAuthConfig();

  if (config.model) {
    return config.model;
  }

  const response = await fetch(`${OPENAI_API_BASE_URL}/models`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new ChatGptAuthError(
      `models_http_${response.status}`,
      "The signed-in ChatGPT account could not provide an available model list."
    );
  }

  const data = (await response.json()) as {
    models?: Array<{ display_name?: string; id?: string; slug?: string; visibility?: string }>;
  };
  const model = data.models?.find((item) => item.visibility === "list")?.slug ||
    data.models?.find((item) => item.slug || item.id)?.slug ||
    data.models?.find((item) => item.id)?.id;

  if (!model) {
    throw new ChatGptAuthError(
      "models_empty",
      "The signed-in ChatGPT account did not return an available model. Set CHATGPT_MODEL after reviewing /v1/models."
    );
  }

  return model;
}

export async function signOutChatGpt(request: Request) {
  const sessionId = getCookie(request, SESSION_COOKIE);
  const session = sessionId ? runtime.sessions.get(sessionId) : undefined;
  let revocationConfirmed = false;

  if (session) {
    const store = await loadCredentialStore();
    const credential = store.accounts[session.clientId];

    if (credential?.refreshToken) {
      revocationConfirmed = await revokeRefreshToken(
        credential.refreshToken,
        credential.clientId
      );
      store.accounts[session.clientId] = {
        ...credential,
        accessToken: undefined,
        expiresAt: undefined,
        idToken: undefined,
        refreshToken: undefined,
        savedAt: new Date().toISOString()
      };
      await saveCredentialStore(store);
    }

    runtime.sessions.delete(sessionId as string);
  }

  return { revocationConfirmed };
}

export async function testChatGptProvider(request: Request) {
  const accessToken = await getChatGptAccessToken(request);
  const model = await getChatGptModel(accessToken);
  const response = await fetch(`${OPENAI_API_BASE_URL}/responses`, {
    body: JSON.stringify({
      input: [{ content: "Reply with one short sentence confirming the FYEC100 ChatGPT provider test is working.", role: "user" }],
      model,
      store: false,
      stream: true
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new ChatGptAuthError(
      `responses_http_${response.status}`,
      "The signed-in ChatGPT account rejected the provider test request."
    );
  }

  const text = await readResponseStream(response);
  return text.trim().slice(0, 240) || "ChatGPT responded without text.";
}

export async function generateChatGptResponse(input: {
  messages: Array<{ content: string; role: "assistant" | "user" }>;
  request: Request;
  systemPrompt: string;
}) {
  const accessToken = await getChatGptAccessToken(input.request);
  const model = await getChatGptModel(accessToken);
  const response = await fetch(`${OPENAI_API_BASE_URL}/responses`, {
    body: JSON.stringify({
      input: input.messages,
      instructions: input.systemPrompt,
      model,
      store: false,
      stream: true
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new ChatGptAuthError(
      `responses_http_${response.status}`,
      "The signed-in ChatGPT account rejected the assistant request."
    );
  }

  return readResponseStream(response);
}

function getSessionForRequest(request: Request) {
  const sessionId = getCookie(request, SESSION_COOKIE);
  const session = sessionId ? runtime.sessions.get(sessionId) : undefined;

  if (!session || session.expiresAt <= Date.now()) {
    if (sessionId) runtime.sessions.delete(sessionId);
    return undefined;
  }

  return session;
}

async function getSessionForRequestAsync(request: Request) {
  const session = getSessionForRequest(request);

  if (!session) return undefined;

  const store = await loadCredentialStore();
  let credential = store.accounts[session.clientId];

  if (
    !credential?.accessToken ||
    !isAllowedAccount(credential) ||
    !credential.scopes.includes(REQUIRED_PLAN_SCOPE)
  ) {
    return undefined;
  }

  if (credential.expiresAt && credential.expiresAt <= Date.now() + ACCESS_TOKEN_REFRESH_WINDOW_MS) {
    credential = await refreshCredential(store, credential);
  }

  return { credential, session };
}

async function refreshCredential(store: CredentialStore, credential: ChatGptCredentialRecord) {
  const existingLock = runtime.refreshLocks.get(credential.clientId);
  if (existingLock) return existingLock;

  const refreshPromise = (async () => {
    if (!credential.refreshToken) {
      throw new ChatGptAuthError(
        "refresh_missing",
        "The ChatGPT session expired. Sign in with ChatGPT again."
      );
    }

    const response = await fetch(TOKEN_URL, {
      body: new URLSearchParams({
        client_id: credential.clientId,
        grant_type: "refresh_token",
        refresh_token: credential.refreshToken,
        resource: OPENAI_RESOURCE
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST"
    });
    const data = (await response.json().catch(() => ({}))) as TokenResponse;

    if (!response.ok || !data.access_token) {
      throw new ChatGptAuthError(
        data.error || `refresh_http_${response.status}`,
        "The ChatGPT session could not be renewed. Sign in with ChatGPT again."
      );
    }

    const refreshed: ChatGptCredentialRecord = {
      ...credential,
      accessToken: data.access_token,
      expiresAt: Date.now() + Math.max(0, (data.expires_in || 0) * 1000),
      refreshToken: data.refresh_token || credential.refreshToken,
      savedAt: new Date().toISOString(),
      scopes: parseScopes(data.scope || credential.scopes.join(" ")),
      tokenType: data.token_type || credential.tokenType
    };
    store.accounts[credential.clientId] = refreshed;
    await saveCredentialStore(store);
    return refreshed;
  })();

  runtime.refreshLocks.set(credential.clientId, refreshPromise);

  try {
    return await refreshPromise;
  } finally {
    runtime.refreshLocks.delete(credential.clientId);
  }
}

async function exchangeAuthorizationCode(input: {
  clientId: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
}) {
  const response = await fetch(TOKEN_URL, {
    body: new URLSearchParams({
      client_id: input.clientId,
      code: input.code,
      code_verifier: input.codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: input.redirectUri,
      resource: OPENAI_RESOURCE
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST"
  });
  const data = (await response.json().catch(() => ({}))) as TokenResponse;

  if (!response.ok) {
    throw new ChatGptAuthError(
      data.error || `token_http_${response.status}`,
      data.error === "invalid_grant"
        ? "The ChatGPT authorization code expired or was already used. Start sign-in again."
        : "ChatGPT token exchange failed. Start sign-in again."
    );
  }

  return data;
}

async function validateIdToken(
  token: string | undefined,
  clientId: string,
  nonce: string
) {
  if (!token) {
    throw new ChatGptAuthError(
      "id_token_missing",
      "ChatGPT did not return an identity token. Start sign-in again."
    );
  }

  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new ChatGptAuthError("id_token_invalid", "ChatGPT returned an invalid identity token.");
  }

  const header = parseBase64Json<JwtHeader>(encodedHeader);
  const claims = parseBase64Json<IdTokenClaims>(encodedPayload);
  const oidc = await getOpenIdConfiguration();

  if (header.alg !== "RS256" || !header.kid || !oidc.jwks_uri) {
    throw new ChatGptAuthError("id_token_algorithm", "ChatGPT returned an unsupported identity token.");
  }

  const jwksResponse = await fetch(oidc.jwks_uri, { cache: "no-store" });
  if (!jwksResponse.ok) {
    throw new ChatGptAuthError("jwks_unavailable", "ChatGPT identity validation is temporarily unavailable.");
  }

  const jwks = (await jwksResponse.json()) as {
    keys?: Array<Record<string, string>>;
  };
  const key = jwks.keys?.find((candidate) => candidate.kid === header.kid);
  if (!key) {
    throw new ChatGptAuthError("jwks_key_missing", "ChatGPT identity validation could not find its signing key.");
  }

  const publicKey = createPublicKey({
    format: "jwk",
    key: key as unknown as import("crypto").JsonWebKey
  });
  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  if (!verifier.verify(publicKey, Buffer.from(encodedSignature, "base64url"))) {
    throw new ChatGptAuthError("id_token_signature", "ChatGPT identity validation failed.");
  }

  const expectedIssuer = oidc.issuer || "https://auth.openai.com";
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (
    claims.iss !== expectedIssuer ||
    !audience.includes(clientId) ||
    !claims.sub ||
    !claims.exp ||
    claims.exp <= Math.floor(Date.now() / 1000) ||
    claims.nonce !== nonce
  ) {
    throw new ChatGptAuthError("id_token_claims", "ChatGPT identity validation failed.");
  }

  return {
    email: claims.email?.trim().toLowerCase(),
    iss: claims.iss || expectedIssuer,
    name: claims.name?.trim(),
    picture: claims.picture,
    sub: claims.sub
  };
}

async function getOpenIdConfiguration() {
  const response = await fetch(OIDC_CONFIGURATION_URL, { cache: "no-store" });

  if (!response.ok) {
    throw new ChatGptAuthError("oidc_configuration", "ChatGPT authentication metadata is temporarily unavailable.");
  }

  return (await response.json()) as OpenIdConfiguration;
}

async function revokeRefreshToken(refreshToken: string | undefined, clientId: string) {
  if (!refreshToken) return true;

  try {
    const oidc = await getOpenIdConfiguration();
    const endpoint = oidc.revocation_endpoint;
    if (!endpoint) return false;

    const response = await fetch(endpoint, {
      body: new URLSearchParams({
        client_id: clientId,
        token: refreshToken,
        token_type_hint: "refresh_token"
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST"
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function readResponseStream(response: Response) {
  if (!response.body) {
    throw new ChatGptAuthError("responses_stream_missing", "ChatGPT returned no response stream.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let output = "";
  let completed = false;

  while (true) {
    const chunk = await reader.read();
    buffer += decoder.decode(chunk.value || new Uint8Array(), { stream: !chunk.done });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || "";

    for (const event of events) {
      const dataLine = event
        .split(/\r?\n/)
        .find((line) => line.startsWith("data:"));
      const rawData = dataLine?.slice(5).trim();
      if (!rawData || rawData === "[DONE]") continue;

      const parsed = JSON.parse(rawData) as {
        delta?: string;
        response?: { error?: { code?: string } };
        type?: string;
      };

      if (parsed.type === "response.output_text.delta" && parsed.delta) {
        output += parsed.delta;
      }

      if (parsed.type === "response.failed") {
        throw new ChatGptAuthError(
          parsed.response?.error?.code || "responses_failed",
          "ChatGPT could not complete the assistant request."
        );
      }

      if (parsed.type === "response.completed") {
        completed = true;
      }
    }

    if (chunk.done) break;
  }

  if (buffer.trim()) {
    const dataLine = buffer
      .split(/\r?\n/)
      .find((line) => line.startsWith("data:"));
    const rawData = dataLine?.slice(5).trim();

    if (rawData && rawData !== "[DONE]") {
      const parsed = JSON.parse(rawData) as {
        delta?: string;
        response?: { error?: { code?: string } };
        type?: string;
      };

      if (parsed.type === "response.output_text.delta" && parsed.delta) {
        output += parsed.delta;
      }

      if (parsed.type === "response.failed") {
        throw new ChatGptAuthError(
          parsed.response?.error?.code || "responses_failed",
          "ChatGPT could not complete the assistant request."
        );
      }

      if (parsed.type === "response.completed") {
        completed = true;
      }
    }
  }

  if (!completed) {
    throw new ChatGptAuthError(
      "responses_incomplete",
      "ChatGPT ended the response before completion. Please try again."
    );
  }

  return output;
}

async function loadCredentialStore(): Promise<CredentialStore> {
  const config = getChatGptAuthConfig();

  try {
    const parsed = JSON.parse(await readFile(config.credentialsPath, "utf8")) as Partial<CredentialStore>;
    if (parsed.version === 1 && parsed.hostId && parsed.accounts) {
      return parsed as CredentialStore;
    }
  } catch {
    // A first run has no credential store yet.
  }

  const store: CredentialStore = {
    accounts: {},
    hostId: `urn:uuid:${randomUUID()}`,
    version: 1
  };
  await saveCredentialStore(store);
  return store;
}

async function saveCredentialStore(store: CredentialStore) {
  const config = getChatGptAuthConfig();
  const directory = path.dirname(config.credentialsPath);
  const temporaryPath = `${config.credentialsPath}.${randomBase64Url(12)}.tmp`;
  await mkdir(directory, { recursive: true });
  await writeFile(temporaryPath, JSON.stringify(store, null, 2), { encoding: "utf8", mode: 0o600 });
  await chmod(temporaryPath, 0o600).catch(() => undefined);
  await rename(temporaryPath, config.credentialsPath);
}

function findAllowedAccount(store: CredentialStore, config: ReturnType<typeof getChatGptAuthConfig>) {
  return Object.values(store.accounts).find((account) =>
    (config.allowedSubject && account.subject === config.allowedSubject) ||
    (config.allowedEmail && account.email === config.allowedEmail)
  );
}

function isAllowedAccount(claims: { email?: string; sub?: string; subject?: string }) {
  const config = getChatGptAuthConfig();
  const subject = claims.subject || claims.sub;

  return Boolean(
    (config.allowedSubject && subject === config.allowedSubject) ||
      (config.allowedEmail && claims.email === config.allowedEmail)
  );
}

function toAccountSummary(credential: ChatGptCredentialRecord): ChatGptAccountSummary {
  return {
    email: credential.email,
    name: credential.name,
    subject: credential.subject
  };
}

function ensureRequestIsAllowed(request: Request, config: ReturnType<typeof getChatGptAuthConfig>) {
  if (!config.configured) {
    throw new ChatGptAuthError("not_configured", config.configError);
  }

  if (config.localOnly) {
    const requestHostname = new URL(request.url).hostname.toLowerCase();
    const hostHeader = request.headers.get("host");
    const hostname = hostHeader ? getHostHeaderHostname(hostHeader) : requestHostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "::1") {
      throw new ChatGptAuthError(
        "local_only",
        "ChatGPT plan usage is restricted to the local development runtime."
      );
    }
  }
}

function getHostHeaderHostname(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith("[")) {
    return trimmed.slice(1, trimmed.indexOf("]"));
  }

  return trimmed.split(":")[0];
}

function isLoopbackRedirectUri(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" && url.hostname === "127.0.0.1" && url.pathname === CALLBACK_PATH;
  } catch {
    return false;
  }
}

function getCredentialsPath() {
  const configuredPath = process.env.CHATGPT_CREDENTIALS_PATH?.trim();
  if (configuredPath) return path.resolve(configuredPath);

  const localAppData = process.env.LOCALAPPDATA;
  return process.platform === "win32"
    ? path.join(localAppData || os.homedir(), "FYEC100 AI Support", "chatgpt-credentials.json")
    : path.join(os.homedir(), ".config", "fyec100-ai-support", "chatgpt-credentials.json");
}

function getCookie(request: Request, name: string) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function parseScopes(value: string) {
  return Array.from(new Set(value.split(/\s+/).map((scope) => scope.trim()).filter(Boolean)));
}

function randomBase64Url(size: number) {
  return randomBytes(size).toString("base64url");
}

function base64UrlSha256(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

function parseBase64Json<T>(value: string) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    throw new ChatGptAuthError("jwt_decode", "ChatGPT returned an unreadable identity token.");
  }
}

function pruneRuntimeState() {
  const now = Date.now();
  runtime.pending.forEach((pending, state) => {
    if (pending.createdAt + OAUTH_STATE_TTL_MS <= now) {
      runtime.pending.delete(state);
    }
  });

  runtime.sessions.forEach((session, sessionId) => {
    if (session.expiresAt <= now) runtime.sessions.delete(sessionId);
  });
}
