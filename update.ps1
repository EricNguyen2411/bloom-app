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
# $LASTEXITCODE only reflects the most recent native command, so check it
# right after each git call — $ErrorActionPreference does NOT catch a
# failed external command like a bad git push, which is exactly what let
# this script print "Pushed" earlier even though the push was rejected.
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 1) {
    # exit code 1 from `git commit` usually just means "nothing to commit" — fine to continue.
    # Anything else from commit is worth stopping for.
    Write-Host ""
    Write-Host "git commit failed — nothing was pushed. Scroll up for the actual error." -ForegroundColor Red
    exit 1
}

git push
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "PUSH FAILED — nothing new is live. Scroll up to the 'error:' line above for why." -ForegroundColor Red
    Write-Host "This is very likely a non-fast-forward rejection (remote has commits your local copy doesn't)." -ForegroundColor Red
    Write-Host "Fix: run  git pull  first to merge those in, then run .\update.ps1 again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Pushed. GitHub Pages usually takes 1-2 minutes to go live." -ForegroundColor Green
Write-Host "Tip: fully close the app on her phone (swipe it away in the app switcher)" -ForegroundColor Yellow
Write-Host "and reopen it once to make sure it picks up the new version." -ForegroundColor Yellow
