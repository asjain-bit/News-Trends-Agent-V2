import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  FileText, 
  BarChart3,
  ChevronUp,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

interface NumericStepperInputProps {
  value: number;
  onChange: (val: number) => void;
  unit: string;
  prefix?: string;
  step?: number;
  min?: number;
  max?: number;
}

function NumericStepperInput({
  value,
  onChange,
  unit,
  prefix,
  step = 1,
  min = 0,
  max = 9999999,
}: NumericStepperInputProps) {
  // Local string to allow direct typing freely
  const [localStr, setLocalStr] = useState<string>(String(value));

  // Sync if value changes externally
  React.useEffect(() => {
    setLocalStr(String(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only numbers and a single decimal point
    const filtered = raw.replace(/[^0-9.]/g, '');
    setLocalStr(filtered);
    const num = parseFloat(filtered);
    if (!isNaN(num)) {
      onChange(Math.max(min, Math.min(max, num)));
    } else if (filtered === '') {
      onChange(0);
    }
  };

  const handleBlur = () => {
    const num = parseFloat(localStr);
    if (isNaN(num)) {
      setLocalStr(String(min));
      onChange(min);
    } else {
      const clamped = Math.max(min, Math.min(max, num));
      setLocalStr(String(clamped));
      onChange(clamped);
    }
  };

  const increment = () => {
    const next = Math.min(max, (value || 0) + step);
    const rounded = Math.round(next * 100) / 100;
    setLocalStr(String(rounded));
    onChange(rounded);
  };

  const decrement = () => {
    const next = Math.max(min, (value || 0) - step);
    const rounded = Math.round(next * 100) / 100;
    setLocalStr(String(rounded));
    onChange(rounded);
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="h-[26px] flex items-center bg-white border border-gray-200 rounded-lg px-2">
        {prefix && (
          <span className="text-[11px] text-gray-400 font-normal mr-1 select-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={localStr}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-12 bg-transparent text-[11px] font-semibold text-[#0D212C] text-right outline-none focus:outline-none focus:ring-0 mr-1.5 leading-none"
        />
        {/* Stepper Chevron Arrows: compact, no fill, subtle gray */}
        <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-1 text-gray-400 -space-y-0.5">
          <button
            type="button"
            onClick={increment}
            className="p-0 hover:text-gray-700 active:scale-95 transition-colors cursor-pointer bg-transparent border-0 leading-none"
            title="Increase"
          >
            <ChevronUp className="w-2.5 h-2.5 stroke-[2.2] fill-none" />
          </button>
          <button
            type="button"
            onClick={decrement}
            className="p-0 hover:text-gray-700 active:scale-95 transition-colors cursor-pointer bg-transparent border-0 leading-none"
            title="Decrease"
          >
            <ChevronDown className="w-2.5 h-2.5 stroke-[2.2] fill-none" />
          </button>
        </div>
      </div>
      <span className="text-[11px] text-gray-400 font-normal min-w-[34px] select-none">
        {unit}
      </span>
    </div>
  );
}

export default function UsageInsights() {
  // Input assumptions state (Form inputs)
  const [formHours, setFormHours] = useState<number>(4);
  const [formCostPerHour, setFormCostPerHour] = useState<number>(30);
  const [formTokenPrice, setFormTokenPrice] = useState<number>(4.00);
  const [formAvgTokens, setFormAvgTokens] = useState<number>(25000);
  const [formReportsPerWeek, setFormReportsPerWeek] = useState<number>(10);

  // Applied state: Right-side financial impact only recalculates when user clicks Recalculate
  const [appliedHours, setAppliedHours] = useState<number>(4);
  const [appliedCostPerHour, setAppliedCostPerHour] = useState<number>(30);
  const [appliedTokenPrice, setAppliedTokenPrice] = useState<number>(4.00);
  const [appliedAvgTokens, setAppliedAvgTokens] = useState<number>(25000);
  const [appliedReportsPerWeek, setAppliedReportsPerWeek] = useState<number>(10);

  const hasPendingChanges = useMemo(() => {
    return (
      formHours !== appliedHours ||
      formCostPerHour !== appliedCostPerHour ||
      formTokenPrice !== appliedTokenPrice ||
      formAvgTokens !== appliedAvgTokens ||
      formReportsPerWeek !== appliedReportsPerWeek
    );
  }, [
    formHours, formCostPerHour, formTokenPrice, formAvgTokens, formReportsPerWeek,
    appliedHours, appliedCostPerHour, appliedTokenPrice, appliedAvgTokens, appliedReportsPerWeek
  ]);

  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);

  const handleRecalculate = () => {
    if (!hasPendingChanges || isRecalculating) return;
    setIsRecalculating(true);
    setTimeout(() => {
      setAppliedHours(formHours);
      setAppliedCostPerHour(formCostPerHour);
      setAppliedTokenPrice(formTokenPrice);
      setAppliedAvgTokens(formAvgTokens);
      setAppliedReportsPerWeek(formReportsPerWeek);
      setIsRecalculating(false);
    }, 800);
  };

  // Live Calculated metrics derived from APPLIED state
  const totalManualHours = useMemo(() => {
    return Math.max(0, Math.round(appliedReportsPerWeek * appliedHours));
  }, [appliedReportsPerWeek, appliedHours]);

  const totalManualCost = useMemo(() => {
    return Math.max(0, Math.round(appliedReportsPerWeek * appliedHours * appliedCostPerHour));
  }, [appliedReportsPerWeek, appliedHours, appliedCostPerHour]);

  const totalAiCost = useMemo(() => {
    const rawCost = appliedReportsPerWeek * ((appliedAvgTokens / 1_000_000) * appliedTokenPrice + 0.90);
    return Math.max(1, Math.round(rawCost));
  }, [appliedReportsPerWeek, appliedAvgTokens, appliedTokenPrice]);

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
      {/* 1. Top KPI Cards (Matching Overview Page Card Design Exactly, Without Consumption Heading) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Outputs Generated */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
              OUTPUTS GENERATED
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ED4D19] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] flex items-baseline gap-1.5 font-['Poppins']">
              <span>20</span>
            </div>
            <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
              12 reports (P1) · 8 Magic Mode runs (P2)
            </p>
          </div>
        </div>

        {/* Card 2: Tokens Consumed */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
              TOKENS CONSUMED
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] flex items-baseline gap-1.5 font-['Poppins']">
              <span>18.6M</span>
            </div>
            <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
              this week · auto-counted
            </p>
          </div>
        </div>

        {/* Card 3: Estimated AI Cost */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
              ESTIMATED AI COST
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] flex items-baseline gap-1.5 font-['Poppins']">
              <span>$74</span>
            </div>
            <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
              this week · @ $4 / 1M tokens
            </p>
          </div>
        </div>
      </div>

      {/* 2. Value/ROI Section */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-semibold text-[#0D212C] font-['Poppins']">
          Value/ROI
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Left Column: Assumptions Table Card (50% width on lg) */}
          <div className="w-full bg-white rounded-2xl border border-gray-200/90 p-3.5 sm:p-4 shadow-xs flex flex-col justify-between space-y-2">
            <div className="divide-y divide-gray-100">
              {/* Row 1: Hours spent on manual research */}
              <div className="py-1 flex items-center justify-between gap-3 first:pt-0">
                <div className="text-[11px] sm:text-xs text-gray-700 leading-tight">
                  <span>Hours spent on manual research</span>
                  <span className="block text-[0.625rem] text-gray-400 font-normal">(per report)</span>
                </div>
                <NumericStepperInput
                  value={formHours}
                  onChange={setFormHours}
                  unit="hours"
                  min={1}
                  max={100}
                />
              </div>

              {/* Row 2: Cost per hour */}
              <div className="py-1 flex items-center justify-between gap-3">
                <div className="text-[11px] sm:text-xs text-gray-700 leading-tight">
                  Cost per hour
                </div>
                <NumericStepperInput
                  value={formCostPerHour}
                  onChange={setFormCostPerHour}
                  unit="USD"
                  prefix="$"
                  min={1}
                  max={1000}
                />
              </div>

              {/* Row 3: Token price */}
              <div className="py-1 flex items-center justify-between gap-3">
                <div className="text-[11px] sm:text-xs text-gray-700 leading-tight">
                  Token price <span className="text-[0.625rem] text-gray-400 font-normal">(per 1M tokens)</span>
                </div>
                <NumericStepperInput
                  value={formTokenPrice}
                  onChange={setFormTokenPrice}
                  unit="USD"
                  prefix="$"
                  step={0.5}
                  min={0.1}
                  max={100}
                />
              </div>

              {/* Row 4: Average tokens per report */}
              <div className="py-1 flex items-center justify-between gap-3">
                <div className="text-[11px] sm:text-xs text-gray-700 leading-tight">
                  Average tokens per report
                </div>
                <NumericStepperInput
                  value={formAvgTokens}
                  onChange={setFormAvgTokens}
                  unit="tokens"
                  step={1000}
                  min={1000}
                  max={1000000}
                />
              </div>

              {/* Row 5: Number of reports (per week) */}
              <div className="py-1 flex items-center justify-between gap-3 last:pb-0">
                <div className="text-[11px] sm:text-xs text-gray-700 leading-tight">
                  Number of reports <span className="text-[0.625rem] text-gray-400 font-normal">(per week)</span>
                </div>
                <NumericStepperInput
                  value={formReportsPerWeek}
                  onChange={setFormReportsPerWeek}
                  unit="reports"
                  min={1}
                  max={500}
                />
              </div>
            </div>

            {/* Recalculate CTA Button: disabled until edited, with reduced opacity */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-normal">
                {hasPendingChanges ? 'Unapplied changes' : 'Values up to date'}
              </span>
              <button
                type="button"
                onClick={handleRecalculate}
                disabled={!hasPendingChanges || isRecalculating}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-2xs transition-all ${
                  hasPendingChanges && !isRecalculating
                    ? 'bg-[#ED4D19] hover:bg-[#d84315] hover:shadow-sm cursor-pointer opacity-100 scale-100'
                    : 'bg-[#ED4D19] opacity-40 cursor-not-allowed pointer-events-none'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isRecalculating ? 'animate-spin' : ''}`} />
                <span>Recalculate</span>
              </button>
            </div>
          </div>

          {/* Right Column: Unified Financial Impact & ROI Section (50% width on lg) */}
          <div className="w-full bg-white rounded-2xl border border-gray-200/90 shadow-xs p-3.5 sm:p-4.5 grid grid-rows-2 divide-y divide-gray-100 transition-all duration-300 relative overflow-hidden">
            {/* Loading Animation & Text during Recalculate */}
            {isRecalculating && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center z-20 space-y-2.5 transition-all">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-[#ED4D19] rounded-full animate-spin" />
                <span className="text-xs font-medium text-gray-600 font-['Poppins']">
                  Recalculating value/roi...
                </span>
              </div>
            )}

            {/* Top Row: Manual cost vs AI cost separated by vertical line (Exact 50% height) */}
            <div className="flex flex-col justify-center pb-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {/* Manual cost */}
                <div className="sm:pr-5 space-y-0.5 pb-2 sm:pb-0">
                  <div className="text-xs font-semibold text-gray-700">
                    Manual cost
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-[#0D212C] font-['Poppins']">
                    ${totalManualCost.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-500 pt-0.5">
                    Total hours {totalManualHours} | Cost per hour ${appliedCostPerHour}
                  </div>
                </div>

                {/* AI cost */}
                <div className="sm:pl-5 space-y-0.5 pt-2 sm:pt-0">
                  <div className="text-xs font-semibold text-gray-700">
                    AI cost
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-[#ED4D19] font-['Poppins']">
                    ${totalAiCost.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-500 pt-0.5">
                    Total tokens {(appliedReportsPerWeek * appliedAvgTokens).toLocaleString()} | Token price ${appliedTokenPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Estimated ROI vs Estimated savings separated by vertical line (Exact 50% height) */}
            <div className="flex flex-col justify-center pt-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {/* Estimated ROI */}
                <div className="sm:pr-5 space-y-0.5 pb-2 sm:pb-0">
                  <div className="text-xs font-semibold text-gray-700">
                    Estimated ROI
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-[#00C3CB] font-['Poppins']">
                    {roiMultiple}x
                  </div>
                </div>

                {/* Estimated savings */}
                <div className="sm:pl-5 space-y-0.5 pt-2 sm:pt-0">
                  <div className="text-xs font-semibold text-gray-700">
                    Estimated savings
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-[#00C3CB] font-['Poppins'] flex items-baseline">
                    <span>${savedDollars.toLocaleString()}</span>
                    <span className="text-[11px] font-normal text-gray-400 ml-1.5">this week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Topics Countries & Solutions Requested (Without Underline on Numbers) */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-semibold text-[#0D212C] font-['Poppins']">
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
                    <span className="font-semibold text-[#ED4D19] select-none">
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
                    <span className="font-semibold text-[#ED4D19] select-none">
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
                    <span className="font-semibold text-[#ED4D19] select-none">
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
