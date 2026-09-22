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
  dependencies?: string[];
  keyCapabilities?: string[];
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
  { id: 'c1', name: 'AI Chatbot · CRAG', subtitle: 'GenAI clinical assistant', category: 'AI / GenAI', status: 'In progress', reuseCount: 7, complexity: 'High', effort: '~50 pd' },
  { id: 'c2', name: 'Payment Module', subtitle: 'Billing & checkout core', category: 'Payments', status: 'Completed', reuseCount: 6, complexity: 'Medium', effort: '~15 pd' },
  { id: 'c3', name: 'Patient Profile', subtitle: 'Master patient record', category: 'Core data', status: 'Completed', reuseCount: 5, complexity: 'Low', effort: '~12 pd' },
  { id: 'c4', name: 'Clinical Notes · NLP', subtitle: 'Ambient documentation', category: 'AI / GenAI', status: 'New', reuseCount: 4, complexity: 'Medium', effort: '~28 pd' },
  { id: 'c5', name: 'Analytics & Dashboards', subtitle: 'Operational BI & Metrics', category: 'Data / BI', status: 'Prioritised', reuseCount: 4, complexity: 'Medium', effort: '~20 pd' },
  { id: 'c6', name: 'Fraud-Claim Detection', subtitle: 'Claims anomaly engine', category: 'InsurTech / AI', status: 'In progress', reuseCount: 1, complexity: 'High', effort: '~35 pd' },
  { id: 'c7', name: 'Appointment Booking', subtitle: 'Scheduling module', category: 'Workflow', status: 'Completed', reuseCount: 3, complexity: 'Low', effort: '~18 pd' },
  { id: 'c8', name: 'e-Prescription', subtitle: 'Prescribing & pharmacy', category: 'Workflow', status: 'Prioritised', reuseCount: 3, complexity: 'Low', effort: '~14 pd' },
  { id: 'c9', name: 'LIS · Lab Information', subtitle: 'Diagnostic lab bridge', category: 'Diagnostics', status: 'Completed', reuseCount: 3, complexity: 'Medium', effort: '~22 pd' },
  { id: 'c10', name: 'Insurance Directory', subtitle: 'Payer rules engine', category: 'InsurTech', status: 'In progress', reuseCount: 1, complexity: 'Medium', effort: '~16 pd' },
];

export const DEFAULT_SOLUTIONS: SolutionItem[] = [
  { id: 's1', name: 'EMR & Interoperability', shortCode: 'EMR', positioning: 'Common', status: 'Completed', score: 66, revenue3Yr: '$24M', compCount: 8, annualRev: '8.0' },
  { id: 's2', name: 'Hospital Ops & Clinical Workflow', shortCode: 'HOSP OPS', positioning: 'Mixed', status: 'In progress', score: 75, revenue3Yr: '$27M', compCount: 8, annualRev: '9.0' },
  { id: 's3', name: 'Home & Community Care', shortCode: 'HOME CARE', positioning: 'Mixed', status: 'New', score: 58, revenue3Yr: '$17M', compCount: 5, annualRev: '5.7' },
  { id: 's4', name: 'Remote Patient Monitoring', shortCode: 'RPM', positioning: 'Distinctive', status: 'Prioritised', score: 78, revenue3Yr: '$25M', compCount: 4, annualRev: '8.3' },
  { id: 's5', name: 'InsurTech & Reimbursement', shortCode: 'INSURTECH', positioning: 'Distinctive', status: 'In progress', score: 80, revenue3Yr: '$21M', compCount: 5, annualRev: '7.0' },
  { id: 's6', name: 'Drug Discovery', shortCode: 'DRUG DISC', positioning: 'Distinctive', status: 'New', score: 69, revenue3Yr: '$19M', compCount: 1, annualRev: '6.5' },
  { id: 's7', name: 'Pharmacy & Medication', shortCode: 'PHARMACY', positioning: 'Mixed', status: 'Prioritised', score: 59, revenue3Yr: '$11M', compCount: 3, annualRev: '3.7' },
  { id: 's8', name: 'Population Health & Analytics', shortCode: 'POP HEALTH', positioning: 'Distinctive', status: 'New', score: 73, revenue3Yr: '$25M', compCount: 4, annualRev: '8.3' },
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
