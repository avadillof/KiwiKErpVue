
eexport const HelperDates = {
    formatDateFromLocale: (dateStr: string): string => {
        if (!dateStr) return 'Sin fecha';

        try {
            // Caso 1: Formato ISO (ej: 2026-06-07T00:45:19)
            if (dateStr.includes('T')) {
                const [fecha, hora] = dateStr.split('T');
                const [any, mes, dia] = fecha.split('-');
                const tiempo = hora.split('.')[0]; // Quitamos milisegundos si existen
                return `${dia}/${mes}/${any} ${tiempo}`;
            }

            // Caso 2: Tu formato anterior (jun. 07, 2026...)
            const cleanStr = dateStr.replace(/\./g, '').replace(/,/g, '').toLowerCase();
            const parts = cleanStr.split(' ');
            if (parts.length < 5) return dateStr;

            const meses: Record<string, string> = { 
                'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06', 
                'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12' 
            };

            const mes = meses[parts[0]] || '01';
            const dia = parts[1].padStart(2, '0');
            const anyo = parts[2];
            const tiempo = parts[3];
            const ampm = parts[4];

            let [h, m, s] = tiempo.split(':');
            let hNum = parseInt(h);
            if (ampm === 'p' && hNum < 12) hNum += 12;
            if (ampm === 'a' && hNum === 12) hNum = 0;

            return `${dia}/${mes}/${anyo} ${hNum.toString().padStart(2, '0')}:${m}:${s}`;
        } catch (e) {
            return dateStr;
        }
    }
};