import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { calculateFabricRowCost } from '../../utils/costingCalculations';
import { getTrimLineCost, getSafeEmbellishmentCost } from '../../utils/orderCostingSummary';

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: 'EUR ',
  GBP: 'GBP ',
  INR: 'Rs.',
  BDT: 'BDT ',
};

const safeFormatDate = (val, fallback) => {
  if (!val) return fallback;
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return String(val);
  return format(d, 'dd MMM yyyy');
};

/**
 * Generates a clean, buyer-ready (or internal) Garment Costing Sheet PDF
 * with Company Name, Address, and Contact Info header from Settings.
 */
export const generateCostingPDF = (data, results, breakdown, options = {}) => {
  const { companyProfile = {}, modeOverride = null } = options;

  const doc = new jsPDF('p', 'mm', 'a4');
  const dateObj = new Date();
  const todayFormatted = format(dateObj, 'dd MMM yyyy');

  const effectiveType = modeOverride || data?.styleInfo?.costingType || 'buyer';
  const isInternal = effectiveType === 'internal';
  const currency = data?.styleInfo?.currency || 'USD';
  const exchangeRate = Number(data?.styleInfo?.exchangeRate) || 1;
  const showINR = currency === 'INR' || (exchangeRate > 1 && currency === 'USD');
  const currencySymbol = CURRENCY_SYMBOLS[currency] || `${currency} `;

  const companyName =
    (companyProfile.companyName || '').trim() ||
    (data?.styleInfo?.companyName || '').trim() ||
    'GarmentCalc Exports';
  const companyAddress = (companyProfile.companyAddress || '').trim();
  const companyContact = (companyProfile.companyContact || '').trim();
  const preparedBy = (companyProfile.userName || '').trim();

  // 1. Company Letterhead & Document Title Block
  doc.setFillColor(26, 60, 92); // Navy top accent bar
  doc.rect(0, 0, 210, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(26, 60, 92);
  doc.text(companyName, 14, 14);

  let headerLeftY = 19;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90, 100, 115);

  if (companyAddress) {
    const addrLines = doc.splitTextToSize(companyAddress, 95);
    doc.text(addrLines, 14, headerLeftY);
    headerLeftY += addrLines.length * 3.8;
  }
  if (companyContact) {
    const contactLines = doc.splitTextToSize(companyContact, 95);
    doc.text(contactLines, 14, headerLeftY);
    headerLeftY += contactLines.length * 3.8;
  }

  // Right-aligned Document Title & Reference
  const docTitle = isInternal ? 'INTERNAL COST SHEET' : 'BUYER COSTING QUOTATION';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(26, 60, 92);
  doc.text(docTitle, 196, 14, { align: 'right' });

  const costingRefDate = data?.styleInfo?.costingDate || format(dateObj, 'yyyy-MM-dd');
  const styleRef = (data?.styleInfo?.styleNo || '001').replace(/\s+/g, '');
  const costingRef = `QT-${costingRefDate.replace(/-/g, '')}-${styleRef.slice(-6)}`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 110, 125);
  doc.text(`Ref: ${costingRef}`, 196, 19.5, { align: 'right' });
  doc.text(`Date: ${safeFormatDate(data?.styleInfo?.costingDate, todayFormatted)}`, 196, 23.8, { align: 'right' });

  if (isInternal) {
    doc.setTextColor(232, 98, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIAL — INTERNAL USE ONLY', 196, 28, { align: 'right' });

    // Subtle watermark
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.08 }));
    doc.setFontSize(56);
    doc.setTextColor(150, 150, 150);
    doc.text('INTERNAL', 105, 155, { align: 'center', angle: 45 });
    doc.restoreGraphicsState();
  }

  const dividerY = Math.max(headerLeftY + 2, 31);
  doc.setDrawColor(26, 60, 92);
  doc.setLineWidth(0.5);
  doc.line(14, dividerY, 196, dividerY);
  doc.setDrawColor(232, 98, 42);
  doc.setLineWidth(0.8);
  doc.line(14, dividerY, 55, dividerY);

  // Optional Garment Image
  const hasImage = Boolean(data?.styleInfo?.garmentImage);
  if (hasImage) {
    try {
      doc.addImage(data.styleInfo.garmentImage, 'JPEG', 164, dividerY + 4, 32, 38);
      doc.setDrawColor(220, 224, 230);
      doc.setLineWidth(0.3);
      doc.rect(164, dividerY + 4, 32, 38);
    } catch (e) {
      console.error('Error adding garment image to PDF:', e);
    }
  }

  // 2. Style & Order Metadata Grid
  const metaStartY = dividerY + 8;
  const col1 = 14;
  const col2 = 38;
  const col3 = hasImage ? 92 : 108;
  const col4 = hasImage ? 116 : 134;
  const maxValWidth = hasImage ? 46 : 60;

  const mainFabric = (data?.fabrics && data.fabrics[0]) || {};
  const drawMetaRow = (y, l1, v1, l2, v2) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 82, 96);
    doc.text(l1, col1, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(String(v1 || '—'), maxValWidth)[0], col2, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(70, 82, 96);
    doc.text(l2, col3, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(String(v2 || '—'), maxValWidth)[0], col4, y);
  };

  drawMetaRow(metaStartY, 'Style Name:', data?.styleInfo?.styleName, 'Buyer:', data?.styleInfo?.buyerName);
  drawMetaRow(metaStartY + 5.5, 'PO / Style #:', data?.styleInfo?.styleNo, 'Season:', data?.styleInfo?.season);
  drawMetaRow(
    metaStartY + 11,
    'Category:',
    data?.styleInfo?.category,
    'Order Qty:',
    `${Number(data?.styleInfo?.orderQty || 0).toLocaleString()} pcs`
  );
  drawMetaRow(
    metaStartY + 16.5,
    'Fabric:',
    mainFabric.name || mainFabric.description || 'As per spec',
    'Ship Date:',
    safeFormatDate(data?.styleInfo?.shipDate, 'TBD')
  );
  drawMetaRow(
    metaStartY + 22,
    'Composition:',
    mainFabric.composition || '—',
    'Terms / Curr:',
    `${data?.styleInfo?.orderType || 'FOB'} · ${currency}`
  );

  const tablesStartY = Math.max(metaStartY + 30, hasImage ? dividerY + 46 : metaStartY + 29);

  // 3. Fabric Cost Table
  const fabricHeaders = [['FABRIC DETAIL', 'WIDTH', 'CONSP', 'RATE', `TOTAL (${currency})`]];
  if (showINR) fabricHeaders[0].push('TOTAL (INR)');

  const fabricRows = (data?.fabrics || []).map((f) => {
    const fabricCost = calculateFabricRowCost(f);
    const consp = f.consumptionMode === 'auto' ? Number(f.calculatedConsumption || 0) : Number(f.consumption || 0);
    const row = [
      `${f.name || 'Body Fabric'}${f.composition ? ` (${f.composition})` : ''}`,
      f.widthInches ? `${f.widthInches}"` : '—',
      consp.toFixed(2),
      Number(f.price || 0).toFixed(2),
      fabricCost.toFixed(2),
    ];
    if (showINR) row.push((fabricCost * exchangeRate).toFixed(2));
    return row;
  });

  if (fabricRows.length > 0) {
    autoTable(doc, {
      startY: tablesStartY,
      head: fabricHeaders,
      body: fabricRows,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2.2, textColor: [30, 41, 59] },
      headStyles: { fillColor: [26, 60, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: showINR ? 72 : 88 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
      foot: [
        [
          'TOTAL FABRIC COST',
          '',
          '',
          '',
          Number(results.fabricTotal || 0).toFixed(2),
          ...(showINR ? [(Number(results.fabricTotal || 0) * exchangeRate).toFixed(2)] : []),
        ],
      ],
      footStyles: { fillColor: [241, 245, 249], textColor: [26, 60, 92], fontStyle: 'bold', halign: 'right' },
    });
  }

  // 4. Trims, Embellishments & Washing Table
  const trimsHeaders = [['TRIMS & VALUE ADDITIONS', 'QTY', 'RATE', `TOTAL (${currency})`]];
  if (showINR) trimsHeaders[0].push('TOTAL (INR)');

  const trimsRows = (data?.trims || []).map((t) => {
    const qty = t.qty !== undefined && t.qty !== null ? Number(t.qty) : 1;
    const rate = t.price !== undefined && t.price !== null ? Number(t.price) : Number(t.rate) || 0;
    const total = getTrimLineCost(t);
    const row = [t.name || 'Trim', qty.toFixed(2), rate.toFixed(2), total.toFixed(2)];
    if (showINR) row.push((total * exchangeRate).toFixed(2));
    return row;
  });

  (data?.embellishments || []).forEach((e) => {
    const cost = getSafeEmbellishmentCost(e);
    const label = e.details ? `${e.type} — ${e.details}` : e.type || 'Embellishment';
    const row = [label, '1.00', cost.toFixed(2), cost.toFixed(2)];
    if (showINR) row.push((cost * exchangeRate).toFixed(2));
    trimsRows.push(row);
  });

  if (data?.finishing?.washingRequired && Number(data?.finishing?.washingRate) > 0) {
    const washRate = Number(data.finishing.washingRate);
    const washLabel = data.finishing.washType ? `Washing (${data.finishing.washType})` : 'Washing Charges';
    const row = [washLabel, '1.00', washRate.toFixed(2), washRate.toFixed(2)];
    if (showINR) row.push((washRate * exchangeRate).toFixed(2));
    trimsRows.push(row);
  }

  const trimsAndExtrasTotal =
    Number(results.trimsTotal || 0) +
    Number(results.embellishmentTotal || 0) +
    (data?.finishing?.washingRequired ? Number(data.finishing.washingRate || 0) : 0);

  if (trimsRows.length > 0) {
    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || tablesStartY) + 5,
      head: trimsHeaders,
      body: trimsRows,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2.2, textColor: [30, 41, 59] },
      headStyles: { fillColor: [26, 60, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: showINR ? 88 : 106 },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
      },
      foot: [
        [
          'TOTAL TRIMS & EMBELLISHMENTS',
          '',
          '',
          trimsAndExtrasTotal.toFixed(2),
          ...(showINR ? [(trimsAndExtrasTotal * exchangeRate).toFixed(2)] : []),
        ],
      ],
      footStyles: { fillColor: [241, 245, 249], textColor: [26, 60, 92], fontStyle: 'bold', halign: 'right' },
    });
  }

  // 5. Manufacturing / CMT & Commercial Summary
  const finishingWithoutWash =
    Number(data?.finishing?.threadCuttingRate || 0) +
    Number(data?.finishing?.pressingRate || 0) +
    Number(data?.finishing?.qcCheckingRate || 0);

  const cmtDisplayTotal =
    Number(data?.labor?.cuttingCostPerPc || 0) +
    Number(data?.labor?.stitchingCostPerPc || 0) +
    finishingWithoutWash +
    Number(data?.labor?.packingCostPerPc || 0);

  const summaryComponentRows = [
    ['Cutting, Stitching, Finishing & Packing (CMT)', cmtDisplayTotal.toFixed(2)],
    ['Commercial, Freight, Testing & Inspection', Number(results.commercialTotal || 0).toFixed(2)],
  ];

  if (isInternal) {
    if (Number(results.overheadAmt) > 0) {
      summaryComponentRows.push([
        `Factory Overhead (${data?.margins?.overheadPct || 0}%)`,
        Number(results.overheadAmt).toFixed(2),
      ]);
    }
    if (Number(results.exportTotal) !== 0) {
      summaryComponentRows.push(['Export Costs & Duty Adjustments', Number(results.exportTotal).toFixed(2)]);
    }
    if (Number(results.bufferAmt) > 0) {
      summaryComponentRows.push([
        `Currency Buffer (${results.currencyBufferPct || 0}%)`,
        Number(results.bufferAmt).toFixed(2),
      ]);
    }
    if (Number(results.reworkAmt) > 0) {
      summaryComponentRows.push([
        `Rework Allowance (${results.reworkAllowancePct || 0}%)`,
        Number(results.reworkAmt).toFixed(2),
      ]);
    }
    if (Number(results.sampleCostPc) > 0) {
      summaryComponentRows.push(['Amortised Sample Cost / pc', Number(results.sampleCostPc).toFixed(2)]);
    }
  } else {
    // Buyer-facing view folds overhead & service margin cleanly into Commercial & Production Service
    const buyerServiceMargin =
      Number(results.overheadAmt || 0) +
      Number(results.bufferAmt || 0) +
      Number(results.reworkAmt || 0) +
      Number(results.sampleCostPc || 0) +
      Number(results.exportTotal || 0) +
      Number(results.profitAmt || 0);
    if (buyerServiceMargin > 0.005) {
      summaryComponentRows.push(['Factory Overhead, Compliance & Export Service', buyerServiceMargin.toFixed(2)]);
    }
  }

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY || tablesStartY) + 5,
    head: [['MANUFACTURING, COMMERCIAL & EXPORT SUMMARY', `AMOUNT (${currency})`]],
    body: summaryComponentRows.map(([label, amt]) =>
      showINR ? [label, amt, (Number(amt) * exchangeRate).toFixed(2)] : [label, amt]
    ),
    ...(showINR
      ? { head: [['MANUFACTURING, COMMERCIAL & EXPORT SUMMARY', `AMOUNT (${currency})`, 'AMOUNT (INR)']] }
      : {}),
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2.2, textColor: [30, 41, 59] },
    headStyles: { fillColor: [26, 60, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: showINR ? 122 : 146 },
      1: { halign: 'right' },
      2: { halign: 'right' },
    },
  });

  // 6. Final FOB Quotation Summary Box
  const finalFob = Number(results.fobPrice || 0);
  const orderQty = Number(data?.styleInfo?.orderQty || 0);
  const totalOrderValue = finalFob * orderQty;

  const finalRows = [];
  if (isInternal) {
    finalRows.push([
      { content: 'NET COST (before profit)', styles: { fontStyle: 'bold' } },
      { content: `${currencySymbol}${Number(results.totalCostExProfit || 0).toFixed(2)}`, styles: { fontStyle: 'bold' } },
    ]);
    finalRows.push([
      `TARGET PROFIT (${data?.margins?.targetProfitPct || 0}%)`,
      `${currencySymbol}${Number(results.profitAmt || 0).toFixed(2)}`,
    ]);
  }

  finalRows.push([
    {
      content: `FINAL ${data?.styleInfo?.orderType || 'FOB'} PRICE / PIECE`,
      styles: { fontStyle: 'bold', fillColor: [26, 60, 92], textColor: [255, 255, 255], fontSize: 9 },
    },
    {
      content: `${currencySymbol}${finalFob.toFixed(2)}`,
      styles: { fontStyle: 'bold', fillColor: [26, 60, 92], textColor: [255, 255, 255], fontSize: 9 },
    },
  ]);

  finalRows.push([
    {
      content: `TOTAL ORDER VALUE (${orderQty.toLocaleString()} pcs)`,
      styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [26, 60, 92] },
    },
    {
      content: `${currencySymbol}${totalOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [232, 98, 42] },
    },
  ]);

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY || tablesStartY) + 6,
    body: finalRows,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 132 },
      1: { halign: 'right', cellWidth: 50 },
    },
  });

  // 7. Terms & Sign-Off Block
  let footerBlockY = (doc.lastAutoTable?.finalY || 220) + 10;
  if (footerBlockY > 250) {
    doc.addPage();
    footerBlockY = 20;
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 60, 92);
  doc.text('COMMERCIAL TERMS & APPROVAL', 14, footerBlockY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 90, 105);
  doc.text(`Quotation Validity: 30 Days from ${todayFormatted}`, 14, footerBlockY + 5);
  doc.text(`Incoterm: ${data?.styleInfo?.orderType || 'FOB'}${data?.styleInfo?.portOfLoading ? ` — ${data.styleInfo.portOfLoading}` : ''}`, 14, footerBlockY + 9.5);
  if (preparedBy) {
    doc.text(`Prepared By: ${preparedBy}`, 14, footerBlockY + 14);
  }

  doc.setDrawColor(200, 206, 214);
  doc.line(120, footerBlockY + 14, 196, footerBlockY + 14);
  doc.setFontSize(7.5);
  doc.text('Buyer Confirmation & Authorized Signature', 158, footerBlockY + 18, { align: 'center' });

  // Page Numbers & Company Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(140, 148, 160);
    doc.text(
      `${companyName}${companyContact ? `  |  ${companyContact}` : ''}  |  Page ${i} of ${pageCount}`,
      105,
      289,
      { align: 'center' }
    );
  }

  const safeStyle = (data?.styleInfo?.styleName || data?.styleInfo?.styleNo || 'Order')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .slice(0, 40);
  const safeBuyer = (data?.styleInfo?.buyerName || 'Buyer').replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 25);
  const dateSlug = format(dateObj, 'yyyy-MM-dd');
  const fileName = isInternal
    ? `Internal_Costing_${safeStyle}_${dateSlug}.pdf`
    : `Costing_Quotation_${safeBuyer}_${safeStyle}_${dateSlug}.pdf`;

  doc.save(fileName);
  return fileName;
};
