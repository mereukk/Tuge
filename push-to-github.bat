@echo off
cd /d "%~dp0"

echo ========================================
echo   Tuge - Push to GitHub
echo ========================================
echo.

where git >nul 2>&1
if errorlevel 1 (
    echo Git not found. Install from https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

if not exist .git (
    echo Initializing repository...
    git init
    git branch -M main
)

echo Adding and committing...
git add .
git diff --cached --quiet 2>nul || git commit -m "Tuge update"

git remote get-url origin >nul 2>&1 || (
    echo Adding remote: https://github.com/mereukk/Tuge.git
    git remote add origin https://github.com/mereukk/Tuge.git
)

echo Fetching from origin...
git fetch origin
echo.
echo Rebasing onto origin/main...
git rebase origin/main
if errorlevel 1 (
    echo Rebase had conflicts. Trying merge instead...
    git rebase --abort 2>nul
    git pull origin main --allow-unrelated-histories --no-edit
)

echo.
echo Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
    echo.
    echo Push failed. Check the error message above.
    echo.
    pause
    exit /b 1
)

echo.
echo Done. https://github.com/mereukk/Tuge
echo.
pause
