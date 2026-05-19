param(
  [string]$BaseUrl = "http://localhost:4100",
  [int]$Port = 4100
)

$ErrorActionPreference = "Continue"
$checks = @()

function Add-Check {
  param([string]$Name, [bool]$Ok, [string]$Message)
  $script:checks += [PSCustomObject]@{
    Name = $Name
    Status = $(if ($Ok) { "PASS" } else { "REVIEW" })
    Message = $Message
  }
}

$node = Get-Command node -ErrorAction SilentlyContinue
Add-Check "Node.js" ($null -ne $node) $(if ($node) { & node --version } else { "Node.js not found" })

$git = Get-Command git -ErrorAction SilentlyContinue
Add-Check "Git" ($null -ne $git) $(if ($git) { & git --version } else { "Git not found" })

$requiredEnv = @(
  "NEXT_PUBLIC_APP_BASE_URL",
  "MOODLE_ORIGIN",
  "ADMIN_ACCESS_TOKEN",
  "PILOT_MODE",
  "AI_PROVIDER"
)

foreach ($name in $requiredEnv) {
  $value = [Environment]::GetEnvironmentVariable($name)
  Add-Check "Environment: $name" (-not [string]::IsNullOrWhiteSpace($value)) $(if ($value) { "configured" } else { "missing" })
}

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
Add-Check "Port $Port listener" ($null -ne $listener) $(if ($listener) { "listening" } else { "not listening" })

try {
  $health = Invoke-WebRequest -Uri "$BaseUrl/api/health" -UseBasicParsing -TimeoutSec 10
  Add-Check "Health endpoint" ($health.StatusCode -eq 200) "HTTP $($health.StatusCode)"
} catch {
  Add-Check "Health endpoint" $false $_.Exception.Message
}

$checks | Format-Table -AutoSize

if ($checks.Status -contains "REVIEW") {
  exit 1
}
