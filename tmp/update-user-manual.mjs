import fs from 'node:fs';
const vuePath = 'src/views/Help/Frm_UserManual.vue';
const mdPath = 'docs/manual-usuario/README.md';
let vue = fs.readFileSync(vuePath, 'utf8').replace(/\r\n/g, '\n');
let md = fs.readFileSync(mdPath, 'utf8').replace(/\r\n/g, '\n');
const inline = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
// Converts only the deliberately limited Markdown written below, not user input.
function html(text) {
  return text.trim().split(/\n\n+/).map(block => {
    const lines = block.split('\n');
    if (block.startsWith('### ')) return `<h3>${inline(block.slice(4))}</h3>`;
    if (block.startsWith('|')) return '<table class="manual-table"><thead><tr>' + lines[0].split('|').slice(1,-1).map(c=>`<th scope="col">${inline(c.trim())}</th>`).join('') + '</tr></thead><tbody>' + lines.slice(2).map(l=>'<tr>'+l.split('|').slice(1,-1).map(c=>`<td>${inline(c.trim())}</td>`).join('')+'</tr>').join('') + '</tbody></table>';
    if (/^\d+\. /.test(block)) return '<ol>' + lines.map(l=>`<li>${inline(l.replace(/^\d+\. /,''))}</li>`).join('') + '</ol>';
    if (block.startsWith('- ')) return '<ul>' + lines.map(l=>`<li>${inline(l.slice(2))}</li>`).join('') + '</ul>';
    return `<p>${inline(block)}</p>`;
  }).join('\n          ');
}
function add(mdAnchor, vueId, heading, body) {
  if (!md.includes(mdAnchor)) throw Error(mdAnchor);
  md = md.replace(mdAnchor, `${heading}\n\n${body.trim()}\n\n${mdAnchor}`);
  const section = new RegExp(`(<section\\b[^>]*id="${vueId}"[^>]*>)([\\s\\S]*?)(</section>)`);
  if (!section.test(vue)) throw Error(vueId);
  vue = vue.replace(section, (_, open, content, close)=>open+content+'          '+html(body)+'\n        '+close);
}
const intro = `KiwiK ERP es un sistema de gestión empresarial que reúne en un mismo entorno la información de clientes, artículos y operaciones comerciales. ERP significa planificación de recursos empresariales. En KiwiK, el trabajo disponible se centra en seguir una venta desde la propuesta inicial hasta la entrega, la factura y su cobro.

Su finalidad es evitar volver a introducir los mismos datos en cada documento y permitir consultar el origen de una operación. Un pedido puede proceder de un presupuesto; sus entregas se registran en albaranes; las facturas conservan las referencias correspondientes y los cobros se consultan en su historial.

### A quién va dirigido

- **Administración y ventas:** mantener clientes, preparar propuestas, confirmar pedidos y revisar la facturación.
- **Personal que gestiona entregas:** preparar albaranes, confirmar salidas y conservar justificantes de recogida.
- **Personal que registra cobros:** anotar pagos recibidos, consultar saldos y corregir movimientos mediante reversión.
- **Administradores:** configurar empresa, usuarios, datos maestros y parámetros de ventas. Estos perfiles describen tareas de trabajo; no equivalen a una matriz de permisos independiente para cada acción.

### Qué incluye y cuáles son sus límites

El manual describe las funciones implementadas en el proyecto a 30 de agosto de 2026. La instalación debe tener frontend, backend y actualizaciones de base de datos compatibles para utilizarlas. Compras e Informes siguen identificados como áreas en preparación; no debe interpretarse su tarjeta como una función disponible.

El circuito fiscal descrito está configurado para **PRUEBAS**. Esta guía explica botones y resultados de la aplicación; no acredita una puesta en producción ni sustituye la revisión de los requisitos de la empresa. Las rectificativas, remesas, conciliación y gestión de impagados no forman parte del flujo básico actualmente documentado.

### Cómo leer este manual

Empiece por acceso, clientes y artículos si es la primera vez que utiliza el sistema. Para una operación diaria, vaya directamente al apartado del documento que está gestionando. Antes de confirmar una entrega o emitir una factura, revise su efecto: **guardar un borrador no equivale a confirmar, emitir ni cobrar**. Las capturas son referencias visuales y pueden mostrar otra marca o configuración de empresa.`;
md = md.replace('## Índice', `## Introducción: qué es KiwiK ERP\n\n${intro}\n\n## Índice`);
vue = vue.replace('      <article class="manual-content">', `      <article class="manual-content">\n        <section id="introduccion"><h2>Qué es KiwiK ERP</h2>${html(intro)}</section>\n        <section id="novedades"><h2>Novedades del 30 de agosto de 2026</h2><ul><li>Facturación desde pedidos según la política de cada línea y seguimiento separado de entrega y facturación.</li><li>Facturas manuales sin pedido ni albarán, con motivo y recuperación de la misma operación ante fallos de conexión.</li><li>Cobros totales y parciales, justificantes, historial y reversión con motivo.</li><li>Explicación de reservas, cierre de pedidos mixtos y consulta independiente de VeriFactu.</li></ul><p>Compruebe con el administrador que las actualizaciones están instaladas antes de utilizar estas opciones.</p></section>`);
add('## 3. Área comercial', 'panel-control', '### 2.5 Encontrar un documento y trabajar con seguridad', `### Encontrar un documento y trabajar con seguridad

1. Entre en **Ventas** y seleccione el módulo del documento que necesita.
2. Utilice la búsqueda y los filtros disponibles para localizarlo. Si no aparece, quite primero los filtros de estado y fechas: puede estar fuera del intervalo seleccionado.
3. Revise código, cliente y estado antes de abrir las acciones de la fila. Las acciones dependen del estado del documento.
4. Después de guardar, compruebe el resultado en el listado o vuelva a abrir el detalle. Un aviso de conexión no significa necesariamente que el servidor no haya guardado.
5. Si la pantalla ofrece una acción de reintento de la misma operación, utilícela antes de comenzar otra. Así evita crear duplicados.

Los filtros de filas y el año de los indicadores no siempre representan la misma selección. En Facturas, los filtros del listado no modifican los widgets anuales. Antes de comparar importes, revise qué periodo y conjunto de documentos resume cada panel.`);
add('## 5. Artículos', 'entidades', '### 4.2 Preparar la ficha antes de vender', `### Preparar la ficha antes de vender

1. Localice la entidad en **Ventas → Entidades** y abra su ficha para evitar crear un cliente duplicado.
2. Revise identificación, datos fiscales y dirección. Estos datos se utilizan en los documentos posteriores.
3. Compruebe los contactos y su correo cuando vaya a enviar presupuestos o albaranes.
4. En los atributos de venta, revise tarifa, posición fiscal, condición de cobro y días de pago. La tarifa es obligatoria para la nueva factura manual.
5. Escriba los acuerdos particulares en las condiciones de venta y guarde la ficha.

Las condiciones particulares son texto comercial; no sustituyen la condición de cobro. Los documentos conservan una copia de las condiciones: cambiar después la ficha del cliente no actualiza automáticamente las operaciones anteriores. Revise el contenido del borrador si debe aplicar un acuerdo nuevo.`);
const products = `El artículo proporciona descripción, precio, impuesto y unidad de medida. Su configuración también decide si necesita entrega física y desde dónde se factura. Revísela antes de utilizarlo en una venta.

### Configurar el recorrido del artículo

1. Abra el artículo desde **Ventas → Artículos** y revise sus datos comerciales.
2. Seleccione el tipo logístico: **Almacenable**, **Consumible** o **Servicio**. Un consumible puede requerir albarán aunque no tenga control estricto de existencias.
3. Revise el tipo comercial compatible. Su configuración propone el flujo de venta.
4. En **Flujo de venta**, mantenga la herencia del tipo comercial salvo que exista una excepción. Active **Personalizar para este producto** únicamente para definir una regla propia.
5. Compruebe **Requiere albarán** y la política de facturación. Si no requiere albarán, la facturación se basa en cantidades pedidas.

| Configuración de la línea | Dónde se factura | Qué queda por completar |
| --- | --- | --- |
| Sin albarán, cantidades pedidas | Desde el pedido confirmado | Facturar la cantidad no cancelada |
| Con albarán, cantidades pedidas | Desde el pedido confirmado | Entregar y facturar; son controles separados |
| Con albarán, cantidades entregadas | Desde el albarán confirmado | Entregar y después facturar lo disponible |

Cambiar un artículo no debe reinterpretar una operación anterior: cada línea conserva su política. En un pedido mixto, consulte el comportamiento de cada línea antes de decidir desde dónde facturar.`;
vue = vue.replace('        <section id="presupuestos">', `        <section id="articulos"><h2>Artículos y flujo de venta</h2>${html(products)}</section>\n        <section id="presupuestos">`);
md = md.replace('## 6. Presupuestos', `### 5.7 Comprobación antes de utilizar un artículo\n\n${products}\n\n## 6. Presupuestos`);
add('## 7. Pedidos de venta', 'presupuestos', '### 6.4 Preparar, enviar y aceptar una propuesta', `### Preparar, enviar y aceptar una propuesta

1. Cree un presupuesto y seleccione el cliente. Compruebe la tarifa y las condiciones que se proponen.
2. Revise fecha y validez: la validez indica hasta cuándo mantiene su oferta, no una fecha prevista de entrega.
3. Añada los artículos o servicios, ajuste cantidades y revise precios, descuentos, impuestos y total.
4. Compruebe las condiciones generales y particulares. Guarde y revise el PDF antes de remitirlo al cliente.
5. Utilice la acción de envío cuando proceda y compruebe el estado del documento. Enviar una oferta no equivale a que el cliente la haya aceptado.
6. Cuando exista aceptación, utilice la acción de aceptar: el presupuesto queda aprobado y se genera un **pedido en borrador**. Abra ese pedido para revisar fecha prevista y cantidades antes de confirmarlo.

Si la propuesta no continúa, utilice la cancelación disponible según su estado. No cree una segunda operación sin comprobar antes si el presupuesto ya generó un pedido. Las notas y documentos adjuntos permiten conservar el contexto de la negociación.`);
add('## 8. Albaranes y entregas', 'pedidos', '### 7.9 Guía de confirmación y seguimiento', `### Guía de confirmación y seguimiento

1. Abra el pedido en borrador y revise cliente, fecha prevista, condiciones y líneas.
2. Confirme el pedido cuando deba comenzar su ejecución. Un borrador todavía no constituye un compromiso logístico confirmado.
3. Para las líneas físicas, prepare el albarán con las cantidades que realmente vayan a salir. Una entrega parcial deja el resto pendiente.
4. Para facturar, siga la política de cada línea: pedido para cantidades pedidas; albarán confirmado para cantidades entregadas.
5. Consulte el seguimiento antes de reducir o cancelar pendientes. Las cantidades ya entregadas, facturadas o comprometidas en borradores están protegidas.

**Entregada** significa cantidad de albaranes confirmados, no de albaranes en preparación. **Reservada** es cantidad comprometida por un borrador. **Facturada** refleja la emisión; no significa que se haya recibido el dinero. **Cancelada** indica unidades que ya no se servirán.

Un pedido puede estar entregado y pendiente de factura, o tener una línea facturada por pedido que todavía espera su entrega. El estado **Completado** depende de resolver las entregas y facturación que corresponden a todas sus líneas; no depende de registrar el cobro.`);
const direct = `### Facturar desde pedido: paso a paso

1. Abra las acciones de un pedido **confirmado y desbloqueado** y seleccione **Facturar desde pedido**.
2. Revise las líneas que se ofrecen. Se incluyen las que no requieren albarán o se facturan por cantidades pedidas. Las de cantidades entregadas se facturan desde sus albaranes.
3. Compruebe las cantidades **Comprometidas**, que incluyen borradores y facturas emitidas no anuladas. Introduzca la cantidad a facturar sin superar el disponible; cero excluye la línea de este nuevo borrador.
4. Cree el borrador y revise en Facturas sus pedidos de origen, líneas, condiciones y vencimiento.
5. Guarde los ajustes y emita únicamente cuando haya verificado el documento completo. Se vuelve a comprobar el disponible al crear, editar y emitir.

Guardar reserva cantidades; emitir incrementa las facturadas. **Descartar borrador**, desde las acciones de Facturas, libera las reservas y conserva el documento anulado. Esta acción no sirve para anular una factura emitida. Si se pierde la respuesta de creación, reutilice la operación de reintento que presenta el formulario.

### Ejemplo de pedido mixto

Un pedido contiene 10 unidades por cantidades entregadas y 2 horas de servicio sin albarán. Si confirma una entrega de 6 unidades, podrá facturar esas 6 desde el albarán y las 2 horas desde el pedido. Las 4 unidades restantes siguen pendientes de entrega. Si otra línea física se factura por cantidades pedidas, su factura puede emitirse desde el pedido, pero seguirá pendiente su entrega hasta confirmar el albarán.

El albarán de una línea ya facturable desde pedido controla la entrega y no vuelve a ofrecerla para facturar. Así se evita facturar dos veces la misma cantidad.`;
add('## 10. Facturas proforma', 'pedidos-facturacion', '### 9.10 Facturar desde pedido', direct);
const manual = `### Crear una factura sin documentos anteriores

1. Entre en **Ventas → Facturas → Nueva factura manual**. Utilice esta opción únicamente si la venta no debe facturarse desde un pedido o albarán existente.
2. Seleccione un cliente activo con tarifa de venta configurada. Revise los datos propuestos antes de añadir líneas.
3. Indique fecha, referencia opcional y **motivo obligatorio**. El motivo explica por qué se crea una factura sin documentos de origen.
4. Añada artículos o servicios existentes y revise cantidades, precios y descuentos. El precio propuesto del artículo no garantiza que se haya aplicado una tarifa negociada.
5. Compruebe impuestos, posición fiscal, retención si corresponde, condiciones y total.
6. Guarde: se abre un **borrador Manual** en el detalle habitual. Guardar no asigna el número fiscal definitivo ni envía a VeriFactu.
7. Revise el vencimiento propuesto por la condición de cobro. Si necesita ajustarlo manualmente, indique el motivo desde el borrador. Después continúe con la emisión habitual.

La factura manual no registra entregas ni altera cantidades de pedidos o albaranes. Si la venta ya tiene origen, vuelva a su documento para facturar desde él y conservar el seguimiento.

Si se pierde la respuesta al guardar, conserve el formulario y pulse **Reintentar misma operación**. Los campos quedan bloqueados para repetir exactamente la solicitud y recuperar la misma factura si ya se creó. No abra otra factura para resolver una respuesta incierta.`;
add('## 10. Facturas proforma', 'facturas-manuales', '### 9.11 Nueva factura manual', manual);
const payments = `### Registrar un cobro y comprobar su resultado

1. Localice la factura emitida y abra **Cobros de la factura**. Compruebe código, cliente, total y saldo pendiente.
2. Indique la fecha real del cobro, sin fecha futura, y el importe recibido, positivo y con un máximo de dos decimales. No puede superar el saldo pendiente.
3. Complete medio de cobro, referencia y observaciones según el movimiento que está registrando. El autor se obtiene del usuario conectado.
4. Guarde y compruebe que el movimiento aparece en el historial y que se ha reducido el pendiente.
5. Si tiene un justificante, adjúntelo desde el clip del movimiento ya guardado. No se exige adjunto para registrar el cobro.

Registrar un cobro deja constancia de un pago recibido; **no realiza una transferencia ni cobra dinero al cliente**. Por ejemplo, una factura de 1.000 € con pagos de 400 € y 600 € pasa de parcialmente cobrada a cobrada cuando su saldo llega a cero.

### Corregir un cobro o recuperar una respuesta

Si el movimiento es erróneo, seleccione **Revertir cobro** e indique el motivo. Compruebe después que aumenta el saldo pendiente. El movimiento original y su reversión permanecen en el historial; no se borra la evidencia. Si corresponde, registre a continuación el cobro correcto.

Ante una respuesta incierta, utilice **Comprobar / reintentar** y revise el historial antes de introducir otro pago. Un **Saldo previo** de una factura antigua no es un movimiento nuevo: no dispone de una fecha o medio reconstruidos y no puede revertirse desde este historial.

El cierre comercial del pedido, el resultado de VeriFactu y el cobro son seguimientos independientes. Cobrar o revertir no cambia el número fiscal, el PDF, las cantidades ni los documentos de origen.`;
add('### 9.10 Facturar desde pedido', 'facturas', '### 9.9.1 Procedimiento de cobros y correcciones', payments);
add('## 9. Facturas de venta', 'albaranes', '### 8.10 Comprobar la salida y sus documentos', `### Comprobar la salida y sus documentos

Antes de confirmar, contraste cantidades y destinatario con la mercancía preparada. Un borrador reserva cantidades, pero todavía no incrementa la entrega. Tras confirmar, compruebe el seguimiento del pedido y conserve la copia del albarán que acompaña a la salida.

El documento **valorado** muestra importes; el **no valorado** permite acompañar la mercancía sin mostrar precios. El correo de envío del albarán y la recogida son hechos distintos: enviar un PDF no registra una salida ni acredita que el cliente haya recibido la mercancía.

Registre la recogida cuando el transportista retire la mercancía, con fecha, hora y transportista. Añada el justificante en **Fotografías y justificantes**. Si posteriormente recibe una prueba de entrega al cliente, puede archivarla también, distinguiéndola de la recogida.

Si no puede generar otra entrega, revise las cantidades pendientes y los borradores existentes antes de crear un albarán manual. Un albarán manual sirve para una entrega sin pedido, no para superar cantidades comprometidas de un pedido.`);
const config = `### Proforma: consultar una previsión

Desde un pedido confirmado, genere la proforma cuando necesite presentar el contenido previsto de la operación. Si existen proformas, **Ver proformas** permite consultar y descargar sus PDF. Compruebe la **Fecha prevista de entrega** que se muestra.

La proforma no sustituye a la factura definitiva. Su generación no debe interpretarse como emisión fiscal, entrega de mercancía ni registro de cobro.

### Configuración antes de comenzar

1. Un administrador debe revisar los datos de empresa y usuarios en **Configuración / Ajustes**.
2. En **Datos maestros**, compruebe impuestos, familias de productos y certificados digitales. Al volver desde estas pantallas se mantiene la pestaña Datos maestros.
3. En **Ventas → Ajustes de Ventas → Parámetros generales**, revise condiciones de venta, correo de presupuestos y prefijo de numeración de facturas.
4. En **Parámetros VeriFactu**, revise activación, envío automático y reintentos. El entorno documentado permanece limitado a pruebas. Los certificados y contraseñas no se guardan en este formulario.
5. Si falta una opción recién incorporada o aparece un error de instalación, solicite al administrador que compruebe las versiones y actualizaciones de base de datos. No intente resolverlo duplicando documentos.

Un cambio de prefijo solo afecta a nuevas emisiones; no renumera documentos existentes. Las condiciones generales y las particulares del cliente se copian a los documentos para conservar el contenido utilizado en cada operación.`;
vue = vue.replace('        <section id="estados">', `        <section id="configuracion"><h2>Configuración y proformas</h2>${html(config)}</section>\n        <section id="estados">`);
md = md.replace('## 12. Glosario de estados', `### 11.1 Revisión inicial y proformas\n\n${config}\n\n## 12. Glosario de estados`);
add('---\n\n## Historial del manual', 'estados', '### 12.1 Distinguir cada seguimiento', `### Distinguir cada seguimiento

| Seguimiento | Pregunta que responde | Qué no significa |
| --- | --- | --- |
| Estado del pedido | ¿Queda entrega o facturación por resolver? | Completado no significa cobrado |
| Estado del albarán | ¿La salida está preparada, confirmada o anulada? | Borrador no equivale a entregado |
| Estado de la factura | ¿Es borrador o ya tiene emisión definitiva? | Emitida no equivale a aceptada en VeriFactu |
| Estado VeriFactu | ¿Qué resultado tiene el envío del registro? | Aceptada no equivale a cobrada |
| Situación de cobro | ¿Cuánto se ha recibido y cuánto falta? | Vencida no equivale a anulada |

Si hay un error de comunicación durante la emisión, consulte la factura y su cola antes de volver a actuar. No emita otra factura para sustituir una cuya respuesta sigue pendiente. Si necesita una corrección económica de una factura emitida, no la edite como borrador: consulte al responsable, ya que el circuito de rectificativas sigue pendiente.`);
md = md.replace('**Versión:** 1.10', '**Versión:** 2.1').replace('**Última actualización:** 28 de agosto de 2026', '**Última actualización:** 30 de agosto de 2026');
md = md.replace('1. [Acceso al sistema]', '- [Introducción al sistema](#introducción-qué-es-kiwik-erp)\n\n1. [Acceso al sistema]');
md = md.replace('Las credenciales se envían mediante una conexión segura.', 'Antes de introducir sus credenciales, compruebe que utiliza la dirección de acceso facilitada por su administrador y una conexión HTTPS válida.');
md = md.replace('**Entregada:** unidades incluidas en albaranes.', '**Entregada:** unidades contabilizadas al confirmar albaranes; los borradores solo reservan cantidades.');
md = md.replace('Cuando la suma facturada alcanza las 10 unidades entregadas, el albarán queda **Facturado**.', 'Si las 10 unidades están todavía en borradores, el estado es **En factura borrador**. Solo cuando esas cantidades están en facturas emitidas queda **Facturado**.');
md = md.replace('con el formato `FC-AÑO/NNNN`', 'con la serie configurada; por ejemplo, `FC-KW-2026/0001` cuando el prefijo es `KW`');
md = md.replace('## Historial del manual', `## Historial del manual\n\n### Versión 2.1 — 30 de agosto de 2026\n\n- Introducción al sistema, destinatarios, alcance y límites de la versión.\n- Pasos detallados para cada área de trabajo y ejemplos de pedidos mixtos.\n- Facturación desde pedido, facturas manuales y reservas sin duplicados.\n- Cobros parciales y totales, justificantes, reversiones y respuestas inciertas.\n- Captura de acceso incorporada también al manual del portal, ampliable y adaptable.\n- Corrección del seguimiento comercial: las cantidades se contabilizan al emitir, independientemente de la respuesta de VeriFactu.\n- Índice ampliado y distinción entre estados comerciales, logísticos, fiscales y de cobro.`);
fs.writeFileSync(vuePath, vue);
fs.writeFileSync(mdPath, md);
