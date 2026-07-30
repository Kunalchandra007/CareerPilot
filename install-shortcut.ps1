# CareerPilot - desktop shortcut installer.
# Run once (right-click "Run with PowerShell", or:  powershell -ExecutionPolicy Bypass -File install-shortcut.ps1)
# Creates a "CareerPilot" shortcut on your Desktop that launches the app silently
# (via CareerPilot.vbs) and gives it the app icon. Double-click it like any app.

$ErrorActionPreference = "Stop"

$here    = Split-Path -Parent $MyInvocation.MyCommand.Path
$target  = Join-Path $here "CareerPilot.vbs"

if (-not (Test-Path $target)) {
  Write-Host "CareerPilot.vbs not found next to this script. Run it from the CareerPilot folder." -ForegroundColor Red
  exit 1
}

$desktop  = [Environment]::GetFolderPath("Desktop")
$linkPath = Join-Path $desktop "CareerPilot.lnk"

$shell    = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($linkPath)
$shortcut.TargetPath       = "wscript.exe"
$shortcut.Arguments        = '"' + $target + '"'
$shortcut.WorkingDirectory = $here
$shortcut.Description       = "Launch CareerPilot job-search dashboard"

# Use the app icon if present, else fall back to a briefcase system icon.
$icon = Join-Path $here "web\public\favicon.ico"
if (Test-Path $icon) {
  $shortcut.IconLocation = $icon
} else {
  $shortcut.IconLocation = "$env:SystemRoot\system32\imageres.dll,109"
}

$shortcut.Save()

Write-Host "Done. 'CareerPilot' is on your Desktop - double-click it to launch." -ForegroundColor Green
