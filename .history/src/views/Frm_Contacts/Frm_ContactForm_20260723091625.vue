<template>

    <Dialog 
        v-model:visible="visible"
        modal
        :header="contactId ? 'Editar Contacto' : 'Nuevo Contacto'"
        :style="{width:'55rem'}"
        :closable="true"
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


        <div class="p-fluid">


            <div class="formgrid grid">


                <!-- Nombre -->

                <div class="field col-8">

                    <label>
                        Nombre
                    </label>

                    <InputText 
                        v-model="contact.name"
                    />

                </div>


                <!-- Cargo -->

                <div class="field col-4">

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



                <!-- Email -->

                <div class="field col-6">

                    <label>
                        Email
                    </label>

                    <InputText
                        v-model="contact.email"
                    />

                </div>



                <!-- Teléfono -->

                <div class="field col-6">

                    <label>
                        Teléfono
                    </label>

                    <InputText
                        v-model="contact.phone"
                    />

                </div>



                <!-- NIF -->

                <div class="field col-4">

                    <label>
                        NIF
                    </label>

                    <InputText
                        v-model="contact.nif"
                    />

                </div>



                <!-- Fecha nacimiento -->

                <div class="field col-4">

                    <label>
                        Fecha nacimiento
                    </label>

                    <Calendar
                        v-model="contact.birth"
                        dateFormat="dd/mm/yy"
                    />

                </div>



                <div class="field col-4 flex align-items-center gap-4 mt-4">


                    <div>

                        <Checkbox 
                            v-model="contact.defaultContact"
                            binary
                        />

                        <label class="ml-2">
                            Principal
                        </label>

                    </div>



                    <div>

                        <Checkbox 
                            v-model="contact.active"
                            binary
                        />

                        <label class="ml-2">
                            Activo
                        </label>

                    </div>


                </div>



                <!-- Memo -->

                <div class="field col-12">


                    <label>
                        Observaciones
                    </label>


                    <Textarea
                        v-model="contact.memo"
                        rows="5"
                        autoResize
                    />


                </div>


            </div>


        </div>



        <template #footer>


            <Button
                label="Cancelar"
                icon="pi pi-times"
                severity="secondary"
                outlined
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

import { ref, computed } from 'vue';

const props = defineProps({

    entitieId: {
        type: Number,
        required: true
    }

});

const visible = ref(false);

const contactPkid = ref<number | null>(null);

const title = computed(() =>
    contactPkid.value == null
        ? 'Nuevo contacto'
        : 'Editar contacto'
);

const open = (pkid: number | null = null) => {

    contactPkid.value = pkid;

    visible.value = true;

};

const close = () => {

    visible.value = false;

};

defineExpose({

    open,
    close

});

</script>