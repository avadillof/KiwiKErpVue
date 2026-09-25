from reportlab.platypus import Paragraph, Spacer, PageBreak
from manual_screens import CaptureCard

def company_page(out, styles):
    title = 'Configuración inicial: revisar la empresa'
    intro = 'Al continuar desde el aviso de primer acceso, se muestra Configuración del sistema, con la pestaña Empresa seleccionada. Revisa la información de tu negocio y completa los ajustes que correspondan antes de empezar a trabajar.'
    sections = [
        ('Identidad y datos básicos', 'A la izquierda aparecen el logotipo, el botón Cambiar Logo y el Eslogan. En Datos Básicos revisa Nombre Entidad, NIF/CIF, Email y Teléfono. Comprueba especialmente la identificación de la empresa: los valores de esta captura son ejemplos de la prueba.'),
        ('Dirección fiscal', 'Completa o revisa Calle / Avenida, Número, Provincia, CP y Localidad. Verifica que los datos corresponden a la dirección fiscal de tu empresa.'),
        ('Correo de salida: configuración SMTP', 'Este bloque configura el servicio utilizado para enviar correos. Incluye Servidor SMTP, Puerto, Usuario SMTP, Password y Email Remitente (System). Las opciones SMTP Auth, StartTLS Enable, StartTLS Required y SSL Protocols deben ajustarse a los datos facilitados por tu proveedor de correo o responsable técnico. El Email de Datos Básicos no sustituye esta configuración.'),
        ('Verificar la conexión', 'El botón Verificar conexión permite solicitar una comprobación de la configuración de correo. Revisa el resultado antes de continuar. La captura muestra los campos SMTP vacíos: no acredita una conexión correcta ni un envío de correo realizado.'),
        ('Texto de protección de datos', 'Configuración Legal (RGPD) contiene el campo para introducir el texto de protección de datos que corresponda a la empresa. Solicita el contenido adecuado a la persona responsable; rellenar este campo, por sí solo, no acredita el cumplimiento normativo.'),
        ('Continuación de la puesta en marcha', 'Esta captura no muestra la selección del repositorio GestDoc ni los botones de guardado o finalización. Estos pasos se documentarán con las siguientes pantallas; la configuración todavía no se da por terminada.')
    ]
    result = [Paragraph(title, styles['h2']), Paragraph(intro, styles['text']),
              CaptureCard(out/'imagenes/configuracion-empresa.png', caption='Configuración del sistema · Pestaña Empresa'), Spacer(1, 12)]
    md = ['### '+title, intro, '![Configuración de Empresa](imagenes/configuracion-empresa.png)']
    for heading, text in sections:
        result.extend([Paragraph(heading, styles['h3']), Paragraph(text, styles['text'])])
        md.extend(['**'+heading+'**', text])
    result.append(PageBreak())
    title = 'SMTP: la cuenta de correo del sistema'
    intro = 'Esta configuración es esencial para los envíos del propio sistema. KiwiKERP utiliza esta cuenta SMTP para enviar sus correos. Debe estar correctamente configurada antes de utilizar las funciones que dependen de esos envíos.'
    result.extend([Paragraph(title, styles['h2']), Paragraph(intro, styles['text']),
                   CaptureCard(out/'imagenes/configuracion-smtp.png', caption='Correo del sistema · Ejemplo de configuración SMTP'), Spacer(1, 14)])
    md.extend(['### '+title, intro, '![Configuración SMTP](imagenes/configuracion-smtp.png)'])
    for heading, text in [
        ('Servidor y puerto', 'Servidor SMTP indica el servidor de salida del proveedor de correo. Puerto identifica el punto de conexión. La captura utiliza smtp.ionos.es y el puerto 587; son los valores del ejemplo, no una configuración válida para todos los proveedores.'),
        ('Usuario SMTP y contraseña', 'Usuario SMTP es la cuenta con la que KiwiKERP se autentica ante el servidor de correo. Password contiene su contraseña o la credencial que requiera el proveedor. Es una cuenta de correo, distinta del usuario con el que se inicia sesión en KiwiKERP. La contraseña se muestra oculta en la captura.'),
        ('Autenticación y conexión cifrada', 'SMTP Auth activa la autenticación. StartTLS Enable habilita el uso de STARTTLS y StartTLS Required exige su utilización. SSL Protocols indica los protocolos configurados. En este ejemplo las tres casillas están activadas y figura TLSv1.2. Utiliza los valores indicados por tu proveedor o responsable técnico.'),
        ('Email Remitente (System)', 'Es la dirección configurada como remitente de los correos del sistema. Puede diferir del Usuario SMTP, como ocurre en la captura, siempre que el proveedor autorice a esa cuenta a enviar con dicho remitente. No basta con escribir una dirección cualquiera.'),
        ('Comprobar antes de utilizar los envíos', 'Pulsa Verificar conexión y revisa el resultado. Si falla, comprueba servidor, puerto, credenciales, opciones de seguridad y permisos del remitente. La captura documenta los valores introducidos; no muestra el resultado de la comprobación ni confirma la recepción de un correo. Una conexión correcta tampoco garantiza por sí sola la entrega en la bandeja del destinatario.')
    ]:
        result.extend([Paragraph(heading, styles['h3']), Paragraph(text, styles['text'])])
        md.extend(['**'+heading+'**', text])
    (out/'Configuracion_inicial_empresa.md').write_text('\n\n'.join(md), encoding='utf-8')
    result.append(PageBreak())
    return result
