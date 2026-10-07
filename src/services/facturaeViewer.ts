/** Read only the archived XML. Missing values must never be inferred from ERP records. */
export type XmlField = { label: string; value: string };
export type XmlTable = { title: string; headers: string[]; rows: string[][] };
export type FacturaeView = ReturnType<typeof parseFacturae>;
export type ArchivedFacturae = {
  blob: Blob;
  filename: string;
  signature?: FacturaeSignatureInfo | null;
};

/** Información de firma del documento archivado, extraída en el ERP. */
export type FacturaeSignatureInfo = {
  signed: boolean;
  version?: number;
  invoiceCode?: string;
  operation?: string;
  archivedAt?: string | null;
  signatureMethod?: string;
  digestMethod?: string;
  certSubject?: string;
  certIssuer?: string;
  certSerial?: string;
  certNotBefore?: number;
  certNotAfter?: number;
  parseError?: boolean;
};

function children(node: Element | null, name: string): Element[] {
  return node
    ? Array.from(node.children).filter(
        (child) =>
          child.localName === name && child.namespaceURI === node.namespaceURI,
      )
    : [];
}
function at(node: Element | null, path: string): Element | null {
  return path
    .split("/")
    .reduce<Element | null>(
      (parent, name) => children(parent, name)[0] || null,
      node,
    );
}
function value(node: Element | null, path: string): string {
  return at(node, path)?.textContent?.trim() || "";
}
function fields(
  node: Element | null,
  definitions: [string, string][],
): XmlField[] {
  return definitions.map(([label, path]) => ({
    label,
    value: value(node, path),
  }));
}
export function xmlNumber(raw: string): string {
  if (!raw) return "—";
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return raw;
  const number = Number(raw);
  if (!Number.isFinite(number) || Math.abs(number) > Number.MAX_SAFE_INTEGER)
    return raw;
  return new Intl.NumberFormat("es-ES", {
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.min(
      20,
      Math.max(2, raw.split(".")[1]?.length || 0),
    ),
  }).format(number);
}
function party(node: Element | null) {
  const legal = at(node, "LegalEntity");
  const individual = at(node, "Individual");
  const identity = legal || individual;
  const address =
    at(identity, "AddressInSpain") || at(identity, "OverseasAddress");
  return {
    name:
      value(legal, "CorporateName") ||
      ["Name", "FirstSurname", "SecondSurname"]
        .map((key) => value(individual, key))
        .filter(Boolean)
        .join(" "),
    fields: [
      ...fields(node, [
        ["NIF / Identificación", "TaxIdentification/TaxIdentificationNumber"],
      ]),
      ...fields(address, [
        ["Dirección", "Address"],
        ["Código postal", "PostCode"],
        ["Localidad", "Town"],
        ["Provincia", "Province"],
        ["País", "CountryCode"],
        ["Código postal y localidad", "PostCodeAndTown"],
      ]).filter((field) => field.value),
    ],
    centres: children(
      at(node, "AdministrativeCentres"),
      "AdministrativeCentre",
    ).map((centre) => ({
      code: value(centre, "CentreCode"),
      role: value(centre, "RoleTypeCode"),
      name: value(centre, "Name"),
      description: value(centre, "CentreDescription"),
    })),
  };
}
function taxes(invoice: Element, path: string, title: string): XmlTable {
  return {
    title,
    headers: ["Código de impuesto", "Tipo (%)", "Base imponible", "Cuota"],
    rows: children(at(invoice, path), "Tax").map((tax) => [
      value(tax, "TaxTypeCode"),
      ...["TaxRate", "TaxableBase/TotalAmount", "TaxAmount/TotalAmount"].map(
        (key) => xmlNumber(value(tax, key)),
      ),
    ]),
  };
}

export function parseFacturae(xml: string) {
  // No DTD/entities or external resources are needed to inspect an invoice.
  if (/<!DOCTYPE|<!ENTITY/i.test(xml))
    throw new Error(
      "No se visualizan XML con DTD o entidades. Puedes descargar el original.",
    );
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length)
    throw new Error(
      "El archivo no es un XML bien formado. Puedes descargar el original.",
    );
  const root = doc.documentElement;
  if (root.localName !== "Facturae")
    throw new Error(
      "El archivo no tiene una raíz Facturae. Puedes descargar el original.",
    );
  // Facturae commonly qualifies only its root; other documents qualify every element.
  const content = Array.from(root.children).find(
    (child) => child.localName === "Invoices",
  );
  const parties =
    Array.from(root.children).find((child) => child.localName === "Parties") ||
    null;
  const invoices = children(content || null, "Invoice");
  if (!invoices.length)
    throw new Error("El XML no contiene facturas que se puedan visualizar.");
  return {
    seller: party(at(parties, "SellerParty")),
    buyer: party(at(parties, "BuyerParty")),
    invoices: invoices.map((invoice) => ({
      number: value(invoice, "InvoiceHeader/InvoiceNumber"),
      series: value(invoice, "InvoiceHeader/InvoiceSeriesCode"),
      currency: value(invoice, "InvoiceIssueData/InvoiceCurrencyCode"),
      header: fields(invoice, [
        ["Número", "InvoiceHeader/InvoiceNumber"],
        ["Serie", "InvoiceHeader/InvoiceSeriesCode"],
        ["Fecha de expedición", "InvoiceIssueData/IssueDate"],
        ["Moneda", "InvoiceIssueData/InvoiceCurrencyCode"],
      ]),
      lines: children(at(invoice, "Items"), "InvoiceLine").map((line) => [
        value(line, "ItemDescription"),
        ...["Quantity", "UnitPriceWithoutTax", "TotalCost", "GrossAmount"].map(
          (key) => xmlNumber(value(line, key)),
        ),
      ]),
      taxes: [
        taxes(invoice, "TaxesOutputs", "Impuestos repercutidos"),
        taxes(invoice, "TaxesWithheld", "Retenciones"),
      ],
      totals: fields(invoice, [
        ["Importe bruto", "InvoiceTotals/TotalGrossAmount"],
        ["Descuentos generales", "InvoiceTotals/TotalGeneralDiscounts"],
        ["Recargos generales", "InvoiceTotals/TotalGeneralSurcharges"],
        [
          "Importe bruto antes de impuestos",
          "InvoiceTotals/TotalGrossAmountBeforeTaxes",
        ],
        ["Impuestos repercutidos", "InvoiceTotals/TotalTaxOutputs"],
        ["Retenciones", "InvoiceTotals/TotalTaxesWithheld"],
        ["Total factura", "InvoiceTotals/InvoiceTotal"],
        ["Total pendiente", "InvoiceTotals/TotalOutstandingAmount"],
        ["Total a ejecutar", "InvoiceTotals/TotalExecutableAmount"],
      ])
        .filter((field) => field.value)
        .map((field) => ({ ...field, value: xmlNumber(field.value) })),
      information: value(
        invoice,
        "AdditionalData/InvoiceAdditionalInformation",
      ),
    })),
    // Indent element-only branches; mixed text stays intact. This is display-only.
    formattedXml: formatXml(doc),
  };
}

function formatXml(doc: Document): string {
  const serializer = new XMLSerializer();
  function format(node: Node, depth: number): string {
    const indent = "  ".repeat(depth);
    if (node.nodeType !== 1 || depth > 30)
      return indent + serializer.serializeToString(node);
    const element = node as Element;
    if (
      !element.children.length ||
      Array.from(node.childNodes).some(
        (child) =>
          (child.nodeType === 3 && child.textContent?.trim()) ||
          child.nodeType === 4,
      )
    )
      return indent + serializer.serializeToString(node);
    const shell = serializer.serializeToString(element.cloneNode(false));
    const opening = shell
      .replace(/\s*\/>$/, ">")
      .replace(new RegExp(`</${element.tagName}>$`), "");
    const inner = Array.from(node.childNodes).filter(
      (child) => child.nodeType !== 3 || child.textContent?.trim(),
    );
    return `${indent}${opening}\n${inner.map((child) => format(child, depth + 1)).join("\n")}\n${indent}</${element.tagName}>`;
  }
  return Array.from(doc.childNodes)
    .map((node) => format(node, 0))
    .join("\n");
}

export function downloadArchivedFacturae(document: ArchivedFacturae) {
  const url = URL.createObjectURL(document.blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = document.filename;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function facturaeError(error: any): Promise<string> {
  if (error.response?.status === 401)
    return "Vuelve a iniciar sesión para consultar la factura.";
  if (
    error.response?.data instanceof Blob &&
    error.response.data.type.startsWith("text/plain")
  ) {
    return (
      (await error.response.data.text()) ||
      "No se pudo recuperar el XML archivado."
    );
  }
  return error.response
    ? "No se pudo recuperar el XML archivado."
    : error.message || "No se pudo abrir la factura electrónica.";
}
