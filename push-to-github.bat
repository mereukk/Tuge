@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo Git 설치 확인 중...
where git >nul 2>&1
if errorlevel 1 (
    echo Git이 설치되어 있지 않습니다. https://git-scm.com/download/win
    pause
    exit /b 1
)

if not exist .git (
    echo Git 저장소 초기화...
    git init
    git branch -M main
)

echo 파일 추가 및 커밋...
git add .
git diff --cached --quiet 2>nul || git commit -m "뜨개 도안 노트"

git remote get-url origin >nul 2>&1 || (
    echo 원격 저장소 연결: https://github.com/mereukk/Tuge.git
    git remote add origin https://github.com/mereukk/Tuge.git
)

echo GitHub에 푸시 중...
git push -u origin main
if errorlevel 1 (
    echo.
    echo [실패] 푸시가 안 됐어요. 위에 빨간 에러 메시지 확인하세요.
    echo - 로그인 창이 떴으면 GitHub 로그인 후 다시 push-to-github.bat 실행
    echo - 또는 GitHub 웹에서 Add file -^> Upload files 로 직접 올리세요.
    pause
    exit /b 1
)

echo.
echo 완료! https://github.com/mereukk/Tuge
pause
