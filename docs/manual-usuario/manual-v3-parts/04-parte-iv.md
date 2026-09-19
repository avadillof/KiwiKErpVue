# Parte IV — Datos maestros

## Capítulo 11. Artículos y servicios

El módulo **Artículos** contiene el catálogo de productos y servicios utilizados en los documentos comerciales. La información del artículo determina, entre otros datos, su descripción, precio, impuesto, unidad de medida y el recorrido que seguirá dentro de un pedido de venta.

### 11.1 Tipo logístico

El **tipo logístico** describe la naturaleza operativa del artículo:

- **Consumible:** producto físico cuyo stock no se controla de forma estricta. Puede venderse y entregarse mediante albarán, pero el sistema no lo trata como existencias gestionadas en almacén.
- **Almacenable:** producto físico cuyas existencias se gestionan en almacén. Su salida habitual se registra mediante un albarán.
- **Servicio:** trabajo, cuota, transporte u otro concepto no almacenable. Normalmente no necesita una salida física de mercancía.

Al seleccionar el tipo logístico, el campo **Tipo comercial** solo muestra las opciones compatibles con él.

### 11.2 Tipo comercial

El **tipo comercial** concreta cómo se vende el artículo dentro de su tipo logístico y proporciona los valores predeterminados de su **Flujo de venta**. La configuración inicial contempla:

| Tipo logístico | Tipo comercial | Requiere albarán | Política de facturación |
|---|---|---|---|
| Consumible | Producto | Sí | Por cantidades entregadas |
| Almacenable | Producto | Sí | Por cantidades entregadas |
| Servicio | Transporte | No | Por cantidades pedidas |
| Servicio | Servicio | No | Por cantidades pedidas |

Estos son valores predeterminados. La configuración de los tipos comerciales puede evolucionar y un artículo concreto puede personalizar su comportamiento cuando exista una excepción justificada.

### 11.3 Flujo de venta

El panel **Flujo de venta** determina si la línea debe pasar por un albarán y en qué momento queda disponible para facturar.

- Si no se activa **Personalizar para este producto**, el artículo hereda automáticamente la configuración de su tipo comercial. El formulario muestra el comportamiento heredado para que pueda revisarse antes de guardar.
- Al activar **Personalizar para este producto** pueden definirse **Requiere albarán** y la **Política de facturación**.

Conviene utilizar la personalización solo para excepciones. Mantener la regla en el tipo comercial facilita que todos los artículos equivalentes tengan el mismo comportamiento.

### 11.4 Políticas de facturación

**Por cantidades pedidas:** la cantidad facturable se basa en lo solicitado en el pedido, descontando las cantidades canceladas. Es el comportamiento habitual de servicios y transportes que no requieren albarán. Recorrido: **Presupuesto → Pedido confirmado → Facturación**.

**Por cantidades entregadas:** solo pueden facturarse las unidades que previamente se hayan entregado. Es el comportamiento habitual de productos físicos. Recorrido: **Presupuesto → Pedido confirmado → Albarán → Facturación**. Si se realiza una entrega parcial, únicamente esa parte queda disponible para facturar; el resto permanece pendiente para futuros albaranes, salvo que se cancelen las cantidades restantes.

### 11.5 Relación entre albarán y política de facturación

| Requiere albarán | Política | Resultado en el pedido |
|---|---|---|
| No | Por cantidades pedidas | La línea pasa directamente a facturación. |
| Sí | Por cantidades pedidas | Existe control de entrega, pero la facturación se basa en la cantidad pedida. |
| Sí | Por cantidades entregadas | La línea debe entregarse y solo se factura lo realmente entregado. |

Cuando se desactiva **Requiere albarán**, el sistema establece automáticamente la política **Por cantidades pedidas**, ya que una línea sin entrega no puede depender de cantidades entregadas.

### 11.6 Ejemplo de pedido mixto

| Línea | Configuración | Funcionamiento |
|---|---|---|
| 10 unidades de un producto almacenable | Requiere albarán · Facturación por entregado | Si se entregan 6, se pueden facturar 6 y quedan 4 pendientes de entrega. |
| 2 horas de servicio | Sin albarán · Facturación por pedido | Las 2 horas pasan directamente al circuito de facturación. |

El pedido permanecerá **Parcialmente completado** mientras tenga alguna entrega o facturación ejecutada y queden cantidades por resolver. Estará **Entregado** cuando no quede mercancía física pendiente, aunque todavía falte facturar. Finalmente pasará a **Completado** cuando todo lo servido esté entregado y facturado, teniendo también en cuenta cualquier cantidad cancelada.

### 11.7 Comprobación antes de utilizar un artículo

En Ventas y Compras, el selector **Unidad de medida** agrupa las opciones por su categoría (unidades, peso, tiempo, distancia o volumen). La selección de un artículo en un documento consulta su configuración actual antes de rellenar la nueva línea; las líneas ya guardadas no se actualizan automáticamente.

La configuración del flujo se copia a las líneas comerciales para conservar la trazabilidad del pedido: modificar posteriormente la ficha del artículo no altera el criterio con el que se creó una operación anterior. Cambiar un artículo no debe reinterpretar una operación anterior; en un pedido mixto, consulte el comportamiento de cada línea antes de decidir desde dónde facturar.

## Capítulo 12. Familias de productos

El módulo **Familias** permite agrupar los artículos del catálogo por categorías de productos o servicios. Las familias se utilizan para:

- Clasificar y buscar artículos de forma ágil.
- Aplicar **reglas de tarifa por familia exacta** en la lista de precios: una regla definida para una familia se aplica a todos los productos pertenecientes a esa familia, sin heredar subfamilias (véase el capítulo 22).
- Organizar los indicadores y resúmenes comerciales.

El mantenimiento de familias se realiza desde **Configuración / Ajustes → Datos maestros → Familias** y desde el módulo de artículos. Cada artículo se asigna a una familia mediante su ficha.

> **[CAPTURA: pantalla de mantenimiento de familias bajo Datos maestros]**

## Capítulo 13. Impuestos

El mantenimiento de **Impuestos** se encuentra en **Configuración / Ajustes → Datos maestros → Impuestos**. Los impuestos se asignan a los artículos y entidades y se aplican en los documentos comerciales (presupuestos, pedidos, albaranes y facturas).

- Cada impuesto define un porcentaje aplicable como IVA u otro impuesto sobre la base.
- La **posición fiscal** de la entidad puede fijar el impuesto aplicado en sus documentos.
- Los documentos pueden incluir **retenciones** cuando corresponde; la retención se calcula sobre la base y se presenta por separado en el desglose.
- Al emitir una factura se comprueban los impuestos y la coherencia de los totales; un error de validación fiscal conserva la factura en borrador.

> **[CAPTURA: pantalla de mantenimiento de impuestos bajo Datos maestros]**

## Capítulo 14. Entidades y contactos

El módulo **Entidades** permite consultar y mantener los clientes, proveedores y demás terceros relacionados con la empresa. El listado dispone de una altura adaptada a la pantalla para evitar que la tabla crezca indefinidamente.

### 14.1 Ficha de la entidad

La ficha centraliza los datos identificativos, fiscales, comerciales y de contacto utilizados posteriormente en presupuestos, pedidos, albaranes y facturas:

- **Identificación y datos fiscales:** nombre o razón social, NIF, domicilio, municipio, código postal y país. Estos datos se utilizan en los documentos y se validan antes de emitir.
- **Contactos y correo:** contactos activos con dirección de correo válida, utilizados al enviar presupuestos, albaranes o facturas.
- **Atributos de venta:** tarifa, posición fiscal, condición de cobro y hasta tres días habituales de pago.
- **Cuentas bancarias:** cuentas compartidas, descritas en el capítulo 8.4.

### 14.2 Condiciones comerciales del cliente

En la pestaña **Ventas** de la entidad puede definirse la **Condición de cobro** y, opcionalmente, hasta tres **días habituales de pago**. Esta información se utiliza para calcular automáticamente el vencimiento de las facturas:

- **Condición de cobro:** define uno o varios plazos, sus importes y las reglas para calcular sus fechas desde la fecha de factura.
- **Días de pago 1, 2 y 3:** ajustan el resultado al siguiente día de cobro admitido por el cliente.
- **Tarifa y posición fiscal:** condicionan precios e impuestos de los documentos comerciales.

Las **condiciones particulares de venta del cliente** son texto comercial que recoge acuerdos específicos. Al seleccionar el cliente en un nuevo presupuesto, el sistema copia sus condiciones particulares al documento; la copia puede ajustarse mientras el documento sea borrador sin modificar la ficha del cliente. Este campo es independiente de la condición de cobro.

### 14.3 Crear una condición de pago desde el cliente

Con permiso para guardar entidades, pulse **+ (Nueva condición de pago)** junto a **Condición de cobro**. Se abre el mismo editor de reglas y vista previa que en Ajustes de Ventas.

1. Indique la descripción y configure los plazos.
2. Compruebe el resultado mediante la vista previa.
3. Pulse **Guardar y seleccionar**: la condición se crea activa en el catálogo compartido y queda seleccionada en la ficha.
4. Guarde la entidad para confirmar su asignación al cliente.

Cancelar el diálogo no cambia la selección anterior. La condición creada está disponible para otros clientes y permanece en el catálogo aunque después cierre la entidad sin guardar. La gestión del catálogo continúa disponible en Ajustes de Ventas.

### 14.4 Preparar la ficha antes de vender

1. Localice la entidad en **Ventas → Entidades** y abra su ficha para evitar crear un cliente duplicado.
2. Revise identificación, datos fiscales y dirección. Estos datos se utilizan en los documentos posteriores.
3. Compruebe los contactos y su correo cuando vaya a enviar presupuestos o albaranes.
4. En los atributos de venta, revise tarifa, posición fiscal, condición de cobro y días de pago. La tarifa es opcional en la ficha del cliente, aunque deberá seleccionarla al crear una factura manual.
5. Escriba los acuerdos particulares en las condiciones de venta y guarde la ficha.

> **Advertencia:** revise las condiciones comerciales del cliente antes de iniciar el circuito. Una configuración incompleta puede impedir crear documentos o producir vencimientos incorrectos.