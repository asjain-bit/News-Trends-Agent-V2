import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  DollarSign, 
  FileText, 
  BarChart3,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  Check
} from 'lucide-react';

interface MonthWeek {
  id: string;
  label: string;
  shortLabel: string;
  monday: Date;
  sunday: Date;
  isCurrent?: boolean;
}

// All weeks for current month (October 2026, Monday to Sunday)
const OCTOBER_WEEKS: MonthWeek[] = [
  {
    id: 'w1',
    label: 'Sep 28 – Oct 4, 2026',
    shortLabel: 'Sep 28 – Oct 4',
    monday: new Date(2026, 8, 28),
    sunday: new Date(2026, 9, 4),
  },
  {
    id: 'w2',
    label: 'Oct 5 – Oct 11, 2026',
    shortLabel: 'Oct 5 – 11',
    monday: new Date(2026, 9, 5),
    sunday: new Date(2026, 9, 11),
  },
  {
    id: 'w3',
    label: 'Oct 12 – Oct 18, 2026',
    shortLabel: 'Oct 12 – 18',
    monday: new Date(2026, 9, 12),
    sunday: new Date(2026, 9, 18),
    isCurrent: true,
  },
  {
    id: 'w4',
    label: 'Oct 19 – Oct 25, 2026',
    shortLabel: 'Oct 19 – 25',
    monday: new Date(2026, 9, 19),
    sunday: new Date(2026, 9, 25),
  },
  {
    id: 'w5',
    label: 'Oct 26 – Nov 1, 2026',
    shortLabel: 'Oct 26 – Nov 1',
    monday: new Date(2026, 9, 26),
    sunday: new Date(2026, 10, 1),
  },
];

function formatWeekDisplay(monday: Date, sunday: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mMonth = months[monday.getMonth()];
  const sMonth = months[sunday.getMonth()];
  const mDay = monday.getDate();
  const sDay = sunday.getDate();
  const year = sunday.getFullYear();

  if (monday.getMonth() === sunday.getMonth() && monday.getFullYear() === sunday.getFullYear()) {
    return `${mMonth} ${mDay} – ${sDay}, ${year}`;
  }
  if (monday.getFullYear() === sunday.getFullYear()) {
    return `${mMonth} ${mDay} – ${sMonth} ${sDay}, ${year}`;
  }
  return `${mMonth} ${mDay}, ${monday.getFullYear()} – ${sMonth} ${sDay}, ${year}`;
}


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
    <div className="flex items-center gap-2 shrink-0">
      <div className="h-[36px] flex items-center bg-white border border-gray-200 rounded-lg px-2.5 shadow-2xs hover:border-gray-300 transition-colors">
        {prefix && (
          <span className="text-xs text-gray-400 font-normal mr-1 select-none">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={localStr}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="w-14 bg-transparent text-xs sm:text-[13px] font-semibold text-[#0D212C] text-right outline-none focus:outline-none focus:ring-0 mr-1.5 leading-none"
        />
        {/* Stepper Chevron Arrows: comfortable click target */}
        <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-1.5 text-gray-400 -space-y-0.5">
          <button
            type="button"
            onClick={increment}
            className="p-0.5 hover:text-gray-700 active:scale-95 transition-colors cursor-pointer bg-transparent border-0 leading-none"
            title="Increase"
          >
            <ChevronUp className="w-3 h-3 stroke-[2.2] fill-none" />
          </button>
          <button
            type="button"
            onClick={decrement}
            className="p-0.5 hover:text-gray-700 active:scale-95 transition-colors cursor-pointer bg-transparent border-0 leading-none"
            title="Decrease"
          >
            <ChevronDown className="w-3 h-3 stroke-[2.2] fill-none" />
          </button>
        </div>
      </div>
      <span className="text-xs text-gray-500 font-medium min-w-[36px] select-none">
        {unit}
      </span>
    </div>
  );
}

export default function UsageInsights() {
  // Week dropdown selection state (defaults to index 2: Oct 12 – 18, 2026 which is current week)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(2);
  const [weekDropdownOpen, setWeekDropdownOpen] = useState(false);
  const weekDropdownRef = useRef<HTMLDivElement>(null);

  const selectedWeek = OCTOBER_WEEKS[selectedWeekIndex];

  useEffect(() => {
    if (!weekDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (weekDropdownRef.current && !weekDropdownRef.current.contains(e.target as Node)) {
        setWeekDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [weekDropdownOpen]);

  const goToPrevWeek = () => {
    setSelectedWeekIndex(prev => Math.max(0, prev - 1));
  };

  const goToNextWeek = () => {
    setSelectedWeekIndex(prev => Math.min(OCTOBER_WEEKS.length - 1, prev + 1));
  };

  // Dynamic KPIs derived from selected week
  const weekSeed = useMemo(() => {
    return Math.abs((selectedWeek.monday.getDate() * 7 + selectedWeek.monday.getMonth() * 31) % 5);
  }, [selectedWeek]);

  const weekOutputsCount = useMemo(() => 18 + weekSeed, [weekSeed]);
  const weekTokensConsumed = useMemo(() => (16.2 + weekSeed * 0.8).toFixed(1), [weekSeed]);

  // Input assumptions state (Form inputs)
  const [formHours, setFormHours] = useState<number>(4);
  const [formCostPerHour, setFormCostPerHour] = useState<number>(30);
  const [formTokenPrice, setFormTokenPrice] = useState<number>(4.00);

  // Applied state: Right-side financial impact only recalculates when user clicks Recalculate
  const [appliedHours, setAppliedHours] = useState<number>(4);
  const [appliedCostPerHour, setAppliedCostPerHour] = useState<number>(30);
  const [appliedTokenPrice, setAppliedTokenPrice] = useState<number>(4.00);

  const hasPendingChanges = useMemo(() => {
    return (
      formHours !== appliedHours ||
      formCostPerHour !== appliedCostPerHour ||
      formTokenPrice !== appliedTokenPrice
    );
  }, [
    formHours, formCostPerHour, formTokenPrice,
    appliedHours, appliedCostPerHour, appliedTokenPrice
  ]);

  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);

  const handleRecalculate = () => {
    if (!hasPendingChanges || isRecalculating) return;
    setIsRecalculating(true);
    setTimeout(() => {
      setAppliedHours(formHours);
      setAppliedCostPerHour(formCostPerHour);
      setAppliedTokenPrice(formTokenPrice);
      setIsRecalculating(false);
    }, 800);
  };

  // Live Calculated metrics derived from APPLIED state and selected week outputs/tokens
  const totalManualHours = useMemo(() => {
    return Math.max(0, Math.round(weekOutputsCount * appliedHours));
  }, [weekOutputsCount, appliedHours]);

  const totalManualCost = useMemo(() => {
    return Math.max(0, Math.round(weekOutputsCount * appliedHours * appliedCostPerHour));
  }, [weekOutputsCount, appliedHours, appliedCostPerHour]);

  const totalAiCost = useMemo(() => {
    const tokensM = parseFloat(weekTokensConsumed) || 0;
    return Math.max(1, Math.round(tokensM * appliedTokenPrice));
  }, [weekTokensConsumed, appliedTokenPrice]);

  const weekAiCost = totalAiCost;

  const savedDollars = useMemo(() => {
    return Math.max(0, totalManualCost - totalAiCost);
  }, [totalManualCost, totalAiCost]);

  const roiMultiple = useMemo(() => {
    if (totalAiCost <= 0) return 100;
    return Math.max(1, Math.round(totalManualCost / totalAiCost));
  }, [totalManualCost, totalAiCost]);

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
      {/* 1. Overview Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-[#0D212C] font-['Poppins']">
            Overview
          </h2>

          {/* Week Selector: Arrow navigation + Dropdown + Info button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Previous Week Arrow */}
            <button
              type="button"
              disabled={selectedWeekIndex === 0}
              onClick={goToPrevWeek}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              title="Previous week"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Week Dropdown */}
            <div className="relative" ref={weekDropdownRef}>
              <button
                type="button"
                onClick={() => setWeekDropdownOpen((o) => !o)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#ED4D19] shrink-0" />
                <span className="font-medium text-[#0D212C]">
                  {selectedWeek.label}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${weekDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {weekDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-gray-200/90 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                  <div className="px-3.5 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <span>October 2026</span>
                    <span className="text-[10px] text-gray-400 font-normal lowercase">5 weeks</span>
                  </div>
                  <div className="py-1">
                    {OCTOBER_WEEKS.map((w, idx) => {
                      const isSelected = idx === selectedWeekIndex;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            setSelectedWeekIndex(idx);
                            setWeekDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-orange-50/80 text-[#ED4D19] font-medium'
                              : 'text-gray-700 hover:bg-gray-50 font-normal'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{w.label}</span>
                            {w.isCurrent && (
                              <span className="text-[10px] font-medium bg-orange-100 text-[#ED4D19] px-1.5 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[#ED4D19] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Next Week Arrow */}
            <button
              type="button"
              disabled={selectedWeekIndex === OCTOBER_WEEKS.length - 1}
              onClick={goToNextWeek}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              title="Next week"
              aria-label="Next week"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Info Button with Tooltip */}
            <div className="relative group flex items-center">
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Week selection info"
                aria-label="Week selection info"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              {/* Tooltip on hover */}
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex z-50 whitespace-nowrap bg-[#0D212C] text-white text-[11px] font-normal px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none items-center gap-1.5 animate-in fade-in duration-150">
                <span>Week selection is valid for current month only</span>
              </div>
            </div>
          </div>
        </div>

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
                <span>{weekOutputsCount}</span>
              </div>
              <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
                {Math.round(weekOutputsCount * 0.6)} reports (P1) · {Math.round(weekOutputsCount * 0.4)} Magic Mode runs (P2)
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
                <span>{weekTokensConsumed}M</span>
              </div>
              <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
                week of {formatWeekDisplay(selectedWeek.monday, selectedWeek.sunday)}
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
                <span>${weekAiCost.toLocaleString()}</span>
              </div>
              <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
                week of {formatWeekDisplay(selectedWeek.monday, selectedWeek.sunday)} · @ ${appliedTokenPrice % 1 === 0 ? appliedTokenPrice : appliedTokenPrice.toFixed(2)} / 1M tokens
              </p>
            </div>
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
          <div className="w-full bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <div className="divide-y divide-gray-100 flex-1 flex flex-col justify-between py-1">
              {/* Row 1: Hours spent on manual research */}
              <div className="py-3 flex items-center justify-between gap-3 first:pt-0">
                <div className="text-xs sm:text-[13px] text-gray-700 leading-tight">
                  <span className="font-medium">Hours spent on manual research</span>
                  <span className="block text-[11px] text-gray-400 font-normal mt-0.5">(per report)</span>
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
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="text-xs sm:text-[13px] font-medium text-gray-700 leading-tight">
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
              <div className="py-3 flex items-center justify-between gap-3 last:pb-0">
                <div className="text-xs sm:text-[13px] text-gray-700 leading-tight">
                  <span className="font-medium">Token price</span> <span className="text-[11px] text-gray-400 font-normal">(per 1M tokens)</span>
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
            </div>

            {/* Recalculate CTA Button: disabled until edited, with reduced opacity */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-1">
              <span className="text-[11px] text-gray-400 font-normal">
                {hasPendingChanges ? 'Unapplied changes' : 'AI cost excludes web search'}
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
          <div className="w-full bg-white rounded-2xl border border-gray-200/90 shadow-xs p-3.5 sm:p-4.5 grid grid-rows-2 divide-y divide-gray-100 transition-all duration-300 relative">
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
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <span>Manual cost</span>
                    <div className="relative group/tip inline-flex items-center">
                      <button type="button" className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" aria-label="Manual cost info">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tip:block z-50 px-3 py-1.5 bg-[#0D212C] text-white text-[11px] font-normal rounded-lg shadow-xl pointer-events-none w-max max-w-xs text-left animate-in fade-in duration-150">
                        <div>Manual cost is the multiply of manual hours into cost per hour.</div>
                        <div className="mt-0.5">Outputs × Manual hours × Cost per hour</div>
                        <div className="absolute top-full left-2 border-4 border-transparent border-t-[#0D212C]" />
                      </div>
                    </div>
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
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <span>AI cost</span>
                    <div className="relative group/tip inline-flex items-center">
                      <button type="button" className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" aria-label="AI cost info">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 hidden group-hover/tip:block z-50 px-3 py-1.5 bg-[#0D212C] text-white text-[11px] font-normal rounded-lg shadow-xl pointer-events-none w-max max-w-xs text-left animate-in fade-in duration-150">
                        <div>AI cost is the multiply of tokens consumed into token price per 1M tokens.</div>
                        <div className="mt-0.5">Tokens consumed × Token price per 1M</div>
                        <div className="absolute top-full left-2 sm:left-auto sm:right-2 border-4 border-transparent border-t-[#0D212C]" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-[#ED4D19] font-['Poppins']">
                    ${totalAiCost.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-gray-500 pt-0.5">
                    Total tokens {weekTokensConsumed}M | Token price ${appliedTokenPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Estimated ROI vs Estimated savings separated by vertical line (Exact 50% height) */}
            <div className="flex flex-col justify-center pt-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                {/* Estimated ROI */}
                <div className="sm:pr-5 space-y-0.5 pb-2 sm:pb-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <span>Estimated ROI</span>
                    <div className="relative group/tip inline-flex items-center">
                      <button type="button" className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" aria-label="Estimated ROI info">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tip:block z-50 px-3 py-1.5 bg-[#0D212C] text-white text-[11px] font-normal rounded-lg shadow-xl pointer-events-none w-max max-w-xs text-left animate-in fade-in duration-150">
                        <div>Estimated ROI is calculated by dividing manual cost by AI cost.</div>
                        <div className="mt-0.5">Manual cost ÷ AI cost</div>
                        <div className="absolute top-full left-2 border-4 border-transparent border-t-[#0D212C]" />
                      </div>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-[#00C3CB] font-['Poppins']">
                    {roiMultiple}x
                  </div>
                </div>

                {/* Estimated savings */}
                <div className="sm:pl-5 space-y-0.5 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                    <span>Estimated savings</span>
                    <div className="relative group/tip inline-flex items-center">
                      <button type="button" className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" aria-label="Estimated savings info">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 hidden group-hover/tip:block z-50 px-3 py-1.5 bg-[#0D212C] text-white text-[11px] font-normal rounded-lg shadow-xl pointer-events-none w-max max-w-xs text-left animate-in fade-in duration-150">
                        <div>Estimated savings is calculated by subtracting AI cost from manual cost.</div>
                        <div className="mt-0.5">Manual cost − AI cost</div>
                        <div className="absolute top-full left-2 sm:left-auto sm:right-2 border-4 border-transparent border-t-[#0D212C]" />
                      </div>
                    </div>
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
