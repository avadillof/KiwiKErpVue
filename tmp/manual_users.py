from reportlab.platypus import Paragraph, Spacer, PageBreak
from manual_screens import CaptureCard

def users_pages(out, s):
    title = 'Gestión de usuarios: listado y navegación'
    intro = 'Accede a Configuración del sistema y selecciona Usuarios. El panel Usuarios del sistema reúne las cuentas de acceso y permite consultar su identificación, rol, estado y última conexión. Esta es la pantalla de partida para administrar los usuarios de KiwiKERP.'
    parts = [
        ('Qué muestra cada columna', 'Código identifica la cuenta; Usuario muestra el nombre y su imagen o iniciales. Rol indica el perfil mostrado por el sistema. Estado permite distinguir si la cuenta está activa. Última conexión muestra la fecha y hora registradas para el último acceso; no indica por sí sola que el usuario siga conectado.'),
        ('Dos perfiles en el listado', 'La captura muestra dos cuentas: una con rol Administrador y otra con rol Usuario. Ambas aparecen en estado ACTIVO y tienen su propia última conexión. El rol y el estado son datos distintos: estar activo no significa disponer de permisos de administrador. El total del listado es de dos registros; los permisos se explicarán en el apartado de seguridad.'),
        ('Buscar, ordenar y recorrer el listado', 'Utiliza Buscar registros para localizar usuarios. Los encabezados Código, Usuario y Rol muestran controles de ordenación. En la parte inferior aparecen el total y los controles de paginación, con selección de página, navegación y tamaño de página.'),
        ('Crear una cuenta', 'Pulsa Nuevo usuario, en la parte superior derecha, para abrir el formulario de alta. El procedimiento de creación, sus campos y la confirmación del guardado se documentarán con las siguientes capturas.'),
        ('Dos menús diferentes', 'El menú de tres puntos junto al buscador corresponde al listado. El menú de tres puntos de cada fila, en Acciones, corresponde a ese usuario. Antes de operar, comprueba el código y el nombre de la fila elegida.')
    ]
    opening = 'Antes de crear cuentas o asignar permisos, conviene distinguir los dos perfiles principales de este recorrido: Administrador y Usuario. El perfil determina el alcance del acceso; el estado activo indica si la cuenta está habilitada.'
    result = [Paragraph('Tipos de usuario y responsabilidades',s['h2']),Paragraph(opening,s['text'])]
    md = ['### Tipos de usuario y responsabilidades',opening]
    for h,t in [
        ('Administrador: gestionar la solución', 'Es el perfil encargado de administrar KiwiKERP y su configuración. Dispone de acceso general a los módulos, secciones y permisos contemplados por el sistema de seguridad, sin tener que habilitarlos individualmente. La cuenta creada durante la instalación es el primer administrador. Este perfil debe asignarse a las personas responsables de configurar la aplicación y gestionar los accesos.'),
        ('Usuario: trabajar con los permisos asignados', 'Es el perfil destinado al trabajo diario. Su acceso se define mediante Seguridad de Usuario, donde se habilitan módulos, secciones y permisos. Dos personas con el mismo rol Usuario pueden tener accesos diferentes según sus funciones. Crear una cuenta y marcarla como activa no equivale a concederle todos los permisos.'),
        ('Un ejemplo de reparto de funciones', 'La persona responsable de la implantación puede disponer de perfil Administrador para configurar la empresa y gestionar usuarios. Un empleado puede utilizar el perfil Usuario con acceso a las áreas comerciales que necesite. Los permisos concretos deben configurarse y comprobarse; no se deducen del nombre de la cuenta.'),
        ('Rol, estado y reglas de trabajo', 'Administrador o Usuario define el perfil de acceso; ACTIVO es el estado de habilitación. Ninguno de estos datos indica que la persona esté conectada en ese momento. Tener acceso a una operación tampoco elimina las validaciones de los documentos ni los requisitos del proceso comercial.'),
        ('Cómo se refleja en el listado', 'La columna Rol distingue Administrador y Usuario. En el menú de acciones, Seguridad de Usuario está deshabilitada para el administrador porque su acceso no se configura mediante permisos individuales. Para las cuentas de trabajo, este panel permite definir el acceso según las responsabilidades de cada persona.')]:
        result.extend([Paragraph(h,s['h3']),Paragraph(t,s['text'])]);md.extend(['**'+h+'**',t])
    result.append(PageBreak())
    result.extend([Paragraph(title,s['h2']),Paragraph(intro,s['text']),CaptureCard(out/'imagenes/usuarios-listado.png',caption='Usuarios del sistema · Vista inicial'),Spacer(1,12)])
    md.extend(['### '+title,intro,'![Usuarios del sistema](imagenes/usuarios-listado.png)'])
    for h,t in parts:
        result.extend([Paragraph(h,s['h3']),Paragraph(t,s['text'])]);md.extend(['**'+h+'**',t])
    h='Recorrido de la gestión de usuarios'
    t='El índice se amplía para separar el alta y los datos identificativos, la fotografía, el rol o grupo, el estado activo, la contraseña, la modificación, el historial de conexiones, los permisos, el borrado y las herramientas del listado. Cada procedimiento se desarrollará con sus pantallas y pruebas.'
    result.extend([Paragraph(h,s['h2']),Paragraph(t,s['text'])]);md.extend(['### '+h,t])
    for h,t in [
        ('Acciones del usuario', 'La estructura actual del frontend incluye Editar, Historial Conexiones, Borrar y Seguridad de Usuario. La acción Seguridad de Usuario aparece deshabilitada para las cuentas identificadas como administradoras. El alcance de los permisos y las restricciones se explicará al documentar ese panel.'),
        ('Herramientas del listado', 'El menú general incluye Refrescar datos y Exportar a Excel. Estas opciones actúan sobre el listado; sus resultados se documentarán durante las pruebas correspondientes.'),
        ('Siguientes pantallas', 'Continuaremos con el formulario Nuevo usuario y, después, los menús de acciones, el historial de conexiones y Seguridad de Usuario. La captura actual no acredita la creación, modificación ni eliminación de ninguna cuenta.')]:
        result.extend([Paragraph(h,s['h3']),Paragraph(t,s['text'])]);md.extend(['**'+h+'**',t])
    (out/'Gestion_usuarios.md').write_text('\n\n'.join(md),encoding='utf-8')
    result.append(PageBreak())
    return result
