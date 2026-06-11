import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ],
  
  resolve: {
    alias: {
      // Esto le dice a Vite que @ apunta a la carpeta src
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },

  optimizeDeps: {
    include: ['wnumb'] 
  },
  
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
});