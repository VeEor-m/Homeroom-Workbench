@echo off
chcp 65001 >nul
cd /d "%~dp0"

powershell -NoProfile -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Desktop')+'\班主任工作台.lnk'); $s.TargetPath='%~dp0启动班主任工作台.cmd'; $s.WorkingDirectory='%~dp0'; $s.IconLocation='%SystemRoot%\System32\imageres.dll,103'; $s.Description='班主任工作台（桌面版）'; $s.Save()"

echo 桌面快捷方式已创建：班主任工作台
pause
