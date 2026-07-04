<template>
  <div class="security-card">

    <!-- CABECERA -->
    <div class="section-header">

      <div class="flex align-items-center gap-3">

        <div>

          <div class="text-xs text-500 uppercase font-semibold">
            Permisos para la Sección seleccionada
          </div>

          <div class="text- font-bold text-900">
            {{ props.module?.description || 'Seleccione una Sección' }}
          </div>

        </div>

      </div>

    </div>
        <!-- TABLE -->
        <DataTable
            :value="permissions"
            scrollable
            scrollHeight="flex"
            class="p-datatable-sm custom-header-table kiwi-permissions-table"
        >

            <!-- PERMISO -->
            <Column field="desc" header="Permiso / Acción" />

            <!-- ESTADO -->
            <Column header="Estado" class="w-4">
                <template #body="{ data }">
                    <div class="flex align-items-center justify-content-between gap-3">

                        <ToggleSwitch v-model="data.active" />

                        <span
                            class="text-xs font-bold px-2 py-1 border-round-md transition-colors"
                            :class="data.active ? 'perm-active' : 'perm-disabled'"
                        >
                            {{ data.active ? 'HABILITADO' : 'BLOQUEADO' }}
                        </span>

                    </div>
                </template>
            </Column>

        </DataTable>

    </div>
</template>


<style scoped>

.security-card{
    height:100%;
    display:flex;
    flex-direction:column;
    border:1px solid var(--surface-border);
    border-radius:10px;
    overflow:hidden;
}

.section-header{
    padding:1rem;
    border-bottom:1px solid var(--surface-border);
}

.section-icon{
    width:48px;
    height:48px;
    border-radius:50%;
    background:#c8ea4a;
    color:#6b8500;

    display:flex;
    align-items:center;
    justify-content:center;
}

.section-row{
    display:flex;
    align-items:center;
    gap:1rem;
}

.section-circle{
    width:36px;
    height:36px;
    border-radius:50%;
    background:var(--primary-50);

    display:flex;
    align-items:center;
    justify-content:center;
}

</style>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
    section: any,
    module?: any
}>()

const permissions = ref<any[]>([])

/**
 * Título computado para evitar lógica en template
 */
const moduleTitle = computed(() =>
    props.module?.desc || 'Seleccione una Sección'
)

/**
 * Carga de permisos (mock o backend-ready)
 */
const loadPermissions = (section: any) => {
    if (!section) {
        permissions.value = []
        return
    }

    permissions.value = [
        { desc: 'Actualizar datos', active: true },
        { desc: 'Ver nota', active: true },
        { desc: 'Imprimir', active: false },
        { desc: 'Enviar correo', active: true },
    ]
}

/**
 * Watch reactivo limpio
 */
watch(
    () => props.section,
    (s) => loadPermissions(s),
    { immediate: true }
)
</script>

