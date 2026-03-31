/**
 * app/llm.js
 * Interfaz del hilo principal para CONSERVA-IA (modelo local).
 *
 * Gestiona el Web Worker (llm-worker.js) y expone:
 *   initLLM(onProgress)  — descarga e inicializa el modelo
 *   generate(query, context, history, onToken) — genera respuesta con streaming
 *   isLLMReady()         — indica si el modelo está listo
 */

let _worker   = null;
let _ready    = false;
let _loading  = false;

// Cola de mensajes de progreso para múltiples suscriptores
let _progressListeners = [];
// Promesa de inicialización compartida (evita doble init)
let _initPromise = null;
// Callback de la generación activa
let _activeGen = null;

// ── Prompt de sistema de CONSERVA-IA ────────────────────────────
const SYSTEM_PROMPT = `Eres CONSERVA-IA, el asistente virtual oficial de Grupo CONSERVA, empresa mexicana de microfinanzas con presencia en 6 estados de la República.

Tu propósito es ayudar a los colaboradores con información sobre:
- Líneas de crédito: Mujeres de Palabra, Crédito Individual, Conserva T Activa, Tu Hogar, Crédito Paralelo
- Manual de Caja Chica (montos, reembolsos, comprobantes, procedimientos)
- Política de Viáticos (hospedaje, alimentos, transporte por ciudad y categoría)
- Matriz de Sanciones Disciplinarias (folios, niveles, formatos)
- Glosario institucional (CAT, PAR-1, DDA, SOFOM, CFDI, SPEI, etc.)
- Información de Conócenos (misión, visión, valores, historia de CONSERVA)

REGLAS:
1. Responde ÚNICAMENTE con la información que aparece en el contexto proporcionado.
2. Si la respuesta no está en el contexto, di claramente: "No encontré esa información en mis documentos. Te recomiendo consultar el manual correspondiente o a tu supervisor directo."
3. Nunca inventes montos, tasas, plazos, nombres de personas ni procedimientos.
4. Responde siempre en español, de forma amigable, clara y profesional.
5. Cuando el colaborador pregunte datos numéricos, cítalos exactamente como aparecen en el contexto.
6. Sé conversacional: usa "tú", saluda cuando sea primera vez, recuerda lo que se habló antes.
7. Si tienes múltiples fragmentos relevantes, integra la respuesta de forma coherente.`;

// ── Crear el Worker ──────────────────────────────────────────────
function _createWorker() {
    _worker = new Worker(new URL('./llm-worker.js', import.meta.url), { type: 'module' });

    _worker.onmessage = (e) => {
        const { type, payload } = e.data;

        if (type === 'progress') {
            _progressListeners.forEach(fn => fn(payload));

        } else if (type === 'ready') {
            _ready   = true;
            _loading = false;
            _progressListeners.forEach(fn => fn({ status: 'ready' }));
            _progressListeners = [];
            _initPromise = null;

        } else if (type === 'token') {
            _activeGen?.onToken?.(payload);

        } else if (type === 'done') {
            const gen = _activeGen;
            _activeGen = null;
            gen?.resolve?.();

        } else if (type === 'error') {
            _loading = false;
            const gen = _activeGen;
            _activeGen = null;
            gen?.reject?.(new Error(payload));
            // También rechazar initPromise si ocurre durante init
            _progressListeners.forEach(fn => fn({ status: 'error', message: payload }));
            _progressListeners = [];
            _initPromise = null;
        }
    };

    _worker.onerror = (e) => {
        _loading = false;
        _activeGen?.reject?.(new Error(e.message));
        _activeGen = null;
    };
}

/**
 * Inicializa el modelo de lenguaje local.
 * La primera llamada descarga el modelo (~600 MB) y lo guarda en caché.
 * Las llamadas posteriores son instantáneas (modelo ya cacheado).
 *
 * @param {function} onProgress  Callback({ status, name, progress })
 * @returns {Promise<void>}
 */
export function initLLM(onProgress) {
    if (_ready) {
        onProgress?.({ status: 'ready' });
        return Promise.resolve();
    }

    if (onProgress) _progressListeners.push(onProgress);

    if (_initPromise) return _initPromise;

    _loading     = true;
    _initPromise = new Promise((resolve, reject) => {
        _progressListeners.push((info) => {
            if (info.status === 'ready') resolve();
            if (info.status === 'error') reject(new Error(info.message));
        });

        if (!_worker) _createWorker();
        _worker.postMessage({ type: 'init' });
    });

    return _initPromise;
}

/**
 * Genera una respuesta usando RAG context + historial de conversación.
 * La respuesta llega en streaming a través del callback onToken.
 *
 * @param {string}   query    Pregunta actual del usuario
 * @param {string}   context  Fragmentos recuperados por rag.js (formatContext)
 * @param {Array}    history  [{role:'user'|'assistant', content:string}] — últimas N rondas
 * @param {function} onToken  Llamado por cada token generado: onToken(string)
 * @returns {Promise<void>}   Resuelve cuando la generación termina
 */
export function generate(query, context, history = [], onToken) {
    if (!_ready) return Promise.reject(new Error('CONSERVA-IA no está lista todavía.'));

    // Construir los mensajes del chat
    const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        // Incluir las últimas 4 entradas del historial (2 rondas) para contexto conversacional
        ...history.slice(-4),
        {
            role: 'user',
            content: context
                ? `Contexto de documentos CONSERVA:\n\n${context}\n\n---\n\nPregunta del colaborador: ${query}`
                : query,
        },
    ];

    return new Promise((resolve, reject) => {
        _activeGen = { onToken, resolve, reject };
        _worker.postMessage({
            type: 'generate',
            payload: { messages, maxTokens: 512 },
        });
    });
}

/** @returns {boolean} true si el modelo ya está listo para generar */
export function isLLMReady() { return _ready; }

/** @returns {boolean} true si el modelo está en proceso de carga */
export function isLLMLoading() { return _loading; }
