// js/data.js — 社交星系数据层
// 数据模型、localStorage 读写、JSON 导入导出

const STORAGE_KEY = 'rainly-social-graph';
const STORAGE_VERSION = 1;

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
  return {
    version: STORAGE_VERSION,
    people: [
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
    ],
    settings: {
      colorPresets: DEFAULT_COLOR_PRESETS,
      themeColor: '#5aae98',
      autoRotate: true,
      autoRotateSpeed: 0.2,
      showLabels: true,
    },
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
        state = parsed;
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
    const data = JSON.parse(jsonString);
    if (!data.people || !Array.isArray(data.people)) {
      throw new Error('Invalid format: missing people array');
    }
    if (!data.settings) {
      throw new Error('Invalid format: missing settings');
    }
    state = data;
    state.version = STORAGE_VERSION;
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
