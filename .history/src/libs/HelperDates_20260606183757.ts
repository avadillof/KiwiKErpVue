


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