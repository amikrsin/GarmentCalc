export const STANDARD_TRIMS = [
  { name: 'Main Label', qty: 1, unit: 'pc', price: 0.02 },
  { name: 'Care Label', qty: 1, unit: 'pc', price: 0.01 },
  { name: 'Size Label', qty: 1, unit: 'pc', price: 0.01 },
  { name: 'Hangtag', qty: 1, unit: 'pc', price: 0.05 },
  { name: 'Barcode Sticker', qty: 1, unit: 'pc', price: 0.01 },
  { name: 'Poly Bag', qty: 1, unit: 'pc', price: 0.05 },
  { name: 'Carton', qty: 0.083, unit: 'pc', price: 0.50 }, // 1/12
];

export const CATEGORY_TRIMS = {
  'Knit T-Shirts / Polos': [
    { name: 'Shoulder Tape', qty: 0.4, unit: 'mtr', price: 0.05 },
    { name: 'Back Neck Tape', qty: 0.25, unit: 'mtr', price: 0.05 },
  ],
  'Denim Jeans / Jackets': [
    { name: 'Rivets', qty: 6, unit: 'pc', price: 0.02 },
    { name: 'Jean Button', qty: 1, unit: 'pc', price: 0.08 },
    { name: 'YKK Zipper (Fly)', qty: 1, unit: 'pc', price: 0.25 },
    { name: 'Pocket Bag Fabric', qty: 0.25, unit: 'mtr', price: 1.20 },
    { name: 'Waistband Interlining', qty: 0.8, unit: 'mtr', price: 0.40 },
    { name: 'Patch Label (Back)', qty: 1, unit: 'pc', price: 0.15 },
  ],
  'Woven Shirts / Tops': [
    { name: 'Buttons (Front)', qty: 7, unit: 'pc', price: 0.01 },
    { name: 'Buttons (Cuff)', qty: 4, unit: 'pc', price: 0.01 },
    { name: 'Interlining (Collar)', qty: 0.2, unit: 'mtr', price: 0.80 },
    { name: 'Interlining (Cuff)', qty: 0.15, unit: 'mtr', price: 0.80 },
    { name: 'Collar Stay', qty: 2, unit: 'pc', price: 0.02 },
  ],
  'Trousers / Bottoms': [
    { name: 'Waistband Interlining', qty: 0.9, unit: 'mtr', price: 0.45 },
    { name: 'Pocket Lining Fabric', qty: 0.3, unit: 'mtr', price: 1.10 },
    { name: 'Zip (Fly)', qty: 1, unit: 'pc', price: 0.20 },
    { name: 'Hook & Bar', qty: 1, unit: 'pc', price: 0.05 },
    { name: 'Shank Button', qty: 1, unit: 'pc', price: 0.06 },
  ]
};
