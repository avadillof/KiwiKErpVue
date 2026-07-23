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


        async loadSecurity(userPk:number) {
             const baseUrl =  import.meta.env.VITE_API_URL;

            const response = await axios.post(
                'https://localhost:8083/WebLoadSecurityUser',
                {
                    pkid: userPk
                }
            )


            this.admin = response.data.admin

            this.modules = response.data.modules

            this.categories = response.data.categories

            this.attributes = response.data.attributes


            this.loaded = true

        },



        hasModule(module:string):boolean {


            if(this.admin)
                return true


            return this.modules.some(
                m => m.module === module && m.active
            )

        },



        hasCategory(categoryPk:number):boolean {


            if(this.admin)
                return true


            return this.categories.some(
                c => c.categoryPk === categoryPk && c.active
            )

        },



        hasPermission(code:string):boolean {


            if(this.admin)
                return true


            return this.attributes.some(
                a => a.code === code && a.active
            )

        }

    }

})