import { APP_MODULES } from './modules';

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

export function recordRecent(name: string) {
  const module = APP_MODULES.find((item) => item.ruta === name && item.dashboardLevel);
  if (!module) return;
  const next = [
    { name: module.ruta, label: module.nombre, icon: module.icono, color: module.colorIcono, at: Date.now() },
    ...getRecentModules().filter((item) => item.name !== module.ruta),
  ].slice(0, 6);
  persist(next);
}