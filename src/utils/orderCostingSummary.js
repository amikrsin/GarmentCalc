import { calculateFabricRowCost, calculateEmbellishmentCost, getDetailedBreakdown, mapToQuotation } from './costingCalculations';
import { calculateAutoConsumption } from './consumptionFormula';

/**
 * Safely extracts trim unit cost whether stored as { qty, price } or demo format { rate }.
 */
export const getTrimLineCost = (trim) => {
  if (!trim) return 0;
  const qty = trim.qty !== undefined && trim.qty !== null ? Number(trim.qty) : 1;
  const price = trim.price !== undefined && trim.price !== null
    ? Number(trim.price)
    : Number(trim.rate) || 0;
  return (Number.isFinite(qty) ? qty : 1) * (Number.isFinite(price) ? price : 0);
};

/**
 * Safely computes embellishment row cost for both standard and demo formats.
 */
export const getSafeEmbellishmentCost = (emb) => {
  if (!emb) return 0;
  if (emb.calculatedCost !== undefined && emb.calculatedCost !== null && emb.qty === undefined) {
    return Number(emb.calculatedCost) || 0;
  }
  const computed = calculateEmbellishmentCost({
    ...emb,
    qty: Number(emb.qty ?? emb.unitsRequired ?? 1),
    rate: Number(emb.rate) || 0,
  });
  return Number.isFinite(computed) ? computed : Number(emb.rate) || 0;
};

/**
 * Builds normalized costing data + calculated results from any Order object,
 * even if the user hasn't opened the Costing tab yet.
 */
export const buildOrderCostingPayload = (order, preferences = {}) => {
  const companyName = preferences.companyName || order?.costingState?.styleInfo?.companyName || 'GarmentCalc Exports';

  if (order?.costingState) {
    const cs = order.costingState;
    const styleInfo = {
      companyName,
      styleName: cs.styleInfo?.styleName || order.styleName || '',
      styleNo: cs.styleInfo?.styleNo || order.poNumber || '',
      description: cs.styleInfo?.description || order.styleDescription || '',
      category: cs.styleInfo?.category || order.category || '',
      season: cs.styleInfo?.season || order.season || '',
      buyerName: cs.styleInfo?.buyerName || order.buyerName || '',
      orderQty: Number(cs.styleInfo?.orderQty ?? order.orderQty) || 1000,
      costingDate: cs.styleInfo?.costingDate || new Date().toISOString().split('T')[0],
      costingType: cs.styleInfo?.costingType || 'buyer',
      currency: cs.styleInfo?.currency || order.currency || preferences.defaultCurrency || 'USD',
      exchangeRate: Number(cs.styleInfo?.exchangeRate ?? order.exchangeRate ?? preferences.defaultExchangeRate) || 84.5,
      garmentImage: cs.styleInfo?.garmentImage || null,
      shipDate: order.shipDate || '',
      orderType: order.orderType || 'FOB',
      portOfLoading: order.portOfLoading || '',
      destinationCountry: order.destinationCountry || '',
    };

    const fabrics = (cs.fabrics || []).map((f) => {
      const calcCons =
        f.consumptionMode === 'auto'
          ? calculateAutoConsumption(
              f.garmentLengthCm || 72,
              f.garmentWidthCm || 54,
              f.panels || 2,
              f.widthInches || 58,
              f.wastage || 0,
              f.shrinkage || 0,
              f.gsm || 180
            )
          : f.calculatedConsumption || 0;
      return { ...f, calculatedConsumption: calcCons };
    });

    const trims = (cs.trims || []).map((t) => ({
      ...t,
      qty: t.qty !== undefined ? Number(t.qty) : 1,
      price: t.price !== undefined ? Number(t.price) : Number(t.rate) || 0,
    }));

    const embellishments = cs.embellishments || [];
    const labor = {
      cuttingCostPerPc: Number(cs.labor?.cuttingCostPerPc) || 0,
      stitchingCostPerPc: Number(cs.labor?.stitchingCostPerPc) || 0,
      packingCostPerPc: Number(cs.labor?.packingCostPerPc) || 0,
    };
    const finishing = {
      threadCuttingRate: Number(cs.finishing?.threadCuttingRate) || 0,
      qcCheckingRate: Number(cs.finishing?.qcCheckingRate) || 0,
      washingRequired: Boolean(cs.finishing?.washingRequired),
      washType: cs.finishing?.washType || '',
      washingRate: Number(cs.finishing?.washingRate) || 0,
      pressingRate: Number(cs.finishing?.pressingRate) || 0,
    };
    const commercial = {
      freightPerPc: Number(cs.commercial?.freightPerPc) || 0,
      insurancePct: Number(cs.commercial?.insurancePct) || 0,
      buyingCommissionPct: Number(cs.commercial?.buyingCommissionPct) || 0,
      bankChargesPct: Number(cs.commercial?.bankChargesPct) || 0,
      inspectionPerPc: Number(cs.commercial?.inspectionPerPc) || 0,
      testingPerPc: Number(cs.commercial?.testingPerPc) || 0,
    };
    const exportCosts = {
      customsDutyPct: Number(cs.exportCosts?.customsDutyPct) || 0,
      agentCommissionPct: Number(cs.exportCosts?.agentCommissionPct) || 0,
      documentationPerPc: Number(cs.exportCosts?.documentationPerPc) || 0,
      dutyDrawbackPct: Number(cs.exportCosts?.dutyDrawbackPct) || 0,
      gstRefundPct: Number(cs.exportCosts?.gstRefundPct) || 0,
    };
    const margins = {
      overheadPct: Number(cs.margins?.overheadPct) || 0,
      currencyBufferPct: Number(cs.margins?.currencyBufferPct) || 0,
      reworkAllowancePct: Number(cs.margins?.reworkAllowancePct) || 0,
      sampleCostTotal: Number(cs.margins?.sampleCostTotal) || 0,
      targetProfitPct: Number(cs.margins?.targetProfitPct) || 0,
      minAcceptableMarginPct: Number(cs.margins?.minAcceptableMarginPct) || 5,
      gstApplicable: Boolean(cs.margins?.gstApplicable),
      gstPct: Number(cs.margins?.gstPct) || 0,
    };

    const fabricTotal = fabrics.reduce((acc, f) => acc + calculateFabricRowCost(f), 0);
    const trimsTotal = trims.reduce((acc, t) => acc + getTrimLineCost(t), 0);
    const embellishmentTotal = embellishments.reduce((acc, e) => acc + getSafeEmbellishmentCost(e), 0);
    const finishingTotal =
      finishing.threadCuttingRate +
      finishing.qcCheckingRate +
      (finishing.washingRequired ? finishing.washingRate : 0) +
      finishing.pressingRate;
    const manufacturingTotal =
      labor.cuttingCostPerPc + labor.stitchingCostPerPc + finishingTotal + labor.packingCostPerPc;

    const subTotal1 = fabricTotal + trimsTotal + embellishmentTotal + manufacturingTotal;

    const insuranceAmt = subTotal1 * (commercial.insurancePct / 100);
    const bankChargesAmt = subTotal1 * (commercial.bankChargesPct / 100);
    const customsDutyAmt = subTotal1 * (exportCosts.customsDutyPct / 100);
    const agentCommissionAmt = subTotal1 * (exportCosts.agentCommissionPct / 100);
    const gstRefundAmt = subTotal1 * (exportCosts.gstRefundPct / 100);

    const fixedCommercial =
      commercial.freightPerPc + commercial.inspectionPerPc + commercial.testingPerPc + insuranceAmt + bankChargesAmt;
    const fixedExport = exportCosts.documentationPerPc + customsDutyAmt + agentCommissionAmt - gstRefundAmt;

    const overheadBase = fabricTotal + trimsTotal + manufacturingTotal;
    const overheadAmt = overheadBase * (margins.overheadPct / 100);

    const subTotalForAdj = subTotal1 + fixedCommercial + fixedExport;
    const bufferAmt = subTotalForAdj * (margins.currencyBufferPct / 100);
    const reworkAmt = subTotalForAdj * (margins.reworkAllowancePct / 100);
    const sampleCostPc = styleInfo.orderQty > 0 ? margins.sampleCostTotal / styleInfo.orderQty : 0;

    const subTotalForFOB = subTotalForAdj + overheadAmt + bufferAmt + reworkAmt + sampleCostPc;

    const commissionRate = commercial.buyingCommissionPct / 100;
    const drawbackRate = exportCosts.dutyDrawbackPct / 100;
    const profitRate = margins.targetProfitPct / 100;

    const denominator = 1 - commissionRate * (1 + profitRate) + drawbackRate * (1 + profitRate);
    const fobPriceNoGst = denominator !== 0 ? (subTotalForFOB * (1 + profitRate)) / denominator : subTotalForFOB;

    const buyingCommissionAmt = fobPriceNoGst * commissionRate;
    const drawbackAmt = fobPriceNoGst * drawbackRate;
    const profitAmt = fobPriceNoGst * profitRate;
    const totalCostExProfit = fobPriceNoGst - profitAmt;
    const gstAmt = margins.gstApplicable ? fobPriceNoGst * (margins.gstPct / 100) : 0;
    const fobPrice = fobPriceNoGst + gstAmt;
    const totalFobValue = fobPrice * styleInfo.orderQty;

    const commercialTotal = fixedCommercial + buyingCommissionAmt;
    const exportTotal = fixedExport - drawbackAmt;

    const results = {
      fabricTotal,
      trimsTotal,
      embellishmentTotal,
      manufacturingTotal,
      finishingTotal,
      commercialTotal,
      exportTotal,
      insuranceAmt,
      buyingCommissionAmt,
      bankChargesAmt,
      customsDutyAmt,
      agentCommissionAmt,
      drawbackAmt,
      gstRefundAmt,
      overheadAmt,
      bufferAmt,
      reworkAmt,
      sampleCostPc,
      profitAmt,
      gstAmt,
      fobPrice,
      totalFobValue,
      totalCostExProfit,
      overheadPct: margins.overheadPct,
      currencyBufferPct: margins.currencyBufferPct,
      reworkAllowancePct: margins.reworkAllowancePct,
      drawbackPct: exportCosts.dutyDrawbackPct,
      buyingCommissionPct: commercial.buyingCommissionPct,
      targetProfitPct: margins.targetProfitPct,
    };

    const normalizedData = {
      styleInfo,
      fabrics,
      trims,
      embellishments,
      labor,
      finishing,
      commercial,
      exportCosts,
      margins,
    };

    return {
      data: normalizedData,
      results,
      breakdown: getDetailedBreakdown(results),
      quotation: mapToQuotation(results),
      hasDetailedCosting: true,
    };
  }

  // Fallback for orders that do not yet have detailed costingState
  const fobPrice = Number(order?.fobPrice) || 0;
  const orderQty = Number(order?.orderQty) || 0;
  const totalFobValue = Number(order?.totalFOBValue) || fobPrice * orderQty;

  const data = {
    styleInfo: {
      companyName,
      styleName: order?.styleName || '',
      styleNo: order?.poNumber || '',
      description: order?.styleDescription || '',
      category: order?.category || '',
      season: order?.season || '',
      buyerName: order?.buyerName || '',
      orderQty,
      costingDate: new Date().toISOString().split('T')[0],
      costingType: 'buyer',
      currency: order?.currency || preferences.defaultCurrency || 'USD',
      exchangeRate: Number(order?.exchangeRate || preferences.defaultExchangeRate) || 84.5,
      garmentImage: null,
      shipDate: order?.shipDate || '',
      orderType: order?.orderType || 'FOB',
      portOfLoading: order?.portOfLoading || '',
      destinationCountry: order?.destinationCountry || '',
    },
    fabrics: [
      {
        id: 'summary-fab',
        name: order?.fabricDescription || 'Primary Body Fabric',
        description: '',
        composition: order?.fabricComposition || 'As per tech pack',
        widthInches: 58,
        consumptionMode: 'manual',
        consumption: 1,
        price: fobPrice > 0 ? Number((fobPrice * 0.45).toFixed(2)) : 0,
        wastage: 0,
        shrinkage: 0,
      },
    ],
    trims: [],
    embellishments: [],
    labor: {
      cuttingCostPerPc: 0,
      stitchingCostPerPc: fobPrice > 0 ? Number((fobPrice * 0.35).toFixed(2)) : 0,
      packingCostPerPc: 0,
    },
    finishing: {
      threadCuttingRate: 0,
      qcCheckingRate: 0,
      washingRequired: false,
      washingRate: 0,
      pressingRate: 0,
    },
    commercial: {
      freightPerPc: fobPrice > 0 ? Number((fobPrice * 0.2).toFixed(2)) : 0,
      insurancePct: 0,
      buyingCommissionPct: 0,
      bankChargesPct: 0,
      inspectionPerPc: 0,
      testingPerPc: 0,
    },
    exportCosts: {
      customsDutyPct: 0,
      agentCommissionPct: 0,
      documentationPerPc: 0,
      dutyDrawbackPct: 0,
      gstRefundPct: 0,
    },
    margins: {
      overheadPct: 0,
      currencyBufferPct: 0,
      reworkAllowancePct: 0,
      sampleCostTotal: 0,
      targetProfitPct: 0,
      gstApplicable: false,
      gstPct: 0,
    },
  };

  const fabricTotal = fobPrice > 0 ? Number((fobPrice * 0.45).toFixed(2)) : 0;
  const manufacturingTotal = fobPrice > 0 ? Number((fobPrice * 0.35).toFixed(2)) : 0;
  const commercialTotal = fobPrice > 0 ? Number((fobPrice - fabricTotal - manufacturingTotal).toFixed(2)) : 0;

  const results = {
    fabricTotal,
    trimsTotal: 0,
    embellishmentTotal: 0,
    manufacturingTotal,
    finishingTotal: 0,
    commercialTotal,
    exportTotal: 0,
    insuranceAmt: 0,
    buyingCommissionAmt: 0,
    bankChargesAmt: 0,
    customsDutyAmt: 0,
    agentCommissionAmt: 0,
    drawbackAmt: 0,
    gstRefundAmt: 0,
    overheadAmt: 0,
    bufferAmt: 0,
    reworkAmt: 0,
    sampleCostPc: 0,
    profitAmt: 0,
    gstAmt: 0,
    fobPrice,
    totalFobValue,
    totalCostExProfit: fobPrice,
    overheadPct: 0,
    currencyBufferPct: 0,
    reworkAllowancePct: 0,
    drawbackPct: 0,
    buyingCommissionPct: 0,
    targetProfitPct: 0,
  };

  return {
    data,
    results,
    breakdown: getDetailedBreakdown(results),
    quotation: mapToQuotation(results),
    hasDetailedCosting: false,
  };
};
