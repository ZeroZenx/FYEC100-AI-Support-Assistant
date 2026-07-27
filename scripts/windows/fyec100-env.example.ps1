# FYEC100 AI Support Assistant Windows VM environment template.
# Copy this file to a secure deployment location and replace placeholders.
# Do not commit real API keys or production secrets.

$env:NEXT_PUBLIC_APP_BASE_URL = "https://fyec100-assistant.example.edu"
$env:MOODLE_ORIGIN = "https://moodle.costaatt.edu.tt"
$env:MOODLE_INTEGRATION_MODE = "iframe"
$env:PROTECT_ADMIN_ROUTES = "true"
$env:ADMIN_ACCESS_TOKEN = "replace_with_random_value_at_least_32_characters"
$env:ADMIN_SESSION_SECRET = "replace_with_a_different_random_value_32_characters"
$env:PILOT_MODE = "pilot"
$env:STORAGE_ADAPTER = "local"

# Choose one provider: openai, deepseek, or ollama.
$env:AI_PROVIDER = "deepseek"
$env:DEEPSEEK_API_KEY = "your_deepseek_key_here"
$env:DEEPSEEK_MODEL = "deepseek-chat"

# Optional provider alternatives.
$env:OPENAI_API_KEY = ""
$env:OPENAI_MODEL = "gpt-4o-mini"
$env:OLLAMA_BASE_URL = "http://localhost:11434"
$env:OLLAMA_MODEL = "llama3.1"

$env:CHAT_RATE_LIMIT_PER_MINUTE = "12"
$env:FEEDBACK_RATE_LIMIT_PER_MINUTE = "30"
$env:LAUNCH_AUDIT_RATE_LIMIT_PER_MINUTE = "60"
$env:PROVIDER_TEST_RATE_LIMIT_PER_MINUTE = "6"
$env:PROVIDER_TIMEOUT_MS = "30000"
$env:PROVIDER_MAX_OUTPUT_TOKENS = "900"
$env:HEALTH_DETAILS_PUBLIC = "false"
$env:TRUST_PROXY_HEADERS = "true"
$env:HOST = "127.0.0.1"
$env:PORT = "4100"
