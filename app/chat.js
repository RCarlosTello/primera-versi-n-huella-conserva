import {
    handleMANLineasPrompt, handleMANTemasPrompt,
    detectLinea, detectManualDesdeQuery,
    handleMAN, handleVIA, handleSAN, handleCON,
    handleGLOSARIO, handleCALC, handleREQ,
    MAN_LINEAS, MANUAL_KEYWORDS, CON_TOPICS
} from './modules.js';
import {
    renderMessage, renderMenu, renderTopicButtons, renderDualCollapsibleMenu,
    renderFileAttachment, showTyping, hideTyping, clearMessages,
    setBreadcrumb, getBreadcrumb, setModBtnActive, enableModBtns,
    disableModBtns, showSessionPanel, hideSessionPanel, updateSessionTimer,
    renderRibbon,
    createStreamingBubble, appendStreamToken, finalizeStreamingBubble,
} from './ui.js';
import { lookupCollaborator, SessionManager, checkIsBirthday } from './auth.js';
import { FAQS } from '../data/faqs.js';
import { retrieve, formatContext } from './rag.js';
import { initLLM, generate, isLLMReady, isLLMLoading } from './llm.js';

const STATE = {
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    AUTHENTICATED: 'AUTHENTICATED',
    WAITING_LINEA: 'WAITING_LINEA'
};

const MODULE_NAMES = {
    'CON': 'Conócenos', 'MAN': 'Manuales', 'VIA': 'Viáticos',
    'CAJA': 'Caja Chica', 'AUD': 'Auditoría', 'SAN': 'Sanciones',
    'GLOSARIO': 'Glosario Institucional', 'CALC': 'Calculadora de Crédito',
    'REQ': 'Requisitos de Crédito', 'HIST': 'Historial de Consultas',
};

const FAQ_TO_MODULE = {
    'MAN_CAJ': 'CAJA', 'MAN_AUD': 'AUD', 'MAN_VIA': 'VIA',
    'MAN_SOL': 'MAN', 'MAN_IND': 'MAN', 'MAN_TAC': 'MAN',
    'MAN_HOG': 'MAN', 'MAN_PAR': 'MAN',
};

export class ChatEngine {
    constructor() {
        this._state          = STATE.UNAUTHENTICATED;
        this._session        = null;
        this._module         = null;
        this._linea          = null;
        this._pendingQuery   = null;
        this._currentOptions = null;
        this._queryHistory   = [];
        // Historial de conversación para CONSERVA-IA (últimas N rondas)
        this._convHistory    = [];  // [{ role: 'user'|'assistant', content: string }]
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

        document.dispatchEvent(new CustomEvent('hc-login-success', { detail: collab }));

        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.classList.add('hidden');
        document.getElementById('app-shell').style.display = 'flex';

        enableModBtns();
        showSessionPanel(collab);
        this._startTimerDisplay();

        // Iniciar carga del modelo IA en segundo plano
        this._initIA();

        const cumple = await checkIsBirthday(collab.fecha_nacimiento);
        let welcome = `¡Hola! 👋🌿\nBienvenido(a), *${collab.nombre}* al Ecosistema Huella CONSERVA.\n> \n> Estoy listo para apoyarte con información institucional, manuales, políticas, viáticos y cualquier consulta de Grupo CONSERVA.\n>\n> 💡 **Tip:** Puedes preguntarme directamente sin seleccionar módulo, por ejemplo:\n> _"¿Cuál es el monto máximo de caja chica?"_ o _"¿Qué viáticos me corresponden a Puebla?"_`;
        if (cumple) welcome += `\n> \n> 🎂 En nombre de Grupo CONSERVA, **¡Feliz cumpleaños!** 🎉`;

        renderMessage('bot', welcome);
        setBreadcrumb('Menú Principal');
        this._showMenu();
    }

    // ── Carga del modelo IA ──────────────────────────────────────
    _initIA() {
        const statusEl = document.getElementById('ia-status');
        const overlay  = document.getElementById('ia-loading-overlay');
        const fill     = document.getElementById('ia-progress-fill');
        const text     = document.getElementById('ia-progress-text');

        if (statusEl) {
            statusEl.textContent = '⏳ IA: cargando...';
            statusEl.className   = 'ia-status loading';
        }

        initLLM((info) => {
            if (info.status === 'ready') {
                if (statusEl) {
                    statusEl.textContent = '🟢 IA: lista';
                    statusEl.className   = 'ia-status ready';
                }
                if (overlay) overlay.classList.add('hidden');
                return;
            }

            if (info.status === 'error') {
                if (statusEl) {
                    statusEl.textContent = '🔴 IA: error';
                    statusEl.className   = 'ia-status error';
                }
                if (overlay) overlay.classList.add('hidden');
                return;
            }

            // Progreso de descarga
            if (info.status === 'downloading' || info.status === 'progress') {
                if (overlay) overlay.classList.remove('hidden');
                if (info.progress != null && fill && text) {
                    const pct = Math.round(info.progress);
                    fill.style.width = `${pct}%`;
                    const name = info.name ? info.name.split('/').pop() : 'modelo';
                    text.textContent = `Descargando ${name}... ${pct}%`;
                }
            }

            if (info.status === 'initiate' && overlay) {
                overlay.classList.remove('hidden');
                if (text) text.textContent = 'Preparando modelo...';
            }

            if (info.status === 'done' && overlay && fill && text) {
                fill.style.width = '100%';
                text.textContent = 'Cargando modelo en memoria...';
            }
        }).catch(() => {
            if (statusEl) {
                statusEl.textContent = '🔴 IA: no disponible';
                statusEl.className   = 'ia-status error';
            }
        });
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
        this._linea  = null;
        this._pendingQuery = null;
        setModBtnActive(moduleId);
        clearMessages();
        setBreadcrumb(MODULE_NAMES[moduleId] || moduleId);

        if (moduleId === 'CON') {
            renderTopicButtons(CON_TOPICS.map(t => t.label), (num, text) => this.process(text), 'Selecciona el área de interés:');
        } else if (moduleId === 'MAN') {
            renderMessage('bot', 'Has seleccionado **Manuales Institucionales**. ¿Sobre qué línea de crédito o producto deseas consultar?');
            renderTopicButtons(MAN_LINEAS.map(l => l.label), (num, text) => this.process(text));
        } else if (moduleId === 'CAJA') {
            this._module = 'MAN';
            this._linea  = { id: 'MAN_CAJ', label: 'Caja Chica' };
            const res    = handleMANTemasPrompt(this._linea);
            renderMessage('bot', res.content);
            renderTopicButtons(res.botonesTemas, (num, text) => this.process(text));
        } else if (moduleId === 'AUD') {
            this._module = 'MAN';
            this._linea  = { id: 'MAN_AUD', label: 'Auditoría Interna' };
            const res    = handleMANTemasPrompt(this._linea);
            renderMessage('bot', res.content);
            renderTopicButtons(res.botonesTemas, (num, text) => this.process(text));
        } else if (moduleId === 'SAN') {
            renderTopicButtons(
                ['Búsqueda por Folio', 'Reglas Generales de Conducta', 'Nivel de Sanciones Grave', 'Formatos para Descarga', 'Regresar al Menú Principal'],
                (num, text) => this.process(text),
                'Has seleccionado **Matriz de Sanciones**. ¿Qué deseas consultar?'
            );
        } else if (moduleId === 'GLOSARIO') {
            setBreadcrumb('Glosario Institucional');
            renderMessage('bot', `📖 **Glosario Institucional CONSERVA**\n\nBusca cualquier término: CAT, PLD, SOFOM, COCS, PAR-1, DDA, ENCI, DAF, SPEI, y más.\n\nEscribe el término que quieres consultar o selecciona una categoría:`);
            renderTopicButtons([
                'Términos Financieros (CAT, PLD, SOFOM)', 'Términos Operativos (COCS, ENCI, DAF)',
                'Términos de Crédito (DDA, Ciclo, Bonificación)', 'Buscar término específico',
            ], (num, text) => this.process(text));
        } else if (moduleId === 'CALC') {
            setBreadcrumb('Calculadora de Crédito');
            renderMessage('bot', `🧮 **Calculadora de Crédito CONSERVA**\n\nSimula cuánto pagarías por tu crédito. Dime:\n- ¿Qué producto? (Mujeres de Palabra, Individual, T Activa, Tu Hogar, Paralelo)\n- ¿Monto a solicitar?\n- ¿Plazo en semanas o meses?\n\nO selecciona un producto:`);
            renderTopicButtons([
                'Simular Mujeres de Palabra', 'Simular Crédito Individual',
                'Simular Conserva T Activa', 'Simular Tu Hogar', 'Simular Crédito Paralelo',
            ], (num, text) => this.process(text));
        } else if (moduleId === 'REQ') {
            setBreadcrumb('Requisitos de Crédito');
            renderMessage('bot', `📋 **Requisitos por Producto de Crédito**\n\n¿Para qué producto quieres ver los requisitos?`);
            renderTopicButtons([
                '👥 Mujeres de Palabra', '🏪 Crédito Individual', '⚡ Conserva T Activa',
                '🏠 Tu Hogar con CONSERVA', '➕ Crédito Paralelo', '📊 Comparar todos los productos',
            ], (num, text) => this.process(text));
        } else if (moduleId === 'HIST') {
            setBreadcrumb('Historial de Consultas');
            this._historialLoad();
        } else if (moduleId === 'VIA') {
            renderTopicButtons([
                'Topes de Hospedaje por Ciudad', 'Viáticos de Alimentos', 'Reglas de Transporte',
                'Calcular Viáticos (ruta y días)', 'Anticipación y Comprobación',
                'Viáticos Internacionales', 'Regresar al Menú Principal'
            ], (num, text) => this.process(text), '✈️ Has seleccionado **Política de Viáticos**. ¿Sobre qué tema deseas consultar?');
        } else {
            renderMessage('bot', `Has seleccionado **${MODULE_NAMES[moduleId]}**. Dime qué información necesitas.`);
        }
    }

    async process(input) {
        if (this._state === STATE.UNAUTHENTICATED) {
            if (input.includes('@grupoconserva.mx')) {
                const loginScreen = document.getElementById('login-screen');
                if (loginScreen) {
                    loginScreen.classList.remove('hidden');
                    loginScreen.style.display = 'flex';
                    const emailInput = document.getElementById('login-email');
                    if (emailInput) { emailInput.value = input; document.getElementById('login-pass')?.focus(); }
                }
            } else {
                renderMessage('bot', 'Acceso restringido. Por favor, inicia sesión con tus credenciales institucionales.');
            }
            return;
        }

        this._session?.reset();
        this._queryHistory.push(input);
        if (this._queryHistory.length > 10) this._queryHistory.shift();

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

    // ── Historial de consultas (localStorage) ────────────────────
    _historialSave(query, answer) {
        try {
            const KEY  = 'hc-historial';
            const hist = JSON.parse(localStorage.getItem(KEY) || '[]');
            hist.unshift({
                q:   query.slice(0, 120),
                a:   (answer || '').replace(/\*\*/g, '').replace(/\n/g, ' ').slice(0, 200),
                ts:  Date.now(),
                mod: this._module || '',
            });
            localStorage.setItem(KEY, JSON.stringify(hist.slice(0, 10)));
        } catch(e) {}
    }

    _historialLoad() {
        try {
            const hist = JSON.parse(localStorage.getItem('hc-historial') || '[]');
            if (!hist.length) {
                renderMessage('bot', '📭 Aún no tienes consultas guardadas. Empieza haciendo una pregunta en cualquier módulo.');
                return;
            }
            const fmt = new Intl.DateTimeFormat('es-MX', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
            let md = `📋 **Tus últimas ${hist.length} consulta(s):**\n\n`;
            hist.forEach((h, i) => {
                const fecha = fmt.format(new Date(h.ts));
                md += `**${i+1}. ${h.q}**\n`;
                md += `_${fecha}_${h.mod ? ` — ${h.mod}` : ''}\n`;
                md += `↪ ${h.a.slice(0,150)}...\n\n`;
            });
            renderMessage('bot', md, 'Historial guardado localmente en este dispositivo');
            renderTopicButtons(['Borrar historial', 'Volver al menú'], (num, text) => this.process(text));
        } catch(e) {
            renderMessage('bot', '⚠️ No se pudo leer el historial.');
        }
    }

    _buildContext() {
        return { module: this._module, linea: this._linea?.label, breadcrumb: getBreadcrumb() };
    }

    // ── RAG + CONSERVA-IA (respuesta local, sin internet) ────────
    /**
     * Ruta principal cuando los handlers estructurados no tienen resultado.
     * 1. Recupera fragmentos relevantes con BM25 en todos los índices.
     * 2. Alimenta el LLM local con el contexto + historial conversacional.
     * 3. Hace streaming token a token al chat bubble.
     */
    async _answerWithIA(query) {
        if (!isLLMReady()) {
            if (isLLMLoading()) {
                renderMessage('bot',
                    `⏳ **CONSERVA-IA** está cargando el modelo...\n\n` +
                    `Mientras tanto, puedes usar los módulos del menú o esperar un momento para hacer consultas abiertas.\n\n` +
                    `La primera descarga puede tomar algunos minutos según tu conexión — luego queda guardado en tu dispositivo.`
                );
            } else {
                renderMessage('bot',
                    `⚠️ **CONSERVA-IA no está disponible.**\n\n` +
                    `Usa los módulos del menú lateral para consultar información específica:\n` +
                    `- **Manuales** → créditos y productos\n` +
                    `- **Viáticos** → hospedaje y alimentos\n` +
                    `- **Sanciones** → conducta y formatos\n` +
                    `- **Glosario** → términos institucionales`
                );
            }
            return;
        }

        // 1. RAG: recuperar fragmentos relevantes
        let chunks = [];
        try {
            chunks = await retrieve(query, 6);
        } catch (e) {
            console.warn('[RAG] Error al recuperar:', e);
        }
        const context = formatContext(chunks);

        // 2. Crear bubble de streaming
        hideTyping();
        const { wrap, bubble } = createStreamingBubble();

        // 3. Generar respuesta con el LLM local (streaming)
        let fullText = '';
        try {
            await generate(query, context, this._convHistory, (token) => {
                fullText += token;
                appendStreamToken(bubble, token);
            });
        } catch (e) {
            finalizeStreamingBubble(wrap, bubble);
            renderMessage('bot', `⚠️ Error al generar respuesta: ${e.message}`);
            return;
        }

        // 4. Finalizar bubble y renderizar markdown
        const sourceLabel = chunks.length
            ? `CONSERVA-IA — ${chunks.slice(0, 2).map(c => c.source).filter(Boolean).join(', ')}`
            : 'CONSERVA-IA (base de conocimiento local)';
        finalizeStreamingBubble(wrap, bubble, sourceLabel);

        // 5. Guardar en historial conversacional (para follow-ups)
        this._convHistory.push({ role: 'user',      content: query    });
        this._convHistory.push({ role: 'assistant',  content: fullText });
        // Mantener ventana de 8 mensajes (4 rondas)
        if (this._convHistory.length > 8) this._convHistory = this._convHistory.slice(-8);

        // 6. Guardar en historial de consultas (localStorage)
        this._historialSave(query, fullText);
    }

    // ── Detección de intención cross-módulo ──────────────────────
    _detectIntention(input) {
        const q = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const via = ['viatico','hospedaje','hotel','alojamiento','alimento','comida',
            'desayuno','cena','transporte','vuelo','avion','merida','tabasco',
            'chiapas','puebla','cdmx','oaxaca','campeche','cuanto me toca',
            'cuanto corresponde','voy a','viajo a','viaje a'];
        if (via.some(k => q.includes(k)) && this._module !== 'VIA') return 'VIA';
        const san = ['sancion','falta','folio','conducta','amonestacion','despido',
            'baja','acta','llamada de atencion','infraccion','castigo'];
        if (san.some(k => q.includes(k)) && this._module !== 'SAN') return 'SAN';
        const con = ['mision','vision','historia','valores','conserva nacio',
            'cuando se fundo','fundacion','proposito','mantra'];
        if (con.some(k => q.includes(k)) && this._module !== 'CON') return 'CON';
        return null;
    }

    async _handleByModule(moduleId, input, collab) {
        if (moduleId === 'VIA')     return handleVIA(input, collab);
        if (moduleId === 'SAN')     return await handleSAN(input);
        if (moduleId === 'CON')     return handleCON(input);
        if (moduleId === 'GLOSARIO') return await handleGLOSARIO(input);
        if (moduleId === 'CALC')    return await handleCALC(input, collab);
        if (moduleId === 'REQ')     return await handleREQ(input);
        if (moduleId === 'HIST')    { this._historialLoad(); return null; }
        return null;
    }

    async _handleAuthenticatedQuery(input) {
        const collab = this._session?.collaborator;
        const low    = input.toLowerCase();

        // Comandos especiales
        if (low.includes('regresar') && (low.includes('menú') || low.includes('menu'))) {
            this._module = null;
            this._state  = STATE.AUTHENTICATED;
            setBreadcrumb('Menú Principal');
            setModBtnActive(null);
            this._showMenu();
            return;
        }
        if (/historial|mis consultas|consultas recientes/i.test(input)) {
            this._historialLoad(); return;
        }
        if (/borrar historial|limpiar historial|eliminar historial/i.test(input)) {
            localStorage.removeItem('hc-historial');
            renderMessage('bot', '🗑️ Historial borrado correctamente.'); return;
        }

        // ── Detección inteligente de intención cross-módulo ──────
        const detectedModule = this._detectIntention(input);
        if (detectedModule && detectedModule !== this._module) {
            const result = await this._handleByModule(detectedModule, input, collab);
            if (result?.content) {
                const modNames = { VIA:'Viáticos', SAN:'Sanciones', CON:'Conócenos', MAN:'Manuales' };
                const note = this._module
                    ? `\n\n> 💡 *Tu pregunta fue sobre **${modNames[detectedModule] || detectedModule}**, respondí desde el módulo correcto.*`
                    : '';
                renderMessage('bot', result.content + note, result.source);
                if (result.adjunto)   renderFileAttachment(result.adjunto.nombre, result.adjunto.url, result.adjunto.descripcion);
                if (result.formatos)  result.formatos.forEach(f => renderFileAttachment(f.archivo, f.url, f.descripcion));
                if (result.botonesTemas) renderTopicButtons(result.botonesTemas, (num, text) => this.process(text));
                this._historialSave(input, result.content);
                return;
            }
        }

        // ── Auto-detección de módulo por keywords ────────────────
        const _q = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        const isSancion = /\bsancion|\bfolio\b|\bmatriz.*sanc|\bfalta.*laboral|\bleve\b|\bgrave\b|\bmodera[dt]|\bconducta\b|\bamonest|\bllamada.*atencion|\bacta.*admin|\bplan.*mejora|\brescision|\bdespido|\bincumplimiento.*formato|\bomision.*formato|\bomision.*llenado|\bcobranza.*extra|\bformato.*cobranza/i.test(input);
        const isViatico = /\bviatic|\bhospedaje|\bhotel\b|\bnoche.*viaje|\bviajar\b|\bcuanto.*viaje|\bmerida\b|\btabasco\b|\bchiapas\b|\bcdmx\b|\bpuebla.*viaje|\bdias.*viaje|\bviaje.*dias|\btransporte.*viaje/i.test(input);
        const isCaja    = /caja chica|caja.*chica|reembolso.*caja|fondo.*caja|efectivo.*caja/i.test(input);

        let moduloDetectado = null;
        if (isSancion)       moduloDetectado = 'SAN';
        else if (isViatico)  moduloDetectado = 'VIA';
        else if (isCaja)     moduloDetectado = 'CAJA_MAN';

        if (moduloDetectado && moduloDetectado !== this._module) {
            if (moduloDetectado === 'SAN') {
                this._module = 'SAN'; this._linea = null;
                setModBtnActive('SAN'); setBreadcrumb('Sanciones');
            } else if (moduloDetectado === 'VIA') {
                this._module = 'VIA'; this._linea = null;
                setModBtnActive('VIA'); setBreadcrumb('Viáticos');
            } else if (moduloDetectado === 'CAJA_MAN') {
                this._module = 'MAN'; this._linea = { id: 'MAN_CAJ', label: 'Caja Chica' };
                setModBtnActive('CAJA'); setBreadcrumb('Caja Chica');
            }
        }

        // ── Handlers estructurados (calculados, tablas exactas) ──
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
                    this._linea = det;
                    result = handleMAN(input, det, collab);
                } else {
                    const { linea, opciones } = detectManualDesdeQuery(input) || {};
                    if (linea) {
                        this._linea = linea;
                        result = handleMAN(input, linea, collab);
                    } else {
                        this._state       = STATE.WAITING_LINEA;
                        this._pendingQuery = input;
                        renderMessage('bot', `Para darte información precisa sobre **"${input}"**, dime sobre cuál línea de crédito deseas consultar:`);
                        renderTopicButtons(
                            [...(opciones || MAN_LINEAS).map(l => l.label), 'Regresar'],
                            (num, text) => {
                                if (text.includes('Regresar')) { this._showMenu(); return; }
                                this.process(text);
                            }
                        );
                        return;
                    }
                }
            } else {
                result = handleMAN(input, this._linea, collab);
            }
        }

        // ── Respuesta de handler estructurado ────────────────────
        if (result?.content) {
            const crumb  = getBreadcrumb() || this._module || 'General';
            const header = `**Sistema:** Huella Conserva | v2.0 | 2026 | Activo\n📍 ${crumb}\n\n`;
            renderMessage('bot', header + result.content, result.source);
            this._historialSave(input, result.content);
            if (result.adjunto)     renderFileAttachment(result.adjunto.nombre, result.adjunto.url, result.adjunto.descripcion);
            if (result.formatos)    result.formatos.forEach(f => renderFileAttachment(f.archivo, f.url, f.descripcion));
            if (result.botonesTemas) renderTopicButtons(result.botonesTemas, (num, text) => this.process(text));
            return;
        }

        // ── Deep search estructurado → RAG+IA como fallback ──────
        if (result?.needsDeepSearch) {
            // Intentar deep search en el manual específico primero
            const { deepSearch } = await import('./search.js');
            const deep = await deepSearch(input, result.linea || this._linea?.id || 'MAN_SOL');
            if (deep && deep.score > 4) {
                renderMessage('bot',
                    `**Sistema:** Huella Conserva | v2.0\n📍 ${getBreadcrumb() || 'Manual'}\n\n📖 ${deep.text}`,
                    result.source
                );
                if (result.botonesTemas) renderTopicButtons(result.botonesTemas, (num, text) => this.process(text));
                return;
            }
            // Si deep search no es suficiente → CONSERVA-IA con RAG completo
            await this._answerWithIA(input);
            return;
        }

        // ── Sin resultado en handlers → CONSERVA-IA con RAG completo ──
        await this._answerWithIA(input);
    }
}
