<template>

     <div class="p-4" style="padding-bottom: 80px; margin-bottom: 100px;">

        <div class="flex justify-content-between align-items-center mb-3">

            <div>
                <h3 class="m-0">
                    Familias de Productos
                </h3>

                <span class="text-500">
                    Gestión de familias de productos
                </span>
            </div>

            <Button
                v-if="securityStore.hasPermission('PROSER_GEN_0002')"
                label="Nueva Familia"
                icon="pi pi-plus"
                @click="openNew"
            />

        </div>


        <GenericDataTable
            ref="tableRef"
            dataKey="pkid"
            selectionMode="single"
            :endpoint="apiUrl"
            :showPaginator="true"
            :filterable="true"
            :showActions="true"
            @row-select="handleRowSelect"
        >

            <Column
                field="code"
                header="Código"
                sortable
            />

            <Column
                field="description"
                header="Descripción"
                sortable
            />

            <Column
                field="active"
                header="Activo"
                sortable
            >
                <template #body="{ data }">

                    <Tag
                        v-if="data.active"
                        value="ACTIVO"
                        severity="success"
                    />

                    <Tag
                        v-else
                        value="INACTIVO"
                        severity="danger"
                    />

                </template>
            </Column>

        </GenericDataTable>

    </div>


    <!-- ========================================= -->
    <!-- FORMULARIO FAMILIA                       -->
    <!-- ========================================= -->

    <Frm_FamiliaProductos
        ref="familiaProductosRef"
        @saved="handleSaved"
    />

</template>


<script setup lang="ts">

import { ref } from 'vue';

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


/* =========================================
   API
========================================= */

const apiUrl =
    `${import.meta.env.VITE_API_URL}/WebGetProductFamilies`;


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

const handleSaved = () => {

    tableRef.value?.reload?.();

};

</script>