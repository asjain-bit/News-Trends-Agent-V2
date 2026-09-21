import React, { useState, useMemo } from 'react';
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
  ArrowUpDown
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
    defaultWeight: 2.0,
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
    defaultWeight: 2.5,
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
    defaultWeight: 1.5,
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
    defaultWeight: 1.5,
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
    defaultWeight: 2.0,
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
    defaultWeight: 2.0,
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

  // Weights state: F1 to F6 multipliers
  const [weights, setWeights] = useState<Record<string, number>>({
    F1: 2.0,
    F2: 2.5,
    F3: 1.5,
    F4: 1.5,
    F5: 2.0,
    F6: 2.0,
  });

  const [isLocked, setIsLocked] = useState(false);
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
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

  // Reset Weights
  const handleResetWeights = () => {
    setWeights({
      F1: 2.0,
      F2: 2.5,
      F3: 1.5,
      F4: 1.5,
      F5: 2.0,
      F6: 2.0,
    });
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
    return [...solutionsWithScores].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.revenueNum - a.revenueNum;
    });
  }, [solutionsWithScores]);

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
          <div className="space-y-1.5">
            <h2 className="text-[1.125rem] font-medium text-[#0D212C] font-['Poppins']">
              AI solution scoring
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed font-normal max-w-4xl">
              Every catalogue solution is scored 1–5 on six revenue-oriented factors — an automatic AI assessment — giving a 0–100 attractiveness score and a fair, conservative revenue estimate. The only human lever is the weightage.
            </p>
          </div>

          {/* THE SIX REVENUE FACTORS CARD (Snapshot 1) */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-6 md:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Info className="w-4 h-4 text-gray-400 shrink-0" />
              <span>THE SIX REVENUE FACTORS — WHAT F1 TO F6 MEAN</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
              {FACTORS.map((f) => (
                <div key={f.id} className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ED4D19] font-bold text-xs flex items-center justify-center border border-orange-200/80 shrink-0 shadow-2xs">
                    {f.code}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-[#0D212C]">
                      {f.name}
                    </h4>
                    <p className="text-[0.75rem] text-gray-500 leading-relaxed font-normal">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STANDARDIZED SCORING RUBRIC (Snapshot 5) */}
          <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setIsRubricOpen(!isRubricOpen)}
              className="w-full px-6 py-3.5 bg-gray-50/60 hover:bg-gray-50 flex items-center justify-between text-left transition-colors cursor-pointer border-0"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${isRubricOpen ? 'rotate-90' : ''}`} />
                <span className="text-xs font-semibold text-[#0D212C] font-['Poppins']">
                  Standardized scoring rubric — how each 1–5 score is decided (hover any score for its reason)
                </span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium">
                {isRubricOpen ? 'Collapse rubric' : 'Expand rubric'}
              </span>
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
                        <th className="py-3 px-4 font-normal min-w-[170px]">FACTOR</th>
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
                          <td className="py-3 px-4 font-semibold text-[#0D212C] whitespace-nowrap">
                            {f.code} · {f.name}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{f.rubric[1]}</td>
                          <td className="py-3 px-4 text-gray-600">{f.rubric[2]}</td>
                          <td className="py-3 px-4 text-gray-600">{f.rubric[3]}</td>
                          <td className="py-3 px-4 text-gray-600">{f.rubric[4]}</td>
                          <td className="py-3 px-4 text-[#0D212C] font-medium">{f.rubric[5]}</td>
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
                <div className="relative w-[116px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setScoringPage(1);
                    }}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-[38px] pr-[30px] py-1.5 text-[0.8125rem] text-gray-700 font-normal hover:bg-gray-50 focus:outline-none focus:border-gray-300 transition-colors cursor-pointer shadow-2xs"
                  >
                    <option value="All">Filters</option>
                    <option value="Completed">Completed</option>
                    <option value="In progress">In progress</option>
                    <option value="Prioritised">Prioritised</option>
                    <option value="New">New</option>
                  </select>
                  <Filter className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase">
                      <th className="py-3 px-6 font-normal min-w-[200px]">SOLUTION</th>
                      <th className="py-3 px-6 font-normal min-w-[120px]">STATUS</th>
                      {FACTORS.map((f) => (
                        <th 
                          key={f.id} 
                          onClick={() => handleToggleFactorSort(f.id)}
                          className="py-3 px-4 font-normal text-center cursor-pointer select-none group whitespace-nowrap"
                        >
                          <div className="inline-flex items-center gap-1.5 hover:text-gray-800 transition-colors">
                            <span>{f.fullName}</span>
                            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
                          </div>
                        </th>
                      ))}
                      <th className="py-3 px-6 font-normal text-right min-w-[100px]">
                        SCORE / 100
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-[0.875rem]">
                    {paginatedSolutions.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-gray-400 text-sm">
                          No solutions found matching the search or filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedSolutions.map((solution) => (
                        <tr key={solution.id} className="hover:bg-gray-50/70 transition-colors">
                          {/* Solution Name */}
                          <td className="py-4 px-6 font-normal text-[0.8125rem] text-[#0D212C]">
                            {solution.name}
                          </td>

                          {/* Separate Status Column */}
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

                          {/* F1 - F6 Factor Cells with Round Progress Bar */}
                          {FACTORS.map((factor) => {
                            const score = solution.fScores[factor.id] || 3;
                            return (
                              <td key={factor.id} className="py-4 px-4 text-center">
                                {renderRoundProgress(score, factor, solution.id)}
                              </td>
                            );
                          })}

                          {/* Computed Score / 100 with font weight reduced by 1 unit */}
                          <td className="py-4 px-6 text-right font-normal text-[0.875rem] text-gray-700">
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
                          ? 'bg-gray-100 text-gray-900 font-bold border border-gray-200'
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
              <p className="text-sm text-gray-600 leading-relaxed font-normal">
                Set how much each factor counts. Drag a slider and the ranking recomputes live. Set blind, then lock a version.
              </p>
            </div>

            {/* Lock Action Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsLocked(!isLocked)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-xs cursor-pointer ${
                  isLocked
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
                    : 'bg-gradient-to-r from-[#0D212C] to-[#1a3848] hover:opacity-95 text-white'
                }`}
              >
                {isLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-gray-600" />
                    <span>Unlock weightage</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-white/80" />
                    <span>Lock weightage</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2-Column Grid: Sliders on Left, Live Ranking on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Factor Weights Sliders (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/90 p-6 md:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h3 className="text-base font-semibold text-[#0D212C] font-['Poppins']">
                  Factor weights
                </h3>
                <button
                  type="button"
                  onClick={handleResetWeights}
                  disabled={isLocked}
                  className="text-xs font-medium text-[#ED4D19] hover:underline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent border-0 p-0 transition-opacity"
                >
                  Reset to v1
                </button>
              </div>

              <div className="space-y-5">
                {FACTORS.map((factor) => {
                  const currentWeight = weights[factor.id] ?? factor.defaultWeight;
                  return (
                    <div key={factor.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-[#0D212C]">
                            {factor.code}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {factor.name}
                          </div>
                        </div>

                        {/* Multiplier Value */}
                        <div className="text-sm font-bold text-[#0D212C] font-mono">
                          {currentWeight.toFixed(1)}x
                        </div>
                      </div>

                      {/* Slider Input with Part B Brand Orange Track */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0.5"
                          max="3.0"
                          step="0.1"
                          disabled={isLocked}
                          value={currentWeight}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setWeights((prev) => ({ ...prev, [factor.id]: val }));
                          }}
                          className={`w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ED4D19] transition-opacity ${
                            isLocked ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
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
    </div>
  );
}
