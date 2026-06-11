<template>
  <DataTable 
    :value="data" 
    :totalRecords="totalRecords" 
    lazy 
    :loading="loading"
    :virtualScrollerOptions="virtualScrollerOptions"
    scrollable 
    scrollHeight="flex" 
    :key="renderKey" 
    dataKey="id"
    v-bind="$attrs"
>
    <slot></slot>
</DataTable>
</template>

