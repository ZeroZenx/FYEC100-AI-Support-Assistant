param(
  [string]$AppPath = "C:\Apps\FYEC100-AI-Support-Assistant",
  [string]$EnvFile = ".\fyec100-env.example.ps1",
  [string]$ServiceName = "FYEC100AIAssistant"
)

$ErrorActionPreference = "Stop"

Write-Host "FYEC100 AI Support Assistant - Windows service setup"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js was not found in PATH. Install Node.js LTS before continuing."
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git was not found in PATH. Install Git for Windows before continuing."
}

if (-not (Test-Path $AppPath)) {
  throw "Application path was not found: $AppPath"
}

if (Test-Path $EnvFile) {
  . $EnvFile
} else {
  Write-Warning "Environment file not found: $EnvFile. Continuing with existing process environment."
}

Push-Location $AppPath
npm install
npm run build
Pop-Location

Write-Host ""
Write-Host "Build complete."
Write-Host "Recommended service command:"
Write-Host "  npm run start:pilot"
Write-Host ""
Write-Host "Use NSSM, PM2, or approved Windows service tooling to run the command from:"
Write-Host "  $AppPath"
Write-Host ""
Write-Host "After service setup, run:"
Write-Host "  .\test-fyec100-preflight.ps1 -BaseUrl $env:NEXT_PUBLIC_APP_BASE_URL"
