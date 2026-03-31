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

// ── Sidebar Toggle — Mobile First ────────────────────────────
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function openSidebar() {
    sidebar.classList.add('open');
    sidebar.classList.remove('collapsed');
    if (sidebarOverlay) sidebarOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden'; // prevent scroll behind
}

function closeSidebar() {
    sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('visible');
    document.body.style.overflow = '';
}

function isMobile() { return window.innerWidth <= 850; }

// On mobile: start CLOSED. On desktop: start OPEN.
if (isMobile()) {
    sidebar.classList.remove('open');
    sidebar.classList.add('collapsed');
} else {
    sidebar.classList.add('open');
    sidebar.classList.remove('collapsed');
}

window.addEventListener('resize', () => {
    if (!isMobile()) {
        sidebar.classList.add('open');
        sidebar.classList.remove('collapsed');
        if (sidebarOverlay) sidebarOverlay.classList.remove('visible');
        document.body.style.overflow = '';
    } else {
        if (!sidebar.classList.contains('open')) {
            sidebar.classList.add('collapsed');
        }
    }
});

if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}

// Close sidebar when clicking overlay
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}

// Close sidebar when selecting a module on mobile
document.addEventListener('click', (e) => {
    if (isMobile() && e.target.closest('.mod-btn, .mc, #ribbon-row-top .mc')) {
        closeSidebar();
    }
});

// ── Ribbon Scroll (bottom) ──────────────────────────────────────────
const ribbonRowBottom = document.getElementById('ribbon-row-bottom');
const ribbonScrollRight = document.getElementById('ribbon-scroll-right');
if (ribbonRowBottom && ribbonScrollRight) {
    ribbonScrollRight.addEventListener('click', () => {
        ribbonRowBottom.scrollBy({ left: 300, behavior: 'smooth' });
    });
}

// ── Top Ribbon: scroll con flechas y drag ───────────────────────────
const ribbonRowTop   = document.getElementById('ribbon-row-top');
const rBtnLeft  = document.getElementById('ribbon-scroll-left-top');
const rBtnRight = document.getElementById('ribbon-scroll-right-top');

function updateTopArrows() {
    if (!ribbonRowTop) return;
    const atStart = ribbonRowTop.scrollLeft <= 4;
    const atEnd   = ribbonRowTop.scrollLeft + ribbonRowTop.clientWidth >= ribbonRowTop.scrollWidth - 4;
    if (rBtnLeft)  rBtnLeft.style.display  = atStart ? 'none' : 'flex';
    if (rBtnRight) rBtnRight.style.display = atEnd   ? 'none' : 'flex';
}

if (ribbonRowTop) {
    ribbonRowTop.scrollLeft = 0; // siempre empezar desde Conocenos
    ribbonRowTop.addEventListener('scroll', updateTopArrows, { passive: true });
    setTimeout(updateTopArrows, 400); // after modules render
    // Drag to scroll on desktop
    let isDown = false, startX = 0, scrollLeft = 0;
    ribbonRowTop.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - ribbonRowTop.offsetLeft; scrollLeft = ribbonRowTop.scrollLeft; });
    ribbonRowTop.addEventListener('mouseleave', () => { isDown = false; });
    ribbonRowTop.addEventListener('mouseup', () => { isDown = false; });
    ribbonRowTop.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        ribbonRowTop.scrollLeft = scrollLeft - (e.pageX - ribbonRowTop.offsetLeft - startX);
    });
}
if (rBtnLeft)  rBtnLeft.addEventListener('click',  () => { ribbonRowTop.scrollBy({ left: -180, behavior: 'smooth' }); });
if (rBtnRight) rBtnRight.addEventListener('click', () => { ribbonRowTop.scrollBy({ left: 180, behavior: 'smooth' }); });

// ── Init ──────────────────────────────────────────────────────
engine.init();

// ── Precargar índices de búsqueda al primer toque del input ────
// Así deepSearch funciona cross-módulo desde la primera pregunta
const inputEl = document.getElementById('user-input');
let indexesPreloaded = false;

async function preloadAllIndexes() {
    if (indexesPreloaded) return;
    indexesPreloaded = true;
    const modules = ['MAN_SOL','MAN_IND','MAN_TAC','MAN_HOG','MAN_PAR','MAN_CAJ','MAN_VIA','MAN_AUD'];
    // Load silently in background — no UI indication needed
    for (const mod of modules) {
        try {
            const key = mod.toLowerCase();
            const res = await fetch(`/knowledge/idx_${key}.json`);
            if (res.ok) {
                const data = await res.json();
                // Store in search module cache via custom event
                window._knowledgeCache = window._knowledgeCache || {};
                window._knowledgeCache[key] = data;
            }
        } catch(_) { /* silently fail */ }
    }
    console.info('[Search] All module indexes preloaded');
}

// ── Precargar al login exitoso ────────────────────────────────
// Garantiza que todos los índices estén disponibles offline
document.addEventListener('hc-login-success', () => {
    preloadAllIndexes();
});

// Fallback: preload también al tocar el input (por si el evento no llegó)
if (inputEl) {
    inputEl.addEventListener('focus', preloadAllIndexes, { once: true });
    inputEl.addEventListener('touchstart', preloadAllIndexes, { once: true, passive: true });
}

// ── Indicador de modo offline ─────────────────────────────────
function updateOfflineIndicator() {
    let indicator = document.getElementById('offline-indicator');
    if (!navigator.onLine) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'offline-badge';
            indicator.innerHTML = '📵 Sin conexión — modo offline';
            document.body.appendChild(indicator);
        }
        indicator.classList.add('visible');
    } else {
        if (indicator) indicator.classList.remove('visible');
    }
}

window.addEventListener('online', updateOfflineIndicator);
window.addEventListener('offline', updateOfflineIndicator);
updateOfflineIndicator(); // check on load
