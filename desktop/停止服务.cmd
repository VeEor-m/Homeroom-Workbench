@echo off
chcp 65001 >nul
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*server.mjs*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
echo 本地服务已停止。
pause
