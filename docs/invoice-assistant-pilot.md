# Piloto de consulta de Facturas

Después de consultar, **Descargar respuesta en PDF** genera un informe A4 apaisado con criterios, fecha, moneda, totales, resumen por cliente, facturas justificativas y, al explicar una factura, sus cobros y vencimientos. El backend repite la consulta validada antes de crear el archivo; no acepta del navegador los importes ni las filas del resultado.

## Alcance y activación

Frontend: diálogo Asistente de Facturas. Backend: `/WebInvoiceAssistant/status`, `/interpret`, `/query`.
Todos comprueban identidad autenticada, usuario habilitado y permiso `SALES` + `SALES_GEN_0005`, o grupo administrador. No se confía en códigos de usuario enviados por el navegador.
El alcance es la base de datos de esta instalación, como el módulo de Facturas; no es una integración multiempresa ni aplica filtros de propietario/comercial. Antes de habilitar en otra instalación, verificar su modelo de acceso por empresa/filas.

Las consultas guiadas no llaman a OpenAI. La integración se administra ahora en **Ajustes → Inteligencia artificial**, sólo para administradores. Desde el asistente de Facturas hay un acceso directo a esta pestaña. Se guarda en `ai_settings` y las nuevas peticiones releen la configuración sin reinicio. La activación anterior `KIWIK_INVOICE_ASSISTANT_ENABLED` ya no decide el estado: manda el interruptor guardado en Ajustes.

Antes de desplegar, aplicar `BackUpBBDD/sql/V26_20260831_ai_settings.sql` del backend si no existe la tabla. La fila inicial queda desactivada. No se incluyen secretos ni se sobrescribe una configuración existente al repetir el script. El campo histórico `key_source` se conserva por compatibilidad de esquema, pero ya no selecciona un origen: el backend sólo lee `encrypted_key` y escribe `DATABASE` al guardar. No se requiere otra migración.

El panel permite activar/desactivar, indicar el modelo y pegar la clave API en un campo de contraseña, sin selector de origen:

- **Guardar:** se cifra mediante el servicio existente `CertificateCryptoService`, igual que los certificados. Un campo vacío conserva la clave existente. No se devuelve la clave, ni su texto cifrado, al navegador.
- **Sustituir:** pegar otra clave y guardar. No exige reiniciar.
- **Eliminar clave:** acción con confirmación que borra la copia cifrada y desactiva la IA. No revoca la clave en OpenAI. Las consultas guiadas siguen disponibles.
- `OPENAI_API_KEY` ya no se lee. Si antes se usaba esa variable, el administrador debe pegar la clave una vez en el formulario. No hay importación automática ni copia de secretos desde el proceso anterior. Las claves ya cifradas se conservan.

El modelo predeterminado es `gpt-4.1-mini`; se respeta un modelo guardado explícitamente o `KIWIK_INVOICE_ASSISTANT_MODEL` como predeterminado del servidor. Esto no acredita acceso al modelo ni saldo API: la API se factura aparte de ChatGPT/Codex.

### Cifrado compartido con los certificados

Por petición expresa del usuario, la clave API utiliza `CertificateCryptoService`, sin `KIWIK_AI_MASTER_KEY` ni credenciales adicionales en Jenkins. Se guarda en `encrypted_key` con prefijo `cert:v1:` y contenido cifrado codificado en Base64. El campo de contraseña sigue sin recuperar ni mostrar la clave guardada.

Se heredan las limitaciones del sistema de certificados: clave fija incluida en el código y cifrado AES sin autenticación. No es AES-256-GCM ni protege frente a quien tenga acceso al código/aplicación y a la base de datos. No se han modificado los certificados ni su servicio de cifrado.

Una clave guardada con el formato anterior `v1:` no se borra ni se interpreta con otro algoritmo: el panel indica que debe pegarse de nuevo para sustituirla por el formato actual. Guardar vacío conserva el valor anterior; eliminar sigue requiriendo confirmación. No hay migración automática de secretos ni cambios de esquema.

Usar HTTPS en página y API; sólo se permite HTTP para desarrollo local. No activar registros de cuerpos HTTP para estas rutas. La clave API no debe incluirse en el repositorio, capturas ni mensajes.

### Guardar y probar

Guardar no contacta con OpenAI. **Probar conexión** usa la configuración guardada (aunque esté desactivada), pide confirmación y envía una pregunta técnica fija con el mismo formato estructurado del asistente. Puede generar consumo API y cuenta en el límite diario del piloto. No consulta ni envía facturas o clientes. El resultado de prueba no se persiste; configuración completa no significa conexión verificada.

No se incluye una clave real, no se modifica la configuración productiva ni se invoca el proveedor en las pruebas aisladas.
Revisar previamente presupuesto, tratamiento de datos y acceso del proyecto OpenAI. La pregunta puede contener datos personales escritos por el usuario: no equivale a una consulta totalmente local. `store:false` no significa ausencia universal de retención del proveedor.

## Diseño

### Guardado exclusivamente en base de datos — validación local

Las comprobaciones aisladas verifican cifrado/descifrado con el servicio real de certificados usando claves API ficticias, compatibilidad entre instancias, rechazo del formato anterior, conservación, sustitución, eliminación, conflictos de versión, permisos y HTTPS. No son una prueba de seguridad criptográfica del cifrado heredado. No se modifica la base de datos ni se ejecuta Jenkins. Desplegar backend y frontend juntos.

### Reanudación del piloto tras incorporar tarifas — 31/08/2026

Comprobación de solo lectura de la instalación configurada: V26 y su fila existen; IA desactivada, modelo vacío, origen de clave ENV y sin copia de clave guardada. No se inspeccionó la variable secreta del proceso Java ni se llamó al proveedor. Para una primera prueba con IA hay que indicar el modelo y disponer de clave en el origen elegido desde Ajustes; no compartir claves por el chat.

Corregida la agregación de monedas: el resultado y las filas identifican la moneda de la tarifa de la factura. Si las facturas que cumplen el filtro mezclan monedas, se rechaza la consulta completa, sin total parcial ni conversión. Acotar por cliente/periodo o consultar una factura concreta; un mismo cliente también puede tener varias monedas. Si falta una moneda válida, se pide revisar la tarifa, sin asumir EUR. El piloto todavía no ofrece filtro por moneda ni resumen multidivisa agrupado.

Los importes se muestran con punto de miles, coma decimal y código de moneda, por ejemplo 9.600,00 USD. Se mantienen las condiciones de los documentos guardados, sin recalcular tarifas. Compilación parcial Java correcta, 59 comprobaciones aisladas del asistente y 41 de ajustes correctas; build frontend correcto. No se ha reiniciado el backend ni verificado el cambio en una sesión real del portal.

La IA sólo devuelve un esquema cerrado de criterios. El usuario los revisa antes de consultar. El servidor vuelve a validarlos; no acepta SQL ni herramientas de escritura. No se envían a OpenAI facturas, líneas, nombres obtenidos de la base de datos, cobros ni resultados. Se envía la pregunta y un contexto mínimo (fecha actual y si hay selección). Las respuestas finales y tablas se construyen con datos del ERP, no con texto financiero generado por el modelo.

Una interpretación por petición, sin historial conversacional, máximo 1500 caracteres, 1200 tokens de salida, 10 s de conexión, 45 s de lectura, dos llamadas simultáneas y 20 intentos por usuario/día Europe/Madrid. El contador es por proceso y se reinicia al reiniciar el servidor: es una protección del piloto, **no un tope económico persistente**. Configurar además controles del proyecto proveedor; no desplegar en clúster sin un limitador compartido.

Las consultas a BD usan transacción de solo lectura, parámetros vinculados y límite de 501 filas para detectar selecciones mayores de 500. Si exceden, no se publican totales parciales. El piloto reutiliza las reglas actuales de cobros y vencimientos; no incorpora SQL generado por IA.

Facturación usa fecha de factura inclusiva en Europe/Madrid, base/impuestos/retención/total registrados. Excluye estados no elegibles según el servicio actual de cobros (borradores, canceladas, anuladas, vacíos). No incluye `SalesRecInvoices` ni pretende ser un informe fiscal/cierre. Pendientes y vencidos son saldos actuales; las fechas no reconstruyen saldos históricos. Reversiones no suman; saldo previo pagado sin movimientos se identifica expresamente. Si los saldos por vencimiento no cuadran con los cobros, se detiene la consulta, sin reparar ni escribir datos.

## Verificación antes de uso real

Requiere V26 para los ajustes IA y las tablas de cobros/vencimientos del piloto (V13 y V22; verificar las migraciones posteriores instaladas).

1. Compilar frontend y clases backend; ejecutar las comprobaciones aisladas añadidas.
2. Con BD de prueba, comprobar: sin sesión 401; usuario deshabilitado/sin permiso 403; usuario autorizado 200. Verificar también solicitudes directas a los tres endpoints.
3. Comparar por IDs y totales con Facturas: emitida impagada, pago parcial, pago revertido, saldo previo, varios plazos, vence hoy, fecha desconocida, borrador y anulada. Probar días límite y clientes homónimos.
4. Confirmar límites, vacío legítimo y errores de BD: nunca deben mostrarse como cero facturado ante un fallo.
5. Con IA activada en un proyecto autorizado, probar preguntas de periodo/cliente/selección, instrucciones maliciosas, solicitudes de escritura, preguntas incompletas, negativa del proveedor y timeout. Revisar criterios antes de ejecutar.
6. Abrir cada documento desde resultados y verificar su correspondencia. Abrir, cerrar y reabrir el diálogo mientras carga para comprobar que no aparecen respuestas anteriores.

Las pruebas aisladas no acreditan datos de producción, migraciones, integración real OpenAI ni el despliegue.

### Diagnóstico de la conexión

El modelo predeterminado es `gpt-4.1-mini`, también cuando el modelo almacenado está vacío. Se respeta un modelo configurado explícitamente; `KIWIK_INVOICE_ASSISTANT_MODEL` puede sustituir el predeterminado del servidor. Guardar el campo vacío aplica ese valor predeterminado. No requiere migración ni activa la IA por sí solo.

### Despliegue con el Jenkinsfile del backend

Se conserva el arranque `mvn spring-boot:run`, el puerto 8083 y la parada existente. Se eliminan la comprobación y la inyección de `kiwik-ai-master-key`; tampoco se utiliza `OPENAI_API_KEY`. No se necesitan credenciales Jenkins para esta integración. Las credenciales existentes en Jenkins no se han borrado: simplemente ya no se referencian.

Tras actualizar backend y frontend, pegar la clave API en Ajustes, guardar y probar. Si había una clave cifrada con el mecanismo anterior, volver a pegarla. El despliegue real y la prueba con una clave real quedan pendientes.

### Mensajes de error

Corrección de moneda: el asistente obtiene EUR/USD de `Coin.shortDescription` (`COINS_DS_SHORTDESCRIPTION`), igual que Facturas y Tarifas. `Coin.code` puede contener el símbolo y no debe validarse como código de divisa. Comprobación SQL de solo lectura: `FC-KW-2026/0020`, tarifa `TAR/01482185018`, tiene `EUR` en el campo correcto; no se modificaron registros. Las pruebas aisladas utilizan símbolos en `code` y EUR/USD en `shortDescription`, conservando el rechazo de consultas que mezclan monedas o carecen de moneda.

«Clave presente en el servidor» confirma que hay una clave configurada, no que OpenAI la haya aceptado. La prueba utiliza la configuración guardada y no envía facturas. El backend distingue autenticación (401), permisos (403), recurso/modelo no disponible (404), petición incompatible (400/422), cuota insuficiente frente a otras limitaciones (429), errores del proveedor (5xx), certificados TLS, DNS y tiempo de espera. Los mensajes son fijos: no se devuelven ni registran aquí cuerpos del proveedor, claves o causas originales. No hay reintentos automáticos.

No se requiere una variable de cifrado externa. Después de actualizar el backend hay que recompilar/reiniciar la aplicación y repetir «Probar conexión» para conocer el diagnóstico real. Referencia: [códigos de error de OpenAI](https://developers.openai.com/api/docs/guides/error-codes).

Validación adicional del diagnóstico: compilación parcial Java 17 correcta; 86 comprobaciones aisladas del asistente y 41 de ajustes IA correctas, incluyendo errores sintéticos y comprobación de que no se filtran valores sensibles. La causa de la prueba real fallida sigue pendiente de una nueva prueba con el backend actualizado.

### Historial de validaciones anteriores (31/08/2026)

- `npm run build`: correcto, con avisos existentes de CSS `:deep`, importación mixta y tamaño de chunks.
- Nuevas clases Java y `InvoiceAssistantCheck`: compiladas con Java 17 contra las dependencias/clases locales; no es una compilación completa del backend.
- `InvoiceAssistantCheck`: 50 comprobaciones aisladas correctas (validación, respuestas estructuradas, sesión/permisos, agregación, límites, fechas y rechazo de descuadres).
- Diálogo real montado en `/tmp/invoice-assistant-preview.html` con adaptador HTTP completamente interceptado: comprobados modo sin IA, interpretación simulada, detalle, apertura del documento y fallo. La reapertura se comprobó tras cambiar la invalidación de peticiones al cierre síncrono. Se desactivó el arrastre del diálogo para evitar una excepción de PrimeVue durante interacciones rápidas de cierre.
- No se ha arrancado/reiniciado el backend, aplicado SQL ni enviado preguntas a OpenAI. Pendientes la prueba con BD real, la configuración del proyecto/modelo/clave y una prueba autorizada del proveedor.
- Ampliación de Ajustes: `AiSettingsCheck`, 41 comprobaciones aisladas (AES-GCM, alteración del cifrado, clave maestra distinta, no exposición en DTO, conservar/eliminar, bloqueo de versión obsoleta, identidad/admin y entrada por HTTPS). Se mantienen las 50 comprobaciones del piloto. No sustituye una prueba transaccional con BD real.

Referencia: [Structured Outputs de OpenAI](https://developers.openai.com/api/docs/guides/structured-outputs).
