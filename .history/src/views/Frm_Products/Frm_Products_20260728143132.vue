<template>

 <div style="background-color: #f9fafb; min-height: 100vh; padding: 20px; margin-bottom: 100px;">

    <div class="flex justify-content-between align-items-center mb-3">

        <h2>
            Productos
        </h2>


        <Button
            icon="pi pi-plus"
            label="Nuevo"
            @click="newProduct"
        />

    </div>



    <GenericDataTable
        :key="tableKey"
        endpoint="WebGetProducts"
        :columns="columns"
        :showPaginator="true"
        :filterable="true"
        :showActions="true"

        @edit="editProduct"
        @delete="deleteProduct"

    >


        <template #active="{data}">

            <Tag
                :severity="data.active ? 'success':'danger'"
                :value="data.active ? 'ACTIVO':'INACTIVO'"
            />

        </template>



        <template #salePrice="{data}">

            {{ 
                data.salePrice?.toLocaleString(
                    'es-ES',
                    {
                        minimumFractionDigits:2
                    }
                )
            }}

        </template>



        <template #purchasePrice="{data}">

            {{
                data.purchasePrice?.toLocaleString(
                    'es-ES',
                    {
                        minimumFractionDigits:2
                    }
                )
            }}

        </template>


    </GenericDataTable>


</div>

</template>


<script setup>

import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';

import GenericDataTable from '@/components/shared/GenericDataTable.vue';


const toast = useToast();


const tableKey = ref(0);


const products = ref([]);



const columns = [
    {
        field: 'code',
        header: 'Código',
        sortable: true
    },
    {
        field: 'description',
        header: 'Descripción',
        sortable: true
    },
    {
        field: 'category',
        header: 'Categoría',
        sortable: true
    },
    {
        field: 'family',
        header: 'Familia',
        sortable: true
    },
    {
        field: 'uom',
        header: 'U.M.',
        sortable: true
    },
    {
        field: 'salePrice',
        header: 'Precio Venta',
        sortable: true
    },
    {
        field: 'purchasePrice',
        header: 'Precio Compra',
        sortable: true
    },
    {
        field: 'active',
        header: 'Activo',
        sortable: true
    }
];



function newProduct(){

    toast.add({
        severity:'info',
        summary:'Nuevo producto',
        detail:'Pendiente de implementar',
        life:3000
    });

}



function editProduct(product){

    toast.add({
        severity:'info',
        summary:'Editar producto',
        detail:`Producto ${product.code}`,
        life:3000
    });

}



function deleteProduct(product){

    toast.add({
        severity:'warn',
        summary:'Eliminar producto',
        detail:`Producto ${product.code}`,
        life:3000
    });

}



</script>


