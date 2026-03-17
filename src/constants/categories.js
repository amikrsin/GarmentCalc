export const CATEGORIES = [
  'Knit T-Shirts / Polos',
  'Denim Jeans / Jackets',
  'Woven Shirts / Tops',
  'Trousers / Bottoms',
  'Other'
];

export const CATEGORY_METADATA = {
  'Knit T-Shirts / Polos': {
    defaultWastage: 8,
    defaultShrinkage: 4,
    widthEfficiency: 80,
    benchmarks: { cutting: [0.10, 0.20], stitching: [1.20, 2.00], finishing: [0.20, 0.35], packing: [0.10, 0.18] }
  },
  'Denim Jeans / Jackets': {
    defaultWastage: 12,
    defaultShrinkage: 2,
    widthEfficiency: 85,
    benchmarks: { cutting: [0.25, 0.40], stitching: [3.00, 5.00], finishing: [0.40, 0.70], packing: [0.15, 0.25] }
  },
  'Woven Shirts / Tops': {
    defaultWastage: 8,
    defaultShrinkage: 1,
    widthEfficiency: 85,
    benchmarks: { cutting: [0.20, 0.35], stitching: [2.50, 4.00], finishing: [0.35, 0.60], packing: [0.15, 0.25] }
  },
  'Trousers / Bottoms': {
    defaultWastage: 10,
    defaultShrinkage: 1,
    widthEfficiency: 85,
    benchmarks: { cutting: [0.20, 0.35], stitching: [2.00, 3.50], finishing: [0.30, 0.55], packing: [0.12, 0.22] }
  },
  'Other': {
    defaultWastage: 8,
    defaultShrinkage: 2,
    widthEfficiency: 85,
    benchmarks: { cutting: [0.15, 0.30], stitching: [1.50, 3.00], finishing: [0.25, 0.50], packing: [0.10, 0.20] }
  }
};
