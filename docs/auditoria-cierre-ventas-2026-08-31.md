# Auditoría de cierre de Ventas

Fecha: 31/08/2026. Alcance: frontend y backend locales, documentación, pruebas aisladas de tarifas y consultas de solo lectura al esquema MySQL configurado. No es una certificación fiscal, una prueba de penetración ni una validación integral en producción.

## Conclusión

**Las rectificativas son la principal ampliación funcional pendiente, pero no el único requisito para cerrar Ventas.** Antes de producción hay que cerrar identidad/permisos de cobros, validar el backend y la reapertura tras V28 (ya aplicada) y validar el circuito completo con persistencia y concurrencia reales. El entorno fiscal documentado sigue en PRUEBAS.

La existencia de pantallas o clases no acredita que estén desplegadas ni probadas de extremo a extremo. La auditoría inicial fue de solo lectura. Posteriormente se aplicó V28 con autorización expresa; no se emitieron facturas, enviaron correos ni registraron cobros.

## Estado del circuito

| Área | Evidencia en el proyecto | Estado de cierre |
| --- | --- | --- |
| Entidades y artículos | Datos comerciales, tarifa del cliente y política por línea | Implementado; incluir en regresión integral |
| Tarifas | Reglas producto/familia/todos, fijo/descuento, cantidad, moneda y simulación sin guardar | Motor y pantalla implementados; uso de USD confirmado por el usuario en presupuestos |
| Presupuestos | Propuesta, aceptación, conversión, avisos y cancelación por validez | Implementado; Nuevo al final, verde claro |
| Pedidos | Confirmación, política por línea, entrega/facturación separadas | Implementado; Nuevo al final, verde claro |
| Albaranes | Borradores, reservas, confirmación, entregas parciales y documentos manuales | Implementado; no se modificó su botón Nuevo |
| Facturación | Desde pedido/entrega o manual, borrador, emisión, PDF y trazabilidad | Implementado; prueba integral pendiente de cierre |
| VeriFactu y correo | Cola, resultado, reintento/corrección, auditoría e historial de correo | Implementado en circuito documentado de pruebas; no equivale a rectificar importes |
| Vencimientos y cobros | Plazos, reparto, cobro parcial/total, justificantes y reversión | Implementado; pendiente seguridad y prueba real de concurrencia |
| Automatizaciones | Parámetros, consulta previa, ejecución manual e historial | Implementado; verificar destinatarios/horarios en instalación objetivo |
| Rectificativas y abonos | Entidad y servicios heredados, sin acción/circuito completo en el listado actual | Pendiente de integrar y validar |
| Asistente de facturas | Consulta e interpretación, pruebas aisladas documentadas | Piloto; no requisito del circuito básico ni función comercial validada en producción |

## Pendientes priorizados

### P0. Identidad y permisos en cobros antes de producción

`WebRestInvoicePayments.actor()` acepta el `userCode` enviado por el navegador y comprueba que ese usuario existe y está habilitado. No obtiene el autor de `SecurityContext`. `SecurityConfig` termina en `anyRequest().permitAll()` y no enumera los endpoints de consulta, registro y reversión de cobros como autenticados. `PortalSessionFilter` permite continuar si no llega cabecera de sesión.

Consecuencia en el código revisado: conocer un código de usuario válido puede bastar para atribuirle una operación; enviar normalmente una sesión desde la interfaz no protege la petición directa. No se ha intentado explotar esto ni escribir datos reales. Una protección externa no revisada podría limitar la exposición, pero no sustituye la autorización de la aplicación.

Cierre propuesto: exigir sesión en servidor, derivar de ella el autor y verificar permisos de consultar/cobrar/revertir; rechazar autores manipulados. Probar petición sin sesión, usuario deshabilitado, usuario sin permiso y usuario autorizado. Revisar asimismo los demás endpoints de escritura de Ventas bajo la política permisiva. Tarifas sí comprueba identidad de sesión dentro del controlador; todavía no distingue permisos de consulta y administración de tarifas.

Evidencia: backend `webservices/WebRestInvoicePayments.java:21-39`, `security/SecurityConfig.java:33`, `security/PortalSessionFilter.java:19-29`, `webservices/WebRestSalesPricing.java:19-39` (rutas bajo `src/main/java/com/freelandsite/api`).

### P1. Origen del precio: V28 aplicada; validación funcional pendiente

Antes de la aplicación, las consultas de metadatos no encontraron `SALES_LINES_DS_PRICING_SOURCE` en `sales_lines` ni `SALES_PROFORMA_LINES_DS_PRICING_SOURCE` en `sales_proforma_lines`. El código ya lee/escribe esos campos. No desplegarlo contra el esquema anterior.

Preparado: `BackUpBBDD/sql/V28_20260831_sales_line_pricing_source.sql`. Requiere copia de seguridad, aplicación coordinada y backend/frontend compatibles. No cambia importes ni FK. Tras desplegar, probar guardar/reabrir presupuesto y pedido, copia a proforma, edición real de precio y líneas históricas. Estas últimas deben mostrar **Precio guardado**, no inventar una regla ni afirmar **Precio manual**.

El origen es una etiqueta descriptiva conservada con la línea, no un registro fiscal inmutable ni una auditoría completa de versiones de reglas. No debe publicitarse como tal.

### P1. Rectificativas: completar un circuito, no solo un botón

Existe `SalesRecInvoices`, soporte heredado en `ServiceVeriFactuService`, `ServiceFaceToSoapConverter` y endpoints en `WebVeriFactuController`. Esto evita partir de cero, pero no demuestra un flujo integrado equivalente a Facturas en el portal actual. `InvoiceAssistantService` excluye expresamente la tabla independiente de rectificativas de sus resúmenes.

Alcance propuesto para la siguiente entrega:

1. Seleccionar factura original, motivo y líneas/importes que se rectifican, conservando su vínculo.
2. Definir con el responsable fiscal los tipos y casos admitidos; no asumir que el tipo heredado R2 sirve para todos.
3. Borrador revisable, numeración/serie, emisión, PDF, envío y resultado VeriFactu propios, con recuperación idempotente.
4. Resolver saldos si la original está impagada, parcialmente cobrada o cobrada; diferenciar abono, devolución y compensación. Revertir un cobro no rectifica una factura.
5. Decidir explícitamente el efecto logístico: una rectificación económica no debe simular una devolución de mercancía.
6. Integrar listado, detalle, relaciones, filtros, widgets, asistente, correo, vencimientos y manual; evitar doble cómputo.
7. Validar parciales, totales, varias rectificativas, concurrencia y errores fiscales en un entorno de pruebas autorizado.

Es un alcance de producto pendiente, no instrucciones fiscales ni una promesa de cumplimiento normativo.

### P1. Prueba integral y despliegue controlado

Cerrar con una copia de la base real: presupuesto con tarifa y cantidades -> guardar/reabrir -> pedido -> entrega parcial o facturación por pedido -> borrador de factura -> emisión en pruebas -> aceptación -> plazos -> cobro parcial -> reversión -> saldo final. Incluir servicio, mercancía por pedido, mercancía por entrega, factura manual y pedido mixto.

Casos obligatorios: dos sesiones intentando facturar/cobrar lo mismo, reintento tras timeout, cantidades reservadas, cancelaciones y cambio de tarifa/moneda. Comprobar que documentos guardados mantienen precios y que las sumas no mezclan divisas. No se ejecutó este circuito real en esta auditoría.

La inspección confirmó tablas de plazos, asignaciones y recordatorios; su presencia no acredita todos sus índices, backfills o FK. Revisar V13/V16/V22/V23/V24 en la instalación destino por esquema real, sin ejecutar a ciegas un lote histórico de migraciones. Falta una compilación/empaquetado completo del backend como evidencia de esta entrega.

### P2. Ampliaciones fuera del cierre básico

Remesas, conciliación bancaria, gestión específica de impagados, vigencias de tarifas, fórmulas sobre coste, encadenamiento de tarifas, cambio automático de divisas y herencia de subfamilias. No confundirlas con las funciones ya implementadas ni convertirlas automáticamente en requisitos de esta fase.

## Auditoría real de tarifas

Consulta de solo lectura completada el 31/08/2026: MySQL 5.7.9, tablas InnoDB; 4 tarifas, 1 configuración y 5 reglas en el instante de consulta. Son una fotografía, no constantes de la aplicación.

- Seis FK comprobadas: tarifas-moneda, configuración-moneda, configuración-tarifa, regla-tarifa, regla-producto y regla-familia. Tipos compatibles, RESTRICT y cero huérfanos.
- Índice `uk_price_rule_quantity` presente sobre tarifa, ámbito, destino y mínimo. Índice antiguo `uk_price_rule_target` ausente.
- Cero mínimos inválidos, ámbitos/destinos inválidos, valores inválidos o incompatibilidad de moneda predeterminada en las comprobaciones del auditor.
- MySQL 5.7 no garantiza los CHECK modernos; conservar validaciones del servicio. Esta auditoría no prueba concurrencia transaccional.
- V28 estaba ausente en la auditoría inicial. Posteriormente se aplicó con autorización expresa, como se detalla al final. No se repitió V27.

## Evidencia de validación y entregables

- `node tests/sales-pricing-state.check.mjs`: correcto; carga sin recalcular, cantidades, moneda, precios manuales, respuestas obsoletas, reintento y origen conservado. HTTP simulado.
- Auditor `SalesPricingSchemaCheck`: consulta real de solo lectura, completada sin cambios.
- Consulta adicional de `information_schema`: presencia de tablas y ausencia de columnas V28; sin datos personales ni credenciales en salidas.
- Manual Markdown, manual integrado y guía de tarifas sincronizados en versión 2.5.
- Mapa nuevo con pizarra: PDF A1 con texto y trazos vectoriales, logo corporativo original y PNG para pantalla; los PNG históricos se conservan.
- `npm run build`: correcto, con avisos existentes de importación mixta y tamaño de chunks. Compilación parcial Java y 46 comprobaciones de `SalesPricingCheck`: correctas.
- PDF renderizado y revisado visualmente; una página A1, sin cifrado ni JavaScript. Texto, flechas y leyendas revisados. Falta una prueba física de imprenta.
- El navegador disponible redirige `/manual` al inicio de sesión. No se probó el manual en una sesión autenticada ni se alteró la autenticación para hacerlo; se validan importaciones y recursos mediante el build y comprobación estática.
- Comprobación estática final: 33 identificadores únicos, 31 enlaces internos con destino, recursos existentes y PDF/PNG incluidos en `dist/assets`. PDF con cuatro fuentes Segoe incrustadas; PNG de 2523 × 1783 píxeles.

El póster comunica el circuito implementado y mantiene rectificativas fuera del flujo. No promete homologación ni despliegue fiscal en producción. La auditoría técnica se mantiene separada del material comercial.


## Aplicación autorizada de V28 — 31/08/2026

Creada SALES_LINES_DS_PRICING_SOURCE y SALES_PROFORMA_LINES_DS_PRICING_SOURCE, ambas VARCHAR(255) NULL. Verificados los datos originales mediante SHA-256 de todas las columnas previas: 15 líneas y 0 líneas de proforma, sin cambios. El esquema previo conserva columnas, índices y FK. Copia de esquema (no de datos): backend BackUpBBDD/sql/audits/v28-schema-before-1788195796456.sql. Ejecutor explícito: SalesPricingV28Migration --apply-authorized-v28. No se ha reiniciado el backend ni probado guardar/reabrir desde el portal; esos pasos siguen pendientes.
