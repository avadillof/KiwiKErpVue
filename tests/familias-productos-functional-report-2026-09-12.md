# Pruebas funcionales — Maestros → Familias de Productos

Entorno: despliegue de pruebas `gocu-5b950bf3acaf4ef4bc61f5bf9b2d7794.freelandsite.es`.
Fecha: 12/09/2026. Usuario autorizado: avadillo@freelandsite.es.

## Datos demo conservados

Se crearon cuatro familias ficticias:

- `FAM-DEMO-01` — Materiales ecológicos / Eco materials — activa.
- `FAM-DEMO-02` — Servicios digitales actualizados / Digital services updated — inactiva.
- `FAM-DEMO-03` — Equipamiento industrial / Industrial equipment — activa.
- `FAM-DEMO-04` — Consumibles de oficina / Office supplies — activa.

Se intentó crear más familias para forzar paginación, pero la automatización del formulario perdió el diálogo después del primer ciclo; el catálogo conserva sólo estos cuatro registros válidos.

## Resultado

- Alta normal: correcta.
- Campos obligatorios: Código y Descripción bloquean el guardado cuando están vacíos.
- Descripción en otro idioma: se guarda correctamente y se recupera en edición.
- Código duplicado: rechazado por backend con `El código de la Familia de Producto ya existe`.
- Edición: correcta; se modificó descripción y traducción de `FAM-DEMO-02`.
- Activar/desactivar: existe checkbox y funciona; `FAM-DEMO-02` quedó `INACTIVO`.
- Cancelar edición: correcto; el cambio `NO GUARDAR` no apareció en el listado.
- Búsqueda: correcta después de la espera de carga; `FAM-DEMO-02` redujo el listado a un único resultado y mostró `Filtro Activo`.
- Ordenación: el listado cambia de orden al guardar y los encabezados se presentan como columnas ordenables; no se confirmó cada dirección de orden con suficientes registros.
- Paginación: no verificable con cuatro registros; muestra `1 de 1`.
- Borrado: disponible y protegido por confirmación. Se abrió el diálogo y se canceló para conservar la familia demo; no se ejecutó la eliminación.
- Persistencia: las familias permanecieron al salir del formulario y volver al catálogo mediante Datos maestros.
- Validaciones adicionales: no hay otros campos ni reglas visibles aparte de longitud HTML y obligatoriedad; no existe BIC u otra validación específica aplicable.

## Incidencias

### INC-FAMILIASPRODUCTOS-001

Título: La actualización del listado se muestra en estado intermedio y puede conservar resultados anteriores durante la búsqueda.

Gravedad: Media

Pantalla: Maestros → Familias de Productos.

Pasos para reproducir:

1. Tener cargado el catálogo.
2. Escribir `FAM-DEMO-02` en `Buscar registros...`.
3. Observar inmediatamente el listado antes de que termine la petición.

Resultado obtenido: Durante la carga aparece `Cargando datos...` y puede permanecer visible el listado anterior; después de la espera se muestra un único resultado y `Filtro Activo`.

Resultado esperado: Vaciar o marcar como no válido el listado anterior mientras se carga y mostrar de forma inequívoca que el resultado corresponde al filtro actual.

Datos utilizados: búsqueda `FAM-DEMO-02`; cuatro familias demo.

Observaciones: El resultado final fue correcto. La incidencia afecta claridad y experiencia de usuario durante la transición.

Propuesta de corrección para Codex: Front: asociar el estado de carga al criterio de búsqueda, limpiar filas anteriores o mostrar una capa bloqueante y anunciar el número de resultados sólo tras completar la respuesta. Back: devolver respuesta paginada consistente con el filtro y un total calculado en la misma consulta.

### INC-FAMILIASPRODUCTOS-002

Título: La página de familias no puede probar paginación con el tamaño actual y no ofrece control visible de tamaño de página.

Gravedad: Baja

Pantalla: Maestros → Familias de Productos.

Pasos para reproducir: Abrir el catálogo con cuatro registros.

Resultado obtenido: La interfaz muestra `1 de 1`; los botones de página quedan deshabilitados y no existe selector visible de número de filas.

Resultado esperado: Conservar el comportamiento si es una decisión de diseño, o permitir seleccionar tamaño de página para probar y usar catálogos grandes.

Datos utilizados: cuatro familias `FAM-DEMO-01` a `FAM-DEMO-04`.

Observaciones: No es un fallo de datos; limita la verificación y la gestión de catálogos numerosos.

Propuesta de corrección para Codex: Front: añadir selector de filas por página y mantener el total y el estado de página sincronizados. Back: aceptar `page`, `size` y filtro en una consulta estable y devolver `totalElements`.

### INC-FAMILIASPRODUCTOS-003

Título: El borrado advierte que los productos asociados dejarán de estar disponibles, pero no ofrece una comprobación previa de dependencias.

Gravedad: Media

Pantalla: Acciones de una familia → Borrar.

Pasos para reproducir:

1. Abrir acciones de `FAM-DEMO-04`.
2. Elegir `Borrar`.

Resultado obtenido: Aparece confirmación: `Esta acción hará que todos los productos asociados dejen de estar disponibles para los operarios`.

Resultado esperado: Mostrar cuántos productos dependen de la familia y bloquear o explicar claramente el efecto antes de confirmar.

Datos utilizados: `FAM-DEMO-04 - Consumibles de oficina`.

Observaciones: La eliminación no se confirmó y no se alteraron datos demo.

Propuesta de corrección para Codex: Front: cargar el contador de artículos y usar un diálogo diferenciado para familia con dependencias. Back: comprobar dependencias dentro de la transacción, devolver conflicto 409 con el número de artículos y conservar integridad referencial.
