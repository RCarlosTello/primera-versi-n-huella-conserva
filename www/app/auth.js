/**
 * app/auth.js
 * Autenticación, sesión y validación de acceso.
 */

import { findByEmail, isBirthday } from '../data/collaborators.js';

// ── Email validation ──────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmailFormat(email) {
    return EMAIL_RE.test((email || '').trim());
}

// ── Collaborator lookup ───────────────────────────────────────
export async function lookupCollaborator(email) {
    return await findByEmail(email);
}

export { isBirthday };

// ── Session Manager ───────────────────────────────────────────
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hora

export class SessionManager {
    constructor(onExpire) {
        this._timer = null;
        this._onExpire = onExpire;
        this._startTime = null;
        this._collaborator = null;
    }

    start(collaborator) {
        this._collaborator = collaborator;
        this._startTime = Date.now();
        this._resetTimer();
    }

    reset() { this._resetTimer(); }

    end() {
        clearTimeout(this._timer);
        this._timer = null;
        this._collaborator = null;
        this._startTime = null;
    }

    get collaborator() { return this._collaborator; }
    get isActive() { return this._collaborator !== null; }

    getRemainingMs() {
        if (!this._startTime) return 0;
        const elapsed = Date.now() - this._startTime;
        return Math.max(0, SESSION_TIMEOUT_MS - elapsed);
    }

    _resetTimer() {
        clearTimeout(this._timer);
        this._startTime = Date.now();
        this._timer = setTimeout(() => {
            this._collaborator = null;
            this._onExpire?.();
        }, SESSION_TIMEOUT_MS);
    }
}
