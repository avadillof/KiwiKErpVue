<template>




    <div class="security-page">

        <div
            class="security-header flex align-items-center justify-content-between p-3 surface-card border-round-md shadow-sm border-1 surface-border">
            <div class="flex align-items-center gap-2">
                <i class="pi pi-shield text-primary" style="font-size: 1.5rem"></i>
                <span class="text-xl font-bold">Seguridad: {{ userName }}</span>
            </div>
            <Button icon="pi pi-save" label="Guardar Cambios" severity="primary" />
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
</template>

<script setup lang="ts">


import SecurityModulesTable from './components/SecurityModulesTable.vue'
import SecuritySectionsTable from './components/SecuritySectionsTable.vue'
import SecurityPermissionsTable from './components/SecurityPermissionsTable.vue'
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
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

onMounted(() => {
    userId.value = Number(route.query.userId)
    userName.value = String(route.query.userName)
})

</script>