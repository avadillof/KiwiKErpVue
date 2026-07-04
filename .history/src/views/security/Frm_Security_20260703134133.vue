<template>

    <div class="p-4" style="padding-bottom: 80px;">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Ajustes del Sistema</h1>
        <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
            Configure parámetros y gestión de usuarios para KiwiKERP.
        </Message>

        <div class="mb-5">
            <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
        </div>


        <div class="security-page">

            <div
                class="card p-4 shadow-2 border-round-xl surface-card surface-border border-1 overflow-hidden relative">
                <div class="absolute top-0 left-0 h-full w-2 bg-primary"></div>

                <div class="security-header flex align-items-center justify-content-between">
                    <div class="flex align-items-center gap-3">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                            style="width: 3rem; height: 3rem;">
                            <i class="pi pi-shield text-primary text-2xl"></i>
                        </div>

                        <div class="flex flex-column">
                            <span class="text-900 text-xl font-bold">Panel de Seguridad</span>
                            <span class="text-500 font-medium">Bienvenido, {{ userName }}</span>
                        </div>
                    </div>

                    
                </div>
            </div>

            <div class="security-body">



                <div class="security-modules">
                    <SecurityModulesTable />
                </div>

                <Splitter class="security-splitter" layout="horizontal">
                    <SplitterPanel :size="40" class="flex flex-column h-full">
                        <SecuritySectionsTable class="h-full" />
                    </SplitterPanel>

                    <SplitterPanel :size="60" class="flex flex-column h-full">
                        <SecurityPermissionsTable class="h-full" />
                    </SplitterPanel>
                </Splitter>

            </div>

        </div>
    </div>
</template>

<script setup lang="ts">


import SecurityModulesTable from './components/SecurityModulesTable.vue'
import SecuritySectionsTable from './components/SecuritySectionsTable.vue'
import SecurityPermissionsTable from './components/SecurityPermissionsTable.vue'
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue'

const router = useRouter();
const userId = ref<number | null>(null)
const userName = ref<string>('')

const selectedModule = ref<any>(null)
const selectedSection = ref<any>(null)

const onModuleSelected = (m: any) => {
    selectedModule.value = m
    selectedSection.value = null
}

const onSectionSelected = (s: any) => {
    selectedSection.value = s
}


function volverAlDashboard() {
    router.push({ name: 'Dashboard' });
}

onMounted(() => {
    //userId.value = Number(router.query.userId)
    //userName.value = String(route.query.userName)
})

</script>