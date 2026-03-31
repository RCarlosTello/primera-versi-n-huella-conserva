/**
 * data/sanciones.js
 * Matriz de Acciones Correctivas — CONSERVA
 * Fuente: Matriz_Sanciones.xlsx (75 folios)
 *
 * Niveles:
 *  - LEVE     (Folios  1– 4)
 *  - MODERADA (Folios  5–52)
 *  - GRAVE    (Folios 53–75)
 */

/** Formatos descargables */
export const FORMATOS_SANCIONES = {
    bitacora: {
        nombre: 'Bitácora de Gestión del Personal',
        archivo: 'Bitacora de gestion del personal',
        url: 'Formatos de Sanciones/Bitacora de gestión del personal',
        descripcion: 'Registro de incidencias y gestión de personal'
    },
    llamada_atencion: {
        nombre: 'Llamada de Atención x Escrito',
        archivo: 'Llamada de Atención x escrito',
        url: 'Formatos de Sanciones/Llamada de Atención x escrito.pdf fi',
        descripcion: 'Formato oficial de llamada de atención escrita'
    },
    acta_administrativa: {
        nombre: 'Acta Administrativa',
        archivo: 'Acta administrativa',
        url: 'Formatos de Sanciones/Acta administrativa',
        descripcion: 'Acta formal de acción correctiva administrativa'
    },
    acta_investigacion: {
        nombre: 'Acta de Investigación',
        archivo: 'Acta de investigación',
        url: 'Formatos de Sanciones/Acta de investigación',
        descripcion: 'Acta para inicio de proceso de investigación'
    },
    plan_mejora: {
        nombre: 'Plan de Mejora',
        archivo: 'Plan de Mejora Final',
        url: 'Formatos de Sanciones/Plan de Mejora Final',
        descripcion: 'Formato de Plan de Mejora para colaboradores'
    },
    todos_baja: {
        nombre: 'Formatos de Baja',
        archivo: 'Formatos de baja',
        url: 'Formatos de Sanciones/',
        descripcion: 'Todos los formatos requeridos para ejecutar la baja'
    }
};

export const TODOS_LOS_FORMATOS = Object.values(FORMATOS_SANCIONES);

/**
 * Mapa folio → claves de formato requeridas (extraído directamente del Excel Matriz_Sanciones.xlsx)
 * Cada folio sabe exactamente qué formatos necesita según la columna "Formato a utilizar"
 */
export const FOLIO_FORMAT_MAP = {
    1: ['bitacora', 'llamada_atencion'],
    2: ['bitacora', 'llamada_atencion'],
    3: ['bitacora', 'llamada_atencion'],
    4: ['bitacora', 'llamada_atencion'],
    5: ['llamada_atencion', 'acta_administrativa'],
    6: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    7: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    8: ['acta_administrativa'],
    9: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    10: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    11: ['acta_administrativa'],
    12: ['acta_administrativa'],
    13: ['acta_administrativa'],
    14: ['llamada_atencion', 'acta_administrativa'],
    15: ['llamada_atencion', 'acta_administrativa'],
    16: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    17: ['acta_administrativa'],
    18: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    19: ['llamada_atencion', 'acta_administrativa'],
    20: ['acta_administrativa'],
    21: ['llamada_atencion', 'acta_administrativa'],
    22: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    23: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    24: ['acta_administrativa'],
    25: ['plan_mejora', 'acta_administrativa'],
    26: ['plan_mejora', 'acta_administrativa'],
    27: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    28: ['acta_administrativa'],
    29: ['acta_administrativa'],
    30: ['llamada_atencion'],
    31: ['acta_administrativa'],
    32: ['acta_administrativa'],
    33: ['plan_mejora', 'acta_administrativa'],
    34: ['acta_administrativa'],
    35: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    36: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    37: ['acta_administrativa'],
    38: ['acta_administrativa'],
    39: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    40: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    41: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    42: ['acta_administrativa'],
    43: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    44: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    45: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    46: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    47: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    48: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    49: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    50: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    51: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    52: ['llamada_atencion', 'plan_mejora', 'acta_administrativa'],
    53: ['todos_baja'],
    54: ['todos_baja'],
    55: ['todos_baja'],
    56: ['todos_baja'],
    57: ['todos_baja'],
    58: ['todos_baja'],
    59: ['todos_baja'],
    60: ['todos_baja'],
    61: ['todos_baja'],
    62: ['todos_baja'],
    63: ['todos_baja'],
    64: ['todos_baja'],
    65: ['todos_baja'],
    66: ['todos_baja'],
    67: ['todos_baja'],
    68: ['todos_baja'],
    69: ['todos_baja'],
    70: ['todos_baja'],
    71: ['todos_baja'],
    72: ['todos_baja'],
    73: ['todos_baja'],
    74: ['todos_baja'],
    75: ['todos_baja']
};

export const SAN_DATA = {
    nombre: 'Matriz de Acciones Correctivas — CONSERVA',
    fuente: 'MOD-SAN-007 — Matriz de Sanciones Institucional',
    descripcion: 'Guía institucional de acciones correctivas ante conductas inapropiadas, clasificadas en tres niveles: Leve, Moderada y Grave.',
    temas: [
        '1. Estructura de sanciones',
        '2. Faltas nivel leve',
        '3. Faltas nivel moderado',
        '4. Faltas nivel grave',
        '5. Reglas de operación',
        '6. Confidencialidad y PLD',
        '7. Responsabilidad de líderes',
        '---',
        'Consulta de Folios (1-75)',
        'Formatos para descarga',
        'Buscar conducta específica',
        'Regresar al Menú Principal'
    ],

    info_temas: {
        '1. estructura de sanciones': {
            titulo: '1. Estructura de sanciones',
            contenido: `El documento clasifica las conductas en tres niveles: <b>Leve (1-4)</b>, <b>Moderada (5-52)</b> y <b>Grave (53-75)</b>. Para cada nivel se especifican instancias responsables, formato a utilizar y posible salida económica.`
        },
        '2. faltas nivel leve': {
            titulo: '2. Faltas nivel leve',
            contenido: `Incluyen llegadas tarde, código de vestimenta, desorden en el área y distracciones. Se gestionan con <b>llamados de atención progresivos</b>; al acumular cuatro en período corto se levanta acta administrativa.`
        },
        '3. faltas nivel moderado': {
            titulo: '3. Faltas nivel moderado',
            contenido: `Abarcan negligencia operativa, bajo rendimiento, omisión en formatos e incumplimiento recurrente. Requieren llamado escrito, <b>Plan de Mejora</b> y ante reincidencia acta administrativa.`
        },
        '4. faltas nivel grave': {
            titulo: '4. Faltas nivel grave',
            contenido: `<b>Tolerancia cero</b>. Conductas como acoso, fraude, hurto, ebriedad, portar armas o falsificación resultan en <b>baja inmediata</b> con finiquito.`
        },
        '5. reglas de operación': {
            titulo: '5. Reglas de operación',
            contenido: `Prohibido levantar efectivo sin recibo, otorgar créditos con recursos ajenos y tratos preferenciales. <b>Aceptar dádivas</b> de clientes y proveedores es falta grave.`
        },
        '6. confidencialidad y pld': {
            titulo: '6. Confidencialidad y PLD',
            contenido: `Compartir información interna o manuales es causa de acta y posible baja. Reprobar evaluación de <b>PLD</b> por tercera vez o alertar clientes sobre avisos del sistema deriva en despido inmediato.`
        },
        '7. responsabilidad de líderes': {
            titulo: '7. Responsabilidad de líderes',
            contenido: `Los líderes deben documentar incidencias, rotar personal y dar acompañamiento. <b>Encubrir conductas</b> o ser corresponsable en fraudes conlleva sanciones que incluyen la baja directa.`
        }
    },

    // ── NIVEL LEVE (Folios 1–4) ────────────────────────────────────────────────
    nivel_leve: {
        descripcion: 'Conductas de bajo impacto. La acción inicia con llamado verbal y puede escalar a acta administrativa.',
        folios: [
            {
                folio: 1,
                conducta: `Llegadas tarde con retraso de más de 15 minutos al centro laboral, grupos de clientes y espacios insitucionales (formacion reuniones presencales y on-line, cursos, talleres) a todo evento institucional.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato`,
                        accion: `Primera vez: Llamado de atención verbal`,
                        formato: 'bitacora',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Lider inmediato`,
                        accion: `Segunda vez: Llamado de atención verbal`,
                        formato: 'bitacora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Lider inmediato/ Con acompañamiento de Enlace Talanto.`,
                        accion: `Tercera vez: Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 4,
                        instancia: ``,
                        accion: `Si la conducta llega a una 4to. llamado de atención en un periodo no mayor a 3 meses, es levantamiento de acta administrativa y sí hay reincidencia se evalua baja del colaborador.`,
                        formato: null,
                        salida: `Considerar un tabulador de baja por antigüedad`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad`
            },
            {
                folio: 2,
                conducta: `No seguir el código de vestimenta institucional.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato`,
                        accion: `Primera vez: Llamado de atención verbal`,
                        formato: 'bitacora',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Lider inmediato`,
                        accion: `Segunda vez: Llamado de atención verbal`,
                        formato: 'bitacora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `Tercera vez: Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 4,
                        instancia: ``,
                        accion: `Si la conducta llega a una 4to llamado de atención, en un periodo no mayor a 1 mes, es levantamiento de acta administrativa y sí hay reincidencia se evalua baja del colaborador.`,
                        formato: null,
                        salida: `Considerar un tabulador de baja por antigüedad`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad`
            },
            {
                folio: 3,
                conducta: `Desorden o falta de limpieza en el espacio de trabajo.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato`,
                        accion: `Primera vez: Llamado de atención verbal`,
                        formato: 'bitacora',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Lider inmediato`,
                        accion: `Segunda vez: Llamado de atención verbal`,
                        formato: 'bitacora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `Tercera vez: Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 4,
                        instancia: ``,
                        accion: `Si la conducta llega a una 4to llamado de atención, en un periodo no mayor a 1 mes, es levantamiento de acta administrativa y sí hay reincidencia se evalua baja del colaborador.`,
                        formato: null,
                        salida: `Considerar un tabulador de baja por antigüedad`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad`
            },
            {
                folio: 4,
                conducta: `Mantener conversaciones o realizar interrupciones que afecten en los espacios laborales. (poner musica, charlas fuera de los temas de trabajo, en cursos y toda actividad que entorpece el cumplimiento del trabajo)`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato`,
                        accion: `Primera vez: Llamado de atención verbal`,
                        formato: 'bitacora',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Lider inmediato`,
                        accion: `Segunda vez: Llamado de atención verbal`,
                        formato: 'bitacora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `Tercera vez: Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 4,
                        instancia: ``,
                        accion: `Si la conducta llega a una 4to llamado de atención es levantamiento de acta administrativa y sí hay reincidencia se evalua baja del colaborador.`,
                        formato: null,
                        salida: `Considerar un tabulador de baja por antigüedad`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad`
            },
        ]
    },

    // ── NIVEL MODERADO (Folios 5–52) ──────────────────────────────────────────
    nivel_moderado: {
        descripcion: 'Conductas de impacto intermedio. Requieren intervención del Enlace Talento y pueden derivar en baja.',
        folios: [
            {
                folio: 5,
                conducta: `Levantamiento de efectivo en campo sin recibo oficial y  sin autorización del jefe inmediato, acreditando el depósito bancario a la cuenta de la institución.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa`,
                        formato: 'acta_administrativa',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `3.- Una tercera reincidencia es baja.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 6,
                conducta: `Incumplimiento de tareas o plazos de forma recurrente: No entregar trabajos a tiempo de manera sistemática, tareas planteadas o compromisos de minutas, en el tiempo establecido.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/ Enlace Juridico`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 7,
                conducta: `Descuido o negligencia en el cumplimiento de las funciones: Errores repetitivos por falta de atención que causan pequeños perjuicios.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 8,
                conducta: `Uso indebido de recursos de la empresa: software, hardware, vehiculos, papelería para fines distintos a los intereses de CONSERVA.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/ Enlace Juridico`,
                        accion: `1.- Acta Administrativa con nota de advertencia de "Si se vuelve a repetir" se aplicará la baja del colaborador y si hay daño ocasionado se ejecutará la sanción económica del pago.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 9,
                conducta: `Discutir de política y realizar cualquier clase de juego en donde haya contacto físico que implique violencia o daño, sin justificación alguna. Todo acto de violencia cometidos contra otros colaboradores o su familia cometidos dentro o fuera del centro de trabajo.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/ Enlace Juridico`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 10,
                conducta: `Cuando el rendimiento de un colaborador cae, por debajo de los estándares establecidos u objetivos marcados en la medición del desempeño, sin justificación:  cumplimiento de KPI´S institucionales.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/ Enlace Juridico`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja sino mejora el desempeño.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 11,
                conducta: `No notificar a quien corresponda cualquier accidente de trabajo que pongan en riesgo las actividades a desempeñar;  (notificaciones de las autoridades)`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/ Enlace Juridico`,
                        accion: `3.Levantamiento de Acta Administrativa. Considerar según sea el caso aplicar sanción económica.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 12,
                conducta: `No notificar a la Dirección Juridica cualquier documento fisico o electrónico emitido por alguna autoridad de manera inmediata en su caso por algun oficio privado de alguna entidad privada o pública y algún colaborador o excolaborador.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `3.Levantamiento de Acta Administrativa. Considerar según sea el caso aplicar sanción económica.`,
                        formato: 'acta_administrativa',
                        salida: `N/A`
                    },
                ],
                salida_economica: `N/A`
            },
            {
                folio: 13,
                conducta: `Revelación de información confidencial: Compartir datos internos, politicas, manuales, formateria  y todo lo que haga alusión a la forma de operar de la institución, ya sea que se comparta de forma impresa o digital. Al colaborador que cree, almacene o copie información institucional en medios no autorizados o cuentas personales.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/ Enlace Juridico`,
                        accion: `3.Levantamiento de Acta Administrativa y valoración de baja.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 14,
                conducta: `Abandonar su trabajo en horas de labores, sin causa justificada., sin la autorización por parte de su jefe inmediato.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 15,
                conducta: `Ausencias injustificadas sin previo aviso o autorizacion del jefe inmediato.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 16,
                conducta: `No realizar el líder los Uno a Uno con su equipo a cargo en las fechas estipuladas que afecte al colaborador la claridad de lo que se espera de él.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 17,
                conducta: `Permitir que personas ajenas a la institución o quienes no tengan el resguardo requerido, utilicen las herramientas de trabajo asignadas al colaborador.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa con nota de advertencia de "Si se vuelve a repetir" se aplicará la baja del colaborador y si hay daño ocasionado se ejecutará la sanción económica del pago.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 18,
                conducta: `Negarse en adoptar las medidas preventivas dictadas por la institución o a seguir los procedimientos indicados para evitar accidentes o enfermedades.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 19,
                conducta: `Tener préstamos o adquirir mercancía de clientes salvo que sean compras de contado para impulsar su negocio, asi mismo queda prohibido con proveedores de la institución.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 20,
                conducta: `No cumplir con el llenado de formatos y documentación institucional relacionada a las funciones y responsabilidades del puesto, así como de toda firma que corresponda al personal de CONSERVA.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa con nota de advertencia de "Si se vuelve a repetir" se aplicará la baja del colaborador.`,
                        formato: 'acta_administrativa',
                        salida: `N/A`
                    },
                ],
                salida_economica: `N/A`
            },
            {
                folio: 21,
                conducta: `No notificar en tiempo y forma de manera institucional los cambios de zona o centro de trabajos y puestos nuevos.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa con nota de advertencia de "Si se vuelve a repetir" se aplicará la baja del colaborador.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 22,
                conducta: `Incumplir, sin justificación, en los requerimientos de procesos institucionales de cualquier área o información solicitada por cualquier área dentro de la institución.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 23,
                conducta: `Generar comentarios inapropiados: chismes, calumnias que afecten el ambiente laboral, realizar bromas o burla a los demás colaboradores o representantes de la empresa que afecte la integridad física, así como discriminación en cultura, religión, estudio, sexo.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 24,
                conducta: `Alterar el clima laboral, disciplina formando grupos conflictivos en las áreas de trabajo de la institución causando daños a la imagen e integridad de otros colaboradores.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa con nota de advertencia de "Si se vuelve a repetir" se aplicará la baja del colaborador.`,
                        formato: 'acta_administrativa',
                        salida: `N/A`
                    },
                ],
                salida_economica: `N/A`
            },
            {
                folio: 25,
                conducta: `Falta de supervisión y acompañamiento al personal a cargo.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento`,
                        accion: `1.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 26,
                conducta: `Hacerse acompañar durante la jornada de trabajo de personas que no laboren en la empresa, sin justificación y sin autorización al jefe inmediato.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento`,
                        accion: `1.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 27,
                conducta: `Permanecer en el centro de trabajo o introducirse a él fuera de las horas de trabajo, sin la autorización superior.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 28,
                conducta: `Atender familiares como clientes de la institución, sean individuales o dentro de los grupos solidarios atendidos por ellos mismos, salvo que se exponga o se de conocimiento al jefe inmediato al conocer y autorizar tal situación.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento`,
                        accion: `1.- Acta Administrativa con nota de advertencia de "Si se vuelve a repetir" se aplicará la baja del colaborador.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 29,
                conducta: `Solicitar, recomendar, influir o imponer el ingreso de clientes nuevos en cualquier tipo de producto comercializado por la institución, sin apego a las politicas institucionales.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa con nota de advertencia de "Si se vuelve a repetir" se aplicará la baja del colaborador.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 30,
                conducta: `Negativa de firma de un colaborador a las Actas administrativas, Planes de Mejora o Reportes de Auditoría sin que esté lo justifiique.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa con leyenda de "el o la  trabajador (a) se negó a firmar". En caso de que la conducta de falta de disposición de parte del trabajador continua se aplicará la baja.`,
                        formato: 'llamada_atencion',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 31,
                conducta: `Documentación alterada, falsa o apócrifa: Reportes de actividad, de resultados, tales como Bitácoras de Cobranza, Cartas de Aviso de Cobranza o Verificación Ocular, domicilios, numero de telefonos, omitidas o inventadas.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa: colocar leyenda de "Si se vuelve a repetir" se aplicará la baja del colaborador.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 32,
                conducta: `Extracción parcial o total de documentación en expediente (pagarés y contratos, seguros, garantías prendarias, recibos oficiales e informacion administrativa) , sin autorizacion del jefe inmediato o responsable.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa: colocar leyenda de "Si se vuelve a repetir" se aplicará la baja del colaborador.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 33,
                conducta: `Colaborador que incremente a partir del 8% el par 1, por 3 meses consecutivos, derivado de indicadores de su bajo desempeño sin alguna justificación que no depende directamente de él.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Lider Inmediato`,
                        accion: `1..Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Comité de Honor y Jefe inmediato.`,
                        accion: `2.- Acta Administrativa. Validar la baja del colaborador con el Jefe inmediato en la instancia del Comité de Honor.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 34,
                conducta: `Hacer uso del cargo o posición del puesto (staff corporativo, gerenciales, directivos, etc.) para solicitar préstamos entre compañeros de manera recurrente.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa/Cubriendo la deuda total asumida al compañero. En caso de que la conducta del trabajador se repite se aplicará la baja.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 35,
                conducta: `Formatos y papelógrafos sin firmar, sucios o incorrectamente requisitados o con falta de información.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa evaluando la baja del colaborador.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 36,
                conducta: `Omisión de llenado oportuno de expediente de Cobranza Extrajudicial.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa evaluando la baja del colaborador.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 37,
                conducta: `No asistir o no permanecer en su zona de trabajo durante el horario de reuniones con sus grupos solidarios u otras actividades en campo.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa En caso de que la conducta del trabajador se repite se aplicará la baja.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 38,
                conducta: `Inasistencias a los grupos conforme a su agenda.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa En caso de que la conducta del trabajador se repite se aplicará la baja.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 39,
                conducta: `Hacer uso de los teléfonos celulares institucionales, con objetivos distintos al del uso del trabajo o necesidades de la empresa o funciones del puesto, salvo la autorizaación previa del jefe inmedaito.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa evaluando la baja del colaborador.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 40,
                conducta: `Hacer uso de teléfonos celulares, aunque sea con audífonos o manos libres durante una reunión de grupo solidario.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa evaluando la baja del colaborador.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 41,
                conducta: `No mantener las camaras encendidas en reuniones de trabajo o eventos institucionales on-line, sin justificación alguna.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 42,
                conducta: `En cobranza telefónica, no se deben utilizar números de teléfono que aparezcan en el identificador de llamadas como “confidencial”, “oculto”, “privado”; Amenazar, ofender o intimidar a la deudora, sus familiares, compañeros de trabajo o cualquier otra persona que no tenga relación con la deuda, hacer cobranza con menores o de tercera edad; así como.para hacer dicha gestión, antes de la 7.00 a.m. y después de las 23.00 horas; Enviar documentos que aparenten ser escritos judiciales u ostentarse como representantes de algún órgano jurisdiccional o autoridad.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `1.- Acta Administrativa En caso de que la conducta del trabajador se repite se aplicará la baja.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 43,
                conducta: `El incumplimiento injustificado de las renovaciones de crédito de los clientes, bajo las metas definididas.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 44,
                conducta: `Asistir a un lugar donde exista venta de bebidas alcoholicas, portando el uniforme fuera del horario de trabajo, aunque el colaborador no este consumiendo bebidas alcohólicas.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 45,
                conducta: `Acción u omisión deliberada del líder de no documentar e informar conductas por proteger al colaborador expone a la institución.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 46,
                conducta: `Hacer uso de WhatsApp instituicional con objetivos distintos al del uso del trabajo o necesidades de la empresa o funciones del puesto, salvo la autorización previa del jefe inmediato.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `N/A`
                    },
                ],
                salida_economica: `N/A`
            },
            {
                folio: 47,
                conducta: `Presión indebida por resultados. Exigir metas cruzando límites éticos o normativos.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 48,
                conducta: `Promesas fuera de política. Compromisos verbales no autorizados a clientes.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 49,
                conducta: `Trato preferencial injustificado, hacia colaboradores y/o clientes. Favoritismos que dañan el clima laboral.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 50,
                conducta: `Normalizar malas prácticas, justificar conductas por costumbre histórica que violenten las politicas institucionales.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento/Enlace Juridico`,
                        accion: `2.Reincidencia/Levantamiento de Acta Administrativa y valoración de baja`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 51,
                conducta: `No documentar incidencias y reincidencias de conductas del colaborador, establecidas en la matriz de acciones correctivas.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
            {
                folio: 52,
                conducta: `No rotar al personal bajo las politicas operativas institucionales.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Lider inmediato/ Con conocimiento de Enlace Talanto.`,
                        accion: `1. Llamado de atención x escrito.`,
                        formato: 'llamada_atencion',
                        salida: `N/A`
                    },
                    {
                        paso: 2,
                        instancia: `Enlace Talento`,
                        accion: `2.Plan de Mejora`,
                        formato: 'plan_mejora',
                        salida: `N/A`
                    },
                    {
                        paso: 3,
                        instancia: `Enlace Talento`,
                        accion: `3.Reincidencia/Levantamiento de Acta Administrativa.`,
                        formato: 'acta_administrativa',
                        salida: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
                    },
                ],
                salida_economica: `Considerar un tabulador de baja por antigüedad, según sea el caso de resolución.`
            },
        ]
    },

    // ── NIVEL GRAVE (Folios 53–75) ────────────────────────────────────────────
    nivel_grave: {
        descripcion: 'Tolerancia cero. Baja inmediata con finiquito.',
        instancia: 'Comité de Honor (puede participar el Director General y Auditoría Interna)',
        accion: 'Levantamiento de Acta para proceder con la baja',
        salida_economica: 'Finiquito',
        folios: [
            {
                folio: 53,
                conducta: `Sustraer sin autorización cualquier activo propio de la institución o hurto de bienes de la empresa y/o de compañeros tipificado a las leyes jurídicas.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 54,
                conducta: `Vulnerar la seguridad física (agresión con contacto físico, verbal, amenazas) o permitir que terceras personas lo hagan de colaboradores, clientes y proveedores`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 55,
                conducta: `Acoso laboral o sexual a los colaboradores y compañeros de trabajo, clientes de la empresa y proveedores: Conductas de intimidación, humillación, hostigamiento, agresión, alusiones verbales o gestuales de corte violento, de doble sentido particular cuando estas son consideradas ofensivas.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 56,
                conducta: `Daño intencional a la propiedad de la institución. Destruir o deteriorar bienes de forma deliberada.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 57,
                conducta: `Hacer mal uso de la imagen institucional en redes sociales y en las cuentas personales, mal uso de los promocionales, lonas, gorras, mochilas o usar el logotipo de la empresa para fines no institucionales.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 58,
                conducta: `Presentarse a laborar con aliento alcohólico o en estado de ebriedad, así como adquirir y/o consumir bebidas alcohólicas, narcóticos o drogas en horas laborales, durante el horario de trabajo. Lo mismo aplica fuera del horario cuando el colaborador porte el uniforme o mientras se está en posesión de herramientas de trabajo propiedad de CONSERVA.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 59,
                conducta: `Portar armas de cualquier clase durante la jornada de trabajo, dentro de las instalaciones de la empresa, con los clientes y/o proveedores, portando el uniforme de la empresa y/ en una comisión autorizada por la empresa, se exceptúan los punzantes o punzocortantes que formen parte de las herramientas de trabajo.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 60,
                conducta: `Relaciones extramaritales sea con clientes o los familiares de los clientes, o con personal de la empresa.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 61,
                conducta: `No aprobar hasta en una tercera y última oportunidad, la evaluación anual en materia de PLD.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 62,
                conducta: `Con respecto a las alertas por PLD/ FT que proporcione el sistema de informatica, y en general a la información de la que CONSERVA sea informada sobre sus clientes, el personal deberá guardar absoluta discreción, por lo que alertar o dar aviso a los clientes o a terceros producirá las Acciones correctivas que señale la institución`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 63,
                conducta: `Comprometer el trabajador, por su imprudencia o descuido inexcusable, la seguridad del establecimiento o de las personas que se encuentren en él.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 64,
                conducta: `La sentencia ejecutoriada que imponga al trabajador una pena de prisión, que le impida el cumplimiento de la relación de trabajo.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 65,
                conducta: `Falsear o negar información cambio de domicilio, lugar de residencia, situación familiar, estado civil cuando se realicen actualizaciones de datos y la institución lo requiera.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 66,
                conducta: `Entregar beneficios al cliente que no cumplen con las políticas institucionales (bonificación, premios, rifas, servicios no financieros de salud, capacitación).`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 67,
                conducta: `Ser corresponsable de malas prácticas y/o acciones que afecten los resultados que no permitan el logro de los objetivos institucionles.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja/ En casos de malas prácticas aplica baja para el corresponsable`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 68,
                conducta: `Comprobación de un fraude premeditado o engañando a los clientes o participar en una operación de fraude que implique pérdida posible.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja/ Denuncia`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 69,
                conducta: `Otorgar crédito a los clientes con recursos ajenos a los que CONSERVA determine para tal fin.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 70,
                conducta: `Fungir como beneficiario o prestanombres del crédito o seguros de CONSERVA.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 71,
                conducta: `Obligue o persuada a los clientes para hacer solicitudes de préstamos de CONSERVA a nombre o beneficio del mismo colaborador, usando al cliente como intermediario.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 72,
                conducta: `Aceptar o solicitar dinero, dádivas, regalos o descuentos a los clientes, así como proveedores que tengan una relación comercial con la empresa y que pueden influir en contratos o adquisiciones para servicios de esta.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 73,
                conducta: `Otorgue crédito a los clientes con recursos ajenos a los que CONSERVA determine para tal fin.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 74,
                conducta: `Falsifique o altere firmas y/ o documentación o que, por omisión, permita que se integren expedientes con documentación falsificada por el solicitante.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja/ En casos de omitir denunciar el Jefe inmediato estas malas prácticas aplica baja para el corresponsable.`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
            {
                folio: 75,
                conducta: `quitarla arriba/No notificar a la Dirección Juridica cualquier documento fisico o electrónico emitido por alguna autoridad de manera inmediatao en su caso por algun oficio privado de alguna entidad privada o pública y algún colaborador o excolaborador.`,
                instancias: [
                    {
                        paso: 1,
                        instancia: `Comité de Honor (puede participar el Director General y desde está instancia se puede requerir la participación de Auditorita Interna)`,
                        accion: `Levantamiento de Acta para proceder con la baja/ En casos de omitir denunciar el Jefe inmediato estas malas prácticas aplica baja para el corresponsable.`,
                        formato: 'todos_baja',
                        salida: `Finiquito`
                    },
                ],
                salida_economica: `Finiquito`
            },
        ]
    }
};

/**
 * Detecta qué formatos son relevantes para un folio.
 * Usa FOLIO_FORMAT_MAP primero (datos exactos del Excel).
 * Fallback: detección por palabras clave de la conducta.
 *
 * @param {string|number} conductaOrFolio - Texto de conducta O número de folio
 * @param {string} nivel - 'LEVE', 'MODERADA', 'GRAVE'
 * @param {number} [folioNum] - Número de folio si se conoce
 */
export function detectarFormatosRelevantes(conductaOrFolio, nivel, folioNum = null) {
    // 1. Si tenemos número de folio → usar mapa exacto del Excel
    if (folioNum && FOLIO_FORMAT_MAP[folioNum]) {
        return FOLIO_FORMAT_MAP[folioNum]
            .map(key => FORMATOS_SANCIONES[key])
            .filter(Boolean);
    }

    // 2. GRAVE → siempre todos los formatos de baja
    if (nivel === 'GRAVE') {
        return [FORMATOS_SANCIONES.todos_baja];
    }

    // 3. Fallback por palabras clave de la conducta
    const q = (String(conductaOrFolio) || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const relevantes = [];
    if (q.includes('bitacora') || q.includes('verbal') || q.includes('llegada') || q.includes('tarde')) {
        relevantes.push(FORMATOS_SANCIONES.bitacora);
    }
    if (q.includes('llamada') || q.includes('llamado') || q.includes('escrito') || q.includes('atencion')) {
        relevantes.push(FORMATOS_SANCIONES.llamada_atencion);
    }
    if (q.includes('plan') || q.includes('mejora') || q.includes('rendimiento') || q.includes('desempeno') || q.includes('productividad')) {
        relevantes.push(FORMATOS_SANCIONES.plan_mejora);
    }
    if (q.includes('investigacion') || q.includes('fraude') || q.includes('robo') || q.includes('hurto')) {
        relevantes.push(FORMATOS_SANCIONES.acta_investigacion);
    }
    if (q.includes('acta') || q.includes('levantamiento') || q.includes('rescision') || q.includes('baja')) {
        relevantes.push(FORMATOS_SANCIONES.acta_administrativa);
    }

    return relevantes.length > 0
        ? relevantes
        : [FORMATOS_SANCIONES.llamada_atencion, FORMATOS_SANCIONES.acta_administrativa];
}

/**
 * Busca folios por conducta. Busca en los 3 niveles.
 */
export function buscarFolios(query) {
    const q = (query || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/gi, '');
    const words = q.split(/\s+/).filter(w => w.length > 3);
    if (words.length === 0) return [];

    const todos = [
        ...SAN_DATA.nivel_leve.folios,
        ...SAN_DATA.nivel_moderado.folios,
        ...SAN_DATA.nivel_grave.folios
    ];

    const resultados = [];
    for (const folio of todos) {
        const conducta = (folio.conducta || '').toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/gi, '');
        let matches = 0;
        for (const word of words) {
            if (conducta.includes(word)) matches++;
        }
        const score = matches / Math.max(words.length, 1);
        if (score >= 0.25) {
            resultados.push({ ...folio, score,
                nivel: folio.nivel || (folio.folio <= 4 ? 'LEVE' : folio.folio <= 52 ? 'MODERADA' : 'GRAVE')
            });
        }
    }

    return resultados.sort((a, b) => b.score - a.score).slice(0, 5);
}
