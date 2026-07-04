


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
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
}
</style>