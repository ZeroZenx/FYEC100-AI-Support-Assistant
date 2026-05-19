# FYEC100 AI Support Assistant Windows VM environment template.
# Copy this file to a secure deployment location and replace placeholders.
# Do not commit real API keys or production secrets.

$env:NEXT_PUBLIC_APP_BASE_URL = "https://fyec100-assistant.example.edu"
$env:MOODLE_ORIGIN = "https://moodle.costaatt.edu.tt"
$env:ADMIN_ACCESS_TOKEN = "replace_with_secure_random_value"
$env:PILOT_MODE = "pilot"

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
$env:PORT = "4100"
