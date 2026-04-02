/**
 * Une los .jsonl (y rag_conserva_20k.json) de la carpeta de cuestionarios
 * en un JSON compacto para el RAG del cliente, con deduplicación por
 * grupo_equivalencia + fragmento (o tema + fragmento).
 *
 * RAG_CUESTIONARIOS_DIR — ruta a la carpeta (default: Downloads\cuestionarios del usuario).
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outFile = path.join(root, 'public', 'knowledge', 'rag_cuestionarios_compact.json');

const STOP = new Set(['de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'las', 'un', 'por',
    'con', 'una', 'para', 'es', 'al', 'lo', 'se', 'que', 'su', 'si', 'o', 'pero', 'sus', 'le',
    'ya', 'fue', 'ha', 'me', 'te', 'nos', 'son', 'era', 'han', 'ser', 'hay', 'como', 'este',
    'esta', 'mas', 'muy', 'sin', 'sobre', 'entre', 'cuando', 'todo', 'bien', 'tambien',
    'sido', 'estar', 'tiene', 'tengo', 'tener', 'puede', 'hacer', 'otra', 'seran', 'sera',
    'debe', 'deben', 'deberan', 'dicho', 'dicha', 'mismo', 'misma', 'cada', 'cual', 'cuales',
    'donde', 'quien', 'cuyo', 'cuya', 'aqui', 'alli', 'eso', 'esto']);

function normalize(text) {
    if (!text) return '';
    let t = String(text).toLowerCase();
    const map = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'n' };
    for (const [k, v] of Object.entries(map)) t = t.split(k).join(v);
    return t.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(text, minLen = 3) {
    return normalize(text).split(/\s+/).filter(w => w.length >= minLen && !STOP.has(w));
}

/** Prefijos del dataset → módulo manual (citas / contexto). */
const PREFIJO_MODULE = {
    MDP: 'MAN_SOL',
    CPA: 'MAN_PAR',
    CTH: 'MAN_HOG',
    CIN: 'MAN_IND',
    MCC: 'MAN_CAJ',
    MVI: 'MAN_VIA',
    MAI: 'MAN_AUD',
    CTA: 'MAN_TAC',
    MSA: null,
    CTA_CURSO: null,
};

function defaultCuestionariosDir() {
    const h = process.env.USERPROFILE || process.env.HOME || '';
    if (process.platform === 'win32' && h) {
        return path.join(h, 'Downloads', 'cuestionarios');
    }
    return path.join(h || root, 'Downloads', 'cuestionarios');
}

async function readJsonlFile(filePath, onRow) {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
    let lineNum = 0;
    for await (const line of rl) {
        lineNum++;
        const s = line.trim();
        if (!s) continue;
        try {
            onRow(JSON.parse(s), filePath);
        } catch (e) {
            console.warn(`[build-rag-cuestionarios] ${path.basename(filePath)}:${lineNum} JSON inválido, omitido`);
        }
    }
}

function ingestJsonlRow(row, acc) {
    const frag = (row.fragmento_base_del_documento || row.respuesta || '').trim();
    if (!frag || frag.length < 3) return;

    const grupo = row.mapa_intencion?.grupo_equivalencia || row.tema || row.id_registro || '';
    const key = `${grupo}\x00${frag.slice(0, 2000)}`;

    const consulta = (row.consulta || row.pregunta || '').trim();
    const src = row.titulo_documento || row.fuente || 'CONSERVA';
    const pref = (row.prefijo_fuente || '').toUpperCase();
    const moduleId = PREFIJO_MODULE[pref] ?? null;

    const extras = [
        row.consulta_normalizada,
        ...(Array.isArray(row.palabras_clave) ? row.palabras_clave : []),
        ...(Array.isArray(row.palabras_ancla) ? row.palabras_ancla : []),
        ...(Array.isArray(row.terminos_sinonimos) ? row.terminos_sinonimos : []),
        ...(Array.isArray(row.entidades_mencionadas) ? row.entidades_mencionadas : []),
        row.subtema,
        row.seccion,
    ].filter(Boolean);

    let slot = acc.get(key);
    if (!slot) {
        slot = {
            q: consulta || row.consulta_normalizada || frag.slice(0, 120),
            a: frag,
            source: src,
            moduleId,
            parts: new Set(),
        };
        acc.set(key, slot);
    } else {
        if (consulta && consulta.length > 4) slot.parts.add(consulta);
        if (!slot.moduleId && moduleId) slot.moduleId = moduleId;
    }
    for (const e of extras) slot.parts.add(String(e));
}

async function main() {
    const srcDir = process.env.RAG_CUESTIONARIOS_DIR || defaultCuestionariosDir();

    if (!fs.existsSync(srcDir)) {
        console.warn('[build-rag-cuestionarios] Carpeta no encontrada:', srcDir);
        console.warn('  Define RAG_CUESTIONARIOS_DIR o copia los datos ahí. No se regenera el JSON.');
        process.exit(0);
    }

    const acc = new Map();

    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jsonl'));
    for (const f of files.sort()) {
        const fp = path.join(srcDir, f);
        await readJsonlFile(fp, row => ingestJsonlRow(row, acc));
        console.log('[build-rag-cuestionarios]', f, '→ acumulado', acc.size, 'claves');
    }

    const rag20k = path.join(srcDir, 'rag_conserva_20k.json');
    if (fs.existsSync(rag20k)) {
        console.log('[build-rag-cuestionarios] Leyendo rag_conserva_20k.json …');
        const raw = fs.readFileSync(rag20k, 'utf8');
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
            for (const row of arr) ingestMdpRowToMain(row, acc);
        }
    }

    const items = [];
    let i = 0;
    for (const slot of acc.values()) {
        const blob = [slot.q, ...slot.parts, slot.a, slot.source].join(' ');
        items.push({
            id: `cuest-${++i}`,
            q: slot.q,
            a: slot.a,
            source: slot.source,
            moduleId: slot.moduleId,
            text: normalize(blob),
        });
    }

    const payload = {
        meta: {
            builtAt: new Date().toISOString(),
            sourceDir: srcDir,
            count: items.length,
        },
        items,
    };

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, JSON.stringify(payload), 'utf8');
    console.log('[build-rag-cuestionarios] Escrito', outFile, 'items', items.length);

    const sample = tokenize('¿cómo se llama el crédito paralelo en conserva').slice(0, 8);
    const N = items.length || 1;
    const dfs = {};
    for (const it of items) {
        const toks = new Set(tokenize(it.text));
        for (const t of toks) dfs[t] = (dfs[t] || 0) + 1;
    }
    let hit = 0;
    for (const it of items) {
        let s = 0;
        for (const t of sample) {
            if (!it.text.includes(t)) continue;
            const df = dfs[t] || 1;
            s += Math.log((N + 1) / (df + 1)) + 1;
        }
        if (s > 0) hit++;
    }
    console.log('[build-rag-cuestionarios] Verificación muestra paralelo/conserva:', hit, 'documentos con score > 0');
}

/** MDP JSON array: merge into same acc shape using respuesta as dedup key. */
function ingestMdpRowToMain(row, acc) {
    const frag = (row.respuesta || '').trim();
    if (!frag) return;
    const key = `MDP_JSON\x00${normalize(frag).slice(0, 2000)}`;
    const preg = (row.pregunta || '').trim();
    const src = row.fuente || 'Manual de Crédito Mujeres de Palabra (dataset)';

    let slot = acc.get(key);
    if (!slot) {
        slot = {
            q: preg || frag.slice(0, 120),
            a: frag,
            source: src,
            moduleId: 'MAN_SOL',
            parts: new Set(),
        };
        acc.set(key, slot);
    } else if (preg && preg.length > 4) {
        slot.parts.add(preg);
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
