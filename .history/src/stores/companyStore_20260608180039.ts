import { defineStore } from 'pinia';

export interface CompanyState {
    nameCompany: string;
    cifCompany: string;
    urlLogoCompany: string;
    sloganCompany: string;
    email: string;
    phone: string;
    address: string;
    addressNumber: string;
    province: string;
    zipCode: string;
    city: string;
    smtpServer: string;
    smtpPort: number | null;
    smtpUser: string;
    smtpAuth: boolean;
    starttlsEnable: boolean;
    starttlsRequired: boolean;
    sslProtocols: string;
    mailSender: string;
    reportRgpd: string;
    toastDuration: number | null;
    paginationTable:number;
}

export const useCompanyStore = defineStore('company', {
    state: () => ({
        companyInfo: {
            nameCompany: '',
            cifCompany: '',
            urlLogoCompany: '',
            sloganCompany: '',
            email: '',
            phone: '',
            address: '',
            addressNumber: '',
            province: '',
            zipCode: '',
            city: '',
            smtpServer: '',
            smtpPort: null,
            smtpUser: '',
            smtpAuth: false,
            starttlsEnable: false,
            starttlsRequired: false,
            sslProtocols: '',
            mailSender: '',
            reportRgpd: '',
            toastDuration: 3000,
            paginationTable: 500,
            smtpPasswordCountSmtp: ''
        } as CompanyState
    }),
    actions: {
        setCompanyParameters(data: Partial<CompanyState>) {
            // Usamos Object.assign para actualizar todas las propiedades de golpe
            Object.assign(this.companyInfo, data);
        },
        updateLogoUrl(newUrl: string) {
            this.companyInfo.urlLogoCompany = newUrl;
        }
    }
});