
    export const HelperDates = {
    formatDateFromLocale: (dateStr: string | null | undefined): string => {
        if (!dateStr || dateStr.trim() === '') {
            return 'Sin fecha';
        }

        try {
            const normalized = String(dateStr).trim();            
            
            let cleanStr = normalized
                .replace(/[a-z]{3}\.\s/i, '')
                .replace(',', '')
                .replace(/\./g, '')
                .replace(' a m', ' AM')
                .replace(' p m', ' PM');

            // Log de transformación intermedia
            console.info('HelperDates - Tras limpieza:', cleanStr);

            const date = new Date(cleanStr);

            if (isNaN(date.getTime())) {
                console.warn('HelperDates - Fallo al parsear, devolviendo crudo:', normalized);
                return normalized;
            }

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            const result = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            
            // Log de resultado final
            console.info('HelperDates - Resultado:', result);
            
            return result;
            
        } catch (e) {
            console.error('HelperDates - Error crítico en parseo:', e);
            return 'Error en fecha';
        }
    }

};