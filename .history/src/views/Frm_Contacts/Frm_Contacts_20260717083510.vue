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