<template>
    <div class="p-4 h-screen flex flex-column" style="padding-bottom: 80px;">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Securización</h1>
        <Message variant="simple" icon="pi pi-info-circle" severity="success" class="mb-4">
            Configure la securización y accesos para el Usuario seleccionado.
        </Message>

        <div class="mb-4">
            <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
        </div>

        <div class="flex-grow-1 border-4 surface-border border-round-lg overflow-auto shadow-sm " style="margin-bottom: 250px;min-height: 450px;">
            

      <!-- MÓDULOS -->
<div class="panel-section modules-panel">
  <SecurityModulesTable
    :modules="modules"
    v-model:selected="selectedModule"
    @select="onModuleSelected"
  />
</div>

<!-- DETALLE -->
<div class="panel-section detail-panel">

  <!-- SECCIONES -->
  <div class="panel-inner">
    <SecuritySectionsTable
      :module="selectedModule"
      @select="onSectionSelected"
    />
  </div>

  <!-- PERMISOS -->
  <div class="panel-inner">
    <SecurityPermissionsTable
      :section="selectedSection"
    />
  </div>

</div>

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

onMounted(async () => {

  userName.value = String(route.query.userName || '')

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/WebGetSecurityModulesUser`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pkid: Number(route.query.userId)
      })
    }
  )

  modules.value = await response.json()
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


.modules-panel {
  height: 40%;
  min-height: 0;
  margin-bottom: 10px;
}

.detail-panel {
  height: 60%;
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 10px;
  min-height: 0;
}

.panel-section {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-inner {
  min-height: 0;
  display: flex;
}

</style>