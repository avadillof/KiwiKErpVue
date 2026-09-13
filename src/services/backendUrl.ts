/** Construye una URL pública; las rutas recibidas son las declaradas en Spring. */
export function backendUrl(path: string, base: string = import.meta.env.VITE_API_URL || ''): string {
  // Respetar URLs externas y recursos ya resueltos (incluidos blob/data).
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return path;

  const normalizedBase = base.trim().replace(/\/+$/, '');
  let normalizedPath = '/' + path.replace(/^\/+/, '');

  // La base es el prefijo del proxy: Docker lo elimina antes de llegar a Spring.
  // Conservar /api en los endpoints nativos; /gestdoc (fotos) es una ruta legacy.

  return normalizedBase + normalizedPath;
}
