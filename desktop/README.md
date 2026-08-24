# 桌面端

三种桌面使用方式：

## 1. 一键启动器（推荐，无需安装）

双击 `启动班主任工作台.cmd`：

- 自动用 Node（或 Python 兜底）在 `127.0.0.1:8123` 启动本地服务
- 用 Edge「应用模式」打开独立窗口（无浏览器工具栏，像原生应用）
- 数据继续存在浏览器 IndexedDB 中，与之前网页版一致

可再运行 `创建桌面快捷方式.cmd` 在桌面生成快捷方式；`停止服务.cmd` 关闭后台服务。

## 2. PWA 安装版

通过启动器（或任意本地服务器）打开后，在 Edge/Chrome 地址栏右侧点「安装 班主任工作台」，即可像桌面应用一样安装，支持离线打开。

## 3. Electron 打包（生成 exe）

```bash
cd electron
npm install
npm start        # 直接运行（无需复制文件）
```

**打包 exe**：先把网页文件复制进 electron 目录，再打包：

```bash
cd electron
copy ..\index.html .
copy ..\css css /y
copy ..\js js /y
copy ..\assets assets /y
copy ..\manifest.webmanifest .
copy ..\sw.js .
npm run pack     # 生成免安装便携版 exe，产物在 electron/dist/
```

如果首次打包时下载 Electron / NSIS 工具失败（提示缓存目录无权限），先设置可写缓存目录再打包：

```bat
set ELECTRON_CACHE=C:\Users\<你>\homeroom-cache\electron
set ELECTRON_BUILDER_CACHE=C:\Users\<你>\homeroom-cache\builder
set CSC_IDENTITY_AUTO_DISCOVERY=false
npm run pack
```

需要 Node.js 与网络（首次安装 Electron 依赖）。产物 `dist/班主任工作台.exe` 是免安装便携版，双击即用；`dist/班主任工作台-免安装版.zip` 是解压即用版（解压后双击 `班主任工作台.exe`）；`dist/win-unpacked/` 为免打包解压版（整个文件夹可拷走）。

> 说明：`package.json` 中已设置 `signAndEditExecutable: false`（跳过 exe 图标/版本资源写入，避免部分环境打包失败）。如需自定义 exe 图标与版本信息，可删掉该配置后重打。
