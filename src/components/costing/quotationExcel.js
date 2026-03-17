import ExcelJS from 'exceljs';

export const generateQuotationExcel = async (data, results) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Cost Sheet');
  const historySheet = workbook.addWorksheet('Revision History');
  
  const date = new Date().toLocaleDateString();
  const currency = data.styleInfo.currency;
  const exchangeRate = data.styleInfo.exchangeRate || 1;
  const showINR = currency === 'INR' || (exchangeRate > 1 && currency === 'USD');
  const symbol = currency === 'INR' ? 'Rs.' : '$';

  // Set column widths
  worksheet.columns = [
    { width: 35 }, // A: Description
    { width: 12 }, // B: Cut Width
    { width: 12 }, // C: Consp
    { width: 12 }, // D: Price
    { width: 15 }, // E: Total (USD/Selected)
    { width: 15 }, // F: Total (INR)
  ];

  const navy = 'FF1A3C5C';
  const lightBlue = 'FFE8F0F7';
  const grey = 'FFF5F5F5';
  const white = 'FFFFFFFF';

  const thinBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  // 1. Header
  worksheet.mergeCells('A1:F1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'COST SHEET';
  titleCell.font = { size: 16, bold: true, color: { argb: navy } };
  titleCell.alignment = { horizontal: 'center' };

  worksheet.mergeCells('A2:F2');
  const companyCell = worksheet.getCell('A2');
  companyCell.value = data.styleInfo.companyName || 'JM Jain LLP';
  companyCell.alignment = { horizontal: 'center' };

  // Style Details
  const details = [
    ['Category :', data.styleInfo.category, 'Style :', data.styleInfo.styleName],
    ['Description :', data.styleInfo.description || '', 'Season :', data.styleInfo.season],
    ['Buyer :', data.styleInfo.buyerName || '', 'Date :', date],
    ['Fabric :', data.fabrics[0]?.description || '', 'Order Qty :', data.styleInfo.orderQty],
    ['Content :', data.fabrics[0]?.composition || '', 'GSM :', data.fabrics[0]?.gsm],
    ['Width :', data.fabrics[0]?.widthInches + '"', '', '']
  ];

  details.forEach((row, i) => {
    const r = worksheet.addRow(row);
    r.getCell(1).font = { bold: true };
    r.getCell(3).font = { bold: true };
  });

  worksheet.addRow([]); // Spacer

  // 2. Fabric Table
  const fabHeader = worksheet.addRow(['FABRIC DETAIL', 'CUT WIDTH', 'CONSP', 'PRICE', `TOTAL (${currency})`, 'TOTAL (INR)']);
  fabHeader.eachCell((cell, colNumber) => {
    if (!showINR && colNumber === 6) return;
    cell.font = { bold: true, color: { argb: white } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navy } };
    cell.border = thinBorder;
  });

  let currentRow = worksheet.lastRow.number + 1;
  data.fabrics.forEach((f, i) => {
    const cons = f.consumptionMode === 'manual' ? f.consumption : f.calculatedConsumption;
    const row = worksheet.addRow([
      `${f.name} ${f.description || ''}`,
      f.widthInches + '"',
      cons,
      f.price,
      { formula: `C${currentRow}*D${currentRow}` },
      { formula: `E${currentRow}*${exchangeRate}` }
    ]);
    row.eachCell(cell => { cell.border = thinBorder; });
    currentRow++;
  });

  // Blank row
  worksheet.addRow(['', '', '', '', '', '']).eachCell(cell => { cell.border = thinBorder; });
  currentRow++;

  const fabTotalRow = worksheet.addRow(['TOTAL FABRIC VALUE', '', '', '', { formula: `SUM(E${fabHeader.number + 1}:E${currentRow - 1})` }, { formula: `SUM(F${fabHeader.number + 1}:F${currentRow - 1})` }]);
  fabTotalRow.font = { bold: true };
  fabTotalRow.eachCell((cell, colNumber) => {
    if (!showINR && colNumber === 6) return;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: grey } };
    cell.border = thinBorder;
  });
  const fabTotalCellAddr = `E${fabTotalRow.number}`;

  worksheet.addRow([]); // Spacer

  // 3. Trims Table
  const trimHeader = worksheet.addRow(['TRIMS', '', 'CONSP', 'PRICE', `TOTAL (${currency})`, 'TOTAL (INR)']);
  trimHeader.eachCell((cell, colNumber) => {
    if (!showINR && colNumber === 6) return;
    cell.font = { bold: true, color: { argb: white } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navy } };
    cell.border = thinBorder;
  });
  worksheet.mergeCells(`A${trimHeader.number}:B${trimHeader.number}`);

  currentRow = worksheet.lastRow.number + 1;
  const trimStart = currentRow;

  data.trims.forEach(t => {
    const row = worksheet.addRow([t.name, '', t.qty, t.price, { formula: `C${currentRow}*D${currentRow}` }, { formula: `E${currentRow}*${exchangeRate}` }]);
    worksheet.mergeCells(`A${row.number}:B${row.number}`);
    row.eachCell(cell => { cell.border = thinBorder; });
    currentRow++;
  });

  // Embellishments
  data.embellishments.forEach(e => {
    const cost = e.type === 'Embroidery' ? e.stitchCount * e.ratePer1000 : e.ratePerPc;
    const row = worksheet.addRow([e.type, '', 1, cost, { formula: `C${currentRow}*D${currentRow}` }, { formula: `E${currentRow}*${exchangeRate}` }]);
    worksheet.mergeCells(`A${row.number}:B${row.number}`);
    row.eachCell(cell => { cell.border = thinBorder; });
    currentRow++;
  });

  // Washing
  if (data.finishing.washingRequired) {
    const row = worksheet.addRow(['Packing + Washing', '', 1, data.finishing.washingRate, { formula: `C${currentRow}*D${currentRow}` }, { formula: `E${currentRow}*${exchangeRate}` }]);
    worksheet.mergeCells(`A${row.number}:B${row.number}`);
    row.eachCell(cell => { cell.border = thinBorder; });
    currentRow++;
  }

  // Testing
  if (data.commercial.testingPerPc > 0) {
    const row = worksheet.addRow(['Testing (FPT/GPT)', '', 1, data.commercial.testingPerPc, { formula: `C${currentRow}*D${currentRow}` }, { formula: `E${currentRow}*${exchangeRate}` }]);
    worksheet.mergeCells(`A${row.number}:B${row.number}`);
    row.eachCell(cell => { cell.border = thinBorder; });
    currentRow++;
  }

  // Blank rows
  for (let i = 0; i < 2; i++) {
    worksheet.addRow(['', '', '', '', '', '']).eachCell(cell => { cell.border = thinBorder; });
    currentRow++;
  }

  const trimTotalRow = worksheet.addRow(['TOTAL', '', '', '', { formula: `SUM(E${trimStart}:E${currentRow - 1})` }, { formula: `SUM(F${trimStart}:F${currentRow - 1})` }]);
  trimTotalRow.font = { bold: true };
  trimTotalRow.eachCell((cell, colNumber) => {
    if (!showINR && colNumber === 6) return;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: grey } };
    cell.border = thinBorder;
  });
  const trimTotalCellAddr = `E${trimTotalRow.number}`;

  worksheet.addRow([]); // Spacer

  // 4. CMT & Summary
  const cmtValue = data.labor.cuttingCostPerPc + data.labor.stitchingCostPerPc + data.finishing.threadCuttingRate + data.finishing.pressingRate;
  const forwarding = data.commercial.freightPerPc + data.commercial.inspectionPerPc;

  const summaryStart = worksheet.lastRow.number + 1;
  
  const cmtRow = worksheet.addRow(['CMT (Cut, Stitch, Finish)', '', '', '', cmtValue]);
  worksheet.mergeCells(`A${cmtRow.number}:D${cmtRow.number}`);
  cmtRow.eachCell(cell => { cell.border = thinBorder; });

  const ohRow = worksheet.addRow([`FACTORY OVERHEAD (${data.margins.overheadPct}%)`, '', '', '', { formula: `(${fabTotalCellAddr}+${trimTotalCellAddr}+E${cmtRow.number})*${data.margins.overheadPct/100}` }]);
  worksheet.mergeCells(`A${ohRow.number}:D${ohRow.number}`);
  ohRow.eachCell(cell => { cell.border = thinBorder; });

  const fwdRow = worksheet.addRow(['FORWARDING / FREIGHT CHARGES', '', '', '', forwarding]);
  worksheet.mergeCells(`A${fwdRow.number}:D${fwdRow.number}`);
  fwdRow.eachCell(cell => { cell.border = thinBorder; });

  const total1Row = worksheet.addRow(['TOTAL', '', '', '', { formula: `E${cmtRow.number}+E${ohRow.number}+E${fwdRow.number}+${fabTotalCellAddr}+${trimTotalCellAddr}` }]);
  total1Row.font = { bold: true };
  worksheet.mergeCells(`A${total1Row.number}:D${total1Row.number}`);
  total1Row.eachCell(cell => { cell.border = thinBorder; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: grey } }; });

  const profitRow = worksheet.addRow([`PROFIT (${data.margins.targetProfitPct}%)`, '', '', '', { formula: `E${total1Row.number}*${data.margins.targetProfitPct/100}` }]);
  worksheet.mergeCells(`A${profitRow.number}:D${profitRow.number}`);
  profitRow.eachCell(cell => { cell.border = thinBorder; });

  const total2Row = worksheet.addRow(['TOTAL', '', '', '', { formula: `E${total1Row.number}+E${profitRow.number}` }]);
  total2Row.font = { bold: true };
  worksheet.mergeCells(`A${total2Row.number}:D${total2Row.number}`);
  total2Row.eachCell(cell => { cell.border = thinBorder; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: grey } }; });

  let lastTotalRow = total2Row;

  if (data.margins.gstApplicable) {
    const gstRow = worksheet.addRow([`GST (${data.margins.gstPct}%)`, '', '', '', { formula: `E${total2Row.number}*${data.margins.gstPct/100}` }]);
    worksheet.mergeCells(`A${gstRow.number}:D${gstRow.number}`);
    gstRow.eachCell(cell => { cell.border = thinBorder; });

    const total3Row = worksheet.addRow(['TOTAL COST', '', '', '', { formula: `E${total2Row.number}+E${gstRow.number}` }]);
    total3Row.font = { bold: true, color: { argb: white } };
    worksheet.mergeCells(`A${total3Row.number}:D${total3Row.number}`);
    total3Row.eachCell(cell => { cell.border = thinBorder; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navy } }; });
    lastTotalRow = total3Row;
  } else {
    total2Row.getCell(1).value = 'TOTAL COST';
    total2Row.getCell(1).font = { bold: true, color: { argb: white } };
    total2Row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: navy } }; });
  }

  worksheet.addRow([]);
  worksheet.addRow(['Target Price    : _________________']).font = { bold: true };
  worksheet.addRow(['Confirmed Price : _________________']).font = { bold: true };

  // Hide INR column if not needed
  if (!showINR) {
    worksheet.getColumn(6).hidden = true;
  }

  // Formatting
  worksheet.eachRow(row => {
    row.alignment = { vertical: 'middle' };
  });

  // Revision History Sheet
  historySheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Style Name', key: 'style', width: 25 },
    { header: 'FOB Price', key: 'price', width: 15 },
    { header: 'Notes', key: 'notes', width: 50 },
  ];
  historySheet.addRow([date, data.styleInfo.styleName, results.fobPrice, 'Initial Costing']);

  // Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `CostSheet_${data.styleInfo.styleName || 'Style'}_${date}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};
