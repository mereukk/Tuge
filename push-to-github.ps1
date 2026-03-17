# mereukk GitHub에 Tuge 푸시 스크립트
# 사용법: GitHub에 빈 저장소 "Tuge" 생성 후, PowerShell에서 .\push-to-github.ps1 실행

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# 1. GitHub에 새 저장소 만들기: https://github.com/new
#    Repository name: Tuge
#    Public, Create repository (README 추가 안 함)

Write-Host "Git 설치 확인 중..." -ForegroundColor Cyan
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Write-Host "Git이 설치되어 있지 않습니다. https://git-scm.com/download/win 에서 설치 후 다시 실행하세요." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path .git)) {
    Write-Host "Git 저장소 초기화..." -ForegroundColor Cyan
    git init
    git branch -M main
}

Write-Host "파일 추가 및 커밋..." -ForegroundColor Cyan
git add .
git status
$msg = git diff --cached --quiet 2>$null; if ($LASTEXITCODE -ne 0) { git commit -m "뜨개 도안 노트" }

$remote = "https://github.com/mereukk/Tuge.git"
$remotes = git remote 2>$null
if ($remotes -notmatch "origin") {
    Write-Host "원격 저장소 연결: $remote" -ForegroundColor Cyan
    git remote add origin $remote
}

Write-Host "GitHub에 푸시 중..." -ForegroundColor Cyan
git push -u origin main

Write-Host "완료! https://github.com/mereukk/Tuge 에서 확인하세요." -ForegroundColor Green
