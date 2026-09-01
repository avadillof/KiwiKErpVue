# Auditoría real de tarifas — 31/08/2026

Lectura JDBC de la base `kiwikerp` configurada en el backend. Servidor MySQL 5.7.9, conexión de solo lectura. Sin DDL, DML ni pruebas de inserción.

## Resultado

- `sales_tarifas`, `sales_pricing_settings` y `sales_price_rules` son InnoDB.
- Las columnas ya usan los prefijos previstos por el modelo actualizado; existe cantidad mínima decimal y versión de tarifa/configuración.
- Se observaron 3 tarifas, 1 fila de configuración con ID 1 y 1 regla. No se alteraron.
- Las seis FK tienen tipos `INT` compatibles en ambos extremos y acciones `RESTRICT` para borrado y actualización.
- Todas las comprobaciones de referencias huérfanas devolvieron 0.
- No se detectaron mínimos inválidos, incoherencia de ámbito/destino, valores de regla inválidos ni moneda predeterminada incompatible.

| FK | Relación |
| --- | --- |
| fk_coins_tarifas | sales_tarifas → coins |
| fk_pricing_base_coin | sales_pricing_settings → coins |
| fk_pricing_default_tarifa | sales_pricing_settings → sales_tarifas |
| fk_price_rule_tarifa | sales_price_rules → sales_tarifas |
| fk_price_rule_product | sales_price_rules → product_product |
| fk_price_rule_family | sales_price_rules → categories |

## Incidencia detectada y corregida

Antes de la reparación coexistían dos índices únicos:

- `uk_price_rule_quantity`: tarifa + ámbito + destino + cantidad mínima. Correcto para varios tramos.
- `uk_price_rule_target`: tarifa + ámbito + destino. Es el índice anterior y bloquea un segundo tramo del mismo destino.

La corrección preparada en el backend es `BackUpBBDD/sql/repair_V27_price_rule_unique_index.sql`. Solo retira el índice antiguo si verifica que ambos índices tienen exactamente las columnas previstas. No elimina filas ni FK; el índice nuevo conserva unicidad por tramo y soporte para la FK de tarifa. **Aplicado posteriormente con autorización del usuario.** No repetir V27 sobre esta estructura ya renombrada.

MySQL 5.7 no aplica los CHECK declarados. Las comprobaciones de ámbito, valor y cantidad se hacen también en el servicio; un acceso SQL externo debe respetarlas. No se ha probado aún el guardado de dos tramos desde la interfaz contra esta base; el índice anterior ya se ha retirado.

Auditor reproducible del backend: `src/test/java/com/freelandsite/api/services/SalesPricingSchemaCheck.java`. No imprime contraseñas ni las incorpora al informe.

## Verificación posterior a la reparación

Se retiró exclusivamente `uk_price_rule_target`. `uk_price_rule_quantity` permanece único con las cuatro columnas previstas. La regla existente se conserva (1 antes y 1 después). Las seis FK se volvieron a comprobar: sin referencias huérfanas, tipos compatibles y sin cambios en las relaciones. Cero valores, destinos o mínimos inválidos. Se conservó una instantánea de la definición de la tabla, sin datos de negocio, en `BackUpBBDD/sql/audits/pricing-index-before-1788191489801.sql` del backend.
