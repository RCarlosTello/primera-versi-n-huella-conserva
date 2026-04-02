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
    renderRibbon, clearFABSpeedDial
} from './ui.js';
import { lookupCollaborator, SessionManager, checkIsBirthday } from './auth.js';
import { crossModuleSearch, deepSearch, deepSearchAllModules, isOnline, semanticSearch } from './search.js';
import { generate, isLLMReady } from './llm.js';
import { FAQS } from '../data/faqs.js';

const FAQS_FOR_SEARCH = { ...FAQS };

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
        this._state = STATE.UNAUTHENTICATED;
        this._session = null;
        this._module = null;
        this._linea = null;
        this._pendingQuery = null;
        this._currentOptions = null;
        this._queryHistory = [];
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

        // Dispatch login event so main.js can preload all search indexes
        document.dispatchEvent(new CustomEvent('hc-login-success', { detail: collab }));
        
        // Inicializar el modelo LLM local (descarga ~600MB en primer uso, luego instantáneo)
        const { initLLM } = await import('./llm.js');
        initLLM((info) => {
            if (info.status === 'ready') console.info('[LLM] Modelo cargado y listo.');
            if (info.status === 'downloading') console.info(`[LLM] Descargando modelo: ${info.progress}%`);
        }).catch(err => console.error('[LLM] Error al inicializar:', err));

        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.classList.add('hidden');
        document.getElementById('app-shell').style.display = 'flex';

        enableModBtns();
        showSessionPanel(collab);
        this._startTimerDisplay();

        const cumple = await checkIsBirthday(collab.fecha_nacimiento);
        let welcome = `¡Hola! 👋🌿\nBienvenido(a), *${collab.nombre}* al Ecosistema Huella CONSERVA.\n> \n> Estoy listo para apoyarte con información institucional, manuales, políticas, viáticos y cualquier consulta de Grupo CONSERVA.\n>\n> 💡 **Tip:** Puedes preguntarme directamente sin seleccionar módulo, por ejemplo:\n> _"¿Cuál es el monto máximo de caja chica?"_ o _"¿Qué viáticos me corresponden a Puebla?"_`;
        if (cumple) welcome += `\n> \n> 🎂 En nombre de Grupo CONSERVA, **¡Feliz cumpleaños!** 🎉`;
        
        renderMessage('bot', welcome);
        setBreadcrumb('Menú Principal');
        this._showMenu();
    }

    _showMenu() {
        clearFABSpeedDial();
        clearMessages();
        renderRibbon((id) => this.openModule(id));
    }

    async openModule(moduleId) {
        if (this._state === STATE.UNAUTHENTICATED) {
            renderMessage('bot', 'Por favor, primero autentícate con tu correo institucional.');
            return;
        }
        clearFABSpeedDial();
        this._module = moduleId;
        this._linea = null;
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
        clearFABSpeedDial();
        this._session?.reset();
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
            const KEY = 'hc-historial';
            const hist = JSON.parse(localStorage.getItem(KEY) || '[]');
            hist.unshift({
                q: query.slice(0, 120),
                a: (answer || '').replace(/\*\*/g, '').replace(/\n/g, ' ').slice(0, 200),
                ts: Date.now(),
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

    _showNoResult(input) {
        renderMessage('bot',
            `No encontré información específica sobre **"${input}"**.\n\n` +
            `💡 **Sugerencias:**\n` +
            `- Usa palabras clave más específicas\n` +
            `- Selecciona un módulo del menú y pregunta desde ahí\n` +
            `- Ejemplos: _"monto máximo caja chica"_, _"viáticos Puebla 3 días"_, _"folio 15 sanciones"_`
        );
        this._showIASeniorButton(input);
    }

    _showIASeniorButton(input) {
        if (!isOnline()) return;
        // Show "Preguntar a IA Senior" button only when online
        const existingBtn = document.getElementById('ia-senior-btn');
        if (existingBtn) existingBtn.remove();

        const btn = document.createElement('button');
        btn.id = 'ia-senior-btn';
        btn.className = 'ia-senior-btn';
        btn.innerHTML = '🤖 Preguntar a IA Senior';
        btn.title = 'Consulta avanzada usando inteligencia artificial (requiere conexión)';
        btn.addEventListener('click', () => {
            this._resolveWithRAG(input);
        });

        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) messagesContainer.appendChild(btn);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async _resolveWithRAG(input) {
        showTyping();
        try {
            // 1. Detectar si la pregunta ya apunta a un documento específico
            const manualDetectado = detectManualDesdeQuery(input);
            let contextResults = [];
            
            if (manualDetectado && manualDetectado.linea) {
                // Foco estricto en el documento mencionado
                const res = await deepSearch(input, manualDetectado.linea.id);
                if (res) contextResults = [{ label: manualDetectado.linea.label, preview: res.text }];
            } else {
                // Búsqueda global si no hay manual específico
                contextResults = await deepSearchAllModules(input);
            }

            const contextText = contextResults.map(r => `[${r.label}] ${r.preview}`).join('\n\n');

            // 2. Generar respuesta con LLM local
            let fullResponse = '';
            await generate(input, contextText, [], (token) => {
                fullResponse += token;
            });

            // 3. Limpiar JSON de posibles markdown fences
            const jsonText = fullResponse.replace(/```json|```/g, '').trim();
            const result = JSON.parse(jsonText);

            // 4. Actuar según la decisión del cerebro lógico
            if (result.action === 'RESPONDER' && result.final_answer) {
                // Inyectar el patrón 💬 si no viene para activar el diseño premium
                let formattedAnswer = result.final_answer;
                if (!formattedAnswer.includes('💬')) {
                    const firstSentence = formattedAnswer.split(/[.\n]/)[0].slice(0, 60);
                    formattedAnswer = `💬 ${firstSentence}...\n${formattedAnswer}`;
                }
                renderMessage('bot', formattedAnswer, 'CONSERVA-IA — Motor RAG Local');
                this._historialSave(input, result.final_answer);
            } else if (result.action === 'DESAMBIGUAR' && result.options?.length > 0) {
                // Si hay ambigüedad, mostrar el FAB Speed Dial con etiquetas inteligentes
                const labels = result.options.map(o => o.label);
                renderTopicButtons(
                    [...labels, 'Regresar'],
                    (num, text) => {
                        if (text.includes('Regresar')) { this._showMenu(); return; }
                        // Buscar el original_question correspondiente a la opción elegida
                        const opt = result.options.find(o => o.label === text);
                        this.process(opt ? opt.original_question : text);
                    },
                    `Para darte información precisa sobre **“${input}”**, ¿sobre cuál línea de crédito deseas consultar?`
                );
            } else {
                // Fallback: Replanteamiento o error de búsqueda
                renderMessage('bot', result.final_answer || 'No encontré información sobre eso en los manuales institucionales disponibles. ¿Podrías ser más específico?');
            }
        } catch (e) {
            console.error('[RAG] Error resolving with LLM:', e);
            renderMessage('bot', '⚠️ Tuve un problema al procesar la información. Por favor, intenta reformular tu pregunta.');
        } finally {
            hideTyping();
        }
    }

    _buildContext() {
        return {
            module: this._module,
            linea: this._linea?.label,
            breadcrumb: getBreadcrumb(),
        };
    }

    /**
     * Detecta la intención real del usuario independientemente del módulo activo.
     * Retorna el moduleId correcto o null si no detecta cambio de contexto.
     */
    _detectIntention(input, collab) {
        const q = input.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // Indicadores de viáticos — alta prioridad
        const viaKeywords = ['viatico','viaticos','hospedaje','hotel','alojamiento',
            'alimento','comida','desayuno','cena','transporte','vuelo','avion',
            'merida','tabasco','chiapas','puebla','cdmx','oaxaca','campeche',
            'cuanto me toca','cuanto corresponde','cuanto puedo gastar',
            'voy a','viajo a','viaje a','me mandan a','me envian a'];
        if (viaKeywords.some(k => q.includes(k))) {
            // Solo redirigir si NO estamos ya en VIA
            if (this._module !== 'VIA') return 'VIA';
        }

        // Indicadores de sanciones
        const sanKeywords = ['sancion','falta','folio','conducta','amonestacion',
            'despido','baja','acta','llamada de atencion','infraccion','castigo'];
        if (sanKeywords.some(k => q.includes(k))) {
            if (this._module !== 'SAN') return 'SAN';
        }

        // Indicadores de conocenos
        const conKeywords = ['mision','vision','historia','valores','conserva nacio',
            'cuando se fundo','fundacion','proposito','mantra'];
        if (conKeywords.some(k => q.includes(k))) {
            if (this._module !== 'CON') return 'CON';
        }

        // Indicadores de manuales de crédito — Prioridad si se detectan términos financieros
        const manKeywords = ['monto','credito','prestamo','interes','tasa','requisito',
            'plazo','garantia','bonifica','cat','comision','seguro de vida','cobranza',
            'manual','mujer','individual','t activa','hogar','paralelo'];
        if (manKeywords.some(k => q.includes(k))) {
            if (this._module !== 'MAN') return 'MAN';
        }

        return null; // Sin cambio de contexto detectado
    }

    /**
     * Ejecuta el handler correcto según moduleId, sin cambiar el estado actual.
     */
    async _handleByModule(moduleId, input, collab) {
        if (moduleId === 'VIA') return handleVIA(input, collab);
        if (moduleId === 'SAN') return await handleSAN(input);
        if (moduleId === 'CON') return handleCON(input);
        if (moduleId === 'GLOSARIO') return await handleGLOSARIO(input);
        if (moduleId === 'CALC') return await handleCALC(input, collab);
        if (moduleId === 'REQ') return await handleREQ(input);
        if (moduleId === 'MAN') {
            const det = detectManualDesdeQuery(input);
            if (det.linea) return handleMAN(input, det.linea, collab);
            // Si es ambiguo o nulo, forzar la desambiguación manual
            return {
                content: `Para darte información precisa sobre **"${input}"**, ¿sobre cuál línea de crédito deseas consultar?`,
                source: 'MOD-MAN-002 — Catálogo Institucional',
                botonesTemas: (det.opciones || MAN_LINEAS).map(l => l.label)
            };
        }
        if (moduleId === 'HIST') { this._historialLoad(); return null; }
        return null;
    }

    async _crossModuleFallback(input) {
        // Before searching FAQs, try SAN directly for sanction-like queries
        const _qi = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        const mightBeSancion = /sancion|folio|falta|conducta|omision|incumplimiento|formato.*cobranza|cobranza.*extra|llenado.*formato|llamada|amonest|acta|rescision|despido/i.test(input);
        if (mightBeSancion) {
            try {
                const sanResult = await handleSAN(input);
                if (sanResult && sanResult.content && !sanResult.content.includes('activo.')) {
                    renderMessage('bot', sanResult.content, sanResult.source);
                    this._module = 'SAN';
                    setModBtnActive('SAN');
                    setBreadcrumb('Sanciones');
                    return true;
                }
            } catch(e) { /* continue to normal fallback */ }
        }

        // Deep search cross-módulo en chunks reales de manuales
        try {
            const deepResults = await deepSearchAllModules(input);
            if (deepResults.length > 0 && deepResults[0].score > 5) {
                const best = deepResults[0];
                let content = `🔍 **Encontré información en ${best.label}:**

${best.preview}`;
                if (deepResults.length > 1) {
                    content += `

---
📌 **También relacionado en:**
`;
                    deepResults.slice(1, 3).forEach(r => {
                        content += `
**[${r.label}]** ${r.preview.substring(0,120)}...
`;
                    });
                }
                renderMessage('bot', content, `Búsqueda en manuales — ${best.label}`);
                this._showIASeniorButton(input);
                return true;
            }
        } catch(e) {
            console.warn('[DeepSearch] cross-module error:', e);
        }

        try {
            const crossResults = crossModuleSearch(input, FAQS_FOR_SEARCH);
            if (crossResults.length > 0) {
                const best = crossResults[0];
                const moduleLabel = FAQ_TO_MODULE[best.moduleId]
                    ? MODULE_NAMES[FAQ_TO_MODULE[best.moduleId]]
                    : best.moduleId;

                let content = `🔍 **Encontré información relacionada en ${moduleLabel}:**\n\n💬 ${best.faq.a}`;

                if (crossResults.length > 1) {
                    content += `\n\n---\n📌 **También encontré en otros módulos:**\n`;
                    crossResults.slice(1, 3).forEach((r, i) => {
                        const mLabel = FAQ_TO_MODULE[r.moduleId]
                            ? MODULE_NAMES[FAQ_TO_MODULE[r.moduleId]]
                            : r.moduleId;
                        content += `\n**${i + 2}. [${mLabel}]** ${r.faq.q}\n> ${r.faq.a}\n`;
                    });
                }

                renderMessage('bot', content, `Búsqueda Global — ${moduleLabel}`);

                const targetModule = FAQ_TO_MODULE[best.moduleId];
                if (targetModule) {
                    renderTopicButtons(
                        [`Ir a ${MODULE_NAMES[targetModule]}`, 'Menú Principal'],
                        (num, text) => {
                            if (text.includes('Menú')) { this._showMenu(); return; }
                            this.openModule(targetModule);
                        },
                        '¿Deseas profundizar en este tema?'
                    );
                }
                return true;
            }
        } catch(e) {
            console.warn('[Search] Cross-module search error:', e);
        }
        return false;
    }

    async _handleAuthenticatedQuery(input) {
        const collab = this._session?.collaborator;
        const low = input.toLowerCase();

        if (low.includes('regresar') && (low.includes('menú') || low.includes('menu'))) {
            this._module = null;
            this._state = STATE.AUTHENTICATED;
            setBreadcrumb('Menú Principal');
            setModBtnActive(null);
            this._showMenu();
            return;
        }

        // ── DETECCIÓN INTELIGENTE DE INTENCIÓN ──────────────────────────────────
        // Si el usuario está en un módulo pero pregunta algo de OTRO módulo,
        // responder desde el módulo correcto aunque no sea el activo.
        const detectedModule = this._detectIntention(input, collab);
        if (detectedModule && detectedModule !== this._module) {
            const result = await this._handleByModule(detectedModule, input, collab);
            if (result) {
                const modNames = { VIA:'Viáticos', SAN:'Sanciones', CON:'Conócenos', MAN:'Manuales' };
                const note = this._module
                    ? `\n\n> 💡 *Tu pregunta fue sobre **${modNames[detectedModule] || detectedModule}**, aunque estabas en otro módulo. Respondí desde el módulo correcto.*`
                    : '';
                renderMessage('bot', result.content + note, result.source);
                if (result.adjunto) renderFileAttachment(result.adjunto.nombre, result.adjunto.url, result.adjunto.descripcion);
                if (result.formatos) result.formatos.forEach(f => renderFileAttachment(f.archivo, f.url, f.descripcion));
                if (result.botonesTemas) renderTopicButtons(result.botonesTemas, (num, text) => this.process(text));
                return;
            }
        }

        // ── Detección de módulo por intención de la pregunta ───────────────
        // Orden de prioridad: SAN > VIA > CAJA > MAN > CON
        // Cada patrón tiene keywords específicas para evitar falsos positivos

        const _q = input.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // sin acentos

        // Patrones para sanciones — palabras muy específicas del módulo
        // ── Historial y comandos especiales ─────────────────────────────
        if (/historial|mis consultas|consultas recientes|que pregunte|que pregunté/i.test(input)) {
            this._historialLoad(); return;
        }
        if (/borrar historial|limpiar historial|eliminar historial/i.test(input)) {
            localStorage.removeItem('hc-historial');
            renderMessage('bot', '🗑️ Historial borrado correctamente.'); return;
        }

        // ── Meta-preguntas sobre el catálogo general de CONSERVA ─────────────
        // Responden desde cualquier módulo activo sin romper el contexto
        if (/cu[aá]ntos?\s+(manuales?|productos?|cr[eé]ditos?|líneas?|lineas?)|qu[eé]\s+(manuales?|productos?|cr[eé]ditos?|líneas?|lineas?)\s+(hay|tiene|ofrece|maneja|existen)|cuentes?\s+(los\s+)?(productos?|manuales?|cr[eé]ditos?)|listado\s+de\s+(productos?|manuales?|cr[eé]ditos?)/i.test(input)) {
            renderMessage('bot',
                `📋 **Productos y Manuales de Grupo CONSERVA**\n\n` +
                `CONSERVA ofrece **5 productos de crédito** principales:\n\n` +
                `1. 👥 **Mujeres de Palabra** — Crédito grupal solidario para mujeres emprendedoras\n` +
                `2. 🏪 **Crédito Individual** — Para negocios establecidos (Tu Negocio con CONSERVA)\n` +
                `3. ⚡ **Conserva T Activa** — Crédito grupal con condiciones especiales\n` +
                `4. 🏠 **Tu Hogar con CONSERVA** — Mejoramiento y construcción de vivienda\n` +
                `5. ➕ **Crédito Paralelo** — Crédito adicional para clientes ya activos\n\n` +
                `Además contamos con manuales de:\n` +
                `- 📦 **Caja Chica** — Fondo para gastos operativos urgentes\n` +
                `- 🔍 **Auditoría Interna** — Marco de control institucional\n\n` +
                `¿Deseas información detallada de algún producto?`,
                'MOD-MAN-002 — Catálogo de Productos CONSERVA'
            );
            renderTopicButtons(
                ['Mujeres de Palabra', 'Crédito Individual', 'Conserva T Activa', 'Tu Hogar con CONSERVA', 'Crédito Paralelo'],
                (num, text) => this.process(text),
                '¿Sobre cuál deseas saber más?'
            );
            return;
        }

                const isSancion = /\bsancion|\bfolio\b|\bmatriz.*sanc|\bfalta.*laboral|\bleve\b|\bgrave\b|\bmodera[dt]|\bconducta\b|\bamonest|\bllamada.*atencion|\bacta.*admin|\bplan.*mejora|\brescision|\bdespido|\bincumplimiento.*formato|\bomision.*formato|\bomision.*llenado|\bcobranza.*extra|\bformato.*cobranza/i.test(input);

        // Patrones para viáticos — muy específicos de viaje
        const isViatico = /\bviatic|\bhospedaje|\bhotel\b|\bnoche.*viaje|\bviajar\b|\bcuanto.*viaje|\bmerida\b|\btabasco\b|\bchiapas\b|\bcdmx\b|\bpuebla.*viaje|\bdias.*viaje|\bviaje.*dias|\btransporte.*viaje/i.test(input);

        // Patrones para caja chica
        const isCaja = /caja chica|caja.*chica|reembolso.*caja|fondo.*caja|efectivo.*caja/i.test(input);

        // Detectar módulo correcto independientemente del activo
        let moduloDetectado = null;
        if (isSancion)  moduloDetectado = 'SAN';
        else if (isViatico) moduloDetectado = 'VIA';
        else if (isCaja)    moduloDetectado = 'CAJA_MAN';

        // Aplicar cambio de módulo si se detectó uno diferente al activo
        if (moduloDetectado && moduloDetectado !== this._module) {
            if (moduloDetectado === 'SAN') {
                this._module = 'SAN';
                this._linea = null;
                setModBtnActive('SAN');
                setBreadcrumb('Sanciones');
            } else if (moduloDetectado === 'VIA') {
                this._module = 'VIA';
                this._linea = null;
                setModBtnActive('VIA');
                setBreadcrumb('Viáticos');
            } else if (moduloDetectado === 'CAJA_MAN') {
                this._module = 'MAN';
                this._linea = { id: 'MAN_CAJ', label: 'Caja Chica' };
                setModBtnActive('CAJA');
                setBreadcrumb('Caja Chica');
            }
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
                    this._linea = det;
                    result = handleMAN(input, det, collab);
                } else {
                    const { linea, opciones, ambiguo } = detectManualDesdeQuery(input);
                    if (linea) {
                        this._linea = linea;
                        result = handleMAN(input, linea, collab);
                    } else {
                        // Si el LLM está listo, usar el motor RAG inteligente para decidir
                        if (isLLMReady()) {
                            await this._resolveWithRAG(input);
                        } else {
                            // Fallback clásico si el modelo aún no carga
                            this._state = STATE.WAITING_LINEA;
                            this._pendingQuery = input;
                            renderTopicButtons(
                                [...(opciones || MAN_LINEAS).map(l => l.label), 'Regresar'],
                                (num, text) => {
                                    if (text.includes('Regresar')) { this._showMenu(); return; }
                                    this.process(text);
                                },
                                `Para darte información precisa sobre **“${input}”**, ¿sobre cuál línea de crédito deseas consultar?`
                            );
                        }
                        return;
                    }
                }
            } else {
                result = handleMAN(input, this._linea, collab);
            }
        }

        if (result && result.content) {
            const currentBreadcrumb = getBreadcrumb() || this._module || 'General';
            const header = `**Sistema:** Huella Conserva Asistente Institucional | v1.2 | 2026 | Activo\n📍 ${currentBreadcrumb}\n\n`;
            renderMessage('bot', header + result.content, result.source);
            this._historialSave(input, result.content);
            if (result.adjunto) renderFileAttachment(result.adjunto.nombre, result.adjunto.url, result.adjunto.descripcion);
            if (result.formatos) result.formatos.forEach(f => renderFileAttachment(f.archivo, f.url, f.descripcion));
            if (result.botonesTemas) renderTopicButtons(result.botonesTemas, (num, text) => this.process(text));

        } else if (result && result.needsDeepSearch) {
            // ── DEEP SEARCH: buscar en chunks del manual completo ────────
            showTyping();
            try {
                const deep = await deepSearch(input, result.linea || this._linea?.id || 'MAN_SOL');
                if (deep && deep.score > 4) {
                    const currentBreadcrumb = getBreadcrumb() || 'Manual';
                    renderMessage('bot',
                        `**Sistema:** Huella Conserva | v1.2\n📍 ${currentBreadcrumb}\n\n` +
                        `📖 Encontré información relevante en el manual:\n\n${deep.text}`,
                        result.source
                    );
                    if (result.botonesTemas) renderTopicButtons(result.botonesTemas, (num, text) => this.process(text));
                    this._showIASeniorButton(input);
                } else {
                    const found = await this._crossModuleFallback(input);
                    if (!found) this._showNoResult(input);
                }
            } finally {
                hideTyping();
            }

        } else {
            const found = await this._crossModuleFallback(input);
            if (!found) this._showNoResult(input);
        }
    }
}
