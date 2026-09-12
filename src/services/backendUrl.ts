/** Construye una URL pública; las rutas recibidas son las declaradas en Spring. */
export function backendUrl(path: string, base: string = import.meta.env.VITE_API_URL || ''): string {
  // Respetar URLs externas y recursos ya resueltos (incluidos blob/data).
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return path;

  const normalizedBase = base.trim().replace(/\/+$/, '');
  let normalizedPath = '/' + path.replace(/^\/+/, '');

  // /api es el acceso público en Cloud y también parte de los endpoints nativos.
  // Traefik debe conservarlo para estos últimos y quitarlo sólo para legacy.
  if (/(?:^|\/)api$/.test(normalizedBase) && /^\/api(?:\/|[?#]|$)/.test(normalizedPath)) {
    normalizedPath = normalizedPath.slice(4);
  }

  return normalizedBase + normalizedPath;
}
