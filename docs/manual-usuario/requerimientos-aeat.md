# Requerimientos y documentación AEAT

## 1. Acceso y alcance

Ventas → Facturas → menú general del listado → **Requerimientos y documentación AEAT**.
Esta herramienta prepara documentación. No envía información, no contesta automáticamente requerimientos y no implementa el servicio de remisión bajo requerimiento de sistemas NO VERI*FACTU.

## 2. Preparar un expediente

1. Abrir **Nuevo expediente**.
2. Indicar referencia de la notificación, periodo de fechas de las facturas, plazo de respuesta opcional y observaciones.
3. Buscar las facturas y seleccionar únicamente las solicitadas. Cambiar las fechas vacía la selección para evitar incluir facturas de otro periodo.
4. Pulsar **Preparar y archivar expediente** y revisar las advertencias.

Máximo: 500 facturas y 100 MB de contenido por expediente. Para un volumen superior, dividir el alcance en varios expedientes. La fecha final incluye el día completo.

## 3. Contenido del ZIP

- PDF existentes en el repositorio de informes: original, VeriFactu y subsanaciones disponibles, sin regenerarlos.
- Request y response conservadas en el histórico, como texto XML UTF-8, identificadas por factura e ID de histórico.
- `indice.json`: selección, fechas, situación al preparar, registros, huellas leídas del XML, anterior relacionado y sumas de comprobación de los archivos de evidencia.
- `LEEME.txt`: alcance, limitaciones y advertencias.

No se consultan claves privadas ni contraseñas. No se recalculan las huellas fiscales. Las sumas SHA-256 del ZIP y de los archivos son controles del paquete documental y no sustituyen las huellas de VeriFactu.

Si faltan PDF, request o response, o no puede interpretarse el encadenamiento, se informa. Una selección parcial puede referenciar registros anteriores fuera del expediente. No se incluyen automáticamente facturas fuera del alcance solicitado. La ausencia de advertencias no certifica cumplimiento, conservación integral ni validez de la cadena.

## 4. Consulta y presentación

En **Expedientes preparados**, abrir el expediente y descargar su ZIP. La descarga recupera la copia archivada; no vuelve a generar el paquete con datos posteriores. Si cambia su checksum, se bloquea la descarga con una advertencia.

Se pueden adjuntar por separado la notificación y el justificante de presentación, en PDF de hasta 15 MB. No modifican el ZIP preparado. No se permite sustituirlos desde el diálogo ni eliminar las evidencias desde Documentos.

El estado **Justificante adjunto** significa únicamente que se archivó un documento local. No verifica su presentación ante Hacienda. Seguir el alcance, plazo y procedimiento indicado en la notificación; el ZIP es una ayuda interna, no un formato oficial universal.

## 5. Puesta en marcha técnica

Las tablas `sales_aeat_cases` y `sales_aeat_cases_invoices` almacenan metadatos y relaciones, no binarios. El SQL está en el backend: `src/main/resources/db/manual/20260830_sales_aeat_cases.sql`. En la base local `kiwikerp` ya se ha aplicado; en otros entornos hay que aplicarlo antes de cargar el código porque `ddl-auto` está desactivado.

Los archivos están en `ATTACHMENTS/ATTACHEMENTS_SALES_AEAT_CASES/{id}` dentro del repositorio configurado en `path.gestoc`. Incluir esa carpeta y las tablas en las copias de seguridad. No es almacenamiento WORM: los permisos y copias del servidor siguen siendo necesarios. Conservar la evidencia original aunque se prepare un nuevo expediente.

Spring permite 15 MB por archivo y 64 MB por petición multipart (`spring.servlet.multipart.max-file-size` y `spring.servlet.multipart.max-request-size`). Esto evita que el límite predeterminado de 1 MB rechace el documento antes de la validación del formulario. Un cambio de estas propiedades requiere reiniciar el backend.

El backend debe recargarse/reiniciarse por el operador. Las pruebas de regresión `SalesAeatCasesCheck` usan repositorios y documentos en memoria, sin arrancar Spring ni llamar a la AEAT.
