import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  FileText, 
  ChevronDown, 
  Check, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  Globe,
  BarChart3,
  RefreshCw
} from 'lucide-react';

export default function UsageInsights() {
  // Input assumptions state
  const [hoursManual, setHoursManual] = useState<number>(4);
  const [costPerHour, setCostPerHour] = useState<number>(30);
  const [tokenPrice, setTokenPrice] = useState<number>(4.00);
  const [avgTokens, setAvgTokens] = useState<number>(25000);
  const [reportsPerWeek, setReportsPerWeek] = useState<number>(10);

  // Active filter state for breakdown cards
  const [domainFilter, setDomainFilter] = useState<'reports' | 'tokens'>('reports');
  const [countryFilter, setCountryFilter] = useState<'reports' | 'arr'>('reports');
  const [solutionFilter, setSolutionFilter] = useState<'reports' | 'decks'>('reports');

  // Dropdown open states
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);

  // Recalculate flash animation state
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
    }, 400);
  };

  // Live Calculated metrics
  const totalManualHours = useMemo(() => {
    return Math.max(0, Math.round(reportsPerWeek * hoursManual));
  }, [reportsPerWeek, hoursManual]);

  const totalAiHours = useMemo(() => {
    return Math.max(0.5, Math.round(reportsPerWeek * 0.2 * 10) / 10);
  }, [reportsPerWeek]);

  const totalManualCost = useMemo(() => {
    return Math.max(0, Math.round(reportsPerWeek * hoursManual * costPerHour));
  }, [reportsPerWeek, hoursManual, costPerHour]);

  const totalAiCost = useMemo(() => {
    const rawCost = reportsPerWeek * ((avgTokens / 1_000_000) * tokenPrice + 0.90);
    return Math.max(1, Math.round(rawCost));
  }, [reportsPerWeek, avgTokens, tokenPrice]);

  const savedDollars = useMemo(() => {
    return Math.max(0, totalManualCost - totalAiCost);
  }, [totalManualCost, totalAiCost]);

  const roiMultiple = useMemo(() => {
    if (totalAiCost <= 0) return 100;
    return Math.max(1, Math.round(savedDollars / totalAiCost));
  }, [savedDollars, totalAiCost]);

  // Breakdown data arrays
  const domainData = useMemo(() => {
    if (domainFilter === 'tokens') {
      return [
        { label: 'AI in Healthcare', value: '200K tokens', raw: 200, max: 200 },
        { label: 'RPM', value: '125K tokens', raw: 125, max: 200 },
        { label: 'InsurTech', value: '100K tokens', raw: 100, max: 200 },
        { label: 'EHR / Interop', value: '75K tokens', raw: 75, max: 200 },
        { label: 'Genomics', value: '50K tokens', raw: 50, max: 200 },
      ];
    }
    return [
      { label: 'AI in Healthcare', value: 8, raw: 8, max: 8 },
      { label: 'RPM', value: 5, raw: 5, max: 8 },
      { label: 'InsurTech', value: 4, raw: 4, max: 8 },
      { label: 'EHR / Interop', value: 3, raw: 3, max: 8 },
      { label: 'Genomics', value: 2, raw: 2, max: 8 },
    ];
  }, [domainFilter]);

  const countryData = useMemo(() => {
    if (countryFilter === 'arr') {
      return [
        { label: 'UAE', value: '$38.2M', raw: 38.2, max: 38.2 },
        { label: 'Saudi Arabia', value: '$28.4M', raw: 28.4, max: 38.2 },
        { label: 'Estonia', value: '$14.1M', raw: 14.1, max: 38.2 },
        { label: 'United States', value: '$12.5M', raw: 12.5, max: 38.2 },
        { label: 'Jordan', value: '$8.0M', raw: 8.0, max: 38.2 },
      ];
    }
    return [
      { label: 'UAE', value: 7, raw: 7, max: 7 },
      { label: 'Saudi Arabia', value: 5, raw: 5, max: 7 },
      { label: 'Estonia', value: 3, raw: 3, max: 7 },
      { label: 'United States', value: 3, raw: 3, max: 7 },
      { label: 'Jordan', value: 2, raw: 2, max: 7 },
    ];
  }, [countryFilter]);

  const solutionData = useMemo(() => {
    if (solutionFilter === 'decks') {
      return [
        { label: 'InsurTech', value: 12, raw: 12, max: 12 },
        { label: 'RPM', value: 10, raw: 10, max: 12 },
        { label: 'Hospital Ops', value: 8, raw: 8, max: 12 },
        { label: 'EMR', value: 6, raw: 6, max: 12 },
        { label: 'Pop Health', value: 4, raw: 4, max: 12 },
      ];
    }
    return [
      { label: 'InsurTech', value: 6, raw: 6, max: 6 },
      { label: 'RPM', value: 5, raw: 5, max: 6 },
      { label: 'Hospital Ops', value: 4, raw: 4, max: 6 },
      { label: 'EMR', value: 3, raw: 3, max: 6 },
      { label: 'Pop Health', value: 2, raw: 2, max: 6 },
    ];
  }, [solutionFilter]);

  return (
    <div className="w-full px-5 py-6 md:py-8 space-y-6">
      {/* Section 1: Value/ROI */}
      <div className="space-y-3">
        <h2 className="text-[1.125rem] sm:text-[1.25rem] font-medium text-[#0D212C] font-['Poppins']">
          Value/ROI
        </h2>

        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 md:p-6 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 items-end">
          {/* Field 1: Hours spent on manual research */}
          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-medium text-gray-600 leading-tight">
              Hours spent on manual research (per report)
            </label>
            <div className="relative flex items-center bg-gray-50/60 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#ED4D19] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#ED4D19]/20 transition-all">
              <input
                type="number"
                min="1"
                max="100"
                value={hoursManual}
                onChange={(e) => setHoursManual(Number(e.target.value) || 0)}
                className="w-full bg-transparent px-3 py-2 text-xs font-semibold text-[#0D212C] outline-none"
              />
              <span className="px-2.5 py-1 text-[11px] text-gray-400 font-medium select-none bg-gray-100/70 border-l border-gray-200">
                hours
              </span>
            </div>
          </div>

          {/* Field 2: Cost per hour */}
          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-medium text-gray-600 leading-tight">
              Cost per hour
            </label>
            <div className="relative flex items-center bg-gray-50/60 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#ED4D19] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#ED4D19]/20 transition-all">
              <span className="pl-3 text-xs text-gray-400 font-medium select-none">$</span>
              <input
                type="number"
                min="1"
                max="1000"
                value={costPerHour}
                onChange={(e) => setCostPerHour(Number(e.target.value) || 0)}
                className="w-full bg-transparent px-2 py-2 text-xs font-semibold text-[#0D212C] outline-none"
              />
              <span className="px-2.5 py-1 text-[11px] text-gray-400 font-medium select-none bg-gray-100/70 border-l border-gray-200">
                USD
              </span>
            </div>
          </div>

          {/* Field 3: Token price */}
          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-medium text-gray-600 leading-tight">
              Token price (per 1M tokens)
            </label>
            <div className="relative flex items-center bg-gray-50/60 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#ED4D19] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#ED4D19]/20 transition-all">
              <span className="pl-3 text-xs text-gray-400 font-medium select-none">$</span>
              <input
                type="number"
                step="0.5"
                min="0.1"
                max="100"
                value={tokenPrice}
                onChange={(e) => setTokenPrice(Number(e.target.value) || 0)}
                className="w-full bg-transparent px-2 py-2 text-xs font-semibold text-[#0D212C] outline-none"
              />
              <span className="px-2.5 py-1 text-[11px] text-gray-400 font-medium select-none bg-gray-100/70 border-l border-gray-200">
                USD
              </span>
            </div>
          </div>

          {/* Field 4: Average tokens per report */}
          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-medium text-gray-600 leading-tight">
              Average tokens per report
            </label>
            <div className="relative flex items-center bg-gray-50/60 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#ED4D19] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#ED4D19]/20 transition-all">
              <input
                type="number"
                step="1000"
                min="1000"
                max="1000000"
                value={avgTokens}
                onChange={(e) => setAvgTokens(Number(e.target.value) || 0)}
                className="w-full bg-transparent px-3 py-2 text-xs font-semibold text-[#0D212C] outline-none"
              />
              <span className="px-2.5 py-1 text-[11px] text-gray-400 font-medium select-none bg-gray-100/70 border-l border-gray-200">
                tokens
              </span>
            </div>
          </div>

          {/* Field 5: Number of reports (per week) */}
          <div className="space-y-1.5">
            <label className="block text-[0.6875rem] font-medium text-gray-600 leading-tight">
              Number of reports (per week)
            </label>
            <div className="relative flex items-center bg-gray-50/60 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#ED4D19] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#ED4D19]/20 transition-all">
              <input
                type="number"
                min="1"
                max="500"
                value={reportsPerWeek}
                onChange={(e) => setReportsPerWeek(Number(e.target.value) || 0)}
                className="w-full bg-transparent px-3 py-2 text-xs font-semibold text-[#0D212C] outline-none"
              />
              <span className="px-2.5 py-1 text-[11px] text-gray-400 font-medium select-none bg-gray-100/70 border-l border-gray-200">
                reports
              </span>
            </div>
          </div>

          {/* Field 6: Recalculate CTA Button */}
          <div className="pt-2 sm:pt-0">
            <button
              type="button"
              onClick={handleRecalculate}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 text-white cursor-pointer select-none ${
                isRecalculating ? 'scale-95 opacity-90' : 'hover:shadow-md'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span>Recalculate</span>
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* CARD 2: AI vs. Manual Comparison */}
      <div className="space-y-3">
        <h2 className="text-[1.125rem] sm:text-[1.25rem] font-medium text-[#0D212C] font-['Poppins']">
          AI vs. Manual Comparison
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Time to complete reports */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between pb-3">
              <span className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                Time to complete reports
              </span>
              <div className="w-6 h-6 rounded-lg bg-orange-50 text-[#ED4D19] flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 items-end">
              <div>
                <div className="text-2xl font-bold text-[#0D212C] font-['Poppins']">
                  {totalManualHours} <span className="text-sm font-normal text-gray-500">hours</span>
                </div>
                <div className="text-xs text-gray-400 font-normal mt-0.5">Manual research</div>
              </div>

              <div className="border-l border-gray-100 pl-3">
                <div className="text-2xl font-bold text-[#ED4D19] font-['Poppins']">
                  {totalAiHours} <span className="text-sm font-normal text-gray-500">hours</span>
                </div>
                <div className="text-xs text-[#ED4D19] font-medium mt-0.5">Using AI</div>
              </div>
            </div>
          </div>

          {/* Card 2: Cost to complete reports */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between pb-3">
              <span className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                Cost to complete reports
              </span>
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 items-end">
              <div>
                <div className="text-2xl font-bold text-[#0D212C] font-['Poppins']">
                  ${totalManualCost.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400 font-normal mt-0.5">Manual research</div>
              </div>

              <div className="border-l border-gray-100 pl-3">
                <div className="text-2xl font-bold text-emerald-600 font-['Poppins']">
                  ${totalAiCost.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-600 font-medium mt-0.5">Using AI</div>
              </div>
            </div>
          </div>

          {/* Card 3: Estimated ROI */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between pb-3">
              <span className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                Estimated ROI
              </span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="text-3xl font-extrabold text-emerald-600 font-['Poppins'] leading-tight">
                {roiMultiple}x
              </div>
              <div className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
                ${savedDollars.toLocaleString()} saved this week
              </div>
            </div>
          </div>

          {/* Card 4: Reports generated */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between pb-3">
              <span className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                Reports generated
              </span>
              <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="text-3xl font-extrabold text-[#0D212C] font-['Poppins'] leading-tight">
                {reportsPerWeek}
              </div>
              <div className="text-xs text-gray-400 font-normal">Reports this week</div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: Top Topics Countries & Solutions Requested */}
      <div className="space-y-3">
        <h2 className="text-[1.125rem] sm:text-[1.25rem] font-medium text-[#0D212C] font-['Poppins']">
          Top Topics Countries & Solutions Requested
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Breakdown 1: Top report domains */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-[#0D212C] font-['Poppins']">
                Top report domains
              </h3>

              {/* Custom Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDomainOpen(!isDomainOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-normal text-gray-700 transition-colors cursor-pointer select-none"
                >
                  <span>{domainFilter === 'reports' ? 'By number of reports' : 'By token consumption'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {isDomainOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setDomainFilter('reports');
                        setIsDomainOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between text-gray-700 font-normal"
                    >
                      <span>By number of reports</span>
                      {domainFilter === 'reports' && <Check className="w-3 h-3 text-[#ED4D19]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDomainFilter('tokens');
                        setIsDomainOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between text-gray-700 font-normal"
                    >
                      <span>By token consumption</span>
                      {domainFilter === 'tokens' && <Check className="w-3 h-3 text-[#ED4D19]" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 pt-1">
              {domainData.map((item) => {
                const percent = Math.min(100, Math.round((item.raw / item.max) * 100));
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-normal text-gray-700">{item.label}</span>
                      <span className="font-semibold text-[#0D212C] text-[11px]">{item.value}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown 2: Top countries */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-[#0D212C] font-['Poppins']">
                Top countries
              </h3>

              {/* Custom Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCountryOpen(!isCountryOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-normal text-gray-700 transition-colors cursor-pointer select-none"
                >
                  <span>{countryFilter === 'reports' ? 'By number of reports' : 'By addressable ARR'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {isCountryOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCountryFilter('reports');
                        setIsCountryOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between text-gray-700 font-normal"
                    >
                      <span>By number of reports</span>
                      {countryFilter === 'reports' && <Check className="w-3 h-3 text-[#ED4D19]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCountryFilter('arr');
                        setIsCountryOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between text-gray-700 font-normal"
                    >
                      <span>By addressable ARR</span>
                      {countryFilter === 'arr' && <Check className="w-3 h-3 text-[#ED4D19]" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 pt-1">
              {countryData.map((item) => {
                const percent = Math.min(100, Math.round((item.raw / item.max) * 100));
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-normal text-gray-700">{item.label}</span>
                      <span className="font-semibold text-[#0D212C] text-[11px]">{item.value}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown 3: Top solutions (Magic Mode) */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-[#0D212C] font-['Poppins']">
                Top solutions (Magic Mode)
              </h3>

              {/* Custom Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsSolutionOpen(!isSolutionOpen)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-normal text-gray-700 transition-colors cursor-pointer select-none"
                >
                  <span>{solutionFilter === 'reports' ? 'By number of reports' : 'By generated decks'}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {isSolutionOpen && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSolutionFilter('reports');
                        setIsSolutionOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between text-gray-700 font-normal"
                    >
                      <span>By number of reports</span>
                      {solutionFilter === 'reports' && <Check className="w-3 h-3 text-[#ED4D19]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSolutionFilter('decks');
                        setIsSolutionOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between text-gray-700 font-normal"
                    >
                      <span>By generated decks</span>
                      {solutionFilter === 'decks' && <Check className="w-3 h-3 text-[#ED4D19]" />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3 pt-1">
              {solutionData.map((item) => {
                const percent = Math.min(100, Math.round((item.raw / item.max) * 100));
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-normal text-gray-700">{item.label}</span>
                      <span className="font-semibold text-[#0D212C] text-[11px]">{item.value}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
