<template>
  <main class="reports-page">
    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon"><i class="pi pi-chart-bar" /></div>
        <div>
          <span class="breadcrumb">KiwiKERP / Reportes</span>
          <h1>Reportes</h1>
          <p>Informes parametrizados del ERP. Cada informe tiene su código único RPT.</p>
        </div>
      </div>
      <nav class="header-actions" aria-label="Navegación">
        <Button label="Ventas" icon="pi pi-arrow-left" severity="secondary" text @click="router.push({ name: 'Ventas' })" />
        <Button label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({ name: 'Dashboard' })" />
      </nav>
    </header>

    <Tabs value="VEN" class="reports-tabs">
      <TabList>
        <Tab value="VEN"><i class="pi pi-chart-bar" /> Informes del ERP</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="VEN" class="ven-panel">
          <div class="ven-body">
            <section class="ven-card ven-card--side" aria-label="Catálogo de informes del ERP">
              <Tree
                v-model:selectionKeys="selection"
                v-model:expandedKeys="expanded"
                :value="salesNodes"
                selectionMode="single"
                class="ven-tree"
                @node-select="onNodeSelect"
              >
                <template #default="slotProps">
                  <span v-if="slotProps.node.children" class="ven-parent">
                    <span class="ven-parent-icon"><i class="pi pi-folder-open" /></span>
                    <span>{{ slotProps.node.label }}</span>
                    <Tag :value="String(slotProps.node.children.length)" rounded />
                  </span>
                  <span v-else class="ven-leaf">
                    <span class="ven-leaf-code">{{ leafCode(slotProps.node.label) }}</span>
                    <span>{{ leafTitle(slotProps.node.label) }}</span>
                  </span>
                </template>
              </Tree>
            </section>
            <section class="ven-card ven-card--main" aria-label="Ficha del informe">
              <Toolbar class="ven-toolbar">
                <template #start><Tag v-if="isReport" :value="selectedReport" severity="info" rounded /><strong class="ven-report-name">{{ selectedTitle }}</strong></template>

              </Toolbar>
              <div class="ven-main-body">
                <section class="ven-params" aria-label="Parámetros">
                  <div class="section-heading"><span><i class="pi pi-sliders-h" /></span><div><h2>Parámetros</h2><p>Filtros del informe seleccionado.</p></div></div>
                  <div v-if="selectedReport === 'RPT-CLI-001'" class="params-grid">
                    <label class="field"><span>Fecha alta desde</span><DatePicker v-model="cli001.dateFrom" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Fecha alta hasta</span><DatePicker v-model="cli001.dateTo" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Tipo de entidad</span><Select v-model="cli001.kind" :options="kindOptions" optionLabel="label" optionValue="value" fluid /></label>
                    <label class="field"><span>Estado</span><Select v-model="cli001.active" :options="activeOptions" optionLabel="label" optionValue="value" fluid /></label>
                    <label class="field"><span>Borrados</span><Select v-model="cli001.deleted" :options="deletedOptions" optionLabel="label" optionValue="value" fluid /></label>
                  </div>
                  <div v-if="selectedReport === 'RPT-ART-001'" class="params-grid">
                    <label class="field"><span>Familia</span><Select v-model="art001.family" :options="artFamilies" optionLabel="label" optionValue="value" filter placeholder="Todas" fluid /></label>
                    <label class="field"><span>Fecha alta desde</span><DatePicker v-model="art001.dateFrom" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Fecha alta hasta</span><DatePicker v-model="art001.dateTo" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Comercialización</span><Select v-model="art001.sale" :options="saleOptions" optionLabel="label" optionValue="value" fluid /></label>
                    <label class="field"><span>Estado</span><Select v-model="art001.active" :options="activeOptions" optionLabel="label" optionValue="value" fluid /></label>
                    <label class="field"><span>Borrados</span><Select v-model="art001.deleted" :options="deletedOptions" optionLabel="label" optionValue="value" fluid /></label>
                  </div>
                  <div v-if="selectedReport === 'RPT-SAL-002'" class="params-grid">
                    <label class="field"><span>Fecha prevista hasta</span><DatePicker v-model="sal002.dateTo" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Buscar (pedido, cliente, artículo)</span><InputText v-model="sal002.query" placeholder="Texto libre" fluid /></label>
                  </div>
                  <div v-if="selectedReport === 'RPT-SAL-004'" class="params-grid">
                    <label class="field"><span>Fecha hasta</span><DatePicker v-model="sal004.dateTo" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Buscar (factura, cliente)</span><InputText v-model="sal004.query" placeholder="Texto libre" fluid /></label>
                    <label class="field field--check"><span>Vencidas</span><span class="check-row"><Checkbox v-model="sal004.onlyOverdue" binary /> Solo vencidas</span></label>
                  </div>
                  <div v-if="selectedReport === 'RPT-PUR-001'" class="params-grid">
                    <label class="field"><span>Fecha hasta</span><DatePicker v-model="pur001.dateTo" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Buscar (albarán, proveedor)</span><InputText v-model="pur001.query" placeholder="Texto libre" fluid /></label>
                  </div>
                  <div v-if="selectedReport === 'RPT-PUR-002'" class="params-grid">
                    <label class="field"><span>Fecha hasta</span><DatePicker v-model="pur002.dateTo" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Buscar (factura, proveedor)</span><InputText v-model="pur002.query" placeholder="Texto libre" fluid /></label>
                    <label class="field field--check"><span>Vencidas</span><span class="check-row"><Checkbox v-model="pur002.onlyOverdue" binary /> Solo vencidas</span></label>
                  </div>
                  <div v-if="selectedReport === 'RPT-TAS-001'" class="params-grid">
                    <label class="field"><span>Inicio desde</span><DatePicker v-model="tas001.dateFrom" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Vencimiento hasta</span><DatePicker v-model="tas001.dateTo" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Estado</span><Select v-model="tas001.state" :options="taskStateOptions" optionLabel="label" optionValue="value" fluid /></label>
                    <label class="field"><span>Prioridad</span><Select v-model="tas001.priority" :options="taskPriorityOptions" optionLabel="label" optionValue="value" fluid /></label>
                    <label class="field"><span>Responsable</span><Select v-model="tas001.userPkid" :options="taskUserOptions" optionLabel="label" optionValue="value" filter fluid /></label>
                    <label class="field"><span>Cliente</span><CustomerLookup v-model="tas001.entitiePkid" :label="tas001.entitieLabel" @selected="selectTaskEntity(tas001, $event)" @cleared="clearTaskEntity(tas001)" /></label>
                    <label class="field"><span>Buscar</span><InputText v-model="tas001.query" placeholder="Código, tarea, cliente…" fluid /></label>
                    <label class="field field--check"><span>Situación</span><span class="check-row"><Checkbox v-model="tas001.overdueOnly" binary /> Solo vencidas</span></label>
                    <label class="field field--check"><span>Histórico</span><span class="check-row"><Checkbox v-model="tas001.includeArchived" binary /> Incluir finalizadas y descartadas</span></label>
                  </div>
                  <div v-if="selectedReport === 'RPT-TAS-002'" class="params-grid">
                    <label class="field"><span>Fecha desde</span><DatePicker v-model="tas002.dateFrom" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Fecha hasta</span><DatePicker v-model="tas002.dateTo" dateFormat="dd/mm/yy" showIcon placeholder="Sin límite" fluid /></label>
                    <label class="field"><span>Empleado</span><Select v-model="tas002.userPkid" :options="taskUserOptions" optionLabel="label" optionValue="value" filter fluid /></label>
                    <label class="field"><span>Cliente</span><CustomerLookup v-model="tas002.entitiePkid" :label="tas002.entitieLabel" @selected="selectTaskEntity(tas002, $event)" @cleared="clearTaskEntity(tas002)" /></label>
                    <label class="field"><span>Buscar</span><InputText v-model="tas002.query" placeholder="Tarea, cliente, trabajo…" fluid /></label>
                    <label class="field field--check"><span>Facturación</span><span class="check-row"><Checkbox v-model="tas002.pendingOnly" binary /> Solo horas pendientes</span></label>
                  </div>
                  <div v-if="selectedReport === 'RPT-TAR-001'" class="params-grid">
                    <label class="field"><span>Tarifa</span><Select v-model="tar001.tarifaId" :options="tarifaRateOptions" optionLabel="label" optionValue="value" filter fluid /></label>
                    <label class="field field--check"><span>Clientes</span><span class="check-row"><Checkbox v-model="tar001.includeClients" binary /> Incluir clientes asignados</span></label>
                    <label class="field field--check"><span>Reglas</span><span class="check-row"><Checkbox v-model="tar001.onlyWithRules" binary /> Solo tarifas con reglas</span></label>
                  </div>
                  <div v-if="selectedReport === 'RPT-IVA-001'" class="params-grid params-grid--iva">
                    <label class="field"><span>Ejercicio</span><InputNumber v-model="iva001.year" :min="2000" :max="2200" :useGrouping="false" fluid /></label>
                    <label class="field"><span>Trimestre</span><Select v-model="iva001.quarter" :options="quarterOptions" optionLabel="label" optionValue="value" fluid /></label>
                    <Message severity="info" :closable="false">Incluye facturas de venta emitidas, rectificativas confirmadas y facturas de proveedor registradas dentro del trimestre.</Message>
                  </div>
                  <div v-if="isReport" class="order-box">
                    <span class="order-title"><i class="pi pi-table" /> Columnas del informe</span>
                    <div class="order-chips">
                      <span
                        v-for="(key, i) in visibleCols"
                        :key="key"
                        class="order-chip"
                        :class="{ dragging: dragCol === i }"
                        draggable="true"
                        title="Arrastra para reordenar"
                        @dragstart="dragCol = i"
                        @dragover.prevent
                        @drop="dropCol(i)"
                        @dragend="dragCol = -1"
                      >
                        <Checkbox :modelValue="true" binary @update:modelValue="toggleCol(key)" @click.stop />
                        {{ columnLabel(key) }}
                      </span>
                    </div>
                    <div class="order-chips">
                      <span v-for="col in hiddenCols" :key="col.key" class="order-chip order-chip--off">
                        <Checkbox :modelValue="false" binary @update:modelValue="toggleCol(col.key)" />
                        {{ col.header }}
                      </span>
                    </div>
                  </div>
                  <div v-if="isReport" class="order-box">
                    <span class="order-title"><i class="pi pi-sort-alpha-down" /> Ordenación</span>                    <div class="order-chips">
                      <span
                        v-for="(c, i) in orderCriteria"
                        :key="c.field"
                        class="order-chip"
                        :class="{ dragging: dragOrder === i }"
                        draggable="true"
                        title="Arrastra para reordenar la prioridad"
                        @dragstart="dragOrder = i"
                        @dragover.prevent
                        @drop="dropOrder(i)"
                        @dragend="dragOrder = -1"
                      >
                        <b>{{ i + 1 }}</b> {{ orderLabel(c.field) }}
                        <button type="button" class="order-dir" :title="'Sentido: ' + (c.dir === 'asc' ? 'ascendente' : 'descendente')" @click="c.dir = c.dir === 'asc' ? 'desc' : 'asc'">{{ c.dir === 'asc' ? 'ASC' : 'DES' }}</button>
                        <Button icon="pi pi-times" text rounded size="small" :aria-label="'Quitar ' + orderLabel(c.field)" @click="removeOrder(i)" />
                      </span>
                      <span v-if="!orderCriteria.length" class="order-empty">Sin orden: selecciona campos por prioridad.</span>
                    </div>
                    <label class="field"><span>Añadir campo</span><Select :modelValue="null" :options="availableOrderFields" optionLabel="label" optionValue="value" placeholder="Seleccionar campo" fluid @update:modelValue="addOrder" /></label>
                  </div>
                  <Message v-if="dateError" severity="error" :closable="false">{{ dateError }}</Message>
                </section>
                <section ref="previewSection" class="ven-preview" aria-label="Previsualización">
                  <div class="section-heading"><span><i class="pi pi-eye" /></span><div><h2>Previsualización</h2><p>Vista previa del informe generado.</p></div></div>
                  <div class="rep-body">
                    <div v-if="previewLoading" class="rep-loading"><i class="pi pi-spin pi-spinner" /> Generando vista previa…</div>
                    <Message v-else-if="previewError" severity="error" :closable="false">{{ previewError }}</Message>
                    <template v-else-if="previewDone">
                      <div v-if="selectedReport === 'RPT-IVA-001' && ivaSettlement" class="vat-summary">
                        <article><small>IVA repercutido · Ventas</small><strong>{{ reportMoney(ivaSettlement.output.tax) }}</strong><span>{{ ivaSettlement.output.documentCount }} documentos · Base {{ reportMoney(ivaSettlement.output.net) }}</span><em>{{ rateBreakdown(ivaSettlement.output) }}</em></article>
                        <article><small>IVA soportado · Compras</small><strong>{{ reportMoney(ivaSettlement.input.tax) }}</strong><span>{{ ivaSettlement.input.documentCount }} documentos · Base {{ reportMoney(ivaSettlement.input.net) }}</span><em>{{ rateBreakdown(ivaSettlement.input) }}</em></article>
                        <article :class="{ 'vat-result--negative': Number(ivaSettlement.result) < 0 }"><small>Resultado orientativo</small><strong>{{ reportMoney(ivaSettlement.result) }}</strong><span>{{ Number(ivaSettlement.result) >= 0 ? 'A ingresar' : 'A compensar / devolver' }}</span></article>
                      </div>
                      <div v-if="selectedReport === 'RPT-IVA-001' && ivaSettlement" class="vat-settlement-state">
                        <Tag v-if="ivaSettlement.settlement" :value="`${ivaSettlement.settlement.label} · v${ivaSettlement.settlement.version} · ${ivaSettlement.settlement.status === 'PRESENTED' ? 'Presentada' : ivaSettlement.settlement.outdated ? 'Desactualizada' : 'Preparada'}`" :severity="ivaSettlement.settlement.status === 'PRESENTED' ? 'success' : ivaSettlement.settlement.outdated ? 'danger' : 'warn'" icon="pi pi-verified" rounded />
                        <Tag v-else value="Pendiente de preparar" severity="secondary" icon="pi pi-clock" rounded />
                        <span v-if="ivaSettlement.settlement?.status === 'PRESENTED'">Fotografía fiscal cerrada; las facturas incluidas quedan identificadas en sus listados.</span>
                        <span v-else>Guarda la preliquidación para identificar las facturas incluidas. Márcala presentada únicamente después de enviarla a la gestoría o AEAT.</span>
                      </div>
                      <Message v-if="selectedReport === 'RPT-IVA-001' && ivaSettlement?.settlement?.outdated" severity="error" :closable="false">Han aparecido facturas nuevas o han cambiado documentos del trimestre después de guardar la versión {{ ivaSettlement.settlement.version }}. Revisa el informe y pulsa <b>Guardar nueva versión</b> antes de presentarlo.</Message>
                      <Message v-if="selectedReport === 'RPT-IVA-001' && ivaSettlement?.settlement?.status === 'PRESENTED' && ivaSettlement?.lateChanges?.hasChanges" severity="warn" :closable="false">
                        La liquidación presentada permanece intacta, pero hay cambios pendientes: <b>{{ ivaSettlement.lateChanges.newDocumentCount }}</b> documento{{ ivaSettlement.lateChanges.newDocumentCount === 1 ? '' : 's' }} nuevo{{ ivaSettlement.lateChanges.newDocumentCount === 1 ? '' : 's' }}, <b>{{ ivaSettlement.lateChanges.changedDocumentCount }}</b> modificado{{ ivaSettlement.lateChanges.changedDocumentCount === 1 ? '' : 's' }} y <b>{{ ivaSettlement.lateChanges.removedDocumentCount }}</b> retirado{{ ivaSettlement.lateChanges.removedDocumentCount === 1 ? '' : 's' }}. Pulsa <b>Preparar regularización</b> para generar una nueva versión revisable.
                      </Message>
                      <div v-if="selectedReport === 'RPT-IVA-001' && ivaSettlement?.versions?.length" class="vat-version-history"><strong>Versiones:</strong><Button v-for="version in ivaSettlement.versions" :key="version.version" :label="`v${version.version} · ${version.status === 'PRESENTED' ? 'Presentada' : version.status === 'PREPARED' ? 'Preparada' : 'Sustituida'}`" size="small" text rounded :disabled="versionLoading" :severity="ivaSettlement?.settlement?.version === version.version ? 'success' : 'secondary'" :title="`Ver la fotografía de la v${version.version}`" @click="viewVersion(version.version)" /></div>
                      <Message v-if="selectedReport === 'RPT-IVA-001' && ivaSettlement?.warnings?.length" severity="warn" :closable="false">{{ ivaSettlement.warnings.length }} incidencia{{ ivaSettlement.warnings.length === 1 ? '' : 's' }} pendiente{{ ivaSettlement.warnings.length === 1 ? '' : 's' }} de revisión antes de enviar la preliquidación.</Message>
                      <Message v-if="selectedReport === 'RPT-IVA-001' && ivaSettlement?.disclaimer" severity="info" :closable="false">{{ ivaSettlement.disclaimer }}</Message>
                      <div class="rep-meta"><strong>{{ previewRows.length }} registros</strong><span>{{ filtersText }}</span></div>
                      <Message v-if="!previewRows.length" severity="info" :closable="false">Sin resultados para los filtros indicados.</Message>
                      <iframe v-else :src="pdfUrl" class="rep-pdf" title="Vista previa del PDF" />
                    </template>
                    <p v-else class="rep-empty">Configura los parámetros y pulsa Vista previa.</p>
                  </div>
                </section>
              </div>
              <!-- Las acciones del informe comparten el pie, después de sus parámetros y vista previa. -->
              <footer class="report-footer">
                <div class="kiwik-separator" aria-hidden="true"></div>
                <div class="report-footer-actions">
                  <Button v-if="securityStore.hasPermission(PERM.RPT_SALES)" label="Vista previa" icon="pi pi-eye" outlined :disabled="!isReport || !!dateError || previewLoading" :loading="previewLoading" title="Se activa al validar el formulario" @click="preview" />
                  <Button v-if="selectedReport === 'RPT-IVA-001' && previewDone && !ivaSettlement?.settlement && securityStore.hasPermission(PERM.RPT_EXPORT)" label="Guardar preliquidación" icon="pi pi-save" outlined :loading="settlementBusy" @click="prepareSettlement()" />
                  <Button v-if="selectedReport === 'RPT-IVA-001' && previewDone && ivaSettlement?.settlement?.status === 'PREPARED' && ivaSettlement.settlement.outdated && securityStore.hasPermission(PERM.RPT_EXPORT)" label="Guardar nueva versión" icon="pi pi-save" outlined :loading="settlementBusy" @click="prepareSettlement()" />
                  <Button v-if="selectedReport === 'RPT-IVA-001' && previewDone && ivaSettlement?.settlement?.status === 'PRESENTED' && ivaSettlement?.lateChanges?.hasChanges && securityStore.hasPermission(PERM.RPT_EXPORT)" label="Preparar regularización" icon="pi pi-file-edit" severity="warn" outlined :loading="settlementBusy" @click="prepareSettlement(true)" />
                  <Button v-if="selectedReport === 'RPT-IVA-001' && ivaSettlement?.settlement?.status === 'PREPARED' && securityStore.hasPermission(PERM.RPT_EXPORT)" label="Marcar presentada" icon="pi pi-check-circle" :loading="settlementBusy" :disabled="Boolean(ivaSettlement.warnings?.length || ivaSettlement.settlement.outdated)" :title="ivaSettlement.settlement.outdated ? 'Hay facturas nuevas o modificadas: guarda una nueva versión' : ivaSettlement.warnings?.length ? 'Corrige las incidencias fiscales y vuelve a guardar la preliquidación' : 'Cerrar el trimestre como presentado'" @click="presentConfirmVisible = true" />
                  <Button icon="pi pi-download" v-if="securityStore.hasPermission(PERM.RPT_EXPORT)" label="Descargar" outlined :disabled="!pdfUrl" title="Descargar el PDF con el nombre del informe" @click="downloadPdf" />
                  <Button v-if="securityStore.hasPermission(PERM.RPT_EXPORT)" label="A Excel" icon="pi pi-file-excel" severity="success" :disabled="!previewRows.length" title="Exportar las columnas visibles" @click="exportExcel" />
                </div>
              </footer>
            </section>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
    <Dialog v-model:visible="presentConfirmVisible" modal header="Confirmar presentación del trimestre" :style="{ width: 'min(520px,94vw)' }" class="kiwik-dialog">
      <Message severity="warn" :closable="false">Vas a cerrar {{ ivaSettlement?.settlement?.label }} como presentada. Se conservará la fotografía de las facturas incluidas y no podrá regenerarse desde este informe.</Message>
      <label class="advisor-send-option" :class="{ disabled: !ivaSettlement?.advisorConfigured }"><Checkbox v-model="sendToAdvisor" binary :disabled="!ivaSettlement?.advisorConfigured"/><span><strong>Enviar también el PDF al gestor</strong><small v-if="ivaSettlement?.advisorConfigured">{{ ivaSettlement.advisorName }} · {{ ivaSettlement.advisorEmail }}</small><small v-else>No hay gestor configurado en Ajustes de ventas.</small></span></label>
      <template #footer><div class="dialog-footer"><div class="kiwik-separator dialog-footer-separator"></div><div class="dialog-footer-actions"><Button label="Volver" severity="secondary" text @click="presentConfirmVisible=false" /><Button label="Sí, marcar presentada" icon="pi pi-check-circle" :loading="settlementBusy" @click="presentSettlement" /></div></div></template>
    </Dialog>
  </main>
</template>

<script setup lang="ts">

import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useSecurityStore } from '@/stores/securityStore';
import { useAuthStore } from '@/stores/authStore';
import { PERM } from '@/services/Frm_Main/permissions';
const securityStore = useSecurityStore();
const authStore = useAuthStore();

import { useCompanyStore } from '@/stores/companyStore';
import { buildReportPdf, exportReportExcel, sortReportRows, type ReportRow } from '@/services/Informes/reportEngine';
import {
  CLI_001_COLUMNS,
  CLI_001_ORDER_FIELDS,
  cli001FiltersText,
  fetchCli001,
  type Cli001Filters
} from '@/services/Informes/reports/rptCli001';
import {
  ART_001_COLUMNS,
  ART_001_ORDER_FIELDS,
  art001FiltersText,
  artFamilyOptions,
  fetchArt001,
  type Art001Filters
} from '@/services/Informes/reports/rptArt001';
import {
  SAL_002_COLUMNS,
  SAL_002_ORDER_FIELDS,
  sal002FiltersText,
  fetchSal002,
  type Sal002Filters
} from '@/services/Informes/reports/rptSal002';
import {
  SAL_004_COLUMNS,
  SAL_004_ORDER_FIELDS,
  sal004FiltersText,
  fetchSal004,
  type Sal004Filters
} from '@/services/Informes/reports/rptSal004';
import {
  PUR_001_COLUMNS,
  PUR_001_ORDER_FIELDS,
  pur001FiltersText,
  fetchPur001,
  type Pur001Filters
} from '@/services/Informes/reports/rptPur001';
import {
  PUR_002_COLUMNS,
  PUR_002_ORDER_FIELDS,
  pur002FiltersText,
  fetchPur002,
  type Pur002Filters
} from '@/services/Informes/reports/rptPur002';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';
import Select from 'primevue/select';
import Tab from 'primevue/tab';
import TabList from 'primevue/tablist';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import Tree from 'primevue/tree';
import CustomerLookup from '@/components/shared/CustomerLookup.vue';
import { getUsers } from '@/services/Tasks/taskService';
import { useToast } from 'primevue/usetoast';
import { IVA_001_COLUMNS, IVA_001_ORDER_FIELDS, fetchIva001, fetchIvaVersion, iva001FiltersText, prepareIva001, presentIva001, type VatSettlement } from '@/services/Informes/reports/rptIva001';
import {
  RPT_TAR_001_CODE,
  TAR_001_COLUMNS,
  TAR_001_ORDER_FIELDS,
  fetchTar001,
  tar001FiltersText,
  tarifaOptions,
  type Tar001Filters
} from '@/services/Informes/reports/rptTar001';
import { TAS_001_COLUMNS, TAS_001_ORDER_FIELDS, fetchTas001, tas001FiltersText, type Tas001Filters } from '@/services/Informes/reports/rptTas001';
import { TAS_002_COLUMNS, TAS_002_ORDER_FIELDS, fetchTas002, tas002FiltersText, type Tas002Filters } from '@/services/Informes/reports/rptTas002';

const router = useRouter();
const companyStore = useCompanyStore();
const toast = useToast();

/** Catálogo de reportes de ventas en árbol. El código RPT es la identidad única. */
const salesNodes = ref([
  {
    key: 'mae',
    label: 'Maestros',
    children: [
      { key: 'RPT-CLI-001', label: '[RPT-CLI-001] Listado General de Entidades' },
      { key: 'RPT-ART-001', label: '[RPT-ART-001] Listado de Artículos y Servicios' },
      { key: 'RPT-TAR-001', label: '[RPT-TAR-001] Listado de Tarifas y reglas' }
    ]
  },
  {
    key: 'fac',
    label: 'Ventas',
    children: [
      { key: 'RPT-SAL-002', label: '[RPT-SAL-002] Pedidos pendientes de entrega' },
      { key: 'RPT-SAL-004', label: '[RPT-SAL-004] Facturas vencidas y pendientes de cobro' }
    ]
  },
  {
    key: 'pur',
    label: 'Compras',
    children: [
      { key: 'RPT-PUR-001', label: '[RPT-PUR-001] Albaranes pendientes de facturar' },
      { key: 'RPT-PUR-002', label: '[RPT-PUR-002] Facturas pendientes de pago' }
    ]
  },
  {
    key: 'fis',
    label: 'Fiscalidad',
    children: [
      { key: 'RPT-IVA-001', label: '[RPT-IVA-001] Preliquidación trimestral de IVA' }
    ]
  },
  {
    key: 'tas',
    label: 'Tareas y partes',
    children: [
      { key: 'RPT-TAS-001', label: '[RPT-TAS-001] Seguimiento de tareas' },
      { key: 'RPT-TAS-002', label: '[RPT-TAS-002] Horas e imputaciones' }
    ]
  }
]);
const selection = ref<Record<string, boolean>>({ 'RPT-CLI-001': true });
const expanded = ref<Record<string, boolean>>({ mae: true });
const selectedReport = ref('RPT-CLI-001');

/**
 * Parámetros del RPT-CLI-001 Listado General de Clientes.
 * Contrato previsto con backend: dateUp desde/hasta, entitieBolClient,
 * entitieBolProve, entitieBolActive y flag de borrado lógico.
 */
const cli001 = reactive<Cli001Filters>({
  dateFrom: null,
  dateTo: null,
  kind: 'ALL',
  active: 'ALL',
  deleted: 'NOT_DELETED'
});
const art001 = reactive<Art001Filters>({
  family: '',
  dateFrom: null,
  dateTo: null,
  sale: 'ALL',
  active: 'ALL',
  deleted: 'NOT_DELETED'
});
const sal002 = reactive<Sal002Filters>({ dateTo: null, query: '' });
const sal004 = reactive<Sal004Filters>({ dateTo: null, query: '', onlyOverdue: false });
const pur001 = reactive<Pur001Filters>({ dateTo: null, query: '' });
const pur002 = reactive<Pur002Filters>({ dateTo: null, query: '', onlyOverdue: false });
const tar001 = reactive<Tar001Filters>({ tarifaId: 0, includeClients: true, onlyWithRules: false });
const tarifaRateOptions = ref<Array<{ label: string; value: number }>>([{ label: 'Todas', value: 0 }]);
const iva001 = reactive({ year: new Date().getFullYear(), quarter: Math.floor(new Date().getMonth() / 3) + 1 });
const requesterPkid = computed(() => authStore.user?.admin || securityStore.hasPermission(PERM.TASK_VIEW_ALL) ? undefined : authStore.user?.pkid);
const tas001 = reactive<Tas001Filters>({ dateFrom: null, dateTo: null, state: 'ALL', priority: 'ALL', userPkid: 0, entitiePkid: null, entitieLabel: '', overdueOnly: false, includeArchived: false, query: '', requesterPkid: requesterPkid.value });
const tas002 = reactive<Tas002Filters>({ dateFrom: null, dateTo: null, userPkid: 0, entitiePkid: null, entitieLabel: '', pendingOnly: false, query: '', requesterPkid: requesterPkid.value });
const taskUserOptions = ref<Array<{ label: string; value: number }>>([{ label: 'Todos', value: 0 }]);
const taskStateOptions = [{ label: 'Todos', value: 'ALL' }, { label: 'Planificada', value: 'PLANIFICADA' }, { label: 'En curso', value: 'EN_CURSO' }, { label: 'Finalizada', value: 'FINALIZADA' }, { label: 'Descartada', value: 'DESCARTADA' }];
const taskPriorityOptions = [{ label: 'Todas', value: 'ALL' }, { label: 'Baja', value: 'BAJA' }, { label: 'Media', value: 'MEDIA' }, { label: 'Alta', value: 'ALTA' }, { label: 'Urgente', value: 'URGENTE' }];
function selectTaskEntity(target: Tas001Filters | Tas002Filters, entity: any) { target.entitiePkid = Number(entity?.pkid ?? entity?.entitiePkId ?? entity?.id) || null; target.entitieLabel = entity?.name ?? entity?.entitieDsName ?? ''; }
function clearTaskEntity(target: Tas001Filters | Tas002Filters) { target.entitiePkid = null; target.entitieLabel = ''; }
const quarterOptions = [1, 2, 3, 4].map((value) => ({ label: `${value}º trimestre`, value }));
const ivaSettlement = ref<VatSettlement | null>(null);
const settlementBusy = ref(false);
const presentConfirmVisible = ref(false);
const sendToAdvisor = ref(false);
const clearVatPreview = () => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  pdfUrl.value = ''; previewRows.value = []; previewDone.value = false; previewError.value = ''; ivaSettlement.value = null; presentConfirmVisible.value = false;
};
watch([() => iva001.year, () => iva001.quarter], clearVatPreview);
const saleOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Para vender', value: 'SALE' },
  { label: 'Para comprar', value: 'PURCHASE' }
];
/** Familias del filtro (misma tabla de búsqueda que el maestro de artículos). */
const artFamilies = ref<Array<{ label: string; value: string }>>([{ label: 'Todas', value: '' }]);
onMounted(async () => {
  loadSavedParams();
  try {
    artFamilies.value = await artFamilyOptions();
  } catch {
    /* sin familias: queda "Todas" */
  }
  try {
    tarifaRateOptions.value = await tarifaOptions();
  } catch {
    /* sin tarifas: queda "Todas" */
  }
  try {
    const users = await getUsers();
    taskUserOptions.value = [{ label: 'Todos', value: 0 }, ...users.map((u: any) => ({ label: u.userDsName || u.name || u.userDsCode || `Usuario ${u.pkid ?? u.userKyId}`, value: Number(u.pkid ?? u.userKyId ?? u.id) })).filter((u: any) => Number.isFinite(u.value))];
  } catch { /* se mantiene la opción Todos */ }
});
const orderCriteria = ref<Array<{ field: string; dir: 'asc' | 'desc' }>>([{ field: 'name', dir: 'asc' }]);
const orderFields = computed(() => selectedReport.value === 'RPT-TAS-001' ? TAS_001_ORDER_FIELDS : selectedReport.value === 'RPT-TAS-002' ? TAS_002_ORDER_FIELDS : selectedReport.value === 'RPT-IVA-001' ? IVA_001_ORDER_FIELDS : selectedReport.value === 'RPT-TAR-001' ? TAR_001_ORDER_FIELDS : selectedReport.value === 'RPT-ART-001' ? ART_001_ORDER_FIELDS : selectedReport.value === 'RPT-SAL-002' ? SAL_002_ORDER_FIELDS : selectedReport.value === 'RPT-SAL-004' ? SAL_004_ORDER_FIELDS : selectedReport.value === 'RPT-PUR-001' ? PUR_001_ORDER_FIELDS : selectedReport.value === 'RPT-PUR-002' ? PUR_002_ORDER_FIELDS : CLI_001_ORDER_FIELDS);
const orderLabel = (value: string) => orderFields.value.find((f) => f.value === value)?.label ?? value;
const availableOrderFields = computed(() =>
  orderFields.value.filter((f) => visibleCols.value.includes(f.value) && !orderCriteria.value.some((c) => c.field === f.value))
);
function addOrder(value: string | null) {
  if (value && !orderCriteria.value.some((c) => c.field === value)) orderCriteria.value.push({ field: value, dir: 'asc' });
}
function removeOrder(index: number) {
  orderCriteria.value.splice(index, 1);
}
/** Columnas visibles del informe activo, en orden de salida. Por defecto todas. */
const activeColumns = computed(() => selectedReport.value === 'RPT-TAS-001' ? TAS_001_COLUMNS : selectedReport.value === 'RPT-TAS-002' ? TAS_002_COLUMNS : selectedReport.value === 'RPT-IVA-001' ? IVA_001_COLUMNS : selectedReport.value === 'RPT-TAR-001' ? TAR_001_COLUMNS : selectedReport.value === 'RPT-ART-001' ? ART_001_COLUMNS : selectedReport.value === 'RPT-SAL-002' ? SAL_002_COLUMNS : selectedReport.value === 'RPT-SAL-004' ? SAL_004_COLUMNS : selectedReport.value === 'RPT-PUR-001' ? PUR_001_COLUMNS : selectedReport.value === 'RPT-PUR-002' ? PUR_002_COLUMNS : CLI_001_COLUMNS);
const visibleCols = ref<string[]>(CLI_001_COLUMNS.map((c) => c.key));
const columnLabel = (key: string) => activeColumns.value.find((c) => c.key === key)?.header ?? key;
const hiddenCols = computed(() => activeColumns.value.filter((c) => !visibleCols.value.includes(c.key)));
function toggleCol(key: string) {
  const i = visibleCols.value.indexOf(key);
  if (i >= 0) {
    visibleCols.value.splice(i, 1);
    orderCriteria.value = orderCriteria.value.filter((c) => c.field !== key);
  } else {
    // Al final: se conserva el orden personalizado que ya hubiera.
    visibleCols.value.push(key);
  }
}
/** Reordenación por arrastrar y soltar. */
const dragCol = ref(-1);
const dragOrder = ref(-1);
function dropCol(index: number) {
  const from = dragCol.value;
  dragCol.value = -1;
  if (from < 0 || from === index) return;
  const arr = visibleCols.value;
  const [moved] = arr.splice(from, 1);
  arr.splice(index, 0, moved);
}
function dropOrder(index: number) {
  const from = dragOrder.value;
  dragOrder.value = -1;
  if (from < 0 || from === index) return;
  const arr = orderCriteria.value;
  const [moved] = arr.splice(from, 1);
  arr.splice(index, 0, moved);
}
/** Solo los informes (hojas) tienen parámetros; las ramas limpian y bloquean. */
const isReport = computed(() => selectedReport.value.startsWith('RPT-'));
/** Filtros del informe activo (CLI o ART). */
function currentFilters() {
  if (selectedReport.value === 'RPT-TAS-001') return tas001;
  if (selectedReport.value === 'RPT-TAS-002') return tas002;
  if (selectedReport.value === 'RPT-IVA-001') return iva001;
  if (selectedReport.value === 'RPT-TAR-001') return tar001;
  if (selectedReport.value === 'RPT-ART-001') return art001;
  if (selectedReport.value === 'RPT-SAL-002') return sal002;
  if (selectedReport.value === 'RPT-SAL-004') return sal004;
  if (selectedReport.value === 'RPT-PUR-001') return pur001;
  if (selectedReport.value === 'RPT-PUR-002') return pur002;
  return cli001;
}
function resetFilters() {
  cli001.dateFrom = null;
  cli001.dateTo = null;
  cli001.kind = 'ALL';
  cli001.active = 'ALL';
  cli001.deleted = 'NOT_DELETED';
  art001.family = '';
  art001.dateFrom = null;
  art001.dateTo = null;
  art001.sale = 'ALL';
  art001.active = 'ALL';
  art001.deleted = 'NOT_DELETED';
  sal002.dateTo = null;
  sal002.query = '';
  sal004.dateTo = null;
  sal004.query = '';
  sal004.onlyOverdue = false;
  pur001.dateTo = null;
  pur001.query = '';
  pur002.dateTo = null;
  pur002.query = '';
  pur002.onlyOverdue = false;
  tar001.tarifaId = 0;
  tar001.includeClients = true;
  tar001.onlyWithRules = false;
  iva001.year = new Date().getFullYear();
  iva001.quarter = Math.floor(new Date().getMonth() / 3) + 1;
  Object.assign(tas001, { dateFrom: null, dateTo: null, state: 'ALL', priority: 'ALL', userPkid: 0, entitiePkid: null, entitieLabel: '', overdueOnly: false, includeArchived: false, query: '', requesterPkid: requesterPkid.value });
  Object.assign(tas002, { dateFrom: null, dateTo: null, userPkid: 0, entitiePkid: null, entitieLabel: '', pendingOnly: false, query: '', requesterPkid: requesterPkid.value });
}
function onNodeSelect(node: any) {
  selectedReport.value = node?.key ?? '';
  // Al cambiar de rama o de informe siempre se limpia la previsualización.
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  pdfUrl.value = '';
  previewRows.value = [];
  previewDone.value = false;
  previewError.value = '';
  ivaSettlement.value = null;
  if (node?.children) {
    resetFilters();
    orderCriteria.value = [{ field: 'name', dir: 'asc' }];
  } else {
    orderCriteria.value =
      selectedReport.value === 'RPT-TAS-001' ? [{ field: 'dueDateRaw', dir: 'asc' }] : selectedReport.value === 'RPT-TAS-002' ? [{ field: 'workDateRaw', dir: 'asc' }] : selectedReport.value === 'RPT-IVA-001' ? [{ field: 'dateRaw', dir: 'asc' }] : selectedReport.value === 'RPT-TAR-001' ? [{ field: 'tarifaCode', dir: 'asc' }] : selectedReport.value === 'RPT-ART-001' ? [{ field: 'description', dir: 'asc' }] : selectedReport.value === 'RPT-SAL-002' ? [{ field: 'expectedDateRaw', dir: 'asc' }] : selectedReport.value === 'RPT-SAL-004' ? [{ field: 'dueDateRaw', dir: 'asc' }] : selectedReport.value === 'RPT-PUR-001' ? [{ field: 'createDateRaw', dir: 'asc' }] : selectedReport.value === 'RPT-PUR-002' ? [{ field: 'dueDateRaw', dir: 'asc' }] : [{ field: 'name', dir: 'asc' }];
    visibleCols.value = activeColumns.value.map((c) => c.key);
    loadSavedParams();
  }
}

/** Recuerda los parámetros por informe: back primero, navegador como respaldo. */
import { loadReportPref, saveReportPref } from '@/services/Informes/reportPrefs';
function saveParams() {
  void saveReportPref(selectedReport.value, { filters: { ...currentFilters() }, order: orderCriteria.value, columns: [...visibleCols.value] });
}
async function loadSavedParams() {
  const saved = await loadReportPref<any>(selectedReport.value);
  try {
    if (!saved) return;
    const target: any = currentFilters();
    if (saved.filters) {
      for (const key of Object.keys(target)) {
        if (!(key in saved.filters)) continue;
        if (key === 'dateFrom' || key === 'dateTo') target[key] = saved.filters[key] ? new Date(saved.filters[key]) : null;
        else target[key] = saved.filters[key];
      }
    }
    if (Array.isArray(saved.order) && saved.order.length) orderCriteria.value = saved.order;
    if (Array.isArray(saved.columns) && saved.columns.length) {
      const known = activeColumns.value.map((c) => c.key);
      visibleCols.value = saved.columns.filter((k: string) => known.includes(k));
      if (!visibleCols.value.length) visibleCols.value = [...known];
    }
  } catch {
    /* sin parámetros guardados */
  }
}
const kindOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Clientes', value: 'CLIENTS' },
  { label: 'Proveedores', value: 'SUPPLIERS' }
];
const activeOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Activos', value: 'ACTIVE' },
  { label: 'Inactivos', value: 'INACTIVE' }
];
const deletedOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Sin borrar', value: 'NOT_DELETED' },
  { label: 'Solo borrados', value: 'ONLY_DELETED' }
];

/**
 * Validación de fechas: todo puede ir en blanco, pero si se
 * indica una fecha hay que indicar la otra y la inicial no puede superar a la final.
 */
const dateError = computed(() => {
  if (selectedReport.value === 'RPT-IVA-001') return '';
  const { dateFrom, dateTo } = currentFilters() as { dateFrom: Date | null; dateTo: Date | null };
  if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) return 'Si indicas una fecha debes indicar la otra.';
  if (dateFrom && dateTo) {
    const from = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate()).getTime();
    const to = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate()).getTime();
    if (from > to) return 'La fecha inicial no puede ser superior a la fecha final.';
  }
  return '';
});

/** Vista previa del RPT-CLI-001: consulta con los filtros del formulario. */
const previewLoading = ref(false);
const previewError = ref('');
const previewDone = ref(false);
const previewRows = ref<ReportRow[]>([]);
const previewSection = ref<HTMLElement | null>(null);
const pdfUrl = ref('');

const filtersText = computed(() =>
  selectedReport.value === 'RPT-TAS-001' ? tas001FiltersText(tas001) : selectedReport.value === 'RPT-TAS-002' ? tas002FiltersText(tas002) : selectedReport.value === 'RPT-IVA-001' ? iva001FiltersText(iva001, ivaSettlement.value) : selectedReport.value === 'RPT-TAR-001' ? tar001FiltersText(tar001, tarifaRateOptions.value.find((o) => o.value === tar001.tarifaId)?.label ?? '') : selectedReport.value === 'RPT-ART-001' ? art001FiltersText(art001) : selectedReport.value === 'RPT-SAL-002' ? sal002FiltersText(sal002) : selectedReport.value === 'RPT-SAL-004' ? sal004FiltersText(sal004) : selectedReport.value === 'RPT-PUR-001' ? pur001FiltersText(pur001) : selectedReport.value === 'RPT-PUR-002' ? pur002FiltersText(pur002) : cli001FiltersText(cli001)
);

async function preview() {
  if (dateError.value || !isReport.value) return;
  saveParams();
  previewLoading.value = true;
  previewError.value = '';
  previewDone.value = false;
  previewRows.value = [];
  try {
    let rows: ReportRow[];
    tas001.requesterPkid = requesterPkid.value;
    tas002.requesterPkid = requesterPkid.value;
    if (selectedReport.value === 'RPT-TAS-001') {
      rows = await fetchTas001(tas001);
    } else if (selectedReport.value === 'RPT-TAS-002') {
      rows = await fetchTas002(tas002);
    } else if (selectedReport.value === 'RPT-IVA-001') {
      const result = await fetchIva001(iva001);
      ivaSettlement.value = result.settlement;
      sendToAdvisor.value = Boolean(result.settlement.advisorConfigured);
      rows = result.rows;
    } else if (selectedReport.value === 'RPT-SAL-002') {
      rows = await fetchSal002(sal002);
    } else if (selectedReport.value === 'RPT-SAL-004') {
      rows = await fetchSal004(sal004);
    } else if (selectedReport.value === 'RPT-PUR-001') {
      rows = await fetchPur001(pur001);
    } else if (selectedReport.value === 'RPT-PUR-002') {
      rows = await fetchPur002(pur002);
    } else if (selectedReport.value === 'RPT-TAR-001') {
      rows = await fetchTar001(tar001);
    } else {
      const isArt = selectedReport.value === 'RPT-ART-001';
      rows = isArt ? await fetchArt001(art001) : await fetchCli001(cli001);
    }
    const columns = visibleCols.value.flatMap((key) => {
      const col = activeColumns.value.find((c) => c.key === key);
      return col ? [col] : [];
    });
    const effectiveColumns = columns.length ? columns : [...activeColumns.value];
    orderCriteria.value = orderCriteria.value.filter((c) => effectiveColumns.some((col) => col.key === c.field));
    previewRows.value = sortReportRows(
      rows,
      orderCriteria.value.map((c) => ({ key: c.field, dir: c.dir }))
    );
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
    pdfUrl.value = await buildReportPdf({
      code: selectedReport.value,
      title: selectedTitle.value,
      subtitle: selectedReport.value === 'RPT-IVA-001' && ivaSettlement.value?.settlement ? `Liquidación ${ivaSettlement.value.settlement.label} · v${ivaSettlement.value.settlement.version} ${ivaSettlement.value.settlement.status === 'PRESENTED' ? '· Presentada' : ivaSettlement.value.settlement.outdated ? '· Desactualizada' : '· Preparada'}` : undefined,
      filtersText: filtersText.value,
      columns: effectiveColumns,
      rows: previewRows.value,
      sections: selectedReport.value === 'RPT-IVA-001' ? vatSections(previewRows.value, effectiveColumns) : selectedReport.value === 'RPT-TAS-002' ? taskTimeSections(previewRows.value, effectiveColumns) : undefined,
      dottedRows: selectedReport.value === 'RPT-IVA-001',
      redWhen: (r) => selectedReport.value === 'RPT-IVA-001' ? r.hasReview === true : r.deleted === true || r.overdue === true,
      company: {
        name: companyStore.companyInfo.nameCompany,
        slogan: companyStore.companyInfo.sloganCompany,
        logoUrl: companyStore.companyInfo.urlLogo
      }
    });
    previewDone.value = true;
    await nextTick();
    previewSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e: any) {
    previewError.value = typeof e.response?.data === 'string' ? e.response.data : 'No se pudo generar la vista previa.';
  } finally {
    previewLoading.value = false;
  }
}

const versionLoading = ref(false);
/** Carga la fotografía de una versión concreta (ver/descargar versiones anteriores). */
async function viewVersion(version: number) {
  if (versionLoading.value) return;
  versionLoading.value = true;
  previewError.value = '';
  try {
    const result = await fetchIvaVersion(iva001.year, iva001.quarter, version);
    ivaSettlement.value = result.settlement;
    sendToAdvisor.value = Boolean(result.settlement.advisorConfigured);
    const columns = visibleCols.value.flatMap((key) => {
      const col = activeColumns.value.find((c) => c.key === key);
      return col ? [col] : [];
    });
    const effectiveColumns = columns.length ? columns : [...activeColumns.value];
    previewRows.value = sortReportRows(result.rows, orderCriteria.value.map((c) => ({ key: c.field, dir: c.dir })));
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
    pdfUrl.value = await buildReportPdf({
      code: selectedReport.value,
      title: selectedTitle.value,
      subtitle: result.settlement?.settlement ? `Liquidación ${result.settlement.settlement.label} · v${result.settlement.settlement.version} ${result.settlement.settlement.status === 'PRESENTED' ? '· Presentada' : result.settlement.settlement.status === 'PREPARED' ? '· Preparada' : '· Sustituida'}` : undefined,
      filtersText: filtersText.value,
      columns: effectiveColumns,
      rows: previewRows.value,
      sections: vatSections(previewRows.value, effectiveColumns),
      dottedRows: true,
      redWhen: (r) => r.hasReview === true,
      company: { name: companyStore.companyInfo.nameCompany, slogan: companyStore.companyInfo.sloganCompany, logoUrl: companyStore.companyInfo.urlLogo }
    });
    previewDone.value = true;
    await nextTick();
    previewSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e: any) {
    previewError.value = typeof e.response?.data === 'string' ? e.response.data : 'No se pudo cargar la versión.';
  } finally {
    versionLoading.value = false;
  }
}

async function prepareSettlement(regularization = false) {  settlementBusy.value = true;
  try {
    await prepareIva001(iva001, regularization);
    toast.add({ severity: 'success', summary: regularization ? 'Regularización preparada' : 'Preliquidación guardada', detail: regularization ? `Se ha creado una nueva versión de T${iva001.quarter}/${iva001.year}; la presentada original permanece conservada.` : `T${iva001.quarter}/${iva001.year} queda preparada con su relación de facturas.`, life: 5000 });
    await preview();
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudo guardar', detail: typeof e.response?.data === 'string' ? e.response.data : 'Revisa los datos del trimestre.', life: 5500 });
  } finally {
    settlementBusy.value = false;
  }
}

async function presentSettlement() {
  settlementBusy.value = true;
  try {
    const report = pdfUrl.value ? await fetch(pdfUrl.value).then((response) => response.blob()) : undefined;
    const result = await presentIva001(iva001, report, sendToAdvisor.value);
    presentConfirmVisible.value = false;
    toast.add({ severity: 'success', summary: 'Liquidación presentada', detail: `T${iva001.quarter}/${iva001.year} ha quedado cerrada como presentada.`, life: 5000 });
    if (result.advisorEmailStatus === 'SENT') toast.add({ severity: 'success', summary: 'Enviada al gestor', detail: `La liquidación se ha enviado a ${result.advisorEmail}.`, life: 5000 });
    else if (result.advisorEmailStatus && result.advisorEmailStatus !== 'NOT_CONFIGURED') toast.add({ severity: 'warn', summary: 'Liquidación presentada, correo pendiente', detail: 'No se pudo enviar el PDF al gestor. Revisa el contacto y la configuración de correo.', life: 6500 });
    await preview();
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudo cerrar', detail: typeof e.response?.data === 'string' ? e.response.data : 'Revisa el estado de la preliquidación.', life: 5500 });
  } finally {
    settlementBusy.value = false;
  }
}

/** Descarga la previa con el nombre del informe: RPT-XXX-NNN_AAAAMMDD.pdf. */async function downloadPdf() {
  if (!pdfUrl.value) return;
  const now = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  const name = `${selectedReport.value}_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.pdf`;
  try {
    const w = window as any;
    if (w.showSaveFilePicker) {
      const blob = await (await fetch(pdfUrl.value)).blob();
      const handle = await w.showSaveFilePicker({
        suggestedName: name,
        types: [{ description: 'Informe PDF', accept: { 'application/pdf': ['.pdf'] } }]
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }
  } catch {
    return; // diálogo cancelado o no soportado: se usa el enlace clásico
  }
  const a = document.createElement('a');
  a.href = pdfUrl.value;
  a.download = name;
  a.click();
}

/** Exporta a Excel las columnas visibles, en su orden. */
function exportExcel() {
  if (!previewRows.value.length) return;
  const columns = visibleCols.value.flatMap((key) => {
    const col = activeColumns.value.find((c) => c.key === key);
    return col ? [col] : [];
  });
  exportReportExcel({ code: selectedReport.value, columns, rows: previewRows.value, sections: selectedReport.value === 'RPT-IVA-001' ? vatSections(previewRows.value, columns) : selectedReport.value === 'RPT-TAS-002' ? taskTimeSections(previewRows.value, columns) : undefined });
}
const reportMoney = (value: unknown) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value ?? 0));
const reportNumber = (value: unknown) => new Intl.NumberFormat('es-ES', { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value ?? 0));
const rateBreakdown = (side: any) => (side?.rates ?? []).map((row: any) => `${Number(row.rate).toLocaleString('es-ES')} %: ${reportMoney(row.tax)}`).join(' · ') || 'Sin cuotas de IVA';
const vatSections = (rows: ReportRow[], columns: typeof IVA_001_COLUMNS) => {
  type PartyGroup = { party: string; nif: string; documents: number; netRaw: number; taxRaw: number; totalRaw: number };
  const groupByParty = (direction: 'Ventas' | 'Compras', emptyLabel: string) => {
    const groups = new Map<string, PartyGroup>();
    for (const row of rows.filter((item) => item.direction === direction)) {
      const party = String(row.party || emptyLabel), nif = String(row.nif || '');
      const key = `${party}\u0000${nif}`;
      const group = groups.get(key) ?? { party, nif, documents: 0, netRaw: 0, taxRaw: 0, totalRaw: 0 };
      group.documents += 1; group.netRaw += Number(row.netRaw ?? 0); group.taxRaw += Number(row.taxRaw ?? 0); group.totalRaw += Number(row.totalRaw ?? 0);
      groups.set(key, group);
    }
    return [...groups.values()]
      .sort((a, b) => a.party.localeCompare(b.party, 'es', { sensitivity: 'base' }))
      .map((group) => ({ party: group.party, nif: group.nif || '—', documents: group.documents, net: reportNumber(group.netRaw), tax: reportNumber(group.taxRaw), total: reportNumber(group.totalRaw) }));
  };
  const customerRows: ReportRow[] = groupByParty('Ventas', 'Cliente sin nombre');
  const supplierRows: ReportRow[] = groupByParty('Compras', 'Proveedor sin nombre');
  const totalRow = (source: ReportRow[], sectionColumns: typeof IVA_001_COLUMNS, label: string): ReportRow => {
    const result: ReportRow = {};
    for (const column of sectionColumns) result[column.key] = '';
    const labelColumn = sectionColumns.find((column) => !['net', 'tax', 'total'].includes(column.key));
    if (labelColumn) result[labelColumn.key] = label;
    result.net = reportNumber(source.reduce((sum, row) => sum + Number(row.netRaw ?? 0), 0));
    result.tax = reportNumber(source.reduce((sum, row) => sum + Number(row.taxRaw ?? 0), 0));
    result.total = reportNumber(source.reduce((sum, row) => sum + Number(row.totalRaw ?? 0), 0));
    return result;
  };
  const salesRows = rows.filter((row) => row.direction === 'Ventas');
  const purchaseRows = rows.filter((row) => row.direction === 'Compras');
  const salesColumns = columns.filter((column) => column.key !== 'supplierCode');
  const purchaseColumns = columns;
  const summaryColumns = [
    { key: 'party', header: 'Cliente' }, { key: 'nif', header: 'NIF / CIF' },
    { key: 'documents', header: 'Documentos', align: 'right' as const },
    { key: 'net', header: 'Base imponible', align: 'right' as const },
    { key: 'tax', header: 'IVA', align: 'right' as const }, { key: 'total', header: 'Total', align: 'right' as const }
  ];
  return [
    { title: 'Ventas · IVA repercutido', rows: salesRows, columns: salesColumns, footerRows: [totalRow(salesRows, salesColumns, 'TOTALES VENTAS')], bodyFontSize: 6.35 },
    { title: 'Compras · IVA soportado', rows: purchaseRows, columns: purchaseColumns, footerRows: [totalRow(purchaseRows, purchaseColumns, 'TOTALES COMPRAS')], bodyFontSize: 6.35 },
    { title: 'Resumen final · Ventas agrupadas por cliente', rows: customerRows, columns: summaryColumns, bodyFontSize: 6.5 },
    { title: 'Resumen final · Compras agrupadas por proveedor', rows: supplierRows, columns: [{ ...summaryColumns[0], header: 'Proveedor' }, ...summaryColumns.slice(1)], bodyFontSize: 6.5 }
  ];
};

/** El parte detallado termina con resúmenes útiles para dirección y facturación. */
const taskTimeSections = (rows: ReportRow[], columns: typeof TAS_002_COLUMNS) => {
  const aggregate = (key: 'userName' | 'company', emptyLabel: string) => {
    const groups = new Map<string, { label: string; entries: number; hours: number; invoiced: number; pending: number; amount: number }>();
    for (const row of rows) {
      const label = String(row[key] || emptyLabel);
      const group = groups.get(label) ?? { label, entries: 0, hours: 0, invoiced: 0, pending: 0, amount: 0 };
      group.entries += 1; group.hours += Number(row.hoursRaw ?? 0); group.invoiced += Number(String(row.invoicedHours ?? '0').replace(/\./g, '').replace(',', '.'));
      group.pending += Number(String(row.pendingHours ?? '0').replace(/\./g, '').replace(',', '.')); group.amount += Number(row.pendingAmountRaw ?? 0);
      groups.set(label, group);
    }
    return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label, 'es')).map((g) => ({ label: g.label, entries: g.entries, hours: reportNumber(g.hours), invoiced: reportNumber(g.invoiced), pending: reportNumber(g.pending), amount: reportNumber(g.amount) }));
  };
  const summaryColumns = [
    { key: 'label', header: 'Agrupación' }, { key: 'entries', header: 'Partes', align: 'right' as const },
    { key: 'hours', header: 'Horas', align: 'right' as const }, { key: 'invoiced', header: 'Facturadas', align: 'right' as const },
    { key: 'pending', header: 'Pendientes', align: 'right' as const }, { key: 'amount', header: 'Importe pendiente', align: 'right' as const }
  ];
  return [
    { title: 'Detalle de imputaciones', rows, columns, bodyFontSize: 6.4 },
    { title: 'Resumen por empleado', rows: aggregate('userName', 'Sin empleado'), columns: summaryColumns, bodyFontSize: 7 },
    { title: 'Resumen por cliente', rows: aggregate('company', 'Sin cliente'), columns: [{ ...summaryColumns[0], header: 'Cliente' }, ...summaryColumns.slice(1)], bodyFontSize: 7 }
  ];
};

/** Las hojas tienen forma "[CODIGO] Título": separamos para resaltar el código. */
const leafCode = (label?: string) => (label?.startsWith('[') ? label.slice(0, label.indexOf(']') + 1) : '');
const leafTitle = (label?: string) => (label?.startsWith('[') ? label.slice(label.indexOf(']') + 1).trim() : (label ?? ''));

/** Título del informe seleccionado para la cabecera del panel derecho. */
const selectedTitle = computed(() => {
  const all = salesNodes.value.flatMap((n) => [n, ...(n.children ?? [])]);
  return leafTitle(all.find((n) => n.key === selectedReport.value)?.label);
});
</script>

<style scoped>
.reports-page { display: flex; flex-direction: column; width: 100%; min-height: calc(100dvh - 66px); box-sizing: border-box; padding: 18px 16px 72px; color: #243044; background: rgba(247,248,250,.58); }
.page-header { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 18px; padding: 15px 20px; border: 1px solid #e3e8d2; border-radius: 15px; background: #fff; box-shadow: 0 6px 18px rgba(31,41,55,.055); }
.page-header::after { content: ""; position: absolute; z-index: 0; width: 300px; height: 300px; right: 20px; top: 50%; transform: translateY(-50%); background: url('/logos/logo512.png') center/contain no-repeat; filter: grayscale(1); opacity: .075; pointer-events: none; }
.page-header > * { position: relative; z-index: 1; }
.page-heading { display: flex; align-items: center; gap: 14px; }
.page-icon { display: grid; width: 50px; height: 50px; flex: 0 0 auto; place-items: center; border-radius: 13px; color: #fff; background: linear-gradient(135deg,#16a085,#0e7c66); box-shadow: 0 7px 15px rgba(22,160,133,.22); }
.page-icon i { font-size: 1.3rem; }
.breadcrumb { color: #8791a0; font-size: .8rem; font-weight: 700; }
.page-heading h1 { margin: 3px 0 2px; color: #202939; font-size: 1.38rem; }
.page-heading p { margin: 0; color: #7a8494; font-size: .92rem; }
.header-actions { display: flex; align-items: center; gap: 3px; }
.reports-tabs { display: flex; flex-direction: column; height: calc(100dvh - 160px); min-height: 1200px; overflow: hidden; border: 1px solid #e1e6eb; border-radius: 13px; background: #fff; box-shadow: 0 3px 11px rgba(30,41,59,.04); }
.reports-tabs :deep(.p-tabpanels) { flex: 1; min-height: 0; padding: 14px; background: #f7f9f5; }
.reports-tabs :deep(.p-tabpanel) { height: 100%; }
.reports-tabs :deep(.p-tab) { gap: 7px; }
.ven-panel { height: 100%; }
.ven-body { display: flex; gap: 14px; height: 100%; min-height: 0; }
.ven-card { min-height: 0; border: 1px solid #e1e6eb; border-radius: 13px; background: #fff; box-shadow: 0 3px 11px rgba(30,41,59,.04); }
.ven-card--side { flex: 0 0 25%; padding: 10px; overflow-y: auto; }
.ven-card--main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.ven-toolbar { padding: 13px 17px; border: 0; border-bottom: 1px solid #e8ecf0; border-radius: 0; background: #fff; }
.ven-toolbar :deep(.p-toolbar-start) { display: flex; align-items: center; gap: .6rem; }
.report-footer { flex-shrink: 0; padding: 0 17px 14px; background: #fff; }
.report-footer .kiwik-separator { width: 100%; margin: 0 0 14px; }
.report-footer-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .5rem; }
.ven-report-name { color: #344054; font-size: .95rem; }
.ven-main-body { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 14px; padding: 14px; overflow: hidden; background: #f7f9f5; }
.ven-params, .ven-preview { border: 1px solid #e1e6eb; border-radius: 13px; background: #fff; box-shadow: 0 3px 11px rgba(30,41,59,.04); padding: 20px; }
.ven-preview { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow-y: auto; }
.section-heading { display: flex; align-items: center; gap: 11px; }
.section-heading > span { display: grid; width: 37px; height: 37px; place-items: center; border-radius: 9px; color: #66810a; background: #eef5dc; }
.section-heading h2 { margin: 0; font-size: 1rem; color: #273244; }
.section-heading p { margin: 3px 0 0; color: #7c8796; font-size: .82rem; }
.params-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 17px 22px; margin-top: 16px; }
.params-grid .field { display: flex; min-width: 0; flex-direction: column; gap: 7px; }
.params-grid .field > span { color: #596577; font-size: .78rem; font-weight: 750; }
.params-grid .check-row { display: flex; align-items: center; gap: .5rem; min-height: 2.5rem; color: #344054; font-size: .86rem; }
.params-grid--iva { grid-template-columns: minmax(180px, .5fr) minmax(220px, .7fr) minmax(300px, 1.8fr); align-items: end; }
.vat-summary { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 10px; margin-bottom: 12px; }
.vat-summary article { display: flex; min-width: 0; flex-direction: column; gap: 3px; padding: 12px 14px; border: 1px solid #e2e8d2; border-radius: 10px; background: #f8faF2; }
.vat-summary article:nth-child(2) { border-color: #f0ddc8; background: #fff8f1; }
.vat-summary article:nth-child(3) { color: #344600; border-color: #cfe0a8; background: #eef5dc; }
.vat-summary article.vat-result--negative { color: #8b4b17; border-color: #f0c99f; background: #fff3e7; }
.vat-summary small { color: #737f8f; font-size: .69rem; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
.vat-summary strong { font-size: 1.18rem; font-variant-numeric: tabular-nums; }
.vat-summary span { color: #6b7585; font-size: .72rem; }
.vat-summary em { overflow: hidden; color: #8791a0; font-size: .67rem; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.advisor-send-option{display:flex;align-items:flex-start;gap:.75rem;margin-top:14px;padding:13px 14px;border:1px solid #dfe7cc;border-radius:10px;background:#f8fbed;cursor:pointer}.advisor-send-option span,.advisor-send-option strong,.advisor-send-option small{display:block}.advisor-send-option strong{color:#354321;font-size:.88rem}.advisor-send-option small{margin-top:3px;color:#75806d;font-size:.75rem}.advisor-send-option.disabled{border-color:#e5e7eb;background:#f7f7f7;cursor:not-allowed;opacity:.78}
.dialog-footer{width:100%}
.dialog-footer-separator{width:100%;min-height:1px;margin:0 0 .75rem}
.dialog-footer-actions{display:flex;justify-content:flex-end;gap:.5rem;width:100%}
.vat-settlement-state { display:flex; align-items:center; gap:10px; margin:0 0 12px; padding:10px 12px; border:1px solid #e3e8d8; border-radius:10px; background:#fbfcf8; }
.vat-settlement-state span { color:#657080; font-size:.77rem; line-height:1.4; }
.vat-version-history { display:flex; flex-wrap:wrap; align-items:center; gap:7px; margin:0 0 12px; color:#687383; font-size:.72rem; }
.vat-version-history span { padding:3px 7px; border:1px solid #dfe5d6; border-radius:999px; background:#fafcf6; }
.order-box { display: flex; flex-wrap: wrap; align-items: flex-end; gap: .8rem 22px; margin-top: 16px; padding: 12px 14px; border: 1px dashed #9cc10a; border-radius: 10px; background: #f4f9e8; }
.order-box .order-title { display: flex; align-items: center; gap: .45rem; width: 100%; color: #648506; font-size: .82rem; font-weight: 800; }
.order-chips { display: flex; flex-wrap: wrap; gap: .4rem; width: 100%; }
.order-chip { display: inline-flex; align-items: center; gap: .35rem; padding: .25rem .35rem .25rem .5rem; border: 1px solid #cfe3a8; border-radius: 999px; background: #fff; font-size: .8rem; color: #344054; }
.order-chip b { display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: #9cc10a; color: #253000; font-size: .72rem; }
.order-chip[draggable="true"] { cursor: grab; }
.order-chip.dragging { opacity: .4; }
.order-dir { border: 1px solid #cfe3a8; border-radius: 6px; background: #f4f9e8; color: #648506; font-size: .68rem; font-weight: 800; padding: .1rem .35rem; cursor: pointer; }
.order-empty { color: #7d8797; font-size: .8rem; }
.order-chip--off { opacity: .75; border-style: dashed; }
.order-box .field { display: flex; min-width: 180px; flex: 1; flex-direction: column; gap: 7px; }
.order-box .field > span { color: #596577; font-size: .78rem; font-weight: 750; }
.rep-body { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; margin-top: 14px; overflow: visible; }
.rep-loading { display: flex; align-items: center; justify-content: center; gap: .6rem; padding: 2rem; color: #687386; }
.rep-meta { display: flex; align-items: baseline; gap: 1rem; margin-bottom: .6rem; color: #344054; }
.rep-meta span { color: #7d8797; font-size: .82rem; }
.rep-empty { color: #7d8797; font-size: .88rem; }
.rep-pdf { flex: none; height: 78vh; min-height: 620px; width: 100%; border: 1px solid #e8ecf0; border-radius: 8px; background: #fff; }
@media (max-width: 900px) { .params-grid,.params-grid--iva { grid-template-columns: repeat(2,minmax(0,1fr)); } .vat-summary { grid-template-columns: 1fr; } }
@media (max-width: 620px) { .params-grid { grid-template-columns: 1fr; } }
.ven-tree { border: 0; padding: 0; }
.ven-tree :deep(.p-treenode-label) { flex: 1; font-size: .83rem; }
.ven-parent { display: flex; align-items: center; gap: .5rem; color: #3c4a1e; font-weight: 800; font-size: .9rem; }
.ven-parent-icon { display: grid; place-items: center; width: 26px; height: 26px; flex: 0 0 26px; border-radius: 7px; background: #eef5dc; }
.ven-parent-icon i { font-size: .85rem; color: #66810a; }
.ven-parent .p-tag { margin-left: auto; }
.ven-leaf { display: flex; align-items: center; gap: .45rem; font-size: .9rem; }
.ven-leaf-code { color: #648506; font-size: .8rem; font-weight: 800; white-space: nowrap; }
@media (max-width: 900px) { .page-heading p { display: none; } }
</style>
