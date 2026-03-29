import CryptoJS from 'crypto-js';
import Dexie from 'dexie';

const OFFLINE_KEY = 'conserva_offline_encryption_key_v1';

export const offlineDB = new Dexie('ConservaDB');
offlineDB.version(1).stores({
  manuales: 'id, content, lastUpdated',
  denue: 'municipio, statistics'
});

export function saveSecureSession(token, userData) {
  const payload = JSON.stringify({ token, user: userData, timestamp: Date.now() });
  const encrypted = CryptoJS.AES.encrypt(payload, OFFLINE_KEY).toString();
  localStorage.setItem('auth_vault', encrypted);
}

export function getSecureSession() {
  const cipher = localStorage.getItem('auth_vault');
  if (!cipher) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, OFFLINE_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    return null;
  }
}

export async function enforceKillSwitch() {
  const session = getSecureSession();
  
  if (!navigator.onLine) {
    return !!session;
  }

  if (session && session.token) {
    try {
      const res = await fetch('/.netlify/functions/validate-token', {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      
      if (!res.ok) {
        throw new Error('Sesión revocada o Empleado inactivo');
      }
      return true;
    } catch (e) {
      console.warn("KILL SWITCH ACTIVADO:", e.message);
      wipeDeviceData();
      return false;
    }
  }

  return false;
}

export async function wipeDeviceData() {
  localStorage.clear();
  sessionStorage.clear();
  await offlineDB.delete();
  window.location.reload();
}
