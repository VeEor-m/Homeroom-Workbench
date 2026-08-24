'use strict';

/* ============================================================
 * 数据持久化层 · IndexedDB（零安装，数据保存在浏览器内）
 *
 * 结构：
 *  - students：学生档案（keyPath: id；row/col 为 0 表示未安排座位）
 *  - records ：各工作模块数据（keyPath: key）
 *    记录键：attendance / discipline / homework / patrol /
 *            meetings / communication / growth / activities
 * ============================================================ */

const DB_NAME = 'homeroom-workbench';
const DB_VERSION = 2;

const SEED_RECORDS = {
  attendance: ATTENDANCE,
  discipline: DISCIPLINE,
  homework: HOMEWORK,
  patrol: PATROL,
  meetings: MEETINGS,
  communication: COMMUNICATION,
  growth: GROWTH,
  activities: ACTIVITIES,
  schedule: SCHEDULE,
  todos: TODOS
};
const RECORD_KEYS = Object.keys(SEED_RECORDS);

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

let _db = null;
let _dbPromise = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('当前浏览器不支持 IndexedDB'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('students')) {
        db.createObjectStore('students', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('records')) {
        db.createObjectStore('records', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('backups')) {
        db.createObjectStore('backups', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => {
      _db = req.result;
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}

function runTx(storeName, mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = fn(store);
    tx.oncomplete = () => resolve(req && req.result !== undefined ? req.result : undefined);
    tx.onerror = () => reject(tx.error || new Error('数据库操作失败'));
  }));
}

const Store = {
  /* ---------- 学生 ---------- */
  async getAllStudents() {
    const list = await runTx('students', 'readonly', s => s.getAll());
    return list || [];
  },

  putStudent(stu) {
    return runTx('students', 'readwrite', s => s.put(clone(stu)));
  },

  putStudents(list) {
    return runTx('students', 'readwrite', s => {
      list.forEach(x => s.put(clone(x)));
    });
  },

  deleteStudent(id) {
    return runTx('students', 'readwrite', s => s.delete(id));
  },

  clearStudents() {
    return runTx('students', 'readwrite', s => s.clear());
  },

  /* ---------- 工作记录 ---------- */
  async getRecord(key) {
    const row = await runTx('records', 'readonly', s => s.get(key));
    return row ? row.value : undefined;
  },

  putRecord(key, value) {
    return runTx('records', 'readwrite', s => s.put({ key, value: clone(value) }));
  },

  clearRecords() {
    return runTx('records', 'readwrite', s => s.clear());
  },

  /* ---------- 备份 ---------- */
  async getBackups() {
    const list = await runTx('backups', 'readonly', s => s.getAll());
    return (list || []).sort((a, b) => String(b.id).localeCompare(String(a.id)));
  },

  putBackup(snapshot) {
    return runTx('backups', 'readwrite', s => s.put(clone(snapshot)));
  },

  async getBackup(id) {
    return runTx('backups', 'readonly', s => s.get(id));
  },

  deleteBackup(id) {
    return runTx('backups', 'readwrite', s => s.delete(id));
  },

  clearBackups() {
    return runTx('backups', 'readwrite', s => s.clear());
  },

  async createBackup() {
    const students = await this.getAllStudents();
    const records = {};
    for (const k of RECORD_KEYS) {
      records[k] = await this.getRecord(k);
    }
    const settings = await this.getRecord('settings');
    const id = new Date().toISOString();
    const snapshot = {
      id,
      app: 'homeroom-workbench',
      version: 1,
      createdAt: id,
      students,
      records,
      settings
    };
    await this.putBackup(snapshot);

    // 按保留份数清理最旧的备份
    const keep = (settings && settings.backup && Number(settings.backup.keep)) || 5;
    const backups = await this.getBackups();
    for (const b of backups.slice(keep)) {
      await this.deleteBackup(b.id);
    }
    return snapshot;
  },

  async restoreBackup(id) {
    const backup = await this.getBackup(id);
    if (!backup) throw new Error('备份不存在或已被删除');
    await this.importData(backup);
    return backup;
  },

  clearAll() {
    return Promise.all([
      this.clearStudents(),
      this.clearRecords(),
      this.clearBackups()
    ]);
  },

  /* ---------- 初始化 / 备份 ---------- */
  async seedIfEmpty() {
    const students = await this.getAllStudents();
    if (!students.length) {
      await runTx('students', 'readwrite', s => STUDENTS.forEach(x => s.put(clone(x))));
    }
    for (const k of RECORD_KEYS) {
      const cur = await this.getRecord(k);
      if (cur === undefined) await this.putRecord(k, clone(SEED_RECORDS[k]));
    }
  },

  async resetToSeed() {
    await this.clearStudents();
    await this.clearRecords();
    await this.seedIfEmpty();
  },

  async exportData() {
    const students = await this.getAllStudents();
    const records = {};
    for (const k of RECORD_KEYS) {
      records[k] = await this.getRecord(k);
    }
    return {
      app: 'homeroom-workbench',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: await this.getRecord('settings'),
      classInfo: clone(CLASS_INFO),
      students,
      records
    };
  },

  async importData(data) {
    if (!data || !Array.isArray(data.students)) {
      throw new Error('备份文件格式不正确');
    }
    const students = data.students.map(clone);
    await this.clearStudents();
    await this.clearRecords();
    await this.putStudents(students);
    if (data.records && typeof data.records === 'object') {
      for (const k of RECORD_KEYS) {
        if (data.records[k] !== undefined) await this.putRecord(k, data.records[k]);
      }
    }
    if (data.settings && typeof data.settings === 'object') {
      await this.putRecord('settings', data.settings);
    }
    return { studentCount: students.length };
  }
};

window.Store = Store;
window.SEED_RECORDS = SEED_RECORDS;
window.RECORD_KEYS = RECORD_KEYS;
