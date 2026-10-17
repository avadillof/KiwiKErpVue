<template>
  <TpvCentral v-if="showCentral" />
  <main v-else class="tpv">
    <header class="tpv-header">
      <div class="brand">
        <span class="brand-icon"><i class="pi pi-shopping-cart" /></span>
        <div>
          <h1>KiwiKERP <strong>TPV</strong></h1>
          <small
            >Terminal punto de venta · Modo
            {{ isBarMode ? "Bar" : "Tienda" }}</small
          >
        </div>
      </div>
      <Button
        v-if="auth.user?.admin"
        :label="isBarMode ? 'Modo Tienda' : 'Modo Bar'"
        :icon="isBarMode ? 'pi pi-shopping-cart' : 'pi pi-th-large'"
        severity="secondary"
        outlined
        :disabled="busy || endingSession || (!isBarMode && lines.length > 0)"
        :title="
          !isBarMode && lines.length > 0
            ? 'Vacía el ticket de tienda antes de cambiar de modo.'
            : 'Cambiar de modo para esta sesión'
        "
        @click="switchAdminMode"
      />
      <div class="operator">
        <span class="operator-avatar"
          ><img
            v-if="auth.user && !brokenOps.has(auth.user.pkid)"
            :src="opPhotoUrl(auth.user.pkid)"
            :alt="auth.user.name"
            loading="lazy"
            @error="brokenOps.add(auth.user.pkid)" /><i
            v-else
            class="pi pi-user"
        /></span>
        <div>
          <small>Atendiendo</small><strong>{{ auth.user?.name }}</strong>
        </div>
      </div>
      <Button
        v-if="auth.user?.admin && auth.tpvOpenedFromErp"
        label="Volver al ERP"
        icon="pi pi-arrow-left"
        severity="secondary"
        outlined
        :disabled="busy || endingSession"
        @click="router.push({ name: 'Dashboard' })"
      />
      <Button
        v-else
        label="Cerrar sesión"
        icon="pi pi-sign-out"
        severity="secondary"
        outlined
        :disabled="busy || endingSession"
        @click="requestSessionExit('logout')"
      />
      <Button
        label="Cambiar usuario"
        icon="pi pi-users"
        severity="secondary"
        outlined
        :disabled="busy || endingSession"
        @click="requestSessionExit('switch')"
      />
    </header>
    <Button
      v-if="auth.user?.admin"
      label="Volver a central"
      icon="pi pi-chart-bar"
      text
      :disabled="busy || endingSession || checkoutPending || lines.length > 0"
      @click="
        resetWorkplace();
        centralMode = true;
      "
    />
    <Message
      v-if="presenceWarning"
      :severity="openingInvalid ? 'error' : 'warn'"
      :closable="false"
      >{{ presenceWarning }}</Message
    >

    <div v-if="workplace" class="work-context">
      <div>
        <i class="pi pi-map-marker" /> <strong>{{ workplace.zoneName }}</strong
        ><span>
          · {{ workplace.registerName }} · Apertura #{{
            workplace.openingId
          }}</span
        >
        <span v-if="workplace.openedByName || openedAtText" class="work-meta">
          <span v-if="workplace.openedByName"
            ><i class="pi pi-user" /> Abierta por
            <strong>{{ workplace.openedByName }}</strong></span
          ><span v-if="openedAtText"
            ><i class="pi pi-clock" /> {{ openedAtText }}</span
          >
        </span>
      </div>
      <Button
        label="Cambiar puesto"
        icon="pi pi-sync"
        outlined
        :disabled="busy || endingSession"
        @click="changeWorkplace"
      />
      <Button
        label="Tickets cobrados"
        icon="pi pi-receipt"
        outlined
        :disabled="busy || endingSession"
        @click="refundDialog = true"
      />
      <Button
        v-if="canCloseCash"
        label="Cerrar caja"
        icon="pi pi-lock"
        outlined
        :disabled="busy || endingSession || lines.length > 0"
        @click="openCloseCash"
      />
      <Button
        v-if="canCloseCash"
        label="Histórico de cierres"
        icon="pi pi-history"
        outlined
        :disabled="closingCash"
        @click="openClosureHistory"
      />
    </div>
    <TpvWorkplace
      v-if="!workplace"
      :key="auth.portalSession || ''"
      :can-view-closures="canCloseCash"
      @closures="
        (zoneId) => {
          closureZoneId = zoneId;
          closedReport = null;
          closureDialog = true;
        }
      "
    />
    <TpvClosureDialog
      :visible="closureDialog"
      :zone-id="closureZoneId"
      :report="closedReport"
      @close="closureDialog = false"
    />
    <Dialog
      v-model:visible="closeCashDialog"
      header="Cerrar caja"
      :modal="false"
      class="kiwik-dialog"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
      :style="{ width: 'min(440px, 94vw)' }"
      :closable="!closingCash"
      :close-on-escape="!closingCash"
    >
      <p>{{ workplace?.zoneName }} · {{ workplace?.registerName }}</p>
      <p>
        El cierre termina esta apertura para todos los empleados. No se permite
        si hay tickets abiertos.
      </p>
      <div
        v-if="cashSummary"
        class="cash-summary"
        aria-label="Resumen de la apertura"
      >
        <div class="summary">
          <span>Fondo inicial</span
          ><span>{{ money(Number(cashSummary.openingFloat), "EUR") }}</span>
        </div>
        <div class="summary">
          <span>Ventas en efectivo</span
          ><span>{{ money(Number(cashSummary.cashSales), "EUR") }}</span>
        </div>
        <div class="summary">
          <span>Ventas con tarjeta</span
          ><span>{{ money(Number(cashSummary.cardSales), "EUR") }}</span>
        </div>
        <div v-if="Number(cashSummary.cashRefunds) > 0" class="summary">
          <span>Devoluciones en efectivo</span
          ><span>−{{ money(Number(cashSummary.cashRefunds), "EUR") }}</span>
        </div>
        <div v-if="Number(cashSummary.cardRefunds) > 0" class="summary">
          <span>Devoluciones con tarjeta</span
          ><span>−{{ money(Number(cashSummary.cardRefunds), "EUR") }}</span>
        </div>
        <div v-if="Number(cashSummary.fiscalPending) > 0" class="summary">
          <span>Tickets pendientes de envío fiscal</span
          ><span>{{ cashSummary.fiscalPending }}</span>
        </div>
        <div
          v-if="Number(cashSummary.fiscalError) > 0"
          class="summary fiscal-alert"
        >
          <span>Tickets con error de envío</span
          ><span>{{ cashSummary.fiscalError }}</span>
        </div>
        <div class="total">
          <span>Esperado en cajón</span
          ><strong>{{ money(Number(cashSummary.expectedCash), "EUR") }}</strong>
        </div>
        <div v-if="cashDifference !== null" class="summary">
          <span>Diferencia</span><span>{{ money(cashDifference, "EUR") }}</span>
        </div>
      </div>
      <label for="counted-cash"
        >Efectivo contado (usa el teclado numérico del TPV)</label
      >
      <InputNumber
        input-id="counted-cash"
        v-model="countedCash"
        mode="currency"
        currency="EUR"
        locale="de-DE"
        :min="0"
        :max-fraction-digits="2"
        :disabled="closingCash"
        autofocus
        @update:modelValue="
          countedText = $event == null ? '' : String($event).replace('.', ',')
        "
      />
      <Message v-if="cashError" severity="error" :closable="false">{{
        cashError
      }}</Message>
      <template v-if="cashDifference !== null && cashDifference !== 0">
        <label for="cash-reason">Motivo de la diferencia (obligatorio)</label>
        <InputText
          id="cash-reason"
          v-model="cashReason"
          data-alpha="1"
          maxlength="500"
          :disabled="closingCash"
        />
      </template>
      <template #footer
        ><div class="dialog-actions">
          <div class="kiwik-separator" />
          <Button
            label="Cancelar"
            text
            :disabled="closingCash"
            @click="closeCashDialog = false"
          /><Button
            label="Confirmar cierre"
            :loading="closingCash"
            :disabled="
              closingCash ||
              countedCash == null ||
              !cashSummary ||
              (cashDifference !== 0 && !cashReason.trim())
            "
            @click="closeCash"
          /></div
      ></template>
    </Dialog>
    <Message v-if="barError" severity="error" :closable="false">{{
      barError
    }}</Message>
    <TpvHalls
      v-if="workplace && isBarMode && !activeTable"
      :disabled="busy"
      @select="openTable"
    />
    <div v-if="workplace && isBarMode" class="bar-toolbar">
      <small
        >Tras el primer envío, guardar la mesa comunica también los cambios y
        anulaciones a preparación.</small
      >
      <Button
        label="Cocina y barra"
        icon="pi pi-list"
        outlined
        :disabled="busy"
        @click="kitchenVisible = true"
      />
      <Button
        v-if="activeTable"
        label="Enviar a preparación"
        icon="pi pi-send"
        :disabled="busy || !lines.length"
        @click="requestPreparation"
      />
    </div>
    <div v-if="workplace && isBarMode && activeTable" class="bar-toolbar">
      <div>
        <small>{{ activeTable.hallName }}</small
        ><strong>{{ activeTable.name }} · {{ activeTable.code }}</strong>
      </div>
      <span role="status"
        >{{
          busy
            ? "Procesando…"
            : barDirty
              ? "Cambios sin guardar"
              : "Ticket guardado"
        }}{{ activeTable.state === "BILL" ? " · Cuenta solicitada" : "" }}</span
      >
      <label class="guest-field"
        >Comensales<InputNumber
          v-model="guests"
          :min="1"
          :max="999"
          :useGrouping="false"
          :disabled="busy"
          placeholder="Personas"
      /></label>
      <Button
        label="Cobrar parte"
        icon="pi pi-wallet"
        outlined
        :disabled="busy || !lines.length"
        @click="openPartial"
      />
      <Button
        v-if="canRefund"
        label="Anulaciones"
        icon="pi pi-history"
        text
        :disabled="busy"
        @click="openCancellationHistory"
      />
      <Button
        label="Precuenta"
        icon="pi pi-print"
        outlined
        :disabled="busy || !lines.length"
        @click="requestBill(true)"
      />
      <Button
        label="Operaciones de mesa"
        icon="pi pi-arrow-right-arrow-left"
        outlined
        :disabled="busy || !lines.length"
        @click="prepareTableActions"
      />
      <Button
        label="Guardar"
        icon="pi pi-save"
        :disabled="busy || !barDirty"
        @click="saveTable"
      />
      <Button
        label="Salas y mesas"
        icon="pi pi-th-large"
        outlined
        :disabled="busy"
        @click="backToTables"
      />
      <Button
        label="Recargar ticket"
        icon="pi pi-refresh"
        text
        severity="secondary"
        :disabled="busy"
        @click="reloadTable"
      />
    </div>
    <div v-if="workplace && (!isBarMode || activeTable)" class="workspace">
      <section class="catalog" aria-label="Catálogo de productos">
        <form class="search" @submit.prevent="scan">
          <i class="pi pi-search" />
          <input
            ref="searchInput"
            v-model="query"
            data-alpha="1"
            aria-label="Buscar productos o escanear código de barras"
            placeholder="Nombre, referencia o código de barras…"
            autocomplete="off"
          />
          <Button
            v-if="query"
            icon="pi pi-times"
            text
            severity="secondary"
            aria-label="Borrar búsqueda"
            @click="query = ''"
          />
          <span class="scan-hint" aria-hidden="true"
            ><i class="pi pi-barcode" /> Escanear</span
          >
        </form>
        <div class="catalog-body">
          <div class="catalog-side">
            <nav class="families" aria-label="Familias de productos">
              <span class="families-title"
                >Familias <b>{{ number(filteredFamilies.length) }}</b></span
              >
              <input
                v-model="familyQuery"
                data-alpha="1"
                class="families-search"
                type="search"
                aria-label="Filtrar familias"
                placeholder="Filtrar…"
                autocomplete="off"
              />
              <div class="families-row">
                <button
                  :class="{ selected: family === null }"
                  :aria-pressed="family === null"
                  @click="selectFamily(null)"
                >
                  <i class="pi pi-th-large" /> Todos
                </button>
                <button
                  v-for="item in filteredFamilies"
                  :key="item.id"
                  :class="{ selected: family === item.id }"
                  :aria-pressed="family === item.id"
                  @click="selectFamily(item.id)"
                >
                  <img
                    v-if="item.image && !brokenFamilies.has(item.id)"
                    :src="item.image"
                    :alt="item.name"
                    loading="lazy"
                    @error="brokenFamilies.add(item.id)"
                  /><i v-else class="pi pi-folder" aria-hidden="true" /><span>{{
                    item.name
                  }}</span>
                </button>
              </div>
            </nav>
            <aside class="keypad-col" aria-label="Teclado de cantidades">
              <div class="keypad-lock-row">
                <Button
                  :icon="keypadLocked ? 'pi pi-lock' : 'pi pi-lock-open'"
                  :label="
                    keypadLocked ? 'Flotante bloqueado' : 'Flotante libre'
                  "
                  text
                  size="small"
                  :title="
                    keypadLocked
                      ? 'Tocar para permitir el teclado flotante'
                      : 'Tocar para impedir el teclado flotante'
                  "
                  aria-label="Candado del teclado flotante"
                  @click="toggleKeypadLock"
                />
              </div>
              <div class="keypad-display">
                <small>{{
                  closeCashDialog ? "Efectivo contado" : "Cantidad"
                }}</small>
                <strong>{{
                  closeCashDialog ? countedText || "0" : keypadText || "1"
                }}</strong>
              </div>
              <div class="keypad-grid" @pointerdown="keepCountedFocus">
                <button
                  v-for="d in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                  :key="d"
                  type="button"
                  @click="key(d)"
                >
                  {{ d }}
                </button>
                <button type="button" aria-label="Limpiar" @click="keyClear">
                  C
                </button>
                <button type="button" @click="key('0')">0</button>
                <button
                  type="button"
                  aria-label="Coma decimal"
                  @click="key(',')"
                >
                  ,
                </button>
                <button
                  type="button"
                  class="keypad-back"
                  aria-label="Borrar dígito"
                  @click="keyBack"
                >
                  <i class="pi pi-delete-left" />
                </button>
              </div>
              <small class="keypad-hint">{{
                closeCashDialog
                  ? "Se aplica al recuento del cierre de caja"
                  : "Se aplica al próximo artículo tocado"
              }}</small>
            </aside>
          </div>
          <div class="catalog-main">
            <div class="catalog-heading">
              <div>
                <span class="catalog-eyebrow">Productos</span>
                <h2>
                  {{
                    query.trim() ? "Resultados en todo el catálogo" : familyName
                  }}
                </h2>
                <small
                  >{{ number(total) }} productos · precios con impuestos ·
                  tarifa predeterminada</small
                >
              </div>
              <div class="catalog-heading-actions">
                <Button
                  icon="pi pi-shopping-cart"
                  label="Carro"
                  outlined
                  :severity="cartOnly ? 'success' : 'secondary'"
                  :badge="lines.length ? number(lines.length) : undefined"
                  aria-label="Ver solo los artículos del carro"
                  @click="cartOnly = !cartOnly"
                /><Button
                  icon="pi pi-refresh"
                  text
                  severity="secondary"
                  aria-label="Actualizar catálogo"
                  :disabled="loading"
                  @click="refresh"
                />
              </div>
            </div>
            <Message v-if="error" severity="error" :closable="false">{{
              error
            }}</Message>
            <div v-if="loading" class="empty">
              <i class="pi pi-spin pi-spinner" />
              <p>Cargando productos…</p>
            </div>
            <div v-else-if="cartOnly && !lines.length" class="empty">
              <i class="pi pi-shopping-cart" />
              <h3>Carro vacío</h3>
              <p>Toca un producto para añadirlo y verlo aquí.</p>
            </div>
            <div v-else-if="!cartProducts.length" class="empty">
              <i class="pi pi-search" />
              <h3>No hay productos disponibles</h3>
              <p>
                {{
                  error
                    ? "Reintenta la consulta con el botón de actualizar."
                    : "Selecciona otra familia o prueba una búsqueda diferente."
                }}
              </p>
            </div>
            <div v-else class="product-grid">
              <button
                v-for="product in cartProducts"
                :key="product.id"
                class="product"
                :class="{ 'in-ticket': !!quantityOf(product.id) }"
                :disabled="busy || !!product.unavailableReason"
                :title="product.unavailableReason || product.name"
                @click="add(product)"
              >
                <div class="product-photo">
                  <img
                    v-if="product.image && !brokenImages.has(product.id)"
                    :src="product.image"
                    :alt="product.name"
                    loading="lazy"
                    @error="brokenImages.add(product.id)"
                  /><i v-else class="pi pi-box" /><span
                    v-if="quantityOf(product.id)"
                    class="quantity-badge"
                    >{{ number(quantityOf(product.id) || 0) }}</span
                  >
                </div>
                <div class="product-copy">
                  <small>{{ product.code }}</small
                  ><strong>{{ product.name }}</strong>
                  <div class="product-price">
                    <b>{{
                      product.unavailableReason
                        ? "Revisar configuración"
                        : money(product.unitGross, product.currency)
                    }}</b
                    ><span
                      v-if="!product.unavailableReason"
                      class="product-add"
                      aria-hidden="true"
                      ><i class="pi pi-plus"
                    /></span>
                  </div>
                </div>
              </button>
            </div>
            <footer v-if="!cartOnly" class="pagination">
              <Button
                icon="pi pi-chevron-left"
                label="Anterior"
                severity="secondary"
                outlined
                :disabled="loading || page === 0"
                @click="changePage(-1)"
              /><span
                >{{ number(page + 1) }} /
                {{ number(Math.max(1, Math.ceil(total / 24))) }}</span
              ><Button
                label="Siguiente"
                icon="pi pi-chevron-right"
                icon-pos="right"
                severity="secondary"
                outlined
                :disabled="loading || (page + 1) * 24 >= total"
                @click="changePage(1)"
              />
            </footer>
          </div>
        </div>
      </section>

      <aside class="ticket" aria-label="Ticket de la venta en curso">
        <header class="ticket-header">
          <div>
            <span class="eyebrow">VENTA EN CURSO</span>
            <h2>
              {{ activeTable ? activeTable.name : "Tu ticket" }}
              <span>{{ number(lines.length) }}</span>
            </h2>
          </div>
          <i class="pi pi-receipt" />
        </header>
        <button
          type="button"
          class="customer"
          :disabled="busy || endingSession"
          title="Identificar cliente del ticket"
          @click="customerDialog = true"
        >
          <i class="pi pi-user" /><span>{{
            customer ? customer.name : "Venta sin identificar"
          }}</span
          ><small>{{
            customer ? customer.nif || "Contacto asignado" : "Asignar cliente"
          }}</small>
        </button>
        <div
          ref="ticketBody"
          class="ticket-lines"
          aria-live="polite"
          :aria-busy="busy"
        >
          <div v-if="!lines.length" class="empty">
            <i class="pi pi-shopping-bag" />
            <h3>Empieza tu venta</h3>
            <p>
              Toca un producto o escanea su código.<br />Lo verás aquí al
              instante.
            </p>
          </div>
          <article
            v-for="line in lines"
            :key="lineKey(line)"
            :data-line="lineKey(line)"
            class="ticket-line"
            :class="{ highlighted: highlighted === line.id }"
          >
            <button class="line-main" :disabled="busy" @click="edit(line)">
              <strong>{{ line.name }}</strong
              ><b>{{ money(line.totalCents / 100, line.currency) }}</b
              ><small
                >{{ number(line.quantity) }} ×
                {{ money(line.unitGross, line.currency) }} · IVA
                {{ number(line.tax) }} %</small
              >
            </button>
            <p v-if="isBarMode && line.preparation" class="preparation-summary">
              {{
                line.preparation.destination === "KITCHEN"
                  ? "Cocina"
                  : line.preparation.destination === "BAR"
                    ? "Barra"
                    : "Sin preparación"
              }}
              ·
              {{
                [...line.preparation.modifiers, line.preparation.note]
                  .filter(Boolean)
                  .join(" · ")
              }}
            </p>
            <Button
              v-if="isBarMode"
              label="Preparación"
              icon="pi pi-pencil"
              text
              :disabled="busy"
              @click="editPreparation(line)"
            />
            <div class="line-actions">
              <Button
                icon="pi pi-minus"
                severity="secondary"
                outlined
                :disabled="busy || line.quantity <= 1"
                :aria-label="`Restar una unidad de ${line.name}`"
                @click="setQuantity(line, line.quantity - 1)"
              /><button
                class="quantity-edit"
                :disabled="busy"
                :aria-label="`Editar cantidad de ${line.name}`"
                @click="edit(line)"
              >
                {{ number(line.quantity) }}</button
              ><Button
                icon="pi pi-plus"
                severity="secondary"
                outlined
                :disabled="busy"
                :aria-label="`Añadir una unidad de ${line.name}`"
                @click="add(line)"
              /><Button
                icon="pi pi-trash"
                severity="danger"
                text
                :disabled="busy"
                :aria-label="`Quitar ${line.name}`"
                @click="remove(line)"
              />
            </div>
          </article>
        </div>
        <footer class="ticket-footer">
          <div class="summary">
            <span>Base imponible</span
            ><span>{{ money(net / 100, currency) }}</span>
          </div>
          <div class="summary">
            <span>Impuestos</span><span>{{ money(tax / 100, currency) }}</span>
          </div>
          <div class="total">
            <span>Total</span
            ><strong>{{ money(amount / 100, currency) }}</strong>
          </div>
          <Button
            v-if="isBarMode"
            label="Pedir la cuenta"
            icon="pi pi-receipt"
            outlined
            :disabled="busy || !lines.length || activeTable?.state === 'BILL'"
            @click="requestBill(false)"
          />
          <Button
            class="checkout"
            :label="`Cobrar ${money(amount / 100, currency)}`"
            icon="pi pi-wallet"
            :disabled="busy || endingSession || openingInvalid || !lines.length"
            @click="startCheckout"
          />
          <p class="phase-note">
            Ticket no fiscal. La factura, a petición del cliente.
          </p>
          <Button
            label="Vaciar ticket"
            icon="pi pi-trash"
            text
            severity="secondary"
            :disabled="busy || !lines.length"
            @click="confirmClear = true"
          />
        </footer>
      </aside>
    </div>

    <Dialog
      v-model:visible="confirmReload"
      modal
      class="kiwik-dialog"
      :style="{ width: 'min(440px, 94vw)' }"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
    >
      <template #header><strong>Recargar ticket de la mesa</strong></template>
      <p>
        Se descartarán tus cambios sin guardar y se recuperará el ticket que hay
        en el servidor.
      </p>
      <template #footer
        ><div class="dialog-actions">
          <div class="kiwik-separator" />
          <Button
            label="Conservar mis cambios"
            text
            severity="secondary"
            @click="confirmReload = false"
          /><Button
            label="Recargar"
            severity="danger"
            @click="
              confirmReload = false;
              activeTable && openTable(activeTable);
            "
          /></div
      ></template>
    </Dialog>
    <Dialog
      v-model:visible="editing"
      class="kiwik-dialog"
      :style="{ width: 'min(440px, 94vw)' }"
      :closable="!busy"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
    >
      <template #header
        ><strong
          ><i class="pi pi-pencil" /> Cantidad del artículo</strong
        ></template
      >
      <p>{{ selectedLine?.name }}</p>
      <label for="tpv-quantity">Cantidad</label
      ><InputNumber
        input-id="tpv-quantity"
        v-model="editQuantity"
        :min="0.001"
        :max="99999"
        :max-fraction-digits="3"
        locale="de-DE"
        autofocus
        fluid
        :disabled="busy"
        @update:modelValue="
          editEntry = $event == null ? '' : String($event).replace('.', ',')
        "
      />
      <p class="edit-note">
        Se consultará la tarifa actual para esta cantidad.
      </p>
      <Message v-if="editError" severity="error" :closable="false">{{
        editError
      }}</Message>
      <template #footer
        ><div class="dialog-actions">
          <div class="kiwik-separator" />
          <Button
            label="Cancelar"
            text
            severity="secondary"
            :disabled="busy"
            @click="editing = false"
          /><Button
            label="Aplicar cantidad"
            :loading="busy"
            :disabled="!editQuantity || busy"
            @click="applyQuantity"
          /></div
      ></template>
    </Dialog>
    <Dialog
      v-model:visible="confirmClear"
      modal
      class="kiwik-dialog"
      :style="{ width: 'min(420px, 94vw)' }"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
    >
      <template #header><strong>Vaciar ticket</strong></template>
      <p>Se quitarán todos los artículos de esta venta en preparación.</p>
      <template #footer
        ><div class="dialog-actions">
          <div class="kiwik-separator" />
          <Button
            label="Conservar"
            text
            severity="secondary"
            @click="confirmClear = false"
          /><Button
            label="Vaciar ticket"
            severity="danger"
            :disabled="busy"
            @click="clearTicket"
          /></div
      ></template>
    </Dialog>

    <Dialog
      v-model:visible="routingVisible"
      modal
      header="Enviar a preparación"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
      :style="{ width: '42rem', maxWidth: '95vw' }"
      :closable="!busy"
      :closeOnEscape="!busy"
    >
      <p>
        Elige dónde se prepara cada consumición. «Sin preparación» no envía esa
        línea.
      </p>
      <div class="preparation-routing">
        <div
          v-for="(row, index) in routingLines"
          :key="index"
          class="preparation-route"
        >
          <label :for="'preparation-route-' + index"
            ><strong
              >{{ number(row.line.quantity) }} × {{ row.line.name }}</strong
            ><small>{{
              row.line.preparation?.modifiers.join(" · ")
            }}</small></label
          >
          <Select
            :inputId="'preparation-route-' + index"
            v-model="row.destination"
            :options="preparationDestinations"
            optionLabel="label"
            optionValue="value"
            :disabled="busy"
          />
        </div>
      </div>
      <p v-if="routingError" role="alert" class="routing-error">
        {{ routingError }}
      </p>
      <template #footer
        ><div class="routing-footer">
          <div class="kiwik-separator" />
          <div>
            <Button
              label="Cancelar"
              outlined
              :disabled="busy"
              @click="routingVisible = false"
            /><Button
              label="Confirmar envío"
              icon="pi pi-send"
              :disabled="busy"
              @click="confirmPreparation"
            />
          </div></div
      ></template>
    </Dialog>
    <Dialog
      v-model:visible="partialVisible"
      modal
      header="Cobrar parte de la cuenta"
      :closable="!busy"
      :closeOnEscape="!busy"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
      :style="{ width: '46rem', maxWidth: '95vw' }"
    >
      <p>
        Selecciona las unidades que paga este cliente. El resto permanece en la
        mesa.
      </p>
      <div class="partial-rows">
        <label v-for="row in partialRows" :key="row.line.savedLineId"
          ><span
            ><strong>{{ row.line.name }}</strong
            ><small
              >{{ number(row.line.quantity) }} disponibles ·
              {{ row.line.preparation?.modifiers.join(" · ") }}
              {{ row.line.preparation?.note }}</small
            ></span
          ><InputNumber
            v-model="row.quantity"
            :min="0"
            :max="row.line.quantity"
            :maxFractionDigits="3"
            :useGrouping="false"
            showButtons
            :disabled="busy"
        /></label>
      </div>
      <Message v-if="partialError" severity="error" :closable="false">{{
        partialError
      }}</Message>
      <template #footer
        ><div class="routing-footer">
          <div class="kiwik-separator" />
          <div>
            <Button
              label="Cancelar"
              outlined
              :disabled="busy"
              @click="partialVisible = false"
            /><Button
              label="Continuar al cobro"
              :loading="busy"
              @click="previewPartial"
            />
          </div></div
      ></template>
    </Dialog>
    <Dialog
      v-model:visible="cancelVisible"
      modal
      header="Anular consumición"
      :closable="!busy"
      :closeOnEscape="!busy"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
      :style="{ width: '34rem', maxWidth: '95vw' }"
    >
      <p>
        Se registrarán el operario, las cantidades y el motivo. Si la cuenta
        tiene comandas enviadas, necesitas permiso de devoluciones o ser
        administrador.
      </p>
      <label class="operation-field"
        >Motivo<textarea
          v-model="cancelReason"
          rows="3"
          maxlength="300"
          :disabled="busy"
        />
      </label>
      <Message v-if="cancelError" severity="error" :closable="false">{{
        cancelError
      }}</Message>
      <template #footer
        ><div class="routing-footer">
          <div class="kiwik-separator" />
          <div>
            <Button
              label="Volver"
              outlined
              :disabled="busy"
              @click="cancelVisible = false"
            /><Button
              label="Registrar anulación"
              :disabled="busy || cancelReason.trim().length < 3"
              @click="confirmCancellation"
            />
          </div></div
      ></template>
    </Dialog>
    <Dialog
      v-model:visible="auditVisible"
      modal
      header="Anulaciones de esta mesa"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
      :style="{ width: '50rem', maxWidth: '95vw' }"
    >
      <Message v-if="auditError" severity="error">{{ auditError }}</Message>
      <p v-if="!auditRows.length">No hay anulaciones en esta página.</p>
      <article v-for="row in auditRows" :key="row.id" class="audit-row">
        <strong
          >{{ row.operator }} · {{ number(Number(row.quantity)) }} unidades ·
          Artículo {{ row.productId }}</strong
        >
        <p>{{ row.reason }}</p>
        <small
          >{{ new Date(Number(row.createdAt)).toLocaleString("es-ES") }} ·
          Cuenta #{{ row.ticketId }} ·
          {{
            row.sentToKitchen
              ? "Artículo con envío a cocina"
              : "Sin envío a cocina"
          }}</small
        >
      </article>
      <template #footer
        ><div class="routing-footer">
          <div class="kiwik-separator" />
          <div>
            <Button
              label="Anterior"
              outlined
              :disabled="busy || auditPage === 0"
              @click="
                auditPage--;
                loadCancellationHistory();
              "
            /><Button
              label="Siguiente"
              outlined
              :disabled="busy || auditRows.length < 50"
              @click="
                auditPage++;
                loadCancellationHistory();
              "
            /><Button label="Cerrar" @click="auditVisible = false" />
          </div></div
      ></template>
    </Dialog>
    <TpvKitchen
      v-if="kitchenVisible && workplace"
      :zoneId="workplace.zoneId"
      :initialDestination="kitchenDestination"
      @close="kitchenVisible = false"
    />
    <Dialog
      v-model:visible="preparationVisible"
      modal
      header="Preparar consumición"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
      :style="{ width: '34rem', maxWidth: '95vw' }"
    >
      <p>
        <strong>{{ preparationLine?.name }}</strong> · Se aplica a toda esta
        línea.
      </p>
      <Button
        v-if="preparationLine && preparationLine.quantity > 1"
        label="Separar una unidad para prepararla diferente"
        outlined
        :disabled="busy"
        @click="separatePreparationUnit"
      />
      <div class="preparation-form">
        <label
          >Destino
          <Select
            v-model="preparationDraft.destination"
            :options="preparationDestinations"
            optionLabel="label"
            optionValue="value"
          />
        </label>
        <label
          >Modificadores (uno por línea, sin suplemento)
          <textarea
            v-model="modifierText"
            data-alpha="1"
            rows="4"
            maxlength="730"
            placeholder="Sin cebolla&#10;Poco hecho"
          />
        </label>
        <div class="supplement-picker">
          <label>Suplementos del catálogo (por unidad)</label>
          <div class="supplement-search">
            <InputText
              v-model="supplementQuery"
              data-alpha="1"
              placeholder="Buscar suplemento"
              @keydown.enter.prevent="searchSupplements"
            /><Button
              label="Buscar"
              outlined
              :disabled="busy"
              @click="searchSupplements"
            />
          </div>
          <MultiSelect
            v-model="supplementIds"
            :options="supplementChoices"
            optionLabel="name"
            optionValue="id"
            display="chip"
            placeholder="Sin suplementos"
            :disabled="busy"
          />
          <small
            >Precio e IVA del catálogo. Si el IVA es distinto, añádelo como
            artículo independiente.</small
          >
          <Message v-if="supplementError" severity="error" :closable="false">{{
            supplementError
          }}</Message>
        </div>
        <label
          >Nota para preparación
          <textarea
            v-model="preparationDraft.note"
            data-alpha="1"
            rows="3"
            maxlength="300"
          />
        </label>
      </div>
      <template #footer
        ><div class="dialog-actions">
          <div class="kiwik-separator"></div>
          <Button
            label="Cancelar"
            outlined
            @click="preparationVisible = false" /><Button
            label="Aplicar"
            @click="applyPreparation"
          /></div
      ></template>
    </Dialog>
    <TpvTableActions
      v-if="activeTable && workplace"
      :visible="tableActionsVisible"
      :table-id="activeTable.id"
      :table-name="activeTable.name"
      :zone-id="workplace.zoneId"
      :opening-id="workplace.openingId"
      :revision="barRevision"
      :lines="lines"
      @close="tableActionsVisible = false"
      @done="tableActionsDone"
      @reload="
        tableActionsVisible = false;
        reloadTable();
      "
    />
    <TpvCheckoutDialog
      ref="checkoutDlg"
      :visible="checkoutDialog"
      :total="partialMode ? partialTotal : amount / 100"
      :partial="partialMode"
      :currency="currency"
      :opening-id="workplace?.openingId ?? null"
      :register-id="workplace?.registerId ?? null"
      :table-id="activeTable?.id ?? null"
      :lines="checkoutLines"
      :revision="barRevision"
      :customer="customer"
      @pending="checkoutPending = $event"
      @close="checkoutDialog = false"
      @paid="onPaid"
    />

    <TpvCustomerDialog
      :visible="customerDialog"
      @keyboard="forceAlphaShow"
      :customer="customer"
      @close="customerDialog = false"
      @clear="
        customer = null;
        customerDialog = false;
      "
      @save="
        customer = $event;
        customerDialog = false;
      "
    />

    <TpvRefundDialog
      :can-refund="canRefund"
      :visible="refundDialog"
      :opening-id="workplace?.openingId ?? null"
      :register-id="workplace?.registerId ?? null"
      :zone-name="workplace?.zoneName ?? null"
      :register-name="workplace?.registerName ?? null"
      @close="refundDialog = false"
      @refunded="cashSummary = null"
    />

    <Dialog
      v-model:visible="sessionDialog"
      :modal="false"
      class="kiwik-dialog"
      :style="{ width: 'min(460px, 94vw)' }"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
    >
      <template #header
        ><strong>{{
          sessionAction === "switch" ? "Cambiar de usuario" : "Cerrar sesión"
        }}</strong></template
      >
      <p>
        Hay una venta en preparación. Para continuar se descartará este ticket y
        se cerrará la sesión de {{ auth.user?.name }}.
      </p>
      <p v-if="sessionAction === 'switch'">
        El siguiente usuario deberá identificarse y empezará con un ticket
        vacío.
      </p>
      <template #footer
        ><div class="dialog-actions">
          <div class="kiwik-separator" />
          <Button
            label="Seguir con la venta"
            text
            severity="secondary"
            @click="sessionDialog = false"
          /><Button
            label="Descartar y continuar"
            severity="danger"
            @click="finishSession"
          /></div
      ></template>
    </Dialog>
    <Dialog
      v-model:visible="opDialog"
      modal
      class="kiwik-dialog"
      :style="{ width: 'min(620px, 94vw)' }"
      :closable="!opBusy"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
    >
      <template #header
        ><strong
          ><i class="pi pi-users" /> Cambiar de operario</strong
        ></template
      >
      <div v-if="!opSelected">
        <p class="op-hint">Toca tu nombre e introduce tu PIN.</p>
        <p v-if="opLoading" class="op-hint" role="status">
          <i class="pi pi-spin pi-spinner" /> Cargando operarios…
        </p>
        <div v-else class="op-grid">
          <button
            v-for="op in operators"
            :key="op.id"
            type="button"
            class="op-btn"
            :disabled="opBusy"
            @click="opSelected = op"
          >
            <span class="op-avatar"
              ><img
                v-if="!brokenOps.has(op.id)"
                :src="opPhotoUrl(op.id)"
                :alt="op.name"
                loading="lazy"
                @error="brokenOps.add(op.id)"
              /><span v-else>{{ opInitials(op.name) }}</span></span
            ><span>{{ op.name }}</span>
          </button>
        </div>
        <p v-if="!opLoading && !operators.length && !opError" class="op-hint">
          Sin operarios con acceso a TPV.
        </p>
      </div>
      <div v-else class="op-pin">
        <Button
          label="Operarios"
          icon="pi pi-arrow-left"
          text
          severity="secondary"
          size="small"
          :disabled="opBusy"
          @click="
            opSelected = null;
            opPin = '';
            opError = '';
          "
        />
        <strong>{{ opSelected.name }}</strong>
        <div class="op-dots" aria-hidden="true">
          <span
            v-for="i in Math.max(4, opPin.length)"
            :key="i"
            :class="{ filled: i <= opPin.length }"
          />
        </div>
        <div class="op-pad">
          <button
            v-for="d in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
            :key="d"
            type="button"
            :disabled="opBusy"
            @click="opKey(d)"
          >
            {{ d }}
          </button>
          <button type="button" :disabled="opBusy" @click="opPin = ''">
            C
          </button>
          <button type="button" :disabled="opBusy" @click="opKey('0')">
            0
          </button>
          <button
            type="button"
            :disabled="opBusy"
            aria-label="Borrar dígito"
            @click="opBack"
          >
            <i class="pi pi-delete-left" />
          </button>
        </div>
        <Button
          label="Entrar"
          icon="pi pi-check"
          :loading="opBusy"
          :disabled="opBusy || !opPin"
          @click="opSubmit"
        />
      </div>
      <Message v-if="opError" severity="error" :closable="false">{{
        opError
      }}</Message>
      <template #footer
        ><div class="dialog-actions">
          <div class="kiwik-separator" />
          <Button
            label="Cancelar"
            text
            severity="secondary"
            :disabled="opBusy"
            @click="opDialog = false"
          /></div
      ></template>
    </Dialog>
    <div
      v-if="showAlpha"
      class="alpha-keyboard"
      role="dialog"
      aria-label="Teclado alfanumérico"
      :style="
        alphaPos
          ? {
              left: alphaPos.left + 'px',
              top: alphaPos.top + 'px',
              transform: 'none',
              bottom: 'auto',
            }
          : {}
      "
    >
      <div class="alpha-bar" @pointerdown="alphaDragStart">
        <i class="pi pi-arrows-alt" /><span>Teclado</span
        ><button
          type="button"
          tabindex="-1"
          aria-label="Ocultar teclado"
          @pointerdown.stop
          @click="alphaHide"
        >
          <i class="pi pi-times" />
        </button>
      </div>
      <div class="alpha-row" v-for="(row, i) in alphaRows" :key="i">
        <button
          v-for="k in row"
          :key="k"
          type="button"
          tabindex="-1"
          @pointerdown.prevent
          @click="alphaType(k)"
        >
          {{
            alphaShift ? k.toLocaleUpperCase("es") : k.toLocaleLowerCase("es")
          }}
        </button>
      </div>
      <div class="alpha-row alpha-actions">
        <button
          type="button"
          tabindex="-1"
          :class="{ on: alphaShift }"
          title="Mayúsculas"
          @pointerdown.prevent
          @click="alphaShift = !alphaShift"
        >
          <i class="pi pi-arrow-up" />
        </button>
        <button
          type="button"
          class="alpha-space"
          tabindex="-1"
          @pointerdown.prevent
          @click="alphaType(' ')"
        >
          Espacio
        </button>
        <button
          type="button"
          tabindex="-1"
          title="Borrar"
          @pointerdown.prevent
          @click="alphaBack"
        >
          <i class="pi pi-delete-left" />
        </button>
        <button
          type="button"
          tabindex="-1"
          title="Aceptar"
          @pointerdown.prevent
          @click="alphaEnter"
        >
          <i class="pi pi-check" />
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { createUuid } from "@/libs/createUuid";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import axios from "axios";
import { printConfiguredReceipt } from "../../services/Printing/printerService";
import TpvTableActions from "./TpvTableActions.vue";
import TpvKitchen from "./TpvKitchen.vue";
import { catalogLine } from "./tpvLineSelection";
import type { Preparation } from "../../libs/printing/kitchenOrder";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import Message from "primevue/message";
import TpvHalls, { type BarTable } from "./TpvHalls.vue";
import TpvCheckoutDialog from "./TpvCheckoutDialog.vue";
import TpvCustomerDialog, { type TpvCustomer } from "./TpvCustomerDialog.vue";
import TpvRefundDialog from "./TpvRefundDialog.vue";
import TpvCentral from "./TpvCentral.vue";
import { useTpvPresence } from "./useTpvPresence";
import TpvClosureDialog from "./TpvClosureDialog.vue";
import type { TpvClosure } from "./tpvClosure";
import InputText from "primevue/inputtext";
import type { CheckoutLine, TpvReceipt } from "./tpvReceipt";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";
import { useTpvZones } from "./useTpvZones";
import TpvWorkplace from "./TpvWorkplace.vue";

import { useSecurityStore } from "@/stores/securityStore";
import { PERM } from "@/services/Frm_Main/permissions";

interface Product {
  id: number;
  name: string;
  code: string;
  image?: string;
  barcode?: string;
  unitGross: number;
  currency: string;
  tax: number;
  unavailableReason?: string;
}
interface TpvFamily {
  id: number;
  name: string;
  image?: string;
}
interface Line extends Product {
  supplementIds?: number[];
  supplements?: Array<{ id: number; name: string; unitGross: number }>;
  preparation?: Preparation;
  uiKey?: string;
  savedLineId?: number;
  quantity: number;
  netCents: number;
  taxCents: number;
  totalCents: number;
}
const auth = useAuthStore();
const centralMode = ref(auth.user?.admin === true);
const showCentral = computed(
  () => auth.user?.admin === true && centralMode.value,
);
const security = useSecurityStore();
/** Cerrar caja: admin o permiso TPV_GEN_0001. Fail-closed si la seguridad no está cargada. */
const canCloseCash = computed(() => {
  try {
    return (
      auth.user?.admin === true || security.hasPermission(PERM.TPV_CLOSE_CASH)
    );
  } catch {
    return auth.user?.admin === true;
  }
});
/** Devolver tickets: admin o permiso TPV_GEN_0002. */
const canRefund = computed(() => {
  try {
    return auth.user?.admin === true || security.hasPermission(PERM.TPV_REFUND);
  } catch {
    return auth.user?.admin === true;
  }
});
const refundDialog = ref(false);
// An administrator can configure hospitality without changing their ERP group.
// This local choice must never transfer to the next authenticated operator.
const adminMode = ref<"SHOP" | "BAR" | null>(null);
watch(
  () => auth.user?.pkid,
  () => {
    adminMode.value = null;
    centralMode.value = auth.user?.admin === true;
  },
  { flush: "sync" },
);
/** El modo del operario decide entre venta directa y tickets por mesa. */
const isBarMode = computed(
  () =>
    (auth.user?.admin && adminMode.value
      ? adminMode.value
      : auth.user?.tpvMode || "SHOP"
    ).toUpperCase() === "BAR",
);
const { workplace, reset: resetWorkplace } = useTpvZones();
/** "12/10/2026 09:15" a partir del ISO que devuelve la apertura. */
const openedAtText = computed(() => {
  const raw = workplace.value?.openedAt;
  if (!raw) return "";
  const date = new Date(
    String(raw).includes("T") ? String(raw) : `${raw}T00:00:00`,
  );
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});
const closeCashDialog = ref(false);
const cashReason = ref("");
const closureDialog = ref(false);
const closureZoneId = ref<number | null>(null);
const closedReport = ref<TpvClosure | null>(null);
function openClosureHistory() {
  closureZoneId.value = workplace.value?.zoneId ?? closureZoneId.value;
  closedReport.value = null;
  closureDialog.value = true;
}
const countedCash = ref<number | null>(null);
/** Texto del contado (coma decimal): lo escriben el InputNumber y el teclado del TPV. */
const countedText = ref("");
function syncCountedFromText() {
  countedCash.value = countedText.value
    ? Number(countedText.value.replace(",", ".")) || 0
    : null;
  focusCounted();
}
/** Pointer presses must not move focus from the amount into a keypad button. */
function keepCountedFocus(event: PointerEvent) {
  if (closeCashDialog.value) event.preventDefault();
}
/** El contado coge el foco para que el TPV sin teclado físico vea dónde escribe. */
function focusCounted() {
  nextTick(() =>
    document.getElementById("counted-cash")?.focus({ preventScroll: true }),
  );
}
const closingCash = ref(false);
const cashError = ref("");
interface CashSummary {
  cashSales?: number;
  cardSales?: number;
  cashRefunds?: number;
  cardRefunds?: number;
  expectedCash?: number;
  openingFloat?: number;
  fiscalPending?: number;
  fiscalError?: number;
}
const cashSummary = ref<CashSummary | null>(null);
/** Contado menos esperado (null hasta teclear el contado). */
const cashDifference = computed(() =>
  countedCash.value == null || cashSummary.value?.expectedCash == null
    ? null
    : Math.round(
        (countedCash.value - Number(cashSummary.value.expectedCash)) * 100,
      ) / 100,
);
async function openCloseCash() {
  if (busy.value || endingSession.value || !workplace.value) return;
  closeCashDialog.value = true;
  countedCash.value = null;
  countedText.value = "";
  cashReason.value = "";
  cashError.value = "";
  cashSummary.value = null;
  focusCounted();
  try {
    const { data } = await axios.get<CashSummary>(
      backendUrl(`/WebTpv/openings/${workplace.value.openingId}/summary`),
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    cashSummary.value = data;
  } catch (e) {
    cashError.value =
      "No se pudo calcular el arqueo. Cierra este diálogo y vuelve a intentarlo.";
    cashSummary.value = null;
  }
}
async function closeCash() {
  if (
    !workplace.value ||
    closingCash.value ||
    countedCash.value == null ||
    lines.value.length ||
    !canCloseCash.value
  )
    return;
  closingCash.value = true;
  cashError.value = "";
  try {
    const { data } = await axios.post<TpvClosure>(
      backendUrl(`/WebTpv/openings/${workplace.value.openingId}/close`),
      { amount: countedCash.value, reason: cashReason.value },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    closeCashDialog.value = false;
    closedReport.value = data;
    closureZoneId.value = data.zoneId;
    closureDialog.value = true;
    countedCash.value = null;
    activeTable.value = null;
    barError.value = "";
    resetWorkplace();
  } catch (e) {
    cashError.value = message(e);
    // Another employee may have charged after the preview; show the current discrepancy.
    if (
      axios.isAxiosError(e) &&
      [400, 409, 422].includes(e.response?.status ?? 0) &&
      workplace.value
    ) {
      try {
        const { data } = await axios.get<CashSummary>(
          backendUrl(`/WebTpv/openings/${workplace.value.openingId}/summary`),
          { ...auth.portalRequestConfig(), timeout: 15000 },
        );
        cashSummary.value = data;
      } catch {
        /* Preserve the original closing error, including an already closed register. */
      }
    }
  } finally {
    closingCash.value = false;
  }
}
const toast = useToast();
async function changeWorkplace() {
  if (busy.value || endingSession.value) return;
  if (!isBarMode.value && lines.value.length) {
    toast.add({
      severity: "warn",
      summary: "Ticket en curso",
      detail: "Termina o vacía el ticket antes de cambiar de puesto.",
      life: 4000,
    });
    return;
  }
  if (activeTable.value && !(await saveTable())) return;
  activeTable.value = null;
  lines.value = [];
  barError.value = "";
  showAlpha.value = false;
  resetWorkplace();
}
const sessionDialog = ref(false);
const sessionAction = ref<"logout" | "switch">("logout");
const endingSession = ref(false);
const router = useRouter();
const families = ref<TpvFamily[]>([]);
const familyQuery = ref("");
const filteredFamilies = computed(() => {
  const q = familyQuery.value.trim().toLocaleLowerCase("es");
  if (!q) return families.value;
  return families.value.filter((item) =>
    item.name.toLocaleLowerCase("es").includes(q),
  );
});
const products = ref<Product[]>([]);
const lines = ref<Line[]>([]);
/** Cliente del ticket en curso (nombre + NIF): sin líneas no hay cliente. */
const customer = ref<TpvCustomer | null>(null);
const customerDialog = ref(false);
watch(
  () => lines.value.length,
  (count) => {
    if (count === 0) customer.value = null;
  },
);
interface TableTicket {
  guests?: number | null;
  customer?: TpvCustomer | null;
  revision: string;
  state: string;
  lines: Line[];
  zoneId?: number | null;
  openingId?: number | null;
}
const activeTable = ref<BarTable | null>(null);
const barRevision = ref("");
const guests = ref<number | null>(null),
  guestBaseline = ref<number | null>(null);
const cancellationReason = ref("");
const barBaseline = ref("[]");
const barCustomerBaseline = ref<number | null>(null);
const barError = ref("");
const confirmReload = ref(false);
const barDirty = computed(
  () =>
    !!activeTable.value &&
    (guests.value !== guestBaseline.value ||
      JSON.stringify(lines.value) !== barBaseline.value ||
      (customer.value?.id ?? null) !== barCustomerBaseline.value),
);
const unsaved = computed(() =>
  isBarMode.value ? barDirty.value : lines.value.length > 0,
);

async function switchAdminMode() {
  if (!auth.user?.admin || busy.value || endingSession.value) return;
  if (!isBarMode.value && lines.value.length) return;
  if (isBarMode.value && activeTable.value && !(await saveTable())) return;
  const nextMode = isBarMode.value ? "SHOP" : "BAR";
  activeTable.value = null;
  lines.value = [];
  barError.value = "";
  cartOnly.value = false;
  keypadText.value = "";
  showAlpha.value = false;
  adminMode.value = nextMode;
}

function acceptTicket(ticket: TableTicket) {
  lines.value = ticket.lines;
  guests.value = ticket.guests ?? null;
  guestBaseline.value = guests.value;
  cancellationReason.value = "";
  customer.value = ticket.customer ?? null;
  barCustomerBaseline.value = customer.value?.id ?? null;
  barRevision.value = ticket.revision;
  barBaseline.value = JSON.stringify(ticket.lines);
  if (activeTable.value) activeTable.value.state = ticket.state;
}
async function openTable(table: BarTable) {
  if (busy.value) return;
  busy.value = true;
  barError.value = "";
  try {
    const ticket = await get<TableTicket>(`tables/${table.id}/ticket`);
    if (
      ticket.openingId != null &&
      ticket.openingId !== workplace.value?.openingId
    )
      throw new Error("Accede a la caja de este ticket para continuar.");
    activeTable.value = table;
    acceptTicket(ticket);
    cartOnly.value = false;
    keypadText.value = "";
  } catch (e) {
    barError.value = message(e);
  } finally {
    busy.value = false;
  }
}
async function saveTable() {
  if (!activeTable.value || busy.value) return false;
  if (!barDirty.value) return true;
  busy.value = true;
  barError.value = "";
  try {
    const response = await axios.put<TableTicket>(
      backendUrl(`/WebTpv/tables/${activeTable.value.id}/ticket`),
      {
        revision: barRevision.value,
        guests: guests.value,
        cancellationReason: cancellationReason.value,
        customer: customer.value ? { id: customer.value.id } : null,
        openingId: workplace.value?.openingId,
        lines: lines.value.map((line) => ({
          productId: line.id,
          savedLineId: line.savedLineId,
          quantity: line.quantity,
          preparation: line.preparation,
          supplementIds: line.supplementIds,
        })),
      },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    acceptTicket(response.data);
    return true;
  } catch (e) {
    barError.value = message(e);
    return false;
  } finally {
    busy.value = false;
  }
}
async function backToTables() {
  if (!(await saveTable())) return;
  activeTable.value = null;
  lines.value = [];
  barError.value = "";
  showAlpha.value = false;
}
async function reloadTable() {
  if (!activeTable.value || busy.value) return;
  if (barDirty.value) {
    confirmReload.value = true;
    return;
  }
  await openTable(activeTable.value);
}
const kitchenVisible = ref(false),
  preparationVisible = ref(false);
const preparationLine = ref<Line | null>(null);
const preparationDraft = ref<Preparation>({
  destination: "NONE",
  note: "",
  modifiers: [],
});
const modifierText = ref("");
const preparationDestinations = [
  { label: "Sin preparación", value: "NONE" },
  { label: "Cocina", value: "KITCHEN" },
  { label: "Barra", value: "BAR" },
];
function editPreparation(line: Line) {
  preparationLine.value = line;
  supplementIds.value = [...(line.supplementIds || [])];
  supplementChoices.value = (line.supplements || []).map((x) => ({
    id: x.id,
    name: x.name,
  }));
  supplementError.value = "";
  supplementQuery.value = "";
  preparationDraft.value = JSON.parse(
    JSON.stringify(
      line.preparation || { destination: "NONE", note: "", modifiers: [] },
    ),
  );
  modifierText.value = preparationDraft.value.modifiers.join("\n");
  preparationVisible.value = true;
}
async function separatePreparationUnit() {
  const line = preparationLine.value;
  if (!line || line.quantity <= 1 || busy.value) return;
  busy.value = true;
  try {
    const [remaining, unit] = await Promise.all([
      quoteConfigured(line, line.quantity - 1),
      quoteConfigured(line, 1),
    ]);
    const index = lines.value.indexOf(line);
    if (index < 0) return;
    remaining.preparation = line.preparation;
    remaining.savedLineId = line.savedLineId;
    remaining.uiKey = line.uiKey;
    unit.uiKey = createUuid();
    unit.preparation = JSON.parse(
      JSON.stringify(
        line.preparation || { destination: "NONE", modifiers: [], note: "" },
      ),
    );
    lines.value.splice(index, 1, remaining, unit);
    preparationLine.value = unit;
  } catch (e) {
    toast.add({ severity: "error", summary: message(e), life: 6000 });
  } finally {
    busy.value = false;
  }
}
async function applyPreparation() {
  if (busy.value) return;
  if (!preparationLine.value) return;
  const modifiers = [
    ...new Set(
      modifierText.value
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ];
  if (modifiers.length > 12 || modifiers.some((v) => v.length > 60)) {
    toast.add({
      severity: "warn",
      summary: "Máximo 12 modificadores de 60 caracteres",
      life: 5000,
    });
    return;
  }
  busy.value = true;
  try {
    const current = preparationLine.value;
    const priced = await quoteConfigured(
      current,
      current.quantity,
      supplementIds.value,
    );
    Object.assign(current, priced, {
      savedLineId: current.savedLineId,
      uiKey: current.uiKey,
      preparation: { ...preparationDraft.value, modifiers },
    });
    preparationVisible.value = false;
  } catch (e) {
    supplementError.value = message(e);
  } finally {
    busy.value = false;
  }
}
const kitchenDestination = ref<"KITCHEN" | "BAR">("KITCHEN");
const routingVisible = ref(false),
  routingError = ref("");
const routingLines = ref<
  Array<{ line: Line; destination: Preparation["destination"] }>
>([]);
function requestPreparation() {
  if (busy.value || !activeTable.value || !lines.value.length) return;
  if (
    lines.value.some(
      (line) => !line.preparation || line.preparation.destination === "NONE",
    )
  ) {
    routingLines.value = lines.value.map((line) => ({
      line,
      destination:
        line.preparation?.destination && line.preparation.destination !== "NONE"
          ? line.preparation.destination
          : "KITCHEN",
    }));
    routingError.value = "";
    routingVisible.value = true;
    return;
  }
  void sendPreparation();
}
async function confirmPreparation() {
  if (!routingLines.value.some((row) => row.destination !== "NONE")) {
    routingError.value =
      "Selecciona Cocina o Barra para al menos una consumición.";
    return;
  }
  for (const row of routingLines.value) {
    row.line.preparation = {
      note: row.line.preparation?.note || "",
      modifiers: row.line.preparation?.modifiers || [],
      destination: row.destination,
    };
  }
  routingVisible.value = false;
  await sendPreparation();
}
async function sendPreparation() {
  const routed = lines.value.find(
    (line) =>
      line.preparation?.destination === "KITCHEN" ||
      line.preparation?.destination === "BAR",
  );
  if (!routed) {
    barError.value = "Selecciona Cocina o Barra antes de enviar la comanda.";
    return;
  }
  kitchenDestination.value = routed.preparation!.destination as
    | "KITCHEN"
    | "BAR";
  if (!activeTable.value || !(await saveTable())) return;
  busy.value = true;
  barError.value = "";
  try {
    const { data } = await axios.post(
      backendUrl(`/WebTpv/tables/${activeTable.value.id}/kitchen`),
      { revision: barRevision.value, openingId: workplace.value?.openingId },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    toast.add({
      severity: data.orders.length ? "success" : "info",
      summary: data.orders.length
        ? "Comanda enviada a preparación"
        : "Preparación actualizada; no hay cambios pendientes",
      detail:
        "Desde ahora, guardar la mesa enviará los cambios de preparación. Imprime desde Cocina y barra.",
      life: 6500,
    });
    kitchenVisible.value = true;
  } catch (e) {
    barError.value = message(e);
  } finally {
    busy.value = false;
  }
}
const partialMode = ref(false),
  partialVisible = ref(false),
  partialTotal = ref(0),
  partialError = ref("");
const partialCheckoutLines = ref<CheckoutLine[]>([]);
const partialRows = ref<Array<{ line: Line; quantity: number | null }>>([]);
async function openPartial() {
  if (!(await saveTable())) return;
  partialRows.value = lines.value.map((line) => ({ line, quantity: 0 }));
  partialError.value = "";
  partialVisible.value = true;
}
async function previewPartial() {
  if (busy.value || !activeTable.value) return;
  const selection = partialRows.value
    .filter((r) => (r.quantity || 0) > 0)
    .map((r) => ({ savedLineId: r.line.savedLineId, quantity: r.quantity }));
  if (!selection.length) {
    partialError.value = "Selecciona alguna cantidad.";
    return;
  }
  busy.value = true;
  try {
    const { data } = await axios.post(
      backendUrl(`/WebTpv/tables/${activeTable.value.id}/partial-preview`),
      {
        lines: selection,
        openingId: workplace.value?.openingId,
        revision: barRevision.value,
      },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    partialCheckoutLines.value = data.lines;
    partialTotal.value = Number(data.total);
    partialMode.value = true;
    partialVisible.value = false;
    checkoutDialog.value = true;
  } catch (e) {
    partialError.value = message(e);
  } finally {
    busy.value = false;
  }
}
const cancelVisible = ref(false),
  cancelError = ref(""),
  cancelReason = ref("");
let cancelIndex = -1,
  cancelQuantity = 0;
function requestCancellation(line: Line | null, quantity: number) {
  cancelIndex = line ? lines.value.indexOf(line) : -1;
  if (line && cancelIndex < 0) {
    barError.value = "La consumición ha cambiado. Recarga la mesa.";
    return;
  }
  cancelQuantity = quantity;
  cancelReason.value = "";
  cancelError.value = "";
  editing.value = false;
  cancelVisible.value = true;
}
async function confirmCancellation() {
  if (busy.value || cancelReason.value.trim().length < 3) return;
  if (!(await saveTable())) {
    cancelError.value = barError.value;
    return;
  }
  const before = [...lines.value];
  try {
    if (cancelIndex < 0) lines.value = [];
    else if (cancelQuantity <= 0)
      lines.value = lines.value.filter((_, i) => i !== cancelIndex);
    else {
      busy.value = true;
      await updateLine(lines.value[cancelIndex], cancelQuantity);
      busy.value = false;
    }
    cancellationReason.value = cancelReason.value.trim();
    if (await saveTable()) {
      cancelVisible.value = false;
      toast.add({
        severity: "success",
        summary: "Anulación registrada",
        life: 4000,
      });
    } else {
      lines.value = before;
      cancelError.value = barError.value;
    }
  } catch (e) {
    lines.value = before;
    cancelError.value = message(e);
  } finally {
    busy.value = false;
  }
}
const auditVisible = ref(false),
  auditPage = ref(0),
  auditError = ref("");
const auditRows = ref<
  Array<{
    id: number;
    ticketId: number;
    productId: number;
    quantity: number;
    reason: string;
    operator: string;
    sentToKitchen: boolean;
    createdAt: number;
  }>
>([]);
async function openCancellationHistory() {
  auditPage.value = 0;
  auditVisible.value = true;
  await loadCancellationHistory();
}
async function loadCancellationHistory() {
  if (!activeTable.value) return;
  busy.value = true;
  auditError.value = "";
  try {
    auditRows.value = await get(
      `tables/${activeTable.value.id}/cancellations`,
      { page: auditPage.value },
    );
  } catch (e) {
    auditError.value = message(e);
  } finally {
    busy.value = false;
  }
}
const supplementQuery = ref(""),
  supplementIds = ref<number[]>([]),
  supplementChoices = ref<Array<{ id: number; name: string }>>([]),
  supplementError = ref("");
async function searchSupplements() {
  if (busy.value) return;
  busy.value = true;
  supplementError.value = "";
  try {
    const result = await get<{ content: Product[] }>("products", {
      query: supplementQuery.value.trim(),
      page: 0,
    });
    const chosen = supplementChoices.value.filter((p) =>
      supplementIds.value.includes(p.id),
    );
    supplementChoices.value = [
      ...chosen,
      ...result.content.filter(
        (p) =>
          p.id !== preparationLine.value?.id &&
          !chosen.some((c) => c.id === p.id),
      ),
    ];
  } catch (e) {
    supplementError.value = message(e);
  } finally {
    busy.value = false;
  }
}
const tableActionsVisible = ref(false);
async function prepareTableActions() {
  if (await saveTable()) tableActionsVisible.value = true;
}
function tableActionsDone() {
  tableActionsVisible.value = false;
  activeTable.value = null;
  lines.value = [];
  customer.value = null;
  barError.value = "";
  toast.add({
    severity: "success",
    summary: "Operación de mesa completada",
    life: 3000,
  });
}
async function requestBill(printCopy = false) {
  if (!activeTable.value || !(await saveTable())) return;
  busy.value = true;
  barError.value = "";
  try {
    await axios.post(
      backendUrl(`/WebTpv/tables/${activeTable.value.id}/bill`),
      { revision: barRevision.value, openingId: workplace.value?.openingId },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    acceptTicket(
      await get<TableTicket>(`tables/${activeTable.value.id}/ticket`),
    );
    if (printCopy) {
      const result = await printConfiguredReceipt(
        {
          documentKind: "PREBILL",
          chargedAt: new Date().toISOString(),
          currency: currency.value,
          tableName: activeTable.value.name,
          zoneName: workplace.value?.zoneName,
          registerName: workplace.value?.registerName,
          cashier: auth.user?.name,
          customerName: customer.value?.name,
          customerNif: customer.value?.nif,
          net: net.value / 100,
          tax: tax.value / 100,
          total: amount.value / 100,
          lines: lines.value.map((l) => ({
            name: l.name,
            quantity: l.quantity,
            unitGross: l.unitGross,
            total: l.totalCents / 100,
          })),
        },
        String(workplace.value?.registerId ?? ""),
      );
      toast.add({ severity: "success", summary: result, life: 4000 });
    }
  } catch (e) {
    barError.value = message(e);
  } finally {
    busy.value = false;
  }
}
function clearTicket() {
  if (busy.value) return;
  if (isBarMode.value && activeTable.value) {
    confirmClear.value = false;
    requestCancellation(null, 0);
    return;
  }
  lines.value = [];
  confirmClear.value = false;
}
/** Cobro fiscal F2 del ticket guardado. */
const checkoutDialog = ref(false);
const checkoutPending = ref(false);
const checkoutLines = computed<CheckoutLine[]>(() =>
  partialMode.value
    ? partialCheckoutLines.value
    : lines.value.map((line) => ({
        productId: line.id,
        quantity: line.quantity,
      })),
);
async function startCheckout() {
  if (openingInvalid.value) return;
  if (busy.value || endingSession.value || !lines.value.length) return;
  // En Bar el cobro parte del ticket guardado de la mesa.
  if (isBarMode.value && activeTable.value && !(await saveTable())) return;
  partialMode.value = false;
  checkoutDialog.value = true;
}
function onPaid(_receipt: TpvReceipt) {
  activeTable.value = null;
  lines.value = [];
  barError.value = "";
  cartOnly.value = false;
  keypadText.value = "";
  showAlpha.value = false;
}
const family = ref<number | null>(null);
const query = ref("");
const total = ref(0);
const page = ref(0);
const loading = ref(false);
const busy = ref(false);
const error = ref("");
const editing = ref(false);
const editError = ref("");
const selectedLine = ref<Line | null>(null);
const editQuantity = ref<number | null>(1);
const editEntry = ref("");
const confirmClear = ref(false);
const cartOnly = ref(false);
const cartProducts = computed(() =>
  cartOnly.value ? lines.value : products.value,
);
const highlighted = ref<number | null>(null);
const brokenImages = ref(new Set<number>());
const brokenFamilies = ref(new Set<number>());
const searchInput = ref<HTMLInputElement>();
const ticketBody = ref<HTMLElement>();
let generation = 0;
let searchTimer: ReturnType<typeof setTimeout> | undefined;
let highlightTimer: ReturnType<typeof setTimeout> | undefined;
let disposed = false;
const familyName = computed(
  () =>
    families.value.find((item) => item.id === family.value)?.name ||
    "Todos los productos",
);
const currency = computed(
  () =>
    lines.value[0]?.currency ||
    products.value.find((p) => p.currency)?.currency ||
    "EUR",
);
const net = computed(() =>
  lines.value.reduce((sum, line) => sum + line.netCents, 0),
);
const tax = computed(() =>
  lines.value.reduce((sum, line) => sum + line.taxCents, 0),
);
const amount = computed(() => net.value + tax.value);
const groupThousands = (intPart: string) =>
  intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const number = (value: number) => {
  const rounded = Math.round(Number(value) * 1000) / 1000;
  const [i, d] = String(rounded).split(".");
  const grouped = groupThousands(i);
  return d ? `${grouped},${d}` : grouped;
};
function money(value: number, code = "EUR") {
  const abs = Math.abs(Number(value) || 0);
  let euros = Math.floor(abs);
  let cents = Math.round((abs - euros) * 100);
  if (cents === 100) {
    euros += 1;
    cents = 0;
  }
  const symbol = code === "EUR" ? "€" : code;
  return `${Number(value) < 0 ? "-" : ""}${groupThousands(String(euros))},${String(cents).padStart(2, "0")} ${symbol}`;
}
const quantityOf = (id: number) =>
  lines.value
    .filter((line) => line.id === id)
    .reduce((sum, line) => sum + line.quantity, 0);
let audioCtx: AudioContext | null = null;
/**
 * Pitido tipo lector de código de barras (onda cuadrada ~2,6 kHz, 100 ms).
 * Solo en modo Tienda: en modo Bar el ticket lo maneja la mesa en silencio.
 */
function beep() {
  if (isBarMode.value) return;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    audioCtx ??= new Ctor();
    if (audioCtx.state === "suspended") void audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    osc.type = "square";
    osc.frequency.value = 2600;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.008);
    gain.gain.setValueAtTime(0.06, now + 0.085);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  } catch {
    /* sin audio: la venta sigue en silencio */
  }
}
function message(e: unknown) {
  if (e instanceof Error && !axios.isAxiosError(e)) return e.message;
  if (axios.isAxiosError(e)) {
    if (e.response?.status === 401)
      return "La sesión ha caducado. Vuelve a iniciar sesión.";
    if (e.response?.status === 403)
      return "No tienes permiso para acceder al TPV.";
    if (e.response?.status === 404)
      return "El catálogo TPV no está disponible. Revisa que el backend esté actualizado.";
    const detail = e.response?.data;
    if (typeof detail === "string" && !detail.includes("<")) return detail;
    if (detail?.message) return detail.message;
  }
  return "No se pudo consultar el servidor. El ticket se conserva; vuelve a intentarlo.";
}
async function get<T>(path: string, params = {}): Promise<T> {
  const response = await axios.get<T>(backendUrl(`/WebTpv/${path}`), {
    ...auth.portalRequestConfig(),
    params,
    timeout: 15000,
  });
  return response.data;
}
async function load() {
  const version = ++generation;
  loading.value = true;
  products.value = [];
  error.value = "";
  try {
    const result = await get<{ content: Product[]; totalElements: number }>(
      "products",
      { query: query.value.trim(), familyId: family.value, page: page.value },
    );
    if (version !== generation || disposed) return;
    products.value = result.content;
    total.value = result.totalElements;
  } catch (e) {
    if (version === generation && !disposed) {
      error.value = message(e);
      total.value = 0;
    }
  } finally {
    if (version === generation && !disposed) loading.value = false;
  }
}
async function refresh() {
  clearTimeout(searchTimer);
  try {
    families.value = await get("families");
  } catch (e) {
    error.value = message(e);
    return;
  }
  await load();
}
function selectFamily(id: number | null) {
  family.value = id;
  page.value = 0;
  if (query.value) query.value = "";
  else void load();
}
function changePage(delta: number) {
  page.value += delta;
  void load();
}
watch(query, () => {
  clearTimeout(searchTimer);
  ++generation; // Invalidate old requests immediately, including during the debounce window.
  loading.value = true;
  page.value = 0;
  searchTimer = setTimeout(load, 250);
});
function lineKey(line: Line): string {
  return line.uiKey
    ? "local-" + line.uiKey
    : line.savedLineId
      ? "saved-" + line.savedLineId
      : "product-" + line.id;
}
async function quoteConfigured(
  product: Product,
  quantity: number,
  supplementIds = (product as Line).supplementIds || [],
) {
  const { data } = await axios.post<Line>(
    backendUrl(`/WebTpv/products/${product.id}/configured-quote`),
    { quantity, supplementIds },
    { ...auth.portalRequestConfig(), timeout: 15000 },
  );
  return data;
}
async function updateLine(product: Product, quantity: number) {
  const line = isBarMode.value
    ? await quoteConfigured(product, quantity)
    : await get<Line>(`products/${product.id}/quote`, { quantity });
  if (disposed) return;
  if (lines.value.length && line.currency !== currency.value)
    throw new Error("No se pueden mezclar monedas en el ticket.");
  const index =
    lines.value.indexOf(product as Line) >= 0
      ? lines.value.indexOf(product as Line)
      : lines.value.indexOf(catalogLine(lines.value, line.id) as Line);
  if (index >= 0) {
    line.preparation = lines.value[index].preparation;
    line.savedLineId = lines.value[index].savedLineId;
    line.uiKey = lines.value[index].uiKey;
  } else line.uiKey = createUuid();
  if (index < 0) lines.value.push(line);
  else lines.value[index] = line;
  beep();
  highlighted.value = line.id;
  clearTimeout(highlightTimer);
  highlightTimer = setTimeout(() => {
    highlighted.value = null;
  }, 1300);
  await nextTick();
  ticketBody.value
    ?.querySelector(`[data-line="${lineKey(line)}"]`)
    ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
async function setQuantity(product: Product, quantity: number) {
  if (busy.value) return false;
  if (
    isBarMode.value &&
    activeTable.value &&
    lines.value.includes(product as Line) &&
    quantity < (product as Line).quantity
  ) {
    requestCancellation(product as Line, quantity);
    return false;
  }
  busy.value = true;
  error.value = "";
  try {
    await updateLine(product, quantity);
    return true;
  } catch (e) {
    error.value = axios.isAxiosError(e)
      ? message(e)
      : e instanceof Error
        ? e.message
        : message(e);
    return false;
  } finally {
    busy.value = false;
  }
}
async function add(product: Product) {
  if (!workplace.value) return;
  const keepFocus = document.activeElement === searchInput.value;
  const existing = lines.value.includes(product as Line)
    ? (product as Line)
    : catalogLine(lines.value, product.id);
  await setQuantity(existing || product, (existing?.quantity || 0) + keyQty());
  // La cantidad marcada queda fija para los siguientes artículos (C la borra).
  if (keepFocus) searchInput.value?.focus();
}
/** Candado solo del flotante alfanumérico (el numérico siempre escribe). Se recuerda. */
const KEYPAD_KEY = "kiwik.tpv.keypadLocked";
const keypadLocked = ref(false);
try {
  keypadLocked.value = localStorage.getItem(KEYPAD_KEY) === "1";
} catch {
  /* sin almacenamiento: desbloqueado */
}
function toggleKeypadLock() {
  keypadLocked.value = !keypadLocked.value;
  try {
    localStorage.setItem(KEYPAD_KEY, keypadLocked.value ? "1" : "0");
  } catch {
    /* sin almacenamiento */
  }
  if (keypadLocked.value) {
    keypadText.value = "";
    showAlpha.value = false;
  }
}
/** Teclado numérico: cantidad para el próximo artículo tocado. */
const keypadText = ref("");
/** Diálogo de cobro no modal: el teclado principal escribe el entregado. */
const checkoutDlg = ref<InstanceType<typeof TpvCheckoutDialog> | null>(null);
function keyQty() {
  const n = Number(keypadText.value.replace(",", "."));
  return n > 0 && n <= 99999 ? n : 1;
}
function key(digit: string) {
  // Closing uses the main keypad; never leak keystrokes into the next sale.
  if (closeCashDialog.value) {
    if (closingCash.value) return;
    if (digit === ",") {
      if (!countedText.value.includes(","))
        countedText.value = (countedText.value || "0") + ",";
    } else {
      const [whole, fraction] = countedText.value.split(",");
      if (fraction !== undefined ? fraction.length >= 2 : whole.length >= 12)
        return;
      countedText.value += digit;
    }
    syncCountedFromText();
    return;
  }
  if (editing.value) {
    pushKey(editEntry, digit);
    editQuantity.value =
      Number((editEntry.value || "0").replace(",", ".")) || 0;
    return;
  }
  if (checkoutDialog.value) {
    checkoutDlg.value?.pressKey(digit);
    return;
  }
  pushKey(keypadText, digit);
}
function pushKey(text: { value: string }, digit: string) {
  if (digit === ",") {
    if (text.value.includes(",")) return;
    text.value += text.value ? "," : "0,";
    return;
  }
  if (text.value.replace(/[^0-9]/g, "").length >= 5) return;
  const next = text.value + digit;
  if (Number(next.replace(",", ".")) > 99999) return;
  text.value = next;
}
function keyBack() {
  if (closeCashDialog.value) {
    if (closingCash.value) return;
    countedText.value = countedText.value.slice(0, -1);
    syncCountedFromText();
    return;
  }
  if (editing.value) {
    editEntry.value = editEntry.value.slice(0, -1);
    editQuantity.value =
      Number((editEntry.value || "0").replace(",", ".")) || 0;
    return;
  }
  if (checkoutDialog.value) {
    checkoutDlg.value?.pressBack();
    return;
  }
  keypadText.value = keypadText.value.slice(0, -1);
}
function keyClear() {
  if (closeCashDialog.value) {
    if (closingCash.value) return;
    countedText.value = "";
    syncCountedFromText();
    return;
  }
  if (editing.value) {
    editEntry.value = "";
    editQuantity.value = 0;
    return;
  }
  if (checkoutDialog.value) {
    checkoutDlg.value?.pressClear();
    return;
  }
  keypadText.value = "";
}
/** Teclado alfanumérico flotante: escribe en el buscador con foco. */
const showAlpha = ref(false);
const alphaShift = ref(true);
const alphaTarget = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const alphaRows = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ"],
  ["z", "x", "c", "v", "b", "n", "m", ".", ",", "-"],
];
function trackAlphaTarget() {
  const el = document.activeElement;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
    alphaTarget.value = el;
}
/** El teclado aparece solo al enfocar buscadores marcados con data-alpha. */
function onAlphaFocusIn() {
  const el = document.activeElement;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
    alphaTarget.value = el;
  const isAlphaSearch =
    (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) &&
    (el as HTMLInputElement).dataset.alpha === "1";
  if (isAlphaSearch && !keypadLocked.value) {
    if (!alphaPos.value) alphaPos.value = loadAlphaPos();
    showAlpha.value = true;
  } else if (showAlpha.value && el !== document.body) {
    showAlpha.value = false;
  }
}
/** Ocultar manual: no reaparece hasta enfocar otro buscador. */
function alphaHide() {
  showAlpha.value = false;
  (document.activeElement as HTMLElement | null)?.blur?.();
}
/**
 * Petición explícita del teclado (p. ej. botón "Teclado" de la pantalla de
 * puesto). A diferencia del auto-foco, ignora el candado y lo desbloquea para
 * que los siguientes focos también abran el flotante en TPVs sin teclado.
 */
function forceAlphaShow() {
  trackAlphaTarget();
  if (keypadLocked.value) {
    keypadLocked.value = false;
    try {
      localStorage.setItem(KEYPAD_KEY, "0");
    } catch {
      /* sin almacenamiento */
    }
  }
  if (!alphaPos.value) alphaPos.value = loadAlphaPos();
  showAlpha.value = true;
}
/** Al perder el foco del buscador, el teclado se quita (salvo en pleno arrastre). */
function onAlphaFocusOut() {
  if (draggingAlpha) return;
  window.setTimeout(() => {
    if (draggingAlpha || !showAlpha.value) return;
    const el = document.activeElement;
    const inKeyboard =
      el instanceof HTMLElement && !!el.closest?.(".alpha-keyboard");
    const isAlphaSearch =
      (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) &&
      (el as HTMLInputElement).dataset.alpha === "1";
    if (!inKeyboard && !isAlphaSearch) showAlpha.value = false;
  }, 0);
}
const alphaPos = ref<{ left: number; top: number } | null>(null);
const ALPHA_POS_KEY = "kiwik.tpv.alphaPos";
function loadAlphaPos(): { left: number; top: number } | null {
  try {
    const raw = localStorage.getItem(ALPHA_POS_KEY);
    if (!raw) return null;
    const pos = JSON.parse(raw);
    if (typeof pos?.left !== "number" || typeof pos?.top !== "number")
      return null;
    return {
      left: Math.max(0, Math.min(window.innerWidth - 120, pos.left)),
      top: Math.max(0, Math.min(window.innerHeight - 80, pos.top)),
    };
  } catch {
    return null;
  }
}
function saveAlphaPos() {
  try {
    if (alphaPos.value)
      localStorage.setItem(ALPHA_POS_KEY, JSON.stringify(alphaPos.value));
  } catch {
    /* sin almacenamiento */
  }
}
let draggingAlpha = false;
function alphaDragStart(e: PointerEvent) {
  if ((e.target as HTMLElement).closest("button")) return;
  const box = (e.currentTarget as HTMLElement).closest(
    ".alpha-keyboard",
  ) as HTMLElement | null;
  if (!box) return;
  draggingAlpha = true;
  const rect = box.getBoundingClientRect();
  const dx = e.clientX - rect.left;
  const dy = e.clientY - rect.top;
  const move = (m: PointerEvent) => {
    alphaPos.value = {
      left: Math.max(0, Math.min(window.innerWidth - 120, m.clientX - dx)),
      top: Math.max(0, Math.min(window.innerHeight - 80, m.clientY - dy)),
    };
  };
  const up = () => {
    draggingAlpha = false;
    saveAlphaPos();
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
}
function alphaType(char: string) {
  trackAlphaTarget();
  const target = alphaTarget.value;
  if (!target || target.disabled || target.readOnly) return;
  const text = alphaShift.value
    ? char.toLocaleUpperCase("es")
    : char.toLocaleLowerCase("es");
  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? start;
  const next = target.value.slice(0, start) + text + target.value.slice(end);
  const proto =
    target instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(target, next);
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.focus();
  target.setSelectionRange(start + text.length, start + text.length);
}
function alphaBack() {
  trackAlphaTarget();
  const target = alphaTarget.value;
  if (!target || target.disabled || target.readOnly) return;
  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? start;
  const from = start === end ? Math.max(0, start - 1) : start;
  const next = target.value.slice(0, from) + target.value.slice(end);
  const proto =
    target instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(target, next);
  target.dispatchEvent(new Event("input", { bubbles: true }));
  target.focus();
  target.setSelectionRange(from, from);
}
function alphaEnter() {
  const target = alphaTarget.value;
  if (target?.form) (target.form as HTMLFormElement).requestSubmit();
  else target?.blur();
}
async function scan() {
  if (!workplace.value) return;
  if (busy.value || !query.value.trim()) return;
  const code = query.value.trim();
  busy.value = true;
  error.value = "";
  try {
    const result = await get<{ content: Product[]; totalElements: number }>(
      "products",
      { query: code, exactBarcode: true },
    );
    const product = result.content[0];
    if (result.totalElements !== 1 || !product) {
      error.value =
        result.totalElements > 1
          ? "Código duplicado: selecciona el artículo correcto en la botonera."
          : "Código de barras no encontrado. No se ha añadido ningún artículo.";
      return;
    }
    const existing = catalogLine(lines.value, product.id);
    await updateLine(existing || product, (existing?.quantity || 0) + 1);
    if (query.value.trim() === code) query.value = "";
  } catch (e) {
    error.value = axios.isAxiosError(e)
      ? message(e)
      : e instanceof Error
        ? e.message
        : message(e);
  } finally {
    busy.value = false;
    searchInput.value?.focus();
  }
}
function remove(target: Line) {
  if (isBarMode.value && activeTable.value) {
    requestCancellation(target, 0);
    return;
  }
  lines.value = lines.value.filter((line) => line !== target);
}
async function requestSessionExit(action: "logout" | "switch") {
  if (busy.value || endingSession.value) return;
  // Table tickets belong to the table. Save before changing the authenticated operator.
  if (isBarMode.value && activeTable.value && !(await saveTable())) return;
  sessionAction.value = action;
  if (unsaved.value) sessionDialog.value = true;
  else void finishSession();
}
async function finishSession() {
  if (busy.value || endingSession.value) return;
  if (sessionAction.value === "switch") {
    // Cambio rápido sin pasar por el login: se vacía con aviso y se elige operario.
    sessionDialog.value = false;
    if (!isBarMode.value) lines.value = [];
    void openOperators();
    return;
  }
  // Confirmar antes de revocar la sesión: cancelar conserva usuario y ticket.
  endingSession.value = true;
  sessionDialog.value = false;
  lines.value = [];
  // El operario de TPV vuelve al acceso por PIN; el admin, al login del ERP.
  const backToTpvPin = auth.user?.admin !== true;
  auth.logout();
  await router.replace(
    backToTpvPin
      ? { name: "Login", query: { access: "tpv" } }
      : { name: "Login" },
  );
}
function edit(line: Line) {
  selectedLine.value = line;
  editQuantity.value = line.quantity;
  editEntry.value = String(line.quantity).replace(".", ",");
  editError.value = "";
  editing.value = true;
}
/** Cambio rápido de operario con el PIN de su ficha (sin escribir usuario ni clave). */
interface TpvOperator {
  id: number;
  name: string;
  code: string;
}
const opDialog = ref(false);
const operators = ref<TpvOperator[]>([]);
const opLoading = ref(false);
const opSelected = ref<TpvOperator | null>(null);
const opPin = ref("");
const opBusy = ref(false);
const opError = ref("");
const brokenOps = ref(new Set<number>());
const opPhotoUrl = (id: number) =>
  backendUrl(`/gestdoc/users/${id}/photoPerfil.jpg?t=${auth.photoTimestamp}`);
const opInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toLocaleUpperCase("es") || "?";
async function openOperators() {
  opSelected.value = null;
  opPin.value = "";
  opError.value = "";
  opDialog.value = true;
  opLoading.value = true;
  try {
    operators.value = await get<TpvOperator[]>("operators");
  } catch (e) {
    operators.value = [];
    opError.value = axios.isAxiosError(e)
      ? message(e)
      : "No se pudo cargar la lista de operarios.";
  } finally {
    opLoading.value = false;
  }
}
function opKey(digit: string) {
  if (opBusy.value) return;
  if (opPin.value.replace(/\D/g, "").length >= 12) return;
  opPin.value += digit;
}
function opBack() {
  opPin.value = opPin.value.slice(0, -1);
}
async function opSubmit() {
  if (!opSelected.value || opBusy.value || !opPin.value) return;
  opBusy.value = true;
  opError.value = "";
  try {
    const response = await axios.post(
      backendUrl("/WebTpv/quickLogin"),
      { userId: opSelected.value.id, pin: opPin.value },
      { timeout: 15000 },
    );
    auth.logout();
    auth.setUser(
      response.data,
      (response.headers as any)["x-portal-session"] || "",
      "tpv",
    );
    try {
      await useSecurityStore().loadSecurity(response.data.pkid);
    } catch {
      /* la ruta reintentará */
    }
    lines.value = [];
    activeTable.value = null;
    barError.value = "";
    keypadText.value = "";
    family.value = null;
    page.value = 0;
    if (query.value) query.value = "";
    opDialog.value = false;
    await refresh();
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      toast.add({ severity: "error", summary: "PIN incorrecto", life: 3000 });
    } else {
      opError.value = message(e);
    }
    opPin.value = "";
  } finally {
    opBusy.value = false;
  }
}
async function applyQuantity() {
  if (!selectedLine.value || !editQuantity.value) return;
  if (await setQuantity(selectedLine.value, editQuantity.value))
    editing.value = false;
  else editError.value = error.value;
}
// Unsaved preparation must never disappear silently on navigation or browser close.
const { invalid: openingInvalid, warning: presenceWarning } = useTpvPresence(
  workplace,
  computed(() => lines.value.length > 0 || checkoutPending.value || busy.value),
);
function beforeUnload(event: BeforeUnloadEvent) {
  if (unsaved.value || busy.value || checkoutPending.value) {
    event.preventDefault();
    event.returnValue = "";
  }
}
onBeforeRouteLeave(
  () =>
    !checkoutPending.value &&
    (endingSession.value ||
      !(unsaved.value || busy.value) ||
      window.confirm(
        "La venta no está guardada. ¿Quieres salir y descartar el ticket?",
      )),
);
onMounted(() => {
  if (!showCentral.value) void refresh();

  window.addEventListener("beforeunload", beforeUnload);
  document.addEventListener("focusin", onAlphaFocusIn);
  document.addEventListener("focusout", onAlphaFocusOut);
  window.addEventListener("kiwik:alpha-show", forceAlphaShow);
  searchInput.value?.focus();
});
onBeforeUnmount(() => {
  disposed = true;
  ++generation;
  clearTimeout(searchTimer);
  clearTimeout(highlightTimer);
  window.removeEventListener("beforeunload", beforeUnload);
  document.removeEventListener("focusin", onAlphaFocusIn);
  document.removeEventListener("focusout", onAlphaFocusOut);
  window.removeEventListener("kiwik:alpha-show", forceAlphaShow);
});
</script>

<style scoped src="./tpv.css"></style>

<style scoped>
.preparation-form {
  display: grid;
  gap: 1rem;
}
.preparation-form label {
  display: grid;
  gap: 0.5rem;
}
.preparation-form textarea {
  font: inherit;
  border: 1px solid #dce3d4;
  border-radius: 8px;
  padding: 0.75rem;
  width: 100%;
}
.preparation-summary {
  font-size: 0.85rem;
  color: #64734e;
  margin: 0.4rem 0;
}
</style>

<style scoped>
.preparation-routing {
  display: grid;
  gap: 0.75rem;
  max-height: 50vh;
  overflow: auto;
}
.preparation-route {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 11rem;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem;
  background: #f7f9f3;
  border: 1px solid #e3e8d9;
  border-radius: 10px;
}
.preparation-route label {
  display: grid;
  gap: 0.4rem;
}
.preparation-route small {
  color: #687563;
}
.routing-footer {
  width: 100%;
}
.routing-footer > .kiwik-separator {
  width: 100%;
  margin: 0.75rem 0;
}
.routing-footer > div:last-child {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.routing-error {
  color: #b42318;
}
@media (max-width: 500px) {
  .preparation-route {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
.guest-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}
.guest-field :deep(input) {
  width: 6rem;
}
.partial-rows {
  display: grid;
  gap: 0.75rem;
  max-height: 55vh;
  overflow: auto;
}
.partial-rows > label {
  display: grid;
  grid-template-columns: 1fr 8rem;
  gap: 1rem;
  align-items: center;
  border-bottom: 1px solid #e3e8d9;
  padding: 0.75rem 0;
}
.partial-rows small {
  display: block;
  color: #687563;
  margin-top: 0.4rem;
}
.partial-rows :deep(input) {
  width: 100%;
  min-width: 0;
}
.operation-field,
.supplement-picker {
  display: grid;
  gap: 0.6rem;
}
.operation-field textarea {
  font: inherit;
  padding: 0.75rem;
  border: 1px solid #dce3d4;
  border-radius: 8px;
  width: 100%;
}
.supplement-search {
  display: flex;
  gap: 0.5rem;
}
.supplement-search > input {
  min-width: 0;
  flex: 1;
}
.supplement-picker small {
  color: #687563;
  font-size: 0.8rem;
}
.audit-row {
  padding: 1rem 0;
  border-bottom: 1px solid #e3e8d9;
}
.audit-row p {
  margin: 0.5rem 0;
}
</style>
