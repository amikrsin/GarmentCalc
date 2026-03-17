import { COMPLEXITY_MULTIPLIERS, SAM_BENCHMARK_BY_CATEGORY } from '../constants/stitchingDefaults';

/**
 * Calculate stitching cost for Per Piece mode
 * @param {Array} operations - Array of { name, ratePerPc }
 * @returns {number} - Total cost per piece
 */
export const calcPerPieceStitching = (operations) => {
  return operations.reduce((total, op) => total + (Number(op.ratePerPc) || 0), 0);
};

/**
 * Calculate stitching cost for SAM mode
 * @param {Array} operations - Array of { name, sam }
 * @param {number} laborRate - Labor rate per minute (USD)
 * @param {number} efficiency - Efficiency percentage (e.g., 65)
 * @param {string} complexityLevel - 'basic' | 'medium' | 'complex'
 * @returns {Object} - { totalSAM, totalCost, baseCostTotal, costWithComplexityTotal }
 */
export const calcSAMStitching = (operations, laborRate, efficiency, complexityLevel) => {
  const totalSAM = operations.reduce((total, op) => total + (Number(op.sam) || 0), 0);
  const multiplier = COMPLEXITY_MULTIPLIERS[complexityLevel] || 1;
  const efficiencyFactor = (efficiency || 65) / 100;
  
  const baseCostTotal = (totalSAM / efficiencyFactor) * (laborRate || 0);
  const costWithComplexityTotal = baseCostTotal * multiplier;
  
  return {
    totalSAM,
    totalCost: costWithComplexityTotal,
    baseCostTotal,
    costWithComplexityTotal
  };
};

/**
 * Calculate stitching cost for Salary mode
 * @param {number} salary - Salary amount
 * @param {number} workingDays - Working days per month
 * @param {number} hours - Hours per day
 * @param {number} workers - Number of workers on this style
 * @param {number} output - Line output (pcs/day)
 * @param {number} overheadPct - Overhead percentage on labor
 * @param {number} exchangeRate - Exchange rate (e.g., 83 for INR to USD)
 * @param {string} currency - 'INR' | 'USD'
 * @returns {Object} - { dailyCostPerWorker, minCostPerWorker, totalDailyLaborCost, stitchingCostPerPc, finalStitchingCost }
 */
export const calcSalaryStitching = (
  salary, 
  workingDays, 
  hours, 
  workers, 
  output, 
  overheadPct, 
  exchangeRate, 
  currency,
  basis = 'monthly'
) => {
  const salaryVal = Number(salary) || 0;
  const daysVal = Number(workingDays) || 26;
  const hoursVal = Number(hours) || 8;
  const workersVal = Number(workers) || 0;
  const outputVal = Number(output) || 1;
  const overheadFactor = 1 + (Number(overheadPct) || 0) / 100;
  const rate = Number(exchangeRate) || 1;

  let dailyCostPerWorker;
  if (basis === 'monthly') {
    dailyCostPerWorker = salaryVal / daysVal;
  } else {
    dailyCostPerWorker = salaryVal;
  }

  const minCostPerWorker = dailyCostPerWorker / (hoursVal * 60);
  const totalDailyLaborCost = dailyCostPerWorker * workersVal;
  let stitchingCostPerPc = totalDailyLaborCost / outputVal;
  
  // Convert to USD if currency is INR
  if (currency === 'INR') {
    stitchingCostPerPc = stitchingCostPerPc / rate;
  }

  const finalStitchingCost = stitchingCostPerPc * overheadFactor;

  return {
    dailyCostPerWorker,
    minCostPerWorker,
    totalDailyLaborCost,
    stitchingCostPerPc,
    finalStitchingCost
  };
};

/**
 * Validate total SAM against category benchmark
 * @param {number} totalSAM 
 * @param {string} category 
 * @returns {string|null} - Warning message or null
 */
export const validateTotalSAM = (totalSAM, category) => {
  const benchmark = SAM_BENCHMARK_BY_CATEGORY[category];
  if (!benchmark) return null;
  
  const [min, max] = benchmark;
  if (totalSAM < min) {
    return `⚠️ Total SAM of ${totalSAM.toFixed(1)} seems low for ${category} — typical range is ${min}–${max} min`;
  }
  if (totalSAM > max) {
    return `⚠️ Total SAM of ${totalSAM.toFixed(1)} seems high for ${category} — typical range is ${min}–${max} min`;
  }
  return null;
};

/**
 * Calculate theoretical daily output
 * @param {number} SAM 
 * @param {number} efficiency 
 * @param {number} hoursPerDay 
 * @returns {number}
 */
export const calcTheoreticalDailyOutput = (SAM, efficiency, hoursPerDay = 8) => {
  if (!SAM || SAM === 0) return 0;
  const efficiencyFactor = (efficiency || 65) / 100;
  return (hoursPerDay * 60 / SAM) * efficiencyFactor;
};
