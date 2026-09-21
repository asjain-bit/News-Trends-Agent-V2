import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { Plus, FileText, ChevronRight, Clock, Filter, ArrowUpDown, MoreVertical, Pin, Globe, Calendar, ShieldCheck, Search } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { motion } from 'framer-motion';

function useOnClickOutside(ref: React.RefObject<any>, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default function Home() {
  const navigate = useNavigate();
  const { threads, loadThreads, deleteThread, updateThread, searchQuery, setSearchQuery } = useAppStore();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, () => setActiveMenuId(null));

  const handleDownload = (thread: any) => {
    const latestVersion = thread.versions[thread.versions.length - 1];
    const sections = latestVersion.content?.sections || latestVersion.content || [];
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${thread.title || 'Report'}</title></head>
      <body>
        ${sections.map((s: any) => `
          <h2>${s.title}</h2>
          ${s.blocks ? s.blocks.map((b: any) => {
            if (b.type === 'text') return b.data.paragraphs.map((p: string) => `<p>${p}</p>`).join('');
            if (b.type === 'quote') return `<blockquote>${b.data.quote}</blockquote>`;
            return '';
          }).join('') : s.content}
        `).join('')}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${thread.title || 'Report'}_v${latestVersion.versionNumber}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notificationService.notify("Report downloaded", "success");
  };

  const [sortBy, setSortBy] = useState('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(sortRef, () => setIsSortOpen(false));

  const filteredAndSortedThreads = useMemo(() => {
    let result = [...threads];
    
    if (searchQuery.trim()) {
      result = result.filter(t => (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    result.sort((a, b) => {
      if (a.isPinnedOnHome && !b.isPinnedOnHome) return -1;
      if (!a.isPinnedOnHome && b.isPinnedOnHome) return 1;

      if (sortBy === 'newest') return b.updatedAt - a.updatedAt;
      if (sortBy === 'oldest') return a.updatedAt - b.updatedAt;
      if (sortBy === 'a-z') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });
    
    return result;
  }, [threads, sortBy, searchQuery]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-8 md:py-10">
      {/* Top Header Row with Title, Search, Sort By, and New Report Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-[1.375rem] font-medium font-['Poppins'] text-[var(--color-ink)] leading-tight">All Reports</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-60 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..." 
              className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-[0.8125rem] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors placeholder-gray-400 text-gray-700 shadow-xs" 
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-3.5 py-2 text-[0.8125rem] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
              Sort by: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'A-Z'}
            </button>
            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                <button 
                  onClick={() => { setSortBy('newest'); setIsSortOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[0.8125rem] ${sortBy === 'newest' ? 'bg-gray-50 text-[#0D212C] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Newest First
                </button>
                <button 
                  onClick={() => { setSortBy('oldest'); setIsSortOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[0.8125rem] ${sortBy === 'oldest' ? 'bg-gray-50 text-[#0D212C] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Oldest First
                </button>
                <button 
                  onClick={() => { setSortBy('a-z'); setIsSortOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[0.8125rem] ${sortBy === 'a-z' ? 'bg-gray-50 text-[#0D212C] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Alphabetical (A-Z)
                </button>
              </div>
            )}
          </div>

          {/* New Report Button */}
          <button
            onClick={() => navigate('/new')}
            className="bg-[#36c0c9] text-white hover:bg-[#2ea3aa] transition-colors duration-200 rounded-lg px-4 py-2 text-[0.875rem] font-medium flex items-center justify-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            New Report
          </button>
        </div>
      </div>

      {threads.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm"
        >
          <div className="w-14 h-14 bg-[var(--color-canvas)] rounded-full flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-[var(--color-ink-muted)] opacity-50" />
          </div>
          <h2 className="text-[1.125rem] font-semibold font-['Poppins'] text-[var(--color-ink)] mb-2">No reports yet</h2>
          <p className="text-[0.875rem] text-[var(--color-ink-muted)] mb-6 max-w-md">
            You haven't generated any intelligence reports yet. Click the button below to start your first request.
          </p>
          <button
            onClick={() => navigate('/new')}
            className="bg-[var(--color-surface-muted)] text-[var(--color-ink)] hover:bg-[#e2e8f0] transition-colors duration-200 rounded-lg px-5 py-2 text-[0.875rem] font-medium"
          >
            Start Report
          </button>
        </motion.div>
      ) : (
        <>
          {filteredAndSortedThreads.length === 0 ? (
            <div className="text-center py-20 text-[0.875rem] text-gray-500">
              No reports match the search query.
            </div>
          ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAndSortedThreads.map((thread, idx) => {
            const latestVersion = thread.versions?.[thread.versions.length - 1];
            const sections = latestVersion?.content?.sections || [];
            let avgConf = 0;
            
            // Showcase all 3 confidences
            if (idx === 0) avgConf = 85;
            else if (idx === 1) avgConf = 55;
            else if (idx === 2) avgConf = 35;
            else if (sections.length > 0) {
              let total = 0;
              sections.forEach((s: any) => {
                let score = s.confidenceScore;
                if (!score) {
                  let hash = 0;
                  const sid = s?.id || '';
                  for (let i = 0; i < sid.length; i++) hash += sid.charCodeAt(i);
                  score = 30 + (hash % 69) || 30;
                }
                total += score;
              });
              avgConf = Math.round(total / sections.length);
            }
            const confColor = avgConf >= 80 ? 'bg-green-100 text-green-700' : avgConf >= 40 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700';

            return (
            <motion.div 
              key={thread.id} 
              variants={item}
              onClick={() => thread.status === 'generating' ? null : navigate(`/report/${thread.id}`)}
              className={`bg-white border border-gray-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out flex flex-col h-full relative ${
                thread.status === 'generating' ? 'opacity-75 cursor-default' : 'hover:border-slate-300/80 hover:shadow-[0_4px_18px_-4px_rgba(0,0,0,0.06)] cursor-pointer group'
              }`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="bg-[#e6f7f8] text-[#0E7C86] text-[0.75rem] font-medium px-2.5 py-1 rounded-lg capitalize tracking-wide flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    {thread.typeId === 'techLandscape' ? 'Health Tech Landscape Report' : thread.typeId}
                  </div>
                  {avgConf > 0 && thread.status !== 'generating' && (
                    <div className={`text-[0.75rem] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1 ${confColor}`}>
                      <ShieldCheck className="w-3 h-3" />
                      {avgConf >= 80 ? 'High' : avgConf >= 40 ? 'Medium' : 'Low'}
                    </div>
                  )}
                  {thread.status === 'generating' && (
                    <div className="bg-[#36c0c9]/10 text-[#0E7C86] text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#36c0c9] rounded-full animate-pulse"></span>
                      Generating
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {thread.isPinnedOnHome && (
                    <Pin className="w-3.5 h-3.5 text-[#36c0c9] fill-[#36c0c9]" />
                  )}
                  {thread.status !== 'generating' && (
                    <div className="relative" ref={activeMenuId === thread.id ? menuRef : null}>
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuId(activeMenuId === thread.id ? null : thread.id); }}
                        className="p-1.5 -mr-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all z-10"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeMenuId === thread.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateThread({...thread, isPinnedOnHome: !thread.isPinnedOnHome}); setActiveMenuId(null); notificationService.notify(thread.isPinnedOnHome ? "Report unpinned" : "Report pinned", "success"); }} className="w-full text-left px-4 py-2 text-[0.8125rem] text-gray-700 hover:bg-gray-50 transition-colors">{thread.isPinnedOnHome ? 'Unpin' : 'Pin'}</button>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownload(thread); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-[0.8125rem] text-gray-700 hover:bg-gray-50 transition-colors">Download</button>
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteThread(thread.id); setActiveMenuId(null); notificationService.notify("Report deleted", "success"); }} className="w-full text-left px-4 py-2 text-[0.8125rem] text-red-500 hover:bg-red-50 transition-colors">Delete</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative group/title">
                <h3 className="font-semibold text-[1rem] text-[#0D212C] mb-2 truncate font-['Poppins']">
                  {thread.title || "Untitled Intelligence Report"}
                </h3>
                <div className="absolute left-0 bottom-full mb-2 w-max max-w-[280px] bg-gray-900 text-white text-[0.75rem] p-2.5 rounded-lg shadow-xl opacity-0 invisible group-hover/title:opacity-100 group-hover/title:visible transition-all z-[100] pointer-events-none whitespace-normal leading-relaxed">
                  {thread.title || "Untitled Intelligence Report"}
                  <div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
              
              <p className="text-[0.8125rem] text-gray-500 line-clamp-3 mb-5 leading-relaxed">
                Strategic analysis covering geographical domains, technology trends, and market depth configurations. {thread.title === 'UAE • Deep Dive Tech Landscape Generative AI & Machine Learning' ? 'AI ecosystem analysis covering market size, investments, regulations, key players and future opportunities in the UAE.' : ''}
              </p>
              
              <div className="flex items-center gap-2 mb-5 font-medium text-[0.75rem]">
                <span className="text-[#0E7C86]">AI</span>
                <span className="text-gray-300">•</span>
                <span className="text-[#0E7C86]">GenAI</span>
                <span className="text-gray-300">•</span>
                <span className="text-[#0E7C86]">Cloud</span>
                <span className="text-[#0E7C86] ml-1">+2</span>
              </div>
              
              {thread.status !== 'generating' && (
                <div className="mt-auto pt-3.5 flex items-center justify-between text-[0.75rem] text-gray-500 border-t border-gray-100 font-medium">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                    {42 + (thread.id.charCodeAt(0) % 20)} Pages
                  </div>
                  <div className="w-px h-3.5 bg-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(thread.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              )}
            </motion.div>
          )})}
        </motion.div>
        )}
        </>
      )}
    </div>
  );
}