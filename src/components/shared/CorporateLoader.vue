<template>
  <div class="corporate-loader" role="status" aria-live="polite" aria-atomic="true">
    <div class="corporate-loader__symbol" aria-hidden="true">
      <span class="corporate-loader__ring" />
      <img src="/logos/logo512.png" alt="" width="44" height="44" />
    </div>
    <div class="corporate-loader__copy">
      <span class="corporate-loader__brand" aria-hidden="true">Kiwi<span>KERP</span></span>
      <span v-if="label" class="corporate-loader__label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'Cargando datos…' });
</script>

<style scoped>
.corporate-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:22px 30px;max-width:100%;color:#344054;text-align:center}
.corporate-loader__symbol{position:relative;display:grid;place-items:center;width:68px;height:68px;flex-shrink:0}
.corporate-loader__symbol img{display:block;width:44px;height:44px;object-fit:contain}
.corporate-loader__ring{position:absolute;inset:0;border:3px solid #e8efda;border-top-color:#97bc0c;border-right-color:#c5df71;border-radius:50%;animation:kiwik-loader-orbit 1.25s linear infinite}
.corporate-loader__copy{display:flex;flex-direction:column;gap:5px}
.corporate-loader__brand{color:#739409;font-size:18px;font-weight:800;letter-spacing:-.5px;line-height:1.2}
.corporate-loader__brand span{color:#344054}
.corporate-loader__label{font-size:13px;font-weight:500;line-height:1.5;color:#596577}
@keyframes kiwik-loader-orbit{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){.corporate-loader__ring{animation:none}}
</style>
