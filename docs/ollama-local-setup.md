# Ollama Local Setup

## Purpose

Ollama allows the FYEC100 AI Support Assistant to use a locally hosted model instead of OpenAI. This is useful for private testing and infrastructure evaluation.

## Install Ollama on macOS

```bash
brew install ollama
```

If Homebrew is not available, install Ollama from the official Ollama macOS installer.

## Download a Model

```bash
ollama pull llama3.1
```

Other possible models can be tested later, but `llama3.1` is a reasonable starting point for local pilot testing.

## Start Ollama

```bash
ollama serve
```

Ollama normally listens at:

```text
http://localhost:11434
```

## Configure the App

Create or update `.env.local`:

```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

Restart the app:

```bash
npm run dev
```

## Test the Provider

Use the admin provider test endpoint:

```bash
curl -X POST http://localhost:4100/api/admin/provider-test
```

Expected result:

- `ok` should be `true`
- `provider` should be `ollama`
- `model` should match `OLLAMA_MODEL`
- `responseExcerpt` should contain a short model response

## Notes

- Local model quality depends on the model selected and the machine running it.
- Larger models may need more memory and may respond more slowly.
- The app still uses the FYEC100 knowledge base as context.
- Guardrails remain in the application layer and should not be delegated only to the model.
