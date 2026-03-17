import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { calculateFabricRowCost, calculateEmbellishmentCost } from '../../utils/costingCalculations';

export const generateCostingPDF = (data, results, breakdown) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const dateObj = new Date();
  const date = format(dateObj, 'dd MMM yyyy');
  const isInternal = data.styleInfo.costingType === 'internal';
  const currency = data.styleInfo.currency;
  const exchangeRate = data.styleInfo.exchangeRate || 1;
  const showINR = currency === 'INR' || (exchangeRate > 1 && currency === 'USD');

  const symbol = currency === 'INR' ? 'Rs.' : '$';
  const inrSymbol = 'Rs.';

  // Helper to format currency
  const f = (val) => val.toFixed(2);
  const fINR = (val) => (val * exchangeRate).toFixed(2);

  // 1. Header Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(data.styleInfo.companyName || 'JM Jain LLP', 14, 15);
  
  doc.setFontSize(16);
  doc.setTextColor(26, 60, 92); // Navy
  doc.text('COST SHEET', 105, 15, { align: 'center' });
  
  if (isInternal) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('INTERNAL - CONFIDENTIAL', 105, 20, { align: 'center' });
    
    // Watermark
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.setFontSize(60);
    doc.setTextColor(200, 200, 200);
    doc.text('INTERNAL', 105, 150, { align: 'center', angle: 45 });
    doc.restoreGraphicsState();
  }

  // Style Image
  if (data.styleInfo.garmentImage) {
    try {
      doc.addImage(data.styleInfo.garmentImage, 'JPEG', 160, 10, 35, 45);
      doc.setDrawColor(204, 204, 204);
      doc.rect(160, 10, 35, 45);
    } catch (e) {
      console.error('Error adding image:', e);
    }
  }

  // Style Details Block (2-column layout)
  doc.setFontSize(9);
  doc.setTextColor(0);
  const startY = 30;
  const col1 = 14;
  const col2 = 40;
  const col3 = 90;
  const col4 = 115;

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Style:', col1, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.styleInfo.styleName || data.styleInfo.styleNo || '', col2, startY);

  doc.setFont('helvetica', 'bold');
  doc.text('Buyer:', col3, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.styleInfo.buyerName || '', col4, startY);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text('Description:', col1, startY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(data.styleInfo.description || data.styleInfo.styleNo || '', col2, startY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Season:', col3, startY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(data.styleInfo.season || '', col4, startY + 6);

  // Row 3
  const mainFabric = data.fabrics[0] || {};
  doc.setFont('helvetica', 'bold');
  doc.text('Fabric:', col1, startY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(mainFabric.description || '', col2, startY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Order Qty:', col3, startY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.styleInfo.orderQty?.toLocaleString() || 0} pcs`, col4, startY + 12);

  // Row 4
  doc.setFont('helvetica', 'bold');
  doc.text('Content:', col1, startY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(mainFabric.composition || '', col2, startY + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Date:', col3, startY + 18);
  doc.setFont('helvetica', 'normal');
  const displayDate = data.styleInfo.costingDate 
    ? format(new Date(data.styleInfo.costingDate), 'dd MMM yyyy') 
    : date;
  doc.text(displayDate, col4, startY + 18);

  // Row 5
  const costingRefDate = data.styleInfo.costingDate || new Date().toISOString().split('T')[0];
  const costingRef = `COST-${costingRefDate.replace(/-/g, '')}-001`;
  doc.setFont('helvetica', 'bold');
  doc.text('Costing Ref:', col3, startY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(costingRef, col4, startY + 24);

  // 2. Fabric Table
  const fabricHeaders = [['FABRIC DETAIL', 'WIDTH', 'CONSP', 'PRICE', `TOTAL (${currency})`]];
  if (showINR) fabricHeaders[0].push('TOTAL (INR)');

  const fabricRows = data.fabrics.map(f => {
    const fabricCost = calculateFabricRowCost(f);
    const row = [
      `${f.name} ${f.description || ''}`,
      f.widthInches + '"',
      f.consumptionMode === 'manual' ? f.consumption : f.calculatedConsumption,
      f.price,
      fabricCost.toFixed(2)
    ];
    if (showINR) row.push((fabricCost * exchangeRate).toFixed(2));
    return row;
  });

  autoTable(doc, {
    startY: startY + 32,
    head: fabricHeaders,
    body: fabricRows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [26, 60, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' }
    },
    foot: [[
      'TOTAL FABRIC', 
      '', '', '', 
      results.fabricTotal.toFixed(2),
      showINR ? (results.fabricTotal * exchangeRate).toFixed(2) : ''
    ]],
    footStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'right' }
  });

  // 3. Trims Table
  const trimsHeaders = [['TRIMS', 'CONSP', 'PRICE', `TOTAL (${currency})`]];
  if (showINR) trimsHeaders[0].push('TOTAL (INR)');

  // Filter out testing from trimsRows as it moves to Commercial
  const trimsRows = data.trims.map(t => {
    const row = [t.name, t.qty, t.price, (t.qty * t.price).toFixed(2)];
    if (showINR) row.push((t.qty * t.price * exchangeRate).toFixed(2));
    return row;
  });

  // Embellishments
  data.embellishments.forEach(e => {
    const cost = calculateEmbellishmentCost(e);
    const row = [e.type, '1.00', cost, cost.toFixed(2)];
    if (showINR) row.push((cost * exchangeRate).toFixed(2));
    trimsRows.push(row);
  });

  // Washing
  if (data.finishing.washingRequired) {
    const row = ['Washing Charges', '1.00', data.finishing.washingRate, data.finishing.washingRate.toFixed(2)];
    if (showINR) row.push((data.finishing.washingRate * exchangeRate).toFixed(2));
    trimsRows.push(row);
  }

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 5,
    head: trimsHeaders,
    body: trimsRows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [26, 60, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    foot: [[
      'TOTAL TRIMS', 
      '', '', 
      (results.trimsTotal + results.embellishmentTotal + (data.finishing.washingRequired ? data.finishing.washingRate : 0)).toFixed(2),
      showINR ? ((results.trimsTotal + results.embellishmentTotal + (data.finishing.washingRequired ? data.finishing.washingRate : 0)) * exchangeRate).toFixed(2) : ''
    ]],
    footStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'right' }
  });

  // 4. CMT Breakdown
  const cmtTotal = results.manufacturingTotal;
  const cmtRows = [
    ['Cutting Cost', '', data.labor.cuttingCostPerPc.toFixed(2)],
    ['Stitching Cost', '', data.labor.stitchingCostPerPc.toFixed(2)],
    ['Finishing Cost (Inc. QC)', '', (data.finishing.threadCuttingRate + data.finishing.pressingRate + (data.finishing.qcCheckingRate || 0)).toFixed(2)],
    ['Packing Cost', '', data.labor.packingCostPerPc.toFixed(2)],
    [{ content: 'CMT TOTAL', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }, '', { content: cmtTotal.toFixed(2), styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }]
  ];

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 5,
    head: [['CMT BREAKDOWN', '', `TOTAL (${currency})`]],
    body: cmtRows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [26, 60, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 30 },
      2: { halign: 'right', cellWidth: 30 }
    }
  });

  // 5. Factory Overhead
  if (isInternal) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 2,
      body: [[`Factory Overhead (${data.margins.overheadPct}%)`, '', results.overheadAmt.toFixed(2)]],
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 30 },
        2: { halign: 'right', cellWidth: 30 }
      }
    });
  }

  // 6. Commercial Costs
  const commercialRows = [
    ['Freight / Forwarding', '', data.commercial.freightPerPc.toFixed(2)],
    [`Buying Commission ${isInternal ? `(${data.commercial.buyingCommissionPct}%)` : ''}`, '', results.buyingCommissionAmt.toFixed(2)],
    [`Bank Charges ${isInternal ? `(${data.commercial.bankChargesPct}%)` : ''}`, '', results.bankChargesAmt.toFixed(2)],
    [`Insurance ${isInternal ? `(${data.commercial.insurancePct}%)` : ''}`, '', results.insuranceAmt.toFixed(2)],
    ['Inspection Charges', '', data.commercial.inspectionPerPc.toFixed(2)],
    ['Testing (FPT/GPT)', '', data.commercial.testingPerPc.toFixed(2)]
  ];

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 5,
    head: [['COMMERCIAL COSTS', '', `TOTAL (${currency})`]],
    body: commercialRows,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [26, 60, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 30 },
      2: { halign: 'right', cellWidth: 30 }
    }
  });

  // 7. Export Adjustments
  const exportRows = [];
  
  // Fixed Export Costs
  if (data.exportCosts.documentationPerPc > 0) {
    exportRows.push(['Documentation / Clearing', '', data.exportCosts.documentationPerPc.toFixed(2)]);
  }
  if (results.customsDutyAmt > 0) {
    exportRows.push(['Customs Duty', '', results.customsDutyAmt.toFixed(2)]);
  }
  if (results.agentCommissionAmt > 0) {
    exportRows.push(['Agent Commission', '', results.agentCommissionAmt.toFixed(2)]);
  }
  
  // Rebates / Drawbacks
  if (data.exportCosts.dutyDrawbackPct > 0) {
    exportRows.push([`Duty Drawback ${isInternal ? `(${data.exportCosts.dutyDrawbackPct}%)` : ''}`, '', `-${results.drawbackAmt.toFixed(2)}`]);
  }
  if (data.exportCosts.gstRefundPct > 0) {
    exportRows.push([`GST Refund ${isInternal ? `(${data.exportCosts.gstRefundPct}%)` : ''}`, '', `-${results.gstRefundAmt.toFixed(2)}`]);
  }

  if (exportRows.length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      head: [['EXPORT COSTS & ADJUSTMENTS', '', `TOTAL (${currency})`]],
      body: exportRows,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [26, 60, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 30 },
        2: { halign: 'right', cellWidth: 30 }
      }
    });
  }

  // 7.5 Adjustments & Overheads
  const adjRows = [];
  if (isInternal) {
    if (results.bufferAmt > 0) {
      adjRows.push([`Currency Risk Buffer (${results.currencyBufferPct}%)`, '', results.bufferAmt.toFixed(2)]);
    }
    if (results.reworkAmt > 0) {
      adjRows.push([`Rework Allowance (${results.reworkAllowancePct}%)`, '', results.reworkAmt.toFixed(2)]);
    }
    if (results.sampleCostPc > 0) {
      adjRows.push(['Sample Cost (amortised/pc)', '', results.sampleCostPc.toFixed(2)]);
    }
  }

  if (adjRows.length > 0) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 5,
      head: [['ADJUSTMENTS & OVERHEADS', '', `TOTAL (${currency})`]],
      body: adjRows,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [26, 60, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 30 },
        2: { halign: 'right', cellWidth: 30 }
      }
    });
  }

  // 8. Summary Block
  const summaryRows = [];
  
  if (isInternal) {
    summaryRows.push([{ content: 'NET COST (before profit)', styles: { fontStyle: 'bold' } }, '', { content: results.totalCostExProfit.toFixed(2), styles: { fontStyle: 'bold' } }]);
    summaryRows.push([`PROFIT (${data.margins.targetProfitPct}%)`, '', results.profitAmt.toFixed(2)]);
  }
  
  summaryRows.push([{ content: 'FINAL FOB PRICE / PC', styles: { fontStyle: 'bold', fillColor: [26, 60, 92], textColor: [255, 255, 255] } }, '', { content: results.fobPrice.toFixed(2), styles: { fontStyle: 'bold', fillColor: [26, 60, 92], textColor: [255, 255, 255] } }]);
  
  const totalOrderValue = results.fobPrice * data.styleInfo.orderQty;
  const formattedTotalValue = '$' + totalOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  summaryRows.push([{ content: `TOTAL ORDER VALUE (${data.styleInfo.orderQty?.toLocaleString()} pcs)`, styles: { fontStyle: 'bold' } }, '', { content: formattedTotalValue, styles: { fontStyle: 'bold' } }]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    body: summaryRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 30 },
      2: { halign: 'right', cellWidth: 30 }
    }
  });

  // 5. Footer Block
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Target Price    : _________________', 14, finalY);
  doc.text('Confirmed Price : _________________', 14, finalY + 7);

  if (!isInternal) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Validity: 30 days', 14, finalY + 15);
    doc.text('Incoterm: FOB', 14, finalY + 20);
  }

  // Footer page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`${data.styleInfo.companyName || 'JM Jain LLP'} - Costing Sheet - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
  }

  const fileName = isInternal ? `Internal_Costing_${data.styleInfo.styleName}_${date}` : `Quotation_${data.styleInfo.styleName}_${data.styleInfo.buyerName}_${date}`;
  
  // Verify FOB matches screen
  const screenFOB = parseFloat(data.finalFOB) || results.fobPrice;
  if (Math.abs(screenFOB - results.fobPrice) > 0.01) {
    console.warn('FOB MISMATCH:', screenFOB, 'vs', results.fobPrice);
  }

  doc.save(`${fileName.replace(/\s+/g, '_')}.pdf`);
};
