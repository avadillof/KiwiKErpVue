// src/helpers/HelperString.ts

export const HelperString = {
    /**
     * Valida el formato de un CIF/NIF español básico (8 números + 1 letra/dígito)
     */
    isValidCifNif(cif: string): boolean {
        if (!cif) return false;
        const value = cif.toUpperCase().trim();
        const regex = /^[0-9ABCDEFGHJKLMNPQRSUVW]{1}[0-9]{7}[0-9A-Z]{1}$/;
        return regex.test(value);
    },

    /**
     * Valida el formato de un correo electrónico
     */
    isValidEmail(email: string): boolean {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    },


    getInitialsFromString(name: string) {
        if (!name) return '';

        const parts = name.trim().split(' ');

        // Si solo hay una palabra, devuelve la primera letra
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }

        // Si hay más de una, devuelve la primera del nombre y la primera del apellido
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }



    formatThousands(value: any) => {
    // 1. Convertimos a número limpio
    const num = parseInt(String(value).replace(/[^0-9]/g, ''), 10);

    if (isNaN(num)) return '0';

    // 2. Convertimos a string y usamos una Expresión Regular para insertar el punto
    // Esta regex busca cada 3 dígitos de derecha a izquierda y pone un punto
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

};