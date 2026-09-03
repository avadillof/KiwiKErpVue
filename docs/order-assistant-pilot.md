# Piloto: Asistente de consulta de Pedidos

## Objetivo

El asistente permite consultar y explicar pedidos de venta con datos calculados por KiwiKERP. Es un piloto de solo lectura: OpenAI, cuando está configurado, únicamente transforma una pregunta en criterios cerrados.

El cliente se elige con el selector corporativo por código, nombre o NIF. Puede dejarse vacío para consultar todos los clientes.

## Consultas disponibles

- Pedidos creados por periodo y cliente.
- Pedidos con cantidades pendientes de entregar.
- Pedidos cuya entrega prevista está vencida y todavía tienen cantidades pendientes.
- Pedidos con cantidades pendientes de facturar.
- Pedidos completados o cancelados.
- Explicación de un pedido seleccionado o identificado por su código exacto.

La explicación muestra por línea las cantidades pedidas, canceladas, entregadas, facturadas y pendientes, además de la política de facturación y la fecha estimada registrada.

## Definiciones verificables

- **Pendiente de entrega:** cantidad pedida menos cantidad cancelada y entregada, sólo para líneas que requieren albarán.
- **Pendiente de facturación:** cantidad pedida menos cantidad cancelada y facturada.
- **Entrega vencida:** fecha prevista del pedido anterior a la fecha actual y cantidad pendiente de entrega mayor que cero.
- Las fechas de consulta son inclusivas y se interpretan en `Europe/Madrid`.
- Si una selección contiene varias monedas, los resultados y totales se separan por divisa. No se convierten ni suman monedas diferentes.
- Máximo 366 días y 500 pedidos. Si se supera el límite, no se ofrecen totales parciales.

## Seguridad y privacidad

- Requiere sesión activa y acceso al módulo de Ventas.
- No genera SQL ni permite confirmar, cancelar, entregar, facturar o enviar avisos.
- Los pedidos y resultados no se envían a OpenAI; sólo se envía el texto escrito por el usuario.
- Las consultas guiadas funcionan sin IA y sin consumo de API.
- Comparte la configuración de IA administrada desde Ajustes.

## Validación pendiente antes de producción

Las comprobaciones aisladas no sustituyen la prueba con la base de datos real. Antes de habilitarlo en producción se deben validar permisos, monedas, pedidos con entregas parciales, facturación parcial, cancelaciones, pedidos sin fecha prevista y la interpretación con una credencial real autorizada.
