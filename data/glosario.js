/**
 * data/glosario.js
 * Glosario institucional CONSERVA
 * Fuente: Manuales institucionales y normativa interna
 */

export const GLOSARIO = [
  // ── Financiero ──────────────────────────────────────────────────
  { term: 'CAT', full: 'Costo Anual Total', def: 'Indicador que expresa el costo total del crédito como porcentaje anual, incluyendo tasa de interés, comisiones y cargos. Sirve para comparar productos financieros. Ejemplo en Mujeres de Palabra: 200.1%.' },
  { term: 'PAR-1', full: 'Cartera en Riesgo > 1 día', def: 'Porcentaje del saldo de la cartera que tiene al menos 1 día de atraso. Indicador clave de morosidad. PAR-1 < 4% = riesgo controlado (semáforo verde).' },
  { term: 'PAR-30', full: 'Cartera en Riesgo > 30 días', def: 'Porcentaje del saldo de cartera con más de 30 días de atraso. Indica problemas de recuperación más graves.' },
  { term: 'DDA', full: 'Días de Atraso', def: 'Número de días que un cliente lleva sin pagar desde la fecha en que debía hacerlo. Cero DDA es requisito para crédito paralelo.' },
  { term: 'KPI', full: 'Key Performance Indicator', def: 'Indicador clave de desempeño. En CONSERVA mide productividad de promotores: colocación, recuperación y calidad de cartera.' },
  { term: 'CFDI', full: 'Comprobante Fiscal Digital por Internet', def: 'Factura electrónica válida ante el SAT. Compuesta de archivo PDF y XML. Requerida para comprobar gastos de viáticos y caja chica.' },
  { term: 'SPEI', full: 'Sistema de Pagos Electrónicos Interlbancarios', def: 'Transferencia bancaria electrónica inmediata. Método de dispersión del desembolso de créditos individuales y paralelos.' },
  { term: 'SIC', full: 'Sociedad de Información Crediticia', def: 'Entidad que concentra el historial crediticio de personas. CONSERVA consulta principalmente Círculo de Crédito.' },
  { term: 'SOFOM', full: 'Sociedad Financiera de Objeto Múltiple', def: 'Figura legal no bancaria que puede otorgar crédito. CONSERVA opera como SOFOM ENR (Entidad No Regulada por la CNBV directamente).' },
  { term: 'ENR', full: 'Entidad No Regulada', def: 'Clasificación de SOFOM que no capta recursos del público. CONSERVA es SOFOM ENR.' },
  { term: 'CNBV', full: 'Comisión Nacional Bancaria y de Valores', def: 'Organismo que regula y supervisa el sistema financiero mexicano. Supervisa a las SOFOM ER.' },
  { term: 'CONDUSEF', full: 'Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros', def: 'Institución que defiende los derechos de los usuarios financieros. Los contratos de CONSERVA están registrados ante CONDUSEF con número RECA.' },
  { term: 'RECA', full: 'Registro de Contrato de Adhesión', def: 'Número de registro de contratos de crédito ante la CONDUSEF. Obligatorio en todos los contratos CONSERVA.' },
  { term: 'PLD', full: 'Prevención de Lavado de Dinero', def: 'Conjunto de políticas y controles para detectar y prevenir el lavado de dinero. Los colaboradores deben aprobar la evaluación anual. Reprobar 3 veces = baja inmediata.' },
  { term: 'FT', full: 'Financiamiento al Terrorismo', def: 'Actividad ilícita que busca financiar actos terroristas. CONSERVA implementa controles PLD/FT como parte de su normativa.' },
  { term: 'LISR', full: 'Ley del Impuesto Sobre la Renta', def: 'Ley fiscal mexicana. Aplica en la comprobación de viáticos internacionales conforme al Art. 28.' },
  { term: 'SAT', full: 'Servicio de Administración Tributaria', def: 'Autoridad fiscal mexicana. Emite la Constancia de Situación Fiscal (CSF) requerida en algunos trámites de crédito.' },
  { term: 'RFC', full: 'Registro Federal de Contribuyentes', def: 'Clave única fiscal asignada por el SAT. Requerida para facturación. Los clientes con RFC tienen exención de IVA sobre intereses.' },
  { term: 'CURP', full: 'Clave Única de Registro de Población', def: 'Identificación única de personas físicas en México. CONSERVA proporciona el servicio de impresión en sucursal.' },
  // ── Operativos ──────────────────────────────────────────────────
  { term: 'COCS', full: 'Comité Operativo de Crédito de Sucursal', def: 'Instancia local de autorización de créditos. Se convoca cuando el monto grupal supera $200,000 en SOL o $70,000 en T Activa.' },
  { term: 'ENCI', full: 'Ejecutivo de Negocios de Crédito Individual', def: 'Puesto operativo que gestiona el ciclo completo del crédito individual: prospección, análisis, desembolso y cobranza.' },
  { term: 'OPR', full: 'Orden de Pago Referenciada', def: 'Documento que el cliente usa para pagar su crédito en banco o corresponsal. Incluye número de referencia único.' },
  { term: 'MC', full: 'Mesa de Control', def: 'Área corporativa que evalúa y autoriza solicitudes de crédito individual de mayor monto o riesgo. Emite "Recomendación positiva" o negativa.' },
  { term: 'HF', full: 'Sistema HF (Helios Financial)', def: 'Sistema de información central de CONSERVA. Se usa para registrar pagos, consultar historiales y gestionar cartera.' },
  { term: 'DAF', full: 'Dirección de Administración y Finanzas', def: 'Área corporativa responsable de Caja Chica, Viáticos, Tesorería y Administración general.' },
  { term: 'EOG', full: 'Empresa de Outsourcing / Especializada de Contratación', def: 'Personal contratado por empresa tercera que opera en CONSERVA. Tienen procedimientos de viáticos diferentes a SOFOM.' },
  { term: 'ESR', full: 'Empresa Socialmente Responsable', def: 'Distintivo que CONSERVA mantiene desde 2010. Se trabaja anualmente para conservarlo.' },
  { term: 'TH', full: 'Talento Humano (Dirección)', def: 'Área de Recursos Humanos de CONSERVA. Gestiona altas, bajas, desarrollo y bienestar del colaborador.' },
  // ── Crédito ─────────────────────────────────────────────────────
  { term: 'Ciclo', full: 'Ciclo de Crédito', def: 'Número de veces que un cliente ha tenido y completado un crédito con CONSERVA. Determina el monto máximo y la bonificación aplicable.' },
  { term: 'DDA', full: 'Días de Atraso', def: 'Días transcurridos sin pago desde la fecha programada. DDA = 0 es requisito para renovar y para crédito paralelo.' },
  { term: 'Bonificación', full: 'Descuento por Pago Puntual', def: 'Reducción de la tasa de interés por pagar a tiempo. En Mujeres de Palabra: 0.5% ciclos 1-5, 0.75% ciclos 6-9, 1% ciclo 10+.' },
  { term: 'Garantía Líquida', full: 'Depósito en Garantía', def: 'Depósito equivalente al 10% del monto solicitado que el cliente realiza antes del desembolso. Permanece en CONSERVA durante el crédito.' },
  { term: 'Individualización', full: 'Proceso de Individualización', def: 'Retiro de una integrante del grupo solidario que no pagó hasta 2 cuotas, para que el resto pueda continuar o renovar.' },
  { term: 'Mesa Directiva', full: 'Mesa Directiva del Grupo', def: 'Presidenta, Secretaria y Tesorera del grupo solidario. Obligatoria en Mujeres de Palabra. Los roles rotan anualmente.' },
  { term: 'Reestructura', full: 'Reestructuración de Crédito', def: 'Modificación de las condiciones del crédito (plazo, cuota) para adecuarlo a la capacidad de pago. No cancela la bonificación necesariamente.' },
  { term: 'Cobranza Extrajudicial', full: 'Cobranza Extrajudicial', def: 'Gestión de recuperación de cartera vencida mediante contacto directo con el cliente, sin intervención judicial. Folio 36 de la Matriz de Sanciones.' },
  { term: 'COCS', full: 'Comité Operativo de Crédito de Sucursal', def: 'Instancia local de aprobación de créditos. Requerido para montos grupales superiores a $200,000 en SOL.' },
];

export function buscarGlosario(query) {
  const q = (query || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return GLOSARIO.filter(g => {
    const text = (g.term + ' ' + g.full + ' ' + g.def).toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return text.includes(q);
  });
}
