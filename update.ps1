# update.ps1 — bumps the cache version so phones pick up changes, then commits and pushes.
# Run this from inside the bloom-app folder: .\update.ps1

$ErrorActionPreference = "Stop"

# Bump the service worker's cache name so installed phones fetch fresh files
# instead of serving the old cached version.
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
(Get-Content service-worker.js) -replace "const CACHE_NAME = '.*';", "const CACHE_NAME = 'bloom-app-v$timestamp';" |
    Set-Content service-worker.js

$message = Read-Host "Commit message (press Enter to just use 'update')"
if ([string]::IsNullOrWhiteSpace($message)) { $message = "update" }

git add .
git commit -m $message
git push

Write-Host ""
Write-Host "Pushed. GitHub Pages usually takes 1-2 minutes to go live." -ForegroundColor Green
Write-Host "Tip: fully close the app on her phone (swipe it away in the app switcher)" -ForegroundColor Yellow
Write-Host "and reopen it once to make sure it picks up the new version." -ForegroundColor Yellow
