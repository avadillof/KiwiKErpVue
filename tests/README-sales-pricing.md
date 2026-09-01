# Pruebas de tarifas

Desde la raíz del frontend: `node tests/sales-pricing-state.check.mjs`.
Compila el servicio TypeScript en memoria y sustituye HTTP por un adaptador de prueba.
No escribe archivos en tmp, no usa credenciales ni consulta la base real.

Vista aislada para revisión visual, con Vite iniciado:
`/tests/fixtures/pricing-preview.html`. Usa los componentes reales con datos ficticios.
Su adaptador bloquea toda petición no prevista. No importar esta vista desde la aplicación.

El backend conserva sus comprobaciones en
`src/test/java/com/freelandsite/api/services/SalesPricingCheck.java`.
Las pruebas aisladas no sustituyen la validación de V27 ni del listado paginado contra MySQL real.
