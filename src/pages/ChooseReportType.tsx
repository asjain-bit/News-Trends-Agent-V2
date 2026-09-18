import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Equalizer/Bar icon matching reference image
const ReportBarsIcon = ({ className = "w-5 h-5 text-[#0D212C]" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="3.5" y="9" width="2.75" height="9" rx="1.375" />
    <rect x="9.75" y="4" width="2.75" height="15" rx="1.375" />
    <rect x="16" y="11" width="2.75" height="7" rx="1.375" />
  </svg>
);

export default function ChooseReportType() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/new/tech');
  };

  return (
    <div className="w-full px-6 lg:px-12 py-8 md:py-10 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleStart}
        className="w-full bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-slate-300/80 transition-all duration-300 ease-out cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
      >
        {/* Left Side: Icon, Title & Subtext */}
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
            <ReportBarsIcon className="w-5 h-5 text-[#0D212C]" />
          </div>
          <div className="flex flex-col gap-1.5 max-w-3xl">
            <h2 className="text-[1.125rem] font-semibold font-['Poppins'] text-[#0D212C] leading-snug">
              Health Tech Landscape Report
            </h2>
            <p className="text-[0.875rem] text-slate-500 font-normal leading-relaxed">
              Healthcare technology market analysis for a selected country, covering trends, competitors, investments, and regulations.
            </p>
          </div>
        </div>

        {/* Right Side: Start Report Button */}
        <div className="shrink-0 flex items-center self-end sm:self-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }}
            className="text-[#0E7C86] hover:text-[#08636b] font-medium text-[0.875rem] flex items-center gap-2 group-hover:gap-2.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Start Report</span>
            <ArrowRight className="w-4 h-4 text-[#0E7C86] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}