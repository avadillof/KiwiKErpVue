import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite';

export default defineConfig({
  plugins: [vue()],
  
  // Estas configuraciones resuelven los problemas de interoperabilidad
  optimizeDeps: {
    include: ['wnumb'] 
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  // Opcional: Esto ayuda si tienes problemas resolviendo rutas de archivos
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
})
