export const HelperDates = {
    formatDateFromLocale: (dateStr: string | null | undefined): string => {
        if (!dateStr || dateStr.trim() === '') {
            return 'Sin fecha';
        }

        try {
            const normalized = String(dateStr).trim();

            // 1. Limpieza avanzada
            let cleanStr = normalized
                .replace(/[a-z]{3}\.\s/i, '')
                .replace(',', '')
                .replace(/\./g, '')
                .replace(' a m', ' AM')
                .replace(' p m', ' PM');

            // 2. Intentar parsear
            const date = new Date(cleanStr);

            // 3. Validación (sin el log de error)
            if (isNaN(date.getTime())) {
                return normalized; // Retorna el valor original si falla
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
            // Se mantiene el retorno de seguridad ante errores críticos
            return 'Error en fecha';
        }
    }
};