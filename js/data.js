// js/data.js — 社交星系数据层
// 数据模型、localStorage 读写、JSON 导入导出

const STORAGE_KEY = 'rainly-social-graph';
const STORAGE_VERSION = 2;
const SAMPLE_PEOPLE_NAMES = ['陈思远', '李雨桐', '王浩然'];

// ═══════════ 默认预设 ═══════════
export const DEFAULT_COLOR_PRESETS = [
  { name: '真诚可靠', color: '#5aae98' },
  { name: '有趣好玩', color: '#ffd93d' },
  { name: '沉稳智慧', color: '#6b8cff' },
  { name: '需要注意', color: '#ff6b6b' },
  { name: '尚未定义', color: '#e8e8e8' },
];

export const RING_NAMES = {
  core: '核心圈',
  close: '好友圈',
  acquaintance: '熟人圈',
  outer: '泛泛之交',
};

export const RING_ORDER = ['core', 'close', 'acquaintance', 'outer'];

// ═══════════ 默认示例数据 ═══════════
function createDefaultData() {
  const people = [
    {
      id: crypto.randomUUID(),
      name: '陈思远',
      ring: 'core',
      tags: ['靠谱', '智慧'],
      color: '#5aae98',
      size: 0.9,
      connections: [],
      note: '大学室友，现在在字节做后端。为人踏实，话不多但关键时刻靠得住。',
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: '李雨桐',
      ring: 'close',
      tags: ['有趣'],
      color: '#ffd93d',
      size: 0.7,
      connections: [],
      note: '',
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: '王浩然',
      ring: 'acquaintance',
      tags: ['沉稳'],
      color: '#6b8cff',
      size: 0.5,
      connections: [],
      note: '',
      createdAt: new Date().toISOString(),
    },
  ];

  seedSampleConnections(people);

  return {
    version: STORAGE_VERSION,
    people,
    settings: createDefaultSettings(),
  };
}

// ═══════════ 状态 ═══════════
let state = null;
let listeners = [];

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(f => f !== fn); };
}

function notify() {
  listeners.forEach(fn => fn(state));
}

// ═══════════ 加载数据 ═══════════
export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.people && parsed.settings) {
        state = normalizeState(parsed);
        return state;
      }
    }
  } catch (e) {
    console.warn('Failed to load social graph data, using defaults', e);
  }
  state = createDefaultData();
  saveData();
  return state;
}

// ═══════════ 保存数据 ═══════════
export function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save data to localStorage', e);
    showToast('保存失败，存储空间可能已满');
  }
}

// ═══════════ 人物 CRUD ═══════════
export function getPeople() {
  return state.people;
}

export function getPerson(id) {
  return state.people.find(p => p.id === id);
}

export function addPerson(person) {
  const newPerson = {
    id: crypto.randomUUID(),
    name: person.name || '新人物',
    ring: person.ring || 'acquaintance',
    tags: person.tags || [],
    color: person.color || state.settings.colorPresets[4]?.color || '#e8e8e8',
    size: person.size ?? 0.5,
    connections: person.connections || [],
    note: person.note || '',
    createdAt: new Date().toISOString(),
  };
  state.people.push(newPerson);
  saveData();
  notify();
  return newPerson;
}

export function updatePerson(id, updates) {
  const idx = state.people.findIndex(p => p.id === id);
  if (idx === -1) return null;
  state.people[idx] = { ...state.people[idx], ...updates, id };
  state.people[idx].connections = normalizeConnections(state.people[idx].connections);
  saveData();
  notify();
  return state.people[idx];
}

export function deletePerson(id) {
  const idx = state.people.findIndex(p => p.id === id);
  if (idx === -1) return false;
  const deletedId = state.people[idx].id;
  state.people.splice(idx, 1);
  state.people.forEach(p => {
    p.connections = p.connections.filter(cid => cid !== deletedId);
  });
  saveData();
  notify();
  return true;
}

// ═══════════ 设置 ═══════════
export function getSettings() {
  return state.settings;
}

export function updateSettings(updates) {
  state.settings = { ...state.settings, ...updates };
  saveData();
  notify();
}

export function linkPeople(personIdA, personIdB) {
  if (!personIdA || !personIdB || personIdA === personIdB) return false;

  const idxA = state.people.findIndex(p => p.id === personIdA);
  const idxB = state.people.findIndex(p => p.id === personIdB);
  if (idxA === -1 || idxB === -1) return false;

  const personA = state.people[idxA];
  const personB = state.people[idxB];

  const nextAConnections = normalizeConnections(personA.connections);
  const nextBConnections = normalizeConnections(personB.connections);

  if (!nextAConnections.includes(personIdB)) nextAConnections.push(personIdB);
  if (!nextBConnections.includes(personIdA)) nextBConnections.push(personIdA);

  state.people[idxA] = { ...personA, connections: nextAConnections };
  state.people[idxB] = { ...personB, connections: nextBConnections };

  saveData();
  notify();
  return true;
}

export function unlinkPeople(personIdA, personIdB) {
  if (!personIdA || !personIdB || personIdA === personIdB) return false;

  const idxA = state.people.findIndex(p => p.id === personIdA);
  const idxB = state.people.findIndex(p => p.id === personIdB);
  if (idxA === -1 || idxB === -1) return false;

  const personA = state.people[idxA];
  const personB = state.people[idxB];

  state.people[idxA] = {
    ...personA,
    connections: normalizeConnections(personA.connections).filter(id => id !== personIdB),
  };
  state.people[idxB] = {
    ...personB,
    connections: normalizeConnections(personB.connections).filter(id => id !== personIdA),
  };

  saveData();
  notify();
  return true;
}

// ═══════════ JSON 导入导出 ═══════════
export function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `social-graph-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(jsonString) {
  try {
    // 防止超大文件导致浏览器卡死
    if (jsonString.length > 5 * 1024 * 1024) {
      throw new Error('文件过大（最大 5MB）');
    }
    const data = JSON.parse(jsonString);
    if (!data.people || !Array.isArray(data.people)) {
      throw new Error('Invalid format: missing people array');
    }
    if (!data.settings) {
      throw new Error('Invalid format: missing settings');
    }
    // 校验每个人物字段长度，防止 XSS 和存储溢出
    for (const p of data.people) {
      if (typeof p.id !== 'string' || p.id.length > 64) throw new Error('Invalid person id');
      if (typeof p.name !== 'string' || p.name.length > 100) throw new Error('人物名称过长');
      if (!['core', 'close', 'acquaintance', 'outer'].includes(p.ring)) throw new Error('无效的圈子类型');
      if (!Array.isArray(p.tags)) throw new Error('标签格式错误');
      if (p.tags.some(t => typeof t !== 'string' || t.length > 50)) throw new Error('标签过长');
      if (typeof p.color !== 'string' || p.color.length > 20) throw new Error('颜色值无效');
      if (typeof p.size !== 'number' || p.size < 0.1 || p.size > 10) throw new Error('人物大小无效');
      if (!Array.isArray(p.connections)) throw new Error('关系数据格式错误');
      if (p.connections.some(c => typeof c !== 'string' || c.length > 64)) throw new Error('关系ID无效');
      if (typeof p.note !== 'string' || p.note.length > 5000) throw new Error('备注过长');
    }
    // 校验 settings
    if (data.settings.colorPresets) {
      for (const cp of data.settings.colorPresets) {
        if (typeof cp.name !== 'string' || cp.name.length > 50) throw new Error('预设颜色名过长');
        if (typeof cp.color !== 'string' || cp.color.length > 20) throw new Error('预设颜色值无效');
      }
    }
    state = normalizeState(data);
    saveData();
    notify();
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}

export function resetData() {
  state = createDefaultData();
  saveData();
  notify();
}

// ═══════════ Toast 工具 ═══════════
let toastTimer;
export function showToast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2000);
}

function normalizeState(data) {
  const next = { ...data };
  next.version = STORAGE_VERSION;
  next.people = Array.isArray(next.people) ? next.people.map(person => ({
    ...person,
    connections: normalizeConnections(person.connections),
  })) : [];
  next.settings = {
    ...createDefaultSettings(),
    ...(next.settings || {}),
  };

  if (shouldSeedSampleConnections(next.people)) {
    seedSampleConnections(next.people);
  }

  return next;
}

function createDefaultSettings() {
  return {
    colorPresets: DEFAULT_COLOR_PRESETS,
    themeColor: '#5aae98',
    autoRotate: true,
    autoRotateSpeed: 0.2,
    showLabels: true,
  };
}

function normalizeConnections(connections) {
  if (!Array.isArray(connections)) return [];
  return connections.filter(id => typeof id === 'string' && id.length > 0);
}

function shouldSeedSampleConnections(people) {
  if (!Array.isArray(people) || people.length !== SAMPLE_PEOPLE_NAMES.length) return false;
  if (!SAMPLE_PEOPLE_NAMES.every(name => people.some(person => person.name === name))) return false;
  return people.every(person => normalizeConnections(person.connections).length === 0);
}

function seedSampleConnections(people) {
  const byName = new Map(people.map(person => [person.name, person]));
  const c1 = byName.get('陈思远');
  const c2 = byName.get('李雨桐');
  const c3 = byName.get('王浩然');
  if (!c1 || !c2 || !c3) return;

  c1.connections = [c2.id];
  c2.connections = [c1.id, c3.id];
  c3.connections = [c2.id];
}
