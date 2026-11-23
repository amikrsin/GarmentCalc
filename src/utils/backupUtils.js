import { differenceInDays, format } from 'date-fns';
import { loadFromStorage, saveToStorage } from './storage';

export const BACKUP_META_KEY = 'garmentcalc_backup_meta';
export const BACKUP_WARNING_DAYS = 7;

export const DEFAULT_BACKUP_META = {
  lastBackupAt: null,
  lastRestoredAt: null,
};

export const loadBackupMeta = () => {
  const stored = loadFromStorage(BACKUP_META_KEY, null);
  if (!stored || typeof stored !== 'object') {
    return { ...DEFAULT_BACKUP_META };
  }
  return {
    ...DEFAULT_BACKUP_META,
    ...stored,
  };
};

export const saveBackupMeta = (meta) => {
  return saveToStorage(BACKUP_META_KEY, meta);
};

/**
 * Computes backup freshness status for the 7-day data safety reminder.
 */
export const getBackupStatus = (lastBackupAt) => {
  if (!lastBackupAt) {
    return {
      hasBackedUp: false,
      daysSinceBackup: null,
      isOverdue: true,
    };
  }

  const parsedDate = new Date(lastBackupAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return {
      hasBackedUp: false,
      daysSinceBackup: null,
      isOverdue: true,
    };
  }

  const days = Math.max(0, differenceInDays(new Date(), parsedDate));
  return {
    hasBackedUp: true,
    daysSinceBackup: days,
    isOverdue: days >= BACKUP_WARNING_DAYS,
  };
};

/**
 * Exports all GarmentCalc browser data (orders, buyers, costing, TNA, preferences) as a single .json file.
 */
export const exportBackupJSON = ({ orders, preferences }) => {
  const exportedAt = new Date().toISOString();

  const currentCosting = loadFromStorage('garmentcalc_current_costing', null);
  const currentTna = loadFromStorage('garmentcalc_current_tna', null);
  const savedCostings = loadFromStorage('garmentcalc_saved_costings', null);

  const uniqueBuyers = Array.from(
    new Set((orders || []).map((o) => (o.buyerName || '').trim()).filter(Boolean))
  );

  const payload = {
    app: 'GarmentCalc',
    schemaVersion: 2,
    exportedAt,
    summary: {
      orderCount: (orders || []).length,
      buyerCount: uniqueBuyers.length,
    },
    data: {
      orders: orders || [],
      preferences: preferences || {},
      currentCosting,
      currentTna,
      savedCostings,
    },
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStamp = format(new Date(), 'yyyy-MM-dd');
  const filename = `GarmentCalc_Backup_${dateStamp}.json`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { filename, exportedAt, orderCount: payload.summary.orderCount };
};

/**
 * Safely migrates a single order object so restored backups never break newer UI fields.
 */
export const sanitizeOrder = (order) => {
  if (!order || typeof order !== 'object') return null;

  const nowIso = new Date().toISOString();
  return {
    id: order.id || crypto.randomUUID(),
    createdAt: order.createdAt || nowIso,
    updatedAt: order.updatedAt || nowIso,
    isArchived: Boolean(order.isArchived),
    status: order.status || 'ENQUIRY',
    buyerName: order.buyerName || 'Unknown Buyer',
    buyerContact: order.buyerContact || '',
    buyerEmail: order.buyerEmail || '',
    buyerPhone: order.buyerPhone || '',
    poNumber: order.poNumber || order.styleName || 'PO-IMPORTED',
    poDate: order.poDate || nowIso.split('T')[0],
    styleName: order.styleName || 'Untitled Style',
    category: order.category || 'Knit T-Shirts / Polos',
    styleDescription: order.styleDescription || '',
    season: order.season || '',
    orderType: order.orderType || 'FOB',
    fabricComposition: order.fabricComposition || '',
    fabricDescription: order.fabricDescription || '',
    orderQty: Number(order.orderQty) || 0,
    sizeBreakdown: Array.isArray(order.sizeBreakdown) ? order.sizeBreakdown : [],
    colours: order.colours || '',
    fobPrice: Number(order.fobPrice) || 0,
    totalFOBValue: Number(order.totalFOBValue) || (Number(order.fobPrice) || 0) * (Number(order.orderQty) || 0),
    currency: order.currency || 'USD',
    exchangeRate: Number(order.exchangeRate) || 84.5,
    shipDate: order.shipDate || nowIso.split('T')[0],
    shipmentMode: order.shipmentMode || 'Sea FCL',
    portOfLoading: order.portOfLoading || 'Nhava Sheva',
    destinationCountry: order.destinationCountry || '',
    destinationPort: order.destinationPort || '',
    factoryName: order.factoryName || '',
    factoryContact: order.factoryContact || '',
    factoryPhone: order.factoryPhone || '',
    factoryLocation: order.factoryLocation || '',
    factoryType: order.factoryType || 'FOB',
    costingState: order.costingState || null,
    tnaState: order.tnaState || null,
    carrierName: order.carrierName || '',
    blNumber: order.blNumber || '',
    containerNo: order.containerNo || '',
    sealNo: order.sealNo || '',
    commercialInvoiceNo: order.commercialInvoiceNo || '',
    estimatedDeparture: order.estimatedDeparture || '',
    estimatedArrival: order.estimatedArrival || '',
    actualShipDate: order.actualShipDate || '',
    approvals: Array.isArray(order.approvals) ? order.approvals : [],
    comments: Array.isArray(order.comments) ? order.comments : [],
    documents: Array.isArray(order.documents) ? order.documents : [],
    generalNotes: order.generalNotes || '',
    statusLog: Array.isArray(order.statusLog) ? order.statusLog : [],
  };
};

/**
 * Parses and validates an uploaded JSON backup file.
 */
export const parseBackupFile = (rawText) => {
  try {
    const parsed = JSON.parse(rawText);
    if (!parsed || typeof parsed !== 'object') {
      return { valid: false, error: 'Backup file does not contain valid JSON data.' };
    }

    let rawOrders = null;
    let rawPreferences = null;
    let currentCosting = null;
    let currentTna = null;
    let savedCostings = null;
    let exportedAt = parsed.exportedAt || null;

    if (parsed.data && Array.isArray(parsed.data.orders)) {
      rawOrders = parsed.data.orders;
      rawPreferences = parsed.data.preferences || null;
      currentCosting = parsed.data.currentCosting || null;
      currentTna = parsed.data.currentTna || null;
      savedCostings = parsed.data.savedCostings || null;
    } else if (Array.isArray(parsed.orders)) {
      rawOrders = parsed.orders;
      rawPreferences = parsed.preferences || null;
    } else if (Array.isArray(parsed)) {
      rawOrders = parsed;
    }

    if (!Array.isArray(rawOrders)) {
      return {
        valid: false,
        error: 'Unrecognized backup format. Please select a valid GarmentCalc .json backup file.',
      };
    }

    const sanitizedOrders = rawOrders.map(sanitizeOrder).filter(Boolean);
    const uniqueBuyers = Array.from(
      new Set(sanitizedOrders.map((o) => (o.buyerName || '').trim()).filter(Boolean))
    );

    return {
      valid: true,
      summary: {
        orderCount: sanitizedOrders.length,
        buyerCount: uniqueBuyers.length,
        hasPreferences: Boolean(rawPreferences && typeof rawPreferences === 'object'),
        exportedAt,
      },
      data: {
        orders: sanitizedOrders,
        preferences: rawPreferences && typeof rawPreferences === 'object' ? rawPreferences : null,
        currentCosting,
        currentTna,
        savedCostings,
      },
    };
  } catch (err) {
    return {
      valid: false,
      error: 'Could not read file. Make sure it is a valid .json backup exported from GarmentCalc.',
    };
  }
};
