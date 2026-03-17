import React, { useState, useEffect, useMemo } from 'react';
import CostingInputs from './CostingInputs';
import CostingOutputs from './CostingOutputs';
import { useApp } from '../../context/AppContext';
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

import { CATEGORY_METADATA } from '../../constants/categories';
import { STANDARD_TRIMS, CATEGORY_TRIMS } from '../../constants/trimDefaults';

const CostingModule = ({ restoreData, onRestored }) => {
  const { fabricConsumptionFromFormula, setFabricConsumptionFromFormula, setLastSaved, saveCosting } = useApp();

  const initialState = {
    // Section 1: Style Info
    styleInfo: {
      companyName: 'JM Jain LLP',
      styleName: '',
      styleNo: '',
      description: '',
      category: 'Knit T-Shirts / Polos',
      season: '',
      buyerName: '',
      orderQty: 1000,
      costingDate: new Date().toISOString().split('T')[0],
      costingType: 'internal',
      currency: 'USD',
      exchangeRate: 1,
      garmentImage: null,
    },

    // Section 2: Primary Fabric
    fabrics: [
      {
        id: 'fab-1',
        name: 'Body Fabric',
        description: '',
        composition: '',
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
      ...(CATEGORY_TRIMS['Knit T-Shirts / Polos'] || [])
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
      shipmentMode: 'Sea FCL',
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
      overheadPct: 10,
      currencyBufferPct: 2,
      reworkAllowancePct: 1.5,
      sampleCostTotal: 100,
      targetProfitPct: 12,
      minAcceptableMarginPct: 5,
      gstApplicable: false,
      gstPct: 5,
    }
  };

  const [data, setData] = useState(initialState);

  // Handle restoration from saved state
  useEffect(() => {
    if (restoreData) {
      setData(restoreData);
      onRestored();
    }
  }, [restoreData, onRestored]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const stateToSave = { ...data, lastSavedAt: new Date().toISOString() };
      localStorage.setItem('garmentcalc_current_costing', JSON.stringify(stateToSave));
      setLastSaved(new Date().toISOString());
    }, 30000);

    return () => clearInterval(interval);
  }, [data, setLastSaved]);

  // Save on significant changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const stateToSave = { ...data, lastSavedAt: new Date().toISOString() };
      localStorage.setItem('garmentcalc_current_costing', JSON.stringify(stateToSave));
      setLastSaved(new Date().toISOString());
    }, 2000);

    return () => clearTimeout(timeout);
  }, [data.styleInfo.styleName, data.styleInfo.buyerName, data.styleInfo.orderQty, setLastSaved]);

  const handleSaveNamed = () => {
    const name = window.prompt('Enter a name for this costing:', data.styleInfo.styleName || 'Untitled Costing');
    if (name) {
      const savedItem = {
        id: crypto.randomUUID(),
        name: name,
        buyerName: data.styleInfo.buyerName || 'Unknown Buyer',
        finalFOB: results.fobPrice,
        orderQty: data.styleInfo.orderQty,
        savedAt: new Date().toISOString(),
        state: data
      };
      saveCosting(savedItem);
      alert('Costing saved to My Costings!');
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
      alert('Failed to generate Excel sheet. Please try again.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all fields? This cannot be undone.')) {
      setData(initialState);
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
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CostingModule;
