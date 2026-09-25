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
        ('Usuario: trabajar con los permisos asignados', 'Es el perfil destinado al trabajo diario. El control de acceso por módulos, secciones y categorías está en integración para la próxima versión. Según el responsable del producto, el modelo de datos y las categorías ya están implementados. La asignación individual de permisos es el funcionamiento previsto; su aplicación completa todavía está pendiente de validación.'),
        ('Un ejemplo de reparto de funciones', 'La persona responsable de la implantación puede disponer de perfil Administrador para configurar la empresa y gestionar usuarios. Un empleado puede utilizar el perfil Usuario con acceso a las áreas comerciales que necesite. Este reparto mediante permisos individuales corresponde a la próxima versión y deberá verificarse en la auditoría de seguridad.'),
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
    result.append(PageBreak())
    h='Alta y estado del usuario: prueba realizada'
    t='Prueba realizada el 25/09/2026 en el entorno Cloud indicado por el responsable. Se creó la cuenta QA_MANUAL_2509, Prueba Manual Usuario, con grupo Usuarios y correo ficticio. La cuenta quedó inactiva al finalizar. No se modificaron las cuentas preexistentes ni se realizaron envíos de correo.'
    result.extend([Paragraph(h,s['h2']),Paragraph(t,s['text'])]);md.extend(['### '+h,t])
    for h,t in [
        ('Completar el alta', 'Pulsa Nuevo usuario. Introduce Fecha de Alta, Código de Usuario, Nombre Completo, Correo Electrónico, Rol / Grupo y Contraseña; revisa Usuario Activo y pulsa Guardar usuario. El botón junto al código genera un identificador que puede editarse antes de guardar. Al intentar guardar el formulario vacío se mostró: Campos incompletos. El código, nombre, email, rol y fecha de alta son obligatorios.'),
        ('Grupos disponibles en este entorno', 'El desplegable ofrece Administradores, Usuarios y Usuarios / TPVs. Los dos primeros son los perfiles del recorrido principal de este manual. El comportamiento específico de Usuarios / TPVs todavía no se ha probado.'),
        ('Resultado del alta y primer acceso', 'La cuenta apareció con rol Usuario, estado ACTIVO y última conexión Nunca. Permitió iniciar sesión con su código y contraseña. Al volver a entrar como administrador, la cuenta seguía en el listado y mostraba una fecha y hora de última conexión.'),
        ('Editar y desactivar', 'En Acciones, pulsa Editar. Código de Usuario y Fecha de Alta aparecen deshabilitados. Para desactivar, desmarca Usuario Activo y guarda. En la prueba se mostró Usuario guardado correctamente y el listado pasó a INACTIVO. Un nuevo intento de acceso con esa cuenta permaneció en el login; no se abrió el panel.'),
        ('Revisar los permisos iniciales', 'En esta prueba los seis módulos de Seguridad de Usuario aparecieron habilitados inicialmente: ENTITIES, PRODUCTS, SALES, REPORTING, TASKS y SYSTEM. No presupongas que una nueva cuenta carece de accesos: revisa su configuración. No se han validado todavía todas las secciones y acciones.')]:
        result.extend([Paragraph(h,s['h3']),Paragraph(t,s['text'])]);md.extend(['**'+h+'**',t])
    result.append(PageBreak())
    h='Estado de integración y observaciones de la prueba'
    result.append(Paragraph(h,s['h2']));md.append('### '+h)
    for h,t in [
        ('Acceso a Configuración pese a bloquear SYSTEM', 'Tras deshabilitar SYSTEM para la cuenta de prueba, el menú lateral dejó de mostrar Configuración. Sin embargo, el acceso reciente Configuración permitió abrir la pantalla y consultar datos de empresa y campos SMTP. No se intentó guardar cambios ni enviar correos. El responsable aclara que los permisos están en integración para la próxima versión, con el modelo de datos y las categorías implementados. Este resultado se conserva como referencia de una funcionalidad todavía incompleta. Se repetirá la misma prueba en la futura auditoría de seguridad; no se da por validada la restricción de acceso.'),
        ('Fecha de alta desplazada', 'Se seleccionó 25/09/2026 en el alta; al abrir Editar Usuario se mostró 24/09/2026. Se registra la diferencia observada, sin atribuir todavía una causa. Debe corregirse y comprobarse antes de dar por validado este campo.'),
        ('Recarga y continuidad de la sesión', 'Al recargar la página, la aplicación volvió al login. Se pudo continuar mediante un nuevo inicio de sesión. No se ha determinado si este comportamiento corresponde a la política prevista o a una incidencia.'),
        ('Alcance de la comprobación', 'Los resultados proceden de operaciones reales en el navegador y de nuevas lecturas tras iniciar sesión. No equivalen a una inspección directa de la base de datos ni a una prueba tras reiniciar el servidor. Quedan pendientes duplicados, fotografía, historial detallado, exportación, borrado, otros grupos y validación completa de permisos.')]:
        result.extend([Paragraph(h,s['h3']),Paragraph(t,s['text'])]);md.extend(['**'+h+'**',t])
    (out/'Gestion_usuarios.md').write_text('\n\n'.join(md),encoding='utf-8')
    result.append(PageBreak())
    return result
