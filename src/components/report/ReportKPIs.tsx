import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportKPIsProps {
  data: {
    kpis: Array<{
      label: string;
      value: string;
      trend?: 'up' | 'down';
      change?: string;
    }>;
  };
  isWordDocument?: boolean;
}

export const ReportKPIs: React.FC<ReportKPIsProps> = ({ data, isWordDocument }) => {
  if (isWordDocument) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
        {data.kpis.map((kpi, idx) => (
          <div 
            key={idx}
            className="border border-gray-300 p-4 bg-gray-50"
          >
            <div className="text-[0.75rem] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              {kpi.label}
            </div>
            <div className="text-[1.375rem] font-bold text-black mb-1">
              {kpi.value}
            </div>
            {kpi.trend && (
              <div className="text-[0.75rem] text-gray-600">
                {kpi.trend === 'up' ? 'Trend: Up' : 'Trend: Down'} ({kpi.change})
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
      {data.kpis.map((kpi, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <div className="text-[0.75rem] font-semibold text-gray-500 uppercase tracking-wider mb-2 line-clamp-2">
            {kpi.label}
          </div>
          <div className="flex items-end justify-between mt-3">
            <div className="text-[1.5rem] font-bold text-[#0D212C]">
              {kpi.value}
            </div>
            {kpi.trend && (
              <div className={`flex items-center text-[0.8125rem] font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                {kpi.change}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
