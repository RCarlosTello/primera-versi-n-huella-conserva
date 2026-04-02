/**
 * app/modules.js
 * Módulos institucionales: CON-001, MAN-002, VIA-006
 *
 * Patrón de interacción:
 *  - MODO GUIADO:  usuario entra al módulo → elige manual → ve temas sugeridos → pregunta
 *  - MODO DIRECTO: usuario pregunta algo concreto → el bot detecta manual y responde,
 *                  o pide aclaración si hay ambigüedad entre varias líneas.
 *
 * Todas las respuestas llevan citación obligatoria de fuente.
 */

import {
    MAN_DATA, TOPIC_KEYWORDS, MANUAL_KEYWORDS,
    VIA_HOSPEDAJE, VIA_DESTINOS_MAP, VIA_ALIMENTOS,
    VIA_GRUPOS, VIA_POLITICAS, VIA_INTERNACIONAL,
    getDistanciaKm, evaluarViaticos,
    VIA_DISTANCIAS, VIA_UBICACION_MAP
} from '../data/manuales.js';

// Sanciones data is now lazy loaded in handleSAN()

import { FAQS } from '../data/faqs.js';
import { semanticSearch, deepSearch, isOnline } from './search.js';

export { MANUAL_KEYWORDS };

export const CON_TOPICS = [
    { label: 'Misión' }, { label: 'Visión' }, { label: 'Historia' }, 
    { label: 'Valores' }
];


// ─── MOD-CON-001 ─────────────────────────────────────────────────────────────
const CON_INFO = {
    mision: `Somos una empresa mexicana; impulsamos procesos formativos de desarrollo y bienestar para nuestros clientes, a través de servicios financieros y no financieros eficientes liderados por colaboradores con vocación de servicio, profesionalismo y alto compromiso social.`,
    vision: `Contribuir a generar un cambio positivo en la vida de las personas.`,
    proposito: `Contribuir al desarrollo de las personas para generar bienestar social.`,
    mantra: `Desarrollo y Bienestar`,
    valores: `Liderazgo, Enfoque a Logros, Compromiso, Lealtad, Colaborador y Formador, Sentido Humano, Resiliencia.`,
    dominio: `@grupoconserva.mx | Sector microfinanciero | CONSERVA SOFOM ENR`,
    historia: `📅 **Nuestra Historia — Grupo CONSERVA**\n\n🌱 **1999:** Nacimos como **CONSERVA** con la finalidad de apoyar a las mujeres marginadas del estado de Chiapas a través de proyectos productivos de desarrollo social.\n\n💳 **2000:** Incursionamos en los **microcréditos**, buscando nuevas formas de apoyar a las microempresarias y jefas de familia.\n\n🚀 **Expansión y Crecimiento:**\n- **2003:** Ampliamos nuestros servicios hacia el estado de **Tabasco**.\n- **2008:** Abrimos sucursales en el estado de **Yucatán**.\n- **2016:** Iniciamos operaciones en **Puebla**.\n- **2019:** Llegamos a **Campeche**.\n- **2022:** Iniciamos operaciones en el **Estado de México**.\n\n👥 **Actualidad:** Hoy miles de personas se benefician con Conserva, gracias a un equipo que ofrece servicios con **calidad, respeto y calidez**, ganando reconocimiento local e internacional.\n\n🏆 **Compromiso Social:** Desde el año **2010** contamos con el distintivo de **Empresa Socialmente Responsable (ESR)**, el cual trabajamos año con año para mantener.`,
};

export function handleCON(query) {
    const q = (query || '').toLowerCase();
    let content = '', seccion = 'General';

    if (q.includes('misión') || q.includes('mision')) {
        content = `💬 Misión de CONSERVA:\n${CON_INFO.mision}`; seccion = 'Misión';
    } else if (q.includes('visión') || q.includes('vision')) {
        content = `💬 Visión de CONSERVA:\n${CON_INFO.vision}`; seccion = 'Visión';
    } else if (q.includes('propósito') || q.includes('proposito')) {
        content = `💬 Propósito Institucional:\n${CON_INFO.proposito}`; seccion = 'Propósito';
    } else if (q.includes('mantra')) {
        content = `💬 Mantra de CONSERVA:\n${CON_INFO.mantra}`; seccion = 'Mantra';
    } else if (q.includes('valor') || q.includes('principio')) {
        content = `💬 Valores Corporativos:\n${CON_INFO.valores}`; seccion = 'Valores';
    } else if (q.includes('historia') || q.includes('trayectoria') || q.includes('fundación') || q.includes('inicio')) {
        content = `💬 Nuestra Historia:\n${CON_INFO.historia}`; seccion = 'Historia';
    } else {
        return null; // No corresponde a temarios de CON
    }
    return { 
        content, 
        source: `MOD-CON-001 — ${seccion}`,
        botonesTemas: ['Misión', 'Visión', 'Historia', 'Valores']
    };
}

// ─── MOD-MAN-002 ─────────────────────────────────────────────────────────────

/** Catálogo de líneas. El id coincide con las claves de MAN_DATA. */
export const MAN_LINEAS = [
    { id: 'MAN_SOL', label: 'Mujeres de Palabra / Crédito Solidario' },
    { id: 'MAN_IND', label: 'Crédito Individual (Tu Negocio con CONSERVA)' },
    { id: 'MAN_TAC', label: 'Conserva T Activa' },
    { id: 'MAN_HOG', label: 'Tu Hogar con CONSERVA' },
    { id: 'MAN_PAR', label: 'Crédito Paralelo' },
    // Caja Chica es accesible desde el menú principal (botón 4), no como línea de crédito
];

/** Lista de líneas INCLUYENDO Caja Chica y Auditoría (para búsqueda interna, no para el menú principal de créditos) */
const ALL_LINEAS = [
    ...MAN_LINEAS,
    { id: 'MAN_CAJ', label: 'Caja Chica' },
    { id: 'MAN_AUD', label: 'Auditoría Interna' }
];

/** Paso 1 del Modo Guiado: pregunta qué línea desea consultar. */
export function handleMANLineasPrompt() {
    return {
        content: `Para darte información precisa del manual oficial, indícame sobre cuál línea deseas consultar:`,
        source: null,
        needsLinea: true,
    };
}

/** Temas específicos por línea de crédito — Mobile optimized (etiquetas cortas) */
const TEMAS_POR_LINEA = {
    MAN_SOL: ['Montos', 'Plazos', 'Tasas e intereses', 'Integrantes del grupo', 'Requisitos', 'Garantías', 'Bonificación', 'Seguro de vida', 'Cobranza y mora'],
    MAN_IND: ['Montos', 'Plazos', 'Tasas e intereses', 'Requisitos', 'Garantías', 'Seguro de vida', 'Cobranza'],
    MAN_TAC: ['Montos', 'Plazos', 'Tasas e intereses', 'Integrantes del grupo', 'Requisitos', 'Garantías', 'Bonificación', 'Seguro'],
    MAN_HOG: ['Montos', 'Plazos', 'Tasas e intereses', 'Requisitos', 'Garantías', 'Destino del crédito', 'Comprobación del uso'],
    MAN_PAR: ['Montos', 'Plazos', 'Tasas e intereses', 'Requisitos de elegibilidad', 'Garantías', 'Seguro', 'Cobranza'],
    MAN_CAJ: ['Control y manejo', 'Responsable', 'Comprobación y reembolso', 'Control del proceso', 'Control de aprobaciones'],
    MAN_AUD: ['Auditoría genera valor', 'Independencia obligatoria', 'Planeación por riesgo', 'Control del crédito', 'Calificación por sucursal', 'Tickets con seguimiento', 'Ética exigible'],
};

/** Paso 2 del Modo Guiado: muestra temas disponibles para ese manual. */
export function handleMANTemasPrompt(linea) {
    const data = MAN_DATA[linea.id];
    if (!data) return { content: `Manual no encontrado para la línea seleccionada.`, source: null };

    const temas = TEMAS_POR_LINEA[linea.id] || data.temas || [];

    return {
        content: `Consultando el **${data.nombre}**.\n\n📝 *${data.descripcion}*\n\n¿Sobre qué tema deseas información?`,
        source: data.fuente,
        needsTema: true,
        botonesTemas: temas,
    };
}

/** Detecta línea por input del usuario. */
export function detectLinea(input) {
    const q = (input || '').toLowerCase().trim();
    if (q === '1' || q.includes('solidar') || q.includes('mujeres de palabra')) return ALL_LINEAS[0];
    if (q === '2' || q.includes('individual') || q.includes('tu negocio')) return ALL_LINEAS[1];
    if (q === '3' || q.includes('t activa') || q.includes('tactiva') || q.includes('t-activa')) return ALL_LINEAS[2];
    if (q === '4' || q.includes('hogar') || q.includes('vivienda')) return ALL_LINEAS[3];
    if (q === '5' || q.includes('paralelo') || q.includes('adicional') || q.includes('campaña')) return ALL_LINEAS[4];
    if (q.includes('caja chica')) return ALL_LINEAS[5];
    if (q.includes('auditoria') || q.includes('auditoría') || q.includes('auditor') || q.includes('auditores')) return ALL_LINEAS[6];
    return null;
}

/**
 * Modo Directo: dado un query libre, detecta de qué manual se trata.
 * Devuelve { linea, ambiguo } donde ambiguo=true si no pudo determinarlo.
 */
export function detectManualDesdeQuery(query) {
    const q = (query || '').toLowerCase();
    const coincidencias = [];

    for (const [id, keywords] of Object.entries(MANUAL_KEYWORDS)) {
        if (keywords.some(k => q.includes(k))) {
            const linea = ALL_LINEAS.find(l => l.id === id);
            if (linea) coincidencias.push(linea);
        }
    }

    if (coincidencias.length === 1) return { linea: coincidencias[0], ambiguo: false };
    if (coincidencias.length > 1) return { linea: null, ambiguo: true, opciones: coincidencias };
    return { linea: null, ambiguo: true, opciones: MAN_LINEAS };
}

/**
 * Motor principal de respuesta para un manual específico.
 * Usa datos reales de MAN_DATA.
 */
export function handleMAN(query, linea, collaborator) {
    const data = MAN_DATA[linea?.id];
    if (!data) {
        return {
            content: `No se encontró información para la línea seleccionada. Verifica la selección e intenta de nuevo.`,
            source: null,
        };
    }

    const q = (query || '').toLowerCase();

    // ── Meta-preguntas sobre el catálogo de productos ──────────────────────────
    // Detectar preguntas de conteo o listado de todos los productos/manuales
    const isMetaCatalogo = /cuantos?|cu[aá]ntos?|listado|todos los|cu[aá]les son|que productos|qué productos|que manuales|qué manuales|productos.*conserva|manuales.*conserva|lineas.*credito|l[ií]neas.*cr[eé]dito/i.test(query);
    if (isMetaCatalogo && !linea?.id) {
        return {
            content: `📋 **Productos de Crédito CONSERVA**\n\nGrupo CONSERVA ofrece **5 productos de crédito** principales:\n\n1. 👥 **Mujeres de Palabra** — Crédito grupal solidario para mujeres emprendedoras\n2. 🏪 **Crédito Individual** — Para negocios establecidos (Tu Negocio con CONSERVA)\n3. ⚡ **Conserva T Activa** — Crédito grupal con condiciones especiales\n4. 🏠 **Tu Hogar con CONSERVA** — Mejoramiento y construcción de vivienda\n5. ➕ **Crédito Paralelo** — Crédito adicional para clientes activos\n\nAdemás, administramos:\n- 📦 **Caja Chica** — Fondo para gastos operativos urgentes\n- 🔍 **Auditoría Interna** — Marco institucional de control\n\n¿Deseas información detallada de algún producto específico?`,
            source: 'MOD-MAN-002 — Catálogo de Productos CONSERVA',
            botonesTemas: ['Mujeres de Palabra', 'Crédito Individual', 'Conserva T Activa', 'Tu Hogar con CONSERVA', 'Crédito Paralelo'],
        };
    }

    // ── BÚSQUEDA SEMÁNTICA EN FAQs ──────────────────────────────────────────────
    const faqListForLinea = FAQS[linea.id];
    if (faqListForLinea?.length) {
        const _results = semanticSearch(query, faqListForLinea, { topK: 3, minScore: 0.25, fuzzy: true, expandSynonyms: true });
        const bestScore = _results.length > 0 ? _results[0].score : 0;
        const bestMatch = _results.length > 0 ? _results[0].faq : null;

        if (bestScore >= 0.25 && bestMatch) {
            let answerText = bestMatch.a;

            // ── RAZONAMIENTO DINÁMICO PARA CAJA CHICA (JERARQUÍA Y AUTORIZACIONES) ──
            if (linea.id === 'MAN_CAJ' && (bestMatch.q.includes('autoriza') || bestMatch.q.includes('suplente') || bestMatch.q.includes('reembolso'))) {
                const p = (collaborator?.puesto || '').toLowerCase();
                if (p) {
                    let escalon = 'tu jefe directo para firmas o autorizaciones';
                    if (p.includes('promotor') || p.includes('analista') || p.includes('coordinador')) {
                        escalon = 'el Gerente de tu Sucursal';
                    } else if (p.includes('gerente de sucursal')) {
                        escalon = 'el Gerente Regional';
                    } else if (p.includes('gerente regional')) {
                        escalon = 'el Subdirector o Director de tu área corporativa';
                    } else if (p.includes('director') || p.includes('subdirector')) {
                        escalon = 'la Dirección General';
                    }

                    answerText += `\n\n> 👤 **Nota basada en tu puesto actual (${collaborator.puesto}):** Recuerda que en la cadena jerárquica, el siguiente escalón al que debes acudir es **${escalon}**.`;
                }
            }

            return {
                content: `He encontrado información específica en **${data.nombre}** que responde a tu consulta:\n\n💬 Respuesta del Manual:\n${answerText}`,
                source: data.fuente
            };
        }
    }

    // ── Detección de tema (por palabras clave o por número en la lista) ────────
    const numEntrada = parseInt(q.trim(), 10);
    const nombreTemaSeleccionado = (!isNaN(numEntrada) && numEntrada > 0 && numEntrada <= data.temas.length)
        ? data.temas[numEntrada - 1].toLowerCase()
        : '';

    const esTema = (keys, nombreTema) => {
        return keys.some(k => q.includes(k)) || (nombreTemaSeleccionado && keys.some(k => nombreTemaSeleccionado.includes(k)));
    };

    // ── GRUPO / INTEGRANTES ────────────────────────────────────────────────────
    if (esTema(TOPIC_KEYWORDS.grupo, 'integrantes') || nombreTemaSeleccionado.includes('grupo')) {
        return _respGrupo(data, q);
    }

    // ── MONTOS ────────────────────────────────────────────────────────────────
    if (esTema(TOPIC_KEYWORDS.montos, 'montos')) {
        return _respMontos(data);
    }

    // ── PLAZOS ────────────────────────────────────────────────────────────────
    if (esTema(TOPIC_KEYWORDS.plazos, 'plazos')) {
        return _respPlazos(data);
    }

    // ── TASAS / INTERESES / BONIFICACIÓN ──────────────────────────────────────
    if (esTema(TOPIC_KEYWORDS.tasas, 'tasas') || nombreTemaSeleccionado.includes('bonificación')) {
        return _respTasas(data);
    }

    // ── REQUISITOS ────────────────────────────────────────────────────────────
    if (esTema(TOPIC_KEYWORDS.requisitos, 'requisitos')) {
        return _respRequisitos(data);
    }

    // ── GARANTÍAS ─────────────────────────────────────────────────────────────
    if (esTema(TOPIC_KEYWORDS.garantias, 'garantías')) {
        return _respGarantias(data);
    }

    // ── SEGURO DE VIDA ────────────────────────────────────────────────────────
    if (esTema(TOPIC_KEYWORDS.seguro, 'seguro')) {
        return _respSeguro(data);
    }

    // ── COBRANZA / MORA ───────────────────────────────────────────────────────
    if (esTema(TOPIC_KEYWORDS.cobranza, 'cobranza')) {
        return _respCobranza(data);
    }

    // ── CAJA CHICA (Nuevos temas solicitados) ─────────────────────────
    if (linea.id === 'MAN_CAJ') {
        if (esTema(TOPIC_KEYWORDS.aprobaciones, 'control de aprobaciones y modificaciones')) {
            return _respAprobaciones(data);
        }
        if (esTema(TOPIC_KEYWORDS.proceso, 'control del proceso')) {
            return _respProceso(data);
        }
        if (esTema(TOPIC_KEYWORDS.responsable, 'responsable')) {
            return _respResponsable(data);
        }
        if (esTema(TOPIC_KEYWORDS.manejo, 'control y manejo de caja chica')) {
            return _respManejo(data);
        }
        if (esTema([...(TOPIC_KEYWORDS.comprobacion || []), 'reembolso', 'comprobación y reembolso'], 'comprobación y reembolso')) {
            return _respComprobacionReembolso(data);
        }
    }

    // ── AUDITORÍA INTERNA ─────────────────────────────────────────────
    if (linea.id === 'MAN_AUD') {
        if (esTema(TOPIC_KEYWORDS.audi_valor, 'auditoría genera valor')) return { content: data.genera_valor.texto, source: data.fuente };
        if (esTema(TOPIC_KEYWORDS.audi_independencia, 'independencia obligatoria')) return { content: data.independencia.texto, source: data.fuente };
        if (esTema(TOPIC_KEYWORDS.audi_planeacion, 'planeación por riesgo')) return { content: data.planeacion.texto, source: data.fuente };
        if (esTema(TOPIC_KEYWORDS.audi_control_credito, 'control del crédito')) return { content: data.control_credito.texto, source: data.fuente };
        if (esTema(TOPIC_KEYWORDS.audi_calificacion, 'calificación por sucursal')) return { content: data.calificacion.texto, source: data.fuente };
        if (esTema(TOPIC_KEYWORDS.audi_tickets, 'tickets con seguimiento')) return { content: data.tickets.texto, source: data.fuente };
        if (esTema(TOPIC_KEYWORDS.audi_etica, 'ética exigible')) return { content: data.etica.texto, source: data.fuente };
        if (esTema(TOPIC_KEYWORDS.audi_sanciones, 'sanciones progresivas reales')) return { content: data.sanciones.texto, source: data.fuente };
    }

    // ── RESPUESTA GENERAL con temas disponibles ───────────────────────────────
    return {
        content: `Consultando el **${data.nombre}**.\n\n📝 *${data.descripcion}*\n\n¿Sobre qué tema deseas información?`,
        source: data.fuente,
        botonesTemas: [...data.temas, 'Regresar al Menú Principal'],
    };
}

// ── Funciones de respuesta por tema ──────────────────────────────────────────

function _respMontos(data) {
    const m = data.montos;
    if (!m) return { content: `Leí el documento **${data.nombre}**, pero no encontré datos específicos sobre montos.`, source: data.fuente };

    let txt = `💬 Montos de Crédito Autorizados:\n`;

    if (m.min !== undefined) txt += `- **Monto mínimo:** $${m.min.toLocaleString('es-MX')}.00\n`;
    if (m.min_cintalapa !== undefined) txt += `- **Monto mínimo Cintalapa:** $${m.min_cintalapa.toLocaleString('es-MX')}.00\n`;
    if (m.max !== undefined) txt += `- **Monto máximo:** $${m.max.toLocaleString('es-MX')}.00\n`;
    if (m.primer_ciclo_max !== undefined) txt += `- **Máximo primer ciclo:** $${m.primer_ciclo_max.toLocaleString('es-MX')}.00\n`;
    if (m.primer_credito_max !== undefined) txt += `- **Máximo primer crédito:** $${m.primer_credito_max.toLocaleString('es-MX')}.00\n`;
    if (m.capacidad_pago_max_pct !== undefined) txt += `- **Capacidad de pago:** Máximo ${m.capacidad_pago_max_pct}%\n`;
    if (m.nota) txt += `\n📝 ${m.nota}`;

    return { content: txt, source: data.fuente };
}

function _respPlazos(data) {
    const p = data.plazos;
    if (!p) return { content: `Leí el documento **${data.nombre}**, pero no encontré datos específicos sobre plazos.`, source: data.fuente };

    let txt = `💬 Plazos de Crédito y Frecuencias:\n${p.texto}`;
    if (data.tasas?.plazos_tabla) {
        txt += '\n' + data.tasas.plazos_tabla.map(r => `- Hasta $${r.hasta.toLocaleString('es-MX')}: ${r.plazos}`).join('\n');
    }
    return { content: txt, source: data.fuente };
}

function _respTasas(data) {
    const t = data.tasas;
    if (!t) return { content: `Leí el documento **${data.nombre}**, pero no encontré datos específicos sobre tasas e intereses.`, source: data.fuente };

    let txt = `💬 Tasas, Intereses y Comisiones:\n`;

    if (t.mensual_con_iva) txt += `- **Tasa mensual (+ IVA):** ${t.mensual_con_iva}\n`;
    if (t.anual_con_iva) txt += `- **Tasa anual (+ IVA):** ${t.anual_con_iva}\n`;
    if (t.global_mensual) txt += `- **Tasa global mensual:** ${t.global_mensual}\n`;
    if (t.anual) txt += `- **Tasa anual:** ${t.anual}\n`;
    if (t.cat) txt += `- **CAT (informativo):** ${t.cat}\n`;
    if (t.iva) txt += `- **IVA:** ${t.iva}\n`;
    if (t.moratoria_texto) txt += `- **Tasa moratoria:** ${t.moratoria_texto}\n`;
    if (t.seguro) txt += `- **Seguro de vida:** ${t.seguro}\n`;
    if (t.seguro_cuota) txt += `- **Cuota seguro:** ${t.seguro_cuota}\n`;
    if (t.comisiones) txt += `- **Comisiones:** ${t.comisiones}\n`;

    if (t.bonificacion) {
        txt += `\n**Bonificación:**\n`;
        const b = t.bonificacion;
        if (b.ciclos_1_5) txt += `- Ciclos 1–5: ${b.ciclos_1_5}\n`;
        if (b.ciclos_6_9) txt += `- Ciclos 6–9: ${b.ciclos_6_9}\n`;
        if (b.ciclos_10_mas) txt += `- Ciclos 10+: ${b.ciclos_10_mas}\n`;
        if (b.reingreso) txt += `- Reingreso: ${b.reingreso}\n`;
        if (b.nota) txt += `\n📝 ${b.nota}`;
    }

    return { content: txt, source: data.fuente };
}

function _respRequisitos(data) {
    const r = data.requisitos;
    if (!r) return { content: `Leí el documento **${data.nombre}**, pero no encontré una lista de requisitos específicos.`, source: data.fuente };

    let txt = `💬 Requisitos para Solicitud de Crédito:\n`;

    if (r.documentos?.length) {
        txt += r.documentos.map(d => `- ${d}`).join('\n') + '\n';
    }
    if (r.garantia_liquida) txt += `- **Garantía líquida:** ${r.garantia_liquida}\n`;
    if (r.edad) txt += `- **Edad:** ${r.edad}\n`;
    if (r.antigüedad_domicilio) txt += `- **Antigüedad domicilio:** ${r.antigüedad_domicilio}\n`;
    if (r.obligado_solidario) txt += `- **Obligado solidario:** ${r.obligado_solidario}\n`;
    if (r.historial) txt += `- **Historial crediticio:** ${r.historial}\n`;
    if (r.ventana_solicitud) txt += `- **Ventana solicitud:** ${r.ventana_solicitud}\n`;
    if (r.restricciones) txt += `\n⚠️ **Restricciones:** ${r.restricciones}`;

    return { content: txt, source: data.fuente };
}

function _respGarantias(data) {
    const g = data.garantias;
    if (!g) return { content: `Leí el documento **${data.nombre}**, pero no encontré información sobre garantías.`, source: data.fuente };

    return {
        content: `💬 Políticas de Garantías:\n${g}`,
        source: data.fuente,
    };
}

function _respGrupo(data, query) {
    const g = data.grupo;
    if (!g) {
        return {
            content: `Revisando **${data.nombre}**, noto que este es un crédito **individual** y no aplica la lógica de formación de grupos.`,
            source: data.fuente,
        };
    }

    let txt = `De acuerdo al documento **${data.nombre}**, te comparto la información sobre la formación de grupos e integrantes:\n\n`;

    if (g.min_integrantes !== undefined) txt += `- **Mínimo de integrantes:** ${g.min_integrantes} personas\n`;
    if (g.max_integrantes !== null && g.max_integrantes !== undefined) txt += `- **Máximo de integrantes:** ${g.max_integrantes} personas\n`;
    if (g.tipo_solicitante) txt += `- **Perfil:** ${g.tipo_solicitante}\n`;
    if (g.familiaridad) txt += `- **Familiaridad permitida:** ${g.familiaridad}\n`;
    if (g.mesa_directiva) txt += `- **Mesa directiva:** ${g.mesa_directiva}\n`;
    if (g.nota || g.nota_monto) txt += `\n📝 ${g.nota || g.nota_monto}`;

    if (g.region_puebla) {
        const rp = g.region_puebla;
        txt += `\n\n**Excepción Región Puebla:**\n`;
        txt += `- Mínimo: ${rp.min_integrantes} personas, Máximo: ${rp.max_integrantes} personas\n`;
        if (rp.mixtos) txt += `- ${rp.mixtos}\n`;
    }

    // ── Razonamiento contextual: "¿puedo armar grupo con X personas?" ──────────
    const numMatch = query.match(/\b(\d+)\s*(persona|integrante|miembro)/);
    if (numMatch && g.min_integrantes !== undefined) {
        const n = parseInt(numMatch[1], 10);
        const ok = n >= g.min_integrantes && (g.max_integrantes === null || n <= g.max_integrantes);
        const minStr = g.min_integrantes;
        const maxStr = g.max_integrantes ?? 'sin límite máximo explícito';
        txt += `\n\n---\n🧐 **Análisis de tu consulta:** Preguntaste sobre formar un grupo de **${n}** personas.\n`;
        if (ok) {
            txt += `✅ **Sí es posible.** El manual indica buscar entre **${minStr} y ${maxStr}** integrantes, por lo que tus ${n} personas cumplen perfectamente.`;
        } else {
            txt += `❌ **No es viable.** El manual exige un mínimo de **${minStr}** integrantes${g.max_integrantes ? ` y un tope de **${g.max_integrantes}**` : ''}.`;
        }
    }

    return { content: txt, source: data.fuente };
}

function _respSeguro(data) {
    const s = data.seguro_vida;
    if (!s) return { content: `Leí el documento **${data.nombre}**, pero no menciona políticas de seguro de vida.`, source: data.fuente };

    let txt = `Claro, en el documento **${data.nombre}**, la política sobre el seguro de vida indica lo siguiente:\n\n`;
    if (s.edad_aceptacion) txt += `- **Edades aceptadas:** ${s.edad_aceptacion}\n`;
    if (s.suma_asegurada) txt += `- **Suma asegurada:** ${s.suma_asegurada}\n`;
    if (s.monto) txt += `- **Costo del seguro:** ${s.monto}\n`;
    if (s.vigencia) txt += `- **Vigencia:** ${s.vigencia}\n`;
    if (s.nota) txt += `\n📝 ${s.nota}`;

    return { content: txt, source: data.fuente };
}

function _respCobranza(data) {
    const t = data.tasas;
    const notaMora = data.nota_morosidad;

    let txt = `En cuanto a cobranza y mora dentro de **${data.nombre}**:\n\n`;
    if (t?.moratoria_texto) txt += `- **Intereses moratorios:** ${t.moratoria_texto}\n`;
    if (notaMora) txt += `\n⚠️ ${notaMora}`;
    if (!t?.moratoria_texto && !notaMora) txt += `No encontré reglas precisas de morosidad en el catálogo resumido de este manual. Te sugiero revisar el apartado extendido de Políticas de Cobranza.`;

    return { content: txt, source: data.fuente };
}


function _respAprobaciones(data) {
    return {
        content: `Sobre el **Control de aprobaciones y modificaciones** (Punto 2):\n\n- Es responsabilidad del área de **Métodos y Procesos** mantener actualizada la **“Bitácora de Control de Cambios”** (Apartado 8).\n- La bitácora registra: Número de cambio, sección y página modificada, descripción, fecha de modificación, área solicitante y fecha de autorización final.`,
        source: data.fuente
    };
}

function _respProceso(data) {
    return {
        content: `Sobre el **Control del proceso** (Punto 3):\n\n- **Auditoría Interna** podrá realizar supervisiones transcurridos **60 días** después de la autorización del manual.\n- Se verificará que la asignación, el uso y la comprobación se desarrollen conforme a la normatividad.\n- Los usuarios deben cumplir sus responsabilidades sin exceder facultades ni incurrir en gastos no autorizados; para ello se realizan **revisiones periódicas y auditorías formales**.`,
        source: data.fuente
    };
}

function _respResponsable(data) {
    return {
        content: `Sobre el **Responsable** (Puntos 4 y Políticas Generales):\n\n- La titular de la **Dirección de Administración y Finanzas** es la responsable de elaborar y difundir este procedimiento.\n- La asignación del fondo queda a cargo del **Gerente Regional (Sucursales)** o del **Líder Inmediato (Corporativo)**.\n- El responsable debe firmar un **resguardo digital y un pagaré** original.\n- No se deben mantener valores en la cuenta personal por más de **48 horas hábiles**. En Sucursales se debe retirar el 100% del fondo a efectivo; en Corporativo, el 50%.`,
        source: data.fuente
    };
}

function _respManejo(data) {
    return {
        content: `La **Caja Chica** cubre urgencias operativas (papelería, café, reparaciones) y exige factura para montos mayores a **$100.00**. Está prohibido usarla para viáticos, préstamos, festejos o desechables de unicel. El efectivo debe resguardarse en caja de seguridad y admite máximo **5 vales mensuales** sin factura (menores a $100.00).\n\n📋 **Puntos Clave**\n\n- **Uso:** Solo papelería urgente, paquetería, mantenimiento menor e insumos básicos.\n- **Prohibido:** Viáticos, activos >$600.00, regalos y artículos de unicel.\n- **Comprobación:** Factura obligatoria si el gasto supera los **$100.00**.\n- **Control:** Arqueos sorpresivos y resguardo obligatorio en caja de seguridad.`,
        source: data.fuente
    };
}

function _respComprobacionReembolso(data) {
    return {
        content: `Sobre la **Comprobación y reembolso**:\n\n**Comprobación:**\n- Todo gasto deberá ser comprobado. Sucursales: Anexo 2 con CFDI o Anexo 3 (Vale Azul). Corporativo requiere autorización de la Dirección del Área.\n- Operaciones mayores a $2,000.00 pesos deberán realizarse por transferencia, tarjeta o cheque nominativo.\n\n**Reembolso:**\n- Toda solicitud se envía a la Analista de Administración por correo.\n- Deberá enviarse durante el mes y la última semana la comprobación.\n- Una vez recibida sin observaciones, el depósito de reembolso se realizará en un mínimo de 3 días hábiles.`,
        source: data.fuente
    };
}

// ─── MOD-VIA-006 ─────────────────────────────────────────────────────────────

/** Determina el grupo de viáticos (A/B/C) desde el puesto del colaborador. */
function getGrupoVIA(puesto) {
    const p = (puesto || '').toLowerCase();
    if (VIA_GRUPOS.C.some(k => p.includes(k))) return 'C';
    if (VIA_GRUPOS.B.some(k => p.includes(k))) return 'B';
    return 'A'; // Promotores, Analistas, Coordinadores, Gerentes de Sucursal
}

/** Detecta si el colaborador es SOFOM o EOG. */
function getTipoNomina(puesto) {
    const p = (puesto || '').toLowerCase();
    // EOG suele ser personal de empresa especializada de contratación (operativos de campo básicos)
    // La diferenciación exacta no siempre está en el puesto, se asume SOFOM por defecto.
    return p.includes('eog') ? 'EOG' : 'SOFOM';
}

/** Detecta ciudad/destino mencionado en la query, priorizando el destino real. */
function detectDestino(query, originRegion) {
    const q = (query || '').toLowerCase();

    // 1. Intentar detectar destino después de conectores "a", "hacia", "para"
    const connectors = [' hacia ', ' a ', ' para ', ' al '];
    for (const conn of connectors) {
        const parts = q.split(conn);
        if (parts.length > 1) {
            const afterConn = parts[1].trim();
            for (const [keyword, clave] of Object.entries(VIA_DESTINOS_MAP)) {
                if (afterConn.includes(keyword)) return { region: clave, matched: keyword };
            }
        }
    }

    // 2. Si no se detectó por conectores, buscar cualquier destino que NO sea el origen
    for (const [keyword, clave] of Object.entries(VIA_DESTINOS_MAP)) {
        if (q.includes(keyword) && clave !== originRegion) return { region: clave, matched: keyword };
    }

    // 3. Fallback: buscar cualquier ciudad mencionada
    for (const [keyword, clave] of Object.entries(VIA_DESTINOS_MAP)) {
        if (q.includes(keyword)) return { region: clave, matched: keyword };
    }

    return null;
}

/** Obtiene la región base del colaborador desde su ubicación. */
function getRegionOrigen(collaborator) {
    const u = (collaborator?.ubicacion || '').toLowerCase();
    for (const [kw, region] of Object.entries(VIA_UBICACION_MAP)) {
        if (u.includes(kw)) return region;
    }
    return 'chiapas'; // Default si no se detecta (Chiapas es base central)
}

/** Calcula la distancia entre dos regiones. */
function getDistanciaRegiones(r1, r2) {
    if (r1 === r2) return 0; // Distancia cero si es la misma región
    const dist = VIA_DISTANCIAS[r1]?.[r2] || VIA_DISTANCIAS[r2]?.[r1] || 0;
    return dist;
}

export function handleVIA(query, collaborator) {
    const q = (query || '').toLowerCase();

    // ── MENÚ GUIADO — respuestas directas para botones del sub-menú ──────────
    if (q.includes('topes de hospedaje') || q === 'topes de hospedaje por ciudad') {
        const grupo = getGrupoVIA(collaborator?.puesto || '');
        const ciudades = [
            { key: 'chiapas', label: 'Chiapas' }, { key: 'tabasco', label: 'Tabasco' },
            { key: 'merida', label: 'Mérida' }, { key: 'puebla', label: 'Puebla' },
            { key: 'cdmx', label: 'CDMX' }, { key: 'estado de mexico', label: 'Edo México' }
        ];
        const lista = ciudades.map(c => `- **${c.label}:** $${(VIA_HOSPEDAJE[c.key]?.[grupo] || 0).toLocaleString('es-MX')}.00 por noche`).join('\n');
        return {
            content: `🏨 **Topes de Hospedaje por Ciudad** (Grupo ${grupo}):\n\n${lista}\n\n📝 ${VIA_POLITICAS.anticipacion}`,
            source: 'MOD-VIA-006 MANUAL_VIATICOS — Anexo 1',
            botonesTemas: ['Viáticos de Alimentos', 'Reglas de Transporte', 'Calcular Viáticos (ruta y días)']
        };
    }
    if (q.includes('viáticos de alimentos') || q.includes('viaticos de alimentos')) {
        const grupo = getGrupoVIA(collaborator?.puesto || '');
        const sofom = VIA_ALIMENTOS[grupo]?.SOFOM || 0;
        const eog = VIA_ALIMENTOS[grupo]?.EOG || 0;
        return {
            content: `🍽️ **Viáticos de Alimentos** (Grupo ${grupo}):\n\n- **SOFOM:** $${sofom.toLocaleString('es-MX')}.00 por alimento ($${(sofom*3).toLocaleString('es-MX')}.00 diarios)\n- **EOG:** $${eog.toLocaleString('es-MX')}.00 por alimento ($${(eog*3).toLocaleString('es-MX')}.00 diarios)\n\n⚠️ ${VIA_POLITICAS.distancia_alimentos}`,
            source: 'MOD-VIA-006 MANUAL_VIATICOS — Anexo 2',
            botonesTemas: ['Topes de Hospedaje por Ciudad', 'Reglas de Transporte']
        };
    }
    if (q.includes('reglas de transporte')) {
        return {
            content: `🚌 **Reglas de Transporte:**\n\n- Distancias **< 500 km**: Viaje terrestre obligatorio.\n- Distancias **> 500 km**: Se puede solicitar avión (clase económica) con **15 días hábiles** de anticipación.\n- Pagos de hospedaje o autobús en efectivo: máximo **$${Number(VIA_POLITICAS.pago_max_efectivo.match(/\d[\d,]*/)[0].replace(',','')).toLocaleString('es-MX')}**.\n\n📅 Anticipación mínima: ${VIA_POLITICAS.anticipacion}`,
            source: 'MOD-VIA-006 MANUAL_VIATICOS',
            botonesTemas: ['Calcular Viáticos (ruta y días)', 'Topes de Hospedaje por Ciudad']
        };
    }
    if (q.includes('calcular viáticos') || q.includes('calcular viaticos')) {
        return {
            content: `🧮 **Calcular Viáticos**\n\nDime el origen, destino y número de días para calcular tu presupuesto exacto.\n\n*Ejemplo:* "Voy de Tuxtla a CDMX 3 días"\n*Ejemplo:* "Viajo de Puebla a Mérida 2 noches"`,
            source: 'MOD-VIA-006 MANUAL_VIATICOS',
        };
    }
    if (q.includes('anticipación y comprobación') || q.includes('anticipacion y comprobacion') || q.includes('comprobación') || q.includes('comprobacion')) {
        return {
            content: `💬 Anticipación y Comprobación:\n- **Anticipación:** ${VIA_POLITICAS.anticipacion}\n- **Plazo:** ${VIA_POLITICAS.comprobacion_plazo}\n- **Requisitos:** Facturas CFDI (PDF y XML)\n- **No válidos:** ${VIA_POLITICAS.gastos_no_validos}\n- **Cancelación:** ${VIA_POLITICAS.devolucion_cancelacion}`,
            source: 'MOD-VIA-006 MANUAL_VIATICOS',
            botonesTemas: ['Topes de Hospedaje por Ciudad', 'Regresar al Menú Principal']
        };
    }
    if (q.includes('internacional') || q.includes('extranjero') || q.includes('dólares') || q.includes('dolares') || q.includes('usd')) {
        return {
            content: `🌍 **Viáticos Internacionales:**\n\n- **Monto:** $${VIA_INTERNACIONAL.por_dia_usd} USD por día para alimentación y transportes locales.\n- **Nota:** ${VIA_INTERNACIONAL.nota}`,
            source: 'MOD-VIA-006 MANUAL_VIATICOS — Internacionales',
            botonesTemas: ['Topes de Hospedaje por Ciudad', 'Reglas de Transporte', 'Regresar al Menú Principal']
        };
    }

    // Identificar Puesto (Permitir simulación si se menciona "Soy X")
    let puesto = collaborator?.puesto || 'Colaborador';
    const roleMatch = q.match(/soy\s+([^,.]+)/);
    if (roleMatch) {
        const simulatedRole = roleMatch[1].trim();
        const pLow = simulatedRole.toLowerCase();
        if (Object.values(VIA_GRUPOS).flat().some(k => pLow.includes(k))) {
            puesto = simulatedRole;
        }
    }
    const grupo = getGrupoVIA(puesto);
    const tipoNomina = getTipoNomina(puesto);

    // Use precise city from collaborator profile (populated from ubicacion map)
    const ciudadOrigen = collaborator?.ciudad || '';
    const estadoOrigen = collaborator?.estado || '';
    const origenRegion = collaborator?.destino_via || getRegionOrigen(collaborator);
    const destinoData = detectDestino(q, origenRegion);
    const destinoRegion = destinoData?.region;
    const destinoLabel = destinoData ? (destinoData.matched.toUpperCase() !== destinoRegion.toUpperCase() ? `${destinoData.matched.toUpperCase()} (${destinoRegion.toUpperCase()})` : destinoRegion.toUpperCase()) : '';

    // ── CÁLCULO DINÁMICO ESTRUCTURADO (Golden Rule) ──────────────────────────────────
    const diasMatch = q.match(/(\d+)\s*d[ií]as?/);
    const nochesMatch = q.match(/(\d+)\s*noches?/);

    let calcDias = 0;
    let calcNoches = 0;

    if (nochesMatch) {
        calcNoches = parseInt(nochesMatch[1], 10);
        calcDias = calcNoches + 1;
    } else if (diasMatch) {
        calcDias = parseInt(diasMatch[1], 10);
        calcNoches = Math.max(0, calcDias - 1);
    }

    // Respuesta para consultas de ciudad específica sin días — RESPUESTA RICA
    if (destinoData && calcDias === 0) {
        // Try city-level distance first (more precise), fallback to region
        const distanciaCiudad = ciudadOrigen ? getDistanciaKm(ciudadOrigen, destinoData?.matched || destinoRegion) : null;
        const evalVia = ciudadOrigen ? evaluarViaticos(ciudadOrigen, destinoData?.matched || destinoRegion) : null;
        const distancia = distanciaCiudad ?? getDistanciaRegiones(origenRegion, destinoRegion);
        const montoNoche = VIA_HOSPEDAJE[destinoRegion]?.[grupo] || 0;
        const montoAlimento = VIA_ALIMENTOS[grupo]?.[tipoNomina] || 0;
        const montoAlimentoDiario = montoAlimento * 3;
        const tipoTransporte = distancia >= 500 ? 'aéreo (clase económica)' : 'terrestre';
        const anticipacionTransporte = distancia >= 500 ? '15 días hábiles' : '2 días hábiles';

        // Detectar qué aspecto pregunta: solo hospedaje, solo alimentos, o ambos
        const pregHospedaje = /hotel|hospedaje|alojamiento|noche|dormir/.test(q);
        const pregAlimentos  = /comer|comida|alimento|desayuno|cena|almuerzo/.test(q);

        let customRes = `📍 **Viáticos para ${destinoLabel}**\n`;
        customRes += `👤 **Tu perfil:** ${puesto} — Grupo ${grupo} (${tipoNomina})\n`;
        customRes += `📏 **Distancia aprox.:** ${distancia || '< 50'} km · Transporte: ${tipoTransporte}\n\n`;

        if (distancia !== null && distancia < 50) {
            customRes += `⚠️ La distancia es de aproximadamente **${distancia} km**. Al ser un viaje de ida y vuelta en el mismo día sin pernocta, **no aplican alimentos** según política.\nPara casos excepcionales con salida antes de las 8 AM y regreso después de las 7 PM, consulta con tu jefe inmediato.`;
        } else if (!distancia || distancia === 0) {
            customRes += `⚠️ Origen y destino parecen ser la misma ciudad. No aplican viáticos por traslado local.`;
        } else {
            if (!pregAlimentos || pregHospedaje) {
                customRes += `🏨 **Hospedaje en ${destinoLabel}:**\n`;
                customRes += `   Máximo **$${montoNoche.toLocaleString('es-MX')}.00 por noche**.\n`;
                if (destinoRegion === 'cdmx') customRes += `   ⚠️ En CDMX el monto varía según la zona del evento.\n`;
                customRes += `\n`;
            }
            if (!pregHospedaje || pregAlimentos) {
                customRes += `🍽️ **Alimentos en ${destinoLabel}:**\n`;
                customRes += `   **$${montoAlimento.toLocaleString('es-MX')}.00 por alimento** · $${montoAlimentoDiario.toLocaleString('es-MX')}.00 al día (3 alimentos).\n`;
                customRes += `   *(Si el hotel incluye desayuno, solo aplican 2 alimentos: $${(montoAlimento * 2).toLocaleString('es-MX')}.00/día)*\n\n`;
            }
            customRes += `✈️ **Transporte:** ${tipoTransporte.charAt(0).toUpperCase() + tipoTransporte.slice(1)}`;
            customRes += ` · Solicitar con ${anticipacionTransporte} de anticipación.\n\n`;
            customRes += `💡 ¿Cuántos días dura tu viaje? Dime y calculo el total exacto. `;
            customRes += `_(Ej: "Voy a ${destinoData.matched} 3 días")_`;
        }

        return {
            content: customRes,
            source: `MOD-VIA-006 MANUAL_VIATICOS — Anexo 1 y 2`,
            botonesTemas: [
                `Calcular total para ${destinoData.matched} 1 día`,
                `Calcular total para ${destinoData.matched} 2 días`,
                `Calcular total para ${destinoData.matched} 3 días`,
                'Topes de Hospedaje por Ciudad',
            ]
        };
    }

    // Ruta y cálculo completo
    if (calcDias > 0 && destinoData) {
        const distancia = getDistanciaRegiones(origenRegion, destinoRegion);
        const montoNoche = VIA_HOSPEDAJE[destinoRegion]?.[grupo] || 0;
        const montoAlimento = VIA_ALIMENTOS[grupo]?.[tipoNomina] || 0;
        const montoAlimentoDiario = montoAlimento * 3;

        let totalHospedaje = montoNoche * calcNoches;
        let totalAlimentos = montoAlimentoDiario * calcDias;

        if (distancia < 50) {
            totalHospedaje = 0;
            totalAlimentos = 0;
        }

        const granTotal = totalHospedaje + totalAlimentos;

        let res = `**Ruta:** ${origenRegion.charAt(0).toUpperCase() + origenRegion.slice(1)} a ${destinoLabel} (Aprox. ${distancia || '<50'} KM).\n\n`;
        res += `**Puesto:** ${puesto} (Grupo ${grupo}).\n\n`;

        // Transporte
        if (distancia < 50) {
            res += `**Transporte:** Al ser una distancia menor a 50 km de tu origen, el transporte no es reembolsable conforme al manual.\n\n`;
        } else if (distancia < 500) {
            res += `**Transporte:** Al ser una distancia menor a 500 km, el viaje debe ser terrestre.\n\n`;
        } else {
            res += `**Transporte:** Al superar los 500 km, puedes solicitar transporte aéreo (clase económica) con 15 días de anticipación.\n\n`;
        }

        // Monto Autorizado
        if (distancia < 50) {
            res += `**Monto Autorizado:** Dentro de la misma ciudad no hay autorización para viáticos; para casos excepcionales, consulte con su jefe inmediato.\n\n`;
        } else {
            res += `**Monto Autorizado:** Te corresponde un máximo de **$${montoNoche.toLocaleString('es-MX')}.00** por noche de hospedaje en ${destinoLabel} y **$${montoAlimento.toLocaleString('es-MX')}.00** por cada alimento ($${montoAlimentoDiario.toLocaleString('es-MX')}.00 diarios).\n\n`;
        }

        // Total Estimado
        res += `**Total Estimado (${calcDias} días / ${calcNoches} noche${calcNoches !== 1 ? 's' : ''}):** **$${granTotal.toLocaleString('es-MX')}.00 pesos.**\n\n`;

        // Notas y Advertencias
        if (distancia < 50) {
            res += `⚠️ **Advertencia:** Al ser una distancia menor a 50 km de tu origen, los alimentos y transporte no son reembolsables conforme al manual.`;
        } else {
            res += `**Nota:** Al superar los 50 km de tu origen, tus alimentos son comprobables con factura fiscal (CFDI).`;
        }

        return {
            content: res,
            source: `MOD-VIA-006 MANUAL_VIATICOS — Anexo 1 y 2`
        };
    }

    // ── SECCIONES ESPECÍFICAS (GOLDEN RULE) ────────────────────────────────────────
    // Priorizamos lógica personalizada sobre FAQ general para evitar tablas de comparación.

    let respuestas = [];
    let fuentes = new Set();
    let adjuntarPlantilla = false;


    if (q.includes('hospedaje') || q.includes('hotel') || q.includes('alojamiento') || q.includes('noche')) {
        fuentes.add(`MOD-VIA-006 MANUAL_VIATICOS — Anexo 1`);
        if (destinoData) {
            const monto = VIA_HOSPEDAJE[destinoRegion]?.[grupo];
            if (monto) respuestas.push(`Tu tope de hospedaje en **${destinoLabel}** es de **$${monto.toLocaleString('es-MX')}.00 por noche**.`);
        } else {
            const ciudades = [
                { key: 'chiapas', label: 'Chiapas' },
                { key: 'tabasco', label: 'Tabasco' },
                { key: 'cdmx', label: 'CDMX' },
                { key: 'merida', label: 'Mérida' },
                { key: 'estado de mexico', label: 'Edo México' },
                { key: 'puebla', label: 'Puebla' }
            ];

            let lista = ciudades
                .filter(c => c.key !== origenRegion)
                .map(c => `- **${c.label}:** $${(VIA_HOSPEDAJE[c.key]?.[grupo] || 0).toLocaleString('es-MX')}.00`)
                .join('\n');

            respuestas.push(`Para tu puesto de **${puesto}**, estos son los montos máximos autorizados por noche:\n\n${lista}${origenRegion === 'cdmx' ? '' : '\n\n> ⚠️ En CDMX el importe puede modificarse según la zona.'}`);
        }
    }

    if (q.includes('alimento') || q.includes('comida') || q.includes('desayuno') || q.includes('cena')) {
        const monto = VIA_ALIMENTOS[grupo]?.[tipoNomina];
        fuentes.add(`MOD-VIA-006 MANUAL_VIATICOS — Anexo 2`);
        respuestas.push(`De acuerdo a tu nivel de puesto, te corresponden **$${monto.toLocaleString('es-MX')}.00** por cada alimento ($${(monto * 3).toLocaleString('es-MX')}.00 diarios).`);
    }

    if (q.includes('transporte') || q.includes('vuelo') || q.includes('avión')) {
        fuentes.add(`MOD-VIA-006 MANUAL_VIATICOS — Transporte`);
        respuestas.push(`**Regla de Transporte:**\n- Distancias < 500 km: Terrestre obligatorio.\n- Distancias > 500 km: Puede ser avión (clase económica) con 15 días de anticipación.`);
    }

    if (q.includes('comprobar') || q.includes('factura') || q.includes('plantilla')) {
        fuentes.add(`MOD-VIA-006 MANUAL_VIATICOS — Comprobación`);
        respuestas.push(`**Comprobación:** Plazo de 2 días hábiles tras el viaje. Requiere facturas PDF y XML.`);
        adjuntarPlantilla = true;
    }

    if (respuestas.length > 0) {
        return {
            content: `He revisado la Política de Viáticos para tu nivel (**${puesto}**):\n\n` + respuestas.join('\n\n'),
            source: Array.from(fuentes).join(' | '),
            adjunto: adjuntarPlantilla ? { nombre: 'Plantilla de Gastos.xlsm', url: '/plantilla de gastos.xlsm', descripcion: 'Formato oficial de comprobación' } : null
        };
    }

    // FAQ y búsquedas semánticas para Viáticos
    if (FAQS && FAQS['MAN_VIA']) {
        const _viaRes = semanticSearch(query, FAQS['MAN_VIA'], { topK: 2, minScore: 0.25, fuzzy: true, expandSynonyms: true });
        const bestScore = _viaRes.length > 0 ? _viaRes[0].score : 0;
        const bestMatch = _viaRes.length > 0 ? _viaRes[0].faq : null;

        if (bestScore >= 0.25 && bestMatch) {
            let answerText = bestMatch.a;

            if (q.includes('devuelvo') || q.includes('sobró') || q.includes('sobro')) {
                answerText = `**Sí debe devolverlos (si es dinero que sobró).** El excedente de viáticos debe devolverse obligatoriamente antes de los 2 días hábiles junto con la comprobación.`;
            }

            // Interceptar CDMX en FAQ para no mostrar tablas
            if (q.includes('cdmx') || q.includes('méxico') || q.includes('mexico')) {
                const monto = VIA_HOSPEDAJE['cdmx']?.[grupo] || 1400;
                const montoAlimento = VIA_ALIMENTOS[grupo]?.[tipoNomina] || 200;
                return {
                    content: `📍 **Consulta de Viáticos (CDMX)**\n\n**Puesto:** ${puesto} (Grupo ${grupo}).\n\n**Monto Autorizado:** Te corresponde un máximo de **$${monto.toLocaleString('es-MX')}.00** por noche de hospedaje y **$${montoAlimento.toLocaleString('es-MX')}.00** por cada alimento.\n\n⚠️ **Nota:** En CDMX el importe puede modificarse de acuerdo con la zona del evento.`,
                    source: `MOD-VIA-006 MANUAL_VIATICOS`
                };
            }

            return {
                content: `De acuerdo a la Política de Viáticos:\n\n💬 ${answerText}`,
                source: `MOD-VIA-006 MANUAL_VIATICOS`
            };
        }
    }

    const alimentosMonto = VIA_ALIMENTOS[grupo]?.[tipoNomina] || 0;
    const sugerencia = getSugerenciaDestino(origenRegion);

    // Solo mostrar sugerencias si NO se detectó ningún destino (ni siquiera uno desconocido)
    const showSugerencia = !destinoData;

    return {
        content: `Módulo de Viáticos activo para **${puesto}**.\n\n- **Alimentos:** $${alimentosMonto.toLocaleString('es-MX')}.00 por comida.\n- **Hospedaje:** Personalizado según tu destino.\n- **Transporte:** Basado en distancia (< 500 km terrestre).\n\n¿A qué ciudad viajas? ${showSugerencia ? sugerencia : ''}`,
        source: `MOD-VIA-006 MANUAL_VIATICOS — Anexo 1 y 2`,
    };
}

/** Sugiere ciudades destino excluyendo el origen. */
function getSugerenciaDestino(origen) {
    const ciudades = [
        { key: 'chiapas', label: 'Chiapas' },
        { key: 'tabasco', label: 'Tabasco' },
        { key: 'merida', label: 'Mérida' },
        { key: 'puebla', label: 'Puebla' },
        { key: 'cdmx', label: 'CDMX' },
        { key: 'estado de mexico', label: 'Edo México' }
    ];


    const filtradas = ciudades.filter(c => c.key !== origen).map(c => c.label);
    if (filtradas.length === 0) return '';

    const last = filtradas.pop();
    const texto = filtradas.length > 0 ? `${filtradas.join(', ')} o ${last}` : last;
    return `(Ej: ${texto})`;
}

// ─── MOD-SAN-007 ─────────────────────────────────────────────────────────────

export async function handleSAN(query) {
    const { SAN_DATA, buscarFolios, detectarFormatosRelevantes, TODOS_LOS_FORMATOS, FORMATOS_SANCIONES, FOLIO_FORMAT_MAP } = await import('../data/sanciones.js');
    const q = (query || '').toLowerCase().trim();

    // Helper: detectar qué vez menciona el usuario (primera, segunda, tercera, cuarta)
    function detectarPaso(texto) {
        const t = texto.toLowerCase();
        if (t.includes('primera vez') || t.includes('1era') || t.includes('1ra') || t.match(/\bprimera\b/)) return 1;
        if (t.includes('segunda vez') || t.includes('2da') || t.match(/\bsegunda\b/)) return 2;
        if (t.includes('tercera vez') || t.includes('3era') || t.match(/\btercera\b/)) return 3;
        if (t.includes('cuarta vez')  || t.includes('4ta') || t.match(/\bcuarta\b/))  return 4;
        return null;
    }

    // Helper: construir HTML de un folio LEVE con instancias completas y formatos por paso
    function renderFolioLeve(folio, pasoFiltro = null) {
        const nivel = 'LEVE';
        let html = `<div class="contenedor-respuestas"><details class="tarjeta-sancion" open>
            <summary>📋 Folio ${folio.folio} — ${nivel}: ${folio.conducta.substring(0, 55)}...</summary>
            <div class="contenido-sancion">
            <p><b>Conducta:</b> ${folio.conducta}</p>
            <p><b>Salida Económica:</b> ${folio.salida_economica}</p>
            <br><b>Pasos y acciones correctivas:</b><br>`;

        const instancias = pasoFiltro
            ? folio.instancias.filter(i => i.paso === pasoFiltro)
            : folio.instancias;

        instancias.forEach(inst => {
            const fmt = inst.formato ? FORMATOS_SANCIONES[inst.formato] : null;
            html += `<div style="margin:8px 0;padding:8px;background:rgba(0,0,0,0.04);border-radius:8px;border-left:3px solid #4a9c6a;">
                <b>Paso ${inst.paso}:</b> ${inst.accion}<br>
                <small><b>Instancia:</b> ${inst.instancia}</small>`;
            if (fmt) {
                html += `<br><a href="${fmt.url}" class="btn-descarga" download="${fmt.archivo}">📄 Descargar: ${fmt.nombre}</a>`;
            }
            html += `</div>`;
        });

        // Add all formats for this folio based on Excel mapping
        const allFolioFmts = FOLIO_FORMAT_MAP[folio.folio];
        if (allFolioFmts && allFolioFmts.length > 0) {
            const uniqueFmts = [...new Set(allFolioFmts)];
            if (uniqueFmts.length > 0) {
                html += `<div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(0,0,0,0.08)"><b>📂 Formatos de este folio:</b><br>`;
                for (const key of uniqueFmts) {
                    const f = FORMATOS_SANCIONES[key];
                    if (f) html += `<a href="${f.url}" class="btn-descarga" download="${f.archivo}">📄 Descargar: ${f.nombre}</a>`;
                }
                html += `</div>`;
            }
        }

        html += `</div></details></div>`;
        return html;
    }

    // Helper: construir HTML para folio MODERADO/GRAVE con formatos
    function renderFolioSimple(folio, nivel) {
        const instanciaLabel = nivel === 'GRAVE'
            ? SAN_DATA.nivel_grave.instancia
            : 'Enlace Talento / Enlace Jurídico';
        const accionLabel = nivel === 'GRAVE'
            ? SAN_DATA.nivel_grave.accion
            : 'Llamado escrito → Plan de Mejora → Acta Administrativa';
        const salida = folio.salida_economica || (nivel === 'GRAVE' ? SAN_DATA.nivel_grave.salida_economica : 'Finiquito');

        // Usar mapa exacto del Excel (FOLIO_FORMAT_MAP) si disponible
        const formatos = detectarFormatosRelevantes(folio.conducta, nivel, folio.folio);

        let html = `<div class="contenedor-respuestas"><details class="tarjeta-sancion" open>
            <summary>📋 Folio ${folio.folio} — ${nivel}: ${folio.conducta.substring(0,55)}...</summary>
            <div class="contenido-sancion">
            <p><b>Conducta:</b> ${folio.conducta}</p>
            <p><b>Nivel:</b> ${nivel}</p>
            <p><b>Instancia Facultada:</b> ${instanciaLabel}</p>
            <p><b>Acción Correctiva:</b> ${accionLabel}</p>
            <p><b>Salida Económica:</b> ${salida}</p>`;

        if (formatos.length > 0) {
            html += `<br><b>📂 Formatos a utilizar:</b><br>`;
            formatos.forEach(f => {
                if (f) html += `<a href="${f.url}" class="btn-descarga" download="${f.archivo}">📄 Descargar: ${f.nombre}</a>`;
            });
        }
        html += `</div></details></div>`;
        return html;
    }

    // 0. Temas informativos (1-7)
    const infoKey = Object.keys(SAN_DATA.info_temas).find(k =>
        q.includes(k) || (q.length > 5 && k.includes(q))
    );
    if (infoKey) {
        const info = SAN_DATA.info_temas[infoKey];
        return {
            content: `<div class="contenedor-respuestas"><details class="tarjeta-sancion" open>
                <summary>📍 ${info.titulo}</summary>
                <div class="contenido-sancion">${info.contenido}</div>
            </details></div>`,
            source: SAN_DATA.fuente
        };
    }

    // 1. Folio específico por número
    const folioMatch = q.match(/folio\s*(\d+)/);
    if (folioMatch) {
        const num = parseInt(folioMatch[1], 10);
        const paso = detectarPaso(q);

        if (num >= 1 && num <= 4) {
            const folio = SAN_DATA.nivel_leve.folios.find(f => f.folio === num);
            if (folio) return { content: renderFolioLeve(folio, paso), source: SAN_DATA.fuente };
        } else if (num >= 5 && num <= 52) {
            const folio = SAN_DATA.nivel_moderado.folios.find(f => f.folio === num);
            if (folio) return { content: renderFolioSimple(folio, 'MODERADO'), source: SAN_DATA.fuente };
        } else if (num >= 53 && num <= 75) {
            const folio = SAN_DATA.nivel_grave.folios.find(f => f.folio === num);
            if (folio) return { content: renderFolioSimple(folio, 'GRAVE'), source: SAN_DATA.fuente };
        }
    }

    // 2. Listados por nivel — acepta variantes masculinas y femeninas
    if ((q.includes('leve') || q.match(/\bfaltas? leves?\b/)) && !q.includes('folio')) {
        let res = `🟢 **Nivel LEVE — Folios 1 al 4**\n\n`;
        SAN_DATA.nivel_leve.folios.forEach(f => {
            res += `- **Folio ${f.folio}:** ${f.conducta.substring(0, 80)}...\n`;
        });
        res += `\nEscribe **"Folio X"** para ver pasos, instancias y formatos de descarga.`;
        return { content: res, source: SAN_DATA.fuente };
    }
    if ((q.includes('grave') || q.match(/\bfaltas? graves?\b/)) && !q.includes('folio')) {
        let res = `🔴 **Nivel GRAVE — Folios 53 al 65**\n\nTolerancia cero. Escribe el número de folio para ver detalle completo.\n\n`;
        SAN_DATA.nivel_grave.folios.forEach(f => {
            res += `- **Folio ${f.folio}:** ${f.conducta.substring(0, 80)}...\n`;
        });
        return { content: res, source: SAN_DATA.fuente };
    }
    if ((q.includes('moderado') || q.includes('moderada') || q.match(/\bfaltas? moderadas?\b/) || q.match(/\bnivel moderad/)) && !q.includes('folio')) {
        let res = `🟡 **Nivel MODERADO — Folios 5 al 52**\n\nAbarca negligencia, bajo rendimiento e incumplimientos operativos.\n\n`;
        SAN_DATA.nivel_moderado.folios.slice(0, 10).forEach(f => {
            res += `- **Folio ${f.folio}:** ${f.conducta.substring(0, 80)}...\n`;
        });
        const total = SAN_DATA.nivel_moderado.folios.length;
        if (total > 10) res += `\n_...y ${total - 10} conductas más. Escribe el número de folio o la conducta para ver el detalle._`;
        else res += `\nEscribe la conducta o **"Folio X"** para ver instancias y formatos.`;
        return { content: res, source: SAN_DATA.fuente };
    }

    // 3. Consulta de consulta de folios general
    if (q.includes('folio') && (q.includes('consulta') || q.includes('ver') || q.includes('todos'))) {
        return {
            content: `📍 **Consulta de Folios (1-65)**\n\n- 🟢 **LEVE:** Folios 1 al 4\n- 🟡 **MODERADA:** Folios 5 al 52\n- 🔴 **GRAVE:** Folios 53 al 65\n\nEscribe el número de folio o describe la conducta para buscar.`,
            source: SAN_DATA.fuente
        };
    }

    // 4. Formatos directos
    if (q.includes('formato') || q.includes('descargar') || q.includes('documento')) {
        let res = `📂 **Formatos institucionales disponibles:**<br><br>`;
        TODOS_LOS_FORMATOS.forEach(f => {
            res += `<a href="${f.url}" class="btn-descarga" download="${f.archivo}">📄 Descargar: ${f.nombre}</a>`;
        });
        return { content: res, source: SAN_DATA.fuente };
    }

    // 5. Búsqueda semántica por conducta — ahora muestra pasos e instancias completas
    const resultados = buscarFolios(q);
    if (resultados.length > 0 && q.length > 4) {
        const paso = detectarPaso(q);
        let html = `<div class="contenedor-respuestas">`;

        resultados.slice(0, 4).forEach((item, index) => {
            const f = item.folio || item;
            const num = f.folio;
            const nivel = item.nivel || f.nivel || (num <= 4 ? 'LEVE' : num <= 52 ? 'MODERADO' : 'GRAVE');

            // All levels now have full instancias
            if (nivel === 'LEVE') {
                const fullFolio = SAN_DATA.nivel_leve.folios.find(lf => lf.folio === num);
                if (fullFolio) {
                    html += renderFolioLeve(fullFolio, paso).replace('<div class="contenedor-respuestas">', '').replace('</div>', '');
                    return;
                }
            } else {
                // Moderada y Grave — use renderFolioSimple with full data
                const allFolios = [...SAN_DATA.nivel_moderado.folios, ...SAN_DATA.nivel_grave.folios];
                const fullFolio = allFolios.find(lf => lf.folio === num);
                if (fullFolio) {
                    html += renderFolioSimple(fullFolio, nivel).replace('<div class="contenedor-respuestas">', '').replace('</div>', '');
                    return;
                }
            }
            // MODERADO / GRAVE
            const formatos = detectarFormatosRelevantes(f.conducta, nivel, f.folio);
            const instanciaLabel = nivel === 'GRAVE' ? SAN_DATA.nivel_grave.instancia : (folio.instancias?.[0]?.instancia || 'Enlace Talento / Enlace Jurídico');
            const accionLabel = nivel === 'GRAVE' ? SAN_DATA.nivel_grave.accion : (folio.instancias?.map(i => i.accion).join(' → ') || 'Llamado escrito → Plan de Mejora → Acta');
            const salida = f.salida_economica || (nivel === 'GRAVE' ? SAN_DATA.nivel_grave.salida_economica : 'Finiquito');

            html += `<details class="tarjeta-sancion">
                <summary>${index + 1}. Folio ${num} — ${nivel}: ${f.conducta.substring(0,60)}...</summary>
                <div class="contenido-sancion">
                <p><b>Conducta:</b> ${f.conducta}</p>
                <p><b>Instancia:</b> ${instanciaLabel}</p>
                <p><b>Acción:</b> ${accionLabel}</p>
                <p><b>Salida Económica:</b> ${salida}</p>`;

            if (formatos.length > 0) {
                html += `<br>`;
                formatos.forEach(fmt => {
                    html += `<a href="${fmt.url}" class="btn-descarga" download="${fmt.archivo}">📄 Descargar: ${fmt.nombre}</a>`;
                });
            }
            html += `</div></details>`;
        });

        html += `</div>`;

        // Si hay múltiples resultados, preguntar si el usuario quiere refinar
        const extraMsg = resultados.length > 1
            ? `\n\n💡 Encontré **${resultados.length}** conductas relacionadas. ¿Quieres ver el detalle de alguna específica? Escribe el número de folio o indica la **vez** (primera, segunda, tercera vez) para ver el formato exacto.`
            : '';

        return {
            content: html + (extraMsg ? `<p style="margin-top:10px;font-size:0.85rem;opacity:0.8;">${extraMsg}</p>` : ''),
            source: SAN_DATA.fuente
        };
    }

    // 6. Fallback
    return {
        content: `Módulo **Matriz de Sanciones** activo.\n\nPuedes:\n- Escribir una conducta: _"llegadas tarde"_, _"uso de recursos"_\n- Consultar un folio: _"Folio 1"_, _"Folio 8"_\n- Indicar el nivel: _"faltas graves"_, _"faltas leves"_\n- Pedir formatos: _"formatos para descarga"_`,
        source: SAN_DATA.fuente
    };
}

// ════════════════════════════════════════════════════════════════════
// MÓDULO: GLOSARIO INSTITUCIONAL
// ════════════════════════════════════════════════════════════════════
export async function handleGLOSARIO(input) {
    const { GLOSARIO, buscarGlosario } = await import('../data/glosario.js');
    const q = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

    // Categorías rápidas
    const catMap = {
        'financiero': ['CAT','PLD','FT','SOFOM','CNBV','CONDUSEF','CFDI','SPEI','SIC','RFC','CURP','SAT','LISR','RECA','ENR'],
        'operativo': ['COCS','ENCI','DAF','EOG','HF','MC','OPR','TH','ESR'],
        'credito': ['DDA','PAR-1','PAR-30','KPI','Bonificación','Ciclo','Garantía Líquida','Individualización','Mesa Directiva','Reestructura','Cobranza Extrajudicial'],
    };

    for (const [cat, terms] of Object.entries(catMap)) {
        if (q.includes(cat)) {
            const entries = GLOSARIO.filter(g => terms.includes(g.term));
            const txt = entries.map(g =>
                `**${g.term}** — _${g.full}_\n${g.def}`
            ).join('\n\n---\n\n');
            return { content: `📖 **Términos ${cat.charAt(0).toUpperCase()+cat.slice(1)}es:**\n\n${txt}`, source: 'Glosario Institucional CONSERVA' };
        }
    }

    // Búsqueda directa
    const results = buscarGlosario(q.length > 1 ? q : input);
    if (!results.length) {
        return {
            content: `No encontré el término **"${input}"** en el glosario.\n\n💡 Prueba con: CAT, PLD, SOFOM, COCS, PAR-1, DDA, ENCI, SPEI, CFDI, RFC, CURP...`,
            source: 'Glosario Institucional',
            botonesTemas: ['Términos Financieros (CAT, PLD, SOFOM)', 'Términos Operativos (COCS, ENCI, DAF)', 'Términos de Crédito (DDA, Ciclo, Bonificación)'],
        };
    }

    const txt = results.slice(0,4).map(g =>
        `**${g.term}** — _${g.full}_\n${g.def}`
    ).join('\n\n---\n\n');

    return {
        content: `📖 **${results.length > 1 ? results.length + ' términos encontrados' : 'Término encontrado'}:**\n\n${txt}`,
        source: 'Glosario Institucional CONSERVA',
        botonesTemas: results.length > 4 ? [`Ver todos (${results.length})`] : [],
    };
}

// ════════════════════════════════════════════════════════════════════
// MÓDULO: CALCULADORA DE CRÉDITO
// ════════════════════════════════════════════════════════════════════
const CALC_PRODUCTS = {
    sol: { nombre: 'Mujeres de Palabra', tasa_mensual: 0.03913, tasa_bon: 0.03413, seguro_semanal: 10.25, tipo: 'semanal', garantia: 0.10, min: 4000, max: 80000 },
    tac: { nombre: 'Conserva T Activa', tasa_mensual: 0.045, seguro_semanal: 13.00, tipo: 'semanal', garantia: 0.10, min: 10000, max: 80000 },
    ind: { nombre: 'Crédito Individual', tasa_mensual: 0.0729, seguro_mensual: 41.00, tipo: 'mensual', garantia: 0.10, min: 50000, max: 500000 },
    hog: { nombre: 'Tu Hogar con CONSERVA', tasa_mensual: 0.0475, seguro_mensual: 52.00, tipo: 'mensual', garantia: 0.10, min: 10000, max: 100000 },
    par: { nombre: 'Crédito Paralelo', tasa_mensual: 0.03913, seguro_semanal: 10.25, tipo: 'semanal', garantia: 0.10, min: 1000, max: 30000 },
};

function calcCuota(monto, tasa_mensual, semanas = null, meses = null) {
    if (semanas) {
        const tasa_semanal = tasa_mensual / 4.33;
        if (tasa_semanal === 0) return monto / semanas;
        return monto * (tasa_semanal * Math.pow(1 + tasa_semanal, semanas)) / (Math.pow(1 + tasa_semanal, semanas) - 1);
    }
    if (meses) {
        if (tasa_mensual === 0) return monto / meses;
        return monto * (tasa_mensual * Math.pow(1 + tasa_mensual, meses)) / (Math.pow(1 + tasa_mensual, meses) - 1);
    }
    return 0;
}

function formatMXN(n) { return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

export async function handleCALC(input, collab) {
    const q = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

    // Detect product
    let prod = null;
    if (/mujeres|solidari|sol\b|palabr/.test(q)) prod = 'sol';
    else if (/t.?activa|tactiva/.test(q)) prod = 'tac';
    else if (/individual|negocio|ind\b/.test(q)) prod = 'ind';
    else if (/hogar|viviend|hog\b/.test(q)) prod = 'hog';
    else if (/paralel|par\b/.test(q)) prod = 'par';

    // Detect monto
    const montoMatch = q.match(/(\d[\d,\.]*)\s*(peso|mxn|mil|k\b)?/);
    let monto = montoMatch ? parseFloat(montoMatch[1].replace(/,/g,'')) : null;
    if (monto && /\bmil\b|\bk\b/.test(q) && monto < 1000) monto *= 1000;

    // Detect plazo
    const semMatch = q.match(/(\d+)\s*semana/);
    const mesMatch = q.match(/(\d+)\s*mes/);
    const semanas = semMatch ? parseInt(semMatch[1]) : null;
    const meses = mesMatch ? parseInt(mesMatch[1]) : null;

    // If not enough data, ask
    if (!prod) {
        return {
            content: `🧮 **Calculadora de Crédito**\n\n¿Para qué producto quieres simular?\n\nEjemplos:\n- _"simular 20000 mujeres de palabra 24 semanas"_\n- _"calcular crédito individual 80000 pesos 12 meses"_\n- _"cuota T Activa 30000 20 semanas"_`,
            source: 'Calculadora CONSERVA',
            botonesTemas: ['Simular Mujeres de Palabra', 'Simular Crédito Individual', 'Simular Conserva T Activa', 'Simular Tu Hogar', 'Simular Crédito Paralelo'],
        };
    }

    const p = CALC_PRODUCTS[prod];

    // Show product info if no monto
    if (!monto) {
        return {
            content: `🧮 **${p.nombre}**\n\n¿Cuánto necesitas y a qué plazo?\n\n- Rango: ${formatMXN(p.min)} a ${formatMXN(p.max)}\n- Tasa: ${(p.tasa_mensual*100).toFixed(3)}% mensual\n\nEscribe algo como: _"${formatMXN(p.min*2).replace('$','').trim()} pesos a ${p.tipo === 'semanal' ? '20 semanas' : '12 meses'}"_`,
            source: 'Calculadora CONSERVA',
        };
    }

    // Validate monto range
    if (monto < p.min || monto > p.max) {
        return { content: `⚠️ Para **${p.nombre}** el rango es de ${formatMXN(p.min)} a ${formatMXN(p.max)}.\nEl monto que indicaste (${formatMXN(monto)}) está fuera del rango.`, source: 'Calculadora CONSERVA' };
    }

    // Default plazo if not given
    const plazoSem = semanas || (p.tipo === 'semanal' ? 24 : null);
    const plazoMes = meses || (p.tipo === 'mensual' ? 12 : null);

    const cuota = calcCuota(monto, p.tasa_mensual, plazoSem, plazoMes);
    const cuota_bon = p.tasa_bon ? calcCuota(monto, p.tasa_bon, plazoSem, plazoMes) : null;
    const total = cuota * (plazoSem || plazoMes);
    const total_bon = cuota_bon ? cuota_bon * (plazoSem || plazoMes) : null;
    const intereses = total - monto;
    const garantia = monto * p.garantia;
    const seguro_total = p.seguro_semanal
        ? p.seguro_semanal * (plazoSem || (plazoMes * 4.33))
        : (p.seguro_mensual || 0) * (plazoMes || Math.round(plazoSem / 4.33));

    let plazoLabel = plazoSem ? `${plazoSem} semanas` : `${plazoMes} meses`;

    let md = `🧮 **Simulación — ${p.nombre}**\n\n`;
    md += `| Concepto | Monto |\n|---|---|\n`;
    md += `| Monto solicitado | ${formatMXN(monto)} |\n`;
    md += `| Plazo | ${plazoLabel} |\n`;
    md += `| Cuota ${p.tipo} | **${formatMXN(cuota)}** |\n`;
    if (cuota_bon) md += `| Cuota con bonificación | **${formatMXN(cuota_bon)}** ⭐ |\n`;
    md += `| Total a pagar | ${formatMXN(total)} |\n`;
    md += `| Total intereses | ${formatMXN(intereses)} |\n`;
    md += `| Seguro de vida (total) | ${formatMXN(seguro_total)} |\n`;
    md += `| Garantía líquida (depósito) | ${formatMXN(garantia)} |\n`;
    md += `\n⚠️ _Simulación estimada. La cuota real puede variar según el análisis de crédito en sucursal._`;

    if (cuota_bon) {
        const ahorro = (total - total_bon);
        md += `\n\n⭐ **Pagando puntual ahorras ${formatMXN(ahorro)} en el ciclo.**`;
    }

    return { content: md, source: `Calculadora CONSERVA — ${p.nombre}` };
}

// ════════════════════════════════════════════════════════════════════
// MÓDULO: REQUISITOS DE CRÉDITO
// ════════════════════════════════════════════════════════════════════
export async function handleREQ(input) {
    const { REQUISITOS_POR_PRODUCTO, COMPARACION_PRODUCTOS } = await import('../data/requisitos_credito.js');
    const q = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

    // Comparar todos
    if (/compar|todos|tabla|cuadro|diferencia|versus|vs\.?/.test(q)) {
        const { headers, rows } = COMPARACION_PRODUCTOS;
        let md = `📊 **Comparativa de Productos de Crédito CONSERVA**\n\n`;
        md += `| ${headers.join(' | ')} |\n`;
        md += `| ${headers.map(() => '---').join(' | ')} |\n`;
        rows.forEach(row => { md += `| ${row.join(' | ')} |\n`; });
        md += `\n_Las tasas no incluyen IVA. Consulta condiciones exactas con tu ejecutivo._`;
        return { content: md, source: 'Requisitos de Crédito — Comparativa', botonesTemas: ['👥 Mujeres de Palabra', '🏪 Crédito Individual', '⚡ Conserva T Activa', '🏠 Tu Hogar con CONSERVA', '➕ Crédito Paralelo'] };
    }

    // Detect product
    let key = null;
    if (/mujeres|solidari|palabr/.test(q)) key = 'MAN_SOL';
    else if (/t.?activa|tactiva/.test(q)) key = 'MAN_TAC';
    else if (/individual|negocio/.test(q)) key = 'MAN_IND';
    else if (/hogar|viviend/.test(q)) key = 'MAN_HOG';
    else if (/paralel/.test(q)) key = 'MAN_PAR';

    if (!key) {
        return {
            content: `📋 **Requisitos de Crédito**\n\nSelecciona el producto que te interesa:`,
            source: 'Requisitos de Crédito',
            botonesTemas: ['👥 Mujeres de Palabra', '🏪 Crédito Individual', '⚡ Conserva T Activa', '🏠 Tu Hogar con CONSERVA', '➕ Crédito Paralelo', '📊 Comparar todos los productos'],
        };
    }

    const r = REQUISITOS_POR_PRODUCTO[key];

    let md = `${r.emoji} **${r.nombre}**\n_${r.resumen}_\n\n`;
    md += `### 💰 Datos del producto\n`;
    md += `- **Montos:** ${formatMXN(r.montos.min)} a ${formatMXN(r.montos.max)}\n`;
    md += `- **Plazos:** ${r.plazos}\n`;
    md += `- **Tasa:** ${r.tasa}\n`;
    md += `- **CAT:** ${r.cat}\n`;
    md += `- **Seguro:** ${r.seguro}\n`;
    md += `- **Garantía:** ${r.garantia}\n\n`;

    md += `### ✅ Requisitos personales\n`;
    r.requisitos_personales.forEach(req => { md += `- ${req}\n`; });

    if (r.requisitos_grupo.length > 0) {
        md += `\n### 👥 Requisitos del grupo\n`;
        r.requisitos_grupo.forEach(req => { md += `- ${req}\n`; });
    }

    md += `\n### 📄 Documentos necesarios\n`;
    r.documentos.forEach(doc => { md += `- ${doc}\n`; });

    if (r.restricciones.length > 0) {
        md += `\n### ⛔ Restricciones\n`;
        r.restricciones.forEach(res => { md += `- ${res}\n`; });
    }

    md += `\n### 📝 Proceso\n${r.proceso}`;
    md += `\n\n### 🏛️ Autorización\n${r.autorizacion}`;

    return {
        content: md,
        source: `Requisitos — ${r.nombre}`,
        botonesTemas: ['📊 Comparar todos los productos', '🧮 Simular cuota de este crédito', 'Volver a Requisitos'],
    };
}
