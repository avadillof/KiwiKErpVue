from pathlib import Path
import shutil
from reportlab.platypus import Paragraph, Spacer, PageBreak
from reportlab.lib.utils import ImageReader
from manual_screens import CaptureCard

STEPS=[
('ef413fbd-13bb-4373-8d04-27cf13a07a56','portal-inicio','2.2.1. Acceder a la solicitud de prueba',
'Abre www.freelandsite.es en el navegador. En la página principal, pulsa Probar KiwiKERP, en la parte superior derecha. También aparece el acceso Solicitar entorno de prueba debajo de la presentación del producto.',
'Este paso inicia el recorrido de solicitud para la modalidad en la nube. Todavía no se han registrado los datos ni preparado el entorno.'),
('38d589ba-a83f-4a6a-b12e-c9605040a430','portal-prueba','Conocer el entorno de prueba',
'La sección presenta una instancia temporal e independiente, accesible desde el navegador. Describe el recorrido: solicitar acceso, preparar el entorno, añadir datos de ejemplo y recibir el acceso. Pulsa Solicitar entorno de prueba para abrir el formulario.',
'La página anuncia 48 horas de prueba y avisa de que la disponibilidad se comunicará después de registrar la solicitud. El anuncio de datos de ejemplo se contrastará con el contenido real de la instalación.'),
('4c41f3c3-ffa5-45bc-a999-d17a0624bd43','solicitud-formulario','2.2.2. Completar los datos de contacto',
'Introduce Nombre y apellidos, Empresa y Email profesional. Todos los campos son obligatorios. Revisa el correo, lee la información sobre el tratamiento de datos y marca la aceptación si estás conforme. Pulsa Solicitar prueba.',
'El formulario indica una solicitud por conexión pública: si ya existe una, se recupera su referencia. La duración de la prueba se cuenta desde la activación, no desde el envío del formulario.'),
('6c11f380-0c56-45c2-8d72-61989b5185bb','solicitud-registrada','2.2.3. Confirmación de la solicitud',
'El recuadro Solicitud registrada presenta un código de seguimiento, el dominio asignado y el estado. Conserva el código para futuras consultas. Que los campos se vacíen no obliga a volver a enviar la solicitud.',
'Pendiente de preparación significa que la solicitud está registrada, pero aún no hay un entorno disponible. Espera el aviso de disponibilidad antes de intentar comenzar la instalación.'),
('1929eb04-9443-426d-8184-ef59b89fe0b8','correo-preparado','2.2.4. Recibir el acceso al entorno',
'El correo de entorno preparado incluye la empresa, el código y la dirección de acceso. Abre el enlace para iniciar el asistente y configurar la empresa y su primer administrador.',
'El correo precisa que el periodo de prueba comienza cuando finaliza correctamente la instalación inicial. Recibirlo no significa que la configuración esté terminada. Las capturas de solicitud y correo corresponden a referencias diferentes y se utilizan como ejemplos del recorrido.'),
('8b00f71a-71cf-4c41-8edf-856fde040906','instalacion-preparacion','2.3.1. Preparación del entorno',
'El asistente presenta cuatro pasos: Preparación, Tu empresa, Administrador y Confirmación. En Standard Cloud, la infraestructura ya está preparada. Antes de continuar se comprueba la disponibilidad del servicio de KiwiKERP, el acceso a la base de datos y la protección de la instalación.',
'La captura muestra las tres comprobaciones correctas. No hay campos que rellenar aquí. Pulsa Continuar para introducir los datos de la empresa. Si aparece un error, revisa el mensaje antes de avanzar.'),
('f21563a4-287f-4aa5-a2f9-eefdeb76b348','instalacion-empresa-vacia','2.3.2. Datos de la empresa',
'Introduce Razón social, Nombre comercial, NIF/CIF, Correo electrónico y Teléfono. Completa Dirección, Número, Código postal, Localidad, Provincia y País. España aparece inicialmente seleccionada. Puedes añadir un Eslogan y un logotipo PNG o JPG; se recomienda PNG con fondo transparente.',
'La razón social identifica legalmente a la empresa o al autónomo; el nombre comercial identifica el negocio ante sus clientes. El correo de contacto no sustituye la configuración del servicio de envío. Continuar se habilita cuando se completan los datos requeridos.'),
('9f27c36d-9ae0-4c79-995f-71363d6e1720','instalacion-empresa-revision','Revisar la identidad de la empresa',
'Comprueba la vista previa del logotipo y revisa especialmente la razón social, la identificación fiscal y la dirección. En este ejemplo se han completado los campos y el botón Continuar está habilitado.',
'Pulsa Continuar para definir el administrador. Atrás permite regresar a Preparación. La instalación aún requiere la confirmación final.'),
('f5c1e8f7-9a65-4a52-93ec-feaeb22378df','instalacion-administrador','2.3.3. Primer administrador',
'Introduce Nombre y apellidos, Usuario y Correo electrónico. Usuario será el identificador de inicio de sesión y es distinto del nombre completo. Escribe la Contraseña y repítela en Repetir contraseña. Los iconos de ojo permiten mostrar u ocultar su contenido.',
'Esta cuenta tendrá permisos para completar los ajustes de KiwiKERP. Comprueba que las contraseñas coinciden y pulsa Continuar para revisar el resumen. La cuenta todavía requiere que la instalación termine correctamente.'),
('e4175154-24dc-4b42-aa67-f4ecc2f36e90','instalacion-confirmacion','2.3.4. Confirmación previa a la instalación',
'Revisa Empresa, Administrador, Datos iniciales, Identidad y Modalidad. En esta captura, Datos iniciales indica Catálogos del sistema y Sin datos operativos; la modalidad es Standard Cloud. Identidad muestra la protección de la instalación y no requiere introducir información.',
'Atrás permite corregir los pasos anteriores. Finalizar instalación solicita las comprobaciones definitivas y la activación. La presencia de este botón no acredita una instalación completada. El recorrido documentado en esta edición se detiene en esta pantalla.')]

def installation_pages(out,s):
    assets=out/'imagenes'; result=[];md=['## 2.2. Solicitar una prueba en la nube','']
    for i,(uid,name,title,before,after) in enumerate(STEPS):
        source=Path('C:/Users/comer/AppData/Local/Temp')/f'codex-clipboard-{uid}.png'
        dest=assets/(name+'.png')
        if not dest.exists():shutil.copy2(source,dest)
        if i:result.append(PageBreak())
        if i==0:result.append(Paragraph('2. Instalación y puesta en marcha',s['h1']))
        result.append(Paragraph(title,s['h2']))
        result.append(Paragraph(before,s['text']))
        iw,ih=ImageReader(str(dest)).getSize();width=min(487,420*iw/ih+20)
        result.append(CaptureCard(dest,width,'KiwiKERP · '+title.split('. ',1)[-1]));result.append(Spacer(1,12))
        result.append(Paragraph(after,s['text']))
        if i==len(STEPS)-1:
            result.append(Paragraph('Punto de control de esta edición',s['h3']))
            result.append(Paragraph('Se ha comunicado una incidencia al llegar a este punto. Su mensaje, causa y resolución quedan pendientes de documentar. No se confirma la activación, el inicio del contador de prueba ni el primer acceso.',s['text']))
        md.extend(['### '+title,before,f'![{title}](imagenes/{name}.png)',after,''])
        if name=='instalacion-preparacion':
            result.append(PageBreak())
            heading='Base de datos existente: confirmar la recreación'
            result.append(Paragraph(heading,s['h2']))
            md.extend(['### '+heading,''])
            capture=assets/'instalacion-recrear-confirmacion.png'
            if not capture.exists():
                shutil.copy2(Path('C:/Users/comer/AppData/Local/Temp/codex-clipboard-19a8bbe0-a2b5-4433-88ee-1a30e9bfcdde.png'),capture)
            intro='Este diálogo solicita una confirmación expresa antes de recrear una base de datos existente. La captura muestra el campo de confirmación vacío y el botón Crear copia y recrear deshabilitado.'
            result.append(Paragraph(intro,s['text']))
            result.append(CaptureCard(capture,487,'Confirmación de recreación de la base de datos'))
            result.append(Spacer(1,12))
            result.append(Paragraph('Lee la advertencia: la operación elimina la información actual. Primero se genera una copia de seguridad; si la copia falla, no se borra nada. Escribe RECREAR y pulsa Crear copia y recrear únicamente cuando quieras iniciar la operación. Cancelar cierra la confirmación.',s['text']))
            md.extend([intro,'![Confirmación de recreación de la base de datos](imagenes/instalacion-recrear-confirmacion.png)',''])
            result.append(PageBreak())
            result.append(Paragraph('Recreación: pasos y resultado',s['h2']))
            sections=[
                ('Cuándo aparece', 'Durante Preparación, KiwiKERP puede detectar una base de datos existente que requiere recreación. El asistente mantiene Continuar bloqueado y muestra el diálogo Base de datos existente. No es un paso obligatorio en todas las instalaciones.'),
                ('Antes de decidir', 'La recreación elimina la información actual de la base y prepara una estructura limpia. Si necesitas conservar los datos para seguir trabajando con ellos, pulsa Cancelar y consulta con la persona responsable de la instalación. Cancelar no solicita la recreación.'),
                ('Confirmación expresa', 'Lee la advertencia y escribe RECREAR en el campo de confirmación. Hasta introducir esa palabra, el botón Crear copia y recrear permanece deshabilitado. Escribirla no ejecuta la operación: debes pulsar el botón para iniciarla.'),
                ('Copia de seguridad previa', 'KiwiKERP crea primero una copia de seguridad de la base de datos. Si la copia falla, detiene el proceso antes de borrar la información. Si termina correctamente, continúa con la recreación. Esta copia no implica una restauración automática de los datos.'),
                ('Resultado de la operación', 'Mientras se procesa la solicitud, espera a que termine. Si se completa correctamente, el diálogo se cierra y se repiten las comprobaciones de Preparación. Si aparece un error, revisa el mensaje; no des por terminada la recreación ni continúes hasta resolverlo.'),
                ('Volver a abrir la confirmación', 'Si cancelas el diálogo, puedes utilizar Revisar recreación de la base de datos. Al abrirlo de nuevo, el campo se vacía y debes volver a escribir RECREAR. Reintentar comprobaciones vuelve a comprobar el entorno; no confirma el borrado.'),
            ]
            for subtitle,description in sections:
                result.append(Paragraph(subtitle,s['h3']))
                result.append(Paragraph(description,s['text']))
                md.extend(['**'+subtitle+'**',description,''])
    (out/'Instalacion_hasta_confirmacion.md').write_text('\n\n'.join(md),encoding='utf-8')
    return result
