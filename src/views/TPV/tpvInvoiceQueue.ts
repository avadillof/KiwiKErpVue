import { ref, watch } from "vue";
import axios from "axios";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";

/**
 * Cola de emisión de facturas TPV en segundo plano: el cajero pide la factura
 * y sigue vendiendo; al aceptarla VeriFactu se le avisa con Toast y se
 * descarga el PDF. Sobrevive al cierre de diálogos (estado a nivel de módulo).
 */
export type InvoiceJobState =
  | "issuing"
  | "polling"
  | "pending"
  | "done"
  | "error";
export interface InvoiceJob {
  chargeId: number;
  openingId: number;
  state: InvoiceJobState;
  tries: number;
  error: string;
  invoiceId: number | null;
  invoiceCode: string;
  verifactuStatus: string;
}

export const invoiceJobs = ref(new Map<number, InvoiceJob>());

const POLL_MS = 5000;
const POLL_MAX = 24;
let timer: ReturnType<typeof setInterval> | undefined;
let polling = false;
let watchingSession = false;
const sessions = new Map<number, string>();
function active(job: InvoiceJob) {
  return (
    sessions.get(job.chargeId) === useAuthStore().portalSession &&
    invoiceJobs.value.get(job.chargeId) === job
  );
}
type Notice = {
  severity: string;
  summary: string;
  detail?: string;
  life: number;
};
const notifiers = new Map<number, (notice: Notice) => void>();
function notify(job: InvoiceJob, notice: Notice) {
  if (active(job)) notifiers.get(job.chargeId)?.(notice);
}

function touch() {
  invoiceJobs.value = new Map(invoiceJobs.value);
}

function detail(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const body = e.response?.data;
    if (typeof body === "string" && body.trim() && !body.trim().startsWith("<"))
      return body;
    if (body && typeof body === "object") {
      if (Array.isArray(body.errors) && body.errors.length)
        return body.errors
          .map((item: { location?: string; message?: string }) =>
            [item.location, item.message].filter(Boolean).join(": "),
          )
          .join("\n");
      for (const key of ["detail", "message", "reason"]) {
        if (typeof body[key] === "string" && body[key].trim()) return body[key];
      }
    }
    if (e.response) return `Error HTTP ${e.response.status}.`;
  }
  return e instanceof Error ? e.message : "Error de conexión.";
}

/** Pide la emisión (idempotente en servidor: si ya existe, la devuelve). */
export async function requestInvoice(
  chargeId: number,
  openingId: number,
  notifier: (notice: Notice) => void = () => {},
): Promise<InvoiceJob> {
  const auth = useAuthStore();
  if (!watchingSession) {
    watchingSession = true;
    watch(
      () => auth.portalSession,
      () => {
        if (timer) clearInterval(timer);
        timer = undefined;
        sessions.clear();
        notifiers.clear();
        invoiceJobs.value = new Map();
      },
      { flush: "sync" },
    );
  }
  const current = invoiceJobs.value.get(chargeId);
  if (current && (current.state === "issuing" || current.state === "polling"))
    return current;
  const initial: InvoiceJob = {
    chargeId,
    openingId,
    state: "issuing",
    tries: 0,
    error: "",
    invoiceId: current?.invoiceId ?? null,
    invoiceCode: current?.invoiceCode ?? "",
    verifactuStatus: "",
  };
  invoiceJobs.value.set(chargeId, initial);
  const job = invoiceJobs.value.get(chargeId)!;
  sessions.set(chargeId, auth.portalSession);
  touch();
  notifiers.set(chargeId, notifier);
  try {
    // Recover the persisted invoice before deciding whether an emission is necessary.
    const existing = await axios.get(
      backendUrl(`/WebTpv/charges/${chargeId}/invoice`),
      {
        ...auth.portalRequestConfig(),
        params: { openingId },
        timeout: 15000,
      },
    );
    if (!active(job)) return job;
    const saved = existing.data;
    job.invoiceId = saved?.invoiceId ?? null;
    job.invoiceCode = saved?.code ?? "";
    job.verifactuStatus = saved?.verifactuStatus ?? "";
    if (["ACCEPTED", "ACCEPTED_WITH_ERRORS"].includes(job.verifactuStatus)) {
      await finishJob(job, true);
      return job;
    }
    if (["NEEDS_CORRECTION", "REJECTED"].includes(job.verifactuStatus)) {
      failJob(
        job,
        saved.verifactuResponse ||
          "Revisa la incidencia en Central / Ventas → Facturas.",
      );
      touch();
      return job;
    }
    if (["PENDING", "PROCESSING"].includes(job.verifactuStatus)) {
      job.state = "polling";
      ensureTimer();
      touch();
      return job;
    }
    const { data } = await axios.post(
      backendUrl(`/WebTpv/charges/${chargeId}/issue`),
      { openingId },
      { ...auth.portalRequestConfig(), timeout: 60000 },
    );
    if (!active(job)) return job;
    if (data && typeof data === "object") {
      if (typeof (data.invoiceId ?? data.pkid) === "number")
        job.invoiceId = data.invoiceId ?? data.pkid;
      if (typeof data.code === "string") job.invoiceCode = data.code;
      if (typeof data.verifactuStatus === "string")
        job.verifactuStatus = data.verifactuStatus;
    }
    if (
      job.verifactuStatus === "ACCEPTED" ||
      job.verifactuStatus === "ACCEPTED_WITH_ERRORS"
    ) {
      await finishJob(job, true);
    } else {
      job.state = "polling";
      ensureTimer();
    }
  } catch (e) {
    if (!active(job)) return job;
    // El servidor pudo emitir antes del timeout: comprobar el estado real
    // antes de darlo por fallido (reintentar a ciegas duplicaría avisos).
    try {
      if (
        axios.isAxiosError(e) &&
        e.response &&
        e.response.status < 500 &&
        e.response.status !== 409
      )
        throw e;
      const { data } = await axios.get(
        backendUrl(`/WebTpv/charges/${chargeId}/invoice`),
        {
          ...auth.portalRequestConfig(),
          params: { openingId },
          timeout: 15000,
        },
      );
      if (!active(job)) return job;
      if (
        data &&
        typeof data === "object" &&
        data.invoiceId != null &&
        ["PENDING", "PROCESSING", "ACCEPTED", "ACCEPTED_WITH_ERRORS"].includes(
          data.verifactuStatus,
        )
      ) {
        if (typeof data.code === "string") job.invoiceCode = data.code;
        if (typeof data.verifactuStatus === "string")
          job.verifactuStatus = data.verifactuStatus;
        job.state = "polling";
        ensureTimer();
        touch();
        return job;
      }
    } catch {
      /* sin estado: se informa el error original */
    }
    if (!active(job)) return job;
    job.state = "error";
    job.error = detail(e);
    notify(job, { severity: "error", summary: job.error, life: 8000 });
  }
  touch();
  return job;
}

function ensureTimer() {
  if (!timer) timer = setInterval(pollAll, POLL_MS);
}

function maybeStop() {
  const active = [...invoiceJobs.value.values()].some(
    (job) => job.state === "issuing" || job.state === "polling",
  );
  if (!active && timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

async function pollAll() {
  if (polling) return;
  polling = true;
  try {
    const auth = useAuthStore();
    for (const job of invoiceJobs.value.values()) {
      if (job.state !== "polling") continue;
      job.tries++;
      try {
        const { data } = await axios.get(
          backendUrl(`/WebTpv/charges/${job.chargeId}/invoice`),
          {
            ...auth.portalRequestConfig(),
            params: { openingId: job.openingId },
            timeout: 15000,
          },
        );
        if (!active(job)) continue;
        if (data && typeof data === "object") {
          if (typeof (data.invoiceId ?? data.pkid) === "number")
            job.invoiceId = data.invoiceId ?? data.pkid;
          if (typeof data.code === "string") job.invoiceCode = data.code;
          if (typeof data.verifactuStatus === "string")
            job.verifactuStatus = data.verifactuStatus;
        }
        if (
          job.verifactuStatus === "ACCEPTED" ||
          job.verifactuStatus === "ACCEPTED_WITH_ERRORS"
        ) {
          await finishJob(job, true);
        } else if (
          job.verifactuStatus === "NEEDS_CORRECTION" ||
          job.verifactuStatus === "REJECTED"
        ) {
          failJob(
            job,
            "VeriFactu no aceptó la factura. Avísalo en central para revisarla en Ventas → Facturas.",
          );
        } else if (job.tries >= POLL_MAX) {
          job.state = "pending";
          job.error =
            "Sigue pendiente en el servidor. Puedes comprobar el estado más tarde sin volver a emitir.";
        }
      } catch {
        if (!active(job)) continue;
        if (job.tries >= POLL_MAX) {
          failJob(
            job,
            "Sin respuesta del servidor tras varios intentos. Comprueba el estado antes de reintentar.",
          );
        }
      }
      touch();
    }
    maybeStop();
  } finally {
    polling = false;
  }
}

function failJob(job: InvoiceJob, message: string) {
  job.state = "error";
  job.error = message;
  notify(job, { severity: "error", summary: message, life: 8000 });
}

async function finishJob(job: InvoiceJob, shouldNotify: boolean) {
  job.state = "done";
  job.error = "";
  touch();
  if (!shouldNotify) return;
  try {
    await downloadInvoicePdf(job.chargeId);
    notify(job, {
      severity: "success",
      summary: `Factura ${job.invoiceCode || `T-${job.chargeId}`} lista`,
      detail: "Descargada para entregar al cliente.",
      life: 8000,
    });
  } catch {
    notify(job, {
      severity: "warn",
      summary: `Factura ${job.invoiceCode || `T-${job.chargeId}`} aceptada`,
      detail: "No se pudo descargar sola: abre la factura y pulsa Descargar.",
      life: 8000,
    });
  }
}

/** Descarga el PDF definitivo de un ticket ya aceptado. */
export async function downloadInvoicePdf(
  chargeId: number,
  openingId?: number,
): Promise<void> {
  const job = invoiceJobs.value.get(chargeId);
  const auth = useAuthStore();
  const session = auth.portalSession;
  const opening = openingId ?? job?.openingId;
  if (opening == null)
    throw new Error("Selecciona una caja para consultar la factura.");
  const { data } = await axios.get(
    backendUrl(`/WebTpv/charges/${chargeId}/pdf`),
    {
      ...auth.portalRequestConfig(),
      params: { openingId: opening },
      responseType: "blob",
      timeout: 30000,
    },
  );
  if (auth.portalSession !== session) throw new Error("La sesión ha cambiado.");
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${job?.invoiceCode || `T-${chargeId}`}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
