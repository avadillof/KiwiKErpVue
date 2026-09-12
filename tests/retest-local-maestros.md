# Repetición funcional en desarrollo local

Destino: http://localhost:5173/
Ámbito: Familias de Productos y Cuentas Bancarias.

Estado: bloqueado antes de iniciar sesión. No se han ejecutado todavía los casos de los maestros ni creado o modificado registros en esta repetición.

## Evidencia

- El frontend carga y redirige a `/service-unavailable`.
- Muestra «Servidor no disponible» y señala `https://localhost:8083` como servidor comprobado.
- Al pulsar «Reintentar conexión», muestra «No se ha podido comprobar el estado del servidor».
- La consulta local de conexiones TCP no devolvió ningún listener en el puerto 8083.

Se necesita iniciar el backend de desarrollo o confirmar una dirección de backend diferente. Este bloqueo de entorno no demuestra un fallo de Familias ni de Cuentas. Ninguna incidencia previa se considera cerrada mediante esta ejecución.

## Criterio de repetición

Conservar los identificadores originales de las incidencias. Esperar a que terminen las peticiones antes de evaluar búsquedas: mostrar filas anteriores durante una carga no demuestra por sí solo que el filtro falle. Separar mejoras de interfaz y pruebas pendientes de fallos reproducidos. Validar alta, obligatoriedad, entradas incorrectas, duplicados, edición, estados disponibles, cancelación, búsquedas, ordenación, paginación, borrado de un registro ficticio y persistencia.
