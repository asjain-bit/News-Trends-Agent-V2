import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink } from 'lucide-react';

// ==========================================
// 1. Data Definitions Matching Images & Apps
// ==========================================

export const EXPECTED_REVENUE_BREAKDOWN = [
  { id: 's2', name: 'Hospital Ops & Clinical Workflow', revenue: '$27.0M' },
  { id: 's4', name: 'Remote Patient Monitoring', revenue: '$25.0M' },
  { id: 's8', name: 'Population Health & Analytics', revenue: '$25.0M' },
  { id: 's1', name: 'EMR & Interoperability', revenue: '$24.0M' },
  { id: 's5', name: 'InsurTech & Reimbursement', revenue: '$21.0M' },
  { id: 's6', name: 'Drug Discovery', revenue: '$19.0M' },
  { id: 's3', name: 'Home & Community Care', revenue: '$17.0M' },
  { id: 's7', name: 'Pharmacy & Medication', revenue: '$11.0M' },
];

export const SOLUTION_BUILD_EFFORT_MAP: Record<string, {
  totalEffort: string;
  components: Array<{ name: string; effort: string }>;
}> = {
  'Population Health & Analytics': {
    totalEffort: '~78 pd',
    components: [
      { name: 'Patient Profile', effort: '~12 pd' },
      { name: 'Analytics & Dashboards', effort: '~20 pd' },
      { name: 'AI Chatbot · CRAG', effort: '~26 pd' },
      { name: 'Consent & Purpose Filter', effort: '~20 pd' },
    ]
  },
  'InsurTech & Reimbursement': {
    totalEffort: '~77 pd',
    components: [
      { name: 'Payment Module', effort: '~15 pd' },
      { name: 'AI Chatbot · CRAG', effort: '~22 pd' },
      { name: 'Fraud-Claim Detection', effort: '~30 pd' },
      { name: 'Notification Service', effort: '~10 pd' },
    ]
  },
  'Remote Patient Monitoring': {
    totalEffort: '~77 pd',
    components: [
      { name: 'Device Telemetry Hub', effort: '~26 pd' },
      { name: 'AI Chatbot · CRAG', effort: '~25 pd' },
      { name: 'Patient Profile', effort: '~12 pd' },
      { name: 'Notification Service', effort: '~14 pd' },
    ]
  },
  'Hospital Ops & Clinical Workflow': {
    totalEffort: '~167 pd',
    components: [
      { name: 'Appointment Booking', effort: '~18 pd' },
      { name: 'FHIR Integration Gateway', effort: '~35 pd' },
      { name: 'AI Chatbot · CRAG', effort: '~50 pd' },
      { name: 'Clinical Notes · NLP', effort: '~22 pd' },
      { name: 'Analytics & Dashboards', effort: '~20 pd' },
      { name: 'Patient Profile', effort: '~22 pd' },
    ]
  },
  'Drug Discovery': {
    totalEffort: '~50 pd',
    components: [
      { name: 'Molecular Docking Pipeline', effort: '~28 pd' },
      { name: 'Variant Annotation Engine', effort: '~22 pd' },
    ]
  },
  'EMR & Interoperability': {
    totalEffort: '~112 pd',
    components: [
      { name: 'FHIR Integration Gateway', effort: '~35 pd' },
      { name: 'Master Patient Index', effort: '~30 pd' },
      { name: 'Clinical Notes · NLP', effort: '~22 pd' },
      { name: 'HL7 Connector Bus', effort: '~25 pd' },
    ]
  },
  'Pharmacy & Medication': {
    totalEffort: '~44 pd',
    components: [
      { name: 'Prescription Engine', effort: '~24 pd' },
      { name: 'Drug Contraindication Checker', effort: '~14 pd' },
      { name: 'Notification Service', effort: '~6 pd' },
    ]
  },
  'Home & Community Care': {
    totalEffort: '~85 pd',
    components: [
      { name: 'Offline Clinician Sync', effort: '~25 pd' },
      { name: 'Remote Vitals Logging', effort: '~24 pd' },
      { name: 'Caregiver Portal', effort: '~22 pd' },
      { name: 'Patient Profile', effort: '~14 pd' },
    ]
  },
};

export const SOLUTION_REVENUE_MAP: Record<string, {
  total: string;
  perYear: string;
  f6Text: string;
  countries: Array<{
    country: string;
    anchor: string;
    depth: string;
    win: string;
    revenue: string;
  }>;
}> = {
  'Population Health & Analytics': {
    total: '$244.6M',
    perYear: '$81.5M',
    f6Text: 'F6 = 4 → depth 1.2×',
    countries: [
      { country: 'United Kingdom', anchor: '$232.1M', depth: '1.2×', win: '70%', revenue: '$195.0M' },
      { country: 'Saudi Arabia', anchor: '$42.5M', depth: '1.2×', win: '70%', revenue: '$35.7M' },
      { country: 'United Arab Emirates', anchor: '$14.2M', depth: '1.2×', win: '70%', revenue: '$11.9M' },
      { country: 'Jordan', anchor: '$2.8M', depth: '1.2×', win: '60%', revenue: '$2.0M' },
    ]
  },
  'InsurTech & Reimbursement': {
    total: '$21.0M',
    perYear: '$7.0M',
    f6Text: 'F6 = 4 → depth 1.2x',
    countries: [
      { country: 'Saudi Arabia', anchor: '$24.8M', depth: '1.2x', win: '70%', revenue: '$12.4M' },
      { country: 'United Arab Emirates', anchor: '$21.0M', depth: '1.2x', win: '60%', revenue: '$5.8M' },
      { country: 'Qatar', anchor: '$7.2M', depth: '1.2x', win: '60%', revenue: '$1.8M' },
      { country: 'Kuwait', anchor: '$5.8M', depth: '1.2x', win: '50%', revenue: '$1.0M' },
    ]
  },
  'Remote Patient Monitoring': {
    total: '$25.0M',
    perYear: '$8.3M',
    f6Text: 'F6 = 4 → depth 1.2x',
    countries: [
      { country: 'United Arab Emirates', anchor: '$28.2M', depth: '1.2x', win: '70%', revenue: '$14.2M' },
      { country: 'Saudi Arabia', anchor: '$25.0M', depth: '1.2x', win: '70%', revenue: '$7.6M' },
      { country: 'Qatar', anchor: '$8.0M', depth: '1.2x', win: '60%', revenue: '$2.0M' },
      { country: 'Oman', anchor: '$4.5M', depth: '1.2x', win: '50%', revenue: '$1.2M' },
    ]
  },
  'Hospital Ops & Clinical Workflow': {
    total: '$27.0M',
    perYear: '$9.0M',
    f6Text: 'F6 = 4 → depth 1.2x',
    countries: [
      { country: 'Saudi Arabia', anchor: '$29.5M', depth: '1.2x', win: '70%', revenue: '$15.0M' },
      { country: 'United Arab Emirates', anchor: '$27.0M', depth: '1.2x', win: '60%', revenue: '$8.5M' },
      { country: 'Kuwait', anchor: '$6.4M', depth: '1.2x', win: '60%', revenue: '$2.2M' },
      { country: 'Egypt', anchor: '$5.2M', depth: '1.2x', win: '50%', revenue: '$1.3M' },
    ]
  },
  'Drug Discovery': {
    total: '$19.0M',
    perYear: '$6.3M',
    f6Text: 'F6 = 5 → depth 1.3x',
    countries: [
      { country: 'United Arab Emirates', anchor: '$22.1M', depth: '1.3x', win: '60%', revenue: '$11.5M' },
      { country: 'Saudi Arabia', anchor: '$19.0M', depth: '1.3x', win: '60%', revenue: '$5.5M' },
      { country: 'Jordan', anchor: '$4.8M', depth: '1.3x', win: '50%', revenue: '$1.2M' },
      { country: 'Egypt', anchor: '$4.1M', depth: '1.3x', win: '40%', revenue: '$0.8M' },
    ]
  },
  'EMR & Interoperability': {
    total: '$24.0M',
    perYear: '$8.0M',
    f6Text: 'F6 = 3 → depth 1.1x',
    countries: [
      { country: 'Saudi Arabia', anchor: '$26.0M', depth: '1.1x', win: '60%', revenue: '$13.2M' },
      { country: 'United Arab Emirates', anchor: '$24.0M', depth: '1.1x', win: '60%', revenue: '$7.8M' },
      { country: 'Qatar', anchor: '$6.0M', depth: '1.1x', win: '50%', revenue: '$1.8M' },
      { country: 'Kuwait', anchor: '$4.5M', depth: '1.1x', win: '50%', revenue: '$1.2M' },
    ]
  },
  'Pharmacy & Medication': {
    total: '$11.0M',
    perYear: '$3.7M',
    f6Text: 'F6 = 3 → depth 1.1x',
    countries: [
      { country: 'Saudi Arabia', anchor: '$14.0M', depth: '1.1x', win: '60%', revenue: '$6.0M' },
      { country: 'United Arab Emirates', anchor: '$11.5M', depth: '1.1x', win: '50%', revenue: '$3.5M' },
      { country: 'Jordan', anchor: '$3.2M', depth: '1.1x', win: '50%', revenue: '$1.0M' },
      { country: 'Egypt', anchor: '$2.5M', depth: '1.1x', win: '40%', revenue: '$0.5M' },
    ]
  },
  'Home & Community Care': {
    total: '$17.0M',
    perYear: '$5.7M',
    f6Text: 'F6 = 3 → depth 1.1x',
    countries: [
      { country: 'Saudi Arabia', anchor: '$18.0M', depth: '1.1x', win: '60%', revenue: '$9.2M' },
      { country: 'United Arab Emirates', anchor: '$15.0M', depth: '1.1x', win: '60%', revenue: '$5.4M' },
      { country: 'Qatar', anchor: '$4.0M', depth: '1.1x', win: '50%', revenue: '$1.4M' },
      { country: 'Kuwait', anchor: '$3.0M', depth: '1.1x', win: '50%', revenue: '$1.0M' },
    ]
  },
};

export const SOLUTION_SCORE_FACTORS_MAP: Record<string, {
  score: number;
  calculation: string;
  factors: Array<{ code: string; name: string; score: number }>;
}> = {
  'InsurTech & Reimbursement': {
    score: 80,
    calculation: '24 ÷ 30 × 100',
    factors: [
      { code: 'F1', name: 'Criticality & Need', score: 4 },
      { code: 'F2', name: 'Willingness to Pay', score: 4 },
      { code: 'F3', name: 'Competitiveness', score: 2 },
      { code: 'F4', name: 'Reusability & Scale', score: 5 },
      { code: 'F5', name: 'Market Reach', score: 5 },
      { code: 'F6', name: 'Revenue Depth', score: 4 },
    ]
  },
  'Remote Patient Monitoring': {
    score: 78,
    calculation: '23.4 ÷ 30 × 100',
    factors: [
      { code: 'F1', name: 'Criticality & Need', score: 4 },
      { code: 'F2', name: 'Willingness to Pay', score: 4 },
      { code: 'F3', name: 'Competitiveness', score: 5 },
      { code: 'F4', name: 'Reusability & Scale', score: 4 },
      { code: 'F5', name: 'Market Reach', score: 4 },
      { code: 'F6', name: 'Revenue Depth', score: 2.4 },
    ]
  },
  'Hospital Ops & Clinical Workflow': {
    score: 75,
    calculation: '22.5 ÷ 30 × 100',
    factors: [
      { code: 'F1', name: 'Criticality & Need', score: 4 },
      { code: 'F2', name: 'Willingness to Pay', score: 4 },
      { code: 'F3', name: 'Competitiveness', score: 3 },
      { code: 'F4', name: 'Reusability & Scale', score: 3 },
      { code: 'F5', name: 'Market Reach', score: 5 },
      { code: 'F6', name: 'Revenue Depth', score: 3.5 },
    ]
  },
  'Population Health & Analytics': {
    score: 80,
    calculation: '24 ÷ 30 × 100',
    factors: [
      { code: 'F1', name: 'Criticality & Need', score: 4 },
      { code: 'F2', name: 'Willingness to Pay', score: 4 },
      { code: 'F3', name: 'Competitiveness', score: 2 },
      { code: 'F4', name: 'Reusability & Scale', score: 5 },
      { code: 'F5', name: 'Market Reach', score: 5 },
      { code: 'F6', name: 'Revenue Depth', score: 4 },
    ]
  },
  'Drug Discovery': {
    score: 69,
    calculation: '20.7 ÷ 30 × 100',
    factors: [
      { code: 'F1', name: 'Criticality & Need', score: 4 },
      { code: 'F2', name: 'Willingness to Pay', score: 4 },
      { code: 'F3', name: 'Competitiveness', score: 5 },
      { code: 'F4', name: 'Reusability & Scale', score: 2 },
      { code: 'F5', name: 'Market Reach', score: 1 },
      { code: 'F6', name: 'Revenue Depth', score: 4.7 },
    ]
  },
  'EMR & Interoperability': {
    score: 66,
    calculation: '20 ÷ 30 × 100',
    factors: [
      { code: 'F1', name: 'Criticality & Need', score: 3 },
      { code: 'F2', name: 'Willingness to Pay', score: 3 },
      { code: 'F3', name: 'Competitiveness', score: 1 },
      { code: 'F4', name: 'Reusability & Scale', score: 4 },
      { code: 'F5', name: 'Market Reach', score: 5 },
      { code: 'F6', name: 'Revenue Depth', score: 4 },
    ]
  },
  'Pharmacy & Medication': {
    score: 59,
    calculation: '17.7 ÷ 30 × 100',
    factors: [
      { code: 'F1', name: 'Criticality & Need', score: 3 },
      { code: 'F2', name: 'Willingness to Pay', score: 3 },
      { code: 'F3', name: 'Competitiveness', score: 2 },
      { code: 'F4', name: 'Reusability & Scale', score: 3 },
      { code: 'F5', name: 'Market Reach', score: 4 },
      { code: 'F6', name: 'Revenue Depth', score: 2.7 },
    ]
  },
  'Home & Community Care': {
    score: 58,
    calculation: '17.4 ÷ 30 × 100',
    factors: [
      { code: 'F1', name: 'Criticality & Need', score: 3 },
      { code: 'F2', name: 'Willingness to Pay', score: 3 },
      { code: 'F3', name: 'Competitiveness', score: 2 },
      { code: 'F4', name: 'Reusability & Scale', score: 3 },
      { code: 'F5', name: 'Market Reach', score: 3 },
      { code: 'F6', name: 'Revenue Depth', score: 3.4 },
    ]
  },
};

// Component complexity descriptions
export const COMPONENT_COMPLEXITY_REASONS: Record<string, string> = {
  'Patient Profile': 'Standard master-record pattern; schema and consent rules already defined.',
  'Analytics & Dashboards': 'Pre-built visualization widgets with standard aggregation pipeline and low operational friction.',
  'Clinical Notes · NLP': 'Ambient conversation capture requiring specialized medical NLP models and multi-turn structuring.',
  'AI Chatbot · CRAG': 'High architectural complexity with corrective RAG retrieval, medical grounded citations, and safety rails.',
  'Notification Service': 'Lightweight event-driven pub/sub webhook dispatcher with standard SMS/WhatsApp gateway.',
  'Payment Module': 'Multi-currency checkout core with regional payer insurance co-pay routing and financial audit compliance.',
  'FHIR Integration Gateway': 'Complex enterprise integration highway translating heterogeneous HL7 schemas to HL7 FHIR R4 standard.',
  'Device Telemetry Hub': 'Hardware IoT interface normalizing streaming physiological telemetry across diverse medical monitors.',
  'Appointment Booking': 'Multi-provider scheduling engine with timezone reconciliation and calendar synchronization.',
  'Fraud-Claim Detection': 'High-compute graph anomaly detection models detecting irregular provider billing patterns.',
  'Prescription Engine': 'Digital drug interaction validation requiring strict national pharmaceutical formulary compliance.',
  'Insurance Directory · Unmapped': 'Payer coverage directory with custom regional reimbursement rulebooks.',
};

// Component feature effort breakdown
export const COMPONENT_EFFORT_BREAKDOWN: Record<string, Array<{ name: string; pd: number }>> = {
  'Patient Profile': [
    { name: 'Master patient schema', pd: 4 },
    { name: 'Consent management', pd: 4 },
    { name: 'Identity matching', pd: 4 },
  ],
  'Analytics & Dashboards': [
    { name: 'KPI aggregation engine', pd: 7 },
    { name: 'Visual dashboard widgets', pd: 8 },
    { name: 'Export & reporting service', pd: 5 },
  ],
  'Clinical Notes · NLP': [
    { name: 'Audio speech-to-text pipeline', pd: 8 },
    { name: 'SOAP note structuring model', pd: 8 },
    { name: 'ICD-10 clinical tagger', pd: 6 },
  ],
  'AI Chatbot · CRAG': [
    { name: 'CRAG retrieval & verification', pd: 20 },
    { name: 'Clinical citations grounding', pd: 18 },
    { name: 'Triage dialogue state engine', pd: 12 },
  ],
  'Notification Service': [
    { name: 'Alert dispatcher core', pd: 2 },
    { name: 'SMS/WhatsApp provider connector', pd: 2 },
    { name: 'Audit & delivery tracking', pd: 2 },
  ],
  'Payment Module': [
    { name: 'Payment gateway connectors', pd: 6 },
    { name: 'Insurance co-pay split logic', pd: 5 },
    { name: 'Settlement & reconciliation', pd: 4 },
  ],
  'FHIR Integration Gateway': [
    { name: 'HL7 to FHIR R4 schema mapper', pd: 15 },
    { name: 'Sub-second caching layer', pd: 10 },
    { name: 'Enterprise audit & security', pd: 10 },
  ],
  'Device Telemetry Hub': [
    { name: 'IoT vitals ingestion bridge', pd: 11 },
    { name: 'HL7 medical device driver', pd: 9 },
    { name: 'Streaming validation worker', pd: 6 },
  ],
  'Appointment Booking': [
    { name: 'Provider calendar slot engine', pd: 7 },
    { name: 'Waitlist & queue coordinator', pd: 6 },
    { name: 'Reminder notification hooks', pd: 5 },
  ],
  'Fraud-Claim Detection': [
    { name: 'Payer pattern clustering model', pd: 13 },
    { name: 'Anomaly flagging workflow', pd: 10 },
    { name: 'Risk score reporting API', pd: 7 },
  ],
  'Prescription Engine': [
    { name: 'Digital prescription crypto signing', pd: 10 },
    { name: 'Drug contraindication checker', pd: 8 },
    { name: 'Pharmacy dispatch connector', pd: 6 },
  ],
  'Insurance Directory · Unmapped': [
    { name: 'Payer policy rule engine', pd: 6 },
    { name: 'Real-time eligibility validator', pd: 6 },
    { name: 'Benefit versioning schema', pd: 4 },
  ],
};

// Component solution allocation breakdown
export const COMPONENT_ALLOCATION_BREAKDOWN: Record<string, Array<{
  solution: string;
  revenue: string;
  share: string;
  allocated: string;
}>> = {
  'Patient Profile': [
    { solution: 'Population Health & Analytics', revenue: '$25.0M', share: '12/78 pd', allocated: '$3.8M' },
    { solution: 'Hospital Ops & Clinical Workflow', revenue: '$27.0M', share: '12/167 pd', allocated: '$1.9M' },
    { solution: 'Remote Patient Monitoring', revenue: '$25.0M', share: '12/77 pd', allocated: '$3.9M' },
    { solution: 'EMR & Interoperability', revenue: '$24.0M', share: '12/112 pd', allocated: '$2.6M' },
    { solution: 'Home & Community Care', revenue: '$17.0M', share: '12/85 pd', allocated: '$2.4M' },
  ],
  'Analytics & Dashboards': [
    { solution: 'Population Health & Analytics', revenue: '$25.0M', share: '20/78 pd', allocated: '$6.4M' },
    { solution: 'Hospital Ops & Clinical Workflow', revenue: '$27.0M', share: '20/167 pd', allocated: '$3.2M' },
    { solution: 'Remote Patient Monitoring', revenue: '$25.0M', share: '20/77 pd', allocated: '$6.5M' },
    { solution: 'InsurTech & Reimbursement', revenue: '$21.0M', share: '20/77 pd', allocated: '$5.5M' },
  ],
  'AI Chatbot · CRAG': [
    { solution: 'Population Health & Analytics', revenue: '$25.0M', share: '26/78 pd', allocated: '$8.3M' },
    { solution: 'Hospital Ops & Clinical Workflow', revenue: '$27.0M', share: '50/167 pd', allocated: '$8.1M' },
    { solution: 'Remote Patient Monitoring', revenue: '$25.0M', share: '25/77 pd', allocated: '$8.1M' },
    { solution: 'InsurTech & Reimbursement', revenue: '$21.0M', share: '22/77 pd', allocated: '$6.0M' },
    { solution: 'EMR & Interoperability', revenue: '$24.0M', share: '25/112 pd', allocated: '$5.4M' },
  ],
};

// ==========================================
// 2. Base Hover Portal Wrapper
// ==========================================

function useOverlayPositioning() {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = (cardWidth = 380, cardHeight = 360) => {
    clearHideTimeout();
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();

    // Center horizontally, clamped to viewport margins
    let left = rect.left + rect.width / 2 - cardWidth / 2;
    if (left + cardWidth > window.innerWidth - 16) {
      left = window.innerWidth - cardWidth - 16;
    }
    left = Math.max(16, left);

    // Prefer placing ABOVE if space permits, otherwise BELOW
    const spaceAbove = rect.top;
    let top: number;
    if (spaceAbove >= cardHeight + 16) {
      top = rect.top - cardHeight - 8;
    } else {
      top = rect.bottom + 8;
    }
    top = Math.max(16, Math.min(top, window.innerHeight - cardHeight - 16));

    setCoords({ top, left });
  };

  const handleMouseLeave = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setCoords(null);
    }, 150);
  };

  const handleClose = () => {
    clearHideTimeout();
    setCoords(null);
  };

  useEffect(() => {
    return () => clearHideTimeout();
  }, []);

  useEffect(() => {
    if (!coords) return;
    const handleScrollOrResize = () => {
      clearHideTimeout();
      setCoords(null);
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [coords]);

  return {
    coords,
    targetRef,
    handleMouseEnter,
    handleMouseLeave,
    handleClose,
    clearHideTimeout,
  };
}

// ==========================================
// 3. Overview Overlays (1st letter capital others small)
// ==========================================

export function ExpectedRevenueOverlayTrigger({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(380, 410)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[370px] sm:w-[390px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  Expected revenue opportunity
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Calculation
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                All scored solutions
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formula Gray Box */}
          <div className="mt-2.5 bg-gray-50/90 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 font-normal leading-relaxed">
            Sum of Revenue (3-yr) of every scored solution
          </div>

          {/* Solution List */}
          <div className="mt-3 divide-y divide-gray-100 max-h-[220px] overflow-y-auto pr-1">
            {EXPECTED_REVENUE_BREAKDOWN.map((item) => (
              <div key={item.id} className="py-2 flex items-center justify-between text-xs first:pt-1 last:pb-1">
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <span className="font-normal text-gray-800 truncate">{item.name}</span>
                  <span className="text-[#0084D1] text-[11px] font-normal hover:underline cursor-pointer shrink-0">
                    how ›
                  </span>
                </div>
                <span className="font-bold text-gray-900 font-mono shrink-0">
                  {item.revenue}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Total Divider */}
          <div className="mt-2 pt-2.5 border-t border-gray-200/90 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900">= Total (3-yr)</span>
              <span className="font-bold text-gray-900 font-mono text-[13px]">$169.0M</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-700">
              <span className="font-normal">Per year (÷ 3)</span>
              <span className="font-bold text-gray-900 font-mono">$56.3M</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function BuildEffortOverlayTrigger({
  solutionName,
  effortText,
  children,
  className = "",
}: {
  solutionName: string;
  effortText?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const data = SOLUTION_BUILD_EFFORT_MAP[solutionName] || {
    totalEffort: effortText || '~78 pd',
    components: [
      { name: 'Core Engine & Workflow', effort: '~28 pd' },
      { name: 'Analytics & Dashboards', effort: '~20 pd' },
      { name: 'Integration Bus & APIs', effort: '~18 pd' },
      { name: 'Security & Consent Layer', effort: '~12 pd' },
    ]
  };

  const finalEffort = effortText || data.totalEffort;

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(380, 360)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[370px] sm:w-[390px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  Build effort
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Calculation
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {solutionName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formula Gray Box */}
          <div className="mt-2.5 bg-gray-50/90 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 font-normal leading-relaxed">
            Sum of the effort of the solution's components (1 FTE)
          </div>

          {/* Component List */}
          <div className="mt-3 divide-y divide-gray-100 max-h-[220px] overflow-y-auto pr-1">
            {data.components.map((comp, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs first:pt-1 last:pb-1">
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <span className="font-normal text-gray-800 truncate">{comp.name}</span>
                  <span className="bg-[#FEF3EC] text-[#D95B14] text-[9.5px] font-semibold px-2 py-0.5 rounded-full border border-[#FCD9C6]/60 shrink-0">
                    Ai estimate
                  </span>
                  <span className="text-[#0084D1] text-[11px] font-normal hover:underline cursor-pointer shrink-0">
                    basis ›
                  </span>
                </div>
                <span className="font-bold text-gray-900 font-mono shrink-0">
                  {comp.effort}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Divider / Total */}
          <div className="mt-2 pt-2.5 border-t border-gray-200/90 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900">= Build effort</span>
            <span className="font-bold text-gray-900 font-mono text-[13px]">{finalEffort}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function Revenue3YrOverlayTrigger({
  solutionName,
  revenueText,
  children,
  className = "",
}: {
  solutionName: string;
  revenueText?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const data = SOLUTION_REVENUE_MAP[solutionName] || {
    total: revenueText || '$25.0M',
    perYear: '$8.3M',
    f6Text: 'F6 = 4 → depth 1.2x',
    countries: [
      { country: 'United Kingdom', anchor: '$23.8M', depth: '1.2x', win: '70%', revenue: '$20.0M' },
      { country: 'Saudi Arabia', anchor: '$4.3M', depth: '1.2x', win: '70%', revenue: '$3.6M' },
      { country: 'United Arab Emirates', anchor: '$1.4M', depth: '1.2x', win: '70%', revenue: '$1.2M' },
      { country: 'Jordan', anchor: '$0.3M', depth: '1.2x', win: '60%', revenue: '$0.2M' },
    ]
  };

  const finalTotal = revenueText ? (revenueText.endsWith('.0M') ? revenueText : `${revenueText.replace('M', '.0M')}`) : data.total;
  const numVal = parseFloat(finalTotal.replace(/[^0-9.]/g, '')) || 25;
  const finalPerYear = `$${(numVal / 3).toFixed(1)}M`;

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(420, 390)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[390px] sm:w-[420px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Title and Chip in Same Row */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  Revenue (3-yr)
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Calculation
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {solutionName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formula Gray Box */}
          <div className="mt-2.5 bg-gray-50/90 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 font-normal leading-relaxed">
            Per country: Deal anchor × Depth multiplier (F6) × Win rate (Market fit), summed
          </div>

          {/* Country Table */}
          <div className="mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5">
                  <th className="font-semibold pb-1.5">COUNTRY</th>
                  <th className="font-semibold pb-1.5 text-right">ANCHOR</th>
                  <th className="font-semibold pb-1.5 text-right">× DEPTH</th>
                  <th className="font-semibold pb-1.5 text-right">× WIN</th>
                  <th className="font-semibold pb-1.5 text-right">= REVENUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[11.5px]">
                {data.countries.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-1.5 font-normal text-[#0084D1] hover:underline cursor-pointer">
                      {row.country} ›
                    </td>
                    <td className="py-1.5 text-right font-mono text-gray-700">{row.anchor}</td>
                    <td className="py-1.5 text-right font-mono text-gray-700">{row.depth}</td>
                    <td className="py-1.5 text-right font-mono text-gray-700">{row.win}</td>
                    <td className="py-1.5 text-right font-bold font-mono text-gray-900">{row.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Divider / Totals */}
          <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200/90 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900">Total (3-yr)</span>
              <span className="font-bold text-gray-900 font-mono text-[13px]">{finalTotal}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-normal">Per year (÷ 3)</span>
              <span className="font-normal font-mono">{finalPerYear}</span>
            </div>
          </div>

          {/* Footer Line */}
          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10.5px] text-gray-400">
            <span>{data.f6Text}</span>
            <span>Calculated 14 Oct 2026</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function ScoreOverlayTrigger({
  solutionName,
  score,
  children,
  className = "",
}: {
  solutionName: string;
  score?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const data = SOLUTION_SCORE_FACTORS_MAP[solutionName] || {
    score: score || 73,
    calculation: `${Math.round(((score || 73) / 100) * 30)} ÷ 30 × 100`,
    factors: [
      { code: 'F1', name: 'Criticality & Need', score: 4 },
      { code: 'F2', name: 'Willingness to Pay', score: 4 },
      { code: 'F3', name: 'Competitiveness', score: 3 },
      { code: 'F4', name: 'Reusability & Scale', score: 4 },
      { code: 'F5', name: 'Market Reach', score: 4 },
      { code: 'F6', name: 'Revenue Depth', score: 3 },
    ]
  };

  const finalScore = score ?? data.score;

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(380, 420)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[370px] sm:w-[390px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Title and Chip in Same Row */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  Score / 100
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Calculation
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {solutionName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formula Gray Box */}
          <div className="mt-2.5 bg-gray-50/90 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 font-normal leading-relaxed">
            ∑ (factor score × weight) ÷ maximum possible × 100
          </div>

          {/* Factor Breakdown Rows */}
          <div className="mt-3 divide-y divide-gray-100 max-h-[220px] overflow-y-auto pr-1">
            {data.factors.map((factor, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs first:pt-1 last:pb-1">
                <span className="font-normal text-gray-800">
                  {factor.code} {factor.name}
                </span>
                <span className="font-bold text-gray-900 font-mono">
                  {factor.score} × 1
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Divider / Calculation Result */}
          <div className="mt-2 pt-2.5 border-t border-gray-200/90 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900">= {data.calculation}</span>
            <span className="font-bold text-gray-900 font-mono text-[14px]">{finalScore}</span>
          </div>

          {/* Footer Line */}
          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10.5px] text-gray-400">
            <span>Weightage v1 (default)</span>
            <span>Scored 14 Oct 2026</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ==========================================
// 4. Build Roadmap Specific Overlays
// ==========================================

// Item 1: 3-Yr Revenue Unlocked KPI Card Overlay (Image 1)
export function RevenueUnlockedOverlayTrigger({
  totalUnlockedRev,
  unlockedSolutions = [],
  children,
  className = "",
}: {
  totalUnlockedRev?: number | string;
  unlockedSolutions?: Array<{ name: string; revenue?: string; revNum?: number }>;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const formattedTotal = totalUnlockedRev ? `$${totalUnlockedRev}M` : '$217.1M';
  const displayList = unlockedSolutions.length > 0 
    ? unlockedSolutions.map(s => ({ name: s.name, rev: s.revenue || `$${s.revNum || 24}M` }))
    : [
        { name: 'Claims Denial Analyzer', rev: '$217.1M' },
      ];

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(380, 320)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[370px] sm:w-[390px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  3-yr revenue unlocked
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Calculation
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                Solutions with every component Completed
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formula Gray Box */}
          <div className="mt-2.5 bg-gray-50/90 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 font-normal leading-relaxed">
            Sum of Revenue (3-yr) of unlocked solutions
          </div>

          {/* Solution List */}
          <div className="mt-3 divide-y divide-gray-100 max-h-[200px] overflow-y-auto pr-1">
            {displayList.map((sol, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs first:pt-1 last:pb-1">
                <span className="font-normal text-gray-800 truncate pr-2">{sol.name}</span>
                <span className="font-bold text-gray-900 font-mono shrink-0">{sol.rev}</span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-2 pt-2.5 border-t border-gray-200/90 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900">= Revenue unlocked</span>
            <span className="font-bold text-gray-900 font-mono text-[13px]">{formattedTotal}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Item 2: Complexity Column Cell Overlay (Image 2)
// User requirement: "remove put ai judgement and low confidence chip along with the title in the overlay in the same row."
export function ComplexityOverlayTrigger({
  componentName,
  complexity = 'Low',
  children,
  className = "",
}: {
  componentName: string;
  complexity?: 'Low' | 'Medium' | 'High';
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const description = COMPONENT_COMPLEXITY_REASONS[componentName] || 
    `${complexity} architectural and integration scope with standard healthcare data exchange requirements.`;

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(380, 310)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[370px] sm:w-[390px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title Row with Ai judgement and Low confidence chips in the SAME row */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center flex-wrap gap-1.5">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  Complexity
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Ai judgement
                </span>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF2FF] text-[#3B82F6]">
                  {complexity} confidence
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-1">
                {componentName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-700 leading-relaxed mt-3 font-normal">
            {description}
          </p>

          {/* BASED ON */}
          <div className="mt-3.5 pt-3 border-t border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              BASED ON
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-700">
                <span>Description & key capabilities</span>
                <span className="bg-[#FEF3EC] text-[#D95B14] text-[9.5px] font-semibold px-2 py-0.5 rounded border border-[#FCD9C6]/60">
                  Catalogue
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-700">
                <span>Dependencies</span>
                <span className="bg-[#FEF3EC] text-[#D95B14] text-[9.5px] font-semibold px-2 py-0.5 rounded border border-[#FCD9C6]/60">
                  Catalogue
                </span>
              </div>
            </div>
          </div>

          {/* Footer Line */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] text-gray-400">
            <span>Low / Medium / High</span>
            <span>Assessed 14 Oct 2026</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Item 3: Effort · 1 FTE Column Cell Overlay (Image 3)
// User requirement: "ai estimate chip put it on the title"
export function Effort1FteOverlayTrigger({
  componentName,
  effortText = '~12 pd',
  complexity = 'Low',
  children,
  className = "",
}: {
  componentName: string;
  effortText?: string;
  complexity?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const numPd = parseInt(effortText.replace(/[^0-9]/g, '') || '12', 10);
  const items = COMPONENT_EFFORT_BREAKDOWN[componentName] || [
    { name: 'Core engine architecture', pd: Math.max(1, Math.round(numPd * 0.4)) },
    { name: 'Integration interface & schema', pd: Math.max(1, Math.round(numPd * 0.35)) },
    { name: 'Validation & unit testing', pd: Math.max(1, numPd - Math.round(numPd * 0.4) - Math.round(numPd * 0.35)) },
  ];

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(380, 340)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[370px] sm:w-[390px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Title Row with Ai estimate chip ON the title */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  Effort · 1 FTE
                </h3>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3EC] text-[#D95B14] border border-[#FCD9C6]/60">
                  Ai estimate
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {componentName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Person Days Count - Reduced to normal text size */}
          <div className="mt-2.5 flex items-baseline gap-1.5 font-['Poppins']">
            <span className="text-sm font-semibold text-[#0D212C] font-mono">
              ~{numPd} pd
            </span>
            <span className="text-xs text-gray-500 font-sans">
              person-days
            </span>
          </div>

          {/* Breakdown Items */}
          <div className="mt-3 divide-y divide-gray-100">
            {items.map((it, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs first:pt-1 last:pb-1">
                <span className="text-gray-700 font-normal">{it.name}</span>
                <span className="font-bold text-gray-900 font-mono">{it.pd} pd</span>
              </div>
            ))}
          </div>

          {/* Total Line */}
          <div className="mt-2 pt-2.5 border-t border-gray-200/90 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900">= Feature breakdown total</span>
            <span className="font-bold text-gray-900 font-mono text-[13px]">{numPd} pd</span>
          </div>

          {/* Footer Line */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] text-gray-400">
            <span>Complexity: {complexity}</span>
            <span>Estimated 14 Oct 2026</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Item 4: Allocated Revenue Column Cell Overlay (Image 4)
// User requirement: "add the calculation chip along with the title in the overlay."
export function AllocatedRevenueOverlayTrigger({
  componentName,
  allocatedRevenue = '$13.2M',
  children,
  className = "",
}: {
  componentName: string;
  allocatedRevenue?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const rows = COMPONENT_ALLOCATION_BREAKDOWN[componentName] || [
    { solution: 'Population Health & Analytics', revenue: '$244.6M', share: '12/102 pd', allocated: '$28.8M' },
    { solution: 'EMR & Interoperability', revenue: '$178.8M', share: '12/70 pd', allocated: '$30.7M' },
    { solution: 'Claims Denial Analyzer', revenue: '$217.1M', share: '12/30 pd', allocated: '$86.8M' },
  ];

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(410, 360)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[390px] sm:w-[410px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Title and Calculation Chip in SAME row */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  Allocated revenue
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Calculation
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {componentName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formula Gray Box */}
          <div className="mt-2.5 bg-gray-50/90 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 font-normal leading-relaxed">
            ∑ Solution revenue × (component effort ÷ solution effort)
          </div>

          {/* Table */}
          <div className="mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5">
                  <th className="font-semibold pb-1.5">SOLUTION</th>
                  <th className="font-semibold pb-1.5 text-right">REVENUE</th>
                  <th className="font-semibold pb-1.5 text-right">× SHARE</th>
                  <th className="font-semibold pb-1.5 text-right">= ALLOCATED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[11.5px]">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-2 font-normal text-[#0084D1] hover:underline cursor-pointer truncate max-w-[150px]">
                      {row.solution} ›
                    </td>
                    <td className="py-2 text-right font-mono text-gray-700">{row.revenue}</td>
                    <td className="py-2 text-right font-mono text-gray-700">{row.share}</td>
                    <td className="py-2 text-right font-bold font-mono text-gray-900">{row.allocated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Total Line */}
          <div className="mt-2 pt-2.5 border-t border-dashed border-gray-200/90 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900">Allocated revenue</span>
            <span className="font-bold text-gray-900 font-mono text-[13px]">{allocatedRevenue}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Item 5: Build Priority Column Cell Overlay (Image 5)
// User requirement: "alculation chip put along with the title."
export function BuildPriorityOverlayTrigger({
  componentName,
  allocatedRev = '$146.3M',
  effortPd = '12 pd',
  priority = '$12.2M / pd',
  children,
  className = "",
}: {
  componentName: string;
  allocatedRev?: string;
  effortPd?: string;
  priority?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(380, 290)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[370px] sm:w-[390px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Title and Calculation Chip in SAME row */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  Build priority
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Calculation
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {componentName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formula Gray Box */}
          <div className="mt-2.5 bg-gray-50/90 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 font-normal leading-relaxed">
            Allocated revenue ÷ Effort
          </div>

          {/* Rows */}
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-700">Allocated revenue</span>
                <span className="text-[#0084D1] text-[11px] hover:underline cursor-pointer">
                  how ›
                </span>
              </div>
              <span className="font-bold text-gray-900 font-mono">{allocatedRev}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-mono">÷</span>
                <span className="text-gray-700">Effort</span>
                <span className="bg-[#FEF3EC] text-[#D95B14] text-[9.5px] font-semibold px-2 py-0.5 rounded-full border border-[#FCD9C6]/60">
                  Ai estimate
                </span>
                <span className="text-[#0084D1] text-[11px] hover:underline cursor-pointer">
                  basis ›
                </span>
              </div>
              <span className="font-bold text-gray-900 font-mono">{effortPd}</span>
            </div>
          </div>

          {/* Total Line */}
          <div className="mt-3 pt-2.5 border-t border-gray-200/90 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900">= Build priority</span>
            <span className="font-bold text-gray-900 font-mono text-[13px]">{priority}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ==========================================
// 5. Solution Details Overlays (Images 3, 4, 5)
// ==========================================

export const SOLUTION_PORTFOLIO_SYNERGY_MAP: Record<string, {
  formula: string;
  totalText: string;
  percentage: string;
  components: Array<{ name: string; status: string }>;
}> = {
  'Population Health & Analytics': {
    formula: 'Components shared with other solutions ÷ all components of this solution',
    totalText: '= 3 ÷ 4',
    percentage: '75%',
    components: [
      { name: 'Patient Profile', status: 'Shared (3)' },
      { name: 'Analytics & Dashboards', status: 'Shared (2)' },
      { name: 'AI Chatbot · CRAG', status: 'Only here' },
      { name: 'Consent & Purpose Filter', status: 'Shared (2)' },
    ],
  },
  'Hospital Ops & Clinical Workflow': {
    formula: 'Components shared with other solutions ÷ all components of this solution',
    totalText: '= 5 ÷ 6',
    percentage: '83%',
    components: [
      { name: 'Appointment Booking', status: 'Shared (2)' },
      { name: 'FHIR Integration Gateway', status: 'Shared (3)' },
      { name: 'AI Chatbot · CRAG', status: 'Shared (5)' },
      { name: 'Clinical Notes · NLP', status: 'Shared (2)' },
      { name: 'Analytics & Dashboards', status: 'Shared (4)' },
      { name: 'Patient Profile', status: 'Shared (5)' },
    ],
  },
  'Remote Patient Monitoring': {
    formula: 'Components shared with other solutions ÷ all components of this solution',
    totalText: '= 3 ÷ 4',
    percentage: '75%',
    components: [
      { name: 'Device Telemetry Hub', status: 'Only here' },
      { name: 'AI Chatbot · CRAG', status: 'Shared (5)' },
      { name: 'Patient Profile', status: 'Shared (5)' },
      { name: 'Notification Service', status: 'Shared (3)' },
    ],
  },
  'InsurTech & Reimbursement': {
    formula: 'Components shared with other solutions ÷ all components of this solution',
    totalText: '= 3 ÷ 4',
    percentage: '75%',
    components: [
      { name: 'Payment Module', status: 'Only here' },
      { name: 'AI Chatbot · CRAG', status: 'Shared (5)' },
      { name: 'Fraud-Claim Detection', status: 'Shared (2)' },
      { name: 'Notification Service', status: 'Shared (3)' },
    ],
  },
};

export function PortfolioSynergyOverlayTrigger({
  solutionName,
  children,
  className = "",
}: {
  solutionName: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const data = SOLUTION_PORTFOLIO_SYNERGY_MAP[solutionName] || {
    formula: 'Components shared with other solutions ÷ all components of this solution',
    totalText: '= 3 ÷ 4',
    percentage: '75%',
    components: [
      { name: 'Patient Profile', status: 'Shared (3)' },
      { name: 'Analytics & Dashboards', status: 'Shared (2)' },
      { name: 'AI Chatbot · CRAG', status: 'Only here' },
      { name: 'Consent & Purpose Filter', status: 'Shared (2)' },
    ],
  };

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(380, 320)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[370px] sm:w-[390px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  Portfolio synergy
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Calculation
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {solutionName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formula Gray Box */}
          <div className="mt-2.5 bg-gray-50/90 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 font-normal leading-relaxed">
            {data.formula}
          </div>

          {/* Component list */}
          <div className="mt-3 divide-y divide-gray-100/80">
            {data.components.map((c, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs first:pt-1 last:pb-1">
                <span className="font-normal text-gray-800">{c.name}</span>
                <span className="font-bold text-gray-900 font-mono">{c.status}</span>
              </div>
            ))}
          </div>

          {/* Bottom Divider / Calculation */}
          <div className="mt-2 pt-2.5 border-t border-gray-200/90 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900">{data.totalText}</span>
            <span className="font-bold text-gray-900 font-mono text-[13px]">{data.percentage}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export const SOLUTION_MARKETS_MAP: Record<string, {
  headerCount: string;
  markets: Array<{
    country: string;
    description: string;
    fit?: string;
    winRate?: string;
    notSellable?: boolean;
  }>;
}> = {
  'Population Health & Analytics': {
    headerCount: '4 markets',
    markets: [
      {
        country: 'United Kingdom',
        description: 'Integrated care systems buy population-health analytics.',
        fit: '5 / 5',
        winRate: '70%',
      },
      {
        country: 'Saudi Arabia',
        description: 'National prevention programme with central data platform; clear buyer.',
        fit: '5 / 5',
        winRate: '70%',
      },
      {
        country: 'United Arab Emirates',
        description: 'Federal and emirate health authorities run population-health registries.',
        fit: '5 / 5',
        winRate: '70%',
      },
      {
        country: 'Jordan',
        description: 'Need is clear but budgets are smaller and donor-funded.',
        fit: '4 / 5',
        winRate: '60%',
      },
      {
        country: 'Azerbaijan',
        description: 'No national population-health programme or payer to buy it.',
        notSellable: true,
      },
    ],
  },
};

export function CountriesMarketOverlayTrigger({
  solutionName,
  children,
  className = "",
}: {
  solutionName: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const data = SOLUTION_MARKETS_MAP[solutionName] || {
    headerCount: '4 markets',
    markets: [
      {
        country: 'United Kingdom',
        description: 'Integrated care systems buy population-health analytics.',
        fit: '5 / 5',
        winRate: '70%',
      },
      {
        country: 'Saudi Arabia',
        description: 'National prevention programme with central data platform; clear buyer.',
        fit: '5 / 5',
        winRate: '70%',
      },
      {
        country: 'United Arab Emirates',
        description: 'Federal and emirate health authorities run population-health registries.',
        fit: '5 / 5',
        winRate: '70%',
      },
      {
        country: 'Jordan',
        description: 'Need is clear but budgets are smaller and donor-funded.',
        fit: '4 / 5',
        winRate: '60%',
      },
      {
        country: 'Azerbaijan',
        description: 'No national programme or payer to buy it.',
        notSellable: true,
      },
    ],
  };

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(420, 480)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[390px] sm:w-[420px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  Countries
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Ai judgement
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {solutionName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subtitle / Small Markets text */}
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-semibold text-gray-900 tracking-tight">
              {data.headerCount}
            </span>
            <span className="text-xs text-gray-600 font-normal">
              sellable, ranked by revenue
            </span>
          </div>

          {/* Table Header */}
          <div className="mt-3.5 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1.5">
            <span className="font-semibold">COUNTRY</span>
            <div className="flex items-center gap-6">
              <span className="font-semibold w-10 text-right">FIT</span>
              <span className="font-semibold w-14 text-right">WIN RATE</span>
            </div>
          </div>

          {/* Market List */}
          <div className="divide-y divide-gray-100/70 max-h-[250px] overflow-y-auto pr-1">
            {data.markets.map((m, idx) => (
              <div key={idx} className="py-2.5 first:pt-2 last:pb-1 flex items-start justify-between gap-2">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-gray-900">{m.country}</div>
                  <div className="text-[11px] text-gray-500 leading-snug mt-0.5">{m.description}</div>
                </div>
                {m.notSellable ? (
                  <div className="shrink-0 text-xs font-medium text-gray-600 pt-0.5 whitespace-nowrap">
                    Not sellable
                  </div>
                ) : (
                  <div className="shrink-0 flex items-center gap-6 pt-0.5">
                    <span className="text-xs text-gray-700 font-mono w-10 text-right">{m.fit}</span>
                    <span className="text-xs font-bold text-gray-900 font-mono w-14 text-right">{m.winRate}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Line */}
          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10.5px] text-gray-400">
            <span>Win rate = 20% + 10% × fit</span>
            <span>Assessed 14 Oct 2026</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export const COUNTRY_TOTAL_SPEND_DETAILS_MAP: Record<string, {
  spendCapita: string;
  population: string;
  totalSpend: string;
}> = {
  'United Kingdom': { spendCapita: '$5,860', population: '69.5M', totalSpend: '$407.3B' },
  'United Arab Emirates': { spendCapita: '$1,842', population: '9.4M', totalSpend: '$17B' },
  'Saudi Arabia': { spendCapita: '$1,485', population: '36.9M', totalSpend: '$55B' },
  'Jordan': { spendCapita: '$304', population: '11.3M', totalSpend: '$3B' },
  'Estonia': { spendCapita: '$1,733', population: '1.3M', totalSpend: '$2B' },
  'South Korea': { spendCapita: '$2,600', population: '51.7M', totalSpend: '$134B' },
  'United States': { spendCapita: '$12,555', population: '333M', totalSpend: '$4.2T' },
  'Azerbaijan': { spendCapita: '$230', population: '10.1M', totalSpend: '$2B' },
};

export function TotalHealthSpendOverlayTrigger({
  countryName,
  spendCapita,
  population,
  totalSpend,
  children,
  className = "",
}: {
  countryName: string;
  spendCapita?: string;
  population?: string;
  totalSpend?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const data = COUNTRY_TOTAL_SPEND_DETAILS_MAP[countryName] || {
    spendCapita: spendCapita || '$5,860',
    population: population || '69.5M',
    totalSpend: totalSpend || '$407.3B',
  };

  const finalSpendCapita = spendCapita || data.spendCapita;
  const finalPopulation = population || data.population;
  const finalTotalSpend = totalSpend || data.totalSpend;

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(380, 270)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[370px] sm:w-[380px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                  Total health spend
                </h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Calculation
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {countryName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Formula Gray Box */}
          <div className="mt-2.5 bg-gray-50/90 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 font-normal leading-relaxed">
            Spend per capita × Population
          </div>

          {/* Rows */}
          <div className="mt-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-700">Spend per capita</span>
                <span className="text-[#0084D1] text-[11px] hover:underline cursor-pointer">
                  source ›
                </span>
              </div>
              <span className="font-bold text-gray-900 font-mono">{finalSpendCapita}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-mono">×</span>
                <span className="text-gray-700">Population</span>
                <span className="text-[#0084D1] text-[11px] hover:underline cursor-pointer">
                  source ›
                </span>
              </div>
              <span className="font-bold text-gray-900 font-mono">{finalPopulation}</span>
            </div>
          </div>

          {/* Total Line */}
          <div className="mt-3 pt-2.5 border-t border-gray-200/90 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-gray-900">
              <span className="font-mono">=</span>
              <span>Total health spend</span>
            </div>
            <span className="font-bold text-gray-900 font-mono text-[13px]">{finalTotalSpend}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ==========================================
// 6. Target Countries Table Overlays (Images 1, 2, 3)
// ==========================================

const DIGITAL_SHARE_DETAILS: Record<string, {
  percentage: string;
  description: string;
  sources: Array<{ name: string; year: string; url: string }>;
}> = {
  'United Arab Emirates': {
    percentage: '3%',
    description: 'Estimated from reported digital-health spend and EHR adoption.',
    sources: [
      { name: 'Ministry of Health – Digital Health Strategy', year: '2024', url: 'mohap.gov.ae/digital-health' },
      { name: 'WHO – Global Observatory for eHealth', year: '2024', url: 'who.int/observatories/goe' },
    ],
  },
  'Saudi Arabia': {
    percentage: '3%',
    description: 'Estimated from Vision 2030 digital-health roadmap and adoption surveys.',
    sources: [
      { name: 'Ministry of Health – Health Sector Transformation Program', year: '2025', url: 'moh.gov.sa/digital' },
      { name: 'WHO – Global Observatory for eHealth', year: '2024', url: 'who.int/observatories/goe' },
    ],
  },
  'Jordan': {
    percentage: '2.5%',
    description: 'Estimated from reported digital-health spend and limited EHR coverage.',
    sources: [
      { name: 'Ministry of Health Jordan – Digital Health Plan', year: '2024', url: 'moh.gov.jo' },
      { name: 'WHO – Global Observatory for eHealth', year: '2024', url: 'who.int/observatories/goe' },
    ],
  },
  'Estonia': {
    percentage: '6%',
    description: 'Estonia leads globally in e-health; full national EHR system since 2008.',
    sources: [
      { name: 'Estonian Health Information System', year: '2024', url: 'tehik.ee' },
      { name: 'WHO – Global Observatory for eHealth', year: '2024', url: 'who.int/observatories/goe' },
    ],
  },
  'South Korea': {
    percentage: '3%',
    description: 'Estimated from national EMR and telemedicine adoption data.',
    sources: [
      { name: 'Ministry of Health & Welfare South Korea', year: '2024', url: 'mohw.go.kr' },
      { name: 'WHO – Global Observatory for eHealth', year: '2024', url: 'who.int/observatories/goe' },
    ],
  },
  'United States': {
    percentage: '3%',
    description: 'Estimated from CMS digital-health spend and HITECH Act EHR adoption.',
    sources: [
      { name: 'CMS National Health Expenditure Data', year: '2024', url: 'cms.gov/data-research' },
      { name: 'WHO – Global Observatory for eHealth', year: '2024', url: 'who.int/observatories/goe' },
    ],
  },
  'Azerbaijan': {
    percentage: '2%',
    description: 'Low digital-health penetration; nascent eHealth infrastructure.',
    sources: [
      { name: 'Ministry of Health Azerbaijan – eHealth Plan', year: '2024', url: 'sehiyyeministrliyi.gov.az' },
      { name: 'WHO – Global Observatory for eHealth', year: '2024', url: 'who.int/observatories/goe' },
    ],
  },
};

export function DigitalShareOverlayTrigger({
  countryName,
  digitalShare,
  children,
  className = "",
}: {
  countryName: string;
  digitalShare: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const data = DIGITAL_SHARE_DETAILS[countryName] || {
    percentage: digitalShare,
    description: 'Estimated from reported digital-health spend and EHR adoption.',
    sources: [
      { name: 'Ministry of Health – Health Sector Transformation Program', year: '2025', url: 'moh.gov.sa/digital' },
      { name: 'WHO – Global Observatory for eHealth', year: '2024', url: 'who.int/observatories/goe' },
    ],
  };

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(390, 360)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[370px] sm:w-[390px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0D212C] leading-tight">Digital share</h3>
              <p className="text-xs text-gray-500 font-normal mt-0.5">{countryName}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* AI Estimate chip */}
          <div className="mt-3">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3EC] text-[#D95B14] border border-[#FCD9C6]/60">
              Ai estimate
            </span>
          </div>

          {/* Big percentage */}
          <div className="mt-3 text-3xl font-bold text-[#0D212C] tracking-tight">
            {data.percentage}
          </div>

          {/* Description */}
          <p className="mt-2.5 text-xs text-gray-700 leading-relaxed font-normal">
            {data.description}
          </p>

          {/* Based On */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">BASED ON</div>
            <div className="space-y-2.5">
              {data.sources.map((src, idx) => (
                <div key={idx} className="flex flex-col gap-0.5">
                  <a
                    href={`https://${src.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-blue-500">↗</span>
                    <span>{src.name}</span>
                  </a>
                  <span className="text-[11px] text-gray-400 pl-4">{src.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] text-gray-400">
            <span>Kept conservative · to validate</span>
            <span>Estimated 14 Oct 2026</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const DEAL_ANCHOR_DETAILS: Record<string, {
  totalHealthSpend: string;
  digitalShare: string;
  obtainableSlice: string;
  dealAnchor: string;
}> = {
  'United Kingdom': { totalHealthSpend: '$407.3B', digitalShare: '3.8%', obtainableSlice: '1.5%', dealAnchor: '$232.1M' },
  'Saudi Arabia': { totalHealthSpend: '$67.5B', digitalShare: '3.5%', obtainableSlice: '1.8%', dealAnchor: '$42.5M' },
  'United Arab Emirates': { totalHealthSpend: '$17B', digitalShare: '3%', obtainableSlice: '1%', dealAnchor: '$5M' },
  'Jordan': { totalHealthSpend: '$3B', digitalShare: '2.5%', obtainableSlice: '1.5%', dealAnchor: '$1.3M' },
  'Estonia': { totalHealthSpend: '$2B', digitalShare: '6%', obtainableSlice: '1.5%', dealAnchor: '$2M' },
  'South Korea': { totalHealthSpend: '$134B', digitalShare: '3%', obtainableSlice: '0.2%', dealAnchor: '$8M' },
  'United States': { totalHealthSpend: '$4.2T', digitalShare: '3%', obtainableSlice: '0.013%', dealAnchor: '$16M' },
  'Azerbaijan': { totalHealthSpend: '$2B', digitalShare: '2%', obtainableSlice: '2.2%', dealAnchor: '$1M' },
};

export function DealAnchorOverlayTrigger({
  countryName,
  dealAnchor,
  totalHealthSpend,
  digitalShare,
  obtainableSlice,
  children,
  className = "",
}: {
  countryName: string;
  dealAnchor?: string;
  totalHealthSpend?: string;
  digitalShare?: string;
  obtainableSlice?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const fallback = DEAL_ANCHOR_DETAILS[countryName] || {
    totalHealthSpend: '$407.3B',
    digitalShare: '3.8%',
    obtainableSlice: '1.5%',
    dealAnchor: dealAnchor || '$232.1M',
  };

  const finalTotalSpend = totalHealthSpend || fallback.totalHealthSpend;
  const finalDigitalShare = digitalShare || fallback.digitalShare;
  const finalObtainableSlice = obtainableSlice || fallback.obtainableSlice;
  const finalDealAnchor = dealAnchor || fallback.dealAnchor;

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(390, 310)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[370px] sm:w-[390px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0D212C] leading-tight">Deal anchor</h3>
              <p className="text-xs text-gray-500 font-normal mt-0.5">{countryName}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Calculation chip */}
          <div className="mt-3">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
              Calculation
            </span>
          </div>

          {/* Formula Gray Box */}
          <div className="mt-3 bg-gray-50/90 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-600 font-normal leading-relaxed">
            Total health spend × Digital share × Obtainable slice
          </div>

          {/* Rows */}
          <div className="mt-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-700">Total health spend</span>
                <span className="text-[#0084D1] text-[11px] hover:underline cursor-pointer">how ›</span>
              </div>
              <span className="font-bold text-gray-900 font-mono">{finalTotalSpend}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-mono">×</span>
                <span className="text-gray-700">Digital share</span>
                <span className="bg-[#FEF3EC] text-[#D95B14] text-[9.5px] font-semibold px-2 py-0.5 rounded-full border border-[#FCD9C6]/60">
                  Ai estimate
                </span>
                <span className="text-[#0084D1] text-[11px] hover:underline cursor-pointer">basis ›</span>
              </div>
              <span className="font-bold text-gray-900 font-mono">{finalDigitalShare}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-mono">×</span>
                <span className="text-gray-700">Obtainable slice</span>
                <span className="bg-[#FEF3EC] text-[#D95B14] text-[9.5px] font-semibold px-2 py-0.5 rounded-full border border-[#FCD9C6]/60">
                  Ai estimate
                </span>
                <span className="text-[#0084D1] text-[11px] hover:underline cursor-pointer">basis ›</span>
              </div>
              <span className="font-bold text-gray-900 font-mono">{finalObtainableSlice}</span>
            </div>
          </div>

          {/* Total Line */}
          <div className="mt-3 pt-2.5 border-t border-gray-200/90 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900">= Deal anchor (3-yr, one solution)</span>
            <span className="font-bold text-gray-900 font-mono text-[13px]">{finalDealAnchor}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const CONFIDENCE_DETAILS: Record<string, {
  confidence: 'High' | 'Medium' | 'Low';
  description: string;
  inputs: Array<{
    name: string;
    sourceType: 'Tier 1' | 'Ai estimate';
    sourceTier: number;
    agreement: string;
    agreementScore: number;
    band: number;
    bandLabel: string;
  }>;
  averageCalc: string;
  averageScore: string;
  averageLabel: string;
}> = {
  'United Kingdom': {
    confidence: 'Medium',
    description: 'Spend per capita and population well sourced; digital share, obtainable slice weak or estimated.',
    inputs: [
      { name: 'Spend per capita', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Population', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Digital share', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
      { name: 'Obtainable slice', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
    ],
    averageCalc: '(3 + 3 + 1 + 1) ÷ 4',
    averageScore: '2.00',
    averageLabel: 'Medium',
  },
  'United Arab Emirates': {
    confidence: 'High',
    description: 'Spend per capita and population well sourced; digital share and obtainable slice estimated conservatively.',
    inputs: [
      { name: 'Spend per capita', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Population', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Digital share', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
      { name: 'Obtainable slice', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
    ],
    averageCalc: '(3 + 3 + 1 + 1) ÷ 4',
    averageScore: '2.00',
    averageLabel: 'Medium',
  },
  'Saudi Arabia': {
    confidence: 'High',
    description: 'Spend per capita and population well sourced; digital share and obtainable slice estimated conservatively.',
    inputs: [
      { name: 'Spend per capita', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Population', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Digital share', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
      { name: 'Obtainable slice', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
    ],
    averageCalc: '(3 + 3 + 1 + 1) ÷ 4',
    averageScore: '2.00',
    averageLabel: 'Medium',
  },
  'Jordan': {
    confidence: 'Medium',
    description: 'Spend per capita and population well sourced; digital share, obtainable slice weak or estimated.',
    inputs: [
      { name: 'Spend per capita', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Population', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Digital share', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
      { name: 'Obtainable slice', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
    ],
    averageCalc: '(3 + 3 + 1 + 1) ÷ 4',
    averageScore: '2.00',
    averageLabel: 'Medium',
  },
  'Estonia': {
    confidence: 'High',
    description: 'Strong data ecosystem; spend per capita, population and digital share all well sourced.',
    inputs: [
      { name: 'Spend per capita', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Population', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Digital share', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Obtainable slice', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
    ],
    averageCalc: '(3 + 3 + 3 + 1) ÷ 4',
    averageScore: '2.50',
    averageLabel: 'High',
  },
  'South Korea': {
    confidence: 'Medium',
    description: 'Spend per capita and population well sourced; digital share and obtainable slice moderately estimated.',
    inputs: [
      { name: 'Spend per capita', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Population', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Digital share', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
      { name: 'Obtainable slice', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
    ],
    averageCalc: '(3 + 3 + 1 + 1) ÷ 4',
    averageScore: '2.00',
    averageLabel: 'Medium',
  },
  'United States': {
    confidence: 'Low',
    description: 'Large market; obtainable slice very uncertain given fragmented payer landscape.',
    inputs: [
      { name: 'Spend per capita', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Population', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Digital share', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
      { name: 'Obtainable slice', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'No consensus', agreementScore: 1, band: 2, bandLabel: 'Low' },
    ],
    averageCalc: '(3 + 3 + 1 + 1) ÷ 4',
    averageScore: '2.00',
    averageLabel: 'Medium',
  },
  'Azerbaijan': {
    confidence: 'Low',
    description: 'Limited data availability; most inputs estimated with low agreement.',
    inputs: [
      { name: 'Spend per capita', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
      { name: 'Population', sourceType: 'Tier 1', sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Digital share', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'No consensus', agreementScore: 1, band: 2, bandLabel: 'Low' },
      { name: 'Obtainable slice', sourceType: 'Ai estimate', sourceTier: 1, agreement: 'No consensus', agreementScore: 1, band: 2, bandLabel: 'Low' },
    ],
    averageCalc: '(1 + 3 + 1 + 1) ÷ 4',
    averageScore: '1.50',
    averageLabel: 'Medium',
  },
};

export function ConfidenceOverlayTrigger({
  countryName,
  confidence,
  children,
  className = "",
}: {
  countryName: string;
  confidence: 'High' | 'Medium' | 'Low';
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const data = CONFIDENCE_DETAILS[countryName] || {
    confidence,
    description: 'Spend per capita and population well sourced; digital share, obtainable slice weak or estimated.',
    inputs: [
      { name: 'Spend per capita', sourceType: 'Tier 1' as const, sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Population', sourceType: 'Tier 1' as const, sourceTier: 3, agreement: 'Agree', agreementScore: 3, band: 6, bandLabel: 'High' },
      { name: 'Digital share', sourceType: 'Ai estimate' as const, sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
      { name: 'Obtainable slice', sourceType: 'Ai estimate' as const, sourceTier: 1, agreement: 'Single basis', agreementScore: 2, band: 3, bandLabel: 'Low' },
    ],
    averageCalc: '(3 + 3 + 1 + 1) ÷ 4',
    averageScore: '2.00',
    averageLabel: 'Medium',
  };

  const confidenceColor =
    confidence === 'High' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
    confidence === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
    'bg-red-50 text-red-600 border border-red-200';

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(430, 560)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[400px] sm:w-[430px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0D212C] leading-tight">Confidence</h3>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF0FF] text-[#4F46E5]">
                  Calculation
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${confidenceColor}`}>
                  {confidence}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-normal mt-1">{countryName}</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="mt-3 text-xs text-gray-700 leading-relaxed font-normal">
            {data.description}
          </p>

          {/* Formula box */}
          <div className="mt-3 bg-gray-50/90 border border-gray-100 rounded-xl p-2.5 text-xs text-gray-500 font-normal leading-relaxed">
            Each input: Source tier + Agreement (2–6) → High 5–6 · Medium 4 · Low 2–3. Country = average of bands (High 3 · Medium 2 · Low 1).
          </div>

          {/* Table */}
          <div className="mt-3.5">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="font-semibold pb-2">INPUT</th>
                  <th className="font-semibold pb-2 pl-2">SOURCE</th>
                  <th className="font-semibold pb-2 pl-2">AGREEMENT</th>
                  <th className="font-semibold pb-2 pl-2 text-right">BAND</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11.5px]">
                {data.inputs.map((inp, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-2 font-normal text-gray-800">{inp.name}</td>
                    <td className="py-2 pl-2">
                      {inp.sourceType === 'Tier 1' ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="bg-emerald-100 text-emerald-700 text-[9.5px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200/60">Tier 1</span>
                          <span className="text-gray-600">{inp.sourceTier}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <span className="bg-[#FEF3EC] text-[#D95B14] text-[9.5px] font-semibold px-2 py-0.5 rounded-full border border-[#FCD9C6]/60">Ai estimate</span>
                          <span className="text-gray-600">{inp.sourceTier}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2 pl-2 text-gray-700">{inp.agreement} {inp.agreementScore}</td>
                    <td className="py-2 pl-2 text-right font-mono">
                      {inp.band} → <span className="font-bold text-gray-900">{inp.bandLabel}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Average row */}
          <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex items-center justify-between text-xs">
            <span className="font-bold text-gray-900">Average {data.averageCalc}</span>
            <span className="font-bold text-gray-900 font-mono">{data.averageScore} → {data.averageLabel}</span>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] text-gray-400">
            <span>≥ 2.5 High · 1.5–2.49 Medium · &lt; 1.5 Low</span>
            <span>Researched 14 Oct 2026</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ==========================================
// 7. Countries Tab Overlays (Images 1, 2, 3)
// ==========================================

export interface RegulatorySection {
  category: string;
  law: string;
  authority: string;
  description: string;
  year: string;
  urlText: string;
  url: string;
}

export interface RegulatoryProfile {
  country: string;
  sections: RegulatorySection[];
}

const REGULATORY_PROFILES_MAP: Record<string, RegulatoryProfile> = {
  'Saudi Arabia': {
    country: 'Saudi Arabia',
    sections: [
      {
        category: 'HEALTH DATA PROTECTION',
        law: 'Personal Data Protection Law (PDPL)',
        authority: 'Saudi Data & AI Authority (SDAIA)',
        description: 'Governs processing of personal and health data; cross-border transfer only under defined conditions.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://sdaia.gov.sa',
      },
      {
        category: 'MEDICAL DEVICE / SAMD',
        law: 'Medical Devices Interim Regulation',
        authority: 'Saudi Food & Drug Authority (SFDA)',
        description: 'Software that diagnoses or treats needs SFDA marketing authorisation before use.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://sfda.gov.sa',
      },
    ],
  },
  'United Arab Emirates': {
    country: 'United Arab Emirates',
    sections: [
      {
        category: 'HEALTH DATA PROTECTION',
        law: 'Federal Health Data Protection Law (Law No. 2)',
        authority: 'Ministry of Health & Prevention (MOHAP)',
        description: 'Strict onshore healthcare data retention mandate; restricts cross-border storage without ministry sign-off.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://mohap.gov.ae',
      },
      {
        category: 'MEDICAL DEVICE / SAMD',
        law: 'AI in Healthcare Clinical Governance Guidelines',
        authority: 'Emirates Health Services (EHS)',
        description: 'Mandatory clinical trial registration and algorithmic safety certification for AI SaMD tools.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://ehs.gov.ae',
      },
    ],
  },
  'United Kingdom': {
    country: 'United Kingdom',
    sections: [
      {
        category: 'HEALTH DATA PROTECTION',
        law: 'UK General Data Protection Regulation (UK GDPR)',
        authority: "Information Commissioner's Office (ICO)",
        description: 'Governs personal and special category health data; compliance with NHS Caldicott principles required.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://ico.org.uk',
      },
      {
        category: 'MEDICAL DEVICE / SAMD',
        law: 'Medical Devices Regulations (MDR)',
        authority: 'Medicines and Healthcare products Regulatory Agency (MHRA)',
        description: 'UKCA marking and clinical validation framework required for software as a medical device.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://gov.uk/mhra',
      },
    ],
  },
  'Jordan': {
    country: 'Jordan',
    sections: [
      {
        category: 'HEALTH DATA PROTECTION',
        law: 'Personal Data Protection Law No. 24',
        authority: 'Ministry of Digital Economy and Entrepreneurship (MODEE)',
        description: 'Regulates patient consent, personal health data privacy, and offshore data processing compliance.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://modee.gov.jo',
      },
      {
        category: 'MEDICAL DEVICE / SAMD',
        law: 'Medical Device Technical Registration Directives',
        authority: 'Jordan Food and Drug Administration (JFDA)',
        description: 'Technical evaluation and mandatory pre-market approval for digital diagnosis and treatment platforms.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://jfda.jo',
      },
    ],
  },
  'Estonia': {
    country: 'Estonia',
    sections: [
      {
        category: 'HEALTH DATA PROTECTION',
        law: 'EU GDPR & National Personal Data Protection Act',
        authority: 'Estonian Data Protection Inspectorate (AKI)',
        description: 'Patient-controlled access permissions across the national e-Health patient portal and secure exchange.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://aki.ee',
      },
      {
        category: 'MEDICAL DEVICE / SAMD',
        law: 'EU Medical Device Regulation (EU MDR 2017/745)',
        authority: 'State Agency of Medicines (Ravimiamet)',
        description: 'CE mark certification under Class IIa/IIb required for AI algorithmic diagnostic solutions.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://ravimiamet.ee',
      },
    ],
  },
  'South Korea': {
    country: 'South Korea',
    sections: [
      {
        category: 'HEALTH DATA PROTECTION',
        law: 'Personal Information Protection Act (PIPA)',
        authority: 'Personal Information Protection Commission (PIPC)',
        description: 'Rigorous pseudonymization and data export rules for clinical AI training and EHR aggregation.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://pipc.go.kr',
      },
      {
        category: 'MEDICAL DEVICE / SAMD',
        law: 'AI Medical Device Approval & Review Guidelines',
        authority: 'Ministry of Food and Drug Safety (MFDS)',
        description: 'Fast-track innovative medical device designation and clinical accuracy verification.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://mfds.go.kr',
      },
    ],
  },
  'United States': {
    country: 'United States',
    sections: [
      {
        category: 'HEALTH DATA PROTECTION',
        law: 'Health Insurance Portability and Accountability Act (HIPAA)',
        authority: 'Office for Civil Rights (OCR) / HHS',
        description: 'Federal statutory protections for electronic protected health information (ePHI) and security rule.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://hhs.gov/hipaa',
      },
      {
        category: 'MEDICAL DEVICE / SAMD',
        law: 'FDA AI/ML-Enabled Medical Device Guidelines',
        authority: 'U.S. Food & Drug Administration (FDA) CDRH',
        description: '510(k) pre-market clearance or De Novo authorization required for clinical decision support.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://fda.gov/cdrh',
      },
    ],
  },
  'Azerbaijan': {
    country: 'Azerbaijan',
    sections: [
      {
        category: 'HEALTH DATA PROTECTION',
        law: 'Law on Personal Data No. 998-IIIQ',
        authority: 'Ministry of Digital Development and Transport',
        description: 'Regulates digital health registries and cross-border transfer of confidential patient records.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://mincom.gov.az',
      },
      {
        category: 'MEDICAL DEVICE / SAMD',
        law: 'Medical Equipment & Software Registration Rules',
        authority: 'Analytical Expertise Center / Ministry of Health',
        description: 'Import licensing and regulatory validation needed for clinical software applications.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://pharma.az',
      },
    ],
  },
};

export function RegulatoryProfileOverlayTrigger({
  countryName,
  children,
  className = "",
}: {
  countryName: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const profile = REGULATORY_PROFILES_MAP[countryName] || {
    country: countryName,
    sections: [
      {
        category: 'HEALTH DATA PROTECTION',
        law: 'Personal Data Protection Regulation',
        authority: 'National Data Authority',
        description: 'Governs processing of personal and health data; cross-border transfer only under defined conditions.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://who.int',
      },
      {
        category: 'MEDICAL DEVICE / SAMD',
        law: 'Medical Devices Interim Regulation',
        authority: 'National Food & Drug Authority',
        description: 'Software that diagnoses or treats needs marketing authorisation before clinical use.',
        year: '2026',
        urlText: 'Official text 2026',
        url: 'https://who.int',
      },
    ],
  };

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(410, 440)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[380px] sm:w-[410px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                Regulatory profile
              </h3>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {profile.country}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Web source chip */}
          <div className="mt-2.5">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F3FC] text-[#0A66C2]">
              Web source
            </span>
          </div>

          {/* Regulatory Sections */}
          <div className="mt-4 space-y-4">
            {profile.sections.map((section, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-3.5 border-t border-gray-100' : ''}>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {section.category}
                </div>
                <div className="text-sm font-bold text-gray-900 mt-1 leading-snug">
                  {section.law}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {section.authority}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-normal mt-1.5">
                  {section.description}
                </p>
                <a
                  href={section.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#0084D1] hover:underline font-normal mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>{section.urlText}</span>
                </a>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Official sources only
            </span>
            <span className="text-[11px] text-gray-400 font-normal">
              Retrieved 14 Oct 2026
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function SpendPerCapitaOverlayTrigger({
  countryName,
  spendCapita,
  children,
  className = "",
}: {
  countryName: string;
  spendCapita?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const finalSpend = spendCapita || '$1,825';

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(370, 220)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[350px] sm:w-[370px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                Health spend per capita
              </h3>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {countryName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Web source chip */}
          <div className="mt-2.5">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F3FC] text-[#0A66C2]">
              Web source
            </span>
          </div>

          {/* Big Number & Year */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 tracking-tight font-mono">
              {finalSpend}
            </span>
            <span className="text-xs text-gray-500 font-normal font-sans">
              2022 data
            </span>
          </div>

          {/* Source Section */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              SOURCE
            </div>
            <a
              href="https://apps.who.int/nha/database"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#0084D1] hover:underline font-normal mt-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>WHO – Global Health Expenditure Database</span>
            </a>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function PopulationOverlayTrigger({
  countryName,
  population,
  children,
  className = "",
}: {
  countryName: string;
  population?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const finalPop = population || '37.0M';

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(370, 240)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[350px] sm:w-[370px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                Population
              </h3>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {countryName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Web source chip */}
          <div className="mt-2.5">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E8F3FC] text-[#0A66C2]">
              Web source
            </span>
          </div>

          {/* Big Number & Year */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 tracking-tight font-mono">
              {finalPop}
            </span>
            <span className="text-xs text-gray-500 font-normal font-sans">
              2024 data
            </span>
          </div>

          {/* Source Section */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              SOURCE
            </div>
            <a
              href="https://data.worldbank.org/indicator/SP.POP.TOTL"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#0084D1] hover:underline font-normal mt-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>World Bank – Population, total (SP.POP.TOTL)</span>
            </a>
          </div>

          {/* Footer (retrieved date removed per instructions) */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Tier 1 · Official
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ==========================================
// 8. Obtainable Slice Overlay (Image 3)
// ==========================================

const OBTAINABLE_SLICE_DETAILS: Record<string, {
  percentage: string;
  description: string;
  sources: Array<{ name: string; year: string; url: string }>;
}> = {
  'Saudi Arabia': {
    percentage: '1.8%',
    description: 'Large, competitive market with several national platforms already live; a conservative 1.8% is assumed for one solution.',
    sources: [
      { name: 'Ministry of Health – Health Sector Transformation Program', year: '2025', url: 'https://moh.gov.sa/digital' },
    ],
  },
  'United Arab Emirates': {
    percentage: '1.0%',
    description: 'Mature health tech ecosystem with existing enterprise EHR integrations; conservative 1.0% addressable slice.',
    sources: [
      { name: 'Ministry of Health & Prevention – Digital Health Strategy', year: '2024', url: 'https://mohap.gov.ae' },
    ],
  },
  'United Kingdom': {
    percentage: '1.5%',
    description: 'Integrated Care Systems procurement model; conservative 1.5% obtainable slice for targeted clinical tool.',
    sources: [
      { name: 'NHS Transformation Directorate – Digital Health Framework', year: '2024', url: 'https://england.nhs.uk' },
    ],
  },
  'Jordan': {
    percentage: '1.5%',
    description: 'Emerging regional digital health hub with donor-backed initiatives; 1.5% addressable market penetration.',
    sources: [
      { name: 'Ministry of Health Jordan – Health Sector Reform Plan', year: '2024', url: 'https://moh.gov.jo' },
    ],
  },
  'Estonia': {
    percentage: '1.5%',
    description: 'Highly digitized European market with centralized registries; realistic 1.5% specialized solution slice.',
    sources: [
      { name: 'Estonian Health and Welfare Information Systems Center (TEHIK)', year: '2024', url: 'https://tehik.ee' },
    ],
  },
  'South Korea': {
    percentage: '0.2%',
    description: 'Large advanced healthcare system with high domestic competition; 0.2% obtainable market share.',
    sources: [
      { name: 'Ministry of Health & Welfare – Smart Healthcare Policy', year: '2024', url: 'https://mohw.go.kr' },
    ],
  },
  'United States': {
    percentage: '0.013%',
    description: 'Massive overall TAM but heavily fragmented payer network; 0.013% initial expansion slice.',
    sources: [
      { name: 'CMS National Health Expenditure Accounts (NHEA)', year: '2024', url: 'https://cms.gov' },
    ],
  },
  'Azerbaijan': {
    percentage: '2.2%',
    description: 'Concentrated public healthcare provider sector allowing faster single-contract capture; 2.2% slice.',
    sources: [
      { name: 'State Agency on Mandatory Health Insurance (ITS)', year: '2024', url: 'https://its.gov.az' },
    ],
  },
};

export function ObtainableSliceOverlayTrigger({
  countryName,
  obtainableSlice,
  children,
  className = "",
}: {
  countryName: string;
  obtainableSlice?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { coords, targetRef, handleMouseEnter, handleMouseLeave, handleClose, clearHideTimeout } = useOverlayPositioning();

  const data = OBTAINABLE_SLICE_DETAILS[countryName] || {
    percentage: obtainableSlice || '1.8%',
    description: 'Large, competitive market with several national platforms already live; a conservative 1.8% is assumed for one solution.',
    sources: [
      { name: 'Ministry of Health – Health Sector Transformation Program', year: '2025', url: 'https://moh.gov.sa/digital' },
    ],
  };

  const finalPercentage = obtainableSlice || data.percentage;

  return (
    <div
      ref={targetRef}
      onMouseEnter={() => handleMouseEnter(370, 310)}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[350px] sm:w-[370px] p-5 bg-white text-[#0D212C] rounded-2xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0D212C] leading-tight">
                Obtainable slice
              </h3>
              <p className="text-xs text-gray-500 font-normal mt-0.5">
                {countryName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors cursor-pointer"
              aria-label="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Ai estimate chip */}
          <div className="mt-2.5">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3EC] text-[#D95B14]">
              Ai estimate
            </span>
          </div>

          {/* Big Percentage */}
          <div className="mt-3.5">
            <span className="text-2xl font-bold text-gray-900 tracking-tight font-mono">
              {finalPercentage}
            </span>
          </div>

          {/* Description */}
          <p className="mt-2 text-xs text-gray-700 leading-relaxed font-normal">
            {data.description}
          </p>

          {/* Based On section */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              BASED ON
            </div>
            <div className="mt-2 space-y-1.5">
              {data.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-1.5 text-xs text-[#0084D1] hover:underline font-normal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{src.name} {src.year}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] text-gray-400">
            <span>Kept conservative · to validate</span>
            <span>Estimated 14 Oct 2026</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

