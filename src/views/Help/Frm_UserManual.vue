<template>
  <main class="manual-page">
    <header class="manual-hero">
      <button type="button" class="back-button" title="Volver a la pantalla anterior" @click="goBack">
        <i class="pi pi-arrow-left"></i>
        <span>Volver</span>
      </button>
      <img :src="kiwikLogo" alt="KiwiK ERP" class="manual-icon" />
      <div>
        <span class="eyebrow">Centro de ayuda</span>
        <h1>Manual de usuario de KiwiK ERP</h1>
        <p>Guía práctica del circuito comercial y de las operaciones disponibles en el portal.</p>
      </div>
      <span class="version">Versión 2.1 · 30/08/2026</span>
    </header>

    <div class="manual-layout">
      <nav class="toc" aria-label="Índice del manual">
        <strong>Contenido</strong>
        <div class="toc-group"><a class="toc-main" href="#introduccion">Introducción al sistema</a><a class="toc-sub" href="#novedades">Novedades del 30 de agosto</a></div>
        <div class="toc-group"><a class="toc-main" href="#inicio">1. Acceso y navegación</a><a class="toc-sub" href="#inicio-sesion">Iniciar sesión</a><a class="toc-sub" href="#panel-control">Panel de control</a></div>
        <div class="toc-group"><a class="toc-main" href="#circuito">2. Circuito comercial</a><a class="toc-sub" href="#entidades">Clientes</a><a class="toc-sub" href="#articulos">Artículos y flujo de venta</a><a class="toc-sub" href="#presupuestos">Presupuestos</a><a class="toc-sub" href="#pedidos">Pedidos</a><a class="toc-sub" href="#pedidos-facturacion">Facturar desde pedido</a></div>
        <div class="toc-group"><a class="toc-main" href="#albaranes">3. Albaranes y entregas</a><a class="toc-sub" href="#albaranes-trazabilidad">Preparación</a><a class="toc-sub" href="#albaranes-correo">Envío por correo</a><a class="toc-sub" href="#albaranes-recogida">Recogida</a><a class="toc-sub" href="#albaranes-documentos">Documentos</a><a class="toc-sub" href="#albaranes-impresion">Impresión</a></div>
        <div class="toc-group"><a class="toc-main" href="#facturas">4. Facturas y cobros</a><a class="toc-sub" href="#facturas-manuales">Nueva factura manual</a><a class="toc-sub" href="#facturas-borrador">Editar borrador</a><a class="toc-sub" href="#facturas-vencimiento">Vencimiento</a><a class="toc-sub" href="#facturas-trazabilidad">Trazabilidad</a><a class="toc-sub" href="#facturas-cobros">Cobros y reversión</a><a class="toc-sub" href="#facturas-limitaciones">Emisión y VeriFactu</a></div>
        <div class="toc-group"><a class="toc-main" href="#configuracion">5. Configuración y proformas</a><a class="toc-main" href="#estados">6. Estados y comprobaciones</a></div>
      </nav>

      <article class="manual-content">
        <section id="introduccion"><h2>Qué es KiwiK ERP</h2><p>KiwiK ERP es un sistema de gestión empresarial que reúne en un mismo entorno la información de clientes, artículos y operaciones comerciales. ERP significa planificación de recursos empresariales. En KiwiK, el trabajo disponible se centra en seguir una venta desde la propuesta inicial hasta la entrega, la factura y su cobro.</p>
          <p>Su finalidad es evitar volver a introducir los mismos datos en cada documento y permitir consultar el origen de una operación. Un pedido puede proceder de un presupuesto; sus entregas se registran en albaranes; las facturas conservan las referencias correspondientes y los cobros se consultan en su historial.</p>
          <h3>A quién va dirigido</h3>
          <ul><li><b>Administración y ventas:</b> mantener clientes, preparar propuestas, confirmar pedidos y revisar la facturación.</li><li><b>Personal que gestiona entregas:</b> preparar albaranes, confirmar salidas y conservar justificantes de recogida.</li><li><b>Personal que registra cobros:</b> anotar pagos recibidos, consultar saldos y corregir movimientos mediante reversión.</li><li><b>Administradores:</b> configurar empresa, usuarios, datos maestros y parámetros de ventas. Estos perfiles describen tareas de trabajo; no equivalen a una matriz de permisos independiente para cada acción.</li></ul>
          <h3>Qué incluye y cuáles son sus límites</h3>
          <p>El manual describe las funciones implementadas en el proyecto a 30 de agosto de 2026. La instalación debe tener frontend, backend y actualizaciones de base de datos compatibles para utilizarlas. Compras e Informes siguen identificados como áreas en preparación; no debe interpretarse su tarjeta como una función disponible.</p>
          <p>El circuito fiscal descrito está configurado para <b>PRUEBAS</b>. Esta guía explica botones y resultados de la aplicación; no acredita una puesta en producción ni sustituye la revisión de los requisitos de la empresa. Las rectificativas, remesas, conciliación y gestión de impagados no forman parte del flujo básico actualmente documentado.</p>
          <h3>Cómo leer este manual</h3>
          <p>Empiece por acceso, clientes y artículos si es la primera vez que utiliza el sistema. Para una operación diaria, vaya directamente al apartado del documento que está gestionando. Antes de confirmar una entrega o emitir una factura, revise su efecto: <b>guardar un borrador no equivale a confirmar, emitir ni cobrar</b>. Las capturas son referencias visuales y pueden mostrar otra marca o configuración de empresa.</p></section>
        <section id="novedades"><h2>Novedades del 30 de agosto de 2026</h2><ul><li>Facturación desde pedidos según la política de cada línea y seguimiento separado de entrega y facturación.</li><li>Facturas manuales sin pedido ni albarán, con motivo y recuperación de la misma operación ante fallos de conexión.</li><li>Cobros totales y parciales, justificantes, historial y reversión con motivo.</li><li>Explicación de reservas, cierre de pedidos mixtos y consulta independiente de VeriFactu.</li></ul><p>Compruebe con el administrador que las actualizaciones están instaladas antes de utilizar estas opciones.</p></section>
        <section id="inicio">
          <h2>Primeros pasos</h2>
          <h3 id="inicio-sesion">Iniciar sesión</h3>
          <figure class="manual-figure">
            <a :href="loginScreenshot" target="_blank" rel="noopener noreferrer" aria-label="Ampliar captura de inicio de sesión (abre otra pestaña)"><img :src="loginScreenshot" alt="Pantalla de acceso a KiwiK ERP con los campos Usuario y Contraseña y el botón Acceder a KiwiKERP" /></a>
            <figcaption>Pantalla de inicio de sesión. Pulse la imagen para verla a tamaño completo. El logotipo puede variar según la empresa.</figcaption>
          </figure>
          <p>Introduzca su usuario y contraseña y pulse <b>Acceder a KiwiKERP</b>. El icono del campo Contraseña permite mostrar u ocultar temporalmente el texto para comprobarlo antes de continuar.</p>
          <p>Si el acceso es rechazado, revise mayúsculas, minúsculas, espacios accidentales y que ambos campos estén completos. Si la cuenta está desactivada, deberá contactar con el administrador.</p>
          <h3>Recuperar las credenciales</h3>
          <ol>
            <li>Pulse <b>¿La has olvidado?</b> en la pantalla de acceso.</li>
            <li>Introduzca el correo asociado a su usuario.</li>
            <li>Pulse <b>Enviar instrucciones</b>.</li>
            <li>Revise su bandeja de entrada y utilice la contraseña indicada en el mensaje <b>Acceso a KiwiKERP</b>.</li>
          </ol>
          <p>Si el correo no llega, revise correo no deseado, promociones o cuarentena y confirme con el administrador que la dirección está registrada correctamente.</p>
          <div class="warning"><i class="pi pi-shield"></i><span>No comparta ni reenvíe el correo de recuperación. Cambie la contraseña después de recuperar el acceso y cierre la sesión al trabajar en un equipo compartido.</span></div>
          <p>Tras identificarse, el panel principal permite entrar en las áreas de trabajo. La cabecera y el pie permanecen visibles para facilitar la navegación, consultar el manual y cerrar la sesión.</p>
          <div class="note"><i class="pi pi-info-circle"></i><span>Utilice los botones <b>Inicio</b> y <b>Ventas</b> de cada listado para regresar rápidamente a esas áreas.</span></div>
        </section>

        <section id="panel-control">
          <h2>Espacio de trabajo y Panel de control</h2>
          <p>Después de iniciar sesión se abre el <b>Espacio de trabajo</b>. La cabecera muestra la fecha, el acceso al Manual, las notificaciones, la salida segura y el perfil del usuario conectado.</p>
          <ul>
            <li><b>Manual:</b> abre esta guía dentro del portal.</li>
            <li><b>Campana:</b> muestra un contador cuando hay mensajes nuevos.</li>
            <li><b>Avatar:</b> abre la ficha del usuario; si no tiene fotografía aparecen sus iniciales.</li>
            <li><b>Salir:</b> cierra la sesión y regresa a la pantalla de acceso.</li>
          </ul>
          <h3>Tarjetas de módulos</h3>
          <p>El portal de Ventas presenta el recorrido <b>Presupuesto → Pedido → Albarán → Factura</b> y permite acceder directamente a cada etapa. Las tarjetas resumen las funciones disponibles en cada módulo; las marcadas como <b>Próximamente</b> permanecen bloqueadas.</p>
          <p><b>Ventas</b> requiere acceso comercial y <b>Configuración</b> solo aparece para administradores. Por eso distintos usuarios pueden ver un número diferente de módulos.</p>
          <p>El pie identifica la empresa activa, su CIF, eslogan y versión de KiwiK ERP. Los botones <b>Inicio</b> y <b>Ventas</b> de los listados facilitan el regreso a estas áreas.</p>
          <div class="note"><i class="pi pi-info-circle"></i><span>El acceso <b>Indicadores comerciales</b> del Panel de control abre Ventas. Los widgets actuales se encuentran en Entidades, Artículos, Presupuestos, Pedidos, Albaranes y Facturas.</span></div>
                  <h3>Encontrar un documento y trabajar con seguridad</h3>
          <ol><li>Entre en <b>Ventas</b> y seleccione el módulo del documento que necesita.</li><li>Utilice la búsqueda y los filtros disponibles para localizarlo. Si no aparece, quite primero los filtros de estado y fechas: puede estar fuera del intervalo seleccionado.</li><li>Revise código, cliente y estado antes de abrir las acciones de la fila. Las acciones dependen del estado del documento.</li><li>Después de guardar, compruebe el resultado en el listado o vuelva a abrir el detalle. Un aviso de conexión no significa necesariamente que el servidor no haya guardado.</li><li>Si la pantalla ofrece una acción de reintento de la misma operación, utilícela antes de comenzar otra. Así evita crear duplicados.</li></ol>
          <p>Los filtros de filas y el año de los indicadores no siempre representan la misma selección. En Facturas, los filtros del listado no modifican los widgets anuales. Antes de comparar importes, revise qué periodo y conjunto de documentos resume cada panel.</p>
        </section>

        <section id="circuito">
          <h2>Circuito comercial</h2>
          <div class="flow">
            <span>Presupuesto</span><i class="pi pi-arrow-right"></i><span>Pedido</span><i class="pi pi-arrow-right"></i><span>Albarán</span><i class="pi pi-arrow-right"></i><span>Factura</span>
          </div>
          <p>Los documentos conservan su relación de origen. Así puede conocerse en todo momento qué se pidió, qué se entregó, qué se facturó, qué se canceló y qué queda pendiente.</p>
        </section>

        <section id="entidades">
          <h2>Clientes y condiciones comerciales</h2>
          <p>La ficha de la entidad centraliza los datos identificativos, fiscales, comerciales y de contacto utilizados posteriormente en presupuestos, pedidos, albaranes y facturas.</p>
          <h3>Condiciones de cobro</h3>
          <p>En los atributos de venta del cliente se configura la condición de cobro y, opcionalmente, hasta tres días habituales de pago. Esta información se utiliza para calcular automáticamente el vencimiento de las facturas.</p>
          <ul>
            <li><b>Condición de cobro:</b> determina los días que se suman a la fecha de factura.</li>
            <li><b>Días de pago 1, 2 y 3:</b> ajustan el resultado al siguiente día de cobro admitido por el cliente.</li>
            <li><b>Tarifa y posición fiscal:</b> condicionan precios e impuestos de los documentos comerciales.</li>
          </ul>
          <div class="warning"><i class="pi pi-exclamation-triangle"></i><span>Revise las condiciones comerciales del cliente antes de iniciar el circuito. Una configuración incompleta puede impedir crear documentos o producir vencimientos incorrectos.</span></div>
                  <h3>Preparar la ficha antes de vender</h3>
          <ol><li>Localice la entidad en <b>Ventas → Entidades</b> y abra su ficha para evitar crear un cliente duplicado.</li><li>Revise identificación, datos fiscales y dirección. Estos datos se utilizan en los documentos posteriores.</li><li>Compruebe los contactos y su correo cuando vaya a enviar presupuestos o albaranes.</li><li>En los atributos de venta, revise tarifa, posición fiscal, condición de cobro y días de pago. La tarifa es obligatoria para la nueva factura manual.</li><li>Escriba los acuerdos particulares en las condiciones de venta y guarde la ficha.</li></ol>
          <p>Las condiciones particulares son texto comercial; no sustituyen la condición de cobro. Los documentos conservan una copia de las condiciones: cambiar después la ficha del cliente no actualiza automáticamente las operaciones anteriores. Revise el contenido del borrador si debe aplicar un acuerdo nuevo.</p>
        </section>

        <section id="articulos"><h2>Artículos y flujo de venta</h2><p>El artículo proporciona descripción, precio, impuesto y unidad de medida. Su configuración también decide si necesita entrega física y desde dónde se factura. Revísela antes de utilizarlo en una venta.</p>
          <h3>Configurar el recorrido del artículo</h3>
          <ol><li>Abra el artículo desde <b>Ventas → Artículos</b> y revise sus datos comerciales.</li><li>Seleccione el tipo logístico: <b>Almacenable</b>, <b>Consumible</b> o <b>Servicio</b>. Un consumible puede requerir albarán aunque no tenga control estricto de existencias.</li><li>Revise el tipo comercial compatible. Su configuración propone el flujo de venta.</li><li>En <b>Flujo de venta</b>, mantenga la herencia del tipo comercial salvo que exista una excepción. Active <b>Personalizar para este producto</b> únicamente para definir una regla propia.</li><li>Compruebe <b>Requiere albarán</b> y la política de facturación. Si no requiere albarán, la facturación se basa en cantidades pedidas.</li></ol>
          <table class="manual-table"><thead><tr><th scope="col">Configuración de la línea</th><th scope="col">Dónde se factura</th><th scope="col">Qué queda por completar</th></tr></thead><tbody><tr><td>Sin albarán, cantidades pedidas</td><td>Desde el pedido confirmado</td><td>Facturar la cantidad no cancelada</td></tr><tr><td>Con albarán, cantidades pedidas</td><td>Desde el pedido confirmado</td><td>Entregar y facturar; son controles separados</td></tr><tr><td>Con albarán, cantidades entregadas</td><td>Desde el albarán confirmado</td><td>Entregar y después facturar lo disponible</td></tr></tbody></table>
          <p>Cambiar un artículo no debe reinterpretar una operación anterior: cada línea conserva su política. En un pedido mixto, consulte el comportamiento de cada línea antes de decidir desde dónde facturar.</p></section>
        <section id="presupuestos">
          <h2>Presupuestos de venta</h2>
          <p>El presupuesto inicia el circuito comercial. En borrador pueden revisarse el cliente, las fechas, las condiciones comerciales y las líneas. Una vez aprobado puede generar el pedido manteniendo la relación entre ambos documentos.</p>
          <h3>Seguimiento visual</h3>
          <p>Los borradores se identifican mediante su código provisional y un estilo diferenciado. Los estados y las acciones disponibles evitan modificar como borrador un documento que ya ha avanzado en el circuito.</p>
                  <h3>Preparar, enviar y aceptar una propuesta</h3>
          <ol><li>Cree un presupuesto y seleccione el cliente. Compruebe la tarifa y las condiciones que se proponen.</li><li>Revise fecha y validez: la validez indica hasta cuándo mantiene su oferta, no una fecha prevista de entrega.</li><li>Añada los artículos o servicios, ajuste cantidades y revise precios, descuentos, impuestos y total.</li><li>Compruebe las condiciones generales y particulares. Guarde y revise el PDF antes de remitirlo al cliente.</li><li>Utilice la acción de envío cuando proceda y compruebe el estado del documento. Enviar una oferta no equivale a que el cliente la haya aceptado.</li><li>Cuando exista aceptación, utilice la acción de aceptar: el presupuesto queda aprobado y se genera un <b>pedido en borrador</b>. Abra ese pedido para revisar fecha prevista y cantidades antes de confirmarlo.</li></ol>
          <p>Si la propuesta no continúa, utilice la cancelación disponible según su estado. No cree una segunda operación sin comprobar antes si el presupuesto ya generó un pedido. Las notas y documentos adjuntos permiten conservar el contexto de la negociación.</p>
        </section>

        <section id="pedidos">
          <h2>Pedidos de venta</h2>
          <p>Cada línea muestra las cantidades pedida, entregada, facturada, cancelada y pendiente. Estos valores se actualizan automáticamente conforme avanza el pedido.</p>
          <h3>Filtros operativos</h3>
          <p>El filtro <b>Pendiente de</b> permite localizar los pedidos que todavía requieren una acción:</p>
          <ul>
            <li><b>Generar albarán:</b> pedidos con productos físicos pendientes de entrega.</li>
            <li><b>Facturación:</b> pedidos con cantidades entregadas pendientes de facturar.</li>
          </ul>
          <p>El filtro <b>Plazo entrega</b> muestra pedidos vencidos, que vencen hoy, dentro de los dos plazos configurados (7 y 30 días por defecto) y sin fecha prevista. Solo incluye pedidos confirmados con productos físicos pendientes; los pedidos en <b>Borrador</b> quedan excluidos porque todavía no representan un compromiso logístico. La fecha aparece en rojo si está vencida, en ámbar dentro del primer plazo configurado y en verde para fechas posteriores.</p>
          <p>Puede combinarse con el estado, las fechas y la búsqueda general. La acción <b>Generar albarán</b> solo aparece cuando realmente existen cantidades pendientes.</p>
          <p>Los dos intervalos se configuran en <b>Parámetros generales → Filtro «Plazo entrega» de pedidos</b>: entre 1 y 365 días, con el segundo mayor que el primero. Incluyen hoy y el último día completo. Refresque el listado tras guardar cambios.</p><h3>Recordatorio diario</h3>
          <p>Por defecto, a las <b>08:15</b> (hora de Madrid), cada responsable recibe un único correo con los pedidos que creó y que están vencidos, vencen hoy o tienen entrega prevista hasta dentro de <b>7 días</b>. Configure activación, hora y antelación en <b>Ventas → Ajustes de Ventas → Parámetros generales → Recordatorio diario de entregas</b>.</p>
          <p><b>Probar</b> muestra destinatarios, pedidos y estado del envío de hoy sin mandar correos ni comprobar SMTP. Guarde antes los cambios del recordatorio. <b>Enviar ahora → Confirmar envío</b> manda correos reales con la configuración guardada, aunque el automático esté pausado. Los destinatarios se recalculan al confirmar. El resultado distingue enviados, omitidos y fallos. Ambos envíos comparten el límite diario; ante una respuesta incierta consulte Probar antes de repetir. Ambas acciones solicitan el código de usuario y la contraseña para autenticar la petición; la contraseña no se guarda.</p>
          <ul>
            <li>El aviso muestra pedido, cliente, fecha prevista, retraso o días restantes y cantidad pendiente.</li>
            <li>No incluye pedidos entregados, completados, cancelados ni pedidos sin cantidades físicas pendientes.</li>
            <li>Los pedidos sin fecha prevista se consultan desde el filtro del listado, pero no se incorporan al correo.</li>
            <li>El responsable debe ser un usuario activo y tener una dirección de correo configurada.</li>
          </ul>
          <div class="note"><i class="pi pi-info-circle"></i><span>Guarde los parámetros para aplicarlos sin reiniciar. Si la hora ya pasó, el próximo aviso será al día siguiente. El servidor debe estar en marcha a la hora configurada. No se repite un envío del mismo día y dirección al cambiar la hora o reiniciar. Un fallo o respuesta incierta del correo se registra y no se reintenta ese día para evitar duplicados. El aviso no genera albaranes ni modifica pedidos.</span></div>
                  <h3>Guía de confirmación y seguimiento</h3>
          <ol><li>Abra el pedido en borrador y revise cliente, fecha prevista, condiciones y líneas.</li><li>Confirme el pedido cuando deba comenzar su ejecución. Un borrador todavía no constituye un compromiso logístico confirmado.</li><li>Para las líneas físicas, prepare el albarán con las cantidades que realmente vayan a salir. Una entrega parcial deja el resto pendiente.</li><li>Para facturar, siga la política de cada línea: pedido para cantidades pedidas; albarán confirmado para cantidades entregadas.</li><li>Consulte el seguimiento antes de reducir o cancelar pendientes. Las cantidades ya entregadas, facturadas o comprometidas en borradores están protegidas.</li></ol>
          <p><b>Entregada</b> significa cantidad de albaranes confirmados, no de albaranes en preparación. <b>Reservada</b> es cantidad comprometida por un borrador. <b>Facturada</b> refleja la emisión; no significa que se haya recibido el dinero. <b>Cancelada</b> indica unidades que ya no se servirán.</p>
          <p>Un pedido puede estar entregado y pendiente de factura, o tener una línea facturada por pedido que todavía espera su entrega. El estado <b>Completado</b> depende de resolver las entregas y facturación que corresponden a todas sus líneas; no depende de registrar el cobro.</p>
        </section>

        <section class="chapter" id="pedidos-facturacion">
          <h2>Facturar desde pedido y completar el flujo</h2>
          <p>En las acciones de un pedido confirmado y desbloqueado, <b>Facturar desde pedido</b> permite seleccionar cantidades de líneas sin albarán o con política <b>Cantidades pedidas</b>. Cero excluye una línea. Las líneas por cantidades entregadas continúan facturándose desde albaranes.</p>
          <p>El borrador reserva cantidades, pero no incrementa las facturadas. Al guardar y emitir se comprueba el disponible descontando otros borradores y facturas. <b>Descartar borrador</b>, desde Facturas, libera la reserva conservando el documento anulado.</p>
          <p>Una línea sin albarán termina al facturarse completamente. Si requiere albarán, debe estar entregada y facturada: facturar por cantidades pedidas no da por entregado el artículo. En pedidos mixtos cada línea conserva su política; el pedido se completa cuando todas terminan, descontadas las cantidades canceladas.</p>
          <p>La emisión actualiza el progreso comercial; el estado VeriFactu se consulta por separado. Las facturas muestran los pedidos de origen y cada línea conserva su referencia. Los albaranes de líneas facturables desde pedido controlan la entrega, pero no vuelven a ofrecer esas cantidades para facturación.</p>
                  <h3>Facturar desde pedido: paso a paso</h3>
          <ol><li>Abra las acciones de un pedido <b>confirmado y desbloqueado</b> y seleccione <b>Facturar desde pedido</b>.</li><li>Revise las líneas que se ofrecen. Se incluyen las que no requieren albarán o se facturan por cantidades pedidas. Las de cantidades entregadas se facturan desde sus albaranes.</li><li>Compruebe las cantidades <b>Comprometidas</b>, que incluyen borradores y facturas emitidas no anuladas. Introduzca la cantidad a facturar sin superar el disponible; cero excluye la línea de este nuevo borrador.</li><li>Cree el borrador y revise en Facturas sus pedidos de origen, líneas, condiciones y vencimiento.</li><li>Guarde los ajustes y emita únicamente cuando haya verificado el documento completo. Se vuelve a comprobar el disponible al crear, editar y emitir.</li></ol>
          <p>Guardar reserva cantidades; emitir incrementa las facturadas. <b>Descartar borrador</b>, desde las acciones de Facturas, libera las reservas y conserva el documento anulado. Esta acción no sirve para anular una factura emitida. Si se pierde la respuesta de creación, reutilice la operación de reintento que presenta el formulario.</p>
          <h3>Ejemplo de pedido mixto</h3>
          <p>Un pedido contiene 10 unidades por cantidades entregadas y 2 horas de servicio sin albarán. Si confirma una entrega de 6 unidades, podrá facturar esas 6 desde el albarán y las 2 horas desde el pedido. Las 4 unidades restantes siguen pendientes de entrega. Si otra línea física se factura por cantidades pedidas, su factura puede emitirse desde el pedido, pero seguirá pendiente su entrega hasta confirmar el albarán.</p>
          <p>El albarán de una línea ya facturable desde pedido controla la entrega y no vuelve a ofrecerla para facturar. Así se evita facturar dos veces la misma cantidad.</p>
        </section>
        <section id="albaranes" class="chapter">
          <h2>Albaranes y entregas</h2>
          <p>Un albarán puede incluir una entrega parcial o agrupar varios pedidos compatibles del mismo cliente. Nunca se permite entregar más cantidad de la que permanece pendiente.</p>
          <h3 id="albaranes-trazabilidad">Preparación y trazabilidad</h3>
          <ol>
            <li>Desde el pedido, pulse <b>Generar albarán</b>.</li>
            <li>Indique la cantidad a entregar de cada línea.</li>
            <li>Si procede, incorpore otros pedidos compatibles.</li>
            <li>Revise los datos y guarde el albarán en borrador.</li>
            <li>Confírmelo cuando la salida de mercancía sea efectiva.</li>
          </ol>
          <p>El listado muestra los pedidos de origen. Cuando existen varios, el indicador adicional abre un diálogo con su información esencial.</p>
          <div class="warning"><i class="pi pi-exclamation-triangle"></i><span>Las cantidades entregadas se contabilizan únicamente al <b>confirmar</b> el albarán, no al guardarlo como borrador.</span></div>
          <h3 id="albaranes-correo">Envío por correo</h3>
          <p>Desde un albarán <b>Confirmado</b> puede seleccionar <b>Enviar por correo</b>, elegir uno de los contactos activos del cliente y decidir si el PDF será valorado o no valorado. Se utiliza la plantilla corporativa y la copia histórica del documento.</p>
          <p>La fecha de envío se registra únicamente cuando el correo se entrega correctamente al servidor. La columna ordenable <b>Enviado el</b> muestra la fecha y hora del último envío, o <b>-</b> si nunca se ha enviado. Los borradores y los albaranes anulados no pueden enviarse.</p>
          <h3 id="albaranes-recogida">Recogida por el transportista</h3>
          <p>Prepare el albarán en borrador y revise las cantidades. Cuando el transportista retire la mercancía, confirme el albarán para contabilizar la salida y entréguele la copia impresa que acompañará a la expedición.</p>
          <p>En el albarán <b>Confirmado</b>, pulse <b>Registrar recogida del transportista</b> e indique la fecha y hora de recogida y el nombre de la persona o empresa transportista que retira la mercancía.</p>
          <p>Si el transportista entrega un documento firmado como prueba de recogida, incorpórelo desde <b>Fotografías y justificantes</b>. Puede adjuntarse escaneado o fotografiado. Una prueba posterior de entrega al cliente también puede incorporarse en el mismo apartado.</p>
          <div class="note"><i class="pi pi-info-circle"></i><span>Registrar la recogida no vuelve a contabilizar cantidades. Documenta quién retiró la mercancía y cuándo. El justificante adjunto acredita la recogida; no necesariamente la entrega final al cliente.</span></div>
          <h3 id="albaranes-documentos">Fotografías y justificantes</h3>
          <p>La acción <b>Fotografías y justificantes</b> permite adjuntar imágenes de la mercancía, justificantes de transporte, PDF y documentos relacionados. Pueden previsualizarse, descargarse o eliminarse desde el gestor documental.</p>
          <p>Se admiten PDF, JPG, JPEG, PNG, WEBP, DOC y DOCX hasta 15 MB por archivo. El indicador de clip junto al código muestra el número de documentos vinculados. Los justificantes se conservan incluso si el albarán se anula.</p>
          <h3>Resumen logístico</h3>
          <p>El panel plegable situado bajo el listado ofrece indicadores anuales de albaranes generados, borradores, pendientes de facturar, salidas sin recogida registrada, pendientes de enviar y anulados. Incluye gráficos mensuales y distribución por estado.</p>
          <p>La sección de calidad muestra puntualidad, retraso medio, porcentaje con recogida registrada, porcentaje enviado, albaranes manuales y cantidad expedida. Los rankings identifican los principales clientes y las salidas con mayor retraso.</p>
          <div class="note"><i class="pi pi-info-circle"></i><span>La puntualidad compara la fecha prevista del pedido con la entrega real. En albaranes agrupados se utiliza el compromiso más próximo; los manuales quedan fuera del cálculo.</span></div>
          <h3>Albaranes manuales</h3>
          <p>La opción <b>Nuevo albarán manual</b> permite registrar una entrega sin pedido previo. Es obligatorio seleccionar el cliente, indicar el motivo y añadir los productos entregados. El listado los identifica como <b>Manual</b> y no modifican el seguimiento de ningún pedido.</p>
          <p>El filtro <b>Facturación</b> permite consultar todos los albaranes, los ya facturados o los confirmados que permanecen pendientes de facturar.</p>
                  <h3>Comprobar la salida y sus documentos</h3>
          <p>Antes de confirmar, contraste cantidades y destinatario con la mercancía preparada. Un borrador reserva cantidades, pero todavía no incrementa la entrega. Tras confirmar, compruebe el seguimiento del pedido y conserve la copia del albarán que acompaña a la salida.</p>
          <p>El documento <b>valorado</b> muestra importes; el <b>no valorado</b> permite acompañar la mercancía sin mostrar precios. El correo de envío del albarán y la recogida son hechos distintos: enviar un PDF no registra una salida ni acredita que el cliente haya recibido la mercancía.</p>
          <p>Registre la recogida cuando el transportista retire la mercancía, con fecha, hora y transportista. Añada el justificante en <b>Fotografías y justificantes</b>. Si posteriormente recibe una prueba de entrega al cliente, puede archivarla también, distinguiéndola de la recogida.</p>
          <p>Si no puede generar otra entrega, revise las cantidades pendientes y los borradores existentes antes de crear un albarán manual. Un albarán manual sirve para una entrega sin pedido, no para superar cantidades comprometidas de un pedido.</p>
        </section>

        <section class="chapter" id="facturas-manuales">
          <h2>Nueva factura manual</h2>
          <p>En <b>Ventas → Facturas → Nueva factura manual</b>, selecciona un cliente activo con tarifa, indica la fecha, referencia y motivo, y añade artículos o servicios. Las condiciones del cliente se proponen automáticamente; revisa precios, descuentos, impuestos y retenciones antes de guardar.</p>
          <p>Se crea un <b>borrador</b> identificado como <b>Manual</b>, sin pedido ni albarán de origen. No registra entregas ni modifica cantidades de pedidos. Si la operación corresponde a un pedido existente, usa su circuito de facturación para evitar duplicidades.</p>
          <p>El borrador se abre en Facturas para editarlo, descartarlo o emitirlo mediante el circuito habitual de numeración, VeriFactu y cobros. Si se pierde la respuesta al guardar, <b>Reintentar misma operación</b> recupera la factura sin generar otra.</p>
                  <h3>Crear una factura sin documentos anteriores</h3>
          <ol><li>Entre en <b>Ventas → Facturas → Nueva factura manual</b>. Utilice esta opción únicamente si la venta no debe facturarse desde un pedido o albarán existente.</li><li>Seleccione un cliente activo con tarifa de venta configurada. Puede cambiar la tarifa y la forma de pago propuestas; se guardan en la factura sin modificar la ficha del cliente.</li><li>Indique fecha, referencia opcional y <b>motivo obligatorio</b>. El motivo explica por qué se crea una factura sin documentos de origen.</li><li>Añada artículos o servicios existentes y revise cantidades, precios y descuentos. El precio propuesto del artículo no garantiza que se haya aplicado una tarifa negociada.</li><li>Compruebe impuestos, posición fiscal, retención si corresponde, condiciones y total.</li><li>Guarde: se abre un <b>borrador Manual</b> en el detalle habitual. Guardar no asigna el número fiscal definitivo ni envía a VeriFactu.</li><li>Revise el vencimiento propuesto por la condición de cobro. Si necesita ajustarlo manualmente, indique el motivo desde el borrador. Después continúe con la emisión habitual.</li></ol>
          <p>Al pulsar <b>Añadir línea</b>, el formulario desplaza y enfoca la fila nueva. El cierre está a la derecha de la cabecera. Se propone la forma de pago del cliente y se avisa si falta o está inactiva. El formulario permite desplazarse verticalmente, muestra importes con separador de miles (1.234,56) y dedica la mitad del ancho a cada bloque de condiciones, con más altura. El alta ya no contiene Observaciones; conserva el motivo obligatorio en el historial.</p>
          <p>Al reabrir un borrador puede modificar fecha, condiciones, tarifa, forma de pago y datos económicos, además de descripción y motivo de sus conceptos manuales. Pulse <b>Guardar borrador</b> para conservarlos. La forma de pago recalcula el vencimiento salvo que sea manual. Las tarifas de un borrador conservan su moneda; no recalculan automáticamente precios ni convierten importes. Las facturas emitidas, pendientes de VeriFactu o con emisión sin confirmar siguen protegidas.</p>
          <p>La factura manual no registra entregas ni altera cantidades de pedidos o albaranes. Si la venta ya tiene origen, vuelva a su documento para facturar desde él y conservar el seguimiento.</p>
          <p>Si se pierde la respuesta al guardar, conserve el formulario y pulse <b>Reintentar misma operación</b>. Los campos quedan bloqueados para repetir exactamente la solicitud y recuperar la misma factura si ya se creó. No abra otra factura para resolver una respuesta incierta.</p>
        </section>

        <section id="facturas" class="chapter">
          <h2>Facturas de venta</h2>
          <p>La tarjeta <b>Facturas de venta</b> abre el listado de facturas reales. Los borradores creados desde pedidos, albaranes confirmados o mediante factura manual aparecen diferenciados de las facturas emitidas mediante su código provisional <b>DRAFT_FC</b> y su estilo visual.</p>
          <h3 id="facturas-listado">Listado y documentos de origen</h3>
          <p>El filtro <b>Situación</b> permite consultar borradores, emitidas, pendientes de cobro, cobradas y anuladas. La tabla muestra código, fecha, cliente, albaranes de origen, vencimiento, estado, situación del cobro e importe total.</p>
          <p>La factura también identifica los <b>pedidos de origen</b> cuando corresponde. La columna <b>Albaranes origen</b> muestra el primer albarán y, cuando existen varios, un indicador con el número total. Al pulsarlo se abre un diálogo con el cliente, código, fecha e importe de todos los albaranes vinculados.</p>
          <p>Dentro de la factura, cada albarán origen dispone de un botón de filtro. Al activarlo, la tabla muestra únicamente las líneas que proceden de ese albarán y resalta el origen seleccionado. <b>Conceptos manuales</b> filtra las líneas añadidas directamente al borrador y <b>Mostrar todas</b> elimina cualquier filtro. Estos filtros son únicamente visuales y no modifican la factura.</p>
          <h3 id="facturas-borrador">Preparar y guardar un borrador</h3>
          <p>La acción <b>Abrir factura</b> permite editar un borrador. Pueden modificarse la fecha, las condiciones de pago, las cantidades, los precios, los descuentos, los impuestos y las notas. Los importes se recalculan en tiempo real y se consolidan con <b>Guardar borrador</b>.</p>
          <h3>Añadir conceptos manuales</h3>
          <p>El botón <b>Añadir concepto</b> incorpora al borrador gastos o servicios que no representan mercancía entregada, como portes, embalajes, seguros o gastos de gestión. Es obligatorio seleccionar un producto o servicio del catálogo, indicar la descripción y justificar el motivo.</p>
          <ul>
            <li>El concepto se identifica visualmente como <b>Concepto manual</b>.</li>
            <li>No modifica cantidades de pedidos ni de albaranes.</li>
            <li>Puede eliminarse mientras la factura permanezca en borrador.</li>
            <li>El motivo queda registrado en las notas de la factura para conservar la trazabilidad.</li>
          </ul>
          <div class="warning"><i class="pi pi-exclamation-triangle"></i><span>No utilice un concepto manual para añadir mercancía física entregada. Esa mercancía debe proceder de un albarán o, cuando se habilite el flujo correspondiente, de una línea de facturación directa del pedido.</span></div>
          <p>Cuando la factura está emitida, sus datos fiscales y económicos quedan bloqueados y se presentan únicamente en modo consulta.</p>
          <h3 id="facturas-vencimiento">Cálculo del vencimiento</h3>
          <p>El vencimiento no se introduce manualmente. Se calcula a partir de la fecha de factura y de la configuración comercial del cliente:</p>
          <ol>
            <li>Se suman los días definidos en su condición de cobro.</li>
            <li>Si tiene días habituales de pago, se selecciona el siguiente día configurado que sea igual o posterior a la fecha resultante.</li>
            <li>Si no tiene días de pago configurados, se utiliza directamente la fecha resultante.</li>
          </ol>
          <p>Al cambiar la fecha del borrador, el vencimiento se recalcula en pantalla. Al guardar, el backend repite el cálculo para garantizar que el dato almacenado sea coherente.</p>
          <div class="note"><i class="pi pi-info-circle"></i><span>Ejemplo: factura del 28/08, condición a 30 días y cobros los días 5, 15 y 25. La fecha base es 27/09 y el siguiente día admitido es el 05/10.</span></div>
          <h3>Excepción manual del vencimiento</h3>
          <p>Mientras la factura permanezca en borrador, <b>Modificar vencimiento</b> permite sustituir excepcionalmente la fecha calculada. Es obligatorio indicar el nuevo vencimiento y justificar el motivo. La fecha elegida no puede ser anterior a la fecha de factura.</p>
          <p>El backend registra en las notas la fecha manual, la fecha que habría correspondido según la condición del cliente y el motivo indicado. El botón <b>Usar vencimiento calculado</b> elimina la excepción y recupera la regla comercial.</p>
          <div class="warning"><i class="pi pi-exclamation-triangle"></i><span>La modificación manual debe utilizarse solo para acuerdos excepcionales. En facturas emitidas el vencimiento queda bloqueado. Cuando se incorporen los permisos específicos de facturación, esta acción quedará reservada a los usuarios autorizados.</span></div>
          <h3 id="facturas-trazabilidad">Cantidades y trazabilidad del borrador</h3>
          <p>Las cantidades del circuito comercial tienen significados distintos y no deben confundirse:</p>
          <ul>
            <li><b>Pedido:</b> conserva la cantidad solicitada y su seguimiento de entrega.</li>
            <li><b>Albarán:</b> conserva la cantidad que realmente se ha entregado.</li>
            <li><b>Factura:</b> indica la cantidad que se pretende facturar o que finalmente se ha emitido.</li>
          </ul>
          <p>Modificar una cantidad en la factura borrador no cambia la cantidad entregada del albarán ni del pedido. El sistema valida el disponible de su origen, descontando otras facturas y reservas: cantidad pedida para facturación desde pedido y cantidad entregada para facturación desde albarán.</p>
          <h3 id="facturas-cobros">Cobros totales, parciales y reversión</h3>
          <p>En las opciones de la factura, abra <b>Cobros de la factura</b>. Se utiliza automáticamente el código del usuario conectado como autor de cobros y reversiones, sin pedir otra contraseña. Se comprueba que existe y está habilitado; los permisos específicos de cobro se incorporarán más adelante. El diálogo muestra total, importe cobrado, saldo pendiente e historial. Registre fecha, importe, medio, referencia y observaciones. Sólo admite facturas emitidas no anuladas, importes positivos de hasta dos decimales y fechas no futuras.</p>
          <p>Una factura de 1.000 € con un cobro de 400 € queda <b>Parcialmente cobrada</b>, con 600 € pendientes. No se puede superar el saldo. Si falla la conexión, utilice <b>Comprobar / reintentar</b> para repetir la misma operación sin duplicarla.</p>
          <p>El clip de cada movimiento permite añadir un justificante opcional después de guardarlo. <b>Revertir cobro</b> exige un motivo, conserva el movimiento y registra usuario y fecha de la reversión. Las facturas que ya figuraban cobradas sin movimientos muestran un saldo previo, sin inventar fecha o medio ni permitir revertirlo.</p>
          <p>El filtro <b>Parcialmente cobradas</b> permite localizar cobros incompletos. El widget <b>Importe cobrado</b> incluye cobros parciales y saldos previos de las facturas emitidas del año seleccionado; no es un resumen por fecha bancaria del cobro. El pendiente muestra sólo el saldo restante. Registrar o revertir no cambia líneas, cantidades, número, PDF, pedidos, albaranes ni VeriFactu.</p>
          <p>El flujo básico termina en el cobro. Rectificativas, abonos, envío de facturas por correo, remesas, conciliación y gestión de impagados son ampliaciones pendientes.</p>
          <h3 id="facturas-limitaciones">Emisión y VeriFactu</h3>
          <h4>Validar los datos fiscales antes de emitir</h4>
          <ol>
            <li>Pulse <b>Emitir factura</b>: se guarda el borrador y se revisan sus datos actuales.</li>
            <li>Si hay errores, se muestran juntos y con su ubicación. Corrija los datos del emisor en <b>Configuración → Datos de empresa</b> y los del destinatario en <b>Ventas → Entidades → ficha del cliente</b>.</li>
            <li>Revise NIF, nombre o razón social, domicilio, municipio, código postal y país del cliente. En España se comprueban también provincia y formato del código postal. El emisor está configurado para España.</li>
            <li>Tras corregir las fichas, vuelva a abrir la emisión o pulse <b>Volver a comprobar</b> si ha utilizado otra ventana.</li>
            <li>Cuando la comprobación sea correcta, introduzca la contraseña del certificado y pulse <b>Emitir y enviar</b>. El servidor repite la validación antes de reservar número.</li>
          </ol>
          <p>Si faltan datos o son incorrectos, la factura sigue siendo borrador: <b>no se asigna número, no se genera el PDF definitivo ni se prepara el envío</b>. También se revisan cantidades, descripciones, impuestos, descuentos y totales.</p>
          <p>Se comprueba el control de DNI, NIE y NIF de entidades españolas, y la estructura de los NIF especiales K/L/M. Para NIF-IVA franceses se comprueba la clave numérica o la estructura de la clave alfanumérica. Los identificadores extranjeros aún no soportados se advierten antes de emitir. El domicilio del cliente se incluye en el PDF y su país real se conserva en el XML.</p>
          <p>Esta revisión <b>no consulta el censo de la AEAT ni VIES</b> y no decide el tratamiento fiscal de una operación internacional. Describe el circuito actual de factura ordinaria con destinatario identificado.</p>
          <p>En el listado, los filtros <b>Situación</b> y <b>VeriFactu</b> muestran etiquetas de color y se pueden combinar. <b>Pendientes de cobro</b> selecciona facturas con saldo pendiente, incluidos cobros parciales y excluyendo borradores y anuladas; puede combinarse con <b>Aceptada</b> para revisar el cobro de las facturas aceptadas en VeriFactu. <b>Pendiente de envío</b> incluye las facturas en cola y en procesamiento. Cada filtro puede limpiarse por separado. Estos filtros acotan el listado, no los widgets de resumen.</p>
          <h4>Requerimientos y documentación AEAT</h4>
          <p>Desde el menú general del listado de Facturas, abre <b>Requerimientos y documentación AEAT</b>. En <b>Nuevo expediente</b>, indica la referencia de la notificación, el periodo de fechas de las facturas y, opcionalmente, el plazo de respuesta y las observaciones. Busca y selecciona solo las facturas solicitadas. Cada expediente admite hasta 500 facturas y 100 MB.</p>
          <p><b>Preparar y archivar expediente</b> guarda un ZIP en el repositorio documental, con los PDF archivados, el texto XML conservado de las peticiones y respuestas, un índice JSON con fechas y encadenamiento y un fichero de instrucciones y advertencias. No se regeneran facturas ni huellas fiscales. Los estados corresponden al momento de preparación; la selección puede no cubrir toda la cadena. Las sumas SHA-256 del expediente sirven para comprobar sus archivos y no son las huellas fiscales de VeriFactu.</p>
          <p>En <b>Expedientes preparados</b> puedes consultar las advertencias y descargar exactamente la copia archivada. Adjunta por separado la notificación recibida y el justificante de presentación (PDF de hasta 15 MB). Estos documentos no modifican el ZIP y no se sobrescriben. La falta de PDF, petición o respuesta se advierte; que no haya advertencias no certifica la integridad de la cadena ni el cumplimiento del requerimiento.</p>
          <p><b>No se envía nada a la AEAT desde esta opción.</b> El expediente es una ayuda de preparación, no un formato oficial. Revisa el procedimiento, alcance y plazo indicados en la notificación. Adjuntar el justificante deja constancia documental local, pero no verifica su presentación ante Hacienda.</p>
          <h4>Emisión, consulta e impresión</h4>
          <p>En las opciones del listado, <b>Ver / Imprimir factura</b> abre el PDF archivado con VeriFactu en una pestaña del navegador, desde la que puede imprimirse o descargarse. La opción se habilita cuando el estado es <b>Aceptada</b>. Se recupera el documento guardado, sin regenerarlo ni asignar otro número.</p>
          <p>Al pulsar <b>Emitir y enviar</b>, se desactiva la confirmación mientras el servidor guarda y prepara la emisión. En cuanto confirma que la factura está emitida y en cola, se cierran los diálogos y puede seguir trabajando: <b>la aplicación no espera la respuesta de VeriFactu ni muestra un bloqueo general</b>. Consulte el resultado en el listado o en <b>Cola VeriFactu</b>, que se actualizan periódicamente.</p>
          <p>La factura emitida permanece de solo lectura y no se puede volver a emitir. Mientras esté pendiente o en procesamiento tampoco se permite reintentar el envío ni modificar notas o documentos desde esta pantalla. Si se pierde la respuesta de emisión, la factura se mantiene protegida incluso al salir y volver a entrar en el módulo. Abra su detalle y pulse <b>Comprobar estado</b>; si el servidor aún no confirma el resultado, contacte con el administrador antes de realizar otra operación. No cree una factura sustituta.</p>
          <p><b>Emitir factura</b> guarda el borrador, valida cantidades y totales, asigna el número fiscal definitivo y archiva una copia PDF creada con la plantilla corporativa del circuito de ventas. La cola VeriFactu recupera ese mismo documento del repositorio y no guarda otra copia en la base de datos. Para iniciar el envío automático se solicita la contraseña del certificado VeriFactu asignado al usuario.</p>
          <p>El listado diferencia los estados <b>Pendiente de envío</b>, <b>Aceptada</b>, <b>Aceptada con errores</b> y <b>Rechazada</b>. Los fallos temporales se reintentan automáticamente. La opción <b>Reintentar envío VeriFactu</b> vuelve a usar el mismo registro, la misma factura y el mismo número fiscal.</p>
          <p>Una factura numerada nunca vuelve a borrador y solo puede enviarse al cliente cuando VeriFactu figure como <b>Aceptada</b>. Los errores técnicos se reintentan según los parámetros configurados; la espera predeterminada es de 10 minutos. Un rechazo de datos pasa a <b>Requiere corrección</b>; tras corregir el dato maestro, <b>Subsanar VeriFactu</b> conserva el documento original y genera un nuevo registro de subsanación con motivo obligatorio.</p>
          <p><b>Ventas → Ajustes de Ventas</b> separa los <b>Parámetros generales</b> —condiciones de venta, correo de presupuestos, recordatorio diario y plazos de entrega— de los <b>Parámetros VeriFactu</b>, donde se controla su activación, envío automático, reintentos y código QR. El entorno permanece limitado a <b>PRUEBAS</b>; los certificados y sus contraseñas no se guardan en este formulario.</p>
          <p>El panel plegable <b>Cola VeriFactu</b> muestra todas las facturas pendientes de envío, todas las que requieren atención y las últimas aceptadas. El número de aceptadas visibles se configura en <b>Ventas → Ajustes de Ventas → Parámetros VeriFactu</b>. La animación azul identifica trabajos en espera, el visto verde confirma la aceptación y el icono rojo abre el detalle devuelto por la AEAT.</p>
          <p><b>Consultar AEAT</b> permite contrastar los registros existentes en el sistema de la Agencia Tributaria por año y mes. La consulta utiliza el certificado VeriFactu del usuario y solicita su contraseña en cada ocasión; la contraseña no se conserva.</p>
          <p>El panel <b>Encadenamiento VeriFactu</b> presenta las 20 últimas facturas, su huella y la huella del registro anterior. La primera factura de una cadena se identifica mediante <b>PrimerRegistro = S</b>. Cada intento conserva de forma independiente la request enviada y la response recibida, incluso cuando el registro es rechazado, para disponer de evidencias ante revisiones o inspecciones tributarias.</p>
          <p>Al emitir una factura, sus cantidades pasan a considerarse facturadas en los pedidos origen. Si toda la entrega y facturación están completas, el pedido queda <b>Completado</b>. La respuesta de VeriFactu se controla por separado; el cobro también es posterior e independiente y no mantiene cantidades pendientes de facturar.</p>
          <p>En <b>Parámetros generales → Numeración de facturas</b> se configura el prefijo de serie. Por ejemplo, <b>KW</b> genera <b>FC-KW-2026/0001</b>. Solo afecta a nuevas emisiones y permite separar ciclos de prueba sin renumerar facturas existentes.</p>
          <div class="warning"><i class="pi pi-exclamation-triangle"></i><span>Una factura emitida nunca se renumera ni vuelve a borrador por un error de comunicación. Las correcciones económicas posteriores deben realizarse mediante factura rectificativa.</span></div>
          <p>El panel anual de facturación resume borradores, facturas emitidas, cobradas, pendientes, vencidas y anuladas. Incluye la evolución mensual del importe emitido y los cinco clientes con mayor facturación.</p>
          <div class="note"><i class="pi pi-info-circle"></i><span>La contraseña del certificado se cifra antes de incorporarse a la cola y no se devuelve al navegador ni aparece en los listados.</span></div>
                  <h3>Registrar un cobro y comprobar su resultado</h3>
          <ol><li>Localice la factura emitida y abra <b>Cobros de la factura</b>. Compruebe código, cliente, total y saldo pendiente.</li><li>Indique la fecha real del cobro, sin fecha futura, y el importe recibido, positivo y con un máximo de dos decimales. No puede superar el saldo pendiente.</li><li>Complete medio de cobro, referencia y observaciones según el movimiento que está registrando. El autor se obtiene del usuario conectado.</li><li>Guarde y compruebe que el movimiento aparece en el historial y que se ha reducido el pendiente.</li><li>Si tiene un justificante, adjúntelo desde el clip del movimiento ya guardado. No se exige adjunto para registrar el cobro.</li></ol>
          <p>Registrar un cobro deja constancia de un pago recibido; <b>no realiza una transferencia ni cobra dinero al cliente</b>. Por ejemplo, una factura de 1.000 € con pagos de 400 € y 600 € pasa de parcialmente cobrada a cobrada cuando su saldo llega a cero.</p>
          <h3>Corregir un cobro o recuperar una respuesta</h3>
          <p>Si el movimiento es erróneo, seleccione <b>Revertir cobro</b> e indique el motivo. Compruebe después que aumenta el saldo pendiente. El movimiento original y su reversión permanecen en el historial; no se borra la evidencia. Si corresponde, registre a continuación el cobro correcto.</p>
          <p>Ante una respuesta incierta, utilice <b>Comprobar / reintentar</b> y revise el historial antes de introducir otro pago. Un <b>Saldo previo</b> de una factura antigua no es un movimiento nuevo: no dispone de una fecha o medio reconstruidos y no puede revertirse desde este historial.</p>
          <p>El cierre comercial del pedido, el resultado de VeriFactu y el cobro son seguimientos independientes. Cobrar o revertir no cambia el número fiscal, el PDF, las cantidades ni los documentos de origen.</p>
        </section>

        <section id="albaranes-impresion">
          <h2>Impresión de albaranes</h2>
          <p>Puede obtenerse un albarán <b>valorado</b> o <b>no valorado</b>. En documentos confirmados se conserva la versión histórica para garantizar que futuras modificaciones de artículos o precios no alteren el documento emitido.</p>
          <ul>
            <li>Los borradores pueden modificarse y su impresión se actualiza.</li>
            <li>Los confirmados se recuperan del histórico si ya fueron generados.</li>
            <li>Los albaranes anulados no pueden imprimirse.</li>
          </ul>
        </section>

        <section id="configuracion"><h2>Configuración y proformas</h2><h3>Proforma: consultar una previsión</h3>
          <p>Desde un pedido confirmado, genere la proforma cuando necesite presentar el contenido previsto de la operación. Si existen proformas, <b>Ver proformas</b> permite consultar y descargar sus PDF. Compruebe la <b>Fecha prevista de entrega</b> que se muestra.</p>
          <p>La proforma no sustituye a la factura definitiva. Su generación no debe interpretarse como emisión fiscal, entrega de mercancía ni registro de cobro.</p>
          <h3>Configuración antes de comenzar</h3>
          <ol><li>Un administrador debe revisar los datos de empresa y usuarios en <b>Configuración / Ajustes</b>.</li><li>En <b>Datos maestros</b>, compruebe impuestos, familias de productos y certificados digitales. Al volver desde estas pantallas se mantiene la pestaña Datos maestros.</li><li>En <b>Ventas → Ajustes de Ventas → Parámetros generales</b>, revise condiciones de venta, correo de presupuestos y prefijo de numeración de facturas.</li><li>En <b>Parámetros VeriFactu</b>, revise activación, envío automático y reintentos. El entorno documentado permanece limitado a pruebas. Los certificados y contraseñas no se guardan en este formulario.</li><li>Si falta una opción recién incorporada o aparece un error de instalación, solicite al administrador que compruebe las versiones y actualizaciones de base de datos. No intente resolverlo duplicando documentos.</li></ol>
          <p>Un cambio de prefijo solo afecta a nuevas emisiones; no renumera documentos existentes. Las condiciones generales y las particulares del cliente se copian a los documentos para conservar el contenido utilizado en cada operación.</p></section>
        <section id="estados">
          <h2>Estados principales</h2>
          <div class="state-grid">
            <div><span class="dot draft"></span><b>Borrador</b><p>Editable; todavía no afecta a las cantidades entregadas.</p></div>
            <div><span class="dot confirmed"></span><b>Confirmado</b><p>Entrega contabilizada y documento operativo consolidado.</p></div>
            <div><span class="dot cancelled"></span><b>Anulado</b><p>Revierte la entrega y libera nuevamente las cantidades del pedido.</p></div>
          </div>
                  <h3>Distinguir cada seguimiento</h3>
          <table class="manual-table"><thead><tr><th scope="col">Seguimiento</th><th scope="col">Pregunta que responde</th><th scope="col">Qué no significa</th></tr></thead><tbody><tr><td>Estado del pedido</td><td>¿Queda entrega o facturación por resolver?</td><td>Completado no significa cobrado</td></tr><tr><td>Estado del albarán</td><td>¿La salida está preparada, confirmada o anulada?</td><td>Borrador no equivale a entregado</td></tr><tr><td>Estado de la factura</td><td>¿Es borrador o ya tiene emisión definitiva?</td><td>Emitida no equivale a aceptada en VeriFactu</td></tr><tr><td>Estado VeriFactu</td><td>¿Qué resultado tiene el envío del registro?</td><td>Aceptada no equivale a cobrada</td></tr><tr><td>Situación de cobro</td><td>¿Cuánto se ha recibido y cuánto falta?</td><td>Vencida no equivale a anulada</td></tr></tbody></table>
          <p>Si hay un error de comunicación durante la emisión, consulte la factura y su cola antes de volver a actuar. No emita otra factura para sustituir una cuya respuesta sigue pendiente. Si necesita una corrección económica de una factura emitida, no la edite como borrador: consulte al responsable, ya que el circuito de rectificativas sigue pendiente.</p>
        </section>

        <footer class="manual-footer">
          <span>KiwiK ERP · Manual de usuario</span>
          <img :src="corporateLogo" alt="Desarrollado por FreeLandSite" />
        </footer>
      </article>
    </div>
  </main>
</template>

<script setup lang="ts">
import corporateLogo from '@/assets/logos/corporate.png';
import kiwikLogo from '@/assets/logos/LogTras.png';
import loginScreenshot from '../../../docs/manual-usuario/imagenes/iniciar-sesion.png';
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/Frm_Main');
  }
};
</script>

<style scoped>
.manual-page { min-height: calc(100vh - 145px); padding: 26px clamp(18px, 3vw, 48px) 90px; color: #374151; background: #f7f8f4; scroll-behavior: smooth; }
.manual-hero { position: relative; display: flex; align-items: center; gap: 24px; padding: 28px 34px; overflow: hidden; background: white; border: 1px solid #e5e7eb; border-top: 4px solid #9cc10a; border-radius: 12px; box-shadow: 0 5px 20px rgba(30, 41, 59, .06); }
.back-button { display: inline-flex; align-items: center; gap: 7px; align-self: flex-start; padding: 8px 13px; color: #648506; background: #f4f8e8; border: 1px solid #dbe8b2; border-radius: 7px; font: inherit; font-size: .88rem; font-weight: 700; cursor: pointer; transition: background-color .2s, border-color .2s; }
.back-button:hover { background: #eaf2d2; border-color: #9cc10a; }
.manual-icon { width: 88px; height: 88px; object-fit: contain; opacity: .9; }
.eyebrow { color: #648506; font-size: .76rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
h1 { margin: 4px 0 7px; color: #1f2937; font-size: clamp(1.55rem, 3vw, 2.25rem); }
.manual-hero p { margin: 0; color: #6b7280; }
.version { margin-left: auto; align-self: flex-start; padding: 7px 11px; white-space: nowrap; color: #648506; background: #f4f8e8; border-radius: 20px; font-size: .78rem; font-weight: 700; }
.manual-layout { display: grid; grid-template-columns: 225px minmax(0, 1fr); gap: 25px; max-width: 1380px; margin: 25px auto 0; }
.toc { position: sticky; top: 20px; align-self: start; display: flex; max-height: calc(100vh - 40px); overflow-y: auto; flex-direction: column; gap: 10px; padding: 20px; background: white; border: 1px solid #e5e7eb; border-radius: 10px; }
.toc strong { margin-bottom: 9px; color: #1f2937; }
.toc-group { display: flex; flex-direction: column; gap: 2px; padding-bottom: 7px; border-bottom: 1px solid #eef0f2; }
.toc-group:last-child { padding-bottom: 0; border-bottom: 0; }
.toc a { padding: 7px 9px; color: #6b7280; border-radius: 6px; text-decoration: none; }
.toc .toc-main { color: #374151; font-weight: 750; }
.toc .toc-sub { padding: 5px 9px 5px 23px; font-size: .82rem; }
.toc a:hover { color: #648506; background: #f4f8e8; }
.manual-content { padding: 10px 38px 0; background: white; border: 1px solid #e5e7eb; border-radius: 10px; }
.manual-content { min-width: 0; overflow-wrap: anywhere; }
.manual-figure { margin: 20px 0; padding: 12px; background: #fafbf8; border: 1px solid #e5e7eb; border-radius: 10px; }
.manual-figure img { display: block; width: 100%; max-height: 560px; object-fit: contain; }
.manual-figure a:focus-visible { display: block; outline: 3px solid #648506; outline-offset: 4px; }
.manual-figure figcaption { margin-top: 10px; color: #64748b; font-size: .88rem; line-height: 1.5; }
.manual-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: .92rem; }
.manual-table th, .manual-table td { padding: 10px; border: 1px solid #e5e7eb; text-align: left; vertical-align: top; line-height: 1.55; }
.manual-table th { background: #f4f8e8; color: #536d05; }
@media print {
  .manual-page { padding: 0; background: white; }
  .back-button, .toc { display: none; }
  .manual-layout { display: block; margin: 0; }
  .manual-content { padding: 0; border: 0; }
  .manual-hero { box-shadow: none; }
  .manual-figure, tr { break-inside: avoid; }
  h2, h3, h4 { break-after: avoid; }
}
section { padding: 28px 0; border-bottom: 1px solid #e5e7eb; scroll-margin-top: 20px; }
h2 { margin: 0 0 16px; color: #263238; font-size: 1.45rem; }
h2::before { content: ''; display: inline-block; width: 5px; height: 22px; margin-right: 10px; vertical-align: -3px; background: #9cc10a; border-radius: 4px; }
h3 { margin: 22px 0 8px; color: #4b5563; font-size: 1.05rem; scroll-margin-top: 20px; }
p, li { line-height: 1.72; }
.flow { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin: 20px 0; }
.flow span { padding: 10px 16px; color: #536d05; background: #f4f8e8; border: 1px solid #dbe8b2; border-radius: 7px; font-weight: 700; }
.flow i { color: #9cc10a; }
.note, .warning { display: flex; gap: 12px; align-items: flex-start; margin-top: 18px; padding: 14px 16px; border-radius: 7px; line-height: 1.55; }
.note { color: #475569; background: #f5f7fa; border-left: 4px solid #94a3b8; }
.warning { color: #66520a; background: #fff9e6; border-left: 4px solid #d6a912; }
.note i, .warning i { margin-top: 3px; }
.state-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.state-grid > div { padding: 18px; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; }
.state-grid p { margin: 8px 0 0; color: #6b7280; font-size: .9rem; }
.dot { display: inline-block; width: 10px; height: 10px; margin-right: 8px; border-radius: 50%; }
.draft { background: #94a3b8; }.confirmed { background: #65a30d; }.cancelled { background: #dc2626; }
.manual-footer { display: flex; align-items: center; justify-content: space-between; min-height: 76px; color: #9ca3af; font-size: .82rem; }
.manual-footer img { width: 175px; max-height: 52px; object-fit: contain; }
@media (max-width: 800px) {
  .manual-hero { align-items: flex-start; padding: 22px; }.manual-icon { width: 58px; height: 58px; }.version { display: none; }
  .manual-layout { grid-template-columns: 1fr; }.toc { position: static; max-height: none; }.toc strong { width: 100%; }.toc-group { width: 100%; }
  .manual-content { padding: 4px 20px 0; }.state-grid { grid-template-columns: 1fr; }.flow i { transform: rotate(90deg); }
}
</style>
