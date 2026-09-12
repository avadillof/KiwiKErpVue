# Correcciones y repetición de pruebas — Familias y Cuentas Bancarias

Fecha: 12/09/2026.

## Cambios aplicados

### Familias de Productos

- `GenericDataTable` limpia las filas al iniciar una carga, evitando mostrar resultados anteriores mientras cambia el criterio.
- Se añadió tamaño inicial de 10 filas y selector `10/25/50` en Familias.
- Se conservan la validación y el rechazo de códigos duplicados del backend.

### Cuentas Bancarias

- Se añadió tamaño inicial de 10 filas y selector `10/25/50`.
- El servicio backend normaliza el IBAN antes de guardar y rechaza duplicados con HTTP 409 y mensaje `Ya existe una cuenta bancaria con ese IBAN.`.
- La protección contempla tanto altas como ediciones, excluyendo el registro que se está editando.

## Verificación local

- `npm run build`: correcto (`vue-tsc -b` y `vite build`). Vite sólo muestra advertencias existentes de CSS `:deep` y tamaño de chunks.
- `git diff --check`: correcto.
- Backend: no se pudo ejecutar `mvn compile` porque Maven no está instalado en este entorno.

## Repetición sobre el despliegue

La aplicación publicada todavía sirve la imagen anterior. Por ello, los tests funcionales sobre la URL no pueden atribuir las correcciones al código local hasta reconstruir y recrear el contenedor:

- La búsqueda de Familias se debe repetir observando que durante la carga no permanezcan filas antiguas.
- Se debe comprobar el selector `10/25/50` y pasar de `1 de 1` a una segunda página con al menos 11 familias.
- En Cuentas se debe crear un segundo registro con el IBAN normalizado del primero y verificar HTTP 409, sin crear duplicado.
- En ambos catálogos se deben repetir alta, edición, cancelación, estado y persistencia después del despliegue.

## Incidencias abiertas hasta publicar

### INC-FAMILIASPRODUCTOS-001

Título: Pendiente de confirmar en producción la eliminación de filas antiguas durante la búsqueda.

Gravedad: Media

Pantalla: Maestros → Familias de Productos.

Pasos para reproducir: Publicar la nueva imagen, cargar el catálogo, escribir un criterio y observar la tabla durante la petición.

Resultado obtenido: No verificable aún con la imagen corregida.

Resultado esperado: La tabla queda vacía o cubierta por el estado de carga hasta recibir el resultado del criterio actual.

Datos utilizados: criterios `FAM-DEMO-02` y `Material`.

Observaciones: La corrección está en `GenericDataTable.vue` y afecta también a Cuentas.

Propuesta de corrección para Codex: Aplicada en Front; repetir prueba tras reconstruir Docker.

### INC-FAMILIASPRODUCTOS-002

Título: Paginación sin selector de tamaño.

Gravedad: Baja

Pantalla: Maestros → Familias de Productos.

Pasos para reproducir: Publicar la nueva imagen, crear 11 familias y observar el pie del listado.

Resultado obtenido: No verificable aún con la imagen corregida.

Resultado esperado: Selector `10/25/50` y navegación a una segunda página cuando el total supera 10.

Datos utilizados: familias `FAM-DEMO-01` a `FAM-DEMO-11`.

Observaciones: Corrección aplicada mediante propiedades específicas del componente.

Propuesta de corrección para Codex: Aplicada en Front; repetir prueba tras reconstruir Docker.

### INC-BANK-001

Título: Se permitía guardar el mismo IBAN en varias cuentas.

Gravedad: Alta

Pantalla: Maestros → Cuentas Bancarias.

Pasos para reproducir: Publicar la nueva imagen, guardar una cuenta con un IBAN válido y volver a guardar otra con el mismo IBAN con espacios o minúsculas.

Resultado obtenido: No verificable aún con la imagen corregida.

Resultado esperado: HTTP 409, mensaje claro y ningún segundo registro.

Datos utilizados: IBAN sintético `ES3699990001411209202601`, con variantes `ES36 9999 0001 4112 0920 2601` y `es3699990001411209202601`.

Observaciones: La protección se encuentra en `BankAccountService` y usa el IBAN ya normalizado.

Propuesta de corrección para Codex: Aplicada en Back; añadir una restricción única de base de datos en la migración si el esquema lo permite y repetir con concurrencia.

### INC-BANK-002

Título: Paginación sin selector de tamaño.

Gravedad: Baja

Pantalla: Maestros → Cuentas Bancarias.

Pasos para reproducir: Publicar la nueva imagen con más de 10 cuentas demo.

Resultado obtenido: No verificable aún con la imagen corregida.

Resultado esperado: Selector `10/25/50` y páginas navegables.

Datos utilizados: cuentas demo existentes y nuevas cuentas ficticias.

Observaciones: Corrección aplicada en Front junto con Familias.

Propuesta de corrección para Codex: Aplicada en Front; repetir prueba tras reconstruir Docker.
