<template>
  <div class="security-page">

    <div class="security-header">
      🔐 Seguridad de {{ userName }}
    </div>

    <div class="security-body">

      <div class="security-modules">
        <SecurityModulesTable />
      </div>

      <Splitter class="security-splitter">

        <SplitterPanel :size="40" class="panel-left">
          <SecuritySectionsTable />
        </SplitterPanel>

        <SplitterPanel :size="60" class="panel-right">
          <SecurityPermissionsTable />
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