export const HelperDates = {
    formatDateFromLocale: (dateStr: string | null | undefined): string => {
        if (!dateStr || dateStr.trim() === '') {
            return 'Sin fecha';
        }

        try {
            const normalized = String(dateStr).trim();

            // 1. Limpieza avanzada para formatos localizados (ej: 'may. 19, 2026 01:12:09 p. m.')
            let cleanStr = normalized
                .replace(/[a-z]{3}\.\s/i, '')    // Quita el nombre del mes/día (ej: "may. ")
                .replace(',', '')               // Quita la coma de la fecha
                .replace(/\./g, '')             // Quita todos los puntos (ej: "p. m." -> "p m")
                .replace(' a m', ' AM')         // Estandariza AM
                .replace(' p m', ' PM');        // Estandariza PM

            // 2. Intentar parsear
            const date = new Date(cleanStr);

            // 3. Validación
            if (isNaN(date.getTime())) {
                console.error('HelperDates - Formato no procesado:', normalized);
                return normalized;
            }

            // 4. Formateo (DD/MM/YYYY HH:mm:ss)
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            
        } catch (e) {
            console.error('HelperDates - Error crítico:', e);
            return 'Error en fecha';
        }
    }
};