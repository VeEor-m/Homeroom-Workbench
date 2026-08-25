import fs from 'node:fs';

const PORT = 9333;
const BASE = 'file:///C:/Users/Administrator/Documents/Codex/2026-08-24/build-x20/outputs/teacher-workbench/index.html';
const OUT = 'C:/Users/Administrator/Documents/Codex/2026-08-24/build-x20/outputs/teacher-workbench/preview';
fs.mkdirSync(OUT, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.id = 0;
    this.pending = new Map();
  }
  async open() {
    await new Promise((res, rej) => {
      this.ws.onopen = res;
      this.ws.onerror = rej;
    });
    this.ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) {
        const p = this.pending.get(m.id);
        this.pending.delete(m.id);
        m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
      }
    };
  }
  send(method, params = {}) {
    return new Promise((res, rej) => {
      const mid = ++this.id;
      this.pending.set(mid, { res, rej });
      this.ws.send(JSON.stringify({ id: mid, method, params }));
    });
  }
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('JS ERROR: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result ? r.result.value : undefined;
  }
  async shot(name) {
    const r = await this.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, 'base64'));
    console.log('shot:', name);
  }
}

let failures = 0;
function check(label, cond) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + label);
  if (!cond) failures += 1;
}

const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then(r => r.json());
const page = list.find(t => t.type === 'page');
if (!page) throw new Error('no page target');
const cdp = new CDP(page.webSocketDebuggerUrl);
await cdp.open();
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

/* ================= 基础检查 ================= */
await cdp.send('Page.navigate', { url: BASE });
await sleep(1800);

/* ---- 首次打开：初始化向导 ---- */
check('首次打开显示初始化向导', await cdp.eval(`!document.querySelector('#initScreen').hidden`));
await cdp.shot('00-init-wizard');
await cdp.eval(`document.querySelector('#initTeacher').value = '测试老师'`);
await cdp.eval(`document.querySelector('#initNext1').click()`);
await sleep(300);
check('进入第二步', await cdp.eval(`document.querySelector('.step-pane.active').dataset.step === '2'`));
await cdp.eval(`document.querySelector('.init-option[data-opt="demo"]').click()`);
await sleep(250);
check('选中示例数据', await cdp.eval(`document.querySelector('.init-option.selected').dataset.opt === 'demo'`));
await cdp.eval(`document.querySelector('#initNext2').click()`);
await sleep(250);
check('进入确认页', await cdp.eval(`document.querySelector('.step-pane.active').dataset.step === '3'`));
check('确认页显示老师姓名', await cdp.eval(`document.querySelector('#sumTeacher').textContent === '测试老师'`));
await cdp.eval(`document.querySelector('#initFinish').click()`);
await sleep(1200);
check('向导关闭', await cdp.eval(`document.querySelector('#initScreen').hidden`));
check('欢迎语显示老师姓名', await cdp.eval(`document.querySelector('.welcome').textContent.includes('测试老师')`));

/* ---- 新手引导 ---- */
check('新手引导出现', await cdp.eval(`!!document.querySelector('#tourOverlay')`));
check('引导共 5 步', await cdp.eval(`document.querySelectorAll('.tour-dot').length === 5`));
await cdp.eval(`document.querySelector('#tourNext').click()`);
await sleep(500);
check('引导卡片独立定位', await cdp.eval(`getComputedStyle(document.querySelector('#tourCard')).position === 'fixed'`));
check('侧边栏定位不被破坏', await cdp.eval(`getComputedStyle(document.querySelector('#sidebar')).position === 'fixed'`));
check('高亮圈显示', await cdp.eval(`document.querySelector('#tourRing').style.display === 'block'`));
for (let i = 0; i < 3; i += 1) {
  await cdp.eval(`document.querySelector('#tourNext').click()`);
  await sleep(200);
}
check('最后一步为完成', await cdp.eval(`document.querySelector('#tourNext').textContent === '完成'`));
await cdp.eval(`document.querySelector('#tourNext').click()`);
await sleep(300);
check('引导已关闭', await cdp.eval(`!document.querySelector('#tourOverlay')`));
check('引导完成已记录', await cdp.eval(`Store.getRecord('settings').then(s => s.tourDone === true)`));

/* ---- CSV 解析 ---- */
check('CSV 解析 2 人', await cdp.eval(`parseRosterCSV('姓名,性别,小组\\n张三,男,2\\n李四,女,3').length === 2`));
check('CSV 解析姓名正确', await cdp.eval(`parseRosterCSV('姓名,性别,小组\\n张三,男,2').map(s => s.name).join() === '张三'`));

check('导航项 = 7', await cdp.eval(`document.querySelectorAll('.nav-item').length === 7`));
check('工作卡片 = 8', await cdp.eval(`document.querySelectorAll('.work-card').length === 8`));
check('首次播种学生 = 48', await cdp.eval(`Store.getAllStudents().then(a => a.length)`));
check('记录键 = 10', await cdp.eval(`Store.exportData().then(d => Object.keys(d.records).length)`));
await cdp.shot('01-workbench');

/* ---- 使用手册 ---- */
await cdp.eval(`document.querySelector('#manualBtn').click()`);
await sleep(500);
check('使用手册页面', await cdp.eval(`document.querySelector('.page-title').textContent === '使用手册'`));
check('手册包含核心章节', await cdp.eval(`document.querySelector('#content').textContent.includes('快速上手') && document.querySelector('#content').textContent.includes('数据与备份')`));
check('手册目录导航', await cdp.eval(`document.querySelectorAll('.toc-chip').length >= 10`));
await cdp.eval(`document.querySelector('#manualReplayBtn').click()`);
await sleep(500);
check('重播引导并跳转工作台', await cdp.eval(`document.querySelector('.page-title').textContent === '工作台' && !!document.querySelector('#tourOverlay')`));
await cdp.eval(`document.querySelector('#tourSkip').click()`);
await sleep(200);
check('引导可跳过', await cdp.eval(`!document.querySelector('#tourOverlay')`));
await cdp.eval(`location.hash = 'workbench'`);
await sleep(500);
check('返回工作台', await cdp.eval(`document.querySelector('.page-title').textContent === '工作台'`));

/* ---- 今日课程 ---- */
const todayCount = await cdp.eval(`todayCourseCount()`);
check('今日课程节数统计', await cdp.eval(`document.querySelector('#todayCoursesStat strong').textContent.startsWith('${todayCount}')`));
await cdp.eval(`document.querySelector('#todayCoursesStat').click()`);
await sleep(350);
check('今日课程浮层打开', await cdp.eval(`!document.querySelector('#todayPopover').hidden`));
const realDay = await cdp.eval(`'周' + WEEK_CN[new Date().getDay()]`);
check('欢迎语日期实时', await cdp.eval(`document.querySelector('.welcome p').textContent.includes('${realDay}')`));
check('浮层显示今日课程', await cdp.eval(`document.querySelector('#todayPopover').textContent.includes('${realDay}') && document.querySelector('#todayPopover').textContent.includes('数学') && document.querySelector('#todayPopover').textContent.includes('王老师')`));
check('浮层含早读', await cdp.eval(`document.querySelector('#todayPopover').textContent.includes('早读')`));
check('我的课高亮逻辑', await cdp.eval(`buildTodayCourses('张老师').courses.filter(c => c.mine).length >= 1`));
await cdp.eval(`(() => {
  const s = document.querySelector('#todayCoursesStat');
  const p = document.querySelector('#todayPopover');
  s.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
  p.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
})()`);
await sleep(450);
check('从统计移入浮层不关闭', await cdp.eval(`!document.querySelector('#todayPopover').hidden`));
await cdp.eval(`document.querySelector('#todayPopover').dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))`);
await sleep(450);
check('移出浮层后关闭', await cdp.eval(`document.querySelector('#todayPopover').hidden`));
await cdp.eval(`document.querySelector('#todayCoursesStat').click()`);
await sleep(300);
await cdp.eval(`document.querySelector('.welcome-left').click()`);
await sleep(250);
check('点击其他区域关闭浮层', await cdp.eval(`document.querySelector('#todayPopover').hidden`));

/* ---- 待办事项 ---- */
check('初始待办 3 条', await cdp.eval(`document.querySelectorAll('.todo-item').length === 3`));
check('待办计数徽章', await cdp.eval(`document.querySelector('.todo-title .badge').textContent === '3'`));
await cdp.eval(`document.querySelector('#addTodoBtn').click()`);
await sleep(300);
check('待办表单打开', await cdp.eval(`!!document.querySelector('.form-modal')`));
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  m.querySelector('[data-k="text"]').value = '测试待办事项';
  m.querySelector('[data-k="due"]').value = '2026-08-30';
  m.querySelector('[data-k="priority"]').value = '低';
  m.querySelector('[data-save]').click();
})()`);
await sleep(500);
check('新增待办 4 条', await cdp.eval(`document.querySelectorAll('.todo-item').length === 4`));
check('新增内容显示', await cdp.eval(`document.querySelector('.todo-list').textContent.includes('测试待办事项')`));
await cdp.eval(`(() => {
  const items = document.querySelectorAll('.todo-item');
  items[items.length - 1].querySelector('input[type="checkbox"]').click();
})()`);
await sleep(500);
check('完成后待办计数减少', await cdp.eval(`document.querySelector('.todo-title .badge').textContent === '3'`));
check('完成项置灰', await cdp.eval(`document.querySelectorAll('.todo-item.done').length === 1`));
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1500);
check('刷新后待办保留', await cdp.eval(`document.querySelectorAll('.todo-item').length === 4 && document.querySelector('.todo-list').textContent.includes('测试待办事项')`));
check('刷新后完成状态保留', await cdp.eval(`document.querySelectorAll('.todo-item.done').length === 1`));
await cdp.eval(`window.confirm = () => true; document.querySelector('.todo-item.done .todo-del').click()`);
await sleep(500);
check('删除待办生效', await cdp.eval(`document.querySelectorAll('.todo-item').length === 3`));

/* ---- 班级设置（改老师姓名并持久化） ---- */
await cdp.eval(`document.querySelector('#settingsBtn').click()`);
await sleep(400);
check('设置抽屉打开', await cdp.eval(`document.getElementById('app').classList.contains('drawer-open') && document.querySelector('#drawer').textContent.includes('自动备份')`));
await cdp.eval(`document.querySelector('#setTeacher').value = '测试老师2'`);
await cdp.eval(`document.querySelector('#saveInfoBtn').click()`);
await sleep(500);
check('设置保存有提示', await cdp.eval(`document.querySelector('#toast').textContent.includes('已保存')`));
check('欢迎语已更新', await cdp.eval(`document.querySelector('.welcome').textContent.includes('测试老师2')`));
await cdp.eval(`document.querySelector('.drawer-close').click()`);
await sleep(300);
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1500);
check('刷新后老师姓名保留', await cdp.eval(`AppData.settings.teacher === '测试老师2'`));
check('顶栏时间旁不显示 undefined', await cdp.eval(`!document.querySelector('#topDate').textContent.includes('undefined')`));
check('班级名称徽章正确', await cdp.eval(`document.querySelector('#chipClassName').textContent === '初三（2）班'`));

/* ================= 抽屉编辑（考勤） ================= */
await cdp.eval(`document.querySelector('.work-card[data-drawer="attendance"]').click()`);
await sleep(450);
check('考勤抽屉打开', await cdp.eval(`document.getElementById('app').classList.contains('drawer-open')`));
check('迟到名单初始 2 人', await cdp.eval(`document.querySelectorAll('.d-section[data-editor="attendance-late"] .plain-list li').length === 2`));

await cdp.eval(`document.querySelector('#drawerEditBtn').click()`);
await sleep(300);
check('编辑模式已开启', await cdp.eval(`document.querySelector('#drawer .drawer-body').classList.contains('editing')`));
check('出现添加按钮', await cdp.eval(`document.querySelectorAll('.add-item-btn').length >= 3`));

await cdp.eval(`document.querySelector('.d-section[data-editor="attendance-late"] .add-item-btn').click()`);
await sleep(300);
check('表单弹窗打开', await cdp.eval(`!!document.querySelector('.form-modal')`));
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  m.querySelector('[data-k="name"]').value = '不存在的人';
  m.querySelector('[data-k="time"]').value = '08:00';
  m.querySelector('[data-save]').click();
})()`);
await sleep(300);
check('不存在学生被拦截', await cdp.eval(`document.querySelector('.form-modal .form-error').textContent.includes('未找到学生')`));
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  m.querySelector('[data-k="name"]').value = '陈欣怡';
  m.querySelector('[data-save]').click();
})()`);
await sleep(500);
check('迟到名单新增成功', await cdp.eval(`document.querySelector('#drawer').textContent.includes('陈欣怡')`));
check('迟到统计更新为 3', await cdp.eval(`document.querySelectorAll('.d-section[data-editor="attendance-late"] .plain-list li').length === 3`));
await cdp.shot('02-attendance-edit');

await cdp.eval(`document.querySelector('.drawer-close').click()`);
await sleep(300);
await cdp.eval(`document.querySelector('.work-card[data-drawer="discipline"]').click()`);
await sleep(400);
check('编辑状态按面板独立', await cdp.eval(`document.querySelector('#drawerEditBtn').textContent.trim() === '编辑'`));
await cdp.eval(`document.querySelector('.drawer-close').click()`);
await sleep(300);
await cdp.eval(`state.drawerEditingKey = null`);

/* ---- 早读点名 ---- */
await cdp.eval(`document.querySelector('.work-card[data-drawer="attendance"]').click()`);
await sleep(400);
check('考勤抽屉含点名按钮', await cdp.eval(`!!document.querySelector('#rollcallBtn')`));
await cdp.eval(`document.querySelector('#rollcallBtn').click()`);
await sleep(450);
check('点名界面显示 48 人', await cdp.eval(`document.querySelectorAll('.roll-row').length === 48`));
check('初始状态来自记录（王梓涵迟到）', await cdp.eval(`document.querySelector('.roll-row[data-sid="s02"] .roll-status').textContent === '迟到'`));
await cdp.eval(`(() => { const r = document.querySelector('.roll-row[data-sid="s37"]'); for (let i = 0; i < 3; i++) r.click(); })()`);
await sleep(200);
check('点 3 次由迟到回到“到”', await cdp.eval(`document.querySelector('.roll-row[data-sid="s37"]').dataset.status === 'present'`));
await cdp.eval(`(() => { const r = document.querySelector('.roll-row[data-sid="s05"]'); for (let i = 0; i < 3; i++) r.click(); })()`);
await sleep(200);
await cdp.eval(`document.querySelector('.roll-row[data-sid="s01"]').click()`);
await sleep(200);
check('张明轩标记为迟到', await cdp.eval(`document.querySelector('.roll-row[data-sid="s01"]').dataset.status === 'late'`));
check('点名汇总更新', await cdp.eval(`document.querySelector('#rollSummary').textContent.includes('迟到 2')`));
await cdp.eval(`document.querySelector('#rollSave').click()`);
await sleep(700);
check('点名保存后抽屉重开', await cdp.eval(`document.querySelector('#drawer').textContent.includes('迟到名单')`));
check('迟到名单已更新', await cdp.eval(`document.querySelector('#drawer').textContent.includes('张明轩') && !document.querySelector('#drawer').textContent.includes('刘浩然')`));
check('出勤统计更新为 46', await cdp.eval(`document.querySelector('#drawer').textContent.includes('出勤 46/48')`));
await cdp.eval(`document.querySelector('.drawer-close').click()`);
await sleep(300);
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1500);
await cdp.eval(`document.querySelector('.work-card[data-drawer="attendance"]').click()`);
await sleep(400);
check('点名结果持久化', await cdp.eval(`document.querySelector('#drawer').textContent.includes('张明轩') && !document.querySelector('#drawer').textContent.includes('刘浩然')`));
await cdp.eval(`document.querySelector('.drawer-close').click()`);
await sleep(300);

/* ================= 座位表编辑 ================= */
await cdp.eval(`location.hash = 'seating'`);
await sleep(900);
check('座位总数 = 48', await cdp.eval(`document.querySelectorAll('.seat').length === 48`));

await cdp.eval(`document.querySelector('#seatEditBtn').click()`);
await sleep(400);
check('编辑模式开启', await cdp.eval(`!!document.querySelector('.edit-bar')`));
await cdp.shot('03-seating-edit-mode');

/* 修改学生姓名 */
await cdp.eval(`document.querySelector('.seat[data-sid="s01"]').click()`);
await sleep(300);
check('学生编辑表单打开', await cdp.eval(`!!document.querySelector('.form-modal')`));
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  m.querySelector('[data-k="name"]').value = '张明轩测试';
  m.querySelector('[data-save]').click();
})()`);
await sleep(500);
check('姓名修改生效', await cdp.eval(`document.querySelector('.seat[data-sid="s01"] .seat-name').textContent === '张明轩测试'`));
await cdp.shot('04-student-edit-form');

/* 新增学生（无空位 → 未安排） */
await cdp.eval(`document.querySelector('#addStudentBtn').click()`);
await sleep(300);
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  m.querySelector('[data-k="name"]').value = '测试新生';
  m.querySelector('[data-save]').click();
})()`);
await sleep(500);
check('新增学生后共 49 人', await cdp.eval(`Store.getAllStudents().then(a => a.length === 49)`));
check('未安排面板出现', await cdp.eval(`document.querySelector('.unseated-panel').textContent.includes('测试新生')`));

/* 移动 / 互换：点 s01 再点 s02 → 互换 */
await cdp.eval(`document.querySelector('#moveBtn').click()`);
await sleep(300);
await cdp.eval(`document.querySelector('.seat[data-sid="s01"]').click()`);
await sleep(250);
check('移动模式已选中源座位', await cdp.eval(`!!document.querySelector('.seat.move-source')`));
await cdp.eval(`document.querySelector('.seat[data-sid="s02"]').click()`);
await sleep(500);
check('互换生效 s01 移至第1排第2列', await cdp.eval(`(() => {
  const el = document.querySelector('.seat[data-sid="s01"]');
  return el && el.dataset.row === '1' && el.dataset.col === '2';
})()`));
check('互换生效 s02 移至第1排第1列', await cdp.eval(`(() => {
  const el = document.querySelector('.seat[data-sid="s02"]');
  return el && el.dataset.row === '1' && el.dataset.col === '1';
})()`));

/* 移除座位（周雨桐 s47） */
await cdp.eval(`document.querySelector('#moveBtn').click()`);
await sleep(250);
await cdp.eval(`document.querySelector('.seat[data-sid="s47"]').click()`);
await sleep(300);
check('周雨桐编辑表单', await cdp.eval(`!!document.querySelector('#unseatBtn')`));
await cdp.eval(`document.querySelector('#unseatBtn').click()`);
await sleep(500);
check('周雨桐已移除座位', await cdp.eval(`document.querySelector('.unseated-panel').textContent.includes('周雨桐')`));

/* 删除学生（周雨桐） */
await cdp.eval(`window.confirm = () => true; document.querySelector('.unseated-chip[data-sid="s47"]').click()`);
await sleep(300);
await cdp.eval(`document.querySelector('#delStudentBtn').click()`);
await sleep(500);
check('删除后学生 = 48', await cdp.eval(`Store.getAllStudents().then(a => a.length === 48)`));
check('周雨桐已删除', await cdp.eval(`Store.getAllStudents().then(a => !a.some(s => s.name === '周雨桐'))`));
await cdp.shot('05-seating-after-edit');

/* 刷新页面后数据仍在（IndexedDB 持久化） */
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1600);
check('刷新后仍在座次表页', await cdp.eval(`document.querySelector('.page-title').textContent === '座次表'`));
check('刷新后互换保留 s01 第1排第2列', await cdp.eval(`(() => {
  const el = document.querySelector('.seat[data-sid="s01"]');
  return el && el.dataset.row === '1' && el.dataset.col === '2';
})()`));
check('刷新后学生 = 48', await cdp.eval(`Store.getAllStudents().then(a => a.length === 48)`));
await cdp.eval(`document.querySelector('#seatEditBtn').click()`);
await sleep(350);
check('刷新后未安排面板保留', await cdp.eval(`document.querySelector('.unseated-panel').textContent.includes('测试新生')`));
await cdp.eval(`(() => { const i = document.querySelector('#seatSearch'); i.value = 'zmx'; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await sleep(400);
check('座位表拼音搜索', await cdp.eval(`document.querySelector('#seatSearchCount').textContent.includes('1 名') && document.querySelector('.seat.found .seat-name').textContent === '张明轩测试'`));
await cdp.eval(`(() => { const i = document.querySelector('#seatSearch'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await sleep(300);

/* ---- 座位布局调整 ---- */
await cdp.eval(`window.confirm = () => true`);
await cdp.eval(`(() => {
  const r = document.querySelector('#rowDimSel');
  const c = document.querySelector('#colDimSel');
  r.value = '5';
  c.value = '7';
  document.querySelector('#applyDimsBtn').click();
})()`);
await sleep(700);
check('布局调整为 5×7', await cdp.eval(`document.querySelectorAll('.seat').length === 35`));
check('超范围学生转未安排', await cdp.eval(`(() => {
  const expect = D.students().filter(s => !s.row || s.row > 5 || s.col > 7).length;
  const chips = document.querySelectorAll('.unseated-chip').length;
  return chips === expect && expect > 0;
})()`));
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1800);
check('布局调整持久化', await cdp.eval(`document.querySelectorAll('.seat').length === 35`));
await cdp.eval(`document.querySelector('#seatEditBtn').click()`);
await sleep(300);
await cdp.eval(`window.confirm = () => true`);
await cdp.eval(`(() => {
  const r = document.querySelector('#rowDimSel');
  const c = document.querySelector('#colDimSel');
  r.value = '6';
  c.value = '8';
  document.querySelector('#applyDimsBtn').click();
})()`);
await sleep(700);
check('恢复 6×8', await cdp.eval(`document.querySelectorAll('.seat').length === 48`));

/* ================= 花名册 ================= */
await cdp.eval(`location.hash = 'roster'`);
await sleep(900);
check('花名册页面', await cdp.eval(`document.querySelector('.page-title').textContent === '花名册'`));
check('花名册 48 行', await cdp.eval(`document.querySelectorAll('.roster-table tbody tr').length === 48`));
check('统计栏显示人数', await cdp.eval(`document.querySelector('.roster-stats').textContent.includes('48')`));
check('学籍号已生成', await cdp.eval(`document.querySelector('.roster-table tbody tr td strong').textContent.startsWith('2026')`));
check('联系电话复制按钮', await cdp.eval(`document.querySelectorAll('.roster-table .copy-phone').length === D.students().filter(s => s.phone).length`));
await cdp.shot('10-roster');
await cdp.eval(`(() => { const i = document.querySelector('#rosterSearch'); i.value = '张明轩'; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await sleep(400);
check('搜索筛选学生', await cdp.eval(`document.querySelectorAll('.roster-table tbody tr').length === 1 && document.querySelector('.roster-table').textContent.includes('张明轩')`));
await cdp.eval(`(() => { const i = document.querySelector('#rosterSearch'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await sleep(300);
await cdp.eval(`(() => { const i = document.querySelector('#rosterSearch'); i.value = 'wzh'; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await sleep(400);
check('花名册拼音搜索', await cdp.eval(`document.querySelectorAll('.roster-table tbody tr').length === 1 && document.querySelector('.roster-table').textContent.includes('王梓涵')`));
await cdp.eval(`(() => { const i = document.querySelector('#rosterSearch'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await sleep(300);
await cdp.eval(`document.querySelector('#rosterGroupChips .gchip[data-group="2"]').click()`);
await sleep(300);
check('小组筛选 6 人', await cdp.eval(`document.querySelectorAll('.roster-table tbody tr').length === 6`));
await cdp.eval(`document.querySelector('#rosterGroupChips .gchip[data-group="0"]').click()`);
await sleep(300);
await cdp.eval(`document.querySelector('.roster-table tbody tr[data-sid="s02"] [data-edit]').click()`);
await sleep(300);
check('学生表单打开', await cdp.eval(`!!document.querySelector('.form-modal')`));
await cdp.eval(`(() => { const m = document.querySelector('.form-modal'); m.querySelector('[data-k="stuNo"]').value = '20269999'; m.querySelector('[data-save]').click(); })()`);
await sleep(500);
check('学籍号修改生效', await cdp.eval(`document.querySelector('.roster-table tbody tr[data-sid="s02"] td strong').textContent === '20269999'`));
await cdp.eval(`document.querySelector('#rosterAddBtn').click()`);
await sleep(300);
await cdp.eval(`(() => { const m = document.querySelector('.form-modal'); m.querySelector('[data-k="name"]').value = '花名册测试'; m.querySelector('[data-k="stuNo"]').value = ''; m.querySelector('[data-save]').click(); })()`);
await sleep(500);
check('新增后 49 人', await cdp.eval(`document.querySelectorAll('.roster-table tbody tr').length === 49`));
const newSid = await cdp.eval(`Store.getAllStudents().then(a => a.find(s => s.name === '花名册测试').id)`);
await cdp.eval(`window.confirm = () => true; document.querySelector('.roster-table tbody tr[data-sid="${newSid}"] [data-del]').click()`);
await sleep(500);
check('删除后恢复 48 人', await cdp.eval(`document.querySelectorAll('.roster-table tbody tr').length === 48`));
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1800);
check('刷新后仍在花名册', await cdp.eval(`document.querySelector('.page-title').textContent === '花名册'`));
check('学籍号修改持久化', await cdp.eval(`document.querySelector('.roster-table tbody tr[data-sid="s02"] td strong').textContent === '20269999'`));

/* ================= 作业管理 ================= */
await cdp.eval(`location.hash = 'workbench'`);
await sleep(800);
await cdp.eval(`document.querySelector('.work-card[data-drawer="homework"]').click()`);
await sleep(450);
await cdp.eval(`state.drawerEditingKey = null`);
await cdp.eval(`document.querySelector('#drawerEditBtn').click()`);
await sleep(300);
await cdp.eval(`document.querySelector('.d-section[data-editor="homework"] .mini-table tbody tr td .btn').click()`);
await sleep(300);
check('作业管理弹窗', await cdp.eval(`document.querySelector('.form-card').textContent.includes('未交名单')`));
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  m.querySelector('#hwName').value = '不存在的人';
  m.querySelector('#hwAdd').click();
})()`);
await sleep(300);
check('作业不存在学生被拦截', await cdp.eval(`document.querySelector('.form-modal .form-error').textContent.includes('未找到学生')`));
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  m.querySelector('#hwName').value = '王梓';
  m.querySelector('#hwName').dispatchEvent(new Event('input', { bubbles: true }));
})()`);
await sleep(300);
check('作业姓名联想出现', await cdp.eval(`document.querySelectorAll('.student-suggest.show button').length >= 1`));
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  const btn = [...m.querySelectorAll('.student-suggest.show button')].find(b => b.dataset.name === '王梓涵');
  btn.click();
  m.querySelector('#hwAdd').click();
  m.querySelector('#hwDone').click();
})()`);
await sleep(600);
check('未交名单新增成功', await cdp.eval(`document.querySelector('#drawer').textContent.includes('王梓涵')`));
check('收缴率自动重算', await cdp.eval(`document.querySelector('#drawer').textContent.includes('91.7%')`));
await cdp.shot('06-homework-edit');
await cdp.eval(`document.querySelector('.drawer-close').click()`);
await sleep(300);

/* ================= 导出 / 导入 ================= */
check('导出数据含 48 名学生', await cdp.eval(`Store.exportData().then(d => d.students.length === 48)`));
const importName = await cdp.eval(`Store.exportData().then(d => {
  d.students[0].name = '导入测试';
  return Store.importData(d).then(() => 'ok');
})`);
check('导入接口可用', importName === 'ok');
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1500);
check('导入后首名学生已更新', await cdp.eval(`Store.getAllStudents().then(a => a[0].name === '导入测试')`));

/* ================= 自动备份 / 恢复 ================= */
const backupBefore = await cdp.eval(`Store.getBackups().then(b => b.length)`);
await cdp.eval(`document.querySelector('#settingsBtn').click()`);
await sleep(400);
check('设置抽屉含备份记录区', await cdp.eval(`!!document.querySelector('#backupList')`));
await cdp.eval(`document.querySelector('#backupNowBtn').click()`);
await sleep(600);
check('本地备份已创建', await cdp.eval(`Store.getBackups().then(b => b.length === ${backupBefore} + 1)`));
check('备份列表已渲染', await cdp.eval(`document.querySelectorAll('.backup-item').length === ${backupBefore} + 1`));
check('上次备份时间已更新', await cdp.eval(`document.querySelector('#backupLast').textContent.includes('上次备份')`));
check('备份包含 48 名学生', await cdp.eval(`Store.getBackups().then(b => b[0].students.length === 48)`));

/* 恢复备份 */
await cdp.eval(`Store.getAllStudents().then(async a => { a[0].name = '临时改名'; await Store.putStudent(a[0]); })`);
check('临时改名生效', await cdp.eval(`Store.getAllStudents().then(a => a[0].name === '临时改名')`));
check('从备份恢复', await cdp.eval(`Store.getBackups().then(async b => { await Store.restoreBackup(b[0].id); return 'ok'; })`) === 'ok');
check('恢复后姓名还原', await cdp.eval(`Store.getAllStudents().then(a => a[0].name === '导入测试')`));

/* 自动备份：把上次备份时间改成两天前，刷新后应自动再备份 */
await cdp.eval(`Store.getRecord('settings').then(async s => {
  s.backup.lastBackup = new Date(Date.now() - 2 * 86400000).toISOString();
  await Store.putRecord('settings', s);
})`);
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(2000);
check('打开应用自动备份', await cdp.eval(`Store.getBackups().then(b => b.length === ${backupBefore} + 2)`));
check('自动备份提示', await cdp.eval(`document.querySelector('#toast') && document.querySelector('#toast').textContent.includes('自动备份')`));
check('自动备份时间已刷新', await cdp.eval(`Store.getRecord('settings').then(s => Date.now() - new Date(s.backup.lastBackup).getTime() < 60000)`));

/* ================= 平板响应式 ================= */
await cdp.send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
await cdp.send('Page.navigate', { url: BASE });
await sleep(1500);
check('平板下菜单按钮可见', await cdp.eval(`getComputedStyle(document.querySelector('.menu-btn')).display === 'grid'`));
check('平板下首页单列', await cdp.eval(`getComputedStyle(document.querySelector('.home-sections')).gridTemplateColumns.split(' ').length === 1`));
check('平板下侧栏默认隐藏', await cdp.eval(`getComputedStyle(document.querySelector('.sidebar')).transform !== 'none'`));
await cdp.shot('07-tablet-workbench');
await cdp.eval(`document.querySelector('.menu-btn').click()`);
await sleep(450);
check('点击菜单后侧栏展开', await cdp.eval(`getComputedStyle(document.querySelector('.sidebar')).transform === 'none'`));
await cdp.eval(`location.hash = 'seating'`);
await sleep(800);
check('平板下座位图无横向溢出', await cdp.eval(`document.querySelector('.seat-map-wrap').scrollWidth <= document.querySelector('.seat-map-wrap').clientWidth + 1`));
await cdp.shot('08-tablet-seating');

/* ================= 兼容：设置缺班级名时自动修复 ================= */
await cdp.eval(`Store.getRecord('settings').then(async s => { delete s.className; await Store.putRecord('settings', s); })`);
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1800);
check('缺班级名不再显示 undefined', await cdp.eval(`!document.querySelector('#topDate').textContent.includes('undefined')`));
check('班级名自动补全', await cdp.eval(`document.querySelector('#chipClassName').textContent === '初三（2）班'`));
check('修复已持久化', await cdp.eval(`Store.getRecord('settings').then(s => s.className === '初三（2）班')`));

/* ================= 课程表 ================= */
await cdp.eval(`location.hash = 'schedule'`);
await sleep(900);
check('课程表页面', await cdp.eval(`document.querySelector('.page-title').textContent === '课程表'`));
check('课程格 45 个', await cdp.eval(`document.querySelectorAll('.sc-cell').length === 45`));
check('任课教师信息展示', await cdp.eval(`document.querySelectorAll('.teacher-chip').length >= 8`));
check('调课记录展示', await cdp.eval(`document.querySelectorAll('.adjust-item').length >= 1`));
await cdp.shot('09-schedule');

/* 编辑课程格 */
await cdp.eval(`document.querySelector('#scheduleEditBtn').click()`);
await sleep(300);
check('课程表编辑模式', await cdp.eval(`document.querySelectorAll('.sc-cell.editable').length === 45`));
await cdp.eval(`document.querySelector('.sc-cell[data-key="周一-第1节"]').click()`);
await sleep(300);
check('课程编辑表单打开', await cdp.eval(`!!document.querySelector('.form-modal')`));
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  m.querySelector('[data-k="subject"]').value = '英语';
  m.querySelector('[data-k="teacher"]').value = '测试英语老师';
  m.querySelector('[data-save]').click();
})()`);
await sleep(500);
check('课程修改生效', await cdp.eval(`document.querySelector('.sc-cell[data-key="周一-第1节"] .sc-subject').textContent === '英语'`));
check('任课教师自动更新', await cdp.eval(`document.querySelector('.teacher-chips').textContent.includes('测试英语老师')`));

/* 添加调课记录 */
await cdp.eval(`document.querySelector('#addAdjustBtn').click()`);
await sleep(300);
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  m.querySelector('[data-k="date"]').value = '09-25';
  m.querySelector('[data-k="from"]').value = '周五 第1节';
  m.querySelector('[data-k="to"]').value = '周五 第5节';
  m.querySelector('[data-k="subject"]').value = '数学';
  m.querySelector('[data-k="reason"]').value = '测试调课';
  m.querySelector('[data-save]').click();
})()`);
await sleep(500);
check('调课记录新增', await cdp.eval(`document.querySelector('.adjust-list').textContent.includes('测试调课')`));

/* 持久化 */
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1800);
check('刷新后仍在课程表', await cdp.eval(`document.querySelector('.page-title').textContent === '课程表'`));
check('课程修改持久化', await cdp.eval(`document.querySelector('.sc-cell[data-key="周一-第1节"] .sc-subject').textContent === '英语'`));
check('调课记录持久化', await cdp.eval(`document.querySelector('.adjust-list').textContent.includes('测试调课')`));

/* ================= 课程表导入 ================= */
check('CSV 解析日期列', await cdp.eval(`parseScheduleCSV('时段,周一,周二\\n早读,语文,英语\\n第1节,数学/王老师,物理').days.length === 2`));
check('CSV 解析科目教师', await cdp.eval(`parseScheduleCSV('时段,周一,周二\\n早读,语文,英语\\n第1节,数学/王老师,物理').cells['周一-第1节'].teacher === '王老师'`));
check('JSON 解析课程表', await cdp.eval(`parseScheduleJSON(JSON.stringify({ days: ['周一'], periods: ['第1节'], cells: { '周一-第1节': { subject: '数学', teacher: '王老师' } } })).days.length === 1`));

const csvPath = 'C:/Users/Administrator/Documents/Codex/2026-08-24/build-x20/outputs/teacher-workbench/dev/sched-import-test.csv';
fs.writeFileSync(csvPath, [
  '时段,周一,周二,周三,周四,周五',
  '早读,语文,英语,语文,英语,语文',
  '第1节,数学/王老师,物理,英语,数学,语文',
  '第2节,英语,数学,数学,语文,英语',
  '第3节,物理,化学,语文,数学,化学',
  '第4节,体育,英语,体育,英语,数学',
  '第5节,化学,语文,物理,化学,体育',
  '第6节,数学,体育,英语,体育,物理',
  '第7节,班会,历史,道德与法治,历史,班会',
  '第8节,劳动,音乐,美术,自习,劳动'
].join('\n'));

await cdp.eval(`document.querySelector('#scheduleImportBtn').click()`);
await sleep(300);
check('导入弹窗打开', await cdp.eval(`!!document.querySelector('#schedFile')`));
await cdp.send('DOM.enable');
const schedDoc = await cdp.send('DOM.getDocument');
const schedNode = await cdp.send('DOM.querySelector', { nodeId: schedDoc.root.nodeId, selector: '#schedFile' });
await cdp.send('DOM.setFileInputFiles', { nodeId: schedNode.nodeId, files: [csvPath] });
await sleep(900);
check('导入解析状态', await cdp.eval(`document.querySelector('#schedImportStatus').textContent.includes('已解析')`));
await cdp.eval(`document.querySelector('#schedImportConfirm').click()`);
await sleep(600);
check('导入后单元格更新', await cdp.eval(`document.querySelector('.sc-cell[data-key="周一-第1节"] .sc-subject').textContent === '数学'`));
check('导入后教师更新', await cdp.eval(`document.querySelector('.sc-cell[data-key="周一-第1节"] .sc-teacher').textContent === '王老师'`));
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1800);
check('导入结果持久化', await cdp.eval(`document.querySelector('.sc-cell[data-key="周一-第1节"] .sc-subject').textContent === '数学'`));

/* ================= 成绩分析 ================= */
await cdp.eval(`location.hash = 'grades'`);
await sleep(900);
check('成绩分析页面', await cdp.eval(`document.querySelector('.page-title').textContent === '成绩分析'`));
check('统计卡片 6 个', await cdp.eval(`document.querySelectorAll('.stat').length === 6`));
const gradeRowExpected = await cdp.eval(`D.students().filter(s => D.grades().exams[0].scores[s.id]).length`);
check('排名表行数与有成绩学生一致', await cdp.eval(`document.querySelectorAll('.grade-rank tbody tr').length === ${gradeRowExpected}`));
check('分数分布 5 段', await cdp.eval(`document.querySelectorAll('.dist-row').length === 5`));
check('平均分显示正常', await cdp.eval(`(() => { const v = Number(document.querySelector('.stat.ok strong').textContent); return v > 0 && v < 1000; })()`));
await cdp.shot('11-grades');
await cdp.eval(`(() => { const s = document.querySelector('#gradeSubjectSel'); s.value = '语文'; s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
await sleep(400);
check('切换科目后排名更新', await cdp.eval(`document.querySelector('.grade-rank .d-section-head h3').textContent.includes('语文') && document.querySelectorAll('.grade-rank tbody tr').length === ${gradeRowExpected}`));
await cdp.eval(`document.querySelector('#gradeAddExamBtn').click()`);
await sleep(300);
await cdp.eval(`(() => { const m = document.querySelector('.form-modal'); m.querySelector('[data-k="name"]').value = '测试考试'; m.querySelector('[data-save]').click(); })()`);
await sleep(500);
check('新建考试成功', await cdp.eval(`document.querySelector('#gradeExamSel').textContent.includes('测试考试')`));
await cdp.eval(`document.querySelector('#gradeEditBtn').click()`);
await sleep(300);
await cdp.eval(`document.querySelector('.grade-rank tbody tr[data-sid="s02"]').click()`);
await sleep(400);
check('录入抽屉打开', await cdp.eval(`document.querySelector('#drawer').textContent.includes('录入成绩')`));
await cdp.eval(`(() => { const i = document.querySelector('[data-subj="语文"]'); i.value = '100'; document.querySelector('#gradeSaveBtn').click(); })()`);
await sleep(600);
check('成绩已保存', await cdp.eval(`D.grades().exams.find(e => e.name === '测试考试').scores.s02.语文 === 100`));
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1800);
await cdp.eval(`location.hash = 'grades'`);
await sleep(800);
await cdp.eval(`(() => { const s = document.querySelector('#gradeExamSel'); s.value = [...s.options].find(o => o.textContent === '测试考试').value; s.dispatchEvent(new Event('change', { bubbles: true })); })()`);
await sleep(400);
check('成绩录入持久化', await cdp.eval(`D.grades().exams.find(e => e.name === '测试考试').scores.s02.语文 === 100`));
await cdp.eval(`window.confirm = () => true; document.querySelector('#gradeDelExamBtn').click()`);
await sleep(500);
check('删除考试成功', await cdp.eval(`!document.querySelector('#gradeExamSel').textContent.includes('测试考试')`));

/* ================= 值日表 ================= */
await cdp.eval(`location.hash = 'duty'`);
await sleep(900);
check('值日表页面', await cdp.eval(`document.querySelector('.page-title').textContent === '值日表'`));
check('周一到周五 5 列', await cdp.eval(`document.querySelectorAll('.duty-day').length === 5`));
check('每天 6 人', await cdp.eval(`document.querySelectorAll('.duty-day:first-child .duty-row').length === 6`));
check('任务分工显示', await cdp.eval(`document.querySelector('.duty-day').textContent.includes('扫地')`));
await cdp.shot('12-duty');
await cdp.eval(`document.querySelector('[data-check="2026-08-24"]').click()`);
await sleep(300);
check('打卡表单打开', await cdp.eval(`!!document.querySelector('.form-modal')`));
await cdp.eval(`(() => { const m = document.querySelector('.form-modal'); m.querySelector('[data-k="note"]').value = '全部完成'; m.querySelector('[data-save]').click(); })()`);
await sleep(500);
check('打卡成功标记', await cdp.eval(`document.querySelector('[data-check="2026-08-24"]').textContent === '取消打卡'`));
await cdp.send('Page.reload', { ignoreCache: true });
await sleep(1800);
await cdp.eval(`location.hash = 'duty'`);
await sleep(800);
check('打卡持久化', await cdp.eval(`document.querySelector('[data-check="2026-08-24"]').textContent === '取消打卡'`));
await cdp.eval(`document.querySelector('#dutyEditBtn').click()`);
await sleep(300);
await cdp.eval(`document.querySelector('[data-editday="周三"]').click()`);
await sleep(300);
check('名单选择器打开', await cdp.eval(`!!document.querySelector('.duty-picker')`));
await cdp.eval(`(() => {
  const chips = document.querySelectorAll('.duty-pick-chip');
  const click = n => { const c = [...chips].find(x => x.dataset.name === n); if (c) c.click(); };
  click('马俊杰'); click('朱晓琳'); click('沈梦瑶'); click('测试新生');
  document.querySelector('#dutyPickSave').click();
})()`);
await sleep(500);
check('周三名单更新', await cdp.eval(`(() => {
  const a = D.duty().weeks.find(w => w.weekStart === '2026-08-24').assigned.周三;
  return a.length === 6 && a.includes('沈梦瑶') && a.includes('测试新生') && !a.includes('马俊杰');
})()`));
check('复制按钮存在', await cdp.eval(`!!document.querySelector('#dutyCopyBtn')`));
await cdp.eval(`document.querySelector('#dutyAutoBtn').click()`);
await sleep(500);
check('自动排班增加周次', await cdp.eval(`D.duty().weeks.length > 1`));

/* ================= 班委名单 ================= */
await cdp.eval(`location.hash = 'committee'`);
await sleep(900);
check('班委名单页面', await cdp.eval(`document.querySelector('.page-title').textContent === '班委名单'`));
check('职务卡片渲染', await cdp.eval(`document.querySelectorAll('.role-card').length >= 9`));
const oldLeader = await cdp.eval(`D.students().find(s => s.role === '班长').name`);
check('班长显示现任', await cdp.eval(`document.querySelector('.role-card .role-incumbent').textContent === '${oldLeader}'`));
await cdp.shot('13-committee');
await cdp.eval(`document.querySelector('#committeeChangeBtn').click()`);
await sleep(300);
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  const role = m.querySelector('[data-k="role"]');
  role.value = [...role.options].find(o => o.textContent === '班长').value;
  m.querySelector('[data-k="name"]').value = '王梓涵';
  m.querySelector('[data-save]').click();
})()`);
await sleep(500);
check('换届后班长更新', await cdp.eval(`D.studentByName()['王梓涵'].role === '班长'`));
check('原班长职务清空', await cdp.eval(`D.studentByName()['${oldLeader}'].role === ''`));
check('换届记录生成', await cdp.eval(`D.committee().changes.some(x => x.role === '班长' && x.name === '王梓涵')`));
await cdp.eval(`document.querySelector('#committeeAssessBtn').click()`);
await sleep(300);
await cdp.eval(`(() => {
  const m = document.querySelector('.form-modal');
  m.querySelector('[data-k="date"]').value = '2026-09-30';
  m.querySelector('[data-k="name"]').value = '王梓涵';
  m.querySelector('[data-k="role"]').value = '班长';
  m.querySelector('[data-k="score"]').value = '95';
  m.querySelector('[data-save]').click();
})()`);
await sleep(500);
check('考核记录添加', await cdp.eval(`D.committee().assessments.some(x => x.name === '王梓涵' && x.score === 95)`));

/* ================= 班会 / 活动完善 ================= */
await cdp.eval(`location.hash = 'workbench'`);
await sleep(800);
await cdp.eval(`document.querySelector('.work-card[data-drawer="meeting"]').click()`);
await sleep(400);
await cdp.eval(`document.querySelector('#drawerEditBtn').click()`);
await sleep(300);
const planBefore = await cdp.eval(`D.meetings().plan.length`);
await cdp.eval(`document.querySelector('.d-section[data-editor="meeting-plan"] .timeline-item .edit-item-btn').click()`);
await sleep(300);
await cdp.eval(`(() => { const m = document.querySelector('.form-modal'); m.querySelector('[data-k="topic"]').value = '测试班会主题'; m.querySelector('[data-k="location"]').value = '本班教室'; m.querySelector('[data-save]').click(); })()`);
await sleep(500);
check('班会计划可编辑', await cdp.eval(`D.meetings().plan.some(x => x.topic === '测试班会主题' && x.location === '本班教室')`));
await cdp.eval(`window.confirm = () => true`);
await cdp.eval(`document.querySelector('.d-section[data-editor="meeting-plan"] .timeline-item .btn').click()`);
await sleep(500);
check('计划转为已开展', await cdp.eval(`D.meetings().plan.length === ${planBefore - 1} && D.meetings().held.some(x => x.topic === '测试班会主题')`));
await cdp.eval(`document.querySelector('.drawer-close').click()`);
await sleep(300);
await cdp.eval(`document.querySelector('.work-card[data-drawer="activity"]').click()`);
await sleep(400);
await cdp.eval(`document.querySelector('#drawerEditBtn').click()`);
await sleep(300);
await cdp.eval(`document.querySelector('.d-section[data-editor="activity-held"] .record-card:first-child .edit-item-btn').click()`);
await sleep(300);
await cdp.eval(`(() => { const m = document.querySelector('.form-modal'); m.querySelector('[data-k="leader"]').value = '张老师'; m.querySelector('[data-save]').click(); })()`);
await sleep(500);
check('活动记录可编辑', await cdp.eval(`D.activities().held[0].leader === '张老师'`));
await cdp.eval(`state.drawerEditingKey = null`);
await cdp.eval(`document.querySelector('.drawer-close').click()`);
await sleep(300);

/* ================= 导入中心（Excel 模板 / 花名册导入） ================= */
const rosterXlsxPath = 'C:/Users/Administrator/Documents/Codex/2026-08-24/build-x20/outputs/teacher-workbench/assets/templates/花名册模板.xlsx';
const schedXlsxPath = 'C:/Users/Administrator/Documents/Codex/2026-08-24/build-x20/outputs/teacher-workbench/assets/templates/课程表模板.xlsx';
const rosterB64 = fs.readFileSync(rosterXlsxPath).toString('base64');
const schedB64 = fs.readFileSync(schedXlsxPath).toString('base64');

const rosterGrid = await cdp.eval(`parseXlsxGrid(Uint8Array.from(atob('${rosterB64}'), c => c.charCodeAt(0)).buffer).then(g => JSON.stringify(g[0]) + '|' + JSON.stringify(g[1]))`);
check('Excel 花名册模板解析', rosterGrid.includes('姓名') && rosterGrid.includes('张小明'));
const schedGrid = await cdp.eval(`parseXlsxGrid(Uint8Array.from(atob('${schedB64}'), c => c.charCodeAt(0)).buffer).then(g => g.length + '|' + JSON.stringify(g[0]))`);
check('Excel 课程表模板解析', schedGrid.startsWith('10|') && schedGrid.includes('周一'));
check('Excel 直接转花名册', await cdp.eval(`parseXlsxGrid(Uint8Array.from(atob('${rosterB64}'), c => c.charCodeAt(0)).buffer).then(g => studentsFromGrid(g)[0].name)`) === '张小明');

await cdp.eval(`document.querySelector('#importBtn').click()`);
await sleep(400);
check('导入中心打开', await cdp.eval(`!!document.querySelector('.import-card')`));
await cdp.eval(`document.querySelector('.import-tab[data-tab="roster"]').click()`);
await sleep(250);
check('花名册面板显示', await cdp.eval(`document.querySelector('.import-pane[data-pane="roster"]').classList.contains('active')`));
const rosterDoc = await cdp.send('DOM.getDocument');
const rosterInput = await cdp.send('DOM.querySelector', { nodeId: rosterDoc.root.nodeId, selector: '#impRosterFile' });
await cdp.send('DOM.setFileInputFiles', { nodeId: rosterInput.nodeId, files: [rosterXlsxPath] });
await sleep(1000);
check('花名册 Excel 解析状态', await cdp.eval(`document.querySelector('#impRosterStatus').textContent.includes('已解析花名册')`));
await cdp.eval(`window.confirm = () => true; document.querySelector('#impConfirm').click()`);
await sleep(900);
check('花名册导入生效', await cdp.eval(`Store.getAllStudents().then(a => a.length === 1 && a[0].name === '张小明')`));
check('班级信息不受影响', await cdp.eval(`AppData.settings.teacher === '测试老师2'`));

await cdp.eval(`document.querySelector('#importBtn').click()`);
await sleep(400);
await cdp.eval(`document.querySelector('.import-tab[data-tab="schedule"]').click()`);
await sleep(250);
const schedDoc2 = await cdp.send('DOM.getDocument');
const schedInput = await cdp.send('DOM.querySelector', { nodeId: schedDoc2.root.nodeId, selector: '#impSchedFile' });
await cdp.send('DOM.setFileInputFiles', { nodeId: schedInput.nodeId, files: [schedXlsxPath] });
await sleep(1000);
check('课程表 Excel 解析状态', await cdp.eval(`document.querySelector('#impSchedStatus').textContent.includes('已解析课程表')`));
await cdp.eval(`document.querySelector('.form-modal [data-close]').click()`);
await sleep(300);

/* 成绩导入（CSV → 新建考试） */
const gradeCsvPath = 'C:/Users/Administrator/Documents/Codex/2026-08-24/build-x20/outputs/teacher-workbench/dev/grade-import-test.csv';
fs.writeFileSync(gradeCsvPath, '姓名,语文,数学\n张小明,98,76\n');
await cdp.eval(`document.querySelector('#importBtn').click()`);
await sleep(400);
await cdp.eval(`document.querySelector('.import-tab[data-tab="grades"]').click()`);
await sleep(250);
const gradeDoc = await cdp.send('DOM.getDocument');
const gradeNode = await cdp.send('DOM.querySelector', { nodeId: gradeDoc.root.nodeId, selector: '#impGradeFile' });
await cdp.send('DOM.setFileInputFiles', { nodeId: gradeNode.nodeId, files: [gradeCsvPath] });
await sleep(1000);
check('成绩导入解析', await cdp.eval(`document.querySelector('#impGradeStatus').textContent.includes('已匹配 1 名学生')`));
await cdp.eval(`document.querySelector('#impConfirm').click()`);
await sleep(700);
check('成绩导入创建考试', await cdp.eval(`D.grades().exams.some(e => e.name === 'grade-import-test' && Object.values(e.scores)[0].语文 === 98)`));
const mismatchMsg = await cdp.eval(`(() => { try { parseGradesGrid([['姓名','语文'],['不存在的人','80']]); return 'NO ERROR'; } catch (e) { return e.message; } })()`);
check('未匹配提示明确', mismatchMsg.includes('未匹配到任何学生成绩') && mismatchMsg.includes('不存在的人'));

/* ================= 导出中心（CSV / Excel） ================= */
const exportRound = await cdp.eval(`buildXlsxBlob('测试', ['姓名','小组'], [['张三', 1]], [10, 8]).then(async b => {
  const buf = await b.arrayBuffer();
  const g = await parseXlsxGrid(buf);
  return JSON.stringify(g);
})`);
check('Excel 生成并可回读', exportRound.includes('张三') && exportRound.includes('小组') && exportRound.includes('"1"'));

await cdp.eval(`document.querySelector('#exportBtn').click()`);
await sleep(400);
check('导出中心打开', await cdp.eval(`!!document.querySelector('.import-card') && document.querySelector('.form-head h3').textContent === '导出数据'`));
check('花名册页签默认激活', await cdp.eval(`document.querySelector('.import-tab.active').dataset.tab === 'roster'`));
check('导出面板显示人数', await cdp.eval(`document.querySelector('.import-pane[data-pane="roster"]').textContent.includes('1 名学生')`));
await cdp.eval(`document.querySelector('.import-tab[data-tab="schedule"]').click()`);
await sleep(200);
check('课程表页签切换', await cdp.eval(`document.querySelector('.import-pane[data-pane="schedule"]').classList.contains('active')`));
await cdp.eval(`document.querySelector('.import-tab[data-tab="backup"]').click()`);
await sleep(200);
check('完整备份页签切换', await cdp.eval(`document.querySelector('.import-pane[data-pane="backup"]').classList.contains('active')`));
await cdp.eval(`document.querySelector('.form-modal [data-close]').click()`);
await sleep(300);

/* ================= 收尾 ================= */
try {
  const ver = await fetch(`http://127.0.0.1:${PORT}/json/version`).then(r => r.json());
  const bws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { bws.onopen = res; bws.onerror = rej; });
  bws.send(JSON.stringify({ id: 1, method: 'Browser.close' }));
  await sleep(300);
} catch (e) {
  console.log('cleanup note:', e.message);
}
console.log(failures ? `HAS ${failures} FAILURES` : 'ALL CHECKS PASSED');
cdp.ws.close();
process.exitCode = failures ? 1 : 0;
