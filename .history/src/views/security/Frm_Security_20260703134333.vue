<template>

    <div class="p-4" style="padding-bottom: 80px;">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Ajustes del Sistema</h1>
        <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
            Configure la securización y accesos a KiwiKERP .
        </Message>

        <div class="mb-5">
            <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
        </div>


        <div class="security-page">
            
            <div
                class="security-header flex align-items-center justify-content-between p-3 surface-card border-round-md shadow-1 border-1 surface-border">
                <div class="flex align-items-center gap-2">
                    <i class="pi pi-shield text-primary" style="font-size: 1.5rem"></i>
                    <span class="text-xl font-bold">Seguridad para el Usuario Seleccionado: {{ userName }}</span>
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