<template>
  <main class="purchases-hub">
    <header class="purchases-toolbar">
      <div class="toolbar-title">
        <div class="app-icon"><i class="pi pi-shopping-cart"></i></div>
        <div>
          <span class="breadcrumb">KiwiKERP / Compras</span>
          <h1>Módulo de Compras</h1>
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

    <section class="purchase-flow" aria-label="Flujo de compras">
      <div class="flow-copy">
        <span>Flujo de compras</span>
        <small>Del albarán del proveedor a la factura y su pago. Sin VeriFactu: son facturas recibidas.</small>
      </div>
      <div class="flow-steps">
        <button v-if="can(PERM.PURCHASE_NAV_DELIVERY)" type="button" @click="router.push({ name: 'AlbaranesCompra' })">
          <i class="pi pi-truck"></i><span>Albarán</span></button
        ><i class="pi pi-angle-right"></i>
        <button v-if="can(PERM.PURCHASE_NAV_INVOICES)" type="button" @click="router.push({ name: 'FacturasCompra' })">
          <i class="pi pi-receipt"></i><span>Factura</span>
        </button>
      </div>
    </section>

    <section class="kpi-row" aria-label="Indicadores de compras">
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

    <section v-for="grupo in gruposVisibles" :key="grupo.id" class="app-section">
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
import { useSecurityStore } from "@/stores/securityStore";
import { PERM } from "@/services/Frm_Main/permissions";

interface OpcionCompra {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  ruta: string;
  color: string;
  fondo: string;
  disponible: boolean;
  funciones?: string[];
  perm?: string;
}

const router = useRouter();
const auth = useAuthStore();
const securityStore = useSecurityStore();
const can = (perm: string) => auth.user?.admin === true || securityStore.hasPermission(perm);
const api = axios.create();
api.interceptors.request.use((config) => {
  Object.assign(config.headers, auth.portalRequestConfig().headers);
  return config;
});
const fmt = (n: number) =>
  Number(n ?? 0).toLocaleString("es-ES", { maximumFractionDigits: 0 });
const stats = reactive<Record<string, any>>({
  deliveries: null,
  invoices: null,
});
const kpiCards = computed(() => {
  const d = stats.deliveries;
  const i = stats.invoices;
  const all = [
    {
      key: "deliveries",
      route: "AlbaranesCompra",
      icon: "pi pi-truck",
      gradient: "linear-gradient(135deg,#e8a25c,#c96a1e)",
      label: "Albaranes pendientes",
      value: d === null ? null : Number(d.pendingCount ?? d.pending ?? 0),
      sub: d === null ? "Mercancía por facturar" : `${fmt(d.invoicedCount ?? 0)} facturados`,
    },
    {
      key: "invoices",
      route: "FacturasCompra",
      icon: "pi pi-receipt",
      gradient: "linear-gradient(135deg,#e46e8e,#b74267)",
      label: "Facturas por pagar",
      value: i === null ? null : Number(i.pendingCount ?? i.pending ?? 0),
      sub: i === null ? "Pendiente de pago" : `${fmt(i.overdueCount ?? 0)} vencidas`,
    },
  ];
  const KPI_PERM: Record<string, string> = {
    deliveries: PERM.PURCHASE_NAV_DELIVERY,
    invoices: PERM.PURCHASE_NAV_INVOICES,
  };
  return all.filter((k) => can(KPI_PERM[k.key]));
});
async function loadStats() {
  const settled = await Promise.allSettled([
    api.get(backendUrl("/WebGetPurchasesDeliveryStatistics")),
    api.get(backendUrl("/WebGetPurchasesInvoiceStatistics")),
  ]);
  stats.deliveries = settled[0].status === "fulfilled" ? settled[0].value.data : null;
  stats.invoices = settled[1].status === "fulfilled" ? settled[1].value.data : null;
}
onMounted(loadStats);

const gruposCompras: Array<{
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  opciones: OpcionCompra[];
}> = [
  {
    id: "maestros",
    nombre: "Datos maestros",
    icono: "pi pi-database",
    descripcion: "Proveedores y catálogo compartidos con Ventas.",
    opciones: [
      {
        id: "entidades",
        nombre: "Proveedores",
        descripcion: "Entidades proveedoras, contactos, documentación y visión de gasto.",
        icono: "pi pi-users",
        ruta: "Clientes",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #38a4d8, #2875b6)",
        disponible: true,
        funciones: ["Reutiliza Entidades", "Notas y documentos"],
      },
      {
        id: "articulos",
        nombre: "Artículos y servicios",
        descripcion: "Catálogo compartido; en compras manda el precio del proveedor.",
        icono: "pi pi-box",
        ruta: "Productos",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #b1d70e, #719808)",
        disponible: true,
        funciones: ["Coste por proveedor", "Calidad del catálogo"],
      },
    ],
  },
  {
    id: "operaciones",
    nombre: "Operaciones de compra",
    icono: "pi pi-sync",
    descripcion: "Registro de lo que llega del proveedor y lo que factura.",
    opciones: [      {
        id: "albaranes",
        nombre: "Albaranes de compra",
        descripcion: "Registra el albarán del proveedor y su recepción de mercancía.",
        icono: "pi pi-truck",
        ruta: "AlbaranesCompra",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #e8a25c, #c96a1e)",
        disponible: true,
        funciones: ["Nº albarán proveedor", "Recepción y facturación"],
      },
      {
        id: "facturas",
        nombre: "Facturas de compra",
        descripcion: "Registra la factura recibida, sus vencimientos y pagos.",
        icono: "pi pi-receipt",
        ruta: "FacturasCompra",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #e46e8e, #b74267)",
        disponible: true,
        funciones: ["Vencimientos y pagos", "Sin VeriFactu"],
      },
    ],
  },
  {
    id: "configuracion",
    nombre: "Configuración de compras",
    icono: "pi pi-sliders-h",
    descripcion: "Parámetros que determinan el funcionamiento del circuito de compras.",
    opciones: [
      {
        id: "ajustes",
        nombre: "Ajustes de Compras",
        descripcion: "Series de numeración de albaranes y facturas de proveedor.",
        icono: "pi pi-cog",
        ruta: "AjustesCompras",
        color: "#ffffff",
        fondo: "linear-gradient(135deg, #87909f, #596273)",
        disponible: true,
        funciones: ["Series por documento"],
      },
    ],
  },
];

const RUTA_PERM: Record<string, string> = {
  AlbaranesCompra: PERM.PURCHASE_NAV_DELIVERY,
  FacturasCompra: PERM.PURCHASE_NAV_INVOICES,
  PedidosCompra: PERM.PURCHASE_NAV_ORDERS,
  AjustesCompras: PERM.PURCHASE_SETTINGS,
};
function opcionVisible(o: OpcionCompra): boolean {
  if (o.ruta === "Productos") return auth.user?.admin === true || securityStore.hasModule("PRODUCTS");
  if (o.ruta === "Clientes") return can(PERM.PURCHASE_OPTIONS);
  const p = (o as any).perm ?? RUTA_PERM[o.ruta];
  return !p || can(p);
}
const gruposVisibles = computed(() =>
  gruposCompras
    .map((g) => ({ ...g, opciones: g.opciones.filter(opcionVisible) }))
    .filter((g) => g.opciones.length > 0),
);
function abrirOpcion(opcion: OpcionCompra): void {
  if (!opcion.disponible) return;
  // Vistas compartidas con Ventas (Entidades, Artículos): indicar el origen
  // para que el botón de vuelta diga "Compras".
  if (opcion.ruta === "Clientes" || opcion.ruta === "Productos") {
    router.push({ name: opcion.ruta, query: { from: "compras" } });
    return;
  }
  router.push({ name: opcion.ruta });
}
</script>

<style scoped>
.purchases-hub {
  width: 100%;
  padding: 18px 16px 94px;
  color: #243044;
  background: linear-gradient(180deg, #fdf8f4 0%, #fff 32%);
}
.purchases-toolbar {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 15px 20px;
  border: 1px solid #f0ddc8;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(31, 41, 55, 0.055);
}
.purchases-toolbar::after {
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
.purchases-toolbar > * {
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
  background: linear-gradient(135deg, #e8a25c, #c96a1e);
  box-shadow: 0 7px 16px rgba(201, 106, 30, 0.22);
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
.purchase-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  margin-top: 14px;
  padding: 12px 16px;
  border: 1px solid #f0ddc8;
  border-left: 4px solid #dc7c22;
  border-radius: 11px;
  background: #fffaf5;
  box-shadow: 0 4px 14px rgba(55, 75, 30, 0.05);
}
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid #f0ddc8;
  border-radius: 12px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.05);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}
.kpi-card:hover:not(:disabled),
.kpi-card:focus-visible {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(31, 41, 55, 0.1);
}
.kpi-icon {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
  color: #fff;
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.25), 0 4px 10px rgba(38, 48, 68, 0.12);
}
.kpi-icon i {
  font-size: 1.2rem;
}
.kpi-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}
.kpi-copy strong {
  font-size: 1.35rem;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.kpi-copy > span {
  font-size: 0.82rem;
  font-weight: 700;
  color: #202939;
}
.kpi-copy small {
  color: #7d8797;
  font-size: 0.72rem;
  margin-top: 2px;
}
.app-section {
  margin-top: 22px;
}
.flow-copy span,
.flow-copy small {
  display: block;
}
.flow-copy span {
  color: #5c4326;
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
  color: #c9b6a3;
  font-size: 0.7rem;
}
.flow-steps button {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.6rem;
  border: 0;
  border-radius: 7px;
  color: #5c4326;
  background: #fdf0e3;
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}
.flow-steps button:hover {
  color: #4a3419;
  background: #fbe4cc;
}
.flow-steps button i {
  color: #c96a1e;
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
  color: #dc7c22;
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
  background: #fbf8f4;
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
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}
.app-card:hover:not(:disabled),
.app-card:focus-visible {
  z-index: 1;
  transform: translateY(-3px);
  border-color: #f0ddc8;
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
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.25), 0 4px 10px rgba(38, 48, 68, 0.12);
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
  color: #c96a1e;
  font-size: 0.58rem;
}
.card-arrow {
  color: #dc7c22;
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
@media (max-width: 680px) {
  .app-grid,
  .kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
