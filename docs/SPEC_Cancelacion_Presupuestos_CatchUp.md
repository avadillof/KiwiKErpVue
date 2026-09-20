# SPEC Back Spring — Catch-up Cancelación de presupuestos vencidos

Fecha: 2026-09-20
Origen: `src/views/Ventas/Frm_AjustesVentas/QuoteAutomationSettings.vue`, `Frm_AjustesVentas.vue:166`
Caso: `DRAFT_PRC-2026/0001` (Validez 19/09/2026, Estado Para Aprobar) no amaneció cancelado el 20/09.

## 1. Problema

Comportamiento actual del frontal:

- `La validez incluye todo el día indicado: solo se cancelan fechas anteriores a hoy.`
- `Si la hora ya pasó, espera al siguiente día o ejecuta manualmente. El servidor debe estar en marcha a la hora programada.`

Si el equipo/servidor está apagado a `quoteCancellationTime` (def. `00:10 Europe/Madrid`), ese día no hay pase y no hay reintento.

## 2. Comportamiento exigido

- Frecuencia: 1 vez por día natural `Europe/Madrid`, a `SALES_SETTINGS.quoteCancellationTime`, solo si `quoteCancellationEnabled = true`.
- Elegibles: `validityDate < hoy (comparación por fecha)` + `state IN ('Para Aprobar / To Approved Estimation', 'Enviado / Sended')` + si `code LIKE 'DRAFT_%'` solo si `quoteCancellationIncludeDrafts = true`. Excluir aprobados/cancelados y documentos sin fecha.
- Efecto: pasar a `Cancelado / Canceled`, `locked = true`, formalizar código si era `DRAFT_`, conservar PDF. Avisos después del commit (`quoteCancellationNotifyOwner` / `quoteCancellationNotifyCustomer`); un fallo de correo no revierte. Idempotente.
- Endpoints afectados: `WebPreviewSalesQuoteAutomation/cancellation` (sin cambios), `WebRunSalesQuoteAutomation/cancellation` (acepta ejecución manual y del scheduler como usuario `Sistema`).

## 3. Fix en Spring

1. Persistir `quoteCancellationLastRunDate (DATE)` en ajustes. Actualizar solo al completar el pase del día (aunque sea 0 cancelados).
2. Mantener `@Scheduled(cron, zone = "Europe/Madrid")` para el pase diario.
3. Añadir catch-up al arrancar (`ApplicationReadyEvent` / `CommandLineRunner`):

```java
onStartup():
  if (!enabled) return;
  today = LocalDate.now(madrid);
  if (lastRunDate >= today) return;
  if (now.toLocalTime() >= scheduledTime)
    runCancellation(day = today); // procesa todo validity < today
```

4. Opcional robusto: `@Scheduled(fixedDelay = 30min)` que ejecuta una sola vez si `lastRunDate < today && now >= scheduledTime`.
5. Log servidor: hora, elegibles, cancelados, omitidos, fallos, correos.

## 4. Criterios de aceptación

- Apagar el 19/09 23:00 → encender el 20/09 09:00 → `DRAFT_PRC-2026/0001` aparece `Cancelado` sin intervención.
- Apagado 3 días → al arrancar cancela todo `validity < hoy` en un solo pase.
- Segundo arranque el mismo día no duplica (por `lastRunDate`).
- Actualizar texto del frontal cuando esté desplegado: sustituir `El servidor debe estar en marcha...` por `Si el servidor estaba detenido, se ejecuta al arrancar`.
