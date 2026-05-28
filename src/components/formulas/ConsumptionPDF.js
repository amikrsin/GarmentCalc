import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateConsumptionPDF = ({
  currentG,
  calculatedResult,
  fieldVals,
  orderQty,
  orderDoz,
  priceInr,
  priceUsd,
  costInr,
  costUsd,
  sizeBreakdown,
  isKnit,
  totalForOrder,
  bufferQty,
  
  // Custom Metadata
  styleName,
  poNumber,
  buyerName,
  season,
  merchandiserName,
  
  // Custom Variables
  shrinkageL,
  shrinkageW,
  markerEfficiency,
  wastageRate,
  baseCadResult,
  
  // Lining Settings
  includeLining,
  liningFabricDesc,
  liningScalePct,
  liningConsumption,
  liningTotalForOrder,
  liningTotalWithBuffer
}) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const dateObj = new Date();
  const dateStr = format(dateObj, 'dd MMM yyyy HH:mm');

  // Colors
  const navyColor = [26, 60, 92]; // #1A3C5C
  const orangeColor = [232, 98, 42]; // #E8622A
  const grayTextColor = [100, 116, 139]; // #64748B
  const darkTextColor = [15, 23, 42]; // #0F172A

  // 1. Header Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text('GARMENTCALC ADVANCED CAD SYSTEMS', 14, 14);
  
  doc.setFontSize(8);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  doc.text('Industrial Apparel Manufacturing and Materials Procurement Spec Sheet', 14, 18);

  // Border accents
  doc.setDrawColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.setLineWidth(0.8);
  doc.line(14, 21, 196, 21);
  
  doc.setDrawColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.setLineWidth(0.4);
  doc.line(14, 22.2, 196, 22.2);

  // 2. MAIN PO / PURCHASE METADATA BLOCK
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  
  const blockY = 27;
  doc.setFillColor(248, 250, 252); // Soft gray background for the header metadata
  doc.rect(14, blockY, 182, 32, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.rect(14, blockY, 182, 32, 'D');

  const c1 = 18;
  const c2 = 50;
  const c3 = 110;
  const c4 = 145;

  doc.setFont('helvetica', 'bold');
  doc.text('Style / Pattern No:', c1, blockY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(styleName || 'N/A', c2, blockY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Buyer Name:', c3, blockY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(buyerName || 'N/A', c4, blockY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('PO Number:', c1, blockY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(poNumber || 'N/A', c2, blockY + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('Target Season:', c3, blockY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(season || 'N/A', c4, blockY + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('Garment Archetype:', c1, blockY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(`${currentG.main} - ${currentG.sub}`, c2, blockY + 20);

  doc.setFont('helvetica', 'bold');
  doc.text('Assigned Merchandiser:', c3, blockY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(merchandiserName || 'N/A', c4, blockY + 20);

  doc.setFont('helvetica', 'bold');
  doc.text('Fabrication Type:', c1, blockY + 27);
  doc.setFont('helvetica', 'normal');
  doc.text(isKnit ? 'Knit fabric (Poundage basis)' : 'Woven cloth (Yardage basis)', c2, blockY + 27);

  doc.setFont('helvetica', 'bold');
  doc.text('Report Printed Date:', c3, blockY + 27);
  doc.setFont('helvetica', 'normal');
  doc.text(dateStr, c4, blockY + 27);

  // 3. TARGET MATERIAL PROCUREMENT REQUIREMENTS (Main Big KPI section)
  const kpiY = 64;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text('SHELL FABRIC PROCUREMENT SUMMARY', 14, kpiY);

  const summaryHeaders = [['PARAMETER', 'VALUE / OUTPUT', 'SYSTEM METRIC DESCRIPTION']];
  const summaryRows = [
    [
      'Order Volume', 
      `${orderQty.toLocaleString()} units (${orderDoz.toLocaleString()} Doz)`, 
      'Grand total bulk garment count requested for sewing line.'
    ],
    [
      `Design CAD Net Consumption`, 
      `${baseCadResult.toFixed(4)} ${currentG.unit === 'KG/Dozen' ? 'KG/Doz' : 'Yds/Pc'}`, 
      'Aesthetic pattern surface area based purely on spec grading.'
    ],
    [
      `Industrial Target Cons`, 
      `${calculatedResult.toFixed(4)} ${currentG.unit === 'KG/Dozen' ? 'KG/Doz' : 'Yds/Pc'}`, 
      'Compounded target accounting for Shrinkage, Nesting (Marker), and Floor wastage.'
    ],
    [
      'Total Shell Fabric Needed', 
      `${totalForOrder.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${isKnit ? 'KG' : 'Yards'}`, 
      `Industrial baseline order volume for shell materials.`
    ],
    [
      'Procurement Order (+5% Buffer)', 
      `${bufferQty.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${isKnit ? 'KG' : 'Yards'}`, 
      `Safety margin fabric purchase order value including cutting floor allowance.`
    ]
  ];

  if (priceInr || priceUsd) {
    let priceStr = '';
    if (priceInr) priceStr += `₹${costInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })} INR`;
    if (priceUsd) priceStr += (priceStr ? ' / ' : '') + `$${costUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD`;
    summaryRows.push(['Estimated Materials Invoice', priceStr, 'Total calculated bulk raw materials cost.']);
  }

  autoTable(doc, {
    startY: kpiY + 2,
    head: summaryHeaders,
    body: summaryRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: navyColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { fontStyle: 'bold', textColor: [232, 98, 42], cellWidth: 50 },
      2: { textColor: grayTextColor }
    }
  });

  let currentY = doc.lastAutoTable.finalY + 8;

  // 4. LINING FABRIC PANEL (IF SELECTED)
  if (includeLining) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
    doc.text('LINING / INNER LINER PROCUREMENT SPECIFICATION', 14, currentY);

    const liningHeaders = [['PARAMETER', 'VALUE / OUTPUT', 'TECHNICAL SPECIFICATION DETAILS']];
    const liningRows = [
      ['Lining Fabric Archetype', liningFabricDesc || 'Polyester Lining', 'Approved lining fabric composition description.'],
      ['Lining Scale Ratio', `${liningScalePct}% of Self Pattern`, 'Sizing scaling factor applied relative to the outer shell curves.'],
      [`Lining Unit Consumption`, `${liningConsumption.toFixed(4)} ${isKnit ? 'KG/Doz' : 'Yds/Pc'}`, 'Lining consumption per core unit.'],
      [`Total Lining Base Order`, `${liningTotalForOrder.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${isKnit ? 'KG' : 'Yards'}`, 'Net bulk lining requirement based on size ratios.'],
      [`Lining Purchase Qty (+Buffer)`, `${liningTotalWithBuffer.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${isKnit ? 'KG' : 'Yards'}`, 'Procurement fabric quantity containing wastage allowance.']
    ];

    autoTable(doc, {
      startY: currentY + 2,
      head: liningHeaders,
      body: liningRows,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold' }, // Dark slate blue
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { fontStyle: 'bold', textColor: [26, 60, 92], cellWidth: 50 },
        2: { textColor: grayTextColor }
      }
    });
    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 5. INDUSTRIAL NESTING & ALIGNMENT PARAMETERS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text('NESTING, IN-GRAIN SHRINKAGE & MARKER UTILIZATION', 14, currentY);

  const shrinkHeaders = [['MARKER UTILITY PARAMETER', 'SEWROOM DEF', 'AFFECT ON COMMERCIAL CODES']];
  const shrinkRows = [
    ['Lengthwise Fabric Shrinkage', `${shrinkageL}%`, `Directly increases body vertical lengths before CAD marker compilation.`],
    ['Widthwise Fabric Shrinkage', `${shrinkageW}%`, `Directly expands horizontal body envelopes (chest/waist seam lines).`],
    ['Compounded Shrinkage Offset', `+${(((1 + shrinkageL/100) * (1 + shrinkageW/100) - 1) * 100).toFixed(2)}%`, `Cumulative material scaling buffer applied to baseline specifications.`],
    ['CAD Marker Nesting Efficiency', `${markerEfficiency}%`, `Represents fabric roll surface usage. Lower efficiency yields extra consumption.`],
    ['Cutting Floor Wastage (WA%)', `${wastageRate}%`, `End bits, fabric faults, and sewing allowance remnants.`]
  ];

  autoTable(doc, {
    startY: currentY + 2,
    head: shrinkHeaders,
    body: shrinkRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: orangeColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { fontStyle: 'bold', halign: 'center', cellWidth: 35 },
      2: { textColor: grayTextColor }
    }
  });
  
  // Page Break if needed before Size Wise breakdown
  currentY = doc.lastAutoTable.finalY + 8;
  if (currentY > 210) {
    doc.addPage();
    currentY = 15;
  }

  // 6. SIZE-WISE ALLOCATION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text('GRADING SIZE-WISE MATRICES ALLOCATION', 14, currentY);

  const sizeHeaders = [['SIZE SPEC', 'RATIO WEIGHT', 'ALLOCATED UNITS', 'SHELL ALLOCATION', includeLining ? 'LINING ALLOCATION' : null].filter(Boolean)];
  
  const sizeRows = sizeBreakdown.map(s => {
    const row = [
      s.size,
      s.ratio,
      `${s.pcs.toLocaleString()} pcs`,
      `${s.tot.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${isKnit ? 'KG' : 'Yds'}`
    ];
    if (includeLining) {
      const liningSz = isKnit ? liningConsumption * (s.pcs / 12) : liningConsumption * s.pcs;
      row.push(`${liningSz.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${isKnit ? 'KG' : 'Yds'}`);
    }
    return row;
  });

  autoTable(doc, {
    startY: currentY + 2,
    head: sizeHeaders,
    body: sizeRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: navyColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    }
  });

  currentY = doc.lastAutoTable.finalY + 8;
  if (currentY > 230) {
    doc.addPage();
    currentY = 15;
  }

  // 7. SPECIFICATION ALGORITHM FORMULA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('CAD SPECIFICATION BLUEPRINT ALGORITHM:', 14, currentY);
  
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  
  const formulaSplit = doc.splitTextToSize(currentG.formula || '', 180);
  doc.text(formulaSplit, 14, currentY + 4);
  
  currentY = currentY + 6 + (formulaSplit.length * 3);

  // Footer / Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  
  const disclaimerText = [
    'GarmentCalc Pro Commercial Workspace. Generated programmatically from standardized physical body envelope curves, CAD seam parameters, and bulk laying layouts.',
    'Actual production consumption may vary slightly under nested marker layout efficiency setups and real fabric stretch tolerances. Signature below authorizes fabric procurement.'
  ];
  doc.text(disclaimerText, 14, currentY + 4);

  // Signature Block
  const sigY = currentY + 22;
  doc.setDrawColor(200, 205, 210);
  doc.setLineWidth(0.4);
  doc.line(14, sigY, 70, sigY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Prepared By: ${merchandiserName || 'Merchandiser'}`, 14, sigY + 4);

  doc.line(140, sigY, 196, sigY);
  doc.text('Authorized Commercial Director', 140, sigY + 4);

  // Save/Download PDF
  const safeStyleName = (styleName || 'Product').replace(/[\s&/]+/g, '_');
  const filename = `FabCons_Sheet_${safeStyleName}_PO_${poNumber || '00'}_Report.pdf`;
  doc.save(filename);
};
