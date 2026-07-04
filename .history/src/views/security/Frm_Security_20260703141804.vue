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