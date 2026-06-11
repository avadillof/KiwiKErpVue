
export const HelperDates = {
    formatDateFromLocale: (dateStr: string): string => {
        if (!dateStr || typeof dateStr !== 'string') return dateStr;

        try {
            // Limpieza básica: "jun. 07, 2026 12:36:43 a. m." -> "jun 07 2026 12:36:43 am"
            const cleanStr = dateStr.replace(/\./g, '').replace(/,/g, '').toLowerCase();
            const parts = cleanStr.split(' '); // [jun, 07, 2026, 12:36:43, am/pm]

            if (parts.length < 5) return dateStr;

            const meses: Record<string, string> = { 
                'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06', 
                'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12' 
            };

            const mes = meses[parts[0]] || '01';
            const dia = parts[1].padStart(2, '0');
            const anyo = parts[2];
            const tiempo = parts[3]; // 12:36:43
            const ampm = parts[4];   // am o pm

            let [h, m, s] = tiempo.split(':');
            let hNum = parseInt(h);

            if (ampm === 'p' && hNum < 12) hNum += 12;
            if (ampm === 'a' && hNum === 12) hNum = 0;

            const hStr = hNum.toString().padStart(2, '0');

            return `${dia}/${mes}/${anyo} ${hStr}:${m}:${s}`;
        } catch (e) {
            console.error("Error formateando fecha:", e);
            return dateStr; // Si algo falla, devuelve el original para que no desaparezca
        }
    }
};