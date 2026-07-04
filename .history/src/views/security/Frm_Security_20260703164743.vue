<template>
  <div class="security-page">

    <!-- HEADER -->
    <div class="security-header">

      <div class="title">
        🔐 Securización
      </div>

      <Message
        severity="info"
        variant="simple"
        icon="pi pi-info-circle"
        class="mt-2"
      >
        Configure accesos del usuario: <b>{{ userName }}</b>
      </Message>

      <div class="actions">
        <Button
          label="Volver"
          icon="pi pi-arrow-left"
          text
          @click="volverAlDashboard"
        />
      </div>

    </div>

    <!-- BODY -->
    <div class="security-body">

      <Splitter layout="vertical" class="security-splitter">

        <!-- MÓDULOS -->
        <SplitterPanel :size="40">
          <SecurityModulesTable
            :modules="modules"
            v-model:selected="selectedModule"
            @select="onModuleSelected"
          />
        </SplitterPanel>

        <!-- DETALLE -->
        <SplitterPanel :size="60">

          <Splitter layout="horizontal" class="h-full">

            <!-- SECCIONES -->
            <SplitterPanel :size="25">
              <SecuritySectionsTable
                :module="selectedModule"
                @select="onSectionSelected"
              />
            </SplitterPanel>

            <!-- PERMISOS -->
            <SplitterPanel :size="75">
              <SecurityPermissionsTable
                :section="selectedSection"
              />
            </SplitterPanel>

          </Splitter>

        </SplitterPanel>

      </Splitter>

    </div>

  </div>
</template>


<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import SecurityModulesTable from './components/SecurityModulesTable.vue'
import SecuritySectionsTable from './components/SecuritySectionsTable.vue'
import SecurityPermissionsTable from './components/SecurityPermissionsTable.vue'

const router = useRouter()
const route = useRoute()

const userName = ref('')
const selectedModule = ref<any>(null)
const selectedSection = ref<any>(null)

const modules = ref<any[]>([])

onMounted(() => {
  userName.value = String(route.query.userName || '')

  // MOCK FRONT (temporal)
  modules.value = [
    { securityPk: 1, module: 'SALES', description: 'Ventas', active: true },
    { securityPk: 2, module: 'PURCHASES', description: 'Compras', active: false },
    { securityPk: 3, module: 'CLIENTS', description: 'Clientes', active: true },
    { securityPk: 4, module: 'REPORTS', description: 'Reportes', active: true },
  ]
})

const onModuleSelected = (m: any) => {
  selectedModule.value = m
  selectedSection.value = null
}

const onSectionSelected = (s: any) => {
  selectedSection.value = s
}

const volverAlDashboard = () => {
  router.push({ name: 'Frm_Ajustes', query: { tab: '2' } })
}

</script>

<style scoped>
/* Asegura que los componentes internos ocupen el 100% del panel */
:deep(.h-full) {
    height: 100% !important;
}
</style>