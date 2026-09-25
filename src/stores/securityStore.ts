import { backendUrl } from '@/services/backendUrl';
import { defineStore } from 'pinia'
import axios from 'axios'


export const useSecurityStore = defineStore('security', {

    state: () => ({

        admin: false,

        modules: [] as any[],

        categories: [] as any[],

        attributes: [] as any[],

        loaded: false

    }),



    actions: {

        clearSecurity() {

            this.admin = false;
            this.modules = [];
            this.categories = [];
            this.attributes = [];
            this.loaded = false;

        },


        async loadSecurity(userPk: number) {

            this.clearSecurity();


            const response = await axios.post(
                backendUrl('/WebLoadSecurityUser'),
                {
                    pkid: userPk
                }
            );


            this.admin = response.data.admin;

            this.modules = response.data.modules;

            this.categories = response.data.categories;

            this.attributes = response.data.attributes;

            this.loaded = true;

        },


        hasModule(module: string): boolean {

            if (this.admin)
                return true;

            return this.modules.some(
                m => m.module === module && m.active
            );

        },


        hasCategory(categoryPk: number): boolean {

            if (this.admin)
                return true;

            return this.categories.some(
                c => c.categoryPk === categoryPk && c.active
            );

        },


        hasPermission(code: string): boolean {

            if (this.admin)
                return true;

            // Compat legacy: el codigo bueno también vale si el usuario
            // solo tiene la fila vieja (003/004 de 3 dígitos, typo REPORTINNG).
            const aliases: string[] = [code];
            if (code === 'ENTI_CON_0003') aliases.push('ENTI_CON_003');
            if (code === 'ENTI_CON_0004') aliases.push('ENTI_CON_004');
            if (code === 'REPORTING_GEN_0002') aliases.push('REPORTINNG_GEN_0002');

            return this.attributes.some(
                a => aliases.includes(a.code) && a.active
            );

        }

    }

})