from reportlab.platypus import Paragraph, Image, Spacer, PageBreak, Flowable
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor

class CaptureCard(Flowable):
    def __init__(self,path,width=487,caption=''):
        Flowable.__init__(self)
        self.im=ImageReader(str(path));iw,ih=self.im.getSize()
        self.width=width;self.picture_height=(width-20)*ih/iw
        self.caption=caption;self.height=self.picture_height+38
    def draw(self):
        c=self.canv;c.saveState()
        c.setFillColor(HexColor('#EDEFF1'));c.roundRect(2,-2,self.width,self.height,8,fill=1,stroke=0)
        c.setFillColor(HexColor('#FFFFFF'));c.setStrokeColor(HexColor('#DEE3E8'));c.setLineWidth(.5)
        c.roundRect(0,0,self.width,self.height,8,fill=1,stroke=1)
        c.drawImage(self.im,10,28,self.width-20,self.picture_height,mask='auto')
        c.setFillColor(HexColor('#666666'));c.setFont('Regular',8)
        c.drawString(10,11,self.caption);c.restoreState()

def calendar_page(out,s):
    result=[Paragraph('Calendario comercial',s['h2'])]
    def p(t):result.append(Paragraph(t,s['text']))
    p('El calendario representa de forma dinámica y automática los eventos comerciales de la empresa. Se alimenta de las fechas y del estado de los documentos, sin necesidad de crear cada evento manualmente.')
    p('Incluye vencimientos de facturas, fechas previstas de entrega de pedidos y vencimientos de presupuestos pendientes de aprobación. Permite anticipar el seguimiento de cobros, entregas y ofertas que requieren atención.')
    result.append(CaptureCard(out/'imagenes/calendario-dia.png',130,'Día con eventos comerciales'))
    result.append(Spacer(1,14))
    p('Los distintivos de colores muestran el número de eventos de cada categoría en una fecha. En este ejemplo, el día 19 contiene un presupuesto, una entrega y un cobro. Los colores corresponden a la leyenda del calendario.')
    result.append(CaptureCard(out/'imagenes/calendario-detalle.png',280,'Detalle de los eventos del día seleccionado'))
    result.append(Spacer(1,14))
    p('Al seleccionar el día se abre su detalle, agrupado por categorías. Cada registro muestra la referencia del documento, la entidad y el importe. La flecha situada a la derecha permite acceder al documento relacionado; la X cierra el detalle.')
    p('La información depende de mantener actualizadas las fechas y los estados de los documentos de origen. El calendario facilita consultar los compromisos comerciales y reconocer qué está previsto o requiere seguimiento.')
    return result

class Menus(Flowable):
    def __init__(self,out):
        Flowable.__init__(self);self.out=out;self.width=487;self.height=190
    def draw(self):
        c=self.canv
        c.setFont('Bold',10)
        c.drawString(55,177,'Menú expandido');c.drawString(300,177,'Menú contraído')
        c.drawImage(str(self.out/'menu-expandido.png'),55,12,159,153,mask='auto')
        c.drawImage(str(self.out/'menu-contraido.png'),333,12,39,160,mask='auto')

def pages(out,s):
    result=[];assets=out/'imagenes'
    def p(text,style='text'):result.append(Paragraph(text,s[style]))
    def image(name,width):
        im=ImageReader(str(assets/name));w,h=im.getSize()
        result.append(Image(str(assets/name),width=width,height=width*h/w));result.append(Spacer(1,12))
    p('Navegar por las áreas de trabajo','h2')
    p('El menú lateral permite pasar de una zona a otra sin volver al Panel de control. En estas capturas aparecen Ventas, Reportes y Configuración.')
    result.append(Menus(assets));result.append(Spacer(1,14))
    p('Expandir o contraer el menú','h3')
    p('Pulsa la doble flecha de la parte superior. El menú expandido muestra los nombres y los iconos. Contraído, conserva los iconos y deja más espacio para los listados y formularios. Puedes volver a expandirlo cuando lo necesites.')
    p('Orientarse y acceder con rapidez','h3')
    p('El área seleccionada se resalta. Al situar el cursor sobre un icono del menú contraído, puedes consultar su nombre. Los accesos visibles dependen del perfil y los permisos; Configuración se presenta a los administradores.')
    p('La cabecera común','h3')
    p('La cabecera permanece disponible durante la navegación. Reúne la búsqueda de módulos, la campana de notificaciones, el acceso al perfil y la opción Salir. La búsqueda también se abre con Ctrl + K. Junto con el menú y los accesos recientes, ofrece varias formas de retomar el trabajo.')
    result.append(PageBreak())
    p('La campana y el centro de mensajes','h2')
    p('La campana abre el panel Notificaciones. Los mensajes recibidos dependen del tipo de aviso, de su configuración y de los destinatarios asignados según sus responsabilidades. No todos los usuarios reciben los mismos mensajes.')
    image('notificaciones.png',285)
    p('Consultar y localizar avisos','h3')
    p('El campo Filtrar notificaciones permite localizar mensajes. Cada tarjeta presenta un título, el detalle y la fecha y hora. Si incorpora un acceso relacionado, el icono situado a la derecha permite abrirlo. La X cierra el panel.')
    p('En el ejemplo aparecen avisos de copias de seguridad, preparación de documentos, entregas próximas, vencimientos y envío de facturas. Son mensajes de la captura, no resultados de pruebas realizadas para este manual.')
    result.append(PageBreak())
    p('Ventas y sus indicadores','h2')
    image('ventas.png',487)
    p('De la visión general al detalle','h3')
    p('Los widgets o KPI resumen la actividad del área en la que estás trabajando. En Ventas reúnen presupuestos abiertos, pedidos pendientes, facturas por cobrar y rectificativas. Dentro de Pedidos o Facturas, los indicadores se centran en las operaciones del módulo.')
    p('Para interpretar una cifra, revisa su etiqueta y los criterios indicados en la pantalla: no todas las tarjetas cuentan los mismos estados. Consulta después el listado y los documentos para conocer el detalle.')
    p('Datos maestros','h3')
    p('<b>Lista de precios:</b> tarifas y reglas comerciales. <b>Entidades:</b> clientes, proveedores, contactos y documentación. <b>Artículos y servicios:</b> catálogo utilizado en los documentos. Disponer de proveedores en Entidades no equivale a disponer de un circuito de Compras.')
    p('Operaciones de venta','h3')
    p('Presupuestos, Pedidos de venta, Albaranes de venta, Facturas de venta y Rectificativas organizan las etapas del circuito. Los vencimientos y cobros se consultan en el contexto de la facturación. La trazabilidad permite recorrer las relaciones entre documentos.')
    result.append(PageBreak())
    p('Informes y configuración comercial','h2')
    image('ventas-informes-ajustes.png',487)
    p('Reportes de Ventas','h3')
    p('Este acceso conduce a los reportes parametrizados. Cada reporte se identifica con un código RPT y ofrece sus propios criterios de consulta. La descripción de la tarjeta es orientativa; el catálogo disponible se consulta al entrar en Reportes.')
    p('Ajustes de Ventas','h3')
    p('Reúne parámetros propios del circuito comercial: numeración de facturas, condiciones generales, comunicaciones, plazos de pago, automatizaciones y parámetros de VeriFactu, incluidos aspectos del PDF y del código QR.')
    p('Configuración del sistema','h3')
    image('configuracion-sistema.png',487)
    p('La Configuración del menú lateral administra el entorno común: Empresa, Preferencias, Usuarios, Datos maestros, Inteligencia artificial y Salvaguarda de datos. Se diferencia de Ajustes de Ventas, que se centra en las reglas de la actividad comercial.')
    p('<b>Empresa:</b> identificación, imagen corporativa, datos de contacto y correo. <b>Preferencias:</b> parámetros generales de funcionamiento. <b>Usuarios:</b> administración de las cuentas de acceso.')
    p('<b>Datos maestros:</b> catálogos y datos auxiliares compartidos. <b>Inteligencia artificial:</b> configuración de los servicios de los asistentes. <b>Salvaguarda de datos:</b> opciones de copias de seguridad y protección documental.')
    p('Seguridad y herramientas de apoyo','h3')
    p('Los accesos se organizan mediante módulos, secciones y permisos. Otras herramientas, como los asistentes de consulta y las vistas de trazabilidad, se utilizan dentro de las pantallas donde son necesarias. Las opciones futuras o no habilitadas no forman parte de las operaciones descritas en esta edición.')
    return result
