# Importar productos y servicios desde Excel

Acceso: **Artículos y servicios → Importar desde Excel**, desde Ventas o Compras. Requiere permiso de edición de artículos y el permiso específico **Importar productos y servicios desde Excel** (`PROSER_GEN_0085`), comprobados también en servidor. Las peticiones envían la sesión activa del ERP.

## Recorrido

1. Elegir artículos para vender, comprar o ambos y completar los valores comunes.
2. Cargar un archivo `.xlsx` o `.xls` de hasta 10 MB y 5.000 filas. Seleccionar hoja y fila de encabezados.
3. Relacionar columnas y equivalencias con los catálogos reales de KiwiKERP.
4. Revisar errores y coincidencias. Descargar incidencias y corregir el Excel cuando sea necesario.
5. Confirmar la importación y consultar el resultado por fila. El historial permite recuperar una revisión o continuar las filas pendientes tras una interrupción.

## Campos

- Descripción y descripción en inglés: obligatorias. Una opción explícita permite conservar la descripción original cuando no haya texto en inglés; no realiza una traducción.
- Código: conservar el del Excel o generar uno único en servidor.
- Tipo logístico y tipo comercial: obligatorios y compatibles entre sí.
- Unidades de venta y compra: ambas obligatorias por el esquema de persistencia.
- Familia, código de barras e impuestos de compra/venta: opcionales.
- Precios base de compra/venta: sin impuestos; cero cuando no se informa precio. Los importes escritos como texto usan formato español, por ejemplo `1.234,56`, con hasta seis decimales. Los valores numéricos de Excel se interpretan desde su valor real, independientemente del formato visual.
- Fecha de alta, estado y disponibilidad de compra/venta: por columna o valores comunes.

Las columnas de catálogo necesitan una equivalencia por cada valor diferente; las de familia e impuestos permiten elegir explícitamente «Sin familia» o «Sin impuesto». Las familias se relacionan por nombre cuando existe una coincidencia única. Si no existen y el usuario tiene permiso de edición de familias, se propone «Crear si no existe (código automático)». Se puede cambiar la propuesta por otra familia o por «Sin familia» antes de validar.

Las familias nuevas se crean únicamente al guardar una fila seleccionada de un artículo nuevo, dentro de su misma transacción. Varias filas con el mismo nombre reutilizan la familia. Una fila omitida o fallida no deja una familia nueva sin su artículo. Se utiliza el mismo generador `CATP/…/año` de la ficha, avanzando el número si el código ya está ocupado. Las familias nacen activas y con el mismo valor inicial de «Inventariable» que la ficha de familias (desmarcado). No se reactivan familias inactivas/eliminadas ni se reutilizan categorías de otro tipo.

Las unidades, tipos e impuestos siguen seleccionándose entre los existentes; no se crean automáticamente.

## Coincidencias y guardado

Se comprueban código, descripción, descripción en inglés y código de barras tanto en el archivo como en el catálogo. Los artículos existentes se omiten; esta herramienta no actualiza sus datos. Las comprobaciones se repiten al guardar, porque el catálogo puede haber cambiado desde la revisión.

Cada fila y su resultado se guardan en una misma transacción. Las llamadas repetidas sobre la misma ejecución no vuelven a crear filas ya procesadas. Los fallos se registran por fila, sin presentar un lote parcial como éxito completo. El historial muestra las últimas 50 ejecuciones del usuario autorizado.

Se heredan las reglas de entrega y facturación del tipo comercial. No se generan movimientos de stock, saldos iniciales, tarifas especiales, imágenes ni documentos históricos.

## Instalación y verificación

Backend: aplicar mediante el procedimiento habitual de actualización la nueva migración `V2026202846__product_import.sql`, que crea el historial de importación de productos y su control de ejecución. Es independiente de las tablas de importación de entidades y no modifica artículos existentes.

Securización: `V2026202847__master_import_permissions.sql` incorpora el permiso de productos en «General Productos» y el de entidades en «General Entidades». Siguen el criterio existente de permisos nuevos marcados por defecto; el administrador puede desmarcarlos por usuario. No sustituyen al permiso de edición. La restricción se aplica también a catálogos, validaciones, historial, confirmación y reanudación, incluidos accesos directos al servidor.

Validación local: compilación Vue/TypeScript y Java; pruebas de importación de entidades/productos y validadores del servidor. Estas comprobaciones no sustituyen la aplicación de la migración ni una importación autenticada contra una base de datos de prueba. No se han importado datos reales como parte del desarrollo.
