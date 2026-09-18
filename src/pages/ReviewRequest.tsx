import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { ReportInputs } from '../services/storageService';
import { FileSearch, Clock, Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

export default function ReviewRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addThread, generateReportInBackground } = useAppStore();
  
  const inputs = location.state?.inputs as ReportInputs;
  
  if (!inputs) {
    navigate('/new/tech');
    return null;
  }

  const handleGenerate = async () => {
    // Create the thread and save it
    const threadId = uuidv4();
    await addThread({
      id: threadId,
      title: `${inputs.depth} Health Tech Landscape Report: ${inputs.country} - ${inputs.techDomain}`,
      typeId: 'techLandscape',
      inputs,
      versions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'generating'
    });
    
    generateReportInBackground(threadId, inputs.depth || 'Deep Dive');
    navigate(`/report/${threadId}/generating`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to inputs
      </button>

      <div className="mb-8 text-center">
        <h1 className="text-[1.375rem] font-semibold font-['Poppins'] text-[var(--color-ink)] mb-1.5">Review & Confirm</h1>
        <p className="text-[0.875rem] text-[var(--color-ink-muted)]">Please review the scope before we begin generating your report.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--color-border)]">
            <div className="w-10 h-10 bg-[var(--color-primary-soft)] text-[var(--color-primary)] rounded-xl flex items-center justify-center">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[1.125rem] font-semibold font-['Poppins'] text-[var(--color-ink)]">Health Tech Landscape Report</h2>
              <p className="text-[var(--color-ink-muted)] text-[0.8125rem]">Health Tech Landscape Report analysis</p>
            </div>
          </div>

          <div className="space-y-6 mb-8">
             <div>
                <span className="block text-[0.75rem] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Scope</span>
                <p className="text-[1rem] text-[var(--color-ink)] font-medium">
                  {inputs.country} <span className="text-[var(--color-border)] mx-2">•</span> {inputs.techDomain}
                  <span className="text-[var(--color-border)] mx-2">•</span> Focus: {inputs.focusLens || 'None'}
                </p>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                  <span className="block text-[0.75rem] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Depth</span>
                  <p className="text-[0.875rem] text-[var(--color-ink)]">{inputs.depth}</p>
               </div>
               <div>
                  <span className="block text-[0.75rem] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Estimated Time</span>
                  <p className="text-[0.875rem] text-[var(--color-ink)] flex items-center gap-1.5"><Clock className="w-4 h-4 text-[var(--color-accent)]" /> ~2 min</p>
               </div>
             </div>

             <div>
                <span className="block text-[0.75rem] font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider mb-1">Prompt Details (Optional)</span>
                {inputs.prompt ? (
                  <p className="text-[var(--color-ink)] italic bg-[var(--color-canvas)] p-3 rounded-lg text-[0.8125rem] border border-[var(--color-border)]">
                    "{inputs.prompt}"
                  </p>
                ) : (
                  <p className="text-[var(--color-ink-muted)] italic text-[0.8125rem]">
                    No additional prompt provided.
                  </p>
                )}
             </div>
          </div>
        </div>

        <div className="bg-[var(--color-canvas)] p-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-[0.8125rem] text-[var(--color-ink-muted)]">
            <Zap className="w-4 h-4 text-amber-500" />
            Uses 1 intelligence credit
          </div>
          <button
            onClick={handleGenerate}
            className="w-full sm:w-auto bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-strong)] transition-colors duration-200 rounded-lg px-6 py-2.5 text-[0.875rem] font-medium flex items-center justify-center gap-2 shadow-sm"
          >
            Confirm & generate <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}