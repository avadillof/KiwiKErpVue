# Batería de pruebas: presupuesto → pedido → albarán → factura

## Resultado de esta ejecución

- Frontend: `npm run build` completado; avisos de CSS `:deep`, tamaño de paquetes e importación estática/dinámica.
- Emisión y factura manual: 16/16 pruebas aisladas correctas tras actualizar los cargadores de pruebas al código actual. No se ha modificado la lógica de la aplicación.
- Ejecución final `npm run test:sales`: 19/19 pruebas correctas (incluidos los tres casos del expediente AEAT), más las comprobaciones de tarifas correctas. Revisión de espacios del diff sin errores.
- Tarifas: comprobaciones aisladas correctas de preservación de precios, cantidades, cambio de moneda, recálculo atómico, respuestas antiguas y reintentos.
- Suite general inicial: 113 pruebas, 87 correctas y 26 fallidas. Los cargadores de emisión y factura manual explicaban 14 fallos, corregidos y reejecutados. Los otros 12 fallos (instalador, entidades, permisos TPV y usuarios) requieren revisión propia; no se consideran resueltos.
- Navegador: el acceso a `http://localhost:5173/Frm_Login` deriva a «Servidor no disponible». Backend escuchando en 8083, configuración HTTPS coincidente. El navegador de pruebas devuelve `net::ERR_CERT_AUTHORITY_INVALID` al abrir `https://localhost:8083/api/installation/status`.
- Pendiente: aceptar/configurar el certificado local y ejecutar los casos de integración de la tabla. No se ha iniciado sesión, creado documentos, enviado correos ni emitido facturas reales.

Evidencia del navegador: [bloqueo de conexión](flujo-ventas-bloqueo-2026-10-20.png).

## Repetición automática

Ejecutar `npm run test:sales` desde la raíz del frontend. Incluye emisión, factura manual, expediente AEAT y tarifas. Usa adaptadores y datos aislados; no necesita credenciales. Las pruebas de factura manual sustituyen el servicio de tarifas; este se comprueba por separado con su implementación real.

## Datos del circuito principal

Usar referencia `QA-VENTAS-20261020` y una empresa de pruebas. Elegir cliente con tarifa EUR y forma de pago configuradas. Producto físico: 10 unidades a 100 €, descuento 10 %, IVA 21 %. Resultado esperado: base 900 €, IVA 189 €, total 1.089 €, sin retención ni recargos. Primer parcial: 4 unidades, base 360 €, IVA 75,60 €, total 435,60 €. Resto: 6 unidades, base 540 €, IVA 113,40 €, total 653,40 €.

Usar un servicio sin entrega para la variante de facturación directa. Registrar identificadores y códigos de cada documento; no modificar documentos ajenos a la prueba. Verificar persistencia cerrando y reabriendo cada detalle. La emisión fiscal queda pendiente de confirmar que se usa un entorno fiscal de pruebas.

## Casos de integración

Todos los casos de esta tabla están **pendientes de ejecutar en navegador y BD**. La cobertura aislada parcial de emisión y tarifas no cambia este estado.

| ID | Acción | Resultado esperado |
| --- | --- | --- |
| P01 | Crear presupuesto con cliente y producto | Hereda tarifa, moneda, pago e impuesto configurados. |
| P02 | Intentar guardar sin cliente o sin líneas válidas | Mensaje claro; no crea documento inválido. |
| P03 | Guardar el presupuesto de los datos principales | Base 900 €, IVA 189 €, total 1.089 €. |
| P04 | Cerrar, reabrir y editar cantidad/descuento | Datos persistidos; totales recalculados. |
| P05 | Cambiar tarifa con líneas ya valoradas | Permite la decisión prevista de conservar/recalcular; no mezcla monedas. |
| P06 | Cambiar rápidamente cliente/producto/cantidad | Una respuesta anterior no sustituye la última selección. |
| P07 | Generar y revisar PDF de presupuesto | Cliente, referencia, líneas, impuestos y totales coinciden. |
| P08 | Aceptar/convertir presupuesto a pedido | Conserva cliente, condiciones, líneas y vínculo de origen. |
| P09 | Repetir conversión o doble clic | No duplica inadvertidamente el pedido ni sus cantidades. |
| O01 | Abrir y confirmar pedido | Estado y cantidades pendientes coherentes. |
| O02 | Consultar trazabilidad | Se llega al presupuesto desde el pedido y viceversa cuando la UI lo ofrece. |
| O03 | Preparar entrega de 4 unidades | Pendiente restante 6; reserva/entrega sin duplicación. |
| O04 | Intentar entregar más de lo disponible | Rechazo y cantidades originales conservadas. |
| O05 | Cancelar cantidades ya comprometidas | Bloqueo conforme a reservas y ejecución existentes. |
| A01 | Guardar y confirmar primer albarán | 4 unidades vinculadas al pedido. |
| A02 | Cerrar y reabrir albarán | Persistencia de líneas, dirección y referencias. |
| A03 | Generar segundo albarán con las 6 restantes | Pedido entregado; no permite sobreentrega. |
| A04 | Revisar PDF y trazabilidad de albarán | Cantidades y origen coinciden con el documento guardado. |
| F01 | Facturar primer albarán | Borrador por 435,60 €, con origen y 4 unidades. |
| F02 | Repetir facturación del mismo pendiente | No permite doble reserva/facturación. |
| F03 | Facturar las 6 unidades restantes | Borrador por 653,40 €; suma de ambos 1.089 €. |
| F04 | Cancelar un borrador de la prueba | Libera el pendiente/reserva que corresponda; permite recrearlo sin excederlo. |
| F05 | Reabrir facturas y consultar pedido | Cantidades reservadas/facturadas coherentes con cada estado real. |
| F06 | Facturar servicio directo sin albarán | Sólo líneas aptas; conserva vínculo con pedido y cantidades. |
| F07 | Intentar facturar directamente una línea con política de entrega | Rechazo si no está habilitada para facturar por pedido. |
| F08 | Validación fiscal con datos incompletos | Lista errores localizados y bloquea emisión. |
| F09 | Emitir en entorno fiscal de pruebas, doble clic | Una emisión; documento protegido mientras se procesa. |
| F10 | Respuesta incierta durante emisión | No repite emisión; permite comprobar estado persistido. |
| F11 | Validación rechazada antes de emitir | Mantiene borrador corregible y limpia la contraseña. |
| F12 | Consultar resultado fiscal y descargar PDF/XML | Estado, numeración, importes y archivo coinciden; sin reemisión. |
| F13 | Pedido completamente atendido | Estado final coherente con entrega, facturación y cancelaciones. |
| F14 | Usuario sin permisos intenta operaciones de ventas | Servidor rechaza la operación; no basta ocultar botones. |

## Evidencias que deben añadirse al desbloquear el navegador

Registrar empresa, códigos de presupuesto/pedido/albaranes/facturas, cantidades y estados después de reabrir, capturas y resultado de cada caso. Para emisión: identificar entorno fiscal, estado final y archivos obtenidos. Los resultados fiscales, PDF, stock y persistencia no se deducen de la compilación ni de las pruebas aisladas.
