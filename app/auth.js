/**
 * app/auth.js
 * Autenticación con contraseña individual por colaborador.
 * 
 * Flujo:
 *  1. Usuario ingresa correo + contraseña
 *  2. Se busca el colaborador por correo en _collab_raw.json
 *  3. Se hashea la contraseña ingresada con SHA-256
 *  4. Se compara contra el password_hash almacenado en el JSON del colaborador
 *  5. Si coincide → sesión iniciada
 * 
 * Para cambiar la contraseña de un colaborador:
 *  - Genera el hash SHA-256 de la nueva contraseña
 *  - Actualiza el campo password_hash en _collab_raw.json
 *  - Redespliega en Cloudflare Pages
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmailFormat(email) {
    return EMAIL_RE.test((email || '').trim());
}

/**
 * Hash SHA-256 nativo del navegador (sin librerías)
 * Compatible con Android 8+ y todos los navegadores modernos
 */
export async function sha256(message) {
    try {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        // Fallback para entornos HTTP o muy viejos (no debería ocurrir en producción HTTPS)
        console.warn('[Auth] crypto.subtle no disponible, usando fallback');
        return null;
    }
}

/**
 * Busca colaborador por correo y valida su contraseña individual.
 * La contraseña se verifica contra password_hash del propio colaborador.
 */
export async function lookupCollaborator(email, pass) {
    const { findByEmail } = await import('../data/collaborators.js');
    const collab = await findByEmail(email);

    if (!collab) return null; // correo no encontrado

    // Calcular hash de la contraseña ingresada
    const inputHash = await sha256(pass);

    if (inputHash && collab.password_hash) {
        // Comparación segura: hash vs hash almacenado del colaborador
        if (inputHash === collab.password_hash) return collab;
        return null;
    }

    // Fallback: si crypto.subtle no está disponible o el colaborador
    // no tiene password_hash aún, comparar directamente (temporal)
    if (!collab.password_hash && pass === 'Conserva2026') return collab;

    return null;
}

export async function checkIsBirthday(dateString) {
    const { isBirthday } = await import('../data/collaborators.js');
    return isBirthday(dateString);
}

// ── Session Manager ───────────────────────────────────────────
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hora
const SESSION_WARN_MS    =  5 * 60 * 1000; // aviso a los 55 min

export class SessionManager {
    constructor(onExpire, onWarn) {
        this._timer     = null;
        this._warnTimer = null;
        this._onExpire  = onExpire;
        this._onWarn    = onWarn;
        this._startTime = null;
        this._collaborator = null;
    }

    start(collaborator) {
        this._collaborator = collaborator;
        this._startTime    = Date.now();
        this._resetTimer();
    }

    reset() {
        if (!this._collaborator) return;
        this._resetTimer();
    }

    end() {
        clearTimeout(this._timer);
        clearTimeout(this._warnTimer);
        this._timer        = null;
        this._warnTimer    = null;
        this._collaborator = null;
        this._startTime    = null;
    }

    get collaborator() { return this._collaborator; }
    get isActive()     { return this._collaborator !== null; }

    getRemainingTime() {
        if (!this._startTime) return 0;
        return Math.max(0, SESSION_TIMEOUT_MS - (Date.now() - this._startTime));
    }

    // Alias para compatibilidad con código existente
    getRemainingMs() { return this.getRemainingTime(); }

    _resetTimer() {
        clearTimeout(this._timer);
        clearTimeout(this._warnTimer);
        this._startTime = Date.now();

        this._warnTimer = setTimeout(() => {
            this._onWarn?.();
        }, SESSION_TIMEOUT_MS - SESSION_WARN_MS);

        this._timer = setTimeout(() => {
            this._collaborator = null;
            this._onExpire?.();
        }, SESSION_TIMEOUT_MS);
    }
}
