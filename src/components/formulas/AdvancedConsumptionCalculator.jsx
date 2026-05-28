import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { 
  Calculator, 
  Info, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  Scale, 
  DollarSign, 
  Activity, 
  FileText, 
  Copy, 
  Printer, 
  Download, 
  Check, 
  RefreshCw, 
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateConsumptionPDF } from './ConsumptionPDF';

// ========== CATEGORIES DATA ==========
const GARMENT_DB = [
  {
    main: "Upper Body Wear", sub: "T-Shirts", type: "knit", unit: "KG/Dozen",
    meas: [
      { id: "BL", label: "Body Length", def: 70, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 50, hint: "1\" below armhole, front" },
      { id: "SHW", label: "Shoulder Width", def: 42, hint: "Point to point across back" },
      { id: "SL", label: "Sleeve Length", def: 22, hint: "Armhole to cuff edge" },
      { id: "BCP", label: "Bicep Width (half)", def: 18, hint: "Widest point of sleeve" },
      { id: "NK", label: "Neck Width (half)", def: 7.5, hint: "Half of neck opening" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 2, hint: "Bottom hem" },
      { id: "SLH", label: "Sleeve Hem", def: 1.5, hint: "Sleeve cuff hem" },
      { id: "EA_CW", label: "Chest Ease", def: 5, hint: "Wearing ease at chest" },
      { id: "EA_BCP", label: "Bicep Ease", def: 3, hint: "Ease at bicep" },
    ],
    fabric: [
      { id: "GSM", label: "GSM", def: 180, hint: "Fabric weight g/m²" },
      { id: "FabWidth", label: "Fabric Width", def: 60, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 5, hint: "Cutting wastage" },
    ],
    formula: "((BL+HEM+SA) * (CW+EA_CW+SA) * 2 * 12 * GSM) / 10000000 * (1+WA/100)",
  },
  {
    main: "Upper Body Wear", sub: "Shirts", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "BL", label: "Body Length", def: 76, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 52, hint: "1\" below armhole" },
      { id: "SHW", label: "Shoulder Width", def: 45, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 62, hint: "Shoulder pt to cuff" },
      { id: "BCP", label: "Bicep Width (half)", def: 20, hint: "Widest sleeve point" },
      { id: "CFL", label: "Cuff Length (half)", def: 11, hint: "Half cuff circumference" },
      { id: "NK", label: "Neck/Collar Size", def: 39, hint: "Neck circumference" },
      { id: "CFW", label: "Collar Height", def: 4, hint: "Band + collar height" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 2.5, hint: "Bottom hem" },
      { id: "EA_CW", label: "Chest Ease", def: 6, hint: "Wearing ease" },
      { id: "EA_BCP", label: "Bicep Ease", def: 4, hint: "Ease at bicep" },
      { id: "PLK", label: "Placket Width", def: 3, hint: "Front placket" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 58, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 7, hint: "Cutting wastage" },
    ],
    formula: "(((BL+HEM+SA)+(SL+SA)) * (CW+EA_CW+SA) * 2) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Upper Body Wear", sub: "Blouses & Tunics", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "BL", label: "Body Length", def: 65, hint: "HPS to hem" },
      { id: "CW", label: "Bust Width (half)", def: 46, hint: "Full bust half" },
      { id: "WaistW", label: "Waist (half)", def: 38, hint: "Waist half" },
      { id: "HipW", label: "Hip Width (half)", def: 48, hint: "Hip half" },
      { id: "SHW", label: "Shoulder Width", def: 38, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 22, hint: "Armhole to sleeve end" },
      { id: "BCP", label: "Bicep Width (half)", def: 16, hint: "Widest sleeve point" },
      { id: "NK", label: "Neck Width (half)", def: 7, hint: "Half neck opening" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 2.5, hint: "Bottom hem" },
      { id: "EA_CW", label: "Bust Ease", def: 4, hint: "Wearing ease at bust" },
      { id: "EA_BCP", label: "Bicep Ease", def: 3, hint: "Ease at bicep" },
      { id: "DART", label: "Dart Uptake", def: 2, hint: "Bust dart total cm" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 58, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 8, hint: "Cutting wastage" },
    ],
    formula: "(((BL+HEM+SA)+(SL+SA)) * (CW+EA_CW+SA) * 2) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Upper Body Wear", sub: "Tank Tops & Crop Tops", type: "knit", unit: "KG/Dozen",
    meas: [
      { id: "BL", label: "Body Length", def: 50, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 44, hint: "Across front" },
      { id: "SHW", label: "Shoulder Width", def: 35, hint: "Point to point" },
      { id: "NK", label: "Neck Width (half)", def: 7, hint: "Half neck opening" },
      { id: "AH", label: "Armhole Depth", def: 20, hint: "Neck to underarm" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 2, hint: "Bottom hem" },
      { id: "EA_CW", label: "Chest Ease", def: 4, hint: "Wearing ease" },
    ],
    fabric: [
      { id: "GSM", label: "GSM", def: 160, hint: "Fabric weight g/m²" },
      { id: "FabWidth", label: "Fabric Width", def: 60, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 5, hint: "Cutting wastage" },
    ],
    formula: "((BL+HEM+SA) * (CW+EA_CW+SA) * 2 * 12 * GSM) / 10000000 * (1+WA/100)",
  },
  {
    main: "Lower Body Wear", sub: "Jeans", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "PL", label: "Outseam Length", def: 105, hint: "Waist to hem" },
      { id: "INSEAM", label: "Inseam Length", def: 80, hint: "Crotch to hem" },
      { id: "HW", label: "Hip Width (half)", def: 28, hint: "Widest hip half" },
      { id: "WW", label: "Waist Width (half)", def: 21, hint: "Waist half" },
      { id: "THIGH", label: "Thigh Width (half)", def: 28, hint: "Widest thigh half" },
      { id: "KNEE", label: "Knee Width (half)", def: 21, hint: "Knee half" },
      { id: "LEG", label: "Leg Opening (half)", def: 17, hint: "Hem half" },
      { id: "CD", label: "Crotch Depth", def: 28, hint: "Seat to waistband" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 2, hint: "Bottom hem" },
      { id: "WB", label: "Waistband Width", def: 4, hint: "Waistband height" },
      { id: "EA_HW", label: "Hip Ease", def: 2, hint: "Wearing ease at hip" },
      { id: "CR_EXT", label: "Crotch Extension", def: 3, hint: "Crotch seam extension" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 58, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 10, hint: "Cutting wastage (denim)" },
    ],
    formula: "((PL+HEM+SA) * (HW+EA_HW+SA) * 4) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Lower Body Wear", sub: "Trousers & Chinos", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "PL", label: "Outseam Length", def: 110, hint: "Waist to hem" },
      { id: "INSEAM", label: "Inseam Length", def: 82, hint: "Crotch to hem" },
      { id: "HW", label: "Hip Width (half)", def: 27, hint: "Widest hip half" },
      { id: "WW", label: "Waist Width (half)", def: 21, hint: "Waist half" },
      { id: "THIGH", label: "Thigh Width (half)", def: 26, hint: "Thigh half" },
      { id: "KNEE", label: "Knee Width (half)", def: 20, hint: "Knee half" },
      { id: "LEG", label: "Leg Opening (half)", def: 18, hint: "Hem half" },
      { id: "CD", label: "Crotch Depth", def: 28, hint: "Seat to waistband" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 3, hint: "Trouser hem" },
      { id: "WB", label: "Waistband Width", def: 4, hint: "Waistband height" },
      { id: "PLEAT", label: "Pleat Allowance", def: 3, hint: "Per pleat (if any)" },
      { id: "EA_HW", label: "Hip Ease", def: 3, hint: "Wearing ease at hip" },
      { id: "EA_TH", label: "Thigh Ease", def: 2, hint: "Ease at thigh" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 58, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 8, hint: "Cutting wastage" },
    ],
    formula: "((PL+HEM+SA) * (HW+EA_HW+SA) * 4) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Lower Body Wear", sub: "Shorts", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "PL", label: "Outseam Length", def: 52, hint: "Waist to hem" },
      { id: "INSEAM", label: "Inseam Length", def: 22, hint: "Crotch to hem" },
      { id: "HW", label: "Hip Width (half)", def: 27, hint: "Hip half" },
      { id: "WW", label: "Waist Width (half)", def: 21, hint: "Waist half" },
      { id: "THIGH", label: "Thigh Width (half)", def: 26, hint: "Thigh half" },
      { id: "LEG", label: "Leg Opening (half)", def: 23, hint: "Hem half" },
      { id: "CD", label: "Crotch Depth", def: 28, hint: "Seat to waistband" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 2.5, hint: "Shorts hem" },
      { id: "WB", label: "Waistband Width", def: 4, hint: "Waistband height" },
      { id: "EA_HW", label: "Hip Ease", def: 3, hint: "Wearing ease" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 58, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 7, hint: "Cutting wastage" },
    ],
    formula: "((PL+HEM+SA) * (HW+EA_HW+SA) * 4) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Lower Body Wear", sub: "Skirts", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "SkirtL", label: "Skirt Length", def: 60, hint: "Waistband to hem" },
      { id: "HW", label: "Hip Width (half)", def: 26, hint: "Widest hip half" },
      { id: "WW", label: "Waist Width (half)", def: 20, hint: "Waist half" },
      { id: "HEM_W", label: "Hem Width (half)", def: 28, hint: "Half hem circumference" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 3, hint: "Skirt hem" },
      { id: "WB", label: "Waistband Width", def: 4, hint: "Waistband height" },
      { id: "EA_HW", label: "Hip Ease", def: 3, hint: "Wearing ease" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 58, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 7, hint: "Cutting wastage" },
    ],
    formula: "((SkirtL+HEM+SA) * (HW+EA_HW+SA) * 2) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Lower Body Wear", sub: "Leggings & Joggers", type: "knit", unit: "KG/Dozen",
    meas: [
      { id: "PL", label: "Outseam Length", def: 100, hint: "Waist to ankle" },
      { id: "INSEAM", label: "Inseam Length", def: 74, hint: "Crotch to ankle" },
      { id: "HW", label: "Hip Width (half)", def: 24, hint: "Hip half" },
      { id: "WW", label: "Waist Width (half)", def: 18, hint: "Waist half" },
      { id: "THIGH", label: "Thigh Width (half)", def: 23, hint: "Thigh half" },
      { id: "KNEE", label: "Knee Width (half)", def: 18, hint: "Knee half" },
      { id: "ANKLE", label: "Ankle Width (half)", def: 13, hint: "Ankle/cuff half" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "WB", label: "Waistband Width", def: 4, hint: "Waistband height" },
      { id: "EA_HW", label: "Hip Ease", def: 2, hint: "Ease at hip" },
      { id: "EA_TH", label: "Thigh Ease", def: 1, hint: "Ease at thigh" },
    ],
    fabric: [
      { id: "GSM", label: "GSM", def: 220, hint: "Fabric weight g/m²" },
      { id: "FabWidth", label: "Fabric Width", def: 60, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 6, hint: "Cutting wastage" },
    ],
    formula: "((PL+SA) * (HW+EA_HW+SA) * 4 * 12 * GSM) / 10000000 * (1+WA/100)",
  },
  {
    main: "Full-Body / 1-Piece", sub: "Dresses", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "BL", label: "Dress Length", def: 100, hint: "HPS to hem" },
      { id: "CW", label: "Bust Width (half)", def: 48, hint: "Full bust half" },
      { id: "WW", label: "Waist Width (half)", def: 38, hint: "Waist half" },
      { id: "HW", label: "Hip Width (half)", def: 50, hint: "Hip half" },
      { id: "SHW", label: "Shoulder Width", def: 38, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 22, hint: "Armhole to sleeve end" },
      { id: "BCP", label: "Bicep Width (half)", def: 16, hint: "Sleeve widest point" },
      { id: "NK", label: "Neck Width (half)", def: 7, hint: "Half neck opening" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 3.5, hint: "Dress hem" },
      { id: "EA_CW", label: "Bust Ease", def: 5, hint: "Wearing ease" },
      { id: "EA_HW", label: "Hip Ease", def: 4, hint: "Ease at hip" },
      { id: "EA_BCP", label: "Bicep Ease", def: 3, hint: "Ease at bicep" },
      { id: "ZIP", label: "Zipper Extension", def: 2, hint: "Back zip seam extra" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 58, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 10, hint: "Cutting wastage" },
    ],
    formula: "(((BL+HEM+SA)+(SL+SA)) * (CW+EA_CW+SA) * 2) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Full-Body / 1-Piece", sub: "Jumpsuits & Rompers", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "BL", label: "Bodice Length", def: 58, hint: "HPS to waist" },
      { id: "LEG_L", label: "Leg Length", def: 82, hint: "Waist to hem" },
      { id: "CW", label: "Bust Width (half)", def: 48, hint: "Bust half" },
      { id: "WW", label: "Waist Width (half)", def: 38, hint: "Waist half" },
      { id: "HW", label: "Hip Width (half)", def: 50, hint: "Hip half" },
      { id: "SL", label: "Sleeve Length", def: 22, hint: "Armhole to end" },
      { id: "BCP", label: "Bicep Width (half)", def: 16, hint: "Sleeve widest" },
      { id: "CD", label: "Crotch Depth", def: 28, hint: "Seat depth" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 3, hint: "Leg hem" },
      { id: "EA_CW", label: "Bust Ease", def: 5, hint: "Wearing ease" },
      { id: "EA_HW", label: "Hip Ease", def: 4, hint: "Ease at hip" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 58, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 10, hint: "Cutting wastage" },
    ],
    formula: "((((BL+LEG_L)+HEM+SA)+(SL+SA)) * (CW+EA_CW+SA) * 2) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Full-Body / 1-Piece", sub: "Suits & Sets", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "BL", label: "Jacket Body Length", def: 72, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 56, hint: "Chest half" },
      { id: "SHW", label: "Shoulder Width", def: 46, hint: "Point to point" },
      { id: "SL", label: "Jacket Sleeve Length", def: 62, hint: "Shoulder to cuff" },
      { id: "BCP", label: "Bicep Width (half)", def: 20, hint: "Sleeve widest" },
      { id: "PL", label: "Trouser Outseam", def: 110, hint: "Waist to hem" },
      { id: "HW", label: "Hip Width (half)", def: 27, hint: "Hip half" },
      { id: "THIGH", label: "Thigh Width (half)", def: 26, hint: "Thigh half" },
      { id: "WW", label: "Waist Width (half)", def: 21, hint: "Waist half" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 3, hint: "Jacket + trouser hem" },
      { id: "EA_CW", label: "Chest Ease", def: 8, hint: "Jacket ease (larger)" },
      { id: "EA_BCP", label: "Bicep Ease", def: 5, hint: "Ease at bicep" },
      { id: "EA_HW", label: "Hip Ease", def: 3, hint: "Trouser hip ease" },
      { id: "WB", label: "Waistband Width", def: 4, hint: "Trouser waistband" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 58, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 12, hint: "Cutting wastage" },
    ],
    formula: "(((BL+HEM+SA)+(SL+SA))*(CW+EA_CW+SA)*2 + ((PL+HEM+SA)*(HW+EA_HW+SA)*4)) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Outerwear", sub: "Jackets", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "BL", label: "Body Length", def: 72, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 56, hint: "Chest half" },
      { id: "SHW", label: "Shoulder Width", def: 46, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 62, hint: "Shoulder to cuff" },
      { id: "BCP", label: "Bicep Width (half)", def: 20, hint: "Sleeve widest" },
      { id: "CFL", label: "Cuff Width", def: 14, hint: "Cuff circumference half" },
      { id: "COLH", label: "Collar Height", def: 5, hint: "Collar + stand height" },
      { id: "LAPW", label: "Lapel Width", def: 9, hint: "Lapel at widest point" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 4, hint: "Jacket hem" },
      { id: "EA_CW", label: "Chest Ease", def: 8, hint: "Jacket wearing ease" },
      { id: "EA_BCP", label: "Bicep Ease", def: 5, hint: "Ease at bicep" },
      { id: "FACING", label: "Facing Allowance", def: 5, hint: "Front facing extra" },
      { id: "WELT", label: "Welt Pocket Extra", def: 4, hint: "Welt/pocket pieces" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 58, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 10, hint: "Cutting wastage" },
    ],
    formula: "(((BL+HEM+SA)+(SL+SA)) * (CW+EA_CW+SA) * 2) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Outerwear", sub: "Coats", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "BL", label: "Coat Body Length", def: 110, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 58, hint: "Chest half" },
      { id: "SHW", label: "Shoulder Width", def: 46, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 62, hint: "Shoulder to cuff" },
      { id: "BCP", label: "Bicep Width (half)", def: 22, hint: "Sleeve widest" },
      { id: "CFL", label: "Cuff Width", def: 14, hint: "Cuff half circumference" },
      { id: "COLH", label: "Collar Height", def: 7, hint: "Collar + stand height" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 5, hint: "Coat hem" },
      { id: "EA_CW", label: "Chest Ease", def: 10, hint: "Coat wearing ease (large)" },
      { id: "EA_BCP", label: "Bicep Ease", def: 6, hint: "Ease at bicep" },
      { id: "FACING", label: "Facing Allowance", def: 6, hint: "Front facing extra" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 58, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 12, hint: "Cutting wastage" },
    ],
    formula: "(((BL+HEM+SA)+(SL+SA)) * (CW+EA_CW+SA) * 2) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Outerwear", sub: "Sweaters & Knitwear", type: "knit", unit: "KG/Dozen",
    meas: [
      { id: "BL", label: "Body Length", def: 65, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 54, hint: "Chest half" },
      { id: "SHW", label: "Shoulder Width", def: 44, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 58, hint: "Armhole to cuff" },
      { id: "BCP", label: "Bicep Width (half)", def: 22, hint: "Sleeve widest" },
      { id: "RIB_H", label: "Rib Hem Height", def: 6, hint: "Bottom rib height" },
      { id: "RIB_C", label: "Rib Cuff Height", def: 5, hint: "Cuff rib height" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "EA_CW", label: "Chest Ease", def: 6, hint: "Wearing ease" },
      { id: "EA_BCP", label: "Bicep Ease", def: 4, hint: "Ease at bicep" },
    ],
    fabric: [
      { id: "GSM", label: "GSM", def: 400, hint: "Knitwear weight g/m²" },
      { id: "FabWidth", label: "Fabric Width", def: 60, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 7, hint: "Cutting wastage" },
    ],
    formula: "((BL+SL+SA) * (CW+EA_CW+SA) * 2 * 12 * GSM) / 10000000 * (1+WA/100)",
  },
  {
    main: "Outerwear", sub: "Sweatshirts & Hoodies", type: "knit", unit: "KG/Dozen",
    meas: [
      { id: "BL", label: "Body Length", def: 68, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 56, hint: "Chest half" },
      { id: "SHW", label: "Shoulder Width", def: 46, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 58, hint: "Armhole to cuff" },
      { id: "BCP", label: "Bicep Width (half)", def: 22, hint: "Sleeve widest" },
      { id: "HOOD", label: "Hood Height", def: 32, hint: "Top of hood to neckline" },
      { id: "HOODW", label: "Hood Width (half)", def: 24, hint: "Hood half width" },
      { id: "RIB_H", label: "Rib Hem Height", def: 7, hint: "Bottom rib height" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "EA_CW", label: "Chest Ease", def: 7, hint: "Wearing ease" },
      { id: "EA_BCP", label: "Bicep Ease", def: 5, hint: "Ease at bicep" },
    ],
    fabric: [
      { id: "GSM", label: "GSM", def: 350, hint: "Fabric weight g/m²" },
      { id: "FabWidth", label: "Fabric Width", def: 60, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 8, hint: "Cutting wastage" },
    ],
    formula: "((BL+SL+SA) * (CW+EA_CW+SA) * 2 * 12 * GSM) / 10000000 * (1+WA/100)",
  },
  {
    main: "Innerwear / Sleepwear", sub: "Underwear", type: "knit", unit: "KG/Dozen",
    meas: [
      { id: "RISE_F", label: "Front Rise", def: 24, hint: "Waistband to crotch front" },
      { id: "RISE_B", label: "Back Rise", def: 34, hint: "Waistband to crotch back" },
      { id: "WW", label: "Waist Width (half)", def: 21, hint: "Waist half" },
      { id: "HW", label: "Hip Width (half)", def: 26, hint: "Hip half" },
      { id: "LEG", label: "Leg Opening (half)", def: 14, hint: "Leg hem half" },
      { id: "GUSSET", label: "Gusset Length", def: 8, hint: "Crotch gusset length" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1, hint: "All seams" },
      { id: "WB", label: "Waistband Width", def: 3, hint: "Elastic waistband height" },
      { id: "EA_HW", label: "Hip Ease", def: 2, hint: "Wearing ease" },
    ],
    fabric: [
      { id: "GSM", label: "GSM", def: 180, hint: "Fabric weight g/m²" },
      { id: "FabWidth", label: "Fabric Width", def: 60, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 5, hint: "Cutting wastage" },
    ],
    formula: "((RISE_F+RISE_B+SA) * (HW+EA_HW+SA) * 2 * 12 * GSM) / 10000000 * (1+WA/100)",
  },
  {
    main: "Innerwear / Sleepwear", sub: "Loungewear", type: "knit", unit: "KG/Dozen",
    meas: [
      { id: "BL", label: "Body Length", def: 68, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 52, hint: "Chest half" },
      { id: "SHW", label: "Shoulder Width", def: 42, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 52, hint: "Armhole to cuff" },
      { id: "BCP", label: "Bicep Width (half)", def: 20, hint: "Sleeve widest" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 2.5, hint: "Bottom hem" },
      { id: "EA_CW", label: "Chest Ease", def: 6, hint: "Wearing ease (relaxed)" },
      { id: "EA_BCP", label: "Bicep Ease", def: 4, hint: "Ease at bicep" },
    ],
    fabric: [
      { id: "GSM", label: "GSM", def: 220, hint: "Fabric weight g/m²" },
      { id: "FabWidth", label: "Fabric Width", def: 60, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 6, hint: "Cutting wastage" },
    ],
    formula: "((BL+SL+SA) * (CW+EA_CW+SA) * 2 * 12 * GSM) / 10000000 * (1+WA/100)",
  },
  {
    main: "Innerwear / Sleepwear", sub: "Thermals", type: "knit", unit: "KG/Dozen",
    meas: [
      { id: "BL", label: "Body Length", def: 68, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 50, hint: "Chest half" },
      { id: "SHW", label: "Shoulder Width", def: 42, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 58, hint: "Armhole to wrist" },
      { id: "BCP", label: "Bicep Width (half)", def: 20, hint: "Sleeve widest" },
      { id: "WR", label: "Wrist Width (half)", def: 9, hint: "Wrist half" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 2, hint: "Bottom hem" },
      { id: "EA_CW", label: "Chest Ease", def: 4, hint: "Wearing ease (fitted)" },
      { id: "EA_BCP", label: "Bicep Ease", def: 3, hint: "Ease at bicep" },
    ],
    fabric: [
      { id: "GSM", label: "GSM", def: 280, hint: "Thermal weight g/m²" },
      { id: "FabWidth", label: "Fabric Width", def: 60, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 5, hint: "Cutting wastage" },
    ],
    formula: "((BL+SL+SA) * (CW+EA_CW+SA) * 2 * 12 * GSM) / 10000000 * (1+WA/100)",
  },
  {
    main: "Activewear", sub: "Performance Wear", type: "knit", unit: "KG/Dozen",
    meas: [
      { id: "BL", label: "Body Length", def: 65, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 46, hint: "Chest half" },
      { id: "SHW", label: "Shoulder Width", def: 38, hint: "Point to point" },
      { id: "NK", label: "Neck Width (half)", def: 7, hint: "Half neck opening" },
      { id: "AH", label: "Armhole Depth", def: 21, hint: "Neck to underarm" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1, hint: "Flatlock seams" },
      { id: "HEM", label: "Hem Allowance", def: 1.5, hint: "Bottom hem" },
      { id: "EA_CW", label: "Chest Ease", def: 2, hint: "Athletic ease (minimal)" },
    ],
    fabric: [
      { id: "GSM", label: "GSM", def: 160, hint: "Performance fabric g/m²" },
      { id: "FabWidth", label: "Fabric Width", def: 60, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 6, hint: "Cutting wastage" },
    ],
    formula: "((BL+HEM+SA) * (CW+EA_CW+SA) * 2 * 12 * GSM) / 10000000 * (1+WA/100)",
  },
  {
    main: "Activewear", sub: "Sports Apparel", type: "knit", unit: "KG/Dozen",
    meas: [
      { id: "BL", label: "Body Length", def: 70, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 50, hint: "Chest half" },
      { id: "SHW", label: "Shoulder Width", def: 42, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 30, hint: "Armhole to cuff" },
      { id: "BCP", label: "Bicep Width (half)", def: 18, hint: "Sleeve widest" },
      { id: "NK", label: "Neck Width (half)", def: 7, hint: "Half neck opening" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1, hint: "Flatlock seams" },
      { id: "HEM", label: "Hem Allowance", def: 1.5, hint: "Bottom hem" },
      { id: "SLH", label: "Sleeve Hem", def: 1.5, hint: "Cuff hem" },
      { id: "EA_CW", label: "Chest Ease", def: 3, hint: "Athletic ease" },
      { id: "EA_BCP", label: "Bicep Ease", def: 2, hint: "Ease at bicep" },
    ],
    fabric: [
      { id: "GSM", label: "GSM", def: 180, hint: "Sports fabric g/m²" },
      { id: "FabWidth", label: "Fabric Width", def: 60, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 6, hint: "Cutting wastage" },
    ],
    formula: "((BL+SL+SA) * (CW+EA_CW+SA) * 2 * 12 * GSM) / 10000000 * (1+WA/100)",
  },
  {
    main: "Ethnic Wear", sub: "Men's Ethnic (Kurta)", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "BL", label: "Body Length", def: 104, hint: "HPS to hem" },
      { id: "CW", label: "Chest Width (half)", def: 54, hint: "Chest half" },
      { id: "SHW", label: "Shoulder Width", def: 44, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 56, hint: "Shoulder to cuff" },
      { id: "BCP", label: "Bicep Width (half)", def: 18, hint: "Sleeve widest" },
      { id: "NK", label: "Neck Width (half)", def: 8, hint: "Half neck opening" },
      { id: "SLIT_L", label: "Side Slit Length", def: 20, hint: "Side slit length" },
      { id: "KALI", label: "Kali Panel Width", def: 8, hint: "Extra flare panel width" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 3, hint: "Kurta hem" },
      { id: "EA_CW", label: "Chest Ease", def: 6, hint: "Wearing ease" },
      { id: "EA_BCP", label: "Bicep Ease", def: 4, hint: "Ease at bicep" },
      { id: "PLK", label: "Placket Width", def: 2.5, hint: "Front placket" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 44, hint: "Ethnic fabric width (in)" },
      { id: "WA", label: "Wastage %", def: 8, hint: "Cutting wastage" },
    ],
    formula: "(((BL+HEM+SA)+(SL+SA)) * (CW+EA_CW+SA) * 2) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Ethnic Wear", sub: "Women's Ethnic", type: "woven", unit: "Yards/Piece",
    meas: [
      { id: "BL", label: "Body Length", def: 120, hint: "HPS to hem" },
      { id: "CW", label: "Bust Width (half)", def: 46, hint: "Bust half" },
      { id: "WW", label: "Waist Width (half)", def: 37, hint: "Waist half" },
      { id: "HW", label: "Hip Width (half)", def: 50, hint: "Hip half" },
      { id: "SHW", label: "Shoulder Width", def: 36, hint: "Point to point" },
      { id: "SL", label: "Sleeve Length", def: 18, hint: "Armhole to end" },
      { id: "BCP", label: "Bicep Width (half)", def: 15, hint: "Sleeve widest" },
      { id: "YOKE", label: "Yoke Height", def: 14, hint: "Neck to yoke seam" },
      { id: "NK", label: "Neck Width (half)", def: 7, hint: "Half neck opening" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1.5, hint: "All seams" },
      { id: "HEM", label: "Hem Allowance", def: 4, hint: "Bottom hem" },
      { id: "EA_CW", label: "Bust Ease", def: 4, hint: "Wearing ease" },
      { id: "EA_BCP", label: "Bicep Ease", def: 3, hint: "Ease at bicep" },
      { id: "DART", label: "Dart Uptake", def: 2, hint: "Bust dart total" },
    ],
    fabric: [
      { id: "FabWidth", label: "Fabric Width", def: 44, hint: "Ethnic fabric width (in)" },
      { id: "WA", label: "Wastage %", def: 10, hint: "Cutting wastage" },
    ],
    formula: "(((BL+HEM+SA)+(SL+SA)) * (CW+EA_CW+SA) * 2) / (FabWidth*36) * (1+WA/100)",
  },
  {
    main: "Swimwear", sub: "Swimwear", type: "knit", unit: "KG/Dozen",
    meas: [
      { id: "BL", label: "Body Length", def: 55, hint: "Shoulder to leg opening" },
      { id: "CW", label: "Chest/Bust (half)", def: 38, hint: "Bust half" },
      { id: "HW", label: "Hip Width (half)", def: 42, hint: "Hip half" },
      { id: "WW", label: "Waist Width (half)", def: 33, hint: "Waist half" },
      { id: "LEG", label: "Leg Opening (half)", def: 22, hint: "Leg half" },
      { id: "NK", label: "Neck Width (half)", def: 6, hint: "Neck half" },
    ],
    allow: [
      { id: "SA", label: "Seam Allowance", def: 1, hint: "Flatlock/coverstitch" },
      { id: "EA_CW", label: "Bust Ease", def: 1, hint: "Minimal ease (form fit)" },
      { id: "EA_HW", label: "Hip Ease", def: 1, hint: "Minimal ease at hip" },
    ],
    fabric: [
      { id: "GSM", label: "GSM", def: 200, hint: "Swimwear fabric g/m²" },
      { id: "FabWidth", label: "Fabric Width", def: 60, hint: "Roll width in inches" },
      { id: "WA", label: "Wastage %", def: 7, hint: "Cutting wastage" },
    ],
    formula: "((BL+SA) * (CW+EA_CW+SA) * 2 * 12 * GSM) / 10000000 * (1+WA/100)",
  }
];

const SIZE_PROFILES = {
  "Upper Body Wear": [
    { s: "XS", r: 1 }, { s: "S", r: 2 }, { s: "M", r: 3 }, { s: "L", r: 3 }, { s: "XL", r: 2 }, { s: "XXL", r: 1 }
  ],
  "Lower Body Wear": [
    { s: "28", r: 1 }, { s: "30", r: 2 }, { s: "32", r: 3 }, { s: "34", r: 3 }, { s: "36", r: 2 }, { s: "38", r: 1 }
  ],
  "Full-Body / 1-Piece": [
    { s: "XS", r: 1 }, { s: "S", r: 2 }, { s: "M", r: 3 }, { s: "L", r: 3 }, { s: "XL", r: 2 }
  ],
  "Outerwear": [
    { s: "S", r: 2 }, { s: "M", r: 3 }, { s: "L", r: 3 }, { s: "XL", r: 2 }, { s: "XXL", r: 1 }
  ],
  "Innerwear / Sleepwear": [
    { s: "S", r: 2 }, { s: "M", r: 3 }, { s: "L", r: 3 }, { s: "XL", r: 2 }
  ],
  "Activewear": [
    { s: "XS", r: 1 }, { s: "S", r: 2 }, { s: "M", r: 3 }, { s: "L", r: 3 }, { s: "XL", r: 2 }
  ],
  "Ethnic Wear": [
    { s: "S", r: 2 }, { s: "M", r: 3 }, { s: "L", r: 3 }, { s: "XL", r: 2 }, { s: "XXL", r: 1 }
  ],
  "Swimwear": [
    { s: "XS", r: 1 }, { s: "S", r: 2 }, { s: "M", r: 3 }, { s: "L", r: 3 }, { s: "XL", r: 2 }
  ]
};

const AdvancedConsumptionCalculator = () => {
  const { setFabricConsumptionFromFormula, setActiveTab } = useApp();
  const { showToast } = useToast();

  // Basic States
  const [selectedMain, setSelectedMain] = useState("Upper Body Wear");
  const [selectedSub, setSelectedSub] = useState("T-Shirts");
  const [activeFormTab, setActiveFormTab] = useState("po"); // Default to Client/PO tab

  // Tree toggle states
  const [openMains, setOpenMains] = useState({ "Upper Body Wear": true });

  // Currently active garment object
  const currentG = useMemo(() => {
    return GARMENT_DB.find(g => g.main === selectedMain && g.sub === selectedSub) || GARMENT_DB[0];
  }, [selectedMain, selectedSub]);

  // Spec sheet details missing from previous versions
  const [styleName, setStyleName] = useState("ST-4402");
  const [poNumber, setPoNumber] = useState("PO-2026-X88");
  const [buyerName, setBuyerName] = useState("Nordstrom Inc.");
  const [season, setSeason] = useState("Autumn/Winter 26");
  const [merchandiserName, setMerchandiserName] = useState("Mustafa Rahman");

  // Loss & nesting parameters (Shrinkage separate, Marker Efficiency separate)
  const [shrinkageL, setShrinkageL] = useState(3.0);
  const [shrinkageW, setShrinkageW] = useState(2.0);
  const [markerEfficiency, setMarkerEfficiency] = useState(85.0);

  // Separate lining calculation configs
  const [includeLining, setIncludeLining] = useState(false);
  const [liningFabricDesc, setLiningFabricDesc] = useState("Polyester Taffeta 190T");
  const [liningScalePct, setLiningScalePct] = useState(90);

  // saved calculations local history log
  const [historyList, setHistoryList] = useState([]);

  // Form Fields State - initialized dynamically based on selected garment
  const [fieldVals, setFieldVals] = useState({});
  const [orderQty, setOrderQty] = useState(1200);
  const [priceInr, setPriceInr] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [sizeRatios, setSizeRatios] = useState({});

  // Reset/Initialize values when active garment changes
  useEffect(() => {
    const initialVals = {};
    if (currentG) {
      [...currentG.meas, ...currentG.allow, ...currentG.fabric].forEach(f => {
        initialVals[f.id] = f.def;
      });
      setFieldVals(initialVals);

      // Setup size ratio defaults
      const profile = SIZE_PROFILES[currentG.main] || [];
      const initialRatios = {};
      profile.forEach(p => {
        initialRatios[p.s] = p.r;
      });
      setSizeRatios(initialRatios);

      // Auto-toggle lining on coats / jackets / suits sets to assist merchandisers
      if (currentG.sub === "Jackets" || currentG.sub === "Coats" || currentG.sub === "Suits & Sets") {
        setIncludeLining(true);
      } else {
        setIncludeLining(false);
      }
    }
  }, [currentG]);

  // Load history list on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("garmentcalc_advanced_history");
      if (stored) {
        setHistoryList(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history list:", e);
    }
  }, []);

  const saveToHistory = () => {
    const newRecord = {
      id: "calc-" + Date.now(),
      savedAt: new Date().toISOString(),
      styleName,
      poNumber,
      buyerName,
      season,
      merchandiserName,
      selectedMain,
      selectedSub,
      fieldVals,
      orderQty,
      priceInr,
      priceUsd,
      sizeRatios,
      shrinkageL,
      shrinkageW,
      markerEfficiency,
      includeLining,
      liningFabricDesc,
      liningScalePct
    };

    const updated = [newRecord, ...historyList].slice(0, 30);
    setHistoryList(updated);
    localStorage.setItem("garmentcalc_advanced_history", JSON.stringify(updated));
    showToast(`Saved calculations sheet for ${styleName || 'unnamed'} ✓`, "success");
  };

  const loadFromHistory = (rec) => {
    if (rec.styleName !== undefined) setStyleName(rec.styleName);
    if (rec.poNumber !== undefined) setPoNumber(rec.poNumber);
    if (rec.buyerName !== undefined) setBuyerName(rec.buyerName);
    if (rec.season !== undefined) setSeason(rec.season);
    if (rec.merchandiserName !== undefined) setMerchandiserName(rec.merchandiserName);
    
    if (rec.selectedMain !== undefined) setSelectedMain(rec.selectedMain);
    if (rec.selectedSub !== undefined) setSelectedSub(rec.selectedSub);
    if (rec.fieldVals !== undefined) setFieldVals(rec.fieldVals);
    if (rec.orderQty !== undefined) setOrderQty(rec.orderQty);
    if (rec.priceInr !== undefined) setPriceInr(rec.priceInr);
    if (rec.priceUsd !== undefined) setPriceUsd(rec.priceUsd);
    if (rec.sizeRatios !== undefined) setSizeRatios(rec.sizeRatios);

    if (rec.shrinkageL !== undefined) setShrinkageL(rec.shrinkageL);
    if (rec.shrinkageW !== undefined) setShrinkageW(rec.shrinkageW);
    if (rec.markerEfficiency !== undefined) setMarkerEfficiency(rec.markerEfficiency);

    if (rec.includeLining !== undefined) setIncludeLining(rec.includeLining);
    if (rec.liningFabricDesc !== undefined) setLiningFabricDesc(rec.liningFabricDesc);
    if (rec.liningScalePct !== undefined) setLiningScalePct(rec.liningScalePct);

    // Force open toggle of trees if main group is different
    setOpenMains(prev => ({ ...prev, [rec.selectedMain]: true }));

    showToast(`Loaded ${rec.styleName || 'Unnamed Style'} configuration!`, "success");
  };

  const deleteFromHistory = (id) => {
    const filtered = historyList.filter(rec => rec.id !== id);
    setHistoryList(filtered);
    localStorage.setItem("garmentcalc_advanced_history", JSON.stringify(filtered));
    showToast("Calculation log record removed", "info");
  };

  // Sync qty logic
  const orderDoz = useMemo(() => {
    return Math.round(orderQty / 12);
  }, [orderQty]);

  // Update specific field value
  const handleValChange = (id, val) => {
    setFieldVals(prev => ({
      ...prev,
      [id]: parseFloat(val) || 0
    }));
  };

  const handleRatioChange = (size, val) => {
    setSizeRatios(prev => ({
      ...prev,
      [size]: parseFloat(val) || 0
    }));
  };

  const resetDefaults = () => {
    if (currentG) {
      const initialVals = {};
      [...currentG.meas, ...currentG.allow, ...currentG.fabric].forEach(f => {
        initialVals[f.id] = f.def;
      });
      setFieldVals(initialVals);

      const profile = SIZE_PROFILES[currentG.main] || [];
      const initialRatios = {};
      profile.forEach(p => {
        initialRatios[p.s] = p.r;
      });
      setSizeRatios(initialRatios);

      setPriceInr("");
      setPriceUsd("");
      setOrderQty(1200);

      setStyleName("ST-4402");
      setPoNumber("PO-2026-X88");
      setBuyerName("Nordstrom Inc.");
      setSeason("Autumn/Winter 26");
      setMerchandiserName("Mustafa Rahman");
      setShrinkageL(3.0);
      setShrinkageW(2.0);
      setMarkerEfficiency(85.0);
      setIncludeLining(false);
      setLiningFabricDesc("Polyester Taffeta 190T");
      setLiningScalePct(90);

      showToast("Reset to pristine industry specifications ✓", "info");
    }
  };

  // 1. BASE CAD NET CONSUMPTION (Evaluated with WA% = 0 to strip wastage for net CAD size)
  const baseCadResult = useMemo(() => {
    if (!currentG || Object.keys(fieldVals).length === 0) return 0;

    // Helper to extract default/value
    const vars = {};
    [...currentG.meas, ...currentG.allow, ...currentG.fabric].forEach(f => {
      if (f.id === 'WA') {
        vars[f.id] = 0; // Set WA to 0 and calculate pure CAD geometric footprint!
      } else {
        vars[f.id] = fieldVals[f.id] !== undefined ? fieldVals[f.id] : f.def;
      }
    });

    const completeVars = {
      BL: 0, SL: 0, CW: 0, W: 0, PL: 0, HW: 0, WW: 0, SkirtL: 0, LEG_L: 0,
      BCP: 0, SHW: 0, NK: 0, CFL: 0, CFW: 0, WR: 0, AH: 0, HOOD: 0, HOODW: 0,
      RISE_F: 0, RISE_B: 0, GUSSET: 0, THIGH: 0, KNEE: 0, ANKLE: 0, LEG: 0,
      INSEAM: 0, CD: 0, YOKE: 0, KALI: 0, SLIT_L: 0,
      RIB_H: 0, RIB_C: 0, COLH: 0, LAPW: 0, DART: 0,
      FACING: 0, WELT: 0, WaistW: 0, HipW: 0, HEM_W: 0, PLEAT: 0, ZIP: 0,
      SA: 1.5, HEM: 2, SLH: 1.5, WB: 4, PLK: 0, CR_EXT: 0,
      EA_CW: 5, EA_BCP: 3, EA_HW: 3, EA_TH: 2, EA_SL: 0,
      GSM: 180, FabWidth: 58, WA: 0,
      ...vars
    };

    const sortedKeys = Object.keys(completeVars).sort((a, b) => b.length - a.length);
    let replacedFormula = currentG.formula;

    sortedKeys.forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      replacedFormula = replacedFormula.replace(regex, completeVars[key]);
    });

    if (/^[0-9+\-*/().\s]+$/.test(replacedFormula)) {
      try {
        const value = Function(`"use strict"; return (${replacedFormula})`)();
        return isFinite(value) && value > 0 ? value : 0;
      } catch (e) {
        console.error("Evaluation error code: ", e);
        return 0;
      }
    }
    return 0;
  }, [currentG, fieldVals]);

  // Sizing adjust multipliers
  const shrinkageMultiplier = useMemo(() => {
    return (1 + (shrinkageL / 100)) * (1 + (shrinkageW / 100));
  }, [shrinkageL, shrinkageW]);

  const markerMultiplier = useMemo(() => {
    return 100 / markerEfficiency;
  }, [markerEfficiency]);

  const wastageRate = useMemo(() => {
    const waVal = fieldVals.WA !== undefined ? fieldVals.WA : (currentG.fabric.find(f => f.id === 'WA')?.def || 5);
    return waVal;
  }, [fieldVals, currentG]);

  // 2. INDUSTRIAL TARGET CONSUMPTION (Compounding net CAD with separate Shrinkage, Nesting (Marker Efficiency) % and WA % wasting)
  const calculatedResult = useMemo(() => {
    const baseWithShrinkageAndMarker = baseCadResult * shrinkageMultiplier * markerMultiplier;
    return baseWithShrinkageAndMarker * (1 + wastageRate / 100);
  }, [baseCadResult, shrinkageMultiplier, markerMultiplier, wastageRate]);

  // 3. SEPARATE LINING FABRIC CALCULATIONS (For suits, outerwear or dress linings)
  const liningConsumption = useMemo(() => {
    if (!includeLining) return 0;
    // Lining mirrors the basic CAD pattern minus some collar/cuff additions, standard ratio matches 80-100%
    return baseCadResult * (liningScalePct / 100);
  }, [includeLining, baseCadResult, liningScalePct]);

  // Aggregate Metrics
  const isKnit = currentG.type === 'knit';
  const totalForOrder = useMemo(() => {
    return isKnit ? calculatedResult * orderDoz : calculatedResult * orderQty;
  }, [calculatedResult, isKnit, orderDoz, orderQty]);

  const bufferQty = useMemo(() => {
    return totalForOrder * 1.05;
  }, [totalForOrder]);

  const liningTotalForOrder = useMemo(() => {
    return isKnit ? liningConsumption * orderDoz : liningConsumption * orderQty;
  }, [liningConsumption, isKnit, orderDoz, orderQty]);

  const liningTotalWithBuffer = useMemo(() => {
    return liningTotalForOrder * (1 + wastageRate / 100);
  }, [liningTotalForOrder, wastageRate]);

  const rawInrVal = parseFloat(priceInr) || 0;
  const rawUsdVal = parseFloat(priceUsd) || 0;

  const costInr = useMemo(() => {
    return totalForOrder * rawInrVal;
  }, [totalForOrder, rawInrVal]);

  const costUsd = useMemo(() => {
    return totalForOrder * rawUsdVal;
  }, [totalForOrder, rawUsdVal]);

  // Live validation warnings
  const liveWarnings = useMemo(() => {
    const alerts = [];
    const blVal = fieldVals.BL || fieldVals.PL || fieldVals.SkirtL || fieldVals.PL || 0;
    if (blVal === 0) {
      alerts.push("Warning: Critical pattern length is set to 0. Sizing formulas require geometric values.");
    } else if (blVal > 0 && blVal < 20) {
      alerts.push("Warning: Finished garment length represents an extremely tiny specimen (< 20cm).");
    }

    const cwVal = fieldVals.CW || fieldVals.HW || fieldVals.WW || 0;
    if (cwVal > 0 && cwVal < 15) {
      alerts.push("Warning: Horizontal width limits appear unrealistically small (< 15cm). Verify pattern boundaries.");
    }

    const rollWidth = fieldVals.FabWidth || 0;
    if (!isKnit) {
      if (rollWidth === 0) {
        alerts.push("Action Required: Roll layout width is 0. Woven consumption reports will divide-by-zero.");
      } else if (rollWidth > 0 && rollWidth < 25) {
        alerts.push("Warning: Roll width represents narrow trimmings or ribbon specs instead of standard cloth raw materials.");
      }
    }

    if (shrinkageL > 12 || shrinkageW > 12) {
      alerts.push("Nesting Audit Notice: Exceeding 12% fabric shrinkage indicates highly unstable bulk fiber construction.");
    }

    if (markerEfficiency < 65) {
      alerts.push("Nesting Alert: Marker utilization below 65% triggers high layout material wastage warnings.");
    }

    return alerts;
  }, [fieldVals, shrinkageL, shrinkageW, markerEfficiency, isKnit]);

  // Size ratio breakdown calculation
  const sizeBreakdown = useMemo(() => {
    const profile = SIZE_PROFILES[currentG.main] || [];
    let sumR = 0;
    profile.forEach(p => {
      sumR += sizeRatios[p.s] || 0;
    });

    return profile.map(p => {
      const r = sizeRatios[p.s] || 0;
      const pcs = sumR > 0 ? Math.round(orderQty * (r / sumR)) : 0;
      const tot = isKnit ? calculatedResult * (pcs / 12) : calculatedResult * pcs;
      return {
        size: p.s,
        ratio: r,
        pcs,
        tot
      };
    });
  }, [currentG, sizeRatios, orderQty, calculatedResult, isKnit]);

  const totalCalculatedPcs = useMemo(() => {
    return sizeBreakdown.reduce((sum, item) => sum + item.pcs, 0);
  }, [sizeBreakdown]);

  const totalRatios = useMemo(() => {
    return sizeBreakdown.reduce((sum, item) => sum + item.ratio, 0);
  }, [sizeBreakdown]);

  const maxIndividualSizeFabricTotal = useMemo(() => {
    const totals = sizeBreakdown.map(s => s.tot);
    return Math.max(...totals, 1);
  }, [sizeBreakdown]);

  // Export Tools
  const exportCSV = () => {
    if (!calculatedResult) {
      showToast("Calculate something first!", "warning");
      return;
    }
    const cleanSubString = currentG.sub.replace(/[\s&/]+/g, '_');
    const headerRow = ['GarmentCalc — Advanced Fabric Consumption Spec Sheet'];
    const timeRow = ['Generated At', new Date().toLocaleString()];
    const separator = [''];
    
    let csvContent = [
      headerRow.join(','),
      timeRow.join(','),
      separator.join(','),
      ['Category', currentG.main].join(','),
      ['Sub-Category', currentG.sub].join(','),
      ['Fabrication Type', isKnit ? 'Knit' : 'Woven'].join(','),
      ['Computation Unit', currentG.unit].join(','),
      separator.join(','),
      ['-- MEASUREMENT ENVELOPE --'].join(','),
      ...currentG.meas.map(f => [f.id, f.label, fieldVals[f.id] || f.def, 'cm'].join(',')),
      separator.join(','),
      ['-- ALLOWANCES & EASE --'].join(','),
      ...currentG.allow.map(f => [f.id, f.label, fieldVals[f.id] || f.def, 'cm'].join(',')),
      separator.join(','),
      ['-- FABRICS --'].join(','),
      ...currentG.fabric.map(f => {
        const u = f.id === 'WA' ? '%' : f.id === 'FabWidth' ? 'inches' : 'g/m²';
        return [f.id, f.label, fieldVals[f.id] || f.def, u].join(',');
      }),
      separator.join(','),
      ['Cons / Unit Result', calculatedResult.toFixed(4)].join(','),
      ['Order Qty Pcs', orderQty].join(','),
      ['Total Fabric Required', totalForOrder.toFixed(2)].join(','),
      ['With +5% Buffer Allowed', bufferQty.toFixed(2)].join(','),
      separator.join(','),
      ['-- SIZE-WISE RATIO ALLOCATION --'].join(','),
      ['Size', 'Ratio Weight', 'Allocated Pieces', 'Material Component Weight'].join(','),
      ...sizeBreakdown.map(s => [s.size, s.ratio, s.pcs, s.tot.toFixed(2)].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Advanced_FabCons_${cleanSubString}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Consumption CSV dispatched ✓", "success");
  };

  const copySummaryText = () => {
    if (!calculatedResult) return;
    const txt = [
      `GarmentCalc — Fabric Consumption Spec Summary`,
      `==============================================`,
      `Style / Product : ${currentG.sub} (${currentG.main})`,
      `Fabrication Type : ${isKnit ? 'Knit Yarn' : 'Woven Piece'}`,
      `Target Unit Cons : ${calculatedResult.toFixed(4)} ${currentG.unit}`,
      `Total Order      : ${orderQty.toLocaleString()} pcs (${orderDoz} Dozen)`,
      `Total Material   : ${totalForOrder.toFixed(2)} ${isKnit ? 'KG' : 'Yards'}`,
      `With +5% Buffer  : ${bufferQty.toFixed(2)} ${isKnit ? 'KG' : 'Yards'}`,
      priceInr ? `Total Est Cost (INR) : ₹${costInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '',
      priceUsd ? `Total Est Cost (USD) : $${costUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '',
      `==============================================`,
      `Allocated Size Ratios:`,
      ...sizeBreakdown.map(s => ` - Size ${s.size} : [Ratio ${s.ratio}] -> ${s.pcs} Pcs -> ${s.tot.toFixed(2)} ${isKnit ? 'KG' : 'Yds'}`)
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(txt).then(() => {
      showToast("Summary copied to clipboard ✓", "success");
    });
  };

  const exportPDF = () => {
    if (!calculatedResult) {
      showToast("Calculate something first!", "warning");
      return;
    }
    try {
      generateConsumptionPDF({
        currentG,
        calculatedResult,
        fieldVals,
        orderQty,
        orderDoz,
        priceInr,
        priceUsd,
        costInr,
        costUsd,
        sizeBreakdown,
        isKnit,
        totalForOrder,
        bufferQty,
        
        // Custom Metadata
        styleName,
        poNumber,
        buyerName,
        season,
        merchandiserName,
        
        // Custom Variables
        shrinkageL,
        shrinkageW,
        markerEfficiency,
        wastageRate,
        baseCadResult,
        
        // Linings
        includeLining,
        liningFabricDesc,
        liningScalePct,
        liningConsumption,
        liningTotalForOrder,
        liningTotalWithBuffer
      });
      showToast("Consumption PDF dispatched successfully ✓", "success");
    } catch (error) {
      console.error("PDF engine failure:", error);
      showToast("Error generating PDF, attempting browser fallback print...", "warning");
      window.print();
    }
  };

  const triggerCostingUpdate = () => {
    if (!calculatedResult || calculatedResult <= 0) {
      showToast("Cannot link invalid consumption values.", "error");
      return;
    }
    setFabricConsumptionFromFormula(parseFloat(calculatedResult.toFixed(3)));
    setActiveTab('costing');
    showToast(`Linked ${calculatedResult.toFixed(3)} ${currentG.unit === 'KG/Dozen' ? 'KG/Doz' : 'Yds/Pc'} to Active Costing worksheet!`, "success");
  };

  // Grouped Categories List
  const categoriesByGroup = useMemo(() => {
    const groups = {};
    GARMENT_DB.forEach(g => {
      if (!groups[g.main]) groups[g.main] = [];
      groups[g.main].push(g);
    });
    return groups;
  }, []);

  const toggleGroupOpen = (group) => {
    setOpenMains(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden min-h-[700px]">
      
      {/* Visual Header */}
      <div className="bg-[#1A3C5C] text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#E8622A] text-white text-[10px] uppercase font-black tracking-wider rounded-lg flex items-center gap-1.5 animate-pulse">
              <Sparkles size={11} /> Pro Merchandiser V4.0
            </span>
            <span className="px-2.5 py-0.5 border border-white/20 text-[9px] text-gray-300 font-bold uppercase rounded">Standardized CAD Modules</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight font-serif italic">Advanced Fabric Consumption Workspace</h2>
          <p className="text-xs text-gray-300 font-medium">Auto-calculates body envelopes, sewing allowances, wastage, & full purchase parameters.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-[11px] bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-gray-300 font-bold">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span>Knit (KG/Doz)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-gray-300 font-bold">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>Woven (Yds/Pc)</span>
          </div>
        </div>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        
        {/* Left column: Tree Directory [lg:col-span-3] */}
        <div className="lg:col-span-3 bg-gray-50/50 p-4 max-h-[660px] overflow-y-auto no-scrollbar">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2 mb-3">Garment Library ({GARMENT_DB.length} categories)</h3>
          
          <div className="space-y-2">
            {Object.keys(categoriesByGroup).map(groupName => {
              const isOpen = openMains[groupName];
              const items = categoriesByGroup[groupName];

              return (
                <div key={groupName} className="border border-gray-100/80 bg-white rounded-2xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => toggleGroupOpen(groupName)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                  >
                    <span className="text-xs font-black text-[#1A3C5C] uppercase tracking-wider">{groupName}</span>
                    <span className="text-gray-400">
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-gray-50 bg-gray-50/20"
                      >
                        <div className="p-1.5 space-y-0.5">
                          {items.map(item => {
                            const isCurrent = selectedMain === groupName && selectedSub === item.sub;
                            return (
                              <button
                                key={item.sub}
                                onClick={() => {
                                  setSelectedMain(groupName);
                                  setSelectedSub(item.sub);
                                }}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                  isCurrent 
                                    ? 'bg-[#E8622A]/10 text-[#E8622A] font-extrabold border-l-3 border-[#E8622A]'
                                    : 'text-gray-505 hover:bg-gray-100 hover:text-gray-900 border-l-3 border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${item.type === 'knit' ? 'bg-green-500' : 'bg-blue-400'}`} />
                                  <span className="text-xs font-bold">{item.sub}</span>
                                </div>
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                                  {item.type}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Fields Editor Tab Panel [lg:col-span-4] */}
        <div className="lg:col-span-4 p-5 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                  isKnit ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <Layers size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#1A3C5C] uppercase tracking-wider">{currentG.sub} Parameters</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Edit actual specimen metrics</p>
                </div>
              </div>
              <button 
                onClick={resetDefaults}
                className="p-1 px-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-all text-[10px] font-black uppercase border border-gray-100 tracking-wider flex items-center gap-1"
                title="Prerequisite Defaults"
              >
                <RefreshCw size={10} /> Reset
              </button>
            </div>

            {/* Form tabs */}
            <div className="grid grid-cols-5 bg-gray-100/60 p-1 rounded-2xl border border-gray-100 gap-1 select-none">
              {[
                { id: 'po', name: 'Client/PO', icon: FileText },
                { id: 'meas', name: 'Body Specs', icon: Layers },
                { id: 'allow', name: 'Allowances', icon: Scale },
                { id: 'fabric', name: 'Fibers/Nest', icon: Activity },
                { id: 'order', name: 'Order/Grades', icon: Package }
              ].map(t => {
                const IconComponent = t.icon;
                const isActive = activeFormTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveFormTab(t.id)}
                    className={`flex flex-col lg:flex-row lg:gap-2 items-center justify-center py-2 px-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-white text-[#1A3C5C] shadow-xs ring-1 ring-black/5 font-extrabold'
                        : 'text-gray-500 hover:text-[#1A3C5C] hover:bg-white/40'
                    }`}
                  >
                    <IconComponent size={12} className={isActive ? 'text-[#E8622A]' : 'text-gray-400'} />
                    <span className="truncate hidden lg:inline text-[10px] font-black uppercase tracking-wider">{t.name}</span>
                    <span className="truncate lg:hidden text-[9px] font-black uppercase tracking-wider">
                      {t.id === 'po' ? 'PO' : t.id === 'meas' ? 'Specs' : t.id === 'allow' ? 'Allow' : t.id === 'fabric' ? 'Nest' : 'Grades'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tab Panes */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
              
              {activeFormTab === 'po' && (
                <div className="space-y-3.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-dashed border-gray-100 pb-1 font-mono">Client Contract & Purchase Order Metadata</div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 bg-gray-50/50 p-2 border border-gray-100/50 rounded-xl">
                      <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide">Style Code/Ref</label>
                      <input 
                        type="text"
                        value={styleName}
                        onChange={(e) => setStyleName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-[#1A3C5C] outline-none focus:border-[#E8622A]"
                      />
                    </div>
                    <div className="space-y-1 bg-gray-50/50 p-2 border border-gray-100/50 rounded-xl">
                      <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide">PO Number</label>
                      <input 
                        type="text"
                        value={poNumber}
                        onChange={(e) => setPoNumber(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-[#1A3C5C] outline-none focus:border-[#E8622A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 bg-gray-50/50 p-2 border border-gray-100/50 rounded-xl">
                      <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide">Buyer Partner</label>
                      <input 
                        type="text"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-[#1A3C5C] outline-none focus:border-[#E8622A]"
                      />
                    </div>
                    <div className="space-y-1 bg-gray-50/50 p-2 border border-gray-100/50 rounded-xl">
                      <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide">Target Season</label>
                      <input 
                        type="text"
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-[#1A3C5C] outline-none focus:border-[#E8622A]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 bg-gray-50/50 p-2 border border-gray-100/50 rounded-xl">
                    <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide">Responsible Merchandiser</label>
                    <input 
                      type="text"
                      value={merchandiserName}
                      placeholder="Enter name to stamp signature card"
                      onChange={(e) => setMerchandiserName(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-[#1A3C5C] outline-none focus:border-[#E8622A]"
                    />
                  </div>

                  <div className="border-t border-gray-150 pt-3 space-y-2.5">
                    <button
                      onClick={saveToHistory}
                      className="w-full py-2 bg-[#1A3C5C] hover:bg-[#244b70] text-white text-[10px] font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                    >
                      <FolderOpen size={12} /> Save Specifications to Local History
                    </button>

                    {historyList.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block font-mono">Offline-First CAD Ledger ({historyList.length})</span>
                        <div className="max-h-[120px] overflow-y-auto border border-gray-150 rounded-2xl bg-white divide-y divide-gray-100 no-scrollbar pr-1 shadow-inner">
                          {historyList.map(rec => (
                            <div key={rec.id} className="flex items-center justify-between p-2.5 hover:bg-gray-50 transition-colors">
                              <button 
                                onClick={() => loadFromHistory(rec)}
                                className="flex-1 text-left cursor-pointer group"
                              >
                                <div className="text-[10px] font-black text-[#1A3C5C] group-hover:text-[#E8622A] transition-colors">
                                  {rec.styleName || "Unnamed"} · <span className="text-gray-400 italic">({rec.selectedSub})</span>
                                </div>
                                <div className="text-[8px] text-gray-400 font-bold">
                                  PO: {rec.poNumber || "N/A"} · Buyer: {rec.buyerName || "N/A"}
                                </div>
                              </button>
                              <button 
                                onClick={() => deleteFromHistory(rec.id)}
                                className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors cursor-pointer text-xs leading-none font-bold"
                                title="Delete Log Record"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeFormTab === 'meas' && (
                <div className="space-y-3.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-dashed border-gray-100 pb-1">Garment Physical Dimensions</div>
                  {currentG.meas.map(f => (
                    <div key={f.id} className="space-y-1 bg-gray-50/50 p-2 border border-gray-100/50 rounded-xl relative hover:border-gray-200 transition-all">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide flex items-center gap-1.5">
                          <span className="bg-[#E8622A]/10 text-[#E8622A] px-1 rounded text-[8px] font-black">{f.id}</span>
                          <span>{f.label}</span>
                        </label>
                        <span className="text-[9px] font-extrabold text-[#1A3C5C] uppercase">CM</span>
                      </div>
                      <input 
                        type="number"
                        value={fieldVals[f.id] !== undefined ? fieldVals[f.id] : f.def}
                        onChange={(e) => handleValChange(f.id, e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#1A3C5C] outline-none focus:border-[#E8622A]"
                      />
                      <p className="text-[9px] text-gray-400 font-medium italic">{f.hint}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeFormTab === 'allow' && (
                <div className="space-y-3.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-dashed border-gray-100 pb-1">Sewing Allowances & Tolerances</div>
                  {currentG.allow.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">No specific allowances configured for this category.</p>
                  ) : (
                    currentG.allow.map(f => (
                      <div key={f.id} className="space-y-1 bg-gray-50/50 p-2 border border-gray-100/50 rounded-xl relative hover:border-gray-200 transition-all">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide flex items-center gap-1.5">
                            <span className="bg-[#1A3C5C]/10 text-[#1A3C5C] px-1 rounded text-[8px] font-black">{f.id}</span>
                            <span>{f.label}</span>
                          </label>
                          <span className="text-[9px] font-extrabold text-gray-400 uppercase">CM</span>
                        </div>
                        <input 
                          type="number"
                          value={fieldVals[f.id] !== undefined ? fieldVals[f.id] : f.def}
                          onChange={(e) => handleValChange(f.id, e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#1A3C5C] outline-none focus:border-[#E8622A]"
                        />
                        <p className="text-[9px] text-gray-400 font-medium italic">{f.hint}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeFormTab === 'fabric' && (
                <div className="space-y-3.5">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-dashed border-gray-100 pb-1">Fabric & Splicing Nesting Parameters</div>
                  
                  {currentG.fabric.map(f => {
                    const unitLabel = f.id === 'WA' ? '%' : f.id === 'FabWidth' ? 'Inches' : 'g/m²';
                    return (
                      <div key={f.id} className="space-y-1 bg-gray-50/50 p-2 border border-gray-100/50 rounded-xl relative hover:border-gray-200 transition-all">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide flex items-center gap-1.5">
                            <span className="bg-purple-100 text-purple-700 px-1 rounded text-[8px] font-black">{f.id}</span>
                            <span>{f.label}</span>
                          </label>
                          <span className="text-[9px] font-extrabold text-gray-400 uppercase">{unitLabel}</span>
                        </div>
                        <input 
                          type="number"
                          value={fieldVals[f.id] !== undefined ? fieldVals[f.id] : f.def}
                          onChange={(e) => handleValChange(f.id, e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#1A3C5C] outline-none focus:border-[#E8622A]"
                        />
                        <p className="text-[9px] text-gray-400 font-medium italic">{f.hint}</p>
                      </div>
                    );
                  })}

                  <div className="border-t border-gray-150 pt-3 space-y-3">
                    <div className="text-[9px] font-bold text-[#1A3C5C] uppercase tracking-widest block font-mono">In-Grain Fabric Shrinkage Allowance</div>
                    
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1 bg-gray-50/50 p-2 border border-gray-100/50 rounded-xl">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-wide">Lengthwise Shrink %</label>
                        <input 
                          type="number"
                          step="0.1"
                          value={shrinkageL}
                          onChange={(e) => setShrinkageL(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-bold text-[#1A3C5C]"
                        />
                      </div>
                      <div className="space-y-1 bg-gray-50/50 p-2 border border-gray-100/50 rounded-xl">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-wide">Widthwise Shrink %</label>
                        <input 
                          type="number"
                          step="0.1"
                          value={shrinkageW}
                          onChange={(e) => setShrinkageW(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-bold text-[#1A3C5C]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 bg-gray-50/50 p-2.5 border border-gray-100 rounded-xl">
                      <div className="flex justify-between items-center text-[10px] font-black text-[#1A3C5C] uppercase">
                        <span>Marker Efficiency Layout</span>
                        <span className="text-[#E8622A]">{markerEfficiency}%</span>
                      </div>
                      <input 
                        type="range"
                        min="50"
                        max="100"
                        step="0.5"
                        value={markerEfficiency}
                        onChange={(e) => setMarkerEfficiency(parseFloat(e.target.value))}
                        className="w-full accent-[#E8622A] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                      />
                      <p className="text-[8px] text-gray-400 font-bold">Standard marker laying wraps utilize 82% to 91% of fabric roll area.</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-150 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide flex items-center gap-1.5 select-none cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={includeLining}
                          onChange={(e) => setIncludeLining(e.target.checked)}
                          className="rounded text-[#E8622A] focus:ring-[#E8622A] h-3.5 w-3.5"
                        />
                        <span>Separate Lining Calculation</span>
                      </label>
                      <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[8px] font-black rounded uppercase">Interfacing / Liners</span>
                    </div>

                    {includeLining && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-3 bg-gray-50 border border-gray-100 rounded-2xl space-y-2.5"
                      >
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider block">Lining Fabric GSM/Description</label>
                          <input 
                            type="text"
                            value={liningFabricDesc}
                            onChange={(e) => setLiningFabricDesc(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded px-2.5 py-0.5 text-xs font-black text-[#1A3C5C]"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-black text-gray-500 uppercase tracking-wider">
                            <span>Lining Pattern Scale</span>
                            <span className="font-bold text-[#1A3C5C]">{liningScalePct}% of Self</span>
                          </div>
                          <input 
                            type="range"
                            min="50"
                            max="120"
                            value={liningScalePct}
                            onChange={(e) => setLiningScalePct(parseInt(e.target.value))}
                            className="w-full accent-[#1A3C5C] h-1 bg-gray-200 rounded cursor-pointer"
                          />
                          <p className="text-[8px] text-gray-400 font-bold">Adjusts inner body consumption proportional to primary shell.</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {activeFormTab === 'order' && (
                <div className="space-y-4">
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest border-b border-dashed border-gray-100 pb-1">Commercial Bulk Allocation</div>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide">Order Qty (pcs)</label>
                      <input 
                        type="number"
                        value={orderQty}
                        onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#1A3C5C] outline-none focus:border-[#E8622A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Dozens equivalent</label>
                      <input 
                        type="text"
                        value={orderDoz}
                        disabled
                        className="w-full bg-gray-50 text-gray-400 border border-gray-150 rounded-lg px-2.5 py-1 text-xs font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide">Fabric Cost (₹/unit)</label>
                      <input 
                        type="number"
                        value={priceInr}
                        placeholder="Optional"
                        onChange={(e) => setPriceInr(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#1A3C5C] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wide">Price ($/unit)</label>
                      <input 
                        type="number"
                        value={priceUsd}
                        placeholder="Optional"
                        onChange={(e) => setPriceUsd(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#1A3C5C] outline-none"
                      />
                    </div>
                  </div>

                  {/* Size ratio entry */}
                  <div className="space-y-2 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Size Grading Ratios</span>
                    <div className="max-h-[140px] overflow-y-auto divide-y divide-gray-100 pr-1 no-scrollbar">
                      {sizeBreakdown.map(item => (
                        <div key={item.size} className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
                          <span className="text-[11px] font-black text-[#1A3C5C]">{item.size}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-gray-400 font-bold">Ratio Weight:</span>
                            <input 
                              type="number"
                              value={sizeRatios[item.size] !== undefined ? sizeRatios[item.size] : 1}
                              onChange={(e) => handleRatioChange(item.size, e.target.value)}
                              className="w-12 text-center bg-white border border-gray-200 rounded px-1 py-0.5 text-xs font-black text-[#1A3C5C]"
                            />
                            <span className="text-[10px] text-gray-500 font-semibold w-14 text-right">{item.pcs.toLocaleString()} pcs</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-400 font-bold">
                      <span>Ratios sum: {totalRatios}</span>
                      <span>Sum Allocation: {totalCalculatedPcs.toLocaleString()} Pcs</span>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Equation and execution trigger */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <div className="bg-[#1A3C5C]/5 p-3 rounded-2xl border border-[#1A3C5C]/10 text-xs">
              <span className="text-[9px] text-gray-400 font-black uppercase block mb-1">Theoretical Blueprint Equation</span>
              <p className="font-mono text-[10px] text-[#1A3C5C] font-black leading-snug break-all">{currentG.formula}</p>
            </div>
            <button 
              onClick={triggerCostingUpdate}
              className="w-full py-2.5 bg-[#E8622A] text-white hover:bg-[#d15624] text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award size={14} /> Link to Active Cost Worksheets
            </button>
          </div>

        </div>

         {/* Right column: Interactive Results & Breakdown Analysis [lg:col-span-5] */}
        <div className="lg:col-span-12 xl:col-span-5 p-6 bg-gray-50/20 flex flex-col justify-between space-y-6 max-h-[660px] overflow-y-auto no-scrollbar">
          
          {/* Main big visual cards */}
          <div className="space-y-5">
            
            <div className="flex items-center justify-between border-b border-gray-150 pb-3">
              <div>
                <h3 className="text-sm font-black text-[#1A3C5C] uppercase tracking-wider">Metrics Output</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Audited material consumption</p>
              </div>
              <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                <Activity size={12} className="text-[#E8622A] animate-pulse" /> Live active compile
              </span>
            </div>

            {/* Pattern warnings list */}
            {liveWarnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-850 uppercase tracking-widest font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  <span>CAD VERIFICATION WARNINGS ({liveWarnings.length})</span>
                </div>
                <ul className="list-disc pl-4 text-[9px] text-amber-700 font-bold space-y-1.5 leading-tight">
                  {liveWarnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Visual block cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Card 1: Per Unit Cons */}
              <div className="bg-[#1A3C5C] text-white p-4 rounded-3xl relative overflow-hidden shadow-md flex flex-col justify-between h-28">
                <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest block">{currentG.unit} Spec (Self)</div>
                <div className="text-3xl font-black font-serif italic text-white my-1">
                  {calculatedResult ? calculatedResult.toFixed(3) : "—"}
                </div>
                <div className="text-[10px] text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1 leading-none mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>per {currentG.unit === 'KG/Dozen' ? 'dozen garments' : 'style piece'}</span>
                </div>
                
                {/* Visual decoration overlay */}
                <div className="absolute right-[-10px] bottom-[-10px] text-white/5 font-black text-7xl select-none font-serif">M</div>
              </div>

              {/* Card 2: Total required material */}
              <div className="bg-white border border-[#123C5C]/10 p-4 rounded-3xl shadow-md flex flex-col justify-between h-28">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Total Fabric Needed</span>
                <div className="text-2xl font-black text-[#1A3C5C] my-1 leading-none">
                  {totalForOrder ? totalForOrder.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "—"}
                  <span className="text-xs font-black text-gray-400 uppercase ml-1">{isKnit ? 'KG' : 'Yards'}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-start gap-1 leading-none mt-1">
                  <span>Including shrinkage & marker losses</span>
                </div>
              </div>

            </div>

            {/* Separate Lining material summary if enabled */}
            {includeLining && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-purple-50/50 border border-purple-100 p-4 rounded-3xl shadow-sm flex items-center justify-between text-left"
              >
                <div>
                  <span className="px-1.5 py-0.5 bg-[#1F1D36] text-white text-[8px] font-black rounded uppercase tracking-wider">Liner Fabric Specs</span>
                  <div className="text-xs text-[#1A3C5C] font-black mt-1 max-w-[180px] truncate">{liningFabricDesc}</div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-gray-400 uppercase block">Total Liner Target</span>
                  <div className="text-lg font-black text-[#1A3C5C]">
                    {liningTotalWithBuffer ? liningTotalWithBuffer.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "—"}
                    <span className="text-[10px] text-gray-405 font-black ml-1">{isKnit ? 'KG' : 'Yards'}</span>
                  </div>
                  <span className="text-[8px] text-gray-400 block font-bold">Cons: {liningConsumption.toFixed(3)} u / Ratio: {liningScalePct}%</span>
                </div>
              </motion.div>
            )}

            {/* Splicing Nesting Loss Breakdown cascade */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-3">
              <span className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wider block border-b border-gray-50 pb-1 font-mono">CAD Nesting Cascade Loss Breakdown</span>
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="p-2 border border-gray-50 bg-gray-50/40 rounded-xl space-y-1">
                  <span className="text-[8px] text-gray-400 uppercase font-black block">1. Net CAD Envelope</span>
                  <span className="font-mono font-black text-gray-750">{baseCadResult.toFixed(3)} {currentG.unit === 'KG/Dozen' ? 'KG/Doz' : 'Yds/Pc'}</span>
                  <span className="text-[8px] text-gray-400 block font-bold">Wastage set to 0%</span>
                </div>
                <div className="p-2 border border-gray-50 bg-gray-50/40 rounded-xl space-y-1">
                  <span className="text-[8px] text-gray-400 uppercase font-black block">2. In-Grain Shrinkage</span>
                  <span className="font-mono font-black text-[#E8622A]">{((shrinkageMultiplier - 1) * 100).toFixed(1)}% (+{(baseCadResult * (shrinkageMultiplier - 1)).toFixed(3)})</span>
                  <span className="text-[8px] text-gray-400 block font-bold">L: {shrinkageL}% | W: {shrinkageW}%</span>
                </div>
                <div className="p-2 border border-gray-50 bg-gray-50/40 rounded-xl space-y-1">
                  <span className="text-[8px] text-gray-400 uppercase font-black block">3. Marker Spacing (Efficiency)</span>
                  <span className="font-mono font-black text-purple-600">{(100 - markerEfficiency).toFixed(1)}% (+{(baseCadResult * shrinkageMultiplier * (markerMultiplier - 1)).toFixed(3)})</span>
                  <span className="text-[8px] text-gray-400 block font-bold">Efficiency: {markerEfficiency}%</span>
                </div>
                <div className="p-2 border border-gray-50 bg-gray-50/40 rounded-xl space-y-1">
                  <span className="text-[8px] text-gray-400 uppercase font-black block">4. Cutting Waste Allowance</span>
                  <span className="font-mono font-black text-[#1A3C5C]">{wastageRate}% (+{(baseCadResult * shrinkageMultiplier * markerMultiplier * (wastageRate / 100)).toFixed(3)})</span>
                  <span className="text-[8px] text-gray-400 block font-bold">Cutting end bits</span>
                </div>
              </div>
            </div>

            {/* Secondary metrics row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm text-left">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">+5% Buffer</span>
                <span className="text-sm font-black text-[#1A3C5C]">{bufferQty ? bufferQty.toLocaleString('en-US', { maximumFractionDigits: 2 }) : "—"}</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">{isKnit ? 'KG' : 'Yards'} allowed</span>
              </div>

              <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm text-left">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Alternative</span>
                <span className="text-sm font-black text-[#1A3C5C]">
                  {isKnit 
                    ? (calculatedResult / 12 * 1000).toFixed(1) 
                    : (calculatedResult * 0.9144).toFixed(2)
                  }
                </span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
                  {isKnit ? 'Grams / Piece' : 'Metres / Piece'}
                </span>
              </div>

              <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm text-left col-span-2 lg:col-span-1">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Applied Wastage</span>
                <span className="text-sm font-black text-[#E8622A]">{wastageRate}%</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Allowance parameter</span>
              </div>
            </div>

            {/* Price Cards if prices entered */}
            {(priceInr || priceUsd) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded-3xl border border-gray-100/80 shadow-sm">
                {priceInr && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm">₹</div>
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Est. Invoice INR</span>
                      <span className="text-sm font-black text-gray-700">₹{costInr.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                )}
                {priceUsd && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black text-sm">$</div>
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Est. Invoice USD</span>
                      <span className="text-sm font-black text-gray-700">${costUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sizes bar graphs layout */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-3">
              <span className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wider block border-b border-gray-50 pb-1">Size-wise Fab Consumption</span>
              <div className="space-y-2.5">
                {sizeBreakdown.map(item => {
                  const barPct = maxIndividualSizeFabricTotal > 0 ? (item.tot / maxIndividualSizeFabricTotal * 100) : 0;
                  return (
                    <div key={item.size} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-[#1A3C5C] font-black">{item.size}</span>
                        <span className="text-gray-400 uppercase font-black font-mono">
                          {item.pcs.toLocaleString()} pcs · {item.tot.toFixed(1)} {isKnit ? 'kg' : 'yds'}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isKnit ? 'bg-green-500' : 'bg-blue-400'}`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Variable breakdown table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden text-xs">
              <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-[#1A3C5C] uppercase tracking-wider">All Variables Auditor</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-black rounded-full uppercase tracking-wider">Specs breakdown</span>
              </div>
              
              <div className="max-h-[140px] overflow-y-auto divide-y divide-gray-50 no-scrollbar">
                {[...currentG.meas, ...currentG.allow, ...currentG.fabric].map(v => (
                  <div key={v.id} className="px-5 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-black text-[#E8622A]">{v.id}</span>
                      <span className="text-[11px] font-bold text-gray-650 leading-none">{v.label}</span>
                    </div>
                    <span className="font-mono text-[11px] font-black text-[#1A3C5C]">
                      {(v.id === 'WA' ? wastageRate : (fieldVals[v.id] !== undefined ? fieldVals[v.id] : v.def))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Export tools */}
          <div className="pt-4 border-t border-gray-200 grid grid-cols-3 gap-3">
            <button 
              onClick={exportCSV}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 hover:border-[#1A3C5C] hover:bg-gray-50 bg-white text-[10px] text-gray-505 hover:text-[#1A3C5C] uppercase font-black tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <Download size={12} /> CSV
            </button>
            <button 
              onClick={exportPDF}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 hover:border-[#E8622A]/80 hover:bg-[#E8622A]/5 bg-white text-[10px] text-gray-505 hover:text-[#E8622A] uppercase font-black tracking-wider transition-all cursor-pointer shadow-sm"
              title="Generate printable PDF specs document"
            >
              <Printer size={12} /> Print/PDF
            </button>
            <button 
              onClick={copySummaryText}
              className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1A3C5C] text-white hover:bg-[#244b70] text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <Copy size={12} /> Copy Summary
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdvancedConsumptionCalculator;
