/**
 * app/stats.js
 * Módulo de Estadísticas para Promotores.
 * Lee data/stats_cc_names.json (pequeño) para verificar acceso.
 * Lee data/stats_data.json (generado por script PS) para mostrar gráficas.
 */

let _statsData = null;      // caché de datos completos
let _ccNamesSet = null;     // Set de nombres normalizados en columna CC

/** Normaliza el nombre para comparación: sin acentos, mayúsculas, espacios extra. */
function normalizeName(name) {
    if (!name) return '';
    return name
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Carga el JSON de estadísticas (la primera vez; luego usa caché). */
async function _loadStatsData() {
    if (_statsData) return _statsData;
    const resp = await fetch('./data/stats_cc_names.json');
    if (!resp.ok) throw new Error('No se pudo cargar stats_cc_names.json');
    _statsData = await resp.json();

    // Construir Set de nombres normalizados para búsqueda rápida
    _ccNamesSet = new Set(
        (_statsData.promotores || []).map(n => normalizeName(n))
    );
    return _statsData;
}

/**
 * Verifica si el colaborador está en la columna CC del Excel.
 * @param {string} nombre - nombre del colaborador (de _collab_raw.json)
 * @returns {Promise<boolean>}
 */
export async function isPromoterInExcel(nombre) {
    try {
        await _loadStatsData();
        return _ccNamesSet.has(normalizeName(nombre));
    } catch {
        return false;
    }
}

/**
 * Obtiene las filas de datos del promotor filtradas por tipo de mora.
 * @param {string} nombre - nombre del promotor
 * @param {'PAR1'|'PAR6'|'PAR30'|'ALL'} tipo
 * @returns {Promise<object>} - { resumen, clientes, headers }
 */
export async function getPromoterStats(nombre, tipo = 'ALL') {
    const data = await _loadStatsData();
    const normalNombre = normalizeName(nombre);

    // Filtrar todas las filas del promotor
    const filas = (data.datos || []).filter(
        row => normalizeName(row.CC) === normalNombre
    );

    // Mapeo real de columnas (encabezados del Excel hoja MESACT):
    // AY = PAR_1_G  (grupos par1)
    // AZ = PAR_1_C  (clientes par1)
    // BA = PAR_1_SALDO
    // BB = PAR_6_G  (grupos par6)
    // BC = PAR_6_C  (clientes par6)
    // BD = PAR_6_SALDO
    // BE = PAR_30_G (grupos par30)
    // BF = PAR_30_C (clientes par30)
    // BG = PAR_30_SALDO (estimado; ajustar si difiere)
    const colMap = {
        PAR1: { grupos: 'AY', clientes: 'AZ', saldo: 'BA', label: 'Par 1' },
        PAR6: { grupos: 'BB', clientes: 'BC', saldo: 'BD', label: 'Par 6' },
        PAR30: { grupos: 'BE', clientes: 'BF', saldo: 'BG', label: 'Par 30' },
    };

    // Headers legibles desde el JSON
    const headers = data.columnas || {};

    const buildResumen = (col) => ({
        totalGrupos: filas.reduce((s, r) => s + (Number(r[col.grupos]) || 0), 0),
        totalClientes: filas.reduce((s, r) => s + (Number(r[col.clientes]) || 0), 0),
        totalSaldo: filas.reduce((s, r) => s + (Number(r[col.saldo]) || 0), 0),
    });

    if (tipo !== 'ALL' && colMap[tipo]) {
        const col = colMap[tipo];
        const resumen = buildResumen(col);
        const clientes = filas
            .filter(r => (Number(r[col.clientes]) || 0) > 0)
            .map(r => ({
                nombre: r.nombre_cliente || '(Sin nombre)',
                grupos: Number(r[col.grupos]) || 0,
                clientes: Number(r[col.clientes]) || 0,
                saldo: Number(r[col.saldo]) || 0,
            }))
            .sort((a, b) => b.saldo - a.saldo);
        return { tipo, label: col.label, resumen, clientes, filas };
    }

    // Todos los tipos para gráfica comparativa
    const resumenAll = Object.fromEntries(
        Object.entries(colMap).map(([k, col]) => [k, buildResumen(col)])
    );
    return { tipo: 'ALL', resumenAll, colMap, filas };
}

/**
 * Renderiza todas las gráficas en el contenedor de estadísticas.
 * @param {string} containerSelector - ID del elemento contenedor
 * @param {object} stats - resultado de getPromoterStats
 * @param {string} nombrePromotor
 */
export function renderStatsCharts(containerEl, stats, nombrePromotor) {
    containerEl.innerHTML = '';

    if (stats.tipo !== 'ALL') {
        _renderSingleTipo(containerEl, stats, nombrePromotor);
    } else {
        _renderComparativo(containerEl, stats, nombrePromotor);
    }
}

function _fmt(num) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num);
}

function _renderSingleTipo(containerEl, stats, nombrePromotor) {
    const { tipo, label, resumen, clientes } = stats;

    // ── Tarjetas de resumen
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'stats-summary';
    summaryDiv.innerHTML = `
        <div class="stats-card">
            <div class="stats-card-label">Grupos en ${label}</div>
            <div class="stats-card-value">${(resumen.totalGrupos || 0).toLocaleString('es-MX')}</div>
        </div>
        <div class="stats-card">
            <div class="stats-card-label">Clientes en ${label}</div>
            <div class="stats-card-value">${resumen.totalClientes.toLocaleString('es-MX')}</div>
        </div>
        <div class="stats-card">
            <div class="stats-card-label">Saldo total ${label}</div>
            <div class="stats-card-value">${_fmt(resumen.totalSaldo)}</div>
        </div>`;
    containerEl.appendChild(summaryDiv);

    // ── Gráfica de barras horizontal: top 15 clientes por saldo
    if (clientes.length > 0) {
        const top = clientes.slice(0, 15);
        const canvasWrap = document.createElement('div');
        canvasWrap.className = 'stats-chart-wrap';
        const title = document.createElement('h3');
        title.className = 'stats-section-title';
        title.textContent = `Top ${top.length} registros por saldo (${label})`;
        canvasWrap.appendChild(title);

        const canvas = document.createElement('canvas');
        canvas.id = `chart-bar-${tipo}`;
        canvas.height = 340;
        canvasWrap.appendChild(canvas);
        containerEl.appendChild(canvasWrap);

        // eslint-disable-next-line no-undef
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: top.map(c => c.nombre.substring(0, 28)),
                datasets: [{
                    label: 'Saldo MXN',
                    data: top.map(c => c.saldo),
                    backgroundColor: 'rgba(82,183,136,0.7)',
                    borderColor: 'rgba(82,183,136,1)',
                    borderWidth: 1,
                    borderRadius: 4,
                }],
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => _fmt(ctx.parsed.x) } } },
                scales: {
                    x: { ticks: { color: '#a8c9b1', callback: v => _fmt(v) }, grid: { color: 'rgba(82,183,136,0.1)' } },
                    y: { ticks: { color: '#a8c9b1', font: { size: 11 } }, grid: { display: false } },
                },
            },
        });

        // ── Tabla de todos los clientes
        const tableWrap = document.createElement('div');
        tableWrap.className = 'stats-table-wrap';
        const tableTitle = document.createElement('h3');
        tableTitle.className = 'stats-section-title';
        tableTitle.textContent = `Todos los registros en ${label} (${clientes.length})`;
        tableWrap.appendChild(tableTitle);

        const table = document.createElement('table');
        table.className = 'stats-table';
        table.innerHTML = `
        <thead><tr><th>#</th><th>Cliente / Acreditada</th><th>Grupos</th><th>Clientes</th><th>Saldo</th></tr></thead>
        <tbody>
          ${clientes.map((c, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${c.nombre}</td>
              <td>${c.grupos}</td>
              <td>${c.clientes}</td>
              <td>${_fmt(c.saldo)}</td>
            </tr>`).join('')}
        </tbody>`;
        tableWrap.appendChild(table);
        containerEl.appendChild(tableWrap);
    } else {
        const empty = document.createElement('p');
        empty.className = 'stats-empty';
        empty.textContent = `No hay registros en ${label} para ${nombrePromotor}.`;
        containerEl.appendChild(empty);
    }
}

function _renderComparativo(containerEl, stats, nombrePromotor) {
    const { resumenAll } = stats;
    const tipos = ['PAR1', 'PAR6', 'PAR30'];

    // ── Tarjetas comparativas
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'stats-summary';
    tipos.forEach(t => {
        const r = resumenAll[t];
        if (!r) return;
        const card = document.createElement('div');
        card.className = 'stats-card';
        card.innerHTML = `
            <div class="stats-card-label">${t}</div>
            <div class="stats-card-value">${(r.totalClientes || 0).toLocaleString('es-MX')}</div>
            <div class="stats-card-sublabel">clientes</div>
            <div class="stats-card-value stats-card-value--sm">${_fmt(r.totalSaldo || 0)}</div>`;
        summaryDiv.appendChild(card);
    });
    containerEl.appendChild(summaryDiv);

    // ── Donut: proporción de clientes por tipo
    const donutWrap = document.createElement('div');
    donutWrap.className = 'stats-chart-wrap stats-chart-wrap--sm';
    const donutTitle = document.createElement('h3');
    donutTitle.className = 'stats-section-title';
    donutTitle.textContent = 'Distribución de clientes por mora';
    donutWrap.appendChild(donutTitle);

    const donutCanvas = document.createElement('canvas');
    donutCanvas.id = 'chart-donut-all';
    donutCanvas.style.maxHeight = '280px';
    donutWrap.appendChild(donutCanvas);
    containerEl.appendChild(donutWrap);

    // eslint-disable-next-line no-undef
    new Chart(donutCanvas, {
        type: 'doughnut',
        data: {
            labels: tipos,
            datasets: [{
                data: tipos.map(t => resumenAll[t]?.totalClientes || 0),
                backgroundColor: ['rgba(82,183,136,0.8)', 'rgba(255,183,77,0.8)', 'rgba(239,83,80,0.8)'],
                borderColor: ['rgb(82,183,136)', 'rgb(255,183,77)', 'rgb(239,83,80)'],
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#a8c9b1' } },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.label}: ${ctx.parsed.toLocaleString('es-MX')} clientes`,
                    },
                },
            },
        },
    });

    // ── Barras comparativas de saldo
    const barWrap = document.createElement('div');
    barWrap.className = 'stats-chart-wrap';
    const barTitle = document.createElement('h3');
    barTitle.className = 'stats-section-title';
    barTitle.textContent = 'Saldo total por tipo de mora';
    barWrap.appendChild(barTitle);

    const barCanvas = document.createElement('canvas');
    barCanvas.id = 'chart-bar-all';
    barCanvas.height = 180;
    barWrap.appendChild(barCanvas);
    containerEl.appendChild(barWrap);

    // eslint-disable-next-line no-undef
    new Chart(barCanvas, {
        type: 'bar',
        data: {
            labels: tipos,
            datasets: [{
                label: 'Saldo MXN',
                data: tipos.map(t => resumenAll[t]?.totalSaldo || 0),
                backgroundColor: ['rgba(82,183,136,0.7)', 'rgba(255,183,77,0.7)', 'rgba(239,83,80,0.7)'],
                borderColor: ['rgb(82,183,136)', 'rgb(255,183,77)', 'rgb(239,83,80)'],
                borderWidth: 1,
                borderRadius: 6,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => _fmt(ctx.parsed.y) } },
            },
            scales: {
                x: { ticks: { color: '#a8c9b1' }, grid: { color: 'rgba(82,183,136,0.1)' } },
                y: { ticks: { color: '#a8c9b1', callback: v => _fmt(v) }, grid: { color: 'rgba(82,183,136,0.1)' } },
            },
        },
    });
}
