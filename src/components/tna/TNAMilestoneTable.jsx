import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { CheckCircle2, Circle, AlertTriangle, Clock, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

const TNAMilestoneTable = ({ milestones, onToggleComplete, onOverrideDate, onUpdateNote }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'complete-late': return (
        <div className="relative">
          <CheckCircle2 className="text-red-500" size={18} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-red-500 rounded-full" />
          </div>
        </div>
      );
      case 'overdue': return <AlertTriangle className="text-red-500" size={18} />;
      case 'at-risk': return <Clock className="text-orange-500" size={18} />;
      default: return <Circle className="text-blue-400" size={18} />;
    }
  };

  const today = new Date();

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-bottom border-gray-100">
              <th className="px-6 py-4 text-xs font-bold text-[#1A3C5C] uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-[#1A3C5C] uppercase tracking-wider">Milestone</th>
              <th className="px-6 py-4 text-xs font-bold text-[#1A3C5C] uppercase tracking-wider">Target Date</th>
              <th className="px-6 py-4 text-xs font-bold text-[#1A3C5C] uppercase tracking-wider">Remaining</th>
              <th className="px-6 py-4 text-xs font-bold text-[#1A3C5C] uppercase tracking-wider">Actual Date</th>
              <th className="px-6 py-4 text-xs font-bold text-[#1A3C5C] uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {milestones.map((m) => {
              const diff = differenceInDays(m.date, today);
              return (
                <tr key={m.id} className={`hover:bg-gray-50 transition-colors ${m.isComplete ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(m.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${m.isComplete ? 'text-gray-500' : 'text-gray-900'}`}>
                      {m.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CalendarIcon size={14} />
                      <span>{format(m.date, 'dd MMM yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {m.isComplete ? (
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        m.status === 'complete-late' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                      }`}>
                        {m.status === 'complete-late' ? 'LATE' : 'DONE'}
                      </span>
                    ) : (
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        diff < 0 ? 'text-red-600 bg-red-50' : 
                        diff <= 5 ? 'text-orange-600 bg-orange-50' : 
                        'text-blue-600 bg-blue-50'
                      }`}>
                        {diff < 0 ? `${Math.abs(diff)}d OVERDUE` : `${diff}d left`}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col min-w-[140px]">
                        <input
                          type="date"
                          value={m.actualDate || ''}
                          className={`text-xs border rounded-lg px-2 py-1.5 outline-none transition-all focus:ring-2 ${
                            m.isComplete 
                              ? (m.status === 'complete-late' ? 'border-red-300 bg-red-50 text-red-700 focus:ring-red-200' : 'border-green-300 bg-green-50 text-green-700 focus:ring-green-200')
                              : 'border-gray-200 focus:ring-[#E8622A] focus:border-transparent'
                          }`}
                          onChange={(e) => onOverrideDate(m.id, e.target.value)}
                        />
                      </div>
                      {m.isComplete && (
                        <button
                          onClick={() => onOverrideDate(m.id, '')}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Clear Actual Date"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={m.notes || ''}
                      onChange={(e) => onUpdateNote(m.id, e.target.value)}
                      placeholder="Add notes..."
                      className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 w-full outline-none focus:ring-2 focus:ring-[#E8622A] focus:border-transparent transition-all"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TNAMilestoneTable;
