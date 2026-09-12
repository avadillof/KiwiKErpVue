# URLs del backend

Usar `backendUrl` de `src/services/backendUrl.ts` con la ruta declarada en Spring:

```ts
axios.get(backendUrl('/loadSalesCatalog'));
fetch(backendUrl('/api/notes/load'), options);
```

También se aplica a tablas, descargas y recursos del backend. El cliente Axios
de `src/services/api.ts` aplica el mismo helper mediante un interceptor.
Las URLs externas completas se conservan.

| VITE_API_URL | Legacy `/loadSalesCatalog` | Nativo `/api/installation/status` |
| --- | --- | --- |
| `/api` | `/api/loadSalesCatalog` | `/api/installation/status` |
| `http://servidor:8083` | `http://servidor:8083/loadSalesCatalog` | `http://servidor:8083/api/installation/status` |
| vacío | `/loadSalesCatalog` | `/api/installation/status` |

En desarrollo se conserva `.env.development`. La base vacía usa el mismo origen.
Las barras finales de la base e iniciales de la ruta se normalizan.

## Docker y Traefik

El Dockerfile compila con `VITE_API_URL=/api` por defecto. Puede sobrescribirse:

```sh
docker build --build-arg VITE_API_URL=http://servidor:8083 -t kiwikerp-frontend .
```

Vite incorpora la variable al compilar: cambiar sólo el entorno del contenedor
Nginx no actualiza el JavaScript. Hay que reconstruir y recrear el contenedor.

Traefik debe quitar `/api` a las rutas legacy, pero conservarlo en las nativas
(`/api/installation`, `/api/notes`, `/api/gestdoc`, `/api/certificates`,
`/api/historicuser`, `/api/system`). Configurar una regla de mayor prioridad para
los endpoints nativos sin StripPrefix, y la regla general con StripPrefix para
legacy. Aplicar StripPrefix indiscriminadamente rompe los endpoints nativos.
No se han modificado controladores Spring ni la configuración de Traefik.

## Validación

`node --test tests/backend-url.test.mjs` comprueba ambas familias de rutas y el
cliente Axios. `npm run build` comprueba TypeScript y el bundle.
Tras desplegar, verificar en Red: catálogo y CRUD de clientes, estado de
instalación, notas y adjuntos. Las nativas deben llegar a Spring con `/api`;
las legacy, sin él. Repetir con una base absoluta en la instalación tradicional.
