import { APP_MODULES, visibleAppModules } from './modules';
import { useSecurityStore } from '@/stores/securityStore';

const RECENTS_KEY = 'kiwik.menuRecents';

export interface RecentModule {
  name: string;
  label: string;
  icon: string;
  color: string;
  at: number;
}

export function getRecentModules(): RecentModule[] {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentModule[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.name === 'string')
      .sort((a, b) => b.at - a.at)
      .slice(0, 6);
  } catch {
    return [];
  }
}

function persist(items: RecentModule[]) {
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(items));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function clearRecentModules() {
  try {
    window.localStorage.removeItem(RECENTS_KEY);
  } catch {
    /* almacenamiento no disponible */
  }
}

/**
 * Recientes visibles para el usuario actual (fail-closed en lectura:
 * si no se puede evaluar, no se muestra nada en vez de filtrar).
 */
export function visibleRecentModules(): RecentModule[] {
  try {
    const allowed = new Set(visibleAppModules().map((m) => m.ruta));
    return getRecentModules().filter((item) => allowed.has(item.name));
  } catch {
    return [];
  }
}

/**
 * ¿Puede el usuario actual ver esta ruta de módulo? Best-effort para el
 * registro: solo deniega cuando la seguridad está cargada y la ruta no es
 * visible (evita registrar accesos denegados sin romper el registro
 * legítimo durante la ventana de carga inicial).
 */
function isDeniedBySecurity(name: string): boolean {
  try {
    const securityStore = useSecurityStore();
    if (!securityStore.loaded) return false;
    return !visibleAppModules().some((m) => m.ruta === name);
  } catch {
    return false;
  }
}

export function recordRecent(name: string) {
  const module = APP_MODULES.find((item) => item.ruta === name && item.dashboardLevel);
  if (!module) return;
  // No persistir accesos que el usuario no puede ver (una vez cargada la seguridad).
  if (isDeniedBySecurity(name)) return;
  const next = [
    { name: module.ruta, label: module.nombre, icon: module.icono, color: module.colorIcono, at: Date.now() },
    ...getRecentModules().filter((item) => item.name !== module.ruta),
  ].slice(0, 6);
  persist(next);
}