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
    }


    isUint16Array(){
        
    }


    
};