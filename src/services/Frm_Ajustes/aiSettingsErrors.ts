/** Preserve the server's diagnostic instead of suggesting a migration for every failure. */
export function aiSettingsError(error: any, provider = "OpenAI"): string {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (status === 401) return "Vuelve a iniciar sesión.";
  if (status === 403)
    return "Sólo los administradores pueden configurar la IA.";

  let detail = data;
  if (typeof data === "string" && data.trim()) {
    try {
      detail = JSON.parse(data);
    } catch {
      // Proxy HTML is not an application diagnostic.
      if (!data.trim().startsWith("<")) return data;
    }
  }
  const code = detail?.code || detail?.error?.code;
  if (code === "credit_balance_exhausted" || code === "insufficient_quota") {
    return `${provider} no tiene saldo API disponible. Revisa los créditos y la facturación de la organización asociada a esta clave antes de volver a probar.`;
  }
  const message =
    detail?.message ||
    detail?.detail ||
    detail?.reason ||
    detail?.error?.message;
  if (typeof message === "string" && message.trim()) return message;
  if (status === 429)
    return "El proveedor ha limitado las solicitudes. Espera antes de volver a probar.";
  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return "Se agotó el tiempo de espera de la operación. Vuelve a probar en unos segundos.";
  }
  if (!error?.response)
    return "No se pudo conectar con el servidor. Comprueba la conexión y vuelve a probar.";
  return "No se pudo completar la operación de IA. Vuelve a probar; si persiste, revisa el registro del backend.";
}
