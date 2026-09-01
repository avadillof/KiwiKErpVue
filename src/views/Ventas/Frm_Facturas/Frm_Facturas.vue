<template>
  <InvoiceAssistantDialog ref="invoiceAssistant" @open-invoice="openDetail" />
  <main class="page">
    <header class="hero">
      <div class="heading">
        <span class="icon"><i class="pi pi-receipt" /></span>
        <div>
          <small>Ventas / Operaciones</small>
          <h1>Facturas de venta</h1>
          <p>
            Revisión, cobro y trazabilidad de las facturas generadas desde
            pedidos, albaranes o de forma manual.
          </p>
        </div>
      </div>
      <nav>
        <Button
          class="assistant-access"
          label="Asistente de Facturas"
          icon="pi pi-sparkles"
          @click="invoiceAssistant?.open(selected)"
        /><Button
          label="Ventas"
          icon="pi pi-arrow-left"
          text
          severity="secondary"
          @click="router.push({ name: 'Ventas' })"
        /><Button
          label="Inicio"
          icon="pi pi-home"
          text
          severity="secondary"
          @click="router.push({ name: 'Dashboard' })"
        />
      </nav>
    </header>
    <section class="list-card">
      <Toolbar
        ><template #start
          ><div>
            <b>Listado de facturas</b
            ><small
              >Los borradores permanecen separados de las facturas
              emitidas.</small
            >
          </div></template
        ><template #end
          ><SalesAutomationActions module="invoices" /><Button
            label="Nueva factura manual"
            icon="pi pi-plus"
            @click="manualInvoiceDialog?.open()" /></template></Toolbar
      ><Message v-if="loadError" severity="error" :closable="false"
        >No se pudo cargar el listado. Reinicia el backend.</Message
      ><GenericDataTable
        ref="tableRef"
        class="table"
        dataKey="pkid"
        selectionMode="single"
        v-model:selection="selected"
        endpoint="WebGetSalesInvoices"
        :params="{
          status: selectedStatus || undefined,
          verifactuStatus: selectedVerifactuStatus || undefined,
          emailStatus: selectedEmailStatus || undefined,
          dueStatus: selectedDueStatus || undefined,
        }"
        :showPaginator="true"
        :filterable="true"
        :showActions="true"
        @load-error="loadError = true"
        @data-loaded="loadError = false"
        ><template #panelOptions
          ><div class="invoice-filters">
            <Select
              v-model="selectedStatus"
              :options="statuses"
              optionLabel="label"
              optionValue="value"
              showClear
              placeholder="Situación: Todas"
              aria-label="Situación de la factura"
              class="filter"
              ><template #value="{ value, placeholder }"
                ><Tag
                  v-if="value"
                  :value="
                    statuses.find((item) => item.value === value)?.label ||
                    value
                  "
                  :severity="situationFilterSeverity(value)"
                  rounded
                /><span v-else>{{ placeholder }}</span></template
              ><template #option="{ option }"
                ><Tag
                  :value="option.label"
                  :severity="situationFilterSeverity(option.value)"
                  rounded /></template
            ></Select>
            <Select
              v-model="selectedVerifactuStatus"
              :options="verifactuStatuses"
              optionLabel="label"
              optionValue="value"
              showClear
              placeholder="VeriFactu: Todas"
              aria-label="Situación de VeriFactu"
              class="filter verifactu-filter"
              ><template #value="{ value, placeholder }"
                ><Tag
                  v-if="value"
                  :value="
                    verifactuStatuses.find((item) => item.value === value)
                      ?.label || value
                  "
                  :severity="verifactuFilterSeverity(value)"
                  rounded
                /><span v-else>{{ placeholder }}</span></template
              ><template #option="{ option }"
                ><Tag
                  :value="option.label"
                  :severity="verifactuFilterSeverity(option.value)"
                  rounded /></template
            ></Select>
            <Select
              v-model="selectedEmailStatus"
              :options="emailStatuses"
              optionLabel="label"
              optionValue="value"
              showClear
              placeholder="Correo al cliente: Todas"
              aria-label="Envío de correo al cliente"
              class="filter email-filter"
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
            <Select
              v-model="selectedDueStatus"
              :options="dueStatuses"
              optionLabel="label"
              optionValue="value"
              showClear
              placeholder="Vencimientos: Todas"
              aria-label="Vencimientos pendientes"
              class="filter due-filter"
              title="Facturas con algún plazo pendiente en el intervalo; una factura puede aparecer en varios intervalos."
              ><template #value="{ value }"
                ><Tag
                  :value="
                    dueStatuses.find((item) => item.value === value)?.label ||
                    'Vencimientos: Todas'
                  "
                  :severity="dueFilterSeverity(value)"
                  icon="pi pi-calendar"
                  rounded /></template
              ><template #option="{ option }"
                ><Tag
                  :value="option.label"
                  :severity="dueFilterSeverity(option.value)"
                  icon="pi pi-calendar"
                  rounded /></template
            ></Select></div></template
        ><template #headerActions
          ><Button
            icon="pi pi-refresh"
            text
            rounded
            title="Refrescar"
            @click="refresh" /><Button
            icon="pi pi-ellipsis-v"
            text
            rounded
            @click="tableMenu?.toggle($event)" /><Menu
            ref="tableMenu"
            :model="tableItems"
            popup
        /></template>
        <Column
          field="code"
          sortField="code"
          header="Código"
          sortable
          headerClass="invoice-code-column"
          bodyClass="invoice-code-column"
          style="width: 155px"
          ><template #body="{ data }"
            ><span class="code"
              ><span
                class="invoice-code-value"
                :class="{ 'draft-code': isDraft(data.state) }"
                >{{ data.code }}</span
              ><span
                v-if="
                  isInvoiceIssuePending(data.pkid) ||
                  data.manualInvoice ||
                  data.attachmentCount ||
                  data.hasNotes
                "
                class="code-indicators"
                ><Tag
                  v-if="isInvoiceIssuePending(data.pkid)"
                  value="Comprobando emisión"
                  severity="info" /><Tag
                  v-if="data.manualInvoice"
                  value="Manual"
                  severity="secondary"
                  rounded /><Tag
                  v-if="data.attachmentCount"
                  :value="String(data.attachmentCount)"
                  icon="pi pi-paperclip"
                  severity="info"
                  rounded /><i
                  v-if="data.hasNotes"
                  class="pi pi-comment notes"
                  title="Tiene observaciones" /></span></span></template></Column
        ><Column
          field="createDate"
          sortField="createDate"
          header="Fecha"
          sortable
          headerClass="invoice-date-column"
          bodyClass="invoice-date-column"
          style="width: 12%"
          ><template #body="{ data }"
            ><span class="invoice-date-time">{{
              dateTime(data.createDate)
            }}</span></template
          ></Column
        ><Column
          field="dateSend"
          sortField="dateSend"
          header="Enviado el"
          sortable
          headerClass="invoice-sent-column"
          bodyClass="invoice-sent-column"
          style="width: 125px; min-width: 125px"
          ><template #body="{ data }"
            ><span
              v-if="data.dateSend"
              class="sent-date"
              :title="`Último envío por correo al cliente: ${dateTime(data.dateSend)}`"
              ><i class="pi pi-envelope" aria-hidden="true"></i
              ><span class="sent-date-text"
                ><span>{{ date(data.dateSend) }}</span
                ><small>{{
                  dateTime(data.dateSend).split(" ")[1] || "Hora no disponible"
                }}</small></span
              ></span
            ><span v-else>—</span></template
          ></Column
        ><Column
          field="entityName"
          sortField="entitie.entitieDsName"
          header="Cliente"
          sortable
          headerClass="invoice-customer-column"
          bodyClass="invoice-customer-column" /><Column
          field="orderCodes"
          header="Pedidos origen"
          headerClass="invoice-orders-column"
          bodyClass="invoice-orders-column"
          style="width: 210px; min-width: 210px"
          ><template #body="{ data }"
            ><span :title="(data.orderCodes || []).join(', ')">{{
              (data.orderCodes || []).join(", ") || "—"
            }}</span></template
          ></Column
        ><Column
          field="deliveryCodes"
          header="Albaranes origen"
          style="width: 14%"
          ><template #body="{ data }"
            ><span
              v-if="data.deliveryCodes?.length"
              class="origins-cell"
              :title="data.deliveryCodes.join(', ')"
              ><i class="pi pi-truck"></i
              ><span>{{ data.deliveryCodes[0] }}</span
              ><span
                v-if="data.deliveryCodes.length > 1"
                class="origins-more"
                role="button"
                :title="`Ver los ${data.deliveryCodes.length} albaranes origen`"
                @click.stop="openOriginDeliveries(data)"
                >{{ data.deliveryCodes.length }}</span
              ></span
            ><span v-else>—</span></template
          ></Column
        ><Column
          field="nextDueDate"
          header="Próx. vencimiento"
          headerClass="invoice-due-column"
          bodyClass="invoice-due-column"
          style="width: 115px; min-width: 115px"
          ><template #body="{ data }"
            ><Tag
              v-if="nextDueTiming(data)"
              :value="date(data.nextDueDate)"
              :severity="dueFilterSeverity(nextDueTiming(data))"
              :title="nextDueDescription(data)"
              rounded
            /><span v-else>{{
              date(isDraft(data.state) ? data.toPayDate : data.nextDueDate)
            }}</span
            ><span
              v-if="data.dueCount > 1"
              class="due-summary"
              :class="{
                'due-summary--clear': data.pendingDueCount === 0,
                'due-summary--neutral':
                  isDraft(data.state) ||
                  data.paymentStatus === 'NOT_APPLICABLE',
              }"
              :title="`${data.pendingDueCount} de ${data.dueCount} vencimientos pendientes`"
              ><span class="due-summary-count"
                ><i
                  :class="
                    data.pendingDueCount === 0
                      ? 'pi pi-check-circle'
                      : 'pi pi-calendar'
                  "
                  aria-hidden="true"
                /><strong>{{ data.pendingDueCount }}</strong
                ><span>de {{ data.dueCount }}</span></span
              ><span class="due-summary-label">{{
                data.pendingDueCount === 0
                  ? "Sin pendientes"
                  : data.pendingDueCount === 1
                    ? "Plazo pendiente"
                    : "Plazos pendientes"
              }}</span></span
            ></template
          ></Column
        ><Column
          field="state"
          sortField="state"
          header="Estado"
          sortable
          style="width: 11%"
          ><template #body="{ data }"
            ><Tag
              :value="stateLabel(data.state)"
              :severity="severity(data.state)"
              rounded /></template></Column
        ><Column
          field="verifactuStatus"
          header="VeriFactu"
          bodyClass="invoice-verifactu-cell"
          style="width: 12%"
          ><template #body="{ data }"
            ><Tag
              :value="data.verifactuStatusLabel || 'No enviada'"
              :severity="verifactuSeverity(data.verifactuStatus)"
              rounded /></template></Column
        ><Column
          field="paid"
          sortField="pay"
          header="Cobro"
          sortable
          style="width: 9%"
          ><template #body="{ data }"
            ><Tag
              :value="
                data.paymentStatus === 'NOT_APPLICABLE'
                  ? 'No aplica'
                  : data.paymentStatus === 'PARTIAL'
                    ? 'Parcialmente cobrada'
                    : data.paid
                      ? 'Cobrada'
                      : 'Pendiente'
              "
              :severity="
                data.paid
                  ? 'success'
                  : data.paymentStatus === 'NOT_APPLICABLE'
                    ? 'secondary'
                    : 'warn'
              "
              rounded /></template></Column
        ><Column
          field="collectedAmount"
          header="Cobrado"
          bodyStyle="text-align:right;white-space:nowrap"
          ><template #body="{ data }">{{
            money(data.collectedAmount, data.currencyCode)
          }}</template></Column
        ><Column
          field="pendingAmount"
          header="Pendiente"
          bodyStyle="text-align:right;white-space:nowrap"
          ><template #body="{ data }">{{
            money(data.pendingAmount, data.currencyCode)
          }}</template></Column
        ><Column
          field="totalTotal"
          sortField="totalTotal"
          header="Total"
          sortable
          style="width: 10%; text-align: right"
          bodyStyle="text-align:right"
          ><template #body="{ data }">{{
            money(data.totalTotal, data.currencyCode)
          }}</template></Column
        ><Column header="" style="width: 4rem"
          ><template #body="{ data }"
            ><Button
              icon="pi pi-ellipsis-v"
              text
              rounded
              @click="
                openMenu($event, data)
              " /></template></Column></GenericDataTable
      ><Menu ref="rowMenu" :model="rowItems" popup />
    </section>
    <section class="stats">
      <header>
        <div>
          <b><i class="pi pi-chart-line" /> Resumen de facturación</b
          ><small>Emisión, vencimientos y cobros del año seleccionado</small>
        </div>
        <div>
          <Select v-model="year" :options="years" /><Button
            :icon="expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            text
            rounded
            @click="expanded = !expanded"
          />
        </div>
      </header>
      <div v-if="expanded" class="stats-body">
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
              <h3>Evolución mensual emitida</h3>
              <Chart type="bar" :data="chartData" :options="chartOptions" />
            </div>
            <div class="ranking">
              <h3><i class="pi pi-trophy" /> Top 5 clientes facturados</h3>
              <p v-if="!stats.topCustomers.length">No hay facturas emitidas.</p>
              <div v-for="(c, i) in stats.topCustomers" :key="c.name">
                <span>{{ Number(i) + 1 }}</span>
                <section>
                  <b>{{ c.name }}</b
                  ><small
                    >{{ c.count }} factura{{ c.count === 1 ? "" : "s" }}</small
                  >
                </section>
                <strong>{{ money(c.amount) }}</strong>
              </div>
            </div>
          </div></template
        >
      </div>
    </section>
    <Dialog
      v-model:visible="originDeliveriesVisible"
      modal
      :header="`Albaranes origen · ${originInvoiceCode}`"
      :style="{ width: 'min(1100px,96vw)', height: '76vh' }"
      :contentStyle="{ height: 'calc(76vh - 130px)', overflow: 'auto' }"
      class="kiwik-dialog"
      ><div class="origin-customer">
        <i class="pi pi-user"></i>
        <div>
          <small>Cliente</small><strong>{{ originCustomerName || "-" }}</strong>
        </div>
      </div>
      <div v-if="originDeliveriesLoading" class="loading">
        <i class="pi pi-spin pi-spinner" /> Cargando albaranes...
      </div>
      <Message
        v-else-if="!originDeliveries.length"
        severity="info"
        :closable="false"
        >No se encontraron albaranes vinculados.</Message
      ><DataTable
        v-else
        :value="originDeliveries"
        size="small"
        stripedRows
        scrollable
        scrollHeight="flex"
        dataKey="pkid"
        ><Column field="code" header="Albarán" style="width: 18%" /><Column
          field="createDate"
          header="Fecha albarán"
          ><template #body="{ data }"
            ><span class="delivery-origin-date"
              ><i class="pi pi-calendar"></i
              >{{ deliveryOriginDate(data) }}</span
            ></template
          ></Column
        ><Column
          field="totalTotal"
          header="Total"
          style="width: 16%; text-align: right"
          bodyStyle="text-align:right"
          ><template #body="{ data }">{{
            money(data.totalTotal, data.currencyCode)
          }}</template></Column
        ></DataTable
      ><template #footer
        ><div class="footer">
          <div />
          <section>
            <Button
              label="Cerrar"
              severity="secondary"
              text
              @click="originDeliveriesVisible = false"
            />
          </section></div></template></Dialog
    ><Dialog
      v-model:visible="detailVisible"
      modal
      maximizable
      :header="detail.code ? `Factura ${detail.code}` : 'Factura'"
      :style="{ width: '99vw', maxWidth: '1800px', height: '94vh' }"
      :contentStyle="{ height: 'calc(94vh - 130px)', overflow: 'auto' }"
      ><div v-if="detailLoading" class="loading">
        <i class="pi pi-spin pi-spinner" /> Cargando factura...
      </div>
      <div v-else class="detail">
        <Message
          v-if="invoiceProtected(detail)"
          severity="info"
          :closable="false"
          >Esta factura está en emisión o pendiente de VeriFactu. Puedes cerrar
          esta ventana y continuar trabajando; no se permite modificarla ni
          volver a enviarla.<Button
            v-if="isInvoiceIssuePending(detail.pkid)"
            label="Comprobar estado"
            icon="pi pi-refresh"
            text
            @click="openDetail(detail)" /></Message
        ><Message v-if="canEditDetail" severity="warn" :closable="false"
          >Factura en borrador: puedes modificar sus datos económicos antes de
          emitirla.</Message
        ><Message v-if="detail.manualInvoice" severity="info" :closable="false"
          >Factura manual sin pedido ni albarán: no modifica cantidades del
          circuito de entrega.</Message
        >
        <div class="summary">
          <div>
            <small>Cliente</small><b>{{ detail.entityName || "-" }}</b>
          </div>
          <div>
            <small>Fecha</small
            ><DatePicker
              v-if="canEditDetail"
              v-model="detail.createDate"
              dateFormat="dd/mm/yy"
              showIcon
              showTime
              showSeconds
              hourFormat="24"
              fluid
              @update:modelValue="recalculateDueDate"
            /><b v-else>{{ dateTime(detail.createDate) }}</b>
          </div>
          <div class="due-field">
            <small>{{
              detail.dueDateOverride
                ? "Vencimiento único manual"
                : "Último vencimiento"
            }}</small>
            <div class="due-row">
              <DatePicker
                v-if="canEditDetail && detail.dueDateOverride"
                v-model="detail.toPayDate"
                dateFormat="dd/mm/yy"
                showIcon
              /><b v-else>{{ date(detail.toPayDate) }}</b
              ><Button
                v-if="canEditDetail"
                :icon="
                  detail.dueDateOverride ? 'pi pi-refresh' : 'pi pi-pencil'
                "
                size="small"
                text
                rounded
                :title="
                  detail.dueDateOverride
                    ? 'Usar vencimiento calculado'
                    : 'Modificar vencimiento'
                "
                @click="toggleDueDateOverride"
              />
            </div>
            <InputText
              v-if="canEditDetail && detail.dueDateOverride"
              v-model="detail.dueDateReason"
              placeholder="Motivo obligatorio"
              class="due-reason"
            /><small v-if="canEditDetail" class="payment-rule"
              >{{
                detail.paymentTermDescription ||
                `${detail.paymentTermDays || 0} días`
              }}<template v-if="detail.collectionDays?.length">
                · días {{ detail.collectionDays.join(" , ") }}</template
              ></small
            >
          </div>
          <div>
            <small>Estado</small
            ><Tag
              :value="stateLabel(detail.state)"
              :severity="severity(detail.state)"
              rounded
            /><small v-if="!canEditDetail">VeriFactu</small
            ><Tag
              v-if="!canEditDetail"
              :value="detail.verifactuStatusLabel || 'No enviada'"
              :severity="verifactuSeverity(detail.verifactuStatus)"
              rounded
            />
          </div>
        </div>
        <Message v-if="catalogError" severity="error" :closable="false"
          >{{ catalogError
          }}<Button label="Reintentar" text @click="loadInvoiceCatalog"
        /></Message>
        <div class="invoice-commercial">
          <label
            ><small>Tarifa ({{ detail.currencyCode || "EUR" }})</small
            ><Select
              aria-label="Tarifa"
              v-if="canEditDetail"
              :modelValue="detail.salesTarifaId"
              @update:modelValue="changeInvoiceRate"
              :options="availableInvoiceRates"
              optionLabel="description"
              optionValue="pkid"
              filter
              fluid
            /><b v-else>{{ detail.salesTarifaDescription || "—" }}</b></label
          ><label
            ><small>Forma de pago</small
            ><Select
              aria-label="Forma de pago"
              v-if="canEditDetail"
              :modelValue="detail.salesTermId"
              :options="invoicePaymentTerms"
              optionLabel="description"
              optionValue="pkid"
              filter
              fluid
              @update:modelValue="changeInvoicePaymentTerm"
            /><b v-else>{{ detail.paymentTermDescription || "—" }}</b></label
          >
        </div>
        <div class="origins" v-if="detail.orderCodes?.length">
          <b><i class="pi pi-shopping-cart" /> Pedidos origen</b
          ><Tag
            v-for="code in detail.orderCodes"
            :key="code"
            :value="code"
            severity="info"
          />
        </div>
        <div class="origins">
          <b><i class="pi pi-truck" /> Albaranes origen</b
          ><Button
            v-for="d in detail.deliveries || []"
            :key="d.pkid"
            :label="d.code"
            icon="pi pi-filter"
            size="small"
            :outlined="String(lineOriginFilter) !== String(d.pkid)"
            :severity="
              String(lineOriginFilter) === String(d.pkid) ? 'info' : 'secondary'
            "
            rounded
            @click="
              lineOriginFilter =
                String(lineOriginFilter) === String(d.pkid) ? null : d.pkid
            "
          /><Button
            v-if="(detail.lines || []).some((line: any) => line.manual)"
            label="Conceptos manuales"
            icon="pi pi-filter"
            size="small"
            :outlined="lineOriginFilter !== 'manual'"
            :severity="lineOriginFilter === 'manual' ? 'info' : 'secondary'"
            rounded
            @click="
              lineOriginFilter = lineOriginFilter === 'manual' ? null : 'manual'
            "
          /><Button
            v-if="lineOriginFilter != null"
            label="Mostrar todas"
            icon="pi pi-filter-slash"
            size="small"
            text
            @click="lineOriginFilter = null"
          /><span v-if="!detail.deliveries?.length"
            >Sin albaranes vinculados</span
          >
        </div>
        <div v-if="canEditDetail" class="invoice-lines-head">
          <b>Líneas de factura</b
          ><Button
            label="Añadir concepto"
            icon="pi pi-plus"
            size="small"
            outlined
            @click="addManualLine"
          />
        </div>
        <DataTable
          ref="invoiceLinesTable"
          :value="filteredDetailLines"
          size="small"
          stripedRows
          scrollable
          scrollHeight="flex"
          :tableStyle="{ minWidth: '1400px' }"
          class="lines"
          ><Column
            field="productCode"
            header="Producto"
            style="width: 180px; min-width: 180px"
            ><template #body="{ data }"
              ><ProductLookup
                v-if="canEditDetail && data.manual && !data.pkid"
                v-model="data.productId"
                :label="data.productCode"
                @selected="selectManualProduct(data, $event)" /><span v-else>{{
                data.productCode || "-"
              }}</span
              ><Tag
                v-if="data.manual"
                value="Concepto manual"
                severity="secondary"
                rounded /></template></Column
          ><Column
            field="description"
            header="Descripción"
            style="min-width: 360px"
            ><template #body="{ data }"
              ><InputText
                v-if="canEditDetail && data.manual"
                v-model="data.description"
                class="w-full"
              /><span v-else>{{ data.description }}</span></template
            ></Column
          ><Column header="Motivo" style="width: 180px; min-width: 180px"
            ><template #body="{ data }"
              ><InputText
                v-if="canEditDetail && data.manual"
                v-model="data.manualReason"
                placeholder="Motivo obligatorio"
                class="w-full"
              /><span v-else-if="data.manual">{{
                data.manualReason || "—"
              }}</span
              ><span v-else>—</span></template
            ></Column
          ><Column field="sourceOrderCode" header="Pedido origen" /><Column
            field="quantity"
            header="Cantidad"
            bodyStyle="text-align:right"
            ><template #body="{ data }"
              ><InputNumber
                :useGrouping="true"
                locale="es-ES"
                v-if="canEditDetail"
                v-model="data.quantity"
                :min="0.001"
                :max="data.maxQuantity"
                :maxFractionDigits="3"
                inputClass="invoice-number"
              /><span v-else>{{ number(data.quantity) }}</span></template
            ></Column
          ><Column
            field="priceUnit"
            header="Precio"
            bodyStyle="text-align:right"
            ><template #body="{ data }"
              ><InputNumber
                :useGrouping="true"
                locale="es-ES"
                v-if="canEditDetail"
                v-model="data.priceUnit"
                :min="0"
                :maxFractionDigits="4"
                mode="currency"
                :currency="detail.currencyCode || 'EUR'"
                inputClass="invoice-number"
              /><span v-else>{{ detailMoney(data.priceUnit) }}</span></template
            ></Column
          ><Column field="discount" header="Dto. %" bodyStyle="text-align:right"
            ><template #body="{ data }"
              ><InputNumber
                :useGrouping="true"
                locale="es-ES"
                v-if="canEditDetail"
                v-model="data.discount"
                :min="0"
                :max="100"
                :maxFractionDigits="2"
                suffix=" %"
                inputClass="invoice-number short"
              /><span v-else>{{ number(data.discount) }} %</span></template
            ></Column
          ><Column field="tax" header="IVA %" bodyStyle="text-align:right"
            ><template #body="{ data }"
              ><InputNumber
                :useGrouping="true"
                locale="es-ES"
                v-if="canEditDetail"
                v-model="data.tax"
                :disabled="detail.fixedTax != null"
                :min="0"
                :max="100"
                :maxFractionDigits="2"
                suffix=" %"
                inputClass="invoice-number short"
              /><span v-else>{{ number(data.tax) }} %</span></template
            ></Column
          ><Column field="total" header="Total" bodyStyle="text-align:right"
            ><template #body="{ data }"
              ><b>{{ detailMoney(lineTotal(data)) }}</b></template
            ></Column
          ><Column v-if="canEditDetail" header="" style="width: 3rem"
            ><template #body="{ data }"
              ><Button
                v-if="data.manual"
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                title="Eliminar concepto"
                @click="removeManualLine(data)" /></template></Column
        ></DataTable>
        <div class="bottom">
          <div class="conditions-divider"></div>
          <div class="totals">
            <span
              >Neto
              <b>{{
                detailMoney(canEditDetail ? draftTotals.net : detail.totalNeto)
              }}</b></span
            ><span
              >Impuestos
              <b>{{
                detailMoney(canEditDetail ? draftTotals.tax : detail.totalTax)
              }}</b></span
            ><span v-if="detail.retentionRate || detail.totalRetention"
              >Retención
              <b
                >−{{
                  detailMoney(
                    canEditDetail
                      ? draftTotals.retention
                      : detail.totalRetention,
                  )
                }}</b
              ></span
            ><span
              >Total
              <b>{{
                detailMoney(
                  canEditDetail ? draftTotals.total : detail.totalTotal,
                )
              }}</b></span
            >
          </div>
          <div class="conditions-divider"></div>
          <div class="invoice-texts">
            <label
              ><small>Condiciones generales</small
              ><Textarea v-if="canEditDetail" v-model="detail.terms" rows="5" />
              <p v-else>{{ detail.terms || "Sin condiciones" }}</p></label
            ><label
              ><small>Condiciones particulares del cliente</small
              ><Textarea
                v-if="canEditDetail"
                v-model="detail.customerTerms"
                rows="5"
              />
              <p v-else>{{ detail.customerTerms }}</p></label
            >
          </div>
        </div>
      </div>
      <template #footer
        ><div class="footer">
          <div />
          <section>
            <Button
              label="Cerrar"
              text
              severity="secondary"
              @click="detailVisible = false"
            /><Button
              label="Vencimientos"
              icon="pi pi-calendar"
              outlined
              @click="
                duesDialog?.open(
                  detail,
                  canEditDetail,
                  canEditDetail ? draftTotals.total : detail.totalTotal,
                )
              "
            /><Button
              label="Documentos"
              icon="pi pi-paperclip"
              :disabled="invoiceProtected(detail) || issuing"
              outlined
              @click="openAttachments(detail)"
            /><Button
              v-if="canEditDetail"
              label="Guardar borrador"
              icon="pi pi-save"
              :loading="detailSaving"
              :disabled="issuing"
              @click="saveDraftAndClose"
            /><Button
              v-if="canEditDetail"
              label="Emitir factura"
              icon="pi pi-check-circle"
              severity="success"
              :loading="issuing"
              :disabled="detailSaving"
              @click="issueInvoice(detail)"
            />
          </section></div></template
    ></Dialog>
    <Dialog
      v-model:visible="issueVisible"
      modal
      :closable="!issuing && !validatingIssue"
      :closeOnEscape="!issuing && !validatingIssue"
      :style="{ width: 'min(520px,94vw)' }"
      class="kiwik-dialog issue-invoice-dialog"
      :pt="{
        root: { class: 'kiwik-dialog' },
        header: { class: 'kiwik-dialog-header' },
        content: { class: 'kiwik-dialog-content' },
        footer: { class: 'kiwik-dialog-footer' },
      }"
      ><template #header
        ><div class="issue-dialog-header">
          <span><i class="pi pi-file-check"></i></span>
          <div>
            <b>{{
              issueRetry
                ? "Reintentar envío VeriFactu"
                : "Emitir factura definitiva"
            }}</b
            ><small>Facturación · VeriFactu</small>
          </div>
        </div></template
      ><Message severity="warn" :closable="false">{{
        issueRetry
          ? "Se reenviará el mismo registro, conservando el número y la factura."
          : "Se asignará el número fiscal, se archivará el PDF definitivo y se enviará automáticamente a VeriFactu."
      }}</Message
      ><Message v-if="validatingIssue" severity="info" :closable="false"
        >Comprobando datos fiscales y económicos…</Message
      ><Message
        v-else-if="issueValidationErrors.length"
        style="flex-shrink: 0"
        severity="error"
        :closable="false"
        ><div>
          <b>No se puede emitir. Corrige estos datos:</b>
          <ul class="fiscal-errors">
            <li v-for="error in issueValidationErrors" :key="error.field">
              <b>{{ error.message }}</b
              ><small>{{ error.location }}</small>
            </li>
          </ul>
          <Button
            label="Volver a comprobar"
            icon="pi pi-refresh"
            text
            @click="validateIssueTarget"
          /></div></Message
      ><Message v-else-if="!issueRetry" severity="success" :closable="false"
        >Datos comprobados. Al emitir se validarán de nuevo antes de asignar
        número. Esta comprobación no acredita el alta censal ni VIES.</Message
      ><label
        v-if="!validatingIssue && !issueValidationErrors.length"
        class="verifactu-password"
        ><span>Contraseña del certificado VeriFactu</span
        ><Password
          :disabled="issuing"
          v-model="issuePassword"
          toggleMask
          :feedback="false"
          fluid
          autofocus /></label
      ><template #footer
        ><div class="issue-dialog-footer">
          <div class="issue-dialog-separator"></div>
          <div class="issue-dialog-actions">
            <Button
              label="Volver"
              text
              severity="secondary"
              :disabled="issuing || validatingIssue"
              @click="issueVisible = false"
            /><Button
              :label="issueRetry ? 'Reintentar envío' : 'Emitir y enviar'"
              icon="pi pi-send"
              severity="success"
              :loading="issuing"
              :disabled="
                !issuePassword ||
                validatingIssue ||
                issueValidationErrors.length > 0
              "
              @click="confirmIssue"
            />
          </div></div></template></Dialog
    ><InvoiceEmailDialog
      ref="invoiceEmailDialog"
      @sent="refresh"
    /><InvoiceAuditDialog ref="invoiceAuditDialog" /><ManualInvoiceDialog
      ref="manualInvoiceDialog"
      @saved="onManualInvoiceCreated"
    /><InvoiceDuesDialog ref="duesDialog" /><InvoicePaymentsDialog
      ref="paymentsDialog"
      @saved="refresh"
    /><ConfirmDialog /><DialogNotes
      v-model:visible="notesVisible"
      :request="noteRequest"
      @saved="refresh"
    /><AttachmentsDialog
      v-model:visible="attachmentsVisible"
      moduleFolder="ATTACHEMENTS_SALESINVOICES_DOCUMENTS"
      :title="`Documentos de ${attachment?.code || 'factura'}`"
      :entityId="attachment?.pkid"
      @update:visible="attachmentsChanged"
    />
    <Message
      v-if="selected?.canCorrectVerifactu"
      severity="error"
      :closable="false"
      class="correction-banner"
      ><div class="correction-banner-content">
        <span
          ><b>{{ selected.verifactuStatusLabel }} · {{ selected.code }}</b
          ><small>{{
            selected.verifactuResponse ||
            "Corrige primero los datos maestros afectados y registra después la subsanación."
          }}</small></span
        ><Button
          label="Subsanar VeriFactu"
          icon="pi pi-wrench"
          severity="danger"
          @click="openCorrection(selected)"
        /></div
    ></Message>
    <Dialog
      v-model:visible="correctionVisible"
      modal
      header="Subsanar registro VeriFactu"
      :style="{ width: 'min(620px,95vw)' }"
      ><Message severity="warn" :closable="false"
        >La factura original seguirá bloqueada. Corrige antes los datos del
        cliente y utiliza esta acción para generar un nuevo registro de
        subsanación, conservando el original.</Message
      ><label class="correction-field"
        ><span>Motivo de la subsanación</span
        ><Textarea
          v-model="correctionReason"
          rows="4"
          maxlength="1000"
          fluid
          placeholder="Ej.: Se corrige el NIF del destinatario" /></label
      ><label class="correction-field"
        ><span>Contraseña del certificado VeriFactu</span
        ><Password
          v-model="correctionPassword"
          toggleMask
          :feedback="false"
          fluid /></label
      ><template #footer
        ><Button
          label="Volver"
          text
          severity="secondary"
          :disabled="correcting"
          @click="correctionVisible = false" /><Button
          label="Generar y enviar subsanación"
          icon="pi pi-send"
          severity="danger"
          :loading="correcting"
          :disabled="!correctionReason.trim() || !correctionPassword"
          @click="submitCorrection" /></template
    ></Dialog>
    <VeriFactuQueuePanel @open-invoice="openDetail" />
    <VeriFactuChainPanel />
    <AeatCasesDialog ref="aeatCasesRef" />
  </main>
</template>
<script setup lang="ts">
import InvoiceAssistantDialog from "./InvoiceAssistantDialog.vue";
const invoiceAssistant = ref<any>();
import SalesAutomationActions from "../SalesAutomationActions.vue";
import InvoiceDuesDialog from "./InvoiceDuesDialog.vue";
const duesDialog = ref<any>();
let duePreviewSequence = 0;
import { parseLocalizedServerDate } from "@/libs/HelperDates";
import AeatCasesDialog from "./AeatCasesDialog.vue";
const aeatCasesRef = ref<any>();
const selectedVerifactuStatus = ref<string | null>(null);
const selectedEmailStatus = ref<string | null>(null);
const selectedDueStatus = ref<string | null>(null);
const dueStatuses = [
  { label: "Vencimientos: Todas", value: null },
  { label: "Vencidas", value: "OVERDUE" },
  { label: "Vencen hoy", value: "TODAY" },
  { label: "Próximas 7 días", value: "UPCOMING" },
  { label: "Posteriores a 7 días", value: "LATER" },
  { label: "Sin fecha de vencimiento", value: "UNKNOWN" },
];
const dueFilterSeverity = (value: string | null | undefined) =>
  value === "OVERDUE"
    ? "danger"
    : value === "TODAY" || value === "UPCOMING"
      ? "warn"
      : value === "LATER"
        ? "info"
        : "secondary";
const emailStatuses = [
  { label: "Todas", value: null },
  { label: "Enviadas", value: "SENT" },
  { label: "No enviadas", value: "NOT_SENT" },
];
const emailFilterSeverity = (value: string | null | undefined) =>
  value === "SENT" ? "success" : value === "NOT_SENT" ? "warn" : "secondary";
const verifactuStatuses = [
  { label: "Pendiente de envío", value: "PENDING" },
  { label: "Aceptada", value: "ACCEPTED" },
  { label: "Aceptada con errores", value: "ACCEPTED_WITH_ERRORS" },
  { label: "Requiere corrección", value: "NEEDS_CORRECTION" },
  { label: "Error técnico", value: "REJECTED" },
  { label: "No enviada", value: "NONE" },
].sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }));
const situationFilterSeverity = (value: string) =>
  value === "PAID"
    ? "success"
    : value === "ISSUED"
      ? "info"
      : value === "CANCELLED"
        ? "danger"
        : value === "DRAFT" ||
            value === "PENDING_PAYMENT" ||
            value === "PARTIAL_PAYMENT"
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
import {
  beginInvoiceIssue,
  finishInvoiceIssue,
  isInvoiceIssuePending,
} from "@/services/composables/useInvoiceIssueGuard";
import VeriFactuQueuePanel from "./VeriFactuQueuePanel.vue";
import VeriFactuChainPanel from "./VeriFactuChainPanel.vue";
const correctionVisible = ref(false),
  correctionReason = ref(""),
  correctionPassword = ref(""),
  correctionTarget = ref<any>(null),
  correcting = ref(false);
const openCorrection = (item: any) => {
  if (invoiceProtected(item) || issuing.value) return;
  correctionTarget.value = item;
  correctionReason.value = "";
  correctionPassword.value = "";
  correctionVisible.value = true;
};
const submitCorrection = async () => {
  const item = correctionTarget.value;
  if (
    !item?.pkid ||
    !correctionReason.value.trim() ||
    !correctionPassword.value
  )
    return;
  correcting.value = true;
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/WebCorrectSalesInvoiceVeriFactu/${item.pkid}`,
      {
        reason: correctionReason.value.trim(),
        certificatePassword: correctionPassword.value,
      },
      auth.portalRequestConfig(),
    );
    correctionVisible.value = false;
    toast.add({
      severity: "success",
      summary: "Subsanación preparada",
      detail:
        "Se ha archivado el documento corregido y el nuevo registro queda pendiente de envío.",
      life: 5000,
    });
    await refresh();
  } catch (e: any) {
    toast.add({
      severity: "error",
      summary: "No se pudo preparar la subsanación",
      detail: Array.isArray(e.response?.data?.errors)
        ? e.response.data.errors.map((error: any) => error.message).join(" ")
        : typeof e.response?.data === "string"
          ? e.response.data
          : "Revisa los datos corregidos y el certificado.",
      life: 6000,
    });
  } finally {
    correcting.value = false;
  }
};
import ManualInvoiceDialog from "./ManualInvoiceDialog.vue";
import InvoiceAuditDialog from "./InvoiceAuditDialog.vue";
import InvoiceEmailDialog from "./InvoiceEmailDialog.vue";
const invoiceEmailDialog = ref<any>();
import { useAuthStore } from "@/stores/authStore";
const invoiceAuditDialog = ref<any>();
const auth = useAuthStore();
const manualInvoiceDialog = ref<any>();
const onManualInvoiceCreated = async (invoice: any) => {
  toast.add({
    severity: "success",
    summary: "Factura manual creada",
    detail: `${invoice.code} guardada como borrador.`,
    life: 4000,
  });
  await refresh();
};
import InvoicePaymentsDialog from "./InvoicePaymentsDialog.vue";
const paymentsDialog = ref<any>();
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import ConfirmDialog from "primevue/confirmdialog";
import Password from "primevue/password";
import axios from "axios";
import Button from "primevue/button";
import Chart from "primevue/chart";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import DatePicker from "primevue/datepicker";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Menu from "primevue/menu";
import Message from "primevue/message";
import Select from "primevue/select";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import Toolbar from "primevue/toolbar";
import GenericDataTable from "@/components/shared/GenericDataTable.vue";
import ProductLookup from "@/components/shared/ProductLookup.vue";
import AttachmentsDialog from "@/components/attachments/AttachmentsDialog.vue";
import DialogNotes from "@/components/dialogs/DialogNotes.vue";
const invoiceRates = ref<any[]>([]),
  invoicePaymentTerms = ref<any[]>([]),
  catalogError = ref("");
const availableInvoiceRates = computed(() =>
  invoiceRates.value.filter(
    (rate) =>
      (rate.currencyCode || "EUR") === (detail.value.currencyCode || "EUR"),
  ),
);
async function loadInvoiceCatalog() {
  catalogError.value = "";
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/WebLoadSalesQuoteCatalog`,
    );
    invoiceRates.value = data.rates || [];
    invoicePaymentTerms.value = (data.terms || []).filter(
      (term: any) => term.active !== false,
    );
  } catch {
    catalogError.value = "No se pudieron cargar tarifas y formas de pago.";
  }
}
function changeInvoiceRate(id: number) {
  detail.value = { ...detail.value, salesTarifaId: id };
}
function changeInvoicePaymentTerm(id: number) {
  const term = invoicePaymentTerms.value.find((term) => term.pkid === id);
  if (term) {
    detail.value = {
      ...detail.value,
      salesTermId: id,
      paymentTermDays: term.days || 0,
      paymentTermDescription: term.description,
    };
    recalculateDueDate();
  }
}
const detailMoney = (value: any) =>
  money(value, detail.value.currencyCode || "EUR");
const route = useRoute();
const router = useRouter(),
  toast = useToast(),
  confirm = useConfirm(),
  tableRef = ref<any>(),
  invoiceLinesTable = ref<any>(),
  tableMenu = ref<any>(),
  rowMenu = ref<any>(),
  selected = ref<any>(),
  selectedStatus = ref<string | null>(null),
  loadError = ref(false),
  detailVisible = ref(false),
  detailLoading = ref(false),
  detailSaving = ref(false),
  issuing = ref(false),
  issueVisible = ref(false),
  issueRetry = ref(false),
  issuePassword = ref(""),
  issueTarget = ref<any>(null),
  detail = ref<any>({}),
  lineOriginFilter = ref<any>(null),
  originDeliveriesVisible = ref(false),
  originDeliveriesLoading = ref(false),
  originDeliveries = ref<any[]>([]),
  originInvoiceCode = ref(""),
  originCustomerName = ref(""),
  notesVisible = ref(false),
  attachmentsVisible = ref(false),
  attachment = ref<any>(),
  expanded = ref(true),
  loadingStats = ref(false),
  year = ref(new Date().getFullYear());
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i),
  statuses = [
    { label: "Borradores", value: "DRAFT" },
    { label: "Emitidas", value: "ISSUED" },
    { label: "Pendientes de cobro", value: "PENDING_PAYMENT" },
    { label: "Cobradas", value: "PAID" },
    { label: "Parcialmente cobradas", value: "PARTIAL_PAYMENT" },
    { label: "Anuladas", value: "CANCELLED" },
  ].sort((a, b) =>
    a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
  ),
  stats = ref<any>({
    draftCount: 0,
    draftAmount: 0,
    issuedCount: 0,
    issuedAmount: 0,
    paidCount: 0,
    paidAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    overdueCount: 0,
    cancelledCount: 0,
    monthly: Array(12).fill(0),
    topCustomers: [],
  });
const isDraft = (s = "") =>
    [
      "borrador",
      "draft",
      "borrador / draft",
      "para aprobar / to approved invoice",
    ].includes(
      String(s || "")
        .trim()
        .toLowerCase(),
    ),
  stateLabel = (s = "") =>
    isDraft(s) ? "Borrador" : s.includes("Cancel") ? "Anulada" : s || "-",
  severity = (s = "") =>
    s === "DRAFT" || isDraft(s)
      ? "secondary"
      : s === "CANCELLED" || s.includes("Cancel")
        ? "danger"
        : s === "PENDING_PAYMENT"
          ? "warn"
          : s === "PAID"
            ? "success"
            : "info",
  money = (v: any, currency = "EUR") =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency || "EUR",
      useGrouping: true,
    }).format(Number(v) || 0),
  number = (v: any) =>
    new Intl.NumberFormat("es-ES", {
      maximumFractionDigits: 3,
      useGrouping: true,
    }).format(Number(v) || 0),
  pad = (v: number) => String(v).padStart(2, "0"),
  parsed = (v: any) => {
    if (!v) return null;
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    if (Array.isArray(v)) {
      const [y, m, d, h = 0, min = 0, s = 0] = v;
      const result = new Date(
        Number(y),
        Number(m) - 1,
        Number(d),
        Number(h),
        Number(min),
        Number(s),
      );
      return Number.isNaN(result.getTime()) ? null : result;
    }
    if (typeof v === "object" && v.year != null) {
      const result = new Date(
        Number(v.year),
        Number(v.monthValue ?? v.month ?? 1) - 1,
        Number(v.dayOfMonth ?? v.day ?? 1),
        Number(v.hour ?? 0),
        Number(v.minute ?? 0),
        Number(v.second ?? 0),
      );
      return Number.isNaN(result.getTime()) ? null : result;
    }
    const result = parseLocalizedServerDate(v) ?? new Date(v);
    return Number.isNaN(result.getTime()) ? null : result;
  },
  date = (v: any) => {
    const d = parsed(v);
    return d
      ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
      : "-";
  },
  dateTime = (v: any) => {
    const d = parsed(v);
    return d
      ? `${date(v)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      : "-";
  };
function nextDueTiming(
  invoice: any,
): "OVERDUE" | "TODAY" | "UPCOMING" | "LATER" | null {
  if (
    isDraft(invoice.state) ||
    !(Number(invoice.pendingAmount) > 0) ||
    !invoice.nextDueDate
  )
    return null;
  const due = parsed(invoice.nextDueDate);
  if (!due || Number.isNaN(due.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const today = Date.UTC(part("year"), part("month") - 1, part("day"));
  const days = Math.round(
    (Date.UTC(due.getFullYear(), due.getMonth(), due.getDate()) - today) /
      86400000,
  );
  return days < 0
    ? "OVERDUE"
    : days === 0
      ? "TODAY"
      : days <= 7
        ? "UPCOMING"
        : "LATER";
}
function nextDueDescription(invoice: any): string {
  const timing = nextDueTiming(invoice);
  return timing
    ? {
        OVERDUE: "Vencida y pendiente de cobro",
        TODAY: "Vence hoy · Pendiente de cobro",
        UPCOMING: "Vence en los próximos 7 días · Pendiente de cobro",
        LATER: "Vence dentro de más de 7 días · Pendiente de cobro",
      }[timing]
    : "";
}

const issueValidationErrors = ref<
  Array<{ field: string; message: string; location: string }>
>([]);
const validatingIssue = ref(false);
const canOpenPayments = (item: any) =>
  !!item &&
  !!item.state &&
  !isDraft(item.state) &&
  !String(item.state).toLowerCase().includes("cancel") &&
  !String(item.state).toLowerCase().includes("anulad") &&
  item.verifactuStatus === "ACCEPTED" &&
  item.canManagePayments !== false &&
  !invoiceProtected(item);
const openPayments = (item: any) => {
  if (canOpenPayments(item)) paymentsDialog.value?.open(item);
};
const saveDraftAndClose = async () => {
  if (await saveDetail()) detailVisible.value = false;
};
const validateIssueTarget = async () => {
  const item = issueTarget.value;
  if (!item?.pkid || issuing.value || validatingIssue.value || issueRetry.value)
    return;
  validatingIssue.value = true;
  issueValidationErrors.value = [];
  try {
    if (detail.value.pkid !== item.pkid || !(await saveDetail()))
      throw new Error("Guarda y revisa el borrador antes de emitir.");
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/WebValidateSalesInvoice/${item.pkid}`,
    );
    if (data?.valid !== true)
      issueValidationErrors.value =
        Array.isArray(data?.errors) && data.errors.length
          ? data.errors
          : [
              {
                field: "invoice",
                message: "No se pudo confirmar la validación.",
                location: "Detalle de la factura",
              },
            ];
  } catch (e: any) {
    issueValidationErrors.value = [
      {
        field: "invoice",
        message:
          typeof e.response?.data === "string"
            ? e.response.data
            : e.message || "No se pudo validar la factura.",
        location: "Revisa los datos y vuelve a comprobar",
      },
    ];
  } finally {
    validatingIssue.value = false;
  }
};
const invoiceProtected = (item: any) =>
  isInvoiceIssuePending(item?.pkid) ||
  ["PENDING", "PROCESSING"].includes(item?.verifactuStatus);
const canEditDetail = computed(
  () =>
    !detail.value.verifactuStatus &&
    isDraft(detail.value.state) &&
    !invoiceProtected(detail.value) &&
    !issuing.value,
);
const issueInvoice = (item: any, retry = false) => {
  if (
    !item?.pkid ||
    issuing.value ||
    validatingIssue.value ||
    detailSaving.value ||
    invoiceProtected(item)
  )
    return;
  if (retry ? !item.canRetryVerifactu : !isDraft(item.state)) return;
  issueTarget.value = item;
  issueRetry.value = retry;
  issuePassword.value = "";
  issueValidationErrors.value = [];
  issueVisible.value = true;
  if (!retry) void validateIssueTarget();
};
const confirmIssue = async () => {
  const item = issueTarget.value;
  if (
    !item?.pkid ||
    !issuePassword.value ||
    issuing.value ||
    validatingIssue.value ||
    issueValidationErrors.value.length > 0 ||
    detailSaving.value ||
    invoiceProtected(item)
  )
    return;
  const retry = issueRetry.value;
  if (
    retry
      ? !item.canRetryVerifactu
      : !isDraft(item.state) || detail.value.pkid !== item.pkid
  )
    return;
  issuing.value = true;
  let submitted = false;
  try {
    const requestConfig = auth.portalRequestConfig();
    if (!retry && !(await saveDetail(true))) return;
    if (!beginInvoiceIssue(item.pkid)) return;
    submitted = true;
    const endpoint = retry
      ? "WebRetrySalesInvoiceVeriFactu"
      : "WebIssueSalesInvoice";
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/${endpoint}/${item.pkid}`,
      { certificatePassword: issuePassword.value },
      requestConfig,
    );
    // Update every visible copy before releasing the request guard.
    Object.assign(item, data);
    if (selected.value?.pkid === item.pkid) Object.assign(selected.value, data);
    if (detail.value.pkid === item.pkid) {
      Object.assign(detail.value, data);
      detail.value.createDate = parsed(data.createDate);
      detail.value.toPayDate = parsed(data.toPayDate);
      detail.value.calculatedToPayDate = parsed(data.calculatedToPayDate);
      detailVisible.value = false;
    }
    finishInvoiceIssue(item.pkid);
    issueVisible.value = false;
    toast.add({
      severity: "success",
      summary: retry ? "Reintento en cola" : "Factura emitida",
      detail: `${data.code || item.code} · VeriFactu continúa en segundo plano. Puedes seguir trabajando; esta factura permanece protegida.`,
      life: 7000,
    });
    // The existing queue and list refresh independently. Never wait for AEAT here.
    void refresh().catch(() =>
      toast.add({
        severity: "warn",
        summary: "Actualización pendiente",
        detail:
          "La operación se ha confirmado. Actualiza el listado para consultar VeriFactu; no vuelvas a emitir.",
        life: 6000,
      }),
    );
  } catch (e: any) {
    const rejected = [400, 401, 403, 404, 409, 422].includes(
      e.response?.status,
    );
    if (submitted && rejected) finishInvoiceIssue(item.pkid);
    issueVisible.value = Array.isArray(e.response?.data?.errors);
    if (issueVisible.value)
      issueValidationErrors.value = e.response.data.errors;
    toast.add({
      severity: "warn",
      summary:
        submitted && !rejected
          ? "Emisión pendiente de comprobar"
          : "No se pudo completar la operación",
      detail:
        submitted && !rejected
          ? "La respuesta no ha llegado. La factura queda protegida: abre su detalle y comprueba el estado antes de realizar otra acción."
          : typeof e.response?.data === "string"
            ? e.response.data
            : e.response?.data?.message ||
              (!auth.portalSession
                ? "Vuelve a iniciar sesión en el portal."
                : "Revisa la sesión del portal, el certificado y los datos de la factura."),
      life: 8000,
    });
  } finally {
    issuePassword.value = "";
    issuing.value = false;
  }
};
const verifactuSeverity = (status = "") =>
  status === "ACCEPTED"
    ? "success"
    : status === "ACCEPTED_WITH_ERRORS"
      ? "warn"
      : status === "REJECTED"
        ? "danger"
        : status === "PENDING" || status === "PROCESSING"
          ? "info"
          : "secondary";
const deliveryOriginDate = (item: any) => {
  const value = item?.createDate ?? item?.dateCreate ?? item?.deliveryDate;
  if (Array.isArray(value)) {
    const [y, m, d, h = 0, min = 0, s = 0] = value;
    return date(
      new Date(
        Number(y),
        Number(m) - 1,
        Number(d),
        Number(h),
        Number(min),
        Number(s),
      ),
    );
  }
  return date(value);
};
const loadStats = async () => {
    loadingStats.value = true;
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/WebGetSalesInvoiceStatistics`,
        { params: { year: year.value } },
      );
      stats.value = { ...stats.value, ...data };
    } finally {
      loadingStats.value = false;
    }
  },
  refresh = async () => {
    await tableRef.value?.refresh();
    await loadStats();
  },
  filter = () => {
    selected.value = null;
    tableRef.value?.refreshWithQuery(
      encodeURIComponent(tableRef.value?.searchQuery || ""),
      {
        status: selectedStatus.value || undefined,
        verifactuStatus: selectedVerifactuStatus.value || undefined,
        emailStatus: selectedEmailStatus.value || undefined,
        dueStatus: selectedDueStatus.value || undefined,
      },
      true,
    );
  },
  openOriginDeliveries = async (i: any) => {
    if (!i?.pkid) return;
    originInvoiceCode.value = i.code || "";
    originCustomerName.value = i.entityName || "";
    originDeliveries.value = [];
    originDeliveriesVisible.value = true;
    originDeliveriesLoading.value = true;
    try {
      const [originResponse, detailResponse] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_URL}/WebGetSalesInvoiceDeliveries/${i.pkid}`,
        ),
        axios.get(
          `${import.meta.env.VITE_API_URL}/WebGetSalesInvoice/${i.pkid}`,
        ),
      ]);
      const origins = Array.isArray(originResponse.data)
          ? originResponse.data
          : [],
        detailOrigins = Array.isArray(detailResponse.data?.deliveries)
          ? detailResponse.data.deliveries
          : [];
      originDeliveries.value = origins.map((origin: any) => {
        const detailOrigin = detailOrigins.find(
          (candidate: any) =>
            candidate.pkid === origin.pkid || candidate.code === origin.code,
        );
        return {
          ...origin,
          createDate:
            origin.createDate ??
            origin.dateCreate ??
            detailOrigin?.createDate ??
            detailOrigin?.dateCreate,
        };
      });
    } finally {
      originDeliveriesLoading.value = false;
    }
  },
  openDetail = async (i: any) => {
    if (!i?.pkid || issuing.value) return;
    lineOriginFilter.value = null;
    detailVisible.value = true;
    detailLoading.value = true;
    void loadInvoiceCatalog();
    try {
      const data = (
        await axios.get(
          `${import.meta.env.VITE_API_URL}/WebGetSalesInvoice/${i.pkid}`,
        )
      ).data;
      if (
        !isDraft(data.state) &&
        data.verifactuStatus &&
        data.verifactuStatus !== "REJECTED"
      )
        finishInvoiceIssue(i.pkid);
      detail.value = {
        ...data,
        createDate: parsed(data.createDate),
        toPayDate: parsed(data.toPayDate),
        calculatedToPayDate: parsed(data.calculatedToPayDate),
        dueDateReason: "",
        lines: (data.lines || []).map((line: any) => ({ ...line })),
      };
      if (isDraft(detail.value.state) && !detail.value.dueDateOverride)
        recalculateDueDate();
    } finally {
      detailLoading.value = false;
    }
  },
  addManualLine = async () => {
    detail.value.lines ??= [];
    detail.value.lines.push({
      pkid: null,
      productId: null,
      productCode: "",
      description: "",
      manual: true,
      manualReason: "",
      quantity: 1,
      priceUnit: 0,
      discount: 0,
      tax: detail.value.fixedTax ?? 0,
    });
    await nextTick();
    requestAnimationFrame(() => {
      const root = invoiceLinesTable.value?.$el as HTMLElement | undefined;
      const containers = root?.querySelectorAll(
        ".p-datatable-table-container,.p-datatable-wrapper,.p-datatable-scrollable-body",
      ) as NodeListOf<HTMLElement> | undefined;
      containers?.forEach((container) => {
        container.scrollTop = container.scrollHeight;
      });
      const rows = root?.querySelectorAll("tbody tr");
      (rows?.[rows.length - 1] as HTMLElement | undefined)?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    });
  },
  selectManualProduct = (line: any, product: any) => {
    line.productId = product.pkid;
    line.productCode = product.code || "";
    line.description = product.description || "";
    line.priceUnit = Number(product.salePrice) || 0;
    line.tax = detail.value.fixedTax ?? (Number(product.taxValue) || 0);
  },
  removeManualLine = (line: any) => {
    detail.value.lines = (detail.value.lines || []).filter(
      (candidate: any) => candidate !== line,
    );
  },
  lineNet = (line: any) =>
    Number(line.quantity || 0) *
    Number(line.priceUnit || 0) *
    (1 - Number(line.discount || 0) / 100),
  lineTotal = (line: any) => lineNet(line) * (1 + Number(line.tax || 0) / 100),
  filteredDetailLines = computed(() => {
    const lines = detail.value.lines || [];
    if (lineOriginFilter.value == null) return lines;
    if (lineOriginFilter.value === "manual")
      return lines.filter((line: any) => line.manual);
    return lines.filter(
      (line: any) =>
        String(line.sourceDeliveryId) === String(lineOriginFilter.value),
    );
  }),
  draftTotals = computed(() => {
    const lines = detail.value.lines || [],
      net = lines.reduce((sum: number, line: any) => sum + lineNet(line), 0),
      tax = lines.reduce(
        (sum: number, line: any) =>
          sum + (lineNet(line) * Number(line.tax || 0)) / 100,
        0,
      );
    const retention =
      Math.round(net * Number(detail.value.retentionRate || 0)) / 100;
    return { net, tax, retention, total: net + tax - retention };
  }),
  toggleDueDateOverride = () => {
    detail.value.dueDateOverride = !detail.value.dueDateOverride;
    detail.value.dueDateReason = "";
    if (!detail.value.dueDateOverride) recalculateDueDate();
  },
  recalculateDueDate = async () => {
    if (detail.value.dueDateOverride) return;
    const invoiceDate = parsed(detail.value.createDate);
    if (!invoiceDate) {
      detail.value.toPayDate = null;
      return;
    }
    const version = ++duePreviewSequence;
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_API_URL + "/WebPreviewSalesInvoiceDues",
        {
          invoiceId: detail.value.pkid,
          termId: detail.value.salesTermId,
          date: [
            invoiceDate.getFullYear(),
            pad(invoiceDate.getMonth() + 1),
            pad(invoiceDate.getDate()),
          ].join("-"),
          total: Math.round(draftTotals.value.total * 100) / 100,
        },
        auth.portalRequestConfig(),
      );
      if (version === duePreviewSequence && !detail.value.dueDateOverride)
        detail.value.toPayDate = parsed(data[data.length - 1]?.dueDate);
    } catch (e: any) {
      if (version === duePreviewSequence) {
        detail.value.toPayDate = null;
        toast.add({
          severity: "warn",
          summary: "Revisa los vencimientos",
          detail:
            typeof e.response?.data === "string"
              ? e.response.data
              : "No se pudo calcular el calendario.",
          life: 5000,
        });
      }
    }
  },
  saveDetail = async (forIssue = false) => {
    if (
      detail.value.verifactuStatus ||
      !isDraft(detail.value.state) ||
      detailSaving.value ||
      invoiceProtected(detail.value) ||
      (issuing.value && forIssue !== true)
    )
      return;
    detailSaving.value = true;
    try {
      const payload = {
        salesTarifaId: detail.value.salesTarifaId,
        salesTermId: detail.value.salesTermId,
        createDate: detail.value.createDate?.toISOString(),
        toPayDate: detail.value.toPayDate?.toISOString() || null,
        dueDateOverride: Boolean(detail.value.dueDateOverride),
        dueDateReason: detail.value.dueDateReason,
        terms: detail.value.terms,
        customerTerms: detail.value.customerTerms,
        notes: detail.value.notes,
        bankTransfer: detail.value.bankTransfer,
        lines: (detail.value.lines || []).map((line: any) => ({
          pkid: line.pkid,
          productId: line.productId,
          description: line.description,
          manualReason: line.manualReason,
          quantity: Number(line.quantity),
          priceUnit: Number(line.priceUnit),
          discount: Number(line.discount),
          tax: Number(line.tax),
        })),
      };
      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/WebUpdateSalesInvoice/${detail.value.pkid}`,
        payload,
      );
      detail.value = {
        ...data,
        createDate: parsed(data.createDate),
        toPayDate:
          parsed(data.toPayDate) ??
          parsed(payload.toPayDate) ??
          detail.value.toPayDate,
        calculatedToPayDate: parsed(data.calculatedToPayDate),
        dueDateReason: "",
        lines: (data.lines || []).map((line: any) => ({ ...line })),
      };
      if (isDraft(detail.value.state) && !detail.value.toPayDate)
        recalculateDueDate();
      toast.add({
        severity: "success",
        summary: "Borrador guardado",
        detail: "Los cambios de la factura se han guardado.",
        life: 3000,
      });
      if (!forIssue) await refresh();
      return true;
    } catch (e: any) {
      toast.add({
        severity: "error",
        summary: "No se pudo guardar",
        detail: e.response?.data || "Revisa los datos de la factura.",
        life: 5000,
      });
      return false;
    } finally {
      detailSaving.value = false;
    }
  },
  openMenu = (e: Event, i: any) => {
    selected.value = i;
    rowMenu.value?.toggle(e);
  },
  openAttachments = (i: any) => {
    if (invoiceProtected(i) || issuing.value) return;
    attachment.value = i;
    attachmentsVisible.value = true;
  },
  attachmentsChanged = (v: boolean) => {
    attachmentsVisible.value = v;
    if (!v) refresh();
  };
const noteRequest = {
    table: "SALES_INVOICES",
    pkField: "SALES_INVOICES_PK_ID",
    field: "SALES_INVOICES_DS_NOTES",
    id: -1,
  },
  rowItems = computed(() => [
    {
      label: "Vencimientos",
      icon: "pi pi-calendar",
      command: () => duesDialog.value?.open(selected.value),
    },
    ...(isDraft(selected.value?.state)
      ? [
          {
            label: "Descartar borrador",
            disabled: invoiceProtected(selected.value) || issuing.value,
            icon: "pi pi-ban",
            command: () => cancelDraft(selected.value),
          },
        ]
      : []),
    ...(canOpenPayments(selected.value)
      ? [
          {
            label: "Cobros de la factura",
            icon: "pi pi-wallet",
            command: () => openPayments(selected.value),
          },
        ]
      : []),
    { separator: true },
    {
      label: selected.value?.dateSend
        ? "Reenviar por correo"
        : "Enviar por correo",
      icon: "pi pi-envelope",
      disabled:
        !selected.value?.canSendToCustomer || invoiceProtected(selected.value),
      command: () => invoiceEmailDialog.value?.open(selected.value),
    },
    {
      label: "Historial de correo",
      icon: "pi pi-history",
      command: () => invoiceEmailDialog.value?.open(selected.value, "history"),
    },
    {
      label: "Auditoría de emisión",
      icon: "pi pi-history",
      command: () => invoiceAuditDialog.value?.open(selected.value),
    },
    {
      label: "Abrir factura",
      icon: "pi pi-eye",
      command: () => openDetail(selected.value),
    },
    { separator: true },
    {
      label: "Ver / Imprimir factura",
      icon: "pi pi-print",
      disabled: selected.value?.verifactuStatus !== "ACCEPTED",
      command: () => openInvoicePdf(selected.value),
    },
    ...(selected.value?.canRetryVerifactu
      ? [
          { separator: true },
          {
            label: "Reintentar envío VeriFactu",
            disabled: invoiceProtected(selected.value) || issuing.value,
            icon: "pi pi-refresh",
            command: () => issueInvoice(selected.value, true),
          },
        ]
      : []),
    { separator: true },
    {
      label: "Notas",
      disabled: invoiceProtected(selected.value) || issuing.value,
      icon: "pi pi-comments",
      command: () => {
        noteRequest.id = selected.value?.pkid ?? -1;
        notesVisible.value = true;
      },
    },
    {
      label: `Documentos${selected.value?.attachmentCount ? ` (${selected.value.attachmentCount})` : ""}`,
      icon: "pi pi-paperclip",
      command: () => openAttachments(selected.value),
    },
  ]),
  tableItems = [
    { label: "Refrescar", icon: "pi pi-refresh", command: refresh },
    { separator: true },
    {
      label: "Exportar Excel",
      icon: "pi pi-file-excel",
      command: () => tableRef.value?.exportToExcel(),
    },
    { separator: true },
    {
      label: "Requerimientos y documentación AEAT",
      icon: "pi pi-building-columns",
      command: () => aeatCasesRef.value?.open(),
    },
  ];
const kpis = computed(() => [
    {
      label: "Borradores",
      value: stats.value.draftCount,
      detail: money(stats.value.draftAmount),
      icon: "pi pi-file-edit",
      kind: "draft",
    },
    {
      label: "Facturas emitidas",
      value: stats.value.issuedCount,
      detail: money(stats.value.issuedAmount),
      icon: "pi pi-check-circle",
      kind: "issued",
    },
    {
      label: "Importe cobrado",
      value: money(stats.value.paidAmount),
      detail: stats.value.paidCount + " facturas totalmente cobradas",
      icon: "pi pi-wallet",
      kind: "paid",
    },
    {
      label: "Pendientes de cobro",
      value: stats.value.pendingCount,
      detail: money(stats.value.pendingAmount),
      icon: "pi pi-clock",
      kind: "pending",
    },
    {
      label: "Vencidas",
      value: stats.value.overdueCount,
      detail: "Pendientes de cobro",
      icon: "pi pi-exclamation-triangle",
      kind: "overdue",
    },
    {
      label: "Anuladas",
      value: stats.value.cancelledCount,
      detail: `Año ${year.value}`,
      icon: "pi pi-ban",
      kind: "cancelled",
    },
  ]),
  chartData = computed(() => ({
    labels: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    datasets: [
      {
        data: stats.value.monthly,
        label: "Facturación emitida",
        backgroundColor: "#e9a0b5",
        borderColor: "#648506",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  })),
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
  };
watch(
  [
    selectedStatus,
    selectedVerifactuStatus,
    selectedEmailStatus,
    selectedDueStatus,
  ],
  filter,
);
watch(year, loadStats);
let statusTimer: number | undefined;
onMounted(() => {
  if (route.query.invoiceId)
    openDetail({ pkid: Number(route.query.invoiceId) });
  loadStats();
  statusTimer = window.setInterval(() => tableRef.value?.refresh(), 10000);
});
onUnmounted(() => {
  if (statusTimer) window.clearInterval(statusTimer);
});
const cancelDraft = (item: any) => {
  if (invoiceProtected(item) || issuing.value) return;
  confirm.require({
    header: "Descartar borrador",
    message:
      "Se conservará el documento anulado y se liberarán sus cantidades reservadas. No se elimina el historial.",
    acceptLabel: "Descartar borrador",
    rejectLabel: "Volver",
    accept: async () => {
      if (invoiceProtected(item) || issuing.value) return;
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/WebCancelSalesInvoiceDraft/${item.pkid}`,
        );
        detailVisible.value = false;
        await refresh();
        toast.add({
          severity: "success",
          summary: "Borrador descartado",
          detail: "Cantidades liberadas para volver a facturar.",
          life: 4000,
        });
      } catch (e: any) {
        toast.add({
          severity: "error",
          summary: "No se pudo descartar",
          detail: e.response?.data || "Actualiza la factura.",
          life: 4500,
        });
      }
    },
  });
};
const openInvoicePdf = (item: any) => {
  if (item?.pkid && item.verifactuStatus === "ACCEPTED") {
    window.open(
      `${import.meta.env.VITE_API_URL}/WebGetSalesInvoicePdf/${item.pkid}`,
      "_blank",
      "noopener",
    );
  }
};
</script>
<style scoped>
.invoice-date-time {
  font-size: 0.78rem;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.table :deep(.invoice-date-column) {
  white-space: nowrap;
}
.due-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: fit-content;
  margin-top: 6px;
  padding: 5px 8px;
  border: 1px solid #dbe8f2;
  border-radius: 9px;
  background: #f0f7fc;
  color: #346182;
  line-height: 1.2;
}
.due-summary-count {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
}
.due-summary-count i {
  font-size: 0.76rem;
}
.due-summary-count strong {
  font-size: 0.9rem;
  font-weight: 750;
}
.due-summary-count > span {
  opacity: 0.85;
}
.due-summary-label {
  font-size: 0.68rem;
  font-weight: 600;
  white-space: nowrap;
}
.due-summary--clear {
  color: #52700c;
  background: #f3f8e7;
  border-color: #dce9bd;
}
.due-summary--neutral {
  color: #667085;
  background: #f5f6f8;
  border-color: #e4e7ec;
}
.table :deep(.invoice-due-column) {
  width: 115px !important;
  min-width: 115px;
  white-space: nowrap;
}
.table :deep(.invoice-orders-column) {
  width: 210px !important;
  min-width: 210px;
}
.table :deep(.invoice-sent-column) {
  width: 125px !important;
  min-width: 125px;
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
.fiscal-errors {
  margin: 0.65rem 0;
  padding-left: 1.2rem;
  max-height: 40vh;
  overflow: auto;
}
.fiscal-errors li {
  margin: 0.6rem 0;
}
.fiscal-errors small {
  display: block;
  margin-top: 0.15rem;
}
.invoice-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}
.invoice-filters .filter {
  width: 240px;
  max-width: 100%;
}
.invoice-filters .verifactu-filter {
  width: 260px;
}
.page {
  --pink: #648506;
  min-height: calc(100dvh - 66px);
  padding: 16px 14px 72px;
  background: #f7f8fa;
  color: #243044;
}
.hero {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border: 1px solid #dbe8b2;
  border-radius: 15px;
  background: #fff;
}
.heading {
  display: flex;
  align-items: center;
  gap: 14px;
}
.heading > .icon {
  display: grid;
  width: 50px;
  height: 50px;
  place-items: center;
  border-radius: 13px;
  color: #fff;
  background: linear-gradient(135deg, #9cc10a, #648506);
}
.heading small {
  color: #8791a0;
  font-weight: 700;
}
.heading h1 {
  margin: 3px 0 2px;
  font-size: 1.4rem;
}
.heading p {
  margin: 0;
  color: #707b8c;
}
.hero nav {
  display: flex;
  align-items: center;
  gap: 3px;
}
.hero nav :deep(.assistant-access) {
  border: 1px solid #c4b5fd;
  background: #ede9fe;
  color: #513c8c;
  font-weight: 700;
  box-shadow: none;
}
.hero nav :deep(.assistant-access:hover) {
  border-color: #a78bfa;
  background: #ddd6fe;
  color: #432d7a;
}
.list-card {
  height: clamp(500px, calc(100dvh - 330px), 700px);
  min-height: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-top: 14px;
  border: 1px solid #dfe4ea;
  border-radius: 14px;
  background: #fff;
}
.list-card > .p-toolbar {
  padding: 12px 16px;
  border: 0;
  border-bottom: 1px solid #e8ecf0;
}
.list-card .p-toolbar small,
.stats header small {
  display: block;
  margin-top: 0.2rem;
  color: #7d8797;
}
.table {
  flex: 1;
  min-height: 0;
}
.filter {
  width: 220px;
}
.code {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
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
.code :deep(.p-tag) {
  font-size: 0.68rem;
  padding: 0.15rem 0.35rem;
}
.origin-customer {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.85rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid #dbe8b2;
  border-radius: 9px;
  background: #f4f8e8;
}
.origin-customer > i {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #eaf2d2;
  color: #648506;
}
.origin-customer small,
.origin-customer strong {
  display: block;
}
.origin-customer small {
  margin-bottom: 0.15rem;
  color: #7d6770;
  font-size: 0.75rem;
}
.origin-customer strong {
  color: #44323a;
}
.delivery-origin-date {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}
.delivery-origin-date > i {
  color: #648506;
  font-size: 0.82rem;
}
.origins-cell {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  color: #356b62;
  font-weight: 650;
  white-space: nowrap;
  cursor: help;
}
.origins-cell > i {
  color: #16846e;
  font-size: 0.82rem;
}
.origins-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.8rem;
  height: 1.55rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: #e8f1ef;
  color: #356b62;
  font-size: 0.72rem;
}
.notes {
  color: #7b8f22;
}
.overdue {
  color: #c33f3f;
  font-weight: 700;
}
.stats {
  margin-top: 14px;
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
.stats > header > div:last-child {
  display: flex;
  gap: 0.4rem;
}
.stats > header .p-select {
  width: 105px;
}
.stats > header i {
  color: var(--pink);
}
.stats-body {
  padding: 14px 16px 18px;
}
.loading {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
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
.kpi-icon.overdue,
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
  place-items: center;
  border-radius: 50%;
  background: #eaf2d2;
  color: var(--pink);
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
.detail > * {
  flex-shrink: 0;
}
.detail {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.summary {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid #e5ecd0;
  border-radius: 10px;
  background: #f8faef;
}
.summary small,
.summary b {
  display: block;
}
.summary small {
  margin-bottom: 0.25rem;
  color: #7b8492;
}
.origins {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.65rem;
  border-left: 4px solid #9cc10a;
  background: #f4f8e8;
}
.origins i {
  color: var(--pink);
}
.lines {
  flex: 1 0 230px;
  min-height: 230px;
  overflow: hidden;
}
.lines :deep(.invoice-number) {
  width: 6.8rem;
  min-width: 0;
  text-align: right;
}
.lines :deep(.invoice-number.short) {
  width: 4.8rem;
}
.bottom {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.85rem;
}
.invoice-texts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 100%;
  min-width: 0;
  gap: 1rem;
}
.invoice-texts label,
.invoice-texts small {
  display: block;
}
.invoice-texts textarea {
  width: 100%;
  height: 150px;
  min-height: 150px;
  resize: vertical;
}
.invoice-texts p {
  margin: 0.3rem 0;
  white-space: pre-wrap;
}
.conditions-divider {
  width: 100%;
  height: 1px;
  background: #d1d5db;
}
.totals {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.5rem;
  width: 100%;
}
.totals span:last-child {
  padding: 0.65rem;
  background: #eaf2d2;
  border-radius: 8px;
}
.footer {
  width: 100%;
}
.footer > div {
  width: 100%;
  margin-bottom: 0.75rem;
  border-top: 1px solid #9cc10a;
}
.footer section {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
@media (max-width: 1200px) {
  .kpis {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 800px) {
  .heading p {
    display: none;
  }
  .hero nav :deep(.p-button-label) {
    display: none;
  }
  .analytics {
    grid-template-columns: 1fr;
  }
  .kpis {
    grid-template-columns: repeat(2, 1fr);
  }
  .summary {
    grid-template-columns: 1fr 1fr;
  }
  .bottom {
    flex-direction: column;
  }
  .invoice-texts {
    width: 100%;
    grid-template-columns: 1fr;
  }
}
.invoice-lines-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: -0.5rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid #e5ecd0;
  border-radius: 8px;
  background: #f8faef;
}
.lines :deep(.p-tag) {
  margin-left: 0.4rem;
  font-size: 0.68rem;
}
.summary {
  grid-template-columns: 1.15fr 1.5fr 2.35fr 0.8fr;
  align-items: center;
  padding: 0.45rem 0.75rem;
}
.summary > div {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.4rem;
}
.summary > div > small,
.summary > div > b {
  display: inline;
  margin: 0;
  white-space: nowrap;
}
.summary > div > small {
  flex: 0 0 auto;
}
.due-field {
  display: flex;
  min-width: 0;
  flex-direction: row;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}
.due-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.15rem;
}
.due-row :deep(.p-datepicker) {
  max-width: 145px;
}
.due-row :deep(.p-inputtext) {
  padding: 0.3rem 0.45rem;
}
.due-row :deep(.p-button) {
  width: 1.65rem;
  height: 1.65rem;
  padding: 0;
}
.due-reason {
  width: 155px;
  min-width: 120px;
  margin: 0;
  padding: 0.3rem 0.45rem;
}
.payment-rule {
  max-width: 220px;
  margin: 0;
  overflow: hidden;
  color: #64704c;
  font-size: 0.68rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.verifactu-password {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 1rem;
}
.verifactu-password > span {
  font-weight: 700;
  color: #485466;
}
.correction-banner {
  position: fixed;
  z-index: 20;
  right: 1rem;
  bottom: 1rem;
  width: min(720px, calc(100vw - 2rem));
  box-shadow: 0 10px 30px rgba(80, 20, 20, 0.2);
}
.correction-banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}
.correction-banner-content span,
.correction-banner-content small {
  display: block;
}
.correction-banner-content small {
  margin-top: 0.2rem;
}
.correction-field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 1rem;
}
.correction-field > span {
  font-weight: 700;
  color: #485466;
}
.summary {
  grid-template-columns:
    minmax(210px, 1.1fr) minmax(230px, 1.05fr) minmax(390px, 1.7fr)
    minmax(300px, 1.3fr);
  gap: 0.65rem;
  padding: 0.6rem 0.8rem;
}
.summary > div {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  justify-content: start;
  column-gap: 0.5rem;
  row-gap: 0.35rem;
}
.summary > div:last-child {
  grid-template-columns: max-content max-content;
}
.summary > div > small,
.summary > div > b {
  overflow: hidden;
  text-overflow: ellipsis;
}
.summary :deep(.p-tag) {
  width: max-content;
  max-width: 100%;
  white-space: nowrap;
  word-break: keep-all;
}
.summary :deep(.p-tag-label) {
  white-space: nowrap;
}
.summary .due-field {
  display: flex;
  overflow: visible;
}
.summary .due-field > small {
  overflow: visible;
}
.summary .due-field b {
  overflow: visible;
}
.summary .payment-rule {
  max-width: 190px;
}
@media (max-width: 1350px) {
  .summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .summary > div:last-child {
    grid-template-columns:
      max-content max-content minmax(0, max-content)
      max-content;
  }
}
@media (max-width: 760px) {
  .summary {
    grid-template-columns: 1fr;
  }
  .summary > div:last-child {
    grid-template-columns: max-content max-content;
  }
  .summary .due-field {
    flex-wrap: wrap;
  }
  .summary .payment-rule {
    max-width: 100%;
  }
}
.table :deep(.invoice-code-column) {
  width: 155px !important;
  min-width: 145px;
}
.table :deep(.invoice-customer-column) {
  min-width: 180px;
}
.code {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  white-space: normal;
}
.invoice-code-value {
  white-space: nowrap;
}
.code-indicators {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  max-width: 155px;
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
.invoice-commercial {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex-shrink: 0;
}
.invoice-commercial label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-width: 0;
}
.invoice-texts textarea {
  min-height: 150px;
  resize: vertical;
}
@media (max-width: 800px) {
  .invoice-commercial {
    grid-template-columns: 1fr;
  }
}
</style>
