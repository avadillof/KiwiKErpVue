
export const HelperDates = {
    formatDateFromLocale: (dateStr: string): string => {
        // Si recibimos nulo o undefined, devolvemos 'Sin fecha'
        if (dateStr === null || dateStr === undefined || dateStr === '') return 'Sin fecha';

        try {
            const normalized = String(dateStr).trim();

            // 1. Detectar formato "2026-04-23 17:20:47"
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(normalized)) {
                const [fecha, hora] = normalized.split(' ');
                const [any, mes, dia] = fecha.split('-');
                return `${dia}/${mes}/${any} ${hora}`;
            }

            // 2. Si llega aquí y no hace match, es que el formato es distinto.
            // Vamos a devolver el valor original para ver qué está llegando exactamente.
            return normalized; 
        } catch (e) {
            return `Error: ${dateStr}`;
        }
    }
};