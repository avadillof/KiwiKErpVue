export const HelperDates = {
    formatDateFromLocale: (dateStr: string): string => {
        // Log para ver qué llega exactamente
        console.log('HelperDates - Valor recibido:', dateStr, '| Tipo:', typeof dateStr);

        if (dateStr === null || dateStr === undefined || dateStr === '') {
            console.warn('HelperDates - Fecha detectada como vacía');
            return 'Sin fecha';
        }

        try {
            const normalized = String(dateStr).trim();

            // Lógica de detección
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(normalized)) {
                console.log('HelperDates - Formato DB detectado, procesando...');
                const [fecha, hora] = normalized.split(' ');
                const [any, mes, dia] = fecha.split('-');
                return `${dia}/${mes}/${any} ${hora}`;
            }

            // Log de error de detección
            console.error('HelperDates - Formato no reconocido:', normalized);
            return normalized; // Devolvemos el valor crudo para verlo en la tabla
        } catch (e) {
            console.error('HelperDates - Error crítico:', e);
            return 'Error en fecha';
        }
    }
};