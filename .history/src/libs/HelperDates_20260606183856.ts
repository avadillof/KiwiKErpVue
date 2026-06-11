

export const HelperString = {
    
function formatDate(dateString: string | null | undefined) {
  console.info(dateString);

  if (!dateString) return 'Nunca';

  // Separamos la fecha y la hora manualmente para evitar errores de zona horaria
  // El formato es: 2026-06-05T21:05:22
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');

  // Retornamos el formato que querías: DD/MM/YYYY HH:mm
  return `${day}/${month}/${year} ${hour}:${minute}`;
}
};





export const HelperDates = {
    /**
     * Valida el formato de un CIF/NIF español básico (8 números + 1 letra/dígito)
     */
    isValidCifNif(cif: string): boolean {
        if (!cif) return false;
        const value = cif.toUpperCase().trim();
        const regex = /^[0-9ABCDEFGHJKLMNPQRSUVW]{1}[0-9]{7}[0-9A-Z]{1}$/;
        return regex.test(value);
    },

    /**
     * Valida el formato de un correo electrónico
     */
    isValidEmail(email: string): boolean {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }
};