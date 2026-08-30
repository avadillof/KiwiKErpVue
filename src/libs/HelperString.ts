// src/helpers/HelperString.ts

export const HelperString = {
    /**
     * Valida identificadores fiscales españoles y NIF-IVA franceses.
     */
    isValidCifNif(value: string): boolean {

        if (!value) return false;

        const normalized = value.toUpperCase().replace(/[\s.-]/g, '');
        const nif = normalized.startsWith('ES') ? normalized.slice(2) : normalized;

        // NIF-IVA francés: FR + clave de 2 caracteres + SIREN de 9 dígitos.
        const frenchVatMatch = nif.match(/^FR([A-HJ-NP-Z0-9]{2})(\d{9})$/);

        if (frenchVatMatch) {
            const [, key, siren] = frenchVatMatch;

            // La clave numérica francesa se calcula a partir del SIREN.
            // Para claves alfanuméricas se valida su estructura oficial;
            // su existencia debe contrastarse externamente mediante VIES.
            if (/^\d{2}$/.test(key)) {
                const expectedKey = (12 + 3 * (Number(siren) % 97)) % 97;
                return Number(key) === expectedKey;
            }

            return true;
        }

        // DNI/NIF persona física
        const dniRegex = /^[0-9]{8}[A-Z]$/;

        if (dniRegex.test(nif)) {

            const numero = parseInt(nif.substring(0, 8), 10);

            const letras = "TRWAGMYFPDXBNJZSQVHLCKE";

            const letraCorrecta = letras[numero % 23];

            return nif.charAt(8) === letraCorrecta;
        }


        // NIE: X/Y/Z sustituyen al primer dígito del número.
        if (/^[XYZ][0-9]{7}[A-Z]$/.test(nif)) {
            const number = Number('XYZ'.indexOf(nif.charAt(0)) + nif.substring(1, 8));
            return nif.charAt(8) === 'TRWAGMYFPDXBNJZSQVHLCKE'.charAt(number % 23);
        }
        // NIF especiales asignados por AEAT: validación estructural, no censal.
        if (/^[KLM][A-Z0-9]{7}[A-Z]$/.test(nif)) return true;

        // CIF empresas
        const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;

        if (cifRegex.test(nif)) {

            const letraInicial = nif.charAt(0);
            const numeros = nif.substring(1, 8);

            let suma = 0;

            for (let i = 0; i < numeros.length; i++) {

                let n = parseInt(numeros.charAt(i), 10);

                if (i % 2 === 0) {
                    n *= 2;
                    suma += Math.floor(n / 10) + (n % 10);
                } else {
                    suma += n;
                }
            }

            const control = (10 - (suma % 10)) % 10;

            const letraControl = "JABCDEFGHI".charAt(control);

            const ultimo = nif.charAt(8);

            // Algunos CIF usan número, otros letra
            if ('ABEH'.includes(letraInicial)) return ultimo === control.toString();
            if ('NPQRSW'.includes(letraInicial)) return ultimo === letraControl;
            return ultimo === control.toString() || ultimo === letraControl;
        }


        return false;
    },

    /**
     * Valida el formato de un correo electrónico
     */
    isValidEmail(email: string): boolean {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    },


    isValidUrl(url: string): boolean {
        if (!url) return false;

        const urlRegex = /^(https?:\/\/)(localhost|(\d{1,3}\.){3}\d{1,3}|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})(:\d+)?(\/.*)?$/;

        return urlRegex.test(url.trim());
    },


    isValidIban(iban: string): boolean {
        if (!iban) return false;

        // 1. Eliminar espacios y convertir a mayúsculas
        const cleanIban = iban.replace(/\s+/g, '').toUpperCase();

        // 2. Verificar formato básico (entre 15 y 34 caracteres, empieza por 2 letras)
        const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;
        if (!ibanRegex.test(cleanIban)) return false;

        // 3. Mover los 4 primeros caracteres al final
        const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);

        // 4. Convertir letras a números (A=10, B=11, ..., Z=35)
        const numericIban = rearranged.split('').map(char => {
            const code = char.charCodeAt(0);
            return code >= 65 && code <= 90 ? (code - 55).toString() : char;
        }).join('');

        // 5. Aplicar módulo 97 (operación de gran número)
        // Usamos BigInt porque el número resultante es demasiado grande para Number
        return BigInt(numericIban) % 97n === 1n;
    },




    /**
     * Valida si un código BIC/SWIFT tiene un formato correcto.
     */
    isValidBic(bic: string): boolean {
        if (!bic) return false;

        // Formato: 4 letras (banco), 2 letras (país), 2 alfanuméricos (ubicación), 
        // y opcionalmente 3 alfanuméricos (sucursal).
        const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

        return bicRegex.test(bic.trim().toUpperCase());
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
    },


    formatThousands(value: any) {
        // 1. Convertimos a número limpio
        const num = parseInt(String(value).replace(/[^0-9]/g, ''), 10);

        if (isNaN(num)) return '0';

        // 2. Convertimos a string y usamos una Expresión Regular para insertar el punto
        // Esta regex busca cada 3 dígitos de derecha a izquierda y pone un punto
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

};
