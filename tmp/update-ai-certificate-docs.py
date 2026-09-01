from pathlib import Path
root = Path.cwd()
for rel in ['docs/manual-usuario/README.md', 'src/views/Help/Frm_UserManual.vue']:
    p=root/rel
    t=p.read_text(encoding='utf-8')
    t=t.replace('Se necesita HTTPS y una preparación única del cifrado del servidor; en Jenkins se custodia la clave maestra de cifrado, no la clave API.', 'Se necesita HTTPS (o conexión local de desarrollo). La clave se protege con el mismo servicio de cifrado que los certificados, sin configurar variables ni credenciales adicionales en Jenkins.')
    p.write_text(t,encoding='utf-8')
p=root/'docs/invoice-assistant-pilot.md'
t=p.read_text(encoding='utf-8')
t=t.replace('se cifra con AES-256-GCM, nonce aleatorio y una clave maestra externa.', 'se cifra mediante el servicio existente `CertificateCryptoService`, igual que los certificados.')
t=t.replace('No cambia la clave maestra ni exige reiniciar.', 'No exige reiniciar.')
a=t.index('### Preparación única del cifrado')
b=t.index('### Guardar y probar',a)
t=t[:a]+'''### Cifrado compartido con los certificados

Por petición expresa del usuario, la clave API utiliza `CertificateCryptoService`, sin `KIWIK_AI_MASTER_KEY` ni credenciales adicionales en Jenkins. Se guarda en `encrypted_key` con prefijo `cert:v1:` y contenido cifrado codificado en Base64. El campo de contraseña sigue sin recuperar ni mostrar la clave guardada.

Se heredan las limitaciones del sistema de certificados: clave fija incluida en el código y cifrado AES sin autenticación. No es AES-256-GCM ni protege frente a quien tenga acceso al código/aplicación y a la base de datos. No se han modificado los certificados ni su servicio de cifrado.

Una clave guardada con el formato anterior `v1:` no se borra ni se interpreta con otro algoritmo: el panel indica que debe pegarse de nuevo para sustituirla por el formato actual. Guardar vacío conserva el valor anterior; eliminar sigue requiriendo confirmación. No hay migración automática de secretos ni cambios de esquema.

Usar HTTPS en página y API; sólo se permite HTTP para desarrollo local. No activar registros de cuerpos HTTP para estas rutas. La clave API no debe incluirse en el repositorio, capturas ni mensajes.

'''+t[b:]
a=t.index('### Guardado exclusivamente en base de datos — validación local')
b=t.index('### Reanudación',a)
t=t[:a]+'''### Guardado exclusivamente en base de datos — validación local

Las comprobaciones aisladas verifican cifrado/descifrado con el servicio real de certificados usando claves API ficticias, compatibilidad entre instancias, rechazo del formato anterior, conservación, sustitución, eliminación, conflictos de versión, permisos y HTTPS. No son una prueba de seguridad criptográfica del cifrado heredado. No se modifica la base de datos ni se ejecuta Jenkins. Desplegar backend y frontend juntos.

'''+t[b:]
a=t.index('### Despliegue con el Jenkinsfile del backend')
b=t.index('### Mensajes de error',a)
t=t[:a]+'''### Despliegue con el Jenkinsfile del backend

Se conserva el arranque `mvn spring-boot:run`, el puerto 8083 y la parada existente. Se eliminan la comprobación y la inyección de `kiwik-ai-master-key`; tampoco se utiliza `OPENAI_API_KEY`. No se necesitan credenciales Jenkins para esta integración. Las credenciales existentes en Jenkins no se han borrado: simplemente ya no se referencian.

Tras actualizar backend y frontend, pegar la clave API en Ajustes, guardar y probar. Si había una clave cifrada con el mecanismo anterior, volver a pegarla. El despliegue real y la prueba con una clave real quedan pendientes.

'''+t[b:]
t=t.replace('`KIWIK_AI_MASTER_KEY` es necesaria para guardar y leer la clave cifrada. ', 'No se requiere una variable de cifrado externa. ')
t=t.replace('### Resultado de la validación local (31/08/2026)', '### Historial de validaciones anteriores (31/08/2026)')
p.write_text(t,encoding='utf-8')
