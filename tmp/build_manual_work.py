from pathlib import Path
from html import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, Image
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader, PdfWriter
import pypdfium2 as pdfium
from manual_installation import installation_pages
from manual_company import company_page
from manual_diagrams import ManualDiagram
from manual_screens import pages as screen_pages, CaptureCard, calendar_page

out=Path('C:/Users/comer/Documents/Clientes/FreeLandSite/Documentacion/KiwiKERP Cloud/Manual de Usuario')
qa=Path('C:/Proyectos/KiwiKErpVue/tmp/manual-qa'); qa.mkdir(exist_ok=True)
for n,f in [('Regular','segoeui.ttf'),('Bold','segoeuib.ttf')]: pdfmetrics.registerFont(TTFont(n,'C:/Windows/Fonts/'+f))
outline='''Introducción a KiwiKERP
Presentación del sistema|Qué es KiwiKERP|Áreas de trabajo y módulos|El circuito de gestión comercial|Dónde se instala KiwiKERP
Cómo utilizar este manual|Organización de los contenidos|Convenciones, indicaciones y ejemplos|Funciones disponibles según permisos

Instalación y puesta en marcha
Modalidades de instalación|KiwiKERP Cloud|Instalación en infraestructura propia|Requisitos previos y datos necesarios
Asistente de instalación|Acceso al asistente y comprobaciones iniciales|Configuración de la instalación|Finalización y primer acceso
Configuración inicial de la empresa|Datos identificativos y fiscales|Usuario administrador y accesos|Preferencias, correo y datos maestros
Comprobación de la puesta en marcha|Revisión de la configuración pendiente|Comprobación de acceso a los módulos|Preparación para comenzar a trabajar

Acceso y entorno de trabajo
Acceso a la aplicación|Iniciar sesión|Sesión caducada y problemas de acceso|Cerrar sesión
Pantalla principal|Panel de inicio e indicadores|Menú de navegación y búsqueda de módulos|Perfil de usuario y notificaciones
Operaciones comunes|Buscar, filtrar y ordenar registros|Crear, consultar y modificar fichas|Campos obligatorios y mensajes de validación|Consultar, imprimir y descargar documentos

Datos maestros
Entidades y clientes|Consulta y alta de entidades|Datos identificativos, fiscales y de contacto|Condiciones comerciales del cliente
Artículos y servicios|Consulta y creación de artículos y servicios|Familias y clasificación|Unidades, precios e impuestos
Cuentas bancarias|Consulta y alta de cuentas|Identificación bancaria y titularidad|Modificación y disponibilidad de cuentas
Impuestos y datos auxiliares|Tipos impositivos|Datos auxiliares de las fichas|Uso de los datos maestros en documentos

Precios y condiciones comerciales
Listas de precios|Crear y consultar una lista de precios|Añadir y modificar reglas|Aplicación de tarifas al cliente
Condiciones de venta|Formas y plazos de pago|Descuentos y cálculo de importes|Monedas y tipos de cambio

Presupuestos
Preparación del presupuesto|Crear un presupuesto y seleccionar el cliente|Añadir artículos, servicios y condiciones|Revisar importes y guardar
Seguimiento del presupuesto|Estados y acciones disponibles|Emisión del documento y envío al cliente|Avisos de vencimiento y cancelación
Continuación del circuito comercial|Generar un pedido desde el presupuesto|Consultar los documentos relacionados|Utilizar el asistente de presupuestos

Pedidos de venta
Preparación del pedido|Crear un pedido o recibirlo desde un presupuesto|Revisar líneas y condiciones comerciales|Confirmar y consultar el estado del pedido
Entrega y facturación|Cantidades pedidas, entregadas y pendientes|Generar albaranes desde el pedido|Facturar desde el pedido y cerrar líneas
Seguimiento del pedido|Recordatorios y envío al cliente|Consultar la trazabilidad del pedido|Utilizar el asistente de pedidos

Albaranes y entregas
Preparación del albarán|Crear un albarán desde un pedido|Crear un albarán manual|Revisar líneas y cantidades
Gestión de entregas|Entregas completas y parciales|Confirmación y estados del albarán|Consulta de cantidades pendientes
Documentación y facturación|Consultar e imprimir el albarán|Facturar entregas y agrupar albaranes|Consultar pedidos y facturas relacionados

Facturas de venta
Creación de facturas|Facturar desde pedidos y albaranes|Crear una factura manual|Revisar líneas, impuestos y condiciones
Revisión y emisión|Guardar y modificar un borrador|Validar los datos fiscales|Emitir la factura y consultar su estado
Documentos y seguimiento|Descargar, imprimir y enviar la factura|Consultar el estado de envío a VeriFactu|Consultar la trazabilidad de la factura|Utilizar el asistente de facturas

Vencimientos y cobros
Seguimiento de vencimientos|Consultar fechas e importes pendientes|Identificar facturas vencidas|Gestionar recordatorios de pago
Registro de cobros|Registrar un cobro total|Registrar cobros parciales|Consultar el saldo pendiente y los justificantes
Revisión de movimientos|Consultar el historial de cobros|Revertir un cobro|Comprobar el estado de la factura

Facturas rectificativas
Preparación de la rectificativa|Identificar la factura que se rectifica|Seleccionar el tipo y motivo de rectificación|Revisar líneas e importes
Emisión y seguimiento|Guardar y revisar el borrador|Emitir y consultar el estado de envío|Consultar el documento y su relación con la factura original

VeriFactu
Introducción y funcionamiento|Qué es VeriFactu y cómo se integra en KiwiKERP|Diferencia entre emitir una factura y enviar su registro|Entornos de pruebas y producción
Configuración previa|Datos fiscales del emisor|Certificado electrónico y autorizaciones|Configuración y comprobaciones de conexión
Envío de registros de facturación|Generación del registro al emitir una factura|Seguimiento de los envíos y sus estados|Consulta de respuestas y justificantes
Documentos y trazabilidad|Información VeriFactu y código QR de la factura|Relación entre factura, registro y respuesta|Facturas rectificativas y registros asociados
Incidencias y comprobaciones|Envíos pendientes y errores de comunicación|Rechazos y revisión de los datos|Reintentos y comprobación del resultado

Consultas e informes
Información comercial|Consultar indicadores de ventas|Aplicar filtros y periodos|Interpretar importes y monedas
Trazabilidad documental|Recorrer el circuito desde el presupuesto hasta el cobro|Consultar relaciones y operaciones parciales|Identificar documentos creados manualmente
Asistentes de consulta|Formular preguntas sobre la información comercial|Interpretar respuestas y comprobar documentos|Alcance y limitaciones de los asistentes

Configuración y administración
Empresa y preferencias|Datos de empresa e imagen corporativa|Preferencias generales del sistema|Configuración del correo y prueba de conexión
Usuarios y seguridad|Tipos de usuario: Administrador y Usuario|Listado, búsqueda y navegación|Alta de usuarios y datos identificativos|Fotografía y perfil del usuario|Rol o grupo y estado activo|Contraseña y modificación de usuarios|Historial de conexiones|Seguridad y permisos por usuario|Borrado de usuarios y confirmación|Actualización del listado y exportación a Excel|Gestión de certificados y usuarios autorizados
Configuración de ventas|Condiciones y plazos de pago|Automatizaciones de presupuestos|Recordatorios de facturas
Inteligencia artificial|Configuración del proveedor y del modelo|Disponibilidad de los asistentes|Comprobación de la configuración
Salvaguarda de datos|Configuración de copias de seguridad|Salvaguarda de documentos|Consulta de resultados e incidencias

Ayuda y resolución de incidencias
Incidencias habituales|No puedo acceder a la aplicación|No encuentro una opción o un documento|No puedo guardar, confirmar o emitir
Comprobaciones y soporte|Interpretar avisos y errores|Revisar estados antes de repetir una operación|Preparar la información para solicitar ayuda
Glosario|Términos comerciales|Términos de facturación y cobro|Estados y conceptos utilizados en KiwiKERP'''

outline=outline.replace('Consultas e informes\n', '''Tareas y seguimiento del trabajo
Entorno de Tareas|Acceso e indicadores del módulo|Tablero Kanban y estados|Filtros y consulta de tareas
Creación y asignación|Nombre y descripción del trabajo|Cliente, contacto y responsable|Prioridad, fechas y horas estimadas
Planificación y progreso|Vista Gantt|Seguimiento del avance|Finalizar o descartar una tarea
Colaboración y documentación|Comentarios y seguimiento|Documentos adjuntos|Relación con las solicitudes del Portal CRM
Horas y facturación|Registro del tiempo trabajado|Trabajo facturable y precio por hora|Pendientes de facturación|Consulta de facturas vinculadas

Portal CRM para clientes externos
Acceso al Portal del Cliente|Contactos y habilitación del acceso|Solicitud del enlace por correo|Inicio, caducidad y cierre de sesión
Entorno del portal|Panel de inicio e indicadores|Menú lateral y accesos directos|Información disponible para el contacto
Gestión de tareas del cliente|Consultar el tablero y filtrar tareas|Crear una nueva tarea|Consultar estado, prioridad y fechas
Comunicación y documentos|Consultar y enviar comentarios|Adjuntar y descargar documentos|Gestión de documentos según permisos
Notificaciones del portal|Consultar y filtrar avisos|Acceder a la tarea relacionada|Marcar mensajes como leídos

Consultas e informes
''')
outline=outline.replace('Pantalla principal|Panel de inicio e indicadores|Menú de navegación y búsqueda de módulos|Perfil de usuario y notificaciones', 'Pantalla principal|Panel de inicio y Estado de la empresa|Cabecera y búsqueda de módulos|Menú lateral expandido y contraído|Perfil de usuario\nWidgets e indicadores KPI|Visión general de la actividad|Indicadores de Ventas|Indicadores específicos de cada módulo\nCalendario comercial|Eventos generados automáticamente|Categorías, colores y contadores|Consulta del detalle del día\nMensajes y notificaciones|Campana y centro de mensajes|Relación con el calendario comercial|Destinatarios y marcado de lectura')
outline=outline.replace('Qué es KiwiKERP|Áreas de trabajo y módulos', 'Qué es KiwiKERP|Áreas de trabajo y módulos')
body='''# 1. Introducción a KiwiKERP
## 1.1. Presentación del sistema
### 1.1.1. Qué es KiwiKERP
KiwiKERP es una aplicación de gestión empresarial que reúne los datos de clientes, artículos y servicios y las operaciones del circuito comercial. Este manual explica cómo acceder a la aplicación, preparar la información necesaria y trabajar con los documentos de venta.
### 1.1.2. Áreas de trabajo y módulos
El entorno de trabajo incluye el panel de inicio, los datos maestros y los módulos de ventas. La configuración del sistema permite administrar la empresa, los usuarios y las preferencias. Las opciones visibles dependen de los permisos del usuario y de la configuración de la instalación.
### 1.1.3. El circuito de gestión comercial
El recorrido comercial puede comenzar en un presupuesto y continuar con un pedido, sus entregas, la facturación y el registro de cobros. Cada documento tiene una finalidad distinta. Una entrega parcial o un cobro parcial no equivalen a completar toda la operación.
La trazabilidad permite consultar las relaciones entre documentos. Los documentos creados manualmente no tienen necesariamente un presupuesto, pedido o albarán de origen.
## 1.2. Cómo utilizar este manual
### 1.2.1. Organización de los contenidos
Los primeros capítulos presentan la instalación y el entorno de trabajo. A continuación se describen los datos maestros y las operaciones comerciales. Los capítulos finales reúnen las consultas, la configuración y la resolución de incidencias.
### 1.2.2. Convenciones, indicaciones y ejemplos
Los procedimientos se organizan por objetivo, acceso, pasos y resultado esperado. Los nombres de botones y campos se reproducen tal como aparecen en la aplicación. Los ejemplos que se incorporen utilizarán datos ficticios identificados como tales.
### 1.2.3. Funciones disponibles según permisos
Si una opción no aparece, consulta con el administrador si tu usuario tiene acceso a ella. La ausencia de una opción no implica necesariamente que exista un error. Antes de repetir una operación, revisa el estado del documento y los mensajes mostrados.

# 2. Instalación y puesta en marcha
## 2.2. Asistente de instalación
### 2.2.1. Acceso al asistente y comprobaciones iniciales
Objetivo: preparar una nueva instalación y crear el primer usuario administrador.
Acceso: abre la dirección de KiwiKERP facilitada para tu instalación. Cuando la aplicación detecta que es necesario completar la instalación, muestra el asistente de puesta en marcha.
El asistente presenta cuatro pasos: Preparación, Tu empresa, Administrador y Confirmación. En Preparación se muestran las comprobaciones del entorno. Si alguna comprobación falla, revisa el mensaje y utiliza Reintentar comprobaciones después de resolver la causa.
### 2.2.2. Configuración de la instalación
1. Pulsa Continuar para acceder a Tu empresa.
2. Introduce la razón social, el NIF/CIF, el correo electrónico y los datos de dirección solicitados. Puedes añadir el nombre comercial, el teléfono, el eslogan y el logotipo.
3. Pulsa Continuar para acceder a Administrador.
4. Introduce el nombre y apellidos, el usuario y el correo electrónico del primer administrador. Escribe la contraseña y repítela en Repetir contraseña.
5. Comprueba que las contraseñas coinciden y continúa hasta Confirmación.
### 2.2.3. Finalización y primer acceso
Revisa el resumen antes de pulsar Finalizar instalación. Usa Atrás si necesitas corregir datos. Cuando la instalación finaliza correctamente, la aplicación dirige al inicio de sesión.
Resultado esperado: puedes acceder con la cuenta de administrador creada y continuar la configuración de la empresa.
Importante: si se detecta una base de datos existente y aparece una opción para recrearla, detén este procedimiento y solicita la revisión del responsable de la instalación. Esa acción no forma parte del alta ordinaria descrita aquí.

# 3. Acceso y entorno de trabajo
## 3.1. Acceso a la aplicación
### 3.1.1. Iniciar sesión
Objetivo: acceder al espacio de trabajo de tu empresa con una cuenta habilitada.
Acceso: abre en el navegador la dirección de KiwiKERP correspondiente a tu empresa.
[[login]]
1. Comprueba que la pantalla de acceso corresponde a la empresa con la que deseas trabajar.
2. Escribe tu identificador en Usuario.
3. Introduce tu Contraseña. El control del campo permite mostrar u ocultar su contenido.
4. Pulsa Acceder a KiwiKERP y espera la respuesta.
Resultado esperado: se accede a KiwiKERP. Si la configuración inicial está pendiente, aparece el aviso Completa la configuración inicial, explicado a continuación.
Si dejas alguno de los dos campos vacío, aparece Campos incompletos y el mensaje Usuario y contraseña son requeridos. Completa ambos campos antes de volver a acceder.
[[firstaccess]]
[[company]]
[[users]]
### 3.1.2. Sesión caducada y problemas de acceso
Si aparece Usuario o contraseña inválidos, revisa ambos datos y vuelve a intentarlo. La opción ¿Has olvidado tu contraseña? abre el formulario de recuperación.
Si la aplicación te devuelve al inicio de sesión, vuelve a identificarte. Si muestra un problema de conexión o de disponibilidad del servicio, conserva el mensaje para comunicarlo al responsable de la instalación.
### 3.1.3. Cerrar sesión
Utiliza la opción Salir situada en la cabecera de la aplicación cuando termines de trabajar. Guarda previamente los cambios que quieras conservar. Para continuar trabajando después de salir, vuelve a iniciar sesión.
'''
body=body.replace('### 1.1.2. Áreas de trabajo y módulos','''KiwiKERP está dirigido principalmente a pequeñas y medianas empresas y profesionales autónomos que venden productos, prestan servicios o combinan ambas actividades. Su enfoque actual resulta adecuado para empresas comerciales y distribuidoras, profesionales de servicios, instaladores, empresas de mantenimiento y pequeños talleres que necesitan organizar su gestión comercial.
Esta edición se centra en Ventas: preparar presupuestos, gestionar pedidos, documentar entregas, emitir facturas, registrar cobros y consultar su trazabilidad. La cobertura de procesos especializados, como planificación de producción o gestión avanzada de taller, se evaluará por separado.
Una solución adaptable a cada empresa
KiwiKERP no es un producto cerrado. Parte de una base estándar para las necesidades habituales de gestión y puede adaptarse a los procesos específicos de cada cliente. FreeLandSite analiza la operativa y, cuando es necesario, desarrolla funcionalidades e integraciones a medida manteniendo un núcleo común, estable y actualizable.
La solución puede evolucionar por etapas. Las adaptaciones requieren definir su alcance; sus instrucciones se incorporarán a apartados o anexos específicos de cada instalación.
[[adapt]]
### 1.1.2. Áreas de trabajo y módulos''')
body=body.replace('## 1.2. Cómo utilizar este manual','''### 1.1.4. Dónde se instala KiwiKERP
KiwiKERP puede instalarse en un servidor del cliente o en la nube gestionada por FreeLandSite. Ambas modalidades permiten trabajar desde el navegador. La diferencia principal está en dónde se alojan la aplicación y los datos y quién administra la infraestructura.
[[infra]]
En el servidor del cliente
Esta modalidad está dirigida a empresas que prefieren mantener sus datos en su propia infraestructura. La instalación dedicada se realiza directamente sobre Windows, sin Docker. Debe acordarse quién mantiene los servicios, aplica las actualizaciones y supervisa las copias de seguridad.
En la nube de FreeLandSite
El cliente no necesita comprar equipos dedicados, mantener un servidor encendido ni administrar su infraestructura. FreeLandSite gestiona el alojamiento, las actualizaciones, las copias de seguridad y la monitorización. Cada cliente dispone de una instancia y una base de datos independientes.
Para trabajar basta con un dispositivo con navegador, conexión a Internet y una cuenta de acceso. Es una opción práctica para fontaneros, mecánicos, instaladores y otros profesionales que necesitan gestionar su negocio sin conocimientos informáticos especializados.
Una vez activado el entorno, el usuario puede completar los datos básicos y comenzar a trabajar. La preparación de artículos, tarifas y otros datos dependerá de cada negocio.
## 1.2. Cómo utilizar este manual''')
body=body.replace('### 1.1.3. El circuito de gestión comercial','''[[panel]]
### 1.1.3. El circuito de gestión comercial''')
start=body.index('# 2. Instalación y puesta en marcha')
end=body.index('# 3. Acceso y entorno de trabajo',start)
body=body[:start]+'[[installation]]\n\n'+body[end:]
outline=outline.replace('Asistente de instalación|Acceso al asistente y comprobaciones iniciales|Configuración de la instalación|Finalización y primer acceso','Solicitud de prueba en la nube|Acceder a la solicitud|Completar los datos de contacto|Confirmación de la solicitud|Recibir el acceso al entorno\nAsistente de instalación|Preparación del entorno|Datos de la empresa|Primer administrador|Confirmación previa a la instalación')
styles={
'text':ParagraphStyle('text',fontName='Regular',fontSize=10.5,leading=15.5,spaceAfter=9,textColor=HexColor('#2B2B2B')),
'h1':ParagraphStyle('h1',fontName='Bold',fontSize=23,leading=29,spaceAfter=20,textColor=HexColor('#9CC10A')),
'h2':ParagraphStyle('h2',fontName='Bold',fontSize=15,leading=20,spaceBefore=12,spaceAfter=10,keepWithNext=True),
'h3':ParagraphStyle('h3',fontName='Bold',fontSize=11.5,leading=16,spaceBefore=10,spaceAfter=6,keepWithNext=True),
'i1':ParagraphStyle('i1',fontName='Bold',fontSize=12,leading=17,spaceBefore=10,spaceAfter=5,keepWithNext=True,textColor=HexColor('#9CC10A')),
'i2':ParagraphStyle('i2',fontName='Bold',fontSize=10,leading=14,leftIndent=12,spaceBefore=5,spaceAfter=3,keepWithNext=True),
'i3':ParagraphStyle('i3',fontName='Regular',fontSize=9.5,leading=13,leftIndent=25,spaceAfter=2)}
story=[Paragraph('Índice',styles['h1']),Paragraph('Estructura del manual',styles['text'])]
md=['# Manual de Usuario de KiwiKERP','','## Índice','']
for i,block in enumerate(outline.split('\n\n'),1):
    lines=block.splitlines(); title=f'{i}. {lines[0]}'
    story.append(Paragraph(escape(title),styles['i1']));md.append('### '+title)
    for j,line in enumerate(lines[1:],1):
        parts=line.split('|'); title=f'{i}.{j}. {parts[0]}'
        story.append(Paragraph(escape(title),styles['i2']));md.append('- **'+title+'**')
        for k,t in enumerate(parts[1:],1):
            title=f'{i}.{j}.{k}. {t}'
            story.append(Paragraph(escape(title),styles['i3']));md.append('  - '+title)
    md.append('')
for line in body.splitlines():
    if not line:continue
    if line=='[[users]]':
        from manual_users import users_pages
        story.extend(users_pages(out,styles))
        continue
    if line=='[[company]]':
        story.extend(company_page(out,styles))
        continue
    if line=='[[firstaccess]]':
        story.append(PageBreak())
        story.append(Paragraph('Primer acceso: completar la configuración inicial',styles['h2']))
        story.append(Paragraph('Al iniciar sesión por primera vez con el administrador creado durante la instalación, puede aparecer el aviso Completa la configuración inicial. La instalación ya está activa; queda revisar la configuración necesaria para empezar a trabajar.',styles['text']))
        story.extend([CaptureCard(out/'imagenes/primer-acceso-configuracion.png',caption='Primer acceso · Configuración inicial pendiente'),Spacer(1,14)])
        for title,text in [
            ('Revisar los parámetros generales','Pulsa Completar ahora para continuar con la configuración inicial. Revisa los datos y parámetros generales de la empresa antes de dar por terminada la puesta en marcha.'),
            ('Confirmar el repositorio documental','GestDoc es la carpeta destinada al almacenamiento documental. En la modalidad Instalación en servidor propio, el aviso muestra la ruta configurada y permite revisarla durante la configuración. Para finalizar, la carpeta debe existir en el servidor y permitir escritura.'),
            ('La ruta depende de cada instalación','La dirección de la captura es un ejemplo del servidor utilizado en esta prueba. No debes copiarla a otro equipo: utiliza la ruta preparada para tu instalación. Este aviso corresponde a servidor propio y no describe la gestión del almacenamiento en la nube.'),
            ('Qué se ha comprobado','Las capturas muestran el inicio de sesión y la aparición del aviso. Todavía no muestran la finalización de los ajustes; el siguiente paso del recorrido es pulsar Completar ahora.')]:
            story.append(Paragraph(title,styles['h3']));story.append(Paragraph(text,styles['text']))
        story.append(PageBreak())
        continue
    if line=='[[login]]':
        story.extend([CaptureCard(out/'imagenes/inicio-sesion.png',caption='Inicio de sesión · Acceso al espacio de trabajo'),Spacer(1,12)])
        continue
    if line=='[[installation]]':
        story.append(PageBreak());story.extend(installation_pages(out,styles));continue
    if line=='[[panel]]':
        story.append(PageBreak())
        story.append(Paragraph('El Panel de control',styles['h2']))
        story.append(Paragraph('Vista general del entorno de trabajo',styles['text']))
        story.extend([CaptureCard(out/'imagenes/panel-control.png',caption='Panel de control · Navegación, accesos e indicadores'),Spacer(1,14),
                      CaptureCard(out/'imagenes/estado-empresa.png',caption='Panel de control · Continuación: Estado de la empresa'),Spacer(1,14)])
        story.append(Paragraph('Estado de la empresa',styles['h3']))
        story.append(Paragraph('La parte inferior del panel reúne la evolución mensual, los cobros del año, el embudo comercial y los productos con mayor importe facturado. Ofrece una visión conjunta del ejercicio; los indicadores se explicarán en detalle en su apartado correspondiente.',styles['text']))
        story.append(PageBreak())
        story.append(Paragraph('Cómo orientarse en el Panel de control',styles['h2']))
        for title,description in [
            ('1. Cabecera común','En la parte superior se encuentran la búsqueda de módulos, la campana de notificaciones, la opción Salir y el acceso al perfil del usuario.'),
            ('2. Menú lateral','A la izquierda aparecen Ventas, Reportes y Configuración. El botón de doble flecha permite contraer el menú para ampliar el espacio de trabajo. Los accesos dependen del perfil y los permisos.'),
            ('3. Accesos recientes','Permiten retomar las áreas utilizadas anteriormente sin recorrer de nuevo la navegación.'),
            ('4. Indicadores de actividad','Las tarjetas resumen presupuestos por aprobar, pedidos pendientes, facturas por cobrar, facturas vencidas y rectificativas. Al entrar en Ventas o en un módulo concreto, la información se centra en ese ámbito.'),
            ('5. Calendario comercial','Representa automáticamente los eventos comerciales según las fechas y el estado de los documentos: vencimientos de facturas, entregas previstas y presupuestos pendientes de aprobación. Los colores distinguen las categorías y el detalle de cada día permite consultar los documentos relacionados.')]:
            story.append(Paragraph(title,styles['h3']));story.append(Paragraph(description,styles['text']))
        story.append(PageBreak())
        story.extend(calendar_page(out,styles))
        story.append(PageBreak())
        story.extend(screen_pages(out,styles))
        story.append(PageBreak());continue
    if line.startswith('[['):
        story.append(ManualDiagram(line[2:-2]));story.append(Spacer(1,14));continue
    if line.startswith('# '):story.append(PageBreak());style='h1';line=line[2:]
    elif line.startswith('## '):style='h2';line=line[3:]
    elif line.startswith('### '):style='h3';line=line[4:]
    elif line in ('En el servidor del cliente','En la nube de FreeLandSite','Una solución adaptable a cada empresa'):style='h3'
    else:style='text'
    story.append(Paragraph(escape(line),styles[style]))
def footer(c,d):
    c.setFillColor(HexColor('#648506'));c.setFont('Bold',9);c.drawString(54,804,'KiwiKERP')
    c.setFillColor(HexColor('#666666'));c.setFont('Regular',8);c.drawRightString(541,804,'Manual de Usuario')
    c.setStrokeColor(HexColor('#9CC10A'));c.setLineWidth(.6);c.line(54,49,541,49)
    c.drawString(54,34,'Edición de trabajo 0.11 · Septiembre 2026');c.drawRightString(541,34,str(d.page))
    c.setFillColor(HexColor('#648506'));c.drawCentredString(393,34,'www.freelandsite.es')
    c.linkURL('https://www.freelandsite.es',(352,31,434,43),relative=0)
inner=qa/'interior.pdf'
SimpleDocTemplate(str(inner),pagesize=(595.276,841.89),leftMargin=54,rightMargin=54,topMargin=62,bottomMargin=64).build(story,onFirstPage=footer,onLaterPages=footer)
writer=PdfWriter();writer.append(str(out/'KiwiKERP_Portada_Manual_Usuario_v0_3.pdf'));writer.append(str(inner))
writer.add_metadata({'/Title':'KiwiKERP Manual de Usuario - Edición de trabajo 0.11','/Author':'FreeLandSite'})
final=out/'KiwiKERP_Manual_Usuario_Trabajo_v0_11.pdf';writer.write(str(final))
(out/'KiwiKERP_Manual_Usuario_Trabajo.md').write_text('\n'.join(md)+'\n\n'+body,encoding='utf-8')
tracking='''# Seguimiento editorial y pruebas del manual

Edición 0.11. La portada aprobada se conserva. Índice completo de 17 capítulos a tres niveles; no incluye paginación de apartados todavía porque la mayoría no están redactados. El cuerpo comienza con 1, 2.2 y 3.1; los huecos conservan la numeración del índice acordado.

## Estado
- Introducción: primera redacción. Revisión del usuario pendiente.
- Instalación 2.2: contrastada con Frm_Installation.vue. Prueba real de instalación pendiente.
- Acceso 3.1: contrastado con Frm_Login.vue y Frm_LoginController.ts. Prueba real de acceso, caducidad, recuperación y cierre pendiente.
- Capítulos restantes: índice propuesto, contenido y validación pendientes.
- VeriFactu: solo estructura propuesta; contrastar implementación, entorno de pruebas y documentación oficial vigente antes de redactar instrucciones fiscales.
- No se han ejecutado operaciones sobre datos de empresa ni pruebas funcionales en esta sesión.
- PDF generado y sujeto a revisión visual. La fuente editable es Markdown; todavía no se ha preparado ni validado una versión Word.

## Registro por procedimiento
Registrar apartado, fecha, entorno y versión, caso de prueba, datos ficticios empleados, pasos, resultado esperado, resultado observado, captura sin datos sensibles, comprobación de persistencia cuando corresponda e incidencias.

## Siguiente bloque
Probar instalación en un entorno de prueba autorizado o comenzar por acceso si la instalación ya existe. Incorporar las capturas y ajustar el texto tras comprobar el resultado real. No recrear una base existente para documentar el asistente.
'''
(out/'Seguimiento_Manual_y_Pruebas.md').write_text(tracking,encoding='utf-8')
doc=pdfium.PdfDocument(str(final))
for i in range(len(doc)):doc[i].render(scale=1.2).to_pil().save(qa/f'page-{i+1:02}.png')
print(f'{len(doc)} pages; {final}')
