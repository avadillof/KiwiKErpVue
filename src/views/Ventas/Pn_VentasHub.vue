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
      <Button
        label="Inicio"
        icon="pi pi-home"
        text
        severity="secondary"
        @click="router.push({ name: 'Dashboard' })"
      />
    </header>

    <section class="sales-flow" aria-label="Flujo comercial">
      <div class="flow-copy">
        <span>Flujo comercial</span
        ><small
          >Del presupuesto al cobro, conservando la trazabilidad entre
          documentos.</small
        >
      </div>
      <div class="flow-steps">
        <button type="button" @click="router.push({ name: 'Presupuestos' })">
          <i class="pi pi-file-edit"></i><span>Presupuesto</span></button
        ><i class="pi pi-angle-right"></i>
        <button type="button" @click="router.push({ name: 'Pedidos' })">
          <i class="pi pi-shopping-cart"></i><span>Pedido</span></button
        ><i class="pi pi-angle-right"></i>
        <button type="button" @click="router.push({ name: 'Albaranes' })">
          <i class="pi pi-truck"></i><span>Albarán</span></button
        ><i class="pi pi-angle-right"></i>
        <button type="button" @click="router.push({ name: 'Facturas' })">
          <i class="pi pi-receipt"></i><span>Factura</span>
        </button>
        <i class="pi pi-angle-right"></i>
        <button type="button" @click="router.push({ name: 'Rectificativas' })">
          <i class="pi pi-undo"></i><span>Rectificaciones</span>
        </button>
      </div>
    </section>

    <section class="kpi-row" aria-label="Indicadores de ventas">
      <button
        v-for="k in kpiCards"
        :key="k.key"
        type="button"
        class="kpi-card"
        @click="router.push({ name: k.route })"
      >
        <span class="kpi-icon" :style="{ background: k.gradient }"
          ><i :class="k.icon" /></span
        >
        <span class="kpi-copy">
          <strong>{{ k.value == null ? "—" : fmt(k.value) }}</strong>
          <span>{{ k.label }}</span>
          <small>{{ k.sub }}</small>
        </span>
      </button>
    </section>

    <section v-for="grupo in gruposVentas" :key="grupo.id" class="app-section">
      <div class="section-title">
        <div>
          <i :class="grupo.icono"></i>
          <h2>{{ grupo.nombre }}</h2>
        </div>
        <p>{{ grupo.descripcion }}</p>
      </div>

      <div class="app-grid">
        <button
          v-for="opcion in grupo.opciones"
          :key="opcion.id"
          type="button"
          class="app-card"
          :class="{ 'app-card--disabled': !opcion.disponible }"
          :disabled="!opcion.disponible"
          @click="abrirOpcion(opcion)"
        >
          <span
            class="app-card-icon"
            :style="{ background: opcion.fondo, color: opcion.color }"
          >
            <i :class="opcion.icono"></i>
          </span>
          <span class="app-card-copy">
            <span class="app-card-heading">
              <strong>{{ opcion.nombre }}</strong>
              <span v-if="!opcion.disponible" class="soon-badge"
                >Próximamente</span
              >
            </span>
            <small>{{ opcion.descripcion }}</small>
            <span v-if="opcion.funciones?.length" class="feature-list"
              ><span v-for="funcion in opcion.funciones" :key="funcion"
                ><i class="pi pi-check"></i>{{ funcion }}</span
              ></span
            >
          </span>
          <i
            :class="
              opcion.disponible
                ? 'pi pi-angle-right card-arrow'
                : 'pi pi-lock card-lock'
            "
          ></i>
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import Button from "primevue/button";
import { computed, onMounted, reactive } from "vue";
import axios from "axios";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";

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
const auth = useAuthStore();
const api = axios.create();
api.interceptors.request.use((config) => {
  Object.assign(config.headers, auth.portalRequestConfig().headers);
  return config;
});
const fmt = (n: number) =>
  Number(n ?? 0).toLocaleString("es-ES", { maximumFractionDigits: 0 });
const stats = reactive<Record<string, any>>({
  quotes: null,
  orders: null,
  invoices: null,
  rects: null,
});
const kpiCards = computed(() => {
  const q = stats.quotes,
    o = stats.orders,
    i = stats.invoices,
    r = stats.rects;
  // Emitida = todo lo que no sea borrador ni cancelada (igual que el Back:
  // cubre "Confirmada / Confirming" y estados legacy como "Realizado").
  const isRectIssued = (x: any) =>
    !!x &&
    x.state !== "Borrador / Draft" &&
    x.state !== "Para Aprobar / To Approved Invoice" &&
    x.state !== "Cancelada / Canceled";
  const rectPending = Array.isArray(r)
    ? r.reduce(
        (s, x) => s + (isRectIssued(x) && x.paid !== true ? Number(x.count || 0) : 0),
        0,
      )
    : null;
  const rectPendingAmount = Array.isArray(r)
    ? r.reduce(
        (s, x) => s + (isRectIssued(x) && x.paid !== true ? Math.abs(Number(x.total || 0)) : 0),
        0,
      )
    : null;
  const orderPending =
    o === null
      ? null
      : Number(o.deliveryPendingLines || 0) + Number(o.directInvoiceLines || 0);
  return [
    {
      key: "quotes",
      route: "Presupuestos",
      icon: "pi pi-file-edit",
      gradient: "linear-gradient(135deg,#8d78dc,#6250ad)",
      label: "Presupuestos abiertos",
      value: q === null ? null : Number(q.pendingCount || 0),
      sub: q === null ? "Cartera" : `${fmt(q.approvedCount)} aprobados`,
    },
    {
      key: "orders",
      route: "Pedidos",
      icon: "pi pi-shopping-cart",
      gradient: "linear-gradient(135deg,#f3ae48,#dc7c22)",
      label: "Pedidos pendientes",
      value: orderPending,
      sub:
        o === null ? "Líneas por entregar / facturar" : `${fmt(o.completedOrders)} completados`,
    },
    {
      key: "invoices",
      route: "Facturas",
      icon: "pi pi-receipt",
      gradient: "linear-gradient(135deg,#e46e8e,#b74267)",
      label: "Facturas por cobrar",
      value: i === null ? null : Number(i.pendingCount || 0),
      sub: i === null ? "Pendiente de cobro" : `${fmt(i.overdueCount)} vencidas`,
    },
    {
      key: "rects",
      route: "Rectificativas",
      icon: "pi pi-undo",
      gradient: "linear-gradient(135deg,#e56b6f,#bd3e43)",
      label: "Rectificativas pendientes de pago",
      value: rectPending,
      sub: rectPending === null ? "Abonos y correcciones" : `${fmt(rectPendingAmount)} € por pagar`,
    },
  ];
});
async function loadStats() {
  const paths = [
    "/WebGetSalesQuoteStatistics",
    "/WebGetSalesOrderStatistics",
    "/WebGetSalesInvoiceStatistics",
    "/WebGetSalesRecInvoiceStatistics",
  ];
  const settled = await Promise.allSettled(paths.map((p) => api.get(backendUrl(p))));
  const [q, o, f, r] = settled.map((s) => (s.status === "fulfilled" ? s.value.data : null));
  stats.quotes = q;
  stats.orders = o;
  stats.invoices = f;
  stats.rects = r;
}
onMounted(loadStats);

const gruposVentas: Array<{
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  opciones: OpcionVenta[];
}> = [
  {
    id: "maestros",
    nombre: "Datos maestros",
    icono: "pi pi-database",
    descripcion:
      "La información base que se utiliza en todos los documentos comerciales.",
    opciones: [
      {
        id: "tarifas",
        nombre: "Lista de precios",
        descripcion:
          "Tarifas compartidas por clientes, con precios fijos y descuentos por producto o familia.",
        icono: "pi pi-tags",
        ruta: "ListaPrecios",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #b1d70e, #719808)",
        disponible: true,
        funciones: ["Reglas sin acumulación", "Consulta del precio aplicado"],
      },
      {
        id: "entidades",
        nombre: "Entidades",
        descripcion:
          "Clientes, proveedores, contactos, documentación y visión comercial consolidada.",
        icono: "pi pi-users",
        ruta: "Clientes",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #38a4d8, #2875b6)",
        disponible: true,
        funciones: ["Indicadores en tiempo real", "Notas y documentos"],
      },
      {
        id: "articulos",
        nombre: "Artículos y servicios",
        descripcion:
          "Catálogo comercial, clasificación y seguimiento por producto.",
        icono: "pi pi-box",
        ruta: "Productos",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #b1d70e, #719808)",
        disponible: true,
        funciones: ["Actividad comercial", "Calidad del catálogo"],
      },
    ],
  },
  {
    id: "operaciones",
    nombre: "Operaciones de venta",
    icono: "pi pi-sync",
    descripcion:
      "Documentos y procesos que forman el flujo comercial con tus clientes.",
    opciones: [
      {
        id: "presupuestos",
        nombre: "Presupuestos",
        descripcion:
          "Crea ofertas, genera su PDF, envíalas al cliente y controla su aceptación.",
        icono: "pi pi-file-edit",
        ruta: "Presupuestos",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #8d78dc, #6250ad)",
        disponible: true,
        funciones: ["Envío por correo", "Indicadores comerciales"],
      },
      {
        id: "pedidos",
        nombre: "Pedidos de venta",
        descripcion:
          "Controla cantidades pendientes, entregadas, facturadas y canceladas.",
        icono: "pi pi-shopping-cart",
        ruta: "Pedidos",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #f3ae48, #dc7c22)",
        disponible: true,
        funciones: ["Plazos y recordatorios", "Entregas parciales"],
      },
      {
        id: "albaranes",
        nombre: "Albaranes de venta",
        descripcion:
          "Prepara salidas y registra la recogida. Factura sólo las líneas por cantidades entregadas.",
        icono: "pi pi-truck",
        ruta: "Albaranes",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #42b99b, #16846e)",
        disponible: true,
        funciones: ["Justificantes y correo", "Facturación agrupada"],
      },
      {
        id: "facturas",
        nombre: "Facturas de venta",
        descripcion:
          "Emite facturas desde pedidos, albaranes o manualmente y consulta vencimientos, cobros, VeriFactu y trazabilidad.",
        icono: "pi pi-receipt",
        ruta: "Facturas",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #e46e8e, #b74267)",
        disponible: true,
        funciones: [
          "Vencimientos y cobros",
          "VeriFactu y trazabilidad",
        ],
      },
      {
        id: "rectificativas",
        nombre: "Rectificativas",
        descripcion:
          "Gestiona abonos y correcciones vinculadas a las facturas de venta.",
        icono: "pi pi-undo",
        ruta: "Rectificativas",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #e56b6f, #bd3e43)",
        disponible: true,
        funciones: ["Abonos parciales", "Emisión y trazabilidad"],
      },
    ],
  },
  {
    id: "informes",
    nombre: "Informes",
    icono: "pi pi-chart-bar",
    descripcion:
      "Reportes parametrizados del circuito comercial, cada uno con su código único RPT.",
    opciones: [
      {
        id: "informes-ventas",
        nombre: "Reportes de Ventas",
        descripcion:
          "Lista de artículos de venta y próximos informes del circuito comercial.",
        icono: "pi pi-chart-bar",
        ruta: "InformesVentas",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #16a085, #0e7c66)",
        disponible: true,
        funciones: ["Código RPT único", "Filtros por informe"],
      },
    ],
  },
  {
    id: "configuracion",
    nombre: "Configuración comercial",
    icono: "pi pi-sliders-h",
    descripcion:
      "Parámetros que determinan el funcionamiento del circuito de ventas.",
    opciones: [
      {
        id: "ajustes",
        nombre: "Ajustes de Ventas",
        descripcion:
          "Configuración de facturación, VeriFactu, PDF, QR y envíos automáticos.",
        icono: "pi pi-cog",
        ruta: "AjustesVentas",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #87909f, #596273)",
        disponible: true,
        funciones: ["Entorno protegido", "Reintentos y código QR"],
      },
    ],
  },
];

function abrirOpcion(opcion: OpcionVenta): void {
  if (opcion.disponible) router.push({ name: opcion.ruta });
}
</script>

<style scoped>
.sales-hub {
  width: 100%;
  padding: 18px 16px 94px;
  color: #243044;
  background: linear-gradient(180deg,#f8faf5 0%,#fff 32%);
}
.sales-toolbar {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 15px 20px;
  border: 1px solid #e3e8d2;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(31, 41, 55, 0.055);
}
.sales-toolbar::after {
  content: "";
  position: absolute;
  z-index: 0;
  width: 300px;
  height: 300px;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: url("/logos/logo512.png") center/contain no-repeat;
  filter: grayscale(1);
  opacity: 0.075;
  pointer-events: none;
}
.sales-toolbar > * {
  position: relative;
  z-index: 1;
}
.toolbar-title {
  display: flex;
  align-items: center;
  gap: 14px;
}
.app-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(135deg, #b1d70e, #719808);
  box-shadow: 0 7px 16px rgba(113, 152, 8, 0.22);
}
.app-icon i {
  font-size: 1.25rem;
}
.breadcrumb {
  color: #8a93a2;
  font-size: 0.82rem;
  font-weight: 650;
}
.toolbar-title h1 {
  margin: 3px 0 0;
  color: #202939;
  font-size: 1.45rem;
}
.sales-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  margin-top: 14px;
  padding: 12px 16px;
  border: 1px solid #dfe8c8;
  border-left: 4px solid #9cc10a;
  border-radius: 11px;
  background: #fbfdf7;
  box-shadow: 0 4px 14px rgba(55,75,30,.05);
}
.kpi-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px}
.kpi-card{display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid #e3e8d2;border-radius:12px;background:#fff;text-align:left;cursor:pointer;box-shadow:0 4px 14px rgba(31,41,55,.05);transition:transform .16s ease,box-shadow .16s ease}
.kpi-card:hover:not(:disabled),.kpi-card:focus-visible{transform:translateY(-3px);box-shadow:0 10px 24px rgba(31,41,55,.1)}
.kpi-icon{display:grid;width:46px;height:46px;flex:0 0 auto;place-items:center;border-radius:12px;color:#fff;box-shadow:inset 0 1px rgba(255,255,255,.25),0 4px 10px rgba(38,48,68,.12)}
.kpi-icon i{font-size:1.2rem}
.kpi-copy{display:flex;min-width:0;flex:1;flex-direction:column}
.kpi-copy strong{font-size:1.35rem;line-height:1.1;font-variant-numeric:tabular-nums}
.kpi-copy>span{font-size:.82rem;font-weight:700;color:#202939}
.kpi-copy small{color:#7d8797;font-size:.72rem;margin-top:2px}
.app-section{margin-top:22px}
.flow-copy span,
.flow-copy small {
  display: block;
}
.flow-copy span {
  color: #44522f;
  font-size: 0.86rem;
  font-weight: 800;
}
.flow-copy small {
  margin-top: 0.15rem;
  color: #7d8797;
  font-size: 0.75rem;
}
.flow-steps {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.35rem;
}
.flow-steps > i {
  color: #aab39d;
  font-size: 0.7rem;
}
.flow-steps button {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.6rem;
  border: 0;
  border-radius: 7px;
  color: #53623d;
  background: #f0f5e5;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}
.flow-steps button:hover {
  color: #3f521e;
  background: #e7efcf;
}
.flow-steps button i {
  color: #7d9e0b;
}
.app-section {
  margin-top: 28px;
}
.section-title {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 12px;
}
.section-title > div {
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-title > div > i {
  color: #9cc10a;
  font-size: 0.9rem;
}
.section-title h2 {
  margin: 0;
  font-size: 1rem;
}
.section-title p {
  margin: 0;
  color: #8a93a2;
  font-size: 0.86rem;
}
.app-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  padding: 14px;
  border: 1px solid #dfe4ea;
  border-radius: 14px;
  background: #f7f9f4;
  box-shadow: 0 3px 11px rgba(30, 41, 59, 0.045);
}
.app-card {
  display: flex;
  align-items: center;
  gap: 15px;
  min-height: 132px;
  padding: 17px 18px;
  border: 1px solid #eef1f4;
  border-radius: 12px;
  color: inherit;
  background: #fff;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.05);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease,
    border-color 0.16s ease,
    background 150ms ease;
}
.app-card:hover:not(:disabled),
.app-card:focus-visible {
  z-index: 1;
  transform: translateY(-3px);
  border-color: #dceac0;
  background: #fff;
  box-shadow: 0 10px 24px rgba(31, 41, 55, 0.1);
}
.app-card--disabled {
  cursor: default;
  opacity: 0.58;
  box-shadow: none;
}
.app-card-icon {
  display: grid;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
  box-shadow:
    inset 0 1px rgba(255, 255, 255, 0.25),
    0 4px 10px rgba(38, 48, 68, 0.12);
}
.app-card-icon i {
  font-size: 1.35rem;
}
.app-card-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}
.app-card-heading {
  display: flex;
  align-items: center;
  gap: 8px;
}
.app-card-heading strong {
  font-size: 1.02rem;
}
.app-card-copy small {
  color: #778192;
  font-size: 0.86rem;
  line-height: 1.4;
}
.soon-badge {
  padding: 3px 6px;
  border-radius: 5px;
  color: #786a75;
  background: #eee8ed;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.7rem;
  margin-top: 0.1rem;
}
.feature-list > span {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #6e7867;
  font-size: 0.68rem;
}
.feature-list i {
  color: #86a906;
  font-size: 0.58rem;
}
.card-arrow {
  color: #9cc10a;
  font-size: 0.8rem;
}
.card-lock {
  color: #a3aab5;
  font-size: 0.72rem;
}
@media (max-width: 1180px) {
  .app-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .kpi-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .sales-flow {
    align-items: flex-start;
    flex-direction: column;
  }
  .flow-steps {
    width: 100%;
    justify-content: center;
  }
  .app-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 680px) {
  .sales-hub {
    padding: 18px 15px 84px;
  }
  .sales-toolbar::after {
    width: 220px;
    height: 220px;
    right: -25px;
    opacity: 0.05;
  }
  .app-grid {
    grid-template-columns: 1fr;
  }
  .kpi-row {
    grid-template-columns: 1fr;
  }
  .app-card {
    border-right: 0;
  }
  .section-title {
    align-items: flex-start;
    flex-direction: column;
    gap: 5px;
  }
  .flow-copy small {
    display: none;
  }
  .flow-steps {
    justify-content: space-between;
  }
  .flow-steps button span {
    display: none;
  }
  .flow-steps button {
    padding: 0.5rem 0.7rem;
  }
  .app-card-heading {
    flex-wrap: wrap;
  }
}
</style>
