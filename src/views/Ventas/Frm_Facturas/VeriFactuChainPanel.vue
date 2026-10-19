<template>
  <section class="chain-panel">
    <header>
      <div>
        <b><i class="pi pi-link" /> Encadenamiento VeriFactu</b>
        <small>
          Facturas, rectificativas y tickets · Últimos 8 registros archivados.
          El enlace mostrado procede del XML; no certifica la integridad de la
          cadena.
        </small>
      </div>
      <div class="chain-actions">
        <label>
          <span>Desde</span>
          <DatePicker
            v-model="dateFrom"
            dateFormat="dd/mm/yy"
            showIcon
            placeholder="Sin límite"
          />
        </label>
        <label>
          <span>Hasta</span>
          <DatePicker
            v-model="dateTo"
            dateFormat="dd/mm/yy"
            showIcon
            placeholder="Sin límite"
          />
        </label>
        <Button
          label="Aplicar"
          icon="pi pi-filter"
          size="small"
          :loading="loading"
          @click="load"
        />
        <Button
          v-if="dateFrom || dateTo"
          icon="pi pi-filter-slash"
          text
          rounded
          title="Quitar rango"
          @click="clearRange"
        />
        <Button
          icon="pi pi-refresh"
          text
          rounded
          :loading="loading"
          title="Actualizar cadena"
          @click="load"
        />
        <Button
          :icon="expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
          text
          rounded
          @click="expanded = !expanded"
        />
      </div>
    </header>
    <div v-if="expanded" class="chain-body">
      <Message v-if="loadError" severity="error" :closable="false">{{
        loadError
      }}</Message>
      <Message v-else-if="!rows.length" severity="info" :closable="false">
        Aún no hay registros VeriFactu archivados.
      </Message>
      <div v-else class="chain-list">
        <article
          v-for="(item, index) in rows"
          :key="item.historicId"
          :class="{ broken: !item.firstRecord && !item.previousHash }"
        >
          <div class="chain-state">
            <i
              :class="
                item.firstRecord
                  ? 'pi pi-flag'
                  : item.accepted
                    ? 'pi pi-check-circle'
                    : 'pi pi-exclamation-triangle'
              "
            />
            <span v-if="index < rows.length - 1" />
          </div>
          <div class="chain-data">
            <div class="chain-heading">
              <b
                >{{ item.code }} ·
                {{
                  item.fiscalType === "F3"
                    ? "Sustitución F3"
                    : item.documentType
                }}</b
              >
              <Tag
                :value="
                  item.firstRecord
                    ? 'Primer registro'
                    : item.previousHash
                      ? 'Enlace registrado'
                      : 'Sin enlace'
                "
                :severity="
                  item.firstRecord || item.previousHash ? 'info' : 'warn'
                "
                rounded
              />
            </div>
            <small v-if="dateTime(item.date)">{{ dateTime(item.date) }}</small>
            <div v-if="item.rectifiedInvoices?.length" class="substitution">
              <i class="pi pi-undo" aria-hidden="true" />
              <span v-for="source in item.rectifiedInvoices" :key="source.code"
                >Rectifica a <b>{{ source.code }}</b
                ><small> · {{ source.date }}</small></span
              >
            </div>
            <!-- La factura sustituida puede no ser el registro anterior de la cadena. -->
            <div v-if="item.fiscalType === 'F3'" class="substitution">
              <i class="pi pi-file" aria-hidden="true" />
              <div v-if="item.substitutedInvoices?.length">
                <span
                  v-for="(source, sourceIndex) in item.substitutedInvoices"
                  :key="sourceIndex"
                >
                  Sustituye a <b>{{ source.code }}</b>
                  <small v-if="source.date"> · {{ source.date }}</small>
                </span>
              </div>
              <span v-else>El XML no identifica el documento sustituido.</span>
            </div>
            <section>
              <span>
                <small>Huella del registro</small>
                <code :title="item.currentHash">{{
                  shortHash(item.currentHash)
                }}</code>
              </span>
              <i class="pi pi-arrow-left" />
              <span>
                <small>{{
                  item.firstRecord
                    ? "Inicio de la cadena"
                    : "Registro anterior · " +
                      (item.previousCode || "sin identificar")
                }}</small>
                <code v-if="!item.firstRecord" :title="item.previousHash">{{
                  shortHash(item.previousHash)
                }}</code>
                <b v-else>PrimerRegistro = S</b>
              </span>
            </section>
          </div>
        </article>
      </div>
      <div v-if="loading" class="loading">
        <i class="pi pi-spin pi-spinner" /> Comprobando el encadenamiento…
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import axios from "axios";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import Message from "primevue/message";
import Tag from "primevue/tag";
import { backendUrl } from "@/services/backendUrl";

interface ChainRow {
  historicId: number;
  code: string;
  documentType: string;
  date: unknown;
  fiscalType?: string;
  rectifiedInvoices?: { code: string; date: string }[];
  substitutedInvoices?: { code: string; date: string }[];
  currentHash: string;
  previousHash: string;
  previousCode: string;
  firstRecord: boolean;
  accepted: boolean;
}

const loadError = ref("");
const expanded = ref(true);
const loading = ref(false);
const rows = ref<ChainRow[]>([]);
const dateFrom = ref<Date | null>(null);
const dateTo = ref<Date | null>(null);
const pad = (value: number) => String(value).padStart(2, "0");

// El histórico admite las representaciones de fecha de las versiones anteriores del backend.
const parseDate = (value: any): Date | null => {
  if (!value) return null;
  const date =
    typeof value === "object" && !Array.isArray(value) && value.year != null
      ? new Date(
          value.year,
          (value.monthValue ?? value.month ?? 1) - 1,
          value.dayOfMonth ?? value.day ?? 1,
          value.hour ?? 0,
          value.minute ?? 0,
          value.second ?? 0,
        )
      : Array.isArray(value)
        ? new Date(
            value[0],
            value[1] - 1,
            value[2],
            value[3] || 0,
            value[4] || 0,
            value[5] || 0,
          )
        : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
const timeOf = (value: unknown) => parseDate(value)?.getTime() ?? 0;
const dateTime = (value: unknown) => {
  const date = parseDate(value);
  return date
    ? `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    : "";
};
const shortHash = (value: string) =>
  value ? `${value.slice(0, 12)}…${value.slice(-8)}` : "Sin huella";
const isoDay = (value: Date | null) =>
  value
    ? `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
    : undefined;

const load = async () => {
  loading.value = true;
  loadError.value = "";
  try {
    const { data } = await axios.get<ChainRow[]>(
      backendUrl("/WebGetSalesInvoiceVeriFactuChain"),
      {
        params: { from: isoDay(dateFrom.value), to: isoDay(dateTo.value) },
      },
    );
    rows.value = (data || [])
      .sort((a, b) => timeOf(b.date) - timeOf(a.date))
      .slice(0, 8);
  } catch (error: any) {
    loadError.value =
      typeof error.response?.data === "string"
        ? error.response.data
        : "No se pudo consultar el histórico VeriFactu.";
  } finally {
    loading.value = false;
  }
};
const clearRange = () => {
  dateFrom.value = null;
  dateTo.value = null;
  void load();
};
defineExpose({ refresh: load });
let timer: number | undefined;
onMounted(() => {
  void load();
  timer = window.setInterval(() => {
    if (!loading.value) void load();
  }, 15000);
});
onUnmounted(() => {
  if (timer) window.clearInterval(timer);
});
</script>

<style scoped>
.chain-panel {
  margin-top: 14px;
  overflow: hidden;
  border: 1px solid #dfe4ea;
  border-radius: 14px;
  background: #fff;
}
.chain-panel > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid #e8ecf0;
}
.chain-panel header i {
  color: #648506;
}
.chain-panel header small {
  display: block;
  margin-top: 0.2rem;
  color: #7d8797;
}
.chain-body {
  padding: 14px 16px;
  position: relative;
  min-height: 80px;
}
.loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.92);
  z-index: 5;
}
.chain-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem 1.2rem;
}
.chain-list article {
  display: flex;
  min-width: 0;
  gap: 0.65rem;
  padding: 0.7rem;
  border: 1px solid #e3ead3;
  border-radius: 10px;
  background: #fafcf7;
}
.chain-list article.broken {
  border-color: #efcece;
  background: #fff8f8;
}
.chain-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  color: #648506;
}
.chain-state > i {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 50%;
  background: #eaf2d2;
}
.chain-state > span {
  width: 2px;
  flex: 1;
  margin-top: 0.3rem;
  background: #cbdba0;
}
.chain-data {
  min-width: 0;
  flex: 1;
}
.chain-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
}
.chain-data > small {
  color: #7d8797;
  font-size: 0.7rem;
}
.substitution {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.6rem;
  border: 1px solid #d7e5ae;
  border-radius: 8px;
  color: #34431a;
  background: #f0f6df;
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}
.substitution > i {
  margin-top: 0.1rem;
  color: #648506;
}
.substitution > div {
  min-width: 0;
}
.substitution > div > span {
  display: block;
}
.substitution small {
  color: #63704e;
}
.chain-data section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.55rem;
  padding: 0.55rem;
  border-radius: 8px;
  background: #fff;
}
.chain-data section span {
  min-width: 0;
}
.chain-data section small,
.chain-data section code,
.chain-data section b {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chain-data section small {
  color: #7d8797;
  font-size: 0.66rem;
}
.chain-data section code {
  margin-top: 0.2rem;
  color: #34431a;
  font-size: 0.69rem;
}
.chain-data section > i {
  color: #8aa13e;
}
.chain-actions {
  display: flex;
  align-items: flex-end;
  gap: 0.35rem;
}
.chain-actions label {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.chain-actions label > span {
  color: #7d8797;
  font-size: 0.65rem;
  font-weight: 700;
}
.chain-actions :deep(.p-datepicker) {
  width: 145px;
}
.chain-actions :deep(.p-inputtext) {
  padding: 0.4rem 0.5rem;
  font-size: 0.78rem;
}
@media (max-width: 900px) {
  .chain-list {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 1050px) {
  .chain-panel > header {
    align-items: flex-start;
    flex-direction: column;
  }
  .chain-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
