import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Motor genérico de reportes RPT.
 * Regla: PDF siempre en DIN-A4 apaisado, letra compacta, columnas al contenido,
 * primera página con cabecera completa y pie corporativo en todas.
 * Cada informe aporta un descriptor (columnas + filas); este motor pinta.
 */

export interface ReportColumn {
  key: string;
  header: string;
}

export type ReportRow = Record<string, string | boolean | number>;

export interface ReportOrder {
  key: string;
  dir: 'asc' | 'desc';
}

export function sortReportRows(rows: ReportRow[], orders: ReportOrder[]): ReportRow[] {
  const list = orders.length ? orders : [{ key: 'name', dir: 'asc' as const }];
  return [...rows].sort((a, b) => {
    for (const o of list) {
      const mult = o.dir === 'desc' ? -1 : 1;
      const va = a[o.key];
      const vb = b[o.key];
      let cmp: number;
      if (typeof va === 'boolean' || typeof vb === 'boolean') cmp = Number(va) - Number(vb);
      else if (typeof va === 'number' || typeof vb === 'number') cmp = Number(va) - Number(vb);
      else cmp = String(va ?? '').localeCompare(String(vb ?? ''), 'es', { sensitivity: 'base' });
      if (cmp !== 0) return cmp * mult;
    }
    return 0;
  });
}

/** Fecha dd/mm/aaaa para el informe (el back devuelve "2026-09-11"). */
export function formatDay(value: unknown): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export interface ReportCompany {
  name: string;
  slogan: string;
  logoUrl: string;
}

export interface ReportExcelInput {
  code: string;
  columns: ReportColumn[];
  rows: ReportRow[];
}

/** Exporta las columnas visibles del informe a Excel. Nombre: RPT-XXX-NNN_AAAAMMDD.xlsx */
export function exportReportExcel(input: ReportExcelInput): void {
  const cell = (v: unknown) =>
    typeof v === 'boolean' ? (v ? 'Sí' : 'No') : typeof v === 'number' ? v : String((v as string) ?? '');
  const sheet = XLSX.utils.aoa_to_sheet([
    input.columns.map((c) => c.header),
    ...input.rows.map((r) => input.columns.map((c) => cell(r[c.key])))
  ]);
  sheet['!cols'] = input.columns.map(() => ({ wch: 22 }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Informe');
  const now = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  XLSX.writeFile(book, `${input.code}_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.xlsx`);
}

export interface ReportPdfInput {
  code: string;
  title: string;
  filtersText: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  /** Filas destacadas en rojo (p.ej. borrados). */
  redWhen?: (row: ReportRow) => boolean;
  company: ReportCompany;
}

async function loadLogo(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Genera el PDF y devuelve su URL de objeto para embeberlo. */
export async function buildReportPdf(input: ReportPdfInput): Promise<string> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const now = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  const stamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const logo = await loadLogo(input.company.logoUrl);
  const title = `[${input.code}] ${input.title}`;
  const cell = (v: unknown) =>
    typeof v === 'boolean' ? (v ? 'Sí' : 'No') : typeof v === 'number' ? String(v) : String((v as string) ?? '');

  const drawFirstHeader = () => {
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', 12, 8, 32, 24);
      } catch {
        /* logo en otro formato: se omite */
      }
    }
    const x = logo ? 50 : 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(title, x, 17, { maxWidth: 230 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(doc.splitTextToSize(input.filtersText, 230), x, 23);
    doc.text(stamp, 285, 14, { align: 'right' });
    doc.setDrawColor(156, 193, 10);
    doc.setLineWidth(1);
    doc.line(12, 34, 285, 34);
  };
  const drawSmallHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.text(title, 12, 12);
    doc.setDrawColor(156, 193, 10);
    doc.setLineWidth(0.6);
    doc.line(12, 15, 285, 15);
  };
  const drawFooter = (page: number, pages: number) => {
    doc.setDrawColor(156, 193, 10);
    doc.setLineWidth(0.8);
    doc.line(12, 191, 285, 191);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40);
    doc.text(input.company.name || 'KiwiKERP', 12, 196);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(130);
    if (input.company.slogan) doc.text(input.company.slogan, 12, 200);
    doc.setFont('helvetica', 'normal');
    doc.text(`${input.rows.length} registros · Página ${page}/${pages}`, 285, 198, { align: 'right' });
  };

  autoTable(doc, {
    startY: 38,
    head: [input.columns.map((c) => c.header)],
    body: input.rows.map((r) => input.columns.map((c) => cell(r[c.key]))),
    styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
    headStyles: { fillColor: [100, 133, 6], fontSize: 7 },
    tableWidth: 'auto',
    margin: { top: 20, bottom: 22 },
    didParseCell: (data: any) => {
      if (data.section === 'body' && input.redWhen?.(input.rows[data.row.index])) {
        data.cell.styles.fillColor = [253, 230, 230];
      }
    },
    didDrawPage: (data: any) => {
      if (data.pageNumber === 1) drawFirstHeader();
      else drawSmallHeader();
    }
  });
  // Pie en segunda pasada: aquí sí se conoce el total de páginas.
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }
  return URL.createObjectURL(doc.output('blob'));
}
