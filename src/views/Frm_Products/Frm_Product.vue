<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="
      product.pkid ? 'Editar Producto / Servicio' : 'Nuevo Producto / Servicio'
    "
    :style="{ width: '95%', height: '95%' }"
    class="kiwik-dialog"
    :dismissableMask="true"
    :pt="{
      content: {
        class: 'overflow-y-auto',
      },
    }"
  >
    <div style="max-height: 80vh; overflow-y: auto">
      <!-- ========================================= -->
      <!-- DATOS GENERALES                          -->
      <!-- ========================================= -->

      <Panel>
        <template #header>
          <div class="flex align-items-center gap-2">
            <div
              class="flex align-items-center justify-content-center bg-primary-100 border-circle"
              style="width: 32px; height: 32px"
            >
              <i class="pi pi-box text-primary"></i>
            </div>

            <span class="font-bold"> Datos Generales. </span>
          </div>
        </template>

        <div class="grid p-fluid">
          <!-- ========================================= -->
          <!-- IMAGEN                                    -->
          <!-- ========================================= -->

          <div class="flex flex-column align-items-center">
            <div
              class="border-1 surface-border border-round-lg flex align-items-center justify-content-center"
              style="
                width: 150px;
                height: 150px;
                background: var(--surface-ground);
                overflow: hidden;
              "
            >
              <i
                v-if="!product.image"
                class="pi pi-image text-400"
                style="font-size: 3rem"
              ></i>

              <img
                v-else
                :src="product.image"
                alt="Imagen del producto"
                style="width: 100%; height: 100%; object-fit: contain"
              />
            </div>

            <Button
              label="Seleccionar imagen"
              icon="pi pi-upload"
              severity="secondary"
              size="small"
              class="mt-2"
              @click="selectImage"
            />

            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleImageSelected"
            />
          </div>

          <!-- ========================================= -->
          <!-- DATOS DEL PRODUCTO                       -->
          <!-- ========================================= -->

          <div class="col-12 md:col-10">
            <!-- ===================================== -->
            <!-- CÓDIGO / DESCRIPCIONES                -->
            <!-- ===================================== -->

            <div class="grid">
              <!-- CÓDIGO -->
              <div class="col-12 md:col-12">
                <InputGroup>
                  <FloatLabel variant="on" class="w-2">
                    <InputText
                      id="code"
                      v-model="product.code"
                      maxlength="45"
                      class="w-full"
                    />

                    <label for="code"> Código </label>
                  </FloatLabel>

                  <Button
                    icon="pi pi-id-card"
                    @click="generateCode"
                    :disabled="!!product.pkid"
                    severity="secondary"
                  />

                  <div class="flex align-items-center gap-2 ml-3">
                    <Checkbox id="active" v-model="product.active" binary />

                    <label for="active"> ¿ Activo ? </label>
                  </div>
                </InputGroup>

                <InlineMessage v-if="errors.code" severity="error">
                  {{ errors.code }}
                </InlineMessage>

                <!-- ACTIVO -->
              </div>

              <!-- DESCRIPCIÓN -->
              <div class="col-12 md:col-12">
                <FloatLabel variant="on" class="w-8">
                  <InputText
                    id="description"
                    v-model="product.description"
                    maxlength="145"
                    class="w-full"
                  />

                  <label for="description"> Descripción </label>
                </FloatLabel>

                <InlineMessage v-if="errors.description" severity="error">
                  {{ errors.description }}
                </InlineMessage>
              </div>

              <!-- DESCRIPCIÓN OTRO IDIOMA -->
              <div class="col-12 md:col-12">
                <FloatLabel variant="on" class="w-8">
                  <InputText
                    id="descriptionEn"
                    v-model="product.descriptionEn"
                    maxlength="145"
                    class="w-full"
                  />

                  <label for="descriptionEn"> Descripción (Otro Idioma) </label>
                </FloatLabel>

                <InlineMessage v-if="errors.descriptionEn" severity="error">
                  {{ errors.descriptionEn }}
                </InlineMessage>
              </div>
            </div>

            <!-- ===================================== -->
            <!-- ACTIVO / FECHA / CÓDIGO BARRAS        -->
            <!-- ===================================== -->

            <div class="grid mt-1">
              <!-- FECHA DE ALTA -->
              <div class="col-12 md:col-3">
                <FloatLabel variant="on" class="w-full">
                  <DatePicker
                    id="dateUp"
                    v-model="product.dateUp"
                    class="w-full"
                    showIcon
                    iconDisplay="input"
                    dateFormat="dd/mm/yy"
                  />

                  <label for="dateUp"> Fecha de Alta </label>
                </FloatLabel>

                <InlineMessage v-if="errors.dateUp" severity="error">
                  {{ errors.dateUp }}
                </InlineMessage>
              </div>

              <!-- CÓDIGO DE BARRAS -->
              <div class="col-12 md:col-4">
                <FloatLabel variant="on" class="w-full">
                  <InputText
                    id="barcode"
                    v-model="product.barcode"
                    maxlength="25"
                    class="w-full"
                  />

                  <label for="barcode"> Código de Barras </label>
                </FloatLabel>

                <InlineMessage v-if="errors.barcode" severity="error">
                  {{ errors.barcode }}
                </InlineMessage>
              </div>
            </div>

            <!-- ===================================== -->
            <!-- Tipo/ CATEGORÍA / FAMILIA                   -->
            <!-- ===================================== -->

            <div class="grid mt-1">
              <!-- TIPO DE PRODUCTO -->
              <div class="col-12 md:col-3">
                <FloatLabel variant="on">
                  <Select
                    id="productCategory"
                    v-model="product.productCategoryId"
                    :options="productCategories"
                    optionLabel="description"
                    optionValue="pkid"
                    class="w-full"
                    filter
                  />

                  <label for="productCategory"> Tipo logístico </label>
                </FloatLabel>

                <InlineMessage v-if="errors.productCategoryId" severity="error">
                  {{ errors.productCategoryId }}
                </InlineMessage>
              </div>

              <!-- CATEGORÍA -->
              <div class="col-12 md:col-3">
                <FloatLabel variant="on">
                  <Select
                    id="category"
                    v-model="product.categoryId"
                    :options="filteredProductCategoryTypes"
                    optionLabel="description"
                    optionValue="pkid"
                    class="w-full"
                    filter
                  />

                  <label for="category"> Tipo comercial </label>
                </FloatLabel>

                <InlineMessage v-if="errors.categoryId" severity="error">
                  {{ errors.categoryId }}
                </InlineMessage>
              </div>

              <!-- CLASE TÉCNICA -->
              <div class="col-12 md:col-4">
                <InputGroup class="technical-class-input-group">
                  <FloatLabel variant="on" class="technical-class-select">
                    <Select
                      id="technicalClass"
                      v-model="product.technicalClassId"
                      :options="productTechnicalClasses"
                      optionLabel="path"
                      optionValue="pkid"
                      class="w-full"
                      filter
                    />
                    <label for="technicalClass"> Clase de producto </label>
                  </FloatLabel>
                  <Button
                    v-if="securityStore.hasPermission(PERM.PROD_MASTER_EDIT)"
                    icon="pi pi-cog"
                    severity="secondary"
                    class="technical-class-action"
                    title="Mantener clases de producto"
                    aria-label="Mantener clases de producto"
                    @click="openTechnicalClassMaintenance"
                  />
                  <Button
                    v-if="securityStore.hasPermission(PERM.PROD_MASTER_EDIT)"
                    icon="pi pi-plus"
                    severity="secondary"
                    class="technical-class-action"
                    title="Crear clase de producto"
                    aria-label="Crear clase de producto"
                    @click="openNewTechnicalClass"
                  />
                </InputGroup>
              </div>

              <!-- FAMILIA -->
              <div class="col-12 md:col-2">
                <InputGroup>
                  <FloatLabel variant="on" class="w-full">
                    <Select
                      id="family"
                      v-model="product.familyId"
                      :options="families"
                      optionLabel="description"
                      optionValue="pkid"
                      class="w-full"
                      filter
                    />

                    <label for="family"> Familia </label>
                  </FloatLabel>

                  <Button
                    v-if="
                      securityStore.hasPermission(PERM.FAM_EDIT) &&
                      securityStore.hasPermission(PERM.PROD_FAMILIES_NAV)
                    "
                    icon="pi pi-plus"
                    severity="secondary"
                    @click="openNewFamily"
                  />
                </InputGroup>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <!-- ========================================= -->
      <!-- CONFIGURACIÓN COMERCIAL                   -->
      <!-- ========================================= -->

      <Panel style="margin-top: 20px; margin-bottom: 20px">
        <template #header>
          <div class="flex align-items-center gap-2">
            <div
              class="flex align-items-center justify-content-center bg-primary-100 border-circle"
              style="width: 32px; height: 32px"
            >
              <i class="pi pi-shopping-cart text-primary"></i>
            </div>

            <span class="font-bold"> Configuración Comercial. </span>
          </div>
        </template>

        <div class="grid p-fluid">
          <div class="col-12 md:col-3">
            <div class="flex align-items-center gap-2">
              <Checkbox id="sale" v-model="product.sale" binary />

              <label for="sale"> ¿ Para vender ? </label>
            </div>
          </div>

          <div class="col-12 md:col-3">
            <div class="flex align-items-center gap-2">
              <Checkbox id="purchase" v-model="product.purchase" binary />

              <label for="purchase"> ¿ Para comprar ? </label>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <FloatLabel variant="on">
              <Select
                id="supplyStrategy"
                v-model="product.supplyStrategy"
                :options="availableSupplyStrategies"
                optionLabel="label"
                optionValue="value"
                class="w-full"
              />
              <label for="supplyStrategy">Estrategia de suministro</label>
            </FloatLabel>
          </div>
        </div>
      </Panel>

      <Panel v-if="isManufacturingStrategy" class="manufacturing-panel">
        <template #header>
          <div class="manufacturing-panel__header">
            <div class="manufacturing-panel__icon">
              <i class="pi pi-cog"></i>
            </div>
            <div>
              <b>Parámetros de fabricación</b
              ><small
                >Características generales aplicables a cualquier producto
                fabricado.</small
              >
            </div>
          </div>
        </template>
        <div class="manufacturing-nature-row">
          <FloatLabel variant="on">
            <Select
              id="manufacturingNature"
              v-model="product.manufacturingNature"
              :options="manufacturingNatures"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
            <label for="manufacturingNature">Naturaleza de fabricación</label>
          </FloatLabel>
          <small>{{ selectedManufacturingNature?.description }}</small>
        </div>
        <InlineMessage
          v-if="isLogicalManufacturingProduct"
          severity="info"
          class="w-full mb-3"
        >
          Este conjunto sólo organiza la formación. No genera existencia, número
          de serie, lote, certificado ni controles propios; sus componentes se
          desplegarán en el conjunto físico superior.
        </InlineMessage>
        <div class="manufacturing-options">
          <label
            ><Checkbox
              v-model="product.manufacturingSerialNumber"
              binary
              :disabled="isLogicalManufacturingProduct"
            />
            Generar número de serie</label
          >
          <label
            ><Checkbox
              v-model="product.manufacturingLotTracking"
              binary
              :disabled="isLogicalManufacturingProduct"
            />
            Control por lotes</label
          >
          <label
            ><Checkbox
              v-model="product.manufacturingCertificateRequired"
              binary
              :disabled="isLogicalManufacturingProduct"
            />
            Necesita certificado</label
          >
          <label
            ><Checkbox
              v-model="product.manufacturingQualityControl"
              binary
              :disabled="isLogicalManufacturingProduct"
            />
            Control de calidad</label
          >
          <label
            ><Checkbox
              v-model="product.manufacturingMaterialTraceability"
              binary
              :disabled="isLogicalManufacturingProduct"
            />
            Trazabilidad de materiales</label
          >
        </div>
        <small class="manufacturing-hint"
          ><i class="pi pi-info-circle"></i> Los procesos, fases y órdenes de
          fabricación se configurarán más adelante.</small
        >
      </Panel>

      <Panel
        v-if="
          isManufacturingStrategy &&
          selectedTechnicalClass &&
          selectedTechnicalClass.code !== 'PRODUCT'
        "
        class="technical-attributes-panel"
      >
        <template #header>
          <div class="manufacturing-panel__header">
            <div class="manufacturing-panel__icon">
              <i class="pi pi-sliders-h"></i>
            </div>
            <div>
              <b>Características técnicas</b>
              <small>{{ selectedTechnicalClass?.path || "Producto" }}</small>
            </div>
          </div>
        </template>

        <div
          v-if="applicableTechnicalAttributes.length"
          class="technical-attributes-grid"
        >
          <div
            v-for="attribute in applicableTechnicalAttributes"
            :key="attribute.pkid"
            class="technical-attribute-field"
          >
            <FloatLabel v-if="attribute.dataType === 'TEXT'" variant="on">
              <InputText
                :id="`technical-${attribute.pkid}`"
                :modelValue="technicalValue(attribute.pkid)"
                class="w-full"
                @update:modelValue="setTechnicalValue(attribute.pkid, $event)"
              />
              <label :for="`technical-${attribute.pkid}`">{{
                technicalAttributeLabel(attribute)
              }}</label>
            </FloatLabel>
            <FloatLabel
              v-else-if="attribute.dataType === 'NUMBER'"
              variant="on"
            >
              <InputNumber
                :inputId="`technical-${attribute.pkid}`"
                :modelValue="technicalNumberValue(attribute.pkid)"
                class="w-full"
                :suffix="attribute.unit ? ` ${attribute.unit}` : undefined"
                :maxFractionDigits="6"
                @update:modelValue="setTechnicalValue(attribute.pkid, $event)"
              />
              <label :for="`technical-${attribute.pkid}`">{{
                technicalAttributeLabel(attribute, false)
              }}</label>
            </FloatLabel>
            <FloatLabel v-else-if="attribute.dataType === 'DATE'" variant="on">
              <DatePicker
                :inputId="`technical-${attribute.pkid}`"
                :modelValue="technicalDateValue(attribute.pkid)"
                dateFormat="dd/mm/yy"
                showIcon
                class="w-full"
                @update:modelValue="
                  setTechnicalDateValue(attribute.pkid, $event)
                "
              />
              <label :for="`technical-${attribute.pkid}`">{{
                technicalAttributeLabel(attribute)
              }}</label>
            </FloatLabel>
            <FloatLabel v-else-if="attribute.dataType === 'LIST'" variant="on">
              <Select
                :id="`technical-${attribute.pkid}`"
                :modelValue="technicalValue(attribute.pkid) || null"
                :options="technicalAttributeOptions(attribute)"
                class="w-full"
                filter
                showClear
                @update:modelValue="setTechnicalValue(attribute.pkid, $event)"
              />
              <label :for="`technical-${attribute.pkid}`">{{
                technicalAttributeLabel(attribute)
              }}</label>
            </FloatLabel>
            <FloatLabel v-else variant="on">
              <Select
                :id="`technical-${attribute.pkid}`"
                :modelValue="technicalValue(attribute.pkid) || null"
                :options="technicalBooleanOptions"
                optionLabel="label"
                optionValue="value"
                showClear
                class="w-full"
                @update:modelValue="setTechnicalValue(attribute.pkid, $event)"
              />
              <label :for="`technical-${attribute.pkid}`">{{
                technicalAttributeLabel(attribute)
              }}</label>
            </FloatLabel>
          </div>
        </div>
        <div v-else class="technical-attributes-empty">
          <i class="pi pi-info-circle"></i>
          Esta clase todavía no tiene características técnicas configuradas.
        </div>
      </Panel>

      <!-- ========================================= -->
      <!-- TABS                                      -->
      <!-- ========================================= -->

      <Tabs
        v-if="product.sale || product.purchase"
        v-model:value="activeTab"
        style="min-height: 400px"
      >
        <TabList>
          <Tab v-if="product.sale" value="0">
            <div class="flex align-items-center">
              <i
                class="pi pi-shopping-cart text-primary mr-2"
                style="font-size: 1.3rem"
              />

              <h4 class="m-0 text-primary font-semibold">
                Parámetros de Ventas.
              </h4>
            </div>
          </Tab>

          <Tab v-if="product.purchase" value="1">
            <div class="flex align-items-center">
              <i
                class="pi pi-briefcase text-primary mr-2"
                style="font-size: 1.3rem"
              />

              <h4 class="m-0 text-primary font-semibold">
                Parámetros de Compras.
              </h4>
            </div>
          </Tab>
        </TabList>

        <TabPanels>
          <!-- VENTAS -->

          <TabPanel v-if="product.sale" value="0">
            <Panel>
              <div class="grid">
                <!-- UNIDAD DE MEDIDA -->
                <div class="col-12 md:col-3">
                  <FloatLabel variant="on">
                    <Select
                      id="uomSales"
                      v-model="product.uomId"
                      :options="groupedUnits"
                      optionGroupLabel="label"
                      optionGroupChildren="items"
                      optionLabel="description"
                      optionValue="pkid"
                      class="w-full"
                      filter
                    />

                    <label for="uomSales"> Unidad de medida </label>
                  </FloatLabel>

                  <InlineMessage v-if="errors.uomId" severity="error">
                    {{ errors.uomId }}
                  </InlineMessage>
                </div>

                <div class="col-12">
                  <ProductPricePreview :productId="product.pkid" />
                </div>
                <!-- PRECIO DE VENTA -->
                <div class="col-12 md:col-3">
                  <FloatLabel variant="on">
                    <InputNumber
                      id="salesPrice"
                      v-model="product.salePrice"
                      class="w-full"
                      mode="decimal"
                      :minFractionDigits="2"
                      :maxFractionDigits="6"
                      :min="0"
                    />

                    <label for="salePrice"> Precio de Venta </label>
                  </FloatLabel>
                </div>

                <!-- IMPUESTO DE VENTAS -->
                <div class="col-12 md:col-4">
                  <InputGroup>
                    <FloatLabel variant="on" class="w-full">
                      <Select
                        id="salesTax"
                        v-model="product.saleTaxId"
                        :options="salesTaxes"
                        optionLabel="description"
                        optionValue="pkid"
                        class="w-full"
                        filter
                      />

                      <label for="salesTax"> Impuesto de Ventas </label>
                    </FloatLabel>

                    <Button
                      v-if="securityStore.hasPermission(PERM.PROD_TAX)"
                      icon="pi pi-plus"
                      severity="secondary"
                      @click="openNewSalesTax"
                    />
                  </InputGroup>
                </div>

                <div class="col-12">
                  <div class="sales-flow-card">
                    <div class="sales-flow-header">
                      <span
                        ><i class="pi pi-directions-alt"></i> Flujo de
                        venta</span
                      ><small
                        >Determina si el pedido requiere albarán y cuándo puede
                        facturarse.</small
                      >
                    </div>
                    <div class="grid align-items-center mt-1">
                      <div class="col-12 md:col-4">
                        <Checkbox
                          id="customSalesFlow"
                          v-model="hasCustomSalesFlow"
                          binary
                        /><label for="customSalesFlow" class="ml-2"
                          >Personalizar para este producto</label
                        >
                      </div>
                      <template v-if="hasCustomSalesFlow">
                        <div class="col-12 md:col-3">
                          <Checkbox
                            id="requireDelivery"
                            v-model="product.requireDeliveryOverride"
                            binary
                          /><label for="requireDelivery" class="ml-2"
                            >Requiere albarán</label
                          >
                        </div>
                        <div class="col-12 md:col-4">
                          <FloatLabel variant="on"
                            ><Select
                              id="invoicingPolicy"
                              v-model="product.invoicingPolicyOverride"
                              :options="invoicingPolicies"
                              optionLabel="label"
                              optionValue="value"
                              :disabled="
                                product.requireDeliveryOverride === false
                              "
                              class="w-full"
                            /><label for="invoicingPolicy"
                              >Política de facturación</label
                            ></FloatLabel
                          >
                        </div>
                      </template>
                      <div v-else class="col-12 md:col-8">
                        <span class="sales-flow-inherited"
                          ><i class="pi pi-sitemap"></i> Heredado del tipo
                          comercial: <b>{{ effectiveDeliveryLabel }}</b> ·
                          <b>{{ effectiveInvoicingPolicyLabel }}</b></span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          </TabPanel>

          <!-- COMPRAS -->

          <TabPanel v-if="product.purchase" value="1">
            <Panel>
              <div class="grid">
                <!-- UNIDAD DE MEDIDA -->
                <div class="col-12 md:col-3">
                  <FloatLabel variant="on">
                    <Select
                      id="uomPurchases"
                      v-model="product.uomIdPurchases"
                      :options="groupedUnits"
                      optionGroupLabel="label"
                      optionGroupChildren="items"
                      optionLabel="description"
                      optionValue="pkid"
                      class="w-full"
                      filter
                    />

                    <label for="uomPurchases"> Unidad de medida </label>
                  </FloatLabel>

                  <InlineMessage v-if="errors.uomIdPurchases" severity="error">
                    {{ errors.uomIdPurchases }}
                  </InlineMessage>
                </div>

                <!-- PRECIO DE COMPRA -->
                <div class="col-12 md:col-3">
                  <FloatLabel variant="on">
                    <InputNumber
                      id="purchasePrice"
                      v-model="product.purchasePrice"
                      class="w-full"
                      mode="decimal"
                      :minFractionDigits="2"
                      :maxFractionDigits="6"
                      :min="0"
                    />

                    <label for="purchasePrice"> Precio de Compra </label>
                  </FloatLabel>
                </div>

                <!-- IMPUESTO DE COMPRAS -->
                <div class="col-12 md:col-4">
                  <InputGroup>
                    <FloatLabel variant="on" class="w-full">
                      <Select
                        id="purchaseTax"
                        v-model="product.purchaseTaxId"
                        :options="salesTaxes"
                        optionLabel="description"
                        optionValue="pkid"
                        class="w-full"
                        filter
                      />

                      <label for="purchaseTax"> Impuesto de Compras </label>
                    </FloatLabel>

                    <Button
                      v-if="securityStore.hasPermission(PERM.PROD_TAX)"
                      icon="pi pi-plus"
                      severity="secondary"
                      @click="openNewPurchaseTax"
                    />
                  </InputGroup>
                </div>
              </div>

              <div class="supplier-section">
                <div class="supplier-section__header">
                  <div>
                    <b><i class="pi pi-truck"></i> Proveedores del producto</b>
                    <small
                      >Proveedores homologados o alternativos a los que puede
                      solicitarse este artículo o servicio.</small
                    >
                  </div>
                  <Button
                    label="Añadir proveedor"
                    icon="pi pi-plus"
                    size="small"
                    outlined
                    @click="addPurchaseSupplier"
                  />
                </div>
                <DataTable
                  :value="product.purchaseSuppliers"
                  dataKey="rowKey"
                  class="supplier-table"
                  scrollable
                >
                  <template #empty
                    ><div class="supplier-empty">
                      Todavía no se han asociado proveedores.
                    </div></template
                  >
                  <Column header="Proveedor" style="min-width: 270px"
                    ><template #body="{ data }"
                      ><SupplierLookup
                        v-model="data.supplierId"
                        :label="supplierLabel(data)"
                        @selected="selectPurchaseSupplier(data, $event)"
                        @cleared="clearPurchaseSupplier(data)" /></template
                  ></Column>
                  <Column header="Referencia proveedor" style="min-width: 160px"
                    ><template #body="{ data }"
                      ><InputText
                        v-model="data.supplierReference"
                        maxlength="100"
                        fluid /></template
                  ></Column>
                  <Column header="Precio" style="min-width: 125px"
                    ><template #body="{ data }"
                      ><InputNumber
                        v-model="data.price"
                        mode="currency"
                        currency="EUR"
                        locale="es-ES"
                        :min="0"
                        fluid /></template
                  ></Column>
                  <Column header="Pedido mínimo" style="min-width: 120px"
                    ><template #body="{ data }"
                      ><InputNumber
                        v-model="data.minimumOrder"
                        :min="0"
                        :maxFractionDigits="3"
                        fluid /></template
                  ></Column>
                  <Column header="Plazo (días)" style="min-width: 110px"
                    ><template #body="{ data }"
                      ><InputNumber
                        v-model="data.leadTimeDays"
                        :min="0"
                        :maxFractionDigits="0"
                        fluid /></template
                  ></Column>
                  <Column header="Estado" style="min-width: 145px"
                    ><template #body="{ data }"
                      ><Select
                        v-model="data.status"
                        :options="supplierStatuses"
                        optionLabel="label"
                        optionValue="value"
                        fluid /></template
                  ></Column>
                  <Column
                    header="Preferente"
                    style="width: 95px; text-align: center"
                    ><template #body="{ data }"
                      ><Checkbox
                        v-model="data.preferred"
                        binary
                        @change="markPreferredSupplier(data)" /></template
                  ></Column>
                  <Column style="width: 55px"
                    ><template #body="{ index }"
                      ><Button
                        icon="pi pi-trash"
                        severity="danger"
                        text
                        rounded
                        aria-label="Quitar proveedor"
                        @click="removePurchaseSupplier(index)" /></template
                  ></Column>
                </DataTable>
                <div
                  v-for="supplier in product.purchaseSuppliers"
                  :key="`notes-${supplier.rowKey}`"
                  class="supplier-notes"
                >
                  <span>{{
                    supplier.supplierName ||
                    "Proveedor pendiente de seleccionar"
                  }}</span>
                  <InputText
                    v-model="supplier.supplierDescription"
                    placeholder="Descripción utilizada por el proveedor"
                    maxlength="255"
                  />
                  <Button
                    :label="supplier.notes ? 'Notas' : 'Añadir nota'"
                    :icon="supplier.notes ? 'pi pi-comment' : 'pi pi-plus'"
                    severity="secondary"
                    outlined
                    size="small"
                    @click="openSupplierNotes(supplier)"
                  />
                </div>
              </div>
            </Panel>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <template #footer>
      <Button
        v-if="securityStore.hasPermission(PERM.PROD_DOCS)"
        label="Guardar"
        icon="pi pi-check"
        @click="save"
      />
    </template>

    <div class="kiwik-separator" style="margin-top: 10px"></div>
  </Dialog>

  <Frm_FamiliaProductos ref="familiaProductosRef" @saved="handleFamilySaved" />
  <Frm_SalexTaxForm ref="salesTaxFormRef" @saved="handleSalesTaxSaved" />
  <Dialog
    v-model:visible="technicalCopyDialogVisible"
    modal
    header="Copiar características técnicas"
    :style="{ width: 'min(1050px, 96vw)' }"
    class="kiwik-dialog"
  >
    <div class="technical-copy-dialog">
      <div>
        <label class="technical-copy-label">Producto de origen</label>
        <ProductLookup
          v-model="technicalCopySourceId"
          :label="technicalCopySourceLabel"
          placeholder="Seleccionar producto de origen..."
          @selected="loadTechnicalCopySource"
          @cleared="clearTechnicalCopySource"
        />
      </div>
      <div v-if="technicalCopySourceClass" class="technical-copy-summary">
        <span><b>Clase:</b> {{ technicalCopySourceClass }}</span>
        <span
          >{{ technicalCopyRows.length }} característica(s) compatible(s)</span
        >
        <span v-if="technicalCopyIncompatibleCount">
          {{ technicalCopyIncompatibleCount }} no aplicable(s) a la clase actual
        </span>
      </div>
      <label v-if="technicalCopyRows.length" class="technical-copy-overwrite">
        <Checkbox
          v-model="technicalCopyOverwrite"
          binary
          @change="refreshTechnicalCopySelection"
        />
        Sobrescribir valores existentes
      </label>
      <DataTable
        v-if="technicalCopyRows.length"
        :value="technicalCopyRows"
        dataKey="attributeId"
        scrollable
        scrollHeight="45vh"
      >
        <Column style="width: 55px">
          <template #body="{ data }"
            ><Checkbox
              v-model="data.selected"
              binary
              :disabled="
                !data.sourceValue ||
                (!!data.currentValue && !technicalCopyOverwrite)
              "
          /></template>
        </Column>
        <Column field="name" header="Característica" />
        <Column field="sourceValue" header="Valor de origen" />
        <Column field="currentValue" header="Valor actual" />
      </DataTable>
      <InlineMessage
        v-else-if="technicalCopySourceId"
        severity="info"
        class="w-full"
      >
        El producto seleccionado no tiene valores compatibles para copiar.
      </InlineMessage>
    </div>
    <template #footer>
      <div class="kiwik-separator"></div>
      <Button
        label="Cancelar"
        text
        @click="technicalCopyDialogVisible = false"
      />
      <Button
        label="Copiar seleccionadas"
        icon="pi pi-copy"
        :disabled="!technicalCopyRows.some((row) => row.selected)"
        @click="applyTechnicalCopy"
      />
    </template>
  </Dialog>
  <Dialog
    v-model:visible="supplierNotesVisible"
    modal
    header="Notas del proveedor"
    :style="{ width: 'min(620px, 94vw)' }"
    class="kiwik-dialog"
  >
    <div class="supplier-notes-dialog">
      <span>{{ supplierNotesRow?.supplierName || "Proveedor" }}</span>
      <Textarea
        v-if="supplierNotesRow"
        v-model="supplierNotesRow.notes"
        rows="7"
        maxlength="1000"
        autoResize
        fluid
        placeholder="Observaciones internas sobre este proveedor y producto"
      />
      <small>{{ supplierNotesRow?.notes?.length || 0 }} / 1000</small>
    </div>
    <template #footer>
      <div class="kiwik-separator"></div>
      <Button
        label="Cerrar"
        icon="pi pi-check"
        @click="supplierNotesVisible = false"
      />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="technicalClassMaintenanceVisible"
    modal
    header="Clases de producto"
    :style="{ width: 'min(1100px, 96vw)' }"
    class="kiwik-dialog"
  >
    <div class="technical-class-maintenance-header">
      <div>
        <b>Estructura de clases técnicas</b>
        <small
          >Las clases utilizadas se conservan para proteger el histórico.</small
        >
      </div>
      <Button
        label="Nueva clase"
        icon="pi pi-plus"
        size="small"
        @click="openNewTechnicalClass"
      />
    </div>
    <div class="technical-class-tree-toolbar">
      <Button
        label="Expandir todo"
        icon="pi pi-angle-double-down"
        text
        size="small"
        @click="expandAllTechnicalClasses"
      />
      <Button
        label="Contraer todo"
        icon="pi pi-angle-double-up"
        text
        size="small"
        @click="collapseAllTechnicalClasses"
      />
    </div>
    <TreeTable
      :value="technicalClassTree"
      v-model:expandedKeys="technicalClassExpandedKeys"
      stripedRows
      scrollable
      scrollHeight="55vh"
      class="technical-class-tree"
    >
      <Column field="name" header="Clase" expander style="min-width: 280px">
        <template #body="{ node }">
          <div class="technical-class-tree-name">
            <i
              :class="['pi', node.children?.length ? 'pi-folder' : 'pi-tag']"
            ></i>
            <div>
              <span>{{ node.data.name }}</span>
              <small v-if="node.data.code !== 'PRODUCT'">
                {{ node.data.code }}
              </small>
            </div>
          </div>
        </template>
      </Column>
      <Column
        field="productCount"
        header="Productos"
        style="width: 105px"
        bodyClass="text-right"
      />
      <Column
        field="attributeCount"
        header="Atributos"
        style="width: 105px"
        bodyClass="text-right"
      />
      <Column
        field="childCount"
        header="Hijas"
        style="width: 85px"
        bodyClass="text-right"
      />
      <Column header="Estado" style="width: 110px">
        <template #body="{ node }">
          <span
            :class="[
              'technical-class-status',
              node.data.active ? 'is-active' : 'is-inactive',
            ]"
          >
            {{ node.data.active ? "Activa" : "Inactiva" }}
          </span>
        </template>
      </Column>
      <Column header="Acciones" style="width: 265px">
        <template #body="{ node }">
          <div class="flex gap-1">
            <Button
              icon="pi pi-plus"
              text
              rounded
              severity="success"
              title="Añadir clase hija"
              @click="openNewTechnicalClass(node.data)"
            />
            <Button
              icon="pi pi-pencil"
              text
              rounded
              severity="secondary"
              :disabled="node.data.code === 'PRODUCT'"
              title="Editar"
              @click="openEditTechnicalClass(node.data)"
            />
            <Button
              icon="pi pi-sliders-h"
              text
              rounded
              severity="secondary"
              :disabled="node.data.code === 'PRODUCT' || !node.data.active"
              title="Editar atributos técnicos"
              @click="openTechnicalAttributesDialog(node.data)"
            />
            <Button
              icon="pi pi-copy"
              text
              rounded
              severity="secondary"
              :disabled="node.data.code === 'PRODUCT' || !node.data.active"
              title="Copiar atributos desde otra clase"
              @click="openTechnicalAttributeClassCopy(node.data)"
            />
            <Button
              :icon="node.data.active ? 'pi pi-eye-slash' : 'pi pi-eye'"
              text
              rounded
              :severity="node.data.active ? 'danger' : 'success'"
              :disabled="node.data.code === 'PRODUCT'"
              :title="node.data.active ? 'Desactivar' : 'Activar'"
              @click="toggleTechnicalClass(node.data)"
            />
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              :disabled="node.data.code === 'PRODUCT'"
              title="Eliminar clase"
              @click="confirmDeleteTechnicalClass(node.data)"
            />
          </div>
        </template>
      </Column>
    </TreeTable>
    <template #footer>
      <div class="kiwik-separator"></div>
      <Button
        label="Cerrar"
        icon="pi pi-times"
        @click="technicalClassMaintenanceVisible = false"
      />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="technicalClassDialogVisible"
    modal
    :header="
      newTechnicalClass.pkid
        ? 'Editar clase de producto'
        : 'Nueva clase de producto'
    "
    :style="{ width: 'min(620px, 94vw)' }"
    class="kiwik-dialog"
  >
    <div class="technical-class-form">
      <FloatLabel variant="on">
        <InputText
          id="technicalClassName"
          v-model="newTechnicalClass.name"
          maxlength="145"
          class="w-full"
          autofocus
        />
        <label for="technicalClassName"> Nombre *</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          id="technicalClassParent"
          v-model="newTechnicalClass.parentId"
          :options="productTechnicalClasses"
          optionLabel="path"
          optionValue="pkid"
          class="w-full"
          filter
        />
        <label for="technicalClassParent"> Clase superior *</label>
      </FloatLabel>
      <small>
        Ejemplo: al crear “Válvula” bajo “Producto”, se mostrará como “Producto
        / Válvula”.
      </small>
    </div>
    <template #footer>
      <div class="technical-class-dialog-footer">
        <div class="kiwik-separator"></div>
        <div class="technical-class-dialog-actions">
          <Button
            label="Cancelar"
            text
            @click="technicalClassDialogVisible = false"
          />
          <Button
            :label="
              newTechnicalClass.pkid ? 'Guardar cambios' : 'Crear y seleccionar'
            "
            icon="pi pi-check"
            class="technical-class-dialog-save"
            @click="saveTechnicalClass"
          />
        </div>
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="technicalAttributeClassCopyVisible"
    modal
    header="Copiar atributos técnicos"
    :style="{ width: 'min(620px, 94vw)' }"
    class="kiwik-dialog"
  >
    <div class="technical-attribute-class-copy">
      <InlineMessage severity="info" class="w-full">
        Se añadirán a
        <b>{{ technicalAttributesClass?.path || "la clase seleccionada" }}</b>
        los atributos que todavía no existan. Podrás revisarlos antes de
        guardar.
      </InlineMessage>
      <FloatLabel variant="on">
        <Select
          id="technicalAttributeSourceClass"
          v-model="technicalAttributeSourceClassId"
          :options="technicalAttributeSourceClasses"
          optionLabel="path"
          optionValue="pkid"
          filter
          class="w-full"
        />
        <label for="technicalAttributeSourceClass">Copiar desde *</label>
      </FloatLabel>
    </div>
    <template #footer>
      <div class="kiwik-separator"></div>
      <Button
        label="Cancelar"
        text
        @click="technicalAttributeClassCopyVisible = false"
      />
      <Button
        label="Copiar y revisar"
        icon="pi pi-copy"
        :disabled="!technicalAttributeSourceClassId"
        @click="copyTechnicalAttributesFromClass"
      />
    </template>
  </Dialog>

  <Dialog
    v-model:visible="technicalAttributesDialogVisible"
    modal
    :header="`Atributos de ${technicalAttributesClass?.path || 'la clase'}`"
    :style="{ width: 'min(1400px, 97vw)' }"
    class="kiwik-dialog"
  >
    <div class="technical-attributes-editor-intro">
      <div>
        <b>Atributos definidos directamente en esta clase</b>
        <small
          >Los atributos heredados se administran desde su clase de
          origen.</small
        >
      </div>
      <Button
        label="Añadir atributo"
        icon="pi pi-plus"
        size="small"
        @click="addTechnicalAttribute"
      />
    </div>
    <InlineMessage
      v-if="inheritedTechnicalAttributes.length"
      severity="info"
      class="w-full mb-3"
    >
      Esta clase recibe {{ inheritedTechnicalAttributes.length }} atributo(s)
      heredado(s):
      {{ inheritedTechnicalAttributes.map((item) => item.name).join(", ") }}.
    </InlineMessage>
    <DataTable
      :value="technicalAttributeDrafts"
      dataKey="rowKey"
      stripedRows
      scrollable
      scrollHeight="52vh"
      class="technical-attributes-editor"
    >
      <Column header="Código" style="min-width: 135px">
        <template #body="{ data }"
          ><InputText
            v-model="data.code"
            maxlength="50"
            class="w-full"
            placeholder="Automático"
        /></template>
      </Column>
      <Column header="Nombre *" style="min-width: 190px">
        <template #body="{ data }"
          ><InputText v-model="data.name" maxlength="145" class="w-full"
        /></template>
      </Column>
      <Column header="Tipo *" style="min-width: 145px">
        <template #body="{ data }"
          ><Select
            v-model="data.dataType"
            :options="technicalAttributeTypes"
            optionLabel="label"
            optionValue="value"
            class="w-full"
        /></template>
      </Column>
      <Column header="Unidad" style="min-width: 105px">
        <template #body="{ data }"
          ><InputText
            v-model="data.unit"
            maxlength="30"
            class="w-full"
            placeholder="mm, bar..."
        /></template>
      </Column>
      <Column header="Valores permitidos" style="min-width: 230px">
        <template #body="{ data }"
          ><InputText
            v-model="data.options"
            :disabled="data.dataType !== 'LIST'"
            class="w-full"
            placeholder="Valor 1 | Valor 2"
        /></template>
      </Column>
      <Column header="Orden" style="width: 95px">
        <template #body="{ data }"
          ><InputNumber
            v-model="data.sortOrder"
            :min="0"
            :max="9999"
            :useGrouping="false"
            class="w-full"
        /></template>
      </Column>
      <Column header="Obligatorio" style="width: 105px" bodyClass="text-center">
        <template #body="{ data }"
          ><Checkbox v-model="data.required" binary
        /></template>
      </Column>
      <Column header="Heredable" style="width: 100px" bodyClass="text-center">
        <template #body="{ data }"
          ><Checkbox v-model="data.inheritable" binary
        /></template>
      </Column>
      <Column style="width: 55px">
        <template #body="{ index }"
          ><Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            @click="removeTechnicalAttribute(index)"
        /></template>
      </Column>
      <template #empty
        ><div class="p-4 text-center text-color-secondary">
          Añade el primer atributo técnico de esta clase.
        </div></template
      >
    </DataTable>
    <template #footer>
      <div class="kiwik-separator"></div>
      <Button
        label="Cancelar"
        text
        @click="technicalAttributesDialogVisible = false"
      />
      <Button
        label="Guardar atributos"
        icon="pi pi-check"
        @click="saveTechnicalAttributes"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { backendUrl } from "@/services/backendUrl";
import ProductPricePreview from "@/components/shared/ProductPricePreview.vue";

import { ref, watch, computed } from "vue";
import axios from "axios";
import FileUpload from "primevue/fileupload";

import Dialog from "primevue/dialog";
import Panel from "primevue/panel";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Checkbox from "primevue/checkbox";
import Select from "primevue/select";
import FloatLabel from "primevue/floatlabel";
import DataTable from "primevue/datatable";
import TreeTable from "primevue/treetable";
import Column from "primevue/column";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import SupplierLookup from "@/components/shared/SupplierLookup.vue";
import ProductLookup from "@/components/shared/ProductLookup.vue";

import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import { useFormValidator } from "../../libs/HelperView";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { useCompanyStore } from "@/stores/companyStore";
import { useSecurityStore } from "@/stores/securityStore";
import { PERM } from "@/services/Frm_Main/permissions";
import Frm_FamiliaProductos from "../Frm_Products/Frm_FamiliasProductos/Frm_FamiliaProductos.vue";
import Frm_SalexTaxForm from "../Frm_SalexTax/Frm_SalesTaxForm.vue";

import type { ProductsDTO } from "../../models/ProductsDTO";

const CATEGORY_TYPE_FAMILY = 4;
const toast = useToast();
const confirm = useConfirm();
const companyStore = useCompanyStore();
const securityStore = useSecurityStore();
const salesTaxes = ref<any[]>([]);
const familiaProductosRef = ref();
const visible = ref(false);
const salesTaxFormRef = ref();
const activeTab = ref("0");
const imageInput = ref<HTMLInputElement | null>(null);
const { setRef, scrollToError } = useFormValidator();
const categories = ref<any[]>([]);
const families = ref<any[]>([]);
const units = ref<any[]>([]);
const productCategories = ref<any[]>([]);
const productCategoryTypes = ref<any[]>([]);
const productTechnicalClasses = ref<any[]>([]);
const productTechnicalAttributes = ref<TechnicalAttribute[]>([]);
const salesTaxFormMode = ref<"sale" | "purchase" | null>(null);
const technicalClassDialogVisible = ref(false);
const technicalClassMaintenanceVisible = ref(false);
const technicalClassMaintenance = ref<any[]>([]);
const technicalClassTree = ref<any[]>([]);
const technicalClassExpandedKeys = ref<Record<string, boolean>>({});
const newTechnicalClass = ref<{
  pkid: number | null;
  name: string;
  parentId: number | null;
}>({
  pkid: null,
  name: "",
  parentId: null,
});
const technicalAttributesDialogVisible = ref(false);
const technicalAttributesClassId = ref<number | null>(null);
const technicalAttributeClassCopyVisible = ref(false);
const technicalAttributeSourceClassId = ref<number | null>(null);
const technicalCopyDialogVisible = ref(false);
const technicalCopySourceId = ref<number | null>(null);
const technicalCopySourceLabel = ref("");
const technicalCopySourceClass = ref("");
const technicalCopyOverwrite = ref(false);
const technicalCopyIncompatibleCount = ref(0);
const technicalCopyRows = ref<
  Array<{
    attributeId: number;
    name: string;
    sourceValue: string;
    currentValue: string;
    selected: boolean;
  }>
>([]);
const technicalAttributeDrafts = ref<TechnicalAttributeDraft[]>([]);

type TechnicalAttribute = {
  pkid: number;
  classId: number;
  code: string;
  name: string;
  dataType: "TEXT" | "NUMBER" | "BOOLEAN" | "DATE" | "LIST";
  unit: string | null;
  required: boolean;
  inheritable: boolean;
  options: string | null;
  sortOrder: number;
};

type TechnicalAttributeDraft = Omit<TechnicalAttribute, "pkid"> & {
  pkid: number | null;
  rowKey: string;
};

type TechnicalAttributeValue = {
  attributeId: number;
  value: string;
};

type Product = {
  pkid: number | null;

  code: string;

  barcode: string;

  description: string;

  descriptionEn: string;

  categoryId: number | null;

  familyId: number | null;

  uomId: number | null;

  uomIdPurchases: number | null;

  sale: boolean;

  purchase: boolean;

  active: boolean;

  image: string | null;

  salesDescription: string;

  purchasesDescription: string;

  dateUp: Date | null;

  salePrice: number | null;

  saleTaxId: number | null;

  purchasePrice: number | null;

  purchaseTaxId: number | null;

  productCategoryId: number | null;

  technicalClassId: number | null;

  technicalAttributeValues: TechnicalAttributeValue[];

  requireDeliveryOverride: boolean | null;

  invoicingPolicyOverride: string | null;

  purchaseSuppliers: PurchaseSupplier[];
  supplyStrategy: "STANDARD" | "BUY" | "MAKE" | "SUBCONTRACT" | "MAKE_OR_BUY";
  manufacturingNature: "PHYSICAL" | "ASSEMBLY" | "PHANTOM" | "MATERIAL";
  manufacturingSerialNumber: boolean;
  manufacturingLotTracking: boolean;
  manufacturingCertificateRequired: boolean;
  manufacturingQualityControl: boolean;
  manufacturingMaterialTraceability: boolean;
};

type PurchaseSupplier = {
  rowKey: string;
  id: number | null;
  supplierId: number | null;
  supplierCode: string;
  supplierName: string;
  supplierReference: string;
  supplierDescription: string;
  price: number;
  minimumOrder: number | null;
  leadTimeDays: number | null;
  status: "APPROVED" | "PROVISIONAL" | "BLOCKED";
  preferred: boolean;
  notes: string;
};

const createProduct = (): Product => ({
  pkid: null,
  image: null,

  code: "",

  barcode: "",

  description: "",

  descriptionEn: "",

  categoryId: null,

  familyId: null,

  uomId: 1,

  uomIdPurchases: 1,

  sale: true,

  purchase: false,

  active: true,

  salesDescription: "",

  purchasesDescription: "",

  dateUp: new Date(),

  salePrice: 0,
  saleTaxId: null,

  purchasePrice: 0,

  purchaseTaxId: null,

  productCategoryId: null,

  technicalClassId: null,

  technicalAttributeValues: [],

  requireDeliveryOverride: null,

  invoicingPolicyOverride: null,

  purchaseSuppliers: [],
  supplyStrategy: "STANDARD",
  manufacturingNature: "PHYSICAL",
  manufacturingSerialNumber: false,
  manufacturingLotTracking: false,
  manufacturingCertificateRequired: false,
  manufacturingQualityControl: false,
  manufacturingMaterialTraceability: false,
});

const product = ref<Product>(createProduct());
const supplierNotesVisible = ref(false);
const supplierNotesRow = ref<PurchaseSupplier | null>(null);
const supplierStatuses = [
  { label: "Homologado", value: "APPROVED" },
  { label: "Provisional", value: "PROVISIONAL" },
  { label: "Bloqueado", value: "BLOCKED" },
];
const supplyStrategies = [
  { label: "Producto estándar", value: "STANDARD" },
  { label: "Compra directa", value: "BUY" },
  { label: "Fabricación interna", value: "MAKE" },
  { label: "Fabricación externa", value: "SUBCONTRACT" },
  { label: "Fabricación o compra", value: "MAKE_OR_BUY" },
];
const manufacturingStrategyValues = ["MAKE", "SUBCONTRACT", "MAKE_OR_BUY"];
const manufacturingNatures = [
  {
    label: "Producto físico",
    value: "PHYSICAL",
    description: "Producto final físico, vendible o entregable.",
  },
  {
    label: "Conjunto fabricado o montado",
    value: "ASSEMBLY",
    description: "Conjunto físico que puede tener una orden propia.",
  },
  {
    label: "Conjunto lógico (fantasma)",
    value: "PHANTOM",
    description: "Agrupador sin existencia ni orden independiente.",
  },
  {
    label: "Componente o materia prima",
    value: "MATERIAL",
    description: "Elemento físico consumido por otro producto o conjunto.",
  },
];
const isManufacturingStrategy = computed(() =>
  manufacturingStrategyValues.includes(product.value.supplyStrategy),
);
const isLogicalManufacturingProduct = computed(
  () => product.value.manufacturingNature === "PHANTOM",
);
const selectedManufacturingNature = computed(() =>
  manufacturingNatures.find(
    (item) => item.value === product.value.manufacturingNature,
  ),
);
const newPurchaseSupplier = (): PurchaseSupplier => ({
  rowKey: crypto.randomUUID(),
  id: null,
  supplierId: null,
  supplierCode: "",
  supplierName: "",
  supplierReference: "",
  supplierDescription: "",
  price: 0,
  minimumOrder: null,
  leadTimeDays: null,
  status: "APPROVED",
  preferred: false,
  notes: "",
});
const normalizePurchaseSuppliers = (items: any[] = []): PurchaseSupplier[] =>
  items.map((item) => ({
    ...newPurchaseSupplier(),
    ...item,
    rowKey: `supplier-${item.id ?? crypto.randomUUID()}`,
    supplierReference: item.supplierReference ?? "",
    supplierDescription: item.supplierDescription ?? "",
    notes: item.notes ?? "",
    status: item.status ?? "PROVISIONAL",
  }));
const addPurchaseSupplier = () =>
  product.value.purchaseSuppliers.push(newPurchaseSupplier());
const removePurchaseSupplier = (index: number) =>
  product.value.purchaseSuppliers.splice(index, 1);
const openSupplierNotes = (supplier: PurchaseSupplier) => {
  supplierNotesRow.value = supplier;
  supplierNotesVisible.value = true;
};
const supplierLabel = (supplier: PurchaseSupplier) =>
  supplier.supplierId ? supplier.supplierName : "";
const selectPurchaseSupplier = (row: PurchaseSupplier, supplier: any) => {
  const duplicate = product.value.purchaseSuppliers.some(
    (item) => item !== row && item.supplierId === supplier.pkid,
  );
  if (duplicate) {
    toast.add({
      severity: "warn",
      summary: "Proveedor ya asociado",
      detail: "Ese proveedor ya figura en el producto.",
      life: 3500,
    });
    clearPurchaseSupplier(row);
    return;
  }
  row.supplierId = supplier.pkid;
  row.supplierCode = supplier.code || "";
  row.supplierName = supplier.name || "";
};
const clearPurchaseSupplier = (row: PurchaseSupplier) => {
  row.supplierId = null;
  row.supplierCode = "";
  row.supplierName = "";
};
const markPreferredSupplier = (row: PurchaseSupplier) => {
  if (row.preferred)
    product.value.purchaseSuppliers.forEach((item) => {
      if (item !== row) item.preferred = false;
    });
};
const groupedUnits = computed(() => {
  const groups = new Map<number | null, { label: string; items: any[] }>();
  units.value.forEach((unit) => {
    const key = unit.categoryId ?? null;
    if (!groups.has(key)) {
      groups.set(key, {
        label: unit.categoryDescription || "Sin categoría",
        items: [],
      });
    }
    groups.get(key)!.items.push(unit);
  });
  return [...groups.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "es"),
  );
});

type ErrorKey =
  | "code"
  | "description"
  | "descriptionEn"
  | "dateUp"
  | "barcode"
  | "salePrice"
  | "saleTaxId"
  | "purchasePrice"
  | "purchaseTaxId"
  | "productCategoryId"
  | "categoryId"
  | "uomId"
  | "uomIdPurchases";

type FormErrors = Record<ErrorKey, string>;

const errors = ref<FormErrors>({
  code: "",
  description: "",
  descriptionEn: "",
  dateUp: "",
  barcode: "",
  salePrice: "",
  saleTaxId: "",
  purchasePrice: "",
  purchaseTaxId: "",
  productCategoryId: "",
  categoryId: "",
  uomId: "",
  uomIdPurchases: "",
});

const clearErrors = () => {
  errors.value = {
    code: "",
    description: "",
    descriptionEn: "",
    dateUp: "",
    barcode: "",
    salePrice: "",
    saleTaxId: "",
    purchasePrice: "",
    purchaseTaxId: "",
    productCategoryId: "",
    categoryId: "",
    uomId: "",
    uomIdPurchases: "",
  };
};

const validate = async (): Promise<boolean> => {
  clearErrors();

  let valid = true;
  let firstError: ErrorKey | "" = "";
  const setError = (field: ErrorKey, msg: string) => {
    errors.value[field] = msg;
    if (!firstError) firstError = field;
    valid = false;
  };

  if (!product.value.code?.trim()) {
    setError("code", "Obligatorio");
  }

  if (!product.value.description?.trim()) {
    setError("description", "Obligatorio");
  }

  if (!product.value.descriptionEn?.trim()) {
    setError("descriptionEn", "Obligatorio");
  }

  if (!product.value.dateUp) {
    setError("dateUp", "Obligatorio");
  }

  if (!product.value.productCategoryId) {
    setError("productCategoryId", "Obligatorio");
  }

  if (!product.value.categoryId) {
    setError("categoryId", "Obligatorio");
  }

  if (!product.value.uomId && product.value.sale) {
    setError("uomId", "Obligatorio");
  }

  if (!product.value.uomIdPurchases && product.value.purchase) {
    setError("uomIdPurchases", "Obligatorio");
  }

  await scrollToError(firstError);
  return valid;
};

const open = async (pkid?: number, initial?: Partial<Product>) => {
  clearErrors();

  product.value = createProduct();

  activeTab.value = "0";

  visible.value = true;

  await loadCatalogs();
  if (pkid) {
    await loadProduct(pkid);
  } else if (initial) {
    product.value = {
      ...product.value,
      ...initial,
      pkid: null,
      dateUp: new Date(),
    };
  }
};

const loadProduct = async (pkid: number) => {
  try {
    const response = await axios.get(backendUrl(`/WebGetProduct/${pkid}`));

    const data = response.data;

    product.value = {
      ...createProduct(),

      ...data,

      categoryId: data.categoryId ?? data.category?.pkid ?? null,

      familyId: data.familyId ?? data.family?.pkid ?? null,

      uomId: data.uomId ?? data.unitOfMeasure?.pkid ?? null,

      purchaseSuppliers: normalizePurchaseSuppliers(data.purchaseSuppliers),
    };
  } catch (error) {
    console.error(error);

    toast.add({
      severity: "error",

      summary: "Error",

      detail: "No se pudo cargar el Producto/Servicio",

      life: companyStore.companyInfo.toastDuration ?? 3000,
    });
  }
};

const loadCatalogs = async () => {
  try {
    const response = await axios.get(backendUrl(`/WebLoadProductCatalog`));

    const data = response.data || {};

    categories.value = data.categories || [];
    families.value = categories.value
      .filter((category) => category.categoryTypeId === CATEGORY_TYPE_FAMILY)
      .map((category) => ({
        pkid: category.pkid,
        description: category.description,
        defaultTechnicalClassId: category.defaultTechnicalClassId ?? null,
        defaultTechnicalClassPath: category.defaultTechnicalClassPath ?? null,
      }));

    units.value = data.units || [];
    salesTaxes.value = data.salesTaxes || [];
    productCategories.value = data.productCategories || [];
    productCategoryTypes.value = data.productCategoryTypes || [];
    productTechnicalClasses.value = data.productTechnicalClasses || [];
    productTechnicalAttributes.value = data.productTechnicalAttributes || [];
    if (!product.value.technicalClassId) {
      product.value.technicalClassId =
        productTechnicalClasses.value.find((item) => item.code === "PRODUCT")
          ?.pkid ?? null;
    }
  } catch (error) {
    console.error(error);

    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar los datos auxiliares del producto.",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });
  }
};

const save = async () => {
  if (!(await validate())) return;

  const missingTechnical = isManufacturingStrategy.value
    ? applicableTechnicalAttributes.value.find(
        (attribute) =>
          attribute.required && !technicalValue(attribute.pkid).trim(),
      )
    : null;
  if (missingTechnical) {
    toast.add({
      severity: "warn",
      summary: "Característica obligatoria",
      detail: `Indica un valor para ${missingTechnical.name}.`,
      life: 4000,
    });
    return;
  }

  if (product.value.purchaseSuppliers.some((item) => !item.supplierId)) {
    toast.add({
      severity: "warn",
      summary: "Proveedor pendiente",
      detail: "Selecciona un proveedor o elimina la fila incompleta.",
      life: 4000,
    });
    return;
  }

  try {
    const applicableIds = new Set(
      applicableTechnicalAttributes.value.map((item) => item.pkid),
    );
    await axios.post(backendUrl(`/WebSaveProduct`), {
      ...product.value,
      technicalAttributeValues: product.value.technicalAttributeValues.filter(
        (item) => applicableIds.has(item.attributeId),
      ),
    });

    toast.add({
      severity: "success",
      summary: "Guardado correctamente",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });

    visible.value = false;

    emit("saved");
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response?.data ?? "Error inesperado",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });
  }
};

const generateCode = async () => {
  try {
    const res = await axios.get(backendUrl(`/WebGenerateProductCode`));
    // Asignamos el código generado al modelo
    product.value.code = res.data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo generar el código automático.",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });
  }
};

watch(
  () => [product.value.sale, product.value.purchase],

  ([sale, purchase]) => {
    if (sale) {
      activeTab.value = "0";
    } else if (purchase) {
      activeTab.value = "1";
    } else {
      activeTab.value = "";
    }
  },

  {
    immediate: true,
  },
);

watch(
  () => product.value.supplyStrategy,
  (strategy) => {
    if (["SUBCONTRACT", "MAKE_OR_BUY"].includes(strategy))
      product.value.purchase = true;
    if (!manufacturingStrategyValues.includes(strategy)) {
      product.value.manufacturingNature = "PHYSICAL";
      resetManufacturingConfiguration();
    }
  },
);
watch(
  () => product.value.manufacturingNature,
  (nature) => {
    if (nature === "PHANTOM") resetManufacturingConfiguration();
  },
);
watch(
  () => product.value.manufacturingSerialNumber,
  (enabled) => {
    if (enabled) product.value.manufacturingLotTracking = false;
  },
);
watch(
  () => product.value.manufacturingLotTracking,
  (enabled) => {
    if (enabled) product.value.manufacturingSerialNumber = false;
  },
);

const emit = defineEmits<{
  saved: [];
}>();

const filteredProductCategoryTypes = computed(() => {
  if (!product.value.productCategoryId) {
    return [];
  }

  return productCategoryTypes.value.filter(
    (type) => type.categoryId === product.value.productCategoryId,
  );
});

const selectedTechnicalClass = computed(
  () =>
    productTechnicalClasses.value.find(
      (item) => item.pkid === product.value.technicalClassId,
    ) ?? null,
);

const hasSpecializedTechnicalClass = computed(
  () =>
    !!selectedTechnicalClass.value &&
    selectedTechnicalClass.value.code !== "PRODUCT",
);

const availableSupplyStrategies = computed(() =>
  hasSpecializedTechnicalClass.value
    ? supplyStrategies
    : supplyStrategies.filter((item) =>
        ["STANDARD", "BUY"].includes(item.value),
      ),
);

const resetManufacturingConfiguration = () => {
  product.value.manufacturingSerialNumber = false;
  product.value.manufacturingLotTracking = false;
  product.value.manufacturingCertificateRequired = false;
  product.value.manufacturingQualityControl = false;
  product.value.manufacturingMaterialTraceability = false;
};

watch(
  () => product.value.technicalClassId,
  () => {
    if (
      !hasSpecializedTechnicalClass.value &&
      manufacturingStrategyValues.includes(product.value.supplyStrategy)
    ) {
      product.value.supplyStrategy = "STANDARD";
      resetManufacturingConfiguration();
      toast.add({
        severity: "info",
        summary: "Estrategia ajustada",
        detail:
          "Selecciona una clase técnica especializada para fabricar el producto.",
        life: companyStore.companyInfo.toastDuration ?? 3000,
      });
    }
  },
);

const technicalClassAncestorIds = computed(() => {
  const ids: number[] = [];
  let current = selectedTechnicalClass.value;
  while (current && ids.length < 20) {
    ids.push(current.pkid);
    current = productTechnicalClasses.value.find(
      (item) => item.pkid === current.parentId,
    );
  }
  return ids;
});

const applicableTechnicalAttributes = computed(() => {
  const selectedId = product.value.technicalClassId;
  const ancestorIds = technicalClassAncestorIds.value;
  return productTechnicalAttributes.value
    .filter(
      (attribute) =>
        attribute.classId === selectedId ||
        (ancestorIds.includes(attribute.classId) && attribute.inheritable),
    )
    .sort(
      (a, b) =>
        (a.sortOrder || 0) - (b.sortOrder || 0) ||
        a.name.localeCompare(b.name, "es"),
    );
});

const inheritedTechnicalAttributes = computed(() =>
  productTechnicalAttributes.value
    .filter(
      (attribute) =>
        technicalAttributeClassAncestorIds.value.includes(attribute.classId) &&
        attribute.classId !== technicalAttributesClassId.value &&
        attribute.inheritable,
    )
    .sort(
      (a, b) =>
        (a.sortOrder || 0) - (b.sortOrder || 0) ||
        a.name.localeCompare(b.name, "es"),
    ),
);

const technicalAttributesClass = computed(
  () =>
    productTechnicalClasses.value.find(
      (item) => item.pkid === technicalAttributesClassId.value,
    ) ?? null,
);

const technicalAttributeClassAncestorIds = computed(() => {
  const ids: number[] = [];
  let current = technicalAttributesClass.value;
  while (current?.parentId && ids.length < 20) {
    ids.push(current.parentId);
    current = productTechnicalClasses.value.find(
      (item) => item.pkid === current.parentId,
    );
  }
  return ids;
});

const technicalAttributeSourceClasses = computed(() =>
  productTechnicalClasses.value.filter(
    (item) =>
      item.active !== false &&
      item.code !== "PRODUCT" &&
      item.pkid !== technicalAttributesClassId.value &&
      productTechnicalAttributes.value.some(
        (attribute) => attribute.classId === item.pkid,
      ),
  ),
);

const technicalAttributeTypes = [
  { label: "Texto", value: "TEXT" },
  { label: "Número", value: "NUMBER" },
  { label: "Sí / No", value: "BOOLEAN" },
  { label: "Fecha", value: "DATE" },
  { label: "Lista", value: "LIST" },
];
const technicalBooleanOptions = [
  { label: "Sí", value: "true" },
  { label: "No", value: "false" },
];

const technicalValue = (attributeId: number) =>
  product.value.technicalAttributeValues.find(
    (item) => item.attributeId === attributeId,
  )?.value ?? "";

const setTechnicalValue = (attributeId: number, value: unknown) => {
  const normalized = value === null || value === undefined ? "" : String(value);
  const existing = product.value.technicalAttributeValues.find(
    (item) => item.attributeId === attributeId,
  );
  if (existing) existing.value = normalized;
  else
    product.value.technicalAttributeValues.push({
      attributeId,
      value: normalized,
    });
};

const openTechnicalCopyDialog = () => {
  clearTechnicalCopySource();
  technicalCopyOverwrite.value = false;
  technicalCopyDialogVisible.value = true;
};

const clearTechnicalCopySource = () => {
  technicalCopySourceId.value = null;
  technicalCopySourceLabel.value = "";
  technicalCopySourceClass.value = "";
  technicalCopyRows.value = [];
  technicalCopyIncompatibleCount.value = 0;
};

const refreshTechnicalCopySelection = () => {
  technicalCopyRows.value.forEach((row) => {
    row.selected =
      !!row.sourceValue && (!row.currentValue || technicalCopyOverwrite.value);
  });
};

const loadTechnicalCopySource = async (source: any) => {
  technicalCopySourceId.value = source.pkid;
  technicalCopySourceLabel.value =
    source.description || source.code || "Producto seleccionado";
  try {
    const { data } = await axios.get(
      backendUrl(`/WebGetProduct/${source.pkid}`),
    );
    technicalCopySourceClass.value = data.technicalClassPath || "Producto";
    const currentAttributes = new Map(
      applicableTechnicalAttributes.value.map((attribute) => [
        attribute.pkid,
        attribute,
      ]),
    );
    const sourceValues = (data.technicalAttributeValues || []).filter(
      (item: TechnicalAttributeValue) => item.value !== "",
    );
    technicalCopyIncompatibleCount.value = sourceValues.filter(
      (item: TechnicalAttributeValue) =>
        !currentAttributes.has(item.attributeId),
    ).length;
    technicalCopyRows.value = sourceValues
      .filter((item: TechnicalAttributeValue) =>
        currentAttributes.has(item.attributeId),
      )
      .map((item: TechnicalAttributeValue) => {
        const attribute = currentAttributes.get(item.attributeId)!;
        const currentValue = technicalValue(item.attributeId);
        return {
          attributeId: item.attributeId,
          name: technicalAttributeLabel(attribute, false),
          sourceValue: item.value,
          currentValue,
          selected: !currentValue,
        };
      });
  } catch (error) {
    console.error(error);
    technicalCopyRows.value = [];
    toast.add({
      severity: "error",
      summary: "No se pudieron cargar las características",
      detail: "Revisa el producto de origen e inténtalo de nuevo.",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });
  }
};

const applyTechnicalCopy = () => {
  technicalCopyRows.value
    .filter((row) => row.selected)
    .forEach((row) => {
      setTechnicalValue(row.attributeId, row.sourceValue);
    });
  technicalCopyDialogVisible.value = false;
  toast.add({
    severity: "success",
    summary: "Características copiadas",
    detail: "Los valores quedan pendientes de guardar con el producto.",
    life: companyStore.companyInfo.toastDuration ?? 3000,
  });
};

const technicalNumberValue = (attributeId: number) => {
  const value = technicalValue(attributeId);
  return value === "" ? null : Number(value);
};

const technicalDateValue = (attributeId: number) => {
  const value = technicalValue(attributeId);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const setTechnicalDateValue = (attributeId: number, value: unknown) => {
  if (!(value instanceof Date)) return setTechnicalValue(attributeId, "");
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  setTechnicalValue(attributeId, `${year}-${month}-${day}`);
};

const technicalAttributeOptions = (attribute: TechnicalAttribute) =>
  (attribute.options || "")
    .split(/[\n|]/)
    .map((item) => item.trim())
    .filter(Boolean);

const technicalAttributeLabel = (
  attribute: TechnicalAttribute,
  includeUnit = true,
) =>
  `${attribute.name}${includeUnit && attribute.unit ? ` (${attribute.unit})` : ""}${
    attribute.required ? " *" : ""
  }`;

const invoicingPolicies = [
  { label: "Por cantidades pedidas", value: "ORDERED" },
  { label: "Por cantidades entregadas", value: "DELIVERED" },
];

const selectedProductCategoryType = computed(
  () =>
    productCategoryTypes.value.find(
      (type) => type.pkid === product.value.categoryId,
    ) ?? null,
);
const inheritedRequireDelivery = computed(() =>
  Boolean(selectedProductCategoryType.value?.requireDelivery),
);
const inheritedInvoicingPolicy = computed(
  () => selectedProductCategoryType.value?.invoicingPolicy ?? "ORDERED",
);
const effectiveRequireDelivery = computed(
  () => product.value.requireDeliveryOverride ?? inheritedRequireDelivery.value,
);
const effectiveInvoicingPolicy = computed(
  () => product.value.invoicingPolicyOverride ?? inheritedInvoicingPolicy.value,
);
const effectiveDeliveryLabel = computed(() =>
  effectiveRequireDelivery.value
    ? "Requiere albarán"
    : "Facturación directa sin albarán",
);
const effectiveInvoicingPolicyLabel = computed(() =>
  effectiveInvoicingPolicy.value === "DELIVERED"
    ? "Factura por cantidades entregadas"
    : "Factura al confirmar el pedido",
);
const hasCustomSalesFlow = computed({
  get: () =>
    product.value.requireDeliveryOverride !== null ||
    product.value.invoicingPolicyOverride !== null,
  set: (enabled: boolean) => {
    if (enabled) {
      product.value.requireDeliveryOverride = inheritedRequireDelivery.value;
      product.value.invoicingPolicyOverride = inheritedInvoicingPolicy.value;
    } else {
      product.value.requireDeliveryOverride = null;
      product.value.invoicingPolicyOverride = null;
    }
  },
});

watch(
  () => product.value.productCategoryId,
  () => {
    if (
      product.value.categoryId &&
      !filteredProductCategoryTypes.value.some(
        (type) => type.pkid === product.value.categoryId,
      )
    ) {
      product.value.categoryId = null;
    }
  },
);

watch(
  () => product.value.familyId,
  (familyId) => {
    const family = families.value.find((item) => item.pkid === familyId);
    if (!family?.defaultTechnicalClassId) return;
    const currentClass = productTechnicalClasses.value.find(
      (item) => item.pkid === product.value.technicalClassId,
    );
    if (!currentClass || currentClass.code === "PRODUCT") {
      product.value.technicalClassId = family.defaultTechnicalClassId;
    }
  },
);

watch(
  () => product.value.requireDeliveryOverride,
  (requiresDelivery) => {
    if (requiresDelivery === false)
      product.value.invoicingPolicyOverride = "ORDERED";
  },
);

defineExpose({
  open,
});

const openNewFamily = () => {
  familiaProductosRef.value?.open(null);
};

const handleFamilySaved = (family: {
  pkid: number;
  description: string;
  defaultTechnicalClassId: number | null;
  defaultTechnicalClassPath: string | null;
}) => {
  families.value.push({
    pkid: family.pkid,
    description: family.description,
    defaultTechnicalClassId: family.defaultTechnicalClassId,
    defaultTechnicalClassPath: family.defaultTechnicalClassPath,
  });

  product.value.familyId = family.pkid;
};

const openNewTechnicalClass = (parentClass?: any) => {
  newTechnicalClass.value = {
    pkid: null,
    name: "",
    parentId:
      parentClass?.pkid ??
      product.value.technicalClassId ??
      productTechnicalClasses.value.find((item) => item.code === "PRODUCT")
        ?.pkid ??
      null,
  };
  technicalClassDialogVisible.value = true;
};

const loadTechnicalClassMaintenance = async () => {
  const { data } = await axios.get(
    backendUrl("/WebGetProductTechnicalClassMaintenance"),
  );
  technicalClassMaintenance.value = data || [];
  technicalClassTree.value = buildTechnicalClassTree(
    technicalClassMaintenance.value,
  );
  expandAllTechnicalClasses();
};

const buildTechnicalClassTree = (rows: any[]) => {
  const nodes = new Map<number, any>();
  rows.forEach((row) => {
    nodes.set(row.pkid, {
      key: String(row.pkid),
      data: row,
      children: [],
    });
  });

  const roots: any[] = [];
  rows.forEach((row) => {
    const node = nodes.get(row.pkid);
    const parent = row.parentId ? nodes.get(row.parentId) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });
  return roots;
};

const expandAllTechnicalClasses = () => {
  const expanded: Record<string, boolean> = {};
  const visit = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node.children?.length) {
        expanded[node.key] = true;
        visit(node.children);
      }
    });
  };
  visit(technicalClassTree.value);
  technicalClassExpandedKeys.value = expanded;
};

const collapseAllTechnicalClasses = () => {
  technicalClassExpandedKeys.value = {};
};

const openTechnicalClassMaintenance = async () => {
  try {
    await loadTechnicalClassMaintenance();
    technicalClassMaintenanceVisible.value = true;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar las clases de producto.",
      life: 3500,
    });
  }
};

const openEditTechnicalClass = (technicalClass: any) => {
  newTechnicalClass.value = {
    pkid: technicalClass.pkid,
    name: technicalClass.name,
    parentId: technicalClass.parentId,
  };
  technicalClassDialogVisible.value = true;
};

const toggleTechnicalClass = async (technicalClass: any) => {
  try {
    await axios.post(
      backendUrl(`/WebToggleProductTechnicalClass/${technicalClass.pkid}`),
    );
    if (
      technicalClass.active &&
      product.value.technicalClassId === technicalClass.pkid
    ) {
      product.value.technicalClassId =
        productTechnicalClasses.value.find((item) => item.code === "PRODUCT")
          ?.pkid ?? null;
    }
    await loadCatalogs();
    await loadTechnicalClassMaintenance();
    toast.add({
      severity: "success",
      summary: technicalClass.active ? "Clase desactivada" : "Clase activada",
      life: 3000,
    });
  } catch (error: any) {
    toast.add({
      severity: "warn",
      summary: "No se pudo cambiar el estado",
      detail: error.response?.data || "La clase tiene dependencias.",
      life: 4500,
    });
  }
};

const confirmDeleteTechnicalClass = (technicalClass: any) => {
  const consequences = [
    technicalClass.productCount
      ? `${technicalClass.productCount} producto(s) pasarán a la clase Producto y a estrategia estándar.`
      : null,
    technicalClass.childCount
      ? `${technicalClass.childCount} clase(s) hija(s) subirán al nivel superior.`
      : null,
    technicalClass.attributeCount
      ? `${technicalClass.attributeCount} atributo(s) y sus valores dejarán de existir.`
      : null,
  ].filter(Boolean);
  confirm.require({
    header: "Eliminar clase de producto",
    message: `Se eliminará “${technicalClass.path || technicalClass.name}”. ${consequences.join(" ")} Esta operación no se puede deshacer.`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Eliminar clase",
    rejectLabel: "Cancelar",
    acceptClass: "p-button-danger",
    accept: async () => {
      try {
        const { data } = await axios.delete(
          backendUrl(`/WebDeleteProductTechnicalClass/${technicalClass.pkid}`),
        );
        if (product.value.technicalClassId === technicalClass.pkid) {
          product.value.technicalClassId =
            productTechnicalClasses.value.find(
              (item) => item.code === "PRODUCT",
            )?.pkid ?? null;
          product.value.supplyStrategy = "STANDARD";
          product.value.manufacturingNature = "PHYSICAL";
          resetManufacturingConfiguration();
          product.value.technicalAttributeValues = [];
        }
        await loadCatalogs();
        await loadTechnicalClassMaintenance();
        toast.add({
          severity: "success",
          summary: "Clase eliminada",
          detail: `${data.productsReset || 0} producto(s) reasignados a Producto.`,
          life: 4000,
        });
      } catch (error: any) {
        toast.add({
          severity: "error",
          summary: "No se pudo eliminar la clase",
          detail:
            error.response?.data ||
            "Revisa las dependencias e inténtalo de nuevo.",
          life: 4500,
        });
      }
    },
  });
};

const saveTechnicalClass = async () => {
  if (
    !newTechnicalClass.value.name.trim() ||
    !newTechnicalClass.value.parentId
  ) {
    toast.add({
      severity: "warn",
      summary: "Datos incompletos",
      detail: "Indica el nombre y la clase superior.",
      life: 3500,
    });
    return;
  }
  try {
    const { data } = await axios.post(
      backendUrl("/WebSaveProductTechnicalClass"),
      newTechnicalClass.value,
    );
    await loadCatalogs();
    if (!newTechnicalClass.value.pkid)
      product.value.technicalClassId = data.pkid;
    if (technicalClassMaintenanceVisible.value)
      await loadTechnicalClassMaintenance();
    technicalClassDialogVisible.value = false;
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "No se pudo crear la clase",
      detail: error?.response?.data || "Revisa los datos e inténtalo de nuevo.",
      life: 4500,
    });
  }
};

const prepareTechnicalAttributeDrafts = (classId: number) => {
  technicalAttributesClassId.value = classId;
  technicalAttributeDrafts.value = productTechnicalAttributes.value
    .filter((item) => item.classId === classId)
    .map((item) => ({
      ...item,
      rowKey: `attribute-${item.pkid}`,
      unit: item.unit || "",
      options: item.options || "",
    }));
};

const openTechnicalAttributesDialog = (technicalClass?: any) => {
  const classId = technicalClass?.pkid ?? product.value.technicalClassId;
  if (!classId) return;
  prepareTechnicalAttributeDrafts(classId);
  technicalAttributesDialogVisible.value = true;
};

const openTechnicalAttributeClassCopy = (technicalClass: any) => {
  prepareTechnicalAttributeDrafts(technicalClass.pkid);
  technicalAttributeSourceClassId.value = null;
  technicalAttributeClassCopyVisible.value = true;
};

const copyTechnicalAttributesFromClass = () => {
  const sourceClassId = technicalAttributeSourceClassId.value;
  const targetClassId = technicalAttributesClassId.value;
  if (!sourceClassId || !targetClassId) return;

  const existingCodes = new Set(
    [
      ...technicalAttributeDrafts.value,
      ...inheritedTechnicalAttributes.value,
    ].map((item) => item.code.toUpperCase()),
  );
  const sourceAttributes = productTechnicalAttributes.value.filter(
    (item) => item.classId === sourceClassId,
  );
  const copied = sourceAttributes
    .filter((item) => !existingCodes.has(item.code.toUpperCase()))
    .map((item, index) => ({
      ...item,
      pkid: null,
      classId: targetClassId,
      rowKey: crypto.randomUUID(),
      unit: item.unit || "",
      options: item.options || "",
      sortOrder: (technicalAttributeDrafts.value.length + index + 1) * 10,
    }));

  technicalAttributeDrafts.value.push(...copied);
  technicalAttributeClassCopyVisible.value = false;
  technicalAttributesDialogVisible.value = true;
  toast.add({
    severity: copied.length ? "success" : "info",
    summary: copied.length
      ? `${copied.length} atributo(s) preparados`
      : "No hay atributos nuevos",
    detail: copied.length
      ? "Revisa la configuración y pulsa Guardar atributos."
      : "La clase de destino ya contiene todos los atributos de origen.",
    life: 3500,
  });
};

const addTechnicalAttribute = () => {
  technicalAttributeDrafts.value.push({
    rowKey: crypto.randomUUID(),
    pkid: null,
    classId: technicalAttributesClassId.value!,
    code: "",
    name: "",
    dataType: "TEXT",
    unit: "",
    required: false,
    inheritable: true,
    options: "",
    sortOrder: (technicalAttributeDrafts.value.length + 1) * 10,
  });
};

const removeTechnicalAttribute = (index: number) =>
  technicalAttributeDrafts.value.splice(index, 1);

const saveTechnicalAttributes = async () => {
  const invalid = technicalAttributeDrafts.value.find(
    (item) =>
      !item.name.trim() ||
      !item.dataType ||
      (item.dataType === "LIST" && !item.options?.trim()),
  );
  if (invalid) {
    toast.add({
      severity: "warn",
      summary: "Atributo incompleto",
      detail:
        invalid.dataType === "LIST" && !invalid.options?.trim()
          ? `Define los valores permitidos de ${invalid.name || "la lista"}.`
          : "Todos los atributos necesitan nombre y tipo.",
      life: 4000,
    });
    return;
  }
  try {
    const classId = technicalAttributesClassId.value!;
    const { data } = await axios.post(
      backendUrl(`/WebSaveProductTechnicalAttributes/${classId}`),
      technicalAttributeDrafts.value,
    );
    productTechnicalAttributes.value = [
      ...productTechnicalAttributes.value.filter(
        (item) => item.classId !== classId,
      ),
      ...data,
    ];
    const applicableIds = new Set(
      applicableTechnicalAttributes.value.map((item) => item.pkid),
    );
    product.value.technicalAttributeValues =
      product.value.technicalAttributeValues.filter((item) =>
        applicableIds.has(item.attributeId),
      );
    if (technicalClassMaintenanceVisible.value)
      await loadTechnicalClassMaintenance();
    technicalAttributesDialogVisible.value = false;
    toast.add({
      severity: "success",
      summary: "Atributos actualizados",
      life: 3000,
    });
  } catch (error: any) {
    toast.add({
      severity: "error",
      summary: "No se pudieron guardar los atributos",
      detail: error?.response?.data || "Revisa la configuración.",
      life: 4500,
    });
  }
};

const openNewSalesTax = () => {
  salesTaxFormMode.value = "sale";

  salesTaxFormRef.value?.open(null);
};

const openNewPurchaseTax = () => {
  salesTaxFormMode.value = "purchase";

  salesTaxFormRef.value?.open(null);
};

const handleSalesTaxSaved = (tax: {
  pkid: number;
  description: string;
  value?: number;
}) => {
  salesTaxes.value.push({
    ...tax,
  });

  if (salesTaxFormMode.value === "sale") {
    product.value.saleTaxId = tax.pkid;
  } else if (salesTaxFormMode.value === "purchase") {
    product.value.purchaseTaxId = tax.pkid;
  }

  salesTaxFormMode.value = null;
};

const selectImage = () => {
  imageInput.value?.click();
};

const handleImageSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    return;
  }

  const file = input.files[0];

  // Comprobar que sea una imagen
  if (!file.type.startsWith("image/")) {
    toast.add({
      severity: "error",
      summary: "Imagen no válida",
      detail: "El archivo seleccionado no es una imagen.",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });

    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    product.value.image = reader.result as string;
  };

  reader.onerror = () => {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar la imagen.",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });
  };

  reader.readAsDataURL(file);
};
</script>

<style scoped>
.sales-flow-card {
  border: 1px solid var(--primary-200);
  border-left: 4px solid var(--primary-color);
  border-radius: 10px;
  padding: 0.9rem 1rem;
  background: linear-gradient(135deg, var(--surface-0), var(--primary-50));
}
.sales-flow-header {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  color: var(--text-color-secondary);
  font-size: 0.82rem;
}
.sales-flow-header span {
  color: var(--primary-color);
  font-size: 0.95rem;
  font-weight: 700;
}
.sales-flow-header i {
  margin-right: 0.4rem;
}
.sales-flow-inherited {
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}
.sales-flow-inherited i {
  color: var(--primary-color);
  margin-right: 0.4rem;
}
.sales-flow-inherited b {
  color: var(--text-color);
}
.supplier-section {
  margin-top: 1.25rem;
  border: 1px solid var(--surface-border);
  border-radius: 10px;
  overflow: hidden;
}
.supplier-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  background: var(--surface-50);
  border-bottom: 1px solid var(--surface-border);
}
.supplier-section__header b {
  display: block;
  color: var(--text-color);
}
.supplier-section__header b i {
  color: var(--primary-color);
  margin-right: 0.4rem;
}
.supplier-section__header small {
  display: block;
  margin-top: 0.2rem;
  color: var(--text-color-secondary);
}
.supplier-table {
  font-size: 0.88rem;
}
.supplier-empty {
  padding: 1rem;
  color: var(--text-color-secondary);
  text-align: center;
}
.supplier-notes {
  display: grid;
  grid-template-columns: minmax(150px, 0.45fr) minmax(360px, 1.55fr) auto;
  gap: 0.65rem;
  align-items: center;
  padding: 0.55rem 1rem;
  border-top: 1px dotted var(--surface-border);
  background: var(--surface-0);
}
.supplier-notes span {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-color-secondary);
}
.supplier-notes-dialog {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.supplier-notes-dialog > span {
  font-weight: 700;
  color: var(--text-color);
}
.supplier-notes-dialog > small {
  align-self: flex-end;
  color: var(--text-color-secondary);
}
.technical-class-form {
  display: grid;
  gap: 1.1rem;
  padding-top: 0.35rem;
}
.technical-class-input-group {
  display: flex;
  width: 100%;
  min-width: 0;
}
.technical-class-select {
  flex: 1 1 auto;
  width: auto;
  min-width: 0;
}
.technical-class-select :deep(.p-select),
.technical-class-select :deep(.p-select-label) {
  min-width: 0;
}
.technical-class-select :deep(.p-select-label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.technical-class-action {
  flex: 0 0 42px;
  width: 42px;
}
.technical-class-maintenance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.technical-class-maintenance-header b,
.technical-class-maintenance-header small {
  display: block;
}
.technical-class-maintenance-header small {
  margin-top: 0.2rem;
  color: var(--text-color-secondary);
}
.technical-class-tree-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  margin: -0.5rem 0 0.45rem;
}
.technical-class-tree-name {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}
.technical-class-tree-name > i {
  color: #7d9900;
  font-size: 0.95rem;
}
.technical-class-tree-name > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}
.technical-class-tree-name span {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.technical-class-tree-name small {
  margin-top: 0.1rem;
  color: var(--text-color-secondary);
  font-size: 0.72rem;
}
.technical-class-tree :deep(.p-treetable-tbody > tr > td) {
  border-bottom: 1px dotted #d7d7d7;
}
.technical-class-tree :deep(.p-treetable-node-toggle-button) {
  color: #6f8700;
}
.technical-class-status {
  display: inline-flex;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}
.technical-class-status.is-active {
  color: #166534;
  background: #dcfce7;
}
.technical-class-status.is-inactive {
  color: #991b1b;
  background: #fee2e2;
}
.technical-class-form small {
  color: var(--text-color-secondary);
  line-height: 1.45;
}
.technical-class-dialog-footer {
  width: 100%;
}
.technical-class-dialog-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.75rem;
}
.technical-class-dialog-save {
  white-space: nowrap;
}
.technical-attribute-class-copy {
  display: grid;
  gap: 1.25rem;
  padding-top: 0.35rem;
}
.technical-copy-dialog {
  display: grid;
  gap: 1rem;
}
.technical-copy-label {
  display: block;
  margin-bottom: 0.35rem;
  font-weight: 600;
}
.technical-copy-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem 1.5rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  background: var(--surface-50);
  color: var(--text-color-secondary);
}
.technical-copy-overwrite {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.technical-attributes-panel {
  margin: 0 0 20px;
  border-left: 4px solid #2e69d1;
  background: linear-gradient(90deg, #f8fbff 0, var(--surface-0) 22%);
}
.technical-attributes-header,
.technical-attributes-editor-intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
}
.technical-attributes-editor-intro {
  margin-bottom: 1rem;
}
.technical-attributes-actions {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.15rem;
  padding: 0.2rem 0.3rem;
  border: 1px solid var(--surface-border);
  border-radius: 9px;
  background: var(--surface-0);
  box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
}
.technical-attributes-actions__divider {
  width: 1px;
  height: 22px;
  background: var(--surface-border);
}
.technical-attributes-editor-intro b,
.technical-attributes-editor-intro small {
  display: block;
}
.technical-attributes-editor-intro small {
  margin-top: 0.2rem;
  color: var(--text-color-secondary);
}
.technical-attributes-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 1.15rem;
  padding-top: 0.25rem;
}
.technical-attribute-field {
  min-width: 0;
}
.technical-attributes-empty {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--text-color-secondary);
}
.technical-attributes-empty i {
  color: #2e69d1;
}
.technical-attributes-editor {
  font-size: 0.86rem;
}
.manufacturing-panel {
  margin: 0 0 20px;
  border-left: 4px solid var(--primary-color);
}
.manufacturing-panel__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.manufacturing-panel__header b,
.manufacturing-panel__header small {
  display: block;
}
.manufacturing-panel__header small {
  margin-top: 0.15rem;
  color: var(--text-color-secondary);
  font-weight: 400;
}
.manufacturing-panel__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--primary-color);
  background: var(--primary-100);
}
.manufacturing-nature-row {
  display: grid;
  grid-template-columns: minmax(260px, 420px) minmax(220px, 1fr);
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.manufacturing-nature-row > small {
  color: var(--text-color-secondary);
  line-height: 1.4;
}
.manufacturing-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 1.1rem 1.5rem;
  align-items: center;
}
.manufacturing-options > label {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}
.manufacturing-hint {
  display: block;
  margin-top: 1rem;
  color: var(--text-color-secondary);
}
.manufacturing-hint i {
  margin-right: 0.35rem;
  color: var(--primary-color);
}
@media (max-width: 900px) {
  .supplier-section__header {
    align-items: flex-start;
    flex-direction: column;
  }
  .supplier-notes {
    grid-template-columns: 1fr;
  }
  .manufacturing-nature-row {
    grid-template-columns: 1fr;
  }
  .manufacturing-options {
    grid-template-columns: 1fr;
  }
  .technical-attributes-grid {
    grid-template-columns: 1fr;
  }
  .technical-attributes-header,
  .technical-attributes-editor-intro {
    align-items: flex-start;
    flex-direction: column;
  }
  .technical-attributes-actions {
    align-self: stretch;
    justify-content: flex-end;
  }
}
</style>
