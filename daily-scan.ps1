# CareerPilot daily scan — run by Windows Task Scheduler
# Scans your portals for new entry-level AI/ML + SDE roles (India + remote).
# Results land in data/pipeline.md. Zero-token: hits ATS APIs directly, no LLM cost.

Set-Location "C:\Projects\CareerPilot"

$stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
Add-Content -Path "scan.log" -Value "===== [$stamp] daily scan start ====="

# Run the scanner; capture stdout+stderr into the log
node scan.mjs *>&1 | Add-Content -Path "scan.log"

$stamp2 = Get-Date -Format "yyyy-MM-dd HH:mm"
Add-Content -Path "scan.log" -Value "===== [$stamp2] daily scan done ====="
Add-Content -Path "scan.log" -Value ""
