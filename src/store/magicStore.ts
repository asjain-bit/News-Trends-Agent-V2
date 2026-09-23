import { create } from 'zustand';

export interface ComponentItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  status: 'Completed' | 'In progress' | 'Prioritised' | 'New';
  reuseCount: number;
  complexity?: 'Low' | 'Medium' | 'High';
  effort?: string;
  dependencies?: string[] | string;
  keyCapabilities?: string[] | string;
  description?: string;
  constraints?: string;
  attachments?: string[] | string;
  file?: string;
  isDeactivated?: boolean;
}

export interface SolutionItem {
  id: string;
  name: string;
  shortCode: string;
  positioning: 'Common' | 'Mixed' | 'Distinctive';
  status: 'Completed' | 'In progress' | 'Prioritised' | 'New';
  score: number;
  revenue3Yr: string;
  compCount: number;
  annualRev?: string;
  description?: string;
  keyCapabilities?: string[] | string;
  constraints?: string;
  attachments?: string[] | string;
  file?: string;
  isDeactivated?: boolean;
}

export interface CountryItem {
  id: string;
  name: string;
  spendCapita: string;
  population: string;
  totalSpend: string;
  digitalShare: string;
  obtainableSlice: string;
  dealAnchor: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export const DEFAULT_COMPONENTS: ComponentItem[] = [
  { id: 'c1', name: 'AI Chatbot · CRAG', subtitle: 'GenAI clinical assistant', category: 'AI / GenAI', status: 'In progress', reuseCount: 7, complexity: 'High', effort: '~50 pd', keyCapabilities: 'Clinical query RAG, Citations grounding, Multi-lingual patient triage', description: 'GenAI clinical assistant powered by Corrective Retrieval-Augmented Generation.', dependencies: 'Patient Profile (c3), Analytics (c5)', attachments: ['CRAG_Model_Card.pdf', 'Prompt_Templates.docx', 'Eval_Benchmark.xlsx'] },
  { id: 'c2', name: 'Payment Module', subtitle: 'Billing & checkout core', category: 'Payments', status: 'Completed', reuseCount: 6, complexity: 'Medium', effort: '~15 pd', keyCapabilities: 'Multi-currency checkout, Split settlement, Insurance co-pay routing', description: 'Billing & checkout core supporting clinical transactions and claims co-pay.', dependencies: 'Insurance Directory (c10)', attachments: ['Payment_Gateway_Spec.pdf', 'Settlement_Rules.xlsx'] },
  { id: 'c3', name: 'Patient Profile', subtitle: 'Master patient record', category: 'Core data', status: 'Completed', reuseCount: 5, complexity: 'Low', effort: '~12 pd', keyCapabilities: 'Longitudinal health history, Consent management, Biometric identity', description: 'Master patient record unifying demographic, insurance, and medical timeline data.', dependencies: 'None (Core foundation)', attachments: ['Master_Patient_Schema.pdf', 'Consent_Spec.pdf', 'HL7_MPI_Guide.pdf'] },
  { id: 'c4', name: 'Clinical Notes · NLP', subtitle: 'Ambient documentation', category: 'AI / GenAI', status: 'New', reuseCount: 4, complexity: 'Medium', effort: '~28 pd', keyCapabilities: 'Ambient conversation capture, SOAP note structuring, ICD-10 tagging', description: 'Ambient documentation engine converting physician-patient dialogue into EHR notes.', dependencies: 'AI Chatbot (c1), Patient Profile (c3)', attachments: ['NLP_Benchmark.pdf', 'SOAP_Template.docx'] },
  { id: 'c5', name: 'Analytics & Dashboards', subtitle: 'Operational BI & Metrics', category: 'Data / BI', status: 'Prioritised', reuseCount: 4, complexity: 'Medium', effort: '~20 pd', keyCapabilities: 'Real-time KPI aggregation, Custom visual builders, Scheduled export', description: 'Operational BI and clinical analytics dashboard engine.', dependencies: 'Patient Profile (c3)', attachments: ['Dashboard_Metrics.xlsx', 'BI_Widgets_Guide.pdf'] },
  { id: 'c6', name: 'Fraud-Claim Detection', subtitle: 'Claims anomaly engine', category: 'InsurTech / AI', status: 'In progress', reuseCount: 1, complexity: 'High', effort: '~35 pd', keyCapabilities: 'Anomaly detection, Payer pattern clustering, Flagging workflow', description: 'Claims anomaly engine identifying irregular billing patterns before submission.', dependencies: 'Payment Module (c2), Insurance Directory (c10)', attachments: ['Fraud_Heuristics.pdf'] },
  { id: 'c7', name: 'Appointment Booking', subtitle: 'Scheduling module', category: 'Workflow', status: 'Completed', reuseCount: 3, complexity: 'Low', effort: '~18 pd', keyCapabilities: 'Multi-provider slot calendar, Automated SMS/WhatsApp, Waitlist queuing', description: 'Scheduling module coordinating provider availability and patient visits.', dependencies: 'Patient Profile (c3)', attachments: ['Booking_API.pdf', 'Calendar_Sync_Doc.docx'] },
  { id: 'c8', name: 'e-Prescription', subtitle: 'Prescribing & pharmacy', category: 'Workflow', status: 'Prioritised', reuseCount: 3, complexity: 'Low', effort: '~14 pd', keyCapabilities: 'Rx digital signature, Drug contraindication check, Pharmacy dispatch', description: 'Prescribing and medication fulfillment workflow component.', dependencies: 'Patient Profile (c3), Appointment Booking (c7)', attachments: ['eRx_Validation.pdf', 'Signature_Crypto.pdf', 'Pharmacy_Rules.pdf'] },
  { id: 'c9', name: 'LIS · Lab Information', subtitle: 'Diagnostic lab bridge', category: 'Diagnostics', status: 'Completed', reuseCount: 3, complexity: 'Medium', effort: '~22 pd', keyCapabilities: 'HL7 instrument bridge, Specimen barcode tracking, Auto-validation', description: 'Diagnostic lab bridge connecting pathology equipment directly to patient records.', dependencies: 'Patient Profile (c3)', attachments: ['LIS_Interface_Spec.pdf', 'Instrument_Bridge.xlsx'] },
  { id: 'c10', name: 'Insurance Directory', subtitle: 'Payer rules engine', category: 'InsurTech', status: 'In progress', reuseCount: 1, complexity: 'Medium', effort: '~16 pd', keyCapabilities: 'Payer rules engine, Real-time benefit check, Policy versioning', description: 'Payer directory managing reimbursement rules and coverage criteria.', dependencies: 'None (Core rules)', attachments: ['Payer_Directory_v3.xlsx'] },
];

export const DEFAULT_SOLUTIONS: SolutionItem[] = [
  { id: 's1', name: 'EMR & Interoperability', shortCode: 'EMR', positioning: 'Common', status: 'Completed', score: 66, revenue3Yr: '$24M', compCount: 8, annualRev: '8.0', keyCapabilities: 'FHIR & HL7 exchange, Master patient index, Clinical charts sync', description: 'Comprehensive healthcare interoperability and electronic medical records core connecting clinical workflows.', constraints: 'HIPAA & GDPR data residency, FHIR R4 standard', attachments: ['EMR_Architecture_v2.pdf', 'FHIR_Endpoints.xlsx', 'HL7_Interface.docx'] },
  { id: 's2', name: 'Hospital Ops & Clinical Workflow', shortCode: 'HOSP OPS', positioning: 'Mixed', status: 'In progress', score: 75, revenue3Yr: '$27M', compCount: 8, annualRev: '9.0', keyCapabilities: 'Bed capacity forecasting, Smart scheduling, Ambient voice triage', description: 'Operational orchestration suite streamlining bed management, emergency triage, and appointment logistics.', constraints: 'Sub-second latency SLA, On-premise fallback', attachments: ['Hospital_Ops_Spec.pdf', 'Triage_Flowchart.pdf'] },
  { id: 's3', name: 'Home & Community Care', shortCode: 'HOME CARE', positioning: 'Mixed', status: 'New', score: 58, revenue3Yr: '$17M', compCount: 5, annualRev: '5.7', keyCapabilities: 'Offline clinician sync, Remote vitals logging, Caregiver portal', description: 'Decentralized healthcare delivery platform connecting home care providers and family caregivers.', constraints: 'Offline-first mobile support, Low bandwidth', attachments: ['Home_Care_Flow.docx', 'Caregiver_App_Guide.pdf'] },
  { id: 's4', name: 'Remote Patient Monitoring', shortCode: 'RPM', positioning: 'Distinctive', status: 'Prioritised', score: 78, revenue3Yr: '$25M', compCount: 4, annualRev: '8.3', keyCapabilities: 'IoT telemetry ingestion, Real-time anomaly alerts, Biomarker trends', description: 'Continuous physiological monitoring and predictive deterioration alert system for chronic illness.', constraints: 'FDA Class II telemetry, ISO 27001', attachments: ['RPM_Device_Matrix.xlsx', 'Telemetry_Specs.pdf', 'FDA_Validation.pdf'] },
  { id: 's5', name: 'InsurTech & Reimbursement', shortCode: 'INSURTECH', positioning: 'Distinctive', status: 'In progress', score: 80, revenue3Yr: '$21M', compCount: 5, annualRev: '7.0', keyCapabilities: 'Automated pre-auth, Graph neural fraud scoring, Eligibility verification', description: 'AI-driven claims adjudicator and automated pre-authorization engine bridging providers with insurance payers.', constraints: 'Payer API compliance, Regional insurance rules', attachments: ['Claims_Rulebook.pdf', 'Fraud_Heuristics.docx'] },
  { id: 's6', name: 'Drug Discovery', shortCode: 'DRUG DISC', positioning: 'Distinctive', status: 'New', score: 69, revenue3Yr: '$19M', compCount: 1, annualRev: '6.5', keyCapabilities: 'Variant annotation, Molecular docking scoring, Trial cohort matching', description: 'Genomic biomarker intelligence and clinical trial cohort matching platform powered by deep learning.', constraints: 'High-compute GPU infrastructure required', attachments: ['Genomics_Pipeline.pdf', 'Docking_Models.xlsx', 'Cohort_Criteria.pdf'] },
  { id: 's7', name: 'Pharmacy & Medication', shortCode: 'PHARMACY', positioning: 'Mixed', status: 'Prioritised', score: 59, revenue3Yr: '$11M', compCount: 3, annualRev: '3.7', keyCapabilities: 'Interaction screening, Barcode dispensing, Digital prescription sign', description: 'End-to-end e-prescription management and centralized pharmacy inventory fulfillment system.', constraints: 'National drug formulary regulation', attachments: ['Pharmacy_SOP_v1.pdf'] },
  { id: 's8', name: 'Population Health & Analytics', shortCode: 'POP HEALTH', positioning: 'Distinctive', status: 'New', score: 73, revenue3Yr: '$25M', compCount: 4, annualRev: '8.3', keyCapabilities: 'Risk stratification, Outbreak heatmaps, WHO indicator dashboards', description: 'Epidemiological surveillance, risk stratification, and preventive health intervention analytics platform.', constraints: 'De-identified data governance, Multi-tenant DB', attachments: ['PopHealth_Methodology.pdf', 'WHO_Metrics.xlsx'] },
];

export const DEFAULT_COUNTRIES: CountryItem[] = [
  { id: 'cnt1', name: 'United Arab Emirates', spendCapita: '$1,842', population: '9.4M', totalSpend: '$17B', digitalShare: '3%', obtainableSlice: '1%', dealAnchor: '$5M', confidence: 'High' },
  { id: 'cnt2', name: 'Saudi Arabia', spendCapita: '$1,485', population: '36.9M', totalSpend: '$55B', digitalShare: '3%', obtainableSlice: '0.37%', dealAnchor: '$6M', confidence: 'High' },
  { id: 'cnt3', name: 'Jordan', spendCapita: '$304', population: '11.3M', totalSpend: '$3B', digitalShare: '2.5%', obtainableSlice: '1.5%', dealAnchor: '$1.3M', confidence: 'Medium' },
  { id: 'cnt4', name: 'Estonia', spendCapita: '$1,733', population: '1.3M', totalSpend: '$2B', digitalShare: '6%', obtainableSlice: '1.5%', dealAnchor: '$2M', confidence: 'High' },
  { id: 'cnt5', name: 'South Korea', spendCapita: '$2,600', population: '51.7M', totalSpend: '$134B', digitalShare: '3%', obtainableSlice: '0.2%', dealAnchor: '$8M', confidence: 'Medium' },
  { id: 'cnt6', name: 'United States', spendCapita: '$12,555', population: '333M', totalSpend: '$4.2T', digitalShare: '3%', obtainableSlice: '0.013%', dealAnchor: '$16M', confidence: 'Low' },
  { id: 'cnt7', name: 'Azerbaijan', spendCapita: '$230', population: '10.1M', totalSpend: '$2B', digitalShare: '2%', obtainableSlice: '2.2%', dealAnchor: '$1M', confidence: 'Low' },
];

export const DEFAULT_REUSE_MATRIX: Record<string, string[]> = {
  c1: ['s1', 's2', 's3', 's4', 's5', 's7', 's8'], // 7
  c2: ['s1', 's2', 's3', 's4', 's5', 's7'],     // 6
  c3: ['s1', 's2', 's3', 's4', 's6'],          // 5
  c4: ['s1', 's2', 's5', 's8'],                // 4
  c5: ['s1', 's2', 's3', 's8'],                // 4
  c6: ['s5'],                                  // 1
  c7: ['s1', 's2', 's3'],                      // 3
  c8: ['s1', 's2', 's7'],                      // 3
  c9: ['s1', 's2', 's8'],                      // 3
  c10: ['s5'],                                 // 1
};

interface MagicState {
  components: ComponentItem[];
  solutions: SolutionItem[];
  countries: CountryItem[];
  reuseMatrix: Record<string, string[]>;
  setComponents: (components: ComponentItem[] | ((prev: ComponentItem[]) => ComponentItem[])) => void;
  setSolutions: (solutions: SolutionItem[] | ((prev: SolutionItem[]) => SolutionItem[])) => void;
  setCountries: (countries: CountryItem[] | ((prev: CountryItem[]) => CountryItem[])) => void;
  setReuseMatrix: (matrix: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => void;
  addComponent: (comp: ComponentItem) => void;
  updateComponent: (comp: ComponentItem) => void;
  deleteComponent: (id: string) => void;
  toggleDeactivateComponent: (id: string) => void;
}

const loadStored = <T>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // Ignore error
  }
  return fallback;
};

export const useMagicStore = create<MagicState>((set, get) => ({
  components: loadStored('m42_magic_components', DEFAULT_COMPONENTS),
  solutions: loadStored('m42_magic_solutions', DEFAULT_SOLUTIONS),
  countries: loadStored('m42_magic_countries', DEFAULT_COUNTRIES),
  reuseMatrix: loadStored('m42_magic_reuse_matrix', DEFAULT_REUSE_MATRIX),

  setComponents: (updater) => {
    set((state) => {
      const next = typeof updater === 'function' ? updater(state.components) : updater;
      try { localStorage.setItem('m42_magic_components', JSON.stringify(next)); } catch (e) {}
      return { components: next };
    });
  },

  setSolutions: (updater) => {
    set((state) => {
      const next = typeof updater === 'function' ? updater(state.solutions) : updater;
      try { localStorage.setItem('m42_magic_solutions', JSON.stringify(next)); } catch (e) {}
      return { solutions: next };
    });
  },

  setCountries: (updater) => {
    set((state) => {
      const next = typeof updater === 'function' ? updater(state.countries) : updater;
      try { localStorage.setItem('m42_magic_countries', JSON.stringify(next)); } catch (e) {}
      return { countries: next };
    });
  },

  setReuseMatrix: (updater) => {
    set((state) => {
      const next = typeof updater === 'function' ? updater(state.reuseMatrix) : updater;
      try { localStorage.setItem('m42_magic_reuse_matrix', JSON.stringify(next)); } catch (e) {}
      return { reuseMatrix: next };
    });
  },

  addComponent: (comp) => {
    get().setComponents((prev) => [comp, ...prev]);
  },

  updateComponent: (comp) => {
    get().setComponents((prev) => prev.map((c) => (c.id === comp.id ? comp : c)));
  },

  deleteComponent: (id) => {
    get().setComponents((prev) => prev.filter((c) => c.id !== id));
  },

  toggleDeactivateComponent: (id) => {
    get().setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isDeactivated: !c.isDeactivated } : c))
    );
  },
}));
