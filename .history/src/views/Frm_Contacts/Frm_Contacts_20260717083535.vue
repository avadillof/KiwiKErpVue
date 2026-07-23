<template>

<Dialog
    v-model:visible="internalVisible"
    modal
    :header="`Contactos de ${entitieName ?? ''}`"
    :style="{
        width:'75rem',
        minHeight:'40rem'
    }"
    :closable="true"
    :draggable="false"
    :resizable="false"
>


<div
    style="
    height:600px;
    display:flex;
    flex-direction:column;
    background:white;
    padding:20px;
    border-radius:12px;
    border:1px solid #e5e7eb;"
>


<Toolbar class="mb-3">

    <template #start>

        <Button
            label="Nuevo Contacto"
            icon="pi pi-plus"
            size="small"
            variant="text"
            outlined
        />

    </template>


</Toolbar>



<GenericDataTable

    ref="tableRef"

    dataKey="pkid"

    selectionMode="single"

    v-model:selection="contactSelected"

    endpoint="WebGetContacts"

    :showPaginator="true"

    :filterable="true"

    :showActions="true"

>


<template #headerActions>

<Button
    icon="pi pi-ellipsis-v"
    text
    rounded
    @click="openMenuTable($event)"
/>

<Menu
    ref="menuTable"
    :model="menuItemsTable"
    popup
/>

</template>



<Column
    field="name"
    header="Nombre"
    sortable
/>


<Column
    field="surname"
    header="Apellidos"
    sortable
/>


<Column
    field="email"
    header="Email"
    sortable
/>


<Column
    field="phone"
    header="Teléfono"
    sortable
/>


<Column
    header="Acciones"
    style="width:5%"
>


<template #body="slotProps">

<Button
    icon="pi pi-ellipsis-v"
    text
    rounded
    @click="openMenu($event,slotProps.data)"
/>


</template>


</Column>


</GenericDataTable>


</div>

</Dialog>

</template>


<script setup lang="ts">

import { ref, watch } from 'vue';


const props = defineProps({

    visible:{
        type:Boolean,
        default:false
    },

    entitieId:{
        type:Number,
        default:null
    },

    entitieName:{
        type:String,
        default:''
    }

});


const emit = defineEmits([
    'update:visible'
]);



const internalVisible = ref(props.visible);


const tableRef = ref();

const contactSelected = ref<any>(null);


const menuTable = ref();

const menuOptionRegistro = ref();



watch(
    ()=>props.visible,
    value=>{
        internalVisible.value=value;
    }
);



watch(
    internalVisible,
    value=>{
        emit('update:visible',value);
    }
);



const menuItemsTable = ref([
    {
        label:'Refrescar',
        icon:'pi pi-refresh',
        command:()=>{
            refreshTable();
        }
    }
]);



const refreshTable=()=>{

    tableRef.value?.refresh();

};



const openMenuTable=(event:any)=>{

    menuTable.value.toggle(event);

};



const openMenu=(event:any,row:any)=>{

    contactSelected.value=row;

    menuOptionRegistro.value.toggle(event);

};



</script>