@echo off
set "TMPD=%TEMP%\twedge6"
if exist "%TMPD%" rmdir /s /q "%TMPD%"
if not exist "%TMPD%" mkdir "%TMPD%"
start "" /b "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --no-sandbox --disable-gpu --disable-software-rasterizer --disable-extensions --no-first-run --user-data-dir="%TMPD%" --remote-debugging-port=9333 --window-size=1440,900 about:blank
