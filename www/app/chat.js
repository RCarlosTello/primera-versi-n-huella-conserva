/**
 * app/chat.js
 * Motor central del chat: estado de la conversación, flujo de autenticación,
 * despacho de módulos, reglas del prompt institucional.
 */

import { validateEmailFormat, lookupCollaborator, isBirthday, SessionManager } from './auth.js';
import {
    handleCON,
    handleMANLineasPrompt, handleMANTemasPrompt,
    detectLinea, detectManualDesdeQuery,
    handleMAN, handleVIA,
    MAN_LINEAS,
} from './modules.js';
import * as UI from './ui.js';


// ── Estado de flujo ───────────────────────────────────────────
const STATE = {
    WAITING_EMAIL: 'WAITING_EMAIL',
    AUTHENTICATED: 'AUTHENTICATED',
    IN_MODULE: 'IN_MODULE',
    WAITING_LINEA: 'WAITING_LINEA',
    WAITING_TEMA: 'WAITING_TEMA',   // Modo Guiado: esperando pregunta tras elegir manual
};

// ── Constantes de texto institucional ────────────────────────
const MSG_SOLICITAR_CORREO = `Para comenzar, indícame tu **correo institucional** (ej. nombre@grupoconserva.mx).`;
const MSG_CORREO_INVALIDO = `El formato del correo no es válido. Por favor ingresa un correo con formato correcto (ej. nombre@grupoconserva.mx).`;
const MSG_CORREO_NO_FOUND = `El correo ingresado no está registrado en el sistema. Por favor verifica e intenta nuevamente.`;
const MSG_OUTSIDE_SCOPE = `Huella Conserva Asistente Institucional está diseñado exclusivamente para atender consultas institucionales de la organización. Para este tipo de solicitudes, no me es posible brindarte asistencia.`;
const MSG_NO_REGULADO = `No se encuentra expresamente regulado en el texto proporcionado.`;
const MSG_INTERPRETACION_1 = `Huella Conserva Asistente Institucional opera bajo un principio de apego literal a los documentos oficiales vigentes. No me está permitido interpretar, opinar ni ampliar el alcance de ninguna disposición normativa. Mi función es presentar el texto oficial tal como fue emitido por la organización. Si requieres una interpretación, te sugiero consultar con el área normativa correspondiente.`;
// MSG_MENU_CIERRE eliminado — reemplazado por _mostrarMenuNavegacion() que usa botones interactivos
const MSG_SESION_EXPIRADA = `Tu sesión anterior ha expirado por inactividad. Por seguridad institucional, ingresa nuevamente tu correo para continuar.`;
const CLOSE_WORDS = ['salir', 'cerrar sesión', 'cerrar sesion', 'adiós', 'adios', 'bye', 'exit', 'logout'];
const INTERPRET_WORDS = ['interpreta', 'interprete', 'qué significa', 'que significa', 'dime qué', 'a tu criterio', 'tu opinión', 'tu opinion', 'explica con tus palabras'];
const OUT_OF_SCOPE_WORDS = ['clima', 'noticias', 'deporte', 'política', 'politica', 'entretenimiento', 'chiste', 'receta', 'tecnología'];

export class ChatEngine {
    constructor() {
        this._state = STATE.WAITING_EMAIL;
        this._module = null;          // 'CON' | 'MAN' | 'VIA'
        this._linea = null;          // objeto de línea de crédito para MAN
        this._pendingQuery = null;   // pregunta original guardada antes de pedir el manual
        this._interpretCount = 0;
        this._history = [];           // { role, text } para detectar repetidas
        this._timerInterval = null;
        this._session = new SessionManager(() => this._onSessionExpired());
    }

    // ── Entry point ───────────────────────────────────────────
    async init() {
        UI.clearMessages();
        UI.disableModBtns();
        UI.hideSessionPanel();
        UI.setBreadcrumb('Autenticación');
        UI.renderMessage('bot', `¡Hola! 👋🌿\nBienvenido(a) al Ecosistema **Huella CONSERVA**.\n\nEstoy listo para apoyarte con información institucional, manuales, políticas, viáticos y cualquier consulta relacionada con tu operación dentro de Grupo CONSERVA.\n\n${MSG_SOLICITAR_CORREO}`);
        this._state = STATE.WAITING_EMAIL;
    }

    // ── Process user input ────────────────────────────────────
    async process(rawInput) {
        const input = (rawInput || '').trim();
        if (!input) return;

        this._session.reset();            // reset inactivity timer
        this._pushHistory('user', input); // record for repetition detection

        UI.showTyping();
        await _delay(600 + Math.random() * 400);
        UI.hideTyping();

        switch (this._state) {
            case STATE.WAITING_EMAIL: await this._handleEmail(input); break;
            case STATE.WAITING_LINEA: await this._handleLinea(input); break;
            case STATE.WAITING_TEMA: await this._handleTema(input); break;
            case STATE.AUTHENTICATED:
            case STATE.IN_MODULE: await this._handleQuery(input); break;
        }
    }

    // ── Auth flow ─────────────────────────────────────────────
    async _handleEmail(input) {
        if (!validateEmailFormat(input)) {
            UI.renderMessage('bot', MSG_CORREO_INVALIDO);
            return;
        }
        const collab = await lookupCollaborator(input);
        if (!collab) {
            UI.renderMessage('bot', MSG_CORREO_NO_FOUND);
            return;
        }

        this._session.start(collab);
        this._state = STATE.AUTHENTICATED;
        UI.enableModBtns();
        UI.showSessionPanel(collab);
        this._startTimerDisplay();

        // Bienvenida
        const cumple = isBirthday(collab.fecha_nacimiento);
        let welcome = `✅ Acceso validado.\n\nBienvenido(a), **${collab.nombre}**.\n\nEstoy a tu disposición para apoyarte con información institucional oficial de Grupo CONSERVA.`;
        if (cumple) {
            welcome += `\n\n🎂 En nombre de Grupo CONSERVA, deseamos felicitarte en tu día. **¡Feliz cumpleaños!** Que este día sea especial para ti.`;
        }
        UI.renderMessage('bot', welcome);
        UI.setBreadcrumb('Menú Principal');



        this._showMenu();
    }

    _showMenu() {
        UI.renderMessage('bot', `**Sistema:** Huella Conserva Asistente Institucional | v1.0 | 2026 | Activo\n\nSelecciona un módulo:`);
        UI.renderMenu((moduleId) => this.openModule(moduleId));
    }

    /** Botones de navegación entre los 4 módulos principales. */
    _mostrarMenuNavegacion() {
        const opciones = [
            'Conócenos — Misión, valores, historia',
            'Manuales de Crédito — Mujeres de Palabra, T Activa, Individual, Tu Hogar, Paralelo',
            'Política de Viáticos — Hospedaje, alimentos, comprobación',
            'Caja Chica — Montos, gastos permitidos, reembolso',
        ];
        const ids = ['CON', 'MAN', 'VIA', 'CAJA'];
        UI.renderMessage('bot', '¿Qué más deseas consultar?');
        UI.renderTopicButtons(opciones, (num, text) => {
            this.openModule(ids[parseInt(num, 10) - 1]);
        });
    }

    openModule(moduleId) {


        // 'CAJA' es atajo directo a Caja Chica dentro de MAN
        if (moduleId === 'CAJA') {
            this._module = 'MAN';
            this._linea = detectLinea('caja chica');
            this._interpretCount = 0;
            this._state = STATE.IN_MODULE;
            UI.setModBtnActive('MAN');
            UI.setBreadcrumb('MOD-MAN-002 › Caja Chica');
            const result = handleMAN('general', this._linea);
            UI.renderMessage('bot', `📍 **Caja Chica**\n\n` + result.content, result.source);
            if (result.botonesTemas) {
                UI.renderTopicButtons(result.botonesTemas, (num, text) => this.process(text));
            }
            return;
        }

        this._module = moduleId;
        this._linea = null;
        this._interpretCount = 0;
        this._state = STATE.IN_MODULE;

        UI.setModBtnActive(moduleId);

        const labels = { CON: 'MOD-CON-001 › Conócenos', MAN: 'MOD-MAN-002 › Manuales Institucionales', VIA: 'MOD-VIA-006 › Política de Viáticos' };
        UI.setBreadcrumb(labels[moduleId] || moduleId);

        if (moduleId === 'CON') {
            UI.renderMessage('bot', '📍 **MOD-CON-001 › Conócenos**\n\nPuedes consultarme sobre la **misión**, **visión**, **historia**, **valores** o **estructura** de Grupo CONSERVA.\n\n¿Qué deseas consultar?');
            UI.renderTopicButtons(['Misión', 'Visión', 'Historia', 'Valores', 'Estructura organizacional'], (num, text) => this.process(text));
        } else if (moduleId === 'MAN') {
            UI.renderMessage('bot', '📍 **MOD-MAN-002 › Manuales Institucionales**\n\nSelecciona la línea de crédito sobre la que deseas consultar:');
            const lineas = [...MAN_LINEAS.map(l => l.label), 'Regresar al Menú Principal'];
            UI.renderTopicButtons(lineas, (num, text) => {
                if (text.toLowerCase().includes('regresar')) { this._module = null; this._state = STATE.AUTHENTICATED; UI.setBreadcrumb('Menú Principal'); UI.setModBtnActive(null); this._showMenu(); return; }
                this.process(text);
            });
            this._state = STATE.WAITING_LINEA;
        } else if (moduleId === 'VIA') {
            const collab = this._session.collaborator;
            UI.renderMessage('bot', `📍 **MOD-VIA-006 › Política de Viáticos**\n\nConsultando tu perfil (**${collab?.puesto || 'colaborador'}**).`);
            UI.renderTopicButtons(['Hospedaje', 'Alimentos', 'Transporte / Vuelo', 'Viáticos internacionales', 'Solicitud y anticipo', 'Comprobación de gastos'], (num, text) => this.process(text));
        }
    }

    // ── Linea selection — Modo Guiado paso 2 ─────────────────
    async _handleLinea(input) {
        const linea = detectLinea(input);
        if (!linea) {
            if (input.trim().length > 3 && !/^\d+$/.test(input.trim())) {
                this._pendingQuery = input;
                UI.renderMessage('bot', `Para darte información sobre **"${input}"**, indícame de cuál línea de crédito deseas consultar:`);
            } else {
                UI.renderMessage('bot', 'No identifiqué la línea. Por favor selecciona una:');
            }
            const lineas = [...MAN_LINEAS.map(l => l.label), 'Regresar al Menú Principal'];
            UI.renderTopicButtons(lineas, (num, text) => {
                if (text.toLowerCase().includes('regresar')) { this._pendingQuery = null; this._module = null; this._state = STATE.AUTHENTICATED; UI.setBreadcrumb('Menú Principal'); UI.setModBtnActive(null); this._showMenu(); return; }
                this.process(text);
            });
            return;
        }
        this._linea = linea;
        UI.setBreadcrumb(`MOD-MAN-002 › ${linea.label}`);

        // ── Si hay una pregunta pendiente, responderla directamente (sin submenú de temas) ──
        if (this._pendingQuery) {
            const query = this._pendingQuery;
            this._pendingQuery = null;
            this._state = STATE.IN_MODULE;
            const result = handleMAN(query, linea);
            const header = `📍 **MOD-MAN-002 › ${linea.label}**\n\n`;
            UI.renderMessage('bot', header + result.content, result.source);
            if (result.botonesTemas) {
                UI.renderTopicButtons(result.botonesTemas, (num, text) => { this.process(text); });
            } else {
                this._mostrarAccionesPostRespuestaMAN();
            }
            return;
        }

        // → Modo Guiado normal: mostrar temas del manual
        this._state = STATE.WAITING_TEMA;
        const resp = handleMANTemasPrompt(linea);
        UI.renderMessage('bot', resp.content, resp.source);
        if (resp.botonesTemas) {
            UI.renderTopicButtons(resp.botonesTemas, (num, text) => {
                this.process(text);
            });
        }
    }

    // ── Tema / pregunta — Modo Guiado paso 3 ─────────────────
    async _handleTema(input) {
        if (input.toLowerCase() === 'regresar a menú principal' || input.toLowerCase() === 'regresar a menu principal') {
            this._module = null; this._state = STATE.AUTHENTICATED;
            UI.setBreadcrumb('Menú Principal');
            UI.setModBtnActive(null);
            this._showMenu();
            return;
        }

        // El usuario ya eligió manual. Cualquier cosa que diga ahora es su pregunta.
        this._state = STATE.IN_MODULE;
        const result = handleMAN(input, this._linea);
        const collab = this._session.collaborator;
        const header = `📍 **MOD-MAN-002 › ${this._linea.label}**\n\n`;
        UI.renderMessage('bot', header + result.content, result.source);

        if (result.botonesTemas) {
            UI.renderTopicButtons(result.botonesTemas, (num, text) => {
                this.process(text);
            });
        } else {
            this._mostrarAccionesPostRespuestaMAN();
        }
    }

    /** Muestra los tres botones de acción estándar después de responder una consulta de manual. */
    _mostrarAccionesPostRespuestaMAN() {
        UI.renderTopicButtons(
            ['Ver temas disponibles de este manual', 'Elegir otra línea de crédito', 'Regresar al Menú Principal'],
            (num, text) => {
                const t = text.toLowerCase();
                if (t.includes('regresar')) {
                    this._module = null; this._state = STATE.AUTHENTICATED;
                    UI.setBreadcrumb('Menú Principal'); UI.setModBtnActive(null);
                    this._showMenu();
                } else if (t.includes('otra línea') || t.includes('otra linea')) {
                    this._linea = null; this._state = STATE.WAITING_LINEA;
                    UI.renderMessage('bot', 'Selecciona la línea de crédito que deseas consultar:');
                    const lineas = [...MAN_LINEAS.map(l => l.label), 'Regresar al Menú Principal'];
                    UI.renderTopicButtons(lineas, (n, txt) => {
                        if (txt.toLowerCase().includes('regresar')) { this._module = null; this._state = STATE.AUTHENTICATED; UI.setBreadcrumb('Menú Principal'); UI.setModBtnActive(null); this._showMenu(); return; }
                        this.process(txt);
                    });
                } else if (t.includes('temas')) {
                    // Relanzar el menú de temas del manual actual
                    const resp = handleMANTemasPrompt(this._linea);
                    UI.renderMessage('bot', resp.content, resp.source);
                    if (resp.botonesTemas) {
                        UI.renderTopicButtons(resp.botonesTemas, (n, txt) => { this.process(txt); });
                    }
                }
            }
        );
    }

    // ── Main query handler ────────────────────────────────────
    async _handleQuery(input) {
        const q = input.toLowerCase();

        // Cierre de sesión
        if (CLOSE_WORDS.some(w => q.includes(w))) {
            this._logout(true);
            return;
        }

        // Fuera de ámbito
        if (OUT_OF_SCOPE_WORDS.some(w => q.includes(w))) {
            UI.renderMessage('bot', MSG_OUTSIDE_SCOPE);
            this._showMenu();
            return;
        }

        // Insistencia en interpretación
        if (INTERPRET_WORDS.some(w => q.includes(w))) {
            this._interpretCount++;
            if (this._interpretCount === 1) {
                UI.renderMessage('bot', MSG_INTERPRETACION_1);
            } else {
                UI.renderMessage('bot', MSG_NO_REGULADO);
                this._showMenu();
            }
            return;
        }

        // Menú principal explícito
        if (q === 'menú' || q === 'menu' || q === 'inicio' || q === 'volver') {
            this._module = null; this._state = STATE.AUTHENTICATED;
            UI.setBreadcrumb('Menú Principal');
            UI.setModBtnActive(null);
            this._showMenu();
            return;
        }

        const mapNumeros = { '1': 'CON', '2': 'MAN', '3': 'VIA', '4': 'MAN' };
        if (/^[1234]$/.test(q.trim())) {
            const mod = mapNumeros[q.trim()];
            if (q.trim() === '4') {
                // Atajo directo a Caja Chica
                this._module = 'MAN';
                const { detectLinea } = await import('./modules.js');
                this._linea = detectLinea('caja chica');
                this._state = STATE.IN_MODULE;
                UI.setModBtnActive('MAN');
                UI.setBreadcrumb('MOD-MAN-002 › Caja Chica');
                const result = handleMAN('', this._linea);
                UI.renderMessage('bot', `📍 **Caja Chica**\n\n` + result.content, result.source);
                UI.renderMessage('bot', MSG_MENU_CIERRE);
                return;
            }
            this.openModule(mod);
            return;
        }

        // ── DETECCIÓN AUTOMÁTICA DE CAMBIO DE MÓDULO O MANUAL (Navegación Cruzada) ──
        const creditoKW = ['credito', 'crédito', 'monto', 'préstamo', 'prestamo', 'plazo', 'tasa', 'interes', 'interés', 'requisito', 'garantia', 'garantía', 'grupo', 'integrante', 'mujeres de palabra', 'solidario', 'individual', 'hogar', 'paralelo', 'tactiva', 't activa', 'caja chica'];
        const viaKW = ['viatico', 'viático', 'hospedaje', 'hotel', 'alimento', 'comida', 'desayuno', 'viaje', 'comisión de viaje'];
        const conKW = ['misión', 'mision', 'visión', 'vision', 'historia', 'valores'];

        let cambioDetectado = false;

        // ¿El usuario pregunta por Viáticos?
        if (viaKW.some(w => q.includes(w)) && this._module !== 'VIA') {
            this._module = 'VIA';
            this._state = STATE.IN_MODULE;
            UI.setModBtnActive('VIA');
            UI.setBreadcrumb('MOD-VIA-006 › Política de Viáticos');
            cambioDetectado = true;
        }
        // ¿El usuario pregunta por Créditos o Caja Chica?
        else if (creditoKW.some(w => q.includes(w))) {
            const { linea, ambiguo } = detectManualDesdeQuery(input);
            if (!ambiguo && linea) {
                // Si está en otro módulo o en otra línea distinta, cambiar
                if (this._module !== 'MAN' || this._linea?.id !== linea.id) {
                    this._module = 'MAN';
                    this._state = STATE.IN_MODULE;
                    this._linea = linea;
                    UI.setModBtnActive('MAN');
                    UI.setBreadcrumb(`MOD-MAN-002 › ${linea.label}`);
                    cambioDetectado = true;
                }
            } else if (this._module !== 'MAN') {
                // Mencionó términos de crédito pero no dijo cuál manual y NO estaba en MAN
                this._module = 'MAN';
                UI.setModBtnActive('MAN');
            }
        }
        // ¿Mencionó cosas institucionales?
        else if (conKW.some(w => q.includes(w)) && this._module !== 'CON') {
            this._module = 'CON';
            this._state = STATE.IN_MODULE;
            UI.setModBtnActive('CON');
            UI.setBreadcrumb('MOD-CON-001 › Conócenos');
            cambioDetectado = true;
        }

        // Despachar al módulo activo (ya sea el anterior o el recién cambiado por Navegación Cruzada)
        let result = null;
        const collab = this._session.collaborator;

        if (this._module === 'CON') {
            result = handleCON(input);
        } else if (this._module === 'MAN') {
            if (!this._linea) {
                // Sin línea seleccionada aún: intentar Modo Directo primero
                const { linea, ambiguo, opciones } = detectManualDesdeQuery(input);
                if (!ambiguo && linea) {
                    this._linea = linea;
                    UI.setBreadcrumb(`MOD-MAN-002 › ${linea.label}`);
                    result = handleMAN(input, linea);
                } else if (!ambiguo && !linea && cambioDetectado === false && this._state === STATE.WAITING_LINEA) {
                    // Ya hay prompt activo, no repetir
                    return;
                } else {
                    // Guardar la pregunta original para responderla cuando el usuario elija el manual
                    this._pendingQuery = input;
                    this._state = STATE.WAITING_LINEA;
                    UI.renderMessage('bot', `Para darte información precisa sobre **"${input}"**, dime sobre cuál línea de crédito deseas consultar:`)
                    const optsLineas = [...(opciones || MAN_LINEAS).map(l => l.label), 'Regresar al Menú Principal'];
                    UI.renderTopicButtons(optsLineas, (num, text) => {
                        if (text.toLowerCase().includes('regresar')) { this._pendingQuery = null; this._module = null; this._state = STATE.AUTHENTICATED; UI.setBreadcrumb('Menú Principal'); UI.setModBtnActive(null); this._showMenu(); return; }
                        this.process(text);
                    });
                    return;
                }
            } else {
                result = handleMAN(input, this._linea);
            }
        } else if (this._module === 'VIA') {
            result = handleVIA(input, collab);
        }

        if (result) {
            const header = `**Sistema:** Huella Conserva Asistente Institucional | v1.0 | 2026 | Activo\n📍 ${UI.getBreadcrumb?.() || this._module}\n\n`;
            UI.renderMessage('bot', header + result.content, result.source);

            // Adjunto de plantilla (ej. comprobación de viáticos)
            if (result.adjunto) {
                UI.renderFileAttachment(result.adjunto.nombre, result.adjunto.url, result.adjunto.descripcion);
            }

            if (result.botonesTemas) {
                UI.renderTopicButtons(result.botonesTemas, (num, text) => {
                    this.process(text);
                });
            } else {
                if (this._module === 'MAN') {
                    this._mostrarAccionesPostRespuestaMAN();
                } else {
                    this._mostrarMenuNavegacion();
                }
            }
        } else {
            this._mostrarMenuNavegacion();
        }

        this._pushHistory('bot', result?.content || '');
    }

    // ── Session expiry ────────────────────────────────────────
    _onSessionExpired() {
        this._cleanup();
        UI.renderSystemMessage('⏱️ Tu sesión ha expirado por inactividad.');
        UI.renderMessage('bot', MSG_SESION_EXPIRADA);
        this._state = STATE.WAITING_EMAIL;
    }

    _logout(active = false) {
        const name = this._session.collaborator?.nombre || 'colaborador';
        this._cleanup();
        if (active) {
            UI.renderMessage('bot', `Gracias por utilizar **Huella Conserva Asistente Institucional**, **${name}**. Tu sesión ha sido cerrada. Que tengas un excelente día. Hasta pronto.`);
        }
        this._state = STATE.WAITING_EMAIL;
        setTimeout(() => this.init(), 3500);
    }

    _cleanup() {
        this._session.end();
        clearInterval(this._timerInterval);
        this._module = null; this._linea = null; this._pendingQuery = null; this._interpretCount = 0; this._history = [];
        UI.disableModBtns(); UI.hideSessionPanel(); UI.setModBtnActive(null);
    }

    // ── Helpers ───────────────────────────────────────────────
    _pushHistory(role, text) {
        this._history.push({ role, text });
        if (this._history.length > 60) this._history.shift();
    }

    _startTimerDisplay() {
        clearInterval(this._timerInterval);
        this._timerInterval = setInterval(() => {
            UI.updateSessionTimer(this._session.getRemainingMs());
        }, 1000);
    }

    onLogoutClick() { if (this._session.isActive) this._logout(true); }
}

function _delay(ms) { return new Promise(r => setTimeout(r, ms)); }
