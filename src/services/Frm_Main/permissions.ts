/**
 * Catálogo único de permisos (security_attributes.SECURITY_ATTRIBUTES_DS_CODE).
 * Fuente de verdad en el front. El back lo espeja en
 * `security/SecurityPermissions.java` y la BBDD en
 * `db/migration/V2026092502__security_attributes.sql` + `BBDD.sql`.
 *
 * Reglas:
 * - No usar strings sueltos: `hasPermission(PERM.X)` en vez de `hasPermission('...')`.
 * - Los códigos LEGACY se mantienen por compat (filas ya en BBDD de clientes)
 *   pero el código nuevo debe usar el bueno.
 */
export const PERM = {
  // ---------- ENTITIES · cat 16 General Entidades ----------
  ENTI_GEN_EDIT: 'ENTI_GEN_0001', // crear + editar (borrar va en ENTI_GEN_DELETE)
  ENTI_GEN_DOCS: 'ENTI_GEN_0002',
  ENTI_GEN_NOTES: 'ENTI_GEN_0003',
  ENTI_GEN_DELETE: 'ENTI_GEN_0004', // NUEVO (antes se reusaba 0001 para borrar)
  ENTI_GEN_CONTACTS: 'ENTI_GEN_0005', // ver pestaña Contactos en ficha entidad

  // ---------- ENTITIES · cat 15 Contactos ----------
  ENTI_CON_EDIT: 'ENTI_CON_0001',
  ENTI_CON_ADDRESS: 'ENTI_CON_0002',
  ENTI_CON_NOTES: 'ENTI_CON_0003', // bueno (4 dígitos)
  ENTI_CON_DOCS: 'ENTI_CON_0004', // bueno (4 dígitos)
  ENTI_CON_DELETE: 'ENTI_CON_0005', // NUEVO (antes se reusaba 0001 para borrar)

  // ---------- PRODUCTS · cat 17 General Productos ----------
  PROD_EDIT: 'PROSER_GEN_0001', // crear + editar
  PROD_DOCS: 'PROSER_GEN_0002',
  PROD_NOTES: 'PROSER_GEN_0003',
  PROD_PHOTO: 'PROSER_GEN_0004',
  PROD_FAMILIES_NAV: 'PROSER_GEN_0005', // ver módulo Familias
  PROD_PRICE_UPDATE: 'PROSER_GEN_0077',
  PROD_TAX: 'PROSER_GEN_0078', // acceder a Impuestos
  PROD_MASTER_EDIT: 'PROSER_GEN_0080', // cambios ficha general
  PROD_DOC_DELETE: 'PROSER_GEN_0014',
  PROD_DOC_UPLOAD: 'PROSER_GEN_0015',
  PROD_DELETE: 'PROSER_GEN_0016', // NUEVO (antes se reusaba 0001 para borrar)

  // ---------- PRODUCTS · cat 18 Familias ----------
  FAM_EDIT: 'PROSER_GEN_0006', // crear + editar + borrar
  FAM_NOTES: 'PROSER_GEN_0007',
  FAM_DOCS: 'PROSER_GEN_0008',
  FAM_FIELDS: 'PROSER_GEN_0009', // gestionar campos/atributos

  // ---------- SALES · cat 1000 General Ventas ----------
  SALES_OPTIONS: 'SALES_GEN_0001', // acceso general ventas
  SALES_NAV_QUOTES: 'SALES_GEN_0002',
  SALES_NAV_DELIVERY: 'SALES_GEN_0003',
  SALES_NAV_ORDERS: 'SALES_GEN_0004',
  SALES_NAV_INVOICES: 'SALES_GEN_0005',
  SALES_NAV_CREDIT: 'SALES_GEN_0006',
  SALES_NAV_PRICELIST: 'SALES_GEN_0013', // NUEVO (Lista de Precios no tenía)
  SALES_SETTINGS: 'SALES_GEN_0014', // NUEVO (AjustesVentas no tenía)

  // ---------- SALES · cat 1001 Presupuestos ----------
  QUOTE_EDIT: 'SALES_GEN_0007',
  QUOTE_NOTES: 'SALES_GEN_0008',
  QUOTE_DOCS: 'SALES_GEN_0009',
  QUOTE_REOPEN_CANCELLED: 'SALES_GEN_0010', // convertir un cancelado
  QUOTE_EMAIL: 'SALES_GEN_0011',
  QUOTE_PRINT: 'SALES_GEN_0012',
  QUOTE_DELETE: 'SALES_GEN_0015', // NUEVO (borrar/anular)
  QUOTE_ACCEPT: 'SALES_GEN_0016', // NUEVO (aceptar = convertir a pedido)
  QUOTE_REOPEN: 'SALES_GEN_0017', // NUEVO (reabrir)

  // ---------- SALES · cat 1002 Pedidos ----------
  ORDER_EDIT: 'SALES_GEN_PV0007',
  ORDER_NOTES: 'SALES_GEN_PV0008',
  ORDER_DOCS: 'SALES_GEN_PV0009',
  ORDER_EMAIL: 'SALES_GEN_PV0010',
  ORDER_PRINT: 'SALES_GEN_PV0011',
  ORDER_STATE: 'SALES_GEN_PV0012', // NUEVO (confirmar/bloquear/cancelar)
  ORDER_TO_DELIVERY: 'SALES_GEN_PV0013', // NUEVO (generar albarán)
  ORDER_TO_INVOICE: 'SALES_GEN_PV0014', // NUEVO (facturar desde pedido)
  ORDER_DELETE: 'SALES_GEN_PV0015', // NUEVO

  // ---------- SALES · cat 1003 Albaranes ----------
  DELIV_EDIT: 'SALES_GEN_AL0007',
  DELIV_NOTES: 'SALES_GEN_AL0008',
  DELIV_DOCS: 'SALES_GEN_AL0009', // NUEVO (faltaba; justificantes)
  DELIV_EMAIL: 'SALES_GEN_AL0010',
  DELIV_PRINT: 'SALES_GEN_AL0011',
  DELIV_RECTIFY_LINE: 'SALES_GEN_AL0012',
  DELIV_STATE: 'SALES_GEN_AL0013', // NUEVO (confirmar/anular)
  DELIV_TO_INVOICE: 'SALES_GEN_AL0014', // NUEVO (facturar)
  DELIV_PICKUP: 'SALES_GEN_AL0015', // NUEVO (registrar recogida)

  // ---------- SALES · cat 1004 Facturas ----------
  INV_EDIT: 'SALES_GEN_FC0007',
  INV_NOTES: 'SALES_GEN_FC0008',
  INV_DOCS: 'SALES_GEN_FC0009', // NUEVO (faltaba)
  INV_EMAIL: 'SALES_GEN_FC0010',
  INV_PRINT: 'SALES_GEN_FC0011',
  INV_PRIOR_YEAR: 'SALES_GEN_FC0012', // asignar años anteriores
  INV_ISSUE: 'SALES_GEN_FC0013', // NUEVO (emitir/guardar/emitir/anular)
  INV_MARK_PAID: 'SALES_GEN_FC0014', // NUEVO (marcar pagada)
  INV_DUES: 'SALES_GEN_FC0015', // NUEVO (vencimientos/cobros)
  INV_VERIFACTU: 'SALES_GEN_FC0016', // NUEVO (reintentar/subsanar)

  // ---------- SALES · cat 1005 Rectificativas ----------
  CREDIT_EDIT: 'SALES_GEN_RFC0007',
  CREDIT_NOTES: 'SALES_GEN_RFC0008',
  CREDIT_DOCS: 'SALES_GEN_RFC0009', // NUEVO (faltaba)
  CREDIT_EMAIL: 'SALES_GEN_RFC0010',
  CREDIT_PRINT: 'SALES_GEN_RFC0011',
  CREDIT_ISSUE: 'SALES_GEN_RFC0012', // NUEVO (emitir/anular)
  CREDIT_MARK_PAID: 'SALES_GEN_RFC0013', // NUEVO

  // ---------- SALES · cat 1006 Lista de Precios (NUEVA categoría) ----------
  PRICELIST_VIEW: 'SALES_LP_0001',
  PRICELIST_EDIT: 'SALES_LP_0002',
  PRICELIST_SIMULATE: 'SALES_LP_0003',

  // ---------- TASKS · cat 3000 ----------
  TASK_ACCESS: 'TASK_GEN_0001',
  TASK_EDIT: 'TASK_GEN_0002',
  TASK_BILLING_PENDING: 'TASK_GEN_0003',
  TASK_BILL: 'TASK_GEN_0004',
  TASK_DELETE: 'TASK_GEN_0005', // NUEVO (borrar/archivar)
  TASK_VIEW_ALL: 'TASK_GEN_0006', // NUEVO (ver todas vs solo mías)

  // ---------- SYSTEM · cat 9000 ----------
  SYS_ACCESS: 'SYS_GEN_0001',
  SYS_USERS: 'SYS_GEN_0002',
  SYS_SECURITY: 'SYS_GEN_0003',
  SYS_BANK: 'SYS_GEN_0004',
  SYS_TAX: 'SYS_GEN_0005',
  SYS_COMPANY: 'SYS_GEN_0006', // NUEVO (empresa/parámetros/SMTP/logo)
  SYS_TECH: 'SYS_GEN_0007', // NUEVO (IA/Salvaguarda, técnico)

  // ---------- SYSTEM · cat 9001 Certificados ----------
  CERT_ACCESS: 'CERT_GEN_0001',
  CERT_MANAGE: 'CERT_GEN_0002', // subir/eliminar
  CERT_USERS: 'CERT_GEN_0003', // NUEVO (ver usuarios autorizados)

  // ---------- REPORTING · cat 4000 ----------
  RPT_SALES: 'REPORTING_GEN_0002', // bueno (sin typo)
  RPT_EXPORT: 'REPORTING_GEN_0004', // NUEVO (descargar/excel)
} as const;

export type PermissionCode = (typeof PERM)[keyof typeof PERM];

/** Códigos legacy que ya existen en BBDD de clientes: no usar en código nuevo. */
export const LEGACY_PERM = {
  /** Typo histórico, usar PERM.RPT_SALES. */
  RPT_SALES_TYPO: 'REPORTINNG_GEN_0002',
  /** 3 dígitos, usar ENTI_CON_NOTES / ENTI_CON_DOCS. */
  ENTI_CON_NOTES_OLD: 'ENTI_CON_003',
  ENTI_CON_DOCS_OLD: 'ENTI_CON_004',
} as const;

/** Módulos del catálogo `security` (post-migración V2026092501). */
export const MODULES = {
  ENTITIES: 'ENTITIES',
  PRODUCTS: 'PRODUCTS',
  SALES: 'SALES',
  TASKS: 'TASKS',
  SYSTEM: 'SYSTEM',
  REPORTING: 'REPORTING',
} as const;

export type ModuleCode = (typeof MODULES)[keyof typeof MODULES];
