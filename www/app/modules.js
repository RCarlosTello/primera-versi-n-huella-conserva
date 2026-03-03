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
} from '../data/manuales.js';

// ─── MOD-CON-001 ─────────────────────────────────────────────────────────────
const CON_INFO = {
    mision: `Somos una empresa mexicana; impulsamos procesos formativos de desarrollo y bienestar para nuestros clientes, a través de servicios financieros y no financieros eficientes liderados por colaboradores con vocación de servicio, profesionalismo y alto compromiso social.`,
    vision: `Contribuir a generar un cambio positivo en la vida de las personas.`,
    proposito: `Contribuir al desarrollo de las personas para generar bienestar social.`,
    mantra: `Desarrollo y Bienestar`,
    valores: `Liderazgo, Enfoque a Logros, Compromiso, Lealtad, Colaborador y Formador, Sentido Humano, Resiliencia.`,
    dominio: `@grupoconserva.mx | Sector microfinanciero | CONSERVA SOFOM ENR`,
};

export function handleCON(query) {
    const q = (query || '').toLowerCase();
    let content = '', seccion = 'General';

    if (q.includes('misión') || q.includes('mision')) {
        content = `**Misión de CONSERVA:**\n\n${CON_INFO.mision}`; seccion = 'Misión';
    } else if (q.includes('visión') || q.includes('vision')) {
        content = `**Visión de CONSERVA:**\n\n${CON_INFO.vision}`; seccion = 'Visión';
    } else if (q.includes('propósito') || q.includes('proposito')) {
        content = `**Propósito de CONSERVA:**\n\n${CON_INFO.proposito}`; seccion = 'Propósito';
    } else if (q.includes('mantra')) {
        content = `**Mantra de CONSERVA:** ${CON_INFO.mantra}`; seccion = 'Mantra';
    } else if (q.includes('valor') || q.includes('principio')) {
        content = `**Valores de CONSERVA:**\n\n${CON_INFO.valores}`; seccion = 'Valores';
    } else if (q.includes('correo') || q.includes('dominio') || q.includes('empresa')) {
        content = `**Dominio institucional:** ${CON_INFO.dominio}`; seccion = 'Estructura';
    } else {
        content = `**Conócenos — Grupo CONSERVA**\n\n**Propósito:** ${CON_INFO.proposito}\n\n**Misión:** ${CON_INFO.mision}\n\n**Visión:** ${CON_INFO.vision}\n\n**Mantra:** ${CON_INFO.mantra}\n\n**Valores:** ${CON_INFO.valores}`;
        seccion = 'Información General';
    }
    return { content, source: `MOD-CON-001 — ${seccion}` };
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

/** Lista de líneas INCLUYENDO Caja Chica (para búsqueda interna, no para el menú) */
const ALL_LINEAS = [
    ...MAN_LINEAS,
    { id: 'MAN_CAJ', label: 'Caja Chica' },
];

/** Paso 1 del Modo Guiado: pregunta qué línea desea consultar. */
export function handleMANLineasPrompt() {
    const opts = MAN_LINEAS.map((l, i) => `**${i + 1}.** ${l.label}`).join('\n');
    return {
        content: `Para darte información precisa del manual oficial, indícame sobre cuál línea deseas consultar:\n\n${opts}\n\nEscribe el **número** o el **nombre** de la línea.`,
        source: null,
        needsLinea: true,
    };
}

/** Paso 2 del Modo Guiado: muestra temas disponibles para ese manual. */
export function handleMANTemasPrompt(linea) {
    const data = MAN_DATA[linea.id];
    if (!data) return { content: `Manual no encontrado para la línea seleccionada.`, source: null };

    return {
        content: `Consultando el **${data.nombre}**. ¿Sobre qué tema deseas información?`,
        source: data.fuente,
        needsTema: true,
        botonesTemas: [...data.temas, 'Regresar a Menú Principal'],
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
            const linea = MAN_LINEAS.find(l => l.id === id);
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
export function handleMAN(query, linea) {
    const data = MAN_DATA[linea?.id];
    if (!data) {
        return {
            content: `No se encontró información para la línea seleccionada. Verifica la selección e intenta de nuevo.`,
            source: null,
        };
    }

    const q = (query || '').toLowerCase();

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

    // ── RESPUESTA GENERAL con temas disponibles ───────────────────────────────
    return {
        content: `Consultando **${data.nombre}**. ¿Sobre qué tema deseas información?`,
        source: data.fuente,
        botonesTemas: [...data.temas, 'Regresar a Menú Principal'],
    };
}

// ── Funciones de respuesta por tema ──────────────────────────────────────────

function _respMontos(data) {
    const m = data.montos;
    if (!m) return { content: `Leí el documento **${data.nombre}**, pero no encontré datos específicos sobre montos.`, source: data.fuente };

    let txt = `He revisado la información dentro de **${data.nombre}** sobre los montos de crédito permitidos:\n\n`;

    if (m.min !== undefined) txt += `- **Monto mínimo:** $${m.min.toLocaleString('es-MX')}.00\n`;
    if (m.min_cintalapa !== undefined) txt += `  - *Excepción para Cintalapa:* $${m.min_cintalapa.toLocaleString('es-MX')}.00\n`;
    if (m.max !== undefined) txt += `- **Monto máximo:** $${m.max.toLocaleString('es-MX')}.00\n`;
    if (m.primer_ciclo_max !== undefined) txt += `- **Monto máximo en primer ciclo:** $${m.primer_ciclo_max.toLocaleString('es-MX')}.00\n`;
    if (m.primer_credito_max !== undefined) txt += `- **Monto máximo en primer crédito:** $${m.primer_credito_max.toLocaleString('es-MX')}.00\n`;
    if (m.capacidad_pago_max_pct !== undefined) txt += `- **Límite sobre capacidad de pago:** No debe exceder el ${m.capacidad_pago_max_pct}% de la capacidad de pago del solicitante.\n`;
    if (m.nota) txt += `\n📝 ${m.nota}`;

    return { content: txt, source: data.fuente };
}

function _respPlazos(data) {
    const p = data.plazos;
    if (!p) return { content: `Leí el documento **${data.nombre}**, pero no encontré datos específicos sobre plazos.`, source: data.fuente };

    let txt = `De acuerdo al documento **${data.nombre}**, estas son las reglas para los plazos del crédito:\n\n${p.texto}`;
    if (data.tasas?.plazos_tabla) {
        txt += '\n\n' + data.tasas.plazos_tabla.map(r => `- Hasta $${r.hasta.toLocaleString('es-MX')}: ${r.plazos}`).join('\n');
    }
    return { content: txt, source: data.fuente };
}

function _respTasas(data) {
    const t = data.tasas;
    if (!t) return { content: `Leí el documento **${data.nombre}**, pero no encontré datos específicos sobre tasas e intereses.`, source: data.fuente };

    let txt = `Al consultar el documento **${data.nombre}**, encontré la siguiente información sobre tasas, intereses y bonificaciones:\n\n`;

    if (t.mensual_con_iva) txt += `- **Tasa global mensual (+ IVA):** ${t.mensual_con_iva}\n`;
    if (t.anual_con_iva) txt += `- **Tasa anual (+ IVA):** ${t.anual_con_iva}\n`;
    if (t.global_mensual) txt += `- **Tasa global mensual:** ${t.global_mensual}\n`;
    if (t.anual) txt += `- **Tasa anual:** ${t.anual}\n`;
    if (t.cat) txt += `- **CAT (informativo, sin IVA):** ${t.cat}\n`;
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

    let txt = `He encontrado la siguiente información de la sección de Requisitos dentro de **${data.nombre}**:\n\n`;

    if (r.documentos?.length) {
        txt += `**Documentos requeridos:**\n${r.documentos.map(d => `- ${d}`).join('\n')}\n\n`;
    }
    if (r.garantia_liquida) txt += `- **Garantía líquida:** ${r.garantia_liquida}\n`;
    if (r.edad) txt += `- **Edad:** ${r.edad}\n`;
    if (r.antigüedad_domicilio) txt += `- **Antigüedad de domicilio:** ${r.antigüedad_domicilio}\n`;
    if (r.obligado_solidario) txt += `- **Obligado solidario:** ${r.obligado_solidario}\n`;
    if (r.historial) txt += `- **Historial crediticio:** ${r.historial}\n`;
    if (r.ventana_solicitud) txt += `- **Ventana de solicitud:** ${r.ventana_solicitud}\n`;
    if (r.restricciones) txt += `\n⚠️ **Restricciones:** ${r.restricciones}`;

    return { content: txt, source: data.fuente };
}

function _respGarantias(data) {
    const g = data.garantias;
    if (!g) return { content: `Leí el documento **${data.nombre}**, pero no encontré información sobre garantías.`, source: data.fuente };

    return {
        content: `Claro. Según el documento **${data.nombre}**, las garantías son:\n\n💬 ${g}`,
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

/** Detecta ciudad/destino mencionado en la query. */
function detectDestino(query) {
    const q = (query || '').toLowerCase();
    for (const [keyword, clave] of Object.entries(VIA_DESTINOS_MAP)) {
        if (q.includes(keyword)) return clave;
    }
    return null;
}

export function handleVIA(query, collaborator) {
    const q = (query || '').toLowerCase();
    const puesto = collaborator?.puesto || '';
    const grupo = getGrupoVIA(puesto);
    const tipoNomina = getTipoNomina(puesto);
    const grupoLabel = { A: 'A — Promotor/Analista/Coordinador/Gerente de Sucursal', B: 'B — Gerente Regional/Subdirector/Director', C: 'C — Subdirección General/Dirección General/Consejo' };
    const destino = detectDestino(q);

    let respuestas = [];
    let fuentes = new Set();

    // ── HOSPEDAJE ─────────────────────────────────────────────────────────────
    if (q.includes('hospedaje') || q.includes('hotel') || q.includes('alojamiento') || q.includes('noche')) {
        fuentes.add(`MOD-VIA-006 MANUAL_VIATICOS — Anexo 1: Tabla de hospedaje`);
        if (destino) {
            const monto = VIA_HOSPEDAJE[destino]?.[grupo];
            if (monto) {
                respuestas.push(`**Hospedaje en ${destino.toUpperCase()}:** Tope de **$${monto.toLocaleString('es-MX')}.00 por noche**.`);
            }
        } else {
            const filas = Object.entries(VIA_HOSPEDAJE)
                .map(([ciudad, vals]) => `- **${ciudad.toUpperCase()}:** A: $${vals.A} | B: $${vals.B} | C: $${vals.C}`)
                .join('\n');
            respuestas.push(`**Topes de hospedaje por noche (MXN):**\n${filas}`);
        }
    }

    // ── ALIMENTOS ─────────────────────────────────────────────────────────────
    if (q.includes('alimento') || q.includes('comida') || q.includes('desayuno') || q.includes('cena') || q.includes('comer')) {
        const monto = VIA_ALIMENTOS[grupo]?.[tipoNomina];
        fuentes.add(`MOD-VIA-006 MANUAL_VIATICOS — Anexo 2: Tabla de alimentos`);
        respuestas.push(`**Alimentos:** Tope de **$${monto}.00 por alimento** (desayuno, comida o cena). ${tipoNomina === 'EOG' ? 'Recuerda que para EOG no se requiere factura.' : ''}`);
    }

    // ── VIÁTICOS INTERNACIONALES ──────────────────────────────────────────────
    if (q.includes('internacional') || q.includes('extranjero') || q.includes('usd') || q.includes('dólar')) {
        fuentes.add(`MOD-VIA-006 MANUAL_VIATICOS — Viáticos Internacionales`);
        respuestas.push(`**Viáticos internacionales:** **$${VIA_INTERNACIONAL.por_dia_usd} USD por día** para alimentación y transportes locales.\n*Nota:* ${VIA_INTERNACIONAL.nota}`);
    }

    // ── SOLICITUD ─────────────────────────────────────────────────────────────
    if (q.includes('solicitar') || q.includes('pedir') || q.includes('anticipación') || q.includes('anticipo') || q.includes('solicitud')) {
        fuentes.add(`MOD-VIA-006 MANUAL_VIATICOS — Políticas de solicitud`);
        respuestas.push(`**Solicitud:** ${VIA_POLITICAS.anticipacion} Autoriza tu jefe inmediato por correo. \n${VIA_POLITICAS.transporte_aereo}`);
    }

    // ── COMPROBACIÓN ──────────────────────────────────────────────────────────
    let adjuntarPlantilla = false;
    if (q.includes('comprobar') || q.includes('comprobación') || q.includes('comprobacion') ||
        q.includes('factura') || q.includes('ticket') || q.includes('comprobante') ||
        q.includes('gasto') || q.includes('plantilla')) {
        fuentes.add(`MOD-VIA-006 MANUAL_VIATICOS — Comprobación de viáticos`);
        respuestas.push(`**Comprobación:** ${VIA_POLITICAS.comprobacion_plazo} Se requieren facturas PDF y XML.\n*Nota:* ${VIA_POLITICAS.gastos_no_validos}`);
        adjuntarPlantilla = true;
    }

    // ── TRANSPORTE ────────────────────────────────────────────────────────────
    if (q.includes('transporte') || q.includes('vuelo') || q.includes('avión') || q.includes('autobús') || q.includes('traslado')) {
        fuentes.add(`MOD-VIA-006 MANUAL_VIATICOS — Transporte`);
        respuestas.push(`**Transporte:** < 500 km terrestre obligatorio. > 500 km aplica avión con autorización. Clase: Económica/Turista.`);
    }

    // ── SI ENCONTRÓ TEMAS ─────────────────────────────────────────────────────
    if (respuestas.length > 0) {
        let content = `He revisado la Política de Viáticos aplicable a tu puesto (*${puesto || 'No especificado'}*, Grupo **${grupo}**, nómina **${tipoNomina}**):\n\n`;
        content += respuestas.join('\n\n---\n\n');
        content += '\n\n📝 *¿Deseas conocer detalles sobre algún otro concepto de viáticos?*';

        const result = { content, source: Array.from(fuentes).join(' | ') };
        if (adjuntarPlantilla) {
            result.adjunto = {
                nombre: 'Plantilla de Gastos.xlsm',
                url: '/plantilla de gastos.xlsm',
                descripcion: 'Formato oficial de comprobación de viáticos — Grupo CONSERVA',
            };
        }
        return result;
    }

    // ── RESPUESTA GENERAL O RESUMEN POR DEFECTO ────────────────────────────────
    const hospTuGrupo = Object.entries(VIA_HOSPEDAJE)
        .map(([ciudad, vals]) => `- ${ciudad.toUpperCase()}: $${vals[grupo]}`)
        .join('\n');
    const alimentosMonto = VIA_ALIMENTOS[grupo]?.[tipoNomina];

    return {
        content: `He verificado la matriz de viáticos. Resumen para **Grupo ${grupo}** (**${tipoNomina}**):\n\n**Hospedaje por noche:**\n${hospTuGrupo}\n\n**Alimentos:** $${alimentosMonto}.00 (por comida)\n\n¿Quieres información sobre hospedaje en un lugar específico, avión, solicitud o comprobación?`,
        source: `MOD-VIA-006 MANUAL_VIATICOS — Anexo 1 y 2`,
    };
}
