@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Checking Git...
where git >nul 2>&1
if errorlevel 1 (
    echo Git not found. Install from https://git-scm.com/download/win
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

echo Pulling from origin...
git pull origin main --rebase 2>nul
if errorlevel 1 git pull origin main --allow-unrelated-histories --no-edit 2>nul

echo Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
    echo.
    echo Push failed. Check the error message above.
    echo - If login window appeared, sign in and run this bat again.
    echo - Or upload files manually at GitHub: Add file -^> Upload files
    pause
    exit /b 1
)

echo.
echo Done. https://github.com/mereukk/Tuge
pause
