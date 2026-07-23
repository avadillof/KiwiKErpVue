

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