<template>
    <div style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 35px;">
            <div>
                <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Módulo de Ventas</h1>
                <Message variant="simple" icon="pi pi-briefcase" severity="info" size="big">
                    Gestión comercial y operativa. Selecciona una opción para continuar.
                </Message>
            </div>

            <Button label="Volver al Inicio" icon="pi pi-arrow-left" text severity="secondary"
                @click="router.push({ name: 'Dashboard' })" style="font-weight: 600;" />
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px;">
            <Card v-for="opcion in opcionesVentas" :key="opcion.id"
                style="border: 1px solid #e5e7eb; border-radius: 12px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; background-color: white;"
                class="p-shadow-1"
                onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.1)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)';"
                @click="router.push({ name: opcion.ruta })">
                <template #title>
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                        <div :style="{ backgroundColor: opcion.bgIcono, color: opcion.colorIcono }"
                            style="width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                            <i :class="opcion.icono" style="font-size: 1.25rem;"></i>
                        </div>
                        <span style="color: #1f2937; font-size: 1.2rem; font-weight: 700;">{{ opcion.nombre }}</span>
                    </div>
                    <div style="height: 2px; background-color: #3b82f6; width: 100%; margin-bottom: 5px;"></div>
                </template>
                <template #content>
                    <p style="margin: 0; color: #6b7280; font-size: 0.95rem; min-height: 45px;">
                        {{ opcion.descripcion }}
                    </p>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Button from 'primevue/button';

const router = useRouter();

const opcionesVentas = [
    // Maestros
    { id: 'clientes', nombre: 'Entidades', descripcion: 'Gestión de directorio de entidades (Clientes, Proveedores, Fabricantes, etc..) y condiciones comerciales.', icono: 'pi pi-users', ruta: 'Clientes', colorIcono: '#0ea5e9', bgIcono: '#e0f2fe' },
    { id: 'articulos', nombre: 'Artículos', descripcion: 'Catálogo de productos, tarifas y control de stock.', icono: 'pi pi-box', ruta: 'Articulos', colorIcono: '#84cc16', bgIcono: '#f7fee7' },

    // Documentos
    { id: 'presupuestos', nombre: 'Presupuestos', descripcion: 'Gestión de presupuestos y ofertas a clientes.', icono: 'pi pi-file-edit', ruta: 'Presupuestos', colorIcono: '#6366f1', bgIcono: '#eef2ff' },
    { id: 'pedidos', nombre: 'Pedidos', descripcion: 'Gestión de pedidos de venta confirmados.', icono: 'pi pi-shopping-cart', ruta: 'Pedidos', colorIcono: '#f59e0b', bgIcono: '#fffbeb' },
    { id: 'albaranes', nombre: 'Albaranes', descripcion: 'Control de entrega de mercancía.', icono: 'pi pi-truck', ruta: 'Albaranes', colorIcono: '#10b981', bgIcono: '#ecfdf5' },
    { id: 'facturas', nombre: 'Facturación', descripcion: 'Emisión y seguimiento de facturas.', icono: 'pi pi-receipt', ruta: 'Facturas', colorIcono: '#8b5cf6', bgIcono: '#f5f3ff' },
    { id: 'rectificativas', nombre: 'Rectificativas', descripcion: 'Gestión de abonos y facturas rectificativas.', icono: 'pi pi-undo', ruta: 'Rectificativas', colorIcono: '#ef4444', bgIcono: '#fef2f2' },

    // Ajustes
    { id: 'ajustes', nombre: 'Ajustes Ventas', descripcion: 'Portes, cuentas bancarias y parámetros de facturación.', icono: 'pi pi-cog', ruta: 'AjustesVentas', colorIcono: '#6b7280', bgIcono: '#f9fafb' }
];
</script>