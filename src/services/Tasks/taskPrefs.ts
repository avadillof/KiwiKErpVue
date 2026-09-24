import axios from 'axios';
import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '@/stores/authStore';

/**
 * Preferencias del tablero de tareas (filtros, vista y botones).
 * Back primero y localStorage como respaldo, igual que reportPrefs.
 */

const SCOPE = 'TASKS';
const KEY = 'board';
const LOCAL_KEY = 'kiwik.tasks.filters.v1';

export interface TaskBoardPrefs {
  query?: string;
  filterState?: string | null;
  filterUser?: number | null;
  filterEntitie?: number | null;
  filterEntitieLabel?: string;
  filterPriority?: string | null;
  mineOnly?: boolean;
  overdueOnly?: boolean;
  archiveMode?: boolean;
  view?: 'kanban' | 'gantt';
}

function localGet(): TaskBoardPrefs | null {
  try {
    return (JSON.parse(localStorage.getItem(LOCAL_KEY) ?? 'null') as TaskBoardPrefs) ?? null;
  } catch {
    return null;
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
export async function loadTaskBoardPrefs(): Promise<TaskBoardPrefs | null> {
  try {
    const { data } = await axios.get(backendUrl('/WebGetUserPreferences'), {
      params: { scope: SCOPE },
      ...authConfig(),
      timeout: 15000
    });
    const raw = data?.[KEY];
    if (raw != null) {
      const parsed = JSON.parse(raw) as TaskBoardPrefs;
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(parsed));
      } catch {
        /* solo back */
      }
      return parsed;
    }
  } catch {
    /* respaldo local */
  }
  return localGet();
}

/** Guarda en el back y siempre en local. */
export async function saveTaskBoardPrefs(data: TaskBoardPrefs): Promise<void> {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {
    /* sin almacenamiento local */
  }
  try {
    await axios.post(
      backendUrl('/WebSaveUserPreference'),
      { scope: SCOPE, key: KEY, value: JSON.stringify(data) },
      { ...authConfig(), timeout: 15000 }
    );
  } catch {
    /* queda en local hasta tener red/sesión */
  }
}
