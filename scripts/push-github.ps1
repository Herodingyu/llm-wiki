#!/usr/bin/env pwsh
# GitHub Push Script for llm-wiki

$env:CI = 'true'
$env:DEBIAN_FRONTEND = 'noninteractive'
$env:GIT_TERMINAL_PROMPT = '0'
$env:GCM_INTERACTIVE = 'never'
$env:HOMEBREW_NO_AUTO_UPDATE = '1'
$env:GIT_EDITOR = ':'
$env:EDITOR = ':'
$env:VISUAL = ''
$env:GIT_SEQUENCE_EDITOR = ':'
$env:GIT_MERGE_AUTOEDIT = 'no'
$env:GIT_PAGER = 'cat'
$env:PAGER = 'cat'

Set-Location D:\llm-wiki\llm-wiki

# Check status
Write-Host "=== Git Status ===" -ForegroundColor Cyan
$status = git status --short
$count = ($status | Measure-Object).Count
Write-Host "Modified files: $count"

if ($count -eq 0) {
    Write-Host "No changes to commit." -ForegroundColor Yellow
    exit 0
}

# Stage all changes
Write-Host "`n=== Staging Changes ===" -ForegroundColor Cyan
git add .

# Create commit
Write-Host "`n=== Creating Commit ===" -ForegroundColor Cyan
$commitMessage = @"
wiki: batch fill source notes with AI-generated content

- Fill 200+ skeleton source notes with Summary/Key Points/Key Quotes
- Add Key Quotes to 300+ existing source notes
- Complete 47 new concept pages
- Update index.md, log.md, manifest.json
- Fix Obsidian wiki links for 400+ source notes

Stats: 312/558 source notes filled (56%)
"@

git commit -m $commitMessage

# Push to GitHub
Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Cyan
git push origin main

Write-Host "`n=== Done ===" -ForegroundColor Green
