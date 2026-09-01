# Validación de tarifas — estado consolidado a 31/08/2026

Este documento sustituye las notas históricas que marcaban V27 o su reparación como pendientes. Para el cierre global, véase [Auditoría de Ventas](auditoria-cierre-ventas-2026-08-31.md).

## Implementado

Reglas de precio fijo o descuento para producto, familia exacta y catálogo; prioridad sin acumulación; tramos por cantidad y unidad habitual de venta. Precio base solo en la misma moneda. Otra moneda exige precio fijo aplicable, sin conversión automática.

Simulación con reglas del formulario, incluso sin guardar, mediante `WebPreviewSalesPrice`: mismo motor de cálculo, sin persistencia. Vista ampliada del precio y etiqueta de origen en presupuestos/pedidos; conservación del origen preparada con V28. Menú de acciones …, estilos corporativos y punto de miles/coma decimal.

## Comprobaciones actuales

- `node tests/sales-pricing-state.check.mjs`: correcto; carga sin recalcular, aplicación, descuentos adicionales, moneda, cantidades, preservación manual/guardada, respuesta obsoleta, lote atómico, reintento y origen persistente sin recálculo. HTTP simulado, sin empresa real.
- Compilación parcial con JDK 17 de modelos, controladores y servicio usando las dependencias locales: correcta. No equivale a empaquetado completo del servidor.
- `SalesPricingCheck`: 46 comprobaciones aisladas correctas; prioridades, cantidades, conversiones de unidad, ceros, descuentos, moneda, versiones, simulación sin guardar y duplicados. EntityManager simulado, sin transacciones reales.
- Revisión previa en navegador del listado/editor real con datos ficticios; no se reutiliza esa prueba como evidencia de despliegue.
- El usuario confirmó el cálculo de 80 USD al introducir 120 unidades en su presupuesto. No se ejecutó en esta auditoría una emisión o un cobro real derivados de ese presupuesto.

## Esquema real comprobado en esta auditoría

`SalesPricingSchemaCheck` terminó en solo lectura: 4 tarifas, 1 configuración y 5 reglas. Tablas InnoDB, seis FK con tipos compatibles y RESTRICT, cero huérfanos. Índice por tarifa/ámbito/destino/mínimo presente; índice antiguo ausente. Cero mínimos, ámbitos/destinos, valores o monedas predeterminadas incompatibles en las consultas del auditor. Son valores del momento de consulta.

V25/V27 y la reparación del índice están reflejadas en la base configurada. **No volver a ejecutar V27 a ciegas.** La reparación autorizada se hizo anteriormente; esta auditoría no alteró datos ni esquema. MySQL 5.7 no garantiza los CHECK modernos: se mantienen validaciones en el servicio.

## V28: aplicada; validación funcional pendiente

La consulta inicial de metadatos confirmó que no existían `SALES_LINES_DS_PRICING_SOURCE` ni `SALES_PROFORMA_LINES_DS_PRICING_SOURCE`. La migración se aplicó posteriormente con autorización expresa: ambas columnas VARCHAR(255) NULL verificadas, sin cambios en datos originales, índices ni FK. El código actualizado necesita esas columnas.

1. Migración aplicada y copia del esquema guardada. Pendiente comprobar backend/frontend actualizados.
2. Guardar y reabrir presupuesto/pedido y proforma: mantener etiqueta de tarifa y precio.
3. Edición real de importe: Precio manual. Enfocar/salir sin cambio: conservar origen.
4. Línea antigua sin origen: Precio guardado, sin reconstruir la historia desde reglas actuales.
5. Cambio de reglas maestras: no modificar documentos ya guardados.

La etiqueta guardada es descriptiva, no una auditoría inmutable de todas las versiones de reglas.

## Cierre pendiente

Prueba integral con base de ensayo y dos sesiones: tarifa → presupuesto → pedido → entrega/factura → emisión en pruebas → vencimientos → cobro/reversión. Validar concurrencia, idempotencia, moneda, reservas y documentos históricos. Revisar autenticación y permisos del circuito, especialmente cobros, según la auditoría global.

Se aplicó exclusivamente V28 con autorización expresa tras la auditoría. No se ha hecho commit, push ni reinicio del servidor. Véase el acta de aplicación en la auditoría de cierre.