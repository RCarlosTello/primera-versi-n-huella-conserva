/**
 * app/search.js
 * Motor de búsqueda semántica — Arquitectura FlexSearch-inspired
 *
 * Pipeline:
 *  1. Normalizar + expandir query con sinónimos institucionales
 *  2. Buscar en índice invertido pre-construido (cargado lazy por módulo)
 *  3. Scoring TF-IDF híbrido con boost por posición
 *  4. Cross-module fallback con índice lite
 *  5. Botón "IA Senior" cuando hay conexión y no hay resultado
 *
 * Cada índice se carga una sola vez y se guarda en caché en memoria.
 * Funciona 100% offline después de la primera carga.
 */

// ── Caché en memoria por módulo ──────────────────────────────────
const INDEX_CACHE = {};

// ── Stopwords ────────────────────────────────────────────────────
const STOP = new Set(['de','la','el','en','y','a','los','del','las','un','por',
  'con','una','para','es','al','lo','se','que','su','si','o','pero','sus','le',
  'ya','fue','ha','me','te','nos','son','era','han','ser','hay','como','este',
  'esta','mas','muy','sin','sobre','entre','cuando','todo','bien','tambien',
  'sido','estar','tiene','tengo','tener','puede','hacer','otra','seran','sera',
  'debe','deben','deberan','dicho','dicha','mismo','misma','cada','cual','cuales',
  'donde','quien','cuyo','cuya','aqui','alli','eso','esto']);

// ── Sinónimos institucionales CONSERVA ──────────────────────────
const SYNONYMS = {
  // Montos
  'monto': ['cantidad','importe','valor','suma','cuanto','prestamo'],
  'minimo': ['menor','desde','limite inferior','base','inicio'],
  'maximo': ['mayor','hasta','limite','tope','techo','limite superior'],
  'prestamo': ['credito','financiamiento','monto','capital'],
  'pedir': ['solicitar','tramitar','aplicar','pedir prestado'],
  // Tasas
  'tasa': ['interes','porcentaje','costo','cargo','intereses'],
  'interes': ['tasa','porcentaje','cargo mensual','costo del credito'],
  'mensual': ['mes','al mes','por mes','mensualmente'],
  'anual': ['año','por año','al año','anualmente'],
  'bonificacion': ['descuento','rebaja','premio','beneficio','bono'],
  'puntual': ['pago a tiempo','sin atraso','cumplido'],
  // Plazos
  'plazo': ['tiempo','semanas','meses','duracion','periodo','vigencia'],
  'semana': ['semanas','semanal','semanalmente'],
  // Seguro
  'seguro': ['cobertura','proteccion','seguro de vida','prima'],
  'fallecimiento': ['muerte','fallecio','fallece','defuncion','fallecer'],
  'suma asegurada': ['monto del seguro','cobertura','cuanto paga el seguro'],
  // Grupos
  'integrantes': ['personas','miembros','socias','participantes','grupo'],
  'grupo': ['equipo','solidario','integrantes'],
  // Garantías
  'garantia': ['deposito','aval','respaldo','garantia liquida'],
  'aval': ['fiador','coacreditado','obligado solidario'],
  // Caja chica
  'caja chica': ['fondo','efectivo','caja','recursos caja'],
  'reembolso': ['devolucion','pago','deposito','reintegro'],
  'factura': ['comprobante','cfdi','ticket','recibo'],
  'vale': ['vale azul','comprobante sin factura'],
  // Viáticos
  'viaticos': ['gastos de viaje','viaje','comision','traslado'],
  'hospedaje': ['hotel','alojamiento','habitacion','noche'],
  'alimento': ['comida','alimentos','desayuno','cena','alimentacion'],
  'transporte': ['vuelo','avion','autobus','camion','traslado'],
  // Sanciones
  'sancion': ['falta','infraccion','conducta','incumplimiento'],
  'despido': ['baja','rescision','terminacion','separacion'],
  'amonestacion': ['llamada de atencion','llamado','advertencia','acta'],
  // General
  'requisito': ['condicion','necesito','solicitar','tramitar','documentos'],
  'prohibido': ['no permitido','no se puede','no aplica','no autorizado'],
  'proceso': ['procedimiento','pasos','tramite','como'],
  'responsable': ['encargado','quien','a cargo'],
  'comision': ['cargo','costo','apertura'],
  'omision': ['omitir','no llenar','incumplimiento','no cumplir'],
  'cobranza extrajudicial': ['cobranza externa','formato cobranza'],
  // Créditos
  'solidario': ['mujeres de palabra','grupal','grupo solidario'],
  'individual': ['tu negocio','credito individual','personal'],
  'paralelo': ['adicional','campana','credito paralelo'],
  'vivienda': ['hogar','casa','mejoramiento','tu hogar'],
  'tactiva': ['t activa','conserva t activa','t-activa'],
};

// ── Normalizar texto ─────────────────────────────────────────────
export function normalize(text) {
  if (!text) return '';
  let t = text.toLowerCase();
  const map = {'á':'a','é':'e','í':'i','ó':'o','ú':'u','ü':'u','ñ':'n'};
  for (const [k,v] of Object.entries(map)) t = t.split(k).join(v);
  return t.replace(/[^\w\s]/g,' ').replace(/\s+/g,' ').trim();
}

// ── Tokenizar ────────────────────────────────────────────────────
export function tokenize(text, minLen = 3) {
  return normalize(text).split(' ')
    .filter(w => w.length >= minLen && !STOP.has(w));
}

// ── Expandir query con sinónimos ─────────────────────────────────
export function expandQuery(tokens) {
  const expanded = new Set(tokens);
  const qStr = tokens.join(' ');
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    const normKey = normalize(key);
    // Check if query contains this synonym key or any of its values
    if (qStr.includes(normKey) || normKey.split(' ').some(k => tokens.includes(k))) {
      for (const syn of syns) {
        tokenize(syn, 2).forEach(t => expanded.add(t));
      }
    }
    // Reverse: if query contains a synonym, add the key tokens
    for (const syn of syns) {
      const normSyn = normalize(syn);
      if (qStr.includes(normSyn) || normSyn.split(' ').some(s => s.length > 3 && tokens.includes(s))) {
        tokenize(normKey, 2).forEach(t => expanded.add(t));
        for (const s of syns) tokenize(s, 2).forEach(t => expanded.add(t));
      }
    }
  }
  return [...expanded];
}

// ── Cargar índice de un módulo (lazy + caché) ────────────────────
// Usa window._knowledgeCache si fue precargado por main.js al hacer focus en el input
async function loadModuleIndex(moduleId) {
  const key = moduleId.toLowerCase();

  // 1. Caché en memoria del módulo search
  if (INDEX_CACHE[key]) return INDEX_CACHE[key];

  // 2. Caché global precargado por main.js (cross-module)
  if (window._knowledgeCache?.[key]) {
    INDEX_CACHE[key] = window._knowledgeCache[key];
    return INDEX_CACHE[key];
  }

  // 3. Fetch bajo demanda (primer uso del módulo antes del preload)
  try {
    const res = await fetch(`/knowledge/idx_${key}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const idx = await res.json();
    INDEX_CACHE[key] = idx;
    return idx;
  } catch (e) {
    console.warn(`[Search] No se pudo cargar índice de ${moduleId}:`, e.message);
    return null;
  }
}

/**
 * Deep search cross-módulo: busca en TODOS los módulos cargados en caché.
 * Se activa cuando ninguna capa de FAQs tiene respuesta.
 */
export async function deepSearchAllModules(query) {
  const tokens = tokenize(query);
  const expanded = expandQuery(tokens);
  const allResults = [];

  const MODULES = ['MAN_SOL','MAN_IND','MAN_TAC','MAN_HOG','MAN_PAR','MAN_CAJ','MAN_VIA','MAN_AUD'];
  const MODULE_LABELS = {
    MAN_SOL:'Mujeres de Palabra', MAN_IND:'Crédito Individual', MAN_TAC:'T Activa',
    MAN_HOG:'Tu Hogar', MAN_PAR:'Crédito Paralelo', MAN_CAJ:'Caja Chica',
    MAN_VIA:'Viáticos', MAN_AUD:'Auditoría Interna',
  };

  for (const modId of MODULES) {
    const idx = await loadModuleIndex(modId);
    if (!idx) continue;
    const results = searchInIndex(idx, expanded, 2);
    for (const r of results) {
      if (r.score > 3) {
        allResults.push({ ...r, moduleId: modId, label: MODULE_LABELS[modId] });
      }
    }
  }

  return allResults.sort((a, b) => b.score - a.score).slice(0, 5);
}

// ── Buscar en índice de módulo con TF-IDF ────────────────────────
function searchInIndex(idx, queryTokens, topK = 5) {
  if (!idx || !idx.idx) return [];

  const scores = {};

  for (const token of queryTokens) {
    const entry = idx.idx[token];
    if (!entry) continue;
    const idf = entry.idf || 1;
    for (const [docId, tf] of entry.p) {
      scores[docId] = (scores[docId] || 0) + tf * idf;
    }
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([docId, score]) => ({
      docId: parseInt(docId),
      score,
      preview: idx.docs[docId] || '',
    }));
}

/**
 * Búsqueda principal en un módulo específico.
 * Carga el índice lazy y retorna los mejores resultados.
 *
 * @param {string} query - Pregunta del usuario
 * @param {string} moduleId - ID del módulo (ej: 'MAN_SOL')
 * @param {object} options
 * @returns {Promise<Array<{score, preview}>>}
 */
export async function searchModule(query, moduleId, { topK = 5 } = {}) {
  const idx = await loadModuleIndex(moduleId);
  if (!idx) return [];

  const tokens = tokenize(query);
  const expanded = expandQuery(tokens);

  return searchInIndex(idx, expanded, topK);
}

/**
 * Búsqueda cross-módulo: busca en todos los módulos sin cargar índices pesados.
 * Usa los FAQs existentes como base (ya en memoria).
 *
 * @param {string} query
 * @param {object} allFaqs - { MODULE_ID: [{q, a}] }
 * @returns {Array<{moduleId, faq, score}>}
 */
export function crossModuleSearch(query, allFaqs) {
  const tokens = tokenize(query);
  const expanded = expandQuery(tokens);
  const results = [];

  for (const [moduleId, faqs] of Object.entries(allFaqs)) {
    if (!faqs || !faqs.length) continue;
    const moduleResults = semanticSearch(query, faqs, {
      topK: 2, minScore: 0.3, expandSynonyms: false,
    });
    for (const r of moduleResults) {
      results.push({ moduleId, ...r });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * Búsqueda semántica en lista de FAQs (legacy — para compatibilidad con módulos actuales).
 * Usada cuando el índice de chunk no está cargado todavía.
 */
export function semanticSearch(query, faqs, {
  topK = 3, minScore = 0.25, expandSynonyms = true } = {}
) {
  if (!faqs || !faqs.length) return [];

  const tokens = tokenize(query);
  const qExpanded = expandSynonyms ? expandQuery(tokens) : tokens;
  const allTexts = faqs.map(f => normalize(f.q + ' ' + f.a));

  return faqs
    .map((faq, idx) => {
      const faqText = allTexts[idx];
      const faqQ = normalize(faq.q);
      let score = 0;

      // Exact phrase match
      const qNorm = normalize(query);
      if (faqText.includes(qNorm)) score += 2.5;

      // Token scoring with IDF
      for (const token of qExpanded) {
        const inQuestion = faqQ.includes(token);
        const inAnswer = faqText.includes(token) && !inQuestion;
        // Compute IDF: term that appears in fewer FAQs is more specific
        const df = allTexts.filter(t => t.includes(token)).length;
        const idf = df > 0 ? Math.log((allTexts.length + 1) / (df + 1)) + 1 : 1;
        if (inQuestion) score += idf * 1.8;
        else if (inAnswer) score += idf * 0.9;
      }

      // Coverage boost
      const coverage = tokens.filter(t => faqText.includes(t)).length / Math.max(tokens.length, 1);
      score += coverage * 1.5;

      // Penalize very short answers
      if (faq.a && faq.a.length < 20) score *= 0.7;

      return { faq, score };
    })
    .filter(r => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Detectar si hay conexión de red disponible.
 */
export function isOnline() {
  if (!navigator.onLine) return false;
  const conn = navigator.connection || navigator.mozConnection;
  if (conn && conn.effectiveType === 'none') return false;
  return true;
}

/**
 * Buscar en el conocimiento completo del módulo (chunks del manual real).
 * Más preciso que FAQs para preguntas complejas.
 * Combina resultado del índice con FAQs para respuesta final.
 *
 * @param {string} query
 * @param {string} moduleId
 * @returns {Promise<{text: string, source: string, fromChunks: boolean}>|null}
 */
export async function deepSearch(query, moduleId) {
  const results = await searchModule(query, moduleId, { topK: 3 });
  if (!results.length || results[0].score < 5) return null;

  const best = results[0];
  return {
    text: best.preview,
    score: best.score,
    fromChunks: true,
    allResults: results,
  };
}

/**
 * Sugerencias de preguntas similares cuando no hay resultado.
 */
export function getSuggestions(query, faqs, topK = 3) {
  return semanticSearch(query, faqs, { topK, minScore: 0.1 })
    .map(r => r.faq.q);
}
