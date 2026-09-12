# Verificación de Entidades — 11/09/2026

Estado: parcial. No se ha conectado a un entorno funcional ni escrito en una base de datos.
No se ha modificado código de producción. Se han añadido pruebas de auditoría.

## Ejecución reproducible

`node --test tests/entities-form.test.mjs`

Resultado: 22 pruebas, 19 correctas y 3 fallidas. El comando termina con código 1 porque las tres incidencias están expresadas como expectativas de comportamiento correcto, sin ocultarlas con skip o todo.

Se ejecuta el script real de Frm_ClientForm.vue, con reactividad Vue y los helpers reales de cadenas y fechas. Se simulan HTTP, notificaciones y servicios de interfaz. No se monta el componente ni se comprueba PrimeVue, DOM, foco, red real, autorización del servidor o persistencia.

## Incidencias reproducidas

| Caso | Resultado esperado | Resultado observado | Alcance |
| --- | --- | --- | --- |
| Dos guardados simultáneos | Una petición mientras se guarda | Dos POST | No demuestra registros duplicados en BD; falta probar protección del servidor |
| Respuesta tardía de entidad A después de B | Conservar B | A sustituye B | Reproducido con cargas concurrentes; pendiente secuencia visual |
| Fecha representada por Invalid Date | Rechazar antes de guardar | validate devuelve true | Pendiente comprobar cómo permite introducirla DatePicker |

## Cobertura funcional pendiente

| Área | Casos a ejecutar en entorno de pruebas | Evidencia actual |
| --- | --- | --- |
| Directorio | Carga, vacío, error de red, paginación, tamaños, búsqueda, orden en cada columna, refresco | Inspección de código; pendiente funcional |
| Filtros | Cliente sí/no/todos, proveedor sí/no/todos, combinaciones, intervalo de fechas y extremos, limpiar y combinar búsqueda | Pendiente funcional |
| Alta | Código manual/automático, campos obligatorios, límites, espacios, acentos, duplicados de código/nombre/NIF | Obligatorios y dígito NIF probados; duplicados pendientes en BD |
| Roles y estado | Sin roles, cliente, proveedor, ambos; activo/inactivo; cambios de rol y reapertura | Validaciones individuales y selección de pestaña probadas; persistencia pendiente |
| Dirección/contacto | Direcciones, país/provincia, CP, localidad, teléfono, URL y correo; enlaces y teclado | Rechazo URL/correo incorrectos probado; resto pendiente |
| Ventas | Condición de cobro, tarifa opcional, banco, retención, tres días de pago, BIC principal/secundario y condiciones particulares | Obligatoriedad de condición y validación BIC probadas; catálogos y persistencia pendientes |
| Compras | Condición y tarifa obligatorias, banco, retención, días de pago y ambos BIC | Obligatoriedad y BIC probados; catálogos y persistencia pendientes |
| Nueva condición de pago | Abrir, cancelar, validar, crear, seleccionar, guardar entidad, catálogos compartidos | Pendiente |
| Edición | Cargar todos los campos, código bloqueado, guardar, cerrar/reabrir, cancelar cambios | Valores por defecto de atributos ausentes probados; resto pendiente |
| Guardado y carga | Error 409, error 500, desconexión, doble clic, apertura rápida A/B, cerrar durante carga/guardado | Error de servidor y cierre tras éxito probados; concurrencia con fallos documentados |
| Borrado | Cancelar, confirmar entidad ficticia, entidad con documentos vinculados, refresco y estadísticas | Pendiente; usar registros de prueba |
| Notas | Consultar, crear, editar, vaciar, cancelar y actualizar indicador | Pendiente |
| Adjuntos | Subir, descargar, quitar adjunto ficticio, errores/tamaños y contador | Pendiente |
| Contactos | Listar, crear, editar, validar, borrar contacto ficticio y aislamiento entre entidades | Pendiente |
| Estadísticas | Globales, seleccionada, importes, cambios tras CRUD, sin selección, fallo de red | Pendiente |
| Excel | Exportar y contrastar filas, filtros, columnas, fechas y caracteres | Pendiente |
| Permisos | Consultar, crear, guardar, borrar, notas, contactos, adjuntos; rechazo servidor para usuario sin permiso | Condiciones de visibilidad inspeccionadas; pendiente con usuarios de prueba |
| Usabilidad | Foco del primer error, pestaña correcta, Tab/Escape, cierre sin guardar, pantalla pequeña y scroll | Pendiente visual |

Para continuar hace falta la URL del entorno y confirmar que admite crear, modificar y eliminar registros ficticios. La inspección del controlador WebRestClients no equivale a haber ejecutado sus validaciones o transacciones.
