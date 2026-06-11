

// En libs/HelperDates.ts
export const HelperDates = {
    formatDateFromLocale: (dateStr: string): string => {
        if (!dateStr) return '';
        
        // Exemple d'entrada: "may. 06, 2026 12:40:21 p. m."
        // Pas 1: Netejar el string per a fer-lo processable
        const cleanStr = dateStr.replace('.', '').replace(',', '');
        const parts = cleanStr.split(' ');
        
        const mesos: Record<string, string> = { 
            'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06', 
            'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12' 
        };

        const mes = mesos[parts[0].toLowerCase()] || '01';
        const dia = parts[1].padStart(2, '0');
        const any = parts[2];
        let hora = parts[3];
        const min = parts[4];
        const seg = parts[5];
        const ampm = parts[6]?.toLowerCase();

        // Convertir a format 24h
        let [h, m] = hora.split(':').map(Number);
        if (ampm === 'p' && h < 12) h += 12;
        if (ampm === 'a' && h === 12) h = 0;

        const hStr = h.toString().padStart(2, '0');
        
        return `${dia}/${mes}/${any} ${hStr}:${min}:${seg}`;
    }
};