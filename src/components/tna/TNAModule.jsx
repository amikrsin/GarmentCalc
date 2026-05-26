import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TNAInputs from './TNAInputs';
import TNATimeline from './TNATimeline';
import TNAMilestoneTable from './TNAMilestoneTable';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { generateMilestones, getMilestoneStatus } from '../../utils/tnaCalculations';
import { generateTNAPDF } from './TNAPDF';
import { Download, RotateCcw, AlertCircle, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { addDays, format } from 'date-fns';
import { saveToStorage, removeFromStorage } from '../../utils/storage';

import { useOrders } from '../../context/OrdersContext';

const TNAModule = ({ restoreData, onRestored, isOrderContext = false, orderId = null }) => {
  const { triggerSaveIndicator, preferences } = useApp();
  const { showToast } = useToast();
  const { orders, updateOrder } = useOrders();

  const order = useMemo(() => isOrderContext ? orders.find(o => o.id === orderId) : null, [orders, orderId, isOrderContext]);

  const getInitialState = useCallback(() => ({
    styleName: order?.styleName || '',
    quantity: order?.orderQty || 1000,
    destination: order?.destinationCountry || '',
    shipmentMode: order?.shipmentMode || 'Sea FCL',
    shipDate: order?.shipDate || format(addDays(new Date(), 90), 'yyyy-MM-dd'),
    productionLeadDays: preferences.defaultProductionLeadDays || 45,
    fabricLeadDays: preferences.defaultFabricLeadDays || 30,
    skipWeekends: preferences.skipWeekends ?? true,
    includeSizeSet: true,
    includePPM: true,
    includeInline: true,
    includeTOP: true,
  }), [preferences, order]);

  const [data, setData] = useState(getInitialState);
  const [milestones, setMilestones] = useState([]);

  // Handle restoration from saved state
  useEffect(() => {
    if (restoreData) {
      setData(restoreData.data);
      setMilestones(restoreData.milestones);
      onRestored();
    }
  }, [restoreData, onRestored]);

  // Auto-save on every state change
  useEffect(() => {
    const stateToSave = { data, milestones, lastSavedAt: new Date().toISOString() };
    if (isOrderContext && orderId) {
      updateOrder(orderId, { tnaState: stateToSave });
    } else {
      saveToStorage('garmentcalc_current_tna', stateToSave);
    }
    triggerSaveIndicator();
  }, [data, milestones, triggerSaveIndicator, isOrderContext, orderId]);

  const handleSaveNamed = () => {
    if (isOrderContext) {
      showToast('TNA auto-saved to order ✓', 'success');
      return;
    }
    const name = window.prompt('Save this TNA\nName:', data.styleName || 'Untitled TNA');
    if (name !== null) {
      // ... existing save logic ...
    }
  };

  const handleUpdateResponsibleParty = (id, party) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, responsibleParty: party } : m));
  };

  // Generate milestones when inputs change
  useEffect(() => {
    if (data.shipDate) {
      const generated = generateMilestones(
        data.shipDate,
        data.productionLeadDays,
        data.fabricLeadDays,
        data.shipmentMode,
        data.quantity,
        data.skipWeekends,
        {
          includeSizeSet: data.includeSizeSet,
          includePPM: data.includePPM,
          includeInline: data.includeInline,
          includeTOP: data.includeTOP,
        }
      );
      
      // Update status for each
      const updated = generated.map(m => ({
        ...m,
        status: getMilestoneStatus(m),
        notes: ''
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setMilestones(updated);
    }
  }, [
    data.shipDate, 
    data.productionLeadDays, 
    data.fabricLeadDays, 
    data.shipmentMode, 
    data.quantity, 
    data.skipWeekends,
    data.includeSizeSet,
    data.includePPM,
    data.includeInline,
    data.includeTOP
  ]);

  const summary = useMemo(() => {
    return {
      total: milestones.length,
      complete: milestones.filter(m => m.isComplete).length,
      overdue: milestones.filter(m => m.status === 'overdue').length,
      atRisk: milestones.filter(m => m.status === 'at-risk').length,
      onTrack: milestones.filter(m => m.status === 'on-track').length,
    };
  }, [milestones]);

  const handleToggleComplete = (id) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        const isNowComplete = !m.isComplete;
        const actualDate = isNowComplete ? format(new Date(), 'yyyy-MM-dd') : undefined;
        return { 
          ...m, 
          isComplete: isNowComplete, 
          actualDate,
          status: getMilestoneStatus({ ...m, isComplete: isNowComplete, actualDate }) 
        };
      }
      return m;
    }));
  };

  const handleOverrideDate = (id, actualDateStr) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        const isComplete = !!actualDateStr;
        return { 
          ...m, 
          actualDate: actualDateStr || undefined,
          isComplete,
          status: getMilestoneStatus({ ...m, isComplete, actualDate: actualDateStr })
        };
      }
      return m;
    }));
  };

  const handleUpdateNote = (id, note) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, notes: note };
      }
      return m;
    }));
  };

  const handleExport = () => {
    generateTNAPDF(data, milestones, summary);
  };

  const handleReset = () => {
    if (window.confirm('Start a new TNA calendar?\nCurrent data will be cleared.\nYour saved calendars are not affected.')) {
      setData(getInitialState());
      removeFromStorage('garmentcalc_current_tna');
      showToast('TNA reset', 'info');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-7xl mx-auto px-4 py-8 space-y-8"
    >
      <TNAInputs data={data} setData={setData} />

      {/* Summary Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
          <span className="text-xs font-bold text-gray-400 uppercase">On Track</span>
          <span className="text-2xl font-bold text-blue-500">{summary.onTrack}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
          <span className="text-xs font-bold text-gray-400 uppercase">At Risk</span>
          <span className="text-2xl font-bold text-orange-500">{summary.atRisk}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
          <span className="text-xs font-bold text-gray-400 uppercase">Overdue</span>
          <span className="text-2xl font-bold text-red-500">{summary.overdue}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
          <span className="text-xs font-bold text-gray-400 uppercase">Complete</span>
          <span className="text-2xl font-bold text-green-500">{summary.complete}</span>
        </div>
      </div>

      <TNATimeline milestones={milestones} />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#1A3C5C] uppercase tracking-wider">Milestone Details</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleSaveNamed}
              className="flex items-center space-x-2 bg-white border-2 border-[#1A3C5C] text-[#1A3C5C] hover:bg-gray-50 px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-95"
            >
              <Save size={16} />
              <span>Save TNA</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-[#E8622A] hover:bg-[#d15624] text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md active:scale-95"
            >
              <Download size={16} />
              <span>Export PDF</span>
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-all active:scale-95"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
        
        <TNAMilestoneTable 
          milestones={milestones} 
          onToggleComplete={handleToggleComplete}
          onOverrideDate={handleOverrideDate}
          onUpdateNote={handleUpdateNote}
          onUpdateResponsibleParty={handleUpdateResponsibleParty}
        />
      </div>

      <div className="flex items-center space-x-2 p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs">
        <AlertCircle size={16} />
        <span>Note: Overriding a date will automatically shift all subsequent milestones to maintain the lead time logic.</span>
      </div>
    </motion.div>
  );
};

export default TNAModule;
