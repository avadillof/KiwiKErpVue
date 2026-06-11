<template>
  <div class="p-4" style="padding-bottom: 80px;">
    <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Ajustes del Sistema</h1>
    <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
      Configure parámetros y gestión de usuarios para KiwiKERP.
    </Message>

    <div class="mb-5">
      <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
    </div>

    <Tabs value="0">
      <TabList>
        <Tab value="0">Configuración General</Tab>
        <Tab value="1">Parámetros de Sistema</Tab>
        <Tab value="2">Gestión de Usuarios</Tab> </TabList>

      <TabPanels>
        <TabPanel value="0">
          <div class="grid">
            <div class="col-12 md:col-3 pr-0 md:pr-4">
              <div class="border-round border-1 surface-border p-4 flex flex-column align-items-center justify-content-center"
                   style="height: 200px;">
                <img v-if="formData.urlLogoCompany" :key="formData.urlLogoCompany" :src="formData.urlLogoCompany"
                     style="max-height: 120px; object-fit: contain;" @error="handleImageError" @load="handleImageLoad" />
                <i v-else class="pi pi-image text-5xl text-400 mb-3"></i>
                <FileUpload mode="basic" name="logo" accept="image/png, image/jpeg" :maxFileSize="1000000"
                            @select="onUploadLogo" chooseLabel="Cambiar Logo" class="mt-3" />
              </div>
              <div class="mt-4">
                <FloatLabel variant="in">
                  <InputText v-model="formData.sloganCompany" id="slogan" class="w-full" size="small" />
                  <label for="slogan">Eslogan</label>
                </FloatLabel>
              </div>
            </div>

            <div class="col-12 md:col-9 mt-4 md:mt-0">
              <div class="p-5 surface-50 border-round border-1 surface-border">
                <div class="flex justify-content-end mt-5 pt-4 border-top-1 surface-border">
                  <Button label="Guardar Cambios" icon="pi pi-save" :loading="loading" @click="saveData" size="small" />
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel value="1">
          </TabPanel>

        <TabPanel value="2">
          <div class="p-5 surface-50 border-round border-1 surface-border">
            <h5 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
              <i class="pi pi-users"></i> Listado de Usuarios del Sistema
            </h5>
            
            <div class="p-4 border-2 border-dashed surface-border border-round text-center">
              <p class="text-500">Componente de gestión de usuarios en construcción...</p>
            </div>
          </div>
        </TabPanel>

      </TabPanels>
    </Tabs>
  </div>
</template>