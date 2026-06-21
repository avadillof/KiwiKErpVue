<template>
  <div style="background-color: #f9fafb; min-height: 100vh; padding: 20px;">
    
    <div style="background: white; padding: 15px 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="background-color: #e0f2fe; color: #0ea5e9; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <i class="pi pi-users" style="font-size: 1.25rem;"></i>
            </div>
            <div>
                <h2 style="margin: 0; color: #1f2937; font-size: 1.25rem; font-weight: 700;">Clientes</h2>
                <p style="margin: 0; color: #6b7280; font-size: 0.85rem;">Gestión de directorio y condiciones</p>
            </div>
        </div>

        <Button 
            label="Volver al Panel de Ventas" 
            icon="pi pi-arrow-left" 
            severity="secondary" 
            text 
            @click="router.push({ name: 'Ventas' })" 
        />
    </div>

    <div class="card" style="padding: 20px;">
        <Toolbar class="mb-3">
            </Toolbar>
        
        <GenericDataTable ... >
            </GenericDataTable>
    </div>
  </div>
</template>