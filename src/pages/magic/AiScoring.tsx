import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Info, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Settings2,
  Eye,
  BookOpen,
  X,
  RotateCcw,
  Check,
  Save
} from 'lucide-react';

// Factor Metadata
export interface FactorInfo {
  id: 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6';
  code: string;
  name: string;
  shortName: string;
  fullName: string;
  description: string;
  defaultWeight: number;
  rubric: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
}

export const FACTORS: FactorInfo[] = [
  {
    id: 'F1',
    code: 'F1',
    name: 'Criticality & need',
    shortName: 'Criticality',
    fullName: 'F1: CRITICALITY & NEED',
    description: "How essential the solution is to a country's real, unmet needs.",
    defaultWeight: 1,
    rubric: {
      1: 'Addresses no real need',
      2: 'Marginal / nice-to-have',
      3: 'Real need in some markets',
      4: 'Serious, common need',
      5: 'Severe, board-level pain'
    }
  },
  {
    id: 'F2',
    code: 'F2',
    name: 'Willingness to pay',
    shortName: 'Willingness',
    fullName: 'F2: WILLINGNESS TO PAY',
    description: 'Ability & propensity of the target markets to pay for it.',
    defaultWeight: 1,
    rubric: {
      1: 'No budget / no buyer',
      2: 'Weak, long budget cycles',
      3: 'Mixed — some markets fund it',
      4: 'Strong ability & intent',
      5: 'Proven budgets, funded now'
    }
  },
  {
    id: 'F3',
    code: 'F3',
    name: 'Competitiveness',
    shortName: 'Competitiveness',
    fullName: 'F3: COMPETITIVENESS',
    description: 'How distinctive and defensible it is versus alternatives.',
    defaultWeight: 1,
    rubric: {
      1: 'Commodity, many substitutes',
      2: 'Weakly differentiated',
      3: 'Some edge in places',
      4: 'Clearly differentiated',
      5: 'Distinctive, hard to replicate'
    }
  },
  {
    id: 'F4',
    code: 'F4',
    name: 'Reusability & scale',
    shortName: 'Reusability',
    fullName: 'F4: REUSABILITY & SCALE',
    description: 'Build-once, scale-many — the reuse its components give.',
    defaultWeight: 1,
    rubric: {
      1: 'Single-use, no reuse',
      2: 'Limited reuse',
      3: 'Moderate reuse',
      4: 'High reuse across solutions',
      5: 'Core shared foundation'
    }
  },
  {
    id: 'F5',
    code: 'F5',
    name: 'Market reach (TAM)',
    shortName: 'Market reach',
    fullName: 'F5: MARKET REACH (TAM)',
    description: 'How many of the target countries it is sellable in.',
    defaultWeight: 1,
    rubric: {
      1: 'Fits ~1 target market',
      2: 'Fits a couple of markets',
      3: 'Fits several markets',
      4: 'Fits most target markets',
      5: 'Fits nearly all markets'
    }
  },
  {
    id: 'F6',
    code: 'F6',
    name: 'Revenue depth',
    shortName: 'Revenue depth',
    fullName: 'F6: REVENUE DEPTH',
    description: 'Deal size / monetisation depth per market.',
    defaultWeight: 1,
    rubric: {
      1: 'Negligible deal value',
      2: 'Thin deals',
      3: 'Moderate deal value',
      4: 'Strong deal value',
      5: 'Premium, multi-stream value'
    }
  }
];

export interface SolutionScoringItem {
  id: string;
  name: string;
  status: 'In progress' | 'Prioritised' | 'New' | 'Completed';
  revenue3Yr: string;
  revenueNum: number;
  fScores: {
    F1: number; // 1 to 5
    F2: number;
    F3: number;
    F4: number;
    F5: number;
    F6: number;
  };
}

// Initial sample data covering all scores from 1 to 5
const INITIAL_SOLUTION_SCORES: SolutionScoringItem[] = [
  {
    id: 's4',
    name: 'InsurTech & Reimbursement',
    status: 'In progress',
    revenue3Yr: '$21M',
    revenueNum: 21,
    fScores: { F1: 5, F2: 5, F3: 4, F4: 3, F5: 4, F6: 4 }
  },
  {
    id: 's2',
    name: 'Remote Patient Monitoring',
    status: 'Prioritised',
    revenue3Yr: '$25M',
    revenueNum: 25,
    fScores: { F1: 4, F2: 4, F3: 5, F4: 4, F5: 4, F6: 4 }
  },
  {
    id: 's5',
    name: 'Hospital Ops & Clinical Workflow',
    status: 'In progress',
    revenue3Yr: '$27M',
    revenueNum: 27,
    fScores: { F1: 4, F2: 4, F3: 3, F4: 3, F5: 5, F6: 4 }
  },
  {
    id: 's3',
    name: 'Population Health & Analytics',
    status: 'New',
    revenue3Yr: '$25M',
    revenueNum: 25,
    fScores: { F1: 4, F2: 3, F3: 4, F4: 4, F5: 4, F6: 3 }
  },
  {
    id: 's8',
    name: 'Drug Discovery & Clinical Trials',
    status: 'New',
    revenue3Yr: '$19M',
    revenueNum: 19,
    fScores: { F1: 4, F2: 4, F3: 5, F4: 2, F5: 1, F6: 5 }
  },
  {
    id: 's1',
    name: 'EMR & Interoperability',
    status: 'Completed',
    revenue3Yr: '$24M',
    revenueNum: 24,
    fScores: { F1: 3, F2: 3, F3: 1, F4: 4, F5: 5, F6: 3 }
  },
  {
    id: 's6',
    name: 'Pharmacy & Medication Management',
    status: 'Prioritised',
    revenue3Yr: '$11M',
    revenueNum: 11,
    fScores: { F1: 3, F2: 2, F3: 2, F4: 1, F5: 3, F6: 3 }
  },
  {
    id: 's7',
    name: 'Home & Community Care',
    status: 'New',
    revenue3Yr: '$17M',
    revenueNum: 17,
    fScores: { F1: 2, F2: 1, F3: 2, F4: 3, F5: 2, F6: 1 }
  }
];

const ITEMS_PER_PAGE = 7;

// Color mapping for scores 1 to 5
const SCORE_CONFIG: Record<number, { stroke: string; track: string; text: string }> = {
  1: { stroke: '#EF4444', track: '#FEE2E2', text: 'text-red-600' },     // Red
  2: { stroke: '#F97316', track: '#FFEDD5', text: 'text-orange-600' },  // Orange
  3: { stroke: '#F59E0B', track: '#FEF3C7', text: 'text-amber-600' },   // Amber / Yellow
  4: { stroke: '#3B82F6', track: '#DBEAFE', text: 'text-blue-600' },    // Blue
  5: { stroke: '#10B981', track: '#D1FAE5', text: 'text-emerald-600' }, // Green
};

export default function AiScoring({ initialTab = 'scoring' }: { initialTab?: 'scoring' | 'weightage' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState<'scoring' | 'weightage'>(
    tabParam === 'weightage' ? 'weightage' : initialTab
  );

  // Weights state: F1 to F6 multipliers (0, 1, 2, 3 only)
  const [isEditingWeightage, setIsEditingWeightage] = useState(false);
  const [weights, setWeights] = useState<Record<string, number>>({
    F1: 1,
    F2: 1,
    F3: 1,
    F4: 1,
    F5: 1,
    F6: 1,
  });
  const [tempWeights, setTempWeights] = useState<Record<string, number>>({
    F1: 1,
    F2: 1,
    F3: 1,
    F4: 1,
    F5: 1,
    F6: 1,
  });

  const [isLocked, setIsLocked] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isFactorsDrawerOpen, setIsFactorsDrawerOpen] = useState(false);
  const [isEyeTooltipHovered, setIsEyeTooltipHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusFilterRef.current && !statusFilterRef.current.contains(event.target as Node)) {
        setIsStatusFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [scoringPage, setScoringPage] = useState(1);
  const [activeHoverCell, setActiveHoverCell] = useState<{ solId: string; factorId: string } | null>(null);

  // Sorting state for F1 to F6
  const [sortFactor, setSortFactor] = useState<{ factor: string; order: 'asc' | 'desc' | 'none' }>({
    factor: 'none',
    order: 'none'
  });

  // Handle Tab Switch
  const handleTabChange = (tab: 'scoring' | 'weightage') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Reset Weights - Sets all factor weights to 1
  const handleResetWeights = () => {
    const defaultW = {
      F1: 1,
      F2: 1,
      F3: 1,
      F4: 1,
      F5: 1,
      F6: 1,
    };
    setWeights(defaultW);
    setTempWeights(defaultW);
  };

  // Toggle factor sort
  const handleToggleFactorSort = (factorId: string) => {
    setSortFactor((prev) => {
      if (prev.factor !== factorId) {
        return { factor: factorId, order: 'desc' };
      }
      if (prev.order === 'desc') {
        return { factor: factorId, order: 'asc' };
      }
      return { factor: 'none', order: 'none' };
    });
    setScoringPage(1);
  };

  // Compute 0-100 Score for a solution
  const calculateScore = (fScores: SolutionScoringItem['fScores'], currentWeights: Record<string, number>): number => {
    let totalWeightedScore = 0;
    let maxWeightedScore = 0;

    FACTORS.forEach((f) => {
      const weight = currentWeights[f.id] ?? f.defaultWeight;
      const score = fScores[f.id] ?? 3;
      totalWeightedScore += score * weight;
      maxWeightedScore += 5 * weight;
    });

    if (maxWeightedScore === 0) return 0;
    return Math.round((totalWeightedScore / maxWeightedScore) * 100);
  };

  // Effective weights for live ranking updates during edit mode
  const currentEffectiveWeights = useMemo(() => {
    return isEditingWeightage ? tempWeights : weights;
  }, [isEditingWeightage, tempWeights, weights]);

  // Solutions with live dynamically calculated scores
  const solutionsWithScores = useMemo(() => {
    return INITIAL_SOLUTION_SCORES.map((sol) => {
      const calculatedScore = calculateScore(sol.fScores, weights);
      return {
        ...sol,
        score: calculatedScore
      };
    });
  }, [weights]);

  // Ranked Solutions for Live Ranking in Weightage tab
  const rankedSolutions = useMemo(() => {
    return INITIAL_SOLUTION_SCORES.map((sol) => {
      const calculatedScore = calculateScore(sol.fScores, currentEffectiveWeights);
      return {
        ...sol,
        score: calculatedScore
      };
    }).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.revenueNum - a.revenueNum;
    });
  }, [currentEffectiveWeights]);

  // Filtered & Sorted solutions for the table
  const filteredSolutions = useMemo(() => {
    let list = solutionsWithScores.filter((sol) => {
      const matchesSearch = sol.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || sol.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortFactor.factor !== 'none' && sortFactor.order !== 'none') {
      const factorKey = sortFactor.factor as keyof SolutionScoringItem['fScores'];
      list = [...list].sort((a, b) => {
        const valA = a.fScores[factorKey] || 0;
        const valB = b.fScores[factorKey] || 0;
        return sortFactor.order === 'asc' ? valA - valB : valB - valA;
      });
    }

    return list;
  }, [solutionsWithScores, searchQuery, statusFilter, sortFactor]);

  // Paginated solutions (7 rows per page)
  const totalScoringPages = Math.ceil(filteredSolutions.length / ITEMS_PER_PAGE) || 1;
  const paginatedSolutions = useMemo(() => {
    const start = (scoringPage - 1) * ITEMS_PER_PAGE;
    return filteredSolutions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSolutions, scoringPage]);

  // Render Round Progress Bar for 1-5 Scores with simplified rubric tooltip
  const renderRoundProgress = (score: number, factor: FactorInfo, solId: string) => {
    const isHovered = activeHoverCell?.solId === solId && activeHoverCell?.factorId === factor.id;
    const rubricText = factor.rubric[score as 1 | 2 | 3 | 4 | 5] || 'Evaluated standard';
    const config = SCORE_CONFIG[score] || SCORE_CONFIG[3];

    const radius = 12;
    const circumference = 2 * Math.PI * radius; // ~75.4
    const strokeDashoffset = circumference - (score / 5) * circumference;

    return (
      <div 
        className="relative inline-flex items-center justify-center cursor-pointer py-1 select-none"
        onMouseEnter={() => setActiveHoverCell({ solId, factorId: factor.id })}
        onMouseLeave={() => setActiveHoverCell(null)}
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-8 h-8 -rotate-90">
            {/* Background Track Ring */}
            <circle
              cx="16"
              cy="16"
              r={radius}
              stroke={config.track}
              strokeWidth="2.5"
              fill="transparent"
            />
            {/* Colored Progress Ring */}
            <circle
              cx="16"
              cy="16"
              r={radius}
              stroke={config.stroke}
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          {/* Centered Score Number */}
          <span className={`absolute inset-0 flex items-center justify-center text-[0.6875rem] font-semibold ${config.text}`}>
            {score}
          </span>
        </div>

        {/* Simplified Tooltip showing the reason */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#0D212C] text-white text-[0.75rem] font-medium rounded-lg shadow-xl z-50 text-center whitespace-nowrap pointer-events-none animate-in fade-in duration-150">
            {rubricText}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0D212C]" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 md:py-8 space-y-6">
      {/* Top Underline Tabs (Matching Catalogue Design Exactly) */}
      <div className="inline-block border-b border-gray-200">
        <nav className="flex space-x-1 sm:space-x-2 -mb-[1px]">
          <button
            onClick={() => handleTabChange('scoring')}
            className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
              activeTab === 'scoring'
                ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            AI solution scoring
          </button>
          <button
            onClick={() => handleTabChange('weightage')}
            className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
              activeTab === 'weightage'
                ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Weightage configuration
          </button>
        </nav>
      </div>

      {/* TAB 1: AI SOLUTION SCORING */}
      {activeTab === 'scoring' && (
        <div className="space-y-6">
          {/* Header Title with exact Catalogue Solutions font styling */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <h2 className="text-[1.125rem] font-medium text-[#0D212C] font-['Poppins']">
                AI solution scoring
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-light">
                Every catalog solution is scored across six revenue factors (1–5), generating a 0–100 attractiveness score and conservative revenue estimate. Weightage is the only adjustable input.
              </p>
            </div>

            {/* Action Button: View Scoring Factors Button with Tooltip */}
            <div className="relative shrink-0 pt-0.5">
              <button
                type="button"
                onClick={() => setIsFactorsDrawerOpen(true)}
                onMouseEnter={() => setIsEyeTooltipHovered(true)}
                onMouseLeave={() => setIsEyeTooltipHovered(false)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium transition-colors shadow-2xs cursor-pointer group"
              >
                <BookOpen className="w-4 h-4 text-[#ED4D19]" />
                <span>View scoring factors</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Tooltip */}
              {isEyeTooltipHovered && (
                <div className="absolute bottom-full mb-2 right-0 px-3.5 py-2 bg-[#1e293b] text-white text-xs font-normal rounded-xl shadow-xl z-50 whitespace-nowrap">
                  See what AI solution scoring means
                  <div className="absolute top-full right-6 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]" />
                </div>
              )}
            </div>
          </div>

          {/* AI SCORING LOGIC */}
          <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsRubricOpen(!isRubricOpen)}
              className="w-full px-6 py-3.5 bg-gray-50/60 hover:bg-gray-50 flex items-center justify-between text-left transition-colors cursor-pointer border-0 select-none outline-none focus:outline-none"
            >
              <span className="text-xs font-semibold text-[#0D212C] font-['Poppins']">
                AI Scoring Logic
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isRubricOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRubricOpen && (
              <div className="p-6 border-t border-gray-100 space-y-4">
                <p className="text-[0.75rem] text-gray-500 italic">
                  Every factor uses the same 1–5 scale, split into five objective bands. A solution's score reflects its placement, and that band's wording is the one-line reason shown when you hover the score — so scoring is objective, consistent, and repeatable.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase">
                        <th className="py-3 px-4 font-normal min-w-[220px]">FACTOR</th>
                        <th className="py-3 px-4 font-normal min-w-[130px]">1 (LOW)</th>
                        <th className="py-3 px-4 font-normal min-w-[130px]">2 (FAIR)</th>
                        <th className="py-3 px-4 font-normal min-w-[140px]">3 (MODERATE)</th>
                        <th className="py-3 px-4 font-normal min-w-[140px]">4 (STRONG)</th>
                        <th className="py-3 px-4 font-normal min-w-[150px]">5 (EXCELLENT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[0.75rem]">
                      {FACTORS.map((f) => (
                        <tr key={f.id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-[#0D212C] min-w-[220px]">
                            <div>{f.code} · {f.name}</div>
                            <div className="text-[0.6875rem] font-normal text-gray-400 mt-0.5 leading-snug">{f.description}</div>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">{f.rubric[1]}</td>
                          <td className="py-3.5 px-4 text-gray-600">{f.rubric[2]}</td>
                          <td className="py-3.5 px-4 text-gray-600">{f.rubric[3]}</td>
                          <td className="py-3.5 px-4 text-gray-600">{f.rubric[4]}</td>
                          <td className="py-3.5 px-4 text-[#0D212C] font-medium">{f.rubric[5]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* AI SOLUTION SCORING TABLE WITH FULL FACTOR NAMES & SORTING */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-[1.125rem] font-medium text-[#0D212C] font-['Poppins']">
                  AI solution scoring
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-56 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setScoringPage(1);
                    }}
                    placeholder="Search solutions..."
                    className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-[0.8125rem] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors shadow-2xs"
                  />
                </div>

                {/* Filters Dropdown */}
                <div className="relative w-[116px]" ref={statusFilterRef}>
                  <button
                    type="button"
                    onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                    className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg pl-3 pr-2 py-1.5 text-[0.8125rem] text-gray-700 font-normal hover:bg-gray-50 focus:outline-none focus:border-gray-300 transition-colors cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-[12px]">
                      <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{statusFilter === 'All' ? 'Filters' : statusFilter}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${isStatusFilterOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isStatusFilterOpen && (
                    <div className="absolute top-full mt-1 right-0 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                      {(['All', 'Completed', 'In progress', 'Prioritised', 'New'] as const).map((st) => (
                        <button 
                          key={st}
                          type="button"
                          onClick={() => {
                            setStatusFilter(st);
                            setIsStatusFilterOpen(false);
                            setScoringPage(1);
                          }}
                          className={`w-full text-left px-4 py-1.5 text-[0.8125rem] flex items-center justify-between cursor-pointer transition-colors ${
                            statusFilter === st
                              ? 'bg-gray-100 text-gray-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{st === 'All' ? 'All statuses' : st}</span>
                          {statusFilter === st && <Check className="w-3.5 h-3.5 text-gray-700" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase select-none">
                      {/* Solution Column */}
                      <th className="py-3 px-6 font-normal min-w-[170px]">
                        SOLUTION
                      </th>
                      
                      {/* Status Column */}
                      <th className="py-3 px-4 font-normal text-center min-w-[100px]">
                        STATUS
                      </th>
                      
                      {/* F1 - F6 Factor Columns with 2-line clean header (sentence case) */}
                      {FACTORS.map((f) => (
                        <th 
                          key={f.id} 
                          onClick={() => handleToggleFactorSort(f.id)}
                          className="py-2.5 px-2.5 font-normal text-center cursor-pointer select-none group min-w-[85px] outline-none focus:outline-none"
                        >
                          <div className="inline-flex flex-col items-center justify-center hover:text-gray-800 transition-colors select-none">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-[#0D212C] text-[0.6875rem]">{f.code}</span>
                              <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
                            </div>
                            <span className="text-[0.625rem] text-gray-500 font-normal normal-case leading-tight mt-0.5 text-center whitespace-normal max-w-[90px]">
                              {f.name}
                            </span>
                          </div>
                        </th>
                      ))}

                      {/* Revenue Column */}
                      <th className="py-3 px-4 font-normal text-left min-w-[120px]">
                        REVENUE (3-YR)
                      </th>

                      {/* Score Column */}
                      <th className="py-3 px-6 font-normal text-right min-w-[85px]">
                        SCORE / 100
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[0.875rem]">
                    {paginatedSolutions.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-12 text-center text-gray-400 text-sm">
                          No solutions found matching the search or filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedSolutions.map((solution) => (
                        <tr key={solution.id} className="hover:bg-gray-50/70 transition-colors group">
                          {/* Solution Name */}
                          <td className="py-4 px-6 font-normal text-[0.8125rem] text-[#0D212C]">
                            {solution.name}
                          </td>

                          {/* Status Column */}
                          <td className="py-4 px-4 text-center">
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

                          {/* F1 - F6 Factor Cells with Round Progress Bar */}
                          {FACTORS.map((factor) => {
                            const score = solution.fScores[factor.id] || 3;
                            return (
                              <td key={factor.id} className="py-4 px-2.5 text-center">
                                {renderRoundProgress(score, factor, solution.id)}
                              </td>
                            );
                          })}

                          {/* Revenue Cell */}
                          <td className="py-4 px-4 text-left">
                            <div className="flex flex-col leading-tight">
                              <span className="font-normal text-[0.8125rem] text-[#0D212C]">
                                {solution.revenue3Yr}
                              </span>
                              <span className="text-[0.6875rem] text-gray-400 font-normal mt-0.5 whitespace-nowrap">
                                ${(solution.revenueNum / 3).toFixed(1)}M per year
                              </span>
                            </div>
                          </td>

                          {/* Score / 100 */}
                          <td className="py-4 px-6 text-right font-semibold text-[0.875rem] text-[#ED4D19]">
                            {solution.score}
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
                Showing {filteredSolutions.length === 0 ? 0 : (scoringPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(scoringPage * ITEMS_PER_PAGE, filteredSolutions.length)} of {filteredSolutions.length}
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setScoringPage((p) => Math.max(1, p - 1))}
                  disabled={scoringPage === 1}
                  className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalScoringPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setScoringPage(pageNum)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        scoringPage === pageNum
                          ? 'bg-[#ED4D19] text-white font-medium shadow-2xs'
                          : 'text-gray-500 font-normal hover:text-gray-900'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setScoringPage((p) => Math.min(totalScoringPages, p + 1))}
                  disabled={scoringPage === totalScoringPages}
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

      {/* TAB 2: WEIGHTAGE CONFIGURATION (Snapshot 4) */}
      {activeTab === 'weightage' && (
        <div className="space-y-6">
          {/* Header Title with exact Catalogue Solutions font styling */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <h2 className="text-[1.125rem] font-medium text-[#0D212C] font-['Poppins']">
                Weightage configuration
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-light">
                Adjust factor weightages to influence solution rankings in real time.
              </p>
            </div>

            {/* Header text without Edit buttons */}
          </div>

          {/* 2-Column Grid: Sliders on Left, Live Ranking on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Factor Weights Sliders (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/90 p-6 md:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-base font-semibold text-[#0D212C] font-['Poppins']">
                  Factor weights
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetWeights}
                    disabled={!isEditingWeightage}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent border-0 p-0 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                    <span>Reset to default</span>
                  </button>
                  
                  {/* Edit Controls moved here */}
                  {!isEditingWeightage ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTempWeights({ ...weights });
                        setIsEditingWeightage(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-[#ED4D19] hover:text-[#C93B0E] active:opacity-90 bg-transparent border-0 px-2 py-1 cursor-pointer transition-colors"
                    >
                      <Settings2 className="w-3.5 h-3.5 text-[#ED4D19]" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingWeightage(false)}
                        className="px-2.5 py-1 text-gray-600 hover:text-gray-900 bg-transparent border-0 text-[0.8125rem] font-medium cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWeights({ ...tempWeights });
                          setIsEditingWeightage(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#ED4D19] to-[#C93B0E] hover:opacity-95 text-white text-xs font-medium rounded-lg shadow-xs transition-opacity cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {FACTORS.map((factor) => {
                  const currentWeight = isEditingWeightage 
                    ? (tempWeights[factor.id] ?? weights[factor.id] ?? factor.defaultWeight)
                    : (weights[factor.id] ?? factor.defaultWeight);
                  return (
                    <div key={factor.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-normal text-gray-400">
                            {factor.code} {factor.name}
                          </div>
                        </div>

                        {/* Multiplier Value */}
                        <div className="text-sm font-semibold text-[#0D212C] font-mono">
                          {currentWeight}x
                        </div>
                      </div>

                      {/* Slider Input with Part B Orange Track and White/Orange Thumb */}
                      <div className="flex items-center gap-3 py-1">
                        <input
                          type="range"
                          min="0"
                          max="3"
                          step="1"
                          disabled={!isEditingWeightage}
                          value={currentWeight}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setTempWeights((prev) => ({ ...prev, [factor.id]: val }));
                          }}
                          className={`w-full h-1.5 rounded-full custom-slider-orange ${
                            isEditingWeightage ? 'cursor-pointer opacity-100' : 'pointer-events-none opacity-100'
                          }`}
                          style={{
                            background: `linear-gradient(to right, #ED4D19 ${(currentWeight / 3) * 100}%, #e5e7eb ${(currentWeight / 3) * 100}%)`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* How weighting works info callout */}
              <div className="pt-4 border-t border-gray-100 flex items-start gap-2.5 text-xs text-gray-500">
                <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold text-gray-700">How weighting works</div>
                  <p className="text-[0.75rem] leading-relaxed">
                    Each slider multiplies that solution factor's 1–5 score, so a higher weight gives the factor more pull on the final rank. All six factors point the same way — higher is better.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Ranking Card (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/90 p-6 md:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-base font-semibold text-[#0D212C] font-['Poppins']">
                  Live ranking
                </h3>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-medium">
                  Top 8 · recomputes live
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {rankedSolutions.map((sol, index) => (
                  <div 
                    key={sol.id} 
                    className="py-3 flex items-center justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="text-xs font-semibold text-gray-400 w-4 text-center">
                        {index + 1}
                      </span>
                      <div className="truncate">
                        <div className="text-xs font-medium text-[#0D212C] truncate">
                          {sol.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs font-normal text-[#ED4D19]">
                        {sol.revenue3Yr}
                      </span>
                      <span className="text-sm font-medium text-gray-700 w-6 text-right">
                        {sol.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDE DRAWER: THE SIX REVENUE FACTORS */}
      {isFactorsDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsFactorsDrawerOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md md:max-w-lg bg-white shadow-2xl border-l border-gray-100 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-[#ED4D19]">
                    <Info className="w-3.5 h-3.5 text-[#ED4D19]" />
                    <span>Scoring Framework</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#0D212C] font-['Poppins']">
                    The Six Revenue Factors
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFactorsDrawerOpen(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors border-0 cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body with Factor Cards */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <p className="text-xs text-gray-500 leading-relaxed font-normal">
                  Every catalogue solution is scored 1–5 on these six revenue-oriented factors to automatically assess attractiveness and revenue potential:
                </p>

                <div className="space-y-3 pt-1">
                  {FACTORS.map((f) => (
                    <div 
                      key={f.id} 
                      className="p-4 rounded-xl border border-gray-200/90 bg-white hover:border-gray-300 hover:shadow-2xs transition-all space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#ED4D19] font-bold text-xs flex items-center justify-center border border-orange-200/80 shrink-0">
                          {f.code}
                        </div>
                        <h4 className="text-xs font-semibold text-[#0D212C]">
                          {f.name}
                        </h4>
                      </div>
                      <p className="text-[0.75rem] text-gray-500 leading-relaxed font-normal pl-10">
                        {f.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsFactorsDrawerOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer border-0"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
