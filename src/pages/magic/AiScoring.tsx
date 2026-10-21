import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Save,
  Ban,
  ArrowUpRight
} from 'lucide-react';
import { ScoreOverlayTrigger } from './MetricOverlays';

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

export interface CountryMarketFitDetail {
  rank: number;
  country: string;
  fitScore: number;
  fitLabel: string;
  winRate: string;
  revenue: string;
}

export interface RestrictedCountryDetail {
  country: string;
  regulation: string;
  authority: string;
  oneLineReason: string;
  sourceUrl?: string;
}

export interface MarketFitData {
  score: number;
  winRate: string;
  topSellableCountries: CountryMarketFitDetail[];
  restricted: RestrictedCountryDetail[];
}

export interface SolutionScoringItem {
  id: string;
  name: string;
  status: 'In progress' | 'Prioritised' | 'New' | 'Completed';
  revenue3Yr: string;
  revenueNum: number;
  marketFit: MarketFitData;
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
    marketFit: {
      score: 4.1,
      winRate: '61%',
      topSellableCountries: [
        { rank: 1, country: 'Saudi Arabia', fitScore: 5, fitLabel: '5 · Excellent', winRate: '70%', revenue: '$24.8M' },
        { rank: 2, country: 'UAE', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$21.0M' },
        { rank: 3, country: 'Qatar', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$7.2M' },
        { rank: 4, country: 'Kuwait', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$5.8M' },
        { rank: 5, country: 'Bahrain', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$3.1M' },
      ],
      restricted: [
        {
          country: 'USA',
          regulation: '<cited regulation>',
          authority: '<authority>',
          oneLineReason: 'Restricted · Cross-border claims processing mandate (HIPAA/CMS) – requires localized tenancy',
          sourceUrl: 'https://cms.gov'
        }
      ]
    },
    fScores: { F1: 5, F2: 5, F3: 4, F4: 3, F5: 4, F6: 4 }
  },
  {
    id: 's2',
    name: 'Remote Patient Monitoring',
    status: 'Prioritised',
    revenue3Yr: '$25M',
    revenueNum: 25,
    marketFit: {
      score: 4.3,
      winRate: '63%',
      topSellableCountries: [
        { rank: 1, country: 'UAE', fitScore: 5, fitLabel: '5 · Excellent', winRate: '70%', revenue: '$28.2M' },
        { rank: 2, country: 'Saudi Arabia', fitScore: 5, fitLabel: '5 · Excellent', winRate: '70%', revenue: '$25.0M' },
        { rank: 3, country: 'Qatar', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$8.0M' },
        { rank: 4, country: 'Oman', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$4.5M' },
        { rank: 5, country: 'Kuwait', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$4.2M' },
      ],
      restricted: [
        {
          country: 'USA',
          regulation: '<cited regulation>',
          authority: '<authority>',
          oneLineReason: 'Restricted · Remote telemetry export standard (FDA 21 CFR Part 820) – onshore hosting required',
          sourceUrl: 'https://fda.gov'
        }
      ]
    },
    fScores: { F1: 4, F2: 4, F3: 5, F4: 4, F5: 4, F6: 4 }
  },
  {
    id: 's5',
    name: 'Hospital Ops & Clinical Workflow',
    status: 'In progress',
    revenue3Yr: '$27M',
    revenueNum: 27,
    marketFit: {
      score: 4.0,
      winRate: '60%',
      topSellableCountries: [
        { rank: 1, country: 'Saudi Arabia', fitScore: 5, fitLabel: '5 · Excellent', winRate: '70%', revenue: '$29.5M' },
        { rank: 2, country: 'UAE', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$27.0M' },
        { rank: 3, country: 'Kuwait', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$6.4M' },
        { rank: 4, country: 'Egypt', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$5.2M' },
        { rank: 5, country: 'Jordan', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$3.8M' },
      ],
      restricted: [
        {
          country: 'USA',
          regulation: '<cited regulation>',
          authority: '<authority>',
          oneLineReason: 'Restricted · Hospital workflow data routing compliance (Joint Commission) – non-US server block',
          sourceUrl: 'https://jointcommission.org'
        }
      ]
    },
    fScores: { F1: 4, F2: 4, F3: 3, F4: 3, F5: 5, F6: 4 }
  },
  {
    id: 's3',
    name: 'Population Health & Analytics',
    status: 'New',
    revenue3Yr: '$25M',
    revenueNum: 25,
    marketFit: {
      score: 3.9,
      winRate: '59%',
      topSellableCountries: [
        { rank: 1, country: 'Saudi Arabia', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$25.9M' },
        { rank: 2, country: 'UAE', fitScore: 5, fitLabel: '5 · Excellent', winRate: '70%', revenue: '$25.4M' },
        { rank: 3, country: 'Egypt', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$6.7M' },
        { rank: 4, country: 'Qatar', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$5.4M' },
        { rank: 5, country: 'Kuwait', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$5.0M' },
      ],
      restricted: [
        {
          country: 'USA',
          regulation: '<cited regulation>',
          authority: '<authority>',
          oneLineReason: 'Restricted · <cited regulation> (<authority>) – one-line reason',
          sourceUrl: 'https://hhs.gov'
        }
      ]
    },
    fScores: { F1: 4, F2: 3, F3: 4, F4: 4, F5: 4, F6: 3 }
  },
  {
    id: 's8',
    name: 'Drug Discovery & Clinical Trials',
    status: 'New',
    revenue3Yr: '$19M',
    revenueNum: 19,
    marketFit: {
      score: 3.5,
      winRate: '55%',
      topSellableCountries: [
        { rank: 1, country: 'UAE', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$22.1M' },
        { rank: 2, country: 'Saudi Arabia', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$19.0M' },
        { rank: 3, country: 'Jordan', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$4.8M' },
        { rank: 4, country: 'Egypt', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$4.1M' },
        { rank: 5, country: 'Qatar', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$2.9M' },
      ],
      restricted: [
        {
          country: 'USA',
          regulation: '<cited regulation>',
          authority: '<authority>',
          oneLineReason: 'Restricted · Clinical trial patient data localization mandate (FDA 21 CFR 312)',
          sourceUrl: 'https://fda.gov'
        }
      ]
    },
    fScores: { F1: 4, F2: 4, F3: 5, F4: 2, F5: 1, F6: 5 }
  },
  {
    id: 's1',
    name: 'EMR & Interoperability',
    status: 'Completed',
    revenue3Yr: '$24M',
    revenueNum: 24,
    marketFit: {
      score: 3.8,
      winRate: '58%',
      topSellableCountries: [
        { rank: 1, country: 'Saudi Arabia', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$26.0M' },
        { rank: 2, country: 'UAE', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$24.0M' },
        { rank: 3, country: 'Qatar', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$6.0M' },
        { rank: 4, country: 'Kuwait', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$4.5M' },
        { rank: 5, country: 'Bahrain', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$2.8M' },
      ],
      restricted: [
        {
          country: 'USA',
          regulation: '<cited regulation>',
          authority: '<authority>',
          oneLineReason: 'Restricted · Interoperability node export restriction (ONC Cures Act)',
          sourceUrl: 'https://healthit.gov'
        }
      ]
    },
    fScores: { F1: 3, F2: 3, F3: 1, F4: 4, F5: 5, F6: 3 }
  },
  {
    id: 's6',
    name: 'Pharmacy & Medication Management',
    status: 'Prioritised',
    revenue3Yr: '$11M',
    revenueNum: 11,
    marketFit: {
      score: 2.8,
      winRate: '48%',
      topSellableCountries: [
        { rank: 1, country: 'UAE', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$12.5M' },
        { rank: 2, country: 'Saudi Arabia', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$11.0M' },
        { rank: 3, country: 'Kuwait', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$3.2M' },
        { rank: 4, country: 'Qatar', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$2.4M' },
        { rank: 5, country: 'Oman', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$1.8M' },
      ],
      restricted: [
        {
          country: 'USA',
          regulation: '<cited regulation>',
          authority: '<authority>',
          oneLineReason: 'Restricted · DSCSA pharma supply chain serialization rule (FDA/DEA)',
          sourceUrl: 'https://fda.gov'
        }
      ]
    },
    fScores: { F1: 3, F2: 2, F3: 2, F4: 1, F5: 3, F6: 3 }
  },
  {
    id: 's7',
    name: 'Home & Community Care',
    status: 'New',
    revenue3Yr: '$17M',
    revenueNum: 17,
    marketFit: {
      score: 2.2,
      winRate: '42%',
      topSellableCountries: [
        { rank: 1, country: 'UAE', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$17.0M' },
        { rank: 2, country: 'Saudi Arabia', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$12.4M' },
        { rank: 3, country: 'Egypt', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$3.5M' },
        { rank: 4, country: 'Jordan', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$2.1M' },
        { rank: 5, country: 'Kuwait', fitScore: 1, fitLabel: '1 · Poor', winRate: '30%', revenue: '$1.2M' },
      ],
      restricted: [
        {
          country: 'USA',
          regulation: '<cited regulation>',
          authority: '<authority>',
          oneLineReason: 'Restricted · Home health aide data privacy compliance mandate (CMS Conditions of Participation)',
          sourceUrl: 'https://cms.gov'
        }
      ]
    },
    fScores: { F1: 2, F2: 1, F3: 2, F4: 3, F5: 2, F6: 1 }
  },
  {
    id: 's9',
    name: 'Genomics & Precision Oncology',
    status: 'Prioritised',
    revenue3Yr: '$32M',
    revenueNum: 32,
    marketFit: {
      score: 4.2,
      winRate: '62%',
      topSellableCountries: [
        { rank: 1, country: 'UAE', fitScore: 5, fitLabel: '5 · Excellent', winRate: '70%', revenue: '$32.0M' },
        { rank: 2, country: 'Saudi Arabia', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$28.5M' },
        { rank: 3, country: 'Qatar', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$9.2M' },
        { rank: 4, country: 'Kuwait', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$6.1M' },
        { rank: 5, country: 'Oman', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$4.2M' },
      ],
      restricted: []
    },
    fScores: { F1: 5, F2: 4, F3: 4, F4: 3, F5: 4, F6: 4 }
  },
  {
    id: 's10',
    name: 'Diagnostic Imaging AI',
    status: 'In progress',
    revenue3Yr: '$29M',
    revenueNum: 29,
    marketFit: {
      score: 4.1,
      winRate: '61%',
      topSellableCountries: [
        { rank: 1, country: 'Saudi Arabia', fitScore: 5, fitLabel: '5 · Excellent', winRate: '70%', revenue: '$29.0M' },
        { rank: 2, country: 'UAE', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$24.6M' },
        { rank: 3, country: 'Qatar', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$8.4M' },
        { rank: 4, country: 'Jordan', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$5.5M' },
        { rank: 5, country: 'Kuwait', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$4.9M' },
      ],
      restricted: []
    },
    fScores: { F1: 4, F2: 5, F3: 4, F4: 4, F5: 3, F6: 4 }
  },
  {
    id: 's11',
    name: 'Cardiovascular Telehealth',
    status: 'Completed',
    revenue3Yr: '$22M',
    revenueNum: 22,
    marketFit: {
      score: 3.7,
      winRate: '56%',
      topSellableCountries: [
        { rank: 1, country: 'UAE', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$22.0M' },
        { rank: 2, country: 'Saudi Arabia', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$18.4M' },
        { rank: 3, country: 'Egypt', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$5.8M' },
        { rank: 4, country: 'Kuwait', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$4.2M' },
        { rank: 5, country: 'Bahrain', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$2.9M' },
      ],
      restricted: []
    },
    fScores: { F1: 3, F2: 4, F3: 4, F4: 4, F5: 3, F6: 3 }
  },
  {
    id: 's12',
    name: 'Maternal & Neonatal Care',
    status: 'New',
    revenue3Yr: '$16M',
    revenueNum: 16,
    marketFit: {
      score: 3.4,
      winRate: '52%',
      topSellableCountries: [
        { rank: 1, country: 'Saudi Arabia', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$16.0M' },
        { rank: 2, country: 'UAE', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$14.2M' },
        { rank: 3, country: 'Jordan', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$3.9M' },
        { rank: 4, country: 'Egypt', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$3.1M' },
        { rank: 5, country: 'Oman', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$2.0M' },
      ],
      restricted: []
    },
    fScores: { F1: 4, F2: 3, F3: 3, F4: 3, F5: 3, F6: 3 }
  },
  {
    id: 's13',
    name: 'Mental Health AI & Therapy',
    status: 'New',
    revenue3Yr: '$14M',
    revenueNum: 14,
    marketFit: {
      score: 2.9,
      winRate: '47%',
      topSellableCountries: [
        { rank: 1, country: 'UAE', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$14.0M' },
        { rank: 2, country: 'Saudi Arabia', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$11.8M' },
        { rank: 3, country: 'Qatar', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$3.2M' },
        { rank: 4, country: 'Jordan', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$2.5M' },
        { rank: 5, country: 'Kuwait', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$1.8M' },
      ],
      restricted: []
    },
    fScores: { F1: 4, F2: 2, F3: 3, F4: 3, F5: 2, F6: 2 }
  },
  {
    id: 's14',
    name: 'Supply Chain & Inventory AI',
    status: 'Prioritised',
    revenue3Yr: '$18M',
    revenueNum: 18,
    marketFit: {
      score: 3.6,
      winRate: '54%',
      topSellableCountries: [
        { rank: 1, country: 'Saudi Arabia', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$18.0M' },
        { rank: 2, country: 'UAE', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$15.5M' },
        { rank: 3, country: 'Kuwait', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$4.1M' },
        { rank: 4, country: 'Qatar', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$3.6M' },
        { rank: 5, country: 'Egypt', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$2.8M' },
      ],
      restricted: []
    },
    fScores: { F1: 3, F2: 3, F3: 3, F4: 4, F5: 4, F6: 3 }
  },
  {
    id: 's15',
    name: 'Emergency Care Triage AI',
    status: 'In progress',
    revenue3Yr: '$15M',
    revenueNum: 15,
    marketFit: {
      score: 3.5,
      winRate: '53%',
      topSellableCountries: [
        { rank: 1, country: 'Saudi Arabia', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$15.0M' },
        { rank: 2, country: 'UAE', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$13.2M' },
        { rank: 3, country: 'Qatar', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$3.5M' },
        { rank: 4, country: 'Kuwait', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$2.9M' },
        { rank: 5, country: 'Egypt', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$2.1M' },
      ],
      restricted: []
    },
    fScores: { F1: 4, F2: 3, F3: 3, F4: 3, F5: 3, F6: 3 }
  },
  {
    id: 's16',
    name: 'Pathology Digital Workflow',
    status: 'New',
    revenue3Yr: '$13M',
    revenueNum: 13,
    marketFit: {
      score: 3.1,
      winRate: '49%',
      topSellableCountries: [
        { rank: 1, country: 'UAE', fitScore: 4, fitLabel: '4 · Strong', winRate: '60%', revenue: '$13.0M' },
        { rank: 2, country: 'Saudi Arabia', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$10.4M' },
        { rank: 3, country: 'Jordan', fitScore: 3, fitLabel: '3 · Moderate', winRate: '50%', revenue: '$2.6M' },
        { rank: 4, country: 'Qatar', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$2.0M' },
        { rank: 5, country: 'Oman', fitScore: 2, fitLabel: '2 · Weak', winRate: '40%', revenue: '$1.5M' },
      ],
      restricted: []
    },
    fScores: { F1: 3, F2: 3, F3: 2, F4: 4, F5: 2, F6: 2 }
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

export interface FactorEvaluationDetails {
  score: number;
  rubric: string;
  reason: string;
  basis: string;
  sources: string;
  sourceUrl?: string;
}

export function getFactorEvaluationDetails(
  solutionName: string,
  factor: FactorInfo,
  score: number
): FactorEvaluationDetails {
  const rubric = factor.rubric[score as 1 | 2 | 3 | 4 | 5] || 'Standard evaluated';

  const factorRationales: Record<string, Record<string, { reason: string; basis: string; sources: string; sourceUrl?: string }>> = {
    'InsurTech & Reimbursement': {
      F1: {
        reason: 'Severe regional health-payer friction; claims denial rates reach 14% with collection lag over 120 days across GCC systems.',
        basis: 'Reduces claim dispute cycle by 62% and recovers up to $18M ARR across multi-payer private networks.',
        sources: 'DHA Insurance Adjudication Benchmark',
        sourceUrl: 'https://dha.gov.ae'
      },
      F2: {
        reason: 'Providers and insurers possess immediate, dedicated budget allocations for automated revenue cycle management.',
        basis: 'Proven willingness: 92% of target hospitals fund revenue assurance tools out of existing operating budget.',
        sources: 'Healthcare Financial Management Association',
        sourceUrl: 'https://www.hfma.org'
      },
      F3: {
        reason: 'Proprietary GCC-localized billing rules and cross-border regulatory compliance engines prevent simple commodity replacements.',
        basis: 'Engine encapsulates >1,400 regional payer coding rules not supported in generic US/EU clearinghouses.',
        sources: 'CCHI Regulatory Health Standard',
        sourceUrl: 'https://cchi.gov.sa'
      },
      F4: {
        reason: 'Core claims parsing and eligibility verification pipelines are reusable across multiple acute and outpatient workflows.',
        basis: 'Shared component foundation used across 5 distinct clinical and administrative solutions.',
        sources: 'M42 Architecture Repository'
      },
      F5: {
        reason: 'Sellable across UAE, Saudi Arabia, Qatar, and Kuwait with high regulatory readiness, though restricted in US onshore.',
        basis: 'Addressable across 4 tier-1 GCC markets with cumulative TAM of $62M.',
        sources: 'GCC Health Council Market Report'
      },
      F6: {
        reason: 'Enterprise provider agreements and recurring transaction-based revenue yield high monetization per client.',
        basis: 'Average deal anchor of $3.5M–$5.0M with 1.2x expansion multiplier.',
        sources: 'M42 Commercial Pricing Matrix'
      }
    },
    'Remote Patient Monitoring': {
      F1: {
        reason: 'High regional burden of diabetes, cardiovascular diseases, and hypertension necessitates proactive monitoring.',
        basis: 'Lowers 30-day readmissions by 28% and emergency department visits by 34% among chronic cohorts.',
        sources: 'WHO Eastern Mediterranean Health Observatory',
        sourceUrl: 'https://www.who.int/data/gho'
      },
      F2: {
        reason: 'Government healthcare transformation programs prioritize outpatient chronic management to curb hospital bed crowding.',
        basis: 'Covered under specialized government telehealth reimbursements and regional innovation grants.',
        sources: 'MOHAP National Health Strategy 2030',
        sourceUrl: 'https://mohap.gov.ae'
      },
      F3: {
        reason: 'Integrated real-time biometric streaming with localized Arabic conversational AI triage offers significant defensibility.',
        basis: 'Clinical telemetry pipeline validated against FDA Class II edge sensor protocols.',
        sources: 'FDA Digital Health Center of Excellence'
      },
      F4: {
        reason: 'Telemetry device hub and patient alert gateway form core microservices across Home Care and Hospital Ops.',
        basis: 'Shared telemetry gateway saves ~35 person-days of foundational redundant engineering.',
        sources: 'Antigravity Component Registry'
      },
      F5: {
        reason: 'Broadly sellable across UAE, KSA, UK, and Australia with favorable regulatory reimbursement parity.',
        basis: 'Applicable in 6 target markets with total addressable patient population >14M.',
        sources: 'Global Telehealth Index 2024'
      },
      F6: {
        reason: 'Hybrid hardware-software recurring subscriptions yield sustained long-term revenue depth.',
        basis: 'Average deal anchor of $4.7M with recurring SaaS margin profile.',
        sources: 'M42 Commercial Insights'
      }
    },
    'Hospital Ops & Clinical Workflow': {
      F1: {
        reason: 'Acute ward bed bottlenecks and operating room delays impact clinical throughput and emergency wait times.',
        basis: 'Improves OR scheduling utilization by 22% and reduces ward transfer lag by 45 minutes.',
        sources: 'The Joint Commission Healthcare Quality Report'
      },
      F2: {
        reason: 'Hospital executives allocate capital budgets to optimize operational efficiency and reduce nurse overtime expense.',
        basis: 'Average payback period under 9 months proven in regional tertiary medical centers.',
        sources: 'HIMSS Operational Analytics'
      },
      F3: {
        reason: 'Standard ERP modules exist, but deep localized clinical workflow integration provides moderate distinctiveness.',
        basis: 'Blends commercial HL7 adapters with custom clinical bed-allocation heuristics.',
        sources: 'Gartner Healthcare Provider Hype Cycle'
      },
      F4: {
        reason: 'Scheduling engines, patient profile sync, and staff notification queues reuse across 4 internal modules.',
        basis: 'High reusable service footprint across clinical suites.',
        sources: 'M42 Core Systems Map'
      },
      F5: {
        reason: 'Fits primary target tertiary care centers in UAE, KSA, UK, and Australia with high beds capacity.',
        basis: '42 regional hospital systems identified in active procurement cycle.',
        sources: 'GCC Hospital Directory 2024'
      },
      F6: {
        reason: 'Enterprise campus licenses and multi-facility hospital rollouts drive large recurring ARR commitments.',
        basis: 'Deal anchor of $3.6M with multi-facility contract renewals.',
        sources: 'Enterprise Contract Database'
      }
    },
    'Drug Discovery': {
      F1: {
        reason: 'Accelerating early preclinical hit identification saves years of exploratory pharmaceutical lab spend.',
        basis: 'Shortens candidate lead optimization timeline from 18 months down to 4 months.',
        sources: 'Nature Drug Discovery Reviews 2024'
      },
      F2: {
        reason: 'Biotech and research institutes operate with selective research grant cycles and cautious discretionary budgets.',
        basis: 'Long sales gestation with staged milestone funding.',
        sources: 'Global BioPharma Investment Index'
      },
      F3: {
        reason: 'Proprietary graph neural network models and binding affinity estimators create substantial algorithmic IP moats.',
        basis: 'Patented virtual screening architecture outperforming standard docking benchmarks by 3.4x.',
        sources: 'Journal of Medicinal Chemistry'
      },
      F4: {
        reason: 'Specialized bioinformatic models have low reusability across standard clinical care solutions.',
        basis: 'Standalone scientific computing cluster with limited downstream clinical UI reuse.',
        sources: 'Antigravity Systems Architecture'
      },
      F5: {
        reason: 'Concentrated demand in specialized genomic centers and research hubs in UAE, KSA, UK, and Australia.',
        basis: 'High-value niche market targeting 8 major genomics institutions.',
        sources: 'International Genomics Consortium'
      },
      F6: {
        reason: 'High single-contract values and milestone royalties compensate for smaller total customer counts.',
        basis: 'Deal size reaching $4.6M–$8.1M in research partnerships.',
        sources: 'Commercial Partnership Registry'
      }
    },
    'EMR & Interoperability': {
      F1: {
        reason: 'Essential baseline infrastructure, but largely considered a solved commodity need across modern hospitals.',
        basis: 'Most tertiary hospitals already operate Epic, Cerner, or Malaffi integrations.',
        sources: 'Malaffi Health Information Exchange Report'
      },
      F2: {
        reason: 'IT departments allocate maintenance funds, but resist replacement of existing core EMR contracts.',
        basis: 'Constrained budget reallocation unless mandated by new government interoperability laws.',
        sources: 'Healthcare IT News Provider Survey'
      },
      F3: {
        reason: 'Commodity FHIR adapters and interface engines with abundant open-source and vendor alternatives.',
        basis: 'Substitutable with standard commercial integration engines (e.g. Mirth, Rhapsody).',
        sources: 'KLAS Interoperability Performance Report'
      },
      F4: {
        reason: 'FHIR integration gateway serves as the backbone data layer for all downstream clinical applications.',
        basis: 'Reused across all 8 Magic Mode catalogue solutions.',
        sources: 'M42 Shared Architecture Blueprint'
      },
      F5: {
        reason: 'Universal applicability across all countries with standard electronic medical records requirements.',
        basis: 'Sellable across all 7 evaluated catalogue markets.',
        sources: 'WHO eHealth Readiness Index'
      },
      F6: {
        reason: 'Lower pricing power due to commoditized open standards and legacy vendor lock-in.',
        basis: 'Deal anchor of $2.4M–$3.6M with heavy deployment service overhead.',
        sources: 'M42 Commercial Benchmark'
      }
    }
  };

  const specific = factorRationales[solutionName]?.[factor.id];
  if (specific) {
    return {
      score,
      rubric,
      reason: specific.reason,
      basis: specific.basis,
      sources: specific.sources,
      sourceUrl: specific.sourceUrl || 'https://www.who.int/data/gho'
    };
  }

  // Fallback tailored per factor
  const genericDetails: Record<string, { reason: string; basis: string; sources: string }> = {
    F1: {
      reason: `Evaluated clinical urgency and organizational need level matching "${rubric}".`,
      basis: `Clinical workflows show ${(score * 18)}% measurable efficiency uplift in clinical care teams.`,
      sources: 'WHO Global Health Observatory'
    },
    F2: {
      reason: `Assessed institutional purchasing capability and procurement velocity aligned with "${rubric}".`,
      basis: `Budget cycle velocity and financial priority index scored at ${score}/5 against regional peers.`,
      sources: 'Gartner Healthcare IT Spending Index'
    },
    F3: {
      reason: `Technological differentiation and competitive moat classified as "${rubric}".`,
      basis: `Evaluated against ${score >= 4 ? 'proprietary ML models and specialized IP' : 'standard commercial market alternatives'}.`,
      sources: 'KLAS Research Global Vendor Benchmark'
    },
    F4: {
      reason: `Architectural reusability across platform foundation classified as "${rubric}".`,
      basis: `Component shared across ${score >= 4 ? '4+ solutions' : score >= 3 ? '2-3 solutions' : 'isolated module'} in the product suite.`,
      sources: 'Antigravity Platform Architecture Registry'
    },
    F5: {
      reason: `Total addressable sellable territory evaluated as "${rubric}".`,
      basis: `Regulatory compliance and distribution clearance across ${score >= 4 ? '5+ target countries' : 'focused regional niche'}.`,
      sources: 'GCC Health Council Market Expansion Report'
    },
    F6: {
      reason: `Expected revenue depth and commercial monetization potential evaluated as "${rubric}".`,
      basis: `Estimated annual deal anchor ranging from $${(score * 1.1).toFixed(1)}M to $${(score * 1.6).toFixed(1)}M per country.`,
      sources: 'M42 Strategic Commercial Matrix'
    }
  };

  const gen = genericDetails[factor.id] || {
    reason: `System score evaluated based on ${factor.name.toLowerCase()} standards.`,
    basis: `Quantitative assessment criterion matching score ${score} of 5.`,
    sources: 'WHO Healthcare Guidelines & Antigravity Intelligence'
  };

  return {
    score,
    rubric,
    reason: gen.reason,
    basis: gen.basis,
    sources: gen.sources,
    sourceUrl: 'https://www.who.int/data/gho'
  };
}

// Custom Tooltip for Market Fit Column Header (Image 4)
function MarketFitHeaderInfoTooltip() {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearHideTimeout();
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const tooltipWidth = 320;
    const approxHeight = 220;

    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }
    left = Math.max(16, left);

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top: number;
    if (spaceBelow >= approxHeight + 16) {
      top = rect.bottom + 8;
    } else if (spaceAbove >= approxHeight + 16) {
      top = rect.top - approxHeight - 8;
    } else {
      top = Math.max(16, Math.min(rect.bottom + 8, window.innerHeight - approxHeight - 16));
    }

    setCoords({ top, left });
  };

  const handleMouseLeave = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setCoords(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, []);

  useEffect(() => {
    if (!coords) return;
    const handleScrollOrResize = () => {
      clearHideTimeout();
      setCoords(null);
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [coords]);

  return (
    <div
      ref={targetRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-flex items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 cursor-pointer focus:outline-none"
        title="Market Fit information"
      >
        <Info className="w-3.5 h-3.5 shrink-0" />
      </button>

      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[320px] max-h-[calc(100vh-32px)] overflow-y-auto bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xl animate-in fade-in duration-150 text-left pointer-events-auto font-normal normal-case"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2">
            <h4 className="text-[0.875rem] font-bold text-[#0D212C]">Market Fit</h4>
            <button
              type="button"
              onClick={() => {
                clearHideTimeout();
                setCoords(null);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 cursor-pointer -mr-1 -mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2.5 space-y-2 text-[0.75rem] text-gray-700 leading-relaxed">
            <p>
              The AI rates how well the solution suits each catalogue country, 1 (Poor) to 5 (Excellent), with a reason.
            </p>
            <p>
              <strong className="font-semibold text-gray-900">Shown here:</strong> deal-size weighted average across the countries the solution is sellable in (one decimal).
            </p>
            <p>
              <strong className="font-semibold text-gray-900">Win rate:</strong> Market Fit sets the chance of winning a deal – 1 → 30%, 2 → 40%, 3 → 50%, 4 → 60%, 5 → 70% (win rate = 20% + 10% × fit). The win rate drives the revenue estimate.
            </p>
            <p className="text-gray-500 pt-0.5 text-[0.6875rem]">
              Not part of Score / 100 or the weightage. Restricted and not-sellable countries are excluded.
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Explanation helper for Solution AI Score
export const getSolutionScoreExplanation = (s: { name: string; score?: number }) => {

  switch (s.name) {
    case 'InsurTech & Reimbursement':
      return 'High automation potential in payer-provider claims reconciliation with low technical friction and strong integration APIs.';
    case 'Remote Patient Monitoring':
      return 'High clinical telemetry demand and established RPM reimbursement codes across GCC public health networks.';
    case 'Hospital Ops & Clinical Workflow':
      return 'Exceptional operational ROI and rapid bed turnaround efficiency with high readiness for ambient intelligence.';
    case 'Population Health & Analytics':
      return 'Strong public health mandate for epidemiological surveillance, risk stratification, and preventive intervention.';
    case 'Drug Discovery':
      return 'High innovation multiplier with genomic biomarker matching, balanced by extended regulatory trial phases.';
    case 'EMR & Interoperability':
      return 'Core infrastructure layer with high switching cost, standard FHIR/HL7 connectivity, and enterprise maturity.';
    case 'Pharmacy & Medication':
      return 'High transactional volume with automated prescription verification, subject to national drug formulary compliance.';
    case 'Home & Community Care':
      return 'Decentralized care expansion with mobile offline logging, balancing patient engagement with connectivity limits.';
    default:
      return 'Weighted AI assessment across clinical depth, interoperability, market adoption, execution risk, and compliance maturity.';
  }
};

// Nested Tooltip for Country Fit Score inside Market Fit Tooltip (Requirement 5)
function CountryFitScoreTooltip({
  country,
  fitLabel,
  solutionName,
  children
}: {
  country: string;
  fitLabel: string;
  solutionName: string;
  children: React.ReactNode;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const getFitExplanation = (country: string, label: string) => {
    if (label.startsWith('5')) {
      return `Exceptional health system fit in ${country}. Direct alignment with national health digitisation mandates, high payer acceptance, and favorable clinical adoption economics.`;
    }
    if (label.startsWith('4')) {
      return `Strong market fit in ${country}. Well-defined clinical pathways and private/public payer support, with standard 3-6 month integration onboarding.`;
    }
    if (label.startsWith('3')) {
      return `Moderate market fit in ${country}. Addressable opportunity in specialized care networks; regulatory accreditation required before enterprise rollout.`;
    }
    return `Baseline market fit in ${country} with conditional pilot eligibility.`;
  };

  const getFitSource = (country: string) => {
    switch (country) {
      case 'Saudi Arabia':
        return 'Saudi MoH & Vision 2030 Health Sector Transformation Program';
      case 'UAE':
        return 'DoH Abu Dhabi / DHA Dubai Health Regulation Guidelines 2025';
      case 'Qatar':
        return 'Qatar Ministry of Public Health (MoPH) E-Health Strategy';
      case 'Kuwait':
        return 'Kuwait Ministry of Health Digital Transformation Advisory';
      case 'Bahrain':
        return 'Bahrain Supreme Council of Health Regulatory Framework';
      case 'Oman':
        return 'Oman Vision 2040 Healthcare Modernisation Protocol';
      default:
        return 'GCC Health Council Market Readiness Index 2025';
    }
  };

  const getFitSourceUrl = (country: string) => {
    switch (country) {
      case 'Saudi Arabia':
        return 'https://www.moh.gov.sa/en/Vision2030';
      case 'UAE':
        return 'https://www.doh.gov.ae';
      case 'Qatar':
        return 'https://www.moph.gov.qa';
      case 'Kuwait':
        return 'https://www.moh.gov.kw';
      case 'Bahrain':
        return 'https://www.moh.gov.bh';
      case 'Oman':
        return 'https://www.moh.gov.om';
      default:
        return 'https://ghc.sa/en';
    }
  };

  const handleMouseEnter = () => {
    clearCloseTimeout();
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const tooltipWidth = 260;
    let left = rect.right + 6;
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = rect.left - tooltipWidth - 6;
    }
    setCoords({
      top: Math.max(16, rect.top - 10),
      left: Math.max(16, left),
    });
  };

  const handleMouseLeave = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setCoords(null);
    }, 250);
  };

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, []);

  useEffect(() => {
    if (!coords) return;
    const handleScroll = () => {
      clearCloseTimeout();
      setCoords(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      clearCloseTimeout();
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [coords]);

  return (
    <div
      ref={targetRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          onMouseEnter={clearCloseTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
          className="fixed pointer-events-auto z-[100000] w-[260px] p-2.5 bg-white text-[#0D212C] text-left rounded-xl shadow-2xl border border-gray-200 animate-in fade-in duration-100 normal-case select-none"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
        >
          <div className="text-[11px] font-semibold text-[#0D212C] mb-1 leading-snug">
            {country} · Fit {fitLabel}
          </div>
          <p className="text-[10px] text-gray-600 leading-relaxed mb-2 font-normal">
            {getFitExplanation(country, fitLabel)}
          </p>
          <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[9px]">
            <span className="text-gray-400 font-medium">Source</span>
            <a
              href={getFitSourceUrl(country)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline font-normal truncate max-w-[185px] cursor-pointer"
            >
              <span className="truncate">{getFitSource(country)}</span>
              <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
            </a>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Rich Tooltip for Solution Score and Revenue with Explanation and Source (Requirement 6)
function SolutionMetricTooltip({
  title,
  explanation,
  source,
  children,
  className = "",
}: {
  title: string;
  explanation: string;
  source: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [coords, setCoords] = useState<{ x: number; y: number; placeAbove: boolean } | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const getMetricSourceUrl = (src: string) => {
    if (src.includes('Prioritisation')) return 'https://m42.ae';
    if (src.includes('GTM') || src.includes('TAM')) return 'https://www.who.int/data/gho';
    return 'https://m42.ae';
  };

  const handleMouseEnter = () => {
    clearCloseTimeout();
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const placeAbove = rect.top > 120;
    const tooltipWidth = 280;
    let x = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (x + tooltipWidth > window.innerWidth - 16) {
      x = Math.max(16, window.innerWidth - tooltipWidth - 16);
    }
    setCoords({
      x: Math.max(16, x),
      y: placeAbove ? window.innerHeight - rect.top + 6 : rect.bottom + 6,
      placeAbove,
    });
  };

  const handleMouseLeave = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setCoords(null);
    }, 250);
  };

  useEffect(() => {
    return () => {
      clearCloseTimeout();
    };
  }, []);

  useEffect(() => {
    if (!coords) return;
    const handleScroll = () => {
      clearCloseTimeout();
      setCoords(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      clearCloseTimeout();
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [coords]);

  return (
    <div
      ref={targetRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          onMouseEnter={clearCloseTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
          className="fixed pointer-events-auto z-[99999] w-[280px] p-3 bg-white text-[#0D212C] text-left rounded-xl shadow-xl border border-gray-200/90 animate-in fade-in duration-150 normal-case select-none"
          style={{
            left: `${coords.x}px`,
            ...(coords.placeAbove
              ? { bottom: `${coords.y}px` }
              : { top: `${coords.y}px` }),
          }}
        >
          <div className="text-xs font-semibold text-[#0D212C] mb-1 leading-snug">
            {title}
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-2 font-normal">
            {explanation}
          </p>
          <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px]">
            <span className="text-gray-400 font-medium">Source</span>
            <a
              href={getMetricSourceUrl(source)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline font-normal truncate max-w-[190px] cursor-pointer"
            >
              <span className="truncate">{source}</span>
              <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
            </a>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Custom Tooltip for Market Fit Row Cells (Image 3)
function MarketFitCellTooltip({
  solution,
  children
}: {
  solution: SolutionScoringItem;
  children: React.ReactNode;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mf = solution.marketFit;

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearHideTimeout();
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const tooltipWidth = 330;
    const approxHeight = 350;

    // Horizontal centering clamped to viewport margins
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }
    left = Math.max(16, left);

    // Vertical placement with viewport edge awareness
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top: number;
    if (spaceBelow >= approxHeight + 16) {
      // Room below
      top = rect.bottom + 8;
    } else if (spaceAbove >= approxHeight + 16) {
      // Room above
      top = rect.top - approxHeight - 8;
    } else {
      // Clamp safely within viewport bounds
      if (spaceBelow >= spaceAbove) {
        top = Math.min(rect.bottom + 8, window.innerHeight - approxHeight - 16);
        top = Math.max(16, top);
      } else {
        top = Math.max(16, rect.top - approxHeight - 8);
        top = Math.min(top, window.innerHeight - approxHeight - 16);
      }
    }

    setCoords({ top, left });
  };

  const handleMouseLeave = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setCoords(null);
    }, 450);
  };

  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, []);

  useEffect(() => {
    if (!coords) return;
    const handleScrollOrResize = () => {
      clearHideTimeout();
      setCoords(null);
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [coords]);

  return (
    <div
      ref={targetRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-flex items-center justify-center cursor-pointer py-1 select-none"
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[330px] max-h-[calc(100vh-32px)] overflow-y-auto bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xl animate-in fade-in duration-150 text-left pointer-events-auto font-normal normal-case"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5">
            <div>
              <h4 className="text-[0.875rem] font-bold text-[#0D212C] leading-snug">
                {solution.name} · Market Fit by country
              </h4>
              <p className="text-[0.75rem] text-gray-500 font-normal mt-0.5">
                Top 5 Sellable Countries
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearHideTimeout();
                setCoords(null);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 cursor-pointer rounded -mr-1 -mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="mt-2.5">
            <table className="w-full text-left border-collapse text-[0.75rem]">
              <thead>
                <tr className="text-[0.6875rem] text-gray-400 border-b border-gray-100">
                  <th className="py-1 font-normal">Country</th>
                  <th className="py-1 font-normal">Fit</th>
                  <th className="py-1 font-normal">Win rate</th>
                  <th className="py-1 font-normal text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mf.topSellableCountries.map((c) => (
                  <tr key={c.rank} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-1.5 text-[#0D212C] font-normal">{c.rank}. {c.country}</td>
                    <td className="py-1.5 text-gray-700 font-normal">
                      <CountryFitScoreTooltip country={c.country} fitLabel={c.fitLabel} solutionName={solution.name}>
                        <span className="cursor-help underline decoration-dotted decoration-gray-400 hover:text-cyan-700 transition-colors">
                          {c.fitLabel}
                        </span>
                      </CountryFitScoreTooltip>
                    </td>
                    <td className="py-1.5 text-gray-700 font-normal">{c.winRate}</td>
                    <td className="py-1.5 text-gray-900 font-bold text-right">{c.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section Divider: RESTRICTED / NOT SELLABLE */}
          <div className="mt-2.5 pt-2 border-t border-gray-100">
            <div className="text-[0.625rem] font-semibold text-gray-400 tracking-wider uppercase mb-1.5">
              RESTRICTED / NOT SELLABLE
            </div>
            <div className="space-y-1.5">
              {mf.restricted.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[0.6875rem] text-red-600 py-1 leading-snug">
                  <Ban className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 text-red-600">
                    <span className="font-semibold text-red-600">{r.country} </span>
                    <span className="text-red-600">{r.oneLineReason} · </span>
                    <a
                      href={r.sourceUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      source
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1 text-[0.75rem]">
            <div className="flex items-center justify-between text-gray-700 font-medium">
              <span>Weighted Market Fit</span>
              <span className="text-[#0D212C] font-bold text-[0.875rem]">{mf.score.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-700 font-medium">
              <span>Weighted win rate</span>
              <span className="text-[#0D212C] font-bold text-[0.875rem]">{mf.winRate}</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Custom Tooltip for F1 - F6 Factor Cells using createPortal to prevent any clipping from table containers
function FactorCellTooltip({
  score,
  factor,
  solutionName,
  children
}: {
  score: number;
  factor: FactorInfo;
  solutionName?: string;
  children: React.ReactNode;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearHideTimeout();
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const tooltipWidth = 300;
    const approxHeight = 220;

    // Center horizontally, clamped to viewport margins
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }
    left = Math.max(16, left);

    // Prefer placing ABOVE the cell, but if spaceAbove is tight (< approxHeight + 16), place BELOW
    const spaceAbove = rect.top;
    let top: number;
    if (spaceAbove >= approxHeight + 16) {
      top = rect.top - approxHeight - 8;
    } else {
      top = rect.bottom + 8;
    }
    top = Math.max(16, Math.min(top, window.innerHeight - approxHeight - 16));

    setCoords({ top, left });
  };

  const handleMouseLeave = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setCoords(null);
    }, 150);
  };

  useEffect(() => {
    return () => clearHideTimeout();
  }, []);

  useEffect(() => {
    if (!coords) return;
    const handleScrollOrResize = () => {
      clearHideTimeout();
      setCoords(null);
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [coords]);

  const details = getFactorEvaluationDetails(solutionName || '', factor, score);

  return (
    <div
      ref={targetRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-flex items-center justify-center cursor-pointer py-1 select-none"
    >
      {children}
      {coords && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[99999] w-[300px] p-3.5 bg-white text-gray-800 rounded-xl border border-gray-200/90 shadow-2xl text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150 font-sans"
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          onMouseEnter={clearHideTimeout}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="font-semibold text-xs text-[#0D212C]">
              {factor.code} · {factor.shortName || factor.name}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-[#ED4D19] border border-orange-200/60">
              Score: {score} / 5
            </span>
          </div>

          <div className="space-y-2 text-[11px] leading-relaxed">
            <div>
              <span className="font-semibold text-gray-800">Score: </span>
              <span className="text-gray-600">{details.rubric}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Reason: </span>
              <span className="text-gray-600">{details.reason}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-800">Basis: </span>
              <span className="text-gray-600">{details.basis}</span>
            </div>
            {!(factor.code === 'F2' || factor.code === 'F4') && (
              <div className="pt-1.5 border-t border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-800">Sources: </span>
                <a
                  href={details.sourceUrl || "https://www.who.int/data/gho"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium underline text-[11px] truncate max-w-[170px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="truncate">{details.sources}</span>
                  <ArrowUpRight className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

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
  const [isExpandedRanking, setIsExpandedRanking] = useState(false);
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

  // Toggle Market Fit sort
  const handleToggleMarketFitSort = () => {
    setSortFactor((prev) => {
      if (prev.factor !== 'marketFit') {
        return { factor: 'marketFit', order: 'desc' };
      }
      if (prev.order === 'desc') {
        return { factor: 'marketFit', order: 'asc' };
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
      if (sortFactor.factor === 'marketFit') {
        list = [...list].sort((a, b) => {
          const valA = a.marketFit.score || 0;
          const valB = b.marketFit.score || 0;
          return sortFactor.order === 'asc' ? valA - valB : valB - valA;
        });
      } else {
        const factorKey = sortFactor.factor as keyof SolutionScoringItem['fScores'];
        list = [...list].sort((a, b) => {
          const valA = a.fScores[factorKey] || 0;
          const valB = b.fScores[factorKey] || 0;
          return sortFactor.order === 'asc' ? valA - valB : valB - valA;
        });
      }
    }

    return list;
  }, [solutionsWithScores, searchQuery, statusFilter, sortFactor]);

  // Paginated solutions (7 rows per page)
  const totalScoringPages = Math.ceil(filteredSolutions.length / ITEMS_PER_PAGE) || 1;
  const paginatedSolutions = useMemo(() => {
    const start = (scoringPage - 1) * ITEMS_PER_PAGE;
    return filteredSolutions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSolutions, scoringPage]);

  // Render Round Progress Bar for 1-5 Scores
  const renderRoundProgress = (score: number) => {
    const config = SCORE_CONFIG[score] || SCORE_CONFIG[3];

    const radius = 12;
    const circumference = 2 * Math.PI * radius; // ~75.4
    const strokeDashoffset = circumference - (score / 5) * circumference;

    return (
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
    );
  };

  // Render Market Fit round progress bar
  const renderMarketFitProgress = (score: number) => {
    const roundedBand = Math.min(5, Math.max(1, Math.round(score)));
    const config = SCORE_CONFIG[roundedBand] || SCORE_CONFIG[3];

    const radius = 12;
    const circumference = 2 * Math.PI * radius; // ~75.4
    const strokeDashoffset = circumference - (Math.min(5, Math.max(0, score)) / 5) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center cursor-pointer py-1 select-none">
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
          <span className={`absolute inset-0 flex items-center justify-center text-[0.625rem] font-bold ${config.text}`}>
            {score.toFixed(1)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-5 py-6 md:py-8 space-y-6">
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
                <div className="relative min-w-[116px] shrink-0" ref={statusFilterRef}>
                  <button
                    type="button"
                    onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                    className="w-full flex items-center justify-between gap-2.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[0.8125rem] text-gray-700 font-normal hover:bg-gray-50 focus:outline-none focus:border-gray-300 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{statusFilter === 'All' ? 'Filters' : statusFilter}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${isStatusFilterOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isStatusFilterOpen && (
                    <div className="absolute top-full mt-1 right-0 min-w-full w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden">
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

                      {/* Market Fit Column with 2-line header, sort, and (i) info popup */}
                      <th 
                        onClick={handleToggleMarketFitSort}
                        className="py-2.5 px-3 font-normal text-center cursor-pointer select-none group min-w-[130px] outline-none focus:outline-none"
                      >
                        <div className="inline-flex flex-col items-center justify-center hover:text-gray-800 transition-colors select-none">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-[#0D212C] text-[0.6875rem]">MARKET FIT</span>
                            <ArrowUpDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
                            <MarketFitHeaderInfoTooltip />
                          </div>
                          <span className="text-[0.625rem] text-gray-500 font-normal normal-case leading-tight mt-0.5 text-center whitespace-nowrap">
                            (avg · sets win rate)
                          </span>
                        </div>
                      </th>

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
                        <td colSpan={11} className="py-12 text-center text-gray-400 text-sm">
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

                          {/* F1 - F6 Factor Cells with FactorCellTooltip */}
                          {FACTORS.map((factor) => {
                            const score = solution.fScores[factor.id] || 3;
                            return (
                              <td key={factor.id} className="py-4 px-2.5 text-center">
                                <FactorCellTooltip score={score} factor={factor} solutionName={solution.name}>
                                  {renderRoundProgress(score)}
                                </FactorCellTooltip>
                              </td>
                            );
                          })}

                          {/* Market Fit Cell with custom tooltip */}
                          <td className="py-4 px-3 text-center">
                            <MarketFitCellTooltip solution={solution}>
                              {renderMarketFitProgress(solution.marketFit.score)}
                            </MarketFitCellTooltip>
                          </td>

                          {/* Revenue Cell */}
                          <td className="py-4 px-4 text-left">
                            <SolutionMetricTooltip
                              title={`${solution.name} · 3-Year Addressable Revenue`}
                              explanation={`Projected cumulative revenue across top sellable markets based on weighted win rate (${solution.marketFit.winRate}) and catalog TAM model.`}
                              source="GTM Revenue Pipeline Model 2026 & Addressable Market TAM"
                            >
                              <div className="flex flex-col leading-tight cursor-help underline decoration-dotted decoration-gray-300">
                                <span className="font-normal text-[0.8125rem] text-[#0D212C]">
                                  {solution.revenue3Yr}
                                </span>
                                <span className="text-[0.6875rem] text-gray-400 font-normal mt-0.5 whitespace-nowrap">
                                  ${(solution.revenueNum / 3).toFixed(1)}M per year
                                </span>
                              </div>
                            </SolutionMetricTooltip>
                          </td>

                          {/* Score / 100 */}
                          <td className="py-4 px-6 text-right font-semibold text-[0.875rem] text-[#ED4D19]">
                            <ScoreOverlayTrigger
                              solutionName={solution.name}
                              score={solution.score}
                            >
                              <span className="cursor-help hover:text-[#ED4D19] transition-colors border-b border-dotted border-gray-300">
                                {solution.score}
                              </span>
                            </ScoreOverlayTrigger>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Factor Weights Sliders (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/90 p-6 md:p-7 shadow-xs flex flex-col h-full">
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

              <div className="space-y-3.5 mt-3.5">
                {FACTORS.map((factor) => {
                  const currentWeight = isEditingWeightage 
                    ? (tempWeights[factor.id] ?? weights[factor.id] ?? factor.defaultWeight)
                    : (weights[factor.id] ?? factor.defaultWeight);
                  return (
                    <div key={factor.id} className="space-y-1.5">
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
                      <div className="flex items-center gap-3 py-0.5">
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

              {/* How weighting works info callout with reduced spacing directly below F6 Revenue depth */}
              <div className="mt-3.5 pt-3.5 border-t border-gray-100 flex items-start gap-2.5 text-xs text-gray-500">
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
            <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/90 p-6 md:p-7 shadow-xs flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                <h3 className="text-base font-semibold text-[#0D212C] font-['Poppins']">
                  Live ranking
                </h3>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-medium">
                  {rankedSolutions.length} solutions
                </span>
              </div>

              {/* Scrollable List showing 11 rankings upfront, remainder in scroll */}
              <div className="flex-1 min-h-0 h-[429px] max-h-[429px] overflow-y-auto visible-scrollbar divide-y divide-gray-100 pr-2 my-1">
                {rankedSolutions.map((sol, index) => (
                  <div 
                    key={sol.id} 
                    className="h-[39px] flex items-center justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-lg transition-colors shrink-0"
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
