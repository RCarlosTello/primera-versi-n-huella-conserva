/**
 * app/rag.js
 * Motor RAG (Retrieval-Augmented Generation) para CONSERVA-IA
 *
 * Recupera los fragmentos más relevantes de TODOS los conocimientos
 * disponibles en la aplicación y los formatea como contexto para el LLM local.
 *
 * Fuentes de conocimiento:
 *  1. Índices de manuales (chunks reales de 8 manuales institucionales)
 *  2. FAQs de todos los módulos
 *  3. Glosario institucional
 *  4. Requisitos por producto de crédito
 *  5. Cuestionarios institucionales (JSON lazy: public/knowledge/rag_cuestionarios_compact.json)
 */

import { tokenize, expandQuery, normalize } from './search.js';
import { FAQS } from '../data/faqs.js';
import { GLOSARIO } from '../data/glosario.js';
import { REQUISITOS_POR_PRODUCTO } from '../data/requisitos_credito.js';

// ── Caché de índices de manuales ─────────────────────────────────
const _indexCache = {};

// ── Corpus estático (FAQs + Glosario + Requisitos) ───────────────
let _staticCorpus = null;

// ── Cuestionarios (fetch una vez; df precomputado para scoring) ───
let _cuestionariosBundle = null;

async function _getCuestionariosBundle() {
    if (_cuestionariosBundle) return _cuestionariosBundle;
    try {
        const res = await fetch('/knowledge/rag_cuestionarios_compact.json');
        if (!res.ok) {
            _cuestionariosBundle = { items: [], df: {}, N: 1, byToken: {} };
            return _cuestionariosBundle;
        }
        const data = await res.json();
        const items = Array.isArray(data.items) ? data.items : [];
        const N = Math.max(items.length, 1);
        const df = {};
        /** @type {Record<string, number[]>} */
        const byToken = {};
        for (let i = 0; i < items.length; i++) {
            const toks = new Set(tokenize(items[i].text || ''));
            for (const t of toks) {
                df[t] = (df[t] || 0) + 1;
                if (!byToken[t]) byToken[t] = [];
                byToken[t].push(i);
            }
        }
        _cuestionariosBundle = { items, df, N, byToken };
        return _cuestionariosBundle;
    } catch {
        _cuestionariosBundle = { items: [], df: {}, N: 1, byToken: {} };
        return _cuestionariosBundle;
    }
}

function _scoreCuestionarios(bundle, queryTokens, query, topK = 4) {
    if (!bundle.items.length) return [];
    const { items, df, N, byToken } = bundle;
    const qNorm = normalize(query);

    const candIdx = new Set();
    for (const token of queryTokens) {
        const arr = byToken[token];
        if (arr) for (const i of arr) candIdx.add(i);
    }

    let indices = [...candIdx];
    if (!indices.length && qNorm.length >= 8) {
        for (let i = 0; i < items.length; i++) {
            if ((items[i].text || '').includes(qNorm)) candIdx.add(i);
        }
        indices = [...candIdx];
    }
    if (!indices.length) return [];

    const scored = [];
    for (const i of indices) {
        const doc = items[i];
        let score = 0;
        if (qNorm && doc.text.includes(qNorm)) score += 3;
        for (const token of queryTokens) {
            if (!doc.text.includes(token)) continue;
            const dfc = df[token] || 1;
            const idf = Math.log((N + 1) / (dfc + 1)) + 1;
            score += idf;
        }
        if (score > 0) {
            scored.push({
                id: doc.id,
                answer: doc.a,
                question: doc.q,
                source: doc.source,
                moduleId: doc.moduleId || undefined,
                type: 'cuestionario',
                score,
            });
        }
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

const MODULE_LABELS = {
    MAN_SOL: 'Mujeres de Palabra',
    MAN_IND: 'Crédito Individual',
    MAN_TAC: 'Conserva T Activa',
    MAN_HOG: 'Tu Hogar',
    MAN_PAR: 'Crédito Paralelo',
    MAN_CAJ: 'Caja Chica',
    MAN_VIA: 'Viáticos',
    MAN_AUD: 'Auditoría Interna',
};

// ── Construir corpus estático ────────────────────────────────────
function buildStaticCorpus() {
    if (_staticCorpus) return _staticCorpus;
    const corpus = [];

    // FAQs de todos los módulos
    for (const [moduleId, faqList] of Object.entries(FAQS)) {
        if (!Array.isArray(faqList)) continue;
        for (const faq of faqList) {
            const label = MODULE_LABELS[moduleId] || moduleId;
            corpus.push({
                id: `faq:${moduleId}:${corpus.length}`,
                text: normalize(`${faq.q} ${faq.a}`),
                answer: faq.a,
                question: faq.q,
                source: label,
                type: 'faq',
            });
        }
    }

    // Glosario institucional
    if (Array.isArray(GLOSARIO)) {
        for (const entry of GLOSARIO) {
            const rawText = `${entry.term || ''} ${entry.full || ''} ${entry.def || ''}`;
            corpus.push({
                id: `glos:${entry.term}`,
                text: normalize(rawText),
                answer: `**${entry.term}** (${entry.full}): ${entry.def}`,
                question: `¿Qué significa ${entry.term}?`,
                source: 'Glosario Institucional',
                type: 'glosario',
            });
        }
    }

    // Requisitos por producto de crédito
    if (REQUISITOS_POR_PRODUCTO && typeof REQUISITOS_POR_PRODUCTO === 'object') {
        for (const [id, prod] of Object.entries(REQUISITOS_POR_PRODUCTO)) {
            const rawText = [
                prod.nombre || '',
                prod.resumen || '',
                typeof prod.montos === 'object'
                    ? `monto minimo ${prod.montos.min} maximo ${prod.montos.max}`
                    : String(prod.montos || ''),
                prod.plazos || '',
                prod.tasa || '',
                prod.cat || '',
                prod.tipo || '',
            ].join(' ');

            corpus.push({
                id: `req:${id}`,
                text: normalize(rawText),
                answer: _formatRequisito(prod),
                question: `Requisitos y condiciones de ${prod.nombre}`,
                source: `Requisitos — ${prod.nombre || id}`,
                type: 'requisito',
            });
        }
    }

    _staticCorpus = corpus;
    return corpus;
}

function _formatRequisito(prod) {
    const lines = [];
    if (prod.nombre) lines.push(`**${prod.nombre}**`);
    if (prod.resumen) lines.push(prod.resumen);
    if (prod.montos) {
        const m = prod.montos;
        if (typeof m === 'object') lines.push(`**Montos:** $${m.min?.toLocaleString('es-MX')} – $${m.max?.toLocaleString('es-MX')} ${m.moneda || 'MXN'}`);
        else lines.push(`**Montos:** ${m}`);
    }
    if (prod.plazos) lines.push(`**Plazos:** ${prod.plazos}`);
    if (prod.tasa)   lines.push(`**Tasa:** ${prod.tasa}`);
    if (prod.cat)    lines.push(`**CAT:** ${prod.cat}`);
    if (prod.garantia) lines.push(`**Garantía:** ${prod.garantia}`);
    if (Array.isArray(prod.documentos) && prod.documentos.length) {
        lines.push(`**Documentos:** ${prod.documentos.join(', ')}`);
    }
    return lines.join('\n');
}

// ── Cargar índice de manual (lazy + caché) ───────────────────────
async function _loadIndex(moduleId) {
    const key = moduleId.toLowerCase();
    if (_indexCache[key]) return _indexCache[key];
    if (window._knowledgeCache?.[key]) {
        _indexCache[key] = window._knowledgeCache[key];
        return _indexCache[key];
    }
    try {
        const res = await fetch(`/knowledge/idx_${key}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const idx = await res.json();
        _indexCache[key] = idx;
        return idx;
    } catch {
        return null;
    }
}

// ── Scoring BM25 en índice invertido ────────────────────────────
function _bm25(idx, queryTokens, topK = 4) {
    if (!idx?.idx || !idx.docs) return [];
    const k1 = 1.5, b = 0.75;
    const N = idx.n || idx.docs.length || 1;
    const totalLen = idx.docs.reduce((s, d) => s + (d ? d.split(' ').length : 0), 0);
    const avgdl = totalLen / Math.max(N, 1);
    const scores = {};

    for (const token of queryTokens) {
        const entry = idx.idx[token];
        if (!entry) continue;
        const df = entry.p?.length || 1;
        const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
        for (const [docId, tf] of (entry.p || [])) {
            const docLen = idx.docs[docId]?.split(' ').length || avgdl;
            const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * docLen / Math.max(avgdl, 1)));
            scores[docId] = (scores[docId] || 0) + idf * tfNorm;
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

// ── Scoring TF-IDF en corpus estático ───────────────────────────
function _scoreStatic(queryTokens, query, topK = 4) {
    const corpus = buildStaticCorpus();
    const qNorm = normalize(query);

    return corpus
        .map(doc => {
            let score = 0;
            if (doc.text.includes(qNorm)) score += 3;
            for (const token of queryTokens) {
                if (!doc.text.includes(token)) continue;
                const df = corpus.filter(d => d.text.includes(token)).length;
                const idf = Math.log((corpus.length + 1) / (df + 1)) + 1;
                score += idf;
            }
            return { ...doc, score };
        })
        .filter(d => d.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
}

/**
 * Recupera los fragmentos más relevantes de toda la base de conocimiento.
 *
 * @param {string} query   - Pregunta del usuario en lenguaje natural
 * @param {number} topK    - Número máximo de fragmentos a retornar (default 6)
 * @returns {Promise<Array>}
 */
export async function retrieve(query, topK = 6) {
    const tokens = tokenize(query);
    const expanded = expandQuery(tokens);
    const results = [];

    const cuestBundle = await _getCuestionariosBundle();
    const cuestHits = _scoreCuestionarios(cuestBundle, expanded, query, 4);
    results.push(...cuestHits);

    // 1. Manuales — BM25 en índices de chunks reales
    for (const [modId, label] of Object.entries(MODULE_LABELS)) {
        const idx = await _loadIndex(modId);
        if (!idx) continue;
        const hits = _bm25(idx, expanded, 3);
        for (const hit of hits) {
            if (hit.score > 0.4) {
                results.push({
                    ...hit,
                    answer: hit.preview,
                    source: label,
                    moduleId: modId,
                    type: 'manual',
                });
            }
        }
    }

    // 2. FAQs + Glosario + Requisitos — TF-IDF en corpus estático
    const staticHits = _scoreStatic(expanded, query, 4);
    results.push(...staticHits);

    // 3. Ordenar, deduplicar por contenido y tomar top-K
    const seen = new Set();
    return results
        .sort((a, b) => b.score - a.score)
        .filter(r => {
            const key = (r.answer || r.preview || '').slice(0, 60);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .slice(0, topK);
}

/**
 * Formatea los fragmentos recuperados como bloque de contexto para el LLM.
 *
 * @param {Array} chunks
 * @returns {string}
 */
export function formatContext(chunks) {
    if (!chunks.length) {
        return 'No se encontró información específica en la base de conocimiento de CONSERVA.';
    }
    return chunks
        .map((c, i) => {
            const src = c.source || c.moduleId || 'CONSERVA';
            const content = c.answer || c.preview || c.text || '';
            return `[Fragmento ${i + 1} — ${src}]:\n${content.trim()}`;
        })
        .join('\n\n---\n\n');
}
