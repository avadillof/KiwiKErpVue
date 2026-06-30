<template>
  <Dialog v-model:visible="visible" header="Gestión de Entidad" modal :style="{ width: '70vw' }">
    
    <div class="grid p-fluid">
      <div class="col-12 md:col-6"><InputText v-model="entity.dsName" placeholder="Nombre/Razón Social" /></div>
      <div class="col-12 md:col-3"><InputText v-model="entity.dsCif" placeholder="NIF/CIF" /></div>
      <div class="col-12 md:col-3">
        <Checkbox v-model="entity.bolClient" binary label="Es Cliente" />
        <Checkbox v-model="entity.bolSupplier" binary label="Es Proveedor" />
      </div>
    </div>

    <Tabs value="0">
      <TabList>
        <Tab value="0" :disabled="!entity.bolClient">Datos de Ventas</Tab>
        <Tab value="1" :disabled="!entity.bolSupplier">Datos de Compras</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
           </TabPanel>
        <TabPanel value="1">
           </TabPanel>
      </TabPanels>
    </Tabs>

    <template #footer>
      <Button label="Guardar" @click="save" />
    </template>
  </Dialog>
</template>