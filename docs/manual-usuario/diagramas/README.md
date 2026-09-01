# Mantenimiento del mapa de ventas

Petición expresa del usuario (31/08/2026): «actualiza documentación» incluye revisar y, si cambia el circuito, actualizar también la IMAGEN. No basta con modificar el texto.

## Imagen vigente

- `flujo-ventas-pizarra-tiza-2026-08-31.png` (1492 × 1054): mapa vigente para pantalla, con pizarra negra, textura e iconos de tiza, sin marco de madera. Generado tomando el contenido del mapa anterior y la referencia visual aportada por el usuario. Imagen raster: no presentar como original vectorial ni como arte final A1.
- `flujo-ventas-pizarra-2026-08-31.png` (2523 × 1783): versión anterior, conservada.
- `../../../output/pdf/kiwikerp-ventas-pizarra-a1-2026-08-31.pdf`: diseño ANTERIOR en A1 horizontal, 841 × 594 mm, texto y trazos vectoriales, fuentes incrustadas. No representa el nuevo acabado de tiza. Reducible proporcionalmente a A2.
- `generar-poster-pizarra.py`: original reproducible con ReportLab y fuentes Segoe UI/Segoe Print de Windows. No forma parte del código ejecutado por la aplicación.
- Logo de referencia: `src/assets/logos/corporate.png` desde la raíz del proyecto.
- Se conservan los dos PNG anteriores, con y sin logo, y sus prompts para trazabilidad. Ya no son la imagen vigente.

## Lista de comprobación

1. Revisar los cambios del circuito: origen comercial, rutas por línea, emisión, VeriFactu, correo, vencimientos, cobros y recordatorios.
2. Si afectan al mapa, editar la imagen conservando el logo y los pasos que no han cambiado. No mostrar funciones pendientes como disponibles.
3. Revisar visualmente textos, flechas y conexiones; la factura en borrador pasa por EMITIR FACTURA antes de VeriFactu.
4. Guardar una nueva versión fechada y actualizar tanto `docs/manual-usuario/README.md` como la importación en `src/views/Help/Frm_UserManual.vue`.
5. Comprobar apertura, ampliación y descarga de la imagen, así como la compilación del portal.
6. Si el mapa no necesita cambios, indicarlo al cerrar la actualización documental. No regenerarlo sin motivo.

## Edición pizarra para uso comercial

El mapa incorpora moneda base, tarifa del cliente, reglas y tramos por cantidad, simulación, conservación de importes y venta en USD sin cambio automático de divisas. Mantiene las cuatro rutas comerciales y la secuencia borrador -> emitir -> VeriFactu -> cobro. Rectificativas/abonos aparecen fuera del circuito actual. La letra pequeña indica el alcance fiscal en pruebas, sin prometer un despliegue en producción.

Para imprimir, utilizar el PDF, no ampliar el PNG del manual. El diseño tiene margen interior y fondo oscuro; no incorpora sangrado, marcas de corte ni perfil CMYK específico. Confirmar estos requisitos con la imprenta antes de una tirada. El logo se conserva sin alterar y es rasterizado; no se presenta como vectorial. Realizar una prueba física del logo y del texto pequeño.

Regeneración del diseño vectorial anterior: ejecutar `generar-poster-pizarra.py` con Python y ReportLab, y renderizar el PDF con `pdftoppm -scale-to 2523 -png -singlefile`. No sobrescribir la nueva versión raster de tiza con esa salida. Actualizar el manual Markdown y el componente Vue, incluidos sus enlaces al PDF. No depende de la carpeta `tmp`.
