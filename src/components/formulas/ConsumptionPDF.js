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
  bufferQty
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
  doc.setFontSize(14);
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text('GarmentCalc Industrial Modules', 14, 15);
  
  doc.setFontSize(16);
  doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.text('ADVANCED FABRIC CONSUMPTION SPEC SHEET', 105, 22, { align: 'center' });

  // Border accents
  doc.setDrawColor(26, 60, 92);
  doc.setLineWidth(0.8);
  doc.line(14, 25, 196, 25);
  
  doc.setDrawColor(232, 98, 42);
  doc.setLineWidth(0.4);
  doc.line(14, 26.2, 196, 26.2);

  // 2. Summary Details Block (2-column layout)
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  const startY = 33;
  const col1 = 14;
  const col2 = 50;
  const col3 = 110;
  const col4 = 150;

  // Row 1: Category & Order Volume
  doc.setFont('helvetica', 'bold');
  doc.text('Garment Style Group:', col1, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(currentG.main || '', col2, startY);

  doc.setFont('helvetica', 'bold');
  doc.text('Order Volume (Pcs):', col3, startY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${orderQty.toLocaleString()} units`, col4, startY);

  // Row 2: Sub-Category & Order Dozens
  doc.setFont('helvetica', 'bold');
  doc.text('Product Item Name:', col1, startY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(currentG.sub || '', col2, startY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Order Volume (Doz):', col3, startY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${orderDoz.toLocaleString()} Dozens`, col4, startY + 6);

  // Row 3: Fabrication Group & Base Cons Summary
  doc.setFont('helvetica', 'bold');
  doc.text('Fabrication Type:', col1, startY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(isKnit ? 'Knit (Poundage basis)' : 'Woven (Yardage basis)', col2, startY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Unit Consumption:', col3, startY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
  doc.text(`${calculatedResult.toFixed(4)} ${currentG.unit}`, col4, startY + 12);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

  // Row 4: Base Quantity & With 5% Wastage Allowed
  doc.setFont('helvetica', 'bold');
  doc.text('Total Fabric Base:', col1, startY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${totalForOrder.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${isKnit ? 'KG' : 'Yards'}`, col2, startY + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Fabric with +5% Buffer:', col3, startY + 18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${bufferQty.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${isKnit ? 'KG' : 'Yards'}`, col4, startY + 18);
  doc.setFont('helvetica', 'normal');

  // Row 5: Price Inputs & Audit Date
  doc.setFont('helvetica', 'bold');
  doc.text('Est. Cost Calculations:', col1, startY + 24);
  doc.setFont('helvetica', 'normal');
  let costStr = 'Not Provided';
  if (priceInr) {
    costStr = `₹${costInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })} INR`;
  }
  if (priceUsd) {
    costStr += costStr === 'Not Provided' ? `$${costUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD` : ` / $${costUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })} USD`;
  }
  doc.text(costStr, col2, startY + 24);

  doc.setFont('helvetica', 'bold');
  doc.text('Doc Audited Timestamp:', col3, startY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(dateStr, col4, startY + 24);

  // Decorative Box around Overview Info
  doc.setDrawColor(220, 225, 230);
  doc.setLineWidth(0.25);
  doc.rect(10, startY - 5, 190, 36);

  // 3. Size-Wise Ratio Allocation Table (Aesthetic design)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text('SIZE-WISE GRADING AND FABRIC ALLOCATION', 14, startY + 39);

  const sizeHeaders = [['SIZE SPEC', 'RATIO WEIGHT', 'ALLOCATED PIECES', `ALLOCATED CONSUMPTION (${isKnit ? 'KG' : 'Yds'})`]];
  const sizeRows = sizeBreakdown.map(s => [
    s.size,
    s.ratio,
    `${s.pcs.toLocaleString()} pcs`,
    `${s.tot.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${isKnit ? 'kg' : 'yds'}`
  ]);

  autoTable(doc, {
    startY: startY + 41,
    head: sizeHeaders,
    body: sizeRows,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
    headStyles: { fillColor: navyColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'right' }
    }
  });

  // 4. Equation info
  let currentY = doc.lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('SPECIFICATION ALGORITHM FORMULA:', 14, currentY);
  
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  
  // Wrap text nicely
  const formulaSplit = doc.splitTextToSize(currentG.formula || '', 180);
  doc.text(formulaSplit, 14, currentY + 5);
  
  currentY = currentY + 7 + (formulaSplit.length * 3);

  // 5. Tech Specification Spreadsheet
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
  doc.text('CAD SYSTEM PHYSICAL SPEC SHEET AND AUDIT VARIABLES', 14, currentY);

  const specHeaders = [['VARIABLE ID', 'TECHNICAL DESCRIPTION', 'SPEC VALUE', 'UNIT TYPE']];
  
  const formattedSpecs = [];
  currentG.meas.forEach(v => {
    formattedSpecs.push([v.id, v.label + ' (Physical Dimension)', fieldVals[v.id] !== undefined ? fieldVals[v.id] : v.def, 'CM']);
  });
  currentG.allow.forEach(v => {
    formattedSpecs.push([v.id, v.label + ' (Allowance/Ease)', fieldVals[v.id] !== undefined ? fieldVals[v.id] : v.def, 'CM']);
  });
  currentG.fabric.forEach(v => {
    const u = v.id === 'WA' ? '%' : v.id === 'FabWidth' ? 'Inches' : 'g/m²';
    formattedSpecs.push([v.id, v.label + ' (Fabric Parameter)', fieldVals[v.id] !== undefined ? fieldVals[v.id] : v.def, u]);
  });

  autoTable(doc, {
    startY: currentY + 2,
    head: specHeaders,
    body: formattedSpecs,
    theme: 'striped',
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    headStyles: { fillColor: orangeColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'center', cellWidth: 28 },
      1: { halign: 'left' },
      2: { halign: 'right', fontStyle: 'bold', cellWidth: 32 },
      3: { halign: 'center', cellWidth: 24 }
    }
  });

  // Footer / Disclaimer
  const endY = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(grayTextColor[0], grayTextColor[1], grayTextColor[2]);
  
  const disclaimerText = [
    'GarmentCalc Pro Commercial Workspace. This report is generated programmatically from standardized physical body envelope curves, CAD seam parameters, and bulk laying layouts.',
    'Actual production consumption may vary slightly under nested marker layout efficiency setups and real fabric stretch tolerances. Signature below authorizes fabric procurement.'
  ];
  doc.text(disclaimerText, 14, endY);

  // Signature Block
  const sigY = endY + 20;
  if (sigY < 280) { // Keep on same page if it fits
    doc.line(14, sigY, 70, sigY);
    doc.text('Prepared By / Merchandiser', 14, sigY + 4);

    doc.line(140, sigY, 196, sigY);
    doc.text('Procurement Manager Approval', 140, sigY + 4);
  }

  // Save/Download PDF
  const filename = `Fab_Cons_${(currentG.sub || 'Product').replace(/[\s&/]+/g, '_')}_SpecSheet.pdf`;
  doc.save(filename);
};
