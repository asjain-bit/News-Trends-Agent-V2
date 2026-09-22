import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { notificationService } from '../services/notificationService';
import { 
  MessageSquare, MessageSquarePlus, Sparkles, AlertCircle, ChevronDown, ChevronUp, Download, Check, 
  ThumbsUp, ThumbsDown, RefreshCw, ChevronRight, ShieldCheck, Target, Printer, 
  ZoomIn, ZoomOut, Info, Shield, X, Pencil, Maximize2 
} from 'lucide-react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ReportRenderer } from '../components/report/ReportRenderer';
import { generateDummyReportSections } from '../utils/dummyReportData';

export default function ReportSummary() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { threads, updateThread, generateReportInBackground } = useAppStore();
  
  const thread = threads.find(t => t.id === id);
  const sortedThreads = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
  const threadIdx = sortedThreads.findIndex(t => t.id === id);
  const [activeSection, setActiveSection] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  
  // Page-Level Comment UI State (Comments at the end of each page)
  const [activeCommentPageId, setActiveCommentPageId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingCommentIndex, setEditingCommentIndex] = useState<{ pageId: string; index: number } | null>(null);
  
  const versionDropdownRef = useRef<HTMLDivElement>(null);
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);

  // Confidence Breakdown & Scoring Drawer State (always expanded scoring breakdown)
  const [isConfidenceExpanded, setIsConfidenceExpanded] = useState(false);
  const [isScoringExpanded, setIsScoringExpanded] = useState(true);

  // Zoom Level State (Default 100% with compact page size for seamless fit)
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [expandedConfidencePageIds, setExpandedConfidencePageIds] = useState<Record<string, boolean>>({});

  const togglePageConfidence = (pageId: string) => {
    setExpandedConfidencePageIds(prev => ({
      ...prev,
      [pageId]: prev[pageId] === undefined ? false : !prev[pageId]
    }));
  };

  // Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState<'executive-summary' | 'word-document'>('executive-summary');
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cancelTimer = () => {};

  useEffect(() => {
    if (!thread) return;
  }, [thread]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (versionDropdownRef.current && !versionDropdownRef.current.contains(event.target as Node)) {
        setIsVersionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddPageComment = (pageId: string) => {
    if (!commentText.trim() || !thread) return;
    const newComments = { ...(latestVersion.comments || {}) };
    if (!newComments[pageId]) {
      newComments[pageId] = [];
    }
    
    if (editingCommentIndex && editingCommentIndex.pageId === pageId) {
      newComments[pageId][editingCommentIndex.index] = commentText.trim();
      setEditingCommentIndex(null);
    } else {
      newComments[pageId].push(commentText.trim());
    }
    
    const updatedVersions = [...thread.versions];
    const versionIndex = updatedVersions.findIndex(v => v.id === latestVersion.id);
    if (versionIndex !== -1) {
      updatedVersions[versionIndex] = {
        ...latestVersion,
        comments: newComments
      };
    }
    
    updateThread({
      ...thread,
      versions: updatedVersions,
      updatedAt: Date.now()
    });

    cancelTimer();
    setCommentText('');
    setIsAddingComment(false);
    notificationService.notify(editingCommentIndex ? "Comment updated" : "Comment added to page", "success");
  };
  
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const isScrollingRef = useRef(false);

  if (!thread) {
    return (
      <div className="flex justify-center py-20 text-[var(--color-ink-muted)]">
        Report not found.
      </div>
    );
  }

  // If thread is actively generating and has no versions yet, show loading
  if (thread.status === 'generating' && (!thread.versions || thread.versions.length === 0)) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#36c0c9]"></div>
        <p className="text-[0.875rem] text-slate-500 font-medium">Generating your report...</p>
      </div>
    );
  }

  const defaultVersion = {
    id: 'v1',
    versionNumber: 1,
    createdAt: Date.now(),
    comments: {},
    blocks: [],
    content: { sections: generateDummyReportSections(thread.inputs?.depth || 'Deep Dive', 1) }
  };

  const latestVersion = (selectedVersionId 
    ? (thread.versions || []).find(v => v.id === selectedVersionId) || thread.versions?.[thread.versions.length - 1]
    : thread.versions?.[thread.versions.length - 1]) || defaultVersion;
  
  const hasAtLeastOneComment = Object.values(latestVersion.comments || {}).some(
    (commentsList: any) => commentsList && commentsList.length > 0
  );

  const rawSections = latestVersion?.content?.sections || generateDummyReportSections(thread.inputs?.depth || 'Deep Dive', 1);
  
  const sections = useMemo(() => {
    if (!rawSections) return [];
    return rawSections.map((s: any) => {
      if (s.confidenceScore) return s;
      
      let hash = 0;
      const sid = s?.id || '';
      for (let i = 0; i < sid.length; i++) hash += sid.charCodeAt(i);
      const score = 30 + (hash % 69) || 30;
      
      let reason = "Verified against primary government databases.";
      if (score < 40) reason = "Based on limited secondary sources and market estimates.";
      else if (score < 80) reason = "Cross-referenced with recent industry reports.";
      
      return { ...s, confidenceScore: score, confidenceReason: reason };
    });
  }, [rawSections]);

  const visibleSections = useMemo(() => {
    if (activeTab === 'executive-summary') {
      return sections.slice(0, 2);
    }
    return sections;
  }, [sections, activeTab]);

  // Paginate section blocks across fixed-height pages (NO internal scroll)
  const paginatedPages = useMemo(() => {
    const pages: any[] = [];

    visibleSections.forEach((section: any, sIdx: number) => {
      const rawBlocks = section.blocks || [];
      
      if (rawBlocks.length === 0) {
        pages.push({
          id: `${section.id}-p1`,
          sectionId: section.id,
          sectionTitle: section.title,
          sectionIndex: sIdx,
          isFirstPageOfSection: true,
          pageIndexInSection: 1,
          totalPagesInSection: 1,
          confidenceScore: section.confidenceScore,
          confidenceReason: section.confidenceReason,
          blocks: [],
          rawContent: section.content,
        });
        return;
      }

      // Unpack multi-paragraph text blocks if they have > 2 paragraphs
      const normalizedBlocks: any[] = [];
      rawBlocks.forEach((block: any) => {
        if (block.type === 'text' && block.data?.paragraphs?.length > 2) {
          const paragraphs = block.data.paragraphs;
          for (let i = 0; i < paragraphs.length; i += 2) {
            normalizedBlocks.push({
              ...block,
              id: `${block.id}-part-${i}`,
              data: {
                ...block.data,
                paragraphs: paragraphs.slice(i, i + 2)
              }
            });
          }
        } else {
          normalizedBlocks.push(block);
        }
      });

      // Weight calculation for fitting content naturally into a single page without clipping or large blank gaps
      const getWeight = (block: any) => {
        switch (block.type) {
          case 'chart':
          case 'swot':
          case 'image':
            return 0.5;
          case 'table':
            return 0.42;
          case 'timeline':
          case 'recommendation':
          case 'key-takeaways':
            return 0.38;
          case 'kpi-grid':
            return 0.32;
          case 'highlight-box':
          case 'callout':
            return 0.25;
          case 'quote':
          case 'sources-list':
            return 0.2;
          case 'text':
            return (block.data?.paragraphs?.length || 1) > 1 ? 0.28 : 0.15;
          default:
            return 0.25;
        }
      };

      const sectionPageGroups: any[][] = [];
      let currentGroup: any[] = [];
      let currentWeight = 0;

      normalizedBlocks.forEach((block: any) => {
        const weight = getWeight(block);
        if (currentGroup.length > 0 && currentWeight + weight > 0.82) {
          sectionPageGroups.push(currentGroup);
          currentGroup = [block];
          currentWeight = weight;
        } else {
          currentGroup.push(block);
          currentWeight += weight;
        }
      });

      if (currentGroup.length > 0) {
        sectionPageGroups.push(currentGroup);
      }

      const totalPagesInSection = sectionPageGroups.length || 1;

      sectionPageGroups.forEach((groupBlocks, pIdx) => {
        pages.push({
          id: `${section.id}-page-${pIdx + 1}`,
          sectionId: section.id,
          sectionTitle: section.title,
          sectionIndex: sIdx,
          isFirstPageOfSection: pIdx === 0,
          isLastPageOfSection: pIdx === totalPagesInSection - 1,
          pageIndexInSection: pIdx + 1,
          totalPagesInSection,
          confidenceScore: section.confidenceScore,
          confidenceReason: section.confidenceReason,
          blocks: groupBlocks,
        });
      });
    });

    return pages;
  }, [visibleSections]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -40% 0px' }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [visibleSections]);

  const averageConfidenceRaw = rawSections.length > 0 
    ? Math.round(rawSections.reduce((acc: number, s: any) => acc + (s.confidenceScore || 0), 0) / rawSections.length) 
    : 80;
    
  let averageConfidence = averageConfidenceRaw;
  if (threadIdx === 0) averageConfidence = 85;
  else if (threadIdx === 1) averageConfidence = 55;
  else if (threadIdx === 2) averageConfidence = 35;

  const confidenceScoreOutOf6 = averageConfidence >= 80 ? '5 / 6' : averageConfidence >= 40 ? '4 / 6' : '3 / 6';
  const confidenceScoreLabel = averageConfidence >= 80 ? 'High Confidence' : averageConfidence >= 40 ? 'Medium Confidence' : 'Low Confidence';
  const confidenceScoreBorder = averageConfidence >= 80 ? 'border-emerald-500' : averageConfidence >= 40 ? 'border-amber-500' : 'border-red-500';

  const handleRegenerate = async () => {
    cancelTimer();
    await updateThread({
      ...thread,
      status: 'generating',
      updatedAt: Date.now()
    });
    generateReportInBackground(thread.id, thread.inputs?.depth || 'Standard Analysis');
    navigate(`/report/${id}/generating`, { state: { regenerate: true } });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 140));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 60));
  };

  const handleExportWord = () => {
    const exportSections = rawSections || [];
    const tocHtml = exportSections.map((s: any, i: number) => 
      `<p style="margin: 0 0 10px 0; font-family: Arial, sans-serif; font-size: 14pt;">
        <a href="#section-${i}" style="color: #0D212C; text-decoration: none;">${i + 1}. ${s.title}</a>
      </p>`
    ).join('');

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Report</title>
        <style>
          body { font-family: 'Arial', sans-serif; color: #333333; line-height: 1.6; }
          h1 { color: #0D212C; font-size: 28pt; margin-bottom: 20pt; }
          h2 { color: #0D212C; font-size: 20pt; border-bottom: 2px solid #36c0c9; padding-bottom: 5pt; margin-top: 30pt; margin-bottom: 15pt; page-break-before: always; }
          p { font-size: 11pt; margin-bottom: 12pt; }
          .page-break { page-break-before: always; }
          .cover-page { text-align: left; padding: 50pt 0; }
          .cover-title { font-size: 36pt; color: #0D212C; font-weight: bold; margin-bottom: 20pt; line-height: 1.2; }
          .cover-subtitle { font-size: 16pt; color: #36c0c9; font-weight: bold; margin-bottom: 40pt; text-transform: uppercase; letter-spacing: 2pt; }
          .cover-desc { font-size: 14pt; color: #666666; margin-bottom: 100pt; }
          .cover-footer { font-size: 12pt; color: #999999; }
          .cover-footer strong { color: #0D212C; font-size: 14pt; display: block; margin-top: 5pt; }
          table { width: 100%; border-collapse: collapse; margin: 20pt 0; }
          th { background-color: #f2f2f2; border: 1px solid #dddddd; padding: 8pt; text-align: left; font-weight: bold; color: #0D212C; }
          td { border: 1px solid #dddddd; padding: 8pt; vertical-align: top; }
          .callout { background-color: #f8fbfa; border-left: 4px solid #36c0c9; padding: 15pt; margin: 20pt 0; }
          .callout-title { font-weight: bold; color: #0D212C; font-size: 12pt; margin-bottom: 5pt; }
          .quote { font-size: 16pt; font-style: italic; color: #555555; text-align: center; margin: 30pt 40pt; border-top: 1px solid #dddddd; border-bottom: 1px solid #dddddd; padding: 20pt 0; }
          .kpi-table th { background-color: #0D212C; color: white; border: 1px solid #0D212C; text-align: center; font-size: 14pt; }
          .kpi-table td { text-align: center; font-size: 24pt; font-weight: bold; color: #36c0c9; border: 1px solid #dddddd; padding: 20pt; }
          .swot-table td { width: 50%; padding: 15pt; }
          .swot-table h3 { color: #0D212C; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="cover-page">
          <img src="${window.location.origin}/logo.png" alt="M42 Logo" style="height: 40px; margin-bottom: 50pt;" />
          <div class="cover-subtitle">Strategic Intelligence</div>
          <div class="cover-title">${thread.title}</div>
          
          <div style="margin-bottom: 30pt;">
            <span style="padding: 6px 12px; font-size: 12pt; font-weight: bold; ${
              averageConfidence >= 80 ? 'background-color: #e6ffed; color: #1a7f37; border: 1px solid #a3dcaf;' :
              averageConfidence >= 40 ? 'background-color: #fff8c5; color: #9a6700; border: 1px solid #f8e3a1;' :
              'background-color: #ffebe9; color: #cf222e; border: 1px solid #ff8182;'
            }">Overall Confidence: ${averageConfidence >= 80 ? 'High' : averageConfidence >= 40 ? 'Medium' : 'Low'}</span>
          </div>

          <div class="cover-desc">Comprehensive market analysis, technology landscape evaluation, and strategic roadmap recommendations.</div>
          <div class="cover-footer">
            Prepared For<br/>
            <strong>M42 Executive Board</strong><br/>
            ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <div class="page-break"></div>
        <h1>Table of Contents</h1>
        ${tocHtml}

        ${exportSections.map((s: any, i: number) => `
          <h2 id="section-${i}">${s.title}</h2>
          ${s.confidenceScore ? `<p style="margin-bottom: 15pt;"><span style="padding: 4px 8px; font-size: 10pt; font-weight: bold; ${
            s.confidenceScore >= 80 ? 'background-color: #e6ffed; color: #1a7f37; border: 1px solid #a3dcaf;' :
            s.confidenceScore >= 40 ? 'background-color: #fff8c5; color: #9a6700; border: 1px solid #f8e3a1;' :
            'background-color: #ffebe9; color: #cf222e; border: 1px solid #ff8182;'
          }">${s.confidenceScore >= 80 ? 'High' : s.confidenceScore >= 40 ? 'Medium' : 'Low'} Confidence</span></p>` : ''}
          ${s.blocks ? s.blocks.map((b: any) => {
            if (b.type === 'text') return b.data.paragraphs.map((p: string) => `<p>${p}</p>`).join('');
            if (b.type === 'quote') return `<div class="quote">"${b.data.quote}"<br/><span style="font-size: 12pt; color: #999; font-style: normal; margin-top: 10pt; display: block;">— ${b.data.author}, ${b.data.role}</span></div>`;
            if (b.type === 'image') return `<div style="text-align: center; margin: 20pt 0;"><img src="${b.data.url || b.data.src}" alt="${b.data.caption}" style="max-width: 100%; height: auto;" /><p style="color: #666; font-style: italic; font-size: 10pt; margin-top: 5pt;">${b.data.caption}</p></div>`;
            if (b.type === 'table') {
              const headers = b.data.headers ? `<thead><tr>${b.data.headers.map((h: any) => `<th style="background-color: #f2f2f2; border: 1px solid #ddd; padding: 8px; text-align: left;">${h.label || h}</th>`).join('')}</tr></thead>` : '';
              const rows = b.data.rows.map((row: any) => `<tr>${Object.values(row).map((cell: any) => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}</tr>`).join('');
              return `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-family: Arial, sans-serif; font-size: 11pt;">${headers}<tbody>${rows}</tbody></table>`;
            }
            if (b.type === 'sources-list') {
              const sources = b.data.sources || (b.data.icons || []).map((icon: string) => {
                try {
                  const url = new URL(icon);
                  const domain = url.searchParams.get('domain') || 'Source';
                  return { name: domain.replace('.com', ''), url: `https://${domain}` };
                } catch {
                  return { name: 'Source', url: '#' };
                }
              });
              return `<div style="margin: 20px 0;"><h3 style="color: #0D212C; font-size: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Sources</h3><ul style="padding-left: 20px;">${sources.map((src: any) => `<li style="margin-bottom: 5px; font-family: Arial, sans-serif; font-size: 11pt;"><strong>${src.name || src.title}</strong><br/><a href="${src.url}" style="color: #36c0c9;">${src.url}</a></li>`).join('')}</ul></div>`;
            }
            if (b.type === 'callout') {
              return `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fbfa;"><tr><td style="border-left: 4px solid #36c0c9; padding: 15px; font-family: Arial, sans-serif;"><div style="color: #0D212C; font-size: 12pt; font-weight: bold; margin-bottom: 5px;">${b.data.title}</div><div style="font-weight: bold; margin-bottom: 5px;">${b.data.subtitle}</div><p style="margin: 0; font-size: 11pt;">${b.data.content}</p></td></tr></table>`;
            }
            if (b.type === 'kpi-grid') {
              return `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><thead><tr>${b.data.kpis.map((kpi: any) => `<th style="background-color: #0D212C; color: white; border: 1px solid #0D212C; text-align: center; font-size: 12pt; padding: 10px; font-family: Arial, sans-serif;">${kpi.label}</th>`).join('')}</tr></thead><tbody><tr>${b.data.kpis.map((kpi: any) => `<td style="text-align: center; font-size: 18pt; font-weight: bold; color: #36c0c9; border: 1px solid #dddddd; padding: 15px; font-family: Arial, sans-serif;">${kpi.value}</td>`).join('')}</tr></tbody></table>`;
            }
            if (b.type === 'swot') {
              return `<div style="margin: 20px 0; font-family: Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;"><tr><td style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px;"><h3 style="color: #0D212C; margin-top: 0; font-size: 14pt;">Strengths</h3><ul style="margin: 0; padding-left: 20px;">${b.data.strengths.map((item: string) => `<li style="font-size: 11pt; margin-bottom: 5px;">${item}</li>`).join('')}</ul></td></tr></table>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;"><tr><td style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px;"><h3 style="color: #0D212C; margin-top: 0; font-size: 14pt;">Weaknesses</h3><ul style="margin: 0; padding-left: 20px;">${b.data.weaknesses.map((item: string) => `<li style="font-size: 11pt; margin-bottom: 5px;">${item}</li>`).join('')}</ul></td></tr></table>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;"><tr><td style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 15px;"><h3 style="color: #0D212C; margin-top: 0; font-size: 14pt;">Opportunities</h3><ul style="margin: 0; padding-left: 20px;">${b.data.opportunities.map((item: string) => `<li style="font-size: 11pt; margin-bottom: 5px;">${item}</li>`).join('')}</ul></td></tr></table>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;"><tr><td style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 15px;"><h3 style="color: #0D212C; margin-top: 0; font-size: 14pt;">Threats</h3><ul style="margin: 0; padding-left: 20px;">${b.data.threats.map((item: string) => `<li style="font-size: 11pt; margin-bottom: 5px;">${item}</li>`).join('')}</ul></td></tr></table>
              </div>`;
            }
            if (b.type === 'chart') {
              const headers = b.data.data.length > 0 ? Object.keys(b.data.data[0]) : [];
              const thead = headers.length > 0 ? `<thead><tr>${headers.map((h: string) => `<th style="background-color: #f2f2f2; border: 1px solid #ddd; padding: 8px; text-align: left;">${h}</th>`).join('')}</tr></thead>` : '';
              const tbody = b.data.data.map((row: any) => `<tr>${headers.map((h: string) => `<td style="border: 1px solid #ddd; padding: 8px;">${row[h]}</td>`).join('')}</tr>`).join('');
              return `<div style="margin: 20px 0; font-family: Arial, sans-serif;"><h3 style="color: #0D212C; font-size: 14pt; margin-bottom: 5px;">Chart Data: ${b.data.title}</h3><p style="font-style: italic; color: #666; font-size: 11pt; margin-bottom: 10px;">${b.data.description}</p><table style="width: 100%; border-collapse: collapse;">${thead}<tbody>${tbody}</tbody></table></div>`;
            }
            if (b.type === 'key-takeaways') {
              return `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #0D212C;"><tr><td style="padding: 20px; font-family: Arial, sans-serif;"><h3 style="color: #36c0c9; margin: 0 0 10px 0; font-size: 14pt;">Key Takeaways</h3><ul style="color: #ffffff; padding-left: 20px; margin: 0;">${b.data.items.map((item: string) => `<li style="margin-bottom: 10px; font-size: 11pt;">${item}</li>`).join('')}</ul></td></tr></table>`;
            }
            if (b.type === 'recommendation') {
              return `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 2px solid #36c0c9;"><tr><td style="padding: 20px; font-family: Arial, sans-serif;">
                <div style="color: #666; font-size: 10pt; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;"><span style="color: #36c0c9;">${b.data.priority} Priority</span> | ${b.data.timeline}</div>
                <h3 style="color: #0D212C; font-size: 14pt; margin: 0 0 10px 0;">${b.data.title}</h3>
                <p style="margin-bottom: 15px; font-size: 11pt;">${b.data.description}</p>
                <table style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; border: 1px solid #ddd;"><tr><td style="padding: 10px;">
                  <div style="font-size: 9pt; color: #666; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Expected Business Impact</div>
                  <div style="color: #0D212C; font-weight: bold; font-size: 11pt;">${b.data.impact}</div>
                </td></tr></table>
              </td></tr></table>`;
            }
            if (b.type === 'highlight-box') {
              return `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fbfa; border: 1px solid #e2ecea;"><tr><td style="border-left: 4px solid #36c0c9; padding: 15px; font-family: Arial, sans-serif;">
                <div style="color: #36c0c9; font-size: 9pt; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">${b.data.label}</div>
                <h4 style="color: #0D212C; font-size: 14pt; margin: 0 0 10px 0;">${b.data.title}</h4>
                <p style="margin: 0; font-size: 11pt;">${b.data.content}</p>
              </td></tr></table>`;
            }
            if (b.type === 'timeline') {
              return `<div style="margin: 20px 0; font-family: Arial, sans-serif;">
                ${b.data.events.map((event: any) => `
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;"><tr><td style="border-left: 2px solid #36c0c9; padding-left: 15px;">
                    <div style="color: #36c0c9; font-weight: bold; font-size: 10pt;">${event.date}</div>
                    <div style="color: #0D212C; font-weight: bold; font-size: 12pt; margin: 5px 0;">${event.title}</div>
                    <p style="margin: 0; font-size: 11pt;">${event.description}</p>
                  </td></tr></table>
                `).join('')}
              </div>`;
            }
            return '';
          }).join('') : (s.content || '')}
        `).join('')}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${thread.title || 'Report'}_v${latestVersion.versionNumber}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notificationService.notify("Report downloaded", "success");
  };

  const scrollToSection = (sectionId: string) => {
    isScrollingRef.current = true;
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    const container = document.getElementById('report-scroll-container');
    if (element && container) {
      container.scrollTo({ top: element.offsetTop - 30, behavior: 'smooth' });
    }
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  // Reusable Per-Page Confidence Explainer Component (Minimal, default expanded, without left border line)
  const renderPageConfidenceExplainer = (
    _pageId: string, 
    score: number = 85, 
    label: string = 'High Confidence',
    claimsCount: number = 11,
    scoreOutOf6: string = '5 / 6',
    reasonText?: string
  ) => {
    const isHigh = score >= 80;
    const isMed = score >= 40 && score < 80;
    
    const badgeBorder = isHigh ? 'border-emerald-200/80 bg-emerald-50/30' : isMed ? 'border-amber-200/80 bg-amber-50/30' : 'border-red-200/80 bg-red-50/30';
    const iconColor = isHigh ? 'text-emerald-600' : isMed ? 'text-amber-600' : 'text-red-600';
    const textColor = isHigh ? 'text-emerald-950' : isMed ? 'text-amber-950' : 'text-red-950';

    return (
      <div className={`w-full rounded-lg border ${badgeBorder} p-2 sm:p-2.5 transition-all mt-2 shrink-0 select-none`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Info className={`w-3.5 h-3.5 ${iconColor}`} />
            <span className={`text-[0.75rem] font-semibold ${textColor}`}>{label}</span>
            <span className="bg-white/90 border border-gray-200 text-slate-700 text-[0.625rem] font-medium px-1.5 py-0.5 rounded shadow-2xs">
              {scoreOutOf6}
            </span>
            <span className="bg-white/90 border border-gray-200 text-slate-700 text-[0.625rem] font-medium px-1.5 py-0.5 rounded shadow-2xs">
              {claimsCount} claims evaluated
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-200/50 text-[0.6875rem] text-slate-700 space-y-1">
          <p className="leading-snug">
            {reasonText || (isHigh 
              ? `High confidence (${scoreOutOf6}). ${claimsCount} claims evaluated and cross-verified against verified government databases and primary source registries.`
              : isMed 
              ? `Medium confidence (${scoreOutOf6}). ${claimsCount} claims evaluated. Cross-referenced with recent industry publications and secondary market reports.`
              : `Low confidence (${scoreOutOf6}). ${claimsCount} claims evaluated. Based on preliminary draft releases and unclassified market sources.`
            )}
          </p>
          <div className="space-y-0.5 text-gray-600 text-[0.625rem] pt-0.5">
            <div>• <span className="font-medium text-slate-700">Source quality:</span> {isHigh ? 'Direct citations from primary government & health authority registries' : isMed ? 'Multiple peer-reviewed & industry reports' : 'Early draft estimates and market commentaries'}</div>
            <div>• <span className="font-medium text-slate-700">Corroboration:</span> High corroboration across independent datasets and verified benchmarks</div>
          </div>
        </div>
      </div>
    );
  };

  // Reusable Comment Trigger & Popover Component matching exact attached designs
  const renderCommentButtonAndPopover = (pageId: string) => {
    const pageComments = latestVersion.comments?.[pageId] || [];
    const isOpen = activeCommentPageId === pageId;

    return (
      <div className="relative no-print">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isOpen) {
              setActiveCommentPageId(null);
              setCommentText('');
              setIsAddingComment(false);
              setEditingCommentIndex(null);
            } else {
              setActiveCommentPageId(pageId);
              setCommentText('');
              setIsAddingComment(pageComments.length === 0);
              setEditingCommentIndex(null);
            }
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 relative group/btn shrink-0 ${
            pageComments.length > 0 
              ? 'bg-white border border-gray-200 hover:bg-slate-50 text-[#2EAFB8] shadow-xs'
              : 'bg-[#2EAFB8] hover:bg-[#259aa2] text-white shadow-sm hover:shadow-md'
          }`}
          title={pageComments.length > 0 ? `${pageComments.length} comment(s)` : "Add comment"}
        >
          {pageComments.length > 0 ? (
            <MessageSquare className="w-4 h-4 text-[#2EAFB8] stroke-[2]" />
          ) : (
            <MessageSquarePlus className="w-4.5 h-4.5 text-white stroke-[2.2]" />
          )}

          {pageComments.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#0D212C] text-white text-[0.6875rem] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {pageComments.length}
            </span>
          )}
        </button>

        {/* Active Comment Popup UI */}
        {isOpen && (
          <div 
            className="absolute right-0 bottom-full mb-2 w-[320px] sm:w-[350px] bg-white border border-gray-200 rounded-2xl shadow-xl p-4.5 z-50 text-left transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#2EAFB8]" />
                <span className="font-semibold text-[0.875rem] text-slate-800">
                  {pageComments.length > 0 && !isAddingComment && !editingCommentIndex
                    ? `Comments (${pageComments.length})` 
                    : editingCommentIndex
                    ? 'Edit Comment'
                    : 'Add Comment'}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => { 
                  setActiveCommentPageId(null); 
                  setCommentText(''); 
                  setIsAddingComment(false);
                  setEditingCommentIndex(null);
                }}
                className="text-gray-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* View Existing Comments Mode (Matches Image 2) */}
            {pageComments.length > 0 && !isAddingComment && !editingCommentIndex ? (
              <div className="flex flex-col gap-3">
                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {pageComments.map((c: string, i: number) => (
                    <div key={i} className="flex flex-col gap-1 pb-2.5 border-b last:border-b-0 border-gray-100">
                      <p className="text-[0.875rem] text-slate-800 font-normal leading-relaxed">
                        {c}
                      </p>
                      <div className="flex items-center justify-between text-[0.75rem] text-gray-400">
                        <span>Nikhitha Prasad · 18 Sept, 15:20</span>
                        {(!selectedVersionId || selectedVersionId === thread.versions[thread.versions.length - 1].id) && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentIndex({ pageId, index: i });
                              setCommentText(c);
                            }}
                            className="text-[#2EAFB8] hover:text-[#259aa2] font-medium flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {(!selectedVersionId || selectedVersionId === thread.versions[thread.versions.length - 1].id) && (
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingComment(true);
                        setCommentText('');
                      }}
                      className="text-[#2EAFB8] hover:text-[#259aa2] text-[0.8125rem] font-medium hover:underline cursor-pointer"
                    >
                      Click to add another comment
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Input / Compose Mode with minimal subtle grey stroke on focus */
              (!selectedVersionId || selectedVersionId === thread.versions[thread.versions.length - 1].id) && (
                <div className="flex flex-col gap-3">
                  <textarea 
                    rows={3}
                    autoFocus
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddPageComment(pageId);
                      }
                    }}
                    placeholder="Add your comment for this page..."
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl p-3 text-[0.8125rem] text-slate-800 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-gray-200 resize-none transition-all shadow-2xs"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      type="button"
                      onClick={() => { 
                        if (pageComments.length > 0 && (isAddingComment || editingCommentIndex)) {
                          setIsAddingComment(false);
                          setEditingCommentIndex(null);
                          setCommentText('');
                        } else {
                          setActiveCommentPageId(null); 
                          setCommentText(''); 
                          setIsAddingComment(false);
                          setEditingCommentIndex(null);
                        }
                      }}
                      className="px-3.5 py-1.5 text-[0.8125rem] text-gray-600 hover:text-slate-800 hover:bg-gray-100 rounded-lg transition-colors font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleAddPageComment(pageId)}
                      disabled={!commentText.trim()}
                      className="px-4 py-1.5 text-[0.8125rem] bg-[#0D212C] text-white rounded-lg hover:bg-[#1a3847] transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                    >
                      {editingCommentIndex ? 'Save' : 'Add Comment'}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const totalExecPages = 2 + (activeTab === 'executive-summary' ? paginatedPages.length : 0);

  return (
    <>
      <style>{`
        .report-content {
          font-family: 'Inter', sans-serif;
          color: #374151;
        }
        .report-content p {
          margin-bottom: 0.875rem;
          line-height: 1.65;
          font-size: 0.8125rem;
          color: #4B5563;
        }
        .report-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0D212C;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          font-family: 'Poppins', sans-serif;
        }
        .report-content ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-bottom: 1rem;
          color: #4B5563;
          line-height: 1.6;
          font-size: 0.8125rem;
        }
        .report-content li {
          margin-bottom: 0.375rem;
        }
        .report-content blockquote {
          border-left: 3px solid #36c0c9;
          padding: 0.75rem 1rem;
          font-style: italic;
          color: #6B7280;
          background-color: #F8FAFC;
          border-radius: 0 6px 6px 0;
          margin: 1.25rem 0;
          font-size: 0.8125rem;
        }
        .report-content .highlight-box {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
          font-size: 0.75rem;
        }
        .report-content .alert-box {
          background-color: #FFFBEB;
          border: 1px solid #FEF3C7;
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }
        .report-content .alert-box h4 {
          color: #B45309;
          font-weight: 600;
          margin-bottom: 0.375rem;
          font-size: 0.8125rem;
          font-family: 'Poppins', sans-serif;
        }
        .report-content strong {
          color: #111827;
          font-weight: 600;
        }
        @media print {
          body {
            background: white !important;
          }
          header, aside, .no-print, #report-scroll-container::-webkit-scrollbar {
            display: none !important;
          }
          .report-page-sheet {
            box-shadow: none !important;
            border: none !important;
            page-break-after: always !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
            min-height: auto !important;
            transform: none !important;
          }
        }
      `}</style>
      
      <div className="w-full h-[calc(100vh-64px)] bg-[#F6F7FB] p-4 sm:p-6 flex flex-col items-center justify-start overflow-hidden">
        
        {/* Top Header Row with Tabs and Action Buttons (Print & Preview, Export as Word) */}
        <div className="w-full max-w-[1440px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3 shrink-0 no-print">
          <div className="flex items-center gap-8 border-b border-gray-200/80 w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('executive-summary')}
              className={`pb-3 text-[0.875rem] font-medium transition-colors relative ${activeTab === 'executive-summary' ? 'text-[#36c0c9]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Executive Summary
              {activeTab === 'executive-summary' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#36c0c9]" />}
            </button>
            <button 
              onClick={() => setActiveTab('word-document')}
              className={`pb-3 text-[0.875rem] font-medium transition-colors relative ${activeTab === 'word-document' ? 'text-[#36c0c9]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Detailed Report
              {activeTab === 'word-document' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#36c0c9]" />}
            </button>
          </div>
          
          {/* Action buttons: Print & Preview on left of Export as Word */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-[0.8125rem] font-medium text-slate-700 hover:bg-gray-50 transition-colors shadow-xs"
              title="Print and preview document"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              <span>Print & Preview</span>
            </button>

            <button 
              onClick={handleExportWord}
              className="flex items-center gap-2 px-4 py-2 bg-[#36c0c9] border border-[#36c0c9] rounded-lg text-[0.8125rem] font-medium text-white hover:bg-[#2ea3aa] transition-colors shadow-xs whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Export as Word</span>
            </button>
          </div>
        </div>

        {/* Main Document Viewer Container */}
        <div className="w-full flex-1 max-h-full max-w-[1440px] bg-white rounded-2xl shadow-xs border border-gray-200 flex flex-col overflow-hidden relative" ref={containerRef}>
          
          {/* Sub-Header Bar: Version Selector, Confidence Trigger Pill & Informational Note */}
          <div className="bg-white border-b border-gray-200 flex flex-col justify-center px-6 py-2.5 shrink-0 z-30 no-print gap-1.5">
            
            {/* Top Row: Version Selector & Confidence Pill */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={versionDropdownRef}>
                <div 
                  onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)}
                  className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors shadow-xs"
                >
                  <span className="text-[0.8125rem] font-medium text-slate-700">Health Tech Landscape Report</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-[0.8125rem] font-medium text-slate-700">v{latestVersion.versionNumber}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 ml-1 transition-transform ${isVersionDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {thread.versions.length > 1 && isVersionDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg transition-all z-50">
                    {thread.versions.map((v) => (
                      <div 
                        key={v.id} 
                        onClick={() => { setSelectedVersionId(v.id); setIsVersionDropdownOpen(false); }}
                        className="px-3 py-2 text-[0.8125rem] text-slate-700 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      >
                        <span>v{v.versionNumber}</span>
                        {v.id === latestVersion.id && <Check className="w-3.5 h-3.5 text-[#36c0c9]" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Confidence Pill Button - Toggles Expandable Drawer */}
              {averageConfidence > 0 && (
                <button
                  type="button"
                  onClick={() => setIsConfidenceExpanded(!isConfidenceExpanded)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.75rem] font-semibold border transition-all cursor-pointer shadow-xs ${
                    averageConfidence >= 80 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70' 
                      : averageConfidence >= 40 
                      ? 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/70' 
                      : 'bg-red-50 text-red-700 border-red-200/80 hover:bg-red-100/70'
                  }`}
                  title="Click to view confidence details and scoring"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{confidenceScoreLabel}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isConfidenceExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* Bottom Row: Informational Note with no bg or fill, just i icon and text */}
            <div className="flex items-center gap-1.5 text-[0.6875rem] text-gray-500 select-none">
              <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Click on overall confidence score to see detailed confidence score & how it has been calculated</span>
            </div>
          </div>

          {/* Expandable & Collapsible Confidence Scoring Section - FULL WIDTH, Down Arrow Icon, Scoring Always Expanded */}
          <AnimatePresence>
            {isConfidenceExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="w-full bg-slate-50/95 border-b border-gray-200 shrink-0 overflow-hidden no-print z-20"
              >
                <div className="w-full px-6 py-5 flex flex-col gap-3.5">
                  
                  {/* Detailed Confidence Card (Image 1 Format, Full Width with Down Arrow on Right) */}
                  <div className={`w-full bg-white border border-gray-200 rounded-lg p-4 shadow-xs border-l-4 ${confidenceScoreBorder} flex flex-col gap-2 relative`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Info className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-[0.875rem] text-slate-800">{confidenceScoreLabel}</span>
                        <span className="bg-gray-100 text-slate-600 text-[0.6875rem] font-medium px-2 py-0.5 rounded">
                          {confidenceScoreOutOf6}
                        </span>
                        <span className="bg-gray-100 text-slate-600 text-[0.6875rem] font-medium px-2 py-0.5 rounded">
                          31 claims evaluated
                        </span>
                      </div>
                      
                      {/* Down Arrow / Collapse Icon on the right side */}
                      <button 
                        onClick={() => setIsConfidenceExpanded(false)}
                        className="text-gray-400 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1 text-[0.75rem]"
                        title="Collapse confidence section"
                      >
                        <span className="hidden sm:inline text-gray-500">Hide</span>
                        <ChevronDown className="w-4 h-4 rotate-180" />
                      </button>
                    </div>

                    <p className="text-[0.8125rem] text-slate-600 font-normal leading-relaxed">
                      {averageConfidence >= 80 
                        ? 'High confidence (5/6). This is the average of verified primary sources and corroborated industry databases.' 
                        : averageConfidence >= 40 
                        ? 'Medium confidence (4/6). This is the average of 4 section scores: 2 high and 2 medium.' 
                        : 'Low confidence (3/6). This is the average of 4 section scores: 1 medium and 3 low.'}
                    </p>
                    
                    <p className="text-[0.75rem] text-gray-500 font-normal">
                      • Section scores: {averageConfidence >= 80 ? '4 high' : averageConfidence >= 40 ? '2 high and 2 medium' : '1 medium and 3 low'}.
                    </p>
                  </div>

                  {/* "How confidence is scored" Section (Full Width, ALWAYS Expanded, Down Arrow Icon on right) */}
                  <div className="w-full border border-gray-200 rounded-lg bg-white overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => setIsScoringExpanded(!isScoringExpanded)}
                      className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50/70 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 text-[0.875rem] font-semibold text-slate-800">
                        <Shield className="w-4 h-4 text-slate-700" />
                        <span>How confidence is scored</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isScoringExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Always Expanded Explanation Content (Image 2) */}
                    {isScoringExpanded && (
                      <div className="px-5 pb-5 pt-2 border-t border-gray-100 flex flex-col gap-5 text-slate-700">
                        {/* Source Tiers */}
                        <div>
                          <div className="text-[0.6875rem] font-bold text-gray-400 tracking-wider uppercase mb-2.5">
                            SOURCE TIERS
                          </div>
                          <div className="space-y-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-cyan-50 text-[#0E7C86] font-semibold text-[0.6875rem] rounded">Tier 1</span>
                                <span className="font-semibold text-[0.8125rem] text-slate-800">Authoritative</span>
                              </div>
                              <p className="text-[0.75rem] text-gray-500 mt-0.5 leading-relaxed">
                                Government, regulatory, official statistical, multilateral, or peer-reviewed sources.
                              </p>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-cyan-50 text-[#0E7C86] font-semibold text-[0.6875rem] rounded">Tier 2</span>
                                <span className="font-semibold text-[0.8125rem] text-slate-800">Established</span>
                              </div>
                              <p className="text-[0.75rem] text-gray-500 mt-0.5 leading-relaxed">
                                Recognized research, consulting, analyst, financial, or reputable news sources.
                              </p>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-cyan-50 text-[#0E7C86] font-semibold text-[0.6875rem] rounded">Tier 3</span>
                                <span className="font-semibold text-[0.8125rem] text-slate-800">General or unclassified</span>
                              </div>
                              <p className="text-[0.75rem] text-gray-500 mt-0.5 leading-relaxed">
                                Relevant industry, commercial, or web sources with lower or unverified authority.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Corroboration */}
                        <div>
                          <div className="text-[0.6875rem] font-bold text-gray-400 tracking-wider uppercase mb-2.5">
                            CORROBORATION
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="font-semibold text-[0.8125rem] text-slate-800">Multiple publishers</p>
                              <p className="text-[0.75rem] text-gray-500 mt-0.5 leading-relaxed">
                                The claim is supported by at least two independent publishers.
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-[0.8125rem] text-slate-800">Single publisher</p>
                              <p className="text-[0.75rem] text-gray-500 mt-0.5 leading-relaxed">
                                The claim is supported by one publisher.
                              </p>
                            </div>
                            <div>
                              <p className="font-semibold text-[0.8125rem] text-slate-800">Conflicting or unsupported</p>
                              <p className="text-[0.75rem] text-gray-500 mt-0.5 leading-relaxed">
                                Retrieved sources conflict or no retrieved source directly supports the claim.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Score Bands */}
                        <div>
                          <div className="text-[0.6875rem] font-bold text-gray-400 tracking-wider uppercase mb-2">
                            SCORE BANDS
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-[0.75rem] font-semibold rounded-md">
                              High <span className="font-normal text-green-600">5-6</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[0.75rem] font-semibold rounded-md">
                              Medium <span className="font-normal text-amber-600">4</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 border border-red-200 text-red-700 text-[0.75rem] font-semibold rounded-md">
                              Low <span className="font-normal text-red-600">2-3</span>
                            </span>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lower Workspace: Sidebar TOC (Detailed Report) + Compact Screen-Fitting Word Document Sheets */}
          <div className="flex-1 flex overflow-hidden bg-[#F1F3F9] relative">
            
            {/* Table of Contents for Detailed Report */}
            {activeTab === 'word-document' && (
              <div className="w-[260px] shrink-0 h-full bg-white border-r border-gray-200 flex flex-col no-print">
                <div className="p-4 pb-2.5 border-b border-gray-100">
                  <h3 className="font-semibold text-[0.875rem] font-['Poppins'] text-slate-800">Table of Contents</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scrollbar">
                  {visibleSections.map((section: any, idx: number) => {
                    const isActive = activeSection === section.id;
                    return (
                      <div key={section.id} className="border-b border-gray-100/90 pb-2.5 last:border-b-0 last:pb-0">
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className={`flex items-center justify-between w-full p-2 rounded-lg text-left transition-all border ${
                            isActive 
                              ? 'bg-[#36c0c9]/10 border-[#36c0c9]/20 shadow-xs' 
                              : 'bg-transparent border-transparent hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className={`text-[0.8125rem] leading-tight truncate ${isActive ? 'text-slate-900 font-medium' : 'text-gray-600'}`}>
                              {idx + 1}. {section.title}
                            </span>
                            {section.confidenceScore && (
                              <div className="relative group/conf flex items-center shrink-0">
                                <div className={`px-1.5 py-0.5 rounded text-[0.625rem] font-medium ${
                                  section.confidenceScore >= 80 ? 'bg-green-100 text-green-700' : 
                                  section.confidenceScore >= 40 ? 'bg-orange-100 text-orange-700' : 
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {section.confidenceScore >= 80 ? 'High' : section.confidenceScore >= 40 ? 'Medium' : 'Low'}
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Document Pages Scroll Container - Screen-Fitting Compact Page Size */}
            <div 
              className="flex-1 overflow-y-auto bg-[#F1F3F9] flex flex-col items-center py-5 px-4 custom-scrollbar" 
              id="report-scroll-container"
            >
            <div 
              className="w-full flex flex-col items-center gap-6 transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                maxWidth: activeTab === 'executive-summary' ? '840px' : '860px'
              }}
            >
              
              <div 
                className="flex flex-col gap-6 relative w-full report-content"
                ref={contentRef}
              >
                
                {/* ----------------- EXECUTIVE SUMMARY TAB: VISUAL BRIEFING PAGES ----------------- */}
                {activeTab === 'executive-summary' && (
                  <>
                    {/* Executive Summary Page 1: Hero Banner & Country Profile (Snapshot 1) */}
                    <div className="report-page-sheet bg-white shadow-xs border border-gray-200/90 rounded-xl p-6 sm:p-7 w-full min-h-[640px] h-auto flex flex-col justify-between relative shrink-0">
                      {/* Running Header with Confidence Chip */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3 text-[0.625rem] text-gray-400 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-600">M42 Intelligence Report</span>
                          <span>•</span>
                          <span>{thread.inputs.country || 'United Arab Emirates'} • {thread.inputs.techDomain || 'Generative AI, Machine Learning'}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.625rem] font-medium border bg-green-50 text-green-700 border-green-200">
                          <Shield className="w-2.5 h-2.5" />
                          High
                        </span>
                      </div>

                      {/* Main Visual Content */}
                      <div className="flex-1 flex flex-col justify-start gap-3.5">
                        {/* Hero Banner (Snapshot 1 without top buttons, without capital headers) */}
                        <div className="w-full bg-gradient-to-br from-[#0B2532] via-[#0D2B3A] to-[#081C26] rounded-2xl p-4.5 text-white relative overflow-hidden shrink-0 shadow-xs">
                          {/* Subtle geometric SVG lines */}
                          <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                            <line x1="0" y1="0" x2="100%" y2="100%" stroke="white" strokeWidth="1" />
                            <line x1="100%" y1="0" x2="0" y2="100%" stroke="white" strokeWidth="0.8" />
                            <polygon points="50,0 100,50 50,100 0,50" fill="none" stroke="white" strokeWidth="0.8" />
                            <circle cx="85%" cy="30%" r="90" fill="none" stroke="white" strokeWidth="0.8" />
                            <circle cx="20%" cy="80%" r="70" fill="none" stroke="white" strokeWidth="0.6" />
                          </svg>

                          <div className="relative z-10 flex flex-col gap-2.5">
                            <h1 className="text-[1rem] sm:text-[1.125rem] font-medium font-['Poppins'] text-white leading-tight max-w-2xl tracking-tight">
                              {thread.title}
                            </h1>

                            <div className="flex items-center gap-2 flex-wrap text-[0.75rem]">
                              <span className="px-3 py-1 rounded-full bg-white/10 text-gray-200 font-medium backdrop-blur-xs">
                                {thread.inputs.focusLens || 'Regulatory & Policy'}
                              </span>
                              <span className="px-3 py-1 rounded-full bg-white/10 text-gray-200 font-medium backdrop-blur-xs">
                                {thread.inputs.techDomain || 'Investment & Funding'}
                              </span>
                              <span className="px-3 py-1 rounded-full bg-white/10 text-gray-200 font-medium backdrop-blur-xs">
                                Generated today · 41 min
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white font-medium backdrop-blur-xs border border-white/20 text-[0.75rem]">
                                <Shield className="w-3.5 h-3.5 text-white" />
                                High
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Country Profile Section (Snapshot 1) */}
                        <div className="flex flex-col justify-start">
                          <div className="flex items-center justify-between mb-2.5 shrink-0">
                            <h2 className="text-[0.9375rem] font-bold font-['Poppins'] text-[#0D212C]">Country profile</h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.625rem] font-medium border bg-green-50 text-green-700 border-green-200">
                              <Shield className="w-2.5 h-2.5" />
                              High
                            </span>
                          </div>

                          {/* 8 KPI Profile Cards (2 rows of 4) */}
                          <div className="grid grid-cols-4 gap-2.5">
                            <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs min-h-[84px]">
                              <span className="text-[0.6875rem] text-gray-500 font-medium leading-tight">Demographics & macro</span>
                              <span className="text-[0.875rem] font-bold text-[#0D212C] my-0.5">9.4M · high income</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-medium border bg-green-50 text-green-700 border-green-200 w-fit">
                                <Shield className="w-2.5 h-2.5" />
                                High
                              </span>
                            </div>

                            <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs min-h-[84px]">
                              <span className="text-[0.6875rem] text-gray-500 font-medium leading-tight">Healthcare capacity / workforce</span>
                              <span className="text-[0.875rem] font-bold text-[#0D212C] my-0.5">1.4 <span className="text-[0.75rem] font-normal text-gray-500">beds/1k</span></span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-medium border bg-green-50 text-green-700 border-green-200 w-fit">
                                <Shield className="w-2.5 h-2.5" />
                                High
                              </span>
                            </div>

                            <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs min-h-[84px]">
                              <span className="text-[0.6875rem] text-gray-500 font-medium leading-tight">Health economics / spend</span>
                              <span className="text-[0.875rem] font-bold text-[#0D212C] my-0.5">$1,842</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-medium border bg-green-50 text-green-700 border-green-200 w-fit">
                                <Shield className="w-2.5 h-2.5" />
                                High
                              </span>
                            </div>

                            <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs min-h-[84px]">
                              <span className="text-[0.6875rem] text-gray-500 font-medium leading-tight">Digital-health maturity</span>
                              <span className="text-[0.875rem] font-bold text-[#0D212C] my-0.5">Advanced</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-medium border bg-orange-50 text-orange-700 border-orange-200 w-fit">
                                <Shield className="w-2.5 h-2.5" />
                                Med
                              </span>
                            </div>

                            <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs min-h-[84px]">
                              <span className="text-[0.6875rem] text-gray-500 font-medium leading-tight">Infrastructure & connectivity</span>
                              <span className="text-[0.875rem] font-bold text-[#0D212C] my-0.5">Strong · urban</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-medium border bg-green-50 text-green-700 border-green-200 w-fit">
                                <Shield className="w-2.5 h-2.5" />
                                High
                              </span>
                            </div>

                            <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs min-h-[84px]">
                              <span className="text-[0.6875rem] text-gray-500 font-medium leading-tight">Regulatory & policy</span>
                              <span className="text-[0.875rem] font-bold text-[#0D212C] my-0.5">Mandatory insurance</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-medium border bg-green-50 text-green-700 border-green-200 w-fit">
                                <Shield className="w-2.5 h-2.5" />
                                High
                              </span>
                            </div>

                            <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs min-h-[84px]">
                              <span className="text-[0.6875rem] text-gray-500 font-medium leading-tight">Disease burden</span>
                              <span className="text-[0.875rem] font-bold text-[#0D212C] my-0.5">NCD-driven</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-medium border bg-orange-50 text-orange-700 border-orange-200 w-fit">
                                <Shield className="w-2.5 h-2.5" />
                                Med
                              </span>
                            </div>

                            <div className="bg-white border border-gray-200/90 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between shadow-2xs min-h-[84px]">
                              <span className="text-[0.6875rem] text-gray-500 font-medium leading-tight">Geography / terrain</span>
                              <span className="text-[0.875rem] font-bold text-[#0D212C] my-0.5">Rural access gaps</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-medium border bg-green-50 text-green-700 border-green-200 w-fit">
                                <Shield className="w-2.5 h-2.5" />
                                High
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Confidence Explainer for Executive Summary Country Profile */}
                        {renderPageConfidenceExplainer(
                          'exec-summary-p1', 
                          88, 
                          'High Confidence', 
                          12, 
                          '5 / 6',
                          'High confidence (5/6). Country demographics, health economics, and workforce metrics cross-verified against official Health Authority registries and WHO statistical data.'
                        )}
                      </div>

                      {/* Running Footer with Page 1 */}
                      <div className="pt-2.5 mt-2 border-t border-gray-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 text-[0.625rem] text-gray-400">
                          <span>Confidential • Internal Distribution Only</span>
                          <span>•</span>
                          <span>Page 1 of {totalExecPages}</span>
                        </div>
                      </div>
                    </div>

                    {/* Executive Summary Page 2: Unmet Needs, Solutions & Comparison Table (Snapshot 2) */}
                    <div className="report-page-sheet bg-white shadow-xs border border-gray-200/90 rounded-xl p-6 sm:p-7 w-full min-h-[640px] h-auto flex flex-col justify-between relative shrink-0">
                      {/* Running Header with Confidence Chip */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3 text-[0.625rem] text-gray-400 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-600">M42 Intelligence Report</span>
                          <span>•</span>
                          <span>{thread.inputs.country || 'United Arab Emirates'} • {thread.inputs.techDomain || 'Generative AI, Machine Learning'}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.625rem] font-medium border bg-green-50 text-green-700 border-green-200">
                          <Shield className="w-2.5 h-2.5" />
                          High
                        </span>
                      </div>

                      {/* Main Visual Content */}
                      <div className="flex-1 flex flex-col justify-start gap-3">
                        {/* Top Row: Prioritised unmet needs & Suggested health-tech solutions */}
                        <div className="grid grid-cols-2 gap-3.5">
                          {/* Prioritised unmet needs */}
                          <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                            <h3 className="text-[0.875rem] font-bold font-['Poppins'] text-[#0D212C] mb-2">Prioritised unmet needs</h3>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-[#FFEADA] text-[#D8681B] text-[0.6875rem] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  1
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.8125rem] font-bold text-[#0D212C]">Rural & remote access gaps</span>
                                  <p className="text-[0.6875rem] text-gray-500 leading-snug mt-0.5">
                                    Limited specialist reach outside urban centres — case for tele-triage & RPM.
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-[#FFEADA] text-[#D8681B] text-[0.6875rem] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  2
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.8125rem] font-bold text-[#0D212C]">Rising NCD & chronic-care burden</span>
                                  <p className="text-[0.6875rem] text-gray-500 leading-snug mt-0.5">
                                    Diabetes & cardiovascular load driving demand for continuous monitoring.
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-[#FFEADA] text-[#D8681B] text-[0.6875rem] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  3
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.8125rem] font-bold text-[#0D212C]">Fragmented claims & reimbursement</span>
                                  <p className="text-[0.6875rem] text-gray-500 leading-snug mt-0.5">
                                    Mandatory insurance with manual claim workflows — fraud & leakage exposure.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Suggested health-tech solutions */}
                          <div className="bg-white border border-gray-200/90 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-[0.875rem] font-bold font-['Poppins'] text-[#0D212C]">Suggested health-tech solutions</h3>
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.625rem] font-medium border bg-green-50 text-green-700 border-green-200">
                                <Shield className="w-2.5 h-2.5" />
                                High
                              </span>
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="flex flex-col pb-1.5 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                  <span className="text-[0.8125rem] font-bold text-[#0D212C]">AI triage & virtual assistant</span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[0.625rem] font-semibold">
                                    Strong fit
                                  </span>
                                </div>
                                <span className="text-[0.6875rem] text-gray-500 mt-0.5">Answers rural access & workforce shortage</span>
                              </div>

                              <div className="flex flex-col pb-1.5 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                  <span className="text-[0.8125rem] font-bold text-[#0D212C]">Remote Patient Monitoring</span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[0.625rem] font-semibold">
                                    Strong fit
                                  </span>
                                </div>
                                <span className="text-[0.6875rem] text-gray-500 mt-0.5">Chronic / NCD continuous care</span>
                              </div>

                              <div className="flex flex-col">
                                <div className="flex items-center justify-between">
                                  <span className="text-[0.8125rem] font-bold text-[#0D212C]">Fraud-aware claims workflow</span>
                                  <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[0.625rem] font-semibold">
                                    Good fit
                                  </span>
                                </div>
                                <span className="text-[0.6875rem] text-gray-500 mt-0.5">InsurTech & reimbursement leakage</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Multi-country comparison */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between shrink-0">
                            <h3 className="text-[0.875rem] font-bold font-['Poppins'] text-[#0D212C]">Multi-country comparison</h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.625rem] font-medium border bg-green-50 text-green-700 border-green-200">
                              <Shield className="w-2.5 h-2.5" />
                              High
                            </span>
                          </div>

                          <div className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-2xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/40 text-[0.625rem] font-bold text-gray-400 uppercase tracking-wider">
                                  <th className="py-2 px-3.5">DIMENSION</th>
                                  <th className="py-2 px-3.5">{thread.inputs.country || 'UAE'}</th>
                                  <th className="py-2 px-3.5">KSA</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-[0.75rem]">
                                <tr>
                                  <td className="py-2 px-3.5 font-semibold text-slate-800">Digital-health maturity</td>
                                  <td className="py-2 px-3.5 text-slate-700 font-normal">Advanced</td>
                                  <td className="py-2 px-3.5 text-slate-700 font-normal">Growing</td>
                                </tr>
                                <tr>
                                  <td className="py-2 px-3.5 font-semibold text-slate-800">Health spend / capita</td>
                                  <td className="py-2 px-3.5 text-slate-700 font-normal">$1,842</td>
                                  <td className="py-2 px-3.5 text-slate-700 font-normal">$1,485</td>
                                </tr>
                                <tr>
                                  <td className="py-2 px-3.5 font-semibold text-slate-800">Reimbursement model</td>
                                  <td className="py-2 px-3.5 text-slate-700 font-normal">Mandatory</td>
                                  <td className="py-2 px-3.5 text-slate-700 font-normal">Expanding</td>
                                </tr>
                                <tr>
                                  <td className="py-2 px-3.5 font-semibold text-slate-800">RPM readiness</td>
                                  <td className="py-2 px-3.5 text-slate-700 font-normal">High</td>
                                  <td className="py-2 px-3.5 text-slate-700 font-normal">Medium</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Expandable Per-Page Confidence Explainer at Bottom (End of Executive Summary) */}
                        {renderPageConfidenceExplainer(
                          'exec-summary-p2', 
                          82, 
                          'High Confidence', 
                          18, 
                          '5 / 6',
                          'High confidence (5/6). Strategic unmet needs, RPM feasibility, and multi-country benchmarking cross-referenced across regional health frameworks and clinical policy documents.'
                        )}
                      </div>

                      {/* Running Footer with Page 2 */}
                      <div className="pt-2.5 mt-2 border-t border-gray-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 text-[0.625rem] text-gray-400">
                          <span>Confidential • Internal Distribution Only</span>
                          <span>•</span>
                          <span>Page 2 of {totalExecPages}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* ----------------- DETAILED REPORT TAB: COVER PAGE ----------------- */}
                {activeTab === 'word-document' && (
                  <div className="report-page-sheet bg-white shadow-xs border border-gray-200/90 rounded-xl p-6 sm:p-8 w-full min-h-[640px] h-auto flex flex-col justify-between relative shrink-0">
                    <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-[#36c0c9]/15 to-transparent rounded-bl-[100%] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-[#0D212C]/5 to-transparent rounded-tr-[100%] pointer-events-none" />
                    
                    {/* Cover Page Header with Confidence Chip */}
                    <div className="z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-[#0D212C] rounded-lg flex items-center justify-center text-white font-bold text-[0.875rem] tracking-tighter shadow-xs">M42</div>
                        <h2 className="text-[#36c0c9] font-semibold tracking-widest uppercase text-[0.625rem]">Strategic Intelligence</h2>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.625rem] font-medium border ${
                        averageConfidence >= 80 ? 'bg-green-50 text-green-700 border-green-200' : 
                        averageConfidence >= 40 ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <Shield className="w-2.5 h-2.5" />
                        {averageConfidence >= 80 ? 'High Confidence' : averageConfidence >= 40 ? 'Medium Confidence' : 'Low Confidence'}
                      </span>
                    </div>
                    
                    <div className="my-auto z-10 py-4">
                      <h1 className="text-[1.25rem] font-medium font-['Poppins'] text-[#0D212C] leading-[1.25] mb-2 max-w-lg tracking-tight">
                        {thread.title}
                      </h1>
                      <div className="w-14 h-1 bg-[#36c0c9] mb-3" />
                      
                      <p className="text-[0.75rem] text-gray-500 max-w-md leading-relaxed font-normal">
                        Comprehensive market analysis, technology landscape evaluation, and strategic roadmap recommendations.
                      </p>
                    </div>

                    {/* Cover Page Footer with End-of-Page Comments */}
                    <div className="mt-auto z-10 pt-2.5 border-t border-gray-100 flex items-center justify-between shrink-0">
                      <div>
                        <p className="text-gray-400 font-medium text-[0.5625rem] tracking-widest uppercase mb-0.5">Prepared For</p>
                        <p className="text-[#0D212C] font-semibold text-[0.8125rem]">M42 Executive Board • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      {renderCommentButtonAndPopover('cover-page')}
                    </div>
                  </div>
                )}

                {/* ----------------- SUBSEQUENT PAGINATED REPORT PAGES ----------------- */}
                {paginatedPages.map((page: any, pageIdx: number) => {
                  const totalReportPages = activeTab === 'word-document' ? paginatedPages.length + 1 : totalExecPages;
                  const currentPageNumber = activeTab === 'word-document' ? pageIdx + 2 : pageIdx + 3;

                  return (
                    <div 
                      key={page.id} 
                      id={page.isFirstPageOfSection ? page.sectionId : undefined}
                      ref={page.isFirstPageOfSection ? (el => { sectionRefs.current[page.sectionIndex] = el; }) : undefined}
                      className="report-page-sheet bg-white shadow-xs border border-gray-200/90 rounded-xl p-6 sm:p-8 w-full min-h-[640px] h-auto flex flex-col justify-between relative shrink-0"
                    >
                      {/* Running Header with Confidence Chip on Every Page */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3 text-[0.625rem] text-gray-400 shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-600">M42 Intelligence Report</span>
                          <span>•</span>
                          <span>{thread.inputs.country || 'Global'} • {thread.inputs.techDomain || 'Tech'}</span>
                        </div>
                        {page.confidenceScore && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-medium border ${
                            page.confidenceScore >= 80 ? 'bg-green-50 text-green-700 border-green-200' : 
                            page.confidenceScore >= 40 ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                            'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <Shield className="w-2.5 h-2.5" />
                            {page.confidenceScore >= 80 ? 'High' : page.confidenceScore >= 40 ? 'Medium' : 'Low'}
                          </span>
                        )}
                      </div>

                      {/* Section Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex flex-col justify-start">
                          {page.isFirstPageOfSection ? (
                            <div className="flex items-center justify-between mb-2.5 shrink-0">
                              <h2 className="text-[0.9375rem] font-semibold font-['Poppins'] text-[#0D212C]">
                                {page.sectionIndex + 1}. {page.sectionTitle}
                              </h2>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between mb-2 shrink-0">
                              <h3 className="text-[0.8125rem] font-medium text-gray-500">
                                {page.sectionIndex + 1}. {page.sectionTitle} <span className="text-[0.6875rem] font-normal text-gray-400">({page.pageIndexInSection}/{page.totalPagesInSection})</span>
                              </h3>
                            </div>
                          )}

                          <div className="flex flex-col justify-start">
                            {page.blocks && page.blocks.length > 0 ? (
                              <ReportRenderer blocks={page.blocks} isWordDocument={activeTab === 'word-document'} />
                            ) : page.rawContent ? (
                              <div dangerouslySetInnerHTML={{ __html: page.rawContent }} />
                            ) : null}
                          </div>
                        </div>

                        {/* Per-Section Confidence Explainer at Bottom when section content is completed */}
                        {page.isLastPageOfSection && page.confidenceScore && (
                          renderPageConfidenceExplainer(
                            page.id, 
                            page.confidenceScore, 
                            page.confidenceScore >= 80 ? 'High Confidence' : page.confidenceScore >= 40 ? 'Medium Confidence' : 'Low Confidence',
                            page.confidenceScore >= 80 ? 11 : page.confidenceScore >= 40 ? 9 : 7,
                            page.confidenceScore >= 80 ? '5 / 6' : page.confidenceScore >= 40 ? '4 / 6' : '3 / 6',
                            page.confidenceReason || (
                              page.confidenceScore >= 80 
                                ? `High confidence (5/6) for "${page.sectionTitle}". Data points and regulatory assertions verified against authoritative government databases, peer-reviewed clinical studies, and official national health registries.`
                                : page.confidenceScore >= 40
                                ? `Medium confidence (4/6) for "${page.sectionTitle}". Section synthesized from reputable industry consulting reports, commercial market intelligence, and secondary publisher sources.`
                                : `Low confidence (3/6) for "${page.sectionTitle}". Preliminary evaluation derived from early draft announcements, uncorroborated market projections, and open-web estimates.`
                            )
                          )
                        )}
                      </div>

                      {/* End-of-Page Comments Bar & Running Footer */}
                      <div className="pt-2.5 mt-3 border-t border-gray-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 text-[0.625rem] text-gray-400">
                          <span>Confidential • Internal Distribution Only</span>
                          <span>•</span>
                          <span>Page {currentPageNumber} of {totalReportPages}</span>
                        </div>
                        {activeTab !== 'executive-summary' && renderCommentButtonAndPopover(page.id)}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>

            {/* Floating Bottom-Right Zoom Controls (Light Theme, Matches Attached Snapshot) */}
            <div className="absolute bottom-5 right-6 z-40 flex items-center bg-white border border-gray-200/90 rounded-full px-3 py-1.5 shadow-md gap-2.5 text-slate-700 no-print">
              <button 
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[0.75rem] font-semibold text-slate-800 min-w-[34px] text-center select-none">
                {zoomLevel}%
              </span>
              <button 
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-3.5 bg-gray-200" />
              <button 
                onClick={() => setZoomLevel(100)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Reset Zoom / Fit"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Floating Bar for Regenerate / Feedback */}
            {(!selectedVersionId || selectedVersionId === thread.versions[thread.versions.length - 1].id) && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 no-print">
                {activeTab === 'word-document' && (
                  <button 
                    onClick={handleRegenerate}
                    disabled={!hasAtLeastOneComment}
                    className="px-5 py-2 bg-gradient-to-r from-[#0a4d53] to-[#05292c] text-white rounded-full text-[0.8125rem] font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Regenerate Report
                  </button>
                )}
                
                {!thread?.feedbackSubmitted && activeTab !== 'executive-summary' && (
                  <div className="flex items-center gap-2.5 bg-white border border-gray-200 shadow-sm rounded-full px-3 py-1">
                    <span className="text-[0.75rem] font-medium text-gray-500">Was this report helpful?</span>
                    <button 
                      onClick={() => { setFeedbackType('up'); setShowFeedbackModal(true); cancelTimer(); }}
                      className="p-1 rounded-full transition-colors hover:bg-gray-100 text-gray-400 hover:text-green-600"
                      title="Yes"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => { setFeedbackType('down'); setShowFeedbackModal(true); cancelTimer(); }}
                      className="p-1 rounded-full transition-colors hover:bg-gray-100 text-gray-400 hover:text-red-600"
                      title="No"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col items-center border border-gray-100 p-8 relative"
          >
            <h3 className="text-[1.125rem] font-semibold text-[#0D212C] mb-2 font-['Poppins'] text-center">Report Feedback</h3>
            <p className="text-[0.8125rem] text-gray-500 mb-6 text-center">Help us improve by sharing your thoughts on this generated intelligence report.</p>
            
            <div className="flex items-center gap-6 mb-6">
              <button 
                onClick={() => setFeedbackType('up')}
                className={`p-4 transition-all ${feedbackType === 'up' ? 'text-green-600 scale-110' : 'text-gray-400 hover:text-green-500'}`}
              >
                <ThumbsUp className="w-8 h-8" />
              </button>
              <button 
                onClick={() => setFeedbackType('down')}
                className={`p-4 transition-all ${feedbackType === 'down' ? 'text-red-600 scale-110' : 'text-gray-400 hover:text-red-500'}`}
              >
                <ThumbsDown className="w-8 h-8" />
              </button>
            </div>
            
            <div className="w-full mb-8">
              <label className="block text-[0.8125rem] font-medium text-[#0D212C] mb-2 font-['Poppins']">Additional comments (optional)</label>
              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={feedbackType === 'up' ? "What did you like?" : feedbackType === 'down' ? "What didn't you like?" : "What did you like or dislike?"}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-[0.8125rem] min-h-[100px] focus:outline-none focus:border-[#36c0c9] focus:ring-1 focus:ring-[#36c0c9] resize-none"
              />
            </div>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => { 
                  setShowFeedbackModal(false); 
                  setFeedbackText(''); 
                  setFeedbackType(null); 
                  cancelTimer(); 
                }}
                className="flex-1 px-4 py-2.5 text-[0.875rem] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setHasGivenFeedback(true);
                  if (thread) {
                    updateThread({ ...thread, feedbackSubmitted: true });
                  }
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setFeedbackType(null);
                  cancelTimer();
                  notificationService.notify("Response submitted", "success");
                }}
                disabled={!feedbackType && !feedbackText.trim()}
                className="flex-1 px-4 py-2.5 text-[0.875rem] font-medium text-white bg-[#0D212C] hover:bg-[#153443] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Submit Feedback
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}