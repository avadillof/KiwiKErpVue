<template>
  <main class="sales-hub">
    <header class="sales-toolbar">
      <div class="toolbar-title">
        <div class="app-icon"><i class="pi pi-briefcase"></i></div>
        <div>
          <span class="breadcrumb">KiwiKERP / Ventas</span>
          <h1>Módulo de Ventas</h1>
        </div>
      </div>
      <Button label="Inicio" icon="pi pi-home" text severity="secondary" @click="router.push({ name: 'Dashboard' })" />
    </header>

    <section class="sales-flow" aria-label="Flujo comercial">
      <div class="flow-copy"><span>Flujo comercial</span><small>Del presupuesto al cobro, conservando la trazabilidad entre documentos.</small></div>
      <div class="flow-steps">
        <button type="button" @click="router.push({ name:'Presupuestos' })"><i class="pi pi-file-edit"></i><span>Presupuesto</span></button><i class="pi pi-angle-right"></i>
        <button type="button" @click="router.push({ name:'Pedidos' })"><i class="pi pi-shopping-cart"></i><span>Pedido</span></button><i class="pi pi-angle-right"></i>
        <button type="button" @click="router.push({ name:'Albaranes' })"><i class="pi pi-truck"></i><span>Albarán</span></button><i class="pi pi-angle-right"></i>
        <button type="button" @click="router.push({ name:'Facturas' })"><i class="pi pi-receipt"></i><span>Factura</span></button>
      </div>
    </section>

    <section v-for="grupo in gruposVentas" :key="grupo.id" class="app-section">
      <div class="section-title">
        <div><i :class="grupo.icono"></i><h2>{{ grupo.nombre }}</h2></div>
        <p>{{ grupo.descripcion }}</p>
      </div>

      <div class="app-grid">
        <button v-for="opcion in grupo.opciones" :key="opcion.id" type="button" class="app-card"
          :class="{ 'app-card--disabled': !opcion.disponible }"
          :disabled="!opcion.disponible" @click="abrirOpcion(opcion)">
          <span class="app-card-icon" :style="{ background: opcion.fondo, color: opcion.color }">
            <i :class="opcion.icono"></i>
          </span>
          <span class="app-card-copy">
            <span class="app-card-heading">
              <strong>{{ opcion.nombre }}</strong>
              <span v-if="!opcion.disponible" class="soon-badge">Próximamente</span>
              <span v-else class="available-badge">Disponible</span>
            </span>
            <small>{{ opcion.descripcion }}</small>
            <span v-if="opcion.funciones?.length" class="feature-list"><span v-for="funcion in opcion.funciones" :key="funcion"><i class="pi pi-check"></i>{{ funcion }}</span></span>
          </span>
          <i :class="opcion.disponible ? 'pi pi-angle-right card-arrow' : 'pi pi-lock card-lock'"></i>
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

interface OpcionVenta {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
  fondo: string;
  disponible: boolean;
  funciones?: string[];
}

const router = useRouter();

const gruposVentas: Array<{ id: string; nombre: string; descripcion: string; icono: string; opciones: OpcionVenta[] }> = [
  {
    id: 'maestros', nombre: 'Datos maestros', icono: 'pi pi-database',
    descripcion: 'La información base que se utiliza en todos los documentos comerciales.',
    opciones: [
      { id: 'tarifas', nombre: 'Lista de precios', descripcion: 'Tarifas compartidas por clientes, con precios fijos y descuentos por producto o familia.', icono: 'pi pi-tags', ruta: 'ListaPrecios', color: '#ffffff', fondo: 'linear-gradient(135deg, #b1d70e, #719808)', disponible: true, funciones: ['Reglas sin acumulación', 'Consulta del precio aplicado'] },
      { id: 'entidades', nombre: 'Entidades', descripcion: 'Clientes, proveedores, contactos, documentación y visión comercial consolidada.', icono: 'pi pi-users', ruta: 'Clientes', color: '#ffffff', fondo: 'linear-gradient(135deg, #38a4d8, #2875b6)', disponible: true, funciones: ['Indicadores en tiempo real', 'Notas y documentos'] },
      { id: 'articulos', nombre: 'Artículos y servicios', descripcion: 'Catálogo comercial, clasificación y seguimiento por producto.', icono: 'pi pi-box', ruta: 'Productos', color: '#ffffff', fondo: 'linear-gradient(135deg, #b1d70e, #719808)', disponible: true, funciones: ['Actividad comercial', 'Calidad del catálogo'] }
    ]
  },
  {
    id: 'operaciones', nombre: 'Operaciones de venta', icono: 'pi pi-sync',
    descripcion: 'Documentos y procesos que forman el flujo comercial con tus clientes.',
    opciones: [
      { id: 'presupuestos', nombre: 'Presupuestos', descripcion: 'Crea ofertas, genera su PDF, envíalas al cliente y controla su aceptación.', icono: 'pi pi-file-edit', ruta: 'Presupuestos', color: '#ffffff', fondo: 'linear-gradient(135deg, #8d78dc, #6250ad)', disponible: true, funciones: ['Envío por correo', 'Indicadores comerciales'] },
      { id: 'pedidos', nombre: 'Pedidos de venta', descripcion: 'Controla cantidades pendientes, entregadas, facturadas y canceladas.', icono: 'pi pi-shopping-cart', ruta: 'Pedidos', color: '#ffffff', fondo: 'linear-gradient(135deg, #f3ae48, #dc7c22)', disponible: true, funciones: ['Plazos y recordatorios', 'Entregas parciales'] },
      { id: 'albaranes', nombre: 'Albaranes de venta', descripcion: 'Prepara salidas y registra la recogida. Factura sólo las líneas por cantidades entregadas.', icono: 'pi pi-truck', ruta: 'Albaranes', color: '#ffffff', fondo: 'linear-gradient(135deg, #42b99b, #16846e)', disponible: true, funciones: ['Justificantes y correo', 'Facturación agrupada'] },
      { id: 'facturas', nombre: 'Facturas de venta', descripcion: 'Factura desde pedidos, albaranes o manualmente; consulta vencimientos, recordatorios internos, cobros, trazabilidad y documentación AEAT. Asistente de consulta de solo lectura disponible como piloto.', icono: 'pi pi-receipt', ruta: 'Facturas', color: '#ffffff', fondo: 'linear-gradient(135deg, #e46e8e, #b74267)', disponible: true, funciones: ['Vencimientos y recordatorios', 'Asistente de consulta · piloto'] },
      { id: 'rectificativas', nombre: 'Rectificativas', descripcion: 'Gestiona abonos y correcciones vinculadas a las facturas de venta.', icono: 'pi pi-undo', ruta: 'Rectificativas', color: '#ffffff', fondo: 'linear-gradient(135deg, #e56b6f, #bd3e43)', disponible: false }
    ]
  },
  {
    id: 'configuracion', nombre: 'Configuración comercial', icono: 'pi pi-sliders-h',
    descripcion: 'Parámetros que determinan el funcionamiento del circuito de ventas.',
    opciones: [
      { id: 'ajustes', nombre: 'Ajustes de Ventas', descripcion: 'Configuración de facturación, VeriFactu, PDF, QR y envíos automáticos.', icono: 'pi pi-cog', ruta: 'AjustesVentas', color: '#ffffff', fondo: 'linear-gradient(135deg, #87909f, #596273)', disponible: true, funciones: ['Entorno protegido', 'Reintentos y código QR'] }
    ]
  }
];

function abrirOpcion(opcion: OpcionVenta): void {
  if (opcion.disponible) router.push({ name: opcion.ruta });
}
</script>

<style scoped>
.sales-hub { width: 100%; padding: 18px 16px 94px; color: #243044; }
.sales-toolbar { position:relative; isolation:isolate; overflow:hidden; display:flex; align-items:center; justify-content:space-between; gap:24px; padding:15px 20px; border:1px solid #e3e8d2; border-radius:15px; background:#fff; box-shadow:0 6px 18px rgba(31,41,55,.055); }
.sales-toolbar::after { content:""; position:absolute; z-index:0; width:300px; height:300px; right:20px; top:50%; transform:translateY(-50%); background:url('/logos/logo512.png') center/contain no-repeat; filter:grayscale(1); opacity:.075; pointer-events:none; }
.sales-toolbar > * { position:relative; z-index:1; }
.toolbar-title { display: flex; align-items: center; gap: 14px; }
.app-icon { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 12px; color: #fff; background: linear-gradient(135deg,#b1d70e,#719808); box-shadow: 0 7px 16px rgba(113,152,8,.22); }
.app-icon i { font-size: 1.25rem; }
.breadcrumb { color: #8a93a2; font-size: .82rem; font-weight: 650; }
.toolbar-title h1 { margin: 3px 0 0; color: #202939; font-size: 1.45rem; }
.sales-flow{display:flex;align-items:center;justify-content:space-between;gap:1.5rem;margin-top:14px;padding:12px 16px;border:1px solid #dfe8c8;border-left:4px solid #9cc10a;border-radius:11px;background:#fbfdf7}.flow-copy span,.flow-copy small{display:block}.flow-copy span{color:#44522f;font-size:.86rem;font-weight:800}.flow-copy small{margin-top:.15rem;color:#7d8797;font-size:.75rem}.flow-steps{display:flex;align-items:center;gap:.35rem}.flow-steps>i{color:#aab39d;font-size:.7rem}.flow-steps button{display:flex;align-items:center;gap:.35rem;padding:.45rem .6rem;border:0;border-radius:7px;color:#53623d;background:#f0f5e5;font:inherit;font-size:.75rem;font-weight:700;cursor:pointer}.flow-steps button:hover{color:#3f521e;background:#e7efcf}.flow-steps button i{color:#7d9e0b}
.app-section { margin-top: 28px; }
.section-title { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 12px; }
.section-title>div { display: flex; align-items: center; gap: 8px; }
.section-title>div>i { color: #875a7b; font-size: .9rem; }
.section-title h2 { margin: 0; font-size: 1rem; }
.section-title p { margin: 0; color: #8a93a2; font-size: .86rem; }
.app-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); overflow: hidden; border: 1px solid #dfe4ea; border-radius: 12px; background: #fff; box-shadow: 0 3px 11px rgba(30,41,59,.045); }
.app-card { display: flex; align-items: center; gap: 15px; min-height: 128px; padding: 17px 20px; border: 0; border-right: 1px solid #edf0f3; border-bottom: 1px solid #edf0f3; color: inherit; background: #fff; text-align: left; cursor: pointer; transition: background 150ms ease; }
.app-card:nth-child(2n) { border-right: 0; }
.app-card:hover:not(:disabled) { background: #faf8fa; }
.app-card:focus-visible { position: relative; z-index: 1; outline: 2px solid #875a7b; outline-offset: -2px; }
.app-card--disabled { cursor: default; opacity: .58; }
.app-card-icon { display: grid; width: 52px; height: 52px; flex: 0 0 auto; place-items: center; border-radius: 12px; box-shadow: inset 0 1px rgba(255,255,255,.25),0 4px 10px rgba(38,48,68,.12); }
.app-card-icon i { font-size: 1.35rem; }
.app-card-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 5px; }
.app-card-heading { display: flex; align-items: center; gap: 8px; }
.app-card-heading strong { font-size: 1.02rem; }
.app-card-copy small { color: #778192; font-size: .86rem; line-height: 1.4; }
.soon-badge { padding: 3px 6px; border-radius: 5px; color: #786a75; background: #eee8ed; font-size: .66rem; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.available-badge{padding:3px 6px;border-radius:5px;color:#55730b;background:#edf5d9;font-size:.64rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase}.feature-list{display:flex;flex-wrap:wrap;gap:.3rem .7rem;margin-top:.1rem}.feature-list>span{display:inline-flex;align-items:center;gap:.25rem;color:#6e7867;font-size:.68rem}.feature-list i{color:#86a906;font-size:.58rem}
.card-arrow { color: #875a7b; font-size: .8rem; }
.card-lock { color: #a3aab5; font-size: .72rem; }
@media (max-width:900px){.sales-flow{align-items:flex-start;flex-direction:column}.flow-steps{width:100%;justify-content:center}}
@media (max-width:680px) { .sales-hub { padding: 18px 15px 84px; } .sales-toolbar::after { width:220px; height:220px; right:-25px; opacity:.05; }.app-grid { grid-template-columns: 1fr; } .app-card { border-right: 0; } .section-title { align-items: flex-start; flex-direction: column; gap: 5px; }.flow-copy small{display:none}.flow-steps{justify-content:space-between}.flow-steps button span{display:none}.flow-steps button{padding:.5rem .7rem}.app-card-heading{flex-wrap:wrap} }
</style>
