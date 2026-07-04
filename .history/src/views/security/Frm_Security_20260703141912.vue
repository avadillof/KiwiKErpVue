<template>
  <div class="card p-0 shadow-sm border-1 surface-border" style="height: 600px;">
    
    <Splitter class="h-full">
      
      <SplitterPanel :size="30" :minSize="20" class="flex flex-column">
        <ListaModulos @select="onModuleSelected" />
      </SplitterPanel>
      
      <SplitterPanel :size="70" :minSize="30" class="flex flex-column">
        <ListaSecciones :module="selectedModule" @select="onSectionSelected" />
      </SplitterPanel>
      
    </Splitter>
    
  </div>
</template>

<style scoped>
/* Esto evita que el splitter se vea "roto" visualmente */
:deep(.p-splitter) {
    border: none !important;
}

:deep(.p-splitter-gutter) {
    background-color: var(--surface-100);
    transition: background 0.2s;
}

:deep(.p-splitter-gutter:hover) {
    background-color: var(--primary-200);
}
</style>

<script setup lang="ts">


import SecurityModulesTable from './components/SecurityModulesTable.vue'
import SecuritySectionsTable from './components/SecuritySectionsTable.vue'
import SecurityPermissionsTable from './components/SecurityPermissionsTable.vue'
import { useRouter ,useRoute} from 'vue-router';
import { ref, onMounted } from 'vue'

const router = useRouter();
const route = useRoute();
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
  router.push({
        name: 'Frm_Ajustes',
        query: {
            tab: '2'
        }
    });
}

if (route.query.userId !== undefined) {
        userId.value = Number(route.query.userId);
    }
    
    if (route.query.userName !== undefined) {
        userName.value = String(route.query.userName);
    }

</script>