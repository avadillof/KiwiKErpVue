<template>

<Dialog
    v-model:visible="visible"
    header="Nuevo Certificado Digital"
    modal
    :style="{width:'500px'}">

    <div class="flex flex-column gap-4">


        <div>
            <label class="font-semibold">
                Tipo de certificado
            </label>

            <Dropdown
                v-model="certificate.typeId"
                :options="certificateTypes"
                optionLabel="description"
                optionValue="id"
                class="w-full"
            />

        </div>


        <div>

            <label class="font-semibold">
                Descripción
            </label>

            <InputText
                v-model="certificate.description"
                class="w-full"
            />

        </div>


        <div>

            <label class="font-semibold">
                Archivo PKCS#12 (.p12)
            </label>


            <FileUpload
                mode="basic"
                accept=".p12"
                chooseLabel="Seleccionar certificado"
                @select="onFileSelect"
            />


        </div>


    </div>


    <template #footer>

        <Button
            label="Cancelar"
            text
            @click="close"
        />

        <Button
            label="Guardar"
            icon="pi pi-save"
            @click="save"
        />

    </template>


</Dialog>


</template>