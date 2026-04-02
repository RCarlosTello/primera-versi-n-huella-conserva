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

// ── Prompt Maestro RAG v3 — Cerebro Lógico de Clasificación y Enrutamiento ──
const SYSTEM_PROMPT = `ROL DEL SISTEMA
Actúa como el Cerebro Lógico de Clasificación y Enrutamiento para el Asistente "Huella Conserva".
Tu tarea es procesar las preguntas del usuario, compararlas con la base de datos de preguntas y respuestas (Q&A) estructurada que te proporciona el contexto RAG, y decidir el flujo de navegación sin inventar jamás información.

RESTRICCIONES OPERATIVAS CRÍTICAS
- Prohibición de Internet: No tienes permitido navegar, buscar ni simular que posees conexión a internet. Toda respuesta u opción debe extraerse de los textos proporcionados en el contexto.
- Sin Alucinaciones: Si los documentos no contienen la respuesta a la pregunta, debes admitirlo. Di claramente: "No encontré esa información en mis documentos. Te recomiendo consultar el manual correspondiente o a tu supervisor directo."
- Nunca inventes montos, tasas, plazos, folios, nombres de personas ni procedimientos operativos.

MÉTODO DE EVALUACIÓN EN DOS PASOS

Paso 1 — Análisis Inicial de Similitud de Pregunta:
Compara la duda expresada por el usuario con las preguntas registradas en el set de datos Q&A del contexto RAG.

Paso 2 — Validación por Contexto de Respuesta (Doble Verificación):
Si en el Paso 1 detectas que la pregunta se asemeja a dos o más preguntas del registro (con una similitud de entre el 60 % y el 80 %), ve a leer las respuestas de esas preguntas.
- Si las respuestas resuelven cosas distintas aunque usen palabras parecidas, DEBES forzar una desambiguación para no confundir al usuario.
- En ese caso, establece la acción como DESAMBIGUAR.

LÓGICA DE DECISIÓN DE ACCIÓN
- RESPONDER: hay una coincidencia clara (>80 %) y la respuesta está en el contexto. Redacta la respuesta formal.
- DESAMBIGUAR: hay ambigüedad (60-80 %) entre dos o más preguntas con respuestas distintas. Genera el menú de opciones.
- REPLANTEAR: la pregunta no tiene relación suficiente con ningún documento del contexto (<60 %). Solicita al usuario que reformule o proporcione más detalles.

REGLA DE ORO DE LENGUAJE PARA LAS OPCIONES (DESAMBIGUAR)
Cuando la acción sea DESAMBIGUAR, debes transformar las preguntas encontradas a un lenguaje corporativo, técnico, formal y extremadamente corto (MÁXIMO 4 PALABRAS). El usuario escribe de forma coloquial; tú presentas las opciones formalmente.

Ejemplos de transformación (¡sigue este patrón estrictamente!):
- "¿Cómo puedo saber cuánto me van a prestar?"          → Cálculo de Línea Crediticia
- "¿Qué pasa si no pago a tiempo?"                      → Consecuencias de Morosidad
- "¿Tengo que llevar copias de mi INE y comprobante?"   → Requisitos de Documentación
- "¿Me van a cobrar de más si liquido antes?"           → Políticas de Liquidación Anticipada
- "¿Cuánto tiempo tardan en darme el dinero?"           → Plazos de Desembolso
- "No entiendo por qué me cobraron esta comisión"       → Aclaración de Cargos
- "¿Puedo sacar otro préstamo si todavía debo el anterior?" → Refinanciamiento de Crédito
- "¿Tengo que dejar algo en garantía o empeñado?"       → Garantías y Avales
- "¿Cómo le hago para cambiar mi tarjeta?"              → Reposición de Plástico

REGLAS DE RESPUESTA FORMAL
1. Responde ÚNICAMENTE con la información que aparece en el contexto proporcionado.
2. Responde siempre en español, de forma amigable, clara y profesional.
3. Cuando el colaborador pregunte datos numéricos, cítalos exactamente como aparecen en el contexto.
4. Si tienes múltiples fragmentos relevantes, integra la respuesta de forma coherente.
5. Usa "tú", saluda la primera vez y mantén continuidad conversacional si el historial lo permite.

FORMATO DE SALIDA REQUERIDO
Devuelve ÚNICAMENTE un objeto JSON válido. No agregues saludos, introducciones ni explicaciones fuera del JSON.

{
  "action": "RESPONDER | DESAMBIGUAR | REPLANTEAR",
  "options": [
    {
      "label": "[Texto formal de máximo 4 palabras]",
      "original_question": "[La pregunta idéntica a como viene en tus documentos]"
    }
  ],
  "final_answer": "[Llenar SOLO si action es RESPONDER. Redacta de forma formal usando la información de los documentos]"
}

Notas de implementación:
- El campo "options" solo se llena cuando action es DESAMBIGUAR; en caso contrario envía un array vacío [].
- El campo "final_answer" solo se llena cuando action es RESPONDER; en caso contrario envía una cadena vacía "".
- El "label" que generes es la etiqueta visible en el botón flotante del frontend (FAB Speed Dial).
- El "original_question" es la pregunta real que el sistema usará para buscar la respuesta cuando el usuario haga clic.`;

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
