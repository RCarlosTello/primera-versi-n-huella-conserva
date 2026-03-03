/**
 * app/main.js
 * Punto de entrada — conecta ChatEngine con la UI DOM.
 */

import { ChatEngine } from './chat.js';

const engine = new ChatEngine();
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const logoutBtn = document.getElementById('btn-logout');

// ── Auto-resize del textarea ──────────────────────────────────
function autoResize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 130) + 'px';
}

input.addEventListener('input', autoResize);

// ── Enviar mensaje ────────────────────────────────────────────
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    // Render del mensaje del usuario
    const { renderMessage } = await import('./ui.js');
    renderMessage('user', text);

    input.value = '';
    input.style.height = 'auto';
    input.focus();

    await engine.process(text);
}

// Enter = enviar, Shift+Enter = nueva línea
input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

// ── Logout ────────────────────────────────────────────────────
logoutBtn?.addEventListener('click', () => engine.onLogoutClick());

// ── Sidebar module buttons ────────────────────────────────────
document.querySelectorAll('.mod-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-module');
        if (id) engine.openModule(id);
    });
});

// ── Reset activity on any interaction ────────────────────────
['click', 'keydown', 'scroll', 'mousemove', 'touchstart'].forEach(evt =>
    document.addEventListener(evt, () => engine._session?.reset(), { passive: true })
);

// ── Init ──────────────────────────────────────────────────────
engine.init();
