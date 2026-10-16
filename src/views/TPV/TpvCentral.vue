<template>
  <main class="central">
    <header class="central-header">
      <div class="title">
        <div class="title-top">
          <small>KiwiKERP · CENTRAL</small>
          <span class="live"><i />En directo</span>
        </div>
        <h1>Supervisión del TPV</h1>
        <p>Zonas y cajas de la entidad titular · Importes en EUR</p>
      </div>
      <div class="actions">
        <span role="status" class="updated"
          >{{ updatedText }} · Todo cada 30 s</span
        >
        <Button
          label="Actualizar"
          icon="pi pi-refresh"
          :loading="loading || pulseLoading"
          outlined
          @click="refreshAll"
        />
        <Button
          label="Volver al ERP"
          icon="pi pi-arrow-left"
          outlined
          @click="router.push({ name: 'Dashboard' })"
        />
      </div>
    </header>

    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>

    <!-- Indicadores principales -->
    <section class="kpis" aria-label="Indicadores de supervisión">
      <article class="kpi">
        <span class="kpi-icon kpi--sales"><i class="pi pi-euro" /></span>
        <div>
          <span>Ventas de hoy</span
          ><strong>{{ money(data?.todaySales) }}</strong>
        </div>
      </article>
      <article class="kpi">
        <span class="kpi-icon kpi--ticket"><i class="pi pi-receipt" /></span>
        <div>
          <span>Ticket medio · turno</span
          ><strong>{{ money(shift.average) }}</strong
          ><small>{{ count(shift.tickets) }} tickets en curso</small>
        </div>
      </article>
      <article class="kpi">
        <span class="kpi-icon kpi--open"><i class="pi pi-desktop" /></span>
        <div>
          <span>Cajas abiertas</span
          ><strong
            >{{ count(openCount) }} /
            {{ count(data?.registers.length) }}</strong
          ><small>{{ count(terminals.length) }} terminales activos</small>
        </div>
      </article>
      <article class="kpi">
        <span class="kpi-icon kpi--cash"><i class="pi pi-wallet" /></span>
        <div>
          <span>Efectivo esperado</span><strong>{{ money(expected) }}</strong
          ><small>solo cajas abiertas</small>
        </div>
      </article>
      <article class="kpi">
        <span class="kpi-icon kpi--pending"><i class="pi pi-hourglass" /></span>
        <div>
          <span>Tickets abiertos</span
          ><strong>{{ count(shift.openTickets) }}</strong
          ><small>bloquean el cierre remoto</small>
        </div>
      </article>
      <article class="kpi">
        <span class="kpi-icon kpi--refund"><i class="pi pi-undo" /></span>
        <div>
          <span>Devoluciones de hoy</span
          ><strong>{{ money(data?.todayRefunds) }}</strong>
        </div>
      </article>
    </section>

    <!-- Alertas automáticas -->
    <section
      v-if="alertList.length"
      class="alerts"
      aria-label="Alertas de supervisión"
    >
      <article
        v-for="(a, i) in alertList"
        :key="i"
        class="alert"
        :class="`alert--${a.severity}`"
      >
        <i :class="a.icon" />
        <div>
          <strong>{{ a.title }}</strong>
          <p>{{ a.detail }}</p>
        </div>
      </article>
    </section>

    <!-- Cierres pendientes de recuento físico -->
    <section v-if="data?.pendingReconciliations?.length" class="pending card">
      <div class="pending-copy">
        <span class="kpi-icon kpi--refund"><i class="pi pi-scale" /></span>
        <div>
          <strong
            >{{ count(data.pendingReconciliations.length) }} cierre(s)
            pendientes de recuento físico</strong
          >
          <p>Registra el recuento para completar el arqueo de estas cajas.</p>
        </div>
      </div>
      <div class="pending-links">
        <Button
          v-for="p in data.pendingReconciliations"
          :key="p.openingId"
          :label="`Z-${p.openingId} · ${p.registerName}`"
          text
          size="small"
          @click="
            historyZone = p.zoneId;
            history = true;
          "
        />
      </div>
    </section>

    <!-- Paneles de análisis -->
    <Message v-if="pulseError" severity="warn" :closable="false">{{
      pulseError
    }}</Message>
    <div class="analysis-scope">
      <label for="analysis-zone">Zona de los paneles de análisis</label>
      <Select
        inputId="analysis-zone"
        v-model="analysisZoneId"
        :options="analysisZoneOptions"
        optionLabel="label"
        optionValue="value"
        filter
        filterPlaceholder="Buscar zona…"
        emptyFilterMessage="No se encontraron zonas"
        class="analysis-zone-select"
      />
      <strong>{{ analysisZoneLabel }}</strong>
    </div>
    <p class="hint-sm">
      Pagos y empleados: aperturas en curso de la zona seleccionada. Las curvas
      muestran sus cobros de hoy, sin restar devoluciones. La línea roja señala
      la hora actual. Los indicadores superiores y las cajas mantienen la vista
      general.
    </p>
    <section
      class="review-summary card"
      aria-label="Asuntos pendientes de la zona"
    >
      <header class="review-heading">
        <div>
          <h3>Centro de revisión</h3>
          <p>{{ analysisZoneLabel }}</p>
        </div>
        <span class="review-hint"
          ><i class="pi pi-info-circle" /> Selecciona un indicador para ver el
          detalle</span
        >
      </header>
      <div class="review-metrics">
        <button
          type="button"
          class="review-metric review-metric--warning"
          @click="openFiscal('pending')"
        >
          <span class="review-metric-top"
            ><i class="pi pi-clock" /><i class="pi pi-arrow-up-right"
          /></span>
          <strong>{{ count(fiscal.pending) }}</strong
          ><span>Envíos pendientes</span>
        </button>
        <button
          type="button"
          class="review-metric"
          :class="{ 'review-metric--danger': fiscal.attention > 0 }"
          @click="openFiscal('attention')"
        >
          <span class="review-metric-top"
            ><i class="pi pi-exclamation-circle" /><i
              class="pi pi-arrow-up-right"
          /></span>
          <strong>{{ count(fiscal.attention) }}</strong
          ><span>Incidencias fiscales</span>
        </button>
        <button
          v-for="group in reviewGroups"
          :key="group.key"
          type="button"
          class="review-metric"
          :class="{ 'review-metric--selected': reviewGroup === group.key }"
          :aria-expanded="reviewGroup === group.key"
          aria-controls="review-details"
          @click="reviewGroup = reviewGroup === group.key ? '' : group.key"
        >
          <span class="review-metric-top"
            ><i :class="group.icon" /><i
              :class="
                reviewGroup === group.key
                  ? 'pi pi-chevron-up'
                  : 'pi pi-chevron-down'
              "
          /></span>
          <strong>{{ count(group.count) }}</strong
          ><span>{{ group.label }}</span>
        </button>
      </div>
      <div v-if="reviewGroup" id="review-details" class="review-details">
        <div class="review-detail-heading">
          <h4>{{ reviewGroups.find((g) => g.key === reviewGroup)?.label }}</h4>
          <Button
            label="Ocultar"
            icon="pi pi-times"
            text
            size="small"
            @click="reviewGroup = ''"
          />
        </div>
        <p
          v-if="reviewGroups.find((g) => g.key === reviewGroup)?.count === 0"
          class="review-note"
        >
          No hay registros en esta categoría para la zona seleccionada.
        </p>
        <div class="review-rows">
          <template v-if="reviewGroup === 'reconciliations'">
            <button
              v-for="item in reviewItems.reconciliations"
              :key="item.openingId"
              type="button"
              class="review-row"
              @click="
                historyZone = item.zoneId;
                history = true;
              "
            >
              <span
                ><strong>{{ item.registerName }}</strong
                ><small>Cierre Z-{{ item.openingId }}</small></span
              ><span class="review-row-value"
                >Registrar arqueo <i class="pi pi-angle-right"
              /></span>
            </button>
          </template>
          <template v-if="reviewGroup === 'differences'">
            <button
              v-for="item in reviewItems.differences"
              :key="item.openingId"
              type="button"
              class="review-row"
              @click="
                historyZone = item.zoneId;
                history = true;
              "
            >
              <span
                ><strong>{{ item.registerName }}</strong
                ><small>Cierre Z-{{ item.openingId }}</small></span
              ><span
                class="review-row-value"
                :class="{ 'review-negative': item.difference < 0 }"
                >{{ money(item.difference) }} <i class="pi pi-angle-right"
              /></span>
            </button>
          </template>
          <template v-if="reviewGroup === 'long'">
            <button
              v-for="item in reviewItems.long"
              :key="item.id"
              type="button"
              class="review-row"
              @click="detail = item"
            >
              <span
                ><strong>{{ item.name }}</strong
                ><small>Apertura #{{ item.openingId }}</small></span
              ><span class="review-row-value"
                >{{ openingAge(item.openedAt, now).text }}
                <i class="pi pi-angle-right"
              /></span>
            </button>
          </template>
          <template v-if="reviewGroup === 'silent'">
            <button
              v-for="item in reviewItems.silent"
              :key="item.id"
              type="button"
              class="review-row"
              @click="detail = item"
            >
              <span
                ><strong>{{ item.name }}</strong
                ><small>Última comunicación</small></span
              ><span class="review-row-value"
                >{{ timeAgo(item.lastSeen, now) }} <i class="pi pi-angle-right"
              /></span>
            </button>
          </template>
        </div>
        <p v-if="reviewGroup === 'differences'" class="review-note">
          Histórico de diferencias de caja. No implica que estén pendientes de
          resolver.
        </p>
        <p v-if="reviewGroup === 'silent'" class="review-note">
          La falta de comunicación reciente no confirma que el terminal esté
          desconectado.
        </p>
      </div>
    </section>
    <section class="insights" aria-label="Análisis en tiempo real">
      <article class="card">
        <header>
          <h3>Métodos de pago · turno</h3>
          <small>neto de devoluciones</small>
        </header>
        <div v-if="payTotal > 0" class="donut-wrap">
          <Chart type="doughnut" :data="payChart" :options="donutOptions" />
          <div class="donut-center">
            <strong>{{ money(payTotal) }}</strong
            ><span>cobrado</span>
          </div>
        </div>
        <p v-else class="empty">Sin cobros en los turnos abiertos.</p>
        <ul v-if="payTotal > 0" class="legend">
          <li>
            <i class="dot dot--cash" />Efectivo<strong>{{
              money(pay.cash)
            }}</strong
            ><span>{{ pct(pay.cash, payTotal) }}</span>
          </li>
          <li>
            <i class="dot dot--card" />Tarjeta<strong>{{
              money(pay.card)
            }}</strong
            ><span>{{ pct(pay.card, payTotal) }}</span>
          </li>
        </ul>
      </article>

      <article class="card">
        <header>
          <h3>Ritmo de ventas · hoy</h3>
          <small>tramos de 15 min · {{ chartTimeZoneLabel }}</small>
        </header>
        <div v-if="hourly.labels.length" class="chart-box">
          <Chart
            type="line"
            :data="zoneChart"
            :options="multiLineOptions"
            :plugins="[currentTimePlugin]"
          />
        </div>
        <p v-else class="empty">
          Aún no hay tickets cobrados en los turnos abiertos.
        </p>
      </article>

      <article class="card">
        <header>
          <h3>Ranking de empleados · turno</h3>
          <small>por ventas cobradas</small>
        </header>
        <ol v-if="ranking.length" class="ranking">
          <li v-for="(op, i) in ranking" :key="op.name">
            <span class="rank">{{ i + 1 }}</span>
            <div class="rank-bar">
              <div class="rank-head">
                <strong>{{ op.name }}</strong
                ><span
                  >{{ money(op.sales) }} · {{ count(op.tickets) }} tickets</span
                >
              </div>
              <div class="track">
                <i
                  :style="{ width: `${barWidth(op.sales, ranking[0].sales)}%` }"
                />
              </div>
            </div>
          </li>
        </ol>
        <p v-else class="empty">
          Sin ventas registradas en los turnos abiertos.
        </p>
      </article>

      <article class="card">
        <header>
          <h3>Estado fiscal VeriFactu</h3>
          <small
            >{{ analysisZoneLabel }} · todo el historial, también cajas
            cerradas</small
          >
        </header>
        <div v-if="data?.fiscalByZone" class="fiscal-grid">
          <button type="button" @click="openFiscal('ok')" class="fiscal ok">
            <strong>{{ count(fiscal.ok) }}</strong
            ><span>Aceptadas</span>
          </button>
          <button
            type="button"
            @click="openFiscal('pending')"
            class="fiscal waiting"
          >
            <strong>{{ count(fiscal.pending) }}</strong
            ><span>Pendientes</span>
          </button>
          <button
            type="button"
            @click="openFiscal('attention')"
            class="fiscal attention"
          >
            <strong>{{ count(fiscal.attention) }}</strong
            ><span>Requieren atención</span>
          </button>
        </div>
        <p v-else class="empty">
          Resumen fiscal no disponible. Actualiza el servidor y vuelve a
          consultar.
        </p>
        <p v-if="fiscalMsg" class="pulse-ok">{{ fiscalMsg }}</p>
      </article>

      <article class="card">
        <header>
          <h3>Pulso en vivo · últimos tickets</h3>
          <small v-if="pulseAt">actualizado {{ timeAgo(pulseAt, now) }}</small>
        </header>
        <p v-if="pulseLoading && !liveTickets.length" class="empty">
          Leyendo tickets de las cajas abiertas…
        </p>
        <ul v-else-if="liveTickets.length" class="feed">
          <li v-for="t in liveTickets" :key="`${t.openingId}-${t.chargeId}`">
            <span class="feed-time">{{ shortTime(t.chargedAt) }}</span>
            <div class="feed-main">
              <strong
                >{{ t.code || `Ticket ${t.chargeId}` }} ·
                {{ money(t.total) }}</strong
              >
              <small
                >{{ t.registerName }} ·
                {{ t.cashier || "Sin identificar" }}</small
              >
            </div>
            <Tag
              :value="fiscalLabel(t.verifactuStatus)"
              :severity="fiscalSeverity(t.verifactuStatus)"
            />
            <Button
              v-if="t.verifactuStatus === 'ERROR'"
              icon="pi pi-replay"
              text
              rounded
              size="small"
              aria-label="Reintentar envío fiscal"
              title="Reintentar envío fiscal"
              :loading="retryingId === t.chargeId"
              @click="retryFiscal(t)"
            />
          </li>
        </ul>
        <p v-else class="empty">Sin tickets recientes en las cajas abiertas.</p>
      </article>

      <article class="card">
        <header>
          <h3>Terminales activos</h3>
          <small>respondieron en los últimos {{ PRESENCE_WINDOW_S }} s</small>
        </header>
        <ul v-if="terminals.length" class="terminals">
          <li v-for="t in terminals" :key="`${t.registerId}-${t.name}`">
            <span
              class="term-dot"
              :class="{ 'term-dot--draft': truth(t.hasDraft) }"
            />
            <div class="feed-main">
              <strong>{{ t.name }}</strong>
              <small
                >{{ t.registerName }} · {{ timeAgo(t.lastSeen, now) }}</small
              >
            </div>
            <Tag v-if="truth(t.hasDraft)" value="Preparando" severity="warn" />
          </li>
        </ul>
        <p v-else class="empty">Ningún terminal con actividad reciente.</p>
        <p class="hint-sm">
          La actividad acredita respuesta del terminal, no presencia física.
        </p>
      </article>

      <article class="card span-3">
        <header>
          <h3>Actividad por zonas</h3>
          <small>hoy · 15 min · {{ chartTimeZoneLabel }}</small>
        </header>
        <div v-if="zoneHourly.labels.length" class="chart-box chart-box--tall">
          <Chart
            type="line"
            :data="zoneChart"
            :options="multiLineOptions"
            :plugins="[currentTimePlugin]"
          />
        </div>
        <p v-else class="empty">
          Sin actividad por zonas en los turnos abiertos.
        </p>
      </article>
    </section>

    <div class="central-tools">
      <input
        v-model="search"
        type="search"
        aria-label="Buscar zona o caja"
        placeholder="Buscar zona, caja o código…"
      /><Button
        label="Gestionar zonas"
        icon="pi pi-map"
        outlined
        @click="zones?.open()"
      /><span role="status">{{ updatedText }}</span>
    </div>
    <p v-if="loading && !data">Cargando supervisión…</p>
    <p v-else-if="!filteredZones.length">
      No hay zonas que coincidan con la búsqueda.
    </p>
    <section v-for="zone in filteredZones" :key="zone.id" class="zone">
      <header>
        <div class="zone-title">
          <span class="zone-icon"><i class="pi pi-shop" /></span>
          <div>
            <h2>{{ zone.name }}</h2>
            <small
              >{{ zone.code }} ·
              {{ truth(zone.active) ? "Activa" : "Inactiva" }}</small
            >
          </div>
        </div>
        <div class="actions">
          <Button
            label="Cierres y arqueos"
            icon="pi pi-history"
            text
            :disabled="!truth(zone.active)"
            @click="
              historyZone = zone.id;
              history = true;
            "
          /><Button
            label="Salas y mesas"
            icon="pi pi-th-large"
            outlined
            :disabled="!truth(zone.active)"
            @click="hallZone = zone.id"
          /><Button
            label="Nueva caja"
            icon="pi pi-plus"
            outlined
            :disabled="!truth(zone.active)"
            @click="
              newZone = zone;
              form = { code: '', name: '' };
              formError = '';
            "
          />
        </div>
      </header>
      <div class="register-grid">
        <article
          v-for="r in zoneRegisters(zone)"
          :key="r.id"
          class="register"
          :class="{
            'is-open': isOpen(r),
            'is-pending':
              !isOpen(r) && truth(r.active) && truth(r.pendingReconciliation),
          }"
        >
          <div class="register-heading">
            <h3>{{ r.name }}</h3>
            <span class="state" :class="stateClass(r)">{{
              stateLabel(r)
            }}</span>
          </div>
          <small
            >{{ r.code }}
            {{ r.openingId ? `· Apertura #${r.openingId}` : "" }}</small
          >
          <template v-if="isOpen(r)">
            <p class="opened-line">
              Abierta {{ ageText(r) }} · {{ r.openedBy || "Sin identificar" }}
              <Tag
                v-if="isLongOpening(r)"
                value="Apertura larga"
                severity="warn"
              />
            </p>
            <div class="expected">
              <span>Efectivo esperado</span
              ><strong>{{ money(r.expectedCash) }}</strong>
            </div>
            <dl>
              <div>
                <dt>Ventas de la apertura</dt>
                <dd>{{ money(r.sales) }}</dd>
              </div>
              <div>
                <dt>Devoluciones</dt>
                <dd>
                  {{ money(Number(r.cashRefunds) + Number(r.cardRefunds)) }}
                </dd>
              </div>
              <div>
                <dt>Tickets / abiertos</dt>
                <dd>{{ count(r.ticketCount) }} / {{ count(r.openTickets) }}</dd>
              </div>
            </dl>
            <p class="presence">
              <i class="pi pi-users" />
              {{
                r.sessions.length
                  ? [
                      ...new Set(r.sessions.map((s) => s.name || "Empleado")),
                    ].join(", ")
                  : "Sin actividad reciente"
              }}<small v-if="r.sessions.length"
                >Actividad reciente ·
                {{ count(r.sessions.length) }} terminal(es)</small
              >
            </p>
            <div class="actions">
              <Button label="Detalle" outlined @click="detail = r" /><Button
                label="Cerrar remotamente"
                icon="pi pi-lock"
                severity="danger"
                outlined
                :disabled="
                  Number(r.openTickets) > 0 ||
                  r.sessions.some((s) => truth(s.hasDraft))
                "
                @click="
                  remote = r;
                  reason = '';
                  actionError = '';
                "
              />
            </div>
            <small
              v-if="
                Number(r.openTickets) > 0 ||
                r.sessions.some((s) => truth(s.hasDraft))
              "
              >Resuelve los tickets abiertos o las ventas en preparación antes
              de cerrar.</small
            >
          </template>
          <template v-else
            ><p>
              {{
                r.closedAt
                  ? `Último cierre: ${date(r.closedAt)}`
                  : "Todavía no se ha abierto."
              }}
            </p>
            <Button
              label="Ver histórico"
              text
              :disabled="!truth(zone.active)"
              @click="
                historyZone = zone.id;
                history = true;
              "
          /></template>
        </article>
      </div>
      <p v-if="!zoneRegisters(zone).length">Sin cajas en esta zona.</p>
    </section>
    <TpvZonesDialog ref="zones" @saved="refresh" />
    <TpvClosureDialog
      :visible="history"
      :zone-id="historyZone"
      :report="remoteReport"
      @close="
        history = false;
        remoteReport = null;
        refresh();
      "
    />
    <Dialog
      v-model:visible="fiscalDialog"
      :header="fiscalTitle"
      modal
      :pt="headerPt"
      :style="{ width: '68rem', maxWidth: '96vw' }"
    >
      <p>
        {{ analysisZoneLabel }} · Incluye aperturas cerradas. Los aceptados con
        avisos requieren revisión.
      </p>
      <form
        class="actions"
        @submit.prevent="
          fiscalPage = 0;
          loadFiscal();
        "
      >
        <InputText
          v-model="fiscalSearch"
          placeholder="Ticket T-123 o número fiscal / factura"
          aria-label="Buscar ticket fiscal"
          maxlength="100"
        />
        <Button
          type="submit"
          label="Buscar"
          icon="pi pi-search"
          :loading="fiscalLoading"
        />
      </form>
      <Message v-if="fiscalError" severity="error" :closable="false">{{
        fiscalError
      }}</Message>
      <p v-if="fiscalLoading" role="status">Consultando tickets…</p>
      <p v-else-if="!fiscalRows.length && !fiscalError">
        No hay tickets para estos filtros.
      </p>
      <div v-else class="fiscal-list" :aria-busy="fiscalLoading">
        <article
          v-for="ticket in fiscalRows"
          :key="ticket.chargeId"
          class="fiscal-ticket"
        >
          <div class="actions">
            <strong>{{ ticket.code }} · {{ money(ticket.total) }}</strong
            ><Tag
              :value="fiscalLabel(ticket.verifactuStatus)"
              :severity="fiscalSeverity(ticket.verifactuStatus)"
            />
          </div>
          <p>
            {{
              ticket.fiscalCode
                ? `Factura simplificada: ${ticket.fiscalCode}`
                : "Sin número fiscal"
            }}<span v-if="ticket.invoiceCode">
              · Factura asociada: {{ ticket.invoiceCode }}</span
            >
          </p>
          <p>
            {{ ticket.zoneName }} · {{ ticket.registerName }} ·
            {{ ticket.cashier || "Sin identificar" }} ·
            {{ truth(ticket.closed) ? "Caja cerrada" : "Caja abierta" }}
          </p>
          <small
            >{{ fiscalDate(ticket.chargedAtEpoch) }} · Cobrado
            {{ fiscalAge(ticket.chargedAtEpoch) }} ·
            {{ count(ticket.attempts) }} intentos</small
          >
          <p v-if="ticket.fiscalError" class="fiscal-reason">
            {{ ticket.fiscalError }}
          </p>
          <p v-if="ticket.nextAttemptEpoch">
            Próximo intento previsto: {{ fiscalDate(ticket.nextAttemptEpoch) }}
          </p>
          <p
            v-if="
              ticket.verifactuStatus === 'NEEDS_CORRECTION' ||
              ticket.verifactuStatus === 'REJECTED'
            "
          >
            Revisa el motivo y los datos fiscales antes de solicitar un nuevo
            envío. La factura asociada y el ticket fiscal son documentos
            distintos.
          </p>
          <p v-if="!ticket.verifactuStatus">
            No consta un envío fiscal. Revisa este ticket; puede proceder del
            flujo anterior a los tickets fiscales.
          </p>
          <div class="actions">
            <Button
              v-if="ticket.verifactuStatus === 'ERROR'"
              label="Reintentar envío"
              icon="pi pi-replay"
              outlined
              :loading="retryingId === ticket.chargeId"
              :disabled="retryingId !== null"
              @click="retryFiscal(ticket)"
            />
            <Button
              v-if="ticket.invoiceId"
              label="Abrir factura asociada"
              icon="pi pi-file"
              outlined
              @click="
                router.push({
                  name: 'Facturas',
                  query: { invoiceId: ticket.invoiceId },
                })
              "
            />
          </div>
        </article>
      </div>
      <template #footer
        ><div class="footer">
          <div class="kiwik-separator" />
          <span
            >{{ count(fiscalTotal) }} tickets · Página
            {{ fiscalPage + 1 }}</span
          >
          <Button
            label="Anterior"
            text
            :disabled="fiscalPage === 0 || fiscalLoading"
            @click="
              fiscalPage--;
              loadFiscal();
            "
          />
          <Button
            label="Siguiente"
            text
            :disabled="(fiscalPage + 1) * 50 >= fiscalTotal || fiscalLoading"
            @click="
              fiscalPage++;
              loadFiscal();
            "
          />
          <Button label="Cerrar" outlined @click="fiscalDialog = false" /></div
      ></template>
    </Dialog>

    <Dialog
      :visible="hallZone !== null"
      header="Gestión de salas y mesas"
      modal
      class="kiwik-dialog"
      :pt="headerPt"
      :style="{ width: 'min(1200px,96vw)' }"
      @update:visible="hallZone = null"
      ><TpvHalls
        v-if="hallZone !== null"
        :key="hallZone"
        :zone-id="hallZone"
        :disabled="true"
    /></Dialog>
    <Dialog
      :visible="!!detail"
      header="Detalle de caja"
      modal
      class="kiwik-dialog"
      :pt="headerPt"
      :style="{ width: 'min(680px,96vw)' }"
      @update:visible="detail = null"
    >
      <template v-if="detail"
        ><h3>{{ detail.name }} · Apertura #{{ detail.openingId }}</h3>
        <p>Datos de la última actualización del panel.</p>
        <dl>
          <div v-for="(label, key) in detailLabels" :key="key">
            <dt>{{ label }}</dt>
            <dd>{{ money(detail[key]) }}</dd>
          </div>
        </dl>
        <h4>Movimientos por empleado</h4>
        <p v-if="!detail.operators.length">Sin movimientos registrados.</p>
        <p v-for="(op, i) in detail.operators" :key="i">
          {{ op.name || "Sin identificar" }} ·
          {{
            op.tickets
              ? `${count(op.tickets)} tickets · ${money(op.sales)}`
              : `${count(op.refunds)} devoluciones · ${money(op.refundAmount)}`
          }}
        </p>
        <h4>Terminales con actividad reciente</h4>
        <p v-for="(s, i) in detail.sessions" :key="i">
          {{ s.name }} · {{ date(s.lastSeen) }}
          {{ truth(s.hasDraft) ? "· Venta en preparación" : "" }}
        </p></template
      >
      <template #footer
        ><div class="footer">
          <div class="kiwik-separator" />
          <Button label="Cerrar" text @click="detail = null" /></div
      ></template>
    </Dialog>
    <Dialog
      :visible="!!remote"
      header="Cerrar caja desde central"
      modal
      class="kiwik-dialog"
      :pt="headerPt"
      :style="{ width: 'min(540px,96vw)' }"
      :closable="!acting"
      :close-on-escape="!acting"
      @update:visible="remote = null"
    >
      <p>
        <strong>{{ remote?.name }} · Apertura #{{ remote?.openingId }}</strong>
      </p>
      <p>
        Termina el turno para todos sus terminales. Quedará
        <strong>pendiente de arqueo</strong> hasta registrar el recuento físico.
        Las ventas preparadas en terminales sin conexión no pueden verificarse
        desde central.
      </p>
      <label for="remote-reason">Motivo obligatorio</label
      ><InputText
        id="remote-reason"
        v-model="reason"
        maxlength="500"
        :disabled="acting"
        class="full"
      /><Message v-if="actionError" severity="error" :closable="false">{{
        actionError
      }}</Message>
      <template #footer
        ><div class="footer">
          <div class="kiwik-separator" />
          <Button
            label="Cancelar"
            text
            :disabled="acting"
            @click="remote = null"
          /><Button
            label="Confirmar cierre remoto"
            severity="danger"
            :loading="acting"
            :disabled="!reason.trim() || acting"
            @click="closeRemote"
          /></div
      ></template>
    </Dialog>
    <Dialog
      :visible="!!newZone"
      header="Nueva caja"
      modal
      class="kiwik-dialog"
      :pt="headerPt"
      :style="{ width: 'min(500px,96vw)' }"
      :closable="!acting"
      @update:visible="newZone = null"
    >
      <p>Zona: {{ newZone?.name }}</p>
      <label for="central-code">Código</label
      ><InputText
        id="central-code"
        v-model="form.code"
        maxlength="20"
        class="full"
      /><label for="central-name">Nombre</label
      ><InputText
        id="central-name"
        v-model="form.name"
        maxlength="100"
        class="full"
      /><Message v-if="formError" severity="error" :closable="false">{{
        formError
      }}</Message>
      <template #footer
        ><div class="footer">
          <div class="kiwik-separator" />
          <Button
            label="Cancelar"
            text
            :disabled="acting"
            @click="newZone = null"
          /><Button
            label="Crear caja"
            :loading="acting"
            :disabled="acting || !form.code.trim() || !form.name.trim()"
            @click="createRegister"
          /></div
      ></template>
    </Dialog>
  </main>
</template>
<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Button from "primevue/button";
import Chart from "primevue/chart";
import type { Plugin, TooltipItem } from "chart.js";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Tag from "primevue/tag";
import Select from "primevue/select";
import { onReconnected } from "../../services/composables/Sv_MonitorConnectionBack";
import { useAuthStore } from "../../stores/authStore";
import { backendUrl } from "../../services/backendUrl";
import TpvZonesDialog from "./TpvZonesDialog.vue";
import TpvHalls from "./TpvHalls.vue";
import TpvClosureDialog from "./TpvClosureDialog.vue";
import type { TpvClosure } from "./tpvClosure";
import type { TpvCharge } from "./tpvReceipt";
import {
  LONG_OPENING_HOURS,
  PRESENCE_WINDOW_S,
  buildAlerts,
  dailySales,
  currentTimeZone,
  timeZoneLabel,
  isOpenRegister,
  openingAge,
  paymentSplit,
  rankOperators,
  shiftTotals,
  timeAgo,
  truth,
} from "./tpvSupervision";
interface Zone {
  id: number;
  code: string;
  name: string;
  active: boolean | number;
}
interface Register {
  id: number;
  zoneId: number;
  name: string;
  code: string;
  active: boolean | number;
  openingId: number | null;
  lastSeen?: string;
  openedAt?: string;
  closedAt?: string;
  openedBy?: string;
  pendingReconciliation: boolean | number;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  cashRefunds: number;
  cardRefunds: number;
  expectedCash?: number;
  sales: number;
  ticketCount: number;
  openTickets: number;
  sessions: Array<{
    name: string;
    lastSeen: string;
    hasDraft: boolean | number;
  }>;
  operators: Array<{
    name: string;
    tickets?: number;
    sales?: number;
    refunds?: number;
    refundAmount?: number;
  }>;
}
interface FiscalRow {
  chargeId: number;
  code: string;
  openingId: number;
  total: number;
  chargedAtEpoch: number;
  fiscalCode?: string;
  invoiceCode?: string;
  invoiceId?: number;
  zoneName: string;
  registerName: string;
  cashier: string;
  closed: boolean | number;
  verifactuStatus: string;
  fiscalError?: string;
  attempts?: number;
  nextAttemptEpoch?: number;
}
interface Overview {
  fiscalByZone?: Array<{
    zoneId: number;
    fiscalGroup: "ok" | "pending" | "attention";
    amount: number;
  }>;
  cashDifferences?: Array<{
    openingId: number;
    zoneId: number;
    registerName: string;
    difference: number;
  }>;
  pendingReconciliations: Array<{
    openingId: number;
    zoneId: number;
    registerName: string;
  }>;
  updatedAt: string;
  zones: Zone[];
  registers: Register[];
  todaySales: number;
  todayRefunds: number;
}
interface PulseTicket extends TpvCharge {
  zoneId: number;
  openingId: number;
  registerName: string;
  zoneName: string;
}
// Sin emits: la central es solo supervisión; el admin no opera cajas.
const auth = useAuthStore(),
  router = useRouter();
const data = ref<Overview | null>(null),
  loading = ref(false),
  error = ref(""),
  search = ref(""),
  now = ref(Date.now());
const pulseTickets = ref<PulseTicket[]>([]),
  pulseLoading = ref(false),
  pulseError = ref(""),
  pulseAt = ref(""),
  fiscalMsg = ref(""),
  retryingId = ref<number | null>(null);
const zones = ref<InstanceType<typeof TpvZonesDialog> | null>(null),
  history = ref(false),
  historyZone = ref<number | null>(null),
  remoteReport = ref<TpvClosure | null>(null),
  hallZone = ref<number | null>(null);
const detail = ref<Register | null>(null),
  remote = ref<Register | null>(null),
  reason = ref(""),
  acting = ref(false),
  actionError = ref("");
const newZone = ref<Zone | null>(null),
  form = ref({ code: "", name: "" }),
  formError = ref("");
const headerPt = { header: { class: "kiwik-dialog-header" } };
const detailLabels = {
  openingFloat: "Fondo inicial",
  cashSales: "Ventas efectivo (menos cambio)",
  cardSales: "Ventas tarjeta",
  cashRefunds: "Devoluciones efectivo",
  cardRefunds: "Devoluciones tarjeta",
  expectedCash: "Efectivo esperado",
};
// Group from four digits while preserving the corporate 1.234,56 format.
const count = (value: unknown) =>
  new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(
    Number(value) || 0,
  );
const money = (value: unknown) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    Number(value) || 0,
  );
const date = (value?: string) =>
  value ? new Date(value).toLocaleString("es-ES") : "";
const shortTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
const pct = (part: number, total: number) =>
  total > 0 ? `${Math.round((part / total) * 100)} %` : "—";
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const matches = (s: string) =>
  normalize(s).includes(normalize(search.value.trim()));
const isOpen = (r: Register) => isOpenRegister(r);
const openRegisters = computed(() =>
  (data.value?.registers ?? []).filter(isOpenRegister),
);
const shift = computed(() => shiftTotals(data.value?.registers ?? []));
// Apply the same zone ID to registers and tickets; names may repeat across zones.
const analysisZoneId = ref<number | null>(null);
const analysisZoneOptions = computed(() => [
  { label: "Todas las zonas · resumen conjunto", value: -1 },
  ...(data.value?.zones ?? []).map((zone) => ({
    label: `${zone.name} · ${zone.code}`,
    value: Number(zone.id),
  })),
]);
const effectiveAnalysisZoneId = computed(
  () =>
    analysisZoneId.value ??
    (data.value?.zones[0] ? Number(data.value.zones[0].id) : -1),
);
watch(
  effectiveAnalysisZoneId,
  (id) => {
    if (analysisZoneId.value === null && id !== -1) analysisZoneId.value = id;
  },
  { immediate: true },
);
const analysisZoneLabel = computed(() =>
  effectiveAnalysisZoneId.value === -1
    ? "Todas las zonas · resumen conjunto"
    : (data.value?.zones.find(
        (z) => Number(z.id) === effectiveAnalysisZoneId.value,
      )?.name ?? "Zona no disponible"),
);
const analysisRegisters = computed(() =>
  (data.value?.registers ?? []).filter(
    (r) =>
      effectiveAnalysisZoneId.value === -1 ||
      Number(r.zoneId) === effectiveAnalysisZoneId.value,
  ),
);
const analysisTickets = computed(() =>
  pulseTickets.value.filter(
    (t) =>
      effectiveAnalysisZoneId.value === -1 ||
      Number(t.zoneId) === effectiveAnalysisZoneId.value,
  ),
);
const pay = computed(() => paymentSplit(analysisRegisters.value));
const payTotal = computed(() => pay.value.cash + pay.value.card);
const payChart = computed(() => ({
  labels: ["Efectivo", "Tarjeta"],
  datasets: [
    {
      data: [pay.value.cash, pay.value.card],
      backgroundColor: ["#648506", "#2875b6"],
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
}));
const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: { legend: { display: false } },
};
const chartTimeZone = currentTimeZone();
const chartTimeZoneLabel = computed(() =>
  timeZoneLabel(chartTimeZone, new Date(now.value)),
);
const hourly = computed(() =>
  dailySales(analysisTickets.value, now.value, chartTimeZone),
);
// The x-axis represents time, so a vertical red marker locates the current hour precisely.
const currentTimePlugin: Plugin<"line"> = {
  id: "tpv-current-time",
  afterDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea || !scales.x) return;
    const x = scales.x.getPixelForValue(hourly.value.currentIndex);
    if (x < chartArea.left || x > chartArea.right) return;
    ctx.save();
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = x > chartArea.right - 85 ? "right" : "left";
    ctx.fillText(
      `Ahora ${hourly.value.currentLabel}`,
      x + (ctx.textAlign === "right" ? -5 : 5),
      chartArea.top + 12,
    );
    ctx.restore();
  },
};
const ranking = computed(() => rankOperators(analysisRegisters.value, 6));
const zoneHourly = hourly;
const zoneChart = computed(() => ({
  labels: zoneHourly.value.labels,
  datasets: zoneHourly.value.datasets.map((d) => ({
    label: d.label,
    data: d.data,
    fill: false,
    tension: 0.35,
    borderWidth: 2,
    pointRadius: 3,
    borderColor: d.backgroundColor,
    pointBackgroundColor: d.backgroundColor,
  })),
}));
const zoneTooltip = {
  callbacks: {
    title: (items: TooltipItem<"line">[]) => {
      const label = items[0]?.label;
      if (!label) return "";
      const [h, m] = label.split(":").map(Number);
      const end = h * 60 + m + 15;
      return `Tramo ${label}–${String(Math.floor(end / 60) % 24).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
    },
    label: (item: TooltipItem<"line">) =>
      `${item.dataset.label}: ${money(item.parsed.y)} en este tramo`,
    afterLabel: (item: TooltipItem<"line">) => {
      const values = zoneHourly.value.datasets[item.datasetIndex]?.data ?? [];
      const total =
        values.reduce((sum, value) => sum + Math.round(value * 100), 0) / 100;
      return `Total de hoy en cajas abiertas: ${money(total)}`;
    },
  },
};
const multiLineOptions = {
  interaction: { mode: "index" as const, intersect: false },
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "top", labels: { boxWidth: 11, usePointStyle: true } },
    tooltip: zoneTooltip,
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxTicksLimit: 12, maxRotation: 0 },
    },
    y: {
      beginAtZero: true,
      ticks: {
        maxTicksLimit: 5,
        callback: (value: number) =>
          new Intl.NumberFormat("de-DE", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(value),
      },
    },
  },
};
const barWidth = (value: number, max: number) =>
  max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0;
const fiscal = computed(() => {
  const result = { ok: 0, pending: 0, attention: 0, total: 0 };
  for (const row of data.value?.fiscalByZone ?? []) {
    if (
      effectiveAnalysisZoneId.value !== -1 &&
      Number(row.zoneId) !== effectiveAnalysisZoneId.value
    )
      continue;
    result[row.fiscalGroup] += Number(row.amount);
    result.total += Number(row.amount);
  }
  return result;
});
const fiscalDialog = ref(false),
  fiscalLoading = ref(false),
  fiscalError = ref("");
const fiscalFilter = ref<"ok" | "pending" | "attention">("attention");
const fiscalRows = ref<FiscalRow[]>([]),
  fiscalTotal = ref(0),
  fiscalPage = ref(0),
  fiscalSearch = ref("");
let fiscalRequest = 0;
const fiscalTitle = computed(
  () =>
    ({
      ok: "Tickets aceptados",
      pending: "Tickets pendientes",
      attention: "Tickets que requieren atención",
    })[fiscalFilter.value],
);
async function loadFiscal() {
  const request = ++fiscalRequest;
  fiscalLoading.value = true;
  fiscalError.value = "";
  try {
    const response = await axios.get(backendUrl("/WebTpv/central/fiscal"), {
      ...auth.portalRequestConfig(),
      timeout: 15000,
      params: {
        group: fiscalFilter.value,
        page: fiscalPage.value,
        search: fiscalSearch.value,
        zoneId:
          effectiveAnalysisZoneId.value === -1
            ? undefined
            : effectiveAnalysisZoneId.value,
      },
    });
    if (request !== fiscalRequest || !alive) return;
    fiscalRows.value = response.data.items;
    fiscalTotal.value = Number(response.data.total);
  } catch (e) {
    if (request === fiscalRequest) {
      fiscalRows.value = [];
      fiscalError.value = message(e);
    }
  } finally {
    if (request === fiscalRequest) fiscalLoading.value = false;
  }
}
function openFiscal(group: "ok" | "pending" | "attention") {
  fiscalFilter.value = group;
  fiscalPage.value = 0;
  fiscalSearch.value = "";
  fiscalRows.value = [];
  fiscalTotal.value = 0;
  fiscalDialog.value = true;
  void loadFiscal();
}
watch(effectiveAnalysisZoneId, () => {
  if (fiscalDialog.value) {
    fiscalPage.value = 0;
    void loadFiscal();
  }
});
watch(fiscalDialog, (visible) => {
  if (!visible) {
    fiscalRequest++;
    fiscalLoading.value = false;
  }
});
const fiscalDate = (epoch?: number) =>
  epoch ? new Date(Number(epoch)).toLocaleString("es-ES") : "—";
const fiscalAge = (epoch: number) =>
  timeAgo(new Date(Number(epoch)).toISOString(), now.value);
const reviewItems = computed(() => ({
  reconciliations: (data.value?.pendingReconciliations ?? []).filter(
    (r) =>
      effectiveAnalysisZoneId.value === -1 ||
      Number(r.zoneId) === effectiveAnalysisZoneId.value,
  ),
  differences: (data.value?.cashDifferences ?? []).filter(
    (r) =>
      effectiveAnalysisZoneId.value === -1 ||
      Number(r.zoneId) === effectiveAnalysisZoneId.value,
  ),
  long: analysisRegisters.value.filter(
    (r) =>
      isOpen(r) &&
      openingAge(r.openedAt, now.value).hours >= LONG_OPENING_HOURS,
  ),
  silent: analysisRegisters.value.filter(
    (r) => isOpen(r) && !r.sessions.length,
  ),
}));
const reviewGroup = ref("");
const reviewGroups = computed(() => [
  {
    key: "reconciliations",
    label: "Arqueos pendientes",
    icon: "pi pi-wallet",
    count: reviewItems.value.reconciliations.length,
  },
  {
    key: "differences",
    label: "Cierres con diferencias",
    icon: "pi pi-chart-bar",
    count: reviewItems.value.differences.length,
  },
  {
    key: "long",
    label: "Aperturas largas",
    icon: "pi pi-stopwatch",
    count: reviewItems.value.long.length,
  },
  {
    key: "silent",
    label: "Sin comunicación reciente",
    icon: "pi pi-wifi",
    count: reviewItems.value.silent.length,
  },
]);
const liveTickets = computed(() =>
  [...analysisTickets.value]
    .sort((a, b) =>
      String(b.chargedAt ?? "").localeCompare(String(a.chargedAt ?? "")),
    )
    .slice(0, 8),
);
const terminals = computed(() =>
  openRegisters.value.flatMap((r) =>
    (r.sessions ?? []).map((s) => ({
      name: s.name || "Terminal",
      lastSeen: s.lastSeen,
      hasDraft: s.hasDraft,
      registerId: r.id,
      registerName: r.name,
    })),
  ),
);
const alertList = computed(() =>
  buildAlerts(
    data.value?.registers ?? [],
    (data.value?.fiscalByZone ?? [])
      .filter((r) => r.fiscalGroup === "attention")
      .reduce((sum, r) => sum + Number(r.amount), 0),
    now.value,
  ),
);
const zoneRegisters = (z: Zone) =>
  (data.value?.registers ?? []).filter(
    (r) =>
      r.zoneId === z.id &&
      (matches(z.name + " " + z.code) || matches(r.name + " " + r.code)),
  );
const filteredZones = computed(() =>
  (data.value?.zones ?? []).filter(
    (z) => matches(z.name + " " + z.code) || zoneRegisters(z).length,
  ),
);
const openCount = computed(
  () => (data.value?.registers ?? []).filter(isOpen).length,
);
const expected = computed(() =>
  (data.value?.registers ?? [])
    .filter(isOpen)
    .reduce((sum, r) => sum + Number(r.expectedCash || 0), 0),
);
const updatedText = computed(() =>
  data.value
    ? `Datos de ${date(data.value.updatedAt)}`
    : "Sin datos actualizados",
);
const stateLabel = (r: Register) =>
  !truth(r.active)
    ? "Inactiva"
    : isOpen(r)
      ? "Abierta"
      : truth(r.pendingReconciliation)
        ? "Pendiente de arqueo"
        : "Cerrada";
const stateClass = (r: Register) =>
  !truth(r.active)
    ? "state--inactive"
    : isOpen(r)
      ? "state--open"
      : truth(r.pendingReconciliation)
        ? "state--pending"
        : "state--closed";
const ageText = (r: Register) =>
  `hace ${openingAge(r.openedAt, now.value).text}`;
const isLongOpening = (r: Register) =>
  openingAge(r.openedAt, now.value).hours >= LONG_OPENING_HOURS;
const FISCAL_LABELS: Record<string, string> = {
  ACCEPTED: "Aceptada",
  ACCEPTED_WITH_ERRORS: "Aceptada con errores",
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  NEEDS_CORRECTION: "Requiere corrección",
  REJECTED: "Rechazada",
  ERROR: "Error",
};
const fiscalLabel = (status?: string | null) =>
  FISCAL_LABELS[(status ?? "").toUpperCase()] ?? (status || "No enviada");
const fiscalSeverity = (status?: string | null) => {
  switch ((status ?? "").toUpperCase()) {
    case "ACCEPTED":
      return "success";
    case "ACCEPTED_WITH_ERRORS":
      return "warn";
    case "PENDING":
    case "PROCESSING":
      return "info";
    case "":
      return "secondary";
    default:
      return "danger";
  }
};
let alive = true,
  timer: number | undefined,
  clockTimer: number | undefined;
function message(e: unknown) {
  if (axios.isAxiosError(e)) {
    if (e.response?.status === 401)
      return "La sesión del servidor ha caducado. Vuelve a iniciar sesión.";
    if (!e.response || [502, 503, 504].includes(e.response.status))
      return "Servidor no disponible. Esperando a recuperar la conexión. Si estabas realizando una operación, comprueba su estado antes de repetirla.";
  }
  if (auth.sessionExpired)
    return "La sesión del servidor ha caducado. Vuelve a iniciar sesión.";
  return axios.isAxiosError(e) &&
    typeof e.response?.data === "string" &&
    !e.response.data.includes("<")
    ? e.response.data
    : "No se pudo completar la operación. Actualiza y revisa el estado antes de repetir.";
}
async function refresh() {
  if (loading.value || !alive || auth.sessionExpired) return;
  loading.value = true;
  try {
    const response = await axios.get<Overview>(backendUrl("/WebTpv/central"), {
      ...auth.portalRequestConfig(),
      timeout: 12000,
    });
    if (alive) {
      data.value = response.data;
      error.value = "";
    }
  } catch (e) {
    if (alive) error.value = message(e);
  } finally {
    loading.value = false;
  }
}
/** Recarga completa del panel: central + pulso de tickets. */
async function refreshAll() {
  await refresh();
  if (!alive || error.value || auth.sessionExpired) return;
  await refreshPulse();
  if (fiscalDialog.value && !fiscalLoading.value) await loadFiscal();
}
/** Pulso: tickets cobrados de las aperturas en curso (vivo + fiscal). */
async function refreshPulse() {
  if (!alive || pulseLoading.value || auth.sessionExpired) return;
  const open = (data.value?.registers ?? []).filter(isOpenRegister);
  if (!open.length) {
    pulseTickets.value = [];
    pulseAt.value = "";
    pulseError.value = "";
    return;
  }
  pulseLoading.value = true;
  try {
    const zoneById = new Map(
      (data.value?.zones ?? []).map((z) => [z.id, z.name]),
    );
    const settled = await Promise.allSettled(
      open.map((r) =>
        axios.get<TpvCharge[]>(
          backendUrl(`/WebTpv/openings/${r.openingId}/charges`),
          {
            ...auth.portalRequestConfig(),
            timeout: 20000,
          },
        ),
      ),
    );
    if (!alive) return;
    const tickets: PulseTicket[] = [];
    settled.forEach((s, i) => {
      if (s.status !== "fulfilled" || !Array.isArray(s.value.data)) return;
      const r = open[i];
      for (const c of s.value.data) {
        tickets.push({
          ...c,
          openingId: Number(r.openingId),
          registerName: r.name,
          zoneId: Number(r.zoneId),
          zoneName: zoneById.get(r.zoneId) ?? "",
        });
      }
    });
    pulseTickets.value = tickets;
    pulseAt.value = new Date().toISOString();
    const missing = settled.filter(
      (s) => s.status === "rejected" || !Array.isArray(s.value.data),
    ).length;
    pulseError.value = missing
      ? `Datos incompletos: no se pudieron consultar ${missing} de ${open.length} cajas. Las gráficas solo incluyen las cajas recuperadas.`
      : "";
  } catch {
    if (alive) pulseError.value = "No se pudo leer el pulso de tickets.";
  } finally {
    pulseLoading.value = false;
  }
}
async function retryFiscal(ticket: { chargeId?: number; code?: string }) {
  if (!ticket.chargeId || retryingId.value !== null) return;
  retryingId.value = ticket.chargeId;
  fiscalMsg.value = "";
  try {
    await axios.post(
      backendUrl(`/WebTpv/charges/${ticket.chargeId}/verifactu-retry`),
      {},
      { ...auth.portalRequestConfig(), timeout: 20000 },
    );
    fiscalMsg.value = `Reenvío fiscal solicitado para ${ticket.code || `ticket ${ticket.chargeId}`}.`;
    await refresh();
    if (fiscalDialog.value) await loadFiscal();
    await refreshPulse();
  } catch (e) {
    fiscalMsg.value = "";
    pulseError.value = message(e);
    fiscalError.value = message(e);
  } finally {
    retryingId.value = null;
  }
}
async function closeRemote() {
  if (!remote.value || acting.value || !reason.value.trim()) return;
  acting.value = true;
  actionError.value = "";
  try {
    const response = await axios.post<TpvClosure>(
      backendUrl(`/WebTpv/openings/${remote.value.openingId}/remote-close`),
      { reason: reason.value },
      { ...auth.portalRequestConfig(), timeout: 20000 },
    );
    historyZone.value = remote.value.zoneId;
    remoteReport.value = response.data;
    history.value = true;
    remote.value = null;
    await refresh();
    await refreshPulse();
  } catch (e) {
    actionError.value = message(e);
  } finally {
    acting.value = false;
  }
}
async function createRegister() {
  if (!newZone.value || acting.value) return;
  acting.value = true;
  formError.value = "";
  try {
    await axios.post(
      backendUrl("/WebTpv/registers"),
      {
        zoneId: newZone.value.id,
        code: form.value.code.trim(),
        name: form.value.name.trim(),
      },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    newZone.value = null;
    await refresh();
  } catch (e) {
    formError.value = message(e);
  } finally {
    acting.value = false;
  }
}
watch(onReconnected, () => {
  if (!auth.sessionExpired) void refreshAll();
});
onMounted(() => {
  void refreshAll();
  timer = window.setInterval(() => {
    if (!document.hidden) void refreshAll();
  }, 30000);
  clockTimer = window.setInterval(() => {
    now.value = Date.now();
  }, 30000);
});
onBeforeUnmount(() => {
  alive = false;
  window.clearInterval(timer);
  window.clearInterval(clockTimer);
});
</script>
<style scoped>
.review-summary {
  margin-bottom: 1rem;
  padding: 22px;
}
.review-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.review-heading h3 {
  margin: 0 0 6px;
  font-size: 17px;
}
.review-heading p,
.review-hint {
  margin: 0;
  color: #6a755f;
  font-size: 13px;
}
.review-hint {
  display: flex;
  align-items: center;
  gap: 7px;
}
.review-metrics {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}
.review-metric {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  text-align: left;
  border: 1px solid #e2e8d9;
  background: #f8faf5;
  border-radius: 12px;
  padding: 16px;
  color: #394728;
  font: inherit;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}
.review-metric-top {
  display: flex;
  justify-content: space-between;
  color: #7d8a6c;
}
.review-metric-top i:last-child {
  font-size: 12px;
  opacity: 0.7;
}
.review-metric strong {
  font-size: 28px;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}
.review-metric > span:last-child {
  font-size: 13px;
  line-height: 1.4;
}
.review-metric--warning {
  background: #fff9ed;
  border-color: #f0dfb9;
  color: #92630c;
}
.review-metric--danger {
  background: #fff2f1;
  border-color: #f4d2cf;
  color: #b04444;
}
.review-metric:hover,
.review-metric--selected {
  background: #f0f6df;
  border-color: #9cc10a;
}
.review-metric:focus-visible,
.review-row:focus-visible {
  outline: 2px solid #9cc10a;
  outline-offset: 3px;
}
.review-details {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5eadf;
}
.review-detail-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.review-detail-heading h4 {
  margin: 0;
  font-size: 14px;
}
.review-rows {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
  max-height: 310px;
  overflow: auto;
  padding: 3px;
}
.review-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border: 1px solid #e6ebdf;
  background: white;
  border-radius: 9px;
  padding: 12px 14px;
  text-align: left;
  font: inherit;
  color: #394728;
  cursor: pointer;
}
.review-row:hover {
  background: #f8faf3;
  border-color: #c6d3b2;
}
.review-row strong {
  display: block;
  font-size: 13px;
}
.review-row small {
  display: block;
  margin-top: 5px;
  color: #78836c;
  font-size: 12px;
}
.review-row-value {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.review-negative {
  color: #b04444;
}
.review-note {
  color: #78836c;
  font-size: 12px;
  margin: 14px 0 0;
}
@media (max-width: 1200px) {
  .review-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .review-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .review-rows {
    grid-template-columns: 1fr;
  }
  .review-summary {
    padding: 16px;
  }
}
.fiscal-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
  max-height: 55vh;
  overflow: auto;
}
.fiscal-ticket {
  border: 1px solid #d9e2cd;
  border-radius: 10px;
  padding: 1rem;
}
.fiscal-ticket p {
  margin: 0.5rem 0;
}
.fiscal-reason {
  color: #b42318;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
button.fiscal {
  border: 0;
  cursor: pointer;
  font: inherit;
}
button.fiscal:hover {
  filter: brightness(0.96);
}
button.fiscal:focus-visible {
  outline: 2px solid #648506;
  outline-offset: 3px;
}

.analysis-scope {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0 0.5rem;
}
.analysis-scope label {
  font-weight: 600;
}
.analysis-zone-select {
  width: 22rem;
  max-width: 100%;
}
.analysis-scope strong {
  color: #648506;
}

.central {
  height: 100dvh;
  overflow: auto;
  background: #f3f5ef;
  padding: 24px;
  color: #253000;
  box-sizing: border-box;
}
.central-header,
.zone > header,
.central-tools,
.actions,
.register-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.central-header {
  margin-bottom: 20px;
}
.title-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.central-header h1 {
  margin: 5px 0;
  font-size: 30px;
}
.central-header small {
  font-weight: 800;
  color: #6b8500;
  letter-spacing: 1px;
}
.central-header p,
.hint-sm {
  color: #65715d;
}
.hint-sm {
  font-size: 12px;
  margin: 10px 0 0;
}
.live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4c6b00;
  background: #e4efc8;
  border: 1px solid #cfe0a8;
  padding: 3px 10px;
  border-radius: 999px;
}
.live i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #648506;
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.8);
  }
}
.updated {
  color: #65715d;
  font-size: 12px;
}
/* KPIs */
.kpis {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin: 20px 0;
}
.kpi {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px;
  border: 1px solid #dfe5d5;
  border-radius: 14px;
}
.kpi > div {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.kpi span {
  font-size: 12px;
  color: #66725c;
}
.kpi strong {
  font-size: 22px;
  letter-spacing: -0.5px;
}
.kpi small {
  font-size: 11px;
  color: #8a937f;
}
.kpi-icon {
  flex: 0 0 auto;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 12px;
  font-size: 19px;
}
.kpi--sales {
  background: #eef4d8;
  color: #648506;
}
.kpi--ticket {
  background: #e9f4fc;
  color: #2875b6;
}
.kpi--open {
  background: #e4efc8;
  color: #4c6b00;
}
.kpi--cash {
  background: #fdf1e2;
  color: #b25e09;
}
.kpi--pending {
  background: #f2edfc;
  color: #7c5cbf;
}
.kpi--refund {
  background: #fdeeee;
  color: #b04444;
}
/* Alertas */
.alerts {
  display: grid;
  gap: 10px;
  margin: 0 0 14px;
}
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 16px;
  border-radius: 12px;
  border: 1px solid;
  background: white;
}
.alert i {
  font-size: 20px;
  margin-top: 2px;
}
.alert strong {
  display: block;
  font-size: 14px;
}
.alert p {
  margin: 3px 0 0;
  font-size: 13px;
  color: #4c5544;
}
.alert--error {
  border-color: #f0c9c9;
  background: #fef6f6;
}
.alert--error i,
.alert--error strong {
  color: #b04444;
}
.alert--warn {
  border-color: #f0dfb8;
  background: #fffaf0;
}
.alert--warn i,
.alert--warn strong {
  color: #a86e00;
}
.alert--info {
  border-color: #c3d9f2;
  background: #f4f9ff;
}
.alert--info i,
.alert--info strong {
  color: #2875b6;
}
.pending {
  margin-bottom: 14px;
}
/* Tarjetas de análisis */
.card {
  background: white;
  border: 1px solid #dfe5d5;
  border-radius: 16px;
  padding: 18px;
}
.card > header {
  margin-bottom: 12px;
}
.card > header h3 {
  margin: 0;
  font-size: 15px;
}
.card > header small {
  color: #68775e;
  font-size: 12px;
}
.insights {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
  align-items: stretch;
}
.insights .card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.span-3 {
  grid-column: 1 / -1;
}
.empty {
  color: #8a937f;
  font-size: 13px;
  margin: 8px 0;
}
.donut-wrap {
  position: relative;
  flex: 1;
  min-height: 190px;
}
.donut-center {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  text-align: center;
  pointer-events: none;
}
.donut-center strong {
  font-size: 22px;
}
.donut-center span {
  font-size: 12px;
  color: #66725c;
}
.legend {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: grid;
  gap: 8px;
}
.legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.legend strong {
  margin-left: auto;
}
.legend span {
  color: #8a937f;
  min-width: 44px;
  text-align: right;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.dot--cash {
  background: #648506;
}
.dot--card {
  background: #2875b6;
}
.chart-box {
  position: relative;
  flex: 1;
  min-height: 220px;
}
.chart-box--tall {
  min-height: 260px;
}
.insights .card .empty {
  margin: auto;
  text-align: center;
}
.ranking {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}
.ranking li {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rank {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #eef4d8;
  color: #4c6b00;
  font-size: 12px;
  font-weight: 800;
}
.rank-bar {
  flex: 1;
  min-width: 0;
}
.rank-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
}
.rank-head span {
  color: #66725c;
  white-space: nowrap;
}
.track {
  height: 8px;
  margin-top: 5px;
  border-radius: 999px;
  background: #eef1e6;
  overflow: hidden;
}
.track i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #9cc10a, #648506);
}
.fiscal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: auto 0;
}
.fiscal {
  display: grid;
  gap: 2px;
  text-align: center;
  padding: 14px 8px;
  border-radius: 12px;
}
.fiscal strong {
  font-size: 26px;
}
.fiscal span {
  font-size: 11px;
  font-weight: 700;
}
.fiscal.ok {
  background: #eef4d8;
  color: #4c6b00;
}
.fiscal.waiting {
  background: #fdf3e0;
  color: #a86e00;
}
.fiscal.attention {
  background: #fdeeee;
  color: #b04444;
}
.pulse-error {
  color: #b04444;
  font-size: 12px;
}
.pulse-ok {
  color: #4c6b00;
  font-size: 12px;
}
.feed,
.terminals {
  list-style: none;
  margin: 0;
  padding: 2px;
  display: grid;
  gap: 10px;
  align-content: start;
  max-height: 300px;
  overflow: auto;
}
.feed li,
.terminals li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #edf0e6;
  border-radius: 10px;
  background: #fbfcf9;
}
.feed-time {
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 800;
  color: #4c6b00;
  min-width: 44px;
}
.feed-main {
  flex: 1;
  min-width: 0;
  display: grid;
}
.feed-main strong {
  font-size: 13px;
}
.feed-main small {
  font-size: 12px;
  color: #68775e;
}
.term-dot {
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #9cc10a;
  box-shadow: 0 0 0 4px #eef4d8;
}
.term-dot--draft {
  background: #d9a021;
  box-shadow: 0 0 0 4px #fdf3e0;
}
/* Herramientas y zonas */
.pending {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.pending-copy {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pending-copy strong {
  display: block;
  font-size: 14px;
}
.pending-copy p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #68775e;
}
.pending-links {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.central-tools input {
  flex: 1;
  min-width: 200px;
  padding: 13px;
  border: 1px solid #d8e1cb;
  border-radius: 9px;
  font: inherit;
}
.central-tools {
  margin-bottom: 6px;
}
.central-tools span {
  color: #65715d;
  font-size: 12px;
}
.zone {
  background: white;
  padding: 20px;
  border: 1px solid #dfe5d5;
  border-radius: 16px;
  margin: 18px 0;
}
.zone-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.zone-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: #eef4d8;
  color: #648506;
  font-size: 18px;
}
.zone h2 {
  margin: 0 0 5px;
}
.zone small {
  color: #68775e;
}
.register-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 20px;
}
.register {
  border: 1px solid #dfe5d5;
  border-top: 4px solid #c5cdbb;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}
.register.is-open {
  border-top-color: #9cc10a;
  box-shadow: 0 6px 18px rgba(76, 107, 0, 0.08);
}
.register.is-pending {
  background: #fef6f6;
  border-color: #f0c9c9;
  border-top-color: #d66;
}
.register h3 {
  margin: 0;
}
.state {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.state--open {
  background: #e4efc8;
  color: #4c6b00;
}
.state--pending {
  background: #f9d9d9;
  color: #9a3c3c;
}
.state--closed {
  background: #eef1e6;
  color: #5c6650;
}
.state--inactive {
  background: #ececec;
  color: #8a8a8a;
}
.opened-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.expected {
  display: grid;
  gap: 6px;
  padding: 14px;
  background: linear-gradient(135deg, #f2f7e6, #e7f0d2);
  border-radius: 9px;
}
.expected span {
  font-size: 12px;
  color: #66725c;
}
.expected strong {
  font-size: 27px;
}
.presence small {
  display: block;
  margin-top: 5px;
}
dl > div {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin: 10px 0;
}
dd {
  margin: 0;
  font-weight: 700;
}
.register p {
  font-size: 13px;
  line-height: 1.5;
}
.footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  width: 100%;
}
.footer > .kiwik-separator {
  flex-basis: 100%;
  width: 100%;
}
.full {
  width: 100%;
  margin: 8px 0 16px;
}
label {
  display: block;
  font-weight: 700;
}
@media (max-width: 1400px) {
  .kpis {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .insights {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .span-3 {
    grid-column: 1 / -1;
  }
}
@media (max-width: 1000px) {
  .kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .insights {
    grid-template-columns: 1fr;
  }
  .span-3 {
    grid-column: auto;
  }
}
@media (max-width: 500px) {
  .central {
    padding: 12px;
  }
  .kpis {
    grid-template-columns: 1fr;
  }
  .register-grid {
    grid-template-columns: 1fr;
  }
}
</style>
