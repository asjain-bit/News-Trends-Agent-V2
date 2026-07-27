import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Sparkles, Check, CheckCircle2, Shrink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDummyReportSections } from '../utils/dummyReportData';

const TIMELINE_STEPS = [
  "Initializing report",
  "Understanding research scope",
  "Collecting trusted sources",
  "Validating information",
  "Analyzing market intelligence",
  "Generating insights",
  "Structuring report",
  "Performing quality checks",
  "Finalizing report"
];

const HELPER_MESSAGES = [
  "Searching verified sources...",
  "Comparing market intelligence...",
  "Reviewing recent developments...",
  "Cross-validating research...",
  "Building executive insights...",
  "Organizing report sections...",
  "Applying quality checks...",
  "Preparing your report..."
];

const REGENERATE_TIMELINE_STEPS = [
  "Initializing regeneration",
  "Analyzing comments and feedback",
  "Synthesizing new data sources",
  "Re-evaluating market intelligence",
  "Updating content sections",
  "Refining document structure",
  "Performing quality checks",
  "Finalizing regenerated report"
];

const REGENERATE_HELPER_MESSAGES = [
  "Processing user comments...",
  "Integrating new feedback...",
  "Updating analytical models...",
  "Restructuring document flow...",
  "Applying structural refinements...",
  "Reviewing quality metrics...",
  "Finalizing rendering..."
];

export default function GenerateReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { threads, updateThread } = useAppStore();
  
  const [stepIndex, setStepIndex] = useState(0);
  const [helperIndex, setHelperIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);
  
  const location = useLocation();
  const isRegenerate = location.state?.regenerate || false;
  const currentSteps = isRegenerate ? REGENERATE_TIMELINE_STEPS : TIMELINE_STEPS;
  const currentHelpers = isRegenerate ? REGENERATE_HELPER_MESSAGES : HELPER_MESSAGES;
  
  const thread = threads.find(t => t.id === id);

  // Helper text rotation
  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setHelperIndex(prev => (prev + 1) % HELPER_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isComplete]);

  // Timeline progression
  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setStepIndex(prev => {
        if (prev < currentSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1600);
    return () => clearInterval(interval);
  }, [isComplete]);

  // Percentage progression
  useEffect(() => {
    if (isComplete) {
      setProgressPct(100);
      return;
    }
    const startTime = Date.now();
    const duration = 15000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(99, Math.floor((elapsed / duration) * 100));
      setProgressPct(pct);
    }, 50);
    return () => clearInterval(interval);
  }, [isComplete]);

  // Listen for completion
  useEffect(() => {
    if (thread?.status === 'completed') {
      setIsComplete(true);
      setStepIndex(currentSteps.length - 1); // Ensure final step is reached
      
      // Wait 700ms then start exit transition
      setTimeout(() => {
        setIsExiting(true);
        
        // Wait for exit transition to finish before navigating
        setTimeout(() => {
          navigate(`/report/${id}`);
        }, 500);
      }, 700);
    }
  }, [thread?.status, id, navigate, currentSteps.length]);

  if (!thread) return null;

  return (
    <div className="fixed inset-0 overflow-visible font-sans flex items-center justify-center z-50">
      
      {/* Background Overlay (black with 60% opacity and blur) */}
      <AnimatePresence>
        {!isExiting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[5px]"
          />
        )}
      </AnimatePresence>

      {/* Centered Modal Card */}
      <AnimatePresence>
        {!isExiting && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-50 w-full max-w-[540px] bg-white rounded-[20px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.15)] flex flex-col p-10 mx-6 overflow-hidden"
          >
            <button 
              onClick={() => navigate('/')}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-[100]"
              title="Minimize to Background"
            >
              <Shrink className="w-5 h-5" />
            </button>
            
            {/* Top Brand Animation */}
            <div className="w-full h-full flex items-center justify-center mb-8 relative h-16 items-center">
              {isComplete ? (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-8 h-8 text-white" strokeWidth={3} />
                </motion.div>
              ) : (
                <div className="relative w-14 h-14 flex items-center justify-center">
                  {/* Glowing Orbiting Dots */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-[#36c0c9]/20"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#36c0c9] rounded-full shadow-[0_0_8px_rgba(54,192,201,0.8)]" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 bg-[#36c0c9]/60 rounded-full shadow-[0_0_6px_rgba(54,192,201,0.5)]" />
                  </motion.div>
                  {/* Center Pulse */}
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-8 h-8 bg-[#36c0c9]/10 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="w-4 h-4 text-[#36c0c9]" />
                  </motion.div>
                </div>
              )}
            </div>

            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-[24px] font-semibold font-['Poppins'] text-[#0D212C] mb-3 tracking-tight">
                {isComplete ? "Report ready" : (thread.versions.length > 0 ? "Regenerating your report" : "Generating your report")}
              </h1>
              <p className="text-[14px] text-gray-500 leading-relaxed px-4">
                We're researching, validating and organizing information from trusted sources.
              </p>
            </div>

            {/* Vertical Timeline */}
            <div className="flex flex-col gap-5 pl-4 mb-10 relative overflow-y-auto custom-scrollbar h-[280px] pr-2">
              {/* Timeline line connecting dots */}
              <div className="absolute left-[23px] top-3 bottom-3 w-[2px] bg-gray-100 z-0" />
              
              {currentSteps.map((step, idx) => {
                
                const isDone = isComplete || idx < stepIndex;
                const isActive = !isComplete && idx === stepIndex;
                
                return (
                  <div key={idx} className="flex items-start gap-4 relative z-10 min-h-[32px]">
                    <div className="w-4 h-4 mt-0.5 flex items-center justify-center shrink-0 relative bg-white">
                      {isDone ? (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 flex items-center justify-center text-[#36c0c9]"
                        >
                          <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                        </motion.div>
                      ) : isActive ? (
                        <>
                          <motion.div 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-[#36c0c9] rounded-full"
                          />
                          <div className="w-2 h-2 bg-[#36c0c9] rounded-full relative z-10 shadow-[0_0_5px_rgba(54,192,201,0.5)]" />
                        </>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 w-full">
                      <motion.span 
                        animate={isActive ? { opacity: [0.7, 1, 0.7] } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className={`text-[14px] font-['Poppins'] transition-colors duration-300 ${
                          isDone ? 'text-gray-700 font-medium' : isActive ? 'text-[#36c0c9] font-medium' : 'text-gray-400'
                        }`}
                      >
                        {step}
                      </motion.span>
                      
                      {/* Small loading dots for active step */}
                      {isActive && (
                        <div className="flex gap-1 ml-1 mt-0.5">
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1 h-1 bg-[#36c0c9]/60 rounded-full" />
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 bg-[#36c0c9]/60 rounded-full" />
                          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 bg-[#36c0c9]/60 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rotating Helper Text & Percentage */}
            <div className="h-6 mb-2 flex items-center justify-between w-full">
              <div className="relative flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isComplete ? "complete" : helperIndex}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex items-center text-[13px] text-gray-500 font-medium"
                  >
                    {isComplete ? "Finalizing rendering..." : currentHelpers[helperIndex % currentHelpers.length]}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="text-[14px] font-semibold text-[#0D212C] font-['Poppins']">
                {progressPct}%
              </div>
            </div>

            {/* Simulated Progress Bar */}
            <div className="w-full h-[6px] bg-gray-100 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute top-0 bottom-0 left-0 bg-[#36c0c9] rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="mt-8 flex justify-center">
              <p className="text-[12px] text-gray-400 text-center leading-relaxed">
                <span className="font-medium text-gray-500">Note:</span> You can minimize this window and continue working.<br/>We'll notify you as soon as your report is ready.
              </p>
            </div>


          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}