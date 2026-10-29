import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  DollarSign, 
  FileText, 
  BarChart3,
  Search,
  LineChart,
  Menu,
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

interface FeatureUsageItem {
  feature: string;
  tip: string;
  aiRuns: number;
  tokens: string;
  webSearches: number;
  aiCost: number;
  shareOfCost: number;
}

const FEATURE_USAGE_DATA: FeatureUsageItem[] = [
  {
    feature: 'Part A reports',
    tip: 'Health-Tech landscape reports.',
    aiRuns: 14,
    tokens: '15.4M',
    webSearches: 760,
    aiCost: 52.40,
    shareOfCost: 65,
  },
  {
    feature: 'Magic Mode scoring',
    tip: 'Country research, solution scoring, catalogue and roadmap AI, and GTM decks. The quarterly refresh counts as one run.',
    aiRuns: 9,
    tokens: '4.1M',
    webSearches: 190,
    aiCost: 11.30,
    shareOfCost: 14,
  },
];

const getShareOfCostColor = (pct: number): string => {
  if (pct >= 70) return 'text-emerald-600';
  if (pct >= 40) return 'text-amber-600';
  return 'text-red-600';
};

interface InfoTooltipProps {
  text: string;
  align?: 'left' | 'center' | 'right';
  placement?: 'top' | 'bottom';
  // When children are given, hovering them opens the tooltip and no info icon is shown
  children?: React.ReactNode;
}

function InfoTooltip({ text, align = 'center', placement = 'top', children }: InfoTooltipProps) {
  const alignClass = align === 'left' ? 'left-0' : align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2';
  const caretAlignClass = align === 'left' ? 'left-2' : align === 'right' ? 'right-2' : 'left-1/2 -translate-x-1/2';

  return (
    <span
      className={`relative group/it inline-flex items-center align-middle outline-none ${children ? 'cursor-help' : ''}`}
      tabIndex={children ? 0 : undefined}
    >
      {children ?? (
        <button
          type="button"
          className="p-0.5 text-gray-400 hover:text-gray-600 focus:text-gray-600 transition-colors cursor-help outline-none"
          aria-label={text}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      )}
      <span
        role="tooltip"
        className={`absolute ${placement === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'} ${alignClass} hidden group-hover/it:block group-focus-within/it:block z-50 px-3 py-1.5 bg-[#0D212C] text-white text-[11px] font-normal leading-snug normal-case tracking-normal rounded-lg shadow-xl pointer-events-none w-max max-w-[260px] whitespace-pre-line text-left`}
      >
        {text}
        <span
          className={`absolute ${placement === 'bottom' ? 'bottom-full border-b-[#0D212C]' : 'top-full border-t-[#0D212C]'} ${caretAlignClass} border-4 border-transparent`}
        />
      </span>
    </span>
  );
}

interface NumericStepperInputProps {
  value: number;
  onChange: (val: number) => void;
  unit: string;
  prefix?: string;
  step?: number;
  min?: number;
  max?: number;
  precision?: number;
}

function NumericStepperInput({
  value,
  onChange,
  unit,
  prefix,
  step = 1,
  min = 0,
  max = 9999999,
  precision,
}: NumericStepperInputProps) {
  // Local string to allow direct typing freely
  const [localStr, setLocalStr] = useState<string>(String(value));

  // Sync if value changes externally
  React.useEffect(() => {
    setLocalStr(String(value));
  }, [value]);

  const getDecimals = (s: number) => {
    if (precision !== undefined) return precision;
    if (s < 0.001) return 4;
    if (s < 0.01) return 3;
    if (s < 0.1) return 2;
    if (s < 1) return 1;
    return 0;
  };

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
      const dec = getDecimals(step);
      const rounded = parseFloat(clamped.toFixed(dec));
      setLocalStr(String(rounded));
      onChange(rounded);
    }
  };

  const increment = () => {
    const next = Math.min(max, (value || 0) + step);
    const dec = getDecimals(step);
    const rounded = parseFloat(next.toFixed(dec));
    setLocalStr(String(rounded));
    onChange(rounded);
  };

  const decrement = () => {
    const next = Math.max(min, (value || 0) - step);
    const dec = getDecimals(step);
    const rounded = parseFloat(next.toFixed(dec));
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
          className="w-16 bg-transparent text-xs sm:text-[13px] font-semibold text-[#0D212C] text-right outline-none focus:outline-none focus:ring-0 mr-1.5 leading-none"
        />
        {/* Stepper Chevron Arrows */}
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

  // Selected week baseline data
  const isDefaultWeek = selectedWeekIndex === 2;
  const weekOutputsCount = isDefaultWeek ? 20 : Math.max(14, 20 + (weekSeed - 2) * 2);
  const weekReportsCount = isDefaultWeek ? 14 : Math.round(weekOutputsCount * 0.7);
  const weekDecksCount = weekOutputsCount - weekReportsCount;

  const weekInputTokens = isDefaultWeek ? 16.0 : parseFloat((16.0 + (weekSeed - 2) * 1.2).toFixed(1));
  const weekOutputTokens = isDefaultWeek ? 4.0 : parseFloat((4.0 + (weekSeed - 2) * 0.3).toFixed(1));
  const weekEmbeddingTokens = isDefaultWeek ? 5.0 : parseFloat((5.0 + (weekSeed - 2) * 0.4).toFixed(1));
  const weekTokensConsumed = (weekInputTokens + weekOutputTokens + weekEmbeddingTokens).toFixed(1);
  const weekSearchCredits = isDefaultWeek ? 2500 : 2500 + (weekSeed - 2) * 200;
  const weekWebSearches = Math.round(weekSearchCredits / 2);

  // View mode for Right Card (Graph view vs Data view) - Default to Graph view
  const [roiViewMode, setRoiViewMode] = useState<'graph' | 'data'>('graph');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // 7 Input assumptions state (Form inputs) matching Image 2
  const [formManualHours, setFormManualHours] = useState<number>(6);
  const [formPeoplePerOutput, setFormPeoplePerOutput] = useState<number>(1);
  const [formCostPerHour, setFormCostPerHour] = useState<number>(35);
  const [formInputTokenPrice, setFormInputTokenPrice] = useState<number>(1.25);
  const [formOutputTokenPrice, setFormOutputTokenPrice] = useState<number>(10);
  const [formEmbeddingTokenPrice, setFormEmbeddingTokenPrice] = useState<number>(0.13);
  const [formSearchCreditPrice, setFormSearchCreditPrice] = useState<number>(0.008);

  // 7 Applied states: Right-side financial impact recalculates when user clicks Recalculate
  const [appliedManualHours, setAppliedManualHours] = useState<number>(6);
  const [appliedPeoplePerOutput, setAppliedPeoplePerOutput] = useState<number>(1);
  const [appliedCostPerHour, setAppliedCostPerHour] = useState<number>(35);
  const [appliedInputTokenPrice, setAppliedInputTokenPrice] = useState<number>(1.25);
  const [appliedOutputTokenPrice, setAppliedOutputTokenPrice] = useState<number>(10);
  const [appliedEmbeddingTokenPrice, setAppliedEmbeddingTokenPrice] = useState<number>(0.13);
  const [appliedSearchCreditPrice, setAppliedSearchCreditPrice] = useState<number>(0.008);

  const hasPendingChanges = useMemo(() => {
    return (
      formManualHours !== appliedManualHours ||
      formPeoplePerOutput !== appliedPeoplePerOutput ||
      formCostPerHour !== appliedCostPerHour ||
      formInputTokenPrice !== appliedInputTokenPrice ||
      formOutputTokenPrice !== appliedOutputTokenPrice ||
      formEmbeddingTokenPrice !== appliedEmbeddingTokenPrice ||
      formSearchCreditPrice !== appliedSearchCreditPrice
    );
  }, [
    formManualHours, formPeoplePerOutput, formCostPerHour, formInputTokenPrice, formOutputTokenPrice, formEmbeddingTokenPrice, formSearchCreditPrice,
    appliedManualHours, appliedPeoplePerOutput, appliedCostPerHour, appliedInputTokenPrice, appliedOutputTokenPrice, appliedEmbeddingTokenPrice, appliedSearchCreditPrice
  ]);

  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);

  const handleRecalculate = () => {
    if (!hasPendingChanges || isRecalculating) return;
    setIsRecalculating(true);
    setTimeout(() => {
      setAppliedManualHours(formManualHours);
      setAppliedPeoplePerOutput(formPeoplePerOutput);
      setAppliedCostPerHour(formCostPerHour);
      setAppliedInputTokenPrice(formInputTokenPrice);
      setAppliedOutputTokenPrice(formOutputTokenPrice);
      setAppliedEmbeddingTokenPrice(formEmbeddingTokenPrice);
      setAppliedSearchCreditPrice(formSearchCreditPrice);
      setIsRecalculating(false);
    }, 600);
  };

  // Live Calculated metrics derived from APPLIED state
  const totalManualHours = useMemo(() => {
    return Math.max(0, Math.round(weekOutputsCount * appliedManualHours * appliedPeoplePerOutput));
  }, [weekOutputsCount, appliedManualHours, appliedPeoplePerOutput]);

  const totalManualCost = useMemo(() => {
    return Math.max(0, Math.round(totalManualHours * appliedCostPerHour));
  }, [totalManualHours, appliedCostPerHour]);

  const totalModelCost = useMemo(() => {
    const raw = (weekInputTokens * appliedInputTokenPrice) + 
                (weekOutputTokens * appliedOutputTokenPrice) + 
                (weekEmbeddingTokens * appliedEmbeddingTokenPrice);
    return Math.round(raw * 100) / 100;
  }, [weekInputTokens, weekOutputTokens, weekEmbeddingTokens, appliedInputTokenPrice, appliedOutputTokenPrice, appliedEmbeddingTokenPrice]);

  const totalSearchCost = useMemo(() => {
    const raw = weekSearchCredits * appliedSearchCreditPrice;
    return Math.round(raw * 100) / 100;
  }, [weekSearchCredits, appliedSearchCreditPrice]);

  const totalAiCost = useMemo(() => {
    return Math.round((totalModelCost + totalSearchCost) * 100) / 100;
  }, [totalModelCost, totalSearchCost]);

  const savedDollars = useMemo(() => {
    return Math.max(0, Math.round((totalManualCost - totalAiCost) * 100) / 100);
  }, [totalManualCost, totalAiCost]);

  // Cost saved % = (manual cost − AI cost) ÷ manual cost
  const costSavedPct = useMemo(() => {
    if (totalManualCost <= 0) return null;
    return Math.max(0, Math.round(((totalManualCost - totalAiCost) / totalManualCost) * 1000) / 10);
  }, [totalManualCost, totalAiCost]);

  // Comparison Historical Data for Line Chart: All 5 weeks of current month
  // Formatted with 7-day window single dates: Sept 28, Oct 5, Oct 12, Oct 19, Oct 26
  const comparisonData = useMemo(() => {
    const dateLabels = ['Sept 28', 'Oct 5', 'Oct 12', 'Oct 19', 'Oct 26'];
    const weekOutputsBase = [14, 17, 20, 22, 24];

    return OCTOBER_WEEKS.map((w, idx) => {
      const isSelected = idx === selectedWeekIndex;
      if (isSelected) {
        return {
          id: w.id,
          date: dateLabels[idx],
          fullLabel: w.label,
          manual: totalManualCost,
          ai: totalAiCost,
          isCurrent: w.isCurrent,
          isSelected: true,
        };
      }
      const outputs = weekOutputsBase[idx];
      const mCost = Math.round(outputs * appliedManualHours * appliedPeoplePerOutput * appliedCostPerHour);
      const ratio = outputs / 20;
      const mTokensIn = 16.0 * ratio;
      const mTokensOut = 4.0 * ratio;
      const mTokensEmbed = 5.0 * ratio;
      const sCredits = 2500 * ratio;
      const aiCost = Math.round(
        ((mTokensIn * appliedInputTokenPrice) +
         (mTokensOut * appliedOutputTokenPrice) +
         (mTokensEmbed * appliedEmbeddingTokenPrice) +
         (sCredits * appliedSearchCreditPrice)) * 100
      ) / 100;

      return {
        id: w.id,
        date: dateLabels[idx],
        fullLabel: w.label,
        manual: mCost,
        ai: aiCost,
        isCurrent: w.isCurrent,
        isSelected: false,
      };
    });
  }, [
    selectedWeekIndex,
    totalManualCost,
    totalAiCost,
    appliedManualHours,
    appliedPeoplePerOutput,
    appliedCostPerHour,
    appliedInputTokenPrice,
    appliedOutputTokenPrice,
    appliedEmbeddingTokenPrice,
    appliedSearchCreditPrice
  ]);

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

  // Totals for Feature Usage & Cost breakdown table (corrected: 14+9=23, 15.4+4.1=19.5M, 760+190=950, $52.40+$11.30=$63.70)
  const featureUsageTotals = useMemo(() => {
    const runs = FEATURE_USAGE_DATA.reduce((acc, r) => acc + r.aiRuns, 0);
    const searches = FEATURE_USAGE_DATA.reduce((acc, r) => acc + r.webSearches, 0);
    const cost = FEATURE_USAGE_DATA.reduce((acc, r) => acc + r.aiCost, 0);
    return {
      runs,
      tokens: '19.5M',
      searches: searches.toLocaleString(),
      cost: `$${cost.toFixed(2)}`,
    };
  }, []);

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

        {/* 1. Top 4 KPI Cards (Matching Image 1 Design & Content) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Outputs Generated */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <InfoTooltip
                placement="bottom"
                align="left"
                text="Reports and decks that finished and were delivered this week. Failed ones are not counted."
              >
                <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
                  OUTPUTS GENERATED
                </span>
              </InfoTooltip>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ED4D19] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] flex items-baseline gap-1.5 font-['Poppins']">
                <span>{weekOutputsCount}</span>
              </div>
              <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
                {weekReportsCount} reports | {weekDecksCount} decks
              </p>
            </div>
          </div>

          {/* Card 2: Tokens Consumed */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <InfoTooltip
                placement="bottom"
                align="left"
                text={'How much text the AI read and wrote.\nAI is charged by tokens: about 750 words = 1,000 tokens.'}
              >
                <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
                  TOKENS CONSUMED
                </span>
              </InfoTooltip>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] flex items-baseline gap-1.5 font-['Poppins']">
                <span>{weekTokensConsumed}M</span>
              </div>
              <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
                <InfoTooltip
                  placement="bottom"
                  text="Text sent to the AI: the request plus the web pages and data it had to read."
                >
                  {weekInputTokens.toFixed(1)}M input
                </InfoTooltip>
                {' | '}
                <InfoTooltip
                  placement="bottom"
                  text="Text the AI wrote back: the report, scores or deck content. Output costs more per token than input."
                >
                  {weekOutputTokens.toFixed(1)}M output
                </InfoTooltip>
                {' | '}
                <InfoTooltip
                  placement="bottom"
                  align="right"
                  text="Text from uploaded or knowledge files, converted so the AI can search it. Cheaper than input or output."
                >
                  {weekEmbeddingTokens.toFixed(1)}M embedding
                </InfoTooltip>
              </p>
            </div>
          </div>

          {/* Card 3: Web Search Credits */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <InfoTooltip
                placement="bottom"
                align="left"
                text={`The web search service charges in credits:\n• Basic search = 1 credit\n• Advanced (deeper) search = 2 credits\n\nThis week: ${weekWebSearches.toLocaleString()} searches used ${weekSearchCredits.toLocaleString()} credits.\n\nSearch cost = credits × price per credit\n${weekSearchCredits.toLocaleString()} × $${appliedSearchCreditPrice} = $${totalSearchCost.toFixed(2)}`}
              >
                <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
                  WEB SEARCH CREDITS
                </span>
              </InfoTooltip>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] flex items-baseline gap-1.5 font-['Poppins']">
                <span>{weekSearchCredits.toLocaleString()}</span>
              </div>
              <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
                Search, extract & page reads
              </p>
            </div>
          </div>

          {/* Card 4: Estimated AI Cost */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <InfoTooltip
                placement="bottom"
                align="right"
                text={`What the AI cost this week, at the prices set in Value/ROI.\n\nModel cost + search cost\n$${totalModelCost.toFixed(2)} + $${totalSearchCost.toFixed(2)} = $${totalAiCost.toFixed(2)}`}
              >
                <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
                  ESTIMATED AI COST
                </span>
              </InfoTooltip>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] flex items-baseline gap-1.5 font-['Poppins']">
                <span>${totalAiCost.toFixed(2)}</span>
              </div>
              <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
                <InfoTooltip
                  placement="bottom"
                  text={`Model cost = tokens × price per 1M tokens (set in Value/ROI):\n\n${weekInputTokens.toFixed(1)}M input × $${appliedInputTokenPrice} = $${(weekInputTokens * appliedInputTokenPrice).toFixed(2)}\n${weekOutputTokens.toFixed(1)}M output × $${appliedOutputTokenPrice} = $${(weekOutputTokens * appliedOutputTokenPrice).toFixed(2)}\n${weekEmbeddingTokens.toFixed(1)}M embedding × $${appliedEmbeddingTokenPrice} = $${(weekEmbeddingTokens * appliedEmbeddingTokenPrice).toFixed(2)}\nTotal: $${totalModelCost.toFixed(2)}`}
                >
                  ${totalModelCost.toFixed(2)} model
                </InfoTooltip>
                {' | '}
                <InfoTooltip
                  placement="bottom"
                  align="right"
                  text={`Search cost = credits × price per credit\n${weekSearchCredits.toLocaleString()} × $${appliedSearchCreditPrice} = $${totalSearchCost.toFixed(2)}`}
                >
                  ${totalSearchCost.toFixed(2)} search
                </InfoTooltip>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Value/ROI Section */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-semibold text-[#0D212C] font-['Poppins'] flex items-center gap-1">
          Value/ROI
          <InfoTooltip
            align="left"
            text="Values used for this week's costs and savings. Change them and select Recalculate. A new week starts with the previous week's values."
          />
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Left Column: 6 Assumptions Table Card (Matching Image 2) */}
          <div className="w-full bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[460px]">
            <div className="divide-y divide-gray-100 flex-1 flex flex-col justify-between py-0.5">
              {/* Row 1: Manual hours per output */}
              <div className="py-2.5 sm:py-3 flex items-center justify-between gap-3 first:pt-0">
                <div className="text-xs sm:text-[13px] text-gray-800 leading-tight">
                  <div className="font-medium text-gray-800 flex items-center gap-1">
                    Manual hours per output
                    <InfoTooltip align="left" text="How long it takes to produce one report or deck by hand." />
                  </div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">per report or deck</div>
                </div>
                <NumericStepperInput
                  value={formManualHours}
                  onChange={setFormManualHours}
                  unit="hours"
                  min={1}
                  max={100}
                />
              </div>

              {/* Row 2: People per output */}
              <div className="py-2.5 sm:py-3 flex items-center justify-between gap-3">
                <div className="text-xs sm:text-[13px] text-gray-800 leading-tight">
                  <div className="font-medium text-gray-800 flex items-center gap-1">
                    People per output
                    <InfoTooltip
                      align="left"
                      text="How many people would work on one report or deck by hand. Each person works the manual hours above."
                    />
                  </div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">people working on one report or deck</div>
                </div>
                <NumericStepperInput
                  value={formPeoplePerOutput}
                  onChange={setFormPeoplePerOutput}
                  unit="people"
                  min={1}
                  max={20}
                />
              </div>

              {/* Row 3: Resource cost per hour */}
              <div className="py-2.5 sm:py-3 flex items-center justify-between gap-3">
                <div className="text-xs sm:text-[13px] text-gray-800 leading-tight">
                  <div className="font-medium text-gray-800 flex items-center gap-1">
                    Resource cost per hour
                    <InfoTooltip align="left" text="The hourly cost of the person who would do this research by hand." />
                  </div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">Cost of the person doing the research manually</div>
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

              {/* Row 4: Input token price */}
              <div className="py-2.5 sm:py-3 flex items-center justify-between gap-3">
                <div className="text-xs sm:text-[13px] text-gray-800 leading-tight">
                  <div className="font-medium text-gray-800 flex items-center gap-1">
                    Input token price
                    <InfoTooltip align="left" text="The AI provider's price for 1 million input tokens." />
                  </div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">per 1M input tokens</div>
                </div>
                <NumericStepperInput
                  value={formInputTokenPrice}
                  onChange={setFormInputTokenPrice}
                  unit="USD"
                  prefix="$"
                  step={0.05}
                  min={0.01}
                  precision={2}
                />
              </div>

              {/* Row 5: Output token price */}
              <div className="py-2.5 sm:py-3 flex items-center justify-between gap-3">
                <div className="text-xs sm:text-[13px] text-gray-800 leading-tight">
                  <div className="font-medium text-gray-800 flex items-center gap-1">
                    Output token price
                    <InfoTooltip align="left" text="The AI provider's price for 1 million output tokens." />
                  </div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">per 1M output tokens</div>
                </div>
                <NumericStepperInput
                  value={formOutputTokenPrice}
                  onChange={setFormOutputTokenPrice}
                  unit="USD"
                  prefix="$"
                  step={0.5}
                  min={0.1}
                  precision={2}
                />
              </div>

              {/* Row 6: Embedding token price */}
              <div className="py-2.5 sm:py-3 flex items-center justify-between gap-3">
                <div className="text-xs sm:text-[13px] text-gray-800 leading-tight">
                  <div className="font-medium text-gray-800 flex items-center gap-1">
                    Embedding token price
                    <InfoTooltip align="left" text="The AI provider's price for 1 million embedding tokens (uploaded files)." />
                  </div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">per 1M tokens · uploaded files</div>
                </div>
                <NumericStepperInput
                  value={formEmbeddingTokenPrice}
                  onChange={setFormEmbeddingTokenPrice}
                  unit="USD"
                  prefix="$"
                  step={0.01}
                  min={0.01}
                  precision={2}
                />
              </div>

              {/* Row 7: Price per search credit */}
              <div className="py-2.5 sm:py-3 flex items-center justify-between gap-3 last:pb-0">
                <div className="text-xs sm:text-[13px] text-gray-800 leading-tight">
                  <div className="font-medium text-gray-800 flex items-center gap-1">
                    Price per search credit
                    <InfoTooltip
                      align="left"
                      text="The price Tavily charges for one credit. A basic search uses 1 credit; an advanced search uses 2."
                    />
                  </div>
                  <div className="text-[11px] text-gray-400 font-normal mt-0.5">web search (Tavily)</div>
                </div>
                <NumericStepperInput
                  value={formSearchCreditPrice}
                  onChange={setFormSearchCreditPrice}
                  unit="USD"
                  prefix="$"
                  step={0.001}
                  min={0.001}
                  precision={3}
                />
              </div>
            </div>

            {/* Recalculate CTA Button */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-1">
              <span className="text-[11px] text-gray-400 font-normal">
                {hasPendingChanges ? 'Unapplied changes' : 'AI cost includes model + web search'}
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

          {/* Right Column: Comparison Graph or Numbers View (Matching Image 3) */}
          <div className="w-full bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 relative min-h-[460px]">
            {/* Loading Animation & Text during Recalculate */}
            {isRecalculating && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-2xs rounded-2xl flex flex-col items-center justify-center z-30 space-y-2.5 transition-all">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-[#ED4D19] rounded-full animate-spin" />
                <span className="text-xs font-medium text-gray-600 font-['Poppins']">
                  Recalculating value/roi...
                </span>
              </div>
            )}

            {/* Header: Title, Legend & View Mode Toggle (Segmented Buttons from Build Roadmap) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 shrink-0">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <h3 className="text-sm sm:text-base font-semibold text-[#0D212C] font-['Poppins']">
                    Manual cost vs AI cost
                  </h3>
                  <InfoTooltip
                    align="left"
                    text="Manual and AI cost for each of the last 5 weeks. Each week uses its own saved values."
                  />
                </div>
                {/* Legend (Only shown in graph view, removed in data view) */}
                {roiViewMode === 'graph' && (
                  <div className="flex items-center gap-3.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-0.5 bg-[#36C0C9] rounded-full inline-block" />
                      <span className="text-gray-600 font-normal text-[11px]">Manual cost</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-0.5 bg-[#ED4D19] rounded-full inline-block" />
                      <span className="text-gray-600 font-normal text-[11px]">AI cost</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Segmented Switcher Buttons (Matching Build Roadmap style) */}
              <div className="inline-flex items-center p-0.5 bg-white border border-gray-200 rounded-lg shadow-2xs shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setRoiViewMode('graph')}
                  title="Graph view"
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    roiViewMode === 'graph'
                      ? 'bg-[#ED4D19] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 bg-transparent'
                  }`}
                >
                  <LineChart className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRoiViewMode('data')}
                  title="Data view"
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    roiViewMode === 'data'
                      ? 'bg-[#ED4D19] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900 bg-transparent'
                  }`}
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area: Graph View (Default) vs Data / Numbers View */}
            {roiViewMode === 'graph' ? (
              /* GRAPH VIEW: SVG Comparison Line Chart matching Image 3 */
              <div className="flex-1 flex flex-col justify-center py-2 relative select-none">
                {(() => {
                  const maxManual = Math.max(...comparisonData.map((d) => d.manual), 4000);
                  const yMax = Math.ceil(maxManual / 1000) * 1000;
                  const svgWidth = 640;
                  const svgHeight = 290;
                  const padLeft = 45;
                  const padRight = 115;
                  const padTop = 30;
                  const padBottom = 38;
                  const plotWidth = svgWidth - padLeft - padRight;
                  const plotHeight = svgHeight - padTop - padBottom;

                  const getX = (idx: number) => padLeft + (idx / (comparisonData.length - 1)) * plotWidth;
                  const getY = (val: number) => padTop + plotHeight * (1 - Math.min(yMax, Math.max(0, val)) / yMax);

                  // Path generator
                  const manualPoints = comparisonData.map((d, i) => `${getX(i)},${getY(d.manual)}`).join(' ');
                  const aiPoints = comparisonData.map((d, i) => `${getX(i)},${getY(d.ai)}`).join(' ');

                  const step = yMax >= 8000 ? 2000 : 1000;
                  const yTicks: number[] = [];
                  for (let v = yMax; v >= 0; v -= step) {
                    yTicks.push(v);
                  }

                  const lastIdx = comparisonData.length - 1;
                  const lastPoint = comparisonData[lastIdx];
                  const lastX = getX(lastIdx);
                  const lastManualY = getY(lastPoint.manual);
                  const lastAiY = getY(lastPoint.ai);

                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-auto max-h-[340px] overflow-visible"
                      >
                        {/* Y-Axis Horizontal Gridlines and Labels */}
                        {yTicks.map((val) => {
                          const y = getY(val);
                          const label = val === 0 ? '$0' : `$${val / 1000}K`;
                          return (
                            <g key={val}>
                              <line
                                x1={padLeft}
                                y1={y}
                                x2={lastX}
                                y2={y}
                                stroke="#F1F5F9"
                                strokeWidth="1"
                              />
                              <text
                                x={padLeft - 10}
                                y={y + 3.5}
                                textAnchor="end"
                                fill="#94A3B8"
                                fontSize="11"
                                fontFamily="monospace"
                              >
                                {label}
                              </text>
                            </g>
                          );
                        })}

                        {/* Manual Cost Line (Primary Light Color Line #36C0C9) */}
                        <polyline
                          fill="none"
                          stroke="#36C0C9"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={manualPoints}
                        />

                        {/* AI Cost Line (Orange Line #ED4D19) */}
                        <polyline
                          fill="none"
                          stroke="#ED4D19"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={aiPoints}
                        />

                        {/* Interactive Data Points & Hover Targets */}
                        {comparisonData.map((d, i) => {
                          const x = getX(i);
                          const mY = getY(d.manual);
                          const aY = getY(d.ai);
                          const isHovered = hoveredPointIndex === i;
                          const isSelected = i === selectedWeekIndex;

                          return (
                            <g
                              key={d.id || d.date}
                              onMouseEnter={() => setHoveredPointIndex(i)}
                              onMouseLeave={() => setHoveredPointIndex(null)}
                              onClick={() => setSelectedWeekIndex(i)}
                              className="cursor-pointer"
                            >
                              {/* Transparent hit area */}
                              <rect
                                x={x - 22}
                                y={padTop}
                                width={44}
                                height={plotHeight}
                                fill="transparent"
                              />

                              {/* Subtle vertical indicator dashed line on hover or selection */}
                              {(isHovered || isSelected) && (
                                <line
                                  x1={x}
                                  y1={padTop}
                                  x2={x}
                                  y2={padTop + plotHeight}
                                  stroke="#E2E8F0"
                                  strokeWidth="1"
                                  strokeDasharray="3 3"
                                />
                              )}

                              {/* Manual Point Circle (#36C0C9) */}
                              <circle
                                cx={x}
                                cy={mY}
                                r={isSelected ? 5 : isHovered ? 4.5 : 3.5}
                                fill="#36C0C9"
                                stroke="#FFFFFF"
                                strokeWidth={isSelected ? 2.5 : 1.5}
                                className="transition-all"
                              />

                              {/* AI Point Circle (#ED4D19) */}
                              <circle
                                cx={x}
                                cy={aY}
                                r={isSelected ? 5 : isHovered ? 4.5 : 3.5}
                                fill="#ED4D19"
                                stroke="#FFFFFF"
                                strokeWidth={isSelected ? 2.5 : 1.5}
                                className="transition-all"
                              />

                              {/* X-Axis Date Labels (Weeks from data selector) */}
                              <text
                                x={x}
                                y={svgHeight - 12}
                                textAnchor="middle"
                                fill={isSelected ? '#0D212C' : '#64748B'}
                                fontSize="10.5"
                                fontWeight={isSelected ? '600' : '400'}
                                className="transition-colors select-none"
                              >
                                {d.date}
                              </text>
                            </g>
                          );
                        })}

                        {/* End Labels for the lines */}
                        <g>
                          <text
                            x={lastX + 12}
                            y={lastManualY + 4}
                            fill="#0D212C"
                            fontSize="11.5"
                            fontWeight="600"
                            className="select-none"
                          >
                            Manual ${lastPoint.manual.toLocaleString()}
                          </text>
                          <text
                            x={lastX + 12}
                            y={Math.max(lastManualY + 18, lastAiY + 4)}
                            fill="#0D212C"
                            fontSize="11.5"
                            fontWeight="600"
                            className="select-none"
                          >
                            AI ${lastPoint.ai < 100 ? lastPoint.ai.toFixed(2) : Math.round(lastPoint.ai).toLocaleString()}
                          </text>
                        </g>
                      </svg>

                      {/* Custom Light Theme Tooltip on Hover */}
                      {hoveredPointIndex !== null && (
                        <div
                          className="absolute z-40 bg-white text-gray-800 p-3 rounded-xl border border-gray-200/90 shadow-xl text-left pointer-events-none text-xs animate-in fade-in zoom-in-95 duration-100 min-w-[175px]"
                          style={{
                            left: `${(getX(hoveredPointIndex) / svgWidth) * 100}%`,
                            top: '8%',
                            transform: hoveredPointIndex === 0 
                              ? 'translateX(-15%)' 
                              : hoveredPointIndex === 1
                              ? 'translateX(-32%)'
                              : hoveredPointIndex === 2
                              ? 'translateX(-50%)'
                              : hoveredPointIndex === 3
                              ? 'translateX(-68%)'
                              : 'translateX(-85%)',
                          }}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-1.5 mb-2">
                            <span className="font-semibold text-gray-900 text-xs">
                              {comparisonData[hoveredPointIndex].fullLabel || comparisonData[hoveredPointIndex].date}
                            </span>
                            {hoveredPointIndex === selectedWeekIndex && (
                              <span className="text-[9px] font-medium bg-orange-50 text-[#ED4D19] px-1.5 py-0.5 rounded-full shrink-0">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <span className="w-2 h-2 rounded-full bg-[#36C0C9] shrink-0" />
                                <span>Manual cost:</span>
                              </div>
                              <span className="font-semibold text-gray-900 font-mono">
                                ${comparisonData[hoveredPointIndex].manual.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5 text-gray-600">
                                <span className="w-2 h-2 rounded-full bg-[#ED4D19] shrink-0" />
                                <span>AI cost:</span>
                              </div>
                              <span className="font-semibold text-[#ED4D19] font-mono">
                                ${comparisonData[hoveredPointIndex].ai < 100 ? comparisonData[hoveredPointIndex].ai.toFixed(2) : Math.round(comparisonData[hoveredPointIndex].ai).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-gray-100">
                              <span className="text-gray-500 font-medium">Estimated savings:</span>
                              <span className="font-semibold text-[#00C3CB] font-mono">
                                ${(Math.max(0, comparisonData[hoveredPointIndex].manual - comparisonData[hoveredPointIndex].ai)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                          {/* Tooltip downward caret arrow */}
                          <div
                            className="absolute top-full -mt-1 w-2 h-2 bg-white border-r border-b border-gray-200 rotate-45"
                            style={{
                              left: hoveredPointIndex === 0
                                ? '15%'
                                : hoveredPointIndex === 1
                                ? '32%'
                                : hoveredPointIndex === 2
                                ? '50%'
                                : hoveredPointIndex === 3
                                ? '68%'
                                : '85%',
                              transform: 'translateX(-50%)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* NUMBERS / DATA VIEW: 4 Financial blocks with adjusted spacing & divider lines matching taller card */
              <div className="flex-1 flex flex-col justify-around divide-y divide-gray-100 py-2">
                {/* Top Row: Manual cost vs AI cost */}
                <div className="pb-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                    {/* Manual cost */}
                    <div className="sm:pr-5 space-y-1 pb-3 sm:pb-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <span>Manual cost</span>
                        <div className="relative group/tip inline-flex items-center">
                          <button type="button" className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" aria-label="Manual cost info">
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tip:block z-50 px-3 py-1.5 bg-[#0D212C] text-white text-[11px] font-normal rounded-lg shadow-xl pointer-events-none w-max max-w-xs text-left animate-in fade-in duration-150">
                            <div>Manual cost = outputs × manual hours × people × cost per hour</div>
                            <div className="mt-0.5">
                              {weekOutputsCount} × {appliedManualHours} hrs × {appliedPeoplePerOutput} {appliedPeoplePerOutput === 1 ? 'person' : 'people'} × ${appliedCostPerHour}/hr = ${totalManualCost.toLocaleString()}
                            </div>
                            <div className="absolute top-full left-2 border-4 border-transparent border-t-[#0D212C]" />
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] font-['Poppins']">
                        ${totalManualCost.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-gray-500 pt-0.5">
                        Total hours {totalManualHours} | Cost per hour ${appliedCostPerHour}
                      </div>
                    </div>

                    {/* AI cost */}
                    <div className="sm:pl-5 space-y-1 pt-3 sm:pt-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <span>AI cost</span>
                        <div className="relative group/tip inline-flex items-center">
                          <button type="button" className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" aria-label="AI cost info">
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 hidden group-hover/tip:block z-50 px-3 py-1.5 bg-[#0D212C] text-white text-[11px] font-normal rounded-lg shadow-xl pointer-events-none w-max max-w-xs text-left animate-in fade-in duration-150">
                            <div>AI cost includes model tokens + web search credits.</div>
                            <div className="mt-0.5">${totalModelCost.toFixed(2)} model + ${totalSearchCost.toFixed(2)} search</div>
                            <div className="absolute top-full left-2 sm:left-auto sm:right-2 border-4 border-transparent border-t-[#0D212C]" />
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold text-[#ED4D19] font-['Poppins']">
                        ${totalAiCost.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-gray-500 pt-0.5">
                        ${totalModelCost.toFixed(2)} model | ${totalSearchCost.toFixed(2)} search
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Cost saved vs Estimated savings */}
                <div className="pt-4 pb-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                    {/* Cost saved */}
                    <div className="sm:pr-5 space-y-1 pb-3 sm:pb-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <span>Cost saved</span>
                        <div className="relative group/tip inline-flex items-center">
                          <button type="button" className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" aria-label="Cost saved info">
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tip:block z-50 px-3 py-1.5 bg-[#0D212C] text-white text-[11px] font-normal rounded-lg shadow-xl pointer-events-none w-max max-w-xs text-left animate-in fade-in duration-150">
                            <div>How much less the AI cost than doing the work by hand.</div>
                            <div className="mt-1">(Manual cost − AI cost) ÷ manual cost</div>
                            <div className="mt-0.5">
                              {costSavedPct === null
                                ? '–'
                                : `($${totalManualCost.toLocaleString()} − $${totalAiCost.toFixed(2)}) ÷ $${totalManualCost.toLocaleString()} = ${costSavedPct.toFixed(1)}%`}
                            </div>
                            <div className="absolute top-full left-2 border-4 border-transparent border-t-[#0D212C]" />
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold text-[#00C3CB] font-['Poppins']">
                        {costSavedPct === null ? '–' : `${costSavedPct.toFixed(1)}%`}
                      </div>
                    </div>

                    {/* Estimated savings */}
                    <div className="sm:pl-5 space-y-1 pt-3 sm:pt-0">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                        <span>Estimated savings</span>
                        <div className="relative group/tip inline-flex items-center">
                          <button type="button" className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" aria-label="Estimated savings info">
                            <Info className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-full left-0 sm:left-auto sm:right-0 mb-2 hidden group-hover/tip:block z-50 px-3 py-1.5 bg-[#0D212C] text-white text-[11px] font-normal rounded-lg shadow-xl pointer-events-none w-max max-w-xs text-left animate-in fade-in duration-150">
                            <div>Estimated savings = manual cost − AI cost</div>
                            <div className="mt-0.5">
                              ${totalManualCost.toLocaleString()} − ${totalAiCost.toFixed(2)} = ${savedDollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="absolute top-full left-2 sm:left-auto sm:right-2 border-4 border-transparent border-t-[#0D212C]" />
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-semibold text-[#00C3CB] font-['Poppins'] flex items-baseline">
                        <span>${savedDollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Breakdown Table: AI cost by feature */}
      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-semibold text-[#0D212C] font-['Poppins'] flex items-center gap-1">
          AI cost by feature
          <InfoTooltip
            align="left"
            text="Where this week's AI cost went: Part A reports and Magic Mode. The total equals the Estimated AI cost card."
          />
        </h2>
        {/* Visible overflow on large screens so header/row tooltips are not clipped */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-x-auto lg:overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase select-none">
                <th className="py-3.5 px-6 font-normal rounded-tl-2xl">FEATURE</th>
                <th className="py-3.5 px-6 font-normal">
                  <span className="inline-flex items-center gap-1">
                    AI RUNS
                    <InfoTooltip text="The number of jobs the AI ran this week, such as a report, a deck or the quarterly refresh. Failed runs are included because they still cost money." />
                  </span>
                </th>
                <th className="py-3.5 px-6 font-normal">
                  <span className="inline-flex items-center gap-1">
                    TOKENS
                    <InfoTooltip text="Input + output + embedding tokens used by this feature." />
                  </span>
                </th>
                <th className="py-3.5 px-6 font-normal">
                  <span className="inline-flex items-center gap-1">
                    WEB SEARCHES
                    <InfoTooltip text="The number of times the AI searched the web for this feature this week. Each search uses 1 or 2 credits. The total matches the searches shown on the Web search credits card." />
                  </span>
                </th>
                <th className="py-3.5 px-6 font-normal">
                  <span className="inline-flex items-center gap-1">
                    AI COST
                    <InfoTooltip text="Token cost + web search cost for this feature, at this week's prices." />
                  </span>
                </th>
                <th className="py-3.5 px-6 font-normal rounded-tr-2xl">
                  <span className="inline-flex items-center gap-1">
                    SHARE OF COST
                    <InfoTooltip align="right" text="The part of this week's total AI cost that this feature used." />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[0.875rem]">
              {FEATURE_USAGE_DATA.map((row) => (
                <tr key={row.feature} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-normal text-[0.8125rem] text-[#0D212C]">
                    <InfoTooltip align="left" text={row.tip}>
                      {row.feature}
                    </InfoTooltip>
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-[0.8125rem] text-[#0D212C]">
                    {row.aiRuns}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-[0.8125rem] text-[#0D212C]">
                    {row.tokens}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-[0.8125rem] text-[#0D212C]">
                    {row.webSearches.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-[0.8125rem] text-[#0D212C]">
                    ${row.aiCost.toFixed(2)}
                  </td>
                  <td className={`py-3.5 px-6 font-semibold text-[0.8125rem] ${getShareOfCostColor(row.shareOfCost)}`}>
                    {row.shareOfCost}%
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="border-t border-gray-200 hover:bg-gray-50/70 transition-colors">
                <td className="py-3.5 px-6 font-bold text-[0.8125rem] text-[#0D212C]">
                  Total
                </td>
                <td className="py-3.5 px-6 font-bold text-[0.8125rem] text-[#0D212C]">
                  {featureUsageTotals.runs}
                </td>
                <td className="py-3.5 px-6 font-bold text-[0.8125rem] text-[#0D212C]">
                  {featureUsageTotals.tokens}
                </td>
                <td className="py-3.5 px-6 font-bold text-[0.8125rem] text-[#0D212C]">
                  {featureUsageTotals.searches}
                </td>
                <td className="py-3.5 px-6 font-bold text-[0.8125rem] text-[#0D212C]">
                  {featureUsageTotals.cost}
                </td>
                <td className="py-3.5 px-6"></td>
              </tr>
            </tbody>
          </table>
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
            {/* Column 1: Top Reports */}
            <div className="space-y-1 md:pr-6 pb-6 md:pb-0">
              <div className="pb-2.5">
                <h3 className="text-xs sm:text-sm font-semibold text-[#0D212C] font-['Poppins']">
                  Top Reports
                  <InfoTooltip align="left" text="Domains most requested in Part A reports this week." />
                </h3>
                <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                  Based on Part A reports
                </p>
              </div>
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
              <div className="pb-2.5">
                <h3 className="text-xs sm:text-sm font-semibold text-[#0D212C] font-['Poppins']">
                  Top countries
                  <InfoTooltip align="left" text="Countries most requested this week, from Part A reports and Part B country decks." />
                </h3>
                <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                  Based on Part A reports and Part B country decks
                </p>
              </div>
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
              <div className="pb-2.5">
                <h3 className="text-xs sm:text-sm font-semibold text-[#0D212C] font-['Poppins']">
                  Top solutions (Magic Mode)
                  <InfoTooltip align="left" text="Solutions most requested this week, from Part B solution decks." />
                </h3>
                <p className="text-[11px] text-gray-400 font-normal mt-0.5">
                  Based on Part B solution decks
                </p>
              </div>
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
