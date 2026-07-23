<template>

<Dialog 
    v-model:visible="visible"
    modal
    :header="contactId ? 'Editar Contacto' : 'Nuevo Contacto'"
    :style="{width:'55rem'}"
    :draggable="false"
    :resizable="false"
    :pt="{
        root:{
            class:'kiwik-dialog'
        },
        header:{
            class:'kiwik-dialog-header'
        },
        content:{
            class:'kiwik-dialog-content'
        }
    }"
>


<div class="form-container">


    <!-- FILA 1 -->

    <div class="form-row">


        <div class="form-field flex-2">

            <label>
                Nombre
            </label>

            <InputText
                v-model="contact.name"
            />

        </div>



        <div class="form-field flex-1">

            <label>
                Cargo
            </label>


            <Dropdown
                v-model="contact.cargoId"
                :options="cargos"
                optionLabel="name"
                optionValue="id"
                placeholder="Seleccione cargo"
            />

        </div>


    </div>



    <!-- FILA 2 -->

    <div class="form-row">


        <div class="form-field flex-1">


            <label>
                Email
            </label>


            <InputText
                v-model="contact.email"
            />

        </div>



        <div class="form-field flex-1">


            <label>
                Teléfono
            </label>


            <InputText
                v-model="contact.phone"
            />


        </div>


    </div>



    <!-- FILA 3 -->


    <div class="form-row">


        <div class="form-field flex-1">


            <label>
                NIF
            </label>


            <InputText
                v-model="contact.nif"
            />


        </div>



        <div class="form-field flex-1">


            <label>
                Fecha nacimiento
            </label>


            <Calendar
                v-model="contact.birth"
                dateFormat="dd/mm/yy"
            />


        </div>



    </div>



    <!-- FILA 4 -->


    <div class="form-row options-row">


        <div class="option">


            <Checkbox
                v-model="contact.defaultContact"
                binary
            />


            <label>
                Principal
            </label>


        </div>



        <div class="option">


            <Checkbox
                v-model="contact.active"
                binary
            />


            <label>
                Activo
            </label>


        </div>



    </div>


</div>



<template #footer>

    <Button
        label="Cancelar"
        icon="pi pi-times"
        outlined
        severity="secondary"
        @click="visible=false"
    />


    <Button
        label="Guardar"
        icon="pi pi-save"
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