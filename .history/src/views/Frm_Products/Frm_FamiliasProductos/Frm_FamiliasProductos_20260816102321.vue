<template>

    <div class="p-4" style="padding-bottom: 80px; margin-bottom: 100px;">

        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">
            Getión de Familias de Productos
        </h1>

        <Message variant="simple" icon="pi pi-shield" severity="success" size="big">
            Gestión y mantenimiento de las distintas Familias de Productos a las que perenecerán los distintos productos
            y Servicios.
        </Message>

        <div class="mb-5">
            <Button :label="router.currentRoute.value.query.from === 'products'
                ? 'Volver a Productos'
                : 'Volver a Ajustes'" icon="pi pi-arrow-left" text @click="volver" />
        </div>

        <Toolbar class="mb-3">
            <template #start>
                <Button label="Nueva Familia" icon="pi pi-plus" size="small" variant="text" outlined @click="openNew" />
            </template>
        </Toolbar>






        <GenericDataTable style="height: 450px;" ref="tableRef" dataKey="pkid" selectionMode="single" :endpoint="apiUrl"
            :showPaginator="true" :filterable="true" :showActions="true" @row-select="handleRowSelect">

            <Column field="code" header="Código" sortable sortField="categoriesDsAlias" />

            <Column field="description" header="Descripción" sortable sortField="categoriesDsDescriptionsp" />

            <Column field="active" header="Activo" sortable sortField="categoriesBolActive">
                <template #body="{ data }">

                    <Tag v-if="data.active" value="ACTIVO" severity="success" />

                    <Tag v-else value="INACTIVO" severity="danger" />

                </template>
            </Column>

        </GenericDataTable>

    </div>


    <!-- ========================================= -->
    <!-- FORMULARIO FAMILIA                       -->
    <!-- ========================================= -->

    <Frm_FamiliaProductos ref="familiaProductosRef" @saved="refreshTable" />

</template>


<script setup lang="ts">

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import Tag from 'primevue/tag';

import GenericDataTable from '@/components/shared/GenericDataTable.vue';

import Frm_FamiliaProductos
    from './Frm_FamiliaProductos.vue';

import { useSecurityStore } from '@/stores/securityStore';


/* =========================================
   SECURITY
========================================= */

const securityStore = useSecurityStore();
const router = useRouter();

/* =========================================
   API
========================================= */

const apiUrl = `WebGetProductFamilies`;


/* =========================================
   REFERENCES
========================================= */

const tableRef = ref();

const familiaProductosRef = ref();


/* =========================================
   NUEVA FAMILIA
========================================= */

const openNew = () => {

    familiaProductosRef.value?.open();

};


/* =========================================
   EDITAR FAMILIA
========================================= */

const handleRowSelect = (event: any) => {

    const family = event.data;

    if (!family?.pkid) {
        return;
    }

    familiaProductosRef.value?.open(
        family.pkid
    );

};


/* =========================================
   DESPUÉS DE GUARDAR
========================================= */




const refreshTable = async () => {
    await tableRef.value.refresh();
};


const volver = () => {
    if (router.currentRoute.value.query.from === 'products') {
        router.push({ name: 'Productos' });
    } else {
        router.push({ name: 'Frm_Ajustes' });
    }
};


</script>