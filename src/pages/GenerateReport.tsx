import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Check, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GENERATION_STEPS = [
  "Scope confirmed",
  "Researching & verifying sources",
  "Analysing — profile, unmet needs, peer comparison",
  "Compiling suggested solutions",
  "Adding citations & confidence checks"
];

const REGENERATION_STEPS = [
  "Scope updated with comments & feedback",
  "Re-evaluating & verifying new sources",
  "Refining analysis, peer comparisons & gaps",
  "Synthesizing updated strategic solutions",
  "Applying updated citations & confidence checks"
];

export default function GenerateReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { threads, generateReportInBackground } = useAppStore();
  
  const [stepIndex, setStepIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(8);
  const [isComplete, setIsComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  const thread = threads.find(t => t.id === id);
  const isRegenerating = location.state?.regenerate || (thread?.versions && thread.versions.length > 0);
  const currentSteps = isRegenerating ? REGENERATION_STEPS : GENERATION_STEPS;

  // Safety fallback: if thread has no versions and isn't finished, trigger background generation
  useEffect(() => {
    if (thread && thread.status === 'generating' && (!thread.versions || thread.versions.length === 0)) {
      generateReportInBackground(thread.id, thread.inputs?.depth || 'Deep Dive');
    }
  }, [thread?.id, thread?.status]);

  // Smooth Percentage progression over 8 seconds
  useEffect(() => {
    if (isComplete) {
      setProgressPct(100);
      return;
    }
    const startTime = Date.now();
    const duration = 8000; // 8.0 seconds for smooth and comfortable progression
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.max(8, Math.floor(8 + (elapsed / duration) * 92)));
      setProgressPct(progress);
    }, 40);
    return () => clearInterval(interval);
  }, [isComplete]);

  // Step progression through the 5 checklist items (~1600ms per step)
  useEffect(() => {
    if (isComplete) {
      setStepIndex(currentSteps.length - 1);
      return;
    }
    const interval = setInterval(() => {
      setStepIndex(prev => {
        if (prev < currentSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1600);
    return () => clearInterval(interval);
  }, [isComplete, currentSteps.length]);

  // Listen for background generation completion or when 100% is reached
  useEffect(() => {
    if (thread?.status === 'completed') {
      setIsComplete(true);
      setProgressPct(100);
      setStepIndex(GENERATION_STEPS.length - 1);
      
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          navigate(`/report/${id}`);
        }, 350);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [thread?.status, id, navigate]);

  if (!thread) return null;

  // Title formatting matching: "UAE — AI in Healthcare & RPM · Deep Dive"
  const countryName = thread.inputs?.country || 'Global';
  const domainName = thread.inputs?.techDomain || 'Tech Landscape';
  const depthName = thread.inputs?.depth || 'Deep Dive';
  const displayTitle = `${countryName} — ${domainName} · ${depthName}`;

  // Circular progress SVG values
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-[#F6F7FB] flex flex-col items-center justify-center p-6 z-50 font-sans select-none overflow-y-auto">
      
      {/* Top right minimize button with 2 arrows icon */}
      <div className="fixed top-5 right-6 z-50">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-gray-200 hover:border-gray-300 rounded-xl text-slate-700 hover:text-slate-900 text-[0.8125rem] font-medium shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <Minimize2 className="w-3.5 h-3.5 text-gray-500 group-hover:text-slate-700" />
          <span>Minimize</span>
        </button>
      </div>

      <AnimatePresence>
        {!isExiting && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full max-w-[560px] flex flex-col items-center"
          >
            
            {/* Top Circular Progress Indicator (Matches Attached Design) */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-6">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 110 110">
                {/* Background Ring */}
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  stroke="#E8EDF2"
                  strokeWidth="7"
                  fill="transparent"
                />
                {/* Active Animated Progress Ring */}
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  stroke="#2EAFB8"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              
              {/* Percentage Text in Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[1.375rem] font-bold font-['Poppins'] text-[#0D212C] tracking-tight">
                  {progressPct}%
                </span>
              </div>
            </div>

            {/* Header Text */}
            <div className="text-center mb-7 px-4">
              <div className="text-[0.6875rem] font-bold text-[#0E7C86] tracking-widest uppercase mb-1.5">
                {isRegenerating ? 'REGENERATING REPORT' : 'GENERATING'}
              </div>
              <h1 className="text-[1.25rem] font-semibold font-['Poppins'] text-[#0D212C] tracking-tight">
                {displayTitle}
              </h1>
            </div>

            {/* Checklist Card (Matches Attached Design) */}
            <div className="w-full bg-white rounded-2xl shadow-[0_4px_30px_-6px_rgba(0,0,0,0.06)] border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {currentSteps.map((step, idx) => {
                const isDone = isComplete || idx < stepIndex;
                const isActive = !isComplete && idx === stepIndex;
                const isPending = !isComplete && idx > stepIndex;

                return (
                  <div 
                    key={idx} 
                    className="flex items-center gap-3.5 px-6 py-4.5 transition-colors duration-200"
                  >
                    {/* Status Icon */}
                    {isDone && (
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-5 h-5 rounded-full bg-[#18919b] text-white flex items-center justify-center shrink-0 shadow-xs"
                      >
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </motion.div>
                    )}

                    {isActive && (
                      <div className="w-5 h-5 rounded-full border-2 border-[#2EAFB8] flex items-center justify-center shrink-0 relative bg-white">
                        <motion.div 
                          animate={{ scale: [0.85, 1.15, 0.85] }}
                          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                          className="w-2.5 h-2.5 rounded-full bg-[#2EAFB8]"
                        />
                      </div>
                    )}

                    {isPending && (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0 bg-white" />
                    )}

                    {/* Step Label */}
                    <span 
                      className={`text-[0.875rem] transition-colors duration-200 ${
                        isDone 
                          ? 'text-slate-700 font-normal' 
                          : isActive 
                          ? 'text-[#0E7C86] font-medium' 
                          : 'text-gray-400 font-normal'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Notification text placed at the bottom */}
            <p className="text-[0.8125rem] text-gray-500 font-normal mt-6 text-center">
              You can minimize this page and you will be notified once the report is generated.
            </p>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}