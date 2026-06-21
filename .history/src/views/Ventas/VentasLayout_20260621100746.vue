<template>
  <div class="ventas-layout">
    <div class="ventas-header">
      <h1>Módulo de Ventas</h1>
      <Button icon="pi pi-cog" label="Configuración" text @click="openAjustesDialog" />
    </div>
    
    <Tabs value="0">
      <TabList>
        <Tab value="0">Presupuestos</Tab>
        <Tab value="1">Pedidos</Tab>
        <Tab value="2">Facturas</Tab>
        <Tab value="3">Albaranes</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0"><PresupuestosGrid /></TabPanel>
        <TabPanel value="1"><PedidosGrid /></TabPanel>
        <TabPanel value="2"><FacturasGrid /></TabPanel>
        <TabPanel value="3"><AlbaranesGrid /></TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>