# Asistente de consulta de Presupuestos

El asistente de Presupuestos es una herramienta de consulta en solo lectura. Presenta dos paneles exclusivos: **Consulta guiada**, abierta por defecto y sin consumo de API, y **Pregunta con IA**, que utiliza OpenAI únicamente para traducir una frase a filtros permitidos.

El cliente se elige con el selector corporativo por código, nombre o NIF. Puede dejarse vacío para consultar todos los clientes.

Después de consultar, **Descargar respuesta en PDF** genera un informe A4 apaisado con criterios, fecha, moneda, totales, resumen por cliente y presupuestos justificativos. Al explicar un presupuesto también incluye productos, cantidades, precios, descuentos, impuestos y origen del precio. El backend repite la consulta antes de generar el archivo y no confía en importes enviados por el navegador.

OpenAI recibe la pregunta, la fecha actual y si existe un presupuesto seleccionado. No recibe presupuestos, clientes, importes, líneas, notas ni resultados. KiwiKERP valida los filtros, consulta su base de datos y calcula los resultados. El modelo no genera ni ejecuta SQL.

## Consultas disponibles

1. Presupuestado por periodo y cliente.
2. Pendientes de aceptación: estados borrador o enviado.
3. Próximos a vencer y vencidos, usando la fecha de validez.
4. Aprobados y cancelados.
5. Conversión y comparación entre dos periodos. La tasa mantiene la definición del módulo: presupuestos aprobados entre todos los creados en el periodo.
6. Explicar un presupuesto concreto, incluidas líneas, descuentos, impuestos y origen del precio.

Cada resultado muestra base, impuestos, retención, total, moneda, resumen por cliente y los documentos que justifican la cifra. Para cada presupuesto se indica estado, fecha de validez, envío y pedidos asociados. Si aparecen monedas distintas, KiwiKERP ofrece un total independiente para cada divisa, sin convertirlas ni sumarlas.

## Límites y seguridad

- Máximo 500 presupuestos y 366 días por periodo.
- El cliente se filtra por código o nombre completo exacto.
- La consulta no hereda silenciosamente los filtros del listado.
- El asistente no crea, envía, aprueba, cancela ni transforma presupuestos en pedidos.
- Las acciones comerciales continúan en los formularios normales y conservan sus confirmaciones.

Las consultas previstas para una fase posterior son principales clientes, evolución mensual, productos presupuestados y seguimiento ampliado de documentos y notas.
