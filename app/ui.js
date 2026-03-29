/**
 * app/ui.js
 * Renderizado DOM del chat: mensajes, menú de módulos, bienvenida.
 */

const messagesEl = document.getElementById('messages-container');
const typingEl = document.getElementById('typing-indicator');
const breadcrumb = document.getElementById('breadcrumb-text');

export function clearMessages() {
    if (messagesEl) {
        messagesEl.innerHTML = '';
        messagesEl.scrollTop = 0;
    }
}

// ── marcado simple: **negrita**, *cursiva*, \n → <br> ──────────
export function markdownToHtml(text) {
    if (!text) return '';
    const protectedTags = [];
    let processed = text.replace(/<(\/?(?:div|details|summary|ul|li|b|a|span|i)[^>]*)>/gi, (match) => {
        const placeholder = `__HTML_TAG_${protectedTags.length}__`;
        protectedTags.push(match);
        return placeholder;
    });
    processed = processed.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    processed = processed.replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>');
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code>$1</code>').replace(/\n- /g, '\n• ').replace(/\n/g, '<br>');
    protectedTags.forEach((tag, i) => { processed = processed.replace(`__HTML_TAG_${i}__`, tag); });
    return processed;
}

function buildBubble(role, htmlContent, sourceText) {
    const wrap = document.createElement('div');
    wrap.className = `msg ${role}`;
    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = role === 'bot' ? '🌿' : '👤';
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = htmlContent;
    if (sourceText) {
        const cite = document.createElement('div');
        cite.className = 'source-citation';
        cite.innerHTML = `📄 <strong>Fuente:</strong> ${markdownToHtml(sourceText)}`;
        bubble.appendChild(cite);
    }
    wrap.appendChild(avatar); wrap.appendChild(bubble);
    return wrap;
}

export function renderMessage(role, text, source = null) {
    const html = markdownToHtml(text);
    const el = buildBubble(role, html, source);
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
}

export function renderSystemMessage(text) {
    const wrap = document.createElement('div');
    wrap.className = 'msg system-msg';
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = markdownToHtml(text);
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

const ICON_MAP = {
    'con': '🏢', 'man': '📚', 'via': '✈️', 'caja': '💰', 'aud': '🔍', 'san': '⚖️',
    'conócenos': '🏢', 'manuales': '📚', 'viáticos': '✈️', 'caja chica': '💰', 'auditoría': '🔍', 'sanciones': '⚖️',
    'misión': '🎯', 'visión': '👁️', 'búsqueda': '🔎', 'formatos': '📄', 'reglas': '🏛️'
};

function getIconHTML(text, id = null) {
    const t = (text || '').toLowerCase();
    if (id && ICON_MAP[id.toLowerCase()]) return `<span class="chip-icon-emoji">${ICON_MAP[id.toLowerCase()]}</span>`;
    for (const [key, icon] of Object.entries(ICON_MAP)) {
        if (t.includes(key)) return `<span class="chip-icon-emoji">${icon}</span>`;
    }
    return `<span class="chip-icon-text">${text.charAt(0).toUpperCase()}</span>`;
}

export function renderMenu(onSelect) {
    // Legacy chat menu - can still be used if needed, but ribbon is preferred
    const modules = [
        { num: '1', code: 'MOD-CON-001', name: 'Conócenos', id: 'CON' },
        { num: '2', code: 'MOD-MAN-002', name: 'Manuales Institucionales', id: 'MAN' },
        { num: '3', code: 'MOD-VIA-006', name: 'Política de Viáticos', id: 'VIA' },
        { num: '4', code: 'MAN-CAJ', name: 'Manual de Caja Chica', id: 'CAJA' },
        { num: '5', code: 'MOD-AUD-005', name: 'Auditoría Interna', id: 'AUD' },
        { num: '6', code: 'MOD-SAN-007', name: 'Matriz de Sanciones', id: 'SAN' },
    ];
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    const cards = document.createElement('div');
    cards.className = 'menu-cards';
    modules.forEach(m => {
        const btn = document.createElement('button');
        btn.className = 'menu-card';
        btn.innerHTML = `<div class="menu-card-num">${getIconHTML(m.name, m.id)}</div><div class="menu-card-info"><span class="menu-card-name">${m.name}</span><span class="menu-card-code">${m.code}</span></div>`;
        btn.addEventListener('click', () => onSelect(m.id));
        cards.appendChild(btn);
    });
    bubble.appendChild(cards);
    wrap.innerHTML = '<div class="msg-avatar">🌿</div>';
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

export function renderRibbon(onSelect) {
    const modules = [
        { code: 'MOD-CON-001', name: 'Conócenos', id: 'CON' },
        { code: 'MOD-MAN-002', name: 'Manuales Institucionales', id: 'MAN' },
        { code: 'MOD-VIA-006', name: 'Política de Viáticos', id: 'VIA' },
        { code: 'MAN-CAJ', name: 'Manual de Caja Chica', id: 'CAJA' },
        { code: 'MOD-AUD-005', name: 'Auditoría Interna', id: 'AUD' },
        { code: 'MOD-SAN-007', name: 'Matriz de Sanciones', id: 'SAN' },
    ];
    const ribbon = document.getElementById('module-ribbon-top');
    const row = document.getElementById('ribbon-row-top');
    if (!ribbon || !row) return;
    
    row.innerHTML = '';
    modules.forEach(m => {
        const chip = document.createElement('div');
        chip.className = 'mc';
        chip.id = `ribbon-${m.id.toLowerCase()}`;
        chip.innerHTML = `${getIconHTML(m.name, m.id)} <span>${m.name}</span>`;
        chip.addEventListener('click', () => onSelect(m.id));
        row.appendChild(chip);
    });
    ribbon.classList.add('visible');
}

export function renderTopicButtons(topics, onSelect, promptText = null, sourceText = null) {
    // 1. Render message text ONLY in chat bubble
    if (promptText) {
        const wrap = document.createElement('div');
        wrap.className = 'msg bot';
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.innerHTML = markdownToHtml(promptText);
        wrap.innerHTML = '<div class="msg-avatar">🌿</div>';
        wrap.appendChild(bubble);
        messagesEl.appendChild(wrap);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    
    // 2. Clear and Populate BOTTOM RIBBON (Orange box logic)
    const contextRibbon = document.getElementById('contextual-ribbon');
    const ribbonRow = document.getElementById('ribbon-row-bottom');
    if (!contextRibbon || !ribbonRow) return;

    ribbonRow.innerHTML = '';
    contextRibbon.classList.add('visible');
    
    // Trigger "destello" (glow animation)
    contextRibbon.classList.remove('glow-hint');
    void contextRibbon.offsetWidth; // Trigger reflow
    contextRibbon.classList.add('glow-hint');

    topics.filter(t => !t.toLowerCase().includes('regresar')).forEach((t, i) => {
        const btn = document.createElement('button');
        btn.className = 'mc'; // Using .mc to match "pink" style as requested
        btn.innerHTML = `${getIconHTML(t)} <span>${t}</span>`;
        btn.addEventListener('click', () => {
            onSelect((i + 1).toString(), t);
        });
        ribbonRow.appendChild(btn);
    });
}

export function renderDualCollapsibleMenu(suggestedTopics, remainingTopics, footerButtons, onSelect, label = '¿Otra consulta?') {
    const container = document.createElement('div');
    container.style.width = '100%';
    const chipsSection = document.createElement('div');
    chipsSection.className = 'chips-section';
    chipsSection.innerHTML = `<span class="chips-label">${label}</span>`;
    const chipsWrapper = document.createElement('div');
    chipsWrapper.className = 'chips-wrapper';
    
    suggestedTopics.forEach(topic => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = topic;
        chip.addEventListener('click', () => { onSelect('chip', topic); });
        chipsWrapper.appendChild(chip);
    });
    chipsSection.appendChild(chipsWrapper);
    container.appendChild(chipsSection);
    messagesEl.appendChild(container);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

export function renderFileAttachment(filename, url, description) {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = `<div class="file-attachment-card"><div class="file-attachment-icon">📎</div><div class="file-attachment-info"><span class="file-attachment-name">${filename}</span>${description ? `<span class="file-attachment-desc">${description}</span>` : ''}</div><a class="file-attachment-btn" href="${url}" download="${filename}">↓ Descargar</a></div>`;
    wrap.innerHTML = '<div class="msg-avatar">🌿</div>';
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

export function showTyping() { typingEl.classList.remove('hidden'); messagesEl.scrollTop = messagesEl.scrollHeight; }
export function hideTyping() { typingEl.classList.add('hidden'); }
export function setBreadcrumb(text) { breadcrumb.textContent = text; }
export function getBreadcrumb() { return breadcrumb.textContent; }

export function setModBtnActive(id) {
    document.querySelectorAll('.mod-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.mc').forEach(c => c.classList.remove('active'));
    if (id) {
        const mid = id.toLowerCase();
        document.getElementById(`nav-${mid}`)?.classList.add('active');
        document.getElementById(`nav-${mid}`)?.removeAttribute('disabled');
        document.getElementById(`ribbon-${mid}`)?.classList.add('active');
    }
}

export function enableModBtns() { document.querySelectorAll('.mod-btn').forEach(b => b.removeAttribute('disabled')); }
export function disableModBtns() { document.querySelectorAll('.mod-btn').forEach(b => { b.disabled = true; b.classList.remove('active'); }); }

export function showSessionPanel(collaborator) {
    const panelHeader = document.getElementById('session-info-header');
    if (panelHeader) {
        panelHeader.classList.remove('hidden');
        document.getElementById('user-name-display-header').textContent = collaborator.nombre;
        document.getElementById('user-role-display-header').textContent = collaborator.puesto;
    }
}

export function hideSessionPanel() { 
    document.getElementById('session-info-header')?.classList.add('hidden'); 
}

export function updateSessionTimer(remainMs) {
    const min = Math.floor(remainMs / 60000);
    const sec = Math.floor((remainMs % 60000) / 1000);
    document.getElementById('session-timer').textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
