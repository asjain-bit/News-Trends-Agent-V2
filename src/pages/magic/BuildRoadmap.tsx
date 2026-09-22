import React, { useState, useMemo, useRef } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Info, Check, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { useMagicStore } from '../../store/magicStore';

export default function BuildRoadmap() {
  const [activeTab, setActiveTab] = useState<'components' | 'impact'>('components');
  const [buildTop, setBuildTop] = useState('4');
  const [isBuildTopOpen, setIsBuildTopOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [componentPage, setComponentPage] = useState(1);

  const COMPONENT_ITEMS_PER_PAGE = 7;
  const buildTopRef = useRef<HTMLDivElement>(null);

  // Close custom dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buildTopRef.current && !buildTopRef.current.contains(event.target as Node)) {
        setIsBuildTopOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { components, solutions, reuseMatrix } = useMagicStore();

  // Active (non-deactivated) components sorted by reuseCount descending
  const sortedComponents = useMemo(() => {
    return [...components]
      .filter((c) => !c.isDeactivated)
      .sort((a, b) => {
        const countA = (reuseMatrix[a.id] || []).length || a.reuseCount || 0;
        const countB = (reuseMatrix[b.id] || []).length || b.reuseCount || 0;
        return countB - countA;
      });
  }, [components, reuseMatrix]);

  // Paginated components for Component Build tab (7 rows per page)
  const totalComponentPages = Math.ceil(sortedComponents.length / COMPONENT_ITEMS_PER_PAGE) || 1;
  const paginatedComponents = useMemo(() => {
    const start = (componentPage - 1) * COMPONENT_ITEMS_PER_PAGE;
    return sortedComponents.slice(start, start + COMPONENT_ITEMS_PER_PAGE);
  }, [sortedComponents, componentPage]);

  // Set of built component IDs based on buildTop (used exclusively for Build Impact calculations)
  const builtComponentIds = useMemo(() => {
    const limit = parseInt(buildTop, 10) || 4;
    return new Set(sortedComponents.slice(0, limit).map((c) => c.id));
  }, [sortedComponents, buildTop]);

  // Calculate unlock state for each solution in Build Impact tab
  const solutionImpactStatuses = useMemo(() => {
    return solutions
      .filter((s) => !s.isDeactivated)
      .map((sol) => {
        // Find which components map to this solution
        const mappedCompIds = Object.entries(reuseMatrix)
          .filter(([_, solIds]) => solIds.includes(sol.id))
          .map(([compId]) => compId);

        // Fallback to sol.compCount if matrix is empty
        const totalReq = mappedCompIds.length || sol.compCount || 1;
        const builtReq = mappedCompIds.filter((cid) => builtComponentIds.has(cid)).length;
        const isUnlocked = builtReq >= totalReq && totalReq > 0;
        const progressPercent = totalReq > 0 ? Math.min(100, Math.round((builtReq / totalReq) * 100)) : 0;

        const revNum = parseFloat(sol.revenue3Yr.replace(/[^0-9.]/g, '')) || 0;
        const annualRev = (revNum / 3).toFixed(1);

        return {
          ...sol,
          totalReq,
          builtReq,
          isUnlocked,
          progressPercent,
          revNum,
          annualRevCalculated: sol.annualRev || annualRev,
        };
      });
  }, [solutions, reuseMatrix, builtComponentIds]);

  // Summary Metrics for KPI Cards
  const unlockedSolutions = useMemo(() => {
    return solutionImpactStatuses.filter((s) => s.isUnlocked);
  }, [solutionImpactStatuses]);

  const inProgressSolutions = useMemo(() => {
    return solutionImpactStatuses.filter((s) => !s.isUnlocked);
  }, [solutionImpactStatuses]);

  const totalUnlockedRevenue = useMemo(() => {
    return unlockedSolutions.reduce((acc, curr) => acc + curr.revNum, 0);
  }, [unlockedSolutions]);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 md:py-8 space-y-6">
      
      {/* Top Underline Tabs (Matching Catalogue Design Exactly) */}
      <div className="inline-block border-b border-gray-200">
        <nav className="flex space-x-1 sm:space-x-2 -mb-[1px]">
          <button
            onClick={() => setActiveTab('components')}
            className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
              activeTab === 'components'
                ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Component build
          </button>
          <button
            onClick={() => setActiveTab('impact')}
            className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
              activeTab === 'impact'
                ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Build impact
          </button>
        </nav>
      </div>

      {/* Page Header - Clean title & build top custom dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[1.125rem] sm:text-[1.25rem] font-medium text-[#0D212C] font-['Poppins']">
            Build roadmap
          </h2>
        </div>

        {/* Custom Build Top Dropdown (Options 1 to 5) */}
        <div className="relative" ref={buildTopRef}>
          <button
            type="button"
            onClick={() => setIsBuildTopOpen(!isBuildTopOpen)}
            className="inline-flex items-center justify-between gap-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-3.5 py-1.5 text-[0.8125rem] text-gray-700 font-normal shadow-2xs transition-colors cursor-pointer"
          >
            <span className="text-gray-500">Build top:</span>
            <span className="font-semibold text-[#0D212C]">{buildTop}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isBuildTopOpen ? 'rotate-180' : ''}`} />
          </button>

          {isBuildTopOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 overflow-hidden">
              {['1', '2', '3', '4', '5'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setBuildTop(opt);
                    setIsBuildTopOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    buildTop === opt
                      ? 'bg-[#fef3eb] text-[#ED4D19] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>Top {opt}</span>
                  {buildTop === opt && <Check className="w-3.5 h-3.5 text-[#ED4D19]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3 KPI Cards Displayed Across Both Tabs with Icons & Reduced Font Weight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Solutions Unlocked */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
              SOLUTIONS UNLOCKED
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] flex items-baseline gap-1.5 font-['Poppins']">
              <span>{unlockedSolutions.length}</span>
              <span className="text-xs font-normal text-gray-400 font-sans">/ {solutionImpactStatuses.length} total</span>
            </div>
            <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
              Fully assembled & commercialized
            </p>
          </div>
        </div>

        {/* Card 2: 3-Yr Revenue Unlocked */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
              3-YR REVENUE UNLOCKED
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ED4D19] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#ED4D19] font-['Poppins']">
              ${totalUnlockedRevenue}M
            </div>
            <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
              Cumulative addressable ARR from unlocked solutions
            </p>
          </div>
        </div>

        {/* Card 3: Solutions In Progress */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
              IN PROGRESS
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] flex items-baseline gap-1.5 font-['Poppins']">
              <span>{inProgressSolutions.length}</span>
              <span className="text-xs font-normal text-gray-400 font-sans">solutions</span>
            </div>
            <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
              Building shared component foundations
            </p>
          </div>
        </div>
      </div>

      {/* TAB 1: COMPONENT BUILD */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          {/* Components Table without numbers column, with pagination */}
          <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase">
                    <th className="py-3 px-6 font-normal">COMPONENT</th>
                    <th className="py-3 px-6 font-normal">CATEGORY</th>
                    
                    {/* Complexity with Info Tooltip */}
                    <th className="py-3 px-6 font-normal text-center">
                      <div className="inline-flex items-center justify-center gap-1 relative">
                        <span>COMPLEXITY</span>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('complexity')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-gray-600 cursor-help border-0 bg-transparent p-0"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        {activeTooltip === 'complexity' && (
                          <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0D212C] text-white text-[0.75rem] font-normal rounded-lg shadow-xl z-50 text-center whitespace-nowrap normal-case">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0D212C]" />
                            Complexity based on architectural & technical scope
                          </div>
                        )}
                      </div>
                    </th>

                    {/* Effort with Info Tooltip */}
                    <th className="py-3 px-6 font-normal text-center">
                      <div className="inline-flex items-center justify-center gap-1 relative">
                        <span>EFFORT · 1 FTE</span>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('effort')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-gray-600 cursor-help border-0 bg-transparent p-0"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        {activeTooltip === 'effort' && (
                          <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0D212C] text-white text-[0.75rem] font-normal rounded-lg shadow-xl z-50 text-center whitespace-nowrap normal-case">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0D212C]" />
                            Effort in person-days (1 FTE) · complexity by scope
                          </div>
                        )}
                      </div>
                    </th>

                    {/* Reuse with Info Tooltip */}
                    <th className="py-3 px-6 font-normal text-center">
                      <div className="inline-flex items-center justify-center gap-1 relative">
                        <span>REUSE</span>
                        <button
                          type="button"
                          onMouseEnter={() => setActiveTooltip('reuse')}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-gray-600 cursor-help border-0 bg-transparent p-0"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        {activeTooltip === 'reuse' && (
                          <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0D212C] text-white text-[0.75rem] font-normal rounded-lg shadow-xl z-50 text-center whitespace-nowrap normal-case">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0D212C]" />
                            Build order = most-reused first (shared foundations unlocking multiple solutions)
                          </div>
                        )}
                      </div>
                    </th>

                    <th className="py-3 px-6 font-normal text-center">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[0.875rem]">
                  {paginatedComponents.map((comp) => {
                    const actualReuse = (reuseMatrix[comp.id] || []).length || comp.reuseCount || 0;
                    const compComplexity = comp.complexity || (actualReuse >= 6 ? 'High' : actualReuse >= 4 ? 'Medium' : 'Low');
                    const compEffort = comp.effort || (actualReuse >= 6 ? '~50 pd' : actualReuse >= 4 ? '~20 pd' : '~12 pd');

                    return (
                      <tr key={comp.id} className="hover:bg-gray-50/70 transition-colors">
                        {/* Name & Subtitle */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-normal text-[#0D212C] text-[0.8125rem]">
                              {comp.name}
                            </span>
                            <span className="text-[0.75rem] text-gray-400 font-normal mt-0.5">
                              {comp.subtitle}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6 text-[0.8125rem] font-normal text-gray-700">
                          {comp.category}
                        </td>

                        {/* Complexity in Title Case */}
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[0.75rem] font-normal ${
                            compComplexity === 'Low' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : compComplexity === 'Medium'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {compComplexity}
                          </span>
                        </td>

                        {/* Effort - same font styling as component name */}
                        <td className="py-4 px-6 text-center font-normal text-[#0D212C] text-[0.8125rem]">
                          {compEffort}
                        </td>

                        {/* Reuse - exact same text color and styling */}
                        <td className="py-4 px-6 text-center">
                          <span className="font-normal text-[#0D212C] text-[0.8125rem]">
                            {actualReuse} solutions
                          </span>
                        </td>

                        {/* Status in Title Case */}
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[0.75rem] font-normal ${
                            comp.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : comp.status === 'In progress'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : comp.status === 'Prioritised'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {comp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls - Outside the table */}
          {totalComponentPages > 1 && (
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-1">
              <span className="font-normal">
                Showing {Math.min((componentPage - 1) * COMPONENT_ITEMS_PER_PAGE + 1, sortedComponents.length)}–{Math.min(componentPage * COMPONENT_ITEMS_PER_PAGE, sortedComponents.length)} of {sortedComponents.length} components
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setComponentPage((p) => Math.max(1, p - 1))}
                  disabled={componentPage === 1}
                  className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalComponentPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setComponentPage(pageNum)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                        componentPage === pageNum
                          ? 'bg-[#ED4D19] text-white font-medium shadow-2xs'
                          : 'text-gray-500 font-normal hover:text-gray-900'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setComponentPage((p) => Math.min(totalComponentPages, p + 1))}
                  disabled={componentPage === totalComponentPages}
                  className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BUILD IMPACT */}
      {activeTab === 'impact' && (
        <div className="space-y-4">
          {/* Solutions Progress Section */}
          <div className="space-y-3.5">
            <h3 className="text-[0.9375rem] font-semibold text-[#0D212C] font-['Poppins']">
              Solutions Progress
            </h3>

            {/* Grid of Solution Cards (3 columns on desktop) with Subtle Light Orange Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {solutionImpactStatuses.map((sol) => (
                <div
                  key={sol.id}
                  className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3.5 hover:border-gray-300 transition-all"
                >
                  {/* Top Row: Solution Name + Title Case Tag */}
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-[0.9375rem] font-semibold text-[#0D212C] font-['Poppins'] leading-snug">
                      {sol.name}
                    </h4>

                    {sol.isUnlocked ? (
                      <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Unlocked
                      </span>
                    ) : (
                      <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        In progress
                      </span>
                    )}
                  </div>

                  {/* Middle: Crisp Vibrant Orange Progress Bar + Percentage on the Right */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden flex-1">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF6B38] to-[#ED4D19] transition-all duration-300"
                          style={{ width: `${sol.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-[0.75rem] font-medium text-gray-600 min-w-[32px] text-right font-mono">
                        {sol.progressPercent}%
                      </span>
                    </div>

                    {/* Bottom: Clean Description without Status Duplication */}
                    {sol.isUnlocked ? (
                      <div className="text-xs text-gray-600 font-normal">
                        <span className="font-semibold text-[#ED4D19]">{sol.revenue3Yr}</span> unlocked · ~${sol.annualRevCalculated}M/yr
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 font-normal">
                        {sol.builtReq} of {sol.totalReq} components built
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
