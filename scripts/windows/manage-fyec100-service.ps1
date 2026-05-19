param(
  [ValidateSet("status", "start", "stop", "restart")]
  [string]$Action = "status",
  [string]$ServiceName = "FYEC100AIAssistant"
)

$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

if (-not $service) {
  Write-Warning "Service '$ServiceName' was not found. Confirm the selected Windows service wrapper has created it."
  exit 1
}

switch ($Action) {
  "start" {
    Start-Service -Name $ServiceName
  }
  "stop" {
    Stop-Service -Name $ServiceName
  }
  "restart" {
    Restart-Service -Name $ServiceName
  }
  default {
    $service | Format-List Name, Status, ServiceType, StartType
  }
}
