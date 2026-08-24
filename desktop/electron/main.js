'use strict';

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');

function resolveIndex() {
  const candidates = [
    path.join(__dirname, '..', '..', 'index.html'), // 开发：网页文件在 electron 的上一级
    path.join(__dirname, 'index.html')              // 打包：网页文件已复制到本目录
  ];
  return candidates.find(p => fs.existsSync(p)) || candidates[0];
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    title: '班主任工作台',
    autoHideMenuBar: true,
    backgroundColor: '#f2f6f2',
    icon: path.join(__dirname, '..', '..', 'assets', 'icons', 'icon-512.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(resolveIndex());

  // 外部链接用系统浏览器打开
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
