import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { v4 as uuidv4 } from 'uuid';
import { ChevronLeft, Check, Upload, Clock, ChevronDown, Search, X, FileText, LayoutList, Paperclip, ShieldCheck, Globe, Tag, Layers, FileSearch, Target, MapPin, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom hook for clicking outside dropdowns
function useOnClickOutside(ref: React.RefObject<any>, handler: (event: MouseEvent | TouchEvent) => void) {
  React.useEffect(() => {
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

interface CountryOption {
  name: string;
  flag: string;
  peers: string[];
}

const ALL_COUNTRIES: CountryOption[] = [
  { name: 'Australia', flag: '🇦🇺', peers: ['United Kingdom', 'USA (United States)', 'Canada', 'Singapore'] },
  { name: 'Bahrain', flag: '🇧🇭', peers: ['UAE (United Arab Emirates)', 'KSA (Saudi Arabia)', 'Qatar', 'Kuwait', 'Oman'] },
  { name: 'Brazil', flag: '🇧🇷', peers: ['USA (United States)', 'India', 'China', 'Germany'] },
  { name: 'Canada', flag: '🇨🇦', peers: ['USA (United States)', 'United Kingdom', 'Australia', 'Germany'] },
  { name: 'China', flag: '🇨🇳', peers: ['USA (United States)', 'India', 'Japan', 'South Korea', 'Singapore'] },
  { name: 'Egypt', flag: '🇪🇬', peers: ['UAE (United Arab Emirates)', 'KSA (Saudi Arabia)', 'Qatar', 'Kuwait'] },
  { name: 'France', flag: '🇫🇷', peers: ['Germany', 'United Kingdom', 'Switzerland', 'USA (United States)'] },
  { name: 'Germany', flag: '🇩🇪', peers: ['France', 'United Kingdom', 'Switzerland', 'USA (United States)'] },
  { name: 'India', flag: '🇮🇳', peers: ['USA (United States)', 'China', 'UAE (United Arab Emirates)', 'Singapore', 'United Kingdom'] },
  { name: 'Indonesia', flag: '🇮🇩', peers: ['Singapore', 'Malaysia', 'India', 'Vietnam'] },
  { name: 'Japan', flag: '🇯🇵', peers: ['South Korea', 'USA (United States)', 'China', 'Germany', 'Singapore'] },
  { name: 'KSA (Saudi Arabia)', flag: '🇸🇦', peers: ['UAE (United Arab Emirates)', 'Qatar', 'Bahrain', 'Kuwait', 'Egypt'] },
  { name: 'Kuwait', flag: '🇰🇼', peers: ['UAE (United Arab Emirates)', 'KSA (Saudi Arabia)', 'Qatar', 'Bahrain', 'Oman'] },
  { name: 'Malaysia', flag: '🇲🇾', peers: ['Singapore', 'Indonesia', 'Vietnam', 'India'] },
  { name: 'Netherlands', flag: '🇳🇱', peers: ['Germany', 'United Kingdom', 'France', 'Switzerland'] },
  { name: 'Oman', flag: '🇴🇲', peers: ['UAE (United Arab Emirates)', 'KSA (Saudi Arabia)', 'Qatar', 'Bahrain', 'Kuwait'] },
  { name: 'Qatar', flag: '🇶🇦', peers: ['UAE (United Arab Emirates)', 'KSA (Saudi Arabia)', 'Bahrain', 'Kuwait', 'Oman'] },
  { name: 'Singapore', flag: '🇸🇬', peers: ['UAE (United Arab Emirates)', 'United Kingdom', 'USA (United States)', 'Japan', 'South Korea'] },
  { name: 'South Korea', flag: '🇰🇷', peers: ['Japan', 'USA (United States)', 'China', 'Germany', 'Singapore'] },
  { name: 'Switzerland', flag: '🇨🇭', peers: ['Germany', 'France', 'United Kingdom', 'USA (United States)'] },
  { name: 'UAE (United Arab Emirates)', flag: '🇦🇪', peers: ['KSA (Saudi Arabia)', 'Qatar', 'Singapore', 'Bahrain', 'United Kingdom'] },
  { name: 'United Kingdom', flag: '🇬🇧', peers: ['USA (United States)', 'Germany', 'France', 'UAE (United Arab Emirates)', 'Singapore'] },
  { name: 'USA (United States)', flag: '🇺🇸', peers: ['United Kingdom', 'China', 'Germany', 'India', 'Japan', 'UAE (United Arab Emirates)'] },
  { name: 'Vietnam', flag: '🇻🇳', peers: ['Indonesia', 'Malaysia', 'Singapore', 'India'] },
];

export default function BuildRequest() {
  const navigate = useNavigate();
  const { addThread, generateReportInBackground } = useAppStore();
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const [inputs, setInputs] = useState({
    reportType: 'Health Tech Landscape Report',
    geography: [] as string[],
    domains: [] as string[],
    depth: 'Deep Dive',
    focusLens: [] as string[],
    additionalInstructions: '',
    files: [] as File[]
  });

  const [openDropdown, setOpenDropdown] = useState<'geography' | 'domain' | 'focus' | null>(null);
  const [geoSearch, setGeoSearch] = useState('');
  const [domainSearch, setDomainSearch] = useState('');
  const [customFocus, setCustomFocus] = useState('');
  const [showPeerSuggestions, setShowPeerSuggestions] = useState(false);
  
  // Right Pane state
  const [isReviewPaneOpen, setIsReviewPaneOpen] = useState(true);

  const allDomainOptions = [
    'Artificial Intelligence', 'Generative AI', 'Machine Learning', 'Cloud Computing', 
    'Cybersecurity', 'Data Analytics', 'Digital Banking', 'FinTech', 'HealthTech', 
    'Blockchain', 'IoT', 'Robotics', 'Semiconductors', 'Telecommunications', 'Smart Cities', 'Others'
  ];

  const focusOptions = [
    'Market Overview', 'Competitive Landscape', 'Key Players', 'Funding & Investments', 
    'Government Initiatives', 'Technology Trends', 'Regulations', 'Innovation', 
    'Partnerships', 'Opportunities', 'Risks', 'Startups'
  ];

  const filteredGeoOptions = useMemo(() => {
    return ALL_COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(geoSearch.toLowerCase())
    );
  }, [geoSearch]);

  const filteredDomainOptions = useMemo(() => {
    return allDomainOptions.filter(d => 
      d.toLowerCase().includes(domainSearch.toLowerCase())
    );
  }, [domainSearch]);

  // Compute peer suggestions for currently selected countries
  const peerSuggestions = useMemo(() => {
    if (inputs.geography.length === 0) return [];
    
    const suggested = new Set<string>();
    inputs.geography.forEach(selectedName => {
      const countryObj = ALL_COUNTRIES.find(c => c.name === selectedName);
      if (countryObj) {
        countryObj.peers.forEach(p => {
          if (!inputs.geography.includes(p)) {
            suggested.add(p);
          }
        });
      }
    });

    return Array.from(suggested).slice(0, 4); // Show top 4 relevant peers
  }, [inputs.geography]);

  const handleGeoToggle = (countryName: string) => {
    setInputs(prev => {
      if (prev.geography.includes(countryName)) {
        return { ...prev, geography: prev.geography.filter(c => c !== countryName) };
      }
      if (prev.geography.length >= 5) {
        return prev; // Max 5 limit
      }
      return { ...prev, geography: [...prev.geography, countryName] };
    });
  };

  const handleDomainToggle = (domain: string) => {
    setInputs(prev => {
      if (prev.domains.includes(domain)) {
        return { ...prev, domains: prev.domains.filter(d => d !== domain) };
      }
      return { ...prev, domains: [...prev.domains, domain] };
    });
  };

  const handleFocusToggle = (focus: string) => {
    setInputs(prev => {
      if (prev.focusLens.includes(focus)) {
        return { ...prev, focusLens: prev.focusLens.filter(f => f !== focus) };
      }
      return { ...prev, focusLens: [...prev.focusLens, focus] };
    });
  };

  const handleCustomFocusAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customFocus.trim() !== '') {
      e.preventDefault();
      const val = customFocus.trim();
      if (!inputs.focusLens.includes(val)) {
        setInputs(prev => ({ ...prev, focusLens: [...prev.focusLens, val] }));
      }
      setCustomFocus('');
    }
  };

  const handleCustomDomainAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && domainSearch.trim() !== '') {
      e.preventDefault();
      const val = domainSearch.trim();
      if (!inputs.domains.includes(val)) {
        setInputs(prev => ({ ...prev, domains: [...prev.domains, val] }));
      }
      setDomainSearch('');
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(dropdownRef, () => setOpenDropdown(null));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setInputs(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles].slice(0, 5) // max 5 files
      }));
    }
  };

  const removeFile = (index: number) => {
    setInputs(prev => {
      const newFiles = [...prev.files];
      newFiles.splice(index, 1);
      return { ...prev, files: newFiles };
    });
  };

  // Derived state
  const isFormValid = inputs.geography.length > 0 && inputs.domains.length > 0 && inputs.depth.trim().length > 0;
  
  // Show empty state if nothing primary is filled out yet
  const showEmptyState = inputs.geography.length === 0 && inputs.domains.length === 0;

  const getRuntime = () => {
    if (inputs.depth === 'Quick Overview') return '10 – 15 minutes';
    if (inputs.depth === 'Standard Analysis') return '20 – 30 minutes';
    if (inputs.depth === 'Deep Dive') return '30 – 45 minutes';
    return '30 – 45 minutes'; // default fallback
  };

  const handleBack = () => {
    const hasChanges = inputs.geography.length > 0 || inputs.domains.length > 0 || inputs.depth !== 'Deep Dive' || inputs.focusLens.length > 0 || inputs.additionalInstructions || inputs.files.length > 0;
    if (hasChanges) {
      setShowCancelModal(true);
    } else {
      navigate('/new');
    }
  };

  const handleConfirmAndGenerate = async () => {
    if (!isFormValid) return;

    // Create the thread and save it
    const threadId = uuidv4();
    const geoString = inputs.geography.join(', ');
    const newThread = {
      id: threadId,
      title: `${inputs.depth} ${inputs.reportType}: ${geoString} - ${inputs.domains.join(', ')}`,
      typeId: 'techLandscape',
      inputs: {
        country: geoString,
        techDomain: inputs.domains.join(', '),
        depth: inputs.depth,
        focusLens: inputs.focusLens.join(', '),
        prompt: inputs.additionalInstructions
      },
      versions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'generating' as const
    };
    
    await addThread(newThread);
    generateReportInBackground(threadId, inputs.depth);
    navigate(`/report/${threadId}/generating`);
  };

  // Format the domain string for the summary card
  const formatDomainsForSummary = () => {
    if (inputs.domains.length === 0) return <span className="font-medium text-slate-800">select domains</span>;
    
    return inputs.domains.map((d, index) => {
      const isLast = index === inputs.domains.length - 1;
      const isSecondToLast = index === inputs.domains.length - 2;
      return (
        <React.Fragment key={d}>
          <span className="font-medium text-slate-800">{d}</span>
          {!isLast && isSecondToLast ? ' and ' : !isLast ? ', ' : ''}
        </React.Fragment>
      );
    });
  };

  const formatGeographyForSummary = () => {
    if (inputs.geography.length === 0) return <span className="font-medium text-slate-800">select a country</span>;

    return inputs.geography.map((g, index) => {
      const isLast = index === inputs.geography.length - 1;
      const isSecondToLast = index === inputs.geography.length - 2;
      return (
        <React.Fragment key={g}>
          <span className="font-medium text-slate-800">{g}</span>
          {!isLast && isSecondToLast ? ' and ' : !isLast ? ', ' : ''}
        </React.Fragment>
      );
    });
  };

  const formatFocusForSummary = () => {
    if (inputs.focusLens.length === 0) return null;
    
    return inputs.focusLens.map((f, index) => {
      const isLast = index === inputs.focusLens.length - 1;
      const isSecondToLast = index === inputs.focusLens.length - 2;
      return (
        <React.Fragment key={f}>
          <span className="font-medium text-slate-800">{f}</span>
          {!isLast && isSecondToLast ? ' and ' : !isLast ? ', ' : ''}
        </React.Fragment>
      );
    });
  };

  const getCountryFlag = (name: string) => {
    const found = ALL_COUNTRIES.find(c => c.name === name);
    return found ? found.flag : '🌎';
  };

  return (
    <div className={`h-full flex flex-col bg-transparent font-sans relative transition-all duration-300 ${isReviewPaneOpen ? 'pr-[420px]' : ''}`}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          margin-block: 16px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E2E8F0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #CBD5E1;
        }
      `}</style>

      {/* Expand Pane Button (visible when pane is closed) */}
      {!isReviewPaneOpen && (
        <button 
          onClick={() => setIsReviewPaneOpen(true)} 
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 border-r-0 rounded-l-xl p-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.1)] z-50 text-gray-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Main Form Left Pane */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="w-full px-6 lg:px-10 py-8">
          
          {/* Back Link */}
          <button 
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[#36c0c9] font-medium text-[0.8125rem] mb-8 hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Back to New Report
          </button>

          {/* Flat Form Sections */}
          <div className="space-y-8 w-full">
            
            {/* Technology (Fixed to Tech Landscape, disabled dropdown icon, soft dark grey color) */}
            <div>
              <label className="flex items-center text-[0.875rem] font-medium text-slate-700 mb-2">
                <span>Technology</span>
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="w-full bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-xs cursor-not-allowed">
                <span className="text-[0.875rem] font-normal text-slate-700">Health Tech Landscape Report</span>
                <ChevronDown className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-[0.75rem] text-gray-400 font-normal mt-1.5">
                Select the category of the report you want to generate.
              </p>
            </div>

            {/* Geography (Multi-select, Alphabetical, Search/Suggestions, Peer Suggestion Chip, Max 5 limit) */}
            <div className="relative" ref={openDropdown === 'geography' ? dropdownRef : null}>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center text-[0.875rem] font-medium text-slate-700">
                  <span>Geography</span>
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <span className="text-[0.75rem] font-normal text-gray-400">
                  {inputs.geography.length}/5 selected
                </span>
              </div>
              
              {/* Selected input field & dropdown trigger */}
              <div 
                className={`w-full bg-white border rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-colors min-h-[46px] shadow-xs ${openDropdown === 'geography' ? 'border-gray-300 ring-1 ring-gray-200' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setOpenDropdown(openDropdown === 'geography' ? null : 'geography')}
              >
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {inputs.geography.length === 0 && (
                    <span className="text-[0.875rem] text-gray-400 pl-1 font-normal">Search or select countries</span>
                  )}
                  {inputs.geography.map(country => (
                    <div key={country} className="bg-slate-50 border border-slate-200 text-slate-700 text-[0.8125rem] px-2.5 py-1 rounded-md flex items-center gap-1.5 font-normal">
                      <span>{getCountryFlag(country)}</span>
                      <span>{country}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleGeoToggle(country); }} 
                        className="text-gray-400 hover:text-gray-600 ml-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
              </div>
              
              <p className="text-[0.75rem] text-gray-400 font-normal mt-1.5">
                Select up to 5 countries in alphabetical order. Agent peer suggestions are available.
              </p>

              {/* Agent "Find peers" Suggestion Button & Chips (Visually appealing styling) */}
              {inputs.geography.length >= 1 && (
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPeerSuggestions(!showPeerSuggestions)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#36c0c9]/60 hover:border-[#36c0c9] text-[#085a61] text-[0.75rem] font-medium rounded-full transition-all shadow-xs hover:shadow-sm cursor-pointer group"
                  >
                    <div className="w-4 h-4 rounded-full bg-[#36c0c9]/15 flex items-center justify-center group-hover:bg-[#36c0c9]/25 transition-colors">
                      <Sparkles className="w-2.5 h-2.5 text-[#0a676f]" />
                    </div>
                    <span>Find peers</span>
                  </button>

                  {/* Peer Suggestions Chips */}
                  {showPeerSuggestions && peerSuggestions.map(peer => (
                    <button
                      key={peer}
                      type="button"
                      disabled={inputs.geography.length >= 5}
                      onClick={() => handleGeoToggle(peer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#36c0c9] hover:bg-slate-50/80 text-slate-700 hover:text-slate-900 text-[0.75rem] rounded-full transition-all font-normal shadow-xs hover:shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <span className="text-[0.875rem] leading-none">{getCountryFlag(peer)}</span>
                      <span>+ {peer}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Geography Dropdown */}
              {openDropdown === 'geography' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-gray-100 relative">
                    <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Type country name to search..."
                      value={geoSearch}
                      onChange={(e) => setGeoSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full pl-9 pr-4 py-1.5 text-[0.8125rem] font-normal text-slate-700 bg-white border border-gray-200 rounded focus:outline-none focus:border-gray-300"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
                    {filteredGeoOptions.length > 0 ? filteredGeoOptions.map(option => {
                      const isSelected = inputs.geography.includes(option.name);
                      const isMaxReached = inputs.geography.length >= 5 && !isSelected;
                      return (
                        <div 
                          key={option.name}
                          className={`px-4 py-2 text-[0.8125rem] font-normal flex items-center justify-between ${
                            isMaxReached 
                              ? 'text-gray-300 cursor-not-allowed' 
                              : 'text-slate-700 hover:bg-gray-50 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (!isMaxReached) {
                              handleGeoToggle(option.name);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'border-[#36c0c9] bg-[#36c0c9]' : 'border-gray-300'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-[1rem]">{option.flag}</span>
                            <span>{option.name}</span>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="px-4 py-3 text-[0.8125rem] text-gray-500 text-center font-normal">No matching countries found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Technology Domain */}
            <div className="relative" ref={openDropdown === 'domain' ? dropdownRef : null}>
              <label className="flex items-center text-[0.875rem] font-medium text-slate-700 mb-2">
                <span>Technology Domain</span>
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div 
                className={`w-full bg-white border rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-colors min-h-[46px] shadow-xs ${openDropdown === 'domain' ? 'border-gray-300 ring-1 ring-gray-200' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setOpenDropdown(openDropdown === 'domain' ? null : 'domain')}
              >
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {inputs.domains.length === 0 && (
                    <span className="text-[0.875rem] text-gray-400 pl-1 font-normal">Search technology domains</span>
                  )}
                  {inputs.domains.map(domain => (
                    <div key={domain} className="bg-slate-50 border border-slate-200 text-slate-700 text-[0.8125rem] px-2.5 py-1 rounded-md flex items-center gap-1.5 font-normal">
                      {domain}
                      <button onClick={(e) => {e.stopPropagation(); handleDomainToggle(domain);}} className="text-gray-400 hover:text-gray-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
              </div>
              
              <p className="text-[0.75rem] text-gray-400 font-normal mt-1.5">
                Select one or more technology domains relevant to your report.
              </p>

              {/* Agent Suggestion Chips for Technology Domain */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-[0.6875rem] font-medium text-gray-400 flex items-center gap-1 mr-0.5">
                  <Sparkles className="w-3 h-3 text-[#36c0c9]" /> Suggested:
                </span>
                {['Artificial Intelligence', 'Generative AI', 'Cloud Computing', 'Cybersecurity', 'HealthTech', 'FinTech'].map(domain => {
                  const isSelected = inputs.domains.includes(domain);
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => handleDomainToggle(domain)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.75rem] transition-all font-normal shadow-xs cursor-pointer ${
                        isSelected
                          ? 'bg-[#e6f7f8] border border-[#36c0c9] text-[#08737e] font-medium'
                          : 'bg-white border border-slate-200 hover:border-[#36c0c9] text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{domain}</span>
                    </button>
                  );
                })}
              </div>

              {openDropdown === 'domain' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col overflow-hidden">
                  <div className="p-3 border-b border-gray-100 relative">
                    <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search or type custom domain and press Enter..."
                      value={domainSearch}
                      onChange={(e) => setDomainSearch(e.target.value)}
                      onKeyDown={handleCustomDomainAdd}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full pl-9 pr-4 py-1.5 text-[0.8125rem] font-normal text-slate-700 bg-white border border-gray-200 rounded focus:outline-none focus:border-gray-300"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
                    {filteredDomainOptions.length > 0 ? filteredDomainOptions.map(option => {
                      const isSelected = inputs.domains.includes(option);
                      return (
                        <div 
                          key={option}
                          className="px-4 py-2 text-[0.8125rem] font-normal text-slate-700 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                          onClick={() => handleDomainToggle(option)}
                        >
                          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'border-[#36c0c9] bg-[#36c0c9]' : 'border-gray-300'}`}>
                             {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                          {option}
                        </div>
                      );
                    }) : (
                      <div className="px-4 py-3 text-[0.8125rem] text-gray-500 text-center font-normal">Press Enter to add "{domainSearch}"</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Report Depth (Deep Dive selected by default, softer text and dark grey titles) */}
            <div>
              <label className="flex items-center text-[0.875rem] font-medium text-slate-700 mb-2">
                <span>Report Depth</span>
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Deep Dive', time: '30 – 45 mins', pages: '~60 pages' },
                  { title: 'Standard Analysis', time: '20 – 30 mins', pages: '~40 pages' },
                  { title: 'Quick Overview', time: '10 – 15 mins', pages: '~20 pages' }
                ].map(option => (
                  <div 
                    key={option.title}
                    onClick={() => setInputs({...inputs, depth: option.title})}
                    className={`border rounded-xl p-5 cursor-pointer transition-all ${inputs.depth === option.title ? 'border-[#36c0c9]/40 bg-[#f0f9fa] shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${inputs.depth === option.title ? 'border-[#36c0c9]' : 'border-gray-300'}`}>
                        {inputs.depth === option.title && <div className="w-2 h-2 rounded-full bg-[#36c0c9]"></div>}
                      </div>
                      <span className="font-medium text-slate-800 text-[0.9375rem]">{option.title}</span>
                    </div>
                    <div className="text-[0.8125rem] text-gray-500 pl-7 flex items-center gap-2 font-normal">
                      {option.time} <span className="text-gray-300">|</span> {option.pages}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[0.75rem] text-gray-400 font-normal mt-2">
                Choose the level of analysis and expected report size. Generation times are estimates.
              </p>
            </div>

            {/* Focus Lens */}
            <div className="relative" ref={openDropdown === 'focus' ? dropdownRef : null}>
              <label className="flex items-center text-[0.875rem] font-medium text-slate-700 mb-2">
                <span>Focus Lens</span>
              </label>
              <div 
                className={`w-full bg-white border rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-colors min-h-[46px] shadow-xs ${openDropdown === 'focus' ? 'border-gray-300 ring-1 ring-gray-200' : 'border-gray-200 hover:border-gray-300'}`}
                onClick={() => setOpenDropdown(openDropdown === 'focus' ? null : 'focus')}
              >
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  {inputs.focusLens.length === 0 && (
                    <span className="text-[0.875rem] text-gray-400 pl-1 font-normal">Select focus areas</span>
                  )}
                  {inputs.focusLens.map(focus => (
                    <div key={focus} className="bg-slate-50 border border-slate-200 text-slate-700 text-[0.8125rem] px-2.5 py-1 rounded-md flex items-center gap-1.5 font-normal">
                      {focus}
                      <button onClick={(e) => {e.stopPropagation(); handleFocusToggle(focus);}} className="text-gray-400 hover:text-gray-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
              </div>
              
              <p className="text-[0.75rem] text-gray-400 font-normal mt-1.5">
                Select key areas you want the report to focus on.
              </p>

              {/* Agent Suggestion Chips for Focus Lens */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-[0.6875rem] font-medium text-gray-400 flex items-center gap-1 mr-0.5">
                  <Sparkles className="w-3 h-3 text-[#36c0c9]" /> Suggested:
                </span>
                {['Competitive Landscape', 'Government Initiatives', 'Funding & Investments', 'Technology Trends', 'Regulations'].map(focus => {
                  const isSelected = inputs.focusLens.includes(focus);
                  return (
                    <button
                      key={focus}
                      type="button"
                      onClick={() => handleFocusToggle(focus)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.75rem] transition-all font-normal shadow-xs cursor-pointer ${
                        isSelected
                          ? 'bg-[#e6f7f8] border border-[#36c0c9] text-[#08737e] font-medium'
                          : 'bg-white border border-slate-200 hover:border-[#36c0c9] text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{focus}</span>
                    </button>
                  );
                })}
              </div>

              {openDropdown === 'focus' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col overflow-hidden py-1">
                  <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                    <input 
                      type="text" 
                      placeholder="Type custom focus and press Enter..."
                      value={customFocus}
                      onChange={(e) => setCustomFocus(e.target.value)}
                      onKeyDown={handleCustomFocusAdd}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-3 py-1.5 text-[0.8125rem] font-normal text-slate-700 border border-gray-200 rounded focus:outline-none focus:border-gray-300 bg-white"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto py-1 custom-scrollbar">
                    {focusOptions.map(option => {
                      const isSelected = inputs.focusLens.includes(option);
                      return (
                        <div 
                          key={option}
                          className="px-4 py-2 text-[0.8125rem] font-normal text-slate-700 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                          onClick={() => handleFocusToggle(option)}
                        >
                          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'border-[#36c0c9] bg-[#36c0c9]' : 'border-gray-300'}`}>
                             {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                          </div>
                          {option}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Supporting Documents */}
            <div>
              <label className="flex items-center text-[0.875rem] font-medium text-slate-700 mb-2">
                <span>Supporting Documents</span>
              </label>

              <div 
                className="border border-dashed border-gray-300 rounded-xl bg-white flex flex-col items-center justify-center py-8 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-colors relative shadow-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                />
                <Upload className="w-5 h-5 text-gray-500 mb-2.5" strokeWidth={1.5} />
                <div className="text-[0.875rem] font-normal text-slate-700 mb-1">
                  Drag and drop files here or <span className="font-medium hover:underline text-slate-800">browse</span>
                </div>
                <div className="text-[0.75rem] text-gray-400 font-normal">
                  PDF, DOCX, PPT, XLSX &nbsp;•&nbsp; Max file size: 10 MB &nbsp;•&nbsp; Max 5 files
                </div>
              </div>
              
              {/* Display uploaded files */}
              {inputs.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {inputs.files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-xs">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-[#36c0c9]" />
                        <span className="text-[0.8125rem] text-slate-700 font-normal">{file.name}</span>
                        <span className="text-[0.75rem] text-gray-400 font-normal">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="flex items-center text-[0.875rem] font-medium text-slate-700 mb-2">
                <span>Additional Instructions</span>
              </label>
              
              <div className="relative">
                <textarea
                  value={inputs.additionalInstructions}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setInputs({...inputs, additionalInstructions: e.target.value});
                    }
                  }}
                  placeholder="Example: Prioritize government publications and Gartner reports. Focus on recent developments from the last 12 months."
                  className="w-full bg-white border border-gray-200 rounded-lg p-4 h-32 resize-none focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 text-[0.875rem] font-normal text-slate-700 placeholder-gray-400 custom-scrollbar shadow-xs"
                ></textarea>
                <div className="absolute bottom-3 right-4 text-[0.75rem] text-gray-400 font-normal">
                  {inputs.additionalInstructions.length}/500
                </div>
              </div>
              <p className="text-[0.75rem] text-gray-400 font-normal mt-1.5">
                Add any specific instructions or preferences for your report.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Action Bar (Only spans left pane) */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-4 px-6 lg:px-10 flex items-center justify-end z-10 relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="px-5 py-2 rounded-lg border border-gray-200 text-slate-700 font-normal text-[0.875rem] hover:bg-gray-50 transition-colors bg-white shadow-xs"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirmAndGenerate}
            disabled={!isFormValid}
            className={`px-5 py-2 rounded-lg font-medium text-[0.875rem] transition-colors flex items-center justify-center shadow-xs ${
              isFormValid 
                ? 'bg-[#06212E] text-white hover:bg-[#0a3549]' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Right Persistent Review Pane - Spans Full Screen Height */}
      <div 
        className={`fixed top-0 right-0 h-screen border-l border-gray-200 bg-white transition-all duration-300 flex flex-col z-[60] shadow-sm ${
          isReviewPaneOpen ? 'w-[420px]' : 'w-0 border-l-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="w-[420px] h-full flex flex-col">
          {/* Header */}
          <div className="h-20 px-6 flex flex-col justify-center shrink-0">
            <h2 className="text-[1.125rem] font-medium font-['Poppins'] text-slate-800 mb-0.5">Review Scope</h2>
            <p className="text-[0.8125rem] text-gray-500 font-normal">Review your selections before generating the report.</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col custom-scrollbar">
            
            {showEmptyState ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                  <FileSearch className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-[0.9375rem] font-medium text-slate-800 mb-1.5">No selections yet</h3>
                <p className="text-[0.8125rem] text-gray-500 font-normal leading-relaxed max-w-[250px]">
                  Fill in the required fields to generate a report summary for review before generating your report.
                </p>
              </div>
            ) : (
              <>
                {/* Dynamic Summary Card */}
                <div className="bg-cyan-50/40 border border-[#36c0c9]/20 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-[0.8125rem] text-slate-600 font-normal leading-relaxed">
                      Your report will include analysis of {formatDomainsForSummary()} in {formatGeographyForSummary()}
                      {inputs.focusLens.length > 0 && (
                        <> with a specific focus on {formatFocusForSummary()}</>
                      )}.
                      <br/><br/>
                      The report will cover market trends, key players, competitor analysis, regulations, investment activity, and emerging opportunities.
                    </div>
                  </div>
                </div>

                {/* List Details */}
                <div className="space-y-0">
                  <div className="flex items-center justify-between py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5 text-gray-500">
                      <LayoutList className="w-4 h-4 text-gray-400" />
                      <span className="font-normal text-[0.8125rem] text-gray-500">Technology</span>
                    </div>
                    <span className="font-normal text-slate-700 text-[0.8125rem]">{inputs.reportType}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2 py-3.5 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-gray-500">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="font-normal text-[0.8125rem] text-gray-500">Geography</span>
                      </div>
                      <span className="text-[0.75rem] text-gray-400 font-normal">
                        {inputs.geography.length} {inputs.geography.length === 1 ? 'country' : 'countries'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 w-full">
                      {inputs.geography.length > 0 ? inputs.geography.map(country => (
                        <span key={country} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-[0.75rem] font-normal flex items-center gap-1">
                          <span>{getCountryFlag(country)}</span>
                          <span>{country}</span>
                        </span>
                      )) : <span className="text-[0.8125rem] text-gray-400 font-normal">-</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5 text-gray-500">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <span className="font-normal text-[0.8125rem] text-gray-500">Technology Domain</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 w-full">
                      {inputs.domains.length > 0 ? inputs.domains.map(d => (
                        <span key={d} className="px-2.5 py-1 bg-cyan-50/40 border border-[#36c0c9]/30 text-[#0E7C86] rounded-full text-[0.75rem] font-normal leading-none">{d}</span>
                      )) : <span className="text-[0.8125rem] text-gray-400 font-normal">-</span>}
                    </div>
                  </div>

                  {inputs.focusLens.length > 0 && (
                    <div className="flex flex-col gap-2.5 py-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-2.5 text-gray-500">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="font-normal text-[0.8125rem] text-gray-500">Focus Lens</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 w-full">
                        {inputs.focusLens.map(f => (
                          <span key={f} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-[0.75rem] font-normal leading-none">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {inputs.additionalInstructions && (
                    <div className="flex flex-col gap-2.5 py-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-2.5 text-gray-500">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-normal text-[0.8125rem] text-gray-500">Additional Instructions</span>
                      </div>
                      <div className="text-[0.8125rem] text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 font-normal">
                        {inputs.additionalInstructions}
                      </div>
                    </div>
                  )}

                  {inputs.files.length > 0 && (
                    <div className="flex flex-col gap-2.5 py-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-2.5 text-gray-500">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <span className="font-normal text-[0.8125rem] text-gray-500">Supporting Documents</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {inputs.files.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-[0.8125rem] bg-white border border-gray-200 p-2 rounded-md shadow-xs">
                            <FileText className="w-3.5 h-3.5 text-[#36c0c9]" />
                            <span className="truncate text-slate-700 font-normal">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>

          {/* Footer Info */}
          <div className="p-5 bg-white border-t border-gray-100 shrink-0 flex flex-col gap-3.5 text-[0.8125rem] text-gray-500">
            <div className="flex items-center gap-3 bg-[#f0f9fa] px-3.5 py-2.5 rounded-lg border border-[#36c0c9]/30 w-full">
              <Clock className="w-4 h-4 text-[#36c0c9]" />
              <div>
                <div className="text-[0.75rem] font-medium text-slate-800">Estimated Runtime</div>
                <div className="text-[0.8125rem] text-[#36c0c9] font-medium">{getRuntime()}</div>
              </div>
            </div>
             <div className="flex gap-2.5">
               <ShieldCheck className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
               <p className="leading-relaxed text-gray-500 text-[0.75rem] font-normal">You can review and edit the configuration anytime before the report is generated.</p>
             </div>
          </div>
        </div>
      </div>


      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0D212C]/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center flex flex-col items-center border border-gray-100">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm text-red-500">
               <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-[1.125rem] font-medium text-slate-800 mb-2 font-['Poppins'] tracking-tight">Cancel Request?</h3>
            <p className="text-gray-500 mb-6 text-[0.8125rem] leading-relaxed px-4 font-normal">
              Are you sure you want to cancel the request? Your configuration has not been saved and will be lost.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => {
                  setShowCancelModal(false);
                  navigate('/new');
                }}
                className="flex-1 px-4 py-2 text-[0.8125rem] font-normal text-white bg-red-500 hover:bg-red-600 transition-colors rounded-xl shadow-xs"
              >
                Yes, cancel
              </button>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 text-[0.8125rem] font-normal text-slate-700 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl"
              >
                Continue editing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}