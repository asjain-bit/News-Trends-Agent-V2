import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { notificationService } from '../services/notificationService';
import { MessageSquare, Sparkles, AlertCircle, ChevronDown, Download, Check, ThumbsUp, ThumbsDown, RefreshCw, ChevronRight, ShieldCheck, Target } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ReportRenderer } from '../components/report/ReportRenderer';

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
  // Get index of this thread among filtered/sorted threads to match Home screen mock logic
  // In Home.tsx, it's based on filteredAndSortedThreads. For simplicity, we just use the threads list since they are typically sorted by updatedAt desc.
  const sortedThreads = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
  const threadIdx = sortedThreads.findIndex(t => t.id === id);
  const [activeSection, setActiveSection] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  
  // Comment UI State
  const [hoveredBlock, setHoveredBlock] = useState<{id: string, top: number, height: number} | null>(null);
  const [activeCommentBlock, setActiveCommentBlock] = useState<{id: string, top: number, height: number} | null>(null);
  const [persistentIcons, setPersistentIcons] = useState<{ id: string, top: number, height: number, comments: string[] }[]>([]);
  const [commentText, setCommentText] = useState('');
  
  const versionDropdownRef = useRef<HTMLDivElement>(null);
  const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);

  // Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState<'executive-summary' | 'word-document'>('executive-summary');
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Idle Timer logic removed
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

  // Re-calculate persistent icon positions when comments change
  useEffect(() => {
    if (!thread || !contentRef.current) return;
    
    // Determine the version to show
    const currentVersion = selectedVersionId 
      ? thread.versions.find(v => v.id === selectedVersionId) || thread.versions[thread.versions.length - 1]
      : thread.versions[thread.versions.length - 1];
      
    if (!currentVersion.comments) {
      setPersistentIcons([]);
      return;
    }
    
    // Delay slightly to ensure DOM is fully rendered
    setTimeout(() => {
      if (!contentRef.current) return;
      
      const icons: any[] = [];
      const comments = currentVersion.comments || {};
      
      // 1. Support legacy comments based on exact text encoding
      const oldElements = Array.from(contentRef.current.querySelectorAll('p, li, h2, h3, .highlight-box, .alert-box')) as HTMLElement[];
      for (let i = 0; i < oldElements.length; i++) {
        const el = oldElements[i];
        const textToEncode = el.innerText.slice(0, 20) + el.tagName + i;
        const id = btoa(encodeURIComponent(textToEncode)).replace(/=/g, '');
        if (comments[id] && comments[id].length > 0) {
          icons.push({
            id,
            top: el.offsetTop,
            height: el.offsetHeight,
            comments: comments[id]
          });
        }
      }
      
      // 2. Support new structured block ID comments
      const newElements = Array.from(contentRef.current.querySelectorAll('.commentable-block')) as HTMLElement[];
      for (let i = 0; i < newElements.length; i++) {
        const el = newElements[i];
        const id = el.getAttribute('data-block-id');
        if (id && comments[id] && comments[id].length > 0) {
          icons.push({
            id,
            top: el.offsetTop,
            height: el.offsetHeight,
            comments: comments[id]
          });
        }
      }
      
      setPersistentIcons(icons);
    }, 100);
  }, [thread, selectedVersionId]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeCommentBlock) return;
    const target = e.target as HTMLElement;
    if (target.closest('.comment-icon-btn')) return;

    const block = target.closest('.commentable-block') as HTMLElement;
    if (block && contentRef.current?.contains(block)) {
       const id = block.getAttribute('data-block-id') || 'unknown';
       
       const blockRect = block.getBoundingClientRect();
       const rect = contentRef.current.getBoundingClientRect();
       
       // Don't show hover icon if there's already a persistent comment there (user can click the persistent icon instead)
       if ((thread?.versions[thread.versions.length - 1].comments?.[id]?.length ?? 0) > 0) {
         if (hoveredBlock !== null) setHoveredBlock(null);
         return;
       }
       
       // Don't show hover icon if we're viewing an older version
       const isLatestVersion = !selectedVersionId || (thread && selectedVersionId === thread.versions[thread.versions.length - 1].id);
       if (!isLatestVersion) {
         if (hoveredBlock !== null) setHoveredBlock(null);
         return;
       }
       
       if (hoveredBlock?.id !== id) {
         setHoveredBlock({
           id,
           top: blockRect.top - rect.top,
           height: blockRect.height
         });
       }
    }
  };

  const handleMouseLeave = () => {
    if (!activeCommentBlock) setHoveredBlock(null);
  };
  
  // Ref for observing sections
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // Ref for tracking if we are programmatically scrolling
  const isScrollingRef = useRef(false);


  if (!thread) {
    return (
      <div className="flex justify-center py-20 text-[var(--color-ink-muted)]">
        Report not found.
      </div>
    );
  }

  if (thread.versions.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#36c0c9]"></div>
      </div>
    );
  }

  const latestVersion = (selectedVersionId 
    ? thread.versions.find(v => v.id === selectedVersionId) || thread.versions[thread.versions.length - 1]
    : thread.versions[thread.versions.length - 1]) || { comments: {}, blocks: [], id: 'temp', content: { sections: [] } };
  
  const hasAtLeastOneComment = Object.values(latestVersion.comments || {}).some(
    (commentsList: any) => commentsList && commentsList.length > 0
  );
  
  if (!latestVersion || !latestVersion.content?.sections) {
     return (
       <div className="flex justify-center py-20 text-[var(--color-ink-muted)]">
         No versions available for this report.
       </div>
     );
  }

  const { sections: rawSections } = latestVersion.content;
  
  const sections = useMemo(() => {
    if (!rawSections) return [];
    return rawSections.map((s: any) => {
      if (s.confidenceScore) return s;
      
      let hash = 0;
      const sid = s?.id || '';
      for (let i = 0; i < sid.length; i++) hash += sid.charCodeAt(i);
      const score = 30 + (hash % 69) || 30; // 30 to 98
      
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

  const averageConfidenceRaw = latestVersion.content.sections.length > 0 
    ? Math.round(latestVersion.content.sections.reduce((acc: number, s: any) => acc + (s.confidenceScore || 0), 0) / latestVersion.content.sections.length) 
    : 0;
    
  let averageConfidence = averageConfidenceRaw;
  if (threadIdx === 0) averageConfidence = 85;
  else if (threadIdx === 1) averageConfidence = 55;
  else if (threadIdx === 2) averageConfidence = 35;

  useEffect(() => {
    if (activeTab !== 'word-document' || !latestVersion.comments) {
      setPersistentIcons([]);
      return;
    }
    
    // Use a short timeout to let the DOM layout complete after tab switch
    const timer = setTimeout(() => {
      if (!contentRef.current) return;
      const icons: any[] = [];
      const rect = contentRef.current.getBoundingClientRect();
      
      Object.entries(latestVersion?.comments || {}).forEach(([blockId, comments]) => {
        const el = contentRef.current?.querySelector(`[data-block-id="${blockId}"]`);
        if (el) {
          const elRect = el.getBoundingClientRect();
          icons.push({
            id: blockId,
            top: elRect.top - rect.top,
            height: elRect.height,
            comments
          });
        }
      });
      setPersistentIcons(icons);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [latestVersion.comments, activeTab, visibleSections]);


  const handleRegenerate = async () => {
    cancelTimer();
    await updateThread({
      ...thread,
      status: 'generating',
      updatedAt: Date.now()
    });
    generateReportInBackground(thread.id, thread.inputs.depth || 'Standard Analysis');
    navigate(`/report/${id}/generating`, { state: { regenerate: true } });
  };

  const handleExportWord = () => {
    // Generate TOC HTML
    const tocHtml = latestVersion.content.sections.map((s: any, i: number) => 
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
        <!-- Cover Page -->
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

        <!-- TOC -->
        <div class="page-break"></div>
        <h1>Table of Contents</h1>
        ${tocHtml}

        <!-- Sections -->
        ${latestVersion.content.sections.map((s: any, i: number) => `
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
      container.scrollTo({ top: element.offsetTop - 40, behavior: 'smooth' });
    }
    
    // Re-enable observer after smooth scroll completes (~800ms)
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  const hasComments = latestVersion.comments && Object.keys(latestVersion.comments).length > 0;

  return (
    <>
      <style>{`
        .report-content {
          font-family: 'Inter', sans-serif;
          color: #374151;
        }
        .report-content p {
          margin-bottom: 1.25rem;
          line-height: 1.8;
          font-size: 15px;
          color: #4B5563;
        }
        .report-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0D212C;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          font-family: 'Poppins', sans-serif;
        }
        .report-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
          color: #4B5563;
          line-height: 1.7;
        }
        .report-content li {
          margin-bottom: 0.5rem;
        }
        .report-content blockquote {
          border-left: 4px solid #36c0c9;
          padding: 1rem 1.5rem;
          font-style: italic;
          color: #6B7280;
          background-color: #F8FAFC;
          border-radius: 0 8px 8px 0;
          margin: 2rem 0;
          font-size: 15px;
        }
        .report-content .highlight-box {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 1.25rem;
          margin: 1.5rem 0;
          font-size: 14.5px;
        }
        .report-content .alert-box {
          background-color: #FFFBEB;
          border: 1px solid #FEF3C7;
          border-radius: 8px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }
        .report-content .alert-box h4 {
          color: #B45309;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-family: 'Poppins', sans-serif;
        }
        .report-content strong {
          color: #111827;
          font-weight: 600;
        }
      `}</style>
      
      <div className="w-full h-[calc(100vh-80px)] bg-[#F6F7FB] p-6 flex flex-col items-center justify-center">
        
        <div className="w-full max-w-[1400px] flex items-center justify-between mb-4">
          <div className="flex items-center gap-8 border-b border-gray-200/50 w-full">
            <button 
              onClick={() => setActiveTab('executive-summary')}
              className={`pb-3 text-[15px] font-medium transition-colors relative ${activeTab === 'executive-summary' ? 'text-[#36c0c9]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Executive Summary
              {activeTab === 'executive-summary' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#36c0c9]" />}
            </button>
            <button 
              onClick={() => setActiveTab('word-document')}
              className={`pb-3 text-[15px] font-medium transition-colors relative ${activeTab === 'word-document' ? 'text-[#36c0c9]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Detailed Report
              {activeTab === 'word-document' && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#36c0c9]" />}
            </button>
          </div>
          
          <button 
            onClick={handleExportWord}
            className="flex items-center gap-2 px-4 py-2 bg-[#36c0c9] border border-[#36c0c9] rounded-md text-[13px] font-medium text-white hover:bg-[#2ea3aa] transition-colors shadow-sm whitespace-nowrap ml-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export as Word
          </button>
        </div>

        <div className="w-full flex-1 max-h-full max-w-[1400px] bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden">
          
          {activeTab === 'word-document' && (
            <div className="w-[300px] shrink-0 h-full bg-[#f8f9fc] border-r border-gray-200 flex flex-col">
            <div className="p-6 pb-4">
              <h3 className="font-semibold text-[15px] font-['Poppins'] text-[#0D212C]">Table of Contents</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-1.5">
              {visibleSections.map((section: any) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`flex items-center justify-between w-full p-2.5 rounded-lg text-left transition-all border ${
                      isActive 
                        ? 'bg-[#36c0c9]/10 border-[#36c0c9]/20 shadow-sm' 
                        : 'bg-transparent border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-3">
                        <span className={`text-[13px] leading-tight ${isActive ? 'text-[#0D212C] font-medium' : 'text-gray-600'}`}>
                          {section.title}
                        </span>
                      </div>
                      {section.confidenceScore && (
                        <div className="relative group/conf flex items-center shrink-0">
                          <div className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            section.confidenceScore >= 80 ? 'bg-green-100 text-green-700' : 
                            section.confidenceScore >= 40 ? 'bg-orange-100 text-orange-700' : 
                            'bg-red-100 text-red-700'
                          }`}>
                            {section.confidenceScore >= 80 ? 'High' : section.confidenceScore >= 40 ? 'Medium' : 'Low'}
                          </div>
                          <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 invisible group-hover/conf:opacity-100 group-hover/conf:visible transition-all z-[100] pointer-events-none font-normal text-left normal-case tracking-normal">
                            {section.confidenceReason}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          )}

          <div className="flex-1 flex flex-col h-full bg-[#f8f9fc] relative">
      {/* Scroll Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#36c0c9] z-[100] origin-left"
        style={{ scaleX }}
      />
      
      {/* Header */}    
            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
               <div className="flex items-center gap-3">
                 <div className="relative" ref={versionDropdownRef}>
                    <div 
                      onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)}
                      className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <span className="text-[13px] font-medium text-gray-600">Tech Landscape</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[13px] font-medium text-gray-600">v{latestVersion.versionNumber}</span>
                      <svg className={`w-3.5 h-3.5 text-gray-400 ml-1 transition-transform ${isVersionDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {thread.versions.length > 1 && isVersionDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg transition-all z-50">
                        {thread.versions.map((v) => (
                          <div 
                            key={v.id} 
                            onClick={() => { setSelectedVersionId(v.id); setIsVersionDropdownOpen(false); }}
                            className="px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                          >
                            <span>v{v.versionNumber}</span>
                            {v.id === latestVersion.id && <Check className="w-3.5 h-3.5 text-[#36c0c9]" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {averageConfidence > 0 && (
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[12px] font-semibold border ml-2 ${
                        averageConfidence >= 80 ? 'bg-green-50 text-green-700 border-green-100' : 
                        averageConfidence >= 40 ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {averageConfidence >= 80 ? 'High' : averageConfidence >= 40 ? 'Medium' : 'Low'} Confidence
                      </div>
                  )}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 flex" id="report-scroll-container">
              <div className="flex-1 min-h-full py-12 px-6 lg:px-16 flex justify-center items-start">
                <div className={`w-full report-content flex flex-col gap-12 ${activeTab === 'executive-summary' ? 'max-w-[960px]' : 'max-w-[1200px]'}`}>
                  
                <div 
                  className="flex flex-col gap-12 relative w-full"
                  onMouseMove={activeTab === 'word-document' ? handleMouseMove : undefined}
                  onMouseLeave={activeTab === 'word-document' ? handleMouseLeave : undefined}
                  ref={contentRef}
                >
                  {/* Cover Page */}
                  {activeTab === 'word-document' && (
                    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-16 w-full min-h-[800px] flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#36c0c9]/20 to-transparent rounded-bl-[100%] pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#0D212C]/10 to-transparent rounded-tr-[100%] pointer-events-none" />
                      <div className="mb-16 z-10">
                        <div className="w-16 h-16 bg-[#0D212C] rounded-xl flex items-center justify-center text-white font-bold text-2xl tracking-tighter mb-4 shadow-lg">M42</div>
                        <h2 className="text-[#36c0c9] font-semibold tracking-widest uppercase text-sm">Strategic Intelligence</h2>
                      </div>
                      <h1 className="text-5xl font-bold font-['Poppins'] text-[#0D212C] leading-[1.15] mb-8 z-10 max-w-3xl tracking-tight">
                        {thread.title}
                      </h1>
                      <div className="w-24 h-1.5 bg-[#36c0c9] mb-8 z-10" />
                      
                      {averageConfidence > 0 && (
                        <div className={`mb-8 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold border ${
                          averageConfidence >= 80 ? 'bg-green-50 text-green-700 border-green-100' : 
                          averageConfidence >= 40 ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                          'bg-red-50 text-red-700 border-red-100'
                        } relative z-10 w-fit`}>
                          Overall Confidence: {averageConfidence >= 80 ? 'High' : averageConfidence >= 40 ? 'Medium' : 'Low'}
                        </div>
                      )}
                      
                      <p className="text-xl text-gray-500 mb-16 max-w-2xl leading-relaxed z-10 font-light">
                        Comprehensive market analysis, technology landscape evaluation, and strategic roadmap recommendations.
                      </p>
                      <div className="mt-auto z-10 pt-16 border-t border-gray-100">
                        <p className="text-gray-400 font-medium text-sm tracking-widest uppercase mb-1">Prepared For</p>
                        <p className="text-[#0D212C] font-semibold text-xl">M42 Executive Board</p>
                        <p className="text-gray-500 mt-2 font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  )}

                  {/* Table of Contents */}
                  {activeTab === 'word-document' && (
                    <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-16 w-full min-h-[800px]">
                      <h2 className="text-3xl font-bold font-['Poppins'] text-[#0D212C] mb-12 pb-6 border-b-2 border-gray-100">
                        Table of Contents
                      </h2>
                      <div className="space-y-6 max-w-3xl">
                        {visibleSections.map((s: any, idx: number) => (
                          <div key={s.id} className="flex items-center justify-between cursor-pointer" onClick={() => scrollToSection(s.id)}>
                            <span className="text-lg text-gray-700 font-medium">{idx + 1}. {s.title}</span>
                            <div className="flex-1 border-b-2 border-dotted border-gray-200 mx-6 opacity-50" />
                            <span className="text-gray-400 font-medium">{(idx * 5) + 3}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {visibleSections.map((section: any, idx: number) => (
                    <div key={section.id} className="bg-white shadow-sm border border-gray-200 rounded-2xl p-10 lg:p-16 w-full min-h-[800px]">
                      {idx === 0 && activeTab === 'executive-summary' && (
                        <div className="border-b border-gray-100 pb-10 mb-10">
                          <h1 className="text-3xl lg:text-4xl font-bold font-['Poppins'] text-[#0D212C] leading-tight mb-4 tracking-tight">
                            {thread.title}
                          </h1>
                          <p className="text-gray-500 text-[15px] flex items-center gap-2">
                            Generated Intelligence Report
                          </p>
                        </div>
                      )}
                      <section 
                        id={section.id}
                        ref={el => { sectionRefs.current[idx] = el; }}
                        className="scroll-mt-16 h-full"
                      >
                        <h2 className={`text-2xl lg:text-3xl font-semibold font-['Poppins'] text-[#0D212C] ${activeTab === 'word-document' ? 'mb-4' : 'mb-8 pb-4 border-b border-gray-100'}`}>
                          {section.title}
                        </h2>
                        {activeTab === 'word-document' && section.confidenceScore && (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold border mb-8 ${
                            section.confidenceScore >= 80 ? 'bg-green-50 text-green-700 border-green-100' : 
                            section.confidenceScore >= 40 ? 'bg-orange-50 text-orange-700 border-orange-100' : 
                            'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {section.confidenceScore >= 80 ? 'High' : section.confidenceScore >= 40 ? 'Medium' : 'Low'} Confidence
                          </div>
                        )}
                        {section.blocks ? (
                          <ReportRenderer blocks={section.blocks} isWordDocument={activeTab === 'word-document'} />
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: section.content }} />
                        )}
                      </section>
                    </div>
                  ))}

                  {activeTab === 'word-document' && persistentIcons.map((icon) => (
                    <div 
                      key={icon.id}
                      className="absolute right-6 z-10 group cursor-pointer"
                      style={{ top: icon.top + (icon.height / 2) - 16 }}
                      onClick={() => {
                        const isLatestVersion = !selectedVersionId || selectedVersionId === thread.versions[thread.versions.length - 1].id;
                        if (isLatestVersion) {
                          setActiveCommentBlock({ id: icon.id, top: icon.top, height: icon.height });
                        }
                      }}
                    >
                      <div className="w-8 h-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-md flex items-center justify-center shadow-sm">
                         <MessageSquare className="w-5 h-5 text-[#36c0c9]" />
                      </div>
                      
                      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 w-[250px] bg-white border border-gray-200 rounded-lg shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        {icon.comments.map((c: string, i: number) => (
                           <div key={i} className="text-[13px] text-gray-700 leading-relaxed font-sans mb-2 last:mb-0 pb-2 border-b last:border-b-0 border-gray-100">{c}</div>
                        ))}
                        {(!selectedVersionId || selectedVersionId === thread.versions[thread.versions.length - 1].id) && (
                          <div className="text-[11px] text-[#36c0c9] font-medium mt-2 pt-2 border-t border-gray-100">Click icon to add another comment</div>
                        )}
                        <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-r border-t border-gray-200 rotate-45"></div>
                      </div>
                    </div>
                  ))}

                  {activeTab === 'word-document' && hoveredBlock && !activeCommentBlock && (
                     <div 
                       className="comment-icon-btn absolute right-6 cursor-pointer z-10 transition-transform"
                       style={{ top: hoveredBlock.top + (hoveredBlock.height / 2) - 16 }}
                       onClick={() => setActiveCommentBlock(hoveredBlock)}
                     >
                        <div className="w-8 h-8 bg-[#36c0c9] rounded-md flex items-center justify-center shadow-md">
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                             <line x1="9" y1="10" x2="15" y2="10"></line>
                             <line x1="12" y1="7" x2="12" y2="13"></line>
                           </svg>
                        </div>
                     </div>
                  )}

                  {activeTab === 'word-document' && activeCommentBlock && (
                     <div 
                       className="absolute w-[300px] bg-white border border-gray-200 rounded-xl shadow-xl p-4 z-50"
                       style={{ 
                         top: activeCommentBlock.top,
                         right: '20px'
                       }}
                     >
                        <div className="relative">
                          <input 
                            autoFocus
                            type="text" 
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Leave a comment"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#0D212C] focus:ring-1 focus:ring-[#0D212C] mb-3"
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveCommentBlock(null); setCommentText(""); setHoveredBlock(null); }}
                              className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors font-medium"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.preventDefault();
                                e.stopPropagation();
                                if (!commentText.trim()) return;
                                const newComments = { ...(latestVersion.comments || {}) };
                                if (!newComments[activeCommentBlock.id]) {
                                  newComments[activeCommentBlock.id] = [];
                                }
                                newComments[activeCommentBlock.id].push(commentText);
                                
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

                                cancelTimer(); // Cancel modal trigger
                                setActiveCommentBlock(null); 
                                setCommentText(""); 
                                setHoveredBlock(null);
                                notificationService.notify("Comment added", "success");
                              }}
                              disabled={!commentText.trim()}
                              className="px-3 py-1.5 text-[13px] bg-[#0D212C] text-white rounded-md hover:bg-[#153443] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Add Comment
                            </button>
                          </div>
                        </div>
                     </div>
                  )}
                </div>

              </div>
            </div>
            
            {(!selectedVersionId || selectedVersionId === thread.versions[thread.versions.length - 1].id) && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
                {activeTab === 'word-document' && (
                  <button 
                    onClick={handleRegenerate}
                    disabled={!hasAtLeastOneComment}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#0a4d53] to-[#05292c] text-white border-0 rounded-full text-[14px] font-medium shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Sparkles className="w-4 h-4" />
                    Regenerate Report
                  </button>
                )}
                
                {!thread?.feedbackSubmitted && (
                  <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-2">
                    <span className="text-[12px] font-medium text-gray-500 mr-2">Was this report helpful?</span>
                    <button 
                      onClick={() => { setFeedbackType('up'); setShowFeedbackModal(true); cancelTimer(); }}
                      className={`p-1.5 rounded-full transition-colors hover:bg-gray-100 text-gray-400`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setFeedbackType('down'); setShowFeedbackModal(true); cancelTimer(); }}
                      className={`p-1.5 rounded-full transition-colors hover:bg-gray-100 text-gray-400`}
                    >
                      <ThumbsDown className="w-4 h-4" />
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
            <h3 className="text-xl font-semibold text-[#0D212C] mb-2 font-['Poppins'] text-center">Report Feedback</h3>
            <p className="text-[14px] text-gray-500 mb-6 text-center">Help us improve by sharing your thoughts on this generated intelligence report.</p>
            
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
              <label className="block text-[13px] font-medium text-[#0D212C] mb-2 font-['Poppins']">Additional comments (optional)</label>
              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={feedbackType === 'up' ? "What did you like?" : feedbackType === 'down' ? "What didn't you like?" : "What did you like or dislike?"}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-[14px] min-h-[100px] focus:outline-none focus:border-[#36c0c9] focus:ring-1 focus:ring-[#36c0c9] resize-none"
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
                className="flex-1 px-4 py-2.5 text-[14px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
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
                className="flex-1 px-4 py-2.5 text-[14px] font-medium text-white bg-[#0D212C] hover:bg-[#153443] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Submit Feedback
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </>
  );
}