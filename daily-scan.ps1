# CareerPilot daily scan — run by Windows Task Scheduler
# Scans your portals for new entry-level AI/ML + SDE roles (India + remote).
# Results land in data/pipeline.md. Zero-token: hits ATS APIs directly, no LLM cost.

Set-Location "C:\Projects\CareerPilot"

# Make the console + Node output pipe through as UTF-8 so emoji/box chars
# land in scan.log intact instead of being mangled by the legacy codepage.
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$env:PYTHONIOENCODING = "utf-8"

$stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
Add-Content -Path "scan.log" -Value "===== [$stamp] daily scan start =====" -Encoding utf8

# Run the scanner; capture stdout+stderr into the log (UTF-8).
node scan.mjs *>&1 | Add-Content -Path "scan.log" -Encoding utf8

$stamp2 = Get-Date -Format "yyyy-MM-dd HH:mm"
Add-Content -Path "scan.log" -Value "===== [$stamp2] daily scan done =====" -Encoding utf8
Add-Content -Path "scan.log" -Value "" -Encoding utf8
