/**
 * Quick Formulas logic
 */

export const calcDHU = (defects, piecesChecked) => {
  if (!piecesChecked || piecesChecked === 0) return 0;
  return (defects / piecesChecked) * 100;
};

export const calcLineEfficiency = (producedMinutes, availableMinutes) => {
  if (!availableMinutes || availableMinutes === 0) return 0;
  return (producedMinutes / availableMinutes) * 100;
};

export const calcFabricConsumption = (lengthCm, widthCm, gsm, widthEff, wastage) => {
  if (!lengthCm || !widthCm || !gsm) return 0;
  const effFactor = (widthEff || 100) / 100;
  // Standard formula for Knit Consumption (kg/pc):
  // ((Length * Width * GSM) / 10,000,000) / Efficiency
  const base = (lengthCm * widthCm * gsm) / (10000000 * effFactor);
  return base * (1 + (wastage || 0) / 100);
};

export const calcCapacityOutput = (machines, hours, smv, efficiency) => {
  if (!smv || smv === 0) return 0;
  return (machines * hours * 60) / smv * (efficiency / 100);
};

export const calcBreakEven = (fixedCost, price, variableCost) => {
  const margin = price - variableCost;
  if (margin <= 0) return 0;
  return fixedCost / margin;
};

export const calcProfitMargin = (fob, totalCost) => {
  if (!fob || fob === 0) return 0;
  return ((fob - totalCost) / fob) * 100;
};
