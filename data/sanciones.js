/**
 * data/sanciones.js
 * Matriz de Acciones Correctivas — CONSERVA
 * Fuente: Matriz_Sanciones.md
 *
 * Estructura de folios por nivel de gravedad:
 *  - LEVE (Folios 1–4)
 *  - MODERADA (Folios 5–52)
 *  - GRAVE (Folios 53–65)
 *
 * Formatos descargables disponibles en: base_conocimiento/Formatos de Sanciones/
 */

/** Mapeo de nombre de formato → archivo descargable */
export const FORMATOS_SANCIONES = {
    'bitacora': {
        nombre: 'Bitácora de Gestión del Personal',
        archivo: 'Bitacora de gestión del personal',
        url: 'Formatos de Sanciones/Bitacora de gestión del personal',
        descripcion: 'Registro de incidencias y gestión de personal'
    },
    'llamada_atencion': {
        nombre: 'Llamada de Atención por Escrito',
        archivo: 'Llamada de Atención x escrito.pdf fi',
        url: 'Formatos de Sanciones/Llamada de Atención x escrito.pdf fi',
        descripcion: 'Formato oficial de llamada de atención escrita'
    },
    'acta_administrativa': {
        nombre: 'Acta Administrativa',
        archivo: 'Acta administrativa',
        url: 'Formatos de Sanciones/Acta administrativa',
        descripcion: 'Acta formal de acción correctiva administrativa'
    },
    'acta_investigacion': {
        nombre: 'Acta de Investigación',
        archivo: 'Acta de investigación',
        url: 'Formatos de Sanciones/Acta de investigación',
        descripcion: 'Acta para inicio de proceso de investigación'
    },
    'plan_mejora': {
        nombre: 'Plan de Mejora',
        archivo: 'Plan de Mejora Final',
        url: 'Formatos de Sanciones/Plan de Mejora Final',
        descripcion: 'Formato de Plan de Mejora para colaboradores'
    }
};

/** Todos los formatos disponibles como arreglo */
export const TODOS_LOS_FORMATOS = Object.values(FORMATOS_SANCIONES);

/**
 * Datos completos de la Matriz de Sanciones por nivel.
 * Cada folio contiene: conducta, instancias, acciones, formatos requeridos.
 */
export const SAN_DATA = {
    nombre: 'Matriz de Acciones Correctivas — CONSERVA',
    fuente: 'MOD-SAN-007 — Matriz de Sanciones Institucional',
    descripcion: 'Guía institucional de acciones correctivas ante conductas inapropiadas, clasificadas en tres niveles de gravedad: Leve, Moderada y Grave.',
    temas: [
        '1. Estructura de sanciones',
        '2. Faltas nivel leve',
        '3. Faltas nivel moderado',
        '4. Faltas nivel grave',
        '5. Reglas de operación',
        '6. Confidencialidad y PLD',
        '7. Responsabilidad de líderes',
        '---',
        'Consulta de Folios (1-65)',
        'Formatos para descarga',
        'Buscar conducta específica',
        'Regresar al Menú Principal'
    ],

    // ── TEMAS INFORMATIVOS ─────────────────────────────────────────────────────
    info_temas: {
        '1. estructura de sanciones': {
            titulo: '1. Estructura de sanciones',
            contenido: `El documento clasifica las conductas inapropiadas en tres niveles de gravedad: <b>Leve, Moderada y Grave</b>.
            <br><br>
            Para cada nivel se especifican las instancias responsables (Líder, Enlace Talento, Comité de Honor), el formato a utilizar y la posible salida económica.`
        },
        '2. faltas nivel leve': {
            titulo: '2. Faltas nivel leve',
            contenido: `Incluyen llegadas tarde, incumplir el código de vestimenta, desorden en el área y generar distracciones.
            <br><br>
            Se gestionan con <b>llamados de atención progresivos</b>; al acumular cuatro en un periodo corto, se levanta acta administrativa y se evalúa la baja.`
        },
        '3. faltas nivel moderado': {
            titulo: '3. Faltas nivel moderado',
            contenido: `Abarcan negligencia operativa, bajo rendimiento sin justificación, omisión en formatos e incumplimiento recurrente.
            <br><br>
            Requieren llamado de atención escrito, un <b>"Plan de Mejora"</b> y, ante reincidencia, acta administrativa y valoración de despido.`
        },
        '4. faltas nivel grave': {
            titulo: '4. Faltas nivel grave',
            contenido: `Tienen <b>tolerancia cero</b> y se escalan directamente al Comité de Honor.
            <br><br>
            Conductas como acoso, fraude, hurto, presentarse en estado de ebriedad o portar armas resultan en <b>baja inmediata</b>, correspondiendo solo el pago de finiquito.`
        },
        '5. reglas de operación': {
            titulo: '5. Reglas de operación',
            contenido: `Está prohibido levantar efectivo sin recibo oficial, otorgar créditos con recursos ajenos y hacer tratos preferenciales.
            <br><br>
            <b>Aceptar dádivas o sobornos</b> de clientes y proveedores se considera una falta grave.`
        },
        '6. confidencialidad y pld': {
            titulo: '6. Confidencialidad y PLD',
            contenido: `Compartir información interna o manuales por medios no autorizados es causa de acta administrativa y posible baja.
            <br><br>
            Reprobar la evaluación de <b>Prevención de Lavado de Dinero (PLD)</b> por tercera vez o alertar a clientes sobre avisos del sistema deriva en despido inmediato.`
        },
        '7. responsabilidad de líderes': {
            titulo: '7. Responsabilidad de líderes',
            contenido: `Los líderes deben dar acompañamiento a su equipo, rotar al personal y documentar las incidencias.
            <br><br>
            <b>Encubrir conductas</b>, normalizar malas prácticas o ser corresponsable en fraudes conlleva sanciones que incluyen la baja directa por complicidad.`
        }
    },

    // ── NIVEL LEVE (Folios 1–4) ────────────────────────────────────────────────
    nivel_leve: {
        descripcion: 'Conductas de bajo impacto. La acción inicia con llamado verbal y puede escalar a acta administrativa.',
        folios: [
            {
                folio: 1,
                conducta: 'Llegadas tarde con retraso de más de 15 minutos al centro laboral, grupos de clientes, espacios institucionales (reuniones presenciales y on-line, cursos, talleres) y todo evento institucional.',
                instancias: [
                    { paso: 1, instancia: 'Líder inmediato', accion: 'Primera vez: Llamado de atención verbal', formato: 'bitacora' },
                    { paso: 2, instancia: 'Líder inmediato', accion: 'Segunda vez: Llamado de atención verbal', formato: 'bitacora' },
                    { paso: 3, instancia: 'Líder inmediato / Enlace Talento', accion: 'Tercera vez: Llamado de atención por escrito', formato: 'llamada_atencion' },
                    { paso: 4, instancia: 'Líder inmediato', accion: 'Cuarta vez dentro de período no mayor a 3 meses: Acta administrativa y evaluación de baja si hay reincidencia', formato: 'acta_administrativa' }
                ],
                salida_economica: 'Considerar tabulador de baja por antigüedad'
            },
            {
                folio: 2,
                conducta: 'No seguir el código de vestimenta institucional.',
                instancias: [
                    { paso: 1, instancia: 'Líder inmediato', accion: 'Primera vez: Llamado de atención verbal', formato: 'bitacora' },
                    { paso: 2, instancia: 'Líder inmediato', accion: 'Segunda vez: Llamado de atención verbal', formato: 'bitacora' },
                    { paso: 3, instancia: 'Líder inmediato / Enlace Talento', accion: 'Tercera vez: Llamado de atención por escrito', formato: 'llamada_atencion' },
                    { paso: 4, instancia: 'Líder inmediato', accion: 'Cuarta vez en período no mayor a 1 mes: Acta administrativa y evaluación de baja si hay reincidencia', formato: 'acta_administrativa' }
                ],
                salida_economica: 'Considerar tabulador de baja por antigüedad'
            },
            {
                folio: 3,
                conducta: 'Desorden o falta de limpieza en el espacio de trabajo.',
                instancias: [
                    { paso: 1, instancia: 'Líder inmediato', accion: 'Primera vez: Llamado de atención verbal', formato: 'bitacora' },
                    { paso: 2, instancia: 'Líder inmediato', accion: 'Segunda vez: Llamado de atención verbal', formato: 'bitacora' },
                    { paso: 3, instancia: 'Líder inmediato / Enlace Talento', accion: 'Tercera vez: Llamado de atención por escrito', formato: 'llamada_atencion' },
                    { paso: 4, instancia: 'Líder inmediato', accion: 'Cuarta vez en período no mayor a 1 mes: Acta administrativa y evaluación de baja', formato: 'acta_administrativa' }
                ],
                salida_economica: 'Considerar tabulador de baja por antigüedad'
            },
            {
                folio: 4,
                conducta: 'Mantener conversaciones o realizar interrupciones que afecten el ambiente laboral (poner música, charlas fuera de temas de trabajo, interferir en cursos, reuniones u otras actividades que entorpezcan el cumplimiento del trabajo).',
                instancias: [
                    { paso: 1, instancia: 'Líder inmediato', accion: 'Primera vez: Llamado de atención verbal', formato: 'bitacora' },
                    { paso: 2, instancia: 'Líder inmediato', accion: 'Segunda vez: Llamado de atención verbal', formato: 'bitacora' },
                    { paso: 3, instancia: 'Líder inmediato / Enlace Talento', accion: 'Tercera vez: Llamado de atención por escrito', formato: 'llamada_atencion' },
                    { paso: 4, instancia: 'Líder inmediato', accion: 'Cuarta vez: Acta administrativa y evaluación de baja si hay reincidencia', formato: 'acta_administrativa' }
                ],
                salida_economica: 'Considerar tabulador de baja por antigüedad'
            }
        ]
    },

    // ── NIVEL MODERADO (Folios 5–52) ──────────────────────────────────────────
    nivel_moderado: {
        descripcion: 'Conductas de impacto intermedio. Requieren intervención del Enlace Talento y pueden derivar en baja del colaborador.',
        folios_resumen: [
            { folio: 5, conducta: 'Levantamiento de efectivo en campo sin recibo oficial y sin autorización del jefe inmediato.' },
            { folio: 6, conducta: 'Incumplimiento de tareas o plazos de forma recurrente; compromisos de minutas no cumplidos.' },
            { folio: 7, conducta: 'Descuido o negligencia en el cumplimiento de funciones; errores repetitivos por falta de atención.' },
            { folio: 8, conducta: 'Uso indebido de recursos de la empresa (software, hardware, vehículos, papelería) para fines distintos a CONSERVA.' },
            { folio: 9, conducta: 'Discusiones de política o juegos con contacto físico que impliquen violencia; actos de violencia dentro o fuera del centro de trabajo contra colaboradores o sus familias.' },
            { folio: 10, conducta: 'Rendimiento por debajo de estándares u objetivos marcados en medición del desempeño y KPIs institucionales, sin justificación.' },
            { folio: 11, conducta: 'No notificar a quien corresponda cualquier accidente de trabajo que ponga en riesgo las actividades.' },
            { folio: 12, conducta: 'No notificar a la Dirección Jurídica documentos emitidos por autoridades de manera inmediata.' },
            { folio: 13, conducta: 'Revelación de información confidencial: políticas, manuales, formatos y todo lo relacionado con la operación institucional.' },
            { folio: 14, conducta: 'Abandonar el trabajo en horas de labor sin causa justificada ni autorización del jefe inmediato.' },
            { folio: 15, conducta: 'Ausencias injustificadas sin previo aviso o autorización del jefe inmediato.' },
            { folio: 16, conducta: 'No realizar el líder los Uno a Uno con su equipo en las fechas estipuladas.' },
            { folio: 17, conducta: 'Permitir que personas ajenas a la institución utilicen las herramientas de trabajo asignadas al colaborador.' },
            { folio: 18, conducta: 'Negarse a adoptar medidas preventivas o seguir procedimientos para evitar accidentes o enfermedades.' },
            { folio: 19, conducta: 'Tener préstamos o adquirir mercancía de clientes o proveedores de la institución.' },
            { folio: 20, conducta: 'No cumplir con el llenado de formatos y documentación institucional ni firmas correspondientes.' },
            { folio: 21, conducta: 'No notificar en tiempo y forma los cambios de zona, centro de trabajo o puestos nuevos.' },
            { folio: 22, conducta: 'Incumplir sin justificación los requerimientos de procesos institucionales o información solicitada por cualquier área.' },
            { folio: 23, conducta: 'Generar comentarios inapropiados: chismes, calumnias, discriminación en cultura, religión, estudio o sexo.' },
            { folio: 24, conducta: 'Alterar el clima laboral formando grupos conflictivos en áreas de trabajo que dañen la imagen de otros colaboradores.' },
            { folio: 25, conducta: 'Falta de supervisión y acompañamiento al personal a cargo.' },
            { folio: 26, conducta: 'Hacerse acompañar durante la jornada de personas que no laboran en la empresa, sin justificación ni autorización.' },
            { folio: 27, conducta: 'Permanecer o introducirse al centro de trabajo fuera del horario de trabajo sin autorización.' },
            { folio: 28, conducta: 'Atender familiares como clientes de la institución sin conocimiento y autorización del jefe inmediato.' },
            { folio: 29, conducta: 'Solicitar, recomendar, influir o imponer el ingreso de clientes nuevos sin apego a políticas institucionales.' },
            { folio: 30, conducta: 'Negativa de firma del colaborador a actas administrativas, planes de mejora o reportes de auditoría sin justificación.' },
            { folio: 31, conducta: 'Documentación alterada, falsa o apócrifa: bitácoras, domicilios, números de teléfono inventados u omitidos.' },
            { folio: 32, conducta: 'Extracción parcial o total de documentación de expedientes (pagarés, contratos, garantías, recibos) sin autorización.' },
            { folio: 33, conducta: 'Colaborador que incremente el PAR1 a partir del 8% por 3 meses consecutivos, por indicadores de bajo desempeño.' },
            { folio: 34, conducta: 'Usar el cargo o posición del puesto para solicitar préstamos entre compañeros de manera recurrente.' },
            { folio: 35, conducta: 'Formatos y papelógrafos sin firmar, sucios o incorrectamente requisitados.' },
            { folio: 36, conducta: 'Omisión del llenado oportuno del expediente de Cobranza Extrajudicial.' },
            { folio: 37, conducta: 'No asistir o no permanecer en zona de trabajo durante horario de reuniones con grupos solidarios u otras actividades en campo.' },
            { folio: 38, conducta: 'Inasistencias a los grupos conforme a la agenda asignada.' },
            { folio: 39, conducta: 'Uso de teléfonos celulares institucionales para fines distintos al trabajo sin autorización previa.' },
            { folio: 40, conducta: 'Uso de teléfono celular (incluso con audífonos o manos libres) durante una reunión de grupo solidario.' },
            { folio: 41, conducta: 'No mantener las cámaras encendidas en reuniones de trabajo o eventos institucionales on-line sin justificación.' },
            { folio: 42, conducta: 'Prácticas de cobranza telefónica indebida: llamadas con número oculto, fuera de horario, amenazas, ostentar representación judicial.' },
            { folio: 43, conducta: 'Incumplimiento injustificado de renovaciones de crédito de clientes bajo metas definidas.' },
            { folio: 44, conducta: 'Asistir a lugares con venta de bebidas alcohólicas portando el uniforme institucional fuera del horario de trabajo.' },
            { folio: 45, conducta: 'Omisión deliberada del líder de no documentar ni informar conductas para proteger colaboradores, exponiendo a la institución.' },
            { folio: 46, conducta: 'Uso de WhatsApp institucional para fines distintos al trabajo sin autorización.' },
            { folio: 47, conducta: 'Presión indebida por resultados: exigir metas cruzando límites éticos o normativos.' },
            { folio: 48, conducta: 'Promesas fuera de política: compromisos verbales no autorizados a clientes.' },
            { folio: 49, conducta: 'Trato preferencial injustificado hacia colaboradores y/o clientes; favoritismos que dañan el clima laboral.' },
            { folio: 50, conducta: 'Normalizar malas prácticas; justificar conductas por costumbre histórica que violenten las políticas institucionales.' },
            { folio: 51, conducta: 'No documentar incidencias y reincidencias de conductas establecidas en la matriz de acciones correctivas.' },
            { folio: 52, conducta: 'No rotar al personal bajo las políticas operativas institucionales.' }
        ]
    },

    // ── NIVEL GRAVE (Folios 53–65) ────────────────────────────────────────────
    nivel_grave: {
        descripcion: '🔴 Conductas graves que derivan en baja inmediata y finiquito. Interviene el Comité de Honor.',
        folios: [
            { folio: 53, conducta: 'Sustraer sin autorización cualquier activo institucional o hurto de bienes de la empresa o compañeros, tipificado por ley.' },
            { folio: 54, conducta: 'Vulnerar la seguridad física (agresión física, verbal, amenazas) o permitir que terceros lo hagan a colaboradores, clientes y proveedores.' },
            { folio: 55, conducta: 'Acoso laboral o sexual: intimidación, humillación, hostigamiento, agresión, alusiones verbales o gestuales de corte violento hacia colaboradores, clientes o proveedores.' },
            { folio: 56, conducta: 'Daño intencional a la propiedad de la institución: destruir o deteriorar bienes de forma deliberada.' },
            { folio: 57, conducta: 'Mal uso de la imagen institucional en redes sociales o cuentas personales; uso del logotipo para fines no institucionales.' },
            { folio: 58, conducta: 'Presentarse a laborar con aliento alcohólico o en estado de ebriedad, o consumir bebidas alcohólicas/narcóticos en horas laborales, o portando uniforme institucional.' },
            { folio: 59, conducta: 'Portar armas de cualquier clase durante la jornada laboral, dentro de instalaciones, con clientes/proveedores, portando uniforme o en comisión autorizada.' },
            { folio: 60, conducta: 'Relaciones extramaritales con clientes, familiares de clientes, o con personal de la empresa.' },
            { folio: 61, conducta: 'No aprobar hasta en tercera y última oportunidad la evaluación anual en materia de PLD.' },
            { folio: 62, conducta: 'Alertar o dar aviso a clientes o terceros sobre alertas de PLD/FT proporcionadas por el sistema de informática.' },
            { folio: 63, conducta: 'Comprometer por imprudencia o descuido la seguridad del establecimiento o de las personas que se encuentren en él.' },
            { folio: 64, conducta: 'Sentencia ejecutoriada que imponga pena de prisión al trabajador impidiendo el cumplimiento de la relación de trabajo.' },
            { folio: 65, conducta: 'Falsear o negar información sobre cambio de domicilio, estado civil u otros datos institucionales cuando sean requeridos.' }
        ],
        instancia: 'Comité de Honor (puede participar el Director General y Auditoría Interna)',
        accion: 'Levantamiento de Acta para proceder con la BAJA DEL COLABORADOR',
        salida_economica: 'Finiquito'
    },

    // ── KEYWORDS para detección ────────────────────────────────────────────────
    keywords: [
        'sancion', 'sanción', 'sanciones', 'sancionado', 'correctiva', 'correctivo',
        'accion correctiva', 'acción correctiva', 'disciplina', 'disciplinaria',
        'llamado de atención', 'llamada de atención', 'llamada de atencion',
        'acta administrativa', 'acta de investigacion', 'plan de mejora',
        'baja colaborador', 'folio', 'matriz sanciones', 'nivel leve', 'nivel grave',
        'nivel moderado', 'comité de honor', 'comite de honor', 'falta',
        'conducta inapropiada', 'conducta incorrecta', 'reincidencia',
        'enlace talento', 'acoso laboral', 'acoso sexual', 'robo', 'hurto',
        'tardanza', 'ausencia', 'inasistencia', 'bitacora personal', 'bitácora'
    ]
};

/**
 * Detecta qué formatos son relevantes según las palabras clave de la consulta.
 * Devuelve arreglo de objetos de formato.
 */
export function detectarFormatosRelevantes(query) {
    const q = (query || '').toLowerCase();
    const relevantes = [];

    if (q.includes('bitacora') || q.includes('bitácora') || q.includes('verbal') || q.includes('registro')) {
        relevantes.push(FORMATOS_SANCIONES.bitacora);
    }
    if (q.includes('llamada') || q.includes('llamado') || q.includes('escrito') || q.includes('atencion')) {
        relevantes.push(FORMATOS_SANCIONES.llamada_atencion);
    }
    if (q.includes('acta administrativa') || q.includes('levantamiento') || q.includes('acta')) {
        relevantes.push(FORMATOS_SANCIONES.acta_administrativa);
    }
    if (q.includes('investigacion') || q.includes('investigación') || q.includes('investiga')) {
        relevantes.push(FORMATOS_SANCIONES.acta_investigacion);
    }
    if (q.includes('plan de mejora') || q.includes('mejora') || q.includes('desempeño') || q.includes('kpi')) {
        relevantes.push(FORMATOS_SANCIONES.plan_mejora);
    }

    // Si no se detecta ninguno específico pero la consulta es sobre sanciones, retornar los comunes
    if (relevantes.length === 0 && (q.includes('formato') || q.includes('descargar') || q.includes('documento'))) {
        return TODOS_LOS_FORMATOS;
    }

    return relevantes;
}

/**
 * Busca folios relevantes para una consulta dada.
 * Retorna array de folios que coincidan con la conducta descrita.
 */
export function buscarFolios(query) {
    const q = (query || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/gi, '');
    const words = q.split(/\s+/).filter(w => w.length > 3);

    const todosLosFolios = [
        ...SAN_DATA.nivel_leve.folios,
        ...SAN_DATA.nivel_moderado.folios_resumen.map(f => ({ ...f, nivel: 'MODERADO' })),
        ...SAN_DATA.nivel_grave.folios.map(f => ({ ...f, nivel: 'GRAVE' }))
    ];

    const resultados = [];
    for (const folio of todosLosFolios) {
        const conducta = (folio.conducta || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/gi, '');
        let matches = 0;
        for (const word of words) {
            if (conducta.includes(word)) matches++;
        }
        const score = matches / Math.max(words.length, 1);
        if (score >= 0.3) {
            resultados.push({ folio, score });
        }
    }

    resultados.sort((a, b) => b.score - a.score);
    return resultados.slice(0, 3).map(r => r.folio);
}
