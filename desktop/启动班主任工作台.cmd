@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "URL=http://127.0.0.1:8123/index.html"

rem 1) 启动本地服务（Node 优先，Python 兜底；已在运行则自动跳过）
where node >nul 2>nul
if %errorlevel%==0 (
  powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath 'node' -ArgumentList 'server.mjs' -WorkingDirectory '%~dp0' -WindowStyle Hidden"
) else (
  where python >nul 2>nul
  if %errorlevel%==0 (
    powershell -NoProfile -WindowStyle Hidden -Command "Start-Process -FilePath 'python' -ArgumentList '-m','http.server','8123','--directory','..' -WorkingDirectory '%~dp0' -WindowStyle Hidden"
  ) else (
    echo 未找到 Node 或 Python，无法启动本地服务。
    echo 请先安装 Node.js（https://nodejs.org）后重试。
    pause
    exit /b 1
  )
)

timeout /t 1 /nobreak >nul

rem 2) 用 Edge 应用模式打开（独立窗口，无浏览器工具栏）
start "" msedge --app=%URL% 2>nul
if %errorlevel% neq 0 (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=%URL%
)
