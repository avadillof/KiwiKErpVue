import { buildReportPdf, type ReportColumn, type ReportRow } from '../reportEngine';
import type { TpvClosure } from '../../../views/TPV/tpvClosure';

/** Descriptor del RPT-TPV-001 Cierre de caja TPV (mismo motor y estilo que el resto de RPT). */

export const RPT_TPV_001_CODE = 'RPT-TPV-001';
export const RPT_TPV_001_TITLE = 'Cierre de caja TPV';

export interface TpvClosingCompany {
  name: string;
  slogan: string;
  logoUrl: string;
}

const pad = (v: number) => String(v).padStart(2, '0');
const fmtDayTime = (v: unknown) => {
  if (!v) return '';
  const d = v instanceof Date ? v : new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Importes con separadores de mil (1.234,56), como el resto de RPT. */
const fmtMoney = (v: unknown) => {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const SUMMARY_COLUMNS: ReportColumn[] = [
  { key: 'concept', header: 'Concepto' },
  { key: 'amount', header: 'Importe', align: 'right' }
];

const STAFF_COLUMNS: ReportColumn[] = [
  { key: 'name', header: 'Empleado' },
  { key: 'tickets', header: 'Tickets', align: 'right' },
  { key: 'refunds', header: 'Devol.', align: 'right' },
  { key: 'cashSales', header: 'Ventas ef.', align: 'right' },
  { key: 'cardSales', header: 'Ventas tj.', align: 'right' },
  { key: 'cashRefunds', header: 'Dev. ef.', align: 'right' },
  { key: 'cardRefunds', header: 'Dev. tj.', align: 'right' }
];

/** Genera el PDF del cierre y devuelve su URL de objeto para abrirlo/descargarlo. */
export async function buildTpvClosingPdf(
  closure: TpvClosure,
  company: TpvClosingCompany
): Promise<string> {
  const summaryRows: ReportRow[] = [
    { concept: 'Fondo inicial', amount: fmtMoney(closure.openingFloat) },
    { concept: 'Ventas en efectivo', amount: fmtMoney(closure.cashSales) },
    { concept: 'Ventas con tarjeta', amount: fmtMoney(closure.cardSales) },
    { concept: 'Devoluciones en efectivo', amount: fmtMoney(-(Number(closure.cashRefunds) || 0)) },
    { concept: 'Devoluciones con tarjeta', amount: fmtMoney(-(Number(closure.cardRefunds) || 0)) }
  ];
  const summaryFoot: ReportRow[] = [
    { concept: 'Esperado en cajón', amount: fmtMoney(closure.expectedCash) },
    {
      concept: 'Efectivo contado',
      amount: closure.countedCash == null ? 'Pendiente de recuento' : fmtMoney(closure.countedCash)
    },
    {
      concept: 'Diferencia',
      amount: closure.difference == null ? 'Pendiente de recuento' : fmtMoney(closure.difference)
    }
  ];
  interface StaffRow {
    name?: string;
    ticketCount?: number;
    refundCount?: number;
    cashSales?: number;
    cardSales?: number;
    cashRefunds?: number;
    cardRefunds?: number;
  }
  const staffRows: ReportRow[] = ((closure.employees ?? []) as StaffRow[]).map((e) => ({
    name: String(e.name ?? ''),
    tickets: (e.ticketCount ?? 0).toLocaleString("de-DE"),
    refunds: (e.refundCount ?? 0).toLocaleString("de-DE"),
    cashSales: fmtMoney(e.cashSales),
    cardSales: fmtMoney(e.cardSales),
    cashRefunds: fmtMoney(e.cashRefunds),
    cardRefunds: fmtMoney(e.cardRefunds)
  }));
  const extra = [
    closure.status === 'PENDING_RECONCILIATION' ? 'Pendiente de arqueo' : 'Arqueo registrado',
    closure.remote ? 'Cierre remoto desde central' : 'Recuento en caja',
    `Motivo: ${closure.reason || 'Sin diferencia'}`
  ];
  if (closure.reconciledAt)
    extra.push(
      `Arqueo posterior ${fmtDayTime(closure.reconciledAt)} · ${closure.reconciliationReason || 'Sin diferencia'}`
    );
  return buildReportPdf({
    code: RPT_TPV_001_CODE,
    title: `${RPT_TPV_001_TITLE} ${closure.code || ''}`.trim(),
    subtitle: `${closure.companyName || company.name} · N.I.F: ${closure.companyCif || '—'}`,
    filtersText:
      `${closure.zoneName} / ${closure.registerName} · Apertura #${closure.openingId}` +
      ` · Abierta ${fmtDayTime(closure.openedAt) || '—'} ${closure.openedBy || ''}` +
      ` · Cerrada ${fmtDayTime(closure.closedAt) || '—'} ${closure.closedBy || ''}` +
      ` · ${extra.join(' · ')}` +
      ` · ${closure.ticketCount.toLocaleString("de-DE")} tickets / ${closure.refundCount.toLocaleString("de-DE")} devoluciones`,
    columns: SUMMARY_COLUMNS,
    rows: [],
    sections: [
      { title: 'Resumen', columns: SUMMARY_COLUMNS, rows: summaryRows, footerRows: summaryFoot },
      ...(staffRows.length
        ? [{ title: 'Por empleado', columns: STAFF_COLUMNS, rows: staffRows }]
        : [])
    ],
    dottedRows: true,
    company: { name: company.name, slogan: company.slogan, logoUrl: company.logoUrl }
  });
}
