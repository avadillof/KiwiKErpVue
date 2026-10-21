# Asistente de migración de entidades

Propuesta funcional · 20 de octubre de 2026 · Pendiente de implementación

## Objetivo y acceso

Permitir trasladar clientes y proveedores desde un Excel de otro sistema mediante un recorrido guiado y comprensible. Una entidad puede ser cliente y proveedor simultáneamente.

Acceso inicial: botón «Importar desde Excel» en Entidades, tanto en Ventas como en Compras, sujeto al permiso de edición de entidades. Título del asistente: «Trae tus clientes y proveedores a KiwiKERP». La arquitectura permitirá añadir después otros módulos sin incluirlos en esta primera entrega.

## Pantallas

### 1. Preparar

Tres tarjetas seleccionables: «Clientes», «Proveedores» y «Clientes y proveedores». La última permite indicar ambas funciones para todas las filas o leerlas de una columna.

Dos accesos: «Descargar plantilla» y «Usar mi Excel». Texto: «No necesitas cambiar los nombres de tus columnas. En el siguiente paso te ayudaremos a relacionarlas».

Bloque «Valores comunes»: fecha de alta (fecha actual editable), estado activo, condiciones comerciales requeridas según el tipo seleccionado y país opcional. Nunca presumir un país sin que el usuario lo seleccione. Las condiciones se eligen de los catálogos existentes de la empresa; no se crean catálogos automáticamente.

Acciones: Cancelar / Continuar.

### 2. Cargar archivo

Zona amplia para arrastrar un archivo .xlsx o .xls, con botón accesible «Seleccionar archivo». Mostrar nombre, tamaño, selector de hoja, fila de encabezados y vista previa de diez filas. Informar del número de filas detectadas y omitir únicamente las totalmente vacías.

Leer los archivos como datos: no ejecutar macros, fórmulas ni enlaces externos. Ante fórmulas sin resultado disponible, pedir valores en las columnas afectadas. Los archivos protegidos o ilegibles tendrán un mensaje específico.

Límite inicial propuesto: 10 MB y 5.000 filas de datos por ejecución; validar antes de implementar según rendimiento. No truncar silenciosamente.

Acciones: Atrás / Relacionar campos.

### 3. Relacionar campos

Tabla central con columnas «Campo de KiwiKERP», «Origen del dato» y «Ejemplo». Cada destino admite una columna, un valor común compatible o «No importar» cuando sea opcional. No permitir asignar dos columnas al mismo destino. Las columnas sobrantes aparecen como ignoradas explícitamente.

Sugerencias por encabezados habituales: CIF/NIF → identificación fiscal; razón social/denominación → nombre; CP/código postal → código postal. Mostrar las sugerencias para revisión; no confundir una sugerencia con una validación.

Panel fijo con campos obligatorios pendientes. Acción «Validar datos» habilitada al completar la configuración. Cambiar archivo, hoja, correspondencias o valores comunes invalida cualquier revisión anterior.

| Campo | Obligación o comportamiento |
| --- | --- |
| Nombre / razón social | Obligatorio por fila. |
| Identificación fiscal | Obligatoria según la validación actual de la ficha. No inventar identificaciones. |
| Código | Conservar el del Excel o generar uno; obligatorio al guardar. |
| Cliente / proveedor | Al menos una función; obtenida del paso inicial o de columnas explícitas. |
| Fecha de alta | Obligatoria; columna o valor común. Mostrar el formato interpretado. |
| Término de venta | Obligatorio para clientes; columna relacionada con catálogo o valor común. |
| Término de compra | Obligatorio para proveedores; columna relacionada con catálogo o valor común. |
| Tarifa de compra | Obligatoria para proveedores; columna relacionada con catálogo o valor común. |
| Dirección 1 y 2, CP, población, provincia, país | Opcionales. Conservar como texto CP y códigos. |
| Teléfono | Opcional, conservar prefijo y formato como texto. |
| Correo y web | Opcionales; validar cuando estén informados. |
| Activo | Valor común por defecto; si procede de columna, exigir correspondencia explícita de valores. |

Si se relacionan condiciones comerciales por columna, mostrar sus valores únicos y permitir elegir la equivalencia en KiwiKERP. Una equivalencia desconocida bloquea la fila afectada. La tarifa de venta no es obligatoria en la validación actual y queda fuera del mínimo inicial.

Se excluyen inicialmente datos bancarios, contactos adicionales, documentos, observaciones y nombre comercial: no se ha confirmado su incorporación al contrato de guardado usado por este flujo. No ofrecer campos que después no se persistan.

### 4. Revisar

Tarjetas: «Listas para crear», «Con errores», «Coincidencias pendientes» y «Omitidas». Filtros equivalentes sobre una tabla con fila original de Excel, código, nombre, identificación, acción y detalle. Mostrar también datos originales frente a cualquier normalización significativa.

Ejemplo de incidencia: «Fila 18 · Identificación fiscal: falta un valor obligatorio». Las advertencias deben distinguirse de los errores que impiden guardar.

Acciones por fila: «Ver detalle», «Omitir» y, ante una coincidencia segura, «Vincular con entidad existente». En esta primera versión, corregir contenido se realiza en Excel y se vuelve a cargar el archivo. Descargar incidencias con hoja, fila, campo, valor y motivo, sin convertir valores de usuario en fórmulas ejecutables.

La opción inicial es resolver los errores antes de continuar. Se permite «Importar solo las filas listas» mediante una selección explícita, mostrando el número de excluidas. Una fila con coincidencia sin resolver nunca se importa.

### 5. Confirmar y resultado

Resumen previo: archivo, hoja, valores comunes, entidades nuevas, relaciones que se añadirán y filas omitidas. Botón «Importar 230 entidades» con cantidad real. La escritura comienza únicamente desde esta confirmación.

Durante la ejecución, mostrar progreso confirmado por el servidor y evitar dobles envíos. Si se cierra la ventana o se interrumpe la conexión, la ejecución debe poder consultarse desde su historial; no prometer una cancelación que revierta lo ya guardado.

Resultado: creadas, relaciones añadidas, omitidas y fallidas. Acciones «Ver entidades», «Descargar resultado» y «Nueva importación». El resultado incluye la referencia de cada entidad creada y la fila original, con fechas y usuario en el historial.

## Códigos y coincidencias

1. Código del Excel: preservar texto y ceros iniciales, quitando espacios externos. Verificar disponibilidad antes de confirmar y de nuevo al guardar.
2. Código generado: asignación segura en servidor al guardar, sin colisiones entre filas o usuarios. El generador actual basado en tiempo no se reutilizará en un bucle sin resolver la concurrencia.
3. Código existente: bloquear creación y presentar candidato; si la identificación fiscal contradice la del candidato, bloquear la vinculación.
4. Identificación fiscal coincidente: presentar candidatos tras normalizar de forma controlada según el país. Nunca elegir automáticamente si existen varias entidades.
5. Nombre exacto existente: el guardado actual lo rechaza; presentar incidencia incluso si la identificación es diferente. Un nombre parecido solo produce advertencia, nunca autoriza una unión.
6. Repeticiones dentro del archivo: resolver antes de importar; no fusionar filas silenciosamente, aunque una diga cliente y otra proveedor.
7. Entidad existente: permitir únicamente omitir o añadir la función comercial que le falte mediante elección explícita. No reemplazar domicilio, nombre, datos fiscales ni condiciones ya existentes. Al añadir una función se requieren sus condiciones comerciales y se muestran en la confirmación.
8. Entidades eliminadas o inactivas: informar y derivar a revisión; no reactivar ni recuperar automáticamente.

## Validación y persistencia

El servidor será la autoridad final. Debe repetir validación, permisos y comprobación de coincidencias al confirmar, ya que otros usuarios pueden haber modificado el directorio después de la revisión.

Cada fila se guarda de forma atómica junto a sus atributos comerciales. El lote admite resultados parciales, que se reflejan por fila; nunca indicar éxito global si existen fallos. Una clave persistente de ejecución y fila evita duplicados en reintentos de una misma ejecución. Una nueva carga se contrasta también con los datos existentes y vuelve a revisar coincidencias.

El historial guardará configuración, resultado por fila y referencias creadas con acceso restringido a usuarios autorizados. La conservación del Excel original y los plazos de retención quedan pendientes de definir antes de implementar. No se ofrece deshacer automáticamente: las entidades importadas pueden haberse utilizado después en documentos.

La ficha actual valida código, nombre, identificación fiscal, fecha de alta y condiciones comerciales en el navegador. El servicio de guardado revisado comprueba duplicados de código y nombre. No dar por existente una validación masiva ni una protección por identificación fiscal: son trabajo necesario para el asistente.

La ficha utiliza actualmente un validador CIF/NIF. El soporte de identificaciones extranjeras debe definirse y comprobarse por país antes de ofrecer importación internacional; no declarar inválida una entidad extranjera aplicando indiscriminadamente el formato español.

## Diseño visual

Cabecera corporativa con icono, título, ayuda breve y cierre a la derecha. Pasos numerados con texto, sin depender solo del color. Cuerpo desplazable y pie siempre visible, con `kiwik-separator`, «Atrás» a la izquierda y acción principal a la derecha. Verde corporativo #9cc10a y texto #253000 para la acción principal.

La tabla de correspondencias tendrá campos legibles y ejemplos; el resumen de revisión permanecerá visible. En pantallas estrechas, adaptar las correspondencias a tarjetas y mantener navegación por teclado, etiquetas y foco en la primera incidencia. No insertar identificadores internos ni términos de implementación en el recorrido del usuario.

## Criterios para aceptar la implementación

- Plantilla e importación de un Excel ajeno con encabezados distintos.
- Clientes, proveedores y una única entidad con ambas funciones.
- Condiciones comerciales obligatorias elegidas por lote o relacionadas por columna.
- Preservación de códigos y CP como texto; fechas interpretadas sin ambigüedad.
- Errores localizados por hoja, fila y campo, sin altas durante la revisión.
- Duplicados dentro del archivo, frente a la base de datos y surgidos entre revisión y confirmación.
- Vinculación explícita sin sobrescribir datos de la entidad existente.
- Reintento tras pérdida de conexión sin duplicar altas de la ejecución.
- Fallo de una fila sin guardar parcialmente sus atributos ni ocultar el resto del resultado.
- Historial y resultados reales con permisos verificados en servidor.
- Pruebas de persistencia y revisión visual con archivos representativos antes de declarar el asistente operativo.

## Evidencia revisada y límites

Referencia de requisitos actuales: `src/views/Ventas/Frm_Clientes/Frm_ClientForm.vue`, función `validate`; referencia de persistencia: `WebRestClients.java`, `webSaveClient`, `saveMainDataEntitie` y `WebGenerateEntitieCode` del backend.

Esta entrega define comportamiento y pantallas. No implementa el asistente, no aplica migraciones de base de datos y no importa datos. Las reglas descritas como propuestas necesitan desarrollo y verificación real.
