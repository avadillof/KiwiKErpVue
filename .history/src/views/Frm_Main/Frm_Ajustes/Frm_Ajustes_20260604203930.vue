<div class="bg-white p-4 border-round-md shadow-sm border-1 surface-border">
  <h5 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
    <i class="pi pi-envelope"></i> Configuración SMTP
  </h5>
  <div class="grid gap-2">
    <div class="col-12 md:col-5"><FloatLabel variant="in"><InputText v-model="formData.smtpServer" id="smtpServer" class="w-full" size="small" /><label for="smtpServer">Servidor SMTP</label></FloatLabel></div>
    <div class="col-12 md:col-2"><FloatLabel variant="in"><InputNumber v-model="formData.smtpPort" id="smtpPort" :useGrouping="false" class="w-full" size="small" /><label for="smtpPort">Puerto</label></FloatLabel></div>
    <div class="col-12 md:col-5"><FloatLabel variant="in"><InputText v-model="formData.smtpUser" id="smtpUser" class="w-full" size="small" /><label for="smtpUser">Usuario SMTP</label></FloatLabel></div>
    
    <div class="col-12 md:col-4 border-1 surface-border border-round px-3 flex align-items-center h-3rem">
      <Checkbox v-model="formData.smtpAuth" id="smtpAuth" binary size="small" />
      <label for="smtpAuth" class="ml-2 font-medium text-sm">SMTP Auth</label>
    </div>
    <div class="col-12 md:col-4 border-1 surface-border border-round px-3 flex align-items-center h-3rem">
      <Checkbox v-model="formData.starttlsEnable" id="starttlsEnable" binary size="small" />
      <label for="starttlsEnable" class="ml-2 font-medium text-sm">StartTLS Enable</label>
    </div>
    <div class="col-12 md:col-4 border-1 surface-border border-round px-3 flex align-items-center h-3rem">
      <Checkbox v-model="formData.starttlsRequired" id="starttlsRequired" binary size="small" />
      <label for="starttlsRequired" class="ml-2 font-medium text-sm">StartTLS Required</label>
    </div>

    <div class="col-12 md:col-6 mt-2"><FloatLabel variant="in"><InputText v-model="formData.sslProtocols" id="sslProtocols" class="w-full" size="small" /><label for="sslProtocols">SSL Protocols</label></FloatLabel></div>
    <div class="col-12 md:col-6 mt-2"><FloatLabel variant="in"><InputText v-model="formData.mailSender" id="mailSender" class="w-full" size="small" /><label for="mailSender">Email Remitente (System)</label></FloatLabel></div>
  </div>
</div>