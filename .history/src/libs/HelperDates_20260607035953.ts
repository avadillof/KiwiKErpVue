export const formatHelperDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) {
    return "";
  }

  const date = new Date(dateInput);

  // Validación de fecha inválida
  if (isNaN(date.getTime())) {
    console.warn(`HelperDates - Formato no procesado: ${dateInput}`);
    return String(dateInput); // Retorna el valor original si no se puede procesar
  }

  // Ejemplo de formateo: DD/MM/YYYY HH:mm
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};