import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 8123;
const BASE = `http://127.0.0.1:${PORT}/`;
const CDP_PORT = 9334;

// 1) 启动本地服务
let server = null;
try {
  server = spawn('node', ['server.mjs'], {
    cwd: 'C:/Users/Administrator/Documents/Codex/2026-08-24/build-x20/outputs/teacher-workbench/desktop',
    stdio: 'ignore',
    detached: true,
    windowsHide: true
  });
} catch (e) {
  console.log('server start failed:', e.message);
}
await sleep(1200);

// 2) 检查 HTTP 响应
const checkHttp = async (url) => {
  try {
    const r = await fetch(url);
    return `${r.status} ${r.headers.get('content-type')}`;
  } catch (e) {
    return 'ERR ' + e.message;
  }
};
console.log('GET / ->', await checkHttp(BASE));
console.log('GET manifest ->', await checkHttp(BASE + 'manifest.webmanifest'));
console.log('GET sw.js ->', await checkHttp(BASE + 'sw.js'));

// 3) 启动 Edge 并验证 SW
let edge = null;
try {
  edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-software-rasterizer', '--disable-extensions', '--no-first-run',
    '--user-data-dir=' + process.env.TEMP + '\\tw-pwa-test',
    `--remote-debugging-port=${CDP_PORT}`, 'about:blank'
  ], { stdio: 'ignore', windowsHide: true });
} catch (e) {
  console.log('edge start failed:', e.message);
}
await sleep(2500);

const list = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`).then(r => r.json());
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0;
const pending = new Map();
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.consoleAPICalled' || m.method === 'Runtime.exceptionThrown') {
    console.log('PAGE:', m.method, JSON.stringify(m.params).slice(0, 300));
  }
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
  }
};
const send = (method, params = {}) => new Promise((res, rej) => {
  const mid = ++id;
  pending.set(mid, { res, rej });
  ws.send(JSON.stringify({ id: mid, method, params }));
});
const ev = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) return 'EXC: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result ? r.result.value : undefined;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', { url: BASE });
await sleep(2500);

console.log('manifest link:', await ev(`!!document.querySelector('link[rel="manifest"]')`));
console.log('SW supported:', await ev(`'serviceWorker' in navigator`));
console.log('SW registered:', await ev(`navigator.serviceWorker.getRegistration().then(r => !!r)`));
console.log('wizard rendered:', await ev(`!document.querySelector('#initScreen').hidden`));

// 等待 SW 接管（controller）
await ev(`navigator.serviceWorker.ready.then(() => navigator.serviceWorker.controller || new Promise(r => navigator.serviceWorker.addEventListener('controllerchange', () => r(true))))`);
await sleep(1000);
console.log('controller:', await ev(`navigator.serviceWorker.controller ? 'yes' : 'no'`));
console.log('cache keys:', await ev(`caches.open('homeroom-workbench-v1').then(c => c.keys()).then(ks => ks.map(r => r.url).join('\\n'))`));

// 4) 模拟断网，刷新验证离线可用
await send('Network.enable');
await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
await send('Page.addScriptToEvaluateOnNewDocument', { source: "window.__errs=[];window.addEventListener('error',e=>window.__errs.push('err:'+e.message+' @'+e.filename+':'+e.lineno));window.addEventListener('unhandledrejection',e=>window.__errs.push('rej:'+String(e.reason)));" });
await send('Page.reload', { ignoreCache: false });
await sleep(4000);
console.log('offline reload renders:', await ev(`!!document.querySelector('#initScreen') && !document.querySelector('#initScreen').hidden`));
console.log('offline page title:', await ev(`document.title`));
console.log('offline body length:', await ev(`document.body ? document.body.innerHTML.length : -1`));
console.log('offline AppData:', await ev(`typeof AppData !== 'undefined' ? 'loaded' : 'MISSING'`));
console.log('offline nav items:', await ev(`document.querySelectorAll('.nav-item').length`));
console.log('offline sw controller:', await ev(`navigator.serviceWorker.controller ? 'yes' : 'no'`));
console.log('offline errors:', JSON.stringify(await ev(`window.__errs`)));
console.log('offline resources:', JSON.stringify(await ev(`performance.getEntriesByType('resource').map(e => e.name + ':' + (e.transferSize || 0)).filter(n => n.includes('js/') || n.includes('css/'))`)));
console.log('offline readyState:', await ev(`document.readyState`));
await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });

// 5) 清理本地服务
if (server) {
  try { process.kill(server.pid); } catch (e) { /* 已退出 */ }
}

// 关闭浏览器
const ver = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`).then(r => r.json());
const bws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((res, rej) => { bws.onopen = res; bws.onerror = rej; });
bws.send(JSON.stringify({ id: 1, method: 'Browser.close' }));
await sleep(300);
ws.close();
process.exit(0);
