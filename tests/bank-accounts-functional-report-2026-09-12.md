# Pruebas funcionales — Maestros → Cuentas Bancarias

Entorno: despliegue de pruebas `gocu-5b950bf3acaf4ef4bc61f5bf9b2d7794.freelandsite.es`.
Fecha: 12/09/2026. Usuario autorizado: avadillo@freelandsite.es.

## Datos de demostración conservados

Se han creado y comprobado 11 cuentas con datos ficticios y coherentes:

`DEMO 01` a `DEMO 11`, con descripciones de tesorería, cobros, pagos, reservas y proyectos; sucursales `Oficina demo...`; IBAN sintéticos españoles con formato y dígitos de control válidos. También permanece `QA 20260911 - Cuenta española`, creado en la sesión anterior. El catálogo muestra `Total: 12` tras salir y volver a entrar.

## Resultado de las pruebas

- Alta normal: OK. Descripción y IBAN válidos guardan y aparecen en el listado.
- Obligatorios: OK. Descripción vacía o con espacios e IBAN vacío bloquean el guardado.
- IBAN: OK. Se rechazan dígitos de control incorrectos y longitudes incorrectas. Se aceptan minúsculas y espacios, normalizando el valor mostrado.
- BIC/SWIFT: no existe este campo en esta pantalla, por lo que no es aplicable.
- Sucursal: opcional; se probó vacía y con texto ficticio.
- Edición: OK. Se modificaron sucursal e IBAN de `DEMO 02` y el cambio persistió.
- Cancelación: OK. Cambios en descripción, sucursal e IBAN se descartaron al cancelar y actualizar.
- Activar/desactivar: no existe opción en el formulario ni columna de estado.
- Persistencia: OK. Tras cerrar el formulario, navegar fuera y volver mediante `Datos maestros`, las 12 cuentas siguieron visibles.
- Ordenación: los encabezados muestran control de ordenación; no se detectó una incidencia al inspeccionar el listado.
- Paginación: con 12 registros la interfaz muestra `1 de 1`, por lo que no fue posible probar cambio de página.
- Borrado: no se ejecutó para no eliminar datos de demostración sin una necesidad posterior.

## Incidencias

### INC-BANK-001

Título: La búsqueda no filtra el catálogo de cuentas.

Gravedad: Alta

Pantalla: Maestros → Cuentas Bancarias.

Pasos para reproducir:

1. Abrir el catálogo con las 12 cuentas de demostración.
2. Introducir `DEMO 10` en `Buscar registros...`.
3. Esperar la actualización del listado.

Resultado obtenido: El campo conserva `DEMO 10`, pero siguen visibles las 12 cuentas y el contador muestra `Total: 12`.

Resultado esperado: Mostrar únicamente `DEMO 10 - Caja central (ficticia)` y actualizar el contador.

Datos utilizados: búsqueda `DEMO 10`; registros `DEMO 01`–`DEMO 11` y `QA 20260911`.

Observaciones: La búsqueda por `Málaga` también llegó a mostrar inicialmente el catálogo completo antes de actualizarse; al completar la actualización se mostró un único resultado. Conviene revisar la aplicación del filtro y su estado de carga para evitar resultados transitorios incorrectos.

### INC-BANK-002

Título: Se permite guardar el mismo IBAN en varias cuentas.

Gravedad: Alta

Pantalla: Nueva cuenta bancaria.

Pasos para reproducir:

1. Crear `DEMO 01` con `ES3699990001411209202601`.
2. Crear `DEMO 02` con el mismo IBAN y una sucursal distinta.

Resultado obtenido: Ambas cuentas se guardaron y quedaron visibles con el mismo IBAN.

Resultado esperado: Rechazar el duplicado con un mensaje claro, o explicar explícitamente que se permite y por qué.

Datos utilizados: descripción `DEMO 02 - Cobros comerciales (ficticia)`, sucursal `Oficina demo norte - Madrid`, IBAN sintético `ES3699990001411209202601`.

Observaciones: Después se modificó `DEMO 02` a `ES8799990001461209202602`, por lo que los datos demo conservados actualmente tienen IBAN distintos. La aplicación informa que la validación local no confirma existencia, titularidad o disponibilidad.

### INC-BANK-003

Título: La URL interna directa devuelve 404 de Nginx.

Gravedad: Media

Pantalla: Ruta `/configuracion/cuentas-bancarias`.

Pasos para reproducir: Con sesión válida, navegar directamente a `https://gocu-5b950bf3acaf4ef4bc61f5bf9b2d7794.freelandsite.es/configuracion/cuentas-bancarias`.

Resultado obtenido: `404 Not Found` de `nginx/1.31.5`.

Resultado esperado: Cargar la SPA y el catálogo, igual que al acceder mediante `Configuración → Datos maestros → Cuentas bancarias`.

Datos utilizados: usuario de pruebas ya autenticado; ninguna escritura adicional.

Observaciones: La navegación interna funciona correctamente. Parece faltar la regla de fallback de rutas del despliegue Nginx.
