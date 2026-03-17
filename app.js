(function () {
  const STORAGE_SYMBOLS = 'tuge_symbols';
  const STORAGE_DESIGNS = 'tuge_designs';
  const STORAGE_SIDEBAR = 'tuge_sidebar';

  const defaultSymbols = [
    { id: 'ch', name: '쇠사슬뜨기', char: 'ch', desc: 'chain' },
    { id: 'slst', name: '빼뜨기', char: 's/s', desc: 'slip stitch' },
    { id: 'mr', name: '매직링', char: 'mr', desc: 'magic ring' },
    { id: 'sc', name: '짧은뜨기', char: 'sc', desc: 'single crochet' },
    { id: 'hdc', name: '긴뜨기', char: 'hdc', desc: 'half double crochet' },
    { id: 'dc', name: '한길긴뜨기', char: 'dc', desc: 'double crochet' },
    { id: 'tr', name: '두길긴뜨기', char: 'tr', desc: 'treble' },
    { id: 'dtr', name: '세길긴뜨기', char: 'dtr', desc: 'double treble' },
    { id: 'inc', name: '늘리기', char: 'inc', desc: 'increase' },
    { id: 'scinc', name: '짧은뜨기 늘리기', char: 'scinc', desc: 'sc increase (2코)' },
    { id: 'dec', name: '줄이기', char: 'dec', desc: 'decrease' },
    { id: 'tog', name: '모아뜨기', char: 'tog', desc: 'together' },
    { id: 'sc2tog', name: '2코 모아 짧은뜨기', char: 'sc2tog', desc: 'sc 2 together' },
    { id: 'sc3tog', name: '3코 모아 짧은뜨기', char: 'sc3tog', desc: 'sc 3 together' },
    { id: 'hdc2tog', name: '2코 모아 긴뜨기', char: 'hdc2tog', desc: 'hdc 2 together' },
    { id: 'dc2tog', name: '2코 모아 한길긴뜨기', char: 'dc2tog', desc: 'dc 2 together' },
    { id: 'dc3tog', name: '3코 모아 한길긴뜨기', char: 'dc3tog', desc: 'dc 3 together' },
    { id: 'tr2tog', name: '2코 모아 두길긴뜨기', char: 'tr2tog', desc: 'tr 2 together' },
    { id: 'st', name: '코', char: 'sts', desc: 'stitch' },
    { id: 'rep', name: '반복', char: 'rep', desc: 'repeat' },
    { id: 'beg', name: '시작', char: 'beg', desc: 'beginning' },
    { id: 'bo', name: '마무리', char: 'bo', desc: 'fasten off' },
    { id: 'sk', name: '건너뛰기', char: 'sk', desc: 'skip' },
    { id: 'fp', name: '앞걸어뜨기', char: 'fp', desc: 'front post' },
    { id: 'bp', name: '뒤걸어뜨기', char: 'bp', desc: 'back post' },
    { id: 'fpdc', name: '한길앞걸어뜨기', char: 'fpdc', desc: 'front post dc' },
    { id: 'bpdc', name: '한길뒤걸어뜨기', char: 'bpdc', desc: 'back post dc' },
    { id: 'flo', name: '앞반코뜨기', char: 'flo', desc: 'front loop only' },
    { id: 'blo', name: '뒤반코뜨기', char: 'blo', desc: 'back loop only' },
    { id: 'picot', name: '피코뜨기', char: 'p', desc: 'picot' },
    { id: 'yo', name: '올림', char: 'yo', desc: 'yarn over' },
  ];

  function getSymbols() {
    try {
      const raw = localStorage.getItem(STORAGE_SYMBOLS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          parsed.forEach(s => {
            if (s.id === 'slst' && s.char !== 's/s') { s.char = 's/s'; delete s.altChars; }
          });
          defaultSymbols.forEach(d => {
            if (!parsed.some(p => p.id === d.id)) parsed.push(d);
          });
          return parsed;
        }
      }
    } catch (_) {}
    return defaultSymbols.slice();
  }

  function saveSymbols(list) {
    localStorage.setItem(STORAGE_SYMBOLS, JSON.stringify(list));
  }

  function getDesigns() {
    try {
      const raw = localStorage.getItem(STORAGE_DESIGNS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.list) && parsed.list.length) {
          parsed.list.forEach(d => {
            if (!d.data || !Array.isArray(d.data.rows)) d.data = { startType: 'chain', rows: [{ type: 'row', text: '', done: false }] };
            d.data.rows = d.data.rows.map(normalizeRowItem);
          });
          if (!parsed.activeId || !parsed.list.some(x => x.id === parsed.activeId)) parsed.activeId = parsed.list[0].id;
          return parsed;
        }
      }
    } catch (_) {}
    return {
      list: [{ id: 'd' + Date.now(), name: '새 도안', data: { startType: 'chain', rows: [{ type: 'row', text: '', done: false }] } }],
      activeId: null
    };
  }

  function normalizeRowItem(r) {
    if (r && r.type === 'divider') return { type: 'divider', title: String(r.title || '').trim() };
    return { type: 'row', text: r && r.text !== undefined ? String(r.text) : '', done: !!(r && r.done) };
  }

  function saveDesigns(data) {
    if (data.activeId == null && data.list.length) data.activeId = data.list[0].id;
    localStorage.setItem(STORAGE_DESIGNS, JSON.stringify(data));
  }

  function savePattern() {
    const d = designs.list.find(x => x.id === designs.activeId);
    if (d) d.data = pattern;
    saveDesigns(designs);
  }

  let symbols = getSymbols();
  let designs = getDesigns();
  if (!designs.activeId && designs.list.length) designs.activeId = designs.list[0].id;
  let pattern = designs.list.find(d => d.id === designs.activeId)?.data || { startType: 'chain', rows: [{ type: 'row', text: '', done: false }] };
  let currentRowInput = null;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => root.querySelectorAll(sel);

  const defaultIds = new Set(defaultSymbols.map(s => s.id));

  function getAbbrevList() {
    const list = [];
    symbols.forEach(s => {
      const c = (s.char || '').trim();
      if (c) list.push(c);
      (s.altChars || []).forEach(alt => { if (alt && String(alt).trim()) list.push(String(alt).trim()); });
    });
    return [...new Set(list)].sort((a, b) => b.length - a.length);
  }

  function abbrevToNameMap() {
    const m = new Map();
    symbols.forEach(s => {
      const c = (s.char || '').trim();
      if (c) m.set(c.toLowerCase(), s.name);
      (s.altChars || []).forEach(alt => {
        const a = String(alt).trim();
        if (a) m.set(a.toLowerCase(), s.name);
      });
    });
    return m;
  }

  function parseRowForColor(text) {
    const abbrevs = getAbbrevList();
    const parts = [];
    let rest = text;
    const numRe = /^\d+/;
    const parenRe = /^([()])/;
    while (rest.length) {
      const trimmed = rest.replace(/^\s+/, '');
      if (trimmed.length < rest.length) {
        parts.push({ type: 'text', value: rest.slice(0, rest.length - trimmed.length) });
        rest = trimmed;
        continue;
      }
      let found = false;
      const lower = rest.toLowerCase();
      for (const ab of abbrevs) {
        if (ab && lower.startsWith(ab.toLowerCase())) {
          parts.push({ type: 'abbrev', value: rest.slice(0, ab.length) });
          rest = rest.slice(ab.length);
          found = true;
          break;
        }
      }
      if (found) continue;
      const numMatch = rest.match(numRe);
      if (numMatch) {
        parts.push({ type: 'num', value: numMatch[0] });
        rest = rest.slice(numMatch[0].length);
        continue;
      }
      const parenMatch = rest.match(parenRe);
      if (parenMatch) {
        parts.push({ type: 'paren', value: parenMatch[1] });
        rest = rest.slice(1);
        continue;
      }
      parts.push({ type: 'text', value: rest.slice(0, 1) });
      rest = rest.slice(1);
    }
    return parts;
  }

  function interpretToKorean(text) {
    const nameMap = abbrevToNameMap();
    const abbrevs = getAbbrevList();
    let out = '';
    let rest = text;
    const numRe = /^\d+/;
    while (rest.length) {
      const trimmed = rest.replace(/^\s+/, '');
      if (trimmed.length < rest.length) {
        out += rest.slice(0, rest.length - trimmed.length);
        rest = trimmed;
        continue;
      }
      let found = false;
      const lower = rest.toLowerCase();
      for (const ab of abbrevs) {
        if (!ab) continue;
        if (!lower.startsWith(ab.toLowerCase())) continue;
        const numMatch = rest.slice(ab.length).match(/^\s*\d+/);
        let n = 1;
        let skip = ab.length;
        if (numMatch) {
          n = parseInt(numMatch[0].replace(/\s/g, ''), 10);
          skip += numMatch[0].length;
        } else {
          const tightNum = rest.slice(ab.length).match(/^\d+/);
          if (tightNum) {
            n = parseInt(tightNum[0], 10);
            skip += tightNum[0].length;
          }
        }
        const name = nameMap.get(ab.toLowerCase());
        if (name) {
          const displayName = name === '쇠사슬뜨기' ? '사슬' : name;
          if (name === '쇠사슬뜨기' || name === '코') out += displayName + (n > 1 ? n + '개' : ' 1개');
          else out += displayName + (n > 1 ? ' ' + n + '코' : ' 1코');
        } else out += rest.slice(0, skip);
        rest = rest.slice(skip);
        found = true;
        break;
      }
      if (found) continue;
      const numMatch = rest.match(numRe);
      if (numMatch) {
        out += numMatch[0];
        rest = rest.slice(numMatch[0].length);
        continue;
      }
      if (rest.startsWith('(') || rest.startsWith(')')) {
        out += rest.slice(0, 1);
        rest = rest.slice(1);
        continue;
      }
      out += rest.slice(0, 1);
      rest = rest.slice(1);
    }
    return out.replace(/\s+/g, ' ').trim();
  }

  function countStitches(text) {
    text = text.replace(/\[[^\]]*\]/g, '');
    const abbrevs = getAbbrevList();
    let total = 0;
    let rest = text;
    const numRe = /^\d+/;
    function readNumber(str) {
      const m = str.match(/^\s*\d+/);
      if (m) return { n: parseInt(m[0].replace(/\s/g, ''), 10), len: m[0].length };
      const m2 = str.match(/^\d+/);
      if (m2) return { n: parseInt(m2[0], 10), len: m2[0].length };
      return { n: 1, len: 0 };
    }
    function stitchValue(ab) {
      const abLower = ab.toLowerCase();
      if (abLower === 'inc' || abLower === 'scinc') return 2;
      if (abLower === 'dec' || abLower === 'tog') return 1;
      if (abLower === 's/s' || abLower === 'mr') return 0;
      return 1;
    }
    while (rest.length) {
      const lower = rest.toLowerCase();
      let matched = false;
      for (const ab of abbrevs) {
        if (!ab || !lower.startsWith(ab.toLowerCase())) continue;
        const after = rest.slice(ab.length);
        const { n, len } = readNumber(after);
        const one = stitchValue(ab);
        total += one === -1 ? 1 : one * n;
        rest = rest.slice(ab.length + len);
        matched = true;
        break;
      }
      if (matched) continue;
      const numMatch = rest.match(numRe);
      if (numMatch) {
        rest = rest.slice(numMatch[0].length);
        continue;
      }
      if (rest.startsWith('(')) {
        let depth = 1;
        let end = 1;
        while (end < rest.length && depth > 0) {
          if (rest[end] === '(') depth++;
          else if (rest[end] === ')') depth--;
          end++;
        }
        const inner = rest.slice(1, end - 1);
        let restAfter = rest.slice(end);
        const repeatMatch = restAfter.match(/^\s*[\*x]\s*(\d+)/i);
        let repeat = 1;
        let skipLen = 0;
        if (repeatMatch) {
          repeat = parseInt(repeatMatch[1], 10);
          skipLen = repeatMatch[0].length;
        }
        total += countStitches(inner) * repeat;
        rest = restAfter.slice(skipLen);
        continue;
      }
      if (rest.startsWith(')') || rest.startsWith(',') || rest.startsWith(' ')) {
        rest = rest.slice(1);
        continue;
      }
      rest = rest.slice(1);
    }
    return total;
  }

  function renderColoredPreview(parts) {
    return parts.map(p => {
      if (p.type === 'num') return '<span class="pattern-num">' + escapeHtml(p.value) + '</span>';
      if (p.type === 'abbrev') return '<span class="pattern-abbrev">' + escapeHtml(p.value) + '</span>';
      if (p.type === 'paren') return '<span class="pattern-paren">' + escapeHtml(p.value) + '</span>';
      return escapeHtml(p.value);
    }).join('');
  }

  function renderSymbolsList(container, options = {}) {
    const { showRemove = false, onSelect = null } = options;
    container.innerHTML = '';
    symbols.forEach((sym, idx) => {
      const card = document.createElement('div');
      card.className = 'symbol-card';
      const isDefault = defaultIds.has(sym.id);
      card.innerHTML = `
        <span class="symbol-char">${escapeHtml(sym.char)}</span>
        <div class="symbol-info">
          <div class="symbol-name">${escapeHtml(sym.name)}</div>
          ${sym.desc ? `<div class="symbol-desc">${escapeHtml(sym.desc)}</div>` : ''}
        </div>
        ${showRemove && !isDefault ? `<button type="button" class="symbol-remove" data-idx="${idx}">삭제</button>` : ''}
        ${onSelect ? `<button type="button" class="symbol-select" data-idx="${idx}">선택</button>` : ''}
      `;
      if (showRemove && !isDefault) {
        card.querySelector('.symbol-remove').addEventListener('click', () => {
          symbols.splice(idx, 1);
          saveSymbols(symbols);
          renderSymbolsList($('#symbolsList'), { showRemove: true });
          renderPopupList();
        });
      }
      if (onSelect) {
        card.querySelector('.symbol-select').addEventListener('click', () => {
          onSelect(sym);
        });
      }
      container.appendChild(card);
    });
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function renderPopupList() {
    renderSymbolsList($('#popupSymbolsList'), {
      onSelect: (sym) => {
        if (currentRowInput) {
          const start = currentRowInput.selectionStart ?? currentRowInput.value.length;
          const end = currentRowInput.selectionEnd ?? start;
          const before = currentRowInput.value.slice(0, start);
          const after = currentRowInput.value.slice(end);
          const insert = sym.char;
          currentRowInput.value = before + insert + after;
          currentRowInput.focus();
          const newPos = start + insert.length;
          currentRowInput.setSelectionRange(newPos, newPos);
        }
        closePopup();
      },
    });
  }

  function openPopup(focusInput) {
    currentRowInput = focusInput || document.activeElement;
    const tag = currentRowInput && currentRowInput.tagName ? currentRowInput.tagName.toLowerCase() : '';
    if (tag !== 'input' && tag !== 'textarea') currentRowInput = null;
    renderPopupList();
    const popup = $('#symbolsPopup');
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
  }

  function closePopup() {
    const popup = $('#symbolsPopup');
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
  }

  function updateRowPreview(block, text) {
    const previewEl = block.querySelector('.row-preview');
    const interpretEl = block.querySelector('.row-interpret');
    const countEl = block.querySelector('.row-count');
    if (!previewEl) return;
    if (!text.trim()) {
      previewEl.innerHTML = '';
      previewEl.classList.remove('has-content');
      if (interpretEl) { interpretEl.textContent = ''; interpretEl.classList.remove('has-content'); }
      if (countEl) { countEl.textContent = ''; }
      return;
    }
    const parts = parseRowForColor(text);
    previewEl.innerHTML = renderColoredPreview(parts);
    previewEl.classList.add('has-content');
    if (interpretEl) {
      const interpreted = interpretToKorean(text);
      interpretEl.textContent = interpreted ? '해석: ' + interpreted : '';
      interpretEl.classList.toggle('has-content', !!interpreted);
    }
    if (countEl) {
      const count = countStitches(text);
      countEl.textContent = count > 0 ? '총 ' + count + '코' : '';
    }
  }

  function renderRows() {
    const container = $('#patternRows');
    container.innerHTML = '';
    let rowOrdinal = 0;
    pattern.rows.forEach((item, i) => {
      if (item.type === 'divider') {
        rowOrdinal = 0;
        const div = document.createElement('div');
        div.className = 'row-divider';
        div.dataset.index = i;
        div.innerHTML = `
          <span class="row-divider-line"></span>
          <input type="text" class="row-divider-title" value="${escapeHtml(item.title)}" placeholder="구간 이름 (예: 귀, 머리)" data-index="${i}" />
          <span class="row-divider-line"></span>
          <button type="button" class="row-divider-remove" data-index="${i}" title="구분선 삭제">×</button>
        `;
        const titleInput = div.querySelector('.row-divider-title');
        titleInput.addEventListener('input', () => {
          pattern.rows[i].title = titleInput.value;
          savePattern();
        });
        div.querySelector('.row-divider-remove').addEventListener('click', () => {
          pattern.rows.splice(i, 1);
          savePattern();
          renderRows();
        });
        container.appendChild(div);
        return;
      }
      const row = item;
      rowOrdinal += 1;
      const num = rowOrdinal;
      const block = document.createElement('div');
      block.className = 'row-block' + (row.done ? ' row-done' : '');
      block.dataset.index = i;
      const checked = row.done ? ' checked' : '';
      block.innerHTML = `
        <label class="row-check-wrap">
          <input type="checkbox" class="row-check" data-index="${i}"${checked} />
          <span class="row-check-label">완료</span>
        </label>
        <span class="row-number">${num}단</span>
        <div class="row-content">
          <div class="row-input-wrap">
            <input type="text" class="row-input" data-index="${i}" value="${escapeHtml(row.text)}" placeholder="한글·영어 약어·숫자·괄호 자유롭게 입력" />
            <button type="button" class="insert-symbol-btn" data-index="${i}">기호 넣기</button>
          </div>
          <div class="row-preview" aria-hidden="true"></div>
          <div class="row-interpret" aria-hidden="true"></div>
          <div class="row-count" aria-hidden="true"></div>
        </div>
        <button type="button" class="row-remove" data-index="${i}" title="이 단 삭제">×</button>
      `;
      const input = block.querySelector('.row-input');
      const check = block.querySelector('.row-check');
      check.addEventListener('change', () => {
        pattern.rows[i].done = check.checked;
        block.classList.toggle('row-done', check.checked);
        savePattern();
      });
      const updatePreview = () => {
        pattern.rows[i].text = input.value;
        savePattern();
        updateRowPreview(block, input.value);
      };
      input.addEventListener('input', updatePreview);
      updateRowPreview(block, row.text);
      block.querySelector('.insert-symbol-btn').addEventListener('click', () => {
        currentRowInput = input;
        input.focus();
        openPopup(input);
      });
      block.querySelector('.row-remove').addEventListener('click', () => {
        pattern.rows.splice(i, 1);
        savePattern();
        renderRows();
      });
      container.appendChild(block);
    });
  }

  function addRow() {
    pattern.rows.push({ type: 'row', text: '', done: false });
    savePattern();
    renderRows();
  }

  function addDivider() {
    pattern.rows.push({ type: 'divider', title: '새 구간' });
    savePattern();
    renderRows();
  }

  function switchPage(pageId) {
    $$('.page').forEach(p => p.classList.remove('active'));
    $$('.menu-btn').forEach(b => b.classList.remove('active'));
    const page = $(`#page-${pageId}`);
    const btn = $(`.menu-btn[data-page="${pageId}"]`);
    if (page) page.classList.add('active');
    if (btn) btn.classList.add('active');
  }

  function copyPatternToClipboard() {
    const lines = [];
    let rowOrdinal = 0;
    pattern.rows.forEach((item) => {
      if (item.type === 'divider') {
        rowOrdinal = 0;
        lines.push('--- ' + (item.title || '') + ' ---');
        return;
      }
      rowOrdinal += 1;
      if (item.text.trim()) lines.push(`${rowOrdinal}단. ${item.text.trim()}`);
    });
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      const btn = $('#copyPattern');
      const orig = btn.textContent;
      btn.textContent = '복사됨!';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    }).catch(() => alert('복사에 실패했습니다.'));
  }

  function renderDesignList() {
    const container = $('#designList');
    if (!container) return;
    container.innerHTML = '';
    designs.list.forEach(d => {
      const item = document.createElement('div');
      item.className = 'design-item' + (d.id === designs.activeId ? ' active' : '');
      item.innerHTML = `
        <button type="button" class="design-name-btn">${escapeHtml(d.name)}</button>
        <div class="design-item-actions">
          <button type="button" class="design-menu-btn" title="메뉴">⋮</button>
          <div class="design-dropdown" hidden>
            <button type="button" class="design-rename-btn">이름 변경</button>
            <button type="button" class="design-delete-btn">삭제</button>
          </div>
        </div>
      `;
      const nameBtn = item.querySelector('.design-name-btn');
      const menuBtn = item.querySelector('.design-menu-btn');
      const dropdown = item.querySelector('.design-dropdown');
      const renameBtn = item.querySelector('.design-rename-btn');
      const deleteBtn = item.querySelector('.design-delete-btn');
      nameBtn.addEventListener('click', () => selectDesign(d.id));
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = dropdown.hidden;
        $$('.design-dropdown').forEach(el => { el.hidden = true; });
        dropdown.hidden = !isHidden;
      });
      renameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.hidden = true;
        const newName = prompt('도안 이름을 입력하세요', d.name);
        if (newName != null && newName.trim()) renameDesign(d.id, newName.trim());
      });
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.hidden = true;
        if (designs.list.length <= 1) { alert('도안은 최소 1개 필요해요.'); return; }
        if (confirm(`"${d.name}" 도안을 삭제할까요?`)) deleteDesign(d.id);
      });
      container.appendChild(item);
    });
  }

  function closeDesignDropdowns() {
    $$('.design-dropdown').forEach(el => { el.hidden = true; });
  }

  function selectDesign(id) {
    const d = designs.list.find(x => x.id === id);
    if (!d) return;
    designs.activeId = id;
    pattern = d.data;
    saveDesigns(designs);
    renderDesignList();
    renderRows();
  }

  function addDesign() {
    const name = prompt('도안 이름을 입력하세요', '새 도안');
    if (name == null || !name.trim()) return;
    const id = 'd' + Date.now();
    designs.list.push({ id, name: name.trim(), data: { startType: 'chain', rows: [{ text: '', done: false }] } });
    designs.activeId = id;
    pattern = designs.list.find(x => x.id === id).data;
    saveDesigns(designs);
    renderDesignList();
    renderRows();
  }

  function renameDesign(id, name) {
    const d = designs.list.find(x => x.id === id);
    if (!d) return;
    d.name = name;
    saveDesigns(designs);
    renderDesignList();
  }

  function deleteDesign(id) {
    const idx = designs.list.findIndex(x => x.id === id);
    if (idx < 0) return;
    designs.list.splice(idx, 1);
    if (designs.activeId === id) {
      designs.activeId = designs.list.length ? designs.list[0].id : null;
      pattern = designs.list[0] ? designs.list[0].data : { startType: 'chain', rows: [{ type: 'row', text: '', done: false }] };
    }
    saveDesigns(designs);
    renderDesignList();
    renderRows();
  }

  function getSidebarState() {
    try {
      const raw = localStorage.getItem(STORAGE_SIDEBAR);
      if (raw) {
        const p = JSON.parse(raw);
        return { width: Math.min(500, Math.max(160, p.width || 200)), collapsed: !!p.collapsed };
      }
    } catch (_) {}
    return { width: 200, collapsed: false };
  }

  function saveSidebarState(state) {
    localStorage.setItem(STORAGE_SIDEBAR, JSON.stringify(state));
  }

  function exportDesigns() {
    const d = designs.list.find(x => x.id === designs.activeId);
    if (d) d.data = pattern;
    saveDesigns(designs);
    const data = JSON.stringify(designs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '뜨개도안_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importDesigns() {
    const input = $('#importDesignsInput');
    input.value = '';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const loaded = JSON.parse(reader.result);
          if (!loaded || !Array.isArray(loaded.list) || loaded.list.length === 0) {
            alert('올바른 도안 파일이 아니에요.');
            return;
          }
          const list = loaded.list.map(d => ({
            id: d.id || 'd' + Date.now() + Math.random(),
            name: String(d.name || '도안').trim(),
            data: normalizeDesignData(d.data)
          }));
          designs.list = list;
          designs.activeId = loaded.activeId && list.some(x => x.id === loaded.activeId)
            ? loaded.activeId
            : list[0].id;
          pattern = designs.list.find(x => x.id === designs.activeId).data;
          saveDesigns(designs);
          renderDesignList();
          renderRows();
          alert('도안을 불러왔어요. (' + list.length + '개)');
        } catch (e) {
          alert('파일을 읽을 수 없어요. 올바른 저장 파일인지 확인해 주세요.');
        }
      };
      reader.readAsText(file, 'UTF-8');
    };
    input.click();
  }

  function normalizeDesignData(data) {
    if (!data || !Array.isArray(data.rows)) return { startType: 'chain', rows: [{ type: 'row', text: '', done: false }] };
    return {
      startType: data.startType || 'chain',
      rows: data.rows.map(normalizeRowItem)
    };
  }

  function initSidebar() {
    const sidebar = $('#sidebar');
    const mainWrap = $('#mainWrap');
    const toggleBtn = $('#sidebarToggle');
    const openTab = $('#sidebarOpenTab');
    const resizeHandle = $('#sidebarResize');
    let state = getSidebarState();

    function applyState() {
      sidebar.style.width = state.collapsed ? '0' : state.width + 'px';
      sidebar.style.minWidth = state.collapsed ? '0' : '';
      mainWrap.classList.toggle('sidebar-collapsed', state.collapsed);
      openTab.hidden = !state.collapsed;
      toggleBtn.textContent = state.collapsed ? '' : '◀';
      toggleBtn.title = state.collapsed ? '메뉴 열기' : '메뉴 숨기기';
      resizeHandle.style.display = state.collapsed ? 'none' : '';
    }

    toggleBtn.addEventListener('click', () => {
      state.collapsed = !state.collapsed;
      saveSidebarState(state);
      applyState();
    });

    openTab.addEventListener('click', () => {
      state.collapsed = false;
      saveSidebarState(state);
      applyState();
    });

    let resizeStartX = 0, resizeStartW = 0;
    resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      resizeStartX = e.clientX;
      resizeStartW = state.width;
      const onMove = (e2) => {
        const dx = e2.clientX - resizeStartX;
        state.width = Math.min(500, Math.max(160, resizeStartW + dx));
        sidebar.style.width = state.width + 'px';
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        saveSidebarState(state);
      };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    applyState();
  }

  function init() {
    $('#addRow').addEventListener('click', addRow);
    $('#addDividerBtn').addEventListener('click', addDivider);
    $('#copyPattern').addEventListener('click', copyPatternToClipboard);

    $$('.menu-btn').forEach(btn => {
      btn.addEventListener('click', () => switchPage(btn.dataset.page));
    });

    $('#openSymbolsPopup').addEventListener('click', openPopup);
    $('#popupClose').addEventListener('click', closePopup);
    $('#popupBackdrop').addEventListener('click', closePopup);

    $('#addDesignBtn').addEventListener('click', addDesign);
    $('#exportDesignsBtn').addEventListener('click', exportDesigns);
    $('#importDesignsBtn').addEventListener('click', importDesigns);
    document.addEventListener('click', (e) => {
      if (e.target.closest('.design-item-actions')) return;
      closeDesignDropdowns();
    });

    $('#addSymbolBtn').addEventListener('click', () => {
      const name = $('#newSymbolName').value.trim();
      const char = $('#newSymbolChar').value.trim();
      const desc = $('#newSymbolDesc').value.trim();
      if (!name || !char) {
        alert('이름과 기호 표시는 필수예요.');
        return;
      }
      symbols.push({ id: 'custom_' + Date.now(), name, char, desc });
      saveSymbols(symbols);
      $('#newSymbolName').value = '';
      $('#newSymbolChar').value = '';
      $('#newSymbolDesc').value = '';
      renderSymbolsList($('#symbolsList'), { showRemove: true });
      renderPopupList();
    });

    initSidebar();
    renderDesignList();
    renderSymbolsList($('#symbolsList'), { showRemove: true });
    renderRows();
  }

  init();
})();
