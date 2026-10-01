<template>
  <ConnectionMonitor />
  
  <Toast /> <ConfirmDialog /> <router-view />

</template>

<script setup>
  import Toast from 'primevue/toast';  
  import ConfirmDialog from 'primevue/confirmdialog';
  import ConnectionMonitor from './components/shared/ConnectionMonitor.vue'
  import { startIdleWatcher } from './services/composables/Sv_IdleLogout';

  startIdleWatcher();
  </script>


