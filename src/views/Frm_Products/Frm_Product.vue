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

              <!-- FAMILIA -->
              <div class="col-12 md:col-4">
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
                  <InputText
                    v-model="supplier.notes"
                    placeholder="Observaciones internas"
                    maxlength="1000"
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
import Column from "primevue/column";
import InputNumber from "primevue/inputnumber";
import SupplierLookup from "@/components/shared/SupplierLookup.vue";

import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import { useFormValidator } from "../../libs/HelperView";
import { useToast } from "primevue/usetoast";
import { useCompanyStore } from "@/stores/companyStore";
import { useSecurityStore } from "@/stores/securityStore";
import { PERM } from "@/services/Frm_Main/permissions";
import Frm_FamiliaProductos from "../Frm_Products/Frm_FamiliasProductos/Frm_FamiliaProductos.vue";
import Frm_SalexTaxForm from "../Frm_SalexTax/Frm_SalesTaxForm.vue";

import type { ProductsDTO } from "../../models/ProductsDTO";

const CATEGORY_TYPE_FAMILY = 4;
const toast = useToast();
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
const salesTaxFormMode = ref<"sale" | "purchase" | null>(null);

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

  requireDeliveryOverride: boolean | null;

  invoicingPolicyOverride: string | null;

  purchaseSuppliers: PurchaseSupplier[];
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

  requireDeliveryOverride: null,

  invoicingPolicyOverride: null,

  purchaseSuppliers: [],
});

const product = ref<Product>(createProduct());
const supplierStatuses = [
  { label: "Homologado", value: "APPROVED" },
  { label: "Provisional", value: "PROVISIONAL" },
  { label: "Bloqueado", value: "BLOCKED" },
];
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
const supplierLabel = (supplier: PurchaseSupplier) =>
  supplier.supplierId
    ? `${supplier.supplierCode ? `${supplier.supplierCode} — ` : ""}${supplier.supplierName}`
    : "";
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
      }));

    units.value = data.units || [];
    salesTaxes.value = data.salesTaxes || [];
    productCategories.value = data.productCategories || [];
    productCategoryTypes.value = data.productCategoryTypes || [];
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
    await axios.post(backendUrl(`/WebSaveProduct`), product.value);

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

const handleFamilySaved = (family: { pkid: number; description: string }) => {
  families.value.push({
    pkid: family.pkid,
    description: family.description,
  });

  product.value.familyId = family.pkid;
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
  grid-template-columns: minmax(150px, 0.7fr) minmax(260px, 1.3fr) minmax(
      260px,
      1.3fr
    );
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
@media (max-width: 900px) {
  .supplier-section__header {
    align-items: flex-start;
    flex-direction: column;
  }
  .supplier-notes {
    grid-template-columns: 1fr;
  }
}
</style>
