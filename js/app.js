'use strict';

/* ============================================================
 * 班主任工作台 · 应用逻辑
 * 模块：整体布局 / 工作台首页 / 座次表（含编辑）/ 数据持久化
 * ============================================================ */

/* ---------- 图标库（内联 SVG，统一描边风格） ---------- */
const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></svg>',
  seating: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
  duty: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="m8.5 12 2.3 2.3 4.7-4.6"/></svg>',
  grades: '<svg viewBox="0 0 24 24"><path d="M4 20h16"/><path d="m6 16 4-5 3 3 5-8"/><circle cx="18" cy="6" r="1.2"/></svg>',
  roster: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5a3.5 3.5 0 0 1 0 6.8"/><path d="M17.3 14.6a5.5 5.5 0 0 1 3.2 5.4"/></svg>',
  committee: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2-5.6-3.2-5.6 3.2 1.3-6.2L3 9.5l6.3-.7z"/></svg>',
  contacts: '<svg viewBox="0 0 24 24"><path d="M6.5 3.5h3l1.2 4-1.8 1.2a12 12 0 0 0 6.4 6.4l1.2-1.8 4 1.2v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z"/></svg>',
  schedule: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/><path d="m8.5 14 2.2 2.2 4.8-4.4"/></svg>',
  attendance: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></svg>',
  discipline: '<svg viewBox="0 0 24 24"><path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/></svg>',
  homework: '<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h14"/><path d="m9 9.5 2 2 4-4"/></svg>',
  patrol: '<svg viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  meeting: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8M12 8v5M9 9.5h6"/></svg>',
  communication: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.6 0-3-.4-4.3-1L3 20l1.2-4.2A8.5 8.5 0 1 1 21 11.5z"/><path d="M8 10.5h8M8 14h5"/></svg>',
  growth: '<svg viewBox="0 0 24 24"><path d="M12 21v-9"/><path d="M12 14C9 9 4.5 7.5 3 7.5c0 5 3.5 7.5 9 6.5z"/><path d="M12 11.5C15 6.5 19.5 5 21 5c0 5-3.5 7.5-9 6.5z"/></svg>',
  activity: '<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="14" r="3.5"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"/></svg>'
};

/* ---------- 导航配置 ---------- */
const PAGES = [
  { key: 'workbench', label: '工作台', icon: 'dashboard', ready: true },
  { key: 'seating', label: '座次表', icon: 'seating', ready: true },
  { key: 'duty', label: '值日表', icon: 'duty', ready: false },
  { key: 'grades', label: '成绩分析', icon: 'grades', ready: false },
  { key: 'roster', label: '花名册', icon: 'roster', ready: true },
  { key: 'committee', label: '班委名单', icon: 'committee', ready: false },
  { key: 'contacts', label: '家长联系方式', icon: 'contacts', ready: false },
  { key: 'schedule', label: '课程表', icon: 'schedule', ready: true }
];

const PLACEHOLDER_INFO = {
  duty: {
    icon: 'duty', title: '值日表', desc: '值日排班与提醒模块',
    points: ['按周自动轮值排班', '值日生名单与职责查看', '值日完成情况打卡', '调换值日一键通知']
  },
  grades: {
    icon: 'grades', title: '成绩分析', desc: '考试成绩录入与分析模块',
    points: ['单科 / 总分排名', '进退步对比分析', '学科均衡度雷达图', '成绩单导出']
  },
  committee: {
    icon: 'committee', title: '班委名单', desc: '班委职务与分工模块',
    points: ['班委职务一览', '职责说明与考核', '换届记录']
  },
  contacts: {
    icon: 'contacts', title: '家长联系方式', desc: '家校通讯录模块',
    points: ['家长姓名与电话', '一键拨打 / 短信', '按学生快速查找']
  },
};

/* ---------- 状态 ---------- */
const state = {
  page: 'workbench',
  activeGroups: new Set(),
  seatQuery: '',
  seatEditMode: false,
  seatMoveMode: false,
  seatMoveSource: null,
  drawerKey: null,
  drawerEditing: false,
  scheduleEditMode: false,
  schedImportData: null,
  importTab: 'backup',
  importData: null,
  exportTab: 'roster',
  rollMarks: {},
  todayHover: false,
  rosterSearch: '',
  rosterGroup: 0,
  needsInit: false,
  initStep: 1,
  initOption: null,
  initImport: null,
  initEditSettings: false
};

const TODAY = ATTENDANCE.date;
const WEEK_CN = ['日', '一', '二', '三', '四', '五', '六'];
const CLASSROOM_DEFAULT = { rows: 6, cols: 8 };

/* ---------- 工具函数 ---------- */
const byId = id => document.getElementById(id);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function esc(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function weekday(dateStr) {
  return '周' + WEEK_CN[new Date(dateStr + 'T00:00:00').getDay()];
}

function fmtDate(dateStr, withWeekday = true) {
  const d = new Date(dateStr + 'T00:00:00');
  const s = `${d.getMonth() + 1}月${d.getDate()}日`;
  return withWeekday ? `${s} ${weekday(dateStr)}` : s;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

function avatar(name) {
  return esc(name.charAt(0));
}

/* ============================================================
 * 数据访问层（IndexedDB 缓存）
 * ============================================================ */
const AppData = { students: [], records: {}, settings: null };

function classInfo() {
  return AppData.settings || CLASS_INFO;
}

function studentCount() {
  return AppData.students.length;
}

const D = {
  students() { return AppData.students; },
  studentById() {
    const m = {};
    AppData.students.forEach(s => { m[s.id] = s; });
    return m;
  },
  studentByName() {
    const m = {};
    AppData.students.forEach(s => { m[s.name] = s; });
    return m;
  },
  attendance() { return AppData.records.attendance; },
  discipline() { return AppData.records.discipline; },
  homework() { return AppData.records.homework; },
  patrol() { return AppData.records.patrol; },
  meetings() { return AppData.records.meetings; },
  communication() { return AppData.records.communication; },
  growth() { return AppData.records.growth; },
  activities() { return AppData.records.activities; },
  schedule() { return AppData.records.schedule; },
  todos() { return AppData.records.todos; }
};

function cloneSeed(key) {
  return JSON.parse(JSON.stringify(SEED_RECORDS[key]));
}

async function loadAllData() {
  let settings = await Store.getRecord('settings');
  const students = await Store.getAllStudents();

  if (settings === undefined) {
    if (students.length) {
      // 兼容旧版本：已有学生数据但还没有设置 → 补一份默认设置
      settings = {
        teacher: CLASS_INFO.teacher,
        className: CLASS_INFO.name,
        semester: CLASS_INFO.semester,
        initializedAt: new Date().toISOString()
      };
      await Store.putRecord('settings', settings);
    } else {
      state.needsInit = true;
      AppData.settings = {
        teacher: CLASS_INFO.teacher,
        className: CLASS_INFO.name,
        semester: CLASS_INFO.semester
      };
      AppData.students = [];
      return;
    }
  }

  AppData.settings = settings;
  const defaults = { teacher: CLASS_INFO.teacher, className: CLASS_INFO.name, semester: CLASS_INFO.semester };
  let changed = false;
  for (const k of ['teacher', 'className', 'semester']) {
    if (!AppData.settings[k]) {
      AppData.settings[k] = defaults[k];
      changed = true;
    }
  }
  if (!AppData.settings.backup) {
    AppData.settings.backup = { enabled: true, frequency: 'daily', keep: 5, lastBackup: null };
    changed = true;
  }
  if (!AppData.settings.classroom) {
    AppData.settings.classroom = Object.assign({}, CLASSROOM_DEFAULT);
    changed = true;
  }
  if (changed) await Store.putRecord('settings', AppData.settings);
  AppData.students = students;
  let stuChanged = false;
  AppData.students.forEach((s, i) => {
    if (!s.stuNo) {
      s.stuNo = '2026' + String(i + 1).padStart(4, '0');
      stuChanged = true;
    }
    if (s.row === undefined) { s.row = 0; stuChanged = true; }
    if (s.col === undefined) { s.col = 0; stuChanged = true; }
  });
  if (stuChanged) await Store.putStudents(AppData.students);
  for (const k of RECORD_KEYS) {
    let v = await Store.getRecord(k);
    if (v === undefined) {
      v = cloneSeed(k);
      await Store.putRecord(k, v);
    }
    AppData.records[k] = v;
  }
}

async function saveStudent(stu) {
  await Store.putStudent(stu);
  const idx = AppData.students.findIndex(s => s.id === stu.id);
  if (idx >= 0) AppData.students[idx] = stu;
  else AppData.students.push(stu);
}

async function removeStudent(id) {
  await Store.deleteStudent(id);
  AppData.students = AppData.students.filter(s => s.id !== id);
}

async function saveRecord(key, value) {
  await Store.putRecord(key, value);
  AppData.records[key] = value;
  if (state.page === 'workbench') renderWorkbench();
}

function nextStudentId() {
  let n = 1;
  while (AppData.students.some(s => s.id === 's' + String(n).padStart(2, '0'))) n += 1;
  return 's' + String(n).padStart(2, '0');
}

function recomputeAttendance(a) {
  a.lateCount = a.late.length;
  a.leaveCount = a.leave.length;
  a.absentCount = a.absent.length;
  a.present = a.total - a.leaveCount - a.absentCount;
  syncMarksFromLists(a);
}

/* 点名状态：present 到 / late 迟到 / leave 请假 / absent 缺勤 */
const ROLL_STATUS = {
  present: { text: '到', cls: 'st-present' },
  late: { text: '迟到', cls: 'st-late' },
  leave: { text: '请假', cls: 'st-leave' },
  absent: { text: '缺勤', cls: 'st-absent' }
};
const ROLL_ORDER = ['present', 'late', 'leave', 'absent'];

function ensureAttendanceMarks(rec) {
  const students = D.students();
  if (!rec.marks || typeof rec.marks !== 'object') {
    rec.marks = {};
    students.forEach(s => {
      const late = rec.late.find(x => x.name === s.name);
      const leave = rec.leave.find(x => x.name === s.name);
      const absent = rec.absent.find(x => x.name === s.name);
      rec.marks[s.id] = {
        status: late ? 'late' : leave ? 'leave' : absent ? 'absent' : 'present',
        time: late ? late.time : '',
        reason: leave ? leave.reason : '',
        note: absent ? absent.note : ''
      };
    });
  }
  const ids = new Set(students.map(s => s.id));
  Object.keys(rec.marks).forEach(id => {
    if (!ids.has(id)) delete rec.marks[id];
  });
  students.forEach(s => {
    if (!rec.marks[s.id]) rec.marks[s.id] = { status: 'present', time: '', reason: '', note: '' };
  });
  return rec;
}

function syncMarksFromLists(rec) {
  if (!rec.marks || typeof rec.marks !== 'object') {
    ensureAttendanceMarks(rec);
    return;
  }
  D.students().forEach(s => {
    const late = rec.late.find(x => x.name === s.name);
    const leave = rec.leave.find(x => x.name === s.name);
    const absent = rec.absent.find(x => x.name === s.name);
    rec.marks[s.id] = {
      status: late ? 'late' : leave ? 'leave' : absent ? 'absent' : 'present',
      time: late ? late.time : '',
      reason: leave ? leave.reason : '',
      note: absent ? absent.note : ''
    };
  });
}

function recomputeHomework(h) {
  const total = studentCount();
  h.subjects.forEach(s => {
    s.rate = total > 0 ? Math.round((total - s.missing.length) / total * 1000) / 10 : 100;
  });
}

/* ---------- 侧边导航 ---------- */
function buildSidebar() {
  byId('nav').innerHTML = PAGES.map(p => `
    <button class="nav-item${p.key === state.page ? ' active' : ''}" data-page="${p.key}" type="button">
      <span class="nav-icon">${ICONS[p.icon]}</span>
      <span class="nav-label">${p.label}</span>
      ${p.ready ? '' : '<span class="nav-soon">待开发</span>'}
    </button>`).join('');

  qsa('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      state.page = btn.dataset.page;
      try { location.hash = state.page; } catch (e) { /* 忽略 */ }
      buildSidebar();
      render();
      byId('app').classList.remove('sidebar-open');
      byId('content').scrollTop = 0;
      window.scrollTo(0, 0);
    });
  });
}

function toggleSidebarCollapsed() {
  const app = byId('app');
  const collapsed = app.classList.toggle('collapsed');
  try { localStorage.setItem('tw-collapsed', collapsed ? '1' : '0'); } catch (e) { /* 忽略 */ }
}

/* ---------- 路由与渲染 ---------- */
function render() {
  hideTodayCourses();
  const page = PAGES.find(p => p.key === state.page);
  byId('pageTitle').textContent = page.label;

  if (state.page === 'workbench') renderWorkbench();
  else if (state.page === 'seating') renderSeating();
  else if (state.page === 'roster') renderRoster();
  else if (state.page === 'schedule') renderSchedule();
  else renderPlaceholder(page.key);
}

function renderPlaceholder(key) {
  const cfg = PLACEHOLDER_INFO[key];
  byId('content').innerHTML = `
    <div class="page-head">
      <div><h2>${cfg.title}</h2><p>${cfg.desc}</p></div>
      <span class="soon-badge">下一阶段开发</span>
    </div>
    <div class="placeholder card">
      <div class="placeholder-icon">${ICONS[cfg.icon]}</div>
      <h3>${cfg.title} · 规划中</h3>
      <p>该模块已纳入后续开发计划，本阶段先完成整体框架与首页、座次表两大核心功能。</p>
      <div class="placeholder-points">
        ${cfg.points.map(pt => `<span class="point-chip">${pt}</span>`).join('')}
      </div>
    </div>`;
}

/* ============================================================
 * 工作台首页
 * ============================================================ */
const WORK_CARDS = [
  {
    key: 'attendance', section: 'regular', icon: 'attendance', title: '早读考勤', accent: 'green',
    summary: '今日出勤情况 · 迟到 · 请假',
    tags() {
      const a = D.attendance();
      return [
        { t: `出勤 ${a.present}/${a.total}`, cls: 'ok' },
        { t: `迟到 ${a.lateCount}`, cls: 'warn' },
        { t: `请假 ${a.leaveCount}`, cls: 'muted' }
      ];
    }
  },
  {
    key: 'discipline', section: 'regular', icon: 'discipline', title: '课堂纪律', accent: 'blue',
    summary: '本周课堂纪律 · 表扬 · 需关注',
    tags() {
      const d = D.discipline();
      return [
        { t: `整体${d.rating}`, cls: 'ok' },
        { t: `表扬 ${d.praiseCount} 人次`, cls: 'good' },
        { t: `关注 ${d.focusCount} 人`, cls: 'warn' }
      ];
    }
  },
  {
    key: 'homework', section: 'regular', icon: 'homework', title: '作业收缴', accent: 'cream',
    summary: '各学科收缴率 · 未交名单',
    tags() {
      const rates = D.homework().subjects.map(s => s.rate);
      return [
        { t: `最高 ${Math.max(...rates).toFixed(1)}%`, cls: 'ok' },
        { t: `最低 ${Math.min(...rates).toFixed(1)}%`, cls: 'warn' }
      ];
    }
  },
  {
    key: 'patrol', section: 'regular', icon: 'patrol', title: '课间巡查', accent: 'teal',
    summary: '巡查记录 · 异常情况登记',
    tags() {
      const p = D.patrol();
      return [
        { t: `巡查 ${p.records.length} 次`, cls: 'ok' },
        { t: `异常 ${p.anomalies.length} 条`, cls: 'warn' }
      ];
    }
  },
  {
    key: 'meeting', section: 'feature', icon: 'meeting', title: '主题班会', accent: 'blue',
    summary: '本学期计划 · 已开展记录',
    tags() {
      const m = D.meetings();
      return [
        { t: `计划 ${m.plan.length} 场`, cls: 'ok' },
        { t: `已开展 ${m.held.length} 场`, cls: 'muted' }
      ];
    }
  },
  {
    key: 'communication', section: 'feature', icon: 'communication', title: '家校沟通', accent: 'green',
    summary: '沟通记录 · 重点家访计划',
    tags() {
      const c = D.communication();
      return [
        { t: `沟通 ${c.records.length} 条`, cls: 'ok' },
        { t: `家访 ${c.visits.length} 项`, cls: 'warn' }
      ];
    }
  },
  {
    key: 'growth', section: 'feature', icon: 'growth', title: '学生成长', accent: 'cream',
    summary: '成长档案 · 个性化辅导',
    tags() {
      const g = D.growth();
      return [
        { t: `档案 ${g.archiveDone}/${studentCount()}`, cls: 'ok' },
        { t: `辅导 ${g.tutoringCount} 人次`, cls: 'muted' }
      ];
    }
  },
  {
    key: 'activity', section: 'feature', icon: 'activity', title: '班级活动', accent: 'teal',
    summary: '活动策划 · 开展记录 · 照片',
    tags() {
      const a = D.activities();
      return [
        { t: `近期 ${a.upcoming.length} 项`, cls: 'ok' },
        { t: `已开展 ${a.held.length} 场`, cls: 'muted' }
      ];
    }
  }
];

function workCard(card) {
  return `
    <article class="work-card accent-${card.accent}" data-drawer="${card.key}" tabindex="0" role="button" aria-label="查看${card.title}详情">
      <div class="work-icon">${ICONS[card.icon]}</div>
      <div class="work-body">
        <h3>${card.title}</h3>
        <p>${card.summary}</p>
        <div class="work-tags">
          ${card.tags().map(t => `<span class="tag tag-${t.cls}">${t.t}</span>`).join('')}
        </div>
      </div>
      <span class="work-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>
      </span>
    </article>`;
}

function fmtDue(due) {
  if (!due) return '';
  const d = new Date(due + 'T00:00:00');
  if (isNaN(d.getTime())) return due;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function todoItemHtml(t) {
  const overdue = !t.done && t.due && t.due < TODAY;
  return `
    <div class="todo-item${t.done ? ' done' : ''}${overdue ? ' overdue' : ''}" data-id="${esc(t.id)}">
      <label class="todo-check" title="${t.done ? '标记为未完成' : '标记为已完成'}">
        <input type="checkbox" ${t.done ? 'checked' : ''}>
        <i></i>
      </label>
      <span class="todo-text">${esc(t.text)}</span>
      <span class="tag ${t.priority === '高' ? 'tag-danger' : t.priority === '低' ? 'tag-muted' : 'tag-warn'}">${esc(t.priority || '中')}</span>
      <span class="todo-due${overdue ? ' overdue-text' : ''}">${t.due ? (overdue ? '已逾期 ' + fmtDue(t.due) : fmtDue(t.due)) : ''}</span>
      <button class="todo-edit" type="button" title="编辑">✎</button>
      <button class="todo-del" type="button" title="删除">×</button>
    </div>`;
}

/* ---------- 今日课程 ---------- */
function buildTodayCourses(teacherName) {
  const s = D.schedule();
  const day = '周' + WEEK_CN[new Date(TODAY + 'T00:00:00').getDay()];
  const courses = s.periods.map(p => {
    const c = s.cells[`${day}-${p}`];
    return {
      period: p,
      subject: c ? c.subject : '',
      teacher: c ? c.teacher || '' : '',
      mine: !!(c && c.subject && c.teacher && teacherName && c.teacher === teacherName)
    };
  });
  return { day, dateText: fmtDate(TODAY), courses };
}

function todayCourseCount() {
  return buildTodayCourses(classInfo().teacher).courses.filter(c => c.subject && c.period !== '早读').length;
}

function todayPopoverHtml() {
  const t = buildTodayCourses(classInfo().teacher);
  const rows = t.courses.map(c => {
    if (!c.subject) {
      return `<div class="today-row empty"><span class="today-period">${esc(c.period)}</span><span class="today-empty">空课</span></div>`;
    }
    return `
      <div class="today-row${c.mine ? ' mine' : ''}">
        <span class="today-period">${esc(c.period)}</span>
        <span class="today-subject">${esc(c.subject)}</span>
        <span class="today-teacher">${esc(c.teacher)}</span>
        ${c.mine ? '<span class="tag tag-green">我的课</span>' : ''}
      </div>`;
  }).join('');
  return `
    <div class="today-head">
      <div><strong>今日课程</strong><span>${t.day} · ${t.dateText}</span></div>
      <button class="drawer-close" id="todayClose" type="button" aria-label="关闭">${ICONS.x}</button>
    </div>
    <div class="today-list">${rows}</div>
    <button class="today-goto" id="todayGoto" type="button">查看完整课程表 →</button>`;
}

function showTodayCourses() {
  const anchor = byId('todayCoursesStat');
  const pop = byId('todayPopover');
  if (!anchor || !pop) return;
  pop.innerHTML = todayPopoverHtml();
  pop.hidden = false;
  const r = anchor.getBoundingClientRect();
  const pw = pop.offsetWidth;
  let left = r.left;
  if (left + pw > window.innerWidth - 10) left = Math.max(10, window.innerWidth - pw - 10);
  let top = r.bottom + 8;
  if (top + pop.offsetHeight > window.innerHeight - 10) top = Math.max(10, r.top - pop.offsetHeight - 8);
  pop.style.left = left + 'px';
  pop.style.top = top + 'px';
  const closeBtn = byId('todayClose');
  if (closeBtn) closeBtn.addEventListener('click', hideTodayCourses);
  const gotoBtn = byId('todayGoto');
  if (gotoBtn) {
    gotoBtn.addEventListener('click', () => {
      hideTodayCourses();
      location.hash = 'schedule';
    });
  }
}

function hideTodayCourses() {
  const pop = byId('todayPopover');
  if (pop) pop.hidden = true;
}

function scheduleTodayHide() {
  clearTimeout(window.__todayHideT);
  window.__todayHideT = setTimeout(() => {
    if (!state.todayHover) hideTodayCourses();
  }, 250);
}

function renderWorkbench() {
  const a = D.attendance();
  const todos = D.todos() || [];
  const pending = todos.filter(t => !t.done).length;
  const regular = WORK_CARDS.filter(c => c.section === 'regular');
  const feature = WORK_CARDS.filter(c => c.section === 'feature');
  const todoHtml = todos.map(todoItemHtml).join('') || '<p class="empty">暂无待办，点击「＋ 添加待办」创建</p>';

  byId('content').innerHTML = `
    <div class="welcome card">
      <div class="welcome-left">
        <h2>${greeting()}，${classInfo().teacher}</h2>
        <p>今天是 ${fmtDate(TODAY)}，新的一周，班级日常尽在掌握。</p>
      </div>
      <div class="welcome-stats">
        <div class="ws-item"><strong>${a.present}<span>/${a.total}</span></strong><span>今日出勤</span></div>
        <div class="ws-item"><strong>${pending}</strong><span>待办事项</span></div>
        <div class="ws-item clickable" id="todayCoursesStat" title="点击查看今日课程">
          <strong>${todayCourseCount()}<span>节</span></strong><span>今日课程</span>
        </div>
      </div>
    </div>

    <div class="todo-strip card">
      <div class="todo-title">待办提醒 <span class="badge">${pending}</span></div>
      <div class="todo-list" id="todoList">${todoHtml}</div>
      <button class="btn tiny primary add-todo-btn" id="addTodoBtn" type="button">＋ 添加待办</button>
    </div>

    <div class="home-sections">
      <section class="home-section">
        <div class="section-head">
          <div><h2>常规工作</h2><p>每日必看 · 掌握班级日常动态</p></div>
          <span class="section-tag">${regular.length} 项</span>
        </div>
        <div class="card-grid">${regular.map(workCard).join('')}</div>
      </section>

      <section class="home-section">
        <div class="section-head">
          <div><h2>特色工作</h2><p>长期经营 · 关注学生全面发展</p></div>
          <span class="section-tag">${feature.length} 项</span>
        </div>
        <div class="card-grid">${feature.map(workCard).join('')}</div>
      </section>
    </div>`;

  qsa('.work-card').forEach(card => {
    const open = () => openDrawer(card.dataset.drawer);
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  byId('addTodoBtn').addEventListener('click', () => openTodoForm());
  qsa('.todo-check input').forEach(chk => {
    chk.addEventListener('change', async () => {
      await toggleTodo(chk.closest('.todo-item').dataset.id);
    });
  });
  qsa('.todo-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.closest('.todo-item').dataset.id;
      openTodoForm((D.todos() || []).find(t => t.id === id));
    });
  });
  qsa('.todo-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('确定删除这条待办吗？')) return;
      await deleteTodo(btn.closest('.todo-item').dataset.id);
      showToast('待办已删除');
    });
  });

  const todayStat = byId('todayCoursesStat');
  if (todayStat) {
    todayStat.addEventListener('mouseenter', () => {
      state.todayHover = true;
      clearTimeout(window.__todayHideT);
      showTodayCourses();
    });
    todayStat.addEventListener('mouseleave', () => {
      state.todayHover = false;
      scheduleTodayHide();
    });
    todayStat.addEventListener('click', e => {
      e.stopPropagation();
      clearTimeout(window.__todayHideT);
      const pop = byId('todayPopover');
      if (pop && !pop.hidden) {
        state.todayHover = false;
        hideTodayCourses();
      } else {
        state.todayHover = true;
        showTodayCourses();
      }
    });
  }
}

/* ---------- 待办事项管理 ---------- */
function nextTodoId() {
  const list = D.todos() || [];
  let n = 1;
  while (list.some(t => t.id === 't' + n)) n += 1;
  return 't' + n;
}

const TODO_FORM = {
  title: '待办事项',
  fields: [
    { k: 'text', label: '内容' },
    { k: 'due', label: '截止日期', required: false, placeholder: '如 2026-08-30（可留空）' },
    { k: 'priority', label: '优先级', type: 'select', options: ['高', '中', '低'] }
  ]
};

function openTodoForm(todo) {
  const values = todo
    ? { text: todo.text, due: todo.due || '', priority: todo.priority || '中' }
    : { text: '', due: '', priority: '中' };
  openFormModal(TODO_FORM, values, async out => {
    const list = D.todos() || [];
    if (todo) {
      const t = list.find(x => x.id === todo.id);
      if (t) {
        t.text = out.text;
        t.due = out.due;
        t.priority = out.priority;
      }
    } else {
      list.push({
        id: nextTodoId(),
        text: out.text,
        due: out.due,
        priority: out.priority,
        done: false,
        createdAt: new Date().toISOString().slice(0, 10)
      });
    }
    await saveRecord('todos', list);
    showToast(todo ? '待办已更新' : '待办已添加');
  });
}

async function toggleTodo(id) {
  const list = D.todos() || [];
  const t = list.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  t.doneAt = t.done ? new Date().toISOString() : undefined;
  await saveRecord('todos', list);
}

async function deleteTodo(id) {
  const list = D.todos() || [];
  await saveRecord('todos', list.filter(t => t.id !== id));
}

/* ============================================================
 * 详情面板（抽屉）
 * ============================================================ */
function drawerShell(icon, title, subtitle, body, editableKey) {
  const editBtn = editableKey ? `
    <button class="btn tiny drawer-edit-btn ${state.drawerEditing ? 'on' : ''}" id="drawerEditBtn" type="button">
      ${state.drawerEditing ? '完成编辑' : '编辑'}
    </button>` : '';
  return `
    <div class="drawer-head">
      <div class="drawer-title">
        <span class="drawer-icon">${ICONS[icon]}</span>
        <div><h2 id="drawerTitle">${title}</h2><p>${subtitle}</p></div>
      </div>
      <div class="drawer-head-actions">
        ${editBtn}
        <button class="drawer-close" id="drawerClose" type="button" aria-label="关闭详情">
          <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
    </div>
    <div class="drawer-body">${body}</div>`;
}

function statGrid(items) {
  return `<div class="stat-grid">${items.map(i => `
    <div class="stat ${i.cls || ''}">
      <strong>${i.v}</strong>
      <span>${i.l}</span>
      ${i.sub ? `<em>${i.sub}</em>` : ''}
    </div>`).join('')}</div>`;
}

function plainList(rows) {
  return `<ul class="plain-list">${rows.map(r => `
    <li>
      <span class="avatar ${r.avatarCls || ''}">${avatar(r.name)}</span>
      <div class="li-main"><strong>${r.name}</strong><span>${r.sub || ''}</span></div>
      <span class="li-meta ${r.metaCls || ''}">${r.meta || ''}</span>
    </li>`).join('')}</ul>`;
}

function sectionBlock(title, extra, bodyHtml, editorType) {
  return `<div class="d-section"${editorType ? ` data-editor="${editorType}"` : ''}>
    <div class="d-section-head"><h3>${title}</h3>${extra || ''}</div>
    ${bodyHtml}
  </div>`;
}

function drawerFor(key) {
  if (key.startsWith('student:')) return studentDrawer(key.slice(8));
  switch (key) {
    case 'attendance': return attendanceDrawer();
    case 'discipline': return disciplineDrawer();
    case 'homework': return homeworkDrawer();
    case 'patrol': return patrolDrawer();
    case 'meeting': return meetingDrawer();
    case 'communication': return communicationDrawer();
    case 'growth': return growthDrawer();
    case 'activity': return activityDrawer();
    default: return '';
  }
}

function attendanceDrawer() {
  const a = D.attendance();
  const body = `
    <div class="d-section">
      <button class="btn primary rollcall-btn" id="rollcallBtn" type="button">开始今日点名</button>
      <p class="rollcall-hint">按学生逐一点名：点击学生循环切换 到 / 迟到 / 请假 / 缺勤，保存后自动汇总名单与出勤统计。</p>
    </div>
    ${statGrid([
      { v: a.total, l: '应到人数' },
      { v: a.present, l: '实到人数', cls: 'ok', sub: '含迟到' },
      { v: a.lateCount, l: '迟到', cls: 'warn' },
      { v: a.leaveCount, l: '请假', cls: 'muted' },
      { v: a.absentCount, l: '缺勤', cls: 'danger' }
    ])}
    ${sectionBlock('迟到名单', `<span class="head-count">${a.late.length} 人</span>`, plainList(
      a.late.map(x => ({ name: x.name, sub: '早读迟到', meta: x.time, metaCls: 'warn' }))
    ), 'attendance-late')}
    ${sectionBlock('请假名单', `<span class="head-count">${a.leave.length} 人</span>`, plainList(
      a.leave.map(x => ({ name: x.name, sub: x.reason, meta: '已登记', metaCls: 'muted' }))
    ), 'attendance-leave')}
    ${sectionBlock('缺勤名单', `<span class="head-count">${a.absent.length} 人</span>`, plainList(
      a.absent.map(x => ({ name: x.name, sub: x.note, meta: '待核实', metaCls: 'danger' }))
    ), 'attendance-absent')}
    <p class="d-footnote">出勤数据由早读签到自动汇总，考勤异常请及时联系家长核实。</p>`;
  return drawerShell('attendance', '早读考勤', `${fmtDate(a.date)} · 出勤 ${a.present}/${a.total}`, body, 'attendance');
}

function openRollCall() {
  closeFormModal();
  const rec = D.attendance();
  ensureAttendanceMarks(rec);
  const students = D.students();
  state.rollMarks = {};
  students.forEach(s => {
    const m = rec.marks[s.id] || { status: 'present' };
    state.rollMarks[s.id] = m.status;
  });

  const rowsHtml = students.map(s => {
    const st = state.rollMarks[s.id];
    return `
      <button class="roll-row" data-sid="${s.id}" data-status="${st}" type="button">
        <span class="roll-name">${esc(s.name)}</span>
        <span class="roll-status ${ROLL_STATUS[st].cls}">${ROLL_STATUS[st].text}</span>
      </button>`;
  }).join('');

  const root = document.createElement('div');
  root.className = 'form-modal';
  root.innerHTML = `
    <div class="form-backdrop" data-close></div>
    <div class="form-card card roll-card" role="dialog" aria-modal="true">
      <div class="form-head">
        <h3>早读点名 · ${fmtDate(rec.date)}</h3>
        <button class="drawer-close" data-close type="button">${ICONS.x}</button>
      </div>
      <div class="roll-toolbar">
        <span id="rollSummary"></span>
        <span class="roll-legend">点击学生循环：到 → 迟到 → 请假 → 缺勤</span>
        <button class="btn tiny" id="rollAllPresent" type="button">全部到</button>
      </div>
      <div class="form-body roll-grid">${rowsHtml}</div>
      <div class="form-actions">
        <button class="btn ghost" data-close type="button">取消</button>
        <button class="btn primary" id="rollSave" type="button">保存点名结果</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  const updateSummary = () => {
    let late = 0;
    let leave = 0;
    let absent = 0;
    qsa('.roll-row', root).forEach(r => {
      const st = r.dataset.status;
      if (st === 'late') late += 1;
      else if (st === 'leave') leave += 1;
      else if (st === 'absent') absent += 1;
    });
    root.querySelector('#rollSummary').textContent =
      `共 ${qsa('.roll-row', root).length} 人 · 迟到 ${late} · 请假 ${leave} · 缺勤 ${absent}`;
  };

  qsa('[data-close]', root).forEach(el => el.addEventListener('click', closeFormModal));

  qsa('.roll-row', root).forEach(row => {
    row.addEventListener('click', () => {
      const sid = row.dataset.sid;
      const next = ROLL_ORDER[(ROLL_ORDER.indexOf(state.rollMarks[sid]) + 1) % ROLL_ORDER.length];
      state.rollMarks[sid] = next;
      row.dataset.status = next;
      const chip = row.querySelector('.roll-status');
      chip.className = 'roll-status ' + ROLL_STATUS[next].cls;
      chip.textContent = ROLL_STATUS[next].text;
      updateSummary();
    });
  });

  root.querySelector('#rollAllPresent').addEventListener('click', () => {
    qsa('.roll-row', root).forEach(row => {
      state.rollMarks[row.dataset.sid] = 'present';
      row.dataset.status = 'present';
      const chip = row.querySelector('.roll-status');
      chip.className = 'roll-status st-present';
      chip.textContent = '到';
    });
    updateSummary();
  });

  root.querySelector('#rollSave').addEventListener('click', async () => {
    const now = new Date();
    const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const late = [];
    const leave = [];
    const absent = [];
    Object.keys(state.rollMarks).forEach(sid => {
      const s = D.studentById()[sid];
      if (!s) return;
      const st = state.rollMarks[sid];
      const prev = rec.marks[sid] || {};
      rec.marks[sid] = { status: st, time: prev.time || '', reason: prev.reason || '', note: prev.note || '' };
      if (st === 'late') {
        rec.marks[sid].time = prev.time || hm;
        late.push({ name: s.name, time: rec.marks[sid].time });
      } else if (st === 'leave') {
        leave.push({ name: s.name, reason: rec.marks[sid].reason });
      } else if (st === 'absent') {
        absent.push({ name: s.name, note: rec.marks[sid].note });
      }
    });
    rec.late = late;
    rec.leave = leave;
    rec.absent = absent;
    rec.total = D.students().length;
    recomputeAttendance(rec);
    await saveRecord('attendance', rec);
    closeFormModal();
    openDrawer('attendance');
    showToast(`点名完成：迟到 ${rec.lateCount} · 请假 ${rec.leaveCount} · 缺勤 ${rec.absentCount}`);
  });

  updateSummary();
}

function disciplineDrawer() {
  const d = D.discipline();
  const daily = d.daily.map(x => `
    <span class="daily-chip ${x.score === '优' ? 'good' : x.score === '良' ? 'mid' : 'muted'}">
      ${x.day}<b>${x.score}</b>
    </span>`).join('');
  const body = `
    ${statGrid([
      { v: d.rating, l: '本周整体评价', cls: 'ok' },
      { v: d.praiseCount + ' 人次', l: '课堂表扬', cls: 'good' },
      { v: d.remindCount + ' 人次', l: '课堂提醒', cls: 'warn' },
      { v: d.focusCount + ' 人', l: '重点关注', cls: 'danger' }
    ])}
    ${sectionBlock('一周课堂纪律', `<span class="head-count">${d.week}</span>`,
      `<div class="daily-row">${daily}</div>`)}
    ${sectionBlock('本周表扬名单', `<span class="head-count">${d.praise.length} 条</span>`, plainList(
      d.praise.map(x => ({ name: x.name, sub: `${x.scene} · ${x.reason}`, meta: '表扬', metaCls: 'good' }))
    ), 'discipline-praise')}
    ${sectionBlock('需关注学生', `<span class="head-count">${d.focus.length} 人</span>`, plainList(
      d.focus.map(x => ({ name: x.name, sub: `${x.issue}｜${x.note}`, meta: '关注', metaCls: 'warn' }))
    ), 'discipline-focus')}`;
  return drawerShell('discipline', '课堂纪律', `本周（${d.week}）`, body, 'discipline');
}

function homeworkDrawer() {
  const h = D.homework();
  const bars = h.subjects.map(s => {
    const cls = s.rate >= 93 ? 'good' : s.rate >= 90 ? 'mid' : 'warn';
    return `
      <div class="bar-row">
        <span class="bar-label">${s.subject}</span>
        <div class="bar-track"><div class="bar-fill ${cls}" style="width:${s.rate}%"></div></div>
        <span class="bar-value">${s.rate}%</span>
        <span class="bar-count">${studentCount() - s.missing.length}/${studentCount()}</span>
      </div>`;
  }).join('');
  const table = h.subjects.map(s => `
    <tr>
      <td><strong>${s.subject}</strong></td>
      <td class="td-center">${s.missing.length}</td>
      <td>${s.missing.map(n => `<span class="name-tag">${n}</span>`).join('') || '—'}</td>
    </tr>`).join('');
  const body = `
    ${sectionBlock('各学科收缴率', `<span class="head-count">${fmtDate(h.date)}</span>`,
      `<div class="bars">${bars}</div>`)}
    ${sectionBlock('未交作业学生名单', '<span class="head-count">点击“编辑”可管理</span>', `
      <div class="table-wrap">
        <table class="mini-table">
          <thead><tr><th>学科</th><th class="td-center">未交</th><th>学生名单</th></tr></thead>
          <tbody>${table}</tbody>
        </table>
      </div>`, 'homework')}
    <p class="d-footnote">化学、物理收缴率偏低，建议晚自习前集中督促，并反馈家长。</p>`;
  return drawerShell('homework', '作业收缴', `${fmtDate(h.date)} · 各科收缴率`, body, 'homework');
}

function patrolDrawer() {
  const p = D.patrol();
  const rows = p.records.map(r => `
    <tr>
      <td>${r.time}</td><td>${r.area}</td>
      <td><span class="tag ${r.result === '正常' ? 'tag-ok' : 'tag-warn'}">${r.result}</span></td>
      <td>${r.note || '—'}</td>
    </tr>`).join('');
  const body = `
    ${sectionBlock('今日巡查记录', `<span class="head-count">${p.records.length} 次</span>`, `
      <div class="table-wrap">
        <table class="mini-table">
          <thead><tr><th>时间</th><th>区域</th><th>结果</th><th>备注</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`, 'patrol-record')}
    ${sectionBlock('异常情况登记', `<span class="head-count">${p.anomalies.length} 条</span>`, plainList(
      p.anomalies.map(x => ({
        name: x.time + ' · ' + x.location,
        sub: `${x.desc}｜处理：${x.action}`,
        meta: '已处理',
        metaCls: 'ok',
        avatarCls: 'warn'
      }))
    ), 'patrol-anomaly')}
    <p class="d-footnote">异常情况均已现场处置并反馈相关班主任，巡查记录支持拍照留档。</p>`;
  return drawerShell('patrol', '课间巡查', `${fmtDate(p.date)} · 安全巡查`, body, 'patrol');
}

function meetingDrawer() {
  const m = D.meetings();
  const planList = m.plan.map(x => `
    <li class="timeline-item">
      <span class="timeline-date">${x.date}</span>
      <div class="timeline-main">
        <strong>${x.topic}</strong>
        <span class="tag tag-blue">${x.type}</span>
      </div>
    </li>`).join('');
  const heldList = m.held.map(x => `
    <div class="record-card">
      <div class="record-head">
        <div><strong>${x.topic}</strong><span>${x.date} · ${x.type}</span></div>
        <span class="tag tag-ok">已开展</span>
      </div>
      <p>${x.summary}</p>
      ${x.photos && x.photos.length ? photoGrid(x.photos, x.topic) : ''}
    </div>`).join('');
  const body = `
    ${sectionBlock('本学期班会计划', `<span class="head-count">${m.plan.length} 场</span>`,
      `<ul class="timeline">${planList}</ul>`, 'meeting-plan')}
    ${sectionBlock('已开展班会记录', `<span class="head-count">${m.held.length} 场</span>`,
      `<div class="record-list">${heldList}</div>`, 'meeting-held')}`;
  return drawerShell('meeting', '主题班会', classInfo().semester, body, 'meeting');
}

function communicationDrawer() {
  const c = D.communication();
  const body = `
    ${sectionBlock('家长沟通记录', `<span class="head-count">${c.records.length} 条</span>`, plainList(
      c.records.map(x => ({
        name: `${x.date} · ${x.student}`,
        sub: `${x.method}：${x.content}`,
        meta: x.result,
        metaCls: 'ok'
      }))
    ), 'communication-record')}
    ${sectionBlock('重点关注学生家访计划', `<span class="head-count">${c.visits.length} 项</span>`, `
      <div class="table-wrap">
        <table class="mini-table">
          <thead><tr><th>学生</th><th>家访原因</th><th>计划日期</th><th>状态</th></tr></thead>
          <tbody>${c.visits.map(v => `
            <tr>
              <td><strong>${v.student}</strong></td>
              <td>${v.reason}</td>
              <td>${v.planDate}</td>
              <td><span class="tag tag-warn">${v.status}</span></td>
            </tr>`).join('')}</tbody>
        </table>
      </div>`, 'communication-visit')}`;
  return drawerShell('communication', '家校沟通', '沟通记录 · 家访计划', body, 'communication');
}

function growthDrawer() {
  const g = D.growth();
  const body = `
    ${statGrid([
      { v: g.archiveDone + '/' + studentCount(), l: '成长档案完成', cls: 'ok', sub: `完整度 ${g.archiveRate}%` },
      { v: g.tutoringCount + ' 人次', l: '个性化辅导', cls: 'good' }
    ])}
    ${sectionBlock('个性化辅导记录', `<span class="head-count">最近 ${g.records.length} 条</span>`, plainList(
      g.records.map(x => ({
        name: `${x.date} · ${x.student}`,
        sub: `${x.type}：${x.content}`,
        meta: x.type,
        metaCls: 'blue'
      }))
    ), 'growth-record')}
    <p class="d-footnote">成长档案支持记录学业、心理、行为习惯等维度，形成学生成长轨迹。</p>`;
  return drawerShell('growth', '学生成长', '成长档案 · 个性化辅导', body, 'growth');
}

function activityDrawer() {
  const a = D.activities();
  const upcoming = a.upcoming.map(x => `
    <li class="timeline-item">
      <span class="timeline-date">${x.date}</span>
      <div class="timeline-main">
        <strong>${x.name}</strong>
        <span class="note-text">${x.note}</span>
      </div>
    </li>`).join('');
  const heldList = a.held.map(x => `
    <div class="record-card">
      <div class="record-head">
        <div><strong>${x.name}</strong><span>${x.date}</span></div>
        <span class="tag tag-ok">已开展</span>
      </div>
      <p>${x.summary}</p>
      ${x.photos && x.photos.length ? photoGrid(x.photos, x.name) : ''}
    </div>`).join('');
  const body = `
    ${sectionBlock('近期活动策划', `<span class="head-count">${a.upcoming.length} 项</span>`,
      `<ul class="timeline">${upcoming}</ul>`, 'activity-upcoming')}
    ${sectionBlock('活动开展记录', `<span class="head-count">${a.held.length} 场</span>`,
      `<div class="record-list">${heldList}</div>`, 'activity-held')}`;
  return drawerShell('activity', '班级活动', '活动策划 · 开展记录 · 照片', body, 'activity');
}

function photoGrid(files, alt) {
  return `<div class="photo-grid">${files.map(f => `
    <figure>
      <img src="assets/photos/${f}" alt="${esc(alt)}" loading="lazy">
      <figcaption>${esc(alt)}</figcaption>
    </figure>`).join('')}</div>`;
}

function studentDrawer(sid) {
  const s = D.studentById()[sid];
  if (!s) return '';
  const seatNo = s.row > 0 ? s.row * 10 + s.col : '—';
  const seatText = s.row > 0 ? `第 ${s.row} 排 第 ${s.col} 列（座位号 ${seatNo}）` : '未安排座位';
  const notes = [
    ...D.growth().records.filter(r => r.student === s.name).map(r => `${r.date} ${r.type}：${r.content}`),
    ...D.communication().records.filter(r => r.student === s.name).map(r => `${r.date} 家校沟通（${r.method}）：${r.content}`),
    ...D.discipline().praise.filter(r => r.name === s.name).map(r => `${r.scene}表扬：${r.reason}`),
    ...D.discipline().focus.filter(r => r.name === s.name).map(r => `重点关注：${r.issue}`)
  ];
  const body = `
    <div class="student-hero">
      <span class="student-avatar">${avatar(s.name)}</span>
      <div>
        <h3>${s.name}</h3>
        <div class="student-chips">
          <span class="tag tag-blue">${s.gender}</span>
          <span class="tag tag-green">第 ${s.group} 组</span>
          ${s.role ? `<span class="tag tag-cream">${s.role}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="d-section">
      <button class="btn primary" id="studentEditBtn" type="button">编辑档案</button>
    </div>
    <ul class="info-list">
      <li><span>学籍号</span><strong>${s.stuNo || '—'}</strong></li>
      <li><span>座位</span><strong>${seatText}</strong></li>
      <li><span>小组</span><strong>第 ${s.group} 组</strong></li>
      <li><span>班委职务</span><strong>${s.role || '无'}</strong></li>
      <li><span>家长姓名</span><strong>${s.parent}</strong></li>
      <li><span>联系电话</span><strong>${s.phone}</strong></li>
    </ul>
    ${sectionBlock('最近记录', '', notes.length
      ? `<ul class="note-list">${notes.map(n => `<li>${n}</li>`).join('')}</ul>`
      : '<p class="empty">暂无个性化记录</p>')}`;
  return drawerShell('user', s.name, `第 ${s.group} 组 · 座位 ${seatNo}`, body);
}

/* ---------- 抽屉开关 ---------- */
function openDrawer(key) {
  state.drawerKey = key;
  const app = byId('app');
  byId('drawer').innerHTML = drawerFor(key);
  app.classList.add('drawer-open');
  document.body.classList.add('drawer-lock');
  const closeBtn = byId('drawerClose');
  if (closeBtn) closeBtn.focus();
  const editBtn = byId('drawerEditBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      state.drawerEditing = !state.drawerEditing;
      openDrawer(state.drawerKey);
    });
  }
  const rollBtn = byId('rollcallBtn');
  if (rollBtn) rollBtn.addEventListener('click', openRollCall);
  const stuEditBtn = byId('studentEditBtn');
  if (stuEditBtn) {
    stuEditBtn.addEventListener('click', () => {
      const sid = state.drawerKey.replace('student:', '');
      closeDrawer();
      openStudentForm(sid);
    });
  }
  if (state.drawerEditing) enableDrawerEdit(key);
}

function closeDrawer() {
  byId('app').classList.remove('drawer-open');
  document.body.classList.remove('drawer-lock');
}

function refreshDrawer(key) {
  openDrawer(key);
}

/* ============================================================
 * 工作数据编辑（抽屉内增删）
 * ============================================================ */
const EDITOR_FORMS = {
  'attendance-late': {
    title: '添加迟到记录',
    fields: [
      { k: 'name', label: '学生姓名' },
      { k: 'time', label: '迟到时间', placeholder: '如 07:42' }
    ]
  },
  'attendance-leave': {
    title: '添加请假记录',
    fields: [
      { k: 'name', label: '学生姓名' },
      { k: 'reason', label: '请假原因', placeholder: '如 病假' }
    ]
  },
  'attendance-absent': {
    title: '添加缺勤记录',
    fields: [
      { k: 'name', label: '学生姓名' },
      { k: 'note', label: '备注', placeholder: '如 未请假，待核实' }
    ]
  },
  'discipline-praise': {
    title: '添加表扬记录',
    fields: [
      { k: 'name', label: '学生姓名' },
      { k: 'scene', label: '场合', placeholder: '如 数学课' },
      { k: 'reason', label: '表扬原因' }
    ]
  },
  'discipline-focus': {
    title: '添加需关注学生',
    fields: [
      { k: 'name', label: '学生姓名' },
      { k: 'issue', label: '问题表现' },
      { k: 'note', label: '跟进建议' }
    ]
  },
  'patrol-record': {
    title: '添加巡查记录',
    fields: [
      { k: 'time', label: '时间', placeholder: '如 09:40–09:45' },
      { k: 'area', label: '区域' },
      { k: 'result', label: '结果', type: 'select', options: ['正常', '发现异常'] },
      { k: 'note', label: '备注' }
    ]
  },
  'patrol-anomaly': {
    title: '登记异常情况',
    fields: [
      { k: 'time', label: '时间' },
      { k: 'location', label: '地点' },
      { k: 'desc', label: '情况描述' },
      { k: 'action', label: '处理措施' }
    ]
  },
  'meeting-plan': {
    title: '添加班会计划',
    fields: [
      { k: 'date', label: '日期', placeholder: '如 09-01' },
      { k: 'topic', label: '主题' },
      { k: 'type', label: '类型', placeholder: '如 主题班会' }
    ]
  },
  'meeting-held': {
    title: '添加班会记录',
    fields: [
      { k: 'date', label: '日期', placeholder: '如 08-20' },
      { k: 'topic', label: '主题' },
      { k: 'type', label: '类型' },
      { k: 'summary', label: '内容摘要', type: 'textarea' }
    ]
  },
  'communication-record': {
    title: '添加沟通记录',
    fields: [
      { k: 'date', label: '日期', placeholder: '如 08-22' },
      { k: 'student', label: '学生姓名' },
      { k: 'method', label: '沟通方式', placeholder: '如 电话 / 微信 / 面谈' },
      { k: 'content', label: '沟通内容', type: 'textarea' },
      { k: 'result', label: '结果', placeholder: '如 已沟通' }
    ]
  },
  'communication-visit': {
    title: '添加家访计划',
    fields: [
      { k: 'student', label: '学生姓名' },
      { k: 'reason', label: '家访原因' },
      { k: 'planDate', label: '计划日期', placeholder: '如 09-05' },
      { k: 'status', label: '状态', placeholder: '如 待安排' }
    ]
  },
  'growth-record': {
    title: '添加辅导记录',
    fields: [
      { k: 'date', label: '日期' },
      { k: 'student', label: '学生姓名' },
      { k: 'type', label: '类型', placeholder: '如 学业辅导 / 心理疏导' },
      { k: 'content', label: '内容', type: 'textarea' }
    ]
  },
  'activity-upcoming': {
    title: '添加活动策划',
    fields: [
      { k: 'date', label: '日期' },
      { k: 'name', label: '活动名称' },
      { k: 'note', label: '说明' }
    ]
  },
  'activity-held': {
    title: '添加活动记录',
    fields: [
      { k: 'date', label: '日期' },
      { k: 'name', label: '活动名称' },
      { k: 'summary', label: '内容摘要', type: 'textarea' }
    ]
  }
};

const EDIT_HANDLERS = {
  attendance: {
    late: { get: d => d.late, set: (d, v) => { d.late = v; recomputeAttendance(d); } },
    leave: { get: d => d.leave, set: (d, v) => { d.leave = v; recomputeAttendance(d); } },
    absent: { get: d => d.absent, set: (d, v) => { d.absent = v; recomputeAttendance(d); } }
  },
  discipline: {
    praise: { get: d => d.praise, set: (d, v) => { d.praise = v; d.praiseCount = v.length; } },
    focus: { get: d => d.focus, set: (d, v) => { d.focus = v; d.focusCount = v.length; } }
  },
  patrol: {
    record: { get: d => d.records, set: (d, v) => { d.records = v; } },
    anomaly: { get: d => d.anomalies, set: (d, v) => { d.anomalies = v; } }
  },
  meetings: {
    plan: { get: d => d.plan, set: (d, v) => { d.plan = v; } },
    held: { get: d => d.held, set: (d, v) => { d.held = v; } }
  },
  communication: {
    record: { get: d => d.records, set: (d, v) => { d.records = v; } },
    visit: { get: d => d.visits, set: (d, v) => { d.visits = v; } }
  },
  growth: {
    record: { get: d => d.records, set: (d, v) => { d.records = v; } }
  },
  activities: {
    upcoming: { get: d => d.upcoming, set: (d, v) => { d.upcoming = v; } },
    held: { get: d => d.held, set: (d, v) => { d.held = v; } }
  },
  homework: {}
};

function enableDrawerEdit(key) {
  const module = key.startsWith('student:') ? null : key;
  const body = byId('drawer').querySelector('.drawer-body');
  if (!body || !module || !EDIT_HANDLERS[module]) return;
  body.classList.add('editing');

  qsa('.d-section[data-editor]', body).forEach(section => {
    const type = section.dataset.editor;
    if (type === 'homework') {
      const tbody = section.querySelector('.mini-table tbody');
      if (tbody) qsa('tr', tbody).forEach(tr => {
        const subject = tr.querySelector('td strong').textContent;
        const td = document.createElement('td');
        td.className = 'td-del';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn tiny';
        btn.textContent = '管理';
        btn.addEventListener('click', () => openHomeworkEditor(subject));
        td.appendChild(btn);
        tr.appendChild(td);
      });
      return;
    }
    const [mod, field] = type.split('-');
    if (!EDIT_HANDLERS[mod] || !EDIT_HANDLERS[mod][field]) return;

    const cfg = EDITOR_FORMS[type];
    const head = section.querySelector('.d-section-head');
    if (head && !head.querySelector('.add-item-btn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn tiny add-item-btn';
      btn.textContent = '＋ 添加';
      btn.addEventListener('click', () => openFormModal(cfg, {}, values => addDrawerItem(key, type, values)));
      head.appendChild(btn);
    }

    qsa('.plain-list li', section).forEach((li, idx) => {
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'del-btn';
      del.textContent = '×';
      del.title = '删除';
      del.addEventListener('click', () => deleteDrawerItem(key, type, idx));
      li.appendChild(del);
    });

    const tbody = section.querySelector('.mini-table tbody');
    if (tbody) qsa('tr', tbody).forEach((tr, idx) => {
      const td = document.createElement('td');
      td.className = 'td-del';
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'del-btn';
      del.textContent = '×';
      del.title = '删除';
      del.addEventListener('click', () => deleteDrawerItem(key, type, idx));
      td.appendChild(del);
      tr.appendChild(td);
    });
  });
}

async function addDrawerItem(key, type, values) {
  const [mod, field] = type.split('-');
  const h = EDIT_HANDLERS[mod][field];
  const rec = D[mod]();
  const arr = h.get(rec);
  arr.push(values);
  h.set(rec, arr);
  await saveRecord(mod, rec);
  refreshDrawer(key);
}

async function deleteDrawerItem(key, type, idx) {
  const [mod, field] = type.split('-');
  const h = EDIT_HANDLERS[mod][field];
  const rec = D[mod]();
  const arr = h.get(rec);
  arr.splice(idx, 1);
  h.set(rec, arr);
  await saveRecord(mod, rec);
  refreshDrawer(key);
}

/* ---------- 表单弹窗 ---------- */
function closeFormModal() {
  qsa('.form-modal').forEach(m => m.remove());
}

function showFormError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
}

function fieldHtml(f, val) {
  let input;
  if (f.type === 'select') {
    input = `<select data-k="${f.k}">${f.options.map(o =>
      `<option value="${esc(o)}" ${o === val ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
  } else if (f.type === 'textarea') {
    input = `<textarea data-k="${f.k}" rows="3" placeholder="${f.placeholder || ''}">${esc(val)}</textarea>`;
  } else {
    input = `<input data-k="${f.k}" type="text" value="${esc(val)}" placeholder="${f.placeholder || ''}">`;
  }
  return `<label class="fm-field"><span>${f.label}</span>${input}</label>`;
}

function openFormModal(cfg, values, onSave) {
  closeFormModal();
  const v = {};
  cfg.fields.forEach(f => {
    v[f.k] = (values && values[f.k]) || (f.type === 'select' ? f.options[0] : '');
  });
  const root = document.createElement('div');
  root.className = 'form-modal';
  root.innerHTML = `
    <div class="form-backdrop" data-close></div>
    <div class="form-card card" role="dialog" aria-modal="true">
      <div class="form-head"><h3>${cfg.title}</h3><button class="drawer-close" data-close type="button">${ICONS.x}</button></div>
      <div class="form-body">
        ${cfg.fields.map(f => fieldHtml(f, v[f.k])).join('')}
        <p class="form-error" hidden></p>
      </div>
      <div class="form-actions">
        <button class="btn ghost" data-close type="button">取消</button>
        <button class="btn primary" data-save type="button">保存</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  qsa('[data-close]', root).forEach(el => el.addEventListener('click', closeFormModal));
  const err = root.querySelector('.form-error');
  root.querySelector('[data-save]').addEventListener('click', async () => {
    const out = {};
    for (const f of cfg.fields) {
      const el = root.querySelector(`[data-k="${f.k}"]`);
      out[f.k] = (el.value || '').trim();
      if (f.required !== false && !out[f.k]) {
        showFormError(err, `请填写「${f.label}」`);
        el.focus();
        return;
      }
    }
    closeFormModal();
    await onSave(out);
  });
  const first = root.querySelector('input,select,textarea');
  if (first) first.focus();
}

/* ---------- 作业未交名单编辑 ---------- */
function openHomeworkEditor(subject) {
  closeFormModal();
  const h = D.homework();
  const row = h.subjects.find(s => s.subject === subject);
  if (!row) return;

  const root = document.createElement('div');
  root.className = 'form-modal';
  root.innerHTML = `
    <div class="form-backdrop" data-close></div>
    <div class="form-card card" role="dialog" aria-modal="true">
      <div class="form-head"><h3>${subject} · 未交名单</h3><button class="drawer-close" data-close type="button">${ICONS.x}</button></div>
      <div class="form-body">
        <div class="hw-chips" id="hwChips"></div>
        <div class="hw-add">
          <input id="hwName" type="text" placeholder="输入学生姓名后点添加">
          <button class="btn primary" id="hwAdd" type="button">添加</button>
        </div>
        <p class="form-error" hidden></p>
      </div>
      <div class="form-actions">
        <button class="btn ghost" data-close type="button">取消</button>
        <button class="btn primary" id="hwDone" type="button">完成</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  const chipsEl = root.querySelector('#hwChips');
  const err = root.querySelector('.form-error');
  const renderChips = () => {
    chipsEl.innerHTML = row.missing.map(n => `
      <span class="name-tag">${esc(n)}<button class="del-btn" data-del="${esc(n)}" type="button">×</button></span>
    `).join('') || '<span class="empty">暂无未交</span>';
    qsa('[data-del]', chipsEl).forEach(btn => {
      btn.addEventListener('click', () => {
        row.missing = row.missing.filter(n => n !== btn.dataset.del);
        renderChips();
      });
    });
  };
  renderChips();

  root.querySelector('#hwAdd').addEventListener('click', () => {
    const name = (root.querySelector('#hwName').value || '').trim();
    if (!name) { showFormError(err, '请输入学生姓名'); return; }
    if (row.missing.includes(name)) { showFormError(err, `「${name}」已在名单中`); return; }
    row.missing.push(name);
    root.querySelector('#hwName').value = '';
    err.hidden = true;
    renderChips();
  });
  root.querySelector('#hwDone').addEventListener('click', async () => {
    recomputeHomework(h);
    await saveRecord('homework', h);
    closeFormModal();
    refreshDrawer('homework');
  });
  qsa('[data-close]', root).forEach(el => el.addEventListener('click', closeFormModal));
}

/* ============================================================
 * 座次表页面
 * ============================================================ */
function seatButton(s) {
  const seatNo = s.row > 0 ? s.row * 10 + s.col : '—';
  return `
    <button class="seat g${s.group}${state.seatEditMode ? ' editable' : ''}${state.seatMoveSource === s.id ? ' move-source' : ''}"
      data-sid="${s.id}" data-group="${s.group}" data-row="${s.row}" data-col="${s.col}"
      title="${s.name} · 第${s.group}组 · 座位 ${seatNo}" type="button">
      <span class="seat-name">${s.name}</span>
      <span class="seat-g">${s.group}</span>
    </button>`;
}

function seatCell(rowNo, colNo) {
  const s = D.students().find(x => x.row === rowNo && x.col === colNo);
  if (s) return seatButton(s);
  return `
    <button class="seat seat-empty${state.seatEditMode ? ' empty-clickable' : ''}"
      data-row="${rowNo}" data-col="${colNo}" data-empty="1"
      title="${state.seatEditMode ? '点击在此新增学生' : '空位'}" type="button">
      ${state.seatEditMode ? '<span class="seat-name seat-empty-name">＋ 空位</span>' : ''}
    </button>`;
}

function classroomDims() {
  const c = (AppData.settings && AppData.settings.classroom) || CLASSROOM_DEFAULT;
  const rows = Math.min(Math.max(parseInt(c.rows, 10) || 6, 1), 12);
  const cols = Math.min(Math.max(parseInt(c.cols, 10) || 8, 1), 16);
  return { rows, cols };
}

function seatRow(rowNo, cols) {
  let cellsHtml = '';
  for (let c = 1; c <= cols; c += 1) {
    cellsHtml += seatCell(rowNo, c);
    if (c % 2 === 0 && c !== cols) cellsHtml += '<span class="aisle"></span>';
  }
  return `
    <div class="seat-row${rowNo === 4 ? ' row-gap' : ''}">
      <span class="row-label">${rowNo}排</span>
      ${cellsHtml}
    </div>`;
}

function renderSeating() {
  const dims = classroomDims();
  const groupChips = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(g => `
    <button class="gchip g${g}" data-group="${g}" type="button">
      ${g ? `<i class="dot"></i>第 ${g} 组` : '全部'}
    </button>`).join('');
  const unseated = D.students().filter(s => !s.row || !s.col);
  const dimOptions = n => Array.from({ length: n }, (_, i) => i + 1).map(v => `<option value="${v}">${v}</option>`).join('');
  const editBar = state.seatEditMode ? `
    <div class="edit-bar card">
      <span class="edit-status" id="editStatus"></span>
      <div class="edit-actions">
        <label class="dims-label">排数 <select id="rowDimSel">${dimOptions(12)}</select></label>
        <label class="dims-label">列数 <select id="colDimSel">${dimOptions(16)}</select></label>
        <button class="btn" id="applyDimsBtn" type="button">调整布局</button>
        <button class="btn ${state.seatMoveMode ? 'primary' : ''}" id="moveBtn" type="button">移动 / 互换</button>
        <button class="btn primary" id="addStudentBtn" type="button">＋ 新增学生</button>
      </div>
    </div>` : '';
  const unseatedPanel = state.seatEditMode && unseated.length ? `
    <div class="unseated-panel card">
      <span>未安排座位（${unseated.length} 人）</span>
      ${unseated.map(s => `<button class="unseated-chip" data-sid="${s.id}" type="button">${s.name} · 第${s.group}组</button>`).join('')}
    </div>` : '';

  byId('content').innerHTML = `
    <div class="page-head">
      <div><h2>座次表</h2><p>${classInfo().className} · ${dims.rows} 排 × ${dims.cols} 列 · 共 ${D.students().length} 名学生</p></div>
      <div class="page-actions">
        <button class="btn ghost" id="seatReset" type="button">重置筛选</button>
      <button class="btn ${state.seatEditMode ? 'primary' : 'ghost'}" id="seatEditBtn" type="button">
        ${state.seatEditMode ? '完成编辑' : '编辑模式'}
      </button>
      </div>
    </div>

    <div class="seat-toolbar card">
      <div class="search-box">
        <span class="search-icon">${ICONS.search}</span>
        <input id="seatSearch" type="search" placeholder="输入学生姓名，定位座位" autocomplete="off" value="${esc(state.seatQuery)}">
        <span class="search-count" id="seatSearchCount"></span>
      </div>
      <div class="group-bar">
        <span class="group-bar-label">小组高亮</span>
        <div class="group-chips" id="groupChips">${groupChips}</div>
      </div>
    </div>

    ${editBar}
    ${unseatedPanel}

    <p class="seat-hint">${state.seatEditMode
      ? '编辑模式：点击座位修改学生信息，点击空位新增学生；开启「移动 / 互换」后先点一名学生，再点目标座位；可在编辑栏随时调整排 / 列。'
      : '点击小组标签可多选高亮；点击任意座位查看学生信息'}</p>

    <div class="podium"><span>讲 台</span></div>
    <div class="seat-map-wrap card">
      <div class="seat-map" id="seatMap">
        ${Array.from({ length: dims.rows }, (_, i) => seatRow(i + 1, dims.cols)).join('')}
      </div>
    </div>`;

  bindSeatEvents();
}

function bindSeatEvents() {
  const search = byId('seatSearch');
  const countEl = byId('seatSearchCount');
  const resetBtn = byId('seatReset');

  qsa('.gchip').forEach(chip => {
    chip.addEventListener('click', () => {
      const g = Number(chip.dataset.group);
      if (g === 0) state.activeGroups.clear();
      else if (state.activeGroups.has(g)) state.activeGroups.delete(g);
      else state.activeGroups.add(g);
      updateSeatFilter(countEl);
    });
  });

  search.addEventListener('input', () => {
    state.seatQuery = search.value.trim();
    updateSeatFilter(countEl);
  });

  search.addEventListener('keydown', e => {
    if (e.key === 'Escape') { search.value = ''; state.seatQuery = ''; updateSeatFilter(countEl); }
  });

  qsa('.seat').forEach(seat => {
    seat.addEventListener('click', () => {
      const sid = seat.dataset.sid;
      if (state.seatEditMode) {
        if (state.seatMoveMode) onMoveSeatClick(seat, sid);
        else if (sid) openStudentForm(sid);
        else openStudentForm(null, Number(seat.dataset.row), Number(seat.dataset.col));
      } else if (sid) {
        openDrawer('student:' + sid);
      }
    });
  });

  qsa('.unseated-chip').forEach(chip => {
    chip.addEventListener('click', () => openStudentForm(chip.dataset.sid));
  });

  const editBtn = byId('seatEditBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      state.seatEditMode = !state.seatEditMode;
      state.seatMoveMode = false;
      state.seatMoveSource = null;
      renderSeating();
    });
  }

  const moveBtn = byId('moveBtn');
  if (moveBtn) {
    moveBtn.addEventListener('click', () => {
      state.seatMoveMode = !state.seatMoveMode;
      state.seatMoveSource = null;
      renderSeating();
    });
  }

  const rowSel = byId('rowDimSel');
  const colSel = byId('colDimSel');
  if (rowSel && colSel) {
    const dims = classroomDims();
    rowSel.value = String(dims.rows);
    colSel.value = String(dims.cols);
    byId('applyDimsBtn').addEventListener('click', () => {
      const rows = Number(rowSel.value);
      const cols = Number(colSel.value);
      const moved = D.students().filter(s => s.row > rows || s.col > cols).length;
      if (!confirm(`将座位布局调整为 ${rows} 排 × ${cols} 列。\n超出范围的 ${moved} 名学生将转为「未安排」，确定吗？`)) return;
      applyClassroomDims(rows, cols);
    });
  }

  const addBtn = byId('addStudentBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const dims = classroomDims();
      const occupied = new Set(D.students().filter(s => s.row > 0).map(s => s.row + '-' + s.col));
      let empty = null;
      for (let r = 1; r <= dims.rows && !empty; r += 1) {
        for (let c = 1; c <= dims.cols; c += 1) {
          if (!occupied.has(r + '-' + c)) { empty = [r, c]; break; }
        }
      }
      openStudentForm(null, empty ? empty[0] : 0, empty ? empty[1] : 0);
    });
  }

  const resetBtnEl = resetBtn;
  if (resetBtnEl) {
    resetBtnEl.addEventListener('click', () => {
      state.activeGroups.clear();
      state.seatQuery = '';
      search.value = '';
      updateSeatFilter(countEl);
    });
  }

  updateSeatFilter(countEl);
  updateMoveUI();
}

async function onMoveSeatClick(seat, sid) {
  if (!state.seatMoveSource) {
    if (!sid) return;
    state.seatMoveSource = sid;
    updateMoveUI();
    return;
  }
  const a = D.studentById()[state.seatMoveSource];
  if (!a || sid === a.id) {
    state.seatMoveSource = null;
    updateMoveUI();
    return;
  }
  if (sid) {
    const b = D.studentById()[sid];
    [a.row, b.row] = [b.row, a.row];
    [a.col, b.col] = [b.col, a.col];
    await saveStudent(a);
    await saveStudent(b);
  } else {
    a.row = Number(seat.dataset.row);
    a.col = Number(seat.dataset.col);
    await saveStudent(a);
  }
  state.seatMoveSource = null;
  renderSeating();
}

function updateMoveUI() {
  const status = byId('editStatus');
  qsa('.seat.move-source').forEach(el => el.classList.remove('move-source'));
  if (state.seatMoveSource) {
    const s = D.studentById()[state.seatMoveSource];
    if (s) {
      const el = document.querySelector(`.seat[data-sid="${state.seatMoveSource}"]`);
      if (el) el.classList.add('move-source');
      if (status) status.textContent = `已选择「${s.name}」→ 请点击目标座位（空位＝移动，学生＝互换，Esc 取消）`;
    }
  } else if (status) {
    status.textContent = '编辑模式：点击座位修改学生信息，点击空位新增学生；开启「移动 / 互换」后可拖动调整。';
  }
}

async function applyClassroomDims(rows, cols) {
  const s = AppData.settings;
  s.classroom = { rows, cols };
  let moved = 0;
  AppData.students.forEach(st => {
    if (st.row > rows || st.col > cols) {
      st.row = 0;
      st.col = 0;
      moved += 1;
    }
  });
  await Store.putRecord('settings', s);
  if (moved) await Store.putStudents(AppData.students);
  renderSeating();
  showToast(`座位布局已调整为 ${rows} 排 × ${cols} 列${moved ? `，${moved} 名学生转为未安排` : ''}`);
}

function updateSeatFilter(countEl) {
  const q = state.seatQuery.toLowerCase();
  const hasGroup = state.activeGroups.size > 0;
  let found = 0;
  let firstName = '';

  qsa('.seat').forEach(el => {
    const nameEl = el.querySelector('.seat-name');
    const name = nameEl ? nameEl.textContent : '';
    const g = Number(el.dataset.group);
    const inGroup = !hasGroup || (g && state.activeGroups.has(g));
    const matched = q && name.toLowerCase().includes(q);
    const isOccupied = !!el.dataset.sid;

    el.classList.toggle('active', isOccupied && inGroup);
    el.classList.toggle('dim', isOccupied && hasGroup && !inGroup);
    el.classList.toggle('found', !!matched);
    if (matched) {
      found += 1;
      if (!firstName) firstName = el;
    }
  });

  qsa('.gchip').forEach(chip => {
    chip.classList.toggle('on', chip.dataset.group !== '0' && state.activeGroups.has(Number(chip.dataset.group)));
  });

  if (q) {
    countEl.textContent = `找到 ${found} 名学生`;
    countEl.classList.add('visible');
    if (firstName) firstName.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  } else if (hasGroup) {
    countEl.textContent = `已高亮 ${state.activeGroups.size} 个小组`;
    countEl.classList.add('visible');
  } else {
    countEl.textContent = '';
    countEl.classList.remove('visible');
  }
}

/* ---------- 学生新增 / 编辑表单 ---------- */
function openStudentForm(sid, defRow, defCol) {
  closeFormModal();
  const s = sid ? D.studentById()[sid] : null;
  const v = s ? Object.assign({}, s) : {
    name: '', gender: '男', group: 1, row: defRow || 0, col: defCol || 0,
    role: '', parent: '', phone: ''
  };
  const dims = classroomDims();
  const rowOptions = ['<option value="0">未安排</option>']
    .concat(Array.from({ length: dims.rows }, (_, i) => i + 1).map(r =>
      `<option value="${r}" ${v.row === r ? 'selected' : ''}>第 ${r} 排</option>`)).join('');
  const colOptions = ['<option value="0">未安排</option>']
    .concat(Array.from({ length: dims.cols }, (_, i) => i + 1).map(c =>
      `<option value="${c}" ${v.col === c ? 'selected' : ''}>第 ${c} 列</option>`)).join('');
  const extraActions = s ? `
    <div class="student-extra">
      ${s.row > 0 ? `<button class="btn" id="unseatBtn" type="button">移除座位</button>` : ''}
      <button class="btn danger-ghost" id="delStudentBtn" type="button">删除学生</button>
    </div>` : '';

  const root = document.createElement('div');
  root.className = 'form-modal';
  root.innerHTML = `
    <div class="form-backdrop" data-close></div>
    <div class="form-card card" role="dialog" aria-modal="true">
      <div class="form-head"><h3>${s ? `编辑学生 · ${s.name}` : '新增学生'}</h3><button class="drawer-close" data-close type="button">${ICONS.x}</button></div>
      <div class="form-body">
        <label class="fm-field"><span>姓名 *</span><input data-k="name" type="text" value="${esc(v.name)}"></label>
        <label class="fm-field"><span>学籍号</span><input data-k="stuNo" type="text" value="${esc(v.stuNo || '')}" placeholder="如 20260001（可留空自动生成）"></label>
        <label class="fm-field"><span>性别</span>
          <select data-k="gender">
            <option ${v.gender === '男' ? 'selected' : ''}>男</option>
            <option ${v.gender === '女' ? 'selected' : ''}>女</option>
          </select>
        </label>
        <label class="fm-field"><span>小组</span>
          <select data-k="group">${[1, 2, 3, 4, 5, 6, 7, 8].map(g =>
            `<option value="${g}" ${v.group === g ? 'selected' : ''}>第 ${g} 组</option>`).join('')}</select>
        </label>
        <label class="fm-field"><span>座位（排）</span><select data-k="row">${rowOptions}</select></label>
        <label class="fm-field"><span>座位（列）</span><select data-k="col" id="colSelect">${colOptions}</select></label>
        <label class="fm-field"><span>班委职务</span><input data-k="role" type="text" value="${esc(v.role)}" placeholder="如 班长（可留空）"></label>
        <label class="fm-field"><span>家长姓名</span><input data-k="parent" type="text" value="${esc(v.parent)}"></label>
        <label class="fm-field"><span>联系电话</span><input data-k="phone" type="text" value="${esc(v.phone)}"></label>
        ${extraActions}
        <p class="form-error" hidden></p>
      </div>
      <div class="form-actions">
        <button class="btn ghost" data-close type="button">取消</button>
        <button class="btn primary" data-save type="button">保存</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  const rowSel = root.querySelector('[data-k="row"]');
  const colSel = root.querySelector('[data-k="col"]');
  const syncCol = () => {
    colSel.disabled = rowSel.value === '0';
    if (rowSel.value === '0') colSel.value = '0';
  };
  if (v.row === 0 || !Array.from({ length: dims.cols }, (_, i) => i + 1).includes(v.col)) colSel.value = '0';
  rowSel.addEventListener('change', syncCol);
  syncCol();

  qsa('[data-close]', root).forEach(el => el.addEventListener('click', closeFormModal));
  const err = root.querySelector('.form-error');

  root.querySelector('[data-save]').addEventListener('click', async () => {
    const name = root.querySelector('[data-k="name"]').value.trim();
    if (!name) { showFormError(err, '请填写学生姓名'); return; }
    const row = Number(rowSel.value);
    const col = Number(colSel.value);
    if (row > 0) {
      if (!col) { showFormError(err, '请选择座位列'); return; }
      const conflict = D.students().find(o => o.id !== (s && s.id) && o.row === row && o.col === col);
      if (conflict) { showFormError(err, `座位（第 ${row} 排 第 ${col} 列）已被「${conflict.name}」占用`); return; }
    }
    const stu = {
      id: s ? s.id : nextStudentId(),
      name,
      stuNo: root.querySelector('[data-k="stuNo"]').value.trim() || '2026' + String(AppData.students.length + 1).padStart(4, '0'),
      gender: root.querySelector('[data-k="gender"]').value,
      group: Number(root.querySelector('[data-k="group"]').value),
      row,
      col: row > 0 ? col : 0,
      role: root.querySelector('[data-k="role"]').value.trim(),
      parent: root.querySelector('[data-k="parent"]').value.trim(),
      phone: root.querySelector('[data-k="phone"]').value.trim()
    };
    await saveStudent(stu);
    closeFormModal();
    render();
  });

  const unseatBtn = root.querySelector('#unseatBtn');
  if (unseatBtn) {
    unseatBtn.addEventListener('click', async () => {
      v.row = 0; v.col = 0;
      await saveStudent(v);
      closeFormModal();
      render();
    });
  }

  const delBtn = root.querySelector('#delStudentBtn');
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      if (confirm(`确定删除学生「${s.name}」吗？此操作不可恢复。`)) {
        await removeStudent(s.id);
        closeFormModal();
        render();
      }
    });
  }
}

/* ============================================================
 * 花名册页面
 * ============================================================ */
function rosterStats() {
  const list = D.students();
  const boys = list.filter(s => s.gender === '男').length;
  const seated = list.filter(s => s.row > 0).length;
  const leaders = list.filter(s => s.role).length;
  return { total: list.length, boys, girls: list.length - boys, seated, unseated: list.length - seated, leaders };
}

function rosterFiltered() {
  const q = state.rosterSearch.toLowerCase();
  const g = state.rosterGroup;
  return D.students().filter(s => {
    const inGroup = g === 0 ? true : g === 99 ? !s.row : s.group === g;
    if (!inGroup) return false;
    if (q && ![s.name, s.stuNo, s.parent, s.phone].some(v => String(v || '').toLowerCase().includes(q))) return false;
    return true;
  }).sort((a, b) => {
    const au = a.row > 0 ? 0 : 1;
    const bu = b.row > 0 ? 0 : 1;
    if (au !== bu) return au - bu;
    if (a.group !== b.group) return a.group - b.group;
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });
}

function renderRoster() {
  const stats = rosterStats();
  const list = rosterFiltered();
  const groupChips = [0, 1, 2, 3, 4, 5, 6, 7, 8, 99].map(g => `
    <button class="gchip${g > 0 && g < 99 ? ` g${g}` : ''}${state.rosterGroup === g ? ' on' : ''}" data-group="${g}" type="button">
      ${g === 0 ? '全部' : g === 99 ? '<i class="dot dot-muted"></i>未安排' : `<i class="dot"></i>第 ${g} 组`}
    </button>`).join('');

  const rows = list.map(s => {
    const seat = s.row > 0 ? `${s.row}排${s.col}列` : '未安排';
    return `
      <tr data-sid="${s.id}">
        <td><strong>${esc(s.stuNo || '—')}</strong></td>
        <td><span class="avatar small">${avatar(s.name)}</span> ${esc(s.name)}</td>
        <td class="td-center">${s.gender}</td>
        <td class="td-center">${s.group}</td>
        <td class="td-center">${seat}</td>
        <td>${esc(s.role || '—')}</td>
        <td>${esc(s.parent || '—')}</td>
        <td>${esc(s.phone || '—')}</td>
        <td class="td-actions">
          <button class="btn tiny" data-view="${s.id}" type="button">查看</button>
          <button class="btn tiny" data-edit="${s.id}" type="button">编辑</button>
          <button class="btn tiny danger" data-del="${s.id}" type="button">删除</button>
        </td>
      </tr>`;
  }).join('');

  byId('content').innerHTML = `
    <div class="page-head">
      <div><h2>花名册</h2><p>${classInfo().className} · 学生档案 · ${stats.total} 人</p></div>
      <div class="page-actions">
        <button class="btn ghost" id="rosterCsvBtn" type="button" title="导出花名册为 CSV">导出 CSV</button>
        <button class="btn ghost" id="rosterXlsxBtn" type="button" title="导出花名册为 Excel">导出 Excel</button>
        <button class="btn primary" id="rosterAddBtn" type="button">＋ 新增学生</button>
      </div>
    </div>

    <div class="roster-stats card">
      <span class="stat-pill"><b>${stats.total}</b> 总人数</span>
      <span class="stat-pill"><b>${stats.boys}</b> 男生</span>
      <span class="stat-pill"><b>${stats.girls}</b> 女生</span>
      <span class="stat-pill"><b>${stats.seated}</b> 已安排座位</span>
      <span class="stat-pill warn"><b>${stats.unseated}</b> 未安排</span>
      <span class="stat-pill"><b>${stats.leaders}</b> 班委</span>
    </div>

    <div class="seat-toolbar card">
      <div class="search-box">
        <span class="search-icon">${ICONS.search}</span>
        <input id="rosterSearch" type="search" placeholder="按姓名 / 学籍号 / 家长 / 电话搜索" autocomplete="off" value="${esc(state.rosterSearch)}">
        <span class="search-count visible" id="rosterCount">${list.length} 人</span>
      </div>
      <div class="group-bar">
        <span class="group-bar-label">按小组筛选</span>
        <div class="group-chips" id="rosterGroupChips">${groupChips}</div>
      </div>
    </div>

    <div class="table-wrap card roster-wrap">
      <table class="mini-table roster-table">
        <thead>
          <tr><th>学籍号</th><th>姓名</th><th class="td-center">性别</th><th class="td-center">小组</th><th class="td-center">座位</th><th>班委职务</th><th>家长姓名</th><th>联系电话</th><th>操作</th></tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="9"><p class="empty">没有匹配的学生</p></td></tr>'}</tbody>
      </table>
    </div>`;

  bindRosterEvents();
}

function bindRosterEvents() {
  const search = byId('rosterSearch');
  search.addEventListener('input', () => {
    state.rosterSearch = search.value.trim();
    renderRoster();
  });

  qsa('#rosterGroupChips .gchip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.rosterGroup = Number(chip.dataset.group);
      renderRoster();
    });
  });

  byId('rosterCsvBtn').addEventListener('click', exportRosterCSV);
  byId('rosterXlsxBtn').addEventListener('click', exportRosterXlsx);
  byId('rosterAddBtn').addEventListener('click', () => openStudentForm(null, 0, 0));

  qsa('.roster-table tbody tr').forEach(tr => {
    tr.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      openDrawer('student:' + tr.dataset.sid);
    });
  });
  qsa('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => openDrawer('student:' + btn.dataset.view));
  });
  qsa('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openStudentForm(btn.dataset.edit));
  });
  qsa('[data-del]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const s = D.studentById()[btn.dataset.del];
      if (!s) return;
      if (!confirm(`确定删除学生「${s.name}」吗？此操作不可恢复。`)) return;
      await removeStudent(s.id);
      renderRoster();
      showToast(`已删除「${s.name}」`);
    });
  });
}

/* ============================================================
 * 课程表页面
 * ============================================================ */
const SUBJECTS = ['语文', '数学', '英语', '物理', '化学', '生物', '道德与法治', '历史', '地理', '体育', '音乐', '美术', '信息技术', '劳动', '班会', '自习'];

const ADJUST_FORM = {
  title: '添加调课记录',
  fields: [
    { k: 'date', label: '日期', placeholder: '如 09-18' },
    { k: 'from', label: '原时间', placeholder: '如 周三 第3节' },
    { k: 'to', label: '调至时间', placeholder: '如 周四 第2节' },
    { k: 'subject', label: '科目', placeholder: '如 数学' },
    { k: 'reason', label: '调课原因', placeholder: '如 公开课 / 教研活动' },
    { k: 'status', label: '状态', type: 'select', options: ['已调', '待执行', '已取消'] }
  ]
};

function renderSchedule() {
  const s = D.schedule();
  const edit = state.scheduleEditMode;
  const dayCols = s.days.map(d => `<th>${d}</th>`).join('');
  const lunchIdx = s.periods.findIndex(p => p.includes('第4节'));
  const periodRows = s.periods.map((period, idx) => {
    const cells = s.days.map(day => {
      const key = `${day}-${period}`;
      const c = s.cells[key];
      return `
        <td>
          <button class="sc-cell${edit ? ' editable' : ''}${c ? '' : ' empty'}" data-key="${key}" data-day="${day}" data-period="${period}" type="button" title="${c ? `${c.subject} · ${c.teacher || ''}` : '空课'}">
            ${c
              ? `<span class="sc-subject">${esc(c.subject)}</span><span class="sc-teacher">${esc(c.teacher || '')}</span>`
              : (edit ? '<span class="sc-empty">＋ 空位</span>' : '<span class="sc-dash">—</span>')}
          </button>
        </td>`;
    }).join('');
    const lunchRow = idx === lunchIdx
      ? `<tr class="lunch-row"><td colspan="${s.days.length + 1}">午 休 · 午餐与休息</td></tr>`
      : '';
    return `<tr><th class="period-label">${period}</th>${cells}</tr>${lunchRow}`;
  }).join('');

  const teacherChips = Object.entries(s.teachers || {}).map(([subj, t]) => `
    <span class="teacher-chip"><b>${esc(subj)}</b><i>${esc(t)}</i></span>`).join('');

  const adjustItems = s.adjustments.map((a, idx) => `
    <div class="adjust-item">
      <div class="adjust-main">
        <strong>${esc(a.subject)} · ${esc(a.from)} → ${esc(a.to)}</strong>
        <span>${esc(a.date)}${a.reason ? '｜' + esc(a.reason) : ''}</span>
      </div>
      <span class="tag ${a.status === '已调' ? 'tag-ok' : a.status === '待执行' ? 'tag-warn' : 'tag-muted'}">${esc(a.status)}</span>
      ${edit ? `<button class="del-btn" data-del-adjust="${idx}" type="button">×</button>` : ''}
    </div>`).join('');

  byId('content').innerHTML = `
    <div class="page-head">
      <div><h2>课程表</h2><p>${classInfo().className} · 周一至周五 · ${s.periods.length} 个时段</p></div>
      <div class="page-actions">
        <button class="btn ghost" id="scheduleExportBtn" type="button" title="导出课程表（CSV / Excel）">导出</button>
        <button class="btn ghost" id="scheduleImportBtn" type="button" title="从 CSV 或 JSON 导入课程表">导入</button>
        <button class="btn ${edit ? 'primary' : 'ghost'}" id="scheduleEditBtn" type="button">${edit ? '完成编辑' : '编辑模式'}</button>
      </div>
    </div>

    <div class="teacher-strip card">
      <div class="teacher-strip-head">任课教师 <span class="head-count">${Object.keys(s.teachers || {}).length} 位</span></div>
      <div class="teacher-chips">${teacherChips}</div>
    </div>

    ${edit ? `
      <div class="edit-bar card">
        <span class="edit-status">编辑模式：点击任意课程格修改课程与任课教师；调课记录可删除</span>
      </div>` : ''}

    <div class="schedule-wrap card">
      <table class="schedule-table">
        <thead><tr><th class="period-head">时间</th>${dayCols}</tr></thead>
        <tbody>${periodRows}</tbody>
      </table>
    </div>

    <div class="adjust-card card">
      <div class="adjust-head">
        <div><h3>调课记录</h3><p>近期调课与换课安排</p></div>
        <button class="btn tiny primary" id="addAdjustBtn" type="button">＋ 添加调课</button>
      </div>
      <div class="adjust-list">${adjustItems || '<p class="empty">暂无调课记录</p>'}</div>
    </div>`;

  bindScheduleEvents();
}

function bindScheduleEvents() {
  const editBtn = byId('scheduleEditBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      state.scheduleEditMode = !state.scheduleEditMode;
      renderSchedule();
    });
  }

  const exportBtn = byId('scheduleExportBtn');
  if (exportBtn) exportBtn.addEventListener('click', () => openExportDialog('schedule'));

  const importBtn = byId('scheduleImportBtn');
  if (importBtn) importBtn.addEventListener('click', openScheduleImportModal);

  qsa('.sc-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      if (!state.scheduleEditMode) return;
      openScheduleCellForm(cell.dataset.day, cell.dataset.period, cell.dataset.key);
    });
  });

  byId('addAdjustBtn').addEventListener('click', () => {
    openFormModal(ADJUST_FORM, {}, async values => {
      const s = D.schedule();
      s.adjustments.push(values);
      await saveRecord('schedule', s);
      renderSchedule();
    });
  });

  qsa('[data-del-adjust]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('确定删除这条调课记录吗？')) return;
      const s = D.schedule();
      s.adjustments.splice(Number(btn.dataset.delAdjust), 1);
      await saveRecord('schedule', s);
      renderSchedule();
      showToast('调课记录已删除');
    });
  });
}

function openScheduleCellForm(day, period, key) {
  closeFormModal();
  const s = D.schedule();
  const cur = s.cells[key];
  const values = {
    subject: cur ? cur.subject : '',
    teacher: cur ? (cur.teacher || (s.teachers[cur.subject] || '')) : ''
  };
  const subjectOptions = ['<option value="">（清除该课）</option>']
    .concat(SUBJECTS.map(sub => `<option value="${esc(sub)}" ${values.subject === sub ? 'selected' : ''}>${sub}</option>`)).join('');

  const root = document.createElement('div');
  root.className = 'form-modal';
  root.innerHTML = `
    <div class="form-backdrop" data-close></div>
    <div class="form-card card" role="dialog" aria-modal="true">
      <div class="form-head"><h3>编辑课程</h3><button class="drawer-close" data-close type="button">${ICONS.x}</button></div>
      <div class="form-body">
        <p class="sc-edit-info">${day} · ${period}</p>
        <label class="fm-field"><span>科目</span><select data-k="subject">${subjectOptions}</select></label>
        <label class="fm-field"><span>任课教师</span><input data-k="teacher" type="text" value="${esc(values.teacher)}" placeholder="如 李老师"></label>
        <p class="form-error" hidden></p>
      </div>
      <div class="form-actions">
        <button class="btn ghost" data-close type="button">取消</button>
        <button class="btn primary" data-save type="button">保存</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  qsa('[data-close]', root).forEach(el => el.addEventListener('click', closeFormModal));
  root.querySelector('[data-save]').addEventListener('click', async () => {
    const subject = root.querySelector('[data-k="subject"]').value;
    const teacher = root.querySelector('[data-k="teacher"]').value.trim();
    if (!subject) {
      delete s.cells[key];
    } else {
      s.cells[key] = { subject, teacher };
      if (teacher) s.teachers[subject] = teacher;
    }
    await saveRecord('schedule', s);
    closeFormModal();
    renderSchedule();
    showToast(subject ? `已设置：${day} ${period} ${subject}` : `已清除：${day} ${period}`);
  });
  root.querySelector('[data-k="teacher"]').focus();
}

/* ---------- 课程表导入 / 导出 ---------- */
function parseScheduleCSV(text) {
  const lines = String(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) throw new Error('文件内容为空');
  const rows = lines.map(l => l.split(/[,\t，]/).map(c => c.trim()));
  return scheduleFromGrid(rows);
}

function scheduleFromGrid(rows) {
  const grid = rows.filter(r => r.some(c => c !== ''));
  if (!grid.length) throw new Error('文件内容为空');
  const dayAlias = {
    '周一': '周一', '星期一': '周一', '周一 ': '周一',
    '周二': '周二', '星期二': '周二',
    '周三': '周三', '星期三': '周三',
    '周四': '周四', '星期四': '周四',
    '周五': '周五', '星期五': '周五',
    '周六': '周六', '星期六': '周六'
  };

  let days = grid[0].slice(1).map(h => dayAlias[h] || h);
  let dataRows = grid.slice(1);

  // 若首行不是日期表头（如直接从“早读”开始），按默认周一~周五处理
  if (!dayAlias[grid[0][1]]) {
    days = ['周一', '周二', '周三', '周四', '周五'];
    dataRows = grid;
  }
  days = days.slice(0, 6);
  if (!days.length) throw new Error('未识别到日期列，请确认首行是 时段,周一,周二… 的表头');

  const periods = [];
  const cells = {};
  dataRows.forEach(r => {
    const period = (r[0] || '').trim();
    if (!period || period.includes('午休')) return;
    periods.push(period);
    days.forEach((day, di) => {
      const raw = (r[di + 1] || '').trim();
      if (!raw || raw === '-' || raw === '—') return;
      const parts = raw.split(/[@/／]/).map(x => x.trim());
      cells[`${day}-${period}`] = {
        subject: parts[0] || raw,
        teacher: parts[1] || ''
      };
    });
  });
  if (!periods.length) throw new Error('未解析到课程行，请确认第一列是时段（早读 / 第1节…）');
  return { days, periods, cells };
}

function parseScheduleJSON(text) {
  const data = JSON.parse(text);
  let sched = null;
  if (data && Array.isArray(data.days) && Array.isArray(data.periods) && data.cells && typeof data.cells === 'object') {
    sched = data;
  } else if (data && data.schedule && Array.isArray(data.schedule.days)) {
    sched = data.schedule;
  } else if (data && data.records && data.records.schedule && Array.isArray(data.records.schedule.days)) {
    sched = data.records.schedule;
  }
  if (!sched) throw new Error('未能识别课程表数据，请使用本应用导出的课程表 JSON 或完整备份文件');
  return sched;
}

function mergeScheduleImport(parsed) {
  const s = D.schedule();
  const teachers = Object.assign({}, s.teachers || {});
  if (parsed.teachers && typeof parsed.teachers === 'object') Object.assign(teachers, parsed.teachers);
  Object.values(parsed.cells || {}).forEach(c => {
    if (c && c.teacher) teachers[c.subject] = c.teacher;
  });
  return {
    days: parsed.days,
    periods: parsed.periods,
    cells: parsed.cells,
    teachers,
    adjustments: Array.isArray(parsed.adjustments) ? parsed.adjustments : (s.adjustments || [])
  };
}

function downloadScheduleCSV() {
  const s = D.schedule();
  const head = '时段,' + s.days.join(',');
  const rows = s.periods.map(p => {
    const cells = s.days.map(d => {
      const c = s.cells[`${d}-${p}`];
      if (!c) return '';
      return c.teacher ? `${c.subject}/${c.teacher}` : c.subject;
    });
    return [p].concat(cells).join(',');
  });
  downloadText('\ufeff' + [head].concat(rows).join('\n'), `课程表-${classInfo().className}.csv`, 'text/csv;charset=utf-8');
  showToast('课程表已导出为 CSV');
}

function downloadScheduleTemplate() {
  const days = ['周一', '周二', '周三', '周四', '周五'];
  const periods = ['早读', '第1节', '第2节', '第3节', '第4节', '第5节', '第6节', '第7节', '第8节'];
  const head = '时段,' + days.join(',');
  const rows = periods.map(p => [p].concat(days.map(() => '')).join(','));
  downloadText('\ufeff' + [head].concat(rows).join('\n'), '课程表模板.csv', 'text/csv;charset=utf-8');
}

function openScheduleImportModal() {
  closeFormModal();
  state.schedImportData = null;
  const root = document.createElement('div');
  root.className = 'form-modal';
  root.innerHTML = `
    <div class="form-backdrop" data-close></div>
    <div class="form-card card" role="dialog" aria-modal="true">
      <div class="form-head"><h3>导入课程表</h3><button class="drawer-close" data-close type="button">${ICONS.x}</button></div>
      <div class="form-body">
        <p class="import-hint">
          <b>CSV 课程表</b>：第一列为时段（早读 / 第1节…），首行为日期（周一…周五），格内写「科目」或「科目/教师」。<br>
          <b>JSON</b>：本应用导出的课程表数据或完整备份文件。
        </p>
        <div class="init-import-area">
          <button class="btn ghost" id="schedTemplateBtn" type="button">下载 CSV 模板</button>
          <label class="file-pick">
            <input type="file" id="schedFile" accept=".csv,.json,text/csv,application/json">
            <span class="btn primary">选择文件</span>
          </label>
          <p id="schedImportStatus" class="init-import-status"></p>
        </div>
        <p class="form-error" id="schedImportError" hidden></p>
      </div>
      <div class="form-actions">
        <button class="btn ghost" data-close type="button">取消</button>
        <button class="btn primary" id="schedImportConfirm" type="button">导入并覆盖</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  qsa('[data-close]', root).forEach(el => el.addEventListener('click', closeFormModal));
  root.querySelector('#schedTemplateBtn').addEventListener('click', downloadScheduleTemplate);

  root.querySelector('#schedFile').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const status = root.querySelector('#schedImportStatus');
    try {
      const text = await file.text();
      state.schedImportData = file.name.toLowerCase().endsWith('.json')
        ? parseScheduleJSON(text)
        : parseScheduleCSV(text);
      const cellCount = Object.keys(state.schedImportData.cells || {}).length;
      status.textContent = `已解析：${state.schedImportData.days.length} 天 × ${state.schedImportData.periods.length} 个时段，共 ${cellCount} 个课程格`;
      status.classList.add('ok');
    } catch (err) {
      state.schedImportData = null;
      status.textContent = '解析失败：' + err.message;
      status.classList.remove('ok');
    }
  });

  root.querySelector('#schedImportConfirm').addEventListener('click', async () => {
    const err = root.querySelector('#schedImportError');
    if (!state.schedImportData) {
      err.textContent = '请先选择并成功解析文件';
      err.hidden = false;
      return;
    }
    const next = mergeScheduleImport(state.schedImportData);
    await saveRecord('schedule', next);
    closeFormModal();
    renderSchedule();
    showToast(`课程表导入成功（${next.days.length} 天 × ${next.periods.length} 个时段）`);
  });
}

/* ============================================================
 * 顶栏「导入数据」中心（备份 / 花名册 / 课程表）
 * ============================================================ */
function downloadAsset(name) {
  const a = document.createElement('a');
  a.href = 'assets/templates/' + name;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ---------- 浏览器内生成 Excel(.xlsx) ---------- */
let _crcTable = null;
function crc32(buf) {
  if (!_crcTable) {
    _crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      _crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i += 1) crc = _crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

async function zipDeflate(parts) {
  const enc = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const part of parts) {
    const nameBytes = enc.encode(part.name);
    const data = part.data;
    let comp = data;
    let method = 0;
    if (typeof CompressionStream !== 'undefined' && data.length) {
      try {
        const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'));
        const out = new Uint8Array(await new Response(stream).arrayBuffer());
        if (out.length < data.length) {
          comp = out;
          method = 8;
        }
      } catch (e) { /* 回退到不压缩存储 */ }
    }
    const crc = crc32(data);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0, true);
    local.setUint16(8, method, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, comp.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true);
    const localBytes = new Uint8Array(local.buffer);

    chunks.push(localBytes, nameBytes, comp);
    central.push({
      nameBytes, method, crc,
      compSize: comp.length,
      uncompSize: data.length,
      offset
    });
    offset += localBytes.length + nameBytes.length + comp.length;
  }

  const centralStart = offset;
  let centralSize = 0;
  central.forEach(c => {
    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true);
    cd.setUint16(6, 20, true);
    cd.setUint16(8, 0, true);
    cd.setUint16(10, c.method, true);
    cd.setUint32(16, c.crc, true);
    cd.setUint32(20, c.compSize, true);
    cd.setUint32(24, c.uncompSize, true);
    cd.setUint16(28, c.nameBytes.length, true);
    cd.setUint32(42, c.offset, true);
    const cdBytes = new Uint8Array(cd.buffer);
    chunks.push(cdBytes, c.nameBytes);
    centralSize += cdBytes.length + c.nameBytes.length;
  });

  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, central.length, true);
  end.setUint16(10, central.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, centralStart, true);
  chunks.push(new Uint8Array(end.buffer));

  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of chunks) {
    out.set(c, p);
    p += c.length;
  }
  return out;
}

function xlsxCellRef(rowIdx, colIdx) {
  let col = '';
  let n = colIdx;
  while (n >= 0) {
    col = String.fromCharCode(65 + (n % 26)) + col;
    n = Math.floor(n / 26) - 1;
  }
  return col + (rowIdx + 1);
}

function buildSheetXml(header, dataRows, widths) {
  const escXml = s => String(s).replace(/[<>&"']/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;'
  }[c]));
  const cellXml = (r, c, v) => {
    const ref = xlsxCellRef(r, c);
    if (v === null || v === undefined || v === '') return `<c r="${ref}"/>`;
    if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}"><v>${v}</v></c>`;
    return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escXml(v)}</t></is></c>`;
  };
  const allRows = [header].concat(dataRows);
  const colsXml = (widths || []).map((w, i) =>
    `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('');
  const rowsXml = allRows.map((row, r) =>
    `<row r="${r + 1}">${row.map((v, c) => cellXml(r, c, v)).join('')}</row>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>${colsXml}</cols><sheetData>${rowsXml}</sheetData></worksheet>`;
}

async function buildXlsxBlob(sheetName, header, dataRows, widths) {
  const enc = new TextEncoder();
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${String(sheetName).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]))}" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;
  const zip = await zipDeflate([
    { name: '[Content_Types].xml', data: enc.encode(contentTypes) },
    { name: '_rels/.rels', data: enc.encode(rels) },
    { name: 'xl/workbook.xml', data: enc.encode(workbook) },
    { name: 'xl/_rels/workbook.xml.rels', data: enc.encode(workbookRels) },
    { name: 'xl/worksheets/sheet1.xml', data: enc.encode(buildSheetXml(header, dataRows, widths)) }
  ]);
  return new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

function openImportDialog() {
  closeFormModal();
  state.importTab = 'backup';
  state.importData = null;
  const root = document.createElement('div');
  root.className = 'form-modal';
  root.innerHTML = `
    <div class="form-backdrop" data-close></div>
    <div class="form-card card import-card" role="dialog" aria-modal="true">
      <div class="form-head"><h3>导入数据</h3><button class="drawer-close" data-close type="button">${ICONS.x}</button></div>
      <div class="form-body">
        <div class="import-tabs">
          <button class="import-tab active" data-tab="backup" type="button">备份恢复</button>
          <button class="import-tab" data-tab="roster" type="button">花名册</button>
          <button class="import-tab" data-tab="schedule" type="button">课程表</button>
        </div>

        <div class="import-pane active" data-pane="backup">
          <p class="import-hint">选择本应用导出的 <b>JSON 备份</b>，整体恢复全部数据（学生、工作记录、课程表、设置）。</p>
          <div class="init-import-area">
            <label class="file-pick">
              <input type="file" id="impBackupFile" accept=".json,application/json">
              <span class="btn primary">选择 JSON 备份</span>
            </label>
            <p id="impBackupStatus" class="init-import-status"></p>
          </div>
        </div>

        <div class="import-pane" data-pane="roster">
          <p class="import-hint">从 <b>CSV / Excel</b> 导入花名册，将<b>替换当前学生名单</b>。列顺序：姓名、性别、小组、排、列、班委职务、家长姓名、联系电话。</p>
          <div class="init-import-area">
            <div class="import-tpl-row">
              <button class="btn ghost" data-tpl="roster-csv" type="button">下载 CSV 模板</button>
              <button class="btn ghost" data-tpl="roster-xlsx" type="button">下载 Excel 模板</button>
            </div>
            <label class="file-pick">
              <input type="file" id="impRosterFile" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
              <span class="btn primary">选择文件</span>
            </label>
            <p id="impRosterStatus" class="init-import-status"></p>
          </div>
        </div>

        <div class="import-pane" data-pane="schedule">
          <p class="import-hint">从 <b>CSV / Excel</b> 导入课程表，覆盖当前课表；任课教师合并更新、调课记录保留。格内写「科目」或「科目/教师」。</p>
          <div class="init-import-area">
            <div class="import-tpl-row">
              <button class="btn ghost" data-tpl="schedule-csv" type="button">下载 CSV 模板</button>
              <button class="btn ghost" data-tpl="schedule-xlsx" type="button">下载 Excel 模板</button>
            </div>
            <label class="file-pick">
              <input type="file" id="impSchedFile" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
              <span class="btn primary">选择文件</span>
            </label>
            <p id="impSchedStatus" class="init-import-status"></p>
          </div>
        </div>

        <p class="form-error" id="impError" hidden></p>
      </div>
      <div class="form-actions">
        <button class="btn ghost" data-close type="button">取消</button>
        <button class="btn primary" id="impConfirm" type="button">导入</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  qsa('[data-close]', root).forEach(el => el.addEventListener('click', closeFormModal));

  qsa('.import-tab', root).forEach(btn => {
    btn.addEventListener('click', () => {
      state.importTab = btn.dataset.tab;
      state.importData = null;
      qsa('.import-tab', root).forEach(b => b.classList.toggle('active', b === btn));
      qsa('.import-pane', root).forEach(p => p.classList.toggle('active', p.dataset.pane === state.importTab));
      root.querySelector('#impError').hidden = true;
    });
  });

  const tplMap = {
    'roster-csv': downloadRosterTemplate,
    'roster-xlsx': () => downloadAsset('花名册模板.xlsx'),
    'schedule-csv': downloadScheduleTemplate,
    'schedule-xlsx': () => downloadAsset('课程表模板.xlsx')
  };
  qsa('[data-tpl]', root).forEach(btn => {
    btn.addEventListener('click', () => tplMap[btn.dataset.tpl]());
  });

  const parseFile = async (file, statusEl) => {
    const lower = file.name.toLowerCase();
    if (state.importTab === 'backup') {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.students)) throw new Error('JSON 不是有效的备份文件');
      state.importData = { type: 'backup', data };
      statusEl.textContent = `已解析备份：${data.students.length} 名学生`;
    } else if (state.importTab === 'roster') {
      const students = lower.endsWith('.xlsx')
        ? studentsFromGrid(await parseXlsxGrid(await file.arrayBuffer()))
        : parseRosterCSV(await file.text());
      state.importData = { type: 'roster', students };
      statusEl.textContent = `已解析花名册：${students.length} 名学生`;
    } else {
      const parsed = lower.endsWith('.xlsx')
        ? scheduleFromGrid(await parseXlsxGrid(await file.arrayBuffer()))
        : parseScheduleCSV(await file.text());
      state.importData = { type: 'schedule', parsed };
      statusEl.textContent = `已解析课程表：${parsed.days.length} 天 × ${parsed.periods.length} 个时段`;
    }
    statusEl.classList.add('ok');
  };

  const bindFile = (id, statusId) => {
    root.querySelector('#' + id).addEventListener('change', async e => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      const statusEl = root.querySelector('#' + statusId);
      try {
        await parseFile(file, statusEl);
      } catch (err) {
        state.importData = null;
        statusEl.textContent = '解析失败：' + err.message;
        statusEl.classList.remove('ok');
      }
    });
  };
  bindFile('impBackupFile', 'impBackupStatus');
  bindFile('impRosterFile', 'impRosterStatus');
  bindFile('impSchedFile', 'impSchedStatus');

  root.querySelector('#impConfirm').addEventListener('click', async () => {
    const err = root.querySelector('#impError');
    if (!state.importData) {
      err.textContent = '请先选择并成功解析文件';
      err.hidden = false;
      return;
    }
    err.hidden = true;
    try {
      if (state.importData.type === 'backup') {
        await Store.importData(state.importData.data);
        await loadAllData();
        closeFormModal();
        refreshTopMeta();
        render();
        showToast('备份恢复成功');
      } else if (state.importData.type === 'roster') {
        if (!confirm(`将用 ${state.importData.students.length} 名学生替换当前名单（${studentCount()} 人），确定？`)) return;
        await Store.clearStudents();
        await Store.putStudents(state.importData.students);
        AppData.students = state.importData.students;
        closeFormModal();
        render();
        showToast(`花名册导入成功（${state.importData.students.length} 人）`);
      } else {
        const next = mergeScheduleImport(state.importData.parsed);
        await saveRecord('schedule', next);
        closeFormModal();
        render();
        showToast(`课程表导入成功（${next.days.length} 天 × ${next.periods.length} 个时段）`);
      }
    } catch (e) {
      err.textContent = '导入失败：' + e.message;
      err.hidden = false;
    }
  });
}

/* ============================================================
 * 顶栏「导出数据」中心（花名册 / 课程表 / 完整备份）
 * ============================================================ */
function exportRosterCSV() {
  const header = ['姓名', '性别', '小组', '排', '列', '班委职务', '家长姓名', '联系电话'];
  const rows = AppData.students.map(s => [
    s.name, s.gender, s.group, s.row || '', s.col || '', s.role || '', s.parent || '', s.phone || ''
  ]);
  const csv = '\ufeff' + [header.join(',')].concat(rows.map(r => r.join(','))).join('\n');
  downloadText(csv, `花名册-${classInfo().className}.csv`, 'text/csv;charset=utf-8');
  showToast(`花名册已导出为 CSV（${AppData.students.length} 人）`);
}

function exportRosterXlsx() {
  const rows = AppData.students.map(s => [
    s.name, s.gender, Number(s.group) || 1, s.row || '', s.col || '', s.role || '', s.parent || '', s.phone || ''
  ]);
  buildXlsxBlob('花名册', ['姓名', '性别', '小组', '排', '列', '班委职务', '家长姓名', '联系电话'], rows, [12, 8, 8, 8, 8, 14, 12, 16])
    .then(blob => {
      downloadBlob(blob, `花名册-${classInfo().className}.xlsx`);
      showToast(`花名册已导出为 Excel（${AppData.students.length} 人）`);
    })
    .catch(e => showToast('Excel 导出失败：' + e.message, 'warn'));
}

function exportScheduleXlsx() {
  const s = D.schedule();
  const rows = s.periods.map(p => [p].concat(s.days.map(d => {
    const c = s.cells[`${d}-${p}`];
    if (!c) return '';
    return c.teacher ? `${c.subject}/${c.teacher}` : c.subject;
  })));
  buildXlsxBlob('课程表', ['时段'].concat(s.days), rows, [14].concat(s.days.map(() => 16)))
    .then(blob => {
      downloadBlob(blob, `课程表-${classInfo().className}.xlsx`);
      showToast(`课程表已导出为 Excel（${s.days.length} 天 × ${s.periods.length} 个时段）`);
    })
    .catch(e => showToast('Excel 导出失败：' + e.message, 'warn'));
}

async function exportFullBackup() {
  try {
    const data = await Store.exportData();
    downloadJSON(data, `班主任工作台-${TODAY}-备份.json`);
    showToast('完整备份已导出');
  } catch (e) {
    showToast('导出失败：' + e.message, 'warn');
  }
}

function openExportDialog(initialTab) {
  closeFormModal();
  state.exportTab = initialTab || 'roster';
  const root = document.createElement('div');
  root.className = 'form-modal';
  root.innerHTML = `
    <div class="form-backdrop" data-close></div>
    <div class="form-card card import-card" role="dialog" aria-modal="true">
      <div class="form-head"><h3>导出数据</h3><button class="drawer-close" data-close type="button">${ICONS.x}</button></div>
      <div class="form-body">
        <div class="import-tabs">
          <button class="import-tab" data-tab="roster" type="button">花名册</button>
          <button class="import-tab" data-tab="schedule" type="button">课程表</button>
          <button class="import-tab" data-tab="backup" type="button">完整备份</button>
        </div>

        <div class="import-pane" data-pane="roster">
          <p class="import-hint">当前花名册共 <b>${studentCount()} 名学生</b>，选择格式导出。</p>
          <div class="import-tpl-row">
            <button class="btn primary" data-export="roster-csv" type="button">导出 CSV</button>
            <button class="btn primary" data-export="roster-xlsx" type="button">导出 Excel</button>
          </div>
        </div>

        <div class="import-pane" data-pane="schedule">
          <p class="import-hint">当前课程表为 <b>${D.schedule().days.length} 天 × ${D.schedule().periods.length} 个时段</b>，选择格式导出。</p>
          <div class="import-tpl-row">
            <button class="btn primary" data-export="schedule-csv" type="button">导出 CSV</button>
            <button class="btn primary" data-export="schedule-xlsx" type="button">导出 Excel</button>
          </div>
        </div>

        <div class="import-pane" data-pane="backup">
          <p class="import-hint">导出 <b>JSON 完整备份</b>：包含学生、全部工作记录、课程表、设置，可用于换设备恢复。</p>
          <div class="import-tpl-row">
            <button class="btn primary" data-export="backup-json" type="button">导出 JSON 备份</button>
          </div>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn ghost" data-close type="button">关闭</button>
      </div>
    </div>`;
  document.body.appendChild(root);

  const applyTab = tab => {
    state.exportTab = tab;
    qsa('.import-tab', root).forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    qsa('.import-pane', root).forEach(p => p.classList.toggle('active', p.dataset.pane === tab));
  };
  applyTab(state.exportTab);

  qsa('[data-close]', root).forEach(el => el.addEventListener('click', closeFormModal));
  qsa('.import-tab', root).forEach(btn => {
    btn.addEventListener('click', () => applyTab(btn.dataset.tab));
  });

  const actions = {
    'roster-csv': exportRosterCSV,
    'roster-xlsx': exportRosterXlsx,
    'schedule-csv': downloadScheduleCSV,
    'schedule-xlsx': exportScheduleXlsx,
    'backup-json': exportFullBackup
  };
  qsa('[data-export]', root).forEach(btn => {
    btn.addEventListener('click', () => actions[btn.dataset.export]());
  });
}

/* ============================================================
 * 数据导出 / 导入
 * ============================================================ */
function bindDataTools() {
  byId('exportBtn').addEventListener('click', () => openExportDialog());

  byId('importBtn').addEventListener('click', openImportDialog);

  byId('settingsBtn').addEventListener('click', openSettingsDrawer);
}

function refreshTopMeta() {
  const s = classInfo();
  const className = s.className || s.name || CLASS_INFO.name;
  const semester = s.semester || CLASS_INFO.semester;
  byId('topDate').textContent = `${fmtDate(TODAY)} · ${className}`;
  const c1 = byId('chipClassName');
  if (c1) c1.textContent = className;
  const c2 = byId('chipSemester');
  if (c2) c2.textContent = semester;
}

function downloadJSON(data, name) {
  downloadText(JSON.stringify(data, null, 2), name, 'application/json');
}

function downloadText(text, name, type) {
  const blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
  downloadBlob(blob, name);
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function showToast(msg, type = 'ok') {
  let el = byId('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3200);
}

function fmtDateTime(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ============================================================
 * 设置中心（班级信息 / 自动备份 / 界面 / 数据管理）
 * ============================================================ */
function settingsDrawer() {
  const s = AppData.settings || {};
  const b = s.backup || { enabled: true, frequency: 'daily', keep: 5, lastBackup: null };
  return drawerShell('settings', '设置', '班级信息 · 自动备份 · 数据管理', `
    <div class="d-section">
      <div class="d-section-head"><h3>班级信息</h3></div>
      <div class="settings-fields">
        <label class="fm-field"><span>老师姓名 *</span><input id="setTeacher" type="text" value="${esc(s.teacher || '')}"></label>
        <label class="fm-field"><span>班级名称</span><input id="setClassName" type="text" value="${esc(s.className || '')}"></label>
        <label class="fm-field"><span>学期</span><input id="setSemester" type="text" value="${esc(s.semester || '')}"></label>
      </div>
      <div class="settings-actions"><button class="btn primary" id="saveInfoBtn" type="button">保存班级信息</button></div>
    </div>

    <div class="d-section">
      <div class="d-section-head"><h3>自动备份</h3><span class="head-count" id="backupLast"></span></div>
      <div class="setting-row">
        <div><strong>开启自动备份</strong><span>到达间隔后，打开应用时自动保存一份数据快照</span></div>
        <label class="switch"><input type="checkbox" id="backupEnabled" ${b.enabled ? 'checked' : ''}><i></i></label>
      </div>
      <div class="setting-row">
        <div><strong>备份频率</strong><span>多久自动备份一次</span></div>
        <select id="backupFreq" class="setting-select">
          <option value="daily" ${b.frequency === 'daily' ? 'selected' : ''}>每天一次</option>
          <option value="weekly" ${b.frequency === 'weekly' ? 'selected' : ''}>每周一次</option>
        </select>
      </div>
      <div class="setting-row">
        <div><strong>保留份数</strong><span>本地最多保留的备份数量，超出自动清理最旧的</span></div>
        <select id="backupKeep" class="setting-select">
          ${[3, 5, 10, 20].map(n => `<option value="${n}" ${b.keep === n ? 'selected' : ''}>最近 ${n} 份</option>`).join('')}
        </select>
      </div>
      <div class="settings-actions">
        <button class="btn" id="backupNowBtn" type="button">立即备份</button>
        <button class="btn ghost" id="backupDownloadBtn" type="button">备份并下载</button>
      </div>
      <p class="d-footnote">自动备份保存在本设备浏览器中，不占服务器资源；「备份并下载」可把快照存成 JSON 文件，换设备时用「导入数据」恢复。</p>
    </div>

    <div class="d-section">
      <div class="d-section-head"><h3>备份记录</h3><span class="head-count" id="backupCount"></span></div>
      <div id="backupList" class="backup-list"></div>
    </div>

    <div class="d-section">
      <div class="d-section-head"><h3>界面</h3></div>
      <div class="setting-row">
        <div><strong>侧栏默认折叠</strong><span>下次打开时导航栏默认收起为图标</span></div>
        <label class="switch"><input type="checkbox" id="sidebarCollapsedChk"><i></i></label>
      </div>
    </div>

    <div class="d-section">
      <div class="d-section-head"><h3>数据管理</h3></div>
      <button class="btn danger-ghost" id="wipeBtn" type="button">清空所有数据并重新初始化</button>
      <p class="d-footnote">将删除全部学生、工作记录与本地备份，并回到初始化向导。操作前建议先「备份并下载」。</p>
    </div>
  `);
}

async function openSettingsDrawer() {
  state.drawerKey = 'settings';
  byId('drawer').innerHTML = settingsDrawer();
  byId('app').classList.add('drawer-open');
  document.body.classList.add('drawer-lock');
  const closeBtn = byId('drawerClose');
  if (closeBtn) closeBtn.focus();
  bindSettingsDrawer();
}

function bindSettingsDrawer() {
  const s = AppData.settings;
  const backupConfig = () => ({
    enabled: byId('backupEnabled').checked,
    frequency: byId('backupFreq').value,
    keep: Number(byId('backupKeep').value),
    lastBackup: s.backup.lastBackup || null
  });

  const saveBackupConfig = async () => {
    s.backup = backupConfig();
    await Store.putRecord('settings', s);
    byId('backupLast').textContent = s.backup.lastBackup ? `上次备份 ${fmtDateTime(s.backup.lastBackup)}` : '尚未备份';
  };

  byId('saveInfoBtn').addEventListener('click', async () => {
    const teacher = byId('setTeacher').value.trim();
    if (!teacher) { showToast('请填写老师姓名', 'warn'); return; }
    s.teacher = teacher;
    s.className = byId('setClassName').value.trim() || s.className;
    s.semester = byId('setSemester').value.trim() || s.semester;
    await Store.putRecord('settings', s);
    refreshTopMeta();
    render();
    showToast('班级信息已保存');
  });

  byId('backupEnabled').addEventListener('change', saveBackupConfig);
  byId('backupFreq').addEventListener('change', saveBackupConfig);
  byId('backupKeep').addEventListener('change', saveBackupConfig);

  byId('backupNowBtn').addEventListener('click', async () => {
    await Store.createBackup();
    s.backup.lastBackup = new Date().toISOString();
    await Store.putRecord('settings', s);
    await renderBackupSection();
    showToast('已创建本地备份');
  });

  byId('backupDownloadBtn').addEventListener('click', async () => {
    const snap = await Store.createBackup();
    s.backup.lastBackup = snap.createdAt;
    await Store.putRecord('settings', s);
    await renderBackupSection();
    downloadJSON(snap, `班主任工作台-备份-${fmtDateTime(snap.createdAt).replace(/[: ]/g, '-')}.json`);
    showToast('备份已创建并下载');
  });

  const collapsedChk = byId('sidebarCollapsedChk');
  try { collapsedChk.checked = localStorage.getItem('tw-collapsed') === '1'; } catch (e) { /* 忽略 */ }
  collapsedChk.addEventListener('change', () => {
    const collapsed = collapsedChk.checked;
    byId('app').classList.toggle('collapsed', collapsed);
    try { localStorage.setItem('tw-collapsed', collapsed ? '1' : '0'); } catch (e) { /* 忽略 */ }
    showToast(collapsed ? '导航栏已设为默认折叠' : '导航栏已设为默认展开');
  });

  byId('wipeBtn').addEventListener('click', async () => {
    if (!confirm('确定清空所有数据吗？此操作不可恢复。')) return;
    if (!confirm('再次确认：将删除全部学生、工作记录与备份，并重新初始化。')) return;
    await Store.clearAll();
    AppData.students = [];
    AppData.records = {};
    AppData.settings = null;
    state.needsInit = true;
    closeDrawer();
    showInitScreen();
  });

  renderBackupSection();
}

async function renderBackupSection() {
  const listEl = byId('backupList');
  if (!listEl) return;
  const backups = await Store.getBackups();
  const s = AppData.settings || {};
  byId('backupCount').textContent = `${backups.length} 份`;
  byId('backupLast').textContent = (s.backup && s.backup.lastBackup) ? `上次备份 ${fmtDateTime(s.backup.lastBackup)}` : '尚未备份';

  listEl.innerHTML = backups.length ? backups.map(b => `
    <div class="backup-item">
      <div class="backup-meta">
        <strong>${fmtDateTime(b.createdAt)}</strong>
        <span>${b.students.length} 名学生</span>
      </div>
      <div class="backup-actions">
        <button class="btn tiny" data-restore="${b.id}" type="button">恢复</button>
        <button class="btn tiny" data-dl="${b.id}" type="button">下载</button>
        <button class="btn tiny danger" data-del="${b.id}" type="button">删除</button>
      </div>
    </div>`).join('') : '<p class="empty">暂无备份，点击「立即备份」创建第一份</p>';

  qsa('[data-restore]', listEl).forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('从该备份恢复将覆盖当前所有数据，确定继续？')) return;
      try {
        await Store.restoreBackup(btn.dataset.restore);
        await loadAllData();
        closeDrawer();
        refreshTopMeta();
        render();
        showToast('已从备份恢复');
      } catch (e) {
        showToast('恢复失败：' + e.message, 'warn');
      }
    });
  });
  qsa('[data-dl]', listEl).forEach(btn => {
    btn.addEventListener('click', async () => {
      const b = await Store.getBackup(btn.dataset.dl);
      if (b) downloadJSON(b, `班主任工作台-备份-${fmtDateTime(b.createdAt).replace(/[: ]/g, '-')}.json`);
    });
  });
  qsa('[data-del]', listEl).forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('确定删除这份备份吗？')) return;
      await Store.deleteBackup(btn.dataset.del);
      await renderBackupSection();
      showToast('备份已删除');
    });
  });
}

async function maybeAutoBackup() {
  try {
    const s = AppData.settings;
    if (!s || !s.backup || !s.backup.enabled) return;
    const freqDays = s.backup.frequency === 'weekly' ? 7 : 1;
    const last = s.backup.lastBackup ? new Date(s.backup.lastBackup).getTime() : 0;
    if (Date.now() - last < freqDays * 86400000) return;
    await Store.createBackup();
    s.backup.lastBackup = new Date().toISOString();
    await Store.putRecord('settings', s);
    showToast('已自动备份到本地');
  } catch (e) {
    console.warn('自动备份失败：', e);
  }
}

/* ============================================================
 * 初始化向导 / 班级设置
 * ============================================================ */
function parseRosterCSV(text) {
  const lines = String(text).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) throw new Error('文件内容为空');
  const rows = lines.map(l => l.split(/[,\t，]/).map(c => c.trim()));
  return studentsFromGrid(rows);
}

function studentsFromGrid(grid) {
  let rows = grid.map(r => (r || []).map(c => String(c == null ? '' : c).trim()));
  const head = (rows[0] || []).map(c => c.toLowerCase());
  if (head.some(c => c.includes('姓名') || c.includes('name'))) rows = rows.slice(1);
  return rows.map((cols, i) => {
    const name = cols[0] || '';
    if (!name) throw new Error(`第 ${i + 2} 行缺少姓名`);
    return {
      id: 's' + String(i + 1).padStart(2, '0'),
      name,
      gender: cols[1] || '男',
      group: Number(cols[2]) || 1,
      row: Number(cols[3]) || 0,
      col: Number(cols[4]) || 0,
      role: cols[5] || '',
      parent: cols[6] || '',
      phone: cols[7] || ''
    };
  });
}

/* ---------- Excel(.xlsx) 解析（浏览器内，仅读第一个工作表） ---------- */
function xlsxColToIndex(ref) {
  const letters = String(ref).replace(/[0-9]/g, '');
  let n = 0;
  for (const ch of letters.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

async function inflateRaw(data) {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('当前浏览器不支持 Excel 解析，请另存为 CSV 后导入');
  }
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Response(stream).text();
}

async function parseXlsxGrid(buf) {
  const bytes = new Uint8Array(buf);
  const decoder = new TextDecoder('utf-8');
  const entries = {};
  let p = 0;
  while (p + 30 <= bytes.length && bytes[p] === 0x50 && bytes[p + 1] === 0x4b && bytes[p + 2] === 0x03 && bytes[p + 3] === 0x04) {
    const method = bytes[p + 8] | (bytes[p + 9] << 8);
    const compSize = (bytes[p + 18] | (bytes[p + 19] << 8) | (bytes[p + 20] << 16) | (bytes[p + 21] << 24)) >>> 0;
    const nameLen = bytes[p + 26] | (bytes[p + 27] << 8);
    const extraLen = bytes[p + 28] | (bytes[p + 29] << 8);
    const name = decoder.decode(bytes.subarray(p + 30, p + 30 + nameLen));
    const dataStart = p + 30 + nameLen + extraLen;
    entries[name] = { method, data: bytes.subarray(dataStart, dataStart + compSize) };
    p = dataStart + compSize;
  }
  if (!entries['xl/worksheets/sheet1.xml']) throw new Error('无法读取 Excel 内容（仅支持 .xlsx 格式）');

  const read = async name => {
    const e = entries[name];
    if (!e) return '';
    return e.method === 0 ? decoder.decode(e.data) : inflateRaw(e.data);
  };
  const sheetXml = await read('xl/worksheets/sheet1.xml');
  const stringsXml = await read('xl/sharedStrings.xml');
  const shared = [];
  if (stringsXml) {
    const doc = new DOMParser().parseFromString(stringsXml, 'application/xml');
    shared.push(...Array.from(doc.getElementsByTagNameNS('*', 'si')).map(si =>
      Array.from(si.getElementsByTagNameNS('*', 't')).map(t => t.textContent || '').join('')));
  }

  const sheetDoc = new DOMParser().parseFromString(sheetXml, 'application/xml');
  const rowsEls = Array.from(sheetDoc.getElementsByTagNameNS('*', 'row'));
  if (!rowsEls.length) return [];
  const grid = [];
  rowsEls.forEach(rowEl => {
    const rowIdx = Number(rowEl.getAttribute('r') || 1) - 1;
    grid[rowIdx] = grid[rowIdx] || [];
    Array.from(rowEl.getElementsByTagNameNS('*', 'c')).forEach(cell => {
      const colIdx = xlsxColToIndex(cell.getAttribute('r') || '');
      if (colIdx < 0) return;
      const t = cell.getAttribute('t') || '';
      let val = '';
      if (t === 's') {
        const v = cell.getElementsByTagNameNS('*', 'v')[0];
        if (v) val = shared[Number(v.textContent)] || '';
      } else if (t === 'inlineStr') {
        val = Array.from(cell.getElementsByTagNameNS('*', 't')).map(x => x.textContent || '').join('');
      } else {
        const v = cell.getElementsByTagNameNS('*', 'v')[0];
        if (v) val = v.textContent || '';
      }
      grid[rowIdx][colIdx] = val;
    });
  });
  return grid;
}

function downloadRosterTemplate() {
  const header = ['姓名', '性别', '小组', '排', '列', '班委职务', '家长姓名', '联系电话'].join(',');
  const example = ['张小明', '男', '1', '1', '1', '班长', '张某某', '13800000000'].join(',');
  const blob = new Blob(['\ufeff' + header + '\n' + example + '\n'], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '花名册模板.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function showInitScreen(mode) {
  const editMode = mode === 'settings';
  state.initEditSettings = editMode;
  state.initStep = 1;
  state.initOption = null;
  state.initImport = null;
  const s = classInfo();
  const screen = byId('initScreen');

  if (editMode) {
    screen.innerHTML = `
      <div class="init-brand">
        <div class="brand-logo"><svg viewBox="0 0 24 24"><path d="M4 19.5V5.2A2.2 2.2 0 0 1 6.2 3h11.6A2.2 2.2 0 0 1 20 5.2v14.3"/><path d="M4 19.5A2.2 2.2 0 0 1 6.2 17.3H20"/><path d="M9 8h6M9 12h4"/></svg></div>
        <strong>班主任工作台</strong>
      </div>
      <div class="init-card card">
        <h2>班级设置</h2>
        <p class="init-sub">修改老师与班级信息，不影响已有数据。</p>
        <div class="init-fields">
          <label class="fm-field"><span>老师姓名 *</span><input id="initTeacher" type="text" value="${esc(s.teacher)}"></label>
          <label class="fm-field"><span>班级名称</span><input id="initClassName" type="text" value="${esc(s.className)}"></label>
          <label class="fm-field"><span>学期</span><input id="initSemester" type="text" value="${esc(s.semester)}"></label>
        </div>
        <p class="form-error" id="initError" hidden></p>
        <div class="init-actions">
          <button class="btn ghost" id="initCancel" type="button">取消</button>
          <button class="btn primary" id="initSaveSettings" type="button">保存设置</button>
        </div>
      </div>`;
    screen.hidden = false;
    byId('app').classList.add('app-init');
    byId('initTeacher').focus();
    byId('initCancel').addEventListener('click', hideInitScreen);
    byId('initSaveSettings').addEventListener('click', async () => {
      const err = byId('initError');
      const teacher = byId('initTeacher').value.trim();
      if (!teacher) { err.textContent = '请填写老师姓名'; err.hidden = false; return; }
      const settings = {
        teacher,
        className: byId('initClassName').value.trim() || s.className,
        semester: byId('initSemester').value.trim() || s.semester,
        initializedAt: (AppData.settings && AppData.settings.initializedAt) || new Date().toISOString()
      };
      await Store.putRecord('settings', settings);
      AppData.settings = settings;
      hideInitScreen();
      refreshTopMeta();
      render();
    });
    return;
  }

  screen.innerHTML = `
    <div class="init-brand">
      <div class="brand-logo"><svg viewBox="0 0 24 24"><path d="M4 19.5V5.2A2.2 2.2 0 0 1 6.2 3h11.6A2.2 2.2 0 0 1 20 5.2v14.3"/><path d="M4 19.5A2.2 2.2 0 0 1 6.2 17.3H20"/><path d="M9 8h6M9 12h4"/></svg></div>
      <strong>班主任工作台</strong>
    </div>
    <div class="init-card card">
      <div class="init-progress">
        <span class="step-dot" id="step1">1 · 教师信息</span>
        <span class="step-line"></span>
        <span class="step-dot" id="step2">2 · 初始数据</span>
        <span class="step-line"></span>
        <span class="step-dot" id="step3">3 · 完成</span>
      </div>

      <div class="step-pane active" data-step="1">
        <h2>欢迎使用班主任工作台</h2>
        <p class="init-sub">先填写教师与班级信息，之后随时可在顶栏「班级设置」修改。</p>
        <div class="init-fields">
          <label class="fm-field"><span>老师姓名 *</span><input id="initTeacher" type="text" value="${esc(s.teacher)}"></label>
          <label class="fm-field"><span>班级名称</span><input id="initClassName" type="text" value="${esc(s.className)}"></label>
          <label class="fm-field"><span>学期</span><input id="initSemester" type="text" value="${esc(s.semester)}"></label>
        </div>
        <p class="form-error" id="initError1" hidden></p>
        <div class="init-actions"><button class="btn primary" id="initNext1" type="button">下一步</button></div>
      </div>

      <div class="step-pane" data-step="2">
        <h2>选择初始数据</h2>
        <p class="init-sub">选一种方式初始化班级数据。</p>
        <div class="init-options">
          <button class="init-option" data-opt="import" type="button">
            <b>导入花名册 / 备份</b>
            <span>从 CSV 花名册或本应用导出的 JSON 备份导入</span>
          </button>
          <button class="init-option" data-opt="demo" type="button">
            <b>使用示例班级数据</b>
            <span>一键填充 48 名学生与各模块示例记录，适合先体验</span>
          </button>
          <button class="init-option" data-opt="blank" type="button">
            <b>空白开始</b>
            <span>先建好班级，稍后在座次表手动添加学生</span>
          </button>
        </div>
        <div class="init-import-area" id="initImportArea" hidden>
          <button class="btn ghost" id="initTemplateBtn" type="button">下载花名册模板</button>
          <label class="file-pick">
            <input type="file" id="initFile" accept=".csv,.xlsx,.json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">
            <span class="btn primary">选择文件</span>
          </label>
          <p id="initImportStatus" class="init-import-status"></p>
        </div>
        <p class="form-error" id="initError2" hidden></p>
        <div class="init-actions">
          <button class="btn ghost" id="initBack1" type="button">上一步</button>
          <button class="btn primary" id="initNext2" type="button">下一步</button>
        </div>
      </div>

      <div class="step-pane" data-step="3">
        <h2>确认并完成</h2>
        <p class="init-sub">核对以下信息，点击完成即可进入工作台。</p>
        <ul class="init-summary">
          <li>老师：<strong id="sumTeacher"></strong></li>
          <li>班级：<strong id="sumClass"></strong></li>
          <li>学期：<strong id="sumSemester"></strong></li>
          <li>初始数据：<strong id="sumData"></strong></li>
        </ul>
        <div class="init-actions">
          <button class="btn ghost" id="initBack2" type="button">上一步</button>
          <button class="btn primary" id="initFinish" type="button">完成初始化，进入工作台</button>
        </div>
      </div>
    </div>
    <p class="init-note">数据将保存在本设备浏览器中（IndexedDB），可随时在顶栏「导出数据」备份。</p>`;

  screen.hidden = false;
  byId('app').classList.add('app-init');
  bindInitWizard();
  byId('initTeacher').focus();
}

function bindInitWizard() {
  const goto = step => {
    state.initStep = step;
    qsa('.step-pane').forEach(p => p.classList.toggle('active', Number(p.dataset.step) === step));
    [1, 2, 3].forEach(i => byId('step' + i).classList.toggle('active', i <= step));
  };

  byId('initNext1').addEventListener('click', () => {
    const err = byId('initError1');
    if (!byId('initTeacher').value.trim()) {
      err.textContent = '请填写老师姓名';
      err.hidden = false;
      return;
    }
    err.hidden = true;
    goto(2);
  });

  qsa('.init-option').forEach(opt => {
    opt.addEventListener('click', () => {
      state.initOption = opt.dataset.opt;
      qsa('.init-option').forEach(o => o.classList.toggle('selected', o === opt));
      byId('initImportArea').hidden = state.initOption !== 'import';
      byId('initError2').hidden = true;
    });
  });

  byId('initTemplateBtn').addEventListener('click', downloadRosterTemplate);

  byId('initFile').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const status = byId('initImportStatus');
    try {
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!Array.isArray(data.students)) throw new Error('JSON 不是有效的备份文件');
        state.initImport = data;
        status.textContent = `已解析备份：${data.students.length} 名学生${data.records ? '，含工作记录' : ''}`;
      } else if (lower.endsWith('.xlsx')) {
        const students = studentsFromGrid(await parseXlsxGrid(await file.arrayBuffer()));
        state.initImport = { students, records: null };
        status.textContent = `已解析花名册：${students.length} 名学生`;
      } else {
        const text = await file.text();
        const students = parseRosterCSV(text);
        state.initImport = { students, records: null };
        status.textContent = `已解析花名册：${students.length} 名学生`;
      }
      status.classList.add('ok');
    } catch (err) {
      state.initImport = null;
      status.textContent = '解析失败：' + err.message;
      status.classList.remove('ok');
    }
  });

  byId('initBack1').addEventListener('click', () => goto(1));
  byId('initBack2').addEventListener('click', () => goto(2));

  byId('initNext2').addEventListener('click', () => {
    const err = byId('initError2');
    if (!state.initOption) {
      err.textContent = '请选择一种初始数据方式';
      err.hidden = false;
      return;
    }
    if (state.initOption === 'import' && !state.initImport) {
      err.textContent = '请先选择并解析花名册 / 备份文件';
      err.hidden = false;
      return;
    }
    err.hidden = true;
    byId('sumTeacher').textContent = byId('initTeacher').value.trim();
    byId('sumClass').textContent = byId('initClassName').value.trim() || '未填写';
    byId('sumSemester').textContent = byId('initSemester').value.trim() || '未填写';
    byId('sumData').textContent = state.initOption === 'import'
      ? `导入 ${state.initImport.students.length} 名学生`
      : state.initOption === 'demo' ? '示例班级数据（48 名学生）' : '空白开始';
    goto(3);
  });

  byId('initFinish').addEventListener('click', finishInit);
}

async function putBlankRecords() {
  const blank = {
    attendance: { date: TODAY, total: 0, present: 0, lateCount: 0, leaveCount: 0, absentCount: 0, late: [], leave: [], absent: [] },
    discipline: { week: fmtDate(TODAY) + ' 起', rating: '待更新', praiseCount: 0, remindCount: 0, focusCount: 0, daily: [], praise: [], focus: [] },
    homework: { date: TODAY, subjects: SEED_RECORDS.homework.subjects.map(s => ({ subject: s.subject, rate: 100, missing: [] })) },
    patrol: { date: TODAY, records: [], anomalies: [] },
    meetings: { plan: [], held: [] },
    communication: { records: [], visits: [] },
    growth: { archiveRate: 0, archiveDone: 0, tutoringCount: 0, records: [] },
    activities: { upcoming: [], held: [] },
    schedule: {
      days: ['周一', '周二', '周三', '周四', '周五'],
      periods: ['早读', '第1节', '第2节', '第3节', '第4节', '第5节', '第6节', '第7节', '第8节'],
      cells: {},
      teachers: {},
      adjustments: []
    },
    todos: []
  };
  for (const k of Object.keys(blank)) await Store.putRecord(k, blank[k]);
}

async function finishInit() {
  const settings = {
    teacher: byId('initTeacher').value.trim(),
    className: byId('initClassName').value.trim() || classInfo().className,
    semester: byId('initSemester').value.trim() || classInfo().semester,
    backup: { enabled: true, frequency: 'daily', keep: 5, lastBackup: null },
    classroom: Object.assign({}, CLASSROOM_DEFAULT),
    initializedAt: new Date().toISOString()
  };

  if (state.initOption === 'demo') {
    await Store.clearStudents();
    await Store.clearRecords();
    await Store.putStudents(STUDENTS);
    for (const k of RECORD_KEYS) await Store.putRecord(k, JSON.parse(JSON.stringify(SEED_RECORDS[k])));
  } else if (state.initOption === 'import' && state.initImport) {
    if (state.initImport.records) {
      await Store.importData(state.initImport);
    } else {
      await Store.clearStudents();
      await Store.clearRecords();
      await Store.putStudents(state.initImport.students);
      await putBlankRecords();
    }
  } else {
    await Store.clearStudents();
    await Store.clearRecords();
    await putBlankRecords();
  }

  await Store.putRecord('settings', settings);
  state.needsInit = false;
  await loadAllData();
  hideInitScreen();
  refreshTopMeta();
  buildSidebar();
  render();
}

function hideInitScreen() {
  byId('initScreen').hidden = true;
  byId('app').classList.remove('app-init');
}

/* ---------- 初始化 ---------- */
async function init() {
  refreshTopMeta();

  const todayPop = document.createElement('div');
  todayPop.className = 'today-popover card';
  todayPop.id = 'todayPopover';
  todayPop.hidden = true;
  document.body.appendChild(todayPop);
  todayPop.addEventListener('mouseenter', () => {
    state.todayHover = true;
    clearTimeout(window.__todayHideT);
  });
  todayPop.addEventListener('mouseleave', () => {
    state.todayHover = false;
    scheduleTodayHide();
  });
  document.addEventListener('click', e => {
    if (e.target.closest('#todayPopover') || e.target.closest('#todayCoursesStat')) return;
    hideTodayCourses();
  });
  window.addEventListener('scroll', hideTodayCourses, true);

  const hashPage = location.hash.replace('#', '');
  if (PAGES.some(p => p.key === hashPage)) state.page = hashPage;
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace('#', '');
    if (PAGES.some(p => p.key === h) && h !== state.page) {
      state.page = h;
      buildSidebar();
      render();
      window.scrollTo(0, 0);
    }
  });

  try {
    await loadAllData();
  } catch (e) {
    console.warn('IndexedDB 不可用，本次使用内存数据：', e);
    AppData.students = JSON.parse(JSON.stringify(STUDENTS));
    RECORD_KEYS.forEach(k => { AppData.records[k] = cloneSeed(k); });
    AppData.settings = { teacher: CLASS_INFO.teacher, className: CLASS_INFO.name, semester: CLASS_INFO.semester };
  }

  refreshTopMeta();
  bindDataTools();

  if (state.needsInit) {
    showInitScreen();
    return;
  }

  await maybeAutoBackup();

  byId('collapseBtn').addEventListener('click', toggleSidebarCollapsed);
  byId('menuBtn').addEventListener('click', () => byId('app').classList.add('sidebar-open'));
  byId('drawerBackdrop').addEventListener('click', closeDrawer);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (qsa('.form-modal').length) { closeFormModal(); return; }
      if (state.seatEditMode && state.seatMoveMode && state.seatMoveSource) {
        state.seatMoveSource = null;
        updateMoveUI();
        return;
      }
      if (byId('app').classList.contains('drawer-open')) closeDrawer();
      else byId('app').classList.remove('sidebar-open');
    }
  });

  try {
    if (localStorage.getItem('tw-collapsed') === '1') byId('app').classList.add('collapsed');
  } catch (e) { /* 忽略 */ }

  buildSidebar();
  render();
}

document.addEventListener('DOMContentLoaded', () => { init(); });
