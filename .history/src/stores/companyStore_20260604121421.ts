import { defineStore } from 'pinia';

// Definimos la interfaz para que TypeScript tenga claro qué datos manejamos
interface CompanyState {
    nameCompany: string;
    cifCompany: string;
    urlLogoCompany: string;
}

export const useCompanyStore = defineStore('company', {
    state: function () {
        return {
            companyInfo: {
                nameCompany: '',
                cifCompany: '',
                urlLogoCompany: ''
            } as CompanyState
        };
    },
    actions: {
        // Acción para actualizar los datos corporativos desde cualquier lugar
        setCompanyParameters: function (data: CompanyState) {
            this.companyInfo.nameCompany = data.nameCompany;
            this.companyInfo.cifCompany = data.cifCompany;
            this.companyInfo.urlLogoCompany = data.urlLogoCompany;
        }
    },
    getters: {
        // Getter para acceder fácilmente al nombre formateado
        getFormattedName: function (state) {
            return state.companyInfo.nameCompany || 'Empresa no definida';
        }
    }
});