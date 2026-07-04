<template>
    <div class="security-page">

        <!-- HEADER -->
        <div class="security-header">
            🔐 Seguridad de Usuario
        </div>

        <!-- MÓDULOS -->
        <div class="security-top">
            <SecurityModulesTable
                @select="onModuleSelected"
            />
        </div>

        <!-- SPLITTER -->
        <Splitter class="security-bottom" style="height: 100%">

            <SplitterPanel :size="40">
                <SecuritySectionsTable
                    :module="selectedModule"
                    @select="onSectionSelected"
                />
            </SplitterPanel>

            <SplitterPanel :size="60">
                <SecurityPermissionsTable
                    :section="selectedSection"
                />
            </SplitterPanel>

        </Splitter>

    </div>
</template>

<script setup lang="ts">

import { ref } from 'vue'

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

</script>