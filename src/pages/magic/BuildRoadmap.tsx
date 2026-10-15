import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Info, Check, CheckCircle2, TrendingUp, Clock, ArrowLeft, Search, Filter, LayoutGrid, Menu, RotateCcw, ArrowUpDown } from 'lucide-react';
import { useMagicStore, ComponentItem } from '../../store/magicStore';

const COMPONENT_DETAILS_DATA: Record<string, {
  rank: number;
  features: { title: string; bullets: string[] }[];
  capabilities: string[];
}> = {
  c1: {
    rank: 1,
    features: [
      {
        title: 'Conversational triage',
        bullets: [
          'patient describes symptoms in natural language',
          'AI routes to the right level of care',
          'red-flag cases escalated to a clinician',
        ],
      },
      {
        title: 'Grounded answers (CRAG)',
        bullets: [
          'answers drawn only from cited, approved sources',
          'falls back to "needs review" when evidence is thin',
          'every answer shows its sources',
        ],
      },
      {
        title: 'Language & handoff',
        bullets: [
          'converse in Arabic / English',
          'hand the transcript to a human agent',
        ],
      },
    ],
    capabilities: ['Identity & demographics', 'Longitudinal history', 'Access & privacy'],
  },
  c2: {
    rank: 2,
    features: [
      {
        title: 'Payment Gateway Integration',
        bullets: [
          'supports multi-currency & regional gateways (Mada, Apple Pay, cards)',
          'PCI-DSS Level 1 compliant secure tokenization',
          'instant digital receipt & invoice generation',
        ],
      },
      {
        title: 'Subscription & Co-pay Billing',
        bullets: [
          'automated co-pay calculations with payer eligibility',
          'recurring plan management for chronic care programs',
          'split-billing between insurance coverage and out-of-pocket',
        ],
      },
      {
        title: 'Settlement & Reconciliation',
        bullets: [
          'automated daily bank payout reconciliation',
          'chargeback management and dispute audit tracking',
        ],
      },
    ],
    capabilities: ['Payment processing', 'PCI-DSS vault', 'Multi-currency settlement'],
  },
  c3: {
    rank: 3,
    features: [
      {
        title: 'Demographics & Master Index',
        bullets: [
          'unified National ID / Emirates ID resolution',
          'duplicate profile merging and conflict detection',
          'biographical data versioning and consent audit trail',
        ],
      },
      {
        title: 'Longitudinal EHR Timeline',
        bullets: [
          'cross-facility encounter aggregation',
          'medication, allergy, and immunization history timeline',
          'lab and radiology report unified attachments',
        ],
      },
      {
        title: 'Consent & RBAC Sharing',
        bullets: [
          'granular consent controls for sensitive health records',
          'role-based access logging and real-time alerts',
        ],
      },
    ],
    capabilities: ['Identity & demographics', 'Longitudinal history', 'Access & privacy'],
  },
  c4: {
    rank: 4,
    features: [
      {
        title: 'Ambient Audio Capture',
        bullets: [
          'multi-speaker diarization for doctor-patient consultation',
          'noise-cancellation optimized for clinic environments',
          'real-time bilingual Arabic/English transcription',
        ],
      },
      {
        title: 'SOAP Note Generation',
        bullets: [
          'auto-generates structured Subjective, Objective, Assessment, Plan',
          'maps extracted entities to ICD-10 and SNOMED CT codes',
          'one-click clinician review, edit, and EHR commit',
        ],
      },
      {
        title: 'Clinical Safety & Guardrails',
        bullets: [
          'highlights uncertain dosage or drug contraindications',
          'preserves verbatim audio references for auditability',
        ],
      },
    ],
    capabilities: ['Speech-to-text', 'Entity extraction', 'Coding & classification'],
  },
  c5: {
    rank: 5,
    features: [
      {
        title: 'Operational Metrics Engine',
        bullets: [
          'real-time patient throughput and wait time monitoring',
          'bed occupancy and resource utilization forecasting',
          'departmental KPI threshold alerts and escalations',
        ],
      },
      {
        title: 'Executive Dashboards',
        bullets: [
          'revenue and billing cycle performance tracking',
          'clinical quality indicator and readmission heatmaps',
          'custom report builder with CSV/PDF scheduled export',
        ],
      },
      {
        title: 'Data Connector Fabric',
        bullets: [
          'native ETL connectors for HL7, FHIR, and SQL stores',
          'role-based data masking and anonymization pipeline',
        ],
      },
    ],
    capabilities: ['BI & Analytics', 'Real-time telemetry', 'Cohort reporting'],
  },
  c6: {
    rank: 6,
    features: [
      {
        title: 'Claims Pattern Analyzer',
        bullets: [
          'statistical outlier detection for upcoding and unbundling',
          'graph analysis for syndicate provider fraud detection',
          'historical claims baseline comparisons in real-time',
        ],
      },
      {
        title: 'Rules Engine & Scoring',
        bullets: [
          'configurable risk scoring before claim adjudication',
          'automated straight-through-processing (STP) triggers',
          'investigation workbench with evidence dossier creation',
        ],
      },
      {
        title: 'Audit & Compliance Reporting',
        bullets: [
          'regulatory fraud report export for oversight bodies',
          'explainable AI rationale for rejected claim items',
        ],
      },
    ],
    capabilities: ['Anomaly detection', 'Fraud scoring', 'Audit trail generation'],
  },
  c7: {
    rank: 7,
    features: [
      {
        title: 'Smart Slot Allocation',
        bullets: [
          'provider calendar synchronization (Exchange, Google, EHR)',
          'dynamic buffer calculation based on visit type complexity',
          'automated cancellation backfill & waitlist management',
        ],
      },
      {
        title: 'Patient Self-Service Booking',
        bullets: [
          'multi-channel booking via web, mobile, and WhatsApp',
          'automated SMS/WhatsApp appointment reminders and confirmations',
          'pre-visit intake form dynamic link dispatch',
        ],
      },
      {
        title: 'Multi-Location Resource Scheduling',
        bullets: [
          'room, equipment, and staff concurrent booking constraints',
          'telehealth virtual consultation link generation',
        ],
      },
    ],
    capabilities: ['Calendar engine', 'Omnichannel alerts', 'Resource allocation'],
  },
  c8: {
    rank: 8,
    features: [
      {
        title: 'Drug Interaction & Formulary Check',
        bullets: [
          'real-time drug-drug and drug-allergy contraindication checks',
          'insurance formulary tier and generic substitution alerts',
          'pediatric and renal dose adjustment calculators',
        ],
      },
      {
        title: 'Digital Prescription Routing',
        bullets: [
          'electronic transmission to partnered pharmacy chains',
          'cryptographically signed digital doctor signature',
          'patient pickup notification & QR code dispensation',
        ],
      },
      {
        title: 'Refill & Adherence Tracking',
        bullets: [
          'automated refill authorization workflow for chronic patients',
          'patient adherence reminders and compliance tracking',
        ],
      },
    ],
    capabilities: ['e-Rx transmission', 'Formulary validation', 'Safety alerts'],
  },
  c9: {
    rank: 9,
    features: [
      {
        title: 'Analyzer Machine Bridges',
        bullets: [
          'bi-directional ASTM/HL7 interface with diagnostic hardware',
          'automated specimen barcode generation and tracking',
          'quality control (QC) threshold monitoring & alarm triggers',
        ],
      },
      {
        title: 'Result Validation & Delta Checks',
        bullets: [
          'automated delta checks against patient prior results',
          'pathologist digital sign-off and review queue',
          'critical abnormal result urgent broadcast to ordering doctor',
        ],
      },
      {
        title: 'Patient Portal Publication',
        bullets: [
          'secure patient PDF result report generation',
          'plain-language summary translations for test parameters',
        ],
      },
    ],
    capabilities: ['LIS protocols (ASTM/HL7)', 'Delta checking', 'Pathology workflow'],
  },
  c10: {
    rank: 10,
    features: [
      {
        title: 'Payer Policy Repository',
        bullets: [
          'centralized pre-authorization requirements database',
          'coverage benefit tables and exclusions mapping',
          'ICD-10 to CPT / procedural eligibility crosswalk',
        ],
      },
      {
        title: 'Eligibility Verification Engine',
        bullets: [
          'sub-second 270/271 real-time insurance eligibility checks',
          'deductible, out-of-pocket maximum, and co-insurance estimation',
          'automated digital prior-authorization document dispatch',
        ],
      },
      {
        title: 'Payer Contract Management',
        bullets: [
          'fee schedule management per insurance network tier',
          'denial rate analytics and payer benchmark scorecards',
        ],
      },
    ],
    capabilities: ['Eligibility verification', 'Payer policy mapping', 'Fee schedule management'],
  },
  c11: {
    rank: 11,
    features: [
      {
        title: 'Omnichannel Dispatch',
        bullets: [
          'real-time routing via SMS, WhatsApp, and push notifications',
          'carrier fallback and delivery receipt confirmation',
          'template localization with bilingual Arabic/English support',
        ],
      },
      {
        title: 'Clinical Escalation Triggers',
        bullets: [
          'critical lab alert broadcast with mandatory clinician acknowledgment',
          'physician on-call paging schedule synchronization',
        ],
      },
      {
        title: 'Compliance & Audit Log',
        bullets: [
          'GDPR and regional consent opt-in registry tracking',
          'full message archive with cryptographic verification',
        ],
      },
    ],
    capabilities: ['Omnichannel alerts', 'Emergency broadcasts', 'Consent tracking'],
  },
  c12: {
    rank: 12,
    features: [
      {
        title: 'HL7 to FHIR Transformation',
        bullets: [
          'bi-directional schema mapping for HL7 v2, v3, and FHIR R4',
          'high-throughput real-time message translation pipeline',
          'canonical terminology mapping for ICD-10 and SNOMED CT',
        ],
      },
      {
        title: 'Gateway Security & Caching',
        bullets: [
          'OAuth 2.0 SMART-on-FHIR clinical authentication',
          'sub-second distributed query cache with Redis backend',
          'rate limiting and enterprise mutual TLS encryption',
        ],
      },
      {
        title: 'Interoperability Telemetry',
        bullets: [
          'live transaction throughput and latency metrics',
          'automated schema validation and dead-letter queue recovery',
        ],
      },
    ],
    capabilities: ['FHIR R4 engine', 'HL7 protocol bridge', 'SMART-on-FHIR security'],
  },
};

export default function BuildRoadmap() {
  const [activeTab, setActiveTab] = useState<'components' | 'impact'>('components');
  const [buildTop, setBuildTop] = useState('10');
  const [isBuildTopOpen, setIsBuildTopOpen] = useState(false);
  const [orderBy, setOrderBy] = useState<'priority' | 'reuse'>('priority');
  const [isOrderByOpen, setIsOrderByOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [reuseSplit, setReuseSplit] = useState(3);
  const [revenueSplit, setRevenueSplit] = useState(10.4);
  const isMedianAdjusted = reuseSplit !== 3 || revenueSplit !== 10.4;
  const [hoveredBubble, setHoveredBubble] = useState<ComponentItem | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [componentPage, setComponentPage] = useState(1);
  const [viewingComponent, setViewingComponent] = useState<ComponentItem | null>(null);

  const COMPONENT_ITEMS_PER_PAGE = 7;
  const buildTopRef = useRef<HTMLDivElement>(null);
  const orderByRef = useRef<HTMLDivElement>(null);

  // Close custom dropdowns on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buildTopRef.current && !buildTopRef.current.contains(event.target as Node)) {
        setIsBuildTopOpen(false);
      }
      if (orderByRef.current && !orderByRef.current.contains(event.target as Node)) {
        setIsOrderByOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { components, solutions, reuseMatrix } = useMagicStore();

  // Dynamic quadrant calculation based on thresholds
  const getQuadrant = (reuse: number, revenue: number, rSplit: number, revSplit: number): 'Build first' | 'High Value' | 'Cheap enablers' | 'Defer' => {
    const isHighReuse = reuse > rSplit;
    const isHighRev = revenue > revSplit;
    if (isHighRev && isHighReuse) return 'Build first';
    if (isHighRev && !isHighReuse) return 'High Value';
    if (!isHighRev && isHighReuse) return 'Cheap enablers';
    return 'Defer';
  };

  const formatRevenue = (rev?: number) => {
    if (rev === undefined || rev === 0) return '$0K';
    return `$${rev.toFixed(1)}M`;
  };

  const formatPriority = (comp: ComponentItem) => {
    if (comp.buildPriority) return comp.buildPriority;
    const p = comp.buildPriorityNum ?? 0;
    if (p >= 1000) return `$${(p / 1000).toFixed(2)}M / pd`;
    if (p > 0) return `$${p}K / pd`;
    return '$0K / pd';
  };

  // Table View column sorting state
  type TableSortColumn = 'name' | 'category' | 'complexity' | 'effort' | 'reuse' | 'revenue' | 'priority' | 'quadrant' | 'status' | null;
  const [tableSortColumn, setTableSortColumn] = useState<TableSortColumn>(null);
  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleTableColumnSort = (column: TableSortColumn) => {
    if (tableSortColumn === column) {
      setTableSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setTableSortColumn(column);
      if (column === 'name' || column === 'category' || column === 'status' || column === 'quadrant') {
        setTableSortDirection('asc');
      } else {
        setTableSortDirection('desc');
      }
    }
  };

  // Active (non-deactivated) components sorted by selected column or order
  const sortedComponents = useMemo(() => {
    const list = [...components].filter((c) => !c.isDeactivated);

    if (tableSortColumn) {
      return list.sort((a, b) => {
        let valA: any = 0;
        let valB: any = 0;

        switch (tableSortColumn) {
          case 'name':
            return tableSortDirection === 'asc' 
              ? a.name.localeCompare(b.name) 
              : b.name.localeCompare(a.name);
          case 'category':
            return tableSortDirection === 'asc' 
              ? (a.category || '').localeCompare(b.category || '') 
              : (b.category || '').localeCompare(a.category || '');
          case 'complexity': {
            const getComplexityRank = (c: ComponentItem) => {
              const reuse = (reuseMatrix[c.id] || []).length || c.reuseCount || 0;
              const compComplexity = c.complexity || (reuse >= 6 ? 'High' : reuse >= 4 ? 'Medium' : 'Low');
              return compComplexity === 'High' ? 3 : compComplexity === 'Medium' ? 2 : 1;
            };
            valA = getComplexityRank(a);
            valB = getComplexityRank(b);
            break;
          }
          case 'effort': {
            const getEffortNum = (c: ComponentItem) => {
              const reuse = (reuseMatrix[c.id] || []).length || c.reuseCount || 0;
              const effortStr = c.effort || (reuse >= 6 ? '~50 pd' : reuse >= 4 ? '~20 pd' : '~12 pd');
              const match = effortStr.match(/\d+/);
              return match ? parseInt(match[0], 10) : 0;
            };
            valA = getEffortNum(a);
            valB = getEffortNum(b);
            break;
          }
          case 'reuse':
            valA = (reuseMatrix[a.id] || []).length || a.reuseCount || 0;
            valB = (reuseMatrix[b.id] || []).length || b.reuseCount || 0;
            break;
          case 'revenue':
            valA = a.allocatedRevenue ?? 0;
            valB = b.allocatedRevenue ?? 0;
            break;
          case 'priority':
            valA = a.buildPriorityNum ?? 0;
            valB = b.buildPriorityNum ?? 0;
            break;
          case 'quadrant': {
            const qA = a.id === 'c4' ? 'High Value' : 'Defer';
            const qB = b.id === 'c4' ? 'High Value' : 'Defer';
            return tableSortDirection === 'asc' ? qA.localeCompare(qB) : qB.localeCompare(qA);
          }
          case 'status':
            return tableSortDirection === 'asc' 
              ? (a.status || '').localeCompare(b.status || '') 
              : (b.status || '').localeCompare(a.status || '');
          default:
            return 0;
        }

        return tableSortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }

    return list.sort((a, b) => {
      if (orderBy === 'priority') {
        const priorityA = a.buildPriorityNum ?? 0;
        const priorityB = b.buildPriorityNum ?? 0;
        return priorityB - priorityA;
      }
      const countA = (reuseMatrix[a.id] || []).length || a.reuseCount || 0;
      const countB = (reuseMatrix[b.id] || []).length || b.reuseCount || 0;
      return countB - countA;
    });
  }, [components, reuseMatrix, orderBy, tableSortColumn, tableSortDirection]);

  // Components displayed in the grid graph based on Top 10, 20, 50 filter sorted by build priority
  const displayedGraphComponents = useMemo(() => {
    const limit = parseInt(buildTop, 10) || 10;
    return [...components]
      .filter((c) => !c.isDeactivated)
      .sort((a, b) => {
        const priorityA = a.buildPriorityNum ?? 0;
        const priorityB = b.buildPriorityNum ?? 0;
        return priorityB - priorityA;
      })
      .slice(0, limit);
  }, [components, buildTop]);

  // Paginated components for Component Build tab (7 rows per page)
  const totalComponentPages = Math.ceil(sortedComponents.length / COMPONENT_ITEMS_PER_PAGE) || 1;
  const paginatedComponents = useMemo(() => {
    const start = (componentPage - 1) * COMPONENT_ITEMS_PER_PAGE;
    return sortedComponents.slice(start, start + COMPONENT_ITEMS_PER_PAGE);
  }, [sortedComponents, componentPage]);

  // Set of built component IDs based on buildTop (used exclusively for Build Impact calculations)
  const builtComponentIds = useMemo(() => {
    const limit = parseInt(buildTop, 10) || 10;
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

  // Build Impact Search & Sort state
  const [impactSearch, setImpactSearch] = useState('');
  const [impactSort, setImpactSort] = useState<'all' | 'in_progress' | 'unlocked'>('all');
  const [isImpactFilterOpen, setIsImpactFilterOpen] = useState(false);
  const impactFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (impactFilterRef.current && !impactFilterRef.current.contains(event.target as Node)) {
        setIsImpactFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSolutionImpactStatuses = useMemo(() => {
    return solutionImpactStatuses.filter((sol) => {
      const matchesSearch = sol.name.toLowerCase().includes(impactSearch.toLowerCase());
      const matchesFilter =
        impactSort === 'all' ||
        (impactSort === 'unlocked' && sol.isUnlocked) ||
        (impactSort === 'in_progress' && !sol.isUnlocked);
      return matchesSearch && matchesFilter;
    });
  }, [solutionImpactStatuses, impactSearch, impactSort]);

  return (
    <div className="w-full px-5 py-6 md:py-8 space-y-6">
      
      {/* Top Underline Tabs (Matching Catalogue Design Exactly) */}
      <div className="inline-block border-b border-gray-200">
        <nav className="flex space-x-1 sm:space-x-2 -mb-[1px]">
          <button
            onClick={() => {
              setActiveTab('components');
              setViewingComponent(null);
            }}
            className={`pb-2.5 px-3 sm:px-4 text-[0.875rem] font-medium cursor-pointer transition-colors border-b-2 rounded-t-lg ${
              activeTab === 'components'
                ? 'border-gray-800 text-gray-900 bg-gray-100/80 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Component build
          </button>
          <button
            onClick={() => {
              setActiveTab('impact');
              setViewingComponent(null);
            }}
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

        {/* Top Controls: Order by, Build top, and Grid/Table icon toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Order By Dropdown */}
          <div className="relative" ref={orderByRef}>
            <button
              type="button"
              onClick={() => setIsOrderByOpen(!isOrderByOpen)}
              className="inline-flex items-center justify-between gap-2 bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-3.5 py-1.5 text-[0.8125rem] text-gray-700 font-normal shadow-2xs transition-colors cursor-pointer"
            >
              <span className="text-gray-500">Order by:</span>
              <span className="font-semibold text-[#0D212C]">
                {orderBy === 'priority' ? 'Build priority' : 'Reuse count'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOrderByOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOrderByOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setOrderBy('priority');
                    setIsOrderByOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    orderBy === 'priority'
                      ? 'bg-[#fef3eb] text-[#ED4D19] font-medium'
                      : 'text-gray-700 hover:bg-gray-50 font-normal'
                  }`}
                >
                  <span>Build priority</span>
                  {orderBy === 'priority' && <Check className="w-3.5 h-3.5 text-[#ED4D19]" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderBy('reuse');
                    setIsOrderByOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    orderBy === 'reuse'
                      ? 'bg-[#fef3eb] text-[#ED4D19] font-medium'
                      : 'text-gray-700 hover:bg-gray-50 font-normal'
                  }`}
                >
                  <span>Reuse count</span>
                  {orderBy === 'reuse' && <Check className="w-3.5 h-3.5 text-[#ED4D19]" />}
                </button>
              </div>
            )}
          </div>

          {/* Custom Build Top Dropdown (Options 10, 20, 50 in Graph view; 3, 4, 5 in List view) */}
          <div className="relative" ref={buildTopRef}>
            <button
              type="button"
              onClick={() => setIsBuildTopOpen(!isBuildTopOpen)}
              className="inline-flex items-center justify-between gap-2 bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-3.5 py-1.5 text-[0.8125rem] text-gray-700 font-normal shadow-2xs transition-colors cursor-pointer"
            >
              <span className="text-gray-500">{viewMode === 'grid' ? 'Build Priority:' : 'Build top:'}</span>
              <span className="font-semibold text-[#0D212C]">Top {buildTop}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isBuildTopOpen ? 'rotate-180' : ''}`} />
            </button>

            {isBuildTopOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 overflow-hidden">
                {(viewMode === 'grid' ? ['10', '20', '50'] : ['3', '4', '5']).map((opt) => (
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

          {/* Segmented Table & Grid toggle (Icons only, Grid default, Table 2nd - Orange Active) */}
          <div className="inline-flex items-center p-0.5 bg-white border border-gray-200 rounded-lg shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setViewMode('grid');
                if (!['10', '20', '50'].includes(buildTop)) setBuildTop('10');
              }}
              title="Grid view"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#ED4D19] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 bg-transparent'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('table');
                if (!['3', '4', '5'].includes(buildTop)) setBuildTop('3');
              }}
              title="Table view"
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#ED4D19] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 bg-transparent'
              }`}
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 KPI Cards Displayed Across Both Tabs with Icons & Reduced Font Weight (Hidden when viewing component details) */}
      {!viewingComponent && (
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
      )}

      {/* TAB 1: COMPONENT BUILD */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          {viewingComponent ? (
            /* COMPONENT DETAILS VIEW (Matching Snapshot 1 & 2 + Part B Branding) */
            <div className="space-y-4">
              {/* Back to components list button */}
              <div>
                <button
                  type="button"
                  onClick={() => setViewingComponent(null)}
                  className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-[#ED4D19] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to components list</span>
                </button>
              </div>

              {/* Main Details Card */}
              {(() => {
                const actualReuse = (reuseMatrix[viewingComponent.id] || []).length || viewingComponent.reuseCount || 0;
                const details = COMPONENT_DETAILS_DATA[viewingComponent.id] || {
                  rank: 1,
                  features: [
                    {
                      title: 'Core Module Architecture',
                      bullets: [
                        'modular API interface for cross-solution interoperability',
                        'enterprise security and data compliance audit logging',
                        'high availability fault-tolerant deployment topology',
                      ],
                    },
                    {
                      title: 'Integration Fabric',
                      bullets: [
                        'standardized FHIR and HL7 data exchange connectors',
                        'secure webhook event routing and status triggers',
                        'sub-second latency query caching mechanisms',
                      ],
                    },
                    {
                      title: 'Governance & Telemetry',
                      bullets: [
                        'role-based access management and audit trail tracking',
                        'end-to-end performance and latency telemetry',
                      ],
                    },
                  ],
                  capabilities: ['Identity & demographics', 'Longitudinal history', 'Access & privacy'],
                };

                const mappedSolIds = reuseMatrix[viewingComponent.id] || [];
                const reusedSolutionNames = mappedSolIds
                  .map((sid) => solutions.find((s) => s.id === sid)?.name)
                  .filter(Boolean) as string[];

                const displaySolNames = reusedSolutionNames.length > 0 
                  ? reusedSolutionNames 
                  : ['EMR & Interoperability', 'Hospital Ops & Clinical Workflow', 'Home & Community Care', 'Remote Patient Monitoring', 'InsurTech & Reimbursement', 'Pharmacy & Medication', 'Population Health & Analytics'].slice(0, actualReuse || 3);

                const compEffortFormatted = viewingComponent.effort 
                  ? viewingComponent.effort.replace('pd', 'person-days') 
                  : '~50 person-days';

                return (
                  <div className="bg-white rounded-2xl border border-gray-200/90 p-6 md:p-8 shadow-xs space-y-7">
                    {/* Component Header / Top Bar without number and now chip */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
                      <div className="space-y-1.5">
                        <h3 className="text-lg sm:text-xl font-semibold text-[#0D212C] font-['Poppins']">
                          {viewingComponent.name}
                        </h3>
                        <p className="text-xs sm:text-[0.8125rem] text-gray-400 font-normal">
                          {viewingComponent.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 self-start sm:self-auto">
                        {/* Effort Badge Box */}
                        <div className="bg-gray-50/80 rounded-xl px-4 py-2 border border-gray-100/90 flex flex-col items-start">
                          <span className="text-[0.625rem] font-medium text-gray-400 uppercase tracking-wider">
                            EFFORT · 1 FTE
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-[#0D212C] mt-0.5 font-['Poppins']">
                            {compEffortFormatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* High-level Feature & User-Story Breakdown (Snapshot 1) */}
                    <div className="space-y-4">
                      <h4 className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                        FEATURE & USER-STORY BREAKDOWN · HIGH LEVEL
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
                        {details.features.map((sec, idx) => (
                          <div key={idx} className="space-y-2.5">
                            <h5 className="text-xs sm:text-[0.8125rem] font-semibold text-[#0D212C] font-['Poppins']">
                              {sec.title}
                            </h5>
                            <ul className="space-y-2 text-xs text-gray-600 font-normal">
                              {sec.bullets.map((b, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-2 leading-relaxed">
                                  <span className="text-gray-400 text-sm leading-none">•</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reused Across X Solutions (Orange Chips) */}
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      <h4 className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                        REUSED ACROSS {displaySolNames.length} SOLUTIONS
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {displaySolNames.map((solName, idx) => (
                          <span
                            key={idx}
                            className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-orange-50 text-[#ED4D19] border border-orange-100 transition-colors"
                          >
                            {solName}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Capabilities (Snapshot 2) */}
                    <div className="space-y-3">
                      <h4 className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                        CAPABILITIES
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {details.capabilities.map((cap, idx) => (
                          <span
                            key={idx}
                            className="px-3.5 py-1.5 rounded-full text-xs font-normal bg-gray-50 text-gray-700 border border-gray-200/90"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Note (Snapshot 2) */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <h4 className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                        NOTE
                      </h4>
                      <p className="text-xs text-gray-500 font-normal leading-relaxed">
                        Components are the reusable build units — no revenue is attached to a component on its own. Revenue is unlocked when the solutions this component belongs to become market-ready (see the preview below). Effort is person-days for one full-time developer; complexity reflects scope & integration.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 md:p-6 shadow-xs flex flex-col lg:flex-row gap-6">
              {/* Left Side: 2D Quadrant Scatter Plot */}
              <div className="flex-1 flex flex-col">
                <div className="flex flex-1 min-h-[460px]">
                  {/* Y-Axis Label and Ticks - Slim container utilizing empty space */}
                  <div className="flex items-center select-none pr-1.5">
                    <div className="w-5 h-[500px] flex items-center justify-center relative">
                      <span className="-rotate-90 text-[0.75rem] font-medium text-gray-500 whitespace-nowrap tracking-wide absolute">
                        Allocated revenue (3-yr) →
                      </span>
                    </div>
                    <div className="flex flex-col justify-between h-[500px] text-[0.6875rem] text-gray-400 font-mono text-right py-1 pl-1">
                      {['$50M', '$45M', '$40M', '$35M', '$30M', '$25M', '$20M', '$15M', '$10M', '$5M', '$0M'].map((tick) => (
                        <span key={tick}>{tick}</span>
                      ))}
                    </div>
                  </div>

                  {/* Quadrant Graph Area */}
                  <div className="flex-1 flex flex-col">
                    <div className="relative w-full h-[500px] rounded-xl border border-gray-200/90 overflow-hidden bg-white select-none">
                      {/* Top-Left Quadrant: HIGH VALUE */}
                      <div
                        className="absolute top-0 left-0 bg-blue-50/40 transition-all duration-200"
                        style={{
                          width: `${Math.max(5, Math.min(95, (reuseSplit / 7) * 100))}%`,
                          height: `${Math.max(5, Math.min(95, (1 - revenueSplit / 50) * 100))}%`,
                        }}
                      >
                        <span className="absolute top-3.5 left-4 text-[0.75rem] font-bold text-blue-600 tracking-wider">
                          HIGH VALUE
                        </span>
                      </div>

                      {/* Top-Right Quadrant: BUILD FIRST */}
                      <div
                        className="absolute top-0 right-0 bg-emerald-50/40 transition-all duration-200"
                        style={{
                          width: `${100 - Math.max(5, Math.min(95, (reuseSplit / 7) * 100))}%`,
                          height: `${Math.max(5, Math.min(95, (1 - revenueSplit / 50) * 100))}%`,
                        }}
                      >
                        <span className="absolute top-3.5 right-4 text-[0.75rem] font-bold text-emerald-600 tracking-wider">
                          BUILD FIRST
                        </span>
                      </div>

                      {/* Bottom-Left Quadrant: DEFER */}
                      <div
                        className="absolute bottom-0 left-0 bg-slate-50/60 transition-all duration-200"
                        style={{
                          width: `${Math.max(5, Math.min(95, (reuseSplit / 7) * 100))}%`,
                          height: `${100 - Math.max(5, Math.min(95, (1 - revenueSplit / 50) * 100))}%`,
                        }}
                      >
                        <span className="absolute top-3.5 left-4 text-[0.75rem] font-bold text-slate-500 tracking-wider">
                          DEFER
                        </span>
                      </div>

                      {/* Bottom-Right Quadrant: CHEAP ENABLERS */}
                      <div
                        className="absolute bottom-0 right-0 bg-amber-50/40 transition-all duration-200"
                        style={{
                          width: `${100 - Math.max(5, Math.min(95, (reuseSplit / 7) * 100))}%`,
                          height: `${100 - Math.max(5, Math.min(95, (1 - revenueSplit / 50) * 100))}%`,
                        }}
                      >
                        <span className="absolute top-3.5 right-4 text-[0.75rem] font-bold text-amber-700 tracking-wider">
                          CHEAP ENABLERS
                        </span>
                      </div>

                      {/* Threshold Vertical Line */}
                      <div
                        className="absolute top-0 bottom-0 border-r-2 border-dashed border-[#ED4D19] pointer-events-none transition-all duration-200 z-10"
                        style={{ left: `${Math.max(5, Math.min(95, (reuseSplit / 7) * 100))}%` }}
                      />

                      {/* Threshold Horizontal Line */}
                      <div
                        className="absolute left-0 right-0 border-b-2 border-dashed border-[#ED4D19] pointer-events-none transition-all duration-200 z-10"
                        style={{ top: `${Math.max(5, Math.min(95, (1 - revenueSplit / 50) * 100))}%` }}
                      />

                      {/* Component Scatter Bubbles - Dynamic based on Build Top 10, 20, 50 */}
                      {displayedGraphComponents.map((comp) => {
                        const actualReuse = (reuseMatrix[comp.id] || []).length || comp.reuseCount || 0;
                        const allocatedRev = comp.allocatedRevenue ?? 0;
                        const quad = getQuadrant(actualReuse, allocatedRev, reuseSplit, revenueSplit);

                        // Precise, uncluttered layout mapping utilizing the full horizontal width
                        const layoutMap: Record<string, { x: number; y: number; labelPos: 'top' | 'bottom' | 'left' | 'right' }> = {
                          c1: { x: 5.6, y: 41.5, labelPos: 'top' },          // AI Chatbot · CRAG
                          c12: { x: 3.5, y: 28.0, labelPos: 'top' },         // FHIR Integration Gateway
                          c5: { x: 4.8, y: 22.0, labelPos: 'top' },          // Analytics & Dashboards
                          c4: { x: 2.1, y: 22.0, labelPos: 'right' },        // Clinical Notes · NLP
                          c3: { x: 6.2, y: 14.0, labelPos: 'top' },          // Patient Profile
                          c2: { x: 4.1, y: 10.8, labelPos: 'top' },          // Payment Module
                          c9: { x: 2.4, y: 7.2, labelPos: 'top' },           // Device Telemetry Hub
                          c7: { x: 1.7, y: 6.2, labelPos: 'top' },           // Appointment Booking
                          c6: { x: 0.9, y: 2.8, labelPos: 'right' },         // Fraud-Claim Detection (labelPos right avoids left clipping)
                          c11: { x: 5.4, y: 3.2, labelPos: 'right' },        // Notification Service
                          c8: { x: 0.45, y: 1.5, labelPos: 'right' },        // Prescription Engine
                          c10: { x: 1.1, y: 0.8, labelPos: 'bottom' },       // Insurance Directory · Unmapped
                        };

                        const layout = layoutMap[comp.id] || { x: actualReuse, y: allocatedRev, labelPos: 'top' as const };
                        const xPct = Math.max(4, Math.min(94, (layout.x / 7) * 100));
                        const yPct = Math.max(6, Math.min(94, (1 - layout.y / 50) * 100));

                        // Bubble diameter based on effort
                        const effortNum = parseInt((comp.effort || '20').replace(/[^0-9]/g, ''), 10) || 20;
                        const bubbleSize = Math.max(22, Math.min(52, 16 + (effortNum / 50) * 36));

                        // Solid colored circle based on quadrant (no dotted or dashed borders)
                        const colorClass =
                          quad === 'Build first'
                            ? 'bg-emerald-400 text-emerald-950 border border-emerald-500'
                            : quad === 'High Value'
                            ? 'bg-blue-400 text-blue-950 border border-blue-500'
                            : quad === 'Cheap enablers'
                            ? 'bg-amber-400 text-amber-950 border border-amber-500'
                            : 'bg-slate-300 text-slate-800 border border-slate-400';

                        // Label offset class based on direction
                        const labelClass =
                          layout.labelPos === 'bottom'
                            ? 'top-full mt-1.5 left-1/2 -translate-x-1/2'
                            : layout.labelPos === 'left'
                            ? 'right-full mr-2 top-1/2 -translate-y-1/2'
                            : layout.labelPos === 'right'
                            ? 'left-full ml-2 top-1/2 -translate-y-1/2'
                            : 'bottom-full mb-1.5 left-1/2 -translate-x-1/2';

                        return (
                          <div
                            key={comp.id}
                            className="absolute z-20 group -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
                            style={{ left: `${xPct}%`, top: `${yPct}%` }}
                            onClick={() => setViewingComponent(comp)}
                            onMouseEnter={() => setHoveredBubble(comp)}
                            onMouseLeave={() => setHoveredBubble(null)}
                          >
                            <div
                              className={`rounded-full flex items-center justify-center shadow-xs transition-all ${colorClass}`}
                              style={{ width: `${bubbleSize}px`, height: `${bubbleSize}px` }}
                            />

                            {/* Uncluttered Label beside bubble */}
                            <div className={`absolute ${labelClass} pointer-events-none whitespace-nowrap z-20`}>
                              <span className="text-[10px] sm:text-[11px] font-medium text-gray-700 bg-white/80 px-1 py-0.5 rounded backdrop-blur-2xs shadow-2xs border border-gray-100/60">
                                {comp.name}
                              </span>
                            </div>

                            {/* Interactive Tooltip on hover (Light Theme) */}
                            {hoveredBubble?.id === comp.id && (
                              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 bg-white border border-gray-200/90 text-[#0D212C] p-3 rounded-xl shadow-xl text-left z-50 pointer-events-none animate-in fade-in duration-150">
                                <div className="text-xs font-semibold text-[#0D212C]">{comp.name}</div>
                                <div className="text-[10px] text-gray-500 mb-2">{comp.subtitle}</div>
                                <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1.5 border-t border-gray-100">
                                  <div>
                                    <span className="text-gray-400 block text-[9px] uppercase font-medium">Revenue</span>
                                    <span className="font-semibold text-emerald-600">{formatRevenue(allocatedRev)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-[9px] uppercase font-medium">Priority</span>
                                    <span className="font-medium text-amber-600">{formatPriority(comp)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-[9px] uppercase font-medium">Reuse</span>
                                    <span className="text-gray-700 font-medium">{actualReuse} solutions</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block text-[9px] uppercase font-medium">Quadrant</span>
                                    <span className="font-medium text-blue-600">{quad}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* X-Axis Ticks & Label */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[0.6875rem] text-gray-400 font-mono px-2 select-none">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <span key={num}>{num}</span>
                        ))}
                      </div>
                      <div className="text-center text-[0.75rem] font-medium text-gray-500 pt-1 tracking-wide select-none">
                        Reuse count (solutions) →
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Quadrant Thresholds & Legend Panel (without SHOW section) */}
              <div className="w-full lg:w-64 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                    QUADRANT THRESHOLDS
                  </h4>

                  {/* Reuse Split Slider with filled orange track */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Reuse split</span>
                      <span className="font-semibold text-[#ED4D19]">{reuseSplit} solutions</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="7"
                      step="0.5"
                      value={reuseSplit}
                      onChange={(e) => setReuseSplit(parseFloat(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #ED4D19 0%, #ED4D19 ${(reuseSplit / 7) * 100}%, #e5e7eb ${(reuseSplit / 7) * 100}%, #e5e7eb 100%)`,
                      }}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#ED4D19]"
                    />
                  </div>

                  {/* Revenue Split Slider with filled orange track */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Revenue split</span>
                      <span className="font-semibold text-[#ED4D19]">${revenueSplit.toFixed(1)}M</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      value={revenueSplit}
                      onChange={(e) => setRevenueSplit(parseFloat(e.target.value))}
                      style={{
                        background: `linear-gradient(to right, #ED4D19 0%, #ED4D19 ${(revenueSplit / 50) * 100}%, #e5e7eb ${(revenueSplit / 50) * 100}%, #e5e7eb 100%)`,
                      }}
                      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#ED4D19]"
                    />
                  </div>

                  {/* Reset to median button - text-only in orange, disabled until adjusted */}
                  <div>
                    <button
                      type="button"
                      disabled={!isMedianAdjusted}
                      onClick={() => {
                        setReuseSplit(3);
                        setRevenueSplit(10.4);
                      }}
                      className={`inline-flex items-center gap-1.5 p-0 bg-transparent border-0 text-xs font-medium transition-colors ${
                        isMedianAdjusted
                          ? 'text-[#ED4D19] hover:text-[#C93B0E] hover:underline cursor-pointer'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isMedianAdjusted ? 'text-[#ED4D19]' : 'text-gray-300'}`} />
                      <span>Reset to median</span>
                    </button>
                  </div>
                </div>

                {/* Legend - Without Completed item */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <h4 className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider">
                    LEGEND
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-gray-700">Build first</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-gray-700">High Value</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-gray-700">Cheap enablers</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
                      <span className="text-gray-700">Defer</span>
                    </div>
                  </div>
                  <p className="text-[0.6875rem] text-gray-400 leading-relaxed pt-1">
                    Bubble size = effort (person-days). Hover a bubble for details.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* TABLE VIEW: With Allocated Revenue, Build Priority, and Quadrant added after REUSE */
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200/90 shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200 text-[0.6875rem] font-normal text-gray-500 tracking-wider uppercase">
                        {/* Component */}
                        <th 
                          className="py-3 px-6 font-normal cursor-pointer select-none group hover:text-gray-900 transition-colors"
                          onClick={() => handleTableColumnSort('name')}
                        >
                          <div className="inline-flex items-center gap-1.5">
                            <span>COMPONENT</span>
                            <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 shrink-0" />
                          </div>
                        </th>

                        {/* Category */}
                        <th 
                          className="py-3 px-6 font-normal cursor-pointer select-none group hover:text-gray-900 transition-colors"
                          onClick={() => handleTableColumnSort('category')}
                        >
                          <div className="inline-flex items-center gap-1.5">
                            <span>CATEGORY</span>
                            <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 shrink-0" />
                          </div>
                        </th>
                        
                        {/* Complexity with Info Tooltip & Sort */}
                        <th 
                          className="py-3 px-6 font-normal text-center cursor-pointer select-none group hover:text-gray-900 transition-colors"
                          onClick={() => handleTableColumnSort('complexity')}
                        >
                          <div className="inline-flex items-center justify-center gap-1.5 relative">
                            <span>COMPLEXITY</span>
                            <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 shrink-0" />
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
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

                        {/* Effort with Info Tooltip & Sort */}
                        <th 
                          className="py-3 px-6 font-normal text-center cursor-pointer select-none group hover:text-gray-900 transition-colors"
                          onClick={() => handleTableColumnSort('effort')}
                        >
                          <div className="inline-flex items-center justify-center gap-1.5 relative">
                            <span>EFFORT · 1 FTE</span>
                            <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 shrink-0" />
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
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

                        {/* Reuse with Info Tooltip & Sort */}
                        <th 
                          className="py-3 px-6 font-normal text-center cursor-pointer select-none group hover:text-gray-900 transition-colors"
                          onClick={() => handleTableColumnSort('reuse')}
                        >
                          <div className="inline-flex items-center justify-center gap-1.5 relative">
                            <span>REUSE</span>
                            <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 shrink-0" />
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
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

                        {/* Allocated Revenue with Info Tooltip & Sort */}
                        <th 
                          className="py-3 px-6 font-normal text-center cursor-pointer select-none group hover:text-gray-900 transition-colors"
                          onClick={() => handleTableColumnSort('revenue')}
                        >
                          <div className="inline-flex items-center justify-center gap-1.5 relative">
                            <span>ALLOCATED REVENUE</span>
                            <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 shrink-0" />
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={() => setActiveTooltip('allocatedRevenue')}
                              onMouseLeave={() => setActiveTooltip(null)}
                              className="text-gray-400 hover:text-gray-600 cursor-help border-0 bg-transparent p-0"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            {activeTooltip === 'allocatedRevenue' && (
                              <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0D212C] text-white text-[0.75rem] font-normal rounded-lg shadow-xl z-50 text-center whitespace-nowrap normal-case">
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0D212C]" />
                                Addressable 3-year revenue attributed to this component
                              </div>
                            )}
                          </div>
                        </th>

                        {/* Build Priority with Info Tooltip & Sort */}
                        <th 
                          className="py-3 px-6 font-normal text-center cursor-pointer select-none group hover:text-gray-900 transition-colors"
                          onClick={() => handleTableColumnSort('priority')}
                        >
                          <div className="inline-flex items-center justify-center gap-1.5 relative">
                            <span>BUILD PRIORITY</span>
                            <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 shrink-0" />
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={() => setActiveTooltip('buildPriority')}
                              onMouseLeave={() => setActiveTooltip(null)}
                              className="text-gray-400 hover:text-gray-600 cursor-help border-0 bg-transparent p-0"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                            {activeTooltip === 'buildPriority' && (
                              <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#0D212C] text-white text-[0.75rem] font-normal rounded-lg shadow-xl z-50 text-center whitespace-nowrap normal-case">
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0D212C]" />
                                Allocated revenue generated per person-day of effort
                              </div>
                            )}
                          </div>
                        </th>

                        {/* Quadrant with Sort */}
                        <th 
                          className="py-3 px-6 font-normal text-center cursor-pointer select-none group hover:text-gray-900 transition-colors"
                          onClick={() => handleTableColumnSort('quadrant')}
                        >
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <span>QUADRANT</span>
                            <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 shrink-0" />
                          </div>
                        </th>

                        {/* Status with Sort */}
                        <th 
                          className="py-3 px-6 font-normal text-center cursor-pointer select-none group hover:text-gray-900 transition-colors"
                          onClick={() => handleTableColumnSort('status')}
                        >
                          <div className="inline-flex items-center justify-center gap-1.5">
                            <span>STATUS</span>
                            <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-700 shrink-0" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[0.875rem]">
                      {paginatedComponents.map((comp) => {
                        const actualReuse = (reuseMatrix[comp.id] || []).length || comp.reuseCount || 0;
                        const compComplexity = comp.complexity || (actualReuse >= 6 ? 'High' : actualReuse >= 4 ? 'Medium' : 'Low');
                        const compEffort = comp.effort || (actualReuse >= 6 ? '~50 pd' : actualReuse >= 4 ? '~20 pd' : '~12 pd');
                        const allocatedRev = comp.allocatedRevenue ?? 0;

                        return (
                          <tr 
                            key={comp.id} 
                            onClick={() => setViewingComponent(comp)}
                            className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                          >
                            {/* Name & Subtitle */}
                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="font-normal text-[#0D212C] text-[0.8125rem] group-hover:text-[#ED4D19] transition-colors">
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

                            {/* Allocated Revenue */}
                            <td className="py-4 px-6 text-center">
                              <span className="font-normal text-[#0D212C] text-[0.8125rem]">
                                {formatRevenue(allocatedRev)}
                              </span>
                            </td>

                            {/* Build Priority */}
                            <td className="py-4 px-6 text-center">
                              <span className="font-normal text-[#0D212C] text-[0.8125rem]">
                                {formatPriority(comp)}
                              </span>
                            </td>

                            {/* Quadrant as normal text (not chip), 1 row shows High Value, other rows show Defer */}
                            <td className="py-4 px-6 text-center">
                              <span className="font-normal text-[#0D212C] text-[0.8125rem]">
                                {comp.id === 'c4' ? 'High Value' : 'Defer'}
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
        </div>
      )}

      {/* TAB 2: BUILD IMPACT */}
      {activeTab === 'impact' && (
        <div className="space-y-4">
          {/* Solutions Progress Section */}
          <div className="space-y-3.5">
            {/* Top Row: Title on Left, Search Bar & Status Filter on Right */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-[0.9375rem] font-semibold text-[#0D212C] font-['Poppins']">
                Solution progress
              </h3>

              {/* Right side: Search Bar + Filter by Status dropdown */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-56 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={impactSearch}
                    onChange={(e) => setImpactSearch(e.target.value)}
                    placeholder="Search solutions..."
                    className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-[0.8125rem] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300 transition-colors shadow-2xs"
                  />
                </div>

                {/* Filter by Status Button / Dropdown on Right Side of Search Bar */}
                <div className="relative min-w-[116px] shrink-0" ref={impactFilterRef}>
                  <button
                    type="button"
                    onClick={() => setIsImpactFilterOpen(!isImpactFilterOpen)}
                    className="w-full flex items-center justify-between gap-2.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-[0.8125rem] text-gray-700 font-normal hover:bg-gray-50 focus:outline-none focus:border-gray-300 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>
                        {impactSort === 'all' ? 'Filters' : impactSort === 'in_progress' ? 'In progress' : 'Unlocked'}
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${isImpactFilterOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isImpactFilterOpen && (
                    <div className="absolute top-full mt-1 right-0 min-w-full w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
                      {([
                        { value: 'all', label: 'All statuses' },
                        { value: 'in_progress', label: 'In progress' },
                        { value: 'unlocked', label: 'Unlocked' },
                      ] as const).map((opt) => (
                        <button 
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setImpactSort(opt.value);
                            setIsImpactFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-1.5 text-[0.8125rem] flex items-center justify-between cursor-pointer transition-colors ${
                            impactSort === opt.value
                              ? 'bg-gray-100 text-gray-900 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {impactSort === opt.value && <Check className="w-3.5 h-3.5 text-gray-700" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid of Solution Cards (3 columns on desktop) with Subtle Light Orange Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSolutionImpactStatuses.length === 0 ? (
                <div className="col-span-full py-10 text-center text-xs text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                  No solutions found matching "{impactSearch}".
                </div>
              ) : (
                filteredSolutionImpactStatuses.map((sol) => (
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
                          <span className="font-semibold text-[#ED4D19]">{sol.revenue3Yr}</span> <span className="text-gray-400 text-[0.6875rem] font-normal">(3 - YR)</span> · ~${sol.annualRevCalculated}M/yr
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 font-normal">
                          {sol.builtReq} of {sol.totalReq} components built
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
