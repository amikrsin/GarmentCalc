import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CostingInputs from './CostingInputs';
import CostingOutputs from './CostingOutputs';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { 
  calculateFabricRowCost,
  calculateEmbellishmentCost,
  getDetailedBreakdown,
  mapToQuotation
} from '../../utils/costingCalculations';
import { calculateAutoConsumption } from '../../utils/consumptionFormula';
import { generateCostingPDF } from './CostingPDF';
import { generateQuotationExcel } from './quotationExcel';
import { motion } from 'motion/react';
import { saveToStorage, removeFromStorage } from '../../utils/storage';

import { CATEGORY_METADATA } from '../../constants/categories';
import { STANDARD_TRIMS, CATEGORY_TRIMS } from '../../constants/trimDefaults';

import { useOrders } from '../../context/OrdersContext';

const CostingModule = ({ restoreData, onRestored, isOrderContext = false, orderId = null }) => {
  const { 
    fabricConsumptionFromFormula, 
    setFabricConsumptionFromFormula, 
    triggerSaveIndicator, 
    preferences
  } = useApp();
  const { showToast } = useToast();
  const { orders, updateOrder } = useOrders();

  const order = useMemo(() => isOrderContext ? orders.find(o => o.id === orderId) : null, [orders, orderId, isOrderContext]);

  const getInitialState = useCallback(() => {
    const base = {
      // Section 1: Style Info
      styleInfo: {
        companyName: preferences.companyName || 'JM Jain LLP',
        styleName: order?.styleName || '',
        styleNo: order?.poNumber || '',
        description: order?.styleDescription || '',
        category: order?.category || 'Knit T-Shirts / Polos',
        season: order?.season || '',
        buyerName: order?.buyerName || '',
        orderQty: order?.orderQty || 1000,
        costingDate: new Date().toISOString().split('T')[0],
        costingType: 'internal',
        currency: order?.currency || preferences.defaultCurrency || 'USD',
        exchangeRate: order?.exchangeRate || preferences.defaultExchangeRate || 84.50,
        garmentImage: null,
      },

      // Section 2: Primary Fabric
      fabrics: [
        {
          id: 'fab-1',
          name: 'Body Fabric',
          description: '',
          composition: order?.fabricComposition || '',
          gsm: 180,
          widthInches: 58,
          consumptionMode: 'manual',
          consumption: 0.45,
          garmentLengthCm: 72,
          garmentWidthCm: 54,
          widthEfficiencyPct: 85,
          panels: 2,
          wastage: 8,
          shrinkage: 3,
          price: 12.5,
          calculatedConsumption: 0,
        }
      ],

      // Section 3: Trims & Accessories
      trims: [
        ...STANDARD_TRIMS,
        ...(CATEGORY_TRIMS[order?.category || 'Knit T-Shirts / Polos'] || [])
      ].map((t, i) => ({ ...t, id: `trim-initial-${i}` })),

      // Section 4: Embellishments
      embellishments: [],

      // Section 5: Labor & Manufacturing
      labor: {
        cuttingCostPerPc: 0.15,
        smvCutting: 0,
        noOfPlies: 0,
        stitchingCostPerPc: 1.50,
        stitchingSummary: '',
        stitchingManualOverride: false,
        smvStitching: 0,
        efficiencyPct: 65,
        laborRatePerMin: 0.15,
        smvFinishing: 0,
        packingCostPerPc: 0.12,
        smvPacking: 0,
      },

      // Section 5.2: Stitching Calculator State
      stitchingCalculator: {
        mode: 'per-piece',
        perPieceOps: [],
        samInputs: {
          laborRatePerMin: 0.08,
          efficiencyPct: 65,
          complexity: 'medium',
        },
        samOps: [],
        salaryInputs: {
          basis: 'monthly',
          salaryAmount: 18000,
          salaryCurrency: 'INR',
          workingDaysPerMonth: 26,
          hoursPerDay: 8,
          workersOnStyle: 12,
          lineDailyOutput: 350,
          overheadOnLaborPct: 15,
        }
      },

      // Section 5.3: Finishing Breakdown
      finishing: {
        threadCuttingPaymentType: 'Per Piece Rate',
        threadCuttingRate: 0.02,
        qcCheckingRate: 0.05,
        washingRequired: false,
        washType: 'Enzyme',
        washingRate: 0.35,
        pressingType: 'Steam Press',
        pressingRate: 0.08,
      },

      // Section 6: Commercial & Logistics
      commercial: {
        freightPerPc: 0.20,
        shipmentMode: order?.shipmentMode || 'Sea FCL',
        insurancePct: 0.5,
        buyingCommissionPct: 3,
        bankChargesPct: 0.5,
        inspectionPerPc: 0.05,
        testingPerPc: 0.05,
      },

      // Section 7: Export Specific
      exportCosts: {
        customsDutyPct: 0,
        agentCommissionPct: 0,
        documentationPerPc: 0.02,
        dutyDrawbackPct: 1.5,
        gstRefundPct: 0,
      },

      // Section 8: Critical Adjustments & Margin
      margins: {
        overheadPct: preferences.defaultOverheadPct || 10,
        currencyBufferPct: 2,
        reworkAllowancePct: 1.5,
        sampleCostTotal: 100,
        targetProfitPct: preferences.defaultProfitPct || 12,
        minAcceptableMarginPct: 5,
        gstApplicable: false,
        gstPct: 5,
      }
    };
    return base;
  }, [preferences, order]);

  const [data, setData] = useState(getInitialState);

  // Handle restoration from saved state
  useEffect(() => {
    if (restoreData) {
      setData(restoreData);
      onRestored();
    }
  }, [restoreData, onRestored]);

  // Auto-save on every state change
  useEffect(() => {
    if (isOrderContext && orderId) {
      updateOrder(orderId, { 
        costingState: data,
        fobPrice: results.fobPrice,
        totalFOBValue: results.totalFobValue
      });
    } else {
      saveToStorage('garmentcalc_current_costing', data);
    }
    triggerSaveIndicator();
  }, [data, triggerSaveIndicator, isOrderContext, orderId]);

  const handleSaveNamed = () => {
    if (isOrderContext) {
      showToast('Costing auto-saved to order ✓', 'success');
      return;
    }
    const name = window.prompt('Save this costing\nName:', data.styleInfo.styleName || 'Untitled Costing');
    if (name !== null) {
      // ... existing save logic ...
    }
  };

  const handleCategoryChange = (newCategory) => {
    const metadata = CATEGORY_METADATA[newCategory] || CATEGORY_METADATA['Other'];
    
    setData(prev => ({
      ...prev,
      styleInfo: { ...prev.styleInfo, category: newCategory },
      // Update fabrics with category defaults
      fabrics: prev.fabrics.map(f => ({
        ...f,
        wastage: metadata.defaultWastage,
        shrinkage: metadata.defaultShrinkage,
        widthEfficiencyPct: metadata.widthEfficiency
      })),
      // Update trims with category defaults
      trims: [
        ...STANDARD_TRIMS,
        ...(CATEGORY_TRIMS[newCategory] || [])
      ].map((t, i) => ({ ...t, id: `trim-${Date.now()}-${i}` }))
    }));
  };

  // Pre-fill consumption if it comes from formula panel
  useEffect(() => {
    if (fabricConsumptionFromFormula !== null) {
      setData(prev => {
        const newFabrics = [...prev.fabrics];
        if (newFabrics.length > 0) {
          newFabrics[0] = { ...newFabrics[0], consumption: fabricConsumptionFromFormula, consumptionMode: 'manual' };
        }
        return { ...prev, fabrics: newFabrics };
      });
      setFabricConsumptionFromFormula(null);
    }
  }, [fabricConsumptionFromFormula, setFabricConsumptionFromFormula]);

  const results = useMemo(() => {
    const { fabrics, trims, embellishments, labor, finishing, commercial, exportCosts, margins, styleInfo } = data;
    
    // Calculate Fabric Total
    const updatedFabrics = fabrics.map(f => {
      const calcCons = calculateAutoConsumption(
        f.garmentLengthCm, f.garmentWidthCm, f.panels, f.widthInches, f.wastage, f.shrinkage, f.gsm
      );
      return { ...f, calculatedConsumption: calcCons };
    });
    const fabricTotal = updatedFabrics.reduce((acc, f) => acc + calculateFabricRowCost(f), 0);
    
    // Calculate Trims Total
    const trimsTotal = trims.reduce((acc, t) => acc + (t.qty * t.price), 0);
    
    // Calculate Embellishments Total
    const embellishmentTotal = embellishments.reduce((acc, e) => acc + calculateEmbellishmentCost(e), 0);
    
    // Calculate Manufacturing Total
    const finishingTotal = finishing.threadCuttingRate + 
                          (finishing.qcCheckingRate || 0) +
                          (finishing.washingRequired ? finishing.washingRate : 0) + 
                          finishing.pressingRate;
    
    const manufacturingTotal = labor.cuttingCostPerPc + 
                               labor.stitchingCostPerPc + 
                               finishingTotal + 
                               labor.packingCostPerPc;
    
    // 1. Basic Manufacturing Subtotal
    const subTotal1 = fabricTotal + trimsTotal + embellishmentTotal + manufacturingTotal;
    
    // 2. Commercial & Export Costs (Fixed components)
    const insuranceAmt = subTotal1 * (commercial.insurancePct / 100);
    const bankChargesAmt = subTotal1 * (commercial.bankChargesPct / 100);
    const customsDutyAmt = subTotal1 * (exportCosts.customsDutyPct / 100);
    const agentCommissionAmt = subTotal1 * (exportCosts.agentCommissionPct / 100);
    const gstRefundAmt = subTotal1 * (exportCosts.gstRefundPct / 100);
    
    const fixedCommercial = commercial.freightPerPc + commercial.inspectionPerPc + commercial.testingPerPc + insuranceAmt + bankChargesAmt;
    const fixedExport = exportCosts.documentationPerPc + customsDutyAmt + agentCommissionAmt - gstRefundAmt;
    
    // 3. Adjustments & Overheads
    const overheadBase = fabricTotal + trimsTotal + manufacturingTotal;
    const overheadAmt = overheadBase * (margins.overheadPct / 100);
    
    // Subtotal for percentage-based adjustments (Currency Buffer, Rework)
    // These are calculated on the direct costs before FOB-based items
    const subTotalForAdj = subTotal1 + fixedCommercial + fixedExport;
    const bufferAmt = subTotalForAdj * (margins.currencyBufferPct / 100);
    const reworkAmt = subTotalForAdj * (margins.reworkAllowancePct / 100);
    const sampleCostPc = margins.sampleCostTotal / styleInfo.orderQty;
    
    // 4. Sub-total BEFORE commission, drawback, profit (The "subTotal" for algebraic formula)
    const subTotalForFOB = subTotalForAdj + overheadAmt + bufferAmt + reworkAmt + sampleCostPc;

    // 5. Algebraic Solution for Final FOB
    // Formula: F = (subTotal + F*c - F*d) * (1 + p)
    // F = subTotal(1+p) + F*c(1+p) - F*d(1+p)
    // F(1 - c(1+p) + d(1+p)) = subTotal(1+p)
    // F = subTotal(1+p) / (1 - c(1+p) + d(1+p))
    
    const commissionRate = commercial.buyingCommissionPct / 100;
    const drawbackRate = exportCosts.dutyDrawbackPct / 100;
    const profitRate = margins.targetProfitPct / 100;

    const denominator = 1 - (commissionRate * (1 + profitRate)) + (drawbackRate * (1 + profitRate));
    const fobPriceNoGst = (subTotalForFOB * (1 + profitRate)) / denominator;

    // 6. Calculate line items from FOB
    const buyingCommissionAmt = fobPriceNoGst * commissionRate;
    const drawbackAmt = fobPriceNoGst * drawbackRate;
    const profitAmt = fobPriceNoGst * profitRate;
    
    const totalCostExProfit = fobPriceNoGst - profitAmt;
    
    const gstAmt = margins.gstApplicable ? (fobPriceNoGst * (margins.gstPct / 100)) : 0;
    const fobPrice = fobPriceNoGst + gstAmt;
    const totalFobValue = fobPrice * styleInfo.orderQty;

    // Reconstruct totals for display
    const commercialTotal = fixedCommercial + buyingCommissionAmt;
    const exportTotal = fixedExport - drawbackAmt;

    return {
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
      // Include percentages for PDF
      overheadPct: margins.overheadPct,
      currencyBufferPct: margins.currencyBufferPct,
      reworkAllowancePct: margins.reworkAllowancePct,
      drawbackPct: exportCosts.dutyDrawbackPct,
      buyingCommissionPct: commercial.buyingCommissionPct,
      targetProfitPct: margins.targetProfitPct
    };
  }, [data]);

  const breakdown = useMemo(() => {
    return getDetailedBreakdown(results);
  }, [results]);

  const quotationData = useMemo(() => {
    return mapToQuotation(results);
  }, [results]);

  const handleExport = () => {
    generateCostingPDF(data, results, data.styleInfo.costingType === 'internal' ? breakdown : quotationData);
  };

  const handleExportExcel = async () => {
    try {
      await generateQuotationExcel(data, results);
    } catch (error) {
      console.error('Excel Export Failed:', error);
      showToast('Failed to generate Excel sheet', 'error');
    }
  };

  const handleReset = () => {
    if (window.confirm('Start a new costing?\nCurrent data will be cleared.\nYour saved costings are not affected.')) {
      setData(getInitialState());
      removeFromStorage('garmentcalc_current_costing');
      showToast('Costing reset', 'info');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <CostingInputs 
            data={data} 
            setData={setData} 
            onCategoryChange={handleCategoryChange} 
          />
        </div>
        <div className="lg:w-1/3">
          <div className="sticky top-24">
            <CostingOutputs 
              data={data} 
              results={results} 
              breakdown={breakdown} 
              onExport={handleExport}
              onExportExcel={handleExportExcel}
              onReset={handleReset}
              onSave={handleSaveNamed}
              isOrderContext={isOrderContext}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CostingModule;
