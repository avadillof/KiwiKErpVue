<template>
  <div class="card" style="height: 500px; display: flex; flex-direction: column;">
    <Toolbar class="mb-3">
      <template #start>
        <Button label="Nuevo Usuario" icon="pi pi-plus" size="small" variant="text" outlined
          @click="userFormRef.visibleInputs = true; userFormRef.open(null)" />
      </template>
      <template #end>

      </template>
    </Toolbar>


    <GenericDataTable style="min-height: 400px;" ref="tableRef" dataKey="userKyId" :endpoint="apiUrl"
      :showPaginator="true" :filterable="true" selectionMode="single" v-model:selection="userSelected"
      @row-select="handleRowSelect" @data-loaded="handleDataLoaded" :showActions="true">

      <template #headerActions>
        <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />
        <Menu ref="menuTable" :model="menuItemsTable" popup />
      </template>



      <Column field="userDsCode" header="Código" sortable style="width: 15%">

      </Column>


      <Column header="Usuario" field="name" sortable style="width: 25%">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <Avatar shape="circle" style="background-color:#dee9fc; color: #1a2544">

              <img v-if="!imageErrors[slotProps.data.pkid]" :src="getProfilePhotoUrl(slotProps.data.pkid)"
                @error="handleAvatarError(slotProps.data.pkid)" class="w-full h-full" style="object-fit: cover;" />

              <span v-else>
                {{ HelperString.getInitialsFromString(slotProps.data.name) }}
              </span>

            </Avatar>
            <span class="font-bold">{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>


      <Column field="groupName" header="Rol" sortable style="width: 20%">
        <template #body="slotProps">
          <Tag :severity="getRoleDetails(slotProps.data.groupName).severity" rounded>
            <div class="flex align-items-center gap-2">
              <i :class="getRoleDetails(slotProps.data.groupName).icon"></i>
              {{ getRoleDetails(slotProps.data.groupName).label }}
            </div>
          </Tag>
        </template>
      </Column>



      <Column field="active" header="Estado" style="width: 15%">
        <template #body="slotProps">
          <Tag :value="slotProps.data.active ? 'ACTIVO' : 'INACTIVO'"
            :severity="slotProps.data.active ? 'success' : 'danger'" rounded />
        </template>
      </Column>


      <Column field="lastConexion" header="Última Conexión" style="width: 15%">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-calendar text-primary"></i>
            {{ HelperDates.formatDateFromLocale(slotProps.data.lastConexion) }}
          </div>
        </template>
      </Column>


      <Column header="Acciones" style="width: 5%">
        <template #body="slotProps">
          <Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, slotProps.data)" />
        </template>
      </Column>

    </GenericDataTable>


    <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" />
  </div>

  <HistoricDialog ref="historicDialogRef" />
  <Frm_UserForm ref="userFormRef" @saved="refreshTable" />
  <ConfirmDialog />

</template>


<script setup lang="ts">

import { useRouter } from 'vue-router'
import { useCompanyStore } from '../../stores/companyStore.ts';
import Menu from 'primevue/menu';
import Toolbar from 'primevue/toolbar';
import { ref } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { HelperDates } from '../../libs/HelperDates';
import { HelperString } from '../../libs/HelperString';
import HistoricDialog from './Dg_HitoricUserConnections.vue';
import type { MenuItem } from 'primevue/menuitem';
import Frm_UserForm from '../../views/Frm_Main/Frm_Ajustes/Frm_UserForm.vue';

const imageErrors = ref<Record<number, boolean>>({});
const userSelected = ref<User | null>(null);
const historicDialogRef = ref();
const emit = defineEmits(['edit']);
const menuTable = ref();
const menuOptionRegistro = ref();
const apiUrl = ref('WebGetUsers');
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
const tableRef = ref<any>(null);
const userFormRef = ref();
const confirm = useConfirm();
const toast = useToast();
const companyStore = useCompanyStore();

type User = {
  pkid: number;
  userDsCode: string;
  name: string;
  email?: string;
};



const menuItems = ref([
  {
    label: 'Editar',
    icon: 'pi pi-pencil',
    command: () => {
      const id = userSelected.value?.pkid;
      if (!id || !userFormRef.value) return;

      userFormRef.value.open(id);
    }
  },

  {
    label: 'Historial Conexiones',
    icon: 'pi pi-history',
    command: () => {

      if (!userSelected.value) {
        console.error("No hay usuario seleccionado");
        return;
      }

      historicDialogRef.value.open(
        userSelected.value.pkid,
        userSelected.value.name
      );
    }
  },
  { separator: true },
  { label: 'Borrar', icon: 'pi pi-trash', style: 'color: var(--red-500)', command: () => deleteUser() },
  { separator: true },
  {
    label: 'Seguridad de Usuario',
    icon: 'pi pi-shield',
    command: () => {
      if (!userSelected.value) {
        console.error("No hay usuario seleccionado");
        return;
      }

      openUserSecurity(userSelected.value);
    }
  },
]);


const menuItemsTable = ref<MenuItem[]>([
  {
    label: 'Acciones',
    items: [
      {
        label: 'Refrescar datos',
        icon: 'pi pi-refresh',
        command: () => {
          try {
            refreshTable();
          } catch (err) {
            console.error("Error al refrescar:", err);
          }
        }
      },
      {
        label: 'Exportar a Excel',
        icon: 'pi pi-file-excel',
        command: () => {
          try {
            exportToExcel();
          } catch (err) {
            console.error("Error al exportar:", err);
          }
        }
      }
    ]
  }
]);



const openMenu = (event: Event, user: any) => {
  userSelected.value = user;
  menuOptionRegistro.value.toggle(event);
};




const openMenuTable = (event: Event) => {
  menuTable.value.toggle(event);
};


function emitEdit(user: any) { emit('edit', user); }



const handleRowSelect = (event: any) => {
  userSelected.value = event.data;
};


const handleDataLoaded = (data: any[], total: number) => {
  imageErrors.value = {};
};


function getRoleDetails(roleName: string) {
  const name = roleName?.toLowerCase() || '';
  if (name.includes('administrador') || name.includes('administrator')) {
    return { severity: 'danger', icon: 'pi pi-shield', label: 'Administrador' };
  }
  if (name.includes('tpv')) {
    return { severity: 'warn', icon: 'pi pi-desktop', label: 'Usuario TPV' };
  }
  return { severity: 'info', icon: 'pi pi-user', label: 'Usuario' };
}



const refreshTable = () => {
  if (tableRef.value) {
    tableRef.value.refresh();
  }
};

const exportToExcel = () => {
  if (tableRef.value) {
    tableRef.value.exportToExcel();
  }
};


const getProfilePhotoUrl = (pkid: number) => {
  // Si necesitas caché busting, mantén el timestamp, 
  // aunque en una tabla con muchos registros, a veces es mejor omitirlo para que el navegador cachee bien.

  const timestamp = new Date().getTime();
  return `${import.meta.env.VITE_API_URL.replace('/api', '')}/gestdoc/users/${pkid}/photoPerfil.jpg?t=${timestamp}`;
};

const deleteUser = () => {
  if (!userSelected.value) return;

  confirm.require({
    message: `¿Estás seguro de que quieres borrar al usuario ${userSelected.value.name}? Esta acción no se puede deshacer.`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancelar',
      severity: 'secondary'
    },
    acceptProps: {
      label: 'Borrar',
      severity: 'danger'
    },
    accept: async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/WebDeleteUser`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              pkid: userSelected.value!.pkid
            })
          }
        );

        if (!response.ok) {
          throw new Error('Error al eliminar el usuario');
        }

        toast.add({
          severity: 'success',
          summary: 'Borrado',
          detail: 'Usuario eliminado correctamente',
          life: companyStore.companyInfo.toastDuration ?? 3000
        });

        refreshTable();
      } catch (error) {
        console.error(error);

        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar el usuario',
          life: companyStore.companyInfo.toastDuration ?? 3000
        });
      }
    }
  });
};

const handleAvatarError = (pkid: number) => {
  // Marcamos este pkid como "con error"
  imageErrors.value[pkid] = true;
};


const openUserSecurity = (user: User) => {
  router.push({
    name: 'security',
    query: {
      userId: user.pkid,
      userName: user.name
    }
  })
}

</script>