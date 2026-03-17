import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CostPieChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Sort data alphabetically by name to match the image legend
  const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className="w-full flex flex-col items-center">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={450}
            >
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend to match the image exactly */}
      <div className="mt-4 w-full px-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {sortedData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: item.color }}
              />
              <span 
                className="text-[11px] font-bold" 
                style={{ color: item.color }}
              >
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CostPieChart;
