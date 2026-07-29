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


