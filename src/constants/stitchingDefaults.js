export const DEFAULT_OPERATIONS_BY_CATEGORY = {
  'Knit T-Shirts / Polos': [
    { name: 'Collar attach', ratePerPc: 0.15 },
    { name: 'Sleeve set', ratePerPc: 0.20 },
    { name: 'Side seam (x2)', ratePerPc: 0.24 },
    { name: 'Hem', ratePerPc: 0.10 },
    { name: 'Label attach', ratePerPc: 0.05 },
  ],
  'Woven Shirts / Tops': [
    { name: 'Collar make', ratePerPc: 0.25 },
    { name: 'Collar attach', ratePerPc: 0.20 },
    { name: 'Sleeve set', ratePerPc: 0.25 },
    { name: 'Cuff attach', ratePerPc: 0.20 },
    { name: 'Placket', ratePerPc: 0.30 },
    { name: 'Side seam', ratePerPc: 0.15 },
    { name: 'Button hole', ratePerPc: 0.10 },
    { name: 'Button attach', ratePerPc: 0.10 },
  ],
  'Denim Jeans': [
    { name: 'Fly attach', ratePerPc: 0.35 },
    { name: 'Inseam', ratePerPc: 0.25 },
    { name: 'Outseam', ratePerPc: 0.25 },
    { name: 'Waistband attach', ratePerPc: 0.30 },
    { name: 'Belt loop attach', ratePerPc: 0.15 },
    { name: 'Pocket set', ratePerPc: 0.25 },
    { name: 'Rivet attach', ratePerPc: 0.10 },
  ],
  'Trousers / Pants': [
    { name: 'Waistband attach', ratePerPc: 0.30 },
    { name: 'Fly attach', ratePerPc: 0.30 },
    { name: 'Inseam', ratePerPc: 0.20 },
    { name: 'Outseam', ratePerPc: 0.20 },
    { name: 'Pocket set', ratePerPc: 0.25 },
    { name: 'Hem', ratePerPc: 0.15 },
    { name: 'Hook & bar attach', ratePerPc: 0.10 },
  ],
};

export const DEFAULT_SAM_BY_CATEGORY = {
  'Knit T-Shirts / Polos': [
    { name: 'Collar attach', sam: 2.5 },
    { name: 'Sleeve set', sam: 3.2 },
    { name: 'Side seam (x2)', sam: 2.8 },
    { name: 'Hem', sam: 1.5 },
    { name: 'Label attach', sam: 0.8 },
  ],
  'Woven Shirts / Tops': [
    { name: 'Collar make', sam: 3.5 },
    { name: 'Collar attach', sam: 2.8 },
    { name: 'Sleeve set (x2)', sam: 3.2 },
    { name: 'Side seam', sam: 1.5 },
    { name: 'Placket', sam: 2.0 },
    { name: 'Button hole (x7)', sam: 2.5 },
    { name: 'Button attach (x7)', sam: 1.8 },
  ],
  'Denim Jeans': [
    { name: 'Fly attach', sam: 4.5 },
    { name: 'Inseam', sam: 3.5 },
    { name: 'Outseam', sam: 3.5 },
    { name: 'Waistband attach', sam: 4.0 },
    { name: 'Belt loop attach', sam: 2.5 },
    { name: 'Pocket set', sam: 3.5 },
    { name: 'Rivet attach', sam: 1.5 },
  ],
  'Trousers / Pants': [
    { name: 'Waistband attach', sam: 4.0 },
    { name: 'Fly attach', sam: 4.0 },
    { name: 'Inseam', sam: 3.0 },
    { name: 'Outseam', sam: 3.0 },
    { name: 'Pocket set', sam: 3.5 },
    { name: 'Hem', sam: 2.0 },
    { name: 'Hook & bar attach', sam: 1.5 },
  ],
};

export const COMPLEXITY_MULTIPLIERS = {
  basic: 1.00,
  medium: 1.25,
  complex: 1.55,
};

export const SAM_BENCHMARK_BY_CATEGORY = {
  'Knit T-Shirts / Polos': [10, 18],
  'Woven Shirts / Tops': [15, 25],
  'Denim Jeans': [20, 32],
  'Trousers / Pants': [18, 28],
};

export const WASH_TYPES = [
  'Enzyme', 'Stone', 'Acid', 'Sand Blast', 'Bleach', 'Dip Dye', 'Garment Dye', 'Custom'
];

export const PRESSING_TYPES = [
  'Steam Press', 'Tunnel Finish', 'Hand Iron'
];
