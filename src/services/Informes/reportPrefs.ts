import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '@/stores/authStore';

/**
 * Preferencias de usuario para reportes (ámbito REPORTS, clave = código RPT).
 * Back primero y localStorage como respaldo: sobrevive sin red, pero si se
 * borran los datos del sitio solo permanece lo guardado en el back.
 */

const SCOPE = 'REPORTS';
const LOCAL_KEY = 'kiwik.reports.params.v1';

function localAll(): Record<string, any> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function authConfig(): any {
  try {
    return useAuthStore().portalRequestConfig();
  } catch {
    return {};
  }
}

/** Carga la preferencia del back; si falla, del navegador. */
export async function loadReportPref<T>(code: string): Promise<T | null> {
  try {
    const { data } = await axios.get(backendUrl('/WebGetUserPreferences'), {
      params: { scope: SCOPE },
      ...authConfig(),
      timeout: 15000
    });
    const raw = data?.[code];
    if (raw != null) {
      const parsed = JSON.parse(raw) as T;
      try {
        const all = localAll();
        all[code] = parsed;
        localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
      } catch {
        /* solo back */
      }
      return parsed;
    }
  } catch {
    /* respaldo local */
  }
  return (localAll()[code] as T) ?? null;
}

/** Guarda en el back y siempre en local. */
export async function saveReportPref(code: string, data: any): Promise<void> {
  try {
    const all = localAll();
    all[code] = data;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
  } catch {
    /* sin almacenamiento local */
  }
  try {
    await axios.post(
      backendUrl('/WebSaveUserPreference'),
      { scope: SCOPE, key: code, value: JSON.stringify(data) },
      { ...authConfig(), timeout: 15000 }
    );
  } catch {
    /* queda en local hasta tener red/sesión */
  }
}
