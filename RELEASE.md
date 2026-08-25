# 发版流程

## 版本命名

遵循语义化版本 `主版本.次版本.修订号`（如 `1.0.0`、`1.1.0`、`1.0.1`）：

- **主版本**：重大重构或不兼容变更。
- **次版本**：新增功能（如新模块、新能力）。
- **修订号**：缺陷修复、文案与样式调整。

版本号集中在以下位置，发版时必须保持一致：

| 位置 | 文件 |
| --- | --- |
| 网页主版本 | `js/app.js` → `APP_VERSION` |
| PWA 离线缓存 | `sw.js` → `CACHE_NAME`（格式 `homeroom-workbench-v<版本>`） |
| 桌面端 Electron | `desktop/electron/package.json` → `version` |
| 更新日志 | `CHANGELOG.md` |

版本号会在「设置 → 关于」中展示，用户可在应用内直接核对当前版本。

## 发版步骤

### 1. 更新版本号与更新日志

1. 修改 `js/app.js` 中的 `APP_VERSION`。
2. 同步修改 `sw.js` 中的 `CACHE_NAME`（Service Worker 会自动清理旧缓存）。
3. 桌面端有改动时同步修改 `desktop/electron/package.json` 的 `version`。
4. 在 `CHANGELOG.md` 顶部新增本次版本条目（参考已有格式）。

### 2. 提交

```bash
git add -A
git commit -m "chore: release v1.1.0"
```

### 3. 打标签并推送

```bash
git tag v1.1.0
git push origin main
git push origin v1.1.0
```

标签使用 `v` + 版本号（如 `v1.1.0`），与 `CHANGELOG.md` 中的版本对应。

### 4. 创建 GitHub Release（可选）

```bash
gh release create v1.1.0 --title "班主任工作台 v1.1.0" --notes-file CHANGELOG.md
```

或直接在 GitHub 网页的 Releases 页面根据已推送的 tag 创建。

### 5. 打包桌面端（可选）

按 `desktop/README.md` 的说明打包 Electron 免安装版 exe / zip，产物在 `desktop/electron/dist/`。如发布到 GitHub Release，可把以下产物一并上传：

- `dist/班主任工作台.exe`（免安装便携版）
- `dist/班主任工作台-免安装版.zip`（解压即用版）

## 检查清单

- [ ] 三个版本号位置已同步（app.js / sw.js / electron package.json）
- [ ] `CHANGELOG.md` 已更新
- [ ] 运行回归测试：`node dev/cdp-test.mjs`（需先启动 `cmd /c dev\edge-cdp.cmd`）全部通过
- [ ] `git tag v<版本>` 已推送
- [ ] GitHub Release（如有）已创建并附带打包产物
