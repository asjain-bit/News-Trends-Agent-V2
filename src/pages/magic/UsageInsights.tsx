import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  FileText, 
  BarChart3
} from 'lucide-react';

export default function UsageInsights() {
  // Input assumptions state
  const [hoursManual, setHoursManual] = useState<number>(4);
  const [costPerHour, setCostPerHour] = useState<number>(30);
  const [tokenPrice, setTokenPrice] = useState<number>(4.00);
  const [avgTokens, setAvgTokens] = useState<number>(25000);
  const [reportsPerWeek, setReportsPerWeek] = useState<number>(10);

  // Live Calculated metrics
  const totalManualHours = useMemo(() => {
    return Math.max(0, Math.round(reportsPerWeek * hoursManual));
  }, [reportsPerWeek, hoursManual]);

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

  // Breakdown data matching Image 1
  const domainData = [
    { label: 'AI in Healthcare', value: 8 },
    { label: 'RPM', value: 5 },
    { label: 'InsurTech', value: 4 },
    { label: 'EHR / Interop', value: 3 },
    { label: 'Genomics', value: 2 },
  ];

  const countryData = [
    { label: 'UAE', value: 7 },
    { label: 'Saudi Arabia', value: 5 },
    { label: 'Estonia', value: 3 },
    { label: 'United States', value: 3 },
    { label: 'Jordan', value: 2 },
  ];

  const solutionData = [
    { label: 'InsurTech', value: 6 },
    { label: 'RPM', value: 5 },
    { label: 'Hospital Ops', value: 4 },
    { label: 'EMR', value: 3 },
    { label: 'Pop Health', value: 2 },
  ];

  return (
    <div className="w-full px-5 py-6 md:py-8 space-y-6">
      {/* SECTION 1: Consumption (Image 2) */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-normal text-[#0D212C] font-['Poppins']">
          Consumption
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Outputs generated */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ED4D19] flex items-center justify-center mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#0D212C] font-['Poppins'] leading-tight">
                20
              </div>
              <div className="text-xs sm:text-[0.8125rem] font-medium text-gray-700 mt-1">
                Outputs generated
              </div>
              <div className="text-[0.6875rem] text-gray-400 font-normal mt-0.5">
                12 reports (P1) · 8 Magic Mode runs (P2)
              </div>
            </div>
          </div>

          {/* Card 2: Tokens consumed */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ED4D19] flex items-center justify-center mb-3">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#0D212C] font-['Poppins'] leading-tight flex items-baseline">
                <span>18.6</span>
                <span className="text-sm font-normal text-gray-400 ml-0.5">M</span>
              </div>
              <div className="text-xs sm:text-[0.8125rem] font-medium text-gray-700 mt-1">
                Tokens consumed
              </div>
              <div className="text-[0.6875rem] text-gray-400 font-normal mt-0.5">
                this week · auto-counted
              </div>
            </div>
          </div>

          {/* Card 3: Estimated AI cost */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-gray-300 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ED4D19] flex items-center justify-center mb-3">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-[#0D212C] font-['Poppins'] leading-tight">
                $74
              </div>
              <div className="text-xs sm:text-[0.8125rem] font-medium text-gray-700 mt-1">
                Estimated AI cost
              </div>
              <div className="text-[0.6875rem] text-gray-400 font-normal mt-0.5">
                this week · @ $4 / 1M tokens
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Value/ROI (Image 3) */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-normal text-[#0D212C] font-['Poppins']">
          Value/ROI
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left Column: Assumptions Table Card (5 cols on lg) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="divide-y divide-gray-100">
              {/* Row 1: Hours spent on manual research */}
              <div className="py-2.5 flex items-center justify-between gap-3 first:pt-0">
                <div className="text-xs text-gray-700 leading-snug">
                  <span>Hours spent on manual research</span>
                  <span className="block text-[0.6875rem] text-gray-400 font-normal">(per report)</span>
                </div>
                <div className="flex items-center bg-gray-50/80 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#ED4D19] focus-within:bg-white transition-all shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={hoursManual}
                    onChange={(e) => setHoursManual(Number(e.target.value) || 0)}
                    className="w-16 bg-transparent px-2.5 py-1 text-xs font-semibold text-[#0D212C] text-right outline-none"
                  />
                  <span className="px-2 py-1 text-[11px] text-gray-400 font-normal select-none bg-gray-100/70 border-l border-gray-200">
                    hours
                  </span>
                </div>
              </div>

              {/* Row 2: Cost per hour */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="text-xs text-gray-700 leading-snug">
                  Cost per hour
                </div>
                <div className="flex items-center bg-gray-50/80 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#ED4D19] focus-within:bg-white transition-all shrink-0">
                  <span className="pl-2 text-[11px] text-gray-400 font-normal select-none">$</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={costPerHour}
                    onChange={(e) => setCostPerHour(Number(e.target.value) || 0)}
                    className="w-16 bg-transparent px-2 py-1 text-xs font-semibold text-[#0D212C] text-right outline-none"
                  />
                  <span className="px-2 py-1 text-[11px] text-gray-400 font-normal select-none bg-gray-100/70 border-l border-gray-200">
                    USD
                  </span>
                </div>
              </div>

              {/* Row 3: Token price */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="text-xs text-gray-700 leading-snug">
                  Token price <span className="text-[0.6875rem] text-gray-400 font-normal">(per 1M tokens)</span>
                </div>
                <div className="flex items-center bg-gray-50/80 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#ED4D19] focus-within:bg-white transition-all shrink-0">
                  <span className="pl-2 text-[11px] text-gray-400 font-normal select-none">$</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max="100"
                    value={tokenPrice}
                    onChange={(e) => setTokenPrice(Number(e.target.value) || 0)}
                    className="w-16 bg-transparent px-2 py-1 text-xs font-semibold text-[#0D212C] text-right outline-none"
                  />
                  <span className="px-2 py-1 text-[11px] text-gray-400 font-normal select-none bg-gray-100/70 border-l border-gray-200">
                    USD
                  </span>
                </div>
              </div>

              {/* Row 4: Average tokens per report */}
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="text-xs text-gray-700 leading-snug">
                  Average tokens per report
                </div>
                <div className="flex items-center bg-gray-50/80 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#ED4D19] focus-within:bg-white transition-all shrink-0">
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    max="1000000"
                    value={avgTokens}
                    onChange={(e) => setAvgTokens(Number(e.target.value) || 0)}
                    className="w-20 bg-transparent px-2.5 py-1 text-xs font-semibold text-[#0D212C] text-right outline-none"
                  />
                  <span className="px-2 py-1 text-[11px] text-gray-400 font-normal select-none bg-gray-100/70 border-l border-gray-200">
                    tokens
                  </span>
                </div>
              </div>

              {/* Row 5: Number of reports (per week) */}
              <div className="py-2.5 flex items-center justify-between gap-3 last:pb-0">
                <div className="text-xs text-gray-700 leading-snug">
                  Number of reports <span className="text-[0.6875rem] text-gray-400 font-normal">(per week)</span>
                </div>
                <div className="flex items-center bg-gray-50/80 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#ED4D19] focus-within:bg-white transition-all shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={reportsPerWeek}
                    onChange={(e) => setReportsPerWeek(Number(e.target.value) || 0)}
                    className="w-16 bg-transparent px-2.5 py-1 text-xs font-semibold text-[#0D212C] text-right outline-none"
                  />
                  <span className="px-2 py-1 text-[11px] text-gray-400 font-normal select-none bg-gray-100/70 border-l border-gray-200">
                    reports
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Comparison & ROI Cards (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-4">
            {/* Top row: 2 cards (Manual cost & AI cost) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Manual cost */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs space-y-3.5">
                <div className="text-xs font-medium text-gray-600">
                  Manual cost
                </div>
                <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] font-['Poppins']">
                  ${totalManualCost.toLocaleString()}
                </div>
                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Total hours</span>
                    <span className="font-medium text-gray-800">{totalManualHours} hours</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Cost per hour</span>
                    <span className="font-medium text-gray-800">${costPerHour}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: AI cost */}
              <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs space-y-3.5">
                <div className="text-xs font-medium text-gray-600">
                  AI cost
                </div>
                <div className="text-2xl sm:text-3xl font-semibold text-[#ED4D19] font-['Poppins']">
                  ${totalAiCost.toLocaleString()}
                </div>
                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Total tokens</span>
                    <span className="font-medium text-gray-800">{(reportsPerWeek * avgTokens).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span>Token price (per 1M)</span>
                    <span className="font-medium text-gray-800">${tokenPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row: Estimated ROI & Estimated savings (Image 3) */}
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:divide-x sm:divide-gray-100">
                {/* Left: Estimated ROI */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-gray-600">
                    Estimated ROI
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold text-emerald-600 font-['Poppins']">
                    {roiMultiple}x
                  </div>
                </div>

                {/* Right: Estimated savings */}
                <div className="space-y-1.5 sm:pl-6">
                  <div className="text-xs font-medium text-gray-600">
                    Estimated savings
                  </div>
                  <div className="text-2xl sm:text-3xl font-semibold text-emerald-600 font-['Poppins'] flex items-baseline">
                    <span>${savedDollars.toLocaleString()}</span>
                    <span className="text-xs font-normal text-gray-400 ml-2">this week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Top Topics Countries & Solutions Requested (Image 1) */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-normal text-[#0D212C] font-['Poppins']">
          Top Topics Countries & Solutions Requested
        </h2>

        {/* Single unified card with 3 columns divided by vertical borders */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Column 1: Top report domains */}
            <div className="space-y-1 md:pr-6 pb-6 md:pb-0">
              <h3 className="text-xs sm:text-sm font-semibold text-[#0D212C] font-['Poppins'] pb-2">
                Top report domains
              </h3>
              <div className="divide-y divide-gray-100">
                {domainData.map((item) => (
                  <div key={item.label} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-gray-700 font-normal">{item.label}</span>
                    <span className="font-semibold text-[#ED4D19] border-b-2 border-[#ED4D19]/60 pb-0.5 select-none">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Top countries */}
            <div className="space-y-1 md:px-6 py-6 md:py-0">
              <h3 className="text-xs sm:text-sm font-semibold text-[#0D212C] font-['Poppins'] pb-2">
                Top countries
              </h3>
              <div className="divide-y divide-gray-100">
                {countryData.map((item) => (
                  <div key={item.label} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-gray-700 font-normal">{item.label}</span>
                    <span className="font-semibold text-[#ED4D19] border-b-2 border-[#ED4D19]/60 pb-0.5 select-none">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Top solutions (Magic Mode) */}
            <div className="space-y-1 md:pl-6 pt-6 md:pt-0">
              <h3 className="text-xs sm:text-sm font-semibold text-[#0D212C] font-['Poppins'] pb-2">
                Top solutions (Magic Mode)
              </h3>
              <div className="divide-y divide-gray-100">
                {solutionData.map((item) => (
                  <div key={item.label} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="text-gray-700 font-normal">{item.label}</span>
                    <span className="font-semibold text-[#ED4D19] border-b-2 border-[#ED4D19]/60 pb-0.5 select-none">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
