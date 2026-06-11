<template>
  <DataTable 
    v-model:selection="selection" 
    selectionMode="single" 
    :value="tableData"
    :loading="loading" 
    lazy 
    scrollable 
    scrollHeight="flex" 
    dataKey="id" 
    class="compact-table" 
    @row-select="onRowSelect"
    @sort="onSort"
  >
    <slot />
  </DataTable>

  <Paginator 
    :first="first" 
    :rows="rows" 
    :totalRecords="totalRecords" 
    :rowsPerPageOptions="[10, 20, 50]" 
    @page="onPage" 
  />
</template>