<div class="col-12 mt-4"><h5 class="text-primary m-0 mb-3">Configuración SMTP</h5></div>

<div class="grid gap-2"> 
  <div class="col-12 md:col-5">
    <label class="font-bold block mb-2">Servidor SMTP</label>
    <InputText v-model="formData.smtpServer" class="w-full" />
  </div>
  
  <div class="col-12 md:col-2">
    <label class="font-bold block mb-2">Puerto</label>
    <InputNumber v-model="formData.smtpPort" :useGrouping="false" class="w-full" />
  </div>
  
  <div class="col-12 md:col-4">
    <label class="font-bold block mb-2">Usuario SMTP</label>
    <InputText v-model="formData.smtpUser" class="w-full" />
  </div>
</div>