/**
 * app/ui.js
 * Renderizado DOM del chat: mensajes, menú de módulos, bienvenida.
 */

const messagesEl = document.getElementById('messages-container');
const typingEl = document.getElementById('typing-indicator');
const breadcrumb = document.getElementById('breadcrumb-text');

// ── marcado simple: **negrita**, *cursiva*, \n → <br> ──────────
function markdownToHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n- /g, '\n• ')
        .replace(/\n/g, '<br>');
}

function buildBubble(role, htmlContent, sourceText) {
    const wrap = document.createElement('div');
    wrap.className = `msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.setAttribute('aria-hidden', 'true');
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

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
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

export function renderMenu(onSelect) {
    const modules = [
        { num: '1', code: 'MOD-CON-001', name: 'Conócenos', id: 'CON' },
        { num: '2', code: 'MOD-MAN-002', name: 'Manuales Institucionales', id: 'MAN' },
        { num: '3', code: 'MOD-VIA-006', name: 'Política de Viáticos', id: 'VIA' },
        { num: '4', code: 'MAN-CAJ', name: 'Manual de Caja Chica', id: 'CAJA' },
    ];

    const wrap = document.createElement('div');
    wrap.className = 'msg bot';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = '🌿';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    const cards = document.createElement('div');
    cards.className = 'menu-cards';

    modules.forEach(m => {
        const btn = document.createElement('button');
        btn.className = 'menu-card';
        btn.setAttribute('data-module', m.id);
        btn.innerHTML = `
      <div class="menu-card-num">${m.num}</div>
      <div class="menu-card-info">
        <span class="menu-card-code">${m.code}</span>
        <span class="menu-card-name">${m.name}</span>
      </div>`;
        btn.addEventListener('click', () => onSelect(m.id));
        cards.appendChild(btn);
    });

    bubble.appendChild(cards);
    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

export function renderTopicButtons(topics, onSelect) {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = '🌿';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    const cards = document.createElement('div');
    cards.className = 'menu-cards';

    topics.forEach((t, i) => {
        const isSpecial = t.toLowerCase().includes('regresar') || t.toLowerCase().includes('menú');
        const btn = document.createElement('button');
        btn.className = `menu-card${isSpecial ? ' menu-card--back' : ''}`;
        btn.innerHTML = `
            <div class="menu-card-num">${i + 1}</div>
            <div class="menu-card-info">
                <span class="menu-card-name">${t}</span>
            </div>`;

        btn.addEventListener('click', () => {
            // Deshabilitar todos para evitar doble envío
            cards.querySelectorAll('.menu-card').forEach(b => { b.disabled = true; b.style.opacity = '0.5'; });
            onSelect((i + 1).toString(), t);
        });
        cards.appendChild(btn);
    });

    bubble.appendChild(cards);
    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

export function renderFileAttachment(filename, url, description) {
    const wrap = document.createElement('div');
    wrap.className = 'msg bot';

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = '🌿';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    const card = document.createElement('div');
    card.className = 'file-attachment-card';
    card.innerHTML = `
        <div class="file-attachment-icon">📎</div>
        <div class="file-attachment-info">
            <span class="file-attachment-name">${filename}</span>
            ${description ? `<span class="file-attachment-desc">${description}</span>` : ''}
        </div>
        <a class="file-attachment-btn" href="${url}" download="${filename}">
            ↓ Descargar
        </a>`;

    bubble.appendChild(card);
    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

export function showTyping() { typingEl.classList.remove('hidden'); messagesEl.scrollTop = messagesEl.scrollHeight; }
export function hideTyping() { typingEl.classList.add('hidden'); }
export function clearMessages() { messagesEl.innerHTML = ''; }

export function setBreadcrumb(text) { breadcrumb.textContent = text; }

export function setModBtnActive(id) {
    document.querySelectorAll('.mod-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`nav-${id?.toLowerCase()}`);
    if (btn) btn.classList.add('active');
}

export function enableModBtns() {
    document.querySelectorAll('.mod-btn').forEach(b => { b.disabled = false; });
}

export function disableModBtns() {
    document.querySelectorAll('.mod-btn').forEach(b => { b.disabled = true; b.classList.remove('active'); });
}

export function showSessionPanel(collaborator) {
    const panel = document.getElementById('session-info');
    panel.classList.remove('hidden');
    document.getElementById('user-name-display').textContent = collaborator.nombre;
    document.getElementById('user-role-display').textContent = collaborator.puesto;
}

export function hideSessionPanel() {
    document.getElementById('session-info').classList.add('hidden');
}

export function updateSessionTimer(remainMs) {
    const min = Math.floor(remainMs / 60000);
    const sec = Math.floor((remainMs % 60000) / 1000);
    document.getElementById('session-timer').textContent =
        `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}


