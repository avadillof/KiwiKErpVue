import fs from 'node:fs';
const mp='docs/manual-usuario/README.md', vp='src/views/Help/Frm_UserManual.vue';
let md=fs.readFileSync(mp,'utf8'), vue=fs.readFileSync(vp,'utf8');
md=md.replace(/(### [\d.]+ [^\n]+)\n\n### [^\n]+\n/g,'$1\n');
md=md.replace('### 7.9 Guía de confirmación','### 7.8 Guía de confirmación').replace('### 8.10 Comprobar la salida','### 8.11 Comprobar la salida');
md=md.replace(/### 8\.8 Registro de la recepción[\s\S]*?(?=### 8\.9)/,`### 8.8 Recogida por el transportista

1. Prepare el albarán y confirme la salida cuando el transportista retire la mercancía.
2. En el documento **Confirmado**, seleccione **Registrar recogida del transportista**.
3. Indique fecha y hora de recogida y el nombre de la persona o empresa transportista.
4. Incorpore el justificante firmado, fotografiado o escaneado desde **Fotografías y justificantes** si dispone de él.

Registrar la recogida no vuelve a contabilizar cantidades y no acredita por sí solo la entrega final al cliente. Una prueba posterior de entrega puede archivarse en el mismo gestor documental. No se exige dibujar una firma en pantalla para registrar la recogida.

`);
md=md.replace('La sección **Vista rápida del negocio** está identificada como próxima funcionalidad. Los indicadores operativos disponibles actualmente se encuentran dentro de los módulos de Presupuestos, Pedidos y Albaranes.', 'El acceso **Indicadores comerciales** abre Ventas. Los widgets están disponibles en Entidades, Artículos, Presupuestos, Pedidos, Albaranes y Facturas; consulte el periodo seleccionado en cada panel.');
md=md.replace('Incluye Entidades, Artículos, Presupuestos, Pedidos y Entregas.', 'Incluye Entidades, Artículos, Presupuestos, Pedidos, Albaranes y Facturas, incluidas facturas manuales y cobros.');
md=md.replace(/El envío se realiza en segundo plano y presenta cuatro situaciones:[^\n]+/, 'El envío se realiza en segundo plano. El listado distingue **Pendiente de envío**, **Aceptada**, **Aceptada con errores**, **Requiere corrección** y **Error técnico**. Los reintentos dependen de los parámetros de VeriFactu. **Reintentar envío VeriFactu** reutiliza el registro y conserva número fiscal y documentos; no crea otra factura.');
md=md.replace('Cuando VeriFactu devuelve un PDF firmado con su información de registro, se archiva junto a la copia definitiva emitida.', 'La opción **Ver / Imprimir factura** se habilita con VeriFactu en **Aceptada** y abre el PDF archivado. La respuesta de la AEAT es un registro independiente: no debe interpretarse como un PDF firmado devuelto por la AEAT.');
vue=vue.replace('Entidades, Artículos, Presupuestos, Pedidos y Albaranes.</span>', 'Entidades, Artículos, Presupuestos, Pedidos, Albaranes y Facturas.</span>');
vue=vue.replace('Los errores técnicos se reintentan a los 10 minutos.', 'Los errores técnicos se reintentan según los parámetros configurados; la espera predeterminada es de 10 minutos.');
vue=vue.replace('Los borradores creados agrupando albaranes confirmados aparecen diferenciados', 'Los borradores creados desde pedidos, albaranes confirmados o mediante factura manual aparecen diferenciados');
vue=vue.replace('La columna <b>Albaranes origen</b>', 'La factura también identifica los <b>pedidos de origen</b> cuando corresponde. La columna <b>Albaranes origen</b>');
vue=vue.replace('Modificar una cantidad en la factura borrador no cambia la cantidad entregada del albarán ni del pedido. El sistema impide superar la cantidad incluida en el albarán y recalcula únicamente los importes de la factura.', 'Modificar una cantidad en la factura borrador no cambia la cantidad entregada del albarán ni del pedido. El sistema valida el disponible de su origen, descontando otras facturas y reservas: cantidad pedida para facturación desde pedido y cantidad entregada para facturación desde albarán.');
const toc=`        <strong>Contenido</strong>
        <div class="toc-group"><a class="toc-main" href="#introduccion">Introducción al sistema</a><a class="toc-sub" href="#novedades">Novedades del 30 de agosto</a></div>
        <div class="toc-group"><a class="toc-main" href="#inicio">1. Acceso y navegación</a><a class="toc-sub" href="#inicio-sesion">Iniciar sesión</a><a class="toc-sub" href="#panel-control">Panel de control</a></div>
        <div class="toc-group"><a class="toc-main" href="#circuito">2. Circuito comercial</a><a class="toc-sub" href="#entidades">Clientes</a><a class="toc-sub" href="#articulos">Artículos y flujo de venta</a><a class="toc-sub" href="#presupuestos">Presupuestos</a><a class="toc-sub" href="#pedidos">Pedidos</a><a class="toc-sub" href="#pedidos-facturacion">Facturar desde pedido</a></div>
        <div class="toc-group"><a class="toc-main" href="#albaranes">3. Albaranes y entregas</a><a class="toc-sub" href="#albaranes-trazabilidad">Preparación</a><a class="toc-sub" href="#albaranes-correo">Envío por correo</a><a class="toc-sub" href="#albaranes-recogida">Recogida</a><a class="toc-sub" href="#albaranes-documentos">Documentos</a><a class="toc-sub" href="#albaranes-impresion">Impresión</a></div>
        <div class="toc-group"><a class="toc-main" href="#facturas">4. Facturas y cobros</a><a class="toc-sub" href="#facturas-manuales">Nueva factura manual</a><a class="toc-sub" href="#facturas-borrador">Editar borrador</a><a class="toc-sub" href="#facturas-vencimiento">Vencimiento</a><a class="toc-sub" href="#facturas-trazabilidad">Trazabilidad</a><a class="toc-sub" href="#facturas-cobros">Cobros y reversión</a><a class="toc-sub" href="#facturas-limitaciones">Emisión y VeriFactu</a></div>
        <div class="toc-group"><a class="toc-main" href="#configuracion">5. Configuración y proformas</a><a class="toc-main" href="#estados">6. Estados y comprobaciones</a></div>
`;
vue=vue.replace(/        <strong>Contenido<\/strong>[\s\S]*?(?=      <\/nav>)/,toc);
// Place the expanded standalone chapters next to their related operations.
let manualSection=vue.match(/        <section class="chapter" id="facturas-manuales">[\s\S]*?<\/section>\n/)[0];
vue=vue.replace(manualSection,'');
manualSection=manualSection.replace('<h3>Nueva factura manual</h3>','<h2>Nueva factura manual</h2>');
vue=vue.replace('        <section id="facturas" class="chapter">',manualSection+'\n        <section id="facturas" class="chapter">');
vue=vue.replace('<h3>Facturar desde pedido y completar el flujo</h3>','<h2>Facturar desde pedido y completar el flujo</h2>');
fs.writeFileSync(mp,md); fs.writeFileSync(vp,vue);
// Keep the existing installation notes in the dedicated guides.
for (const [path,begin,end,title] of [
 ['docs/manual-usuario/factura-manual.md','### 9.11 Nueva factura manual','## 10. Facturas proforma','Factura manual sin pedido ni albarán'],
 ['docs/manual-usuario/facturacion-desde-pedido.md','### 9.10 Facturar desde pedido','### 9.11 Nueva factura manual','Facturación desde pedido y cierre por línea']
]) {
 const previous=fs.readFileSync(path,'utf8');
 const install=previous.slice(previous.indexOf('## Instalación'));
 const body=md.slice(md.indexOf(begin)+begin.length,md.indexOf(end)).trim();
 fs.writeFileSync(path,`# ${title}\n\n**Actualizado:** 30 de agosto de 2026 · Manual 2.1\n\n[Volver al manual de usuario](README.md)\n\n${body}\n\n${install}`);
}
