import fs from 'node:fs';

const PORT = 9333;
const BASE = 'file:///C:/Users/Administrator/Documents/Codex/2026-08-24/build-x20/outputs/teacher-workbench/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(r => r.json());
const page = list.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0;
const pending = new Map();
ws.onmessage = e => {
  const m = JSON.parse(e.data);
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
await sleep(1500);

// 用应用内生成器造一份花名册 xlsx，取回 base64
const b64 = await ev(`(async () => {
  const blob = await buildXlsxBlob('花名册', ['姓名','性别','小组'], [['张三','男',1],['李四','女',2]], [12,8,8]);
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let s = '';
  bytes.forEach(b => s += String.fromCharCode(b));
  return btoa(s);
})()`);
fs.writeFileSync('C:/Users/Administrator/Documents/Codex/2026-08-24/build-x20/outputs/teacher-workbench/dev/export-test.xlsx', Buffer.from(b64, 'base64'));
console.log('export-test.xlsx written, size =', fs.statSync('C:/Users/Administrator/Documents/Codex/2026-08-24/build-x20/outputs/teacher-workbench/dev/export-test.xlsx').size);

// 应用内解析回读（自洽）
const roundtrip = await ev(`parseXlsxGrid(Uint8Array.from(atob('${b64}'), c => c.charCodeAt(0)).buffer).then(g => JSON.stringify(g))`);
console.log('app roundtrip:', roundtrip);

const ver = await fetch(`http://127.0.0.1:${PORT}/json/version`).then(r => r.json());
const bws = new WebSocket(ver.webSocketDebuggerUrl);
await new Promise((res, rej) => { bws.onopen = res; bws.onerror = rej; });
bws.send(JSON.stringify({ id: 1, method: 'Browser.close' }));
await sleep(300);
ws.close();
process.exit(0);
