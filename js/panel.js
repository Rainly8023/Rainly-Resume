// js/panel.js — 右侧面板 UI 逻辑
import {
  getPeople, getPerson, addPerson, updatePerson, deletePerson,
  getSettings, updateSettings, exportJSON, importJSON, showToast,
  linkPeople, unlinkPeople, RING_NAMES, RING_ORDER, subscribe,
} from './data.js';

let selectedPersonId = null;
let currentFilter = 'all';
let searchQuery = '';

const $ = (sel) => document.querySelector(sel);
const panel = $('#panel');
const personList = $('#personList');
const searchInput = $('#searchInput');
const filterBar = $('#filterBar');
const editCard = $('#editCard');
const btnBackToList = $('#btnBackToList');
const btnAddPerson = $('#btnAddPerson');
const btnTogglePanel = $('#btnTogglePanel');
const btnPanelClose = $('#btnPanelClose');
const btnExport = $('#btnExport');
const btnImport = $('#btnImport');
const fileImport = $('#fileImport');

const editDot = $('#editDot');
const editName = $('#editName');
const editRingLabel = $('#editRingLabel');
const editTags = $('#editTags');
const editTagInput = $('#editTagInput');
const editRingBtns = $('#editRingBtns');
const editColors = $('#editColors');
const editConnections = $('#editConnections');
const editNote = $('#editNote');
const btnDeletePerson = $('#btnDeletePerson');

export function initPanel() {
  renderList();
  renderEditCard();

  btnTogglePanel.addEventListener('click', () => {
    panel.classList.toggle('is-collapsed');
  });
  btnPanelClose.addEventListener('click', () => {
    panel.classList.add('is-collapsed');
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderList();
  });

  filterBar.addEventListener('click', (e) => {
    if (e.target.classList.contains('panel-filter')) {
      filterBar.querySelectorAll('.panel-filter').forEach(b => b.classList.remove('is-active'));
      e.target.classList.add('is-active');
      currentFilter = e.target.dataset.ring;
      renderList();
    }
  });

  btnAddPerson.addEventListener('click', () => {
    const person = addPerson({ name: '新人物' });
    selectedPersonId = person.id;
    renderList();
    renderEditCard();
  });

  btnBackToList.addEventListener('click', () => {
    selectedPersonId = null;
    renderList();
    renderEditCard();
  });

  editTagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && editTagInput.value.trim()) {
      const person = getPerson(selectedPersonId);
      if (!person) return;
      if (person.tags.includes(editTagInput.value.trim())) return;
      updatePerson(selectedPersonId, {
        tags: [...person.tags, editTagInput.value.trim()],
      });
      editTagInput.value = '';
      renderEditCard();
    }
  });

  editName.addEventListener('input', (e) => {
    if (selectedPersonId) {
      updatePerson(selectedPersonId, { name: e.target.value || '未命名' });
    }
  });

  editNote.addEventListener('input', (e) => {
    if (selectedPersonId) {
      updatePerson(selectedPersonId, { note: e.target.value });
    }
  });

  btnDeletePerson.addEventListener('click', () => {
    if (!selectedPersonId) return;
    if (confirm('确定要删除此人吗？')) {
      const name = getPerson(selectedPersonId)?.name || '';
      deletePerson(selectedPersonId);
      selectedPersonId = null;
      renderList();
      renderEditCard();
      showToast(`已删除「${name}」`);
    }
  });

  btnExport.addEventListener('click', () => {
    exportJSON();
    showToast('数据已导出');
  });

  btnImport.addEventListener('click', () => fileImport.click());
  fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importJSON(reader.result);
      if (ok) {
        showToast('数据已导入');
        selectedPersonId = null;
        renderList();
        renderEditCard();
      } else {
        showToast('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
    fileImport.value = '';
  });

  subscribe(() => {
    renderList();
    if (selectedPersonId && !getPerson(selectedPersonId)) {
      selectedPersonId = null;
    }
    renderEditCard();
  });
}

function renderList() {
  const people = getPeople();
  let filtered = people;

  if (currentFilter !== 'all') {
    filtered = filtered.filter(p => p.ring === currentFilter);
  }
  if (searchQuery) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery))
    );
  }

  personList.innerHTML = filtered.map(p => `
    <div class="person-row ${p.id === selectedPersonId ? 'is-selected' : ''}" data-id="${p.id}">
      <div class="person-dot" style="background:${p.color};box-shadow:0 0 6px ${p.color}44"></div>
      <span class="person-name">${escapeHtml(p.name)}</span>
      <div class="person-tags">
        ${p.tags.slice(0, 2).map(t =>
          `<span class="person-tag" style="background:${p.color}22;color:${p.color}">${escapeHtml(t)}</span>`
        ).join('')}
        ${p.tags.length > 2 ? `<span class="person-tag" style="color:var(--text-muted)">+${p.tags.length - 2}</span>` : ''}
      </div>
      <span class="person-ring">${RING_NAMES[p.ring] || ''}</span>
    </div>
  `).join('');

  if (filtered.length === 0) {
    personList.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:12px">没有匹配的人物</div>`;
  }

  personList.querySelectorAll('.person-row').forEach(row => {
    row.addEventListener('click', () => {
      selectedPersonId = row.dataset.id;
      renderList();
      renderEditCard();
    });
  });
}

function renderEditCard() {
  if (!selectedPersonId) {
    editCard.classList.add('hidden');
    return;
  }

  editCard.classList.remove('hidden');
  const person = getPerson(selectedPersonId);
  if (!person) return;

  editDot.style.background = person.color;
  editDot.style.boxShadow = `0 0 12px ${person.color}66`;

  // 只在用户没有正在编辑时更新名字输入框，避免光标跳到最后
  if (document.activeElement !== editName) {
    editName.value = person.name;
  }
  editRingLabel.textContent = `${RING_NAMES[person.ring] || ''} · 大小: ${Math.round(person.size * 100)}%`;

  editTags.innerHTML = person.tags.map(t => `
    <span class="edit-tag" style="background:${person.color}22;color:${person.color}">
      ${escapeHtml(t)}
      <span class="edit-tag-remove" data-tag="${escapeHtml(t)}">×</span>
    </span>
  `).join('') + `<span class="edit-tag-add">+ 添加</span>`;

  editTags.querySelectorAll('.edit-tag-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      updatePerson(selectedPersonId, {
        tags: person.tags.filter(t => t !== btn.dataset.tag),
      });
    });
  });

  editRingBtns.innerHTML = RING_ORDER.map(ring =>
    `<button class="edit-ring-btn ${person.ring === ring ? 'is-active' : ''}" data-ring="${ring}">${RING_NAMES[ring]}</button>`
  ).join('');

  editRingBtns.querySelectorAll('.edit-ring-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      updatePerson(selectedPersonId, { ring: btn.dataset.ring });
    });
  });

  const settings = getSettings();
  editColors.innerHTML = settings.colorPresets.map((preset) =>
    `<div class="edit-color-dot ${person.color === preset.color ? 'is-active' : ''}"
         style="background:${preset.color};box-shadow:0 0 8px ${preset.color}44"
         data-color="${preset.color}" title="${preset.name}"></div>`
  ).join('') + `
    <div class="edit-color-custom">
      <input type="color" id="customColorInput"
             style="opacity:0;position:absolute;width:24px;height:24px;cursor:pointer"
             value="${person.color}">
      +
    </div>`;

  editColors.querySelectorAll('.edit-color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      updatePerson(selectedPersonId, { color: dot.dataset.color });
    });
  });

  const customColorInput = editColors.querySelector('#customColorInput');
  if (customColorInput) {
    customColorInput.addEventListener('input', (e) => {
      updatePerson(selectedPersonId, { color: e.target.value });
    });
  }

  const people = getPeople();
  const connected = person.connections
    .map(cid => people.find(p => p.id === cid))
    .filter(Boolean);

  editConnections.innerHTML = connected.map(c => `
    <span class="edit-conn-tag">
      ${escapeHtml(c.name)}
      <span class="edit-conn-remove" data-id="${c.id}">×</span>
    </span>
  `).join('') + `<span class="edit-conn-add">+ 关联</span>`;

  editConnections.querySelectorAll('.edit-conn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      unlinkPeople(selectedPersonId, btn.dataset.id);
      renderEditCard();
    });
  });

  const addConnectionBtn = editConnections.querySelector('.edit-conn-add');
  if (addConnectionBtn) {
    addConnectionBtn.addEventListener('click', () => {
      const keyword = prompt('输入要关联的人物姓名或ID');
      if (!keyword) return;

      const query = keyword.trim().toLowerCase();
      if (!query) return;

      const candidates = getPeople().filter(p =>
        p.id !== selectedPersonId && !person.connections.includes(p.id)
      );

      const exactMatch = candidates.find(p =>
        p.id.toLowerCase() === query || p.name.toLowerCase() === query
      );
      const partialMatch = candidates.find(p => p.name.toLowerCase().includes(query));
      const target = exactMatch || partialMatch;

      if (!target) {
        showToast('没有找到可关联的人物');
        return;
      }

      const ok = linkPeople(selectedPersonId, target.id);
      if (ok) {
        showToast(`已关联「${target.name}」`);
        renderEditCard();
      } else {
        showToast('关联失败');
      }
    });
  }

  // 只在用户没有正在编辑时更新备注框，避免光标跳到最后
  if (document.activeElement !== editNote) {
    editNote.value = person.note || '';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function getSelectedPersonId() {
  return selectedPersonId;
}

export function setSelectedPersonId(id) {
  selectedPersonId = id;
  renderList();
  renderEditCard();
}
