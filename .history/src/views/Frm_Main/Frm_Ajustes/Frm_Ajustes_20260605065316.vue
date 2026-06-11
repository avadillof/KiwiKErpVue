<div class="bg-white p-4 border-round-md shadow-sm border-1 surface-border mb-4">
  <h5 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
    <i class="pi pi-shield"></i> Configuración Legal (RGPD)
  </h5>
  <div class="grid">
    <div class="col-12">
      <FloatLabel variant="in">
        <Textarea 
          v-model="formData.rgpdText" 
          id="rgpdText" 
          class="w-full" 
          rows="5" 
          autoResize 
        />
        <label for="rgpdText">Texto de Protección de Datos (RGPD)</label>
      </FloatLabel>
    </div>
  </div>
</div>