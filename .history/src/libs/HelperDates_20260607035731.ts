export const HelperDates = {
    formatDateFromLocale: (dateStr: string): string => {
        if (!dateStr) return 'Sin fecha';

        try {
            const normalized = String(dateStr).trim();

            // 1. Caso formato DB: "2026-04-23 17:20:47"
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(normalized)) {
                const [fecha, hora] = normalized.split(' ');
                const [any, mes, dia] = fecha.split('-');
                return `${dia}/${mes}/${any} ${hora}`;
            }

            // 2. Caso formato: "jun. 07, 2026 01:52:12 a. m."
            // Limpiamos los puntos y extraemos las partes
            const cleanStr = normalized.replace(/\./g, '').replace(/,/g, '').toLowerCase();
            // cleanStr quedará como: "jun 07 2026 01:52:12 a m"
            const parts = cleanStr.split(' '); 

            if (parts.length >= 6) {
                const meses: Record<string, string> = { 
                    'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06', 
                    'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12' 
                };

                const mes = meses[parts[0]] || '01';
                const dia = parts[1].padStart(2, '0');
                const anyo = parts[2];
                const tiempo = parts[3];
                const ampm = parts[4]; // 'a' o 'p'

                let [h, m, s] = tiempo.split(':');
                let hNum = parseInt(h);

                // Lógica de 24h
                if (ampm === 'p' && hNum < 12) hNum += 12;
                if (ampm === 'a' && hNum === 12) hNum = 0;

                return `${dia}/${mes}/${anyo} ${hNum.toString().padStart(2, '0')}:${m}:${s}`;
            }

            return dateStr;
        } catch (e) {
            console.error('HelperDates - Error:', e);
            return dateStr;
        }
    }
};