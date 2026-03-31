/**
 * manuales.js — Datos reales extraídos de los manuales institucionales de CONSERVA.
 * Módulos: MAN (crédito) y VIA (viáticos).
 * Uso: Importado por modules.js para responder con información exacta, no genérica.
 */

// ─── VIÁTICOS ────────────────────────────────────────────────────────────────

/** Grupos de puesto para viáticos. */
export const VIA_GRUPOS = {
    A: ['promotor', 'analista', 'coordinador', 'gerente de sucursal'],
    B: ['gerente regional', 'subdirector', 'director'],
    C: ['subdirección general', 'dirección general', 'consejo', 'presidencia'],
};

/** Topes de hospedaje por noche (MXN). Fuente: MANUAL_VIATICOS.md — Anexo 1. */
export const VIA_HOSPEDAJE = {
    chiapas: { A: 900, B: 1400, C: 1600 },
    tabasco: { A: 1100, B: 1300, C: 1600 },
    merida: { A: 1150, B: 1400, C: 1900 },
    puebla: { A: 1400, B: 1700, C: 2000 },
    cdmx: { A: 1400, B: 1400, C: 2300 },
    'estado de mexico': { A: 900, B: 1200, C: 1500 },
};

/** Mapa de texto → clave de destino. */
export const VIA_DESTINOS_MAP = {
    // Chiapas
    chiapas: 'chiapas', tuxtla: 'chiapas', 'san cristobal': 'chiapas', 'san cristóbal': 'chiapas',
    tapachula: 'chiapas', tonala: 'chiapas', 'tonalá': 'chiapas', oriente: 'chiapas',
    palenque: 'chiapas', comitan: 'chiapas', 'comitán': 'chiapas',
    // Tabasco
    tabasco: 'tabasco', villahermosa: 'tabasco', cardenas: 'tabasco', 'cárdenas': 'tabasco',
    comalcalco: 'tabasco', macuspana: 'tabasco', tenosique: 'tabasco',
    // Merida
    merida: 'merida', mérida: 'merida', yucatan: 'merida', 'yucatán': 'merida',
    valladolid: 'merida', tizimin: 'merida', 'tizimín': 'merida', progreso: 'merida',
    // Puebla
    puebla: 'puebla', cholula: 'puebla', tehuacan: 'puebla', 'tehuacán': 'puebla',
    atlixco: 'puebla', texmelucan: 'puebla', amozoc: 'puebla',
    // CDMX
    cdmx: 'cdmx', df: 'cdmx', 'ciudad de mexico': 'cdmx', 'ciudad de méxico': 'cdmx',
    iztapalapa: 'cdmx', coyoacan: 'cdmx', 'coyoacán': 'cdmx', xochimilco: 'cdmx',
    // Edo Mex
    'estado de mexico': 'estado de mexico', 'estado de méxico': 'estado de mexico', edomex: 'estado de mexico',
    ixtlahuca: 'estado de mexico', toluca: 'estado de mexico', metepec: 'estado de mexico',
    naucalpan: 'estado de mexico', tlalnepantla: 'estado de mexico', ecatepec: 'estado de mexico',
};

/** Topes por alimento (desayuno/comida/cena). Fuente: MANUAL_VIATICOS.md — Anexo 2. */
export const VIA_ALIMENTOS = {
    A: { SOFOM: 200, EOG: 180 },
    B: { SOFOM: 250, EOG: 200 },
    C: { SOFOM: 300, EOG: 300 },
};

/** Viáticos internacionales. */
export const VIA_INTERNACIONAL = {
    por_dia_usd: 60,
    nota: '$60.00 USD por día para alimentación y transportes locales. Rendidos con notas/tickets conforme al Art. 28 LISR.',
};

/** Políticas clave de viáticos. */
export const VIA_POLITICAS = {
    anticipacion: 'Mínimo 2 días hábiles antes del viaje, antes de las 10:00 AM.',
    transporte_aereo: 'Para destinos >500 km se puede solicitar avión con 15 días hábiles de anticipación.',
    distancia_alimentos: 'No se reembolsan alimentos dentro de los primeros 50 km desde la ciudad de origen.',
    pago_max_efectivo: 'Hospedaje o boletos de autobús en efectivo: máximo $1,999.00.',
    comprobacion_plazo: 'Máximo 2 días hábiles después de regresar. Si no se envía, se descuenta vía nómina.',
    gastos_no_validos: 'No se aceptan: artículos personales, bebidas alcohólicas, comprobantes con más de 30 días de antigüedad.',
    devolucion_cancelacion: 'En cancelación de viaje, devolver el importe total en máximo 2 días hábiles.',
};

/** Distancias aproximadas entre regiones (puntos clave). Fuente: Logística Conserva. */
export const VIA_DISTANCIAS = {
    merida: { tabasco: 540, chiapas: 1045, puebla: 1160, cdmx: 1300, edomex: 1350 },
    tabasco: { merida: 540, chiapas: 300, puebla: 630, cdmx: 750, edomex: 810 },
    chiapas: { merida: 1045, tabasco: 300, puebla: 715, cdmx: 840, edomex: 860 },
    puebla: { merida: 1160, tabasco: 630, chiapas: 715, cdmx: 130, edomex: 180 },
    cdmx: { merida: 1300, tabasco: 750, chiapas: 840, puebla: 130, edomex: 65 },
    edomex: { merida: 1350, tabasco: 810, chiapas: 860, puebla: 180, cdmx: 65 },
};

/**
 * Distancias aproximadas (km) entre ciudades clave de la red CONSERVA.
 * Usado para determinar: si aplican alimentos, si aplica vuelo, si es viaje local.
 * Reglas del manual:
 *  - < 50 km:  no aplican alimentos (viaje local de ida y vuelta)
 *  - > 500 km: se puede solicitar vuelo (requiere 15 días hábiles anticipación)
 */
export const VIA_KM_CIUDADES = {
    // origen_destino en formato "ciudad1|ciudad2" (siempre min→max alfabético)
    // Tabasco ↔ Tabasco
    'villahermosa|cardenas':        57,
    'villahermosa|cunduacan':       65,
    'villahermosa|teapa':           68,
    'villahermosa|huimanguillo':    112,
    'villahermosa|emiliano zapata': 127,
    // Tabasco ↔ Chiapas
    'villahermosa|bochil':          195,
    'villahermosa|chiapa de corzo': 250,
    'villahermosa|tuxtla gutierrez':260,
    'villahermosa|comitan':         370,
    'villahermosa|tapachula':       520,
    'villahermosa|cintalapa':       310,
    'villahermosa|villaflores':     310,
    'villahermosa|tonala':          340,
    'cardenas|bochil':              280,
    'cardenas|tuxtla gutierrez':    290,
    // Tabasco ↔ Yucatán
    'villahermosa|merida':          590,
    'cardenas|merida':              640,
    // Tabasco ↔ Puebla / CDMX
    'villahermosa|puebla':          680,
    'villahermosa|cdmx':            760,
    'villahermosa|cholula':         690,
    'villahermosa|toluca':          800,
    // Chiapas ↔ Chiapas
    'tuxtla gutierrez|bochil':      90,
    'tuxtla gutierrez|chiapa de corzo': 15,
    'tuxtla gutierrez|comitan':     150,
    'tuxtla gutierrez|tapachula':   285,
    'tuxtla gutierrez|cintalapa':   95,
    'tuxtla gutierrez|villaflores': 94,
    'tuxtla gutierrez|tonala':      135,
    'tapachula|comitan':            320,
    'tapachula|bochil':             340,
    // Chiapas ↔ Yucatán
    'tuxtla gutierrez|merida':      870,
    'tapachula|merida':             1100,
    // Chiapas ↔ Puebla / CDMX
    'tuxtla gutierrez|puebla':      735,
    'tuxtla gutierrez|cdmx':        840,
    'tapachula|cdmx':               1040,
    'tapachula|puebla':             940,
    // Yucatán ↔ Puebla / CDMX
    'merida|puebla':                1150,
    'merida|cdmx':                  1300,
    'merida|cholula':               1160,
    'merida|campeche':              160,
    // Puebla ↔ CDMX
    'cdmx|puebla':                  130,
    'cdmx|cholula':                 140,
    'cdmx|toluca':                  65,
    'cholula|puebla':               10,
};

/**
 * Obtiene km entre dos ciudades (normaliza nombre y busca en ambas direcciones).
 * @param {string} origen - ciudad origen (ej: "Villahermosa")
 * @param {string} destino - ciudad destino (ej: "Mérida")
 * @returns {number|null} km aproximados o null si no está en tabla
 */
export function getDistanciaKm(origen, destino) {
    function n(s) {
        return (s || '').toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
            .replace(/[^\w\s]/g,' ').trim();
    }
    const o = n(origen), d = n(destino);
    if (o === d) return 0;
    const key1 = `${o}|${d}`;
    const key2 = `${d}|${o}`;
    return VIA_KM_CIUDADES[key1] ?? VIA_KM_CIUDADES[key2] ?? null;
}

/**
 * Determina si aplican viáticos según origen/destino.
 * @returns {object} { aplica, motivo, vuelo, km }
 */
export function evaluarViaticos(ciudadOrigen, ciudadDestino) {
    const km = getDistanciaKm(ciudadOrigen, ciudadDestino);
    if (km === 0 || ciudadOrigen.toLowerCase() === ciudadDestino.toLowerCase()) {
        return { aplica: false, motivo: 'misma_ciudad', km: 0,
            mensaje: '⚠️ El destino es la misma ciudad de origen. No aplican viáticos según la política de CONSERVA.' };
    }
    if (km !== null && km < 50) {
        return { aplica: false, motivo: 'distancia_corta', km,
            mensaje: `⚠️ La distancia es de aproximadamente ${km} km. Por ser viaje de ida y vuelta el mismo día (< 50 km), no aplican alimentos según política.` };
    }
    if (km !== null && km > 500) {
        return { aplica: true, motivo: 'vuelo_posible', km, vuelo: true,
            mensaje: `✅ Distancia aproximada: **${km} km**. Aplican viáticos completos y puedes solicitar **vuelo** (con 15 días hábiles de anticipación).` };
    }
    return { aplica: true, motivo: 'terrestre', km,
        mensaje: km ? `✅ Distancia aproximada: **${km} km**. Aplican viáticos. Transporte terrestre recomendado.` : '✅ Aplican viáticos para este destino.' };
}


/** Mapeo de ubicación (sucursal/área) a región base. */
export const VIA_UBICACION_MAP = {
    'merida': 'merida', 'mérida': 'merida', 'yucatán': 'merida', 'yucatan': 'merida',
    'tabasco': 'tabasco', 'villahermosa': 'tabasco', 'chontalpa': 'tabasco', 'cardenas': 'tabasco', 'huimanguillo': 'tabasco', 'cunduacan': 'tabasco', 'teapa': 'tabasco', 'humberto': 'tabasco',
    'chiapas': 'chiapas', 'tuxtla': 'chiapas', 'comitan': 'chiapas', 'tapachula': 'chiapas', 'bochil': 'chiapas', 'tonala': 'chiapas', 'villaflores': 'chiapas', 'teran': 'chiapas', 'sur oriente': 'chiapas', 'oriente': 'chiapas', 'centro': 'chiapas',
    'puebla': 'puebla', 'cholula': 'puebla',
    'mexico': 'edomex', 'méxico': 'edomex', 'edomex': 'edomex', 'toluca': 'edomex',
    'direccion': 'cdmx', 'corporativo': 'cdmx', 'consejo': 'cdmx', 'presidencia': 'cdmx', 'marketing': 'cdmx', 'ti': 'cdmx', 'riesgos': 'cdmx', 'juridica': 'cdmx', 'finanzas': 'cdmx', 'administracion': 'cdmx',
};

// ─── CRÉDITO (MAN) ───────────────────────────────────────────────────────────

export const MAN_DATA = {

    // ── MUJERES DE PALABRA ───────────────────────────────────────────────────
    MAN_SOL: {
        nombre: 'Manual de Crédito Mujeres de Palabra / Crédito Solidario',
        descripcion: 'Crédito grupal diseñado para mujeres con actividad productiva. Fomenta el crecimiento mutuo mediante la responsabilidad solidaria.',
        fuente: 'MAN-SOL Manual de Crédito Mujeres de Palabra — Catálogo de Producto',
        temas: ['Montos mínimo y máximo', 'Plazos disponibles (16/20/24 sem)', 'Tasas e intereses', 'Bonificación por pago puntual', 'Integrantes del grupo (mín/máx)', 'Requisitos de ingreso', 'Garantía líquida (10%)', 'Seguro de vida ($10.25/sem)', 'Cobranza y mora (DDA)', 'Renovación de crédito', 'Reestructura e individualización', 'CAT y costo total', 'Comités y autorizaciones (COCS)'],
        montos: {
            min: 4000,
            min_cintalapa: 3000,
            max: 80000,
            nota: 'El monto mínimo general es $4,000.00 (excepción Cintalapa: $3,000.00). El monto máximo general es $80,000.00.',
        },
        plazos: {
            texto: '16, 20 o 24 semanas según la región. Reestructuras hasta 8 meses (semanal, quincenal o mensual).',
            semanas: [16, 20, 24],
        },
        tasas: {
            moratoria_texto: '10% de la ficha total por cada día de atraso. Para faltantes menores al 10% de la ficha: $100.00 por día.',
            global_mensual: 'Sin bonificación: 3.913% mensual. Con bonificación: 3.413% mensual.',
            bonificacion: {
                ciclos_1_5: '0.5%',
                ciclos_6_9: '0.75%',
                ciclos_10_mas: 'Hasta 1.0% (congelada a sep 2022 según ciclo alcanzado)',
                reingreso: '0.5% sin importar ciclaje anterior',
                nota: 'No aplica bonificación si hay DDA o intereses moratorios pendientes.',
            },
        },
        grupo: {
            min_integrantes: 5,
            max_integrantes: 25,
            tipo_solicitante: 'Personas físicas mexicanas, sexo femenino, mayores de 18 años.',
            region_puebla: {
                min_integrantes: 5,
                max_integrantes: 25,
                mixtos: 'Hasta 20% varones si hay al menos 8 mujeres.',
            },
            familiaridad: 'Máximo 50% de familiares en el grupo. Máximo 30% viviendo en el mismo domicilio.',
            mesa_directiva: 'Obligatoria. Roles rotan anualmente. No pueden ser familiares ni cohabitar.',
            nota_monto: 'Un cliente con historial previo en CONSERVA no puede recibir más del triple del monto mayor de las clientes nuevas del grupo.',
        },
        requisitos: {
            documentos: [
                'Credencial INE/IFE vigente (única identificación aceptada para el alta)',
                'Comprobante de domicilio vigente (máx. 3 meses)',
                'RFC (opcional, para exención de IVA de intereses)',
            ],
            garantia_liquida: '10% del monto solicitado, depositado en cuenta bancaria de CONSERVA antes del desembolso.',
            edad: 'Mayores de 18 años.',
            restricciones: 'No se aceptan: Lic. en Derecho o sus cónyuges, líderes políticos, personas que laboren para otras financieras.',
        },
        garantias: 'Garantía líquida del 10% del monto solicitado + responsabilidad solidaria del grupo.',
        seguro_vida: {
            monto: '$10.25 por semana por cliente (con IVA).',
            edad_aceptacion: '18 a 89 años cumplidos.',
            suma_asegurada: '$40,000.00 total por fallecimiento. $35,000.00 al beneficiario + $5,000.00 gastos administrativos CONSERVA.',
            vigencia: 'Misma que el contrato de crédito. No cancelable ni reembolsable.',
        },
        autorizacion: {
            hasta_50000: 'Coordinación, Gerencia Regional y Subdirección Divisional.',
            de_50001_adelante: 'Comité de Crédito Central.',
            cocs: 'Requerido cuando el monto grupal total supere $200,000.00.',
        },
    },

    // ── CONSERVA T ACTIVA ────────────────────────────────────────────────────
    MAN_TAC: {
        nombre: 'Manual de Crédito Conserva T Activa',
        descripcion: 'Crédito solidario para grupos pequeños (2-5 integrantes). Ideal para impulsar negocios mediante el apoyo conjunto de manera ágil.',
        fuente: 'MAN-TAC Manual de Crédito T Activa — Catálogo de Producto',
        temas: ['Montos mínimo y máximo', 'Plazos y periodicidad de pago', 'Tasas (4.5% mensual)', 'Bonificación (0.5% desde 1er ciclo)', 'Integrantes del grupo (2-5)', 'Requisitos personales y de negocio', 'Garantía líquida', 'Seguro de vida ($13.00/sem)', 'Renovación y reingreso', 'Semaforización y riesgo de cartera', 'Tasa preferencial (requisitos)'],
        montos: {
            min: 10000,
            max: 80000,
            nota: 'Límites generales de $10,000.00 a $80,000.00. El monto depende del ciclo, historial y capacidad de pago.',
        },
        plazos: {
            texto: 'De 4 a 9 meses (16 a 36 semanas). Semanal, catorcenal o mensual. Reestructuras hasta 8 meses.',
        },
        tasas: {
            global_mensual: '4.5%',
            cat: '165.1%',
            moratoria_texto: '10% de la ficha total por día de atraso.',
            bonificacion: { nota: '0.5% desde el 1er ciclo para grupos de 3+ integrantes con pago puntual.' }
        },
        grupo: {
            min_integrantes: 2,
            max_integrantes: 5,
            tipo_solicitante: 'Grupos solidarios con actividad productiva lícita.',
            nota: 'Grupos de 2 a 5 integrantes. Más pequeño que Mujeres de Palabra.',
        },
        requisitos: {
            documentos: ['Credencial INE/IFE vigente', 'Comprobante de domicilio'],
            garantia_liquida: '10% del monto solicitado.',
        },
        garantias: 'Garantía líquida del 10% + responsabilidad solidaria del grupo.',
        seguro_vida: { edad_aceptacion: '20 a 89 años cumplidos.', nota: 'Cuota semanal individual de $13.00 con IVA. Suma asegurada: $35,000.', vigencia: 'Mientras el crédito esté vigente.' },
    },

    // ── CRÉDITO INDIVIDUAL ──────────────────────────────────────────────────
    MAN_IND: {
        nombre: 'Manual de Crédito Individual (Tu Negocio con CONSERVA)',
        descripcion: 'Financiamiento directo para personas con actividades productivas comprobables, orientado al crecimiento y mejora de negocios en marcha.',
        fuente: 'MAN-IND Manual de Crédito Individual — Catálogo de Producto',
        temas: ['Montos ($50k-$500k)', 'Plazos (4 a 24 meses)', 'Tasas (7.29% mensual)', 'Requisitos del negocio (12 meses)', 'Garantías (prendaria/aval)', 'Seguro de vida', 'Cobranza y gestión de mora', 'Desembolso y entrega de recursos', 'Renovación y graduación', 'Verificación ocular', 'Mesa de Control (MC)'],
        montos: {
            min: 50000,
            max: 500000,
            nota: 'Límites generales: Desde $ 50,000.00 hasta $500,000.00. Tu negocio con conserva / opción de financiamiento de fácil acceso para personas con actividades productivas, destinado para el mejoramiento y crecimiento de negocios en marcha.',
        },
        plazos: { texto: 'Sistema: Huella Conserva Asistente Institucional | v1.0 | 2026 | Activo\n📍 MAN\n\nDe acuerdo al documento Manual de Crédito Individual (Tu Negocio con CONSERVA), estas son las reglas para los plazos del crédito:\n\nHasta 12 meses en reestructura. Pagos semanales, quincenales o mensuales.' },
        tasas: { moratoria_texto: 'La cantidad resultante de multiplicar la tasa ordinaria x 2.', global_mensual: '7.29% para créditos de $50,000 a $100,000.' },
        grupo: {
            tipo_solicitante: 'Persona física con actividad productiva lícita (fijo, semifijo o ambulante). Crédito INDIVIDUAL, no grupal.',
        },
        requisitos: {
            documentos: [
                'Credencial INE/IFE vigente',
                'Comprobante de domicilio (máx. 3 meses)',
                'CURP vigente',
                'RFC con homoclave (sin excepción)',
                'Mínimo 2 referencias personales no familiares',
                'Comprobante de ingresos o estudio socioeconómico',
            ],
            garantia_liquida: 'Aplica según análisis de riesgo.',
            edad: '18 años en adelante.',
            antigüedad_domicilio: 'Mínimo 24 meses de residencia comprobable.',
        },
        garantias: 'Garantía líquida + Aval o garantía prendaria (toda garantía prendaria deberá cubrir relación 1 a 1.5).',
        seguro_vida: { edad_aceptacion: '18 a 89 años.', nota: 'Incluido en la colocación.' },
    },

    // ── TU HOGAR ─────────────────────────────────────────────────────────────
    MAN_HOG: {
        nombre: 'Manual de Crédito Tu Hogar con CONSERVA',
        descripcion: 'Crédito individual destinado a facilitar la ampliación, mejora, remodelación o rehabilitación de vivienda para trabajadores o emprendedores.',
        fuente: 'MAN-HOG Manual de Crédito Tu Hogar — Catálogo de Producto',
        temas: ['Montos', 'Plazos', 'Tasas e intereses', 'Requisitos', 'Garantías', 'Destino del crédito', 'Comprobación del uso'],
        montos: {
            min: 10000,
            max: 100000,
            nota: 'Desde $10,000.00 hasta $100,000.00. El primer crédito puede ser hasta $100,000.00 según capacidad de pago.',
        },
        plazos: {
            texto: 'Hasta $70,000: 6, 12, 18, 24 y 36 meses. Hasta $100,000: 6, 12, 18, 24, 36, 42 y 48 meses. Sin penalización por pago anticipado.',
        },
        tasas: {
            mensual_con_iva: '4.75% mensual',
            anual_con_iva: '57% anual',
            cat: '91.0% (ejemplo $50,000 a 24 meses, sin IVA)',
            moratoria_texto: 'Tasa ordinaria × 2',
            iva: '16%',
            seguro: '$52.00 mensual (pagado antes del desembolso).',
        },
        grupo: {
            tipo_solicitante: 'Personas asalariadas o con actividad productiva comprobable. Crédito INDIVIDUAL, no grupal.',
        },
        requisitos: {
            documentos: [
                'Credencial INE/IFE vigente',
                'Comprobante de domicilio (máx. 3 meses)',
                'CURP vigente en RENAPO',
                'RFC con homoclave (sin excepción)',
                'Comprobante de ingresos',
                'Documento de comprobación de dominio sobre el inmueble a mejorar',
            ],
            garantia_liquida: '10% del monto desembolsado.',
            obligado_solidario: 'Obligatorio en todos los casos (preferiblemente cónyuge).',
            edad: '18 a 70 años.',
            antigüedad_domicilio: 'Mínimo 24 meses de residencia comprobable.',
        },
        garantias: 'Garantía líquida 10% + Aval o garantía prendaria. De $10k a $50k: vehículo ≤15 años o aval. De $50k a $100k: vehículo ≤10 años o garantía hipotecaria.',
        destino: 'Ampliar, mejorar, remodelar o rehabilitar vivienda terminada o progresiva. Incluye ecotecnias. NO incluye construcción de vivienda nueva.',
        comprobacion_uso: 'Hasta $30k: carta bajo protesta + foto previa. De $30k a $70k: carta + fotos antes/después. Más de $70k: reporte firmado por Gerente de Sucursal.',
        seguro_vida: { vigencia: 'Misma que el contrato.', monto: '$52.00 mensual pagado antes del desembolso.' },
    },

    // ── CRÉDITO PARALELO ─────────────────────────────────────────────────────
    MAN_PAR: {
        nombre: 'Manual de Crédito Paralelo (Adicional o De Campaña)',
        descripcion: 'Financiamiento adicional y exclusivo para clientas vigentes de Mujeres de Palabra que cuentan con excelente historial de pagos.',
        fuente: 'MAN-PAR Manual de Crédito Paralelo — Catálogo de Producto',
        temas: ['Montos', 'Plazos', 'Tasas e intereses', 'Requisitos de elegibilidad', 'Garantías', 'Seguro', 'Cobranza'],
        montos: {
            min: 1000,
            max: 30000,
            primer_credito_max: 20000,
            capacidad_pago_max_pct: 30,
            nota: 'Límites generales: $1,000.00 a $30,000.00. Primer crédito paralelo máximo $20,000.00. El monto autorizado no debe exceder el 30% de la capacidad de pago del solicitante.',
        },
        plazos: {
            texto: 'El número pendiente de semanas del crédito Mujeres de Palabra vigente, desde 3 hasta 12 semanas. Mismo calendario de pagos del crédito original.',
        },
        tasas: {
            cat: '252.7% (ejemplo $6,000 a 8 semanas, sin IVA, informativo)',
            global_mensual: '3.913%',
            anual: '91.21%',
            moratoria_texto: 'Tasa ordinaria × 2',
            iva: '16%',
            comisiones: 'Sin comisiones.',
            seguro_cuota: '$10.25 por semana por cliente (con IVA).',
        },
        grupo: {
            tipo_solicitante: 'Clientes de grupos Mujeres de Palabra con al menos 4 ciclos de antigüedad, excelente historial de pago y cero días de atraso en su crédito actual.',
            nota: 'No requiere autorización del grupo ni de la mesa directiva. Se gestiona individualmente dentro del grupo.',
        },
        requisitos: {
            documentos: ['No se requiere nueva documentación (usa la del expediente Mujeres de Palabra existente).'],
            garantia_liquida: '10% del monto solicitado.',
            historial: 'Consulta Círculo de Crédito obligatoria el día de la solicitud. Cero días de atraso en crédito actual y sin mora interna del grupo.',
            ventana_solicitud: 'Semana 4 como mínimo y máximo semana 11 del ciclo en curso.',
        },
        garantias: 'Garantía líquida 10%. Puede añadirse aval o garantía prendaria según monto.',
        seguro_vida: {
            cuota: '$10.25 por semana por cliente (con IVA).',
            suma_asegurada: '$35,000.00 por fallecimiento.',
            edad_aceptacion: '18 a 89 años.',
            nota: 'En caso de fallecimiento con crédito paralelo activo, se presentan dos reclamaciones a la aseguradora.',
        },
        nota_morosidad: 'Si hay mora en el crédito paralelo, NO se renueva el crédito Mujeres de Palabra. Aunque se regularice, el cliente ya no es elegible para futuros créditos paralelos.',
    },

    // ── CAJA CHICA ────────────────────────────────────────────────────────────
    MAN_CAJ: {
        nombre: 'Manual de Caja Chica',
        descripcion: 'Fondo revolvente destinado a cubrir gastos menores, urgentes y de operación básica en sucursales o corporativo.',
        fuente: 'MAN-CAJ Manual de Políticas y Procedimientos de Caja Chica — Código CVS-CA-MPR-02',
        temas: [
            'Control de aprobaciones y modificaciones',
            'Control del proceso',
            'Responsable',
            'Control y manejo de caja chica',
            'Comprobación y reembolso'
        ],
        montos: {
            sucursal_max: 2000,
            corporativo_min: 2500,
            corporativo_max: 10000,
            factura_minimo: 100,
            efectivo_max: 1999,
            activo_menor_max: 600,
            nota: 'Sucursales: hasta $2,000. Corporativo (Direcciones): de $2,500 a $10,000. Pagos ≥$2,000: obligatorio transferencia/tarjeta/cheque. Facturas válidas si son <$1,999 en efectivo.',
        },
        gastos_permitidos: [
            'Material de oficina urgente',
            'Paquetería y envío (solo corporativo)',
            'Reparaciones menores de mantenimiento',
            'Comestibles del personal (agua, café, azúcar)',
            'Artículos de botiquín de primeros auxilios (sin medicamentos)',
            'Transporte local para gestiones (solo corporativo)',
            'Transportación de colaboradores nuevos a grupos solidarios',
            'Hospedaje en casos extraordinarios',
        ],
        gastos_no_permitidos: [
            'Préstamos personales',
            'Viáticos del personal',
            'Regalos/obsequios/festejos (salvo autorización DG o áreas específicas)',
            'Activos fijos >$600',
            'Artículos desechables de unicel/plástico',
            'Combustible (solo con autorización DG)',
            'Consultas médicas (solo con autorización Dirección RRHH)',
        ],
        comprobacion: {
            plazo: 'Mensual y en la última semana del mes. En diciembre: máximo el día 20.',
            forma: 'Formato de Comprobación de Gastos (Anexo 2) + CFDI (PDF y XML). Sin factura: Formato en Vale o Vale Azul (Anexo 3).',
            vales: 'Máximo 5 vales (también conocidos como vales azules) al mes sin exceder $100 cada uno.',
        },
        reembolso: {
            plazo: 'Mínimo 3 días hábiles después de recibida la comprobación sin observaciones.',
            contacto: 'Dennis Camacho Salazar — dcamacho@grupoconserva.mx',
        },
    },

    // ── AUDITORÍA INTERNA ────────────────────────────────────────────────────
    MAN_AUD: {
        nombre: 'Manual de Auditoría Interna',
        descripcion: 'Evalúa, controla e identifica áreas de mejora en las labores de GRUPO CONSERVA mediante auditorías operativas, administrativas y metodológicas.',
        fuente: 'MAN-AUD Manual de Auditoría Interna',
        temas: [
            'Auditoría genera valor',
            'Independencia obligatoria',
            'Planeación por riesgo',
            'Control del crédito',
            'Calificación por sucursal',
            'Tickets con seguimiento',
            'Ética exigible',
            'Sanciones progresivas reales'
        ],
        genera_valor: {
            texto: 'El manual establece que la auditoría no debe limitarse a detectar errores o incumplimientos, sino que su propósito central es generar valor para la organización. Esto significa que cada revisión debe terminar con recomendaciones que mejoren procesos, reduzcan costos o fortalezcan operaciones, convirtiendo al auditor en un aliado estratégico del negocio y no en un agente punitivo.'
        },
        independencia: {
            texto: 'El auditor interno debe estar libre de cualquier influencia externa al determinar el alcance de su trabajo, ejecutarlo e informar los resultados. Esto implica que no puede evaluar operaciones en las que haya tenido responsabilidad previa, y que debe revelar por escrito cualquier conflicto de interés que limite su objetividad. Sin esta independencia, los resultados de auditoría pierden toda credibilidad institucional.'
        },
        planeacion: {
            texto: 'Antes de definir qué sucursales o áreas se auditarán, se debe realizar un análisis de riesgo que considere factores como la plataforma tecnológica, cambios organizacionales, resultados de auditorías previas, tamaño de la unidad y entorno operativo. Este análisis es lo que permite asignar los recursos de auditoría de forma inteligente: más profundidad y tiempo en las áreas de mayor riesgo, y menor intensidad en las que están bien controladas.'
        },
        control_credito: {
            texto: 'CONSERVA desarrolló desde 2015 una herramienta propia basada en la norma ISO-9000 que evalúa todos los eslabones del proceso crediticio: desde la promoción y la plática informativa, hasta la cobranza extrajudicial y la renovación del crédito. Lo importante es que esta herramienta no solo revisa documentos, sino que el auditor acompaña al promotor en campo, entrevista clientes y observa directamente cómo se ejecuta la metodología, detectando desviaciones en tiempo real.'
        },
        calificacion: {
            texto: 'Cada sucursal auditada recibe una calificación porcentual que la ubica en uno de cuatro niveles de riesgo: Controlado (95-100%), Bajo (90-94.99%), Medio (85-89.99%) o Alto (menor al 85%). Esta calificación no es solo un número — lleva asociada una recomendación de acción específica, desde simplemente mantener el rumbo en sucursales "A", hasta implementar auditorías más frecuentes con compromisos formales de mejora en sucursales "D". Al final del ejercicio, estas calificaciones se presentan al Director Comercial y al Director General.'
        },
        tickets: {
            texto: 'Cada observación o recomendación relevante derivada de una auditoría se documenta en un "ticket" que se entrega firmado al Director de área responsable, quien debe comprometerse a una fecha de cumplimiento. El estatus de todos los tickets es accesible vía Google Drive tanto para el Director General como para el Consejo de Administración, y se reporta mensualmente. Esto elimina la posibilidad de que las observaciones queden en el olvido y crea una rendición de cuentas trazable y auditable.'
        },
        etica: {
            texto: 'Los cuatro principios del código — Integridad, Objetividad, Confidencialidad y Competencia — no son simplemente un enunciado de valores, sino que se traducen en reglas de conducta concretas y exigibles. Por ejemplo, el auditor no puede aceptar ningún beneficio que comprometa su juicio, debe revelar todos los hechos materiales aunque sean incómodos, y solo puede participar en trabajos para los cuales tenga la preparación suficiente. El personal asume este código como un acto voluntario que va más allá de lo que exige la ley.'
        },
        sanciones: {
            texto: 'El manual define un catálogo claro de conductas sancionables con consecuencias progresivas: desde actas administrativas por no firmar un ticket o no responder a tiempo, pasando por descuentos de hasta el 50% del bono de aguinaldo por incumplir compromisos, hasta la baja definitiva e inicio de proceso legal para quien participe en un fraude o lo conozca y no lo reporte. Dos actas administrativas acumuladas equivalen a baja definitiva, sin importar el nivel jerárquico del colaborador implicado.'
        }
    },
};

// ─── MOTOR DE DETECCIÓN ──────────────────────────────────────────────────────

/** Palabras clave → tema del manual para Modo Directo. */
export const TOPIC_KEYWORDS = {
    montos: ['monto', 'cuánto', 'cuanto', 'préstamo', 'prestamo', 'importe', 'cantidad', 'dinero', 'límite', 'limite', 'mínimo', 'máximo'],
    plazos: ['plazo', 'semanas', 'meses', 'tiempo', 'vigencia', 'duración', 'duracion', 'calendario'],
    tasas: ['tasa', 'interés', 'interes', 'cat', 'moratoria', 'bonificación', 'bonificacion', 'iva', 'costo'],
    requisitos: ['requisito', 'documento', 'necesito', 'pedir', 'tramitar', 'solicitar', 'qué piden', 'que necesita'],
    garantias: ['garantía', 'garantia', 'aval', 'garantia liquida', 'garantía líquida', 'prenda'],
    grupo: ['grupo', 'integrante', 'persona', 'cuántas personas', 'cuantas personas', 'miembro', 'armar', 'formar'],
    seguro: ['seguro', 'vida', 'fallecimiento', 'siniestro', 'beneficiario'],
    cobranza: ['cobranza', 'mora', 'atraso', 'vencido', 'recuperación', 'intereses moratorios'],
    hospedaje: ['hospedaje', 'hotel', 'noches', 'alojamiento'],
    alimentos: ['alimento', 'comida', 'desayuno', 'cena', 'comer'],
    transporte: ['transporte', 'vuelo', 'avión', 'autobús', 'bus', 'pasaje', 'taxi', 'traslado'],
    internacional: ['extranjero', 'internacional', 'dólares', 'dolares', 'usd'],
    solicitud: ['solicitar viatico', 'pedir viatico', 'cómo pido', 'como pido', 'anticipación'],
    comprobacion: ['comprobar', 'comprobación', 'factura', 'ticket', 'comprobante', 'vale', 'vales', 'vale azul', 'vales azules'],
    custodia: ['custodia', 'cuenta bancaria', 'personal', '48 horas', 'responsable'],
    botiquin: ['botiquín', 'botiquin', 'medicamento', 'medicina', 'curitas', 'primeros auxilios'],
    excepciones: ['excepción', 'pagos mayores', '2000', '2,000', 'transferencia', 'cheque'],
    aprobaciones: ['aprobación', 'aprobacion', 'aprobaciones', 'autorización', 'autorizacion', 'bitácora', 'bitacora'],
    proceso: ['proceso', 'control del proceso', 'supervisión', 'supervision'],
    responsable: ['responsable', 'titular', 'quién se encarga', 'quien se encarga'],
    manejo: ['manejo', 'control y manejo', 'control de caja', 'arqueo', 'caja de seguridad'],
    audi_valor: ['valor', 'genera valor', 'auditoria genera valor'],
    audi_independencia: ['independencia', 'independencia obligatoria', 'objetividad', 'influencia'],
    audi_planeacion: ['planeación', 'planeacion', 'riesgo', 'planeación por riesgo'],
    audi_control_credito: ['control del crédito', 'control del credito', 'metodología', 'iso-9000'],
    audi_calificacion: ['calificación', 'calificacion', 'sucursal', 'controlado', 'bajo', 'medio', 'alto', 'calificacion por sucursal'],
    audi_tickets: ['ticket', 'tickets', 'seguimiento', 'compromiso', 'tickets con seguimiento'],
    audi_etica: ['ética', 'etica', 'código', 'codigo', 'conducta', 'integridad', 'confidencialidad', 'competencia', 'etica exigible'],
    audi_sanciones: ['sanción', 'sancion', 'sanciones', 'acta administrativa', 'baja', 'aguinaldo', 'sanciones progresivas', 'sanciones progresivas reales'],
};

/** Palabras clave → manual específico para Modo Directo de detección automática. */
export const MANUAL_KEYWORDS = {
    MAN_SOL: ['mujeres de palabra', 'solidario', 'grupal', 'grupo solidario', 'crédito grupal', 'credito grupal'],
    MAN_TAC: ['t activa', 't-activa', 'conserva t activa', 'tactiva'],
    MAN_IND: ['individual', 'tu negocio', 'crédito individual', 'credito individual'],
    MAN_HOG: ['tu hogar', 'hogar', 'vivienda', 'mejoramiento', 'mejora de vivienda'],
    MAN_PAR: ['paralelo', 'adicional', 'campaña', 'crédito paralelo', 'credito paralelo'],
    MAN_CAJ: ['caja chica', 'fondeo de caja', 'fondo de caja'],
    MAN_VIA: ['viatico', 'viático', 'viáticos', 'hospedaje', 'viaje', 'comisión de viaje'],
    MAN_AUD: ['auditoria', 'auditoría', 'auditoria interna', 'auditoría interna', 'auditoria metodologica', 'auditoría metodológica', 'auditor', 'auditores', 'control metodologico', 'control metodológico'],
};
