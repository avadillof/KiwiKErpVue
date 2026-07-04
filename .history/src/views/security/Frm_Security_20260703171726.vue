<template>
  <div class="security-page">

    <!-- HEADER -->
    <div class="security-header">
      <h2 class="title">🔐 Securización</h2>

      <Message severity="info" variant="simple" icon="pi pi-info-circle">
        Usuario: {{ userName }}
      </Message>

      <Button
        label="Volver"
        icon="pi pi-arrow-left"
        text
        class="mt-2"
        @click="volverAlDashboard"
      />
    </div>

    <!-- MÓDULOS -->
    <div class="panel modules-panel">
      <SecurityModulesTable
        :modules="modules"
        v-model:selected="selectedModule"
        @select="onModuleSelected"
      />
    </div>

    <!-- DETALLE -->
    <div class="panel detail-grid">

      <!-- SECCIONES -->
      <div class="panel inner">
        <SecuritySectionsTable
          :module="selectedModule"
          @select="onSectionSelected"
        />
      </div>

      <!-- PERMISOS -->
      <div class="panel inner">
        <SecurityPermissionsTable
          :section="selectedSection"
        />
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
.security-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 12px;
  background: var(--surface-ground);
}

/* HEADER LIMPIO */
.security-header {
  background: var(--surface-card);
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid var(--surface-border);
}

.title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.actions {
  margin-top: 8px;
}

/* BODY */
.security-body {
  flex: 1;
  min-height: 0;
}

/* SPLITTER */
.security-splitter {
  height: calc(100vh - 140px); /* ajusta según header */
  min-height: 0;
}
</style>