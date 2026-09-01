# Lista de precios

Acceso: **Ventas → Lista de precios**, también desde **Ajustes de ventas → Tarifas de venta**. La instalación requiere las migraciones SQL V25 y V27 y el backend actualizado. Para conservar el origen del precio al reabrir presupuestos/pedidos requiere además V28: aplicada y verificada en la base configurada el 31/08/2026. Véase la [auditoría de cierre](../auditoria-cierre-ventas-2026-08-31.md).

## Configuración inicial

1. Identifique la moneda en la que están expresados los campos **Precio de venta** actuales. La aplicación no la presupone ni convierte importes.
2. Cree o reutilice una tarifa en esa moneda (por ejemplo, General). Sin reglas utiliza el precio base del producto.
3. Seleccione la moneda base y la tarifa predeterminada y pulse **Guardar configuración**. La moneda base queda protegida para evitar reinterpretar precios existentes.
4. Cree las demás tarifas y asígnelas en **Clientes → Ventas → Tarifa**. Varios clientes pueden compartir una tarifa.

## Reglas

Cada tarifa admite una regla por destino y cantidad mínima, hasta 1000 reglas:

| Ámbito | Significado |
| --- | --- |
| Producto | Excepción para un producto o servicio concreto. |
| Familia | Regla para la familia exacta del producto; no se hereda de familias superiores. |
| Todos | Regla general para todo el catálogo. |

Se aplica una sola regla: **producto → familia → todos → precio base**. No se acumulan descuentos entre reglas.

- **Precio fijo:** importe sin impuestos por la unidad de venta habitual del producto. No cambia al modificar el precio base.
- **Descuento:** porcentaje entre 0 y 100 sobre el Precio de venta del producto. Sí cambia cuando cambia ese precio base.
- Un precio fijo de cero es válido: no significa que falte una regla.
- Las tarifas en otra moneda requieren un precio fijo aplicable. No se convierten divisas ni se reutiliza silenciosamente un precio base de otra moneda.
- No se cambia la moneda de una tarifa existente: cree otra tarifa.

Ejemplo: tarifa Profesional con 10 % para Todos, 15 % para una familia y 45 € para un servicio concreto. El servicio cuesta 45 €; no se le aplican además los otros descuentos.

## Tramos por cantidad

Añada varias reglas para el mismo destino con distintas **Cantidades mínimas**. Dentro del ámbito aplicable (producto antes que familia y general), gana el tramo más alto que alcance la cantidad. Si no se alcanza ningún tramo de producto, se buscan reglas aplicables de familia y generales.

Ejemplo para un producto de 100 €: desde 10 unidades, descuento del 5 % (95 €/unidad); desde 50, descuento del 10 % (90 €/unidad). Con 9 unidades sigue el precio base si no hay otra regla. Con 50, todas las unidades de esa línea cuestan 90 €, sin sumar el 5 % al 10 %.

- La cantidad se evalúa por línea: no se suman líneas ni productos distintos.
- Los mínimos se expresan en la **unidad de venta habitual del producto**. Si se vende en cajas de 10 unidades, una caja equivale a 10 al evaluar el tramo. Se usan los factores de conversión de unidades existentes.
- **0** significa sin mínimo. Las reglas de la versión anterior migran con 0 para mantener su efecto incluso sobre cantidades fraccionarias.
- Se permiten cantidades mínimas decimales, precios fijos y descuentos por tramo; no se repiten ámbito, destino y mínimo.
- Cambiar la cantidad recalcula las líneas cuyo precio acaba de obtenerse de la tarifa. Conserva el descuento adicional de la línea. Los precios manuales, los importes conservados al cambiar de tarifa y los documentos reabiertos requieren **Aplicar tarifa** para volver a calcular.
- Las consultas desde la tarifa o el producto permiten indicar una cantidad y muestran el tramo seleccionado.

## Documentos de venta

Al seleccionar un producto en presupuestos, pedidos, nuevas facturas manuales y albaranes manuales, el servidor propone el precio de su tarifa. Si no puede calcularlo, se muestra el error y se impide guardar hasta resolverlo o quitar la línea.

El precio propuesto ya contiene el descuento de tarifa. **El descuento de línea es adicional**, por lo que no debe introducirse de nuevo el mismo porcentaje. El origen del precio puede consultarse sobre el campo Precio; una edición lo identifica como manual.

**Aplicar tarifa** solicita confirmación: sustituye los precios existentes y pone los descuentos adicionales de las líneas a cero, incluyendo importes manuales. El cálculo se aplica a todas las líneas o a ninguna si ocurre un error.

Al cambiar una tarifa con líneas, se puede conservar lo pactado si la moneda coincide, recalcular, o cancelar el cambio. Si cambia la moneda, conservar no está permitido. Cambiar de cliente propone su tarifa; la elección no modifica la ficha del cliente.

Reabrir un documento no recalcula sus importes. Cambiar reglas o el precio base tampoco altera documentos guardados. La conversión y facturación desde documentos de origen conservan las condiciones acordadas. En el detalle de una factura ya guardada se mantiene el comportamiento de edición existente: cambiar de tarifa no recalcula ni convierte importes; su moneda está protegida.

## Consultas

- En **Simular precio con las reglas del formulario**, seleccione producto y cantidad. Se utilizan las reglas que está editando, aunque no estén guardadas; funciona también en una tarifa nueva. No guarda ni modifica la tarifa. Al cambiar las reglas, el producto o la cantidad se descarta el resultado anterior.
- Desde la ficha de un producto guardado, **Consultar tarifas** muestra el precio calculado y su origen.
- Los contadores de Lista de precios reflejan tarifas y reglas guardadas; no son datos de ejemplo.

Esta versión no incluye vigencias, fórmulas sobre coste, tarifas encadenadas ni herencia de subfamilias.

## Origen del precio en presupuestos y pedidos

A partir de V28, el origen mostrado se conserva con la línea y con su proforma. La indicación de tarifa aplicada no depende de que las reglas actuales sigan siendo las mismas. No recalcula al reabrir. Una modificación real del importe lo identifica como manual; enfocar o salir del campo sin cambiarlo no lo hace. Las líneas antiguas sin origen registrado muestran Precio guardado: no se puede deducir con certeza qué regla se utilizó. Puede volver a aplicar la tarifa explícitamente si desea calcular y guardar un nuevo origen.

## Ejemplo de venta en dólares

Moneda base EUR y precio del artículo 5,00 EUR. Tarifa del cliente USD con 100,00 desde 0 unidades y 80,00 desde 101. Al añadir 120 unidades, el precio unitario es **80,00 USD** y la base neta es **9.600,00 USD**, antes de impuestos y descuentos adicionales. No existe conversión desde los 5,00 EUR. Una tarifa de otra moneda sin regla aplicable no puede obtener el precio de ese producto.

## Presentación y acciones

- **Nueva tarifa** utiliza el verde corporativo claro; las acciones de fila están en **…**.
- La tabla tiene tipografía ampliada y el editor comparte cabecera y estilo con los demás formularios.
- Cantidades e importes de tarifas: **punto de miles y coma decimal** (1.200,00). La simulación distingue cantidad, precio por unidad y moneda.
- El aviso de otra moneda explica que se necesitan precios fijos. La moneda de una tarifa existente está protegida; crear otra no convierte sus importes.
- El panel de Ajustes de ventas enlaza con esta pantalla, con el mismo estilo de los demás paneles. No guarda una segunda configuración.
