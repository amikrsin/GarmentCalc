import { addDays, subDays, format, isBefore, startOfToday, isWeekend, parseISO } from 'date-fns';

/**
 * TNA Milestone generation logic
 */

const INDIAN_HOLIDAYS_2026 = [
  '2026-01-26', // Republic Day
  '2026-03-25', // Holi
  '2026-04-10', // Good Friday
  '2026-08-15', // Independence Day
  '2026-10-02', // Gandhi Jayanti
  '2026-10-21', // Dussehra
  '2026-11-08', // Diwali
  '2026-12-25', // Christmas
];

const isHoliday = (date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return INDIAN_HOLIDAYS_2026.includes(dateStr);
};

// Helper to add/sub working days (skipping weekends and optional holidays)
const addWorkingDays = (date, days, skipWeekends = false) => {
  let result = new Date(date);
  if (!skipWeekends) return addDays(result, days);
  
  let added = 0;
  const direction = days > 0 ? 1 : -1;
  const absDays = Math.abs(days);

  while (added < absDays) {
    result = addDays(result, direction);
    if (!isWeekend(result) && !isHoliday(result)) {
      added++;
    }
  }
  return result;
};

const subWorkingDays = (date, days, skipWeekends = false) => {
  return addWorkingDays(date, -days, skipWeekends);
};

export const MILESTONES_CONFIG = [
  { id: 'order_confirm', name: 'Order Confirmation' },
  { id: 'fabric_order', name: 'Fabric Order Placed' },
  { id: 'fit_dispatch', name: 'Fit Sample Dispatch' },
  { id: 'fit_approval', name: 'Fit Sample Approval' },
  { id: 'pp_submit', name: 'PP Sample Submission' },
  { id: 'pp_approval', name: 'PP Sample Approval' },
  { id: 'fabric_inhouse', name: 'Fabric In-House' },
  { id: 'bulk_start', name: 'Bulk Production Start' },
  { id: 'bulk_cut', name: 'Bulk Cutting Start' },
  { id: 'bulk_sew_complete', name: 'Bulk Sewing Complete' },
  { id: 'finish_complete', name: 'Finishing Complete' },
  { id: 'final_inspect', name: 'Final Inspection' },
  { id: 'pack_complete', name: 'Packing Complete' },
  { id: 'vessel_cutoff', name: 'Vessel Cut-off' },
  { id: 'ship', name: 'Final Ship Date' },
];

export const generateMilestones = (shipDate, prodLead, fabricLead, mode, quantity = 1000, skipWeekends = false, options = {}) => {
  if (!shipDate) return [];

  const {
    includeSizeSet = true,
    includePPM = true,
    includeInline = true,
    includeTOP = true
  } = options;

  const milestones = [];
  const today = startOfToday();

  // Helper to decide whether to skip weekends/holidays based on milestone type
  const addDaysAuto = (date, days, shouldSkip) => {
    return addWorkingDays(date, days, shouldSkip && skipWeekends);
  };

  // 1. Order Confirmation (Today + 1) - No skip
  const orderConfirm = addDays(today, 1);
  milestones.push({ id: 'order_confirm', name: 'Order Confirmation', date: orderConfirm, isComplete: false, status: 'on-track' });

  // 2. Fabric Order Placed (+3 days from Order Confirmation) - No skip
  const fabricOrder = addDays(orderConfirm, 3);
  milestones.push({ id: 'fabric_order', name: 'Fabric Order Placed', date: fabricOrder, isComplete: false, status: 'on-track' });

  // 3. Lab Dip / Fabric Approval (+10 days from Fabric Order) - No skip
  const labDip = addDays(fabricOrder, 10);
  milestones.push({ id: 'lab_dip', name: 'Lab Dip / Fabric Approval', date: labDip, isComplete: false, status: 'on-track' });

  // 4. Fit Sample Dispatch (+5 days from Lab Dip) - No skip
  const fitDispatch = addDays(labDip, 5);
  milestones.push({ id: 'fit_dispatch', name: 'Fit Sample Dispatch', date: fitDispatch, isComplete: false, status: 'on-track' });

  // 5. Fit Sample Approval (+7 days from Fit Dispatch) - No skip
  const fitApproval = addDays(fitDispatch, 7);
  milestones.push({ id: 'fit_approval', name: 'Fit Sample Approval', date: fitApproval, isComplete: false, status: 'on-track' });

  let lastSampleApproval = fitApproval;

  // 6 & 7. Size Set Sample (Optional) - No skip
  if (includeSizeSet) {
    const sizeSetDispatch = addDays(fitApproval, 7);
    milestones.push({ id: 'size_set_dispatch', name: 'Size Set Sample Dispatch', date: sizeSetDispatch, isComplete: false, status: 'on-track' });

    const sizeSetApproval = addDays(sizeSetDispatch, 7);
    milestones.push({ id: 'size_set_approval', name: 'Size Set Approval', date: sizeSetApproval, isComplete: false, status: 'on-track' });
    
    lastSampleApproval = sizeSetApproval;
  }

  // 8. PP Sample Submission (+5 days from last approval) - No skip
  const ppSubmit = addDays(lastSampleApproval, 5);
  milestones.push({ id: 'pp_submit', name: 'PP Sample Submission', date: ppSubmit, isComplete: false, status: 'on-track' });

  // 9. PP Sample Approval (+7 days from PP Submission) - No skip
  const ppApproval = addDays(ppSubmit, 7);
  milestones.push({ id: 'pp_approval', name: 'PP Sample Approval', date: ppApproval, isComplete: false, status: 'on-track' });

  let productionTrigger = ppApproval;

  // 10. PPM (Optional) - No skip
  if (includePPM) {
    const ppm = addDays(ppApproval, 2);
    milestones.push({ id: 'ppm', name: 'Pre-Production Meeting (PPM)', date: ppm, isComplete: false, status: 'on-track' });
    productionTrigger = ppm;
  }

  // 11. Fabric In-House (Independent: Fabric Order + Lead Time) - No skip
  const fabricInHouse = addDays(fabricOrder, fabricLead);
  milestones.push({ id: 'fabric_inhouse', name: 'Fabric In-House', date: fabricInHouse, isComplete: false, status: 'on-track' });

  // 12. Bulk Production Start (Fabric In-House + 2 working days) - SKIP WEEKENDS
  const bulkStart = addWorkingDays(fabricInHouse, 2, skipWeekends);
  milestones.push({ id: 'bulk_start', name: 'Bulk Production Start', date: bulkStart, isComplete: false, status: 'on-track' });

  // 13. Bulk Cutting Start (+2 working days from Bulk Start) - SKIP WEEKENDS
  const bulkCut = addWorkingDays(bulkStart, 2, skipWeekends);
  milestones.push({ id: 'bulk_cut', name: 'Bulk Cutting Start', date: bulkCut, isComplete: false, status: 'on-track' });

  let lastProductionStep = bulkCut;

  // 14. Inline Inspection (Optional) - SKIP WEEKENDS
  if (includeInline) {
    const inline = addWorkingDays(bulkCut, 10, skipWeekends);
    milestones.push({ id: 'inline_inspect', name: 'Inline Inspection', date: inline, isComplete: false, status: 'on-track' });
    lastProductionStep = inline;
  }

  // 15. Bulk Sewing Complete (+20 working days from Bulk Cutting Start) - SKIP WEEKENDS
  const sewComplete = addWorkingDays(bulkCut, 20, skipWeekends);
  milestones.push({ id: 'bulk_sew_complete', name: 'Bulk Sewing Complete', date: sewComplete, isComplete: false, status: 'on-track' });

  // 16. AQL Final Inspection (+2 working days from Sewing Complete) - SKIP WEEKENDS
  const aql = addWorkingDays(sewComplete, 2, skipWeekends);
  milestones.push({ id: 'aql_inspect', name: 'AQL Final Inspection', date: aql, isComplete: false, status: 'on-track' });

  // 17. Finishing Complete (+3 working days from AQL) - SKIP WEEKENDS
  const finishing = addWorkingDays(aql, 3, skipWeekends);
  milestones.push({ id: 'finish_complete', name: 'Finishing Complete', date: finishing, isComplete: false, status: 'on-track' });

  let lastFinishingStep = finishing;

  // 18. TOP Sample (Optional) - No skip
  if (includeTOP) {
    const top = addDays(finishing, 1);
    milestones.push({ id: 'top_sample', name: 'Shipment Sample / TOP', date: top, isComplete: false, status: 'on-track' });
    lastFinishingStep = top;
  }

  // 19. Packing Complete (+2 working days from last step) - SKIP WEEKENDS
  const packing = addWorkingDays(lastFinishingStep, 2, skipWeekends);
  milestones.push({ id: 'pack_complete', name: 'Packing Complete', date: packing, isComplete: false, status: 'on-track' });

  // 20. Custom Duty / Documentation (+1 day from Packing) - No skip
  const customDuty = addDays(packing, 1);
  milestones.push({ id: 'custom_duty', name: 'Custom Duty / Documentation', date: customDuty, isComplete: false, status: 'on-track' });

  // 21. Vessel Cut-off (Ship Date - mode days) - No skip
  const ship = new Date(shipDate);
  let vesselDays = 4;
  if (mode === 'Sea FCL') vesselDays = 4;
  else if (mode === 'Sea LCL') vesselDays = 5;
  else if (mode === 'Air Freight' || mode === 'Air') vesselDays = 1;

  const vesselCutoff = subDays(ship, vesselDays);
  milestones.push({ 
    id: 'vessel_cutoff', 
    name: (mode === 'Air Freight' || mode === 'Air') ? 'Flight Cut-off' : 'Vessel Cut-off', 
    date: vesselCutoff, 
    isComplete: false, 
    status: 'on-track' 
  });

  // 22. Final Ship Date (Anchor) - No skip
  milestones.push({ id: 'ship', name: 'Final Ship Date', date: ship, isComplete: false, status: 'on-track' });

  // Bug 3: Sort by date ascending
  return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const getMilestoneStatus = (milestone, today = startOfToday()) => {
  if (milestone.actualDate) {
    const actual = new Date(milestone.actualDate);
    const target = new Date(milestone.date);
    if (actual <= target) return 'complete'; // green
    return 'complete-late'; // completed but delayed (red circle with tick)
  }
  
  const target = new Date(milestone.date);
  if (isBefore(target, today)) return 'overdue'; // red
  
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  if (diffDays <= 5) return 'at-risk'; // orange
  
  return 'on-track'; // blue
};
