import { 
    handleMANLineasPrompt, handleMANTemasPrompt,
    detectLinea, detectManualDesdeQuery,
    handleMAN, handleVIA, handleSAN, handleCON,
    MAN_LINEAS, MANUAL_KEYWORDS, CON_TOPICS
} from './modules.js';
import { 
    renderMessage, renderMenu, renderTopicButtons, renderDualCollapsibleMenu, 
    renderFileAttachment, showTyping, hideTyping, clearMessages, 
    setBreadcrumb, getBreadcrumb, setModBtnActive, enableModBtns, 
    disableModBtns, showSessionPanel, hideSessionPanel, updateSessionTimer,
    renderRibbon
} from './ui.js';
import { lookupCollaborator, SessionManager, checkIsBirthday } from './auth.js';

const STATE = {
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    AUTHENTICATED: 'AUTHENTICATED',
    WAITING_LINEA: 'WAITING_LINEA'
};

export class ChatEngine {
    constructor() {
        this._state = STATE.UNAUTHENTICATED;
        this._session = null;
        this._module = null;
        this._linea = null;
        this._pendingQuery = null;
        this._currentOptions = null;
    }

    async init() {
        const savedSession = sessionStorage.getItem('hc-session');
        if (savedSession) {
            try {
                const collab = JSON.parse(savedSession);
                await this._onLoginSuccess(collab);
            } catch (err) {
                sessionStorage.removeItem('hc-session');
                this._state = STATE.UNAUTHENTICATED;
            }
        } else {
            this._state = STATE.UNAUTHENTICATED;
        }
    }

    async login(email, pass) {
        const collab = await lookupCollaborator(email, pass);
        if (!collab) throw new Error('Credenciales inválidas.');

        sessionStorage.setItem('hc-session', JSON.stringify(collab));
        localStorage.setItem('hc-session-offline', JSON.stringify(collab));
        await this._onLoginSuccess(collab);
    }

    async _onLoginSuccess(collab) {
        this._session = new SessionManager(() => this.onLogoutClick());
        this._session.start(collab);
        this._state = STATE.AUTHENTICATED;
        
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.classList.add('hidden');
        document.getElementById('app-shell').style.display = 'flex';

        enableModBtns();
        showSessionPanel(collab);
        this._startTimerDisplay();

        const cumple = await checkIsBirthday(collab.fecha_nacimiento);
        let welcome = `¡Hola! 👋🌿\nBienvenido(a), *${collab.nombre}* al Ecosistema Huella CONSERVA.\n> \n> Estoy listo para apoyarte con información institucional, manuales, políticas, viáticos, capacitaciones y cualquier consulta relacionada con tu operación dentro de Grupo CONSERVA.`;
        if (cumple) welcome += `\n> \n> 🎂 En nombre de Grupo CONSERVA, deseamos felicitarte en tu día. **¡Feliz cumpleaños!**`;
        
        renderMessage('bot', welcome);
        setBreadcrumb('Menú Principal');
        this._showMenu();
    }

    _showMenu() {
        clearMessages();
        renderRibbon((id) => this.openModule(id));
    }

    async openModule(moduleId) {
        if (this._state === STATE.UNAUTHENTICATED) {
            renderMessage('bot', 'Por favor, primero autentícate con tu correo institucional.');
            return;
        }

        this._module = moduleId;
        this._linea = null;
        this._pendingQuery = null;
        setModBtnActive(moduleId);
        clearMessages();

        const names = { 'CON': 'Conócenos', 'MAN': 'Manuales', 'VIA': 'Viáticos', 'CAJA': 'Caja Chica', 'AUD': 'Auditoría', 'SAN': 'Sanciones' };
        setBreadcrumb(names[moduleId] || moduleId);

        if (moduleId === 'CON') {
            renderTopicButtons(CON_TOPICS.map(t => t.label), (num, text) => this.process(text), 'Selecciona el área de interés:');
        } else if (moduleId === 'MAN') {
            renderMessage('bot', 'Has seleccionado **Manuales Institucionales**. ¿Sobre qué línea de crédito o producto deseas consultar?');
            renderTopicButtons(MAN_LINEAS.map(l => l.label), (num, text) => this.process(text));
        } else if (moduleId === 'CAJA') {
            this._module = 'MAN';
            this._linea = { id: 'MAN_CAJ', label: 'Caja Chica' };
            const res = handleMANTemasPrompt(this._linea);
            renderMessage('bot', res.content);
            renderTopicButtons(res.botonesTemas, (num, text) => this.process(text));
        } else if (moduleId === 'AUD') {
            this._module = 'MAN';
            this._linea = { id: 'MAN_AUD', label: 'Auditoría Interna' };
            const res = handleMANTemasPrompt(this._linea);
            renderMessage('bot', res.content);
            renderTopicButtons(res.botonesTemas, (num, text) => this.process(text));
        } else if (moduleId === 'SAN') {
             renderTopicButtons(['Búsqueda por Folio', 'Reglas Generales de Conducta', 'Nivel de Sanciones Grave', 'Formatos para Descarga', 'Regresar al Menú Principal'], (num, text) => this.process(text), 'Has seleccionado **Matriz de Sanciones**. ¿Qué deseas consultar?');
        } else if (moduleId === 'VIA') {
            renderTopicButtons([
                'Topes de Hospedaje por Ciudad',
                'Viáticos de Alimentos',
                'Reglas de Transporte',
                'Calcular Viáticos (ruta y días)',
                'Anticipación y Comprobación',
                'Viáticos Internacionales',
                'Regresar al Menú Principal'
            ], (num, text) => this.process(text), '✈️ Has seleccionado **Política de Viáticos**. ¿Sobre qué tema deseas consultar?');
        } else {
            renderMessage('bot', `Has seleccionado **${names[moduleId]}**. Dime qué información necesitas.`);
        }
    }

    async process(input) {
        if (this._state === STATE.UNAUTHENTICATED) {
            if (input.includes('@grupoconserva.mx')) {
                renderMessage('bot', 'Por favor, inicia sesión en la pantalla de acceso institucional para continuar.');
                const loginScreen = document.getElementById('login-screen');
                if (loginScreen) {
                    loginScreen.classList.remove('hidden');
                    loginScreen.style.display = 'flex';
                    const emailInput = document.getElementById('login-email');
                    if (emailInput) {
                        emailInput.value = input;
                        document.getElementById('login-pass')?.focus();
                    }
                }
            } else {
                renderMessage('bot', 'Acceso restringido. Por favor, inicia sesión con tus credenciales institucionales en la pantalla de acceso.');
            }
            return;
        }

        showTyping();
        try {
            await this._handleAuthenticatedQuery(input);
        } finally {
            hideTyping();
        }
    }

    _startTimerDisplay() {
        setInterval(() => {
            const rem = this._session?.getRemainingTime();
            if (rem !== undefined) updateSessionTimer(rem);
        }, 1000);
    }

    onLogoutClick() {
        sessionStorage.removeItem('hc-session');
        localStorage.removeItem('hc-session-offline');
        window.location.reload();
    }

    async _handleAuthenticatedQuery(input) {
        const collab = this._session?.collaborator;
        const low = input.toLowerCase();

        if (low.includes('regresar') && (low.includes('menú') || low.includes('menu'))) {
            this._module = null; this._state = STATE.AUTHENTICATED; setBreadcrumb('Menú Principal'); setModBtnActive(null); this._showMenu(); return;
        }

        let result = null;
        if (this._module === 'CON') {
            result = handleCON(input);
        } else if (this._module === 'VIA') {
            result = handleVIA(input, collab);
        } else if (this._module === 'SAN') {
            result = await handleSAN(input);
        } else if (this._module === 'MAN' || detectManualDesdeQuery(input)) {
            if (this._module !== 'MAN') this._module = 'MAN';
            if (!this._linea) {
                const det = detectLinea(input);
                if (det) {
                    this._linea = det; result = handleMAN(input, det);
                } else {
                    const { linea, opciones, ambiguo } = detectManualDesdeQuery(input);
                    if (linea) {
                        this._linea = linea; result = handleMAN(input, linea);
                    } else {
                        this._state = STATE.WAITING_LINEA; this._pendingQuery = input;
                        renderMessage('bot', `Para darte información precisa sobre **"${input}"**, dime sobre cuál línea de crédito deseas consultar:`);
                        renderTopicButtons([...(opciones || MAN_LINEAS).map(l => l.label), 'Regresar'], (num, text) => { if (text.includes('Regresar')) { this._showMenu(); return; } this.process(text); });
                        return;
                    }
                }
            } else {
                result = handleMAN(input, this._linea);
            }
        }

        if (result) {
            const currentBreadcrumb = getBreadcrumb() || this._module || 'General';
            const header = `**Sistema:** Huella Conserva Asistente Institucional | v1.0 | 2026 | Activo\n📍 ${currentBreadcrumb}\n\n`;
            renderMessage('bot', header + result.content, result.source);
            if (result.adjunto) renderFileAttachment(result.adjunto.nombre, result.adjunto.url, result.adjunto.descripcion);
            if (result.formatos) result.formatos.forEach(f => renderFileAttachment(f.archivo, f.url, f.descripcion));
            if (result.botonesTemas) renderTopicButtons(result.botonesTemas, (num, text) => this.process(text));
        } else {
            renderMessage('bot', 'No pude encontrar información específica sobre ese tema en el módulo actual. ¿Deseas intentar con otro módulo o ser más específico?');
        }
    }
}
