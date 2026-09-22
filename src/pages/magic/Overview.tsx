import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  BarChart2, 
  Map, 
  Globe, 
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Search,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useMagicStore } from '../../store/magicStore';

export default function Overview() {
  const { solutions } = useMagicStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'effort' | 'revenue' | 'score' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 5;

  // Navigation Button items
  const navButtons = [
    {
      id: 'catalogue',
      title: 'Catalogue',
      path: '/catalogue',
      icon: Layers,
    },
    {
      id: 'scoring',
      title: 'Solution scoring',
      path: '/ai-scoring',
      icon: BarChart2,
    },
    {
      id: 'roadmap',
      title: 'Build roadmap',
      path: '/build-roadmap',
      icon: Map,
    },
    {
      id: 'gtm',
      title: 'GTM Insights',
      path: '/gtm-insights',
      icon: Globe,
    }
  ];

  // Ranked priority list matching catalogue & build roadmap data
  const rawPriorityList = useMemo(() => [
    { id: 's5', rank: 1, name: 'InsurTech & Reimbursement', effort: '~77 pd', revenue: '$21M', status: 'In progress', score: 80 },
    { id: 's4', rank: 2, name: 'Remote Patient Monitoring', effort: '~77 pd', revenue: '$25M', status: 'Prioritised', score: 78 },
    { id: 's2', rank: 3, name: 'Hospital Ops & Clinical Workflow', effort: '~167 pd', revenue: '$27M', status: 'In progress', score: 75 },
    { id: 's8', rank: 4, name: 'Population Health & Analytics', effort: '~78 pd', revenue: '$25M', status: 'New', score: 73 },
    { id: 's6', rank: 5, name: 'Drug Discovery', effort: '~50 pd', revenue: '$19M', status: 'New', score: 69 },
    { id: 's1', rank: 6, name: 'EMR & Interoperability', effort: '~112 pd', revenue: '$24M', status: 'Completed', score: 66 },
    { id: 's7', rank: 7, name: 'Pharmacy & Medication', effort: '~44 pd', revenue: '$11M', status: 'Prioritised', score: 59 },
    { id: 's3', rank: 8, name: 'Home & Community Care', effort: '~85 pd', revenue: '$17M', status: 'New', score: 58 },
  ], []);

  const handleSort = (field: 'effort' | 'revenue' | 'score') => {
    if (sortField === field) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else {
        setSortField(null);
        setSortDirection('desc');
      }
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Filtered and Sorted list
  const filteredList = useMemo(() => {
    const list = rawPriorityList.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.revenue.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!sortField) return list;

    return [...list].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === 'effort') {
        valA = parseFloat(a.effort.replace(/[^0-9.]/g, '')) || 0;
        valB = parseFloat(b.effort.replace(/[^0-9.]/g, '')) || 0;
      } else if (sortField === 'revenue') {
        valA = parseFloat(a.revenue.replace(/[^0-9.]/g, '')) || 0;
        valB = parseFloat(b.revenue.replace(/[^0-9.]/g, '')) || 0;
      } else if (sortField === 'score') {
        valA = a.score;
        valB = b.score;
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [rawPriorityList, searchQuery, sortField, sortDirection]);

  // Paginated List
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-6 md:py-8 space-y-6">
      
      {/* 1. Top Navigation Action Buttons (Button Style, Minimal Space) */}
      <div className="flex flex-wrap items-center gap-3">
        {navButtons.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200/90 hover:border-gray-300 hover:bg-gray-50/80 rounded-xl shadow-2xs text-xs sm:text-sm font-medium text-gray-800 transition-all cursor-pointer group"
            >
              <Icon className="w-4 h-4 text-[#ED4D19]" />
              <span>{item.title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#ED4D19] group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>

      {/* 2. KPI Cards (Identical to Build Roadmap Page Styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Expected Revenue Opportunity */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
              EXPECTED REVENUE OPPORTUNITY
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ED4D19] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#ED4D19] font-['Poppins']">
              $170M
            </div>
            <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
              over 3 yrs (~$57M/yr) · 8 solutions · illustrative
            </p>
          </div>
        </div>

        {/* Card 2: Solutions Scored */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
              SOLUTIONS SCORED
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] flex items-baseline gap-1.5 font-['Poppins']">
              <span>8</span>
              <span className="text-xs font-normal text-gray-400 font-sans">solutions</span>
            </div>
            <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
              4 in build or planned
            </p>
          </div>
        </div>

        {/* Card 3: Market-Ready */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wider">
              MARKET-READY
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#0D212C] flex items-baseline gap-1.5 font-['Poppins']">
              <span>1</span>
              <span className="text-xs font-normal text-gray-400 font-sans">solution</span>
            </div>
            <p className="text-[0.75rem] text-gray-500 mt-1 font-normal">
              Completed & sellable now
            </p>
          </div>
        </div>
      </div>

      {/* 3. Section Title, Tag & Search Bar on the Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-[#0D212C] font-['Poppins']">
            Current build priority
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[#ED4D19] text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Solutions · ranked live</span>
          </div>
        </div>

        {/* Search Bar on the right side of the title */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search solutions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs placeholder:text-gray-400 focus:outline-none focus:border-gray-400 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Current Build Priority Table */}
      <div className="space-y-3">
        <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs overflow-hidden">
          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase select-none">
                  <th className="py-3 px-6 font-normal">SOLUTION</th>
                  <th className="py-3 px-6 font-normal">STATUS</th>
                  
                  {/* BUILD EFFORT with Sort */}
                  <th className="py-3 px-6 font-normal">
                    <button
                      type="button"
                      onClick={() => handleSort('effort')}
                      className="inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors uppercase tracking-wider font-normal cursor-pointer bg-transparent border-0 p-0"
                    >
                      <span>BUILD EFFORT</span>
                      {sortField === 'effort' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#ED4D19]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#ED4D19]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                      )}
                    </button>
                  </th>

                  {/* 3-YR REVENUE with Sort */}
                  <th className="py-3 px-6 font-normal">
                    <button
                      type="button"
                      onClick={() => handleSort('revenue')}
                      className="inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors uppercase tracking-wider font-normal cursor-pointer bg-transparent border-0 p-0"
                    >
                      <span>3-YR REVENUE</span>
                      {sortField === 'revenue' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#ED4D19]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#ED4D19]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                      )}
                    </button>
                  </th>

                  {/* AI SCORE with Sort */}
                  <th className="py-3 px-6 font-normal text-right">
                    <button
                      type="button"
                      onClick={() => handleSort('score')}
                      className="inline-flex items-center justify-end gap-1.5 hover:text-gray-900 transition-colors uppercase tracking-wider font-normal cursor-pointer bg-transparent border-0 p-0 ml-auto"
                    >
                      <span>AI SCORE</span>
                      {sortField === 'score' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#ED4D19]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#ED4D19]" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-60" />
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[0.875rem]">
                {paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-gray-400">
                      No solutions found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((sol) => (
                    <tr key={sol.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-normal text-[0.8125rem] text-[#0D212C]">
                        {sol.name}
                      </td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-[0.75rem] font-medium capitalize ${
                            sol.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sol.status === 'In progress'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : sol.status === 'Prioritised'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {sol.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-gray-500 font-normal">
                        {sol.effort}
                      </td>
                      <td className="py-3.5 px-6 text-xs sm:text-[0.8125rem] font-normal text-[#0D212C] font-mono">
                        {sol.revenue}
                      </td>
                      <td className="py-3.5 px-6 text-right font-semibold text-xs sm:text-sm text-[#ED4D19] font-mono">
                        {sol.score}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls - Outside the table */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-1">
          <div>
            Showing {filteredList.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredList.length)} of {filteredList.length}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-[#ED4D19] text-white font-medium shadow-2xs'
                      : 'text-gray-500 font-normal hover:text-gray-900'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-gray-500 hover:text-gray-900 bg-transparent disabled:opacity-30 transition-colors cursor-pointer"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
