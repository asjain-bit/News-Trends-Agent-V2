import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Check, 
  X, 
  Search, 
  Edit2,
  ArrowUpDown,
  History,
  RotateCcw,
  Save,
  Info,
  ArrowLeft,
  Layers,
  Globe,
  TrendingUp,
  Sparkles,
  Building2,
  ShieldCheck,
  BarChart3,
  CheckCircle2,
  Upload,
  FileText
} from 'lucide-react';

// Custom hook for clicking outside dropdowns
function useOnClickOutside(ref: React.RefObject<any>, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Data definitions...


// Types
export interface ComponentItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  status: 'In progress' | 'Completed' | 'New' | 'Prioritised';
  reuseCount: number;
}

export interface SolutionItem {
  id: string;
  name: string;
  shortCode: string;
  positioning: 'Common' | 'Mixed' | 'Distinctive';
  status: 'In progress' | 'Completed' | 'New' | 'Prioritised';
  score: number;
  revenue3Yr: string;
  compCount: number;
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

export interface ReuseVersion {
  id: string;
  version: string;
  timestamp: string;
  author: string;
  note: string;
  matrix: Record<string, string[]>;
}

// Solution detailed profiles for Solution Detail Page
const SOLUTION_PROFILES: Record<string, {
  summary: string;
  targetAudience: string;
  keyHighlights: string[];
  strategicRationale: string;
  targetCountryIds: string[];
}> = {
  s1: {
    summary: 'Comprehensive healthcare interoperability and electronic medical records core connecting clinical workflows, lab bridges, and billing systems into unified FHIR-standard health records.',
    targetAudience: 'National Health Authorities, Tertiary Hospital Networks, Multi-specialty Clinics',
    keyHighlights: [
      'FHIR & HL7 v2/v3 compliant bidirectional data interchange',
      'Real-time master patient index resolution with 99.8% deduplication accuracy',
      'Zero-latency clinical charts sync across emergency, inpatient, and outpatient modules',
      'Automated diagnostic lab bridge integrating LIS instruments directly'
    ],
    strategicRationale: 'Acts as the foundational platform tier enabling all ancillary modular extensions and insurance claim workflows across primary care networks.',
    targetCountryIds: ['cnt1', 'cnt2', 'cnt4', 'cnt5']
  },
  s2: {
    summary: 'Operational orchestration suite streamlining bed management, emergency triage, ambient clinical note capturing, and automated appointment logistics.',
    targetAudience: 'Academic Medical Centers, Acute Care Hospitals, Private Hospital Groups',
    keyHighlights: [
      'Ambient clinical voice-to-structured notes generation reducing documentation burden by 45%',
      'Predictive bed capacity forecasting and dynamic surgical suite scheduling',
      'Unified nursing triage dispatch and automated shift handoffs',
      'Smart appointment booking with automated multi-channel patient reminders'
    ],
    strategicRationale: 'Directly tackles physician burnout while improving operational throughput and asset utilization rates across large healthcare facilities.',
    targetCountryIds: ['cnt1', 'cnt2', 'cnt3', 'cnt6']
  },
  s3: {
    summary: 'Decentralized healthcare delivery platform connecting home care providers, community health workers, and family caregivers to central clinical teams.',
    targetAudience: 'Home Health Agencies, Elderly Care Networks, Regional Health Authorities',
    keyHighlights: [
      'Offline-first mobile clinician app with auto-synchronization upon network reconnect',
      'Remote vitals integration and early warning triage scoring',
      'Integrated payment checkout and mobile billing collection',
      'Family caregiver coordination portal with medication adherence alerts'
    ],
    strategicRationale: 'Reduces costly hospital readmissions and shifts acute care burdens into highly cost-effective home settings.',
    targetCountryIds: ['cnt1', 'cnt4', 'cnt5']
  },
  s4: {
    summary: 'Continuous physiological monitoring and predictive deterioration alert system for chronic illness and post-discharge recovery.',
    targetAudience: 'Cardiology Clinics, Chronic Disease Management Programs, Insurer Risk Teams',
    keyHighlights: [
      'Medical-grade IoT device telemetry ingestion with edge anomaly detection',
      'Clinical rules engine with automated escalation pathways for care teams',
      'Longitudinal trend analytics and biomarker trajectory forecasting',
      'AI Chatbot patient engagement for symptom check-ins and protocol adherence'
    ],
    strategicRationale: 'High-margin recurring SaaS revenue with proven reduction in emergency department visits among high-risk patient cohorts.',
    targetCountryIds: ['cnt1', 'cnt2', 'cnt6']
  },
  s5: {
    summary: 'AI-driven claims adjudicator, automated pre-authorization engine, and fraud anomaly detector bridging healthcare providers with insurance payers.',
    targetAudience: 'Health Insurance Payers, Third-Party Administrators (TPAs), Hospital Finance Teams',
    keyHighlights: [
      'Real-time automated pre-authorization approvals within seconds using clinical criteria',
      'Graph neural network fraud and claim anomaly scoring engine',
      'Integrated payer policy directory with instant coverage eligibility verification',
      'Accelerated revenue cycle management with clean claims rate exceeding 98%'
    ],
    strategicRationale: 'Captures substantial obtainable deal anchors in private insurance-heavy markets like UAE, Saudi Arabia, and the United States.',
    targetCountryIds: ['cnt1', 'cnt2', 'cnt6']
  },
  s6: {
    summary: 'Genomic biomarker intelligence and clinical trial cohort matching platform powered by deep learning and automated molecular screening.',
    targetAudience: 'Pharma Research Labs, BioTech Accelerators, Academic Oncology Centers',
    keyHighlights: [
      'High-throughput genomic variant annotation and therapeutic target ranking',
      'Automated patient trial eligibility matching based on structured EMR criteria',
      'Multi-omics data lake bridge with privacy-preserving federated analytics',
      'Interactive molecular docking visualization and candidate scoring'
    ],
    strategicRationale: 'Strategic distinctive solution positioned for high-value research partnerships and national genomics initiatives.',
    targetCountryIds: ['cnt1', 'cnt2', 'cnt5', 'cnt6']
  },
  s7: {
    summary: 'End-to-end e-prescription management, drug-drug interaction screening, and centralized pharmacy inventory fulfillment system.',
    targetAudience: 'Retail Pharmacy Chains, Hospital Pharmacies, National Drug Authorities',
    keyHighlights: [
      'Instant clinical drug interaction, contraindication, and dosage verification',
      'Barcode-verified medication dispensing and robotic packing integration',
      'Electronic prescription transfer with digital signature cryptography',
      'Dynamic inventory replenishment forecasting based on real-time dispensing trends'
    ],
    strategicRationale: 'Ensures zero medication dispensing errors while integrating seamlessly with payment gateways and patient mobile apps.',
    targetCountryIds: ['cnt1', 'cnt2', 'cnt3', 'cnt4']
  },
  s8: {
    summary: 'Epidemiological surveillance, risk stratification, and preventive health intervention analytics platform for entire regional populations.',
    targetAudience: 'Ministries of Health, Public Health Institutes, Regional Health Authorities',
    keyHighlights: [
      'Population-scale chronic disease risk stratification and clustering models',
      'Disease outbreak heatmaps and syndromic surveillance telemetry',
      'Intervention cost-effectiveness simulations and preventive care cohort targeting',
      'Executive KPI dashboards with WHO and national health indicator tracking'
    ],
    strategicRationale: 'Large-scale government and national public health deployment anchor with strong long-term renewal contracts.',
    targetCountryIds: ['cnt1', 'cnt2', 'cnt4', 'cnt5', 'cnt7']
  }
};

// Initial Data matching the 10 components from reference & architecture
const INITIAL_COMPONENTS: ComponentItem[] = [
  { id: 'c1', name: 'AI Chatbot · CRAG', subtitle: 'GenAI clinical assistant', category: 'AI / GenAI', status: 'In progress', reuseCount: 5 },
  { id: 'c2', name: 'Payment Module', subtitle: 'Billing & checkout core', category: 'Payments', status: 'Completed', reuseCount: 6 },
  { id: 'c3', name: 'Patient Profile', subtitle: 'Master patient record', category: 'Core data', status: 'Completed', reuseCount: 7 },
  { id: 'c4', name: 'Clinical Notes · NLP', subtitle: 'Ambient documentation', category: 'AI / GenAI', status: 'New', reuseCount: 4 },
  { id: 'c5', name: 'Analytics & Dashboards', subtitle: 'Operational BI & Metrics', category: 'Data / BI', status: 'Prioritised', reuseCount: 4 },
  { id: 'c6', name: 'Fraud-Claim Detection', subtitle: 'Claims anomaly engine', category: 'InsurTech / AI', status: 'In progress', reuseCount: 1 },
  { id: 'c7', name: 'Appointment Booking', subtitle: 'Scheduling module', category: 'Workflow', status: 'Completed', reuseCount: 3 },
  { id: 'c8', name: 'e-Prescription', subtitle: 'Prescribing & pharmacy', category: 'Workflow', status: 'Prioritised', reuseCount: 3 },
  { id: 'c9', name: 'LIS · Lab Information', subtitle: 'Diagnostic lab bridge', category: 'Diagnostics', status: 'Completed', reuseCount: 3 },
  { id: 'c10', name: 'Insurance Directory', subtitle: 'Payer rules engine', category: 'InsurTech', status: 'In progress', reuseCount: 1 },
];

const INITIAL_SOLUTIONS: SolutionItem[] = [
  { id: 's1', name: 'EMR & Interoperability', shortCode: 'EMR', positioning: 'Common', status: 'Completed', score: 66, revenue3Yr: '$24M', compCount: 8 },
  { id: 's2', name: 'Hospital Ops & Clinical Workflow', shortCode: 'HOSP OPS', positioning: 'Mixed', status: 'In progress', score: 75, revenue3Yr: '$27M', compCount: 8 },
  { id: 's3', name: 'Home & Community Care', shortCode: 'HOME CARE', positioning: 'Mixed', status: 'New', score: 58, revenue3Yr: '$17M', compCount: 5 },
  { id: 's4', name: 'Remote Patient Monitoring', shortCode: 'RPM', positioning: 'Distinctive', status: 'Prioritised', score: 78, revenue3Yr: '$25M', compCount: 4 },
  { id: 's5', name: 'InsurTech & Reimbursement', shortCode: 'INSURTECH', positioning: 'Distinctive', status: 'In progress', score: 80, revenue3Yr: '$21M', compCount: 5 },
  { id: 's6', name: 'Drug Discovery', shortCode: 'DRUG DISC', positioning: 'Distinctive', status: 'New', score: 69, revenue3Yr: '$19M', compCount: 1 },
  { id: 's7', name: 'Pharmacy & Medication', shortCode: 'PHARMACY', positioning: 'Mixed', status: 'Prioritised', score: 59, revenue3Yr: '$11M', compCount: 3 },
  { id: 's8', name: 'Population Health & Analytics', shortCode: 'POP HEALTH', positioning: 'Distinctive', status: 'New', score: 73, revenue3Yr: '$25M', compCount: 4 },
];

const INITIAL_COUNTRIES: CountryItem[] = [
  { id: 'cnt1', name: 'United Arab Emirates', spendCapita: '$1,842', population: '9.4M', totalSpend: '$17B', digitalShare: '3%', obtainableSlice: '1%', dealAnchor: '$5M', confidence: 'High' },
  { id: 'cnt2', name: 'Saudi Arabia', spendCapita: '$1,485', population: '36.9M', totalSpend: '$55B', digitalShare: '3%', obtainableSlice: '0.37%', dealAnchor: '$6M', confidence: 'High' },
  { id: 'cnt3', name: 'Jordan', spendCapita: '$304', population: '11.3M', totalSpend: '$3B', digitalShare: '2.5%', obtainableSlice: '1.5%', dealAnchor: '$1.3M', confidence: 'Medium' },
  { id: 'cnt4', name: 'Estonia', spendCapita: '$1,733', population: '1.3M', totalSpend: '$2B', digitalShare: '6%', obtainableSlice: '1.5%', dealAnchor: '$2M', confidence: 'High' },
  { id: 'cnt5', name: 'South Korea', spendCapita: '$2,600', population: '51.7M', totalSpend: '$134B', digitalShare: '3%', obtainableSlice: '0.2%', dealAnchor: '$8M', confidence: 'Medium' },
  { id: 'cnt6', name: 'United States', spendCapita: '$12,555', population: '333M', totalSpend: '$4.2T', digitalShare: '3%', obtainableSlice: '0.013%', dealAnchor: '$16M', confidence: 'Low' },
  { id: 'cnt7', name: 'Azerbaijan', spendCapita: '$230', population: '10.1M', totalSpend: '$2B', digitalShare: '2%', obtainableSlice: '2.2%', dealAnchor: '$1M', confidence: 'Low' },
];

// Initial matrix matching the snapshot reference
const INITIAL_REUSE_MATRIX: Record<string, string[]> = {
  c1: ['s1', 's2', 's3', 's4', 's6'],          // 5
  c2: ['s1', 's2', 's3', 's4', 's5', 's7'],     // 6
  c3: ['s1', 's2', 's3', 's4', 's5', 's7', 's8'], // 7
  c4: ['s1', 's2', 's3', 's8'],                // 4
  c5: ['s1', 's2', 's5', 's8'],                // 4
  c6: ['s5'],                                  // 1
  c7: ['s1', 's2', 's3'],                      // 3
  c8: ['s1', 's2', 's7'],                      // 3
  c9: ['s1', 's2', 's8'],                      // 3
  c10: ['s5'],                                 // 1
};

const INITIAL_VERSION_HISTORY: ReuseVersion[] = [
  {
    id: 'v2.1',
    version: 'v2.1 (Current)',
    timestamp: 'Just now',
    author: 'AI Baseline',
    note: 'Initial automated mapping across 8 solutions with 37 active deployments.',
    matrix: INITIAL_REUSE_MATRIX,
  },
  {
    id: 'v2.0',
    version: 'v2.0',
    timestamp: '2 hours ago',
    author: 'AI Architecture Engine',
    note: 'Optimized cross-solution linkage for NLP Ambient notes and Genomics marker modules.',
    matrix: {
      ...INITIAL_REUSE_MATRIX,
      c4: ['s1', 's2', 's8'],
    },
  },
  {
    id: 'v1.0',
    version: 'v1.0 (Baseline)',
    timestamp: 'Yesterday',
    author: 'System Baseline',
    note: 'Initial automated candidate mapping derived from core healthcare taxonomy.',
    matrix: {
      c1: ['s1', 's2', 's4'],
      c2: ['s1', 's2', 's3', 's5'],
      c3: ['s1', 's2', 's3', 's4', 's5'],
      c4: ['s1', 's2'],
      c5: ['s1', 's2', 's5'],
      c6: ['s5'],
      c7: ['s1', 's2'],
      c8: ['s1', 's2'],
      c9: ['s1', 's2'],
      c10: ['s5'],
    },
  }
];

const ITEMS_PER_PAGE = 7;

// Custom Light Theme Select Component
function CustomSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: React.ReactNode;
  value: string;
  options: { label: string; value: string }[];
  onChange?: (val: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs border rounded-lg transition-colors text-left ${
          disabled
            ? 'bg-gray-50/80 border-gray-200 text-gray-500 cursor-not-allowed select-none'
            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800 cursor-pointer focus:outline-none focus:border-gray-300'
        }`}
      >
        <span>{selectedOption?.label || value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between ${
                option.value === value
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{option.label}</span>
              {option.value === value && <Check className="w-3.5 h-3.5 text-gray-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom ComboBox (Input + Select) Component
function CustomComboBox({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: React.ReactNode;
  value: string;
  options: { label: string; value: string }[];
  onChange?: (val: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  // Sync value when parent changes it
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(inputValue.toLowerCase()));

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          value={inputValue}
          onFocus={() => !disabled && setIsOpen(true)}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange?.(e.target.value);
            setIsOpen(true);
          }}
          className={`w-full px-3.5 py-2.5 text-xs border rounded-lg transition-colors pr-10 ${
            disabled
              ? 'bg-gray-50/80 border-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800 focus:outline-none focus:border-[#36c0c9]'
          }`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 max-h-48 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setInputValue(option.value);
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between ${
                  option.value === value
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{option.label}</span>
                {option.value === value && <Check className="w-3.5 h-3.5 text-gray-700" />}
              </button>
            ))
          ) : (
            <div className="px-3.5 py-2 text-xs text-gray-500">Press enter or click away to use custom value</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Catalogue() {
  // Tabs: Solutions (1st), Components (2nd), Countries (3rd), Reuse grid (4th)
  const [activeTab, setActiveTab] = useState<'solutions' | 'components' | 'countries' | 'reuse'>('solutions');

  // State
  const [solutions, setSolutions] = useState<SolutionItem[]>(INITIAL_SOLUTIONS);
  const [components, setComponents] = useState<ComponentItem[]>(INITIAL_COMPONENTS);
  const [countries, setCountries] = useState<CountryItem[]>(INITIAL_COUNTRIES);
  const [viewingSolution, setViewingSolution] = useState<SolutionItem | null>(null);
  
  // Reuse Grid & Versioning State
  const [reuseMatrix, setReuseMatrix] = useState<Record<string, string[]>>(INITIAL_REUSE_MATRIX);
  const [tempReuseMatrix, setTempReuseMatrix] = useState<Record<string, string[]>>(INITIAL_REUSE_MATRIX);
  const [isEditingReuse, setIsEditingReuse] = useState(false);
  const [versionHistory, setVersionHistory] = useState<ReuseVersion[]>(INITIAL_VERSION_HISTORY);
  const [currentVersionLabel, setCurrentVersionLabel] = useState('v2.1 (Current)');
  const [saveNote, setSaveNote] = useState('');
  const [showSaveVersionDialog, setShowSaveVersionDialog] = useState(false);
  
  // Version History Dropdown open state
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);
  const versionDropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(versionDropdownRef, () => setVersionDropdownOpen(false));

  // Search queries per tab
  const [solutionsSearch, setSolutionsSearch] = useState('');
  const [componentsSearch, setComponentsSearch] = useState('');
  const [countriesSearch, setCountriesSearch] = useState('');

  // Unified Sorting States
  const [solutionsSort, setSolutionsSort] = useState<{column: 'revenue' | 'score' | 'components' | null, direction: 'asc' | 'desc'}>({column: null, direction: 'asc'});
  const [componentsSort, setComponentsSort] = useState<{column: 'reuse' | null, direction: 'asc' | 'desc'}>({column: null, direction: 'asc'});
  const [countriesSort, setCountriesSort] = useState<{column: 'spend' | 'population' | 'total' | 'digital' | 'slice' | 'anchor' | null, direction: 'asc' | 'desc'}>({column: null, direction: 'asc'});

  // Custom filter dropdown states and refs
  const [isSolutionsFilterOpen, setIsSolutionsFilterOpen] = useState(false);
  const solutionsFilterRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(solutionsFilterRef, () => setIsSolutionsFilterOpen(false));

  const [isComponentsFilterOpen, setIsComponentsFilterOpen] = useState(false);
  const componentsFilterRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(componentsFilterRef, () => setIsComponentsFilterOpen(false));

  // Unified Single Filter states
  const [solutionsUnifiedFilter, setSolutionsUnifiedFilter] = useState('All');
  const [componentsUnifiedFilter, setComponentsUnifiedFilter] = useState('All');
  const [countriesUnifiedFilter, setCountriesUnifiedFilter] = useState('All');

  // Pagination states
  const [solutionsPage, setSolutionsPage] = useState(1);
  const [componentsPage, setComponentsPage] = useState(1);
  const [countriesPage, setCountriesPage] = useState(1);
  const [reusePage, setReusePage] = useState(1);
  const REUSE_ITEMS_PER_PAGE = 10;

  // Add Modals Form States
  const [showAddSolutionModal, setShowAddSolutionModal] = useState(false);
  const [showAddComponentModal, setShowAddComponentModal] = useState(false);

  // Solution Form Fields
  const [newSolutionName, setNewSolutionName] = useState('');
  const [newSolutionPositioning, setNewSolutionPositioning] = useState<'Common' | 'Mixed' | 'Distinctive'>('Common');
  const [newSolutionStatus, setNewSolutionStatus] = useState<'In progress' | 'Completed' | 'New' | 'Prioritised'>('New');
  const [newSolutionDescription, setNewSolutionDescription] = useState('');
  const [newSolutionKeyCapabilities, setNewSolutionKeyCapabilities] = useState('');
  const [newSolutionConstraints, setNewSolutionConstraints] = useState('');
  const [newSolutionFile, setNewSolutionFile] = useState<File | null>(null);

  // Component Form Fields
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentCategory, setNewComponentCategory] = useState('AI / GenAI');
  const [newComponentStatus, setNewComponentStatus] = useState<'In progress' | 'Completed' | 'New' | 'Prioritised'>('New');
  const [newComponentDescription, setNewComponentDescription] = useState('');
  const [newComponentKeyCapabilities, setNewComponentKeyCapabilities] = useState('');
  const [newComponentDependencies, setNewComponentDependencies] = useState('');
  const [newComponentFile, setNewComponentFile] = useState<File | null>(null);

  // Edit Modals: Only Status and Positioning editable for Solution
  const [editingSolution, setEditingSolution] = useState<SolutionItem | null>(null);
  const [editSolutionPositioning, setEditSolutionPositioning] = useState<'Common' | 'Mixed' | 'Distinctive'>('Distinctive');
  const [editSolutionStatus, setEditSolutionStatus] = useState<'In progress' | 'Completed' | 'New' | 'Prioritised'>('New');

  const [editingComponent, setEditingComponent] = useState<ComponentItem | null>(null);
  const [editComponentStatus, setEditComponentStatus] = useState<'In progress' | 'Completed' | 'New' | 'Prioritised'>('New');

  // Helper to parse revenue string into comparable numeric values
  const parseRevenueValue = (val: string): number => {
    const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
    const upper = val.toUpperCase();
    if (upper.includes('T')) return num * 1000000;
    if (upper.includes('B')) return num * 1000;
    return num;
  };

  // Filtered & Sorted lists
  const filteredSolutions = useMemo(() => {
    let result = solutions.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(solutionsSearch.toLowerCase());
      let matchesFilter = true;
      if (solutionsUnifiedFilter !== 'All') {
        matchesFilter = s.positioning === solutionsUnifiedFilter || s.status === solutionsUnifiedFilter;
      }
      return matchesSearch && matchesFilter;
    });

    if (solutionsSort.column) {
      result = [...result].sort((a, b) => {
        let valA = 0, valB = 0;
        if (solutionsSort.column === 'revenue') {
          valA = parseRevenueValue(a.revenue3Yr);
          valB = parseRevenueValue(b.revenue3Yr);
        } else if (solutionsSort.column === 'score') {
          valA = parseFloat(a.score);
          valB = parseFloat(b.score);
        } else if (solutionsSort.column === 'components') {
          valA = a.compCount;
          valB = b.compCount;
        }
        return solutionsSort.direction === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [solutions, solutionsSearch, solutionsUnifiedFilter, solutionsSort]);

  const filteredComponents = useMemo(() => {
    let result = components.filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(componentsSearch.toLowerCase()) || 
        c.subtitle.toLowerCase().includes(componentsSearch.toLowerCase()) ||
        c.category.toLowerCase().includes(componentsSearch.toLowerCase());
      let matchesFilter = true;
      if (componentsUnifiedFilter !== 'All') {
        matchesFilter = c.status === componentsUnifiedFilter;
      }
      return matchesSearch && matchesFilter;
    });
    
    if (componentsSort.column === 'reuse') {
      result = [...result].sort((a, b) => {
        const countA = (reuseMatrix[a.id] || []).length;
        const countB = (reuseMatrix[b.id] || []).length;
        return componentsSort.direction === 'asc' ? countA - countB : countB - countA;
      });
    }

    return result;
  }, [components, componentsSearch, componentsUnifiedFilter, componentsSort, reuseMatrix]);

  const filteredCountries = useMemo(() => {
    let result = countries.filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(countriesSearch.toLowerCase()) ||
        c.spendCapita.toLowerCase().includes(countriesSearch.toLowerCase()) ||
        c.totalSpend.toLowerCase().includes(countriesSearch.toLowerCase());
      let matchesFilter = true;
      if (countriesUnifiedFilter !== 'All') {
        matchesFilter = c.confidence === countriesUnifiedFilter;
      }
      return matchesSearch && matchesFilter;
    });

    if (countriesSort.column) {
      result = [...result].sort((a, b) => {
        let valA = 0, valB = 0;
        if (countriesSort.column === 'spend') {
          valA = parseRevenueValue(a.spendCapita);
          valB = parseRevenueValue(b.spendCapita);
        } else if (countriesSort.column === 'population') {
          valA = parseRevenueValue(a.population);
          valB = parseRevenueValue(b.population);
        } else if (countriesSort.column === 'total') {
          valA = parseRevenueValue(a.totalSpend);
          valB = parseRevenueValue(b.totalSpend);
        } else if (countriesSort.column === 'digital') {
          valA = parseFloat(a.digitalShare.replace('%',''));
          valB = parseFloat(b.digitalShare.replace('%',''));
        } else if (countriesSort.column === 'slice') {
          valA = parseRevenueValue(a.obtainableSlice);
          valB = parseRevenueValue(b.obtainableSlice);
        } else if (countriesSort.column === 'anchor') {
          valA = parseRevenueValue(a.dealAnchor);
          valB = parseRevenueValue(b.dealAnchor);
        }
        return countriesSort.direction === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [countries, countriesSearch, countriesUnifiedFilter, countriesSort]);

  // Paginated Slices
  const totalSolutionsPages = Math.ceil(filteredSolutions.length / ITEMS_PER_PAGE) || 1;
  const paginatedSolutions = useMemo(() => {
    const start = (solutionsPage - 1) * ITEMS_PER_PAGE;
    return filteredSolutions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSolutions, solutionsPage]);

  const totalComponentsPages = Math.ceil(filteredComponents.length / ITEMS_PER_PAGE) || 1;
  const paginatedComponents = useMemo(() => {
    const start = (componentsPage - 1) * ITEMS_PER_PAGE;
    return filteredComponents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredComponents, componentsPage]);

  const totalCountriesPages = Math.ceil(filteredCountries.length / ITEMS_PER_PAGE) || 1;
  const paginatedCountries = useMemo(() => {
    const start = (countriesPage - 1) * ITEMS_PER_PAGE;
    return filteredCountries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCountries, countriesPage]);

  const totalReusePages = Math.ceil(components.length / REUSE_ITEMS_PER_PAGE) || 1;
  const paginatedReuseComponents = useMemo(() => {
    const start = (reusePage - 1) * REUSE_ITEMS_PER_PAGE;
    return components.slice(start, start + REUSE_ITEMS_PER_PAGE);
  }, [components, reusePage]);

  // Solution detail profile data & mapped components
  const currentSolutionProfile = useMemo(() => {
    if (!viewingSolution) return null;
    return SOLUTION_PROFILES[viewingSolution.id] || {
      summary: `Strategic healthcare solution optimizing clinical workflows and patient care pathways across enterprise deployments.`,
      targetAudience: 'Hospital Networks, Clinical Teams, Health Authorities',
      keyHighlights: [
        'Enterprise clinical workflow orchestration and data synchronization',
        'Automated decision support with high clinical accuracy',
        'Modular architecture enabling rapid multi-specialty rollout',
        'Integrated analytics tracking operational outcomes and clinical throughput'
      ],
      strategicRationale: 'Core portfolio pillar driving digital health transformation and regional expansion.',
      targetCountryIds: ['cnt1', 'cnt2', 'cnt4']
    };
  }, [viewingSolution]);

  const mappedSolutionComponents = useMemo(() => {
    if (!viewingSolution) return [];
    const list = components.filter((comp) => (reuseMatrix[comp.id] || []).includes(viewingSolution.id));
    return list.length > 0 ? list : components.slice(0, viewingSolution.compCount || 4);
  }, [viewingSolution, components, reuseMatrix]);

  const targetCountryItems = useMemo(() => {
    if (!currentSolutionProfile) return [];
    const list = countries.filter((c) => (currentSolutionProfile.targetCountryIds || []).includes(c.id));
    return list.length > 0 ? list : countries.slice(0, 4);
  }, [currentSolutionProfile, countries]);

  // Handlers
  const handleOpenEditSolution = (sol: SolutionItem) => {
    setEditingSolution(sol);
    setEditSolutionPositioning(sol.positioning);
    setEditSolutionStatus(sol.status);
  };

  const handleSaveEditSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSolution) return;
    setSolutions((prev) =>
      prev.map((s) =>
        s.id === editingSolution.id
          ? { ...editingSolution, positioning: editSolutionPositioning, status: editSolutionStatus }
          : s
      )
    );
    setEditingSolution(null);
  };

  const handleOpenEditComponent = (comp: ComponentItem) => {
    setEditingComponent(comp);
    setEditComponentStatus(comp.status);
  };

  const handleSaveEditComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComponent) return;
    setComponents((prev) =>
      prev.map((c) =>
        c.id === editingComponent.id
          ? { ...editingComponent, status: editComponentStatus }
          : c
      )
    );
    setEditingComponent(null);
  };

  const handleAddSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSolutionName.trim() || !newSolutionDescription.trim()) return;
    const newSol: SolutionItem = {
      id: `s_${Date.now()}`,
      name: newSolutionName.trim(),
      shortCode: newSolutionName.trim().substring(0, 8).toUpperCase(),
      positioning: newSolutionPositioning,
      status: newSolutionStatus,
      score: 72,
      revenue3Yr: '$18M',
      compCount: 4,
    };
    setSolutions((prev) => [newSol, ...prev]);
    setNewSolutionName('');
    setNewSolutionPositioning('Common');
    setNewSolutionStatus('New');
    setNewSolutionDescription('');
    setNewSolutionKeyCapabilities('');
    setNewSolutionConstraints('');
    setNewSolutionFile(null);
    setShowAddSolutionModal(false);
  };

  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComponentName.trim() || !newComponentDescription.trim()) return;
    const newComp: ComponentItem = {
      id: `c_${Date.now()}`,
      name: newComponentName.trim(),
      subtitle: newComponentDescription.trim().slice(0, 48) || 'Enterprise component module',
      category: newComponentCategory,
      status: newComponentStatus,
      reuseCount: 0,
    };
    setComponents((prev) => [newComp, ...prev]);
    setNewComponentName('');
    setNewComponentCategory('AI / GenAI');
    setNewComponentStatus('New');
    setNewComponentDescription('');
    setNewComponentKeyCapabilities('');
    setNewComponentDependencies('');
    setNewComponentFile(null);
    setShowAddComponentModal(false);
  };

  // Reuse Grid Edit Handlers
  const handleStartEditingReuse = () => {
    setTempReuseMatrix({ ...reuseMatrix });
    setIsEditingReuse(true);
  };

  const handleCancelEditingReuse = () => {
    setTempReuseMatrix({ ...reuseMatrix });
    setIsEditingReuse(false);
  };

  const handleToggleCellEdit = (compId: string, solId: string) => {
    if (!isEditingReuse) return;
    setTempReuseMatrix((prev) => {
      const currentList = prev[compId] || [];
      const isMapped = currentList.includes(solId);
      const updatedList = isMapped ? currentList.filter((id) => id !== solId) : [...currentList, solId];
      return { ...prev, [compId]: updatedList };
    });
  };

  const handleOpenSaveDialog = () => {
    setSaveNote(`Manual matrix adjustment with ${Object.values(tempReuseMatrix).reduce((acc, curr) => acc + curr.length, 0)} total linkages.`);
    setShowSaveVersionDialog(true);
  };

  const handleConfirmSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    const nextVerNum = (2 + (versionHistory.length * 0.1)).toFixed(1);
    const newVerName = `v${nextVerNum} (Latest)`;
    const newVersionObj: ReuseVersion = {
      id: `v_${Date.now()}`,
      version: newVerName,
      timestamp: 'Just now',
      author: 'User',
      note: saveNote.trim() || 'User updated component reuse matrix.',
      matrix: { ...tempReuseMatrix },
    };

    setReuseMatrix({ ...tempReuseMatrix });
    setVersionHistory([newVersionObj, ...versionHistory]);
    setCurrentVersionLabel(newVerName);

    // Sync reuseCount on components
    setComponents((prevList) =>
      prevList.map((comp) => ({
        ...comp,
        reuseCount: (tempReuseMatrix[comp.id] || []).length,
      }))
    );

    setIsEditingReuse(false);
    setShowSaveVersionDialog(false);
  };

  const handleRestoreVersion = (version: ReuseVersion) => {
    setReuseMatrix({ ...version.matrix });
    setTempReuseMatrix({ ...version.matrix });
    setCurrentVersionLabel(version.version);
    
    // Sync component counts
    setComponents((prevList) =>
      prevList.map((comp) => ({
        ...comp,
        reuseCount: (version.matrix[comp.id] || []).length,
      }))
    );

    setIsEditingReuse(false);
  };

  const handleResetToBaseline = () => {
    const baseline = INITIAL_VERSION_HISTORY[INITIAL_VERSION_HISTORY.length - 1];
    setTempReuseMatrix({ ...baseline.matrix });
  };

  const activeMatrix = isEditingReuse ? tempReuseMatrix : reuseMatrix;

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 md:py-8 space-y-6">
      {/* Underline Tabs - Hidden when viewing solution details page */}
      {viewingSolution === null && (
        <div className="inline-block border-b border-gray-200">
          <nav className="flex space-x-1 sm:space-x-2 -mb-[1px]">
            <button
              onClick={() => {
                setActiveTab('solutions');
                setViewingSolution(null);
              }}
              className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
                activeTab === 'solutions'
                  ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Solutions
            </button>

            <button
              onClick={() => {
                setActiveTab('components');
                setViewingSolution(null);
              }}
              className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
                activeTab === 'components'
                  ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Components
            </button>

            <button
              onClick={() => {
                setActiveTab('countries');
                setViewingSolution(null);
              }}
              className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
                activeTab === 'countries'
                  ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Countries
            </button>

            <button
              onClick={() => {
                setActiveTab('reuse');
                setViewingSolution(null);
              }}
              className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
                activeTab === 'reuse'
                  ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Reuse grid
            </button>
          </nav>
        </div>
      )}

      {/* TAB 1: SOLUTIONS TAB */}
      {activeTab === 'solutions' && (
        viewingSolution ? (
          /* SOLUTION DETAIL PAGE VIEW (Matching Snapshot) */
          <div className="space-y-4">
            {/* Back Button with opened solution name */}
            <div>
              <button
                type="button"
                onClick={() => setViewingSolution(null)}
                className="inline-flex items-center gap-2.5 text-[#0D212C] hover:text-[#ED4D19] font-medium text-base cursor-pointer bg-transparent border-0 p-0 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-700" />
                <span className="font-['Poppins'] font-semibold text-[1.125rem]">{viewingSolution.name}</span>
              </button>
            </div>

            {/* Main Solution Card matching snapshot without Target Audience */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-[0.6875rem] font-medium uppercase tracking-wider border border-gray-200/70">
                    {viewingSolution.shortCode}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-normal border border-gray-200/70">
                    {viewingSolution.positioning}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-normal ${
                    viewingSolution.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : viewingSolution.status === 'In progress'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : viewingSolution.status === 'Prioritised'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}>
                    {viewingSolution.status}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-semibold text-[#0D212C] font-['Poppins'] tracking-tight">
                  {viewingSolution.name}
                </h1>

                <p className="text-sm text-gray-600 leading-relaxed font-normal max-w-4xl">
                  {currentSolutionProfile?.summary || 'Comprehensive healthcare interoperability and electronic medical records core connecting clinical workflows, lab bridges, and billing systems into unified FHIR-standard health records.'}
                </p>
              </div>

              {/* 4 Metric Highlights Cards using exact table column names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
                <div className="bg-orange-50/30 border border-orange-200/80 rounded-xl p-4 space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">REVENUE (3-YR)</div>
                  <div className="text-2xl font-bold text-[#ED4D19]">{viewingSolution.revenue3Yr}</div>
                  <div className="text-[11px] text-gray-400">Cumulative addressable ARR</div>
                </div>

                <div className="bg-white border border-gray-200/70 rounded-xl p-4 space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">SCORE</div>
                  <div className="text-2xl font-bold text-[#0D212C] flex items-center gap-1.5">
                    <span>{viewingSolution.score}</span>
                    <span className="text-xs font-normal text-gray-400">/ 100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div 
                      className="bg-[#ED4D19] h-full rounded-full" 
                      style={{ width: `${viewingSolution.score}%` }} 
                    />
                  </div>
                </div>

                <div className="bg-white border border-gray-200/70 rounded-xl p-4 space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">COMP.</div>
                  <div className="text-2xl font-bold text-[#0D212C]">{viewingSolution.compCount} Modules</div>
                  <div className="text-[11px] text-gray-400">
                    80% portfolio synergy
                  </div>
                </div>

                <div className="bg-white border border-gray-200/70 rounded-xl p-4 space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">COUNTRIES</div>
                  <div className="text-2xl font-bold text-[#0D212C]">{targetCountryItems.length} Markets</div>
                  <div className="text-[11px] text-gray-400">High-conviction expansion slice</div>
                </div>
              </div>
            </div>

            {/* Simple & Clean: Integrated Modules Section */}
            <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0D212C] font-['Poppins']">
                  Integrated Modules ({mappedSolutionComponents.length})
                </h3>
                <span className="text-xs text-gray-400">Component reuse across portfolio</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase">
                      <th className="py-3 px-6 font-normal">COMPONENT</th>
                      <th className="py-3 px-6 font-normal">CATEGORY</th>
                      <th className="py-3 px-6 font-normal">STATUS</th>
                      <th className="py-3 px-6 font-normal">REUSE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[0.875rem]">
                    {mappedSolutionComponents.map((component) => (
                      <tr key={component.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex flex-col">
                            <span className="font-normal text-[#0D212C] text-[0.8125rem]">
                              {component.name}
                            </span>
                            <span className="text-[0.75rem] text-gray-400 font-normal mt-0.5">
                              {component.subtitle}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 text-[0.8125rem] font-normal text-gray-700">
                          {component.category}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-block px-3 py-1 rounded-full text-[0.75rem] font-normal ${
                            component.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : component.status === 'In progress'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : component.status === 'Prioritised'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {component.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-[0.8125rem] font-normal text-[#0D212C]">
                          {component.reuseCount} solutions
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Simple & Clean: Target Countries Section */}
            <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0D212C] font-['Poppins']">
                  Target Countries ({targetCountryItems.length})
                </h3>
                <span className="text-xs text-gray-400">High-conviction expansion markets</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase">
                      <th className="py-3 px-6 font-normal">COUNTRY</th>
                      <th className="py-3 px-6 font-normal">TOTAL HEALTH SPEND</th>
                      <th className="py-3 px-6 font-normal">DIGITAL SHARE</th>
                      <th className="py-3 px-6 font-normal">DEAL ANCHOR (PER-COUNTRY)</th>
                      <th className="py-3 px-6 font-normal">CONFIDENCE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[0.875rem]">
                    {targetCountryItems.map((country) => (
                      <tr key={country.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-6 font-normal text-[0.8125rem] text-[#0D212C]">
                          {country.name}
                        </td>
                        <td className="py-3.5 px-6 text-[0.8125rem] text-gray-700 font-normal">
                          {country.totalSpend}
                        </td>
                        <td className="py-3.5 px-6 text-[0.8125rem] text-gray-700 font-normal">
                          {country.digitalShare}
                        </td>
                        <td className="py-3.5 px-6 text-[0.8125rem] text-[#ED4D19] font-normal">
                          {country.dealAnchor}
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium tracking-wide ${
                            country.confidence === 'High'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : country.confidence === 'Medium'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}>
                            {country.confidence}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header row with Title, Search Bar on left of Single Filter, and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[1.125rem] font-medium text-[#0D212C] font-['Poppins']">
                  Solutions
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar on the Left of Filter */}
                <div className="relative w-56 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={solutionsSearch}
                    onChange={(e) => {
                      setSolutionsSearch(e.target.value);
                      setSolutionsPage(1);
                    }}
                    placeholder="Search solutions..."
                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-[0.8125rem] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors shadow-2xs"
                  />
                </div>

                {/* Custom Filter Dropdown */}
                <div className="relative w-[116px]" ref={solutionsFilterRef}>
                  <button
                    onClick={() => setIsSolutionsFilterOpen(!isSolutionsFilterOpen)}
                    className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg pl-3 pr-2 py-1.5 text-[0.8125rem] text-gray-700 font-normal hover:bg-gray-50 focus:outline-none focus:border-gray-300 transition-colors cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-[12px]">
                      <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{solutionsUnifiedFilter === 'All' ? 'Filters' : solutionsUnifiedFilter}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${isSolutionsFilterOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isSolutionsFilterOpen && (
                    <div className="absolute top-full mt-1 right-0 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                      <button 
                        onClick={() => { setSolutionsUnifiedFilter('All'); setIsSolutionsFilterOpen(false); setSolutionsPage(1); }}
                        className={`w-full text-left px-4 py-1.5 text-[0.8125rem] ${solutionsUnifiedFilter === 'All' ? 'bg-[#e6f7f8] text-[#0E7C86] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        All
                      </button>
                      <div className="px-3 py-1 mt-1 text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">Positioning</div>
                      {['Common', 'Mixed', 'Distinctive'].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => { setSolutionsUnifiedFilter(opt); setIsSolutionsFilterOpen(false); setSolutionsPage(1); }}
                          className={`w-full text-left px-4 py-1.5 text-[0.8125rem] ${solutionsUnifiedFilter === opt ? 'bg-[#e6f7f8] text-[#0E7C86] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {opt}
                        </button>
                      ))}
                      <div className="px-3 py-1 mt-1 border-t border-gray-100 text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider pt-2">Status</div>
                      {['Completed', 'In progress', 'New', 'Prioritised'].map(opt => (
                        <button 
                          key={opt}
                          onClick={() => { setSolutionsUnifiedFilter(opt); setIsSolutionsFilterOpen(false); setSolutionsPage(1); }}
                          className={`w-full text-left px-4 py-1.5 text-[0.8125rem] ${solutionsUnifiedFilter === opt ? 'bg-[#e6f7f8] text-[#0E7C86] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Primary Add Solution Button with #ED4D19 Gradient */}
                <button
                  onClick={() => setShowAddSolutionModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 active:opacity-90 text-white text-[0.8125rem] font-medium rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add solution</span>
                </button>
              </div>
            </div>

            {/* Solutions Table Card */}
            <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    {/* Table Header row - font weight reduced by 1 unit to font-normal */}
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase">
                      <th className="py-3 px-6 font-normal">SOLUTION</th>
                      <th className="py-3 px-6 font-normal">POSITIONING</th>
                      <th className="py-3 px-6 font-normal">STATUS</th>
                      <th 
                        className="py-3 px-6 font-normal cursor-pointer select-none group"
                        onClick={() => {
                          setSolutionsSort(prev => ({
                            column: 'score',
                            direction: prev.column === 'score' && prev.direction === 'asc' ? 'desc' : 'asc'
                          }));
                          setSolutionsPage(1);
                        }}
                      >
                        <div className="flex items-center gap-1.5 group-hover:text-gray-700 transition-colors">
                          SCORE 
                          <ArrowUpDown className={`w-3.5 h-3.5 ${solutionsSort.column === 'score' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'} transition-colors`} />
                        </div>
                      </th>
                      {/* Revenue Header with Up-Down Sort Icon */}
                      <th 
                        onClick={() => {
                          setSolutionsSort(prev => ({
                            column: 'revenue',
                            direction: prev.column === 'revenue' && prev.direction === 'asc' ? 'desc' : 'asc'
                          }));
                          setSolutionsPage(1);
                        }}
                        className="py-3 px-6 font-normal cursor-pointer select-none group"
                      >
                        <div className="inline-flex items-center gap-1.5 hover:text-gray-800 transition-colors">
                          <span>REVENUE (3-YR)</span>
                          <ArrowUpDown className={`w-3.5 h-3.5 ${solutionsSort.column === 'revenue' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`} />
                        </div>
                      </th>
                      <th 
                        className="py-3 px-6 font-normal cursor-pointer select-none group"
                        onClick={() => {
                          setSolutionsSort(prev => ({
                            column: 'components',
                            direction: prev.column === 'components' && prev.direction === 'asc' ? 'desc' : 'asc'
                          }));
                          setSolutionsPage(1);
                        }}
                      >
                        <div className="flex items-center gap-1.5 group-hover:text-gray-700 transition-colors">
                          No. of Components 
                          <ArrowUpDown className={`w-3.5 h-3.5 ${solutionsSort.column === 'components' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'} transition-colors`} />
                        </div>
                      </th>
                      <th className="py-3 px-6 font-normal text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[0.875rem]">
                    {paginatedSolutions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                          No solutions found matching the search or filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedSolutions.map((solution) => (
                        <tr 
                          key={solution.id} 
                          onClick={() => setViewingSolution(solution)}
                          className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                        >
                          {/* Solution Name */}
                          <td className="py-4 px-6 font-normal text-[0.8125rem] text-[#0D212C] group-hover:text-[#ED4D19] transition-colors">
                            {solution.name}
                          </td>

                          {/* Positioning */}
                          <td className="py-4 px-6">
                            <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[0.75rem] font-normal border border-gray-200/70">
                              {solution.positioning}
                            </span>
                          </td>

                          {/* Status (New chip with distinct purple styling) */}
                          <td className="py-4 px-6">
                            <span className={`inline-block px-3 py-1 rounded-full text-[0.75rem] font-normal ${
                              solution.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : solution.status === 'In progress'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : solution.status === 'Prioritised'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              {solution.status}
                            </span>
                          </td>

                          {/* Score - same font size as comp, reduced font weight */}
                          <td className="py-4 px-6 text-[0.875rem] font-normal text-gray-700">
                            {solution.score}
                          </td>

                          {/* Revenue 3-Yr - PRIMARY COLOR (#ED4D19) instead of purple */}
                          <td className="py-4 px-6 text-[0.875rem] font-normal text-[#ED4D19]">
                            {solution.revenue3Yr}
                          </td>

                          {/* Comp Count - reduced font weight */}
                          <td className="py-4 px-6 text-[0.875rem] font-normal text-[#0D212C]">
                            {solution.compCount}
                          </td>

                          {/* Action Column - Icon only without stroke/fill on hover */}
                          <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleOpenEditSolution(solution)}
                              className="p-1 text-gray-400 hover:text-gray-700 active:text-gray-900 bg-transparent transition-colors cursor-pointer border-0"
                              title="Edit solution"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination UI - Outside the table */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-1">
              <div>
                Showing {filteredSolutions.length === 0 ? 0 : (solutionsPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(solutionsPage * ITEMS_PER_PAGE, filteredSolutions.length)} of {filteredSolutions.length}
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSolutionsPage((p) => Math.max(1, p - 1))}
                  disabled={solutionsPage === 1}
                  className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalSolutionsPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setSolutionsPage(pageNum)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        solutionsPage === pageNum
                          ? 'bg-[#36c0c9] text-white font-bold border border-[#36c0c9]'
                          : 'text-gray-500 font-normal hover:text-gray-900'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setSolutionsPage((p) => Math.min(totalSolutionsPages, p + 1))}
                  disabled={solutionsPage === totalSolutionsPages}
                  className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* TAB 2: COMPONENTS TAB */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[1.125rem] font-medium text-[#0D212C] font-['Poppins']">
                Components
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-56 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={componentsSearch}
                  onChange={(e) => {
                    setComponentsSearch(e.target.value);
                    setComponentsPage(1);
                  }}
                  placeholder="Search components..."
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-[0.8125rem] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors shadow-2xs"
                />
              </div>

              {/* Custom Filter Dropdown */}
              <div className="relative w-[116px]" ref={componentsFilterRef}>
                <button
                  onClick={() => setIsComponentsFilterOpen(!isComponentsFilterOpen)}
                  className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg pl-3 pr-2 py-1.5 text-[0.8125rem] text-gray-700 font-normal hover:bg-gray-50 focus:outline-none focus:border-gray-300 transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-[12px]">
                    <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{componentsUnifiedFilter === 'All' ? 'Filters' : componentsUnifiedFilter}</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${isComponentsFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                {isComponentsFilterOpen && (
                  <div className="absolute top-full mt-1 right-0 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                    <button 
                      onClick={() => { setComponentsUnifiedFilter('All'); setIsComponentsFilterOpen(false); setComponentsPage(1); }}
                      className={`w-full text-left px-4 py-1.5 text-[0.8125rem] ${componentsUnifiedFilter === 'All' ? 'bg-[#e6f7f8] text-[#0E7C86] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      All
                    </button>
                    <div className="px-3 py-1 mt-1 text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">Status</div>
                    {['Completed', 'In progress', 'New', 'Prioritised'].map(opt => (
                      <button 
                        key={opt}
                        onClick={() => { setComponentsUnifiedFilter(opt); setIsComponentsFilterOpen(false); setComponentsPage(1); }}
                        className={`w-full text-left px-4 py-1.5 text-[0.8125rem] ${componentsUnifiedFilter === opt ? 'bg-[#e6f7f8] text-[#0E7C86] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary Add Component Button */}
              <button
                onClick={() => setShowAddComponentModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 active:opacity-90 text-white text-[0.8125rem] font-medium rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add component</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase">
                    <th className="py-3 px-6 font-normal">COMPONENT</th>
                    <th className="py-3 px-6 font-normal">CATEGORY</th>
                    <th className="py-3 px-6 font-normal">STATUS</th>
                    <th 
                      className="py-3 px-6 font-normal cursor-pointer select-none group"
                      onClick={() => {
                        setComponentsSort(prev => ({
                          column: 'reuse',
                          direction: prev.column === 'reuse' && prev.direction === 'asc' ? 'desc' : 'asc'
                        }));
                        setComponentsPage(1);
                      }}
                    >
                      <div className="flex items-center gap-1.5 group-hover:text-gray-700 transition-colors">
                        REUSE 
                        <ArrowUpDown className={`w-3.5 h-3.5 ${componentsSort.column === 'reuse' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'} transition-colors`} />
                      </div>
                    </th>
                    <th className="py-3 px-6 font-normal text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[0.875rem]">
                  {paginatedComponents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                        No components found matching the search or filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedComponents.map((component) => (
                      <tr key={component.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-normal text-[#0D212C] text-[0.8125rem]">
                              {component.name}
                            </span>
                            <span className="text-[0.75rem] text-gray-400 font-normal mt-0.5">
                              {component.subtitle}
                            </span>
                          </div>
                        </td>

                        {/* Category shown as OPEN TEXT instead of a chip */}
                        <td className="py-4 px-6 text-[0.8125rem] font-normal text-gray-700">
                          {component.category}
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-block px-3 py-1 rounded-full text-[0.75rem] font-normal ${
                            component.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : component.status === 'In progress'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : component.status === 'Prioritised'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {component.status}
                          </span>
                        </td>

                        {/* Reuse text size matching component title text size (text-[0.8125rem]) */}
                        <td className="py-4 px-6 text-[0.8125rem] font-normal text-[#0D212C]">
                          {component.reuseCount} solutions
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleOpenEditComponent(component)}
                            className="p-1 text-gray-400 hover:text-gray-700 active:text-gray-900 bg-transparent transition-colors cursor-pointer border-0"
                            title="Edit component"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination UI - Outside the table */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-1">
            <div>
              Showing {filteredComponents.length === 0 ? 0 : (componentsPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(componentsPage * ITEMS_PER_PAGE, filteredComponents.length)} of {filteredComponents.length}
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setComponentsPage((p) => Math.max(1, p - 1))}
                disabled={componentsPage === 1}
                className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalComponentsPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setComponentsPage(pageNum)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                      componentsPage === pageNum
                        ? 'bg-[#36c0c9] text-white font-bold border border-[#36c0c9]'
                        : 'text-gray-500 font-normal hover:text-gray-900'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setComponentsPage((p) => Math.min(totalComponentsPages, p + 1))}
                disabled={componentsPage === totalComponentsPages}
                className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COUNTRIES TAB (Confidence chip: High, Medium, Low in Title Case; view only; footnote added) */}
      {activeTab === 'countries' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[1.125rem] font-medium text-[#0D212C] font-['Poppins']">
                Countries
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-56 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={countriesSearch}
                  onChange={(e) => {
                    setCountriesSearch(e.target.value);
                    setCountriesPage(1);
                  }}
                  placeholder="Search countries..."
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-[0.8125rem] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors shadow-2xs"
                />
              </div>

              {/* Single Unified Filter with High, Medium, Low - 12px gap */}
              <div className="relative w-[116px]">
                <select
                  value={countriesUnifiedFilter}
                  onChange={(e) => {
                    setCountriesUnifiedFilter(e.target.value);
                    setCountriesPage(1);
                  }}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-[38px] pr-[30px] py-1.5 text-[0.8125rem] text-gray-700 font-normal hover:bg-gray-50 focus:outline-none focus:border-gray-300 transition-colors cursor-pointer shadow-2xs"
                >
                  <option value="All">Filters</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase">
                    <th className="py-3 px-6 font-normal">COUNTRY</th>
                    <th className="py-3 px-6 font-normal cursor-pointer select-none group" onClick={() => { setCountriesSort(prev => ({ column: 'spend', direction: prev.column === 'spend' && prev.direction === 'asc' ? 'desc' : 'asc' })); setCountriesPage(1); }}>
                      <div className="flex items-center gap-1.5 group-hover:text-gray-700 transition-colors">
                        SPEND / CAPITA <ArrowUpDown className={`w-3.5 h-3.5 ${countriesSort.column === 'spend' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'} transition-colors`} />
                      </div>
                    </th>
                    <th className="py-3 px-6 font-normal cursor-pointer select-none group" onClick={() => { setCountriesSort(prev => ({ column: 'population', direction: prev.column === 'population' && prev.direction === 'asc' ? 'desc' : 'asc' })); setCountriesPage(1); }}>
                      <div className="flex items-center gap-1.5 group-hover:text-gray-700 transition-colors">
                        POPULATION <ArrowUpDown className={`w-3.5 h-3.5 ${countriesSort.column === 'population' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'} transition-colors`} />
                      </div>
                    </th>
                    <th className="py-3 px-6 font-normal cursor-pointer select-none group" onClick={() => { setCountriesSort(prev => ({ column: 'total', direction: prev.column === 'total' && prev.direction === 'asc' ? 'desc' : 'asc' })); setCountriesPage(1); }}>
                      <div className="flex items-center gap-1.5 group-hover:text-gray-700 transition-colors">
                        TOTAL HEALTH SPEND <ArrowUpDown className={`w-3.5 h-3.5 ${countriesSort.column === 'total' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'} transition-colors`} />
                      </div>
                    </th>
                    <th className="py-3 px-6 font-normal cursor-pointer select-none group" onClick={() => { setCountriesSort(prev => ({ column: 'digital', direction: prev.column === 'digital' && prev.direction === 'asc' ? 'desc' : 'asc' })); setCountriesPage(1); }}>
                      <div className="flex items-center gap-1.5 group-hover:text-gray-700 transition-colors">
                        DIGITAL SHARE <ArrowUpDown className={`w-3.5 h-3.5 ${countriesSort.column === 'digital' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'} transition-colors`} />
                      </div>
                    </th>
                    <th className="py-3 px-6 font-normal cursor-pointer select-none group" onClick={() => { setCountriesSort(prev => ({ column: 'slice', direction: prev.column === 'slice' && prev.direction === 'asc' ? 'desc' : 'asc' })); setCountriesPage(1); }}>
                      <div className="flex items-center gap-1.5 group-hover:text-gray-700 transition-colors">
                        OBTAINABLE SLICE <ArrowUpDown className={`w-3.5 h-3.5 ${countriesSort.column === 'slice' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'} transition-colors`} />
                      </div>
                    </th>
                    <th className="py-3 px-6 font-normal cursor-pointer select-none group" onClick={() => { setCountriesSort(prev => ({ column: 'anchor', direction: prev.column === 'anchor' && prev.direction === 'asc' ? 'desc' : 'asc' })); setCountriesPage(1); }}>
                      <div className="flex items-center gap-1.5 group-hover:text-gray-700 transition-colors">
                        DEAL ANCHOR (PER-COUNTRY) <ArrowUpDown className={`w-3.5 h-3.5 ${countriesSort.column === 'anchor' ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'} transition-colors`} />
                      </div>
                    </th>
                    <th className="py-3 px-6 font-normal">CONFIDENCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[0.875rem]">
                  {paginatedCountries.map((country) => (
                    <tr key={country.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-6 font-normal text-[0.8125rem] text-[#0D212C]">
                        {country.name}
                      </td>
                      <td className="py-4 px-6 text-[0.8125rem] text-gray-700 font-normal">
                        {country.spendCapita}
                      </td>
                      <td className="py-4 px-6 text-[0.8125rem] text-gray-700 font-normal">
                        {country.population}
                      </td>
                      <td className="py-4 px-6 text-[0.8125rem] text-gray-700 font-normal">
                        {country.totalSpend}
                      </td>
                      <td className="py-4 px-6 text-[0.8125rem] text-gray-700 font-normal">
                        {country.digitalShare}
                      </td>
                      <td className="py-4 px-6 text-[0.8125rem] text-gray-700 font-normal">
                        {country.obtainableSlice}
                      </td>
                      {/* Deal Anchor in primary color (#ED4D19) */}
                      <td className="py-4 px-6 text-[0.8125rem] text-[#ED4D19] font-normal">
                        {country.dealAnchor}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium tracking-wide ${
                          country.confidence === 'High'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : country.confidence === 'Medium'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}>
                          {country.confidence}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination UI - Outside the table */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-1">
            <div>
              Showing {(countriesPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(countriesPage * ITEMS_PER_PAGE, filteredCountries.length)} of {filteredCountries.length}
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCountriesPage((p) => Math.max(1, p - 1))}
                disabled={countriesPage === 1}
                className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalCountriesPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCountriesPage(pageNum)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                      countriesPage === pageNum
                        ? 'bg-[#36c0c9] text-white font-bold border border-[#36c0c9]'
                        : 'text-gray-500 font-normal hover:text-gray-900'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCountriesPage((p) => Math.min(totalCountriesPages, p + 1))}
                disabled={countriesPage === totalCountriesPages}
                className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Footnote note from snapshot */}
          <p className="text-[0.75rem] text-gray-500 italic leading-relaxed pt-1">
            <span className="font-medium text-gray-600 not-italic">Per-country deal-size anchor</span> = total health spend (spend/capita × population) × digital-health share × a conservative obtainable 3-year slice for a single solution. Basis: WHO Global Health Expenditure & World Bank; digital-share and slice are conservative assumptions to validate. Any country you add is auto-profiled by the agent and flagged by <span className="font-medium text-gray-600 not-italic">confidence</span> until validated.
          </p>
        </div>
      )}

      {/* TAB 4: REUSE GRID TAB */}
      {activeTab === 'reuse' && (
        <div className="space-y-4">
          {/* Top Bar with Title, info text with i icon, Version History Dropdown & Orange Edit button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[1.125rem] font-medium text-[#0D212C] font-['Poppins']">
                Component ↔ Solution reuse grid
              </h2>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 font-normal">
                <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>Tick indicates that component is part of a solution</span>
              </div>
            </div>

            {/* Actions: Version History Dropdown & Edit Action */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Version History Dropdown */}
              <div className="relative" ref={versionDropdownRef}>
                <button
                  type="button"
                  onClick={() => setVersionDropdownOpen(!versionDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-normal text-gray-700 hover:border-gray-300 focus:outline-none focus:border-gray-300 transition-colors cursor-pointer shadow-2xs"
                  title="Switch matrix version"
                >
                  <History className="w-3.5 h-3.5 text-gray-400" />
                  <span>{currentVersionLabel}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${versionDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {versionDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
                    <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                      Version Revisions
                    </div>
                    {versionHistory.map((ver) => (
                      <button
                        key={ver.id}
                        type="button"
                        onClick={() => {
                          handleRestoreVersion(ver);
                          setVersionDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between ${
                          currentVersionLabel === ver.version
                            ? 'bg-gray-100 text-gray-900 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-gray-900">{ver.version}</div>
                          <div className="text-[10px] text-gray-400">{ver.timestamp} · {ver.author}</div>
                        </div>
                        {currentVersionLabel === ver.version && <Check className="w-3.5 h-3.5 text-gray-700" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit Matrix button in orange without stroke/fill */}
              {!isEditingReuse ? (
                <button
                  type="button"
                  onClick={handleStartEditingReuse}
                  className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-[#ED4D19] hover:text-[#C93B0E] active:opacity-90 bg-transparent border-0 px-2 py-1 cursor-pointer transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#ED4D19]" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Reset button removed per user request */}
                  <button
                    type="button"
                    onClick={handleCancelEditingReuse}
                    className="px-2.5 py-1 text-gray-600 hover:text-gray-900 bg-transparent border-0 text-[0.8125rem] font-medium cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenSaveDialog}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 text-white text-xs font-medium rounded-lg shadow-xs transition-opacity cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reuse Grid Table Card with Horizontal Scroll + Sticky Columns (Vertical scroll removed) */}
          <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase">
                    <th className="py-3.5 px-5 min-w-[210px] w-[210px] font-normal border-r border-gray-200 bg-gray-50 sticky left-0 z-20 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.03)]">
                      COMPONENT ↓ / SOLUTION →
                    </th>
                    {solutions.map((sol) => (
                      <th
                        key={sol.id}
                        className="py-3.5 px-3 text-center min-w-[125px] w-[125px] font-normal border-r border-gray-200 bg-gray-50"
                        title={sol.name}
                      >
                        <span className="font-normal text-gray-600 uppercase tracking-wider text-[0.6875rem]">{sol.shortCode || sol.name}</span>
                      </th>
                    ))}
                    {/* Fixed REUSE Column Header */}
                    <th className="py-3.5 px-4 text-center min-w-[85px] w-[85px] font-normal text-gray-700 sticky right-0 bg-gray-50 border-l border-gray-200 z-20 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                      REUSE
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[0.8125rem]">
                  {paginatedReuseComponents.map((comp) => {
                    const mappedSolutions = activeMatrix[comp.id] || [];
                    return (
                      <tr key={comp.id} className="hover:bg-gray-50/40 transition-colors">
                        {/* Component Name */}
                        <td className="py-3.5 px-5 font-normal text-[#0D212C] text-xs border-r border-gray-100 bg-white sticky left-0 z-10 shadow-[4px_0_6px_-2px_rgba(0,0,0,0.03)]">
                          {comp.name}
                        </td>

                        {/* Solutions Columns with orange chip UI when mapped, completely empty when unmapped */}
                        {solutions.map((sol) => {
                          const isMapped = mappedSolutions.includes(sol.id);
                          return (
                            <td
                              key={sol.id}
                              onClick={() => handleToggleCellEdit(comp.id, sol.id)}
                              className={`py-3 px-3 text-center border-r border-gray-100 ${
                                isEditingReuse
                                  ? 'cursor-pointer hover:bg-orange-50/50 select-none'
                                  : ''
                              }`}
                            >
                              {isMapped ? (
                                <div className="w-6 h-6 mx-auto rounded-md bg-orange-50 text-[#ED4D19] border border-orange-200 flex items-center justify-center text-xs font-semibold shadow-2xs">
                                  ✓
                                </div>
                              ) : null}
                            </td>
                          );
                        })}

                        {/* Fixed Sticky REUSE Column with Orange text items */}
                        <td className="py-3.5 px-4 text-center font-bold text-[0.875rem] text-[#ED4D19] sticky right-0 bg-white border-l border-gray-200 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)]">
                          {mappedSolutions.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reuse Grid Pagination */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-1">
            <div>
              Showing {filteredComponents.length === 0 ? 0 : (reusePage - 1) * REUSE_ITEMS_PER_PAGE + 1}–
              {Math.min(reusePage * REUSE_ITEMS_PER_PAGE, components.length)} of {components.length}
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setReusePage((p) => Math.max(1, p - 1))}
                disabled={reusePage === 1}
                className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalReusePages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setReusePage(pageNum)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                      reusePage === pageNum
                        ? 'bg-[#36c0c9] text-white font-bold border border-[#36c0c9]'
                        : 'text-gray-500 font-normal hover:text-gray-900'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setReusePage((p) => Math.min(totalReusePages, p + 1))}
                disabled={reusePage === totalReusePages}
                className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* SAVE VERSION CONFIRMATION MODAL */}
      {showSaveVersionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-7 w-full max-w-md shadow-2xl border border-gray-100 relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <h3 className="text-[1.125rem] font-semibold text-[#0D212C] font-['Poppins']">
                Save Matrix Revision
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveVersionDialog(false)}
                className="text-gray-400 hover:text-gray-700 active:text-gray-900 bg-transparent p-1 transition-colors cursor-pointer border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSaveVersion} className="space-y-4 text-xs">
              <div className="text-sm text-gray-600 mb-6 text-center">
                Are you sure you want to save this matrix revision? This action will update the linkages across the platform.
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSaveVersionDialog(false)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 text-white text-xs font-medium shadow-xs transition-opacity cursor-pointer"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SOLUTION POPUP MODAL (Increased width max-w-2xl; only Status & Positioning editable; all others view only) */}
      {editingSolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-[1.125rem] font-semibold text-[#0D212C] font-['Poppins']">
                Edit Solution
              </h3>
              <button
                onClick={() => setEditingSolution(null)}
                className="text-gray-400 hover:text-gray-700 active:text-gray-900 bg-transparent p-1.5 transition-colors cursor-pointer border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSolution} className="space-y-4 text-xs">
              {/* Row 1: Solution Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Solution Name</label>
                <input
                  type="text"
                  value={editingSolution.name}
                  onChange={(e) => setEditingSolution({ ...editingSolution, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-normal focus:outline-none focus:border-gray-300"
                />
              </div>

              {/* Row 2: Positioning (EDITABLE via CustomSelect) */}
              <div>
                <CustomSelect
                  label="Positioning"
                  value={editSolutionPositioning}
                  options={[
                    { label: 'Common', value: 'Common' },
                    { label: 'Mixed', value: 'Mixed' },
                    { label: 'Distinctive', value: 'Distinctive' },
                  ]}
                  onChange={(val) => setEditSolutionPositioning(val as any)}
                />
              </div>

              {/* Row 3: Status (EDITABLE via CustomSelect) */}
              <div>
                <CustomSelect
                  label="Status"
                  value={editSolutionStatus}
                  options={[
                    { label: 'Completed', value: 'Completed' },
                    { label: 'In progress', value: 'In progress' },
                    { label: 'New', value: 'New' },
                    { label: 'Prioritised', value: 'Prioritised' },
                  ]}
                  onChange={(val) => setEditSolutionStatus(val as any)}
                />
              </div>

              {/* Row 4: AI Score */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">AI Score (0-100)</label>
                <input
                  type="number"
                  value={editingSolution.score}
                  onChange={(e) => setEditingSolution({ ...editingSolution, score: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-normal focus:outline-none focus:border-gray-300"
                />
              </div>

              {/* Row 5: Revenue (3-Yr) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Revenue (3-Yr)</label>
                <input
                  type="text"
                  value={editingSolution.revenue3Yr}
                  onChange={(e) => setEditingSolution({ ...editingSolution, revenue3Yr: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-normal focus:outline-none focus:border-gray-300"
                />
              </div>

              {/* Row 6: Components Count (Comp) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Components Count (Comp)</label>
                <input
                  type="number"
                  value={editingSolution.compCount}
                  onChange={(e) => setEditingSolution({ ...editingSolution, compCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-normal focus:outline-none focus:border-gray-300"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingSolution(null)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 text-white text-xs font-medium shadow-xs transition-opacity cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COMPONENT POPUP MODAL (Increased width max-w-2xl) */}
      {editingComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-[1.125rem] font-semibold text-[#0D212C] font-['Poppins']">
                Edit Component
              </h3>
              <button
                onClick={() => setEditingComponent(null)}
                className="text-gray-400 hover:text-gray-700 active:text-gray-900 bg-transparent p-1.5 transition-colors cursor-pointer border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditComponent} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Component Name</label>
                <input
                  type="text"
                  value={editingComponent.name}
                  onChange={(e) => setEditingComponent({ ...editingComponent, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-normal focus:outline-none focus:border-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Subtitle / Description</label>
                <input
                  type="text"
                  value={editingComponent.subtitle}
                  onChange={(e) => setEditingComponent({ ...editingComponent, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-normal focus:outline-none focus:border-gray-300"
                />
              </div>

              <div>
                <CustomComboBox
                  label="Category"
                  value={editingComponent.category}
                  options={[
                    { label: 'AI / GenAI', value: 'AI / GenAI' },
                    { label: 'Payments', value: 'Payments' },
                    { label: 'Core data', value: 'Core data' },
                    { label: 'Data / BI', value: 'Data / BI' },
                    { label: 'InsurTech / AI', value: 'InsurTech / AI' },
                    { label: 'Workflow', value: 'Workflow' },
                    { label: 'Telehealth', value: 'Telehealth' },
                    { label: 'Genomics', value: 'Genomics' },
                  ]}
                  onChange={(val) => setEditingComponent({ ...editingComponent, category: val })}
                />
              </div>

              {/* Status - Editable Custom Dropdown in Light Theme */}
              <div>
                <CustomSelect
                  label="Status"
                  value={editComponentStatus}
                  options={[
                    { label: 'Completed', value: 'Completed' },
                    { label: 'In progress', value: 'In progress' },
                    { label: 'New', value: 'New' },
                    { label: 'Prioritised', value: 'Prioritised' },
                  ]}
                  onChange={(val) => setEditComponentStatus(val as any)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Reuse Count</label>
                <input
                  type="number"
                  value={editingComponent.reuseCount}
                  onChange={(e) => setEditingComponent({ ...editingComponent, reuseCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-xs font-normal focus:outline-none focus:border-gray-300"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingComponent(null)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 text-white text-xs font-medium shadow-xs transition-opacity cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SOLUTION MODAL */}
      {showAddSolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-[1.125rem] font-semibold text-[#0D212C] font-['Poppins']">
                Add New Solution
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSolutionModal(false)}
                className="text-gray-400 hover:text-gray-700 active:text-gray-900 bg-transparent p-1.5 transition-colors cursor-pointer border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSolution} className="space-y-4 text-xs">
              {/* Field 1: Solution Name (Required) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Solution Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Name of the solution"
                  value={newSolutionName}
                  onChange={(e) => setNewSolutionName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-xs font-normal"
                />
              </div>

              {/* Field 2: Positioning (Required) */}
              <div>
                <CustomSelect
                  label={
                    <span>
                      Positioning <span className="text-red-500">*</span>
                    </span>
                  }
                  value={newSolutionPositioning}
                  options={[
                    { label: 'Common', value: 'Common' },
                    { label: 'Mixed', value: 'Mixed' },
                    { label: 'Distinctive', value: 'Distinctive' },
                  ]}
                  onChange={(val) => setNewSolutionPositioning(val as any)}
                />
              </div>

              {/* Field 3: Status (Required) */}
              <div>
                <CustomSelect
                  label={
                    <span>
                      Status <span className="text-red-500">*</span>
                    </span>
                  }
                  value={newSolutionStatus}
                  options={[
                    { label: 'New', value: 'New' },
                    { label: 'Prioritised', value: 'Prioritised' },
                    { label: 'In progress', value: 'In progress' },
                    { label: 'Completed', value: 'Completed' },
                  ]}
                  onChange={(val) => setNewSolutionStatus(val as any)}
                />
              </div>

              {/* Field 4: Description (Required) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Briefly describe the solution and the problem it solves"
                  value={newSolutionDescription}
                  onChange={(e) => setNewSolutionDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-xs font-normal"
                />
              </div>

              {/* Field 5: Key Capabilities (Optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Key Capabilities
                </label>
                <textarea
                  rows={2}
                  placeholder="Main capabilities of the solution"
                  value={newSolutionKeyCapabilities}
                  onChange={(e) => setNewSolutionKeyCapabilities(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-xs font-normal"
                />
              </div>

              {/* Field 6: Constraints (Optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Constraints
                </label>
                <textarea
                  rows={2}
                  placeholder="Key regulatory, integration or language constraints"
                  value={newSolutionConstraints}
                  onChange={(e) => setNewSolutionConstraints(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-xs font-normal"
                />
              </div>

              {/* Field 7: Attachment (Optional) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Attachment
                </label>
                <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 bg-gray-50/50 cursor-pointer transition-colors text-center">
                  <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.8125rem] font-medium text-gray-700">
                      Add supporting file
                    </span>
                    <span className="text-[0.6875rem] text-gray-500 leading-tight">
                      Max files is 3, Size 25MB<br/>
                      Format: PDF/DOCX/PPTX/XLSX, Screenshot
                    </span>
                  </div>
                  {newSolutionFile && (
                    <div className="mt-2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-xs">
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[200px]">{newSolutionFile.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setNewSolutionFile(null);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setNewSolutionFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddSolutionModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 text-white text-xs font-medium shadow-xs transition-opacity cursor-pointer"
                >
                  Create Solution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD COMPONENT MODAL */}
      {showAddComponentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <h3 className="text-[1.125rem] font-semibold text-[#0D212C] font-['Poppins']">
                Add New Component
              </h3>
              <button
                type="button"
                onClick={() => setShowAddComponentModal(false)}
                className="text-gray-400 hover:text-gray-700 active:text-gray-900 bg-transparent p-1.5 transition-colors cursor-pointer border-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddComponent} className="space-y-4 text-xs">
              {/* Field 1: Component Name (Required) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Component Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Name of the component"
                  value={newComponentName}
                  onChange={(e) => setNewComponentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-xs font-normal"
                />
              </div>

              {/* Field 2: Category (Required ComboBox) */}
              <div>
                <CustomComboBox
                  label={
                    <span>
                      Category <span className="text-red-500">*</span>
                    </span>
                  }
                  value={newComponentCategory}
                  options={[
                    { label: 'AI / GenAI', value: 'AI / GenAI' },
                    { label: 'Payments', value: 'Payments' },
                    { label: 'Core data', value: 'Core data' },
                    { label: 'Data / BI', value: 'Data / BI' },
                    { label: 'InsurTech / AI', value: 'InsurTech / AI' },
                    { label: 'Workflow', value: 'Workflow' },
                    { label: 'Telehealth', value: 'Telehealth' },
                    { label: 'Genomics', value: 'Genomics' },
                  ]}
                  onChange={(val) => setNewComponentCategory(val)}
                />
              </div>

              {/* Field 3: Status (Required Dropdown) */}
              <div>
                <CustomSelect
                  label={
                    <span>
                      Status <span className="text-red-500">*</span>
                    </span>
                  }
                  value={newComponentStatus}
                  options={[
                    { label: 'New', value: 'New' },
                    { label: 'Prioritised', value: 'Prioritised' },
                    { label: 'In progress', value: 'In progress' },
                    { label: 'Completed', value: 'Completed' },
                  ]}
                  onChange={(val) => setNewComponentStatus(val as any)}
                />
              </div>

              {/* Field 4: Description (Required Free Text) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Briefly describe what the component does"
                  value={newComponentDescription}
                  onChange={(e) => setNewComponentDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-xs font-normal"
                />
              </div>

              {/* Field 5: Key Capabilities (Optional Free Text) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Key Capabilities
                </label>
                <textarea
                  rows={2}
                  placeholder="Main capabilities of the component"
                  value={newComponentKeyCapabilities}
                  onChange={(e) => setNewComponentKeyCapabilities(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-xs font-normal"
                />
              </div>

              {/* Field 6: Dependencies (Optional Free Text) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Dependencies
                </label>
                <input
                  type="text"
                  placeholder="Other components this component depends on"
                  value={newComponentDependencies}
                  onChange={(e) => setNewComponentDependencies(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 text-xs font-normal"
                />
              </div>

              {/* Field 7: Attachment (Optional File) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Attachment
                </label>
                <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 bg-gray-50/50 cursor-pointer transition-colors text-center">
                  <Upload className="w-5 h-5 text-gray-400 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.8125rem] font-medium text-gray-700">
                      Add supporting file
                    </span>
                    <span className="text-[0.6875rem] text-gray-500 leading-tight">
                      Max files is 3, Size 25MB<br/>
                      Format: PDF/DOCX/PPTX/XLSX, Screenshot
                    </span>
                  </div>
                  {newComponentFile && (
                    <div className="mt-2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-xs">
                      <span className="text-xs font-medium text-gray-700 truncate max-w-[200px]">{newComponentFile.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setNewComponentFile(null);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setNewComponentFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddComponentModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 text-white text-xs font-medium shadow-xs transition-opacity cursor-pointer"
                >
                  Create Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
