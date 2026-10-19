# Requerimientos y documentación AEAT

Acceso: **Ventas → Facturas → Opciones del listado → Requerimientos y documentación AEAT** (permiso VeriFactu).

## Preparación

1. Indicar referencia del requerimiento, periodo, plazo y observaciones.
2. Buscar documentos y seleccionar facturas ERP, rectificativas ERP, tickets F2 o devoluciones R5. Las facturas completas procedentes de tickets también aparecen.
3. Elegir si se incluyen los documentos relacionados. Está activado inicialmente: incorpora originales, devoluciones, canjes y rectificativas vinculadas, incluso fuera del periodo. No incorpora automáticamente todos los eslabones ajenos de la cadena global VeriFactu.
4. Pulsar **Revisar selección**. La vista previa distingue lo elegido de los documentos relacionados añadidos. Cambiar la selección obliga a revisarla de nuevo.
5. Preparar y archivar. El límite es de 500 documentos, contando los relacionados, y 100 MB. No se generan nuevos documentos fiscales, cobros, devoluciones ni presentaciones a la AEAT.

## Contenido conservado

El ZIP incluye un índice con claves que distinguen factura, rectificativa, ticket y devolución, sus relaciones, estado y origen de selección. Cada documento tiene su carpeta. Se copian los PDF y Facturae archivados que estén disponibles; solicitudes y respuestas de todos sus históricos VeriFactu; huellas y predecesores leídos de los XML; y datos del TPV, líneas e importe devuelto cuando corresponda.

Los PDF ausentes no se reconstruyen. El expediente muestra advertencias por PDF ausente, histórico inexistente, solicitudes o respuestas incompletas y documentos relacionados excluidos. Los datos de caja se identifican como una instantánea documental; no sustituyen a los registros fiscales. No se incluyen contraseñas, certificados ni claves privadas.

La notificación recibida y el justificante de presentación se adjuntan por separado. Los ZIP anteriores y sus sumas de comprobación se conservan sin modificación. Un expediente preparado no acredita por sí mismo su presentación ante la AEAT.

## Instalación y validación

Este cambio necesita la migración **V2026202842__aeat_case_documents.sql**, además de las migraciones previas del TPV, y actualizar backend y frontend. La nueva columna conserva la selección; los expedientes anteriores siguen utilizando su relación original de facturas y su ZIP archivado.

La prueba local `AeatCaseDocumentsCheck` cubre selección por origen, fechas JDBC, relaciones fuera del periodo, ausencia de relaciones elegidas, límites, copia exacta de XML/PDF, conservación de archivos anteriores y verificación de integridad al descargar. No sustituye la comprobación con la base de datos y el repositorio de documentos del servidor.
