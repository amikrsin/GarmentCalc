/**
 * Professional Garment Costing Calculations v2.0
 */

export const calculateFabricRowCost = (row) => {
  const consumption = row.consumptionMode === 'auto' ? row.calculatedConsumption : row.consumption;
  if (!consumption || !row.price) return 0;
  return consumption * row.price * (1 + (row.wastage || 0) / 100) * (1 + (row.shrinkage || 0) / 100);
};

export const sumObjectValues = (obj) => {
  return Object.values(obj).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
};

export const calculateEmbellishmentCost = (emb) => {
  if (emb.type === 'Embroidery') {
    return (emb.qty / 1000) * emb.rate;
  }
  if (emb.type === 'Screen Print') {
    return emb.qty * emb.rate;
  }
  return emb.rate; // Direct entry
};

export const getDetailedBreakdown = (results) => {
  const { 
    fabricTotal, 
    trimsTotal, 
    embellishmentTotal, 
    manufacturingTotal, 
    commercialTotal, 
    exportTotal,
    overheadAmt,
    bufferAmt,
    reworkAmt,
    sampleCostPc,
    profitAmt
  } = results;

  const total = fabricTotal + trimsTotal + embellishmentTotal + manufacturingTotal + commercialTotal + exportTotal + overheadAmt + bufferAmt + reworkAmt + sampleCostPc + profitAmt;
  if (total === 0) return [];

  return [
    { name: 'Fabric', value: fabricTotal, color: '#1A3C5C' },
    { name: 'Trims', value: trimsTotal, color: '#E8622A' },
    { name: 'Embellishments', value: embellishmentTotal, color: '#4A90E2' },
    { name: 'Manufacturing', value: manufacturingTotal, color: '#F5A623' },
    { name: 'Commercial', value: commercialTotal, color: '#7ED321' },
    { name: 'Export Adjust.', value: exportTotal, color: '#9013FE' },
    { name: 'Overhead & Adj.', value: overheadAmt + bufferAmt + reworkAmt + sampleCostPc, color: '#BD10E0' },
    { name: 'Profit', value: profitAmt, color: '#50E3C2' },
  ].map(item => ({
    ...item,
    percentage: (item.value / total) * 100
  }));
};

export const mapToQuotation = (results) => {
  return [
    { name: 'Fabric & Raw Material', value: results.fabricTotal, color: '#1A3C5C' },
    { name: 'Trims, CM & Finishing', value: results.trimsTotal + results.manufacturingTotal + results.embellishmentTotal, color: '#E8622A' },
    { name: 'Freight & Commercial', value: results.commercialTotal + results.exportTotal, color: '#7ED321' },
    { name: 'Service & Margin', value: results.overheadAmt + results.bufferAmt + results.reworkAmt + results.sampleCostPc + results.profitAmt, color: '#50E3C2' }
  ].map(item => ({
    ...item,
    percentage: (item.value / results.fobPrice) * 100
  }));
};
