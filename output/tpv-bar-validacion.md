# TPV Bar: validación previa a comandas y modificadores

Fecha: 15/10/2026.

## Entorno y alcance confirmado

- Entorno de pruebas autorizado por el usuario.
- Dos terminales e impresora disponibles según el usuario.
- Acceso indicado: http://localhost:5173/tpv.
- Comandas: impresión en cocina/barra y pantalla de preparación.
- No se guardan credenciales en este documento.

## Evidencia de esta revisión

- 30 pruebas de frontend: correctas (impresión, precuenta, conexión, supervisión y cola de facturas).
- Backend: compilación de pruebas correcta con Java 17 y Maven offline.
- TpvTablesCheck: 19 comprobaciones en memoria correctas.
- TpvTableOperationsCheck: cambio, unión, separación, revisiones antiguas, contactos y atribución a operario correctos en simulación.
- TpvCheckoutCheck: 16 comprobaciones de cobro en simulación correctas.
- TpvWorkplaceCheck: 19 comprobaciones de puestos en simulación correctas.
- TpvClosureCheck: correcto (cambio, devoluciones, diferencias, empleados e historial).
- TpvRefundHistoryCheck: correcto.
- Navegador real: la aplicación abre /service-unavailable. La navegación directa a https://localhost:8083 confirma ERR_CERT_AUTHORITY_INVALID; el usuario indica que accede desde otro navegador. Pendiente de que el usuario revise el certificado en el navegador integrado. No se ha iniciado sesión ni creado una venta.

Estas pruebas no acreditan concurrencia real de base de datos, persistencia tras reinicio ni impresión física.

## Prueba real pendiente

1. Iniciar backend actualizado y verificar la migración del contacto de mesa.
2. Entrar por PIN en los dos terminales, seleccionar la misma zona/caja y una mesa de prueba libre.
3. Terminal A: añadir consumiciones y un contacto de prueba, guardar, salir y recuperar. Comprobar cantidades, importes y contacto.
4. Terminal B: abrir la misma mesa. A guarda un cambio; B intenta guardar su revisión anterior. Debe rechazarse sin sobrescribir A.
5. Recargar B y comprobar el estado compartido.
6. Cambiar la cuenta a una mesa libre; confirmar mesa origen libre y conservación de contacto e importes.
7. Separar una línea completa a otra mesa y comprobar que la suma de ambas cuentas coincide con el original.
8. Juntar las cuentas y comprobar que no se duplica ninguna consumición. Con contactos distintos, comprobar el bloqueo.
9. Imprimir precuenta: verificar físicamente mesa, líneas, importes y marca pendiente de cobro; no debe llevar QR fiscal, cambio ni abrir cajón.
10. Cobrar en entorno de pruebas. Confirmar F2, QR, una sola venta, movimientos de la apertura y mesa liberada. Un segundo cobro desde una revisión antigua debe rechazarse.
11. Devolver una línea del ticket de prueba; comprobar cantidades, apertura actual e historial sin alterar el cobro original.
12. Revisar el informe de caja. Cerrar únicamente una apertura de prueba dedicada, sin cuentas ajenas abiertas.

Registrar números de tickets/mesas, resultado de cada paso y confirmación física del usuario. No borrar el historial fiscal generado en la prueba.

## Comandas y modificadores implementados

- En una mesa, cada línea permite elegir Cocina, Barra o Sin preparación, añadir hasta 12 modificadores sin precio y una nota.
- Se puede separar una unidad antes de aplicar una preparación distinta.
- Primer envío explícito con Enviar a preparación. Después, guardar la mesa comunica automáticamente los cambios y anulaciones. Guardar antes del primer envío no despacha nada.
- Cola persistente por zona y destino, con estados Pendiente, En preparación, Lista y Entregada, historial paginado y actualización cada 5 segundos.
- Imprimir desde cada comanda: elegir una impresora del registro compartido con etiquetas. La selección se recuerda por puesto/navegador, zona y destino. No hay impresión automática al enviar.
- El estado de impresión no acredita salida física. Un envío incierto requiere comprobar el papel y pedir una copia explícita.
- Cambiar de mesa avisa del traslado. Juntar/dividir cuentas con comandas ya enviadas queda bloqueado en esta versión para evitar duplicar preparación; las cuentas no enviadas conservan estas operaciones.
- Los modificadores de texto no tienen coste; los suplementos con precio se seleccionan del catálogo (ver ampliación).

### Puesta en marcha y prueba del usuario

Reiniciar el backend actualizado para aplicar V2026202836 y recargar el frontend. La migración y la impresión física no se han ejecutado desde esta sesión.

1. Terminal A: abrir una mesa, añadir dos unidades, separar una unidad y asignar preparaciones diferentes.
2. Enviar a preparación. Terminal B: abrir Cocina y barra en la misma zona. Comprobar cantidades, modificadores y notas.
3. Repetir el envío sin cambios: no debe aparecer otra comanda.
4. Añadir una unidad, guardar y comprobar que solo llega la diferencia.
5. Quitar una unidad ya enviada, guardar y verificar aviso ANULAR. Cambiar una nota debe anular la versión anterior y añadir la nueva.
6. Cambiar a una mesa libre; comprobar aviso CAMBIO DE MESA.
7. Elegir impresora por destino e imprimir. Confirmar papel, acentos, cantidades, anulaciones y modificadores; nunca apertura de cajón.
8. Intentar imprimir la misma comanda desde ambos terminales: solo uno debe reclamar el original. Las reimpresiones deben indicar COPIA.
9. Cambiar el estado simultáneamente desde ambos terminales: la segunda operación desactualizada debe exigir actualizar.
10. Cobrar la mesa: cocina debe conservar sus comandas pendientes hasta entregarlas.
11. Reiniciar el backend y comprobar que siguen disponibles el historial y los estados. Volver a autenticar si la sesión lo exige.
12. Desconectar la impresora durante un envío: verificar el papel antes de solicitar copia; no debe existir reintento automático.

Validación local: compilación y pruebas automatizadas se documentan en la entrega. Pendiente de verificar en entorno real: Flyway/BD, concurrencia entre terminales, permisos efectivos y salida física.

### Comprobaciones realizadas en esta implementación

- Build del frontend (TypeScript y Vite): correcto; conserva avisos anteriores de CSS y tamaño de bundles.
- Compilación Java/test-compile: correcta.
- 12 pruebas de impresión: correctas, incluidas las 3 nuevas de comandas.
- Contratos en memoria: diferencias de comandas, repetición, cambio de IDs, anulaciones, traslados y validación; 19 comprobaciones de mesas.
- Estas pruebas no sustituyen la validación de transacciones reales ni la impresora física.

## Ampliación: cobro parcial, anulaciones, suplementos y comensales

Reiniciar el backend para aplicar **V2026202837** y recargar el frontend. Migración/BD real y validación fiscal externa pendientes de ejecutar por el usuario.

### Cobro parcial por cantidades

En una mesa guardada, pulsar **Cobrar parte**, indicar unidades por línea y continuar al cobro. El servidor calcula la parte seleccionada y deja el resto en la misma mesa. Cada pago utiliza el cobro fiscal existente y su clave de operación. Un reintento de la misma petición no debe descontar unidades ni cobrar por segunda vez. Cobrar no anula la preparación en cocina.

Prueba: cuatro bebidas con un total que tenga céntimos impares; cobrar dos y luego las otras dos. Sumar los tickets y comprobar que coincide exactamente con la cuenta original. Desde el segundo terminal intentar cobrar una selección anterior: debe pedir recargar.

### Anulaciones

Al restar unidades, eliminar una línea o vaciar la cuenta se pide motivo. La reducción se guarda con operario, fecha, artículo, cantidad y si ese artículo tenía unidades enviadas a cocina. En ese caso se exige administrador o el permiso existente **Devolver tickets**; no hay aprobación mediante un PIN ajeno dentro del diálogo. El responsable debe operar con su propia sesión autorizada. Las anulaciones de ventas ya cobradas siguen por el circuito de devoluciones.

El historial **Anulaciones** de la mesa es paginado y visible con ese mismo permiso. Si existen variantes del mismo artículo, el indicador de envío es conservador por artículo: exige permiso si alguna de sus unidades pendientes estaba enviada.

Prueba: anular una unidad sin enviar y otra enviada, con y sin permiso; comprobar motivo obligatorio, historial y aviso ANULAR en cocina. Separar unidades sin reducir la cantidad total no debe registrarse como anulación.

### Suplementos

En **Preparación**, buscar y seleccionar artículos del catálogo como suplementos por unidad. Se toma el precio del servidor, se añade a la descripción y a los importes de la consumición, y llega a cocina y al ticket/factura. Los suplementos deben compartir moneda e IVA con el artículo; con otro IVA deben añadirse como línea independiente. No se admiten precios libres enviados por el navegador.

Prueba: aplicar un suplemento a una sola unidad de dos consumiciones, guardar/reabrir, comprobar cantidades, descripción, precio e IVA; enviar a cocina y cobrar parcialmente. Verificar que al volver a añadir el artículo normal no hereda el suplemento.

### Comensales y tiempos

El campo **Comensales** es independiente de las plazas de la mesa. Se guarda con la cuenta; puede registrarse al sentar al grupo, antes de añadir productos. Las tarjetas muestran el tiempo desde apertura y, al pedir la precuenta, la espera de cuenta. Reimprimir la precuenta no reinicia esa espera. Los tiempos se refrescan en pantalla cada 15 segundos; los cambios de otras mesas se recuperan con Actualizar.

Prueba: guardar tres comensales en una mesa de cuatro plazas, reabrir desde otro terminal, solicitar/reimprimir la precuenta y verificar que la hora inicial de espera se conserva.

### Validación local de la ampliación

- Build TypeScript/Vite y Maven test-compile correctos.
- 16 pruebas frontend de selección de líneas e impresión correctas.
- 19 comprobaciones de cantidades parciales, redondeo, suplementos y anulaciones.
- 22 contratos de mesas y 20 de cobro, incluidos reintento parcial y rechazo de revisión antigua.
- Pruebas de cocina y operaciones de mesas correctas; cobrar cantidades no produce una anulación de cocina.
- Las pruebas backend usan repositorios/SQL simulados: no acreditan bloqueo real en MySQL, migración aplicada, AEAT ni impresión física.
