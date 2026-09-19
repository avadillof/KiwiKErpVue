<template>
  <section class="settings-panel">
    <header v-if="title || subtitle" class="settings-panel__header">
      <div class="settings-panel__heading">
        <span v-if="icon" class="settings-panel__icon">
          <i :class="icon"></i>
        </span>

        <div>
          <h2 v-if="title" class="settings-panel__title">{{ title }}</h2>
          <p v-if="subtitle" class="settings-panel__subtitle">{{ subtitle }}</p>
        </div>
      </div>

      <div v-if="$slots.actions" class="settings-panel__actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="settings-panel__content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  icon?: string
}>()
</script>

<style scoped>
.settings-panel {
  width: 100%;
  height: auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.settings-panel__header {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 0 18px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e7ebef;
}

.settings-panel__heading {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: .85rem;
}

.settings-panel__icon {
  width: 2.6rem;
  height: 2.6rem;
  flex: 0 0 2.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: #f0f7d5;
  color: #648506;
  font-size: 1.15rem;
}

.settings-panel__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.25;
  color: #263144;
}

.settings-panel__subtitle {
  margin: .25rem 0 0;
  color: #7b8595;
  font-size: .92rem;
  line-height: 1.4;
}

.settings-panel__actions {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.settings-panel__content {
  flex: 0 0 auto;
  min-width: 0;
  min-height: 0;
  width: 100%;
}
</style>
