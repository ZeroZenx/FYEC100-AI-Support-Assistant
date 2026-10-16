# Sign in with ChatGPT for the FYEC100 MVP

This branch adds the officially documented Sign in with ChatGPT open-source/local-client flow as an optional AI provider. The existing OpenAI API, DeepSeek, Ollama, RAG retrieval, guardrails, feedback, administrative tooling, and Moodle iframe routes remain available.

## What the integration does

When `AI_PROVIDER=chatgpt`, the normal local chat flow is:

```text
Student question
  -> FYEC100 course routing and RAG retrieval
  -> grounded prompt with academic-integrity rules
  -> server-side Responses API request using the signed-in user’s OAuth access token
  -> source-aware FYEC100 answer
```

The app uses the documented OAuth flow:

1. The local app creates a host identifier and fresh `state`, OIDC `nonce`, and PKCE verifier.
2. The browser opens OpenAI’s authorization endpoint using dynamic registration for the first sign-in.
3. OpenAI redirects to the exact HTTP loopback callback on `127.0.0.1`.
4. The server exchanges the authorization code without a client secret, validates the ID-token signature against OpenAI’s published JWKS, checks the issuer, audience, expiry, nonce, and granted plan scopes, and stores the approved account registration.
5. The server keeps credentials in a protected local file and gives the browser only an opaque, HTTP-only FYEC100 session cookie.
6. ChatGPT inference uses `POST https://api.openai.com/v1/responses` with `store: false` and `stream: true`. The app does not call ChatGPT web `backend-api` endpoints.

The implementation follows the OpenAI [Sign in with ChatGPT quickstart](https://developers.openai.com/siwc/quickstart), [open-source overview](https://developers.openai.com/siwc/token-sharing-open-source), [registration and sign-in guide](https://developers.openai.com/siwc/token-sharing-open-source/sign-in), [accounts and sessions guide](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions), and [models and inference guide](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference).

## Eligibility and restrictions

OpenAI documents ChatGPT plan usage for open-source and locally hosted apps. The user must still have an eligible ChatGPT plan, approve the requested scopes, and satisfy any current OpenAI account or partner requirements. A valid identity token alone is not enough; the `chatgpt.tokens.use.direct` and `resource.invoke` scopes are required for inference.

The OpenAI terms require that:

- requests originate from the user’s local runtime or a remote runtime controlled by that same user;
- another person’s activity must not trigger requests against the authenticated user’s plan;
- the app must not pool, transfer, resell, or share plan usage or authentication tokens; and
- persistent tokens must remain local and under the user’s control.

For that reason, this branch enables ChatGPT plan usage only as a local development feature for the allowlisted account. The `/embed` Moodle view does not show ChatGPT sign-in controls, and a hosted or iframe request cannot use the local-only ChatGPT provider. See the [Sign in with ChatGPT Terms](https://openai.com/policies/sign-in-with-chatgpt-terms/).

## macOS setup

Run these commands from the repository root:

```bash
npm install
cp .env.example .env.local
npm run rag:import
```

Edit `.env.local` and configure the local ChatGPT provider:

```bash
AI_PROVIDER=chatgpt
CHATGPT_AUTH_ENABLED=true
CHATGPT_LOCAL_ONLY=true
CHATGPT_ALLOWED_EMAIL=your-chatgpt-email@example.com
CHATGPT_ALLOWED_SUBJECT=
CHATGPT_AGENT_NAME=FYEC100 AI Support Assistant
CHATGPT_REDIRECT_URI=http://127.0.0.1:4100/api/auth/chatgpt/callback
CHATGPT_MODEL=
```

Use either `CHATGPT_ALLOWED_EMAIL` or `CHATGPT_ALLOWED_SUBJECT`. Do not leave both blank. The email is used only to restrict the local prototype to your own validated OpenAI identity; it is not sent to the browser by the server except as the connected-account indicator after validation.

Leave `CHATGPT_MODEL` blank to let the app select the first account-visible model from the documented `/v1/models` response. Set it explicitly when you have confirmed the account-specific model slug.

Keep the app open at `http://127.0.0.1:4100/chat` during the first sign-in. The callback URI must use `127.0.0.1`, not `localhost`, and the same URI must be used in both the authorization request and token exchange.

Start the app:

```bash
npm run dev
```

Open `http://127.0.0.1:4100/chat`, select **Continue with ChatGPT**, approve the requested identity and ChatGPT plan permissions, and return to the app. The panel shows the selected provider, connection state, and validated account indicator.

## Credential storage and logout

By default, macOS credentials are stored outside the repository at:

```text
~/.config/fyec100-ai-support/chatgpt-credentials.json
```

Set `CHATGPT_CREDENTIALS_PATH` to an absolute path outside the repository when a different location is required. The app writes the file atomically and attempts owner-only permissions. The path, access token, refresh token, ID token, and authorization URL hints are never returned by an API route or written to application logs.

Sign out from the connection panel. The app stops using the session, attempts OAuth refresh-token revocation, clears local token fields, and removes the opaque browser session cookie. If remote revocation cannot be confirmed, disconnect the app from ChatGPT Settings as recommended by OpenAI.

## Switching providers

Restart the local server after changing `.env.local`:

```bash
# Official OpenAI API billing/account
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Personal ChatGPT plan, local-only
AI_PROVIDER=chatgpt
CHATGPT_AUTH_ENABLED=true
CHATGPT_LOCAL_ONLY=true
CHATGPT_ALLOWED_EMAIL=your-chatgpt-email@example.com

# Future local provider
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

The app never silently switches from ChatGPT to OpenAI, DeepSeek, or Ollama. If ChatGPT authorization is unavailable, the user receives an explicit provider error and must select another provider by changing configuration.

## RAG and academic-support behavior

Provider selection does not replace retrieval. The chat API first resolves the approved course, retrieves matching excerpts from the configured `RAG_DATA_DIR` index plus the existing FYEC100 Markdown knowledge base, and then sends that context through the selected provider.

Refresh the external RAG index after changing `C:\FYEC100 RAG Data` on Windows or the equivalent local folder on macOS:

```bash
RAG_DATA_DIR="/path/to/FYEC100 RAG Data" npm run rag:import
```

Answers retain the existing academic-integrity rules and source-label instruction. If the course sources do not support an answer, the assistant must acknowledge the gap and direct the student to Moodle, the course outline, the lecturer, or the LMS administrator. The Moodle iframe continues to use its existing launch context and course routing; its query-string role context is not treated as authenticated identity.

## Troubleshooting

### The ChatGPT button is disabled

Check that `CHATGPT_AUTH_ENABLED=true`, `CHATGPT_LOCAL_ONLY=true`, one account allowlist value is set, and `CHATGPT_REDIRECT_URI` is exactly the documented loopback path. Restart the Next.js server after changing `.env.local`.

### The callback reports an invalid or expired state

Start again from the same browser at `http://127.0.0.1:4100/chat`. Do not open the callback URL directly, use a different hostname, or run multiple local servers with the same callback port.

### Sign-in succeeds but inference is unavailable

Confirm that the consent screen granted `chatgpt.tokens.use.direct` and `resource.invoke`, that the ChatGPT plan is eligible, and that the account has an available model. If the account model catalog is not usable, set `CHATGPT_MODEL` to a visible model slug from the documented `/v1/models` response.

### The account is rejected

The validated email or subject does not match the local allowlist. Change the allowlist to the intended account, remove the local credential file only if you understand that it will require a new local registration, and sign in again. Never paste a ChatGPT password, browser cookie, access token, or refresh token into `.env.local` or a support ticket.

### OpenAI API and ChatGPT plan usage are different

`OPENAI_API_KEY` is an API credential and may be billable under the OpenAI API account. Sign in with ChatGPT uses an OAuth credential authorized by the user for eligible Responses API requests. The two providers have separate configuration and failure handling.

## Validation and manual actions

Automated checks cover route compilation, TypeScript, linting, provider selection, missing-session behavior, and production build. A real sign-in and inference test requires the account owner to complete the browser consent flow. Do not treat a mocked callback or a successful status page as proof that live inference works.

Recommended local checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
curl http://127.0.0.1:4100/api/auth/chatgpt/status
curl http://127.0.0.1:4100/api/health
```

The manual acceptance sequence is: connect the account, ask a question covered by FYEC100 sources, confirm a source label and grounded content, ask an out-of-scope question, confirm the knowledge-gap response, sign out, and confirm ChatGPT requests are rejected until the account is connected again.

## Institutional deployment boundary

Do not deploy this personal ChatGPT provider behind a public Moodle iframe or use it as a shared student service. A future COSTAATT-hosted version needs an institutionally approved provider and authentication design, such as an approved OpenAI API project with institutional billing and data-processing review, Ollama under approved infrastructure, or another provider approved by IT, governance, privacy, and the course owner. It also needs trusted Moodle/LTI identity and role validation, privacy notices and consent, rate limits, monitoring, retention controls, and a documented student-data handling decision.
