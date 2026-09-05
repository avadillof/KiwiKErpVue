<template>
  <Teleport to="body"><div v-if="connectionLost || activeOperation" class="connection-overlay" role="alertdialog" aria-modal="true" aria-labelledby="operation-title" @keydown.stop.prevent>
    <div class="connection-card">
      <CorporateLoader label="" aria-hidden="true" />
      <h2 id="operation-title">{{ connectionLost ? 'Esperando conexión...' : activeOperation?.title }}</h2>
      <p>{{ connectionLost ? 'Intentando reconectar con el servidor.' : activeOperation?.message }}</p>
    </div>
  </div></Teleport>
</template>

<script setup>
    import { watch, onUnmounted } from 'vue';
    import CorporateLoader from './CorporateLoader.vue';
    import { activeOperation } from '../../services/composables/useOperationBlocker';
    import { useConnectionMonitor } from '../../services/composables/Sv_MonitorConnectionBack.ts';
    const { connectionLost } = useConnectionMonitor(false);
    // PrimeVue dialogs can be teleported outside #app, so also block their keyboard shortcuts.
    const blockKeyboard = (event) => {
        if (connectionLost.value || activeOperation.value) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };
    document.addEventListener('keydown', blockKeyboard, true);
    const setInert = (blocked) => { const app = document.getElementById('app'); if (app) app.inert = blocked; };
    watch(() => connectionLost.value || !!activeOperation.value, setInert, { immediate: true, flush: 'sync' });
    onUnmounted(() => {
        document.removeEventListener('keydown', blockKeyboard, true);
        setInert(false);
    });
</script>

