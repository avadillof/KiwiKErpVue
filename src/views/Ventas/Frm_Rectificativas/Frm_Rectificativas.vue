<template>
  <RecInvoiceEmailDialog ref="emailDialog" @sent="refresh" />
  <RecInvoiceAuditDialog ref="recInvoiceAuditDialog" />
  <SalesTraceabilityDialog ref="traceabilityRef" />
  <InvoiceAssistantDialog ref="invoiceAssistant" />
  <DialogNotes
    v-model:visible="notesVisible"
    :request="noteRequest"
    @saved="onNotesSaved"
  />
  <AttachmentsDialog
    v-model:visible="attachmentsVisible"
    moduleFolder="ATTACHEMENTS_SALESRECINVOICES_DOCUMENTS"
    :title="`Documentos de ${attachment?.code || 'rectificativa'}`"
    :entityId="attachment?.pkid"
    @update:visible="attachmentsChanged"
  />
  <main class="rec-page">
    <header class="hero">
      <div class="heading">
        <span class="hero-icon"><i class="pi pi-undo" /></span>
        <div>
          <small>Ventas / Operaciones</small>
          <h1>Facturas rectificativas</h1>
          <p>
            Abonos totales o parciales con trazabilidad hasta la factura
            original.
          </p>
        </div>
      </div>
      <div class="hero-actions">
      <Button
        v-if="aiAssistantAvailable"
        class="assistant-access"
        label="Asistente de Facturas"
        icon="pi pi-sparkles"
        @click="invoiceAssistant?.open()"
      />
      <Button
        label="Ventas"
        icon="pi pi-arrow-left"
        text
        severity="secondary"
        @click="router.push({ name: 'Ventas' })"
      />
      </div>
    </header>

    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <section class="list-card">
      <div class="toolbar">
        <div>
          <h2>Listado de rectificativas</h2>
          <small
            >Los borradores reservan las cantidades que se van a abonar.</small
          >
        </div>
        <div class="toolbar-actions">
          <Button
            v-if="securityStore.hasPermission(PERM.CREDIT_EMAIL)"
            label="Enviar pendientes"
            icon="pi pi-send"
            outlined
            v-tooltip.bottom="'Envía por correo las rectificativas emitidas y nunca enviadas al contacto principal del cliente (máximo 50 por tanda). Queda registrado en cada rectificativa.'"
            :disabled="busy || sendingPending"
            @click="openSendPending"
          /><Button
            class="corporate"
            v-if="securityStore.hasPermission(PERM.CREDIT_EDIT)"
            label="Nueva rectificativa"
            icon="pi pi-plus"
            @click="openNew"
          />
        </div>
      </div>
      <GenericDataTable
        ref="tableRef"
        class="table compact-table custom-header-table"
        selectionMode="single"
        v-model:selection="selected"
        dataKey="pkid"
        endpoint="WebGetSalesRecInvoices"
        :params="{
          status: status || undefined,
          verifactuStatus: verifactuStatus || undefined,
          emailStatus: emailStatus || undefined,
        }"
        :requestConfig="() => auth.portalRequestConfig()"
        :showPaginator="true"
        :filterable="true"
        :showActions="true">
        <template #panelOptions>
          <div class="rec-filters">
            <Select
              v-model="status"
              :options="statuses"
              optionLabel="label"
              optionValue="value"
              placeholder="Situación: Todas"
              showClear
              aria-label="Situación"
              class="filter"
              @change="filter"
              ><template #value="{ value, placeholder }"
                ><Tag
                  v-if="value"
                  :value="
                    statuses.find((item) => item.value === value)?.label ||
                    value
                  "
                  :severity="situationFilterSeverity(value)"
                  rounded /><span v-else>{{ placeholder }}</span></template
              ><template #option="{ option }"
                ><Tag
                  :value="option.label"
                  :severity="situationFilterSeverity(option.value)"
                  rounded /></template
            ></Select>
            <Select
              v-model="verifactuStatus"
              :options="verifactuStatuses"
              optionLabel="label"
              optionValue="value"
              showClear
              placeholder="VeriFactu: Todas"
              aria-label="Situación de VeriFactu"
              class="filter verifactu-filter"
              @change="filter"
              ><template #value="{ value, placeholder }"
                ><Tag
                  v-if="value"
                  :value="
                    verifactuStatuses.find((item) => item.value === value)
                      ?.label || value
                  "
                  :severity="verifactuFilterSeverity(value)"
                  rounded /><span v-else>{{ placeholder }}</span></template
              ><template #option="{ option }"
                ><Tag
                  :value="option.label"
                  :severity="verifactuFilterSeverity(option.value)"
                  rounded /></template
            ></Select>
            <Select
              v-model="emailStatus"
              :options="emailStatuses"
              optionLabel="label"
              optionValue="value"
              showClear
              placeholder="Correo al cliente: Todas"
              aria-label="Envío de correo al cliente"
              class="filter email-filter"
              @change="filter"
              ><template #value="{ value, placeholder }"
                ><Tag
                  :value="
                    value === 'SENT'
                      ? 'Correo: Enviadas'
                      : value === 'NOT_SENT'
                        ? 'Correo: No enviadas'
                        : placeholder
                  "
                  :severity="emailFilterSeverity(value)"
                  icon="pi pi-envelope"
                  rounded /></template
              ><template #option="{ option }"
                ><Tag
                  :value="option.label"
                  :severity="emailFilterSeverity(option.value)"
                  icon="pi pi-envelope"
                  rounded /></template
            ></Select>
          </div>
        </template>
        <template #headerActions
          ><Button
            icon="pi pi-refresh"
            text
            rounded
            title="Refrescar"
            @click="refreshTable" /><Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            title="Opciones"
            @click="tableMenu?.toggle($event)" /><Menu
            ref="tableMenu"
            :model="tableItems"
            popup
        /></template>
        <template #empty>No hay rectificativas para estos filtros.</template>
        <Column
          field="code"
          header="Código"
          sortable
          style="min-width: 155px"
          bodyStyle="white-space:nowrap"
          ><template #body="{ data }"
            ><span class="code-with-indicators"><span :class="{ 'draft-code': data.draft }">{{
              data.code
            }}</span><span v-if="data.hasNotes || data.rectificationCount || data.attachmentCount" class="rectification-indicator"><Tag v-if="data.attachmentCount" :value="String(data.attachmentCount)" icon="pi pi-paperclip" severity="info" rounded /><i v-if="data.hasNotes" class="pi pi-comment notes" title="Tiene observaciones" /><span v-if="data.rectificationCount" :title="rectificationTooltip(data)"><Tag :value="String(data.rectificationCount)" icon="pi pi-undo" severity="warn" rounded /></span></span></span></template
          ></Column
        ><Column
          field="date"
          header="Fecha"
          sortable
          style="width: 8rem"
          bodyStyle="white-space:nowrap;font-variant-numeric:tabular-nums"
          ><template #body="{ data }"><span class="invoice-date-time">{{
            dateTime(data.date)
          }}</span></template></Column
        ><Column
          field="dateSend"
          header="Enviado el"
          sortable
          style="width: 125px; min-width: 125px"
          ><template #body="{ data }"
            ><span
              v-if="data.dateSend"
              class="sent-date"
              :title="`Último envío por correo al cliente: ${dateTime(data.dateSend)}`"
              ><i class="pi pi-envelope" aria-hidden="true"></i
              ><span class="sent-date-text"
                ><span>{{ dateLabel(data.dateSend) }}</span
                ><small>{{
                  dateTime(data.dateSend).split(" ")[1] || "Hora no disponible"
                }}</small></span
              ></span
            ><span v-else>—</span></template
          ></Column
        ><Column
          field="customer"
          header="Cliente"
          sortable
          style="min-width: 180px"
        /><Column field="sourceCode" header="Documento rectificado" sortable />
        <Column field="state" header="Situación" sortable
          ><template #body="{ data }"
            ><Tag
              :value="stateLabel(data.state)"
              :severity="
                data.draft ? 'warn' : data.cancelled ? 'danger' : 'success'
              " /></template
        ></Column>
        <Column field="verifactuStatus" header="VeriFactu" sortable
          ><template #body="{ data }"
            ><Tag
              v-if="data.verifactuStatus"
              :value="fiscalLabel(data.verifactuStatus)"
              :severity="
                data.verifactuStatus === 'ACCEPTED' ? 'success' : 'warn'
              "
            /><span v-else>—</span></template
          ></Column
        >
        <Column field="paid" header="Pago" sortable style="width: 8rem"
          ><template #body="{ data }"
            ><Tag
              :value="
                data.draft || data.cancelled
                  ? 'No aplica'
                  : data.paid
                    ? 'Pagada'
                    : 'Pendiente'
              "
              :severity="
                data.paid && !data.draft && !data.cancelled
                  ? 'success'
                  : data.draft || data.cancelled
                    ? 'secondary'
                    : 'warn'
              "
              rounded /></template
        ></Column>
        <Column
          field="total"
          header="Total"
          sortable
          style="width: 10%; text-align: right"
          bodyStyle="text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums"
          ><template #body="{ data }">{{
            rectMoney(data.total, data.currency)
          }}</template></Column
        >
        <Column header="" style="width: 4rem"
          ><template #body="{ data }"
            ><Button
              icon="pi pi-ellipsis-v"
              text
              rounded
              aria-label="Acciones de la rectificativa"
              :disabled="busy"
              @click="openMenu($event, data)" /></template
        ></Column>
      </GenericDataTable>
      <Menu ref="rowMenu" :model="rowItems" popup />
    </section>
    <section class="stats">
      <header>
        <div>
          <b><i class="pi pi-chart-line" /> Resumen de rectificativas</b
          ><small>Emisión, pagos y abonos del año seleccionado</small>
        </div>
        <div>
          <Select v-model="year" :options="years" /><Button
            :icon="statsExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            text
            rounded
            @click="statsExpanded = !statsExpanded"
          />
        </div>
      </header>
      <div v-if="statsExpanded" class="stats-body">
        <div v-if="loadingStats" class="loading">
          <i class="pi pi-spin pi-spinner" /> Cargando indicadores...
        </div>
        <template v-else
          ><div class="kpis">
            <article v-for="k in kpis" :key="k.label">
              <span :class="['kpi-icon', k.kind]"><i :class="k.icon" /></span>
              <div>
                <small>{{ k.label }}</small
                ><strong>{{ k.value }}</strong
                ><em>{{ k.detail }}</em>
              </div>
            </article>
          </div>
          <div class="analytics">
            <div class="chart">
              <h3>Abonos emitidos por mes</h3>
              <Chart type="bar" :data="chartData" :options="chartOptions" />
            </div>
            <div class="ranking">
              <h3><i class="pi pi-trophy" /> Top 5 clientes con abonos</h3>
              <p v-if="!recStats.topCustomers.length">
                No hay rectificativas emitidas.
              </p>
              <div v-for="(c, i) in recStats.topCustomers" :key="c.name">
                <span>{{ Number(i) + 1 }}</span>
                <section>
                  <b>{{ c.name }}</b
                  ><small
                    >{{ c.count }} rectificativa{{
                      c.count === 1 ? "" : "s"
                    }}</small
                  >
                </section>
                <strong>{{ money(c.amount, "EUR") }}</strong>
              </div>
            </div>
          </div></template
        >
      </div>
    </section>

      <Dialog
        v-model:visible="pickerVisible"
        modal
        class="kiwik-dialog invoice-picker-dialog"
        :style="{ width: '65rem', height: '70vh' }"
        :breakpoints="{ '900px': '96vw' }"
        :pt="{
          root: { class: 'kiwik-dialog' },
          header: { class: 'kiwik-dialog-header' },
          content: { class: 'kiwik-dialog-content' },
          footer: { class: 'kiwik-dialog-footer' },
        }"
      >
      <template #header>
        <b><i class="pi pi-file-edit"></i> Nueva rectificativa · Documento de origen</b>
      </template>
      <Message v-if="dialogError" severity="error" :closable="false">{{
        dialogError
      }}</Message>
      <form class="filters" @submit.prevent="findInvoices">
        <InputText
          v-model="invoiceQuery"
          placeholder="Código o cliente de la factura o rectificativa"
          aria-label="Buscar documento de origen"
        /><Button
          label="Buscar"
          icon="pi pi-search"
          type="submit"
          :loading="busy"
        />
      </form>
      
      <DataTable
        :value="invoiceOptions"
        :loading="busy"
        dataKey="selectionKey"
        scrollable
        scrollHeight="flex"
        ><template #empty>Busca una factura o rectificativa aceptada.</template
        ><Column field="code" header="Documento" /><Column
          field="sourceType"
          header="Tipo" /><Column field="customer" header="Cliente" /><Column
          header="Acciones"
          ><template #body="{ data }"
            ><Button
              label="Seleccionar"
              :disabled="busy"
              @click="
                prepare(data.pkid, data.sourceRecInvoiceId)
              " /></template></Column
      ></DataTable>
      <p>
        Se muestran hasta 50 resultados. Acota la búsqueda si no aparece la
        factura.
      </p>
      <template #footer
        ><div class="footer">
          <div class="kiwik-separator" />
          <div class="actions">
            <Button
              label="Cancelar"
              severity="secondary"
              text
              @click="pickerVisible = false"
            />
          </div></div
      ></template>
    </Dialog>

    <Dialog
      v-model:visible="detailVisible"
      modal
      class="kiwik-dialog"
      :style="{ width: '86rem' }"
      :breakpoints="{ '1350px': '96vw' }"
      :closable="!busy"
      :closeOnEscape="!busy"
      :pt="{
        root: { class: 'kiwik-dialog' },
        header: { class: 'kiwik-dialog-header' },
        content: { class: 'kiwik-dialog-content' },
        footer: { class: 'kiwik-dialog-footer' },
      }"
    >
      <template #header>
        <b><i class="pi pi-file-edit"></i> {{ form.pkid ? `Rectificativa ${form.code}` : 'Nueva rectificativa' }}</b>
      </template>
      <Message v-if="dialogError" severity="error" :closable="false">{{
        dialogError
      }}</Message>
      <div class="origin">
        <div v-if="form.sourceRecInvoiceId">
          <small>Rectificativa rectificada</small><b>{{ form.sourceCode }}</b>
        </div>
        <div>
          <small>Factura original</small
          ><Button
            :label="form.invoiceCode"
            link
            @click="
              router.push({
                name: 'Facturas',
                query: { invoiceId: form.invoiceId },
              })
            "
          />
        </div>
        <div>
          <small>Cliente</small><b>{{ form.customer }}</b>
        </div>
        <Tag
          :value="form.pkid ? stateLabel(form.state) : 'Nuevo borrador'"
          :severity="form.cancelled ? 'danger' : undefined"
        />
      </div>
      <Message
        v-if="editable && form.mode === 'QUANTITY'"
        severity="info"
        :closable="false"
        >{{
          form.sourceRecInvoiceId
            ? "Se revierte la parte seleccionada de la rectificativa de origen."
            : "Abono por cantidades: precio, descuento, incremento e impuesto se conservan de la factura original."
        }}</Message
      >
      <Message
        v-if="editable && form.mode === 'ECONOMIC'"
        severity="warn"
        :closable="false"
        >Rectificación económica: indica el nuevo precio, descuento, incremento
        o impuesto. El PDF mostrará la diferencia frente a la factura
        original.</Message
      >
      <div class="form-grid">
        <label class="mode-field"
          >Modalidad<Select
            v-model="form.mode"
            :options="modes"
            optionLabel="label"
            optionValue="value"
            :disabled="!!form.pkid || busy"
        /></label>
        <label
          >Fecha<DatePicker
            v-model="form.dateValue"
            dateFormat="dd/mm/yy"
            showIcon
            :disabled="!editable || busy"
            :maxDate="new Date()"
        /></label>
        <label
          >Referencia<InputText
            v-model="form.reference"
            :disabled="!editable || busy"
            maxlength="145"
        /></label>
        <label class="wide"
          >Motivo de rectificación *<InputText
            v-model="form.reason"
            :disabled="!editable || busy"
            maxlength="250"
        /></label>
      </div>
      <DataTable
        :value="form.lines"
        dataKey="sourceLineId"
        scrollable
        scrollHeight="460px"
        class="lines-table"
      >
        <Column
          field="description"
          header="Descripción"
          style="min-width: 14rem"
        />
        <Column v-if="editable" field="available" header="Disponible" />
        <Column header="Cantidad"
          ><template #body="{ data }"
            ><InputNumber
              v-if="editable"
              v-model="data.quantity"
              :disabled="busy"
              :min="0"
              :max="data.available"
              :maxFractionDigits="3"
              locale="de-DE"
              :useGrouping="true"
              class="quantity"
              aria-label="Cantidad a rectificar"
            /><span v-else>{{ numeric(data.quantity) }}</span></template
          ></Column
        >
        <Column header="Precio"
          ><template #body="{ data }"
            ><InputNumber
              v-if="editable && form.mode === 'ECONOMIC'"
              v-model="data.priceUnit"
              :min="0"
              :maxFractionDigits="4"
              locale="de-DE"
              :useGrouping="true"
              class="quantity"
            /><span v-else>{{ money(data.priceUnit, form.currency) }}</span
            ><small v-if="editable && form.mode === 'ECONOMIC'"
              >Original:
              {{ money(data.originalPriceUnit, form.currency) }}</small
            ></template
          ></Column
        ><Column header="Dto."
          ><template #body="{ data }"
            ><InputNumber
              v-if="editable && form.mode === 'ECONOMIC'"
              v-model="data.discount"
              :min="0"
              :max="100"
              :maxFractionDigits="2"
              locale="de-DE"
              suffix=" %"
              class="quantity"
            /><span v-else>{{ numeric(data.discount) }} %</span></template
          ></Column
        ><Column header="Incremento"
          ><template #body="{ data }"
            ><InputNumber
              v-if="editable && form.mode === 'ECONOMIC'"
              v-model="data.increment"
              :min="0"
              :max="100"
              :maxFractionDigits="2"
              locale="de-DE"
              suffix=" %"
              class="quantity"
            /><span v-else>{{ numeric(data.increment) }} %</span></template
          ></Column
        ><Column header="IVA"
          ><template #body="{ data }"
            ><InputNumber
              v-if="editable && form.mode === 'ECONOMIC'"
              v-model="data.tax"
              :min="0"
              :max="100"
              :maxFractionDigits="2"
              locale="de-DE"
              suffix=" %"
              class="quantity"
            /><span v-else>{{ numeric(data.tax) }} %</span></template
          ></Column
        ><Column header="Total"
          ><template #body="{ data }">{{
            money(editable ? lineTotal(data) : data.total, form.currency)
          }}</template></Column
        >
      </DataTable>
      <p class="total">
        {{
          editable
            ? "Total estimado de la rectificación"
            : "Total de la rectificación"
        }}:
        <strong>{{
          rectMoney(editable ? estimated : form.total, form.currency)
        }}</strong>
      </p>
      <div class="form-grid">
        <label class="wide"
          >Condiciones<Textarea
            v-model="form.terms"
            rows="6"
            maxlength="1000"
            :disabled="!editable || busy" /></label>
      </div>
      <section v-if="form.verifactuStatus" class="fiscal">
        <h3>Seguimiento VeriFactu</h3>
        <p>
          {{ fiscalLabel(form.verifactuStatus) }} ·
          {{ form.attempts || 0 }} intentos
        </p>
        <p v-if="form.nextAttemptAt">
          Próximo intento: {{ form.nextAttemptAt }}
        </p>
        <Message v-if="form.fiscalError" severity="warn" :closable="false">{{
          form.fiscalError
        }}</Message>
      </section>
      <template #footer
        ><div class="footer">
          <div class="kiwik-separator" />
          <div class="actions">
            <Button
              v-if="form.pkid"
              label="Ver / Imprimir factura"
              icon="pi pi-file-pdf"
              outlined
              :disabled="busy"
              @click="downloadPdf"
            /><Button
              v-if="form.pkid"
              label="Documentos"
              icon="pi pi-paperclip"
              outlined
              :disabled="busy"
              @click="openAttachments(form)"
            /><Button
              v-if="form.pkid && !editable"
              label="Actualizar estado"
              icon="pi pi-refresh"
              text
              :disabled="busy"
              @click="openDetail(form.pkid)"
            /><Button
              v-if="form.pkid && !form.draft && !form.cancelled"
              :label="form.paid ? 'Desmarcar pagada' : 'Marcar como pagada'"
              icon="pi pi-wallet"
              outlined
              :disabled="busy"
              @click="askMarkPaid(form, !form.paid)"
            /><Button
              v-if="form.pkid && editable"
              label="Cancelar borrador"
              severity="danger"
              text
              :disabled="busy"
              @click="cancelVisible = true"
            /><Button
              v-if="editable"
              label="Guardar borrador"
              :disabled="!hasSelectedLines"
              icon="pi pi-save"
              class="corporate"
              :loading="busy"
              @click="save"
            /><Button
              v-if="form.pkid && editable"
              label="Guardar y emitir"
              icon="pi pi-check"
              :disabled="busy || !hasSelectedLines"
              @click="issueVisible = true"
            /><Button
              v-if="form.verifactuStatus === 'REJECTED'"
              label="Reintentar VeriFactu"
              :disabled="busy"
              @click="issueVisible = true"
            /><Button
              label="Cerrar"
              text
              severity="secondary"
              :disabled="busy"
              @click="detailVisible = false"
            />
          </div></div
      ></template>
    </Dialog>

    <Dialog
      v-model:visible="issueVisible"
      modal
      :closable="!busy"
      :closeOnEscape="!busy"
      :style="{ width: 'min(520px,94vw)' }"
      class="kiwik-dialog issue-invoice-dialog"
      @show="validateIssueTarget"
      :pt="{
        root: { class: 'kiwik-dialog' },
        header: { class: 'kiwik-dialog-header' },
        content: { class: 'kiwik-dialog-content' },
        footer: { class: 'kiwik-dialog-footer' },
      }"
      @hide="password = ''"
    >
      <template #header>
        <div class="issue-dialog-header">
          <span><i class="pi pi-file-check"></i></span>
          <div>
            <b>{{
              editable
                ? "Emitir rectificativa definitiva"
                : "Reintentar envío VeriFactu"
            }}</b>
            <small>Facturación · VeriFactu</small>
          </div>
        </div>
      </template>
      <Message severity="warn" :closable="false">
        {{
          editable
            ? "Se asignará el número fiscal y se bloqueará la edición. El envío a VeriFactu se procesará según los Ajustes de Ventas."
            : "Se reintentará el envío de la rectificativa, conservando su número."
        }}
      </Message>
      <Message v-if="dialogError" severity="error" :closable="false">{{
        dialogError
      }}</Message>
      <Message v-if="validatingIssue" severity="info" :closable="false"
        >Comprobando datos fiscales y económicos…</Message
      >
      <Message
        v-else-if="issueValidationErrors.length"
        severity="error"
        :closable="false"
      >
        <b>No se puede emitir. Corrige estos datos:</b>
        <ul>
          <li v-for="item in issueValidationErrors" :key="item">{{ item }}</li>
        </ul>
        <Button
          label="Volver a comprobar"
          icon="pi pi-refresh"
          text
          @click="validateIssueTarget"
        />
      </Message>
      <Message
        v-else-if="issueValidated && editable"
        severity="success"
        :closable="false"
        >Datos comprobados. Al emitir se validarán de nuevo antes de asignar
        número. Esta comprobación no acredita el alta censal ni VIES.</Message
      >
      <label
        v-if="!validatingIssue && !issueValidationErrors.length"
        class="verifactu-password"
      >
        <span>Contraseña del certificado VeriFactu</span>
        <Password
          v-model="password"
          :disabled="busy"
          toggleMask
          :feedback="false"
          fluid
          autofocus
        />
      </label>
      <template #footer>
        <div class="issue-dialog-footer">
          <div class="issue-dialog-separator"></div>
          <div class="issue-dialog-actions">
            <Button
              label="Volver"
              text
              severity="secondary"
              :disabled="busy"
              @click="issueVisible = false"
            />
            <Button
              :label="editable ? 'Emitir y enviar' : 'Reintentar envío'"
              icon="pi pi-send"
              severity="success"
              :loading="busy"
              :disabled="
                !password ||
                busy ||
                validatingIssue ||
                !issueValidated ||
                issueValidationErrors.length > 0
              "
              @click="issue"
            />
          </div>
        </div>
      </template>
    </Dialog>
    <Dialog
      v-model:visible="cancelVisible"
      modal
      class="kiwik-dialog"
      :style="{ width: 'min(520px,94vw)' }"
      :closable="!busy"
      :pt="{
        root: { class: 'kiwik-dialog' },
        header: { class: 'kiwik-dialog-header' },
        content: { class: 'kiwik-dialog-content' },
        footer: { class: 'kiwik-dialog-footer' },
      }"
      ><template #header
        ><b><i class="pi pi-ban"></i> Cancelar borrador</b></template
      ><p>
        Se conservará el documento cancelado y se liberarán sus cantidades para
        otra rectificativa.
      </p>
      <template #footer
        ><div class="footer">
          <div class="kiwik-separator" />
          <Button
            label="Volver"
            text
            :disabled="busy"
            @click="cancelVisible = false"
          /><Button
            label="Cancelar borrador"
            severity="danger"
            :loading="busy"
            @click="cancelDraft"
          /></div></template
    ></Dialog>
    <Dialog
      v-model:visible="paidVisible"
      modal
      class="kiwik-dialog"
      :style="{ width: 'min(520px,94vw)' }"
      :closable="!busy"
      :pt="{
        root: { class: 'kiwik-dialog' },
        header: { class: 'kiwik-dialog-header' },
        content: { class: 'kiwik-dialog-content' },
        footer: { class: 'kiwik-dialog-footer' },
      }"
      ><template #header
        ><b
          ><i class="pi pi-wallet"></i>
          {{
            paidValue ? "Marcar como pagada" : "Desmarcar como pagada"
          }}</b
        ></template
      ><Message v-if="dialogError" severity="error" :closable="false">{{
        dialogError
      }}</Message
      ><p>
        {{
          paidValue
            ? `Se marcará como pagada la rectificativa ${paidTarget?.code || ""}. El abono quedará liquidado sin alterar líneas, PDF ni estado VeriFactu.`
            : `La rectificativa ${paidTarget?.code || ""} volverá a constar como pendiente de pago.`
        }}
      </p>
      <template #footer
        ><div class="footer">
          <div class="kiwik-separator" />
          <Button
            label="Volver"
            text
            :disabled="busy"
            @click="paidVisible = false"
          /><Button
            :label="paidValue ? 'Marcar como pagada' : 'Desmarcar pagada'"
            icon="pi pi-check"
            :loading="busy"
            @click="togglePaid"
          /></div></template
    ></Dialog>
    <Dialog
      v-model:visible="sendPendingVisible"
      modal
      class="kiwik-dialog"
      header="Enviar pendientes por correo"
      :closable="!sendingPending"
      :closeOnEscape="!sendingPending"
      :style="{ width: 'min(860px,95vw)' }"
      :contentStyle="{ maxHeight: '62vh', overflowY: 'auto', padding: '1.25rem 1.5rem' }"
      :pt="{
        root: { class: 'kiwik-dialog' },
        header: { class: 'kiwik-dialog-header' },
        content: { class: 'kiwik-dialog-content' },
        footer: { class: 'kiwik-dialog-footer' },
      }"
    >
      <template v-if="!pendingResult">
        <p>
          Se enviarán las rectificativas emitidas, aceptadas por VeriFactu y
          nunca enviadas que tengan contacto principal con correo válido
          (máximo 50 por tanda).
        </p>
        <p>
          El envío se procesa en segundo plano y cada correo queda registrado
          en el historial de su rectificativa. Esta ventana se cerrará al
          lanzar el envío y te avisaremos con el resultado.
        </p>
        <div v-if="pendingPreviewLoading" class="flex justify-content-center py-3">
          <i class="pi pi-spin pi-spinner" />&nbsp;Cargando pendientes…
        </div>
        <Message v-else-if="pendingPreviewError" severity="error" :closable="false">{{
          pendingPreviewError
        }}</Message>
        <template v-else-if="pendingPreview">
          <p>
            <b>{{ pendingPreview.count }} rectificativas</b> en
            <b>{{ pendingPreview.groups?.length ?? 0 }} clientes</b
            >{{ pendingPreview.truncated ? " (máximo 50, se continúa después)" : "" }}:
          </p>
          <Message
            v-if="!pendingPreview.groups?.length"
            severity="info"
            :closable="false"
            >No hay pendientes que cumplan los criterios.</Message
          >
          <details v-for="group in pendingPreview.groups" :key="group.client" class="pending-group">
            <summary>
              <span class="pending-client"
                ><b>{{ group.client || "Sin cliente" }}</b
                ><small>{{ group.contactName || "sin contacto" }} · {{ group.email || "sin correo" }}</small></span
              ><span class="pending-totals"
                >{{ group.invoices?.length ?? 0 }} rectificativas · {{ money(group.total, "€") }}</span
              >
            </summary>
            <Message v-if="group.warning" severity="warn" :closable="false">{{
              group.warning
            }}</Message>
            <ul>
              <li v-for="item in group.invoices" :key="item.code">
                {{ item.code }} · {{ money(item.total, "€") }}
              </li>
            </ul>
          </details>
        </template>
      </template>
      <template v-else>
        <Message severity="info" :closable="false"
          >Enviadas: {{ pendingResult.sentCount }} · Omitidas:
          {{ pendingResult.skippedCount }} · Fallidas:
          {{ pendingResult.failedCount }}</Message
        >
        <p v-if="pendingResult.truncated">
          Se alcanzó el máximo de 50: repite la operación para continuar con
          el resto.
        </p>
        <details v-if="pendingResult.failed?.length">
          <summary>Fallidas ({{ pendingResult.failed.length }})</summary>
          <ul>
            <li v-for="item in pendingResult.failed" :key="item.pkid">
              {{ item.code }} · {{ item.reason }}
            </li>
          </ul>
        </details>
        <details v-if="pendingResult.skipped?.length">
          <summary>Omitidas ({{ pendingResult.skipped.length }})</summary>
          <ul>
            <li v-for="item in pendingResult.skipped" :key="item.pkid">
              {{ item.code }} · {{ item.reason }}
            </li>
          </ul>
        </details>
      </template>
      <template #footer
        ><div class="footer" style="width: 100%">
          <div class="kiwik-separator" style="margin-bottom: 1rem" />
          <div class="actions" style="align-items: center">
            <Button
              label="Cerrar"
              text
              severity="secondary"
              :disabled="sendingPending"
              @click="sendPendingVisible = false"
            /><Button
              v-if="!pendingResult"
              label="Enviar pendientes"
              icon="pi pi-send"
              style="white-space: nowrap; min-width: 190px"
              v-tooltip.bottom="'Confirma el envío en segundo plano a los contactos principales de los clientes.'"
              :loading="sendingPending"
              @click="sendPending"
            />
          </div></div
      ></template>
    </Dialog>
    <VeriFactuQueuePanel @open-invoice="openDetail" @processed="onQueueProcessed" />
    <VeriFactuChainPanel ref="chainPanel" />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Button from "primevue/button";
import Chart from "primevue/chart";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import GenericDataTable from "@/components/shared/GenericDataTable.vue";
import DatePicker from "primevue/datepicker";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Menu from "primevue/menu";
import Password from "primevue/password";
import Select from "primevue/select";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import { useAuthStore } from "@/stores/authStore";
import { useSecurityStore } from "@/stores/securityStore";
import { PERM } from "@/services/Frm_Main/permissions";
import { useToast } from "primevue/usetoast";
import RecInvoiceEmailDialog from "./RecInvoiceEmailDialog.vue";
import RecInvoiceAuditDialog from "./RecInvoiceAuditDialog.vue";
import SalesTraceabilityDialog from "../SalesTraceabilityDialog.vue";
import InvoiceAssistantDialog from "../Frm_Facturas/InvoiceAssistantDialog.vue";
import DialogNotes from "@/components/dialogs/DialogNotes.vue";
import AttachmentsDialog from "@/components/attachments/AttachmentsDialog.vue";
import VeriFactuQueuePanel from "./VeriFactuQueuePanel.vue";
import VeriFactuChainPanel from "./VeriFactuChainPanel.vue";
import { backendUrl } from "@/services/backendUrl";

const router = useRouter();
const route = useRoute();
const toast = useToast();
const traceabilityRef = ref<any>();
const invoiceAssistant = ref<any>();
// El acceso al asistente solo se muestra si la IA está activada y configurada.
const aiAssistantAvailable = ref(false);
async function checkAiStatus() {
  try {
    const { data } = await axios.get(
      backendUrl(`/WebInvoiceAssistant/status`),
      auth.portalRequestConfig(),
    );
    aiAssistantAvailable.value = data?.aiAvailable === true;
  } catch {
    aiAssistantAvailable.value = false;
  }
}
const emailDialog = ref<InstanceType<typeof RecInvoiceEmailDialog> | null>(
  null,
);
const recInvoiceAuditDialog = ref<
  InstanceType<typeof RecInvoiceAuditDialog> | null
>(null);
const auth = useAuthStore();
const securityStore = useSecurityStore();
const api = axios.create();
api.interceptors.request.use((config) => {
  Object.assign(config.headers, auth.portalRequestConfig().headers);
  return config;
});
const tableRef = ref<InstanceType<typeof GenericDataTable> | null>(null);
const chainPanel = ref<any>(null);
const rows = ref<any[]>([]),
  invoiceOptions = ref<any[]>([]);
const query = ref(""),
  status = ref<string | null>(null),
  verifactuStatus = ref<string | null>(null),
  emailStatus = ref<string | null>(null),
  invoiceQuery = ref("");
const page = ref(0),
  total = ref(0),
  loading = ref(false),
  busy = ref(false);
const error = ref(""),
  dialogError = ref(""),
  password = ref("");
const pickerVisible = ref(false),
  detailVisible = ref(false),
  issueVisible = ref(false),
  cancelVisible = ref(false);
const form = ref<any>({ lines: [] });
const hasSelectedLines = computed(() =>
  form.value.lines.some(
    (line: any) => Number.isFinite(line.quantity) && line.quantity > 0,
  ),
);
const selected = ref<any>(null),
  rowMenu = ref<any>(null);
const notesVisible = ref(false),
  attachmentsVisible = ref(false);
const attachment = ref<any>(null);
const openMenu = (event: Event, item: any) => {
  selected.value = item;
  rowMenu.value?.toggle(event);
};
const noteRequest = {
  table: "sales_recinvoices",
  pkField: "SALES_RECINVOICES_PK_ID",
  field: "SALES_RECINVOICES_DS_MEMO",
  id: -1,
};
function openAttachments(item: any) {
  if (!item?.pkid) return;
  attachment.value = item;
  attachmentsVisible.value = true;
}
function attachmentsChanged(value: boolean) {
  attachmentsVisible.value = value;
  if (!value) refreshTable();
}
async function onNotesSaved() {
  await refresh();
  if (detailVisible.value && form.value.pkid) {
    try {
      const { data } = await api.get(
        backendUrl(`/WebGetSalesRecInvoice/${form.value.pkid}`),
      );
      form.value.notes = data.notes;
    } catch (e) {
      error.value = message(e);
    }
  }
}
const rowItems = computed(() => [
  {
    label: "Abrir rectificativa",
    icon: "pi pi-eye",
    command: () => openDetail(selected.value?.pkid),
  },
  {
    label: "Trazabilidad comercial",
    icon: "pi pi-sitemap",
    command: () =>
      traceabilityRef.value?.open("RECTIFICATION", selected.value?.pkid),
  },
  {
    label: "Auditoría de emisión",
    icon: "pi pi-history",
    visible: securityStore.hasPermission(PERM.CREDIT_ISSUE),
    command: () => recInvoiceAuditDialog.value?.open(selected.value),
  },
  ...(canMarkPaid(selected.value) && securityStore.hasPermission(PERM.CREDIT_MARK_PAID)
    ? [
        {
          label: selected.value?.paid
            ? "Desmarcar como pagada"
            : "Marcar como pagada",
          icon: "pi pi-wallet",
          command: () => askMarkPaid(selected.value, !selected.value?.paid),
        },
      ]
    : []),
  { separator: true },
  {
    label: selected.value?.dateSend
      ? "Reenviar por correo"
      : "Enviar por correo",
    visible: securityStore.hasPermission(PERM.CREDIT_EMAIL),
    icon: "pi pi-envelope",
    command: () => emailDialog.value?.open(selected.value),
  },
  {
    label: "Historial de correo",
    visible: securityStore.hasPermission(PERM.CREDIT_EMAIL),
    icon: "pi pi-history",
    command: () => emailDialog.value?.open(selected.value, "history"),
  },
  { separator: true },
  {
    label: "Ver / Imprimir rectificativa",
    visible: securityStore.hasPermission(PERM.CREDIT_PRINT),
    icon: "pi pi-print",
    disabled: selected.value?.verifactuStatus !== "ACCEPTED" || busy.value,
    command: () => openRecInvoicePdf(selected.value),
  },
  { separator: true },
  {
    label: "Notas",
    visible: securityStore.hasPermission(PERM.CREDIT_NOTES),
    icon: "pi pi-comments",
    command: () => {
      noteRequest.id = selected.value?.pkid ?? -1;
      notesVisible.value = true;
    },
  },
  {
    label: `Documentos${selected.value?.attachmentCount ? ` (${selected.value.attachmentCount})` : ""}`,
    visible: securityStore.hasPermission(PERM.CREDIT_DOCS),
    icon: "pi pi-paperclip",
    command: () => openAttachments(selected.value),
  },
]);
const validatingIssue = ref(false);
const issueValidated = ref(false);
const issueValidationErrors = ref<string[]>([]);
async function validateIssueTarget() {
  if (busy.value || validatingIssue.value) return;
  issueValidated.value = false;
  issueValidationErrors.value = [];
  validatingIssue.value = true;
  busy.value = true;
  try {
    if (editable.value) {
      // Validar los valores editados, no una versión anterior del borrador.
      await persist();
      const { data } = await api.get(
        backendUrl("/WebValidateSalesRecInvoice/" + form.value.pkid),
      );
      issueValidationErrors.value = data.errors || [];
      issueValidated.value = data.valid === true;
      if (!issueValidated.value && !issueValidationErrors.value.length)
        issueValidationErrors.value = ["No se pudo confirmar la validación."];
    } else {
      issueValidated.value = true;
    }
  } catch (e) {
    issueValidationErrors.value = [message(e)];
  } finally {
    busy.value = false;
    validatingIssue.value = false;
  }
}
let listVersion = 0;
const statuses = [
  { label: "Borradores", value: "DRAFT" },
  { label: "Emitidas", value: "ISSUED" },
  { label: "Pendientes de pago", value: "PENDING_PAYMENT" },
  { label: "Pagadas", value: "PAID" },
  { label: "Canceladas", value: "CANCELLED" },
].sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }));
const verifactuStatuses = [
  { label: "Pendiente de envío", value: "PENDING" },
  { label: "Aceptada", value: "ACCEPTED" },
  { label: "Aceptada con errores", value: "ACCEPTED_WITH_ERRORS" },
  { label: "Requiere corrección", value: "NEEDS_CORRECTION" },
  { label: "Error técnico", value: "REJECTED" },
  { label: "No enviada", value: "NONE" },
].sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }));
const emailStatuses = [
  { label: "Todas", value: null },
  { label: "Enviadas", value: "SENT" },
  { label: "No enviadas", value: "NOT_SENT" },
];
const situationFilterSeverity = (value: string) =>
  value === "PAID"
    ? "success"
    : value === "ISSUED"
      ? "info"
      : value === "CANCELLED"
        ? "danger"
        : value === "DRAFT" || value === "PENDING_PAYMENT"
          ? "warn"
          : "secondary";
const verifactuFilterSeverity = (value: string) =>
  value === "ACCEPTED"
    ? "success"
    : value === "ACCEPTED_WITH_ERRORS"
      ? "warn"
      : value === "NEEDS_CORRECTION" || value === "REJECTED"
        ? "danger"
        : value === "PENDING"
          ? "info"
          : "secondary";
const emailFilterSeverity = (value: string | null | undefined) =>
  value === "SENT" ? "success" : value === "NOT_SENT" ? "warn" : "secondary";
const modes = [
  { label: "Abono por cantidades", value: "QUANTITY" },
  { label: "Rectificación económica", value: "ECONOMIC" },
];
const editable = computed(
  () => !form.value.pkid || (form.value.draft && !form.value.verifactuStatus),
);
const estimated = computed(() =>
  form.value.lines.reduce((sum: number, line: any) => sum + lineTotal(line), 0),
);
function numeric(n: number) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 3 }).format(
    n || 0,
  );
}
function money(n: number, currency: string) {
  return `${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)} ${currency || ""}`;
}
function rectMoney(n: number, currency: string) {
  const value = Number(n || 0);
  return money(value > 0 ? -value : value, currency);
}
function rectificationTooltip(item: any) {
  const rows = item?.rectifications ?? [];
  return rows.length ? `Rectificaciones asociadas (${rows.length})\n${rows.map((row: any) => `${row.code}: ${rectMoney(row.total, item.currency)}`).join("\n")}\nTotal: ${rectMoney(item.rectificationTotal, item.currency)}` : "Sin rectificaciones asociadas";
}
function dateLabel(date: string) {
  return date ? new Date(date).toLocaleDateString("es-ES") : "—";
}
function dateTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function stateLabel(state: string) {
  return state?.split(" / ")[0] || "Borrador";
}
function fiscalLabel(state: string) {
  return (
    (
      {
        PENDING: "Pendiente",
        PROCESSING: "En proceso",
        ACCEPTED: "Aceptada",
        ACCEPTED_WITH_ERRORS: "Aceptada con errores",
        REJECTED: "Error técnico",
        NEEDS_CORRECTION: "Requiere revisión fiscal",
      } as Record<string, string>
    )[state] || state
  );
}
function lineTotal(l: any) {
  if (form.value.sourceRecInvoiceId) {
    const round = (value: number) =>
      (Math.sign(value) * Math.round(Math.abs(value) * 100)) / 100;
    const oldNet = round((l.quantity || 0) * l.sourceNetUnit);
    const oldTax = round((l.quantity || 0) * l.sourceTaxUnit);
    const target =
      form.value.mode === "ECONOMIC"
        ? round(
            Math.sign(l.sourceNetUnit) *
              (l.quantity || 0) *
              l.priceUnit *
              (1 - (l.discount || 0) / 100) *
              (1 + (l.increment || 0) / 100),
          )
        : 0;
    return round(target - oldNet + round((target * l.tax) / 100) - oldTax);
  }
  const net =
    Math.round(
      (l.quantity || 0) *
        l.priceUnit *
        (1 - (l.discount || 0) / 100) *
        (1 + (l.increment || 0) / 100) *
        100,
    ) / 100;
  return -(net + Math.round(net * l.tax) / 100);
}
function message(e: any) {
  const d = e.response?.data;
  return typeof d === "string"
    ? d
    : d?.message ||
        d?.detail ||
        e.message ||
        "No se pudo completar la operación.";
}
async function load(index = 0) {
  const version = ++listVersion;
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get(backendUrl("/WebGetSalesRecInvoices"), {
      params: {
        page: index,
        size: 20,
        query: query.value,
        status: status.value,
      },
      timeout: 20000,
    });
    if (version !== listVersion) return;
    rows.value = data.content;
    total.value = data.totalElements;
    page.value = index;
  } catch (e) {
    if (version === listVersion) error.value = message(e);
  } finally {
    if (version === listVersion) loading.value = false;
  }
}
async function refresh() {
  await load(page.value);
  await tableRef.value?.refresh();
  await loadStats();
}
async function refreshTable() {
  await tableRef.value?.refresh(false);
  await loadStats();
}
async function onQueueProcessed() {
  await refreshTable();
  chainPanel.value?.refresh();
}
const sendPendingVisible = ref(false),
  sendingPending = ref(false),
  pendingResult = ref<any>(null),
  pendingPreview = ref<any>(null),
  pendingPreviewLoading = ref(false),
  pendingPreviewError = ref("");
function openSendPending() {
  pendingResult.value = null;
  pendingPreview.value = null;
  pendingPreviewError.value = "";
  sendPendingVisible.value = true;
  void loadPendingPreview();
}
async function loadPendingPreview() {
  pendingPreviewLoading.value = true;
  pendingPreviewError.value = "";
  try {
    const { data } = await api.get(
      backendUrl("/WebPreviewPendingSalesRecInvoiceEmails"),
    );
    pendingPreview.value = data;
  } catch (e: any) {
    pendingPreviewError.value =
      typeof e?.response?.data === "string"
        ? e.response.data
        : "No se pudo cargar lo pendiente de envío.";
  } finally {
    pendingPreviewLoading.value = false;
  }
}
const sendPendingJobId = ref<string | null>(null);
async function sendPending() {
  if (sendingPending.value) return;
  sendingPending.value = true;
  pendingResult.value = null;
  try {
    const { data } = await api.post(
      backendUrl("/WebSendPendingSalesRecInvoiceEmails"),
      {},
    );
    sendPendingJobId.value = data.jobId;
    sendPendingVisible.value = false;
    pendingTimer = window.setInterval(pollSendPending, 3000);
  } catch (e: any) {
    sendingPending.value = false;
    toast.add({
      severity: "error",
      summary: "No se pudo iniciar el envío",
      detail:
        typeof e.response?.data === "string"
          ? e.response.data
          : e.message || "Revisa la conexión con el servidor.",
      life: 6000,
    });
  }
}
async function pollSendPending() {
  if (!sendPendingJobId.value) return;
  try {
    const { data } = await api.get(
      backendUrl(`/WebSendPendingSalesRecInvoiceEmails/${sendPendingJobId.value}`),
    );
    if (data.status === "RUNNING") return;
    if (pendingTimer) window.clearInterval(pendingTimer);
    sendingPending.value = false;
    if (data.status === "FINISHED" && data.result) {
      const result = data.result;
      pendingResult.value = result;
      sendPendingVisible.value = true;
      toast.add({
        severity: result.failedCount ? "warn" : "success",
        summary: "Envío de pendientes",
        detail: `Enviadas: ${result.sentCount} · Omitidas: ${result.skippedCount} · Fallidas: ${result.failedCount}`,
        life: 6000,
      });
      await refreshTable();
    } else {
      toast.add({
        severity: "error",
        summary: "Falló el envío en segundo plano",
        detail: data.error || "Consulta el historial de las rectificativas.",
        life: 6000,
      });
    }
  } catch (e: any) {
    if (pendingTimer) window.clearInterval(pendingTimer);
    sendingPending.value = false;
    toast.add({
      severity: "error",
      summary: "Se perdió el seguimiento del envío",
      detail:
        e.message ||
        "Es posible que continúe en el servidor; revisa el historial.",
      life: 6000,
    });
  }
}
const year = ref(new Date().getFullYear());
const years = Array.from(
  { length: 5 },
  (_, i) => new Date().getFullYear() - i,
);
const statsExpanded = ref(true);
const loadingStats = ref(false);
const recStats = ref<any>({
  draftCount: 0,
  draftAmount: 0,
  issuedCount: 0,
  issuedAmount: 0,
  paidCount: 0,
  paidAmount: 0,
  pendingCount: 0,
  pendingAmount: 0,
  cancelledCount: 0,
  monthly: Array(12).fill(0),
  topCustomers: [],
});
const kpis = computed(() => [
  {
    label: "Borradores",
    value: recStats.value.draftCount,
    detail: money(recStats.value.draftAmount, "EUR"),
    icon: "pi pi-file-edit",
    kind: "draft",
  },
  {
    label: "Rectificativas emitidas",
    value: recStats.value.issuedCount,
    detail: money(recStats.value.issuedAmount, "EUR"),
    icon: "pi pi-check-circle",
    kind: "issued",
  },
  {
    label: "Importe pagado",
    value: money(recStats.value.paidAmount, "EUR"),
    detail: `${recStats.value.paidCount} rectificativas saldadas`,
    icon: "pi pi-wallet",
    kind: "paid",
  },
  {
    label: "Pendientes de pago",
    value: recStats.value.pendingCount,
    detail: money(recStats.value.pendingAmount, "EUR"),
    icon: "pi pi-clock",
    kind: "pending",
  },
  {
    label: "Anuladas",
    value: recStats.value.cancelledCount,
    detail: `Año ${year.value}`,
    icon: "pi pi-ban",
    kind: "cancelled",
  },
]);
const chartData = computed(() => ({
  labels: [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ],
  datasets: [
    {
      data: recStats.value.monthly,
      label: "Abonos emitidos",
      backgroundColor: "#cfe08a",
      borderColor: "#648506",
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
}));
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
};
async function loadStats() {
  loadingStats.value = true;
  try {
    const { data } = await api.get(backendUrl("/WebGetSalesRecInvoiceSummary"), {
      params: { year: year.value },
    });
    recStats.value = { ...recStats.value, ...data };
  } catch (e) {
    error.value = message(e);
  } finally {
    loadingStats.value = false;
  }
}
watch(year, loadStats);
const tableMenu = ref<any>(null);
const tableItems = computed(() => {
  const t: any[] = [{ label: "Refrescar", icon: "pi pi-refresh", command: () => refreshTable() }];
  if (securityStore.hasPermission(PERM.RPT_EXPORT)) {
    t.push({ separator: true });
    t.push({ label: "Exportar Excel", icon: "pi pi-file-excel", command: () => tableRef.value?.exportToExcel() });
  }
  return t;
});
// Los valores de los selects se pasan explícitos (no vía :params), porque el
// @change se dispara antes del re-render y refresh() leería los filtros viejos.
const filter = () => {
  selected.value = null;
  tableRef.value?.refreshWithQuery(
    encodeURIComponent(tableRef.value?.searchQuery || ""),
    {
      status: status.value || undefined,
      verifactuStatus: verifactuStatus.value || undefined,
      emailStatus: emailStatus.value || undefined,
    },
    true,
  );
};
function openNew() {
  dialogError.value = "";
  invoiceOptions.value = [];
  invoiceQuery.value = "";
  pickerVisible.value = true;
}
async function findInvoices() {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    const invoicesFound = (
      await api.get(backendUrl("/WebGetSalesInvoices"), {
        params: { status: "ISSUED", query: invoiceQuery.value, size: 50 },
      })
    ).data.content.map((i: any) => ({ ...i, customer: i.entityName }));
    const rectifications = (
      await api.get(backendUrl("/WebGetSalesRecInvoices"), {
        params: {
          page: 0,
          size: 50,
          query: invoiceQuery.value,
          status: "ISSUED",
        },
      })
    ).data.content
      .filter((i: any) =>
        ["ACCEPTED", "ACCEPTED_WITH_ERRORS"].includes(i.verifactuStatus),
      )
      .map((i: any) => ({ ...i, sourceRecInvoiceId: i.pkid }));
    // Consultar disponibilidad antes de ofrecer el documento; al seleccionarlo
    // se vuelve a comprobar por si otro usuario ha reservado sus cantidades.
    const candidates = [...invoicesFound, ...rectifications];
    const available = [];
    for (const item of candidates) {
      const path = item.sourceRecInvoiceId
        ? `/WebPrepareSalesRecInvoiceFromRectification/${item.sourceRecInvoiceId}`
        : `/WebPrepareSalesRecInvoice/${item.pkid}`;
      try {
        const { data } = await api.get(backendUrl(path));
        if (data.lines?.some((line: any) => line.quantity > 0))
          available.push(item);
      } catch (e: any) {
        if (e.response?.status !== 400) throw e;
      }
    }
    invoiceOptions.value = available.map((item: any) => ({
      ...item,
      selectionKey: `${item.sourceRecInvoiceId ? "REC" : "INV"}-${item.pkid}`,
      sourceType: item.sourceRecInvoiceId ? "Rectificativa" : "Factura",
    }));
  } catch (e) {
    dialogError.value = message(e);
  } finally {
    busy.value = false;
  }
}
async function prepare(id: number, sourceRecInvoiceId?: number) {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    const { data } = await api.get(
      backendUrl(
        sourceRecInvoiceId
          ? `/WebPrepareSalesRecInvoiceFromRectification/${sourceRecInvoiceId}`
          : `/WebPrepareSalesRecInvoice/${id}`,
      ),
    );
    if (!data.lines?.some((line: any) => line.quantity > 0)) {
      invoiceOptions.value = invoiceOptions.value.filter(
        (item: any) =>
          !(item.pkid === id && item.sourceRecInvoiceId === sourceRecInvoiceId),
      );
      throw new Error(
        "Este documento ya no tiene cantidades disponibles para rectificar.",
      );
    }
    form.value = {
      ...data,
      mode: "QUANTITY",
      operationKey: crypto.randomUUID(),
      dateValue: new Date(),
      reason: "",
      reference: "",
      notes: "",
      lines: data.lines
        .filter((l: any) => l.quantity > 0)
        .map((l: any) => ({ ...l, available: l.quantity })),
    };
    pickerVisible.value = false;
    detailVisible.value = true;
  } catch (e) {
    dialogError.value = message(e);
  } finally {
    busy.value = false;
  }
}
function setDetail(data: any) {
  const savedLines = new Map<number, any>(
    data.lines.map((l: any) => [l.sourceLineId, l]),
  );
  form.value = {
    ...data,
    mode: data.mode || "QUANTITY",
    dateValue: new Date(data.date),
    lines:
      data.draft && data.availableLines
        ? data.availableLines.map((l: any) => ({
            ...l,
            // La disponibilidad procede del origen; los valores económicos,
            // del borrador guardado, para no sobrescribirlos al emitir.
            ...savedLines.get(l.sourceLineId),
            available: l.quantity,
            quantity: savedLines.get(l.sourceLineId)?.quantity ?? 0,
          }))
        : data.lines,
  };
}
async function openDetail(id: number) {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    setDetail((await api.get(backendUrl(`/WebGetSalesRecInvoice/${id}`))).data);
    detailVisible.value = true;
  } catch (e) {
    error.value = message(e);
  } finally {
    busy.value = false;
  }
}
function request() {
  const d = form.value.dateValue;
  if (!(d instanceof Date) || Number.isNaN(d.getTime()))
    throw new Error("Seleccione una fecha válida.");
  if (!form.value.reason?.trim())
    throw new Error("Indique el motivo de rectificación.");
  const lines = form.value.lines
    .filter((l: any) => (l.quantity || 0) > 0)
    .map((l: any) => ({
      sourceLineId: l.sourceLineId,
      quantity: l.quantity,
      priceUnit: form.value.mode === "ECONOMIC" ? l.priceUnit : undefined,
      discount: form.value.mode === "ECONOMIC" ? l.discount : undefined,
      increment: form.value.mode === "ECONOMIC" ? l.increment : undefined,
      tax: form.value.mode === "ECONOMIC" ? l.tax : undefined,
    }));
  if (!lines.length) throw new Error("Indique alguna cantidad a abonar.");
  return {
    version: form.value.version,
    mode: form.value.mode || "QUANTITY",
    operationKey: form.value.operationKey,
    invoiceId: form.value.invoiceId,
    sourceRecInvoiceId: form.value.sourceRecInvoiceId,
    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    reference: form.value.reference,
    reason: form.value.reason,
    terms: form.value.terms,
    notes: form.value.notes,
    lines,
  };
}
async function persist() {
  const body = request();
  const response = form.value.pkid
    ? await api.put(
        backendUrl(`/WebSaveSalesRecInvoice/${form.value.pkid}`),
        body,
      )
    : await api.post(backendUrl("/WebCreateSalesRecInvoice"), body);
  setDetail(response.data);
}
async function save() {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    await persist();
    await refresh();
  } catch (e) {
    dialogError.value = message(e);
  } finally {
    busy.value = false;
  }
}
async function issue() {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    const retry = form.value.verifactuStatus === "REJECTED";
    if (!retry) await persist();
    const endpoint = retry
      ? "WebRetrySalesRecInvoiceVeriFactu"
      : "WebIssueSalesRecInvoice";
    setDetail(
      (
        await api.post(backendUrl(`/${endpoint}/${form.value.pkid}`), {
          certificatePassword: password.value,
        })
      ).data,
    );
    issueVisible.value = false;
    password.value = "";
    await refresh();
  } catch (e) {
    dialogError.value = message(e);
  } finally {
    busy.value = false;
  }
}
async function cancelDraft() {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    setDetail(
      (
        await api.post(
          backendUrl(`/WebCancelSalesRecInvoice/${form.value.pkid}`),
        )
      ).data,
    );
    cancelVisible.value = false;
    await refresh();
  } catch (e) {
    dialogError.value = message(e);
    cancelVisible.value = false;
  } finally {
    busy.value = false;
  }
}
const paidVisible = ref(false),
  paidTarget = ref<any>(null),
  paidValue = ref(true);
// Solo las rectificativas emitidas (ni borrador ni cancelada) admiten
// el marcado manual de pago, como el botón "Marcar a Pagada" del cliente
// clásico. No se replica el diálogo de cobros de Facturas porque un abono
// no tiene vencimientos ni cobros parciales: basta el booleano con auditoría.
const canMarkPaid = (item: any) =>
  !!item?.pkid && !item.draft && !item.cancelled;
function askMarkPaid(item: any, paid: boolean) {
  if (!canMarkPaid(item) || busy.value) return;
  paidTarget.value = item;
  paidValue.value = paid;
  dialogError.value = "";
  paidVisible.value = true;
}
async function togglePaid() {
  if (busy.value || !paidTarget.value?.pkid) return;
  busy.value = true;
  dialogError.value = "";
  try {
    const { data } = await api.post(
      backendUrl(`/WebMarkSalesRecInvoicePaid/${paidTarget.value.pkid}`),
      { paid: paidValue.value },
    );
    paidVisible.value = false;
    if (detailVisible.value && form.value.pkid === paidTarget.value.pkid)
      setDetail(data);
    if (selected.value?.pkid === paidTarget.value.pkid)
      selected.value = { ...selected.value, paid: data.paid };
    await refresh();
  } catch (e) {
    dialogError.value = message(e);
  } finally {
    busy.value = false;
  }
}
async function downloadPdf() {
  await openRecInvoicePdf(form.value);
}
async function openRecInvoicePdf(item: any) {
  if (!item?.pkid || busy.value) return;
  // Abrir durante el clic para que el navegador no bloquee la vista PDF;
  // la descarga autenticada conserva las cabeceras de la sesión del portal.
  const preview = window.open("", "_blank");
  if (!preview) {
    error.value = "Permite las ventanas emergentes para ver e imprimir el PDF.";
    return;
  }
  preview.opener = null;
  preview.document.title = "Cargando rectificativa…";
  busy.value = true;
  try {
    const { data } = await api.get(
      backendUrl(`/WebGetSalesRecInvoicePdf/${item.pkid}`),
      { responseType: "blob" },
    );
    const url = URL.createObjectURL(data);
    preview.location.replace(url);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) {
    preview.close();
    error.value = message(e);
    dialogError.value = message(e);
  } finally {
    busy.value = false;
  }
}
let statusTimer: number | undefined;
let pendingTimer: number | undefined;
onMounted(() => {
  if (route.query.rectificationId)
    openDetail(Number(route.query.rectificationId));
  refresh();
  checkAiStatus();
  statusTimer = window.setInterval(() => tableRef.value?.refresh(), 10000);
});
onUnmounted(() => {
  if (statusTimer) window.clearInterval(statusTimer);
  if (pendingTimer) window.clearInterval(pendingTimer);
});
</script>

<style scoped>
.pending-group summary {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  cursor: pointer;
  padding: 0.35rem 0;
  list-style: none;
}
.pending-group summary::-webkit-details-marker {
  display: none;
}
.pending-group summary::before {
  content: "▸";
  flex: 0 0 auto;
  color: #648506;
  font-size: 0.85rem;
  transition: transform 0.15s ease;
}
.pending-group[open] > summary::before {
  transform: rotate(90deg);
}
.pending-client {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.pending-client small {
  color: #7d8797;
  font-size: 0.78rem;
}
.pending-totals {
  white-space: nowrap;
  color: #648506;
  font-weight: 700;
  font-size: 0.85rem;
}
.rec-page {
  padding: 18px 18px 90px;
  color: #243044;
  display: grid;
  gap: 18px;
}
.hero,
.list-card {
  background: white;
  border: 1px solid #e3e8d2;
  border-radius: 15px;
  padding: 20px;
  min-width: 0;
}
.list-card {
  height: clamp(500px, calc(100dvh - 330px), 700px);
  min-height: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  border-color: #dfe4ea;
  border-radius: 14px;
}
.list-card > .table { flex: 1 1 auto; min-height: 0; }
.list-card .toolbar {
  flex: 0 0 auto;
  min-height: 62px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8ecf0;
}
.list-card .toolbar h2 { margin: 0 0 3px; font-size: 1rem; }
.list-card .toolbar small { font-size: .75rem; }
.list-card .toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.list-card .filters {
  flex: 0 0 auto;
  margin: 0;
  padding: 12px 16px;
  border-bottom: 1px solid #e8ecf0;
  background: #fff;
}
.rec-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}
.rec-filters .filter {
  width: 240px;
  max-width: 100%;
}
.rec-filters .verifactu-filter {
  width: 260px;
}
.stats {
  display: block;
  overflow: hidden;
  border: 1px solid #dfe4ea;
  border-radius: 14px;
  background: #fff;
}
.stats > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid #e8ecf0;
}
.stats > header > div {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.stats > header > div:first-child {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
}
.stats > header .p-select {
  width: 105px;
}
.stats > header b i {
  color: #648506;
}
.stats > header small {
  color: #667085;
}
.stats-body {
  padding: 14px 16px 18px;
}
.stats-body .loading {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.7rem;
}
.kpis article {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  padding: 0.8rem;
  border: 1px solid #e5ecd0;
  border-radius: 9px;
  background: #fafcf5;
}
.kpi-icon {
  display: grid;
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  place-items: center;
  border-radius: 9px;
}
.kpi-icon.draft {
  background: #f5ebfb;
  color: #9253b5;
}
.kpi-icon.issued {
  background: #e8f3ff;
  color: #2875b6;
}
.kpi-icon.paid {
  background: #e7f5f1;
  color: #16846e;
}
.kpi-icon.pending {
  background: #fff3d6;
  color: #a66c00;
}
.kpi-icon.cancelled {
  background: #fdeaea;
  color: #c33f3f;
}
.kpis small,
.kpis strong,
.kpis em {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kpis strong {
  margin: 0.12rem 0;
  font-size: 1.1rem;
}
.kpis em {
  color: #899184;
  font-size: 0.68rem;
  font-style: normal;
}
.analytics {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 0.8rem;
  margin-top: 0.8rem;
}
.chart,
.ranking {
  height: 285px;
  padding: 0.9rem;
  border: 1px solid #e5ecd0;
  border-radius: 9px;
  overflow: auto;
}
.chart h3,
.ranking h3 {
  margin: 0 0 0.6rem;
  font-size: 0.88rem;
}
.chart > .p-chart {
  height: 240px;
}
.ranking > div {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid #edf2df;
}
.ranking > div > span {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  place-items: center;
  border-radius: 50%;
  background: #eaf2d2;
  color: #648506;
}
.ranking section {
  min-width: 0;
  flex: 1;
}
.ranking section b,
.ranking section small {
  display: block;
}
.ranking section small,
.ranking > p {
  color: #7d8797;
  font-size: 0.73rem;
}
@media (max-width: 1200px) {
  .kpis {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 800px) {
  .analytics {
    grid-template-columns: 1fr;
  }
  .kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}
.invoice-date-time {
  font-size: 0.78rem;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.sent-date {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  color: #526044;
}
.sent-date > i {
  flex: 0 0 auto;
  color: #5e8d10;
  font-size: 0.82rem;
}
.sent-date-text {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 0.15rem;
  line-height: 1.25;
}
.sent-date-text > span {
  display: block;
  color: #526044;
  font-size: 0.8rem;
}
.sent-date-text > small {
  display: block;
  color: #657084;
  font-size: 0.73rem;
}
.list-card :deep(.table-container) { width: 100%; }
.list-card :deep(.table-container),
.list-card :deep(.datatable-wrapper),
.list-card :deep(.p-datatable-wrapper) { max-width: 100%; min-width: 0; }
.list-card :deep(.p-datatable-table) { min-width: 0; }
.hero,
.heading,
.toolbar,
.filters,
.actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.hero,
.toolbar {
  justify-content: space-between;
}
.hero h1 {
  margin: 5px 0;
  font-size: 1.55rem;
}
.hero p,
small {
  color: #667085;
}
.hero p {
  margin: 0;
}
.hero-icon {
  background: #9cc10a;
  color: #253000;
  padding: 16px;
  border-radius: 12px;
}
.hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hero :deep(.assistant-access) {
  border: 1px solid #c4b5fd;
  background: #ede9fe;
  color: #513c8c;
  font-weight: 700;
  box-shadow: none;
}
.hero :deep(.assistant-access:hover) {
  border-color: #a78bfa;
  background: #ddd6fe;
  color: #432d7a;
}
.toolbar h2 {
  margin: 0 0 5px;
  font-size: 1.15rem;
}
.filters {
  margin: 18px 0;
}
.filters > input {
  flex: 1;
  min-width: 200px;
}
.origin {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px;
  background: #f4f7ea;
  border-radius: 10px;
  margin-bottom: 16px;
}
.origin > div {
  display: grid;
  gap: 4px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 18px 0;
}
.form-grid label,
.password {
  display: grid;
  gap: 6px;
  font-weight: 600;
}
.mode-field :deep(.p-select) {
  background: #9cc10a;
  border-color: #9cc10a;
  color: #253000;
  font-weight: 700;
}
.mode-field :deep(.p-select-label),
.mode-field :deep(.p-select-dropdown) {
  color: #253000;
}
.mode-field :deep(.p-select.p-focus) {
  box-shadow: 0 0 0 2px rgba(156, 193, 10, .35);
}
.mode-field :deep(.p-select.p-disabled) {
  opacity: .75;
}
.wide {
  grid-column: 1 / -1;
}
.quantity {
  width: 110px;
}
.quantity :deep(input) {
  width: 100%;
}
.total {
  text-align: right;
  font-size: 1.1rem;
}
.footer {
  width: 100%;
}
.kiwik-separator {
  height: 2px;
  background: linear-gradient(90deg, #9cc10a, #edf3d3);
  margin: 0 0 14px;
  width: 100%;
}
.actions {
  justify-content: flex-end;
}
.corporate {
  background: #9cc10a;
  border-color: #9cc10a;
  color: #253000;
}
.corporate:hover {
  background: #8bad09 !important;
  border-color: #8bad09 !important;
  color: #253000 !important;
}

:global(.rec-dialog .p-dialog-header) {
  background: #f1f6df;
  border-bottom: 2px solid #9cc10a;

  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}


:global(.rec-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 700px) {
  .rec-page {
    padding: 12px 8px 90px;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .origin {
    align-items: flex-start;
    flex-direction: column;
  }
}
.issue-dialog-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.issue-dialog-header > span {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 9px;
  background: #eaf2d2;
  color: #648506;
}
.issue-dialog-header b,
.issue-dialog-header small {
  display: block;
}
.issue-dialog-header b {
  color: #344054;
  font-size: 1rem;
}
.issue-dialog-header small {
  margin-top: 0.15rem;
  color: #7d8797;
  font-size: 0.72rem;
}
.issue-dialog-footer {
  width: 100%;
}
.issue-dialog-separator {
  width: 100%;
  min-height: 1px;
  margin: 0 0 0.75rem;
  border-top: 1px solid #9cc10a;
}
.issue-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.verifactu-password {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}
.draft-code {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  background: #fff3cd;
  color: #8a5a00;
  font-weight: 700;
  border: 1px solid #ffe08a;
}
.code-with-indicators,
.rectification-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.notes {
  color: #7b8f22;
}



  :global(.invoice-picker-dialog .p-dialog-content) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .invoice-picker-dialog .filters {
    flex: 0 0 auto;
  }

  .invoice-picker-dialog .p-datatable {
    flex: 1 1 auto;
    min-height: 0;
  }
</style>
