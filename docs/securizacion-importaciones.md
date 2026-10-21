# Securización de las importaciones Excel

Las importaciones se administran desde la securización actual del usuario, sin una pantalla de permisos independiente.

| Categoría | Opción | Código |
| --- | --- | --- |
| General Entidades | Importar entidades desde Excel | `ENTI_GEN_0006` |
| General Productos | Importar productos y servicios desde Excel | `PROSER_GEN_0085` |

Cada opción se exige junto al permiso de crear/editar del módulo correspondiente. Con permiso de edición y sin permiso de importación se puede seguir trabajando con las fichas individuales, pero no se muestra el botón de importar. Tener únicamente permiso de importación no concede edición.

Los administradores conservan su acceso general. Los demás usuarios necesitan ambos atributos activos y accesibles a través de los módulos habilitados, según el modelo de securización existente.

La comprobación se repite en servidor para catálogos, historial, detalle de ejecución, validación del archivo, confirmación y continuación. Desmarcar el permiso impide nuevas peticiones, incluso desde un asistente abierto anteriormente; no deshace filas ya importadas. El historial continúa restringido al usuario que inició cada ejecución.

La migración `V2026202847__master_import_permissions.sql` registra los atributos y sus valores para usuarios existentes, sin modificar decisiones ya guardadas. Sigue la política actual del ERP: permisos nuevos marcados por defecto, que el administrador puede desmarcar. La instalación nueva incorpora también los atributos en `BackUpBBDD/SchemaEmptyBBDD/BBDD.sql`; las cargas de securización inicializan permisos nuevos siguiendo el mismo criterio.

Tras desplegar el backend y aplicar la migración mediante el procedimiento habitual, recargar la securización o iniciar de nuevo la sesión para actualizar la visibilidad de los botones. Las comprobaciones automáticas de código no sustituyen esta actualización de base de datos ni la prueba con usuarios reales.
