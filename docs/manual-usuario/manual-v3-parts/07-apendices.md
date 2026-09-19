# Apéndices

## Apéndice A. Glosario de estados y términos

### Estados de los documentos

| Estado | Significado para el usuario |
|---|---|
| Borrador | Documento todavía en preparación; editable y todavía no efectivo. |
| Confirmado | Documento operativo consolidado (albarán confirmado = entrega contabilizada). |
| En curso | Pedido confirmado que comienza su ejecución. |
| Parcialmente completado | Una parte ya se ha entregado, facturado o cancelado. |
| Entregado | No queda mercancía física pendiente; puede faltar facturación. |
| Completado | Todo lo servido está entregado y facturado. |
| Cancelado | No se servirá ninguna de las cantidades del documento. |
| Anulado | Documento invalidad; revierte las cantidades que hubiera contabilizado. |
| Bloqueado | Documento protegido frente a cambios; no es un estado comercial. |

### Estados de facturación y cobro

| Estado | Significado |
|---|---|
| Parcialmente facturado | Existe cantidad facturada o reservada, pero queda parte disponible. |
| En factura borrador | Toda la cantidad está incluida en facturas que todavía son borrador. |
| Facturado | Toda la cantidad entregada está incluida en facturas emitidas. |
| Parcialmente cobrada | Existe cobro registrado, pero queda saldo pendiente. |
| Cobrada | El saldo pendiente llega a cero. |

### Distinguir cada seguimiento

| Seguimiento | Pregunta que responde | Qué no significa |
|---|---|---|
| Estado del pedido | ¿Queda entrega o facturación por resolver? | Completado no significa cobrado. |
| Estado del albarán | ¿La salida está preparada, confirmada o anulada? | Borrador no equivale a entregado. |
| Estado de la factura | ¿Es borrador o ya tiene emisión definitiva? | Emitida no equivale a aceptada en VeriFactu. |
| Estado VeriFactu | ¿Qué resultado tiene el envío del registro? | Aceptada no equivale a cobrada. |
| Situación de cobro | ¿Cuánto se ha recibido y cuánto falta? | Vencida no equivale a anulada. |

### Términos AEAT y VeriFactu

- **VeriFactu:** sistema de verificación de la facturación de la AEAT. Cada factura se registra con un hash encadenado al anterior, garantizando trazabilidad e inmutabilidad.
- **Facturae:** formato XML de intercambio de facturas electrónicas utilizado por la integración.
- **Cola VeriFactu:** panel que muestra las facturas pendientes de envío, las que requieren atención y las últimas aceptadas.
- **Huella / hash:** resultado criptográfico del registro de una factura; cada registro incluye la huella del anterior (encadenamiento).
- **PrimerRegistro = S:** marca que identifica la primera factura de una cadena VeriFactu.
- **Aceptada / Aceptada con errores / Rechazada / Requiere corrección:** estados del registro VeriFactu. Solo **Aceptada** habilita el envío del correo al cliente.
- **Subsanar:** corregir un registro rechazado tras ajustar el dato maestro afectado, conservando el documento original.
- **Requena de la solicitud AEAT:** consulta de los registros existentes en la AEAT por año y mes.
- **NIF, NIE, NIF-IVA, NIF especiales K/L/M:** identificadores fiscales validados localmente antes de emitir.
- **Expediente AEAT:** paquete documental (ZIP) preparado para responder a un requerimiento de la Agencia Tributaria (véase el Apéndice B).

## Apéndice B. Requerimientos AEAT y archivo de expedientes

Desde el menú general del listado de Facturas se abre **Requerimientos y documentación AEAT**. Esta herramienta **prepara documentación**: no envía información, no contesta automáticamente requerimientos y no implementa el servicio de remisión bajo requerimiento de sistemas NO VERI*FACTU.

### B.1 Preparar un expediente

1. Abra **Nuevo expediente**.
2. Indique la **referencia de la notificación**, el **periodo de fechas** de las facturas, el **plazo de respuesta** (opcional) y **observaciones**.
3. Busque las facturas y seleccione únicamente las solicitadas. Cambiar las fechas vacía la selección para evitar incluir facturas de otro periodo.
4. Pulse **Preparar y archivar expediente** y revise las advertencias.

Máximo: **500 facturas y 100 MB de contenido** por expediente. Para un volumen superior, divida el alcance en varios expedientes. La fecha final incluye el día completo.

### B.2 Contenido del ZIP

El expediente guarda en el repositorio documental un ZIP con:

- Los **PDF existentes** en el repositorio de informes (original, VeriFactu y subsanaciones disponibles), sin regenerarlos.
- La **request y la response** conservadas en el histórico, como texto XML UTF-8, identificadas por factura e ID de histórico.
- `indice.json`: selección, fechas, situación al preparar, registros, huellas leídas del XML, anterior relacionado y sumas de comprobación de los archivos de evidencia.
- `LEEME.txt`: alcance, limitaciones y advertencias.

No se consultan claves privadas ni contraseñas. No se recalculan las huellas fiscales. Las sumas SHA-256 del ZIP y de los archivos son controles del paquete documental y **no sustituyen** las huellas de VeriFactu. Si faltan PDF, request o response, o no puede interpretarse el encadenamiento, se informa. La ausencia de advertencias no certifica cumplimiento, conservación integral ni validez de la cadena.

### B.3 Consulta y presentación

En **Expedientes preparados** puede abrirse el expediente y descargar su ZIP. La descarga recupera la copia archivada; no vuelve a generar el paquete con datos posteriores. Si cambia su checksum, la descarga se bloquea con una advertencia.

Pueden adjuntarse por separado la **notificación recibida** y el **justificante de presentación**, en PDF de hasta 15 MB. No modifican el ZIP preparado ni se sustituyen desde Documentos. El estado **Justificante adjunto** significa únicamente que se archivó un documento local; no verifica su presentación ante Hacienda.

> **Advertencia:** **no se envía nada a la AEAT desde esta opción.** El expediente es una ayuda de preparación, no un formato oficial. Siga el alcance, plazo y procedimiento indicado en la notificación.

## Apéndice C. Casos prácticos y resolución de problemas

### C.1 Crear un producto

1. Entre en **Ventas → Artículos**.
2. Pulse **Nuevo artículo** y complete descripción, precio, impuesto, unidad de medida, tipo logístico y tipo comercial.
3. Revise el flujo de venta (requiere albarán y política de facturación).
4. Guarde y compruebe que aparece en el listado.

### C.2 Configurar un certificado VeriFactu

1. Abra **Ventas → Ajustes de Ventas → Parámetros VeriFactu**.
2. Seleccione el certificado y valide la contraseña.
3. Guarde la configuración y revise el estado de conexión.
4. Al emitir, introduzca la contraseña del certificado; el servidor cifra la credencial al encolar el envío.

### C.3 Preparar la primera venta

1. Revise los datos de empresa, usuarios y datos maestros (Parte III).
2. Dé de alta el cliente y el artículo (Parte IV).
3. Cree un presupuesto, envíelo y acéptelo: se genera el pedido en borrador (capítulo 16).
4. Confirme el pedido y genere el albarán cuando vaya a entregar (capítulos 17 y 18).
5. Emita la factura desde el albarán o desde el pedido, con el certificado VeriFactu (capítulo 19).
6. Registre el cobro cuando reciba el pago (capítulo 20).

### C.4 Resolución de problemas frecuentes

| Problema | Qué revisar |
|---|---|
| No puede iniciar sesión | Usuario y contraseña, bloqueo de mayúsculas, estado de la cuenta, red y disponibilidad del servidor. |
| El correo de recuperación no llega | Carpeta de no deseado/promociones, dirección registrada en la ficha del usuario. |
| Un documento no aparece en el listado | Quite los filtros de estado y fechas; compruebe el periodo y los filtros combinables (Situación, VeriFactu, Correo, Vencimientos). |
| Guardó y perdió la respuesta de conexión | Compruebe el resultado en el listado o vuelva a abrir el detalle; utilice la acción de reintento de la misma operación antes de crear otra. |
| Rechazo o error en la emisión | Revise el listado de errores de validación fiscal y los datos de la empresa/cliente; use **Subsanar VeriFactu** si procede. |
| Resultado incierto al enviar correo o registrar cobro | Consulte el historial o la prueba antes de repetir; no reenvíe a ciegas para evitar duplicados. |
| Una opción nueva no aparece | Compruebe con el administrador que las migraciones de base de datos y las versiones de backend y frontend están desplegadas. |

## Apéndice D. Historial del manual y versiones

### Versión 3.0 (borrador) — 16 de septiembre de 2026

- Reorganización del manual en cinco partes y apéndices según el índice 3.0.
- Ampliación de los capítulos de impuestos, familias, auditoría de emisión, rectificativas, lista de precios y Ajustes de Ventas.
- Añadida la guía de inicio rápido, las notas de seguridad y el glosario de términos AEAT y VeriFactu.
- Los huecos de imagen se marcan como **[CAPTURA: descripción]** para completar en revisiones posteriores.

### Versión 2.7 — 1 de septiembre de 2026

- Asistente de instalación, identidad externa y variables de ubicación.
- Configuración y validación de GestDoc, indicación en el pie y reinicio requerido al cambiar la ruta.
- Verificación SMTP con sesión administrativa y diseño pendiente de dump y recreación de la base.

### Versión 2.6 — 1 de septiembre de 2026

- Trazabilidad comercial visual e imprimible desde Presupuestos, Pedidos, Albaranes y Facturas.
- Asistente de Pedidos de solo lectura y totales de asistentes separados por moneda.

### Versión 2.4/2.3/2.2 — 30 de agosto de 2026

- Diagrama completo del circuito de ventas y regla de mantenimiento conjunto de texto e imagen.
- Parámetros independientes para recordatorio y cancelación por vencimiento de presupuestos.
- Factura manual, edición del borrador, validación fiscal, emisión sin bloqueo y recordatorio configurable con prueba sin envío.

### Versión 2.1 — 30 de agosto de 2026

- Introducción al sistema, destinatarios, alcance y límites.
- Facturación desde pedido, facturas manuales y reservas sin duplicados.
- Cobros parciales y totales, justificantes, reversiones y respuestas inciertas.

### Versión 1.x — 27 a 29 de agosto de 2026

- Creación inicial del manual y documentación progresiva de acceso, panel de control, entidades, artículos, presupuestos, pedidos, albaranes, facturas, proformas y configuración.
- Numeración fiscal anual, emisión irreversible, cola VeriFactu, estados normalizados y corrección de seguimientos separados.