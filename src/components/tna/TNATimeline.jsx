import React from 'react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from 'date-fns';

const TNATimeline = ({ milestones }) => {
  if (!milestones || milestones.length === 0) return null;

  const getStatusColors = (m) => {
    // Special case for Order Confirmation label
    const isOrderConfirm = m.id === 'order_confirm';
    
    switch (m.status) {
      case 'complete': 
        return { dot: '#22C55E', label: '#22C55E' };
      case 'complete-late': 
        return { dot: '#EF4444', label: '#EF4444' };
      case 'overdue': 
        return { dot: '#EF4444', label: '#EF4444' };
      case 'at-risk': 
        return { dot: '#F97316', label: '#F97316' };
      default: // on-track
        return { 
          dot: '#3B82F6', 
          label: isOrderConfirm ? '#F97316' : '#374151' 
        };
    }
  };

  const today = new Date();
  const MILESTONE_WIDTH = 130;
  const totalWidth = milestones.length * MILESTONE_WIDTH;

  // Find where today falls in the sequence
  let todayIndex = -1;
  for (let i = 0; i < milestones.length - 1; i++) {
    if (today >= milestones[i].date && today <= milestones[i+1].date) {
      const segmentProgress = (today - milestones[i].date) / (milestones[i+1].date - milestones[i].date);
      todayIndex = i + segmentProgress;
      break;
    }
  }
  
  // If today is before first milestone
  if (today < milestones[0].date) todayIndex = -0.5;
  // If today is after last milestone
  if (today > milestones[milestones.length - 1].date) todayIndex = milestones.length - 0.5;

  const todayLeft = (todayIndex + 0.5) * MILESTONE_WIDTH;

  // Group milestones by month for the bands
  const monthBands = [];
  milestones.forEach((m, idx) => {
    const monthName = format(m.date, 'MMMM');
    if (monthBands.length === 0 || monthBands[monthBands.length - 1].name !== monthName) {
      monthBands.push({ name: monthName, start: idx, count: 1 });
    } else {
      monthBands[monthBands.length - 1].count++;
    }
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-bold text-[#1A3C5C] uppercase tracking-wider">Visual Timeline</h3>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">[ SCROLL HORIZONTAL TO VIEW ALL ]</span>
      </div>
      
      <div className="overflow-x-auto pb-32 pt-12 custom-scrollbar">
        <div 
          className="relative h-48" 
          style={{ minWidth: `${totalWidth + 100}px` }}
        >
          {/* Month Bands */}
          <div className="absolute top-0 left-0 right-0 flex h-8 border-b border-gray-100">
            {monthBands.map((band, idx) => (
              <div 
                key={idx}
                className="h-full border-r border-gray-100 flex items-center justify-center bg-gray-50/30"
                style={{ 
                  width: `${band.count * MILESTONE_WIDTH}px`,
                  marginLeft: idx === 0 ? `${MILESTONE_WIDTH / 2}px` : 0
                }}
              >
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {band.name}
                </span>
              </div>
            ))}
          </div>

          {/* Main Track Line */}
          <div 
            className="absolute h-1 bg-gray-200 top-24 rounded-full" 
            style={{ 
              left: `${MILESTONE_WIDTH / 2}px`, 
              right: `${MILESTONE_WIDTH / 2}px` 
            }}
          />
          
          {/* TODAY Marker */}
          <div 
            className="absolute h-32 w-0.5 bg-[#f97316] z-20 pointer-events-none top-12"
            style={{ left: `${todayLeft}px` }}
          >
            <div className="bg-[#f97316] text-white text-[9px] font-black px-2 py-0.5 rounded-full absolute -top-4 -translate-x-1/2 shadow-lg whitespace-nowrap">
              TODAY
            </div>
          </div>

          {/* Milestones */}
          <div className="absolute top-24 left-0 right-0 flex">
            {milestones.map((m, idx) => {
              const colors = getStatusColors(m);

              return (
                <div 
                  key={m.id} 
                  className="relative flex flex-col items-center"
                  style={{ width: `${MILESTONE_WIDTH}px` }}
                >
                  {/* Dot */}
                  <div 
                    className="w-5 h-5 rounded-full border-4 border-white shadow-md z-10 -translate-y-1/2 flex items-center justify-center"
                    style={{ backgroundColor: colors.dot }}
                  >
                    {(m.status === 'complete' || m.status === 'complete-late') && (
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Label (Rotated 45 degrees) */}
                  <div className="absolute top-6 left-1/2 origin-top-left rotate-45 whitespace-nowrap pl-2">
                    <p className="text-[10px] font-black uppercase tracking-tight leading-tight mb-0.5" style={{ color: colors.label }}>
                      {m.name}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400">
                      {format(m.date, 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default TNATimeline;
