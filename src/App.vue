<template>
  <ConnectionMonitor />

  <Toast /> <ConfirmDialog /> <router-view />
  <Dialog
    :visible="idleSessionPrompt.visible"
    modal
    :closable="false"
    :closeOnEscape="false"
    :draggable="false"
    header="¿Sigues ahí?"
    class="kiwik-dialog"
    :style="{ width: 'min(460px, 94vw)' }"
  >
    <p>{{ idleSessionPrompt.message }}</p>
    <template #footer
      ><div style="width: 100%">
        <div class="kiwik-separator" />
        <div
          style="
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            flex-wrap: wrap;
          "
        >
          <Button
            label="Cerrar sesión"
            severity="secondary"
            outlined
            @click="idleSessionPrompt.logout"
          />
          <Button
            label="Seguir trabajando"
            autofocus
            @click="idleSessionPrompt.continueWorking"
          />
        </div></div
    ></template>
  </Dialog>
</template>

<script setup>
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import ConnectionMonitor from "./components/shared/ConnectionMonitor.vue";
import {
  startIdleWatcher,
  idleSessionPrompt,
} from "./services/composables/Sv_IdleLogout";

startIdleWatcher();
</script>
