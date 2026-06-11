<template>
  <ConnectionMonitor />
  
  <Toast /> <router-view />

</template>

<script setup>
  import Toast from 'primevue/toast';  
  import ConnectionMonitor from './components/ConnectionMonitor.vue';
  const { isOnline } = useConnectionMonitor();

</script>


