from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'docs/manual-usuario/README.md'
s=p.read_text(encoding='utf-8').replace('**Versión:** 2.4','**Versión:** 2.5').replace('a 30 de agosto de 2026','a 31 de agosto de 2026')
s=s.replace('flujo-ventas-kiwikerp-freelandsite-2026-08-31.png','flujo-ventas-pizarra-2026-08-31.png')
s=s.replace('del presupuesto al cobro, con logo de FreeLandSite','del precio al cobro, con efecto pizarra y logo de FreeLandSite')
s=s.replace('Mapa revisado el **31/08/2026**, con circuito fiscal documentado en **PRUEBAS**. La imagen tiene 1536 × 1024 píxeles; para una impresión mural grande conviene preparar una versión de mayor resolución. Conserve también la carpeta `diagramas` al distribuir este manual.', 'Mapa revisado el **31/08/2026**, con circuito fiscal documentado en **PRUEBAS**. El PNG de 2523 × 1783 píxeles está pensado para pantalla. Para impresión utilice el [póster PDF A1 horizontal](../../output/pdf/kiwikerp-ventas-pizarra-a1-2026-08-31.pdf), de 841 × 594 mm, con texto y trazos vectoriales. Puede reducirse proporcionalmente a A2. Mantiene el logotipo original, que es una imagen rasterizada. Conserve `diagramas` y el PDF al distribuir este manual.')
s=s.replace('El mapa distingue servicios sin albarán,', 'El mapa comienza con precio base, tarifa del cliente, descuentos y tramos por cantidad. Distingue servicios sin albarán,')
s=s.replace('Guía específica: [Lista de precios y tarifas de venta](lista-precios.md).','Guía específica: [Lista de precios y tarifas de venta](lista-precios.md).\n\nEstado de cierre: [Auditoría de Ventas del 31/08/2026](../auditoria-cierre-ventas-2026-08-31.md).\n\nNovedades: [Tarifas y mejoras de uso](#novedades-del-31-de-agosto-de-2026).')
block='''## Novedades del 31 de agosto de 2026

### Tarifas de venta: del precio base al precio acordado

**Ventas → Lista de precios** centraliza las tarifas. **Ajustes de ventas → Tarifas de venta** abre esa misma pantalla; no mantiene una configuración duplicada. En el panel inferior se eligen la moneda base del Precio de venta de los artículos y la tarifa predeterminada. Solo se puede elegir como predeterminada una tarifa de la moneda base. La tarifa asignada al cliente permite pactar otras condiciones sin cambiar el producto para todos.

| Elemento | Función |
| --- | --- |
| Precio de venta del artículo | Precio base en la moneda configurada. |
| Tarifa predeterminada | Referencia general cuando no existe otra tarifa aplicable. |
| Tarifa del cliente | Condiciones propuestas en sus nuevas ventas; varios clientes pueden compartirla. |
| Regla por producto, familia o todos | Precio fijo o descuento sobre el precio base; una única regla, sin acumulación. |
| Cantidad mínima | Selecciona el mayor tramo alcanzado dentro del ámbito aplicable, por línea. |
| Precio del documento | Importe acordado que se guarda; reabrir no lo recalcula. |

Se prioriza **producto → familia exacta → todos → precio base**. Sin una regla aplicable, el precio base solo se utiliza en su propia moneda. Una tarifa USD no convierte el precio EUR: requiere un precio fijo aplicable en USD. No se puede cambiar la moneda de una tarifa existente; cree otra para evitar reinterpretar importes.

**Ejemplo:** el producto tiene un precio base de 5,00 EUR. El cliente utiliza una tarifa USD con 100,00 USD desde 0 unidades y 80,00 USD desde 101. Una línea de 120 unidades propone **80,00 USD por unidad**, con base neta de **9.600,00 USD**, antes de impuestos y de descuentos adicionales. No son 80,00 USD por toda la línea ni una conversión de los 5,00 EUR.

**Simular precio con las reglas del formulario** utiliza incluso cambios sin guardar. No modifica la tarifa; al editar las reglas se descarta el resultado anterior. Desde el artículo, **Consultar tarifas** usa las reglas guardadas.

**Aplicar tarifa** requiere confirmación, recalcula todas las líneas y pone a cero sus descuentos adicionales. Cambiar cantidades recalcula solo las líneas gestionadas por tarifa durante esa edición. Los precios guardados o manuales no se actualizan automáticamente. Conservar importes al cambiar tarifa solo es posible si la moneda coincide.

### Origen del precio y presentación

La columna **Precio** del presupuesto es más amplia y muestra el origen. La corrección para conservarlo tras guardar/reabrir presupuestos y pedidos requiere **V28 y backend actualizado**. En la base inspeccionada el 31/08/2026 esas columnas todavía faltan; no se considera desplegada. Con esa versión, una edición real indica **Precio manual**, y las líneas antiguas sin evidencia muestran **Precio guardado**. El simple enfoque del campo no debe cambiar su origen.

- Lista de precios utiliza el menú de acciones **…**, tabla corporativa, tipografía ampliada y editor con cabecera común.
- Los importes y cantidades de tarifas usan **punto de miles y coma decimal**: 1.200,00 y 80,00; no confundir 1.200 con 1,2.
- Nueva tarifa, Nueva entidad, Nuevo artículo, Nuevo presupuesto y Nuevo pedido comparten verde corporativo claro. En Presupuestos y Pedidos, Nuevo queda al final de la barra. Albaranes conserva su estilo.
- El panel Tarifas de venta de Ajustes comparte icono, cabecera, tipografía y alineación de acciones con los demás paneles.

### Qué falta para cerrar Ventas

Las **rectificativas y abonos** son la siguiente ampliación funcional del portal. No basta con cambiar el estado de la factura ni con revertir un cobro. Además, antes de producción, deben cerrarse la autenticación/permisos de cobros, la migración V28 y una prueba integral con persistencia, concurrencia y fiscalidad en pruebas. El [informe de auditoría](../auditoria-cierre-ventas-2026-08-31.md) distingue estos bloqueos de ampliaciones futuras como remesas o conciliación.

'''
s=s.replace('## 1. Acceso al sistema',block+'## 1. Acceso al sistema',1)
p.write_text(s,encoding='utf-8')
p=root/'src/views/Help/Frm_UserManual.vue';s=p.read_text(encoding='utf-8')
s=s.replace('Versión 2.4','Versión 2.5').replace('a 30 de agosto de 2026','a 31 de agosto de 2026').replace('Novedades del 30 de agosto','Novedades del 31 de agosto')
s=s.replace('flujo-ventas-kiwikerp-freelandsite-2026-08-31.png','flujo-ventas-pizarra-2026-08-31.png')
s=s.replace('width="1536" height="1024"','width="2523" height="1783"').replace('del presupuesto al cobro, con logo de FreeLandSite','del precio al cobro, con efecto pizarra y logo de FreeLandSite')
s=s.replace('<p>El recorrido depende de cada línea:', '<p>Las tarifas proponen el precio según cliente, producto y cantidad. El recorrido depende de cada línea:')
old='<p><a :href="salesFlowDiagram" download="flujo-ventas-kiwikerp-freelandsite.png">Descargar el diagrama en PNG</a> · 1536 × 1024 píxeles. Para una impresión mural grande conviene preparar una versión de mayor resolución.</p>'
new='<p><a :href="salesFlowDiagram" download="flujo-ventas-pizarra.png">Descargar PNG para pantalla</a> · 2523 × 1783 píxeles. <a :href="salesFlowPoster" target="_blank" rel="noopener noreferrer">Abrir póster PDF A1 horizontal</a> · 841 × 594 mm, texto y trazos vectoriales; reducible a A2. El logotipo conserva su imagen original.</p>'
assert old in s;s=s.replace(old,new)
s=s.replace("import salesFlowDiagram from", "import salesFlowPoster from '../../../output/pdf/kiwikerp-ventas-pizarra-a1-2026-08-31.pdf?url';\nimport salesFlowDiagram from")
s=s.replace('<section id="novedades"><h2>Novedades del 31 de agosto de 2026</h2><ul>', '<section id="novedades"><h2>Novedades del 31 de agosto de 2026</h2><ul><li>Tarifas por producto, familia o catálogo, descuentos por cantidad y simulación con cambios sin guardar.</li><li>Precios fijos en otras monedas, sin conversión automática; documentos guardados conservan sus importes.</li><li>Menú de acciones …, tipografía y cabeceras corporativas, botones Nuevo en verde claro; en Presupuestos y Pedidos quedan al final.</li><li>Póster del circuito con efecto pizarra y descarga PDF A1.</li>')
needle='Esta función requiere las migraciones V25 y V27 y el backend actualizado; no incluye todavía vigencias ni fórmulas sobre coste.</p></section>'
replacement='''Esta función requiere las migraciones V25 y V27 y el backend actualizado; no incluye todavía vigencias ni fórmulas sobre coste.</p>
          <h3>Ejemplo: tarifa del cliente en USD</h3><p>Con moneda base EUR y un producto de 5,00 EUR, una tarifa del cliente con precio fijo de 100,00 USD desde 0 unidades y 80,00 USD desde 101 propone, para 120 unidades, <b>80,00 USD por unidad</b> y <b>9.600,00 USD antes de impuestos y descuentos adicionales</b>. No convierte el precio EUR ni interpreta el resultado como total de la línea.</p>
          <h3>Origen del precio al reabrir</h3><p>La columna Precio es más amplia. La conservación de la etiqueta de origen en presupuestos, pedidos y su proforma está preparada con <b>V28</b>, pero sus columnas todavía no estaban instaladas en la base auditada el 31/08/2026. Requiere actualización coordinada. Con esa versión, una edición real muestra <b>Precio manual</b>; entrar o salir del campo sin cambiarlo no altera el origen. Las líneas antiguas sin origen registrado muestran <b>Precio guardado</b>. Reabrir nunca recalcula el importe.</p>
          <h3>Acciones, moneda y formato</h3><p>El menú <b>…</b> permite editar cada tarifa. La moneda de una tarifa existente está protegida: cree otra para trabajar con una moneda distinta. El panel inferior solo ofrece como predeterminadas las tarifas de la moneda base. El acceso desde Ajustes de ventas abre esta misma configuración. Las cantidades e importes de tarifas usan punto de miles y coma decimal, por ejemplo <b>1.200,00</b>.</p></section>'''
assert needle in s;s=s.replace(needle,replacement)
s=s.replace('<section id="inicio">','''<section id="cierre-ventas"><h2>Estado de cierre de Ventas</h2><p>Las <b>rectificativas y abonos</b> son la principal ampliación funcional pendiente del portal. Hay soporte heredado en el backend, pero todavía no un circuito completo integrado con líneas, emisión, cobros e indicadores.</p><p>Antes de producción también quedan la autenticación y permisos de las operaciones de cobro, el despliegue de <b>V28</b> y la prueba integral con base real: presupuesto, pedido, entrega o facturación por pedido, emisión en pruebas, vencimientos, cobro parcial y reversión. Las pruebas aisladas y la existencia de tablas no acreditan ese cierre.</p><p>Remesas, conciliación, gestión de impagados y funciones avanzadas de tarifas son ampliaciones distintas. No se muestran como disponibles en el póster comercial.</p></section>
        <section id="inicio">''',1)
s=s.replace('<a class="toc-sub" href="#novedades">Novedades del 31 de agosto</a>', '<a class="toc-sub" href="#novedades">Novedades del 31 de agosto</a><a class="toc-sub" href="#cierre-ventas">Estado de cierre de Ventas</a>')
p.write_text(s,encoding='utf-8')
print('Manual Markdown y Vue sincronizados')
