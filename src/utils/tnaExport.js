import * as XLSX from 'xlsx';
import { differenceInDays, format, startOfToday } from 'date-fns';
import { generateMilestones, getMilestoneStatus } from './tnaCalculations';

/**
 * Computes exact delay days for a TNA milestone.
 * - If completed with actualDate: max(0, actualDate - targetDate)
 * - If incomplete and targetDate < today: today - targetDate
 * - Otherwise: 0
 */
export const calculateMilestoneDelayDays = (milestone, today = startOfToday()) => {
  if (!milestone?.date) return 0;
  const target = new Date(milestone.date);
  if (Number.isNaN(target.getTime())) return 0;

  if (milestone.actualDate) {
    const actual = new Date(milestone.actualDate);
    if (!Number.isNaN(actual.getTime())) {
      return Math.max(0, differenceInDays(actual, target));
    }
  }

  if (milestone.isComplete) return 0;

  const delay = differenceInDays(today, target);
  return delay > 0 ? delay : 0;
};

const formatReadableStatus = (status, isComplete, delayDays) => {
  if (status === 'complete-late' || (isComplete && delayDays > 0)) return 'Completed Late';
  if (status === 'complete' || isComplete) return 'Completed';
  if (status === 'overdue' || delayDays > 0) return 'Overdue';
  if (status === 'at-risk') return 'At Risk';
  return 'On Track';
};

const safeFormatDate = (dateVal) => {
  if (!dateVal) return '—';
  const parsed = new Date(dateVal);
  if (Number.isNaN(parsed.getTime())) return String(dateVal);
  return format(parsed, 'yyyy-MM-dd');
};

/**
 * Resolves milestones for an order (falls back to auto-generated milestones if TNA tab hasn't been initialized yet).
 */
export const resolveOrderMilestones = (order, preferences = {}) => {
  if (order?.tnaState?.milestones?.length > 0) {
    return order.tnaState.milestones;
  }

  if (!order?.shipDate) return [];

  const generated = generateMilestones(
    order.shipDate,
    preferences.defaultProductionLeadDays || 45,
    preferences.defaultFabricLeadDays || 30,
    order.shipmentMode || 'Sea FCL',
    order.orderQty || 1000,
    preferences.skipWeekends ?? true
  );

  return generated.map((m) => ({
    ...m,
    status: getMilestoneStatus(m),
    notes: '',
  }));
};

const buildTnaExportRows = (milestones) => {
  const today = startOfToday();
  return (milestones || []).map((m, idx) => {
    const computedStatus = m.status || getMilestoneStatus(m, today);
    const delayDays = calculateMilestoneDelayDays(m, today);
    const cleanParty = (m.responsibleParty || 'Merchandiser').replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();

    return {
      step: idx + 1,
      name: m.name || 'Milestone',
      responsible: cleanParty || 'Merchandiser',
      targetDate: safeFormatDate(m.date),
      actualDate: m.actualDate ? safeFormatDate(m.actualDate) : '—',
      status: formatReadableStatus(computedStatus, m.isComplete, delayDays),
      delayDays,
      notes: m.notes || '',
    };
  });
};

/**
 * Exports an order's TNA calendar as a clean Excel (.xlsx) file with header metadata, status, and delay days.
 */
export const exportTNAToExcel = ({ order, tnaData, milestones, preferences = {} }) => {
  const resolvedMilestones =
    milestones && milestones.length > 0 ? milestones : resolveOrderMilestones(order, preferences);
  const rows = buildTnaExportRows(resolvedMilestones);

  const companyName = preferences.companyName || 'GarmentCalc Exports';
  const styleName = order?.styleName || tnaData?.styleName || 'Style';
  const poNumber = order?.poNumber || 'TNA';
  const buyerName = order?.buyerName || '—';
  const shipDate = safeFormatDate(order?.shipDate || tnaData?.shipDate);
  const qty = order?.orderQty ?? tnaData?.quantity ?? 0;

  const overdueCount = rows.filter((r) => r.status === 'Overdue').length;
  const completedCount = rows.filter((r) => r.status === 'Completed' || r.status === 'Completed Late').length;
  const maxDelay = rows.reduce((max, r) => Math.max(max, r.delayDays), 0);

  const sheetData = [
    [`${companyName} — TIME & ACTION (TNA) CALENDAR`],
    [preferences.companyAddress || '', '', '', '', '', '', 'Exported On:', format(new Date(), 'dd MMM yyyy')],
    [],
    ['Buyer:', buyerName, 'PO / Ref:', poNumber, 'Style:', styleName],
    ['Ship Date:', shipDate, 'Order Qty:', `${Number(qty).toLocaleString()} pcs`, 'Mode:', order?.shipmentMode || tnaData?.shipmentMode || 'Sea FCL'],
    ['Completed:', `${completedCount} / ${rows.length}`, 'Overdue Milestones:', overdueCount, 'Max Delay (Days):', maxDelay],
    [],
    ['#', 'Milestone', 'Responsible Party', 'Target Date', 'Actual Date', 'Status', 'Delay (Days)', 'Remarks / Notes'],
    ...rows.map((r) => [
      r.step,
      r.name,
      r.responsible,
      r.targetDate,
      r.actualDate,
      r.status,
      r.delayDays,
      r.notes,
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  ws['!cols'] = [
    { wch: 5 },
    { wch: 38 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 13 },
    { wch: 34 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'TNA Calendar');

  const safeSlug = `${poNumber}_${styleName}`.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 48);
  const dateStamp = format(new Date(), 'yyyy-MM-dd');
  const filename = `TNA_${safeSlug}_${dateStamp}.xlsx`;

  XLSX.writeFile(wb, filename);
  return filename;
};

/**
 * Exports an order's TNA calendar as a clean UTF-8 CSV (.csv) file.
 */
export const exportTNAToCSV = ({ order, tnaData, milestones, preferences = {} }) => {
  const resolvedMilestones =
    milestones && milestones.length > 0 ? milestones : resolveOrderMilestones(order, preferences);
  const rows = buildTnaExportRows(resolvedMilestones);

  const escapeCsv = (val) => {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLines = [
    ['Company', preferences.companyName || 'GarmentCalc Exports'],
    ['Buyer', order?.buyerName || '—'],
    ['PO Number', order?.poNumber || '—'],
    ['Style', order?.styleName || tnaData?.styleName || '—'],
    ['Ship Date', safeFormatDate(order?.shipDate || tnaData?.shipDate)],
    [],
    ['Step', 'Milestone', 'Responsible Party', 'Target Date', 'Actual Date', 'Status', 'Delay Days', 'Notes'],
    ...rows.map((r) => [
      r.step,
      r.name,
      r.responsible,
      r.targetDate,
      r.actualDate,
      r.status,
      r.delayDays,
      r.notes,
    ]),
  ];

  const csvContent = headerLines.map((line) => line.map(escapeCsv).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const safeSlug = `${order?.poNumber || 'TNA'}_${order?.styleName || tnaData?.styleName || 'Order'}`
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .slice(0, 48);
  const dateStamp = format(new Date(), 'yyyy-MM-dd');
  const filename = `TNA_${safeSlug}_${dateStamp}.csv`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return filename;
};
