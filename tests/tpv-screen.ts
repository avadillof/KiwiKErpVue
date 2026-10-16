// Isolated UI fixture: every axios request is intercepted; no ERP data is read or written.
import { createApp, h } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHashHistory, RouterView } from "vue-router";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import axios, { AxiosError } from "axios";
import Tpv from "../src/views/TPV/Frm_Tpv.vue";
import TpvAccess from "../src/views/Frm_Login/Frm_TpvAccess.vue";
import "../src/assets/styles/global.css";
import "../src/assets/styles/Frm_Login/frm_login.css";
import KiwiKTheme from "../src/theme/KiwiKTheme";
import { useAuthStore } from "../src/stores/authStore";
import { useSecurityStore } from "../src/stores/securityStore";
import "primeicons/primeicons.css";
const invoiceDrafts = new Map<number, any>();
const families = [
  { id: 1, name: "Familia A · prueba" },
  { id: 2, name: "Familia B · prueba" },
];
const products = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Artículo de prueba ${String(i + 1).padStart(2, "0")}`,
  code: `TEST-${i + 1}`,
  barcode: i === 1 || i === 2 ? "DUPLICADO" : `900${i + 1}`,
  familyId: i < 15 ? 1 : 2,
  unitGross: 12.1,
  currency: "EUR",
  tax: 21,
  image:
    i % 3
      ? undefined
      : "data:image/svg+xml," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="140"><rect width="220" height="140" fill="#edf3df"/><rect x="78" y="30" width="64" height="80" rx="12" fill="#9cc10a"/><text x="110" y="77" text-anchor="middle" fill="#253000" font-family="sans-serif" font-size="18">TEST</text></svg>',
        ),
}));
const barMode = new URLSearchParams(location.search).get("mode") === "bar";
// Logout is the only fetch-based auth call; keep it isolated too.
window.fetch = async () => new Response("", { status: 200 });
const halls = [
  {
    id: 1,
    name: "Salón · prueba",
    zoneId: 1,
    tables: [
      {
        id: 1,
        code: "M01",
        name: "Mesa 1",
        seats: 4,
        state: "FREE",
        lines: 0,
        total: 0,
      },
      {
        id: 2,
        code: "M02",
        name: "Mesa 2",
        seats: 2,
        state: "FREE",
        lines: 0,
        total: 0,
      },
    ],
  },
  {
    id: 2,
    name: "Terraza · prueba",
    zoneId: 2,
    tables: [
      {
        id: 3,
        code: "T01",
        name: "Mesa terraza",
        seats: 4,
        state: "FREE",
        lines: 0,
        total: 0,
      },
    ],
  },
];
const tickets = new Map<
  number,
  { revision: string; state: string; lines: any[] }
>();
let revision = 0;
let simulateFailure =
  new URLSearchParams(location.search).get("fail") === "save";
const simulatedConflict =
  new URLSearchParams(location.search).get("fail") === "conflict";
function quote(id: number, quantity: number) {
  const netCents = Math.round(quantity * (quantity >= 3 ? 900 : 1000));
  const taxCents = Math.round(netCents * 0.21);
  return {
    ...products.find((p) => p.id === id),
    quantity,
    netCents,
    taxCents,
    totalCents: netCents + taxCents,
    unitGross: quantity >= 3 ? 10.89 : 12.1,
  };
}
const paidReceipts = new Map<string, any>();
const closureFixture = {
  openingId: 101,
  registerId: 1,
  zoneId: 1,
  zoneName: "Tienda Centro",
  registerName: "Caja principal",
  companyName: "PRUEBA LOCAL · SIN VALIDEZ",
  companyCif: "",
  openedAt: "2026-10-13T09:00:00",
  openedBy: "Operario prueba",
  openingFloat: 100,
  cashSales: 350,
  cardSales: 200,
  cashRefunds: 20,
  cardRefunds: 0,
  expectedCash: 430,
  ticketCount: 15,
  refundCount: 1,
  employees: [
    {
      name: "Operario prueba",
      cashSales: 350,
      cardSales: 200,
      cashRefunds: 20,
      cardRefunds: 0,
      ticketCount: 15,
      refundCount: 1,
    },
  ],
};
let closedFixture: any = null;
let presenceCalls = 0;
const contactFixtures = [
  {
    id: 901,
    name: "Contacto de prueba",
    nif: "12345678Z",
    phone: "600000000",
    email: "",
    address: "Calle de prueba 1",
    postal: "28001",
    city: "Madrid",
    province: "Madrid",
    country: "España",
  },
];
const contactRequests = new Map<string, unknown>();
let loseCheckoutResponse =
  new URLSearchParams(location.search).get("fail") === "checkout";
axios.defaults.adapter = async (config) => {
  const path = new URL(config.url!, location.origin).pathname;
  const params = config.params || {};
  let data: unknown;
  if (path.endsWith("/WebTpv/contacts")) {
    if (config.method === "post") {
      const body = JSON.parse(config.data);
      if (contactRequests.has(body.operationKey))
        data = contactRequests.get(body.operationKey);
      else {
        if (contactFixtures.some((c) => c.nif === body.nif))
          throw new AxiosError(
            "Duplicado",
            "ERR_BAD_REQUEST",
            config,
            undefined,
            {
              status: 409,
              data: "Ya existe un contacto con ese NIF.",
              statusText: "Conflict",
              headers: {},
              config,
            },
          );
        const created = { ...body, id: 902 + contactFixtures.length };
        contactFixtures.push(created);
        contactRequests.set(body.operationKey, created);
        data = created;
      }
    } else
      data = contactFixtures.filter((c) =>
        `${c.name} ${c.nif} ${c.phone}`
          .toLowerCase()
          .includes(String(params.query || "").toLowerCase()),
      );
    return { data, status: 200, statusText: "OK", headers: {}, config };
  }
  if (path.endsWith("/central")) {
    data = {
      updatedAt: new Date().toISOString(),
      todaySales: 1250,
      todayRefunds: 35,
      zones: [
        { id: 1, code: "CENTRO", name: "Tienda Centro", active: true },
        { id: 2, code: "TERRAZA", name: "Terraza", active: true },
      ],
      pendingReconciliations:
        closedFixture?.status === "PENDING_RECONCILIATION"
          ? [{ openingId: 101, zoneId: 1, registerName: "Caja principal" }]
          : [],
      registers: [
        {
          ...closureFixture,
          id: 1,
          name: "Caja principal",
          code: "C01",
          active: true,
          closedAt: closedFixture?.closedAt ?? null,
          pendingReconciliation:
            closedFixture?.status === "PENDING_RECONCILIATION",
          sales: 550,
          openTickets: 0,
          sessions: closedFixture
            ? []
            : [
                {
                  name: "Operario prueba",
                  lastSeen: new Date().toISOString(),
                  hasDraft: false,
                },
              ],
          operators: [{ name: "Operario prueba", tickets: 15, sales: 550 }],
        },
        {
          ...closureFixture,
          id: 2,
          zoneId: 1,
          name: "Caja auxiliar",
          code: "C02",
          active: true,
          openingId: null,
          closedAt: null,
          sales: 0,
          sessions: [],
          operators: [],
        },
        {
          ...closureFixture,
          id: 3,
          zoneId: 2,
          name: "Caja Terraza",
          code: "T01",
          active: true,
          openingId: 103,
          closedAt: null,
          sales: 700,
          expectedCash: 260,
          openTickets: 2,
          sessions: [
            {
              name: "María prueba",
              lastSeen: new Date().toISOString(),
              hasDraft: true,
            },
          ],
          operators: [{ name: "María prueba", tickets: 9, sales: 700 }],
        },
      ],
    };
  } else if (path.endsWith("/remote-close")) {
    const body = JSON.parse(config.data);
    closedFixture ||= {
      ...closureFixture,
      code: "Z-101",
      closedAt: "2026-10-13T18:00:00",
      closedBy: "Administrador prueba",
      countedCash: null,
      difference: null,
      reason: body.reason,
      status: "PENDING_RECONCILIATION",
      remote: true,
    };
    data = closedFixture;
  } else if (path.endsWith("/reconcile")) {
    const body = JSON.parse(config.data);
    closedFixture = {
      ...closedFixture,
      countedCash: body.amount,
      difference: body.amount - 430,
      status: "RECONCILED",
      reconciliationReason: body.reason,
      reconciledBy: -1,
      reconciledAt: "2026-10-14T09:00:00",
    };
    data = closedFixture;
  } else if (path.endsWith("/presence")) {
    if (
      closedFixture ||
      (new URLSearchParams(location.search).has("remotePresence") &&
        ++presenceCalls > 1)
    )
      throw new AxiosError("Caja cerrada", "ERR_BAD_REQUEST", config, null, {
        data: "Caja cerrada desde central",
        status: 409,
        statusText: "Conflict",
        headers: {},
        config,
      });
    data = { active: true };
  } else if (path.endsWith("/presence/leave")) data = { left: true };
  else if (/\/openings\/\d+\/summary$/.test(path)) data = closureFixture;
  else if (/\/openings\/\d+\/close$/.test(path)) {
    const body = JSON.parse(config.data);
    closedFixture ||= {
      ...closureFixture,
      code: "Z-101",
      closedAt: "2026-10-13T18:00:00",
      closedBy: "Administrador prueba",
      countedCash: body.amount,
      difference: body.amount - 430,
      reason: body.reason,
    };
    data = closedFixture;
  } else if (path.endsWith("/closures"))
    data = closedFixture ? [closedFixture] : [];
  else if (/\/charges\/\d+\/invoice$/.test(path)) {
    const chargeId = Number(path.split("/").at(-2));
    if (
      config.method === "post" &&
      new URLSearchParams(location.search).get("fail") === "invoice"
    ) {
      throw new AxiosError("Conflict", "ERR_BAD_REQUEST", config, null, {
        data: {
          status: 409,
          message: "Completa los datos fiscales del contacto: país.",
        },
        status: 409,
        statusText: "Conflict",
        headers: {},
        config,
      });
    }

    if (config.method === "post" && !invoiceDrafts.has(chargeId)) {
      const body = JSON.parse(config.data);
      invoiceDrafts.set(chargeId, {
        invoiceId: 1000 + chargeId,
        code: `DRAFT_TPV-${chargeId}`,
        state: "Borrador / Draft",
        customerName: "Contacto de prueba",
        contactId: body.contactId,
        rectifications:
          chargeId === 2
            ? [
                {
                  code: "DRAFT_RFC-2026/0001",
                  state: "Borrador / Draft",
                  total: -25,
                },
              ]
            : [],
      });
    }
    data = invoiceDrafts.get(chargeId) || {
      invoiceId: null,
      ...(chargeId === 1
        ? {
            customer: {
              id: 901,
              name: "Contacto de prueba",
              nif: "12345678Z",
              address: "Calle de prueba 1",
              postal: "28001",
              city: "Madrid",
              country: "España",
            },
          }
        : {}),
    };
  } else if (/\/openings\/\d+\/charges$/.test(path)) {
    if (params.code) {
      data =
        params.code === "T-123"
          ? [
              {
                chargeId: 123,
                code: "T-123",
                chargedAt: "2026-09-01T09:30:00",
                cashier: "José prueba",
                total: 12.1,
                currency: "EUR",
                refundedTotal: 0,
                lines: [
                  {
                    productId: 1,
                    name: "Artículo de prueba",
                    quantity: 1,
                    remainingQty: 1,
                    total: 12.1,
                    unitGross: 12.1,
                  },
                ],
              },
            ]
          : [];
    } else {
      data = [
        {
          chargeId: 1,
          code: "TEST-001",
          cashier: "José prueba",
          tableName: "Terraza 3",
          chargedAt: "2026-10-13T10:30:00",
          total: 12.1,
          currency: "EUR",
          refundedTotal: 0,
        },
        {
          chargeId: 2,
          code: "TEST-002",
          cashier: "Ana prueba",
          tableName: "Interior 1",
          chargedAt: "2026-10-13T11:00:00",
          total: 25,
          currency: "EUR",
          refundedTotal: 25,
        },
      ];
    }
  } else if (path.endsWith("/checkout")) {
    const body = JSON.parse(config.data);
    data = paidReceipts.get(body.operationKey);
    if (!data) {
      const rows = body.lines.map((l: any) => quote(l.productId, l.quantity));
      const total =
        rows.reduce((v: number, l: any) => v + l.totalCents, 0) / 100;
      const paid = body.payments.reduce((v: number, p: any) => v + p.amount, 0);
      data = {
        code: `TEST-${paidReceipts.size + 1}`,
        total,
        change: Math.round((paid - total) * 100) / 100,
        currency: "EUR",
        payments: body.payments,
        lines: rows,
      };
      paidReceipts.set(body.operationKey, data);
      if (loseCheckoutResponse) {
        loseCheckoutResponse = false;
        throw new AxiosError(
          "Respuesta perdida simulada",
          "ECONNABORTED",
          config,
        );
      }
    }
  } else if (path.endsWith("/myzones"))
    data = [
      { id: 1, code: "CENTRO", name: "Tienda Centro" },
      { id: 2, code: "TERRAZA", name: "Terraza" },
    ];
  else if (path.endsWith("/registers"))
    data = [
      {
        id: Number(params.zoneId),
        code: "C01",
        name: "Caja principal",
        openingId: Number(params.zoneId) === 1 ? 101 : null,
      },
    ];
  else if (/\/registers\/\d+\/enter$/.test(path)) {
    const id = Number(path.split("/").at(-2));
    data = {
      zoneId: id,
      zoneName: id === 1 ? "Tienda Centro" : "Terraza",
      registerId: id,
      registerName: "Caja principal",
      openingId: 100 + id,
    };
  } else if (path.endsWith("/operators"))
    data = [
      { id: -2, name: "Operario Bar de prueba", code: "bar" },
      { id: -3, name: "Operario Tienda de prueba", code: "shop" },
    ];
  else if (path.endsWith("/quickLogin")) {
    const id = JSON.parse(config.data).userId;
    data = {
      pkid: id,
      name: id === -2 ? "Operario Bar de prueba" : "Operario Tienda de prueba",
      admin: new URLSearchParams(location.search).has("admin"),
      userDsCode: "fixture",
      groupKyId: 3,
      tpvMode: id === -2 ? "BAR" : "SHOP",
    };
  } else if (path.endsWith("/WebLoadSecurityUser"))
    data = { admin: false, modules: [], categories: [], attributes: [] };
  else if (path.endsWith("/halls"))
    data = halls.filter(
      (h) => !params.zoneId || h.zoneId === Number(params.zoneId),
    );
  else if (/\/tables\/\d+\/(ticket|bill)$/.test(path)) {
    const id = Number(path.split("/").at(-2));
    const table = halls.flatMap((h) => h.tables).find((t) => t.id === id)!;
    const previous = tickets.get(id) || {
      revision: "0",
      state: "FREE",
      lines: [],
    };
    if (config.method === "put") {
      if (simulateFailure || simulatedConflict) {
        simulateFailure = false;
        throw new AxiosError(
          "Prueba de fallo",
          "ERR_BAD_REQUEST",
          config,
          null,
          {
            data: {
              message: simulatedConflict
                ? "Otro terminal ha cambiado esta mesa. Recarga el ticket antes de continuar."
                : "No se pudo guardar. Ticket local conservado.",
            },
            status: simulatedConflict ? 409 : 503,
            statusText: "",
            headers: {},
            config,
          },
        );
      }
      const body = JSON.parse(config.data);
      if (body.revision !== previous.revision)
        throw new Error("Revisión incorrecta");
      const rows = body.lines.map((l: any) => ({
        ...quote(l.productId, l.quantity),
        savedLineId: ++revision,
      }));
      const state = rows.length ? "OCCUPIED" : "FREE";
      tickets.set(id, { revision: String(++revision), state, lines: rows });
      Object.assign(table, {
        state,
        lines: rows.length,
        total: rows.reduce((s: number, l: any) => s + l.totalCents, 0) / 100,
      });
    } else if (config.method === "post") {
      previous.state = "BILL";
      previous.revision = String(++revision);
      tickets.set(id, previous);
      table.state = "BILL";
    }
    data = tickets.get(id) || previous;
  } else if (path.endsWith("/families")) data = families;
  else if (path.endsWith("/products")) {
    const query = (params.query || "").toLowerCase();
    await new Promise((resolve) =>
      setTimeout(resolve, query === "lento" ? 900 : 70),
    );
    const rows = products.filter((p) =>
      params.exactBarcode
        ? p.barcode.toLowerCase() === query
        : query
          ? `${p.name} ${p.code} ${p.barcode}`.toLowerCase().includes(query)
          : !params.familyId || p.familyId === params.familyId,
    );
    const page = params.page || 0;
    data = {
      content: rows.slice(page * 24, (page + 1) * 24),
      totalElements: rows.length,
    };
  } else if (/\/products\/\d+\/quote$/.test(path)) {
    const id = Number(path.split("/").at(-2));
    const quantity = Number(params.quantity);
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (quantity > 99999)
      throw new AxiosError(
        "Cantidad fuera de rango",
        "ERR_BAD_REQUEST",
        config,
        null,
        {
          data: "Cantidad fuera de rango",
          status: 400,
          statusText: "",
          headers: {},
          config,
        },
      );
    // Quantity tier verifies that totals are supplied by the server, not multiplied in the view.
    const netCents = Math.round(quantity * (quantity >= 3 ? 900 : 1000));
    const taxCents = Math.round(netCents * 0.21);
    data = {
      ...products.find((p) => p.id === id),
      quantity,
      netCents,
      taxCents,
      totalCents: netCents + taxCents,
      unitGross: quantity >= 3 ? 10.89 : 12.1,
    };
  } else throw new Error(`Unexpected request in TPV fixture: ${path}`);
  return {
    data: structuredClone(data),
    status: 200,
    statusText: "OK",
    headers: { "x-portal-session": "fixture-not-a-real-session" },
    config,
  };
};
const pinia = createPinia();
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "TPV", component: Tpv },
    { path: "/access", component: TpvAccess },
    {
      path: "/exit",
      name: "Dashboard",
      component: { template: "<p>Salida de la prueba local</p>" },
    },
  ],
});
const app = createApp({ render: () => h(RouterView) });
app.use(pinia);
// Exercise employee closing without routing an administrator to the central dashboard.
if (new URLSearchParams(location.search).has("closeCash")) {
  useSecurityStore().attributes = [{ code: "TPV_GEN_0001", active: true }];
  useSecurityStore().loaded = true;
}
useAuthStore().setUser(
  {
    pkid: -1,
    name: "PRUEBA LOCAL · sin conexión al ERP",
    admin: new URLSearchParams(location.search).has("admin"),
    userDsCode: "fixture",
    groupKyId: 3,
    tpvMode: barMode ? "BAR" : "SHOP",
  },
  "fixture-not-a-real-session",
  "tpv",
);
app
  .use(router)
  .use(ToastService)
  .use(PrimeVue, { theme: { preset: KiwiKTheme } })
  .mount("#app");
document.body.style.margin = "0";
document.body.style.fontFamily = "Arial, sans-serif";
