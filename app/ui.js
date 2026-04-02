/**
 * app/ui.js
 * Renderizado DOM del chat: mensajes, menú de módulos, bienvenida.
 * v1.3 — FAB Speed Dial integrado para desambiguación de menú
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

/** Colapsa saltos excesivos y espacios finales de línea (evita párrafos “inflados” en el chat). */
function normalizeChatWhitespace(raw) {
    if (!raw || typeof raw !== 'string') return '';
    return raw
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// ── marcado simple: **negrita**, *cursiva*, \n → <br> ──────────
export function markdownToHtml(text) {
    if (!text) return '';

    let processed = normalizeChatWhitespace(text);

    // Patrón para detectar la "Respuesta Destacada" v2
    // Coincide con 💬 seguido de texto, capturando hasta el final o una cita/fuente
    const highlightedMatch = processed.match(/💬\s*([\s\S]+?)(?=\s*\n&gt;|\s*\nFuente:|$)/);
    
    if (highlightedMatch) {
        const fullMatch = highlightedMatch[0];
        let content = highlightedMatch[1].trim();
        
        // Dividir por líneas. El primer renglón con texto será el Header.
        const allLines = content.split('\n').map(l => l.trim());
        const headerText = (allLines.find(l => l.length > 0) || '').replace(/<br>/g, '').replace(/^: /,'');
        
        // El resto es el cuerpo
        const headerIdx = allLines.findIndex(l => l.length > 0);
        const bodyLines = allLines.slice(headerIdx + 1);
        const bodyTextRaw = bodyLines.join('\n').trim();

        const listItems = bodyTextRaw
            .split('\n')
            .map(line => {
                const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
                if (!cleanLine) return '';
                return `
                    <li>
                        <span class="check-v2">✓</span>
                        <div class="answer-item-text-v2">${markdownToHtmlSimple(cleanLine)}</div>
                    </li>
                `;
            })
            .filter(Boolean)
            .join('');

        const finalBody = listItems
          ? `<ul class="check-list-v2">${listItems}</ul>`
          : markdownToHtmlSimple(bodyTextRaw);

        const highlightedHtml = `
            <div class="blue-highlight-box-v2">
                <div class="blue-highlight-header-v2">
                    <span class="header-icon-v2">💬</span>
                    <span>${headerText}</span>
                </div>
                <div class="blue-highlight-body-v2">
                    ${finalBody}
                </div>
            </div>
        `;
        processed = processed.replace(fullMatch, highlightedHtml);
    }

    // Soporte para cuadros de advertencia ⚠️ (Warning Box v2)
    processed = processed.replace(/⚠️\s*([\s\S]+?)(?=\s*\n&gt;|\s*\nFuente:|$)/g, (match, content) => {
        return `
            <div class="warning-box-v2">
                ⚠️ ${markdownToHtmlSimple(content.trim())}
            </div>
        `;
    });

    return markdownToHtmlSimple(processed);
}

// Función base de markdown para evitar recursión infinita
function markdownToHtmlSimple(text) {
    if (!text) return '';
    let processed = normalizeChatWhitespace(String(text));
    const protectedTags = [];
    // Conservar HTML seguro ya generado (p. ej. <strong> del LLM) y bloques propios
    processed = processed.replace(/<(\/?(?:div|details|summary|ul|ol|li|p|strong|em|b|i|a|span|br|code|blockquote)[^>]*)>/gi, (match) => {
        const placeholder = `__HTML_TAG_${protectedTags.length}__`;
        protectedTags.push(match);
        return placeholder;
    });
    processed = processed.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    processed = processed.replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>');
    processed = processed
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n- /g, '\n• ');
    processed = processed.replace(/\n{2,}/g, '<br class="para-gap">');
    processed = processed.replace(/\n/g, '<br>');
    processed = processed.replace(/(<br[^>]*>\s*){3,}/gi, '<br><br>');
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
        { code: 'MOD-MAN-002', name: 'Manuales', id: 'MAN' },
        { code: 'MOD-REQ-003', name: 'Requisitos', id: 'REQ' },
        { code: 'MOD-CALC-004', name: 'Calculadora', id: 'CALC' },
        { code: 'MOD-VIA-006', name: 'Viáticos', id: 'VIA' },
        { code: 'MAN-CAJ', name: 'Caja Chica', id: 'CAJA' },
        { code: 'MOD-SAN-007', name: 'Sanciones', id: 'SAN' },
        { code: 'MOD-GLO-008', name: 'Glosario', id: 'GLOSARIO' },
        { code: 'MOD-AUD-005', name: 'Auditoría', id: 'AUD' },
        { code: 'MOD-HIST-009', name: 'Mi Historial', id: 'HIST' },
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
    // 1. Render prompt text as bot bubble if provided
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
    
    // 2. Ocultar el ribbon inferior — las opciones se muestran en el FAB Speed Dial
    const contextRibbon = document.getElementById('contextual-ribbon');
    if (contextRibbon) contextRibbon.style.display = 'none';

    // 3. Mostrar opciones en FAB Speed Dial dentro del área de chat
    const filtered = topics.filter(t => !t.toLowerCase().includes('regresar'));
    renderFABSpeedDial(filtered, (text) => {
        clearFABSpeedDial();
        if (contextRibbon) contextRibbon.style.display = '';
        onSelect('', text);
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

// ── FAB Speed Dial — Botón flotante de desambiguación ────────────
// Se posiciona dentro del área de mensajes, esquina inferior derecha.

/** Elimina el FAB Speed Dial si existe */
export function clearFABSpeedDial() {
    const existing = document.getElementById('fab-speed-dial');
    if (existing) {
        existing.classList.add('fab-hidden');
        setTimeout(() => existing.remove(), 350);
    }
}

/**
 * Renderiza un FAB Speed Dial con opciones tipo pill.
 * @param {string[]} options — Etiquetas de las opciones
 * @param {function} onSelect — Callback con el texto seleccionado
 */
export function renderFABSpeedDial(options, onSelect) {
    // Limpiar FAB previo
    clearFABSpeedDial();

    // Contenedor principal — fijo dentro del viewport, pegado a la zona del chat
    const container = document.createElement('div');
    container.id = 'fab-speed-dial';
    container.className = 'fab-container';
    container.setAttribute('role', 'menu');
    container.setAttribute('aria-label', 'Opciones de consulta');

    // Botón principal "+" con animación de pulso
    const mainBtn = document.createElement('button');
    mainBtn.className = 'fab-main fab-pulse';
    mainBtn.setAttribute('aria-label', 'Selecciona una opción');
    mainBtn.setAttribute('aria-expanded', 'true');
    mainBtn.setAttribute('aria-controls', 'fab-options-list');
    mainBtn.innerHTML = '+';

    // Contenedor de opciones (se despliegan hacia arriba)
    const optionsWrap = document.createElement('div');
    optionsWrap.className = 'fab-options';
    optionsWrap.id = 'fab-options-list';

    options.forEach((label) => {
        const btn = document.createElement('button');
        btn.className = 'fab-option-item';
        btn.setAttribute('role', 'menuitem');
        btn.textContent = label;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            onSelect(label);
        });
        optionsWrap.appendChild(btn);
    });

    // Toggle: clic en "+" oculta/muestra opciones
    let open = true;
    mainBtn.addEventListener('click', () => {
        open = !open;
        optionsWrap.style.display = open ? '' : 'none';
        mainBtn.textContent = open ? '+' : '✕';
        mainBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Orden: el botón "+" va primero (aparece abajo por column-reverse)
    container.appendChild(optionsWrap);
    container.appendChild(mainBtn);

    // Insertar al final del body para que quede sobre todo
    document.body.appendChild(container);

    // Scroll al fondo del chat para dar contexto visual
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
}
