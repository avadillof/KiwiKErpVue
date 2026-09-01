
/** Legacy Jackson dates (Spanish/English month names and AM/PM), interpreted as local wall time. */
export function parseLocalizedServerDate(value: unknown): Date | null {
    if (typeof value !== 'string') return null;
    const normalized = value.replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim();
    const match = /^([a-záéíóú]+)\.?\s+(\d{1,2}),?\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*([ap])\.?\s*m\.?$/i.exec(normalized);
    if (!match) return null;
    const months: Record<string, number> = {ene:0,jan:0,feb:1,mar:2,abr:3,apr:3,may:4,jun:5,jul:6,ago:7,aug:7,sep:8,sept:8,oct:9,nov:10,dic:11,dec:11};
    const month = months[match[1].toLowerCase()];
    const day = Number(match[2]), year = Number(match[3]), hour12 = Number(match[4]), minute = Number(match[5]), second = Number(match[6]);
    if (month === undefined || hour12 < 1 || hour12 > 12 || minute > 59 || second > 59) return null;
    const hour = hour12 % 12 + (match[7].toLowerCase() === 'p' ? 12 : 0);
    const date = new Date(year, month, day, hour, minute, second);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
}

/** Calendar dates from the server: preserve the day without timezone conversion. */
export function formatCalendarDate(value: string | null | undefined): string {
    const text = value?.trim();
    if (!text) return 'Sin fecha';
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : text;
}

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

            const result = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;


            return result;

        } catch (e) {
            console.error('HelperDates - Error crítico en parseo:', e);
            return 'Error en fecha';
        }
    },



    formatDateNoTimeFromLocale: (dateStr: string | null | undefined): string => {
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


            const date = new Date(cleanStr);

            if (isNaN(date.getTime())) {
                console.warn('HelperDates - Fallo al parsear, devolviendo crudo:', normalized);
                return normalized;
            }

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();

            const result = `${day}-${month}-${year}`;


            return result;

        } catch (e) {
            console.error('HelperDates - Error crítico en parseo:', e);
            return 'Error en fecha';
        }
    },


    formatDateObjectNoTime(d: Date | null) {
        if (!d) return null;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }



};
