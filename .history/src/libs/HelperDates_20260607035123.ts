
export const HelperDates = {
    formatDateFromLocale: (dateStr: string): string => {
        if (!dateStr) return 'Sin fecha';

        try {
            // Limpieza inicial: Normalizar espacios y eliminar caracteres basura
            const normalized = dateStr.trim().replace(/\s+/g, ' ');

            // Caso 1: Formato "YYYY-MM-DD HH:mm:ss" (muy común en MySQL/Postgres)
            // Ejemplo: 2025-03-11 13:49:44
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(normalized)) {
                const [fecha, hora] = normalized.split(' ');
                const [any, mes, dia] = fecha.split('-');
                return `${dia}/${mes}/${any} ${hora}`;
            }

            // Caso 2: Formato ISO estándar (con T)
            if (normalized.includes('T')) {
                const [fecha, horaCompleta] = normalized.split('T');
                const [any, mes, dia] = fecha.split('-');
                const hora = horaCompleta.split('.')[0];
                return `${dia}/${mes}/${any} ${hora}`;
            }

            // Caso 3: Formato "jun. 07, 2026 01:49:44 p" (el que ya tenías)
            // He ajustado la lógica de parseo de hora
            const cleanStr = normalized.replace(/\./g, '').replace(/,/g, '').toLowerCase();
            const parts = cleanStr.split(' ');
            
            if (parts.length >= 4) {
                const meses: Record<string, string> = { 
                    'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06', 
                    'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12' 
                };

                const mes = meses[parts[0]] || '01';
                const dia = parts[1].padStart(2, '0');
                const anyo = parts[2];
                const tiempo = parts[3];
                const ampm = parts[4] || ''; // 'a' o 'p'

                let [h, m, s] = tiempo.split(':');
                let hNum = parseInt(h);
                
                // Conversión forzada a 24h
                if (ampm === 'p' && hNum < 12) hNum += 12;
                if (ampm === 'a' && hNum === 12) hNum = 0;

                return `${dia}/${mes}/${anyo} ${hNum.toString().padStart(2, '0')}:${m}:${s}`;
            }

            return dateStr;
        } catch (e) {
            console.error("Error formateando fecha:", e);
            return dateStr;
        }
    }
};