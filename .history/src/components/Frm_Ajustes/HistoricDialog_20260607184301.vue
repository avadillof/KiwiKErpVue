<div class="panel glass-effect flex-1 overflow-hidden">
  <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
    <i class="pi pi-history"></i> Historial Reciente
  </h4>
  <div class="table-container-wrapper">
    <GenericDataTable :endpoint="apiUrl" @data-loaded="handleDataLoaded">
      <Column field="date" header="Fecha de Conexión" sortable>
        <template #body="slotProps">
          <span class="date-badge">{{ formatSafe(slotProps.data?.date) }}</span>
        </template>
      </Column>
    </GenericDataTable>
  </div>
</div>