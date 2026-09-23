import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Layers, 
  Play, 
  Download, 
  RotateCcw, 
  Check, 
  ChevronDown, 
  FileText, 
  Sparkles, 
  Share2, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign
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

const COUNTRY_GTM_DATA: Record<string, CountryGtmProfile> = {
  'Saudi Arabia': {
    name: 'Saudi Arabia',
    population: '36.9M',
    incomeGroup: 'High income',
    payerModel: 'Expanding insurance',
    keyDriver: 'Vision 2030 build-out',
    summarySentence: 'Large market with heavy public investment; hospital-ops and insurance solutions scale with the reform programme.',
    spendCapita: '$1,485',
    spendCapitaBadge: 'High',
    hospitalBeds: '2.2',
    hospitalBedsBadge: 'High',
    digitalMaturity: 'Growing',
    digitalMaturityBadge: 'Medium',
    insuredPopulation: '~68%',
    insuredPopulationBadge: 'Medium',
    dealAnchor: '$6M',
    solutions: [
      {
        name: 'Hospital Ops & Clinical Workflow',
        status: 'In progress',
        fit: 86,
        score: 75,
        win: 63,
        description: 'streamlined admission-to-discharge.',
        revenue3Yr: '$4.7M',
        annualRev: '$1.6M/yr'
      },
      {
        name: 'InsurTech & Reimbursement',
        status: 'In progress',
        fit: 78,
        score: 80,
        win: 59,
        description: 'automated, fraud-aware claims.',
        revenue3Yr: '$4.4M',
        annualRev: '$1.5M/yr'
      },
      {
        name: 'Pharmacy & Medication',
        status: 'Prioritised',
        fit: 72,
        score: 59,
        win: 56,
        description: 'e-prescription through to fulfilment.',
        revenue3Yr: '$3.6M',
        annualRev: '$1.2M/yr'
      },
      {
        name: 'EMR & Interoperability',
        status: 'Completed',
        fit: 68,
        score: 66,
        win: 54,
        description: 'single longitudinal patient record.',
        revenue3Yr: '$3.5M',
        annualRev: '$1.2M/yr'
      },
      {
        name: 'Remote Patient Monitoring',
        status: 'Prioritised',
        fit: 60,
        score: 78,
        win: 50,
        description: 'continuous vitals & early alerts.',
        revenue3Yr: '$3.7M',
        annualRev: '$1.2M/yr'
      }
    ]
  },
  'United Arab Emirates': {
    name: 'United Arab Emirates',
    population: '9.4M',
    incomeGroup: 'High income',
    payerModel: 'Universal mandatory insurance',
    keyDriver: 'Unified Malaffi / Nabidh HIE',
    summarySentence: 'Premium digital-first market with high private and public willingness-to-pay for distinctive AI and clinical workflow tools.',
    spendCapita: '$1,842',
    spendCapitaBadge: 'High',
    hospitalBeds: '2.9',
    hospitalBedsBadge: 'High',
    digitalMaturity: 'Advanced',
    digitalMaturityBadge: 'High',
    insuredPopulation: '~98%',
    insuredPopulationBadge: 'High',
    dealAnchor: '$5M',
    solutions: [
      {
        name: 'InsurTech & Reimbursement',
        status: 'In progress',
        fit: 88,
        score: 80,
        win: 68,
        description: 'automated pre-auth & fraud claims anomaly detection.',
        revenue3Yr: '$4.8M',
        annualRev: '$1.6M/yr'
      },
      {
        name: 'EMR & Interoperability',
        status: 'Completed',
        fit: 84,
        score: 66,
        win: 65,
        description: 'Malaffi/Nabidh FHIR integration core.',
        revenue3Yr: '$4.2M',
        annualRev: '$1.4M/yr'
      },
      {
        name: 'Hospital Ops & Clinical Workflow',
        status: 'In progress',
        fit: 80,
        score: 75,
        win: 60,
        description: 'smart capacity allocation & bedside routing.',
        revenue3Yr: '$4.0M',
        annualRev: '$1.3M/yr'
      },
      {
        name: 'Remote Patient Monitoring',
        status: 'Prioritised',
        fit: 75,
        score: 78,
        win: 58,
        description: 'chronic disease management telemetry.',
        revenue3Yr: '$3.8M',
        annualRev: '$1.3M/yr'
      },
      {
        name: 'Population Health & Analytics',
        status: 'New',
        fit: 70,
        score: 73,
        win: 52,
        description: 'preventive cohort risk scoring.',
        revenue3Yr: '$3.2M',
        annualRev: '$1.1M/yr'
      }
    ]
  },
  'Jordan': {
    name: 'Jordan',
    population: '11.3M',
    incomeGroup: 'Upper middle income',
    payerModel: 'Mixed Public & Military',
    keyDriver: 'Hakeem Program Modernisation',
    summarySentence: 'Emerging regional healthcare hub with strong medical tourism and government digitization initiatives.',
    spendCapita: '$304',
    spendCapitaBadge: 'Medium',
    hospitalBeds: '1.8',
    hospitalBedsBadge: 'Medium',
    digitalMaturity: 'Moderate',
    digitalMaturityBadge: 'Medium',
    insuredPopulation: '~72%',
    insuredPopulationBadge: 'Medium',
    dealAnchor: '$1.3M',
    solutions: [
      {
        name: 'EMR & Interoperability',
        status: 'Completed',
        fit: 82,
        score: 66,
        win: 58,
        description: 'national clinical data repository linkage.',
        revenue3Yr: '$1.1M',
        annualRev: '$0.37M/yr'
      },
      {
        name: 'Hospital Ops & Clinical Workflow',
        status: 'In progress',
        fit: 74,
        score: 75,
        win: 52,
        description: 'bed turnaround and patient routing.',
        revenue3Yr: '$0.9M',
        annualRev: '$0.30M/yr'
      },
      {
        name: 'Pharmacy & Medication',
        status: 'Prioritised',
        fit: 68,
        score: 59,
        win: 48,
        description: 'formulary integration & dispensary controls.',
        revenue3Yr: '$0.7M',
        annualRev: '$0.23M/yr'
      }
    ]
  },
  'Estonia': {
    name: 'Estonia',
    population: '1.3M',
    incomeGroup: 'High income',
    payerModel: 'Single-payer EHIF',
    keyDriver: 'e-Health 2.0 & Genomic Data',
    summarySentence: 'Global benchmark for digital governance with 99% electronic health data and high AI adoption willingness.',
    spendCapita: '$1,733',
    spendCapitaBadge: 'High',
    hospitalBeds: '3.4',
    hospitalBedsBadge: 'High',
    digitalMaturity: 'Mature',
    digitalMaturityBadge: 'High',
    insuredPopulation: '~95%',
    insuredPopulationBadge: 'High',
    dealAnchor: '$2M',
    solutions: [
      {
        name: 'Population Health & Analytics',
        status: 'New',
        fit: 88,
        score: 73,
        win: 64,
        description: 'genomic risk stratification & cohort modeling.',
        revenue3Yr: '$1.8M',
        annualRev: '$0.60M/yr'
      },
      {
        name: 'Remote Patient Monitoring',
        status: 'Prioritised',
        fit: 80,
        score: 78,
        win: 60,
        description: 'decentralized chronic patient telemetry.',
        revenue3Yr: '$1.5M',
        annualRev: '$0.50M/yr'
      },
      {
        name: 'InsurTech & Reimbursement',
        status: 'In progress',
        fit: 75,
        score: 80,
        win: 55,
        description: 'automated DRG audit & anomaly scoring.',
        revenue3Yr: '$1.2M',
        annualRev: '$0.40M/yr'
      }
    ]
  },
  'South Korea': {
    name: 'South Korea',
    population: '51.7M',
    incomeGroup: 'High income',
    payerModel: 'NHIS Single-payer',
    keyDriver: 'Smart Hospital Initiative',
    summarySentence: 'High-density tech-forward healthcare infrastructure with massive clinical data volumes and hospital automation demand.',
    spendCapita: '$2,600',
    spendCapitaBadge: 'High',
    hospitalBeds: '12.8',
    hospitalBedsBadge: 'High',
    digitalMaturity: 'Advanced',
    digitalMaturityBadge: 'High',
    insuredPopulation: '~97%',
    insuredPopulationBadge: 'High',
    dealAnchor: '$8M',
    solutions: [
      {
        name: 'Hospital Ops & Clinical Workflow',
        status: 'In progress',
        fit: 90,
        score: 75,
        win: 66,
        description: 'AI robotic triage & acute ward workflow.',
        revenue3Yr: '$6.5M',
        annualRev: '$2.17M/yr'
      },
      {
        name: 'Drug Discovery',
        status: 'New',
        fit: 85,
        score: 69,
        win: 60,
        description: 'genomics AI target identification.',
        revenue3Yr: '$5.8M',
        annualRev: '$1.93M/yr'
      },
      {
        name: 'Remote Patient Monitoring',
        status: 'Prioritised',
        fit: 82,
        score: 78,
        win: 58,
        description: 'elderly home care physiological alerts.',
        revenue3Yr: '$5.2M',
        annualRev: '$1.73M/yr'
      }
    ]
  },
  'United States': {
    name: 'United States',
    population: '333M',
    incomeGroup: 'High income',
    payerModel: 'Commercial & Medicare/Medicaid',
    keyDriver: 'HTI-1 / HTI-2 Interoperability',
    summarySentence: 'Massive addressable spend with intense focus on value-based care risk adjustments and automated claim denials management.',
    spendCapita: '$12,555',
    spendCapitaBadge: 'High',
    hospitalBeds: '2.8',
    hospitalBedsBadge: 'High',
    digitalMaturity: 'Advanced',
    digitalMaturityBadge: 'High',
    insuredPopulation: '~92%',
    insuredPopulationBadge: 'High',
    dealAnchor: '$16M',
    solutions: [
      {
        name: 'InsurTech & Reimbursement',
        status: 'In progress',
        fit: 92,
        score: 80,
        win: 70,
        description: 'automated prior-auth & claims dispute engine.',
        revenue3Yr: '$14.2M',
        annualRev: '$4.73M/yr'
      },
      {
        name: 'EMR & Interoperability',
        status: 'Completed',
        fit: 86,
        score: 66,
        win: 62,
        description: 'cross-EHR TEFCA interoperability bridge.',
        revenue3Yr: '$12.5M',
        annualRev: '$4.17M/yr'
      },
      {
        name: 'Remote Patient Monitoring',
        status: 'Prioritised',
        fit: 80,
        score: 78,
        win: 56,
        description: 'reimbursable RPM CPT code telemetry platform.',
        revenue3Yr: '$11.0M',
        annualRev: '$3.67M/yr'
      }
    ]
  },
  'Azerbaijan': {
    name: 'Azerbaijan',
    population: '10.1M',
    incomeGroup: 'Upper middle income',
    payerModel: 'Mandatory Health Insurance (ITS)',
    keyDriver: 'National Digital Transformation',
    summarySentence: 'Rapidly modernizing healthcare system with recent mandatory insurance rollout and central E-Health portal expansion.',
    spendCapita: '$230',
    spendCapitaBadge: 'Low',
    hospitalBeds: '4.1',
    hospitalBedsBadge: 'High',
    digitalMaturity: 'Developing',
    digitalMaturityBadge: 'Low',
    insuredPopulation: '~85%',
    insuredPopulationBadge: 'Medium',
    dealAnchor: '$1M',
    solutions: [
      {
        name: 'EMR & Interoperability',
        status: 'Completed',
        fit: 78,
        score: 66,
        win: 55,
        description: 'regional clinic digitization & unified record.',
        revenue3Yr: '$0.8M',
        annualRev: '$0.27M/yr'
      },
      {
        name: 'Pharmacy & Medication',
        status: 'Prioritised',
        fit: 70,
        score: 59,
        win: 50,
        description: 'electronic prescribing & reimbursement audit.',
        revenue3Yr: '$0.6M',
        annualRev: '$0.20M/yr'
      },
      {
        name: 'Population Health & Analytics',
        status: 'New',
        fit: 65,
        score: 73,
        win: 45,
        description: 'regional health indicators surveillance.',
        revenue3Yr: '$0.5M',
        annualRev: '$0.17M/yr'
      }
    ]
  }
};

function getCountryProfile(countryName: string, allCountries: any[]): CountryGtmProfile {
  if (COUNTRY_GTM_DATA[countryName]) {
    return COUNTRY_GTM_DATA[countryName];
  }
  const matched = allCountries.find(c => c.name === countryName);
  return {
    name: countryName,
    population: matched ? matched.population : '15M',
    incomeGroup: 'High income',
    payerModel: 'Expanding universal coverage',
    keyDriver: 'National Health Digitization Strategy',
    summarySentence: `Strategic target market with active investments in digital health records, hospital operational efficiency, and automated claims workflows.`,
    spendCapita: matched ? matched.spendCapita : '$1,200',
    spendCapitaBadge: 'High',
    hospitalBeds: '2.5',
    hospitalBedsBadge: 'High',
    digitalMaturity: 'Growing',
    digitalMaturityBadge: 'Medium',
    insuredPopulation: '~75%',
    insuredPopulationBadge: 'Medium',
    dealAnchor: matched ? matched.dealAnchor : '$3M',
    solutions: [
      {
        name: 'Hospital Ops & Clinical Workflow',
        status: 'In progress',
        fit: 82,
        score: 75,
        win: 60,
        description: 'streamlined admission-to-discharge.',
        revenue3Yr: '$2.5M',
        annualRev: '$0.83M/yr'
      },
      {
        name: 'InsurTech & Reimbursement',
        status: 'In progress',
        fit: 78,
        score: 80,
        win: 56,
        description: 'automated pre-authorization and claims verification.',
        revenue3Yr: '$2.2M',
        annualRev: '$0.73M/yr'
      },
      {
        name: 'EMR & Interoperability',
        status: 'Completed',
        fit: 74,
        score: 66,
        win: 54,
        description: 'single longitudinal patient record & FHIR core.',
        revenue3Yr: '$2.0M',
        annualRev: '$0.67M/yr'
      }
    ]
  };
}

export default function GtmInsights() {
  const [activeTab, setActiveTab] = useState<'country' | 'solution'>('country');
  
  const { countries, solutions } = useMagicStore();

  // Selected values (empty by default to require user selection)
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSolution, setSelectedSolution] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isSolutionDropdownOpen, setIsSolutionDropdownOpen] = useState(false);

  // Generation & Thinking Mode State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepIndex, setGenerationStepIndex] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(10);
  const [generatedDeck, setGeneratedDeck] = useState<{
    targetType: 'country' | 'solution';
    title: string;
    subtitle: string;
    profile: CountryGtmProfile;
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      if (activeTab === 'country') {
        const profile = getCountryProfile(selectedCountry || 'Saudi Arabia', countries);
        setGeneratedDeck({
          targetType: 'country',
          title: `${selectedCountry || 'Saudi Arabia'} — Go-To-Market Pitch Deck`,
          subtitle: `M42 Digital Health Expansion & Monetisation Strategy for ${selectedCountry || 'Saudi Arabia'}`,
          profile
        });
      } else {
        const sol = solutions.find(s => s.name === selectedSolution) || solutions[0];
        const profile = getCountryProfile('Saudi Arabia', countries);
        setGeneratedDeck({
          targetType: 'solution',
          title: `${selectedSolution} — Solution Pitch Deck`,
          subtitle: `Commercialisation Strategy & Cross-Border Scaling for ${selectedSolution}`,
          profile,
          solutionName: selectedSolution
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
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 md:py-8 space-y-6">
      
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
        </nav>
      </div>


      {/* Input Selection Bar & Generate CTA */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700">
          {activeTab === 'country' 
            ? 'Target country — search any country' 
            : 'Target solution — select any catalogue solution'}
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* TAB 1: Country Dropdown Selection */}
          {activeTab === 'country' && (
            <div className="relative flex-1" ref={countryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-3 text-[0.875rem] text-left flex items-center justify-between shadow-2xs transition-colors cursor-pointer"
              >
                {selectedCountry ? (
                  <div className="flex items-center gap-2.5">
                    <CountryFlag country={selectedCountry} className="w-5 h-3.5 rounded-2xs shadow-2xs" />
                    <span className="font-medium text-[#0D212C]">{selectedCountry}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 font-normal">Select target country...</span>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
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
                      className={`w-full px-4 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        selectedCountry === c.name
                          ? 'bg-[#fef3eb] text-[#ED4D19] font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CountryFlag country={c.name} className="w-4 h-3 rounded-2xs" />
                        <span>{c.name}</span>
                      </div>
                      {selectedCountry === c.name && <Check className="w-4 h-4 text-[#ED4D19]" />}
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
                className="w-full bg-white border border-gray-200 hover:border-gray-300 rounded-xl px-4 py-3 text-[0.875rem] text-left flex items-center justify-between shadow-2xs transition-colors cursor-pointer"
              >
                {selectedSolution ? (
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-[#ED4D19]" />
                    <span className="font-medium text-[#0D212C]">{selectedSolution}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 font-normal">Select target solution...</span>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSolutionDropdownOpen ? 'rotate-180' : ''}`} />
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
                      className={`w-full px-4 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        selectedSolution === s.name
                          ? 'bg-[#fef3eb] text-[#ED4D19] font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-medium">{s.name}</span>
                        <span className="text-[11px] text-gray-400">({s.positioning})</span>
                      </div>
                      {selectedSolution === s.name && <Check className="w-4 h-4 text-[#ED4D19]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generate Deck Primary CTA Button (Disabled when no selection or already generated) */}
          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={
              isGenerating || 
              (activeTab === 'country' ? !selectedCountry : !selectedSolution) ||
              generatedDeck !== null
            }
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold shadow-xs transition-all whitespace-nowrap bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] text-white ${
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
      </div>

      {/* Main Content Area */}
      <div>
        {/* State 1: Initial Empty State */}
        {!generatedDeck && !isGenerating && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ED4D19] flex items-center justify-center border border-orange-100 shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-xs text-gray-500 max-w-md font-normal leading-relaxed">
              Search any {activeTab === 'country' ? 'country' : 'solution'} above, then <span className="font-medium text-gray-700">Generate deck</span> to preview the templatized slides and download the full PPT.
            </p>
          </div>
        )}

        {/* GENERATED DECK PRESENTATION VIEW (Matching Reference Slides & Clean Header) */}
        {generatedDeck && (
          <div className="space-y-6">
            {/* Header: Title & Subtitle Only (No extra cards) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-100 text-[#ED4D19] text-[0.6875rem] font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>M42 GTM DECK READY</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-[#0D212C] font-['Poppins']">
                  {generatedDeck.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 font-normal">
                  {generatedDeck.subtitle}
                </p>
              </div>

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

            {/* The 3 Branded Slides matching Reference Images in Part B Minimal Branding */}
            <div className="space-y-6 pt-2">
              
              {/* SLIDE 1: COUNTRY OVERVIEW */}
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                {/* Clean Minimal Header with Orange Accent Line */}
                <div className="h-1 w-full bg-[#ED4D19]" />
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
                  <div>
                    <div className="text-[0.6875rem] uppercase font-semibold text-[#ED4D19] tracking-wider">
                      SLIDE 1 · COUNTRY OVERVIEW
                    </div>
                    <div className="text-lg sm:text-xl font-semibold text-[#0D212C] font-['Poppins'] mt-0.5">
                      {generatedDeck.profile.name}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-lg text-[#0D212C] font-['Poppins'] border-b-2 border-[#ED4D19] pb-0.5">
                      M42
                    </span>
                  </div>
                </div>

                {/* Slide 1 Content Body */}
                <div className="p-6 sm:p-7 space-y-5 bg-white">
                  {/* 4 Metrics / Attribute Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-1.5 border border-gray-100/90">
                      <div className="text-xs text-gray-500 font-normal">Population</div>
                      <div className="text-base sm:text-lg font-semibold text-[#0D212C] font-['Poppins']">
                        {generatedDeck.profile.population}
                      </div>
                    </div>
                    <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-1.5 border border-gray-100/90">
                      <div className="text-xs text-gray-500 font-normal">Income group</div>
                      <div className="text-base sm:text-lg font-semibold text-[#0D212C] font-['Poppins']">
                        {generatedDeck.profile.incomeGroup}
                      </div>
                    </div>
                    <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-1.5 border border-gray-100/90">
                      <div className="text-xs text-gray-500 font-normal">Payer model</div>
                      <div className="text-base sm:text-lg font-semibold text-[#0D212C] font-['Poppins']">
                        {generatedDeck.profile.payerModel}
                      </div>
                    </div>
                    <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-1.5 border border-gray-100/90">
                      <div className="text-xs text-gray-500 font-normal">Key driver</div>
                      <div className="text-base sm:text-lg font-semibold text-[#0D212C] font-['Poppins']">
                        {generatedDeck.profile.keyDriver}
                      </div>
                    </div>
                  </div>

                  {/* Summary Sentence */}
                  <p className="text-xs sm:text-sm text-gray-600 font-normal leading-relaxed">
                    {generatedDeck.profile.summarySentence}
                  </p>

                  {/* Slide Confidential Footer */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.6875rem] text-gray-400 font-normal">
                    <span>M42 · Go-To-Market · Strategy team · Confidential</span>
                    <span>Illustrative estimate — figures to be validated</span>
                  </div>
                </div>
              </div>

              {/* SLIDE 2: HEALTHCARE LANDSCAPE & MATURITY */}
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                {/* Clean Minimal Header with Orange Accent Line */}
                <div className="h-1 w-full bg-[#ED4D19]" />
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
                  <div>
                    <div className="text-[0.6875rem] uppercase font-semibold text-[#ED4D19] tracking-wider">
                      SLIDE 2 · HEALTHCARE LANDSCAPE & MATURITY
                    </div>
                    <div className="text-lg sm:text-xl font-semibold text-[#0D212C] font-['Poppins'] mt-0.5">
                      {generatedDeck.profile.name} — market context
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-lg text-[#0D212C] font-['Poppins'] border-b-2 border-[#ED4D19] pb-0.5">
                      M42
                    </span>
                  </div>
                </div>

                {/* Slide 2 Content Body */}
                <div className="p-6 sm:p-7 space-y-5 bg-white">
                  {/* 4 Cards with Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-2 border border-gray-100/90">
                      <div className="text-xs text-gray-500 font-normal">Health spend / capita</div>
                      <div className="text-base sm:text-lg font-semibold text-[#0D212C] font-['Poppins']">
                        {generatedDeck.profile.spendCapita}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium border ${
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

                    <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-2 border border-gray-100/90">
                      <div className="text-xs text-gray-500 font-normal">Hospital beds / 1k</div>
                      <div className="text-base sm:text-lg font-semibold text-[#0D212C] font-['Poppins']">
                        {generatedDeck.profile.hospitalBeds}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium border ${
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

                    <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-2 border border-gray-100/90">
                      <div className="text-xs text-gray-500 font-normal">Digital-health maturity</div>
                      <div className="text-base sm:text-lg font-semibold text-[#0D212C] font-['Poppins']">
                        {generatedDeck.profile.digitalMaturity}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium border ${
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

                    <div className="bg-[#F8F9FA] rounded-xl p-4 space-y-2 border border-gray-100/90">
                      <div className="text-xs text-gray-500 font-normal">Insured population</div>
                      <div className="text-base sm:text-lg font-semibold text-[#0D212C] font-['Poppins']">
                        {generatedDeck.profile.insuredPopulation}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium border ${
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
                  <p className="text-xs sm:text-sm text-gray-500 italic font-normal leading-relaxed">
                    Health-system context that drives which solutions fit and what the market will pay.
                  </p>

                  {/* Slide Confidential Footer */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.6875rem] text-gray-400 font-normal">
                    <span>M42 · Go-To-Market · Strategy team · Confidential</span>
                    <span>Illustrative estimate — figures to be validated</span>
                  </div>
                </div>
              </div>

              {/* SLIDE 3: RECOMMENDED SOLUTIONS & REVENUE */}
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
                {/* Clean Minimal Header with Orange Accent Line */}
                <div className="h-1 w-full bg-[#ED4D19]" />
                <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100">
                  <div>
                    <div className="text-[0.6875rem] uppercase font-semibold text-[#ED4D19] tracking-wider">
                      SLIDE 3 · RECOMMENDED SOLUTIONS & REVENUE
                    </div>
                    <div className="text-lg sm:text-xl font-semibold text-[#0D212C] font-['Poppins'] mt-0.5">
                      {generatedDeck.profile.name} — where M42 wins
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-lg text-[#0D212C] font-['Poppins'] border-b-2 border-[#ED4D19] pb-0.5">
                      M42
                    </span>
                  </div>
                </div>

                {/* Slide 3 Content Body */}
                <div className="p-6 sm:p-7 space-y-5 bg-white">
                  {/* Recommended Solutions List */}
                  <div className="space-y-4">
                    {generatedDeck.profile.solutions.map((sol, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm sm:text-base font-semibold text-[#0D212C] font-['Poppins']">
                              {sol.name}
                            </span>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium border ${
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
                          <div className="text-xs text-gray-500 font-normal">
                            Fit {sol.fit}/100 · score {sol.score}/100 · win ~{sol.win}% — {sol.description}
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-base sm:text-lg font-semibold text-[#ED4D19] font-['Poppins']">
                            {sol.revenue3Yr}
                          </div>
                          <div className="text-[0.6875rem] text-gray-400 italic font-normal">
                            3-yr · ~{sol.annualRev}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Formula Footnote */}
                  <p className="text-[0.6875rem] text-gray-500 italic font-normal leading-relaxed pt-2">
                    Revenue = {generatedDeck.profile.name} deal anchor {generatedDeck.profile.dealAnchor} × solution revenue-depth × win-likelihood. Only catalogue solutions carry a score and a $; research-only ideas would show as candidates to add.
                  </p>

                  {/* Slide Confidential Footer */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.6875rem] text-gray-400 font-normal">
                    <span>M42 · Go-To-Market · Strategy team · Confidential</span>
                    <span>Illustrative estimate — figures to be validated</span>
                  </div>
                </div>
              </div>

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
