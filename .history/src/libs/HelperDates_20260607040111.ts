export const HelperDates = {
    formatDateFromLocale: (dateStr: string | null | undefined): string => {
        // 1. Manejo de valores nulos o vacíos
        if (!dateStr || dateStr.trim() === '') {
            return 'Sin fecha';
        }

        try {
            const normalized = String(dateStr).trim();

            // 2. Intentamos crear un objeto Date nativo
            // Date maneja tanto 'YYYY-MM-DDTHH:mm:ss' como 'YYYY-MM-DD HH:mm:ss'
            const date = new Date(normalized.replace(' ', 'T'));

            // 3. Verificamos si la fecha es válida
            if (isNaN(date.getTime())) {
                console.error('HelperDates - Formato no procesado:', normalized);
                return normalized;
            }

            // 4. Formateo manual (sin dependencias)
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