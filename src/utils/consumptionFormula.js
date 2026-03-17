/**
 * Auto-calculate fabric consumption from garment measurements
 */
export function calculateAutoConsumption(
  lengthCm,
  widthCm,
  panels,
  fabricWidthInches,
  wastagePct,
  shrinkagePct,
  gsm
) {
  if (!lengthCm || !widthCm || !fabricWidthInches || !gsm) return 0;
  
  const fabricWidthCm = fabricWidthInches * 2.54;
  
  // Formula:
  // [(length × width × panels) ÷ (fabricWidth_cm × 100)]
  // × (1 + wastage/100) × (1 + shrinkage/100) × gsm / 1000
  
  const area = (lengthCm * widthCm * panels);
  const consumptionMeters = area / (fabricWidthCm * 100);
  const consumptionKg = (consumptionMeters * fabricWidthCm * gsm) / 100000; // Simplified for kg
  
  // More accurate for kg/pc: (Area in sqm) * GSM / 1000
  const areaSqm = (lengthCm * widthCm * panels) / 10000;
  const baseConsumptionKg = areaSqm * (gsm / 1000);
  
  return baseConsumptionKg * (1 + wastagePct / 100) * (1 + shrinkagePct / 100);
}
