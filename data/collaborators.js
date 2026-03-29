/**
 * data/collaborators.js
 * Base de colaboradores cargada desde el Layout_Ecosistema_v1.0
 * Fuente: Layout_Ecosistema_v1.0_modulos_CON_MAN_VIA
 */

// Fetch + parse del JSON generado por el script de parseo
let _cache = null;

async function _loadData() {
  if (_cache) return _cache;
  try {
    const resp = await fetch('/data/_collab_raw.json');
    if (!resp.ok) throw new Error(`HTTP ${resp.status} al cargar colaboradores`);
    const arr = await resp.json();
    // Normalizar correos a minúsculas
    _cache = arr.map(c => ({ ...c, correo: (c.correo || '').toLowerCase().trim() }));
    return _cache;
  } catch (err) {
    console.error('[Auth] Error cargando base de colaboradores:', err);
    return []; // devuelve lista vacía en vez de crashear
  }
}

/**
 * Busca un colaborador por correo electrónico.
 * Búsqueda exacta e insensible a mayúsculas/minúsculas.
 * @returns {Promise<object|null>}
 */
export async function findByEmail(email) {
  const data = await _loadData();
  const norm = (email || '').toLowerCase().trim();
  return data.find(c => c.correo === norm) ?? null;
}

/**
 * Verifica si hoy es el cumpleaños del colaborador.
 * Compara únicamente mes y día.
 * @param {string} fechaNacimiento - formato YYYY-MM-DD
 * @param {Date} [now] - fecha de referencia (default: hoy)
 * @returns {boolean}
 */
export function isBirthday(fechaNacimiento, now = new Date()) {
  if (!fechaNacimiento || !fechaNacimiento.includes('-')) return false;
  const parts = fechaNacimiento.split('-');
  if (parts.length < 3) return false;
  const mesNac = parseInt(parts[1], 10);
  const diaNac = parseInt(parts[2], 10);
  return mesNac === (now.getMonth() + 1) && diaNac === now.getDate();
}
