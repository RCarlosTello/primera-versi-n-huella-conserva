/**
 * app/main.js
 * Punto de entrada — conecta ChatEngine con la UI DOM.
 */

import { ChatEngine } from './chat.js';

const engine = new ChatEngine();
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const logoutBtn = document.getElementById('btn-logout');
const headerLogoutBtn = document.getElementById('header-logout-btn');
const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPass = document.getElementById('login-pass');
const loginError = document.getElementById('login-error');
const loginSubmit = document.getElementById('login-submit');

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

// ── Login Flow ────────────────────────────────────────────────
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.remove('show');
    loginError.textContent = '';
    
    loginSubmit.disabled = true;
    loginSubmit.textContent = 'Validando...';

    try {
        await engine.login(loginEmail.value, loginPass.value);
    } catch (err) {
        loginError.textContent = err.message;
        loginError.classList.add('show');
        loginSubmit.disabled = false;
        loginSubmit.textContent = 'Ingresar';
    }
});

// ── Toggle Password Visibility ────────────────────────────────
const togglePassword = document.getElementById('togglePassword');
if (togglePassword && loginPass) {
    togglePassword.addEventListener('click', () => {
        const isPassword = loginPass.type === 'password';
        loginPass.type = isPassword ? 'text' : 'password';
        togglePassword.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
}


// Note: Resto de controles de UI de login se manejan de forma simplificada en la nueva versión.

// ── Logout ────────────────────────────────────────────────────
logoutBtn?.addEventListener('click', () => engine.onLogoutClick());
headerLogoutBtn?.addEventListener('click', () => engine.onLogoutClick());

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

// ── Sidebar Toggle ────────────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// ── Ribbon Scroll ──────────────────────────────────────────
const ribbonRowBottom = document.getElementById('ribbon-row-bottom');
const ribbonScrollRight = document.getElementById('ribbon-scroll-right');
if (ribbonRowBottom && ribbonScrollRight) {
    ribbonScrollRight.addEventListener('click', () => {
        ribbonRowBottom.scrollBy({ left: 300, behavior: 'smooth' });
    });
}

// ── Init ──────────────────────────────────────────────────────
engine.init();
