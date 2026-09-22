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
    dealAnchor: string;
    tam: string;
    targetDate: string;
    slides: {
      slideNumber: number;
      title: string;
      category: string;
      keyPoints: string[];
      highlight: string;
    }[];
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
        const cnt = countries.find(c => c.name === selectedCountry) || countries[0];
        setGeneratedDeck({
          targetType: 'country',
          title: `${selectedCountry || 'Target Market'} — Go-To-Market Pitch Deck`,
          subtitle: `M42 Digital Health Expansion & Monetisation Strategy for ${selectedCountry || 'Target Market'}`,
          dealAnchor: cnt ? cnt.dealAnchor : '$5M',
          tam: cnt ? cnt.totalSpend : '$17B',
          targetDate: 'Q3 2026',
          slides: [
            {
              slideNumber: 1,
              title: "Market Profile & Digital Health Landscape",
              category: "Market Landscape",
              keyPoints: [
                `Total healthcare spend estimated at ${cnt.totalSpend} with ${cnt.spendCapita} spend per capita.`,
                `Digital health adoption currently represents ${cnt.digitalShare} of aggregate expenditure with strong tailwinds.`,
                "National priorities center on unified health records, predictive population wellness, and automated reimbursement."
              ],
              highlight: `Addressable Market: ${cnt.totalSpend} (${cnt.confidence} Conviction)`
            },
            {
              slideNumber: 2,
              title: "Strategic Solution Bundling & Deal Anchor",
              category: "Commercial Strategy",
              keyPoints: [
                `Conservative 3-year deal anchor sized at ${cnt.dealAnchor} per health network deployment.`,
                "Lead offer combines EMR Interoperability core with InsurTech automated claims verification.",
                "Fast deployment timeline using pre-built FHIR connectors and scalable containerized modules."
              ],
              highlight: `Deal Anchor: ${cnt.dealAnchor} ARR`
            },
            {
              slideNumber: 3,
              title: "Competitive Edge & Defensibility",
              category: "Differentiation",
              keyPoints: [
                "Built-once foundation with 80% portfolio synergy reduces deployment friction by 60%.",
                "Proven compliance across regional data sovereignty standards and national privacy frameworks.",
                "End-to-end telemetry and clinical decision support integrated at point of care."
              ],
              highlight: "Moat: 80% Shared Architecture Reuse"
            },
            {
              slideNumber: 4,
              title: "Rollout Roadmap & Key Milestone Delivery",
              category: "Implementation",
              keyPoints: [
                "Phase 1 (Months 1–3): Core EMR & Lab Bridge Integration.",
                "Phase 2 (Months 4–6): Provider Portal & Automated Claims Pilot.",
                "Phase 3 (Months 7–12): Multi-site rollout & Longitudinal Patient Analytics."
              ],
              highlight: "Time-to-Value: Under 90 Days"
            }
          ]
        });
      } else {
        const sol = solutions.find(s => s.name === selectedSolution) || solutions[0];
        setGeneratedDeck({
          targetType: 'solution',
          title: `${selectedSolution} — Solution Pitch Deck`,
          subtitle: `Commercialisation Strategy & Cross-Border Scaling for ${selectedSolution}`,
          dealAnchor: '$4.5M',
          tam: sol.revenue3Yr || '$21M',
          targetDate: 'Q3 2026',
          slides: [
            {
              slideNumber: 1,
              title: "Executive Solution Overview",
              category: "Product Overview",
              keyPoints: [
                `3-year cumulative addressable revenue estimated at ${sol.revenue3Yr}.`,
                `High portfolio synergy across ${sol.compCount} modular reusable build components.`,
                `Positioned as '${sol.positioning}' offering with distinctive competitive moat.`
              ],
              highlight: `3-Yr Revenue Target: ${sol.revenue3Yr}`
            },
            {
              slideNumber: 2,
              title: "Target Market Readiness & Economics",
              category: "Market Expansion",
              keyPoints: [
                "Priority deployment across high-conviction markets with proven public & private reimbursement budgets.",
                "Predictable subscription SaaS model paired with value-based transaction tiers.",
                "Near-zero marginal cost of duplication across subsequent hospital network implementations."
              ],
              highlight: "Gross Margin Target: 82%"
            },
            {
              slideNumber: 3,
              title: "Technical Architecture & Security",
              category: "Engineering",
              keyPoints: [
                "Microservices architecture with pre-integrated FHIR bridges and audit logs.",
                "Enterprise-grade encryption and tenant isolation certified for hospital network SLA requirements.",
                "Seamless continuous deployment pipelines with 99.99% uptime guarantees."
              ],
              highlight: "Deployment Velocity: 14 Days"
            }
          ]
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

      {/* Page Header Subtext */}
      <div className="max-w-4xl">
        <p className="text-xs text-gray-500 leading-relaxed font-light">
          Search by country or solution to generate an M42-branded go-to-market deck with an on-screen preview and editable PPT. All revenue estimates are data-backed and realistic.
        </p>
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
            <p className="text-sm text-gray-500 max-w-md font-normal leading-relaxed">
              Search any {activeTab === 'country' ? 'country' : 'solution'} above, then <span className="font-medium text-gray-700">Generate deck</span> to preview the templatized slides and download the full PPT.
            </p>
          </div>
        )}

        {/* GENERATED DECK PRESENTATION VIEW (Compact & Streamlined Header) */}
        {generatedDeck && (
          <div className="space-y-6">
            {/* Streamlined Presentation Header Card */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 md:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="space-y-1 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-100 text-[#ED4D19] text-[0.6875rem] font-semibold">
                    <Sparkles className="w-3 h-3" />
                    <span>M42 GTM DECK READY</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#0D212C] font-['Poppins']">
                    {generatedDeck.title}
                  </h2>
                  <p className="text-xs text-gray-500 font-normal">
                    {generatedDeck.subtitle}
                  </p>
                </div>

                {/* Download PPT CTA */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Downloading "${generatedDeck.title}.pptx" formatted for M42 executive presentations.`);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 text-white text-xs font-medium rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PPT (.pptx)</span>
                  </button>
                </div>
              </div>

              {/* Compact Key Metric Anchor Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50/70 rounded-xl p-3.5 space-y-0.5 border border-gray-100">
                  <div className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
                    ESTIMATED DEAL ANCHOR
                  </div>
                  <div className="text-xl font-bold text-[#ED4D19] font-['Poppins']">
                    {generatedDeck.dealAnchor}
                  </div>
                </div>

                <div className="bg-gray-50/70 rounded-xl p-3.5 space-y-0.5 border border-gray-100">
                  <div className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
                    MARKET TAM / REACH
                  </div>
                  <div className="text-xl font-bold text-[#0D212C] font-['Poppins']">
                    {generatedDeck.tam}
                  </div>
                </div>

                <div className="bg-gray-50/70 rounded-xl p-3.5 space-y-0.5 border border-gray-100">
                  <div className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
                    TARGET TIMELINE
                  </div>
                  <div className="text-xl font-bold text-[#0D212C] font-['Poppins']">
                    {generatedDeck.targetDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Previews (1 Slide in 1 Row with Rich Visuals) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#0D212C] font-['Poppins']">
                  Templatized Slide Outlines ({generatedDeck.slides.length} Slides)
                </h3>
                <span className="text-xs text-gray-400 font-normal">
                  M42 Executive Theme · 16:9 Aspect Ratio · 1 Slide Per Row
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {generatedDeck.slides.map((slide) => (
                  <div
                    key={slide.slideNumber}
                    className="bg-white rounded-2xl border border-gray-200/90 p-6 sm:p-7 shadow-xs hover:border-gray-300 transition-all group"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      
                      {/* Left: Narrative Content (7 Cols) */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-0.5 rounded-md text-[0.6875rem] font-semibold bg-gray-100 text-gray-700">
                            SLIDE {slide.slideNumber}
                          </span>
                          <span className="text-xs font-medium text-gray-400">
                            {slide.category}
                          </span>
                        </div>

                        <h4 className="text-lg font-semibold text-[#0D212C] font-['Poppins'] group-hover:text-[#ED4D19] transition-colors">
                          {slide.title}
                        </h4>

                        <ul className="space-y-2.5 pt-1">
                          {slide.keyPoints.map((pt, i) => (
                            <li key={i} className="text-xs sm:text-sm text-gray-600 font-normal flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ED4D19] mt-2 shrink-0" />
                              <span className="leading-relaxed">{pt}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="font-medium text-[#ED4D19]">
                            {slide.highlight}
                          </span>
                          <span className="text-gray-400 text-[11px]">
                            Included in PPT Deck
                          </span>
                        </div>
                      </div>

                      {/* Right: Rich Visual Graphic Card (5 Cols) */}
                      <div className="lg:col-span-5 bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-xl p-5 border border-gray-100 space-y-3.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 pb-2 border-b border-gray-200/60">
                          <span>Slide {slide.slideNumber} Executive Visual</span>
                          <span className="text-[#ED4D19] text-[11px]">Live Preview</span>
                        </div>

                        {/* Visual for Slide 1 (Strategic Positioning) */}
                        {slide.slideNumber === 1 && (
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[11px] text-gray-500">
                                <span>Healthcare Digital Readiness</span>
                                <span className="font-semibold text-gray-800">88%</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full bg-[#ED4D19] rounded-full w-[88%]" />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[11px] text-gray-500">
                                <span>Regulatory & FHIR Alignment</span>
                                <span className="font-semibold text-gray-800">94%</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                                <div className="h-full bg-[#36c0c9] rounded-full w-[94%]" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100 text-[11px] text-gray-600">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>M42 Trusted Government Healthcare Partner</span>
                            </div>
                          </div>
                        )}

                        {/* Visual for Slide 2 (Commercial Architecture) */}
                        {slide.slideNumber === 2 && (
                          <div className="space-y-2.5">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-center">
                                <div className="text-[10px] text-gray-400 uppercase">ARR Expansion</div>
                                <div className="text-sm font-bold text-[#ED4D19] font-mono">+38% YoY</div>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-gray-100 text-center">
                                <div className="text-[10px] text-gray-400 uppercase">Target Margin</div>
                                <div className="text-sm font-bold text-gray-800 font-mono">82%</div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 text-[11px]">
                              <span className="text-gray-500">Payback Period</span>
                              <span className="font-semibold text-[#0D212C]">6 Months</span>
                            </div>
                          </div>
                        )}

                        {/* Visual for Slide 3 (Technical Architecture) */}
                        {slide.slideNumber === 3 && (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 text-[11px]">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-[#36c0c9]" />
                                <span className="font-medium text-gray-700">FHIR Bridge SLA</span>
                              </div>
                              <span className="font-semibold text-emerald-600 font-mono">99.99%</span>
                            </div>
                            <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 text-[11px]">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-[#ED4D19]" />
                                <span className="font-medium text-gray-700">Deployment Velocity</span>
                              </div>
                              <span className="font-semibold text-[#0D212C] font-mono">14 Days</span>
                            </div>
                          </div>
                        )}

                        {/* Visual for Slide 4+ */}
                        {slide.slideNumber > 3 && (
                          <div className="p-3 bg-white rounded-lg border border-gray-100 text-center space-y-1">
                            <TrendingUp className="w-5 h-5 text-[#ED4D19] mx-auto" />
                            <div className="text-xs font-semibold text-gray-800">Integrated Ecosystem Synergy</div>
                            <div className="text-[11px] text-gray-400">Multi-solution catalog cross-sell ready</div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
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
