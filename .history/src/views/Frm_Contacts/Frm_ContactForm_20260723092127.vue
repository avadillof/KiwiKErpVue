<template>

<Dialog 
    v-model:visible="visible"
    modal
    :header="contact.pkid ? 'Editar Contacto' : 'Nuevo Contacto'"
    :style="{width:'60rem'}"
    class="kiwik-dialog"
    :dismissableMask="true"
    :pt="{
        content:{
            class:'overflow-y-auto'
        }
    }"
>


<div style="max-height:80vh;overflow-y:auto">


<Panel>


<template #header>

<div class="flex align-items-center gap-2">

    <div 
        class="flex align-items-center justify-content-center bg-primary-100 border-circle"
        style="width:32px;height:32px"
    >

        <i class="pi pi-user text-primary"></i>

    </div>


    <span class="font-bold">
        Datos del Contacto
    </span>


</div>

</template>



<div class="grid p-fluid">


    <!-- NOMBRE -->

    <div class="col-12 md:col-6">

        <FloatLabel variant="on" class="w-full">

            <InputText
                id="name"
                v-model="contact.name"
                maxlength="150"
                class="w-full"
            />

            <label for="name">
                Nombre
            </label>

        </FloatLabel>


    </div>




    <!-- CARGO -->

    <div class="col-12 md:col-6">

        <FloatLabel variant="on" class="w-full">


            <Select
                id="cargo"
                v-model="contact.cargoId"
                :options="cargos"
                optionLabel="name"
                optionValue="id"
                class="w-full"
            />


            <label for="cargo">
                Cargo
            </label>


        </FloatLabel>


    </div>




    <!-- EMAIL -->

    <div class="col-12 md:col-6">


        <FloatLabel variant="on" class="w-full">


            <InputText
                id="email"
                v-model="contact.email"
                maxlength="125"
                class="w-full"
            />


            <label for="email">
                Email
            </label>


        </FloatLabel>


    </div>




    <!-- TELEFONO -->

    <div class="col-12 md:col-6">


        <FloatLabel variant="on" class="w-full">


            <InputText
                id="phone"
                v-model="contact.phone"
                maxlength="45"
                class="w-full"
            />


            <label for="phone">
                Teléfono
            </label>


        </FloatLabel>


    </div>




    <!-- NIF -->

    <div class="col-12 md:col-4">


        <FloatLabel variant="on" class="w-full">


            <InputText
                id="nif"
                v-model="contact.nif"
                maxlength="45"
                class="w-full"
            />


            <label for="nif">
                NIF
            </label>


        </FloatLabel>


    </div>



    <!-- FECHA NACIMIENTO -->


    <div class="col-12 md:col-4">


        <FloatLabel variant="on" class="w-full">


            <DatePicker
                id="born"
                v-model="contact.born"
                class="w-full"
                showIcon
                dateFormat="dd/mm/yy"
            />


            <label for="born">
                Fecha nacimiento
            </label>


        </FloatLabel>


    </div>



</div>


</Panel>





<Panel style="margin-top:20px">


<template #header>

<div class="flex align-items-center gap-2">


<div 
class="flex align-items-center justify-content-center bg-primary-100 border-circle"
style="width:32px;height:32px"
>

<i class="pi pi-cog text-primary"></i>


</div>


<span class="font-bold">
Configuración
</span>


</div>


</template>



<div class="grid p-fluid">


<div class="col-12 md:col-3">

    <Checkbox 
        id="active"
        v-model="contact.active"
        binary
    />

    <label for="active">
        ¿ Activo ?
    </label>


</div>



<div class="col-12 md:col-3">

    <Checkbox 
        id="default"
        v-model="contact.defaultContact"
        binary
    />

    <label for="default">
        ¿ Contacto Principal ?
    </label>


</div>


</div>


</Panel>


</div>




<template #footer>


<Button
    label="Guardar"
    icon="pi pi-check"
    @click="save"
/>


</template>



</Dialog>


</template>
<script setup lang="ts">

import { ref } from 'vue';


const props = defineProps({

    entitieId:{
        type:Number,
        required:true
    },

    entitieName:{
        type:String,
        default:''
    }

});


const emit = defineEmits([
    'saved'
]);


const visible = ref(false);


const contactId = ref<number|null>(null);



const contact = ref({

    name:'',
    email:'',
    phone:'',
    nif:'',
    birth:null,
    cargoId:null,
    memo:'',
    active:true,
    defaultContact:false

});



const cargos = ref([]);



function clearForm(){

    contact.value={
        name:'',
        email:'',
        phone:'',
        nif:'',
        birth:null,
        cargoId:null,
        memo:'',
        active:true,
        defaultContact:false
    };

}



async function open(id:number|null=null){

    contactId.value=id;


    if(id){

        await loadContact(id);

    }
    else{

        clearForm();

    }


    visible.value=true;

}



defineExpose({
    open
});



async function loadContact(id:number){

    console.log("Cargar contacto",id);

}



async function save(){

    console.log("Guardar",contact.value);


    emit('saved');

    visible.value=false;

}


</script>