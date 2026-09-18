import React from 'react';
import { AuthLayoutProps } from './AuthLayout.types';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Sparkles, FileText } from 'lucide-react';

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-default)]">
      {/* Left Side - Information Panel */}
      <div className="flex-1 bg-gradient-to-br from-[#f0f7f9] to-[#e0f0f5] p-8 md:p-16 flex flex-col justify-center border-r border-[var(--border-subtle)]">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-xl mx-auto md:mx-0"
        >
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo-dark.png" alt="M42 Logo" className="h-8 object-contain" />
            <span className="font-semibold text-[1.25rem] font-['Poppins'] text-[var(--text-primary)] tracking-tight">News & Trends Intelligence Agent</span>
          </div>

          <div className="space-y-4">
            <Feature icon={<Sparkles className="w-5 h-5 text-[var(--text-accent)]" />} title="AI-Powered Research" />
            <Feature icon={<FileText className="w-5 h-5 text-[var(--text-accent)]" />} title="Trusted Citations" />
            <Feature icon={<CheckCircle2 className="w-5 h-5 text-[var(--text-accent)]" />} title="Quality & Governance" />
            <Feature icon={<ShieldCheck className="w-5 h-5 text-[var(--text-accent)]" />} title="Enterprise Security" />
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Panel */}
      <div className="flex-1 bg-[var(--bg-surface-1)] p-8 md:p-16 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md bg-[var(--bg-surface-1)] rounded-2xl shadow-sm border border-[var(--border-subtle)] p-8 sm:p-12 text-center"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

const Feature = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
      {icon}
    </div>
    <h3 className="font-medium text-[var(--text-primary)] font-['Poppins'] text-[0.9375rem]">{title}</h3>
  </div>
);