import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Globe, 
  Layers, 
  Play, 
  Download, 
  RotateCcw, 
  Check, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  FileText, 
  Sparkles, 
  Share2, 
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMagicStore } from '../../store/magicStore';
import { CountryFlag, COUNTRY_FLAG_MAP } from './Catalogue';

const GTM_GENERATION_STEPS = [
  "Validating target market profile & strategic positioning",
  "Synthesizing revenue depth, TAM & addressable deal anchors",
  "Structuring slide outlines & executive narrative",
  "Compiling solution synergies & capability linkages",
  "Assembling branded M42 presentation slides & offline PPT assets"
];

export interface CountryGtmProfile {
  name: string;
  population: string;
  incomeGroup: string;
  payerModel: string;
  keyDriver: string;
  summarySentence: string;
  spendCapita: string;
  spendCapitaBadge: 'High' | 'Medium' | 'Low';
  hospitalBeds: string;
  hospitalBedsBadge: 'High' | 'Medium' | 'Low';
  digitalMaturity: string;
  digitalMaturityBadge: 'High' | 'Medium' | 'Low';
  insuredPopulation: string;
  insuredPopulationBadge: 'High' | 'Medium' | 'Low';
  dealAnchor: string;
  solutions: {
    name: string;
    status: 'In progress' | 'Prioritised' | 'Completed' | 'New';
    fit: number;
    score: number;
    win: number;
    description: string;
    revenue3Yr: string;
    annualRev: string;
  }[];
}

export interface SolutionGtmProfile {
  name: string;
  problemSolves: string;
  valueBullets: string[];
  keyFeatures: string[];
  status: 'Completed' | 'In progress' | 'Prioritised' | 'New';
  positioning: string;
  expectedRevenue: string;
  expectedRevenuePerYear: string;
  tam: string;
  addressableMarkets: string;
  whyItScales: {
    prefix: string;
    bold: string;
    suffix: string;
  }[];
  revenueLogic: string;
  topCountries: {
    rank: number;
    name: string;
    description: string;
    revenue3Yr: string;
    annualRev: string;
  }[];
}

const EXACT_SLIDE_DATA = {
  population: '36.9M',
  incomeGroup: 'High income',
  payerModel: 'Expanding insurance',
  keyDriver: 'Vision 2030 build-out',
  summarySentence: 'Large market with heavy public investment; hospital-ops and insurance solutions scale with the reform programme.',
  spendCapita: '$1,485',
  spendCapitaBadge: 'High' as const,
  hospitalBeds: '2.2',
  hospitalBedsBadge: 'High' as const,
  digitalMaturity: 'Developing',
  digitalMaturityBadge: 'Medium' as const,
  insuredPopulation: '~68%',
  insuredPopulationBadge: 'Medium' as const,
  dealAnchor: '$6M',
  solutions: [
    {
      name: 'Hospital Ops & Clinical Workflow',
      status: 'In progress' as const,
      fit: 86,
      score: 75,
      win: 63,
      description: 'streamlined admission-to-discharge.',
      revenue3Yr: '$4.7M',
      annualRev: '$1.6M per year'
    },
    {
      name: 'InsurTech & Reimbursement',
      status: 'In progress' as const,
      fit: 78,
      score: 80,
      win: 59,
      description: 'automated, fraud-aware claims.',
      revenue3Yr: '$4.4M',
      annualRev: '$1.5M per year'
    },
    {
      name: 'Pharmacy & Medication',
      status: 'Prioritised' as const,
      fit: 72,
      score: 59,
      win: 56,
      description: 'e-prescription through to fulfilment.',
      revenue3Yr: '$3.6M',
      annualRev: '$1.2M per year'
    },
    {
      name: 'EMR & Interoperability',
      status: 'Completed' as const,
      fit: 68,
      score: 66,
      win: 54,
      description: 'single longitudinal patient record.',
      revenue3Yr: '$3.5M',
      annualRev: '$1.2M per year'
    },
    {
      name: 'Remote Patient Monitoring',
      status: 'Prioritised' as const,
      fit: 60,
      score: 78,
      win: 50,
      description: 'continuous vitals & early alerts.',
      revenue3Yr: '$3.7M',
      annualRev: '$1.2M per year'
    }
  ]
};

const EXACT_SOLUTION_DATA = {
  problemSolves: 'Fragmented records and no interoperability across providers.',
  valueBullets: [
    'Single longitudinal patient record',
    'Standards-based data exchange',
    'The foundation every other solution plugs into'
  ],
  keyFeatures: [
    'Patient record & identity',
    'FHIR / HL7 interoperability',
    'Consent & access control'
  ],
  status: 'Completed' as const,
  positioning: 'Common',
  expectedRevenue: '$24M',
  expectedRevenuePerYear: '$8.1M per year',
  tam: '$42M',
  addressableMarkets: '7',
  whyItScales: [
    { prefix: 'Reuses ', bold: '8 components', suffix: ', build once, sell many.' },
    { prefix: 'Score ', bold: '65/100', suffix: ', sellable across 7 markets.' },
    { prefix: 'Effort ', bold: '~167 person-days', suffix: ' (1 FTE), rolled up from its components.' }
  ],
  revenueLogic: 'Per market: deal anchor × revenue-depth (1.2) × win-likelihood (30-70%, from criticality, willingness-to-pay & competitiveness), summed across addressable markets. Conservative, 3-year, illustrative.',
  topCountries: [
    {
      rank: 1,
      name: 'United States',
      description: 'Fit 80/100 · Largest opportunity with high deal sizes. Win likelihood ~60% given common positioning and $12,555 spend/capita.',
      revenue3Yr: '$10M',
      annualRev: '$3.5M per year · ~60% win'
    },
    {
      rank: 2,
      name: 'South Korea',
      description: 'Fit 75/100 · Large, mature, high-spend market with strong deal sizes for differentiated solutions. Win likelihood ~57% given common positioning and $2,600 spend/capita.',
      revenue3Yr: '$5M',
      annualRev: '$1.7M per year · ~57% win'
    },
    {
      rank: 3,
      name: 'Saudi Arabia',
      description: 'Fit 68/100 · Large market with heavy public investment; hospital-ops and insurance solutions scale with the reform programme. Win likelihood ~54% given common positioning and $1,485 spend/capita.',
      revenue3Yr: '$3.5M',
      annualRev: '$1.2M per year · ~54% win'
    },
    {
      rank: 4,
      name: 'United Arab Emirates',
      description: 'Fit 70/100 · High spend and mandatory insurance make claims, RPM and hospital-ops solutions readily monetisable. Win likelihood ~55% given common positioning and $1,842 spend/capita.',
      revenue3Yr: '$3M',
      annualRev: '$1M per year · ~55% win'
    },
    {
      rank: 5,
      name: 'Estonia',
      description: 'Fit 85/100 · Digitally mature reference market for RPM, EMR and analytics with fast adoption. Win likelihood ~63% given common positioning and $1,733 spend/capita.',
      revenue3Yr: '$1.4M',
      annualRev: '$0.5M per year · ~63% win'
    }
  ]
};

function getCountryProfile(countryName: string): CountryGtmProfile {
  return {
    name: countryName,
    ...EXACT_SLIDE_DATA
  };
}

function getSolutionProfile(solutionName: string): SolutionGtmProfile {
  return {
    name: solutionName,
    ...EXACT_SOLUTION_DATA
  };
}

export interface GtmHistoryItem {
  id: string;
  name: string;
  kind: 'Country' | 'Solution';
  generatedAt: string;
}

const INITIAL_HISTORY: GtmHistoryItem[] = [
  {
    id: 'hist-1',
    name: 'Australia',
    kind: 'Country',
    generatedAt: '01 Oct 2026, 11:44',
  },
  {
    id: 'hist-2',
    name: 'Saudi Arabia',
    kind: 'Country',
    generatedAt: '01 Oct 2026, 10:15',
  },
  {
    id: 'hist-3',
    name: 'EMR & Interoperability',
    kind: 'Solution',
    generatedAt: '30 Sep 2026, 16:20',
  },
  {
    id: 'hist-4',
    name: 'United States',
    kind: 'Country',
    generatedAt: '30 Sep 2026, 14:05',
  },
  {
    id: 'hist-5',
    name: 'Remote Patient Monitoring',
    kind: 'Solution',
    generatedAt: '29 Sep 2026, 09:30',
  },
  {
    id: 'hist-6',
    name: 'InsurTech & Reimbursement',
    kind: 'Solution',
    generatedAt: '28 Sep 2026, 15:10',
  },
  {
    id: 'hist-7',
    name: 'United Arab Emirates',
    kind: 'Country',
    generatedAt: '27 Sep 2026, 12:00',
  },
];

export default function GtmInsights() {
  const [activeTab, setActiveTab] = useState<'country' | 'solution' | 'history'>('country');
  
  const { countries, solutions } = useMagicStore();

  // Selected values (empty by default to require user selection)
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSolution, setSelectedSolution] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isSolutionDropdownOpen, setIsSolutionDropdownOpen] = useState(false);

  // History State
  const [historyList, setHistoryList] = useState<GtmHistoryItem[]>(INITIAL_HISTORY);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'All' | 'Country' | 'Solution'>('All');
  const [isKindFilterOpen, setIsKindFilterOpen] = useState(false);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const historyItemsPerPage = 5;

  const kindFilterRef = useRef<HTMLDivElement>(null);

  // Generation & Thinking Mode State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepIndex, setGenerationStepIndex] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(10);
  const [generatedDeck, setGeneratedDeck] = useState<{
    targetType: 'country' | 'solution';
    title: string;
    subtitle: string;
    profile?: CountryGtmProfile;
    solutionProfile?: SolutionGtmProfile;
    solutionName?: string;
  } | null>(null);

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const solutionDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (solutionDropdownRef.current && !solutionDropdownRef.current.contains(event.target as Node)) {
        setIsSolutionDropdownOpen(false);
      }
      if (kindFilterRef.current && !kindFilterRef.current.contains(event.target as Node)) {
        setIsKindFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered and Paginated History List
  const filteredHistoryList = useMemo(() => {
    let list = historyList.filter((item) =>
      item.name.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      item.kind.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
      item.generatedAt.toLowerCase().includes(historySearchQuery.toLowerCase())
    );

    if (kindFilter !== 'All') {
      list = list.filter((item) => item.kind === kindFilter);
    }

    return list;
  }, [historyList, historySearchQuery, kindFilter]);

  const historyTotalPages = Math.ceil(filteredHistoryList.length / historyItemsPerPage) || 1;
  const paginatedHistoryList = useMemo(() => {
    const start = (historyCurrentPage - 1) * historyItemsPerPage;
    return filteredHistoryList.slice(start, start + historyItemsPerPage);
  }, [filteredHistoryList, historyCurrentPage, historyItemsPerPage]);

  // Open deck from history row click
  const handleOpenHistoryDeck = (item: GtmHistoryItem) => {
    if (item.kind === 'Country') {
      const profile = getCountryProfile(item.name);
      setGeneratedDeck({
        targetType: 'country',
        title: `${item.name} - Go-To-Market Pitch Deck`,
        subtitle: `M42 Digital Health Expansion & Monetisation Strategy for ${item.name}`,
        profile
      });
    } else {
      const solutionProfile = getSolutionProfile(item.name);
      setGeneratedDeck({
        targetType: 'solution',
        title: `${item.name} - Go-To-Market Pitch Deck`,
        subtitle: `Commercialisation Strategy & Cross-Border Scaling for ${item.name}`,
        solutionProfile,
        solutionName: item.name
      });
    }
  };

  // Handle Deck Generation with Thinking Mode Animation
  const handleStartGeneration = () => {
    if (activeTab === 'country' && !selectedCountry) return;
    if (activeTab === 'solution' && !selectedSolution) return;

    setIsGenerating(true);
    setGenerationStepIndex(0);
    setGenerationProgress(10);
    setGeneratedDeck(null);

    const startTime = Date.now();
    const duration = 6000; // 6.0 seconds

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.max(10, Math.floor(10 + (elapsed / duration) * 90)));
      setGenerationProgress(pct);

      if (pct >= 100) {
        clearInterval(progressInterval);
      }
    }, 40);

    const stepInterval = setInterval(() => {
      setGenerationStepIndex((prev) => {
        if (prev < GTM_GENERATION_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1200);

    setTimeout(() => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      setGenerationProgress(100);
      setGenerationStepIndex(GTM_GENERATION_STEPS.length - 1);

      // Create Generated Deck Mock Data
      const targetName = activeTab === 'country' ? (selectedCountry || 'Saudi Arabia') : (selectedSolution || 'EMR & Interoperability');
      const targetKind = activeTab === 'country' ? 'Country' : 'Solution';

      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const dateStr = `${day} ${month} ${year}, ${hours}:${minutes}`;

      // Prepend to history
      setHistoryList((prev) => [
        {
          id: `hist-${Date.now()}`,
          name: targetName,
          kind: targetKind,
          generatedAt: dateStr,
        },
        ...prev.filter((h) => !(h.name === targetName && h.kind === targetKind))
      ]);

      if (activeTab === 'country') {
        const profile = getCountryProfile(selectedCountry || 'Saudi Arabia');
        setGeneratedDeck({
          targetType: 'country',
          title: `${selectedCountry || 'Saudi Arabia'} - Go-To-Market Pitch Deck`,
          subtitle: `M42 Digital Health Expansion & Monetisation Strategy for ${selectedCountry || 'Saudi Arabia'}`,
          profile
        });
      } else {
        const solutionProfile = getSolutionProfile(selectedSolution || 'EMR & Interoperability');
        setGeneratedDeck({
          targetType: 'solution',
          title: `${selectedSolution || 'EMR & Interoperability'} - Go-To-Market Pitch Deck`,
          subtitle: `Commercialisation Strategy & Cross-Border Scaling for ${selectedSolution || 'EMR & Interoperability'}`,
          solutionProfile,
          solutionName: selectedSolution || 'EMR & Interoperability'
        });
      }

      setIsGenerating(false);
    }, 6200);
  };

  // Thinking Mode Circular SVG calculations
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (generationProgress / 100) * circumference;

  return (
    <div className="w-full px-5 py-6 md:py-8 space-y-6">
      
      {/* Top Underline Tabs (Matching Catalogue Design Exactly) */}
      <div className="inline-block border-b border-gray-200">
        <nav className="flex space-x-1 sm:space-x-2 -mb-[1px]">
          <button
            onClick={() => {
              setActiveTab('country');
              setGeneratedDeck(null);
            }}
            className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
              activeTab === 'country'
                ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            By country
          </button>
          <button
            onClick={() => {
              setActiveTab('solution');
              setGeneratedDeck(null);
            }}
            className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
              activeTab === 'solution'
                ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            By solution
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setGeneratedDeck(null);
            }}
            className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
              activeTab === 'history'
                ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            GTM Insights History
          </button>
        </nav>
      </div>


      {/* Input Selection Bar & Generate CTA (Only in By Country & By Solution Tabs) */}
      {activeTab !== 'history' && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            {activeTab === 'country' 
              ? 'Target country - search any country' 
              : 'Target solution - select any catalogue solution'}
          </label>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* TAB 1: Country Dropdown Selection */}
            {activeTab === 'country' && (
              <div className="relative flex-1" ref={countryDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between shadow-2xs transition-colors cursor-pointer"
                >
                  {selectedCountry ? (
                    <span className="font-normal text-[#0D212C]">{selectedCountry}</span>
                  ) : (
                    <span className="text-gray-400 font-normal">Select target country...</span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCountryDropdownOpen && (
                  <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                    {countries.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(c.name);
                          setGeneratedDeck(null);
                          setIsCountryDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          selectedCountry === c.name
                            ? 'bg-gray-100 text-gray-900 font-normal'
                            : 'text-gray-700 hover:bg-gray-50 font-normal'
                        }`}
                      >
                        <span>{c.name}</span>
                        {selectedCountry === c.name && <Check className="w-3.5 h-3.5 text-gray-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Solution Dropdown Selection */}
            {activeTab === 'solution' && (
              <div className="relative flex-1" ref={solutionDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsSolutionDropdownOpen(!isSolutionDropdownOpen)}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between shadow-2xs transition-colors cursor-pointer"
                >
                  {selectedSolution ? (
                    <span className="font-normal text-[#0D212C]">{selectedSolution}</span>
                  ) : (
                    <span className="text-gray-400 font-normal">Select target solution...</span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isSolutionDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isSolutionDropdownOpen && (
                  <div className="absolute top-full mt-1.5 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                    {solutions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSolution(s.name);
                          setGeneratedDeck(null);
                          setIsSolutionDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          selectedSolution === s.name
                            ? 'bg-gray-100 text-gray-900 font-normal'
                            : 'text-gray-700 hover:bg-gray-50 font-normal'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{s.name}</span>
                          <span className="text-[11px] text-gray-400">({s.positioning})</span>
                        </div>
                        {selectedSolution === s.name && <Check className="w-3.5 h-3.5 text-gray-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Generate Deck Primary CTA Button */}
            <button
              type="button"
              onClick={handleStartGeneration}
              disabled={
                isGenerating || 
                (activeTab === 'country' ? !selectedCountry : !selectedSolution) ||
                generatedDeck !== null
              }
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium shadow-xs transition-all whitespace-nowrap bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] text-white ${
                isGenerating || 
                (activeTab === 'country' ? !selectedCountry : !selectedSolution) ||
                generatedDeck !== null
                  ? 'opacity-40 cursor-not-allowed shadow-none'
                  : 'hover:opacity-95 cursor-pointer shadow-xs'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current text-white" />
              <span>{generatedDeck !== null ? 'Deck generated' : 'Generate deck'}</span>
            </button>
          </div>

          {/* Note below Country Dropdown */}
          {activeTab === 'country' && (
            <p className="text-[0.75rem] text-gray-500 flex items-center gap-1.5 font-normal">
              <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Please ensure that the country you are looking for is already added in the catalogue country list.</span>
            </p>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div>
        {/* State 1: Initial Empty State for Country / Solution tabs */}
        {activeTab !== 'history' && !generatedDeck && !isGenerating && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ED4D19] flex items-center justify-center border border-orange-100 shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-xs text-gray-500 max-w-md font-normal leading-relaxed">
              Search any {activeTab === 'country' ? 'country' : 'solution'} above, then <span className="font-medium text-gray-700">Generate deck</span> to preview the templatized slides and download the full PPT.
            </p>
          </div>
        )}

        {/* State 2: GTM Insights History Tab Table View */}
        {activeTab === 'history' && !generatedDeck && (
          <div className="space-y-4">
            {/* Section Title & Controls (Search + Custom Filter) on the Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#0D212C] font-['Poppins']">
                  GTM Insights History
                </h2>
              </div>

              {/* Search Bar & Custom Kind Filter Dropdown on the right side of the title */}
              <div className="flex items-center gap-2.5">
                <div className="relative w-full sm:w-60">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search decks..."
                    value={historySearchQuery}
                    onChange={(e) => {
                      setHistorySearchQuery(e.target.value);
                      setHistoryCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors shadow-2xs"
                  />
                </div>

                {/* Custom Kind Filter Dropdown */}
                <div className="relative min-w-[116px] shrink-0" ref={kindFilterRef}>
                  <button
                    type="button"
                    onClick={() => setIsKindFilterOpen(!isKindFilterOpen)}
                    className="w-full flex items-center justify-between gap-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-3.5 py-2 text-xs text-[#0D212C] font-normal transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-gray-400" />
                      <span>{kindFilter === 'All' ? 'Filters' : kindFilter}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isKindFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isKindFilterOpen && (
                    <div className="absolute top-full mt-1.5 right-0 min-w-full w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                      {(['All', 'Country', 'Solution'] as const).map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => {
                            setKindFilter(kind);
                            setIsKindFilterOpen(false);
                            setHistoryCurrentPage(1);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            kindFilter === kind
                              ? 'bg-gray-100 text-gray-900 font-normal'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{kind === 'All' ? 'All Type' : kind}</span>
                          {kindFilter === kind && <Check className="w-3.5 h-3.5 text-gray-700" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* History Table */}
            <div className="space-y-3">
              <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase select-none">
                        <th className="py-3 px-6 font-normal w-[45%]">DECK</th>
                        <th className="py-3 px-6 font-normal w-[28%]">DECK TYPE</th>
                        <th className="py-3 px-6 font-normal w-[27%]">GENERATED ON</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[0.875rem]">
                      {paginatedHistoryList.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-xs text-gray-400">
                            No decks found matching "{historySearchQuery}".
                          </td>
                        </tr>
                      ) : (
                        paginatedHistoryList.map((item) => (
                          <tr 
                            key={item.id} 
                            onClick={() => handleOpenHistoryDeck(item)}
                            className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                          >
                            <td className="py-3.5 px-6 font-medium text-[0.8125rem] text-[#0D212C] group-hover:text-[#ED4D19] transition-colors">
                              {item.name}
                            </td>
                            <td className="py-3.5 px-6">
                              <span className={`inline-block px-3 py-0.5 rounded-full text-[0.75rem] font-normal ${
                                item.kind === 'Country'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                  : 'bg-purple-50 text-purple-600 border border-purple-100'
                              }`}>
                                {item.kind}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-xs text-gray-700 font-normal">
                              {item.generatedAt}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls - Outside the table */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-1">
                <div>
                  Showing {filteredHistoryList.length === 0 ? 0 : (historyCurrentPage - 1) * historyItemsPerPage + 1}–
                  {Math.min(historyCurrentPage * historyItemsPerPage, filteredHistoryList.length)} of {filteredHistoryList.length}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setHistoryCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={historyCurrentPage === 1}
                    className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: historyTotalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setHistoryCurrentPage(pageNum)}
                        className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                          historyCurrentPage === pageNum
                            ? 'bg-[#ED4D19] text-white font-medium shadow-2xs'
                            : 'text-gray-500 font-normal hover:text-gray-900'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setHistoryCurrentPage((p) => Math.min(historyTotalPages, p + 1))}
                    disabled={historyCurrentPage === historyTotalPages}
                    className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 3: GENERATED DECK PRESENTATION VIEW */}
        {generatedDeck && (
          <div className="space-y-6">
            {/* Header: Title + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                {activeTab === 'history' && (
                  <button
                    type="button"
                    onClick={() => setGeneratedDeck(null)}
                    className="p-1 text-gray-500 hover:text-gray-900 bg-transparent border-0 transition-colors cursor-pointer shrink-0"
                    title="Back to History"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#0D212C] font-['Poppins']">
                    {generatedDeck.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeTab !== 'history' && (
                  <button
                    type="button"
                    onClick={() => setGeneratedDeck(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-medium text-gray-700 transition-colors shadow-2xs cursor-pointer shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    alert(`Downloading "${generatedDeck.title}.pptx" formatted for M42 executive presentations.`);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 text-white text-xs font-medium rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PPT</span>
                </button>
              </div>
            </div>

            {/* The 3 Branded Slides */}
            <div className="space-y-6 pt-2">
              
              {/* ========================================================================= */}
              {/* COUNTRY DECK SLIDES (When targetType === 'country')                        */}
              {/* ========================================================================= */}
              {generatedDeck.targetType === 'country' && generatedDeck.profile && (
                <>
                  {/* SLIDE 1: COUNTRY OVERVIEW */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                    {/* Clean Minimal Header with Orange Accent Line */}
                    <div className="h-1 w-full bg-[#ED4D19]" />
                    <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100">
                      <div>
                        <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-medium text-[#ED4D19] tracking-wider">
                          SLIDE 1 · COUNTRY OVERVIEW
                        </div>
                        <div className="text-sm sm:text-[0.9375rem] font-medium text-[#0D212C] font-['Poppins'] mt-0.5">
                          {generatedDeck.profile.name}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold text-sm sm:text-base text-[#0D212C] font-['Poppins'] border-b-2 border-[#ED4D19] pb-0.5">
                          M42
                        </span>
                      </div>
                    </div>

                    {/* Slide 1 Content Body */}
                    <div className="p-5 sm:p-6 space-y-4 bg-white">
                      {/* 4 Metrics / Attribute Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1 border border-gray-100/90">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">Population</div>
                          <div className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                            {generatedDeck.profile.population}
                          </div>
                        </div>
                        <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1 border border-gray-100/90">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">Income group</div>
                          <div className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                            {generatedDeck.profile.incomeGroup}
                          </div>
                        </div>
                        <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1 border border-gray-100/90">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">Payer model</div>
                          <div className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                            {generatedDeck.profile.payerModel}
                          </div>
                        </div>
                        <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1 border border-gray-100/90">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">Key driver</div>
                          <div className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                            {generatedDeck.profile.keyDriver}
                          </div>
                        </div>
                      </div>

                      {/* Summary Sentence */}
                      <p className="text-xs text-gray-600 font-normal leading-relaxed">
                        {generatedDeck.profile.summarySentence}
                      </p>

                      {/* Slide Confidential Footer */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.625rem] text-gray-400 font-normal">
                        <span>M42 · Go-To-Market · Strategy team · Confidential</span>
                        <span>Illustrative estimate (figures to be validated)</span>
                      </div>
                    </div>
                  </div>

                  {/* SLIDE 2: HEALTHCARE LANDSCAPE & MATURITY */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                    {/* Clean Minimal Header with Orange Accent Line */}
                    <div className="h-1 w-full bg-[#ED4D19]" />
                    <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100">
                      <div>
                        <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-medium text-[#ED4D19] tracking-wider">
                          SLIDE 2 · HEALTHCARE LANDSCAPE & MATURITY
                        </div>
                        <div className="text-sm sm:text-[0.9375rem] font-medium text-[#0D212C] font-['Poppins'] mt-0.5">
                          {generatedDeck.profile.name} - Market context
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold text-sm sm:text-base text-[#0D212C] font-['Poppins'] border-b-2 border-[#ED4D19] pb-0.5">
                          M42
                        </span>
                      </div>
                    </div>

                    {/* Slide 2 Content Body */}
                    <div className="p-5 sm:p-6 space-y-4 bg-white">
                      {/* 4 Cards with Badges Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1.5 border border-gray-100/90">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">Health spend / capita</div>
                          <div className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                            {generatedDeck.profile.spendCapita}
                          </div>
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[0.625rem] font-normal border ${
                              generatedDeck.profile.spendCapitaBadge === 'High'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : generatedDeck.profile.spendCapitaBadge === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {generatedDeck.profile.spendCapitaBadge}
                            </span>
                          </div>
                        </div>

                        <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1.5 border border-gray-100/90">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">Hospital beds / 1k</div>
                          <div className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                            {generatedDeck.profile.hospitalBeds}
                          </div>
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[0.625rem] font-normal border ${
                              generatedDeck.profile.hospitalBedsBadge === 'High'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : generatedDeck.profile.hospitalBedsBadge === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {generatedDeck.profile.hospitalBedsBadge}
                            </span>
                          </div>
                        </div>

                        <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1.5 border border-gray-100/90">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">Digital-health maturity</div>
                          <div className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                            {generatedDeck.profile.digitalMaturity}
                          </div>
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[0.625rem] font-normal border ${
                              generatedDeck.profile.digitalMaturityBadge === 'High'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : generatedDeck.profile.digitalMaturityBadge === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {generatedDeck.profile.digitalMaturityBadge}
                            </span>
                          </div>
                        </div>

                        <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1.5 border border-gray-100/90">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">Insured population</div>
                          <div className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                            {generatedDeck.profile.insuredPopulation}
                          </div>
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[0.625rem] font-normal border ${
                              generatedDeck.profile.insuredPopulationBadge === 'High'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : generatedDeck.profile.insuredPopulationBadge === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {generatedDeck.profile.insuredPopulationBadge}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Context Note in Italics */}
                      <p className="text-xs text-gray-500 italic font-normal leading-relaxed">
                        Health-system context that drives which solutions fit and what the market will pay.
                      </p>

                      {/* Slide Confidential Footer */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.625rem] text-gray-400 font-normal">
                        <span>M42 · Go-To-Market · Strategy team · Confidential</span>
                        <span>Illustrative estimate (figures to be validated)</span>
                      </div>
                    </div>
                  </div>

                  {/* SLIDE 3: RECOMMENDED SOLUTIONS & REVENUE */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                    {/* Clean Minimal Header with Orange Accent Line */}
                    <div className="h-1 w-full bg-[#ED4D19]" />
                    <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100">
                      <div>
                        <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-medium text-[#ED4D19] tracking-wider">
                          SLIDE 3 · RECOMMENDED SOLUTIONS & REVENUE
                        </div>
                        <div className="text-sm sm:text-[0.9375rem] font-medium text-[#0D212C] font-['Poppins'] mt-0.5">
                          {generatedDeck.profile.name} - Where M42 wins
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold text-sm sm:text-base text-[#0D212C] font-['Poppins'] border-b-2 border-[#ED4D19] pb-0.5">
                          M42
                        </span>
                      </div>
                    </div>

                    {/* Slide 3 Content Body */}
                    <div className="p-5 sm:p-6 space-y-4 bg-white">
                      {/* Recommended Solutions List */}
                      <div className="space-y-3">
                        {generatedDeck.profile.solutions.map((sol, index) => (
                          <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                                  {sol.name}
                                </span>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[0.625rem] font-normal border ${
                                  sol.status === 'Completed'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : sol.status === 'In progress'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : sol.status === 'Prioritised'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                }`}>
                                  {sol.status}
                                </span>
                              </div>
                              <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">
                                Fit {sol.fit}/100 · score {sol.score}/100 · win ~{sol.win}% · {sol.description}
                              </div>
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                              <div className="text-xs sm:text-sm font-medium text-[#ED4D19] font-['Poppins']">
                                {sol.revenue3Yr} <span className="text-gray-400 text-xs font-normal">(3-yr)</span>
                              </div>
                              <div className="text-[0.625rem] text-gray-400 font-normal">
                                ~{sol.annualRev}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Formula Footnote */}
                      <p className="text-[0.625rem] text-gray-500 italic font-normal leading-relaxed pt-1">
                        Revenue = {generatedDeck.profile.name} deal anchor {generatedDeck.profile.dealAnchor} × solution revenue-depth × win-likelihood. Only catalogue solutions carry a score and a $; research-only ideas would show as candidates to add.
                      </p>

                      {/* Slide Confidential Footer */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.625rem] text-gray-400 font-normal">
                        <span>M42 · Go-To-Market · Strategy team · Confidential</span>
                        <span>Illustrative estimate (figures to be validated)</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ========================================================================= */}
              {/* SOLUTION DECK SLIDES (When targetType === 'solution')                      */}
              {/* ========================================================================= */}
              {generatedDeck.targetType === 'solution' && generatedDeck.solutionProfile && (
                <>
                  {/* SLIDE 1: SOLUTION OVERVIEW */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                    {/* Clean Minimal Header with Orange Accent Line */}
                    <div className="h-1 w-full bg-[#ED4D19]" />
                    <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100">
                      <div>
                        <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-medium text-[#ED4D19] tracking-wider">
                          SLIDE 1 · SOLUTION OVERVIEW
                        </div>
                        <div className="text-sm sm:text-[0.9375rem] font-medium text-[#0D212C] font-['Poppins'] mt-0.5">
                          {generatedDeck.solutionProfile.name}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold text-sm sm:text-base text-[#0D212C] font-['Poppins'] border-b-2 border-[#ED4D19] pb-0.5">
                          M42
                        </span>
                      </div>
                    </div>

                    {/* Slide 1 Content Body */}
                    <div className="p-5 sm:p-6 space-y-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Left Column */}
                        <div className="space-y-3.5">
                          <div className="space-y-1">
                            <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-semibold text-gray-500 tracking-wider">
                              THE PROBLEM IT SOLVES
                            </div>
                            <p className="text-xs text-gray-600 font-normal leading-relaxed">
                              {generatedDeck.solutionProfile.problemSolves}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-semibold text-gray-500 tracking-wider">
                              VALUE FOR PEOPLE & BUYERS
                            </div>
                            <ul className="space-y-1 text-xs text-gray-600 font-normal">
                              {generatedDeck.solutionProfile.valueBullets.map((bullet, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-gray-400">•</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3.5">
                          <div className="space-y-1.5">
                            <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-semibold text-gray-500 tracking-wider">
                              KEY FEATURES
                            </div>
                            <ul className="space-y-1 text-xs text-gray-700 font-normal">
                              {generatedDeck.solutionProfile.keyFeatures.map((feat, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-gray-400">•</span>
                                  <span className="text-[#0D212C] font-normal">{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-semibold text-gray-500 tracking-wider">
                              STATUS & POSITIONING
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[0.625rem] font-normal tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {generatedDeck.solutionProfile.status}
                              </span>
                              <span className="inline-block px-2 py-0.5 rounded-full text-[0.625rem] font-normal bg-gray-100 text-gray-700 border border-gray-200">
                                {generatedDeck.solutionProfile.positioning}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Slide Confidential Footer */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.625rem] text-gray-400 font-normal">
                        <span>M42 · Go-To-Market · Strategy team · Confidential</span>
                        <span>Illustrative estimate (figures to be validated)</span>
                      </div>
                    </div>
                  </div>

                  {/* SLIDE 2: REVENUE & SCALABILITY */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                    {/* Clean Minimal Header with Orange Accent Line */}
                    <div className="h-1 w-full bg-[#ED4D19]" />
                    <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100">
                      <div>
                        <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-medium text-[#ED4D19] tracking-wider">
                          SLIDE 2 · REVENUE & SCALABILITY
                        </div>
                        <div className="text-sm sm:text-[0.9375rem] font-medium text-[#0D212C] font-['Poppins'] mt-0.5">
                          {generatedDeck.solutionProfile.name} - The business case
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold text-sm sm:text-base text-[#0D212C] font-['Poppins'] border-b-2 border-[#ED4D19] pb-0.5">
                          M42
                        </span>
                      </div>
                    </div>

                    {/* Slide 2 Content Body */}
                    <div className="p-5 sm:p-6 space-y-4 bg-white">
                      {/* 3 Metric Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1 border border-gray-100/90">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">Expected revenue</div>
                          <div className="text-xs sm:text-sm font-medium text-[#ED4D19] font-['Poppins']">
                            {generatedDeck.solutionProfile.expectedRevenue} <span className="text-gray-400 text-xs font-normal">(3-yr)</span>
                          </div>
                          <div className="text-[0.625rem] text-gray-400 font-normal">
                            ~{generatedDeck.solutionProfile.expectedRevenuePerYear}
                          </div>
                        </div>

                        <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1 border border-gray-100/90">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">TAM (gross obtainable)</div>
                          <div className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                            {generatedDeck.solutionProfile.tam}
                          </div>
                        </div>

                        <div className="bg-[#F8F9FA] rounded-xl p-3 space-y-1 border border-gray-100/90">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal">Addressable markets</div>
                          <div className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                            {generatedDeck.solutionProfile.addressableMarkets}
                          </div>
                        </div>
                      </div>

                      {/* 2 Columns: Why It Scales & Revenue Logic */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-0.5">
                        {/* WHY IT SCALES */}
                        <div className="space-y-1.5">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-semibold text-gray-500 tracking-wider">
                            WHY IT SCALES
                          </div>
                          <ul className="space-y-1.5 text-xs text-gray-600 font-normal">
                            {generatedDeck.solutionProfile.whyItScales.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                <span>
                                  {item.prefix}
                                  <span className="font-medium text-[#0D212C]">{item.bold}</span>
                                  {item.suffix}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* REVENUE LOGIC */}
                        <div className="space-y-1.5">
                          <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-semibold text-gray-500 tracking-wider">
                            REVENUE LOGIC
                          </div>
                          <p className="text-xs text-gray-600 font-normal leading-relaxed">
                            {generatedDeck.solutionProfile.revenueLogic}
                          </p>
                        </div>
                      </div>

                      {/* Slide Confidential Footer */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.625rem] text-gray-400 font-normal">
                        <span>M42 · Go-To-Market · Strategy team · Confidential</span>
                        <span>Illustrative estimate (figures to be validated)</span>
                      </div>
                    </div>
                  </div>

                  {/* SLIDE 3: TOP TARGET COUNTRIES */}
                  <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                    {/* Clean Minimal Header with Orange Accent Line */}
                    <div className="h-1 w-full bg-[#ED4D19]" />
                    <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100">
                      <div>
                        <div className="text-[0.625rem] sm:text-[0.6875rem] uppercase font-medium text-[#ED4D19] tracking-wider">
                          SLIDE 3 · TOP TARGET COUNTRIES
                        </div>
                        <div className="text-sm sm:text-[0.9375rem] font-medium text-[#0D212C] font-['Poppins'] mt-0.5">
                          {generatedDeck.solutionProfile.name} - Where to sell first
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold text-sm sm:text-base text-[#0D212C] font-['Poppins'] border-b-2 border-[#ED4D19] pb-0.5">
                          M42
                        </span>
                      </div>
                    </div>

                    {/* Slide 3 Content Body */}
                    <div className="p-5 sm:p-6 space-y-4 bg-white">
                      {/* Ranked Countries List */}
                      <div className="space-y-3">
                        {generatedDeck.solutionProfile.topCountries.map((country) => (
                          <div key={country.rank} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="flex items-start gap-3">
                              <span className="text-xs sm:text-sm font-medium text-gray-400 w-4 shrink-0 font-['Poppins']">
                                {country.rank}
                              </span>
                              <div className="space-y-0.5">
                                <div className="text-xs sm:text-sm font-medium text-[#0D212C] font-['Poppins']">
                                  {country.name}
                                </div>
                                <div className="text-[0.625rem] sm:text-[0.6875rem] text-gray-500 font-normal leading-relaxed max-w-2xl">
                                  {country.description}
                                </div>
                              </div>
                            </div>

                            <div className="text-left sm:text-right shrink-0 sm:pl-4">
                              <div className="text-xs sm:text-sm font-medium text-[#ED4D19] font-['Poppins']">
                                {country.revenue3Yr} <span className="text-gray-400 text-xs font-normal">(3-yr)</span>
                              </div>
                              <div className="text-[0.625rem] text-gray-400 font-normal">
                                ~{country.annualRev}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footnote */}
                      <p className="text-[0.625rem] text-gray-500 italic font-normal leading-relaxed pt-1">
                        Countries ranked by expected revenue, driven by each market's spend, fit and win-likelihood, with no market over-claimed.
                      </p>

                      {/* Slide Confidential Footer */}
                      <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.625rem] text-gray-400 font-normal">
                        <span>M42 · Go-To-Market · Strategy team · Confidential</span>
                        <span>Illustrative estimate (figures to be validated)</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN THINKING MODE OVERLAY (Matches GenerateReport with Part B Orange Theme) */}
      <AnimatePresence>
        {isGenerating && (
          <div className="fixed inset-0 bg-[#F6F7FB] flex flex-col items-center justify-center p-6 z-50 font-sans select-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full max-w-[560px] flex flex-col items-center"
            >
              
              {/* Circular Progress Indicator in Part B Orange */}
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
                  {/* Active Animated Progress Ring in Part B Orange */}
                  <circle
                    cx="55"
                    cy="55"
                    r={radius}
                    stroke="#ED4D19"
                    strokeWidth="7"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 ease-out"
                  />
                </svg>

                {/* Percentage Centered */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#0D212C] tracking-tight font-['Poppins']">
                    {generationProgress}%
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#0D212C] text-center mb-2 font-['Poppins']">
                Generating GTM Pitch Deck
              </h2>
              <p className="text-xs text-gray-500 text-center mb-8 max-w-md font-normal">
                Synthesizing {activeTab === 'country' ? selectedCountry : selectedSolution} market data, revenue models, and executive slides...
              </p>

              {/* Progress Checklist Steps Card */}
              <div className="w-full bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
                {GTM_GENERATION_STEPS.map((step, idx) => {
                  const isDone = idx < generationStepIndex || generationProgress >= 100;
                  const isCurrent = idx === generationStepIndex && generationProgress < 100;

                  return (
                    <div key={idx} className="flex items-center gap-3.5">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-[#ED4D19] border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300 ml-1.5" />
                        )}
                      </div>

                      <span
                        className={`text-xs transition-colors duration-200 ${
                          isDone
                            ? 'text-[#0D212C] font-medium'
                            : isCurrent
                            ? 'text-[#ED4D19] font-semibold'
                            : 'text-gray-400 font-normal'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
