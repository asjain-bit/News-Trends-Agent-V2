import React from 'react';
import { ReportBlock } from './types';
import { Target } from 'lucide-react';
import { ReportChart } from './ReportChart';
import { ReportKPIs } from './ReportKPIs';
import { ReportCallout } from './ReportCallout';
import { ReportMatrix } from './ReportMatrix';
import { ReportTable } from './ReportTable';

interface ReportRendererProps {
  blocks: ReportBlock[];
  isWordDocument?: boolean;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({ blocks, isWordDocument }) => {
  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <div key={block.id} className="commentable-block" data-block-id={block.id}>
          {(() => {
            switch (block.type) {
              case 'text':
                return (
                  <div className="space-y-2.5 text-gray-700 leading-relaxed text-[0.8125rem]">
                    {block.data.paragraphs.map((p: string, idx: number) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                );
              case 'kpi-grid':
                return <ReportKPIs data={block.data} isWordDocument={isWordDocument} />;
              case 'chart':
                if (isWordDocument) {
                  const chartConfig = {
                    type: 'bar',
                    data: {
                      labels: block.data.data.map((d: any) => d.name),
                      datasets: [{
                        label: 'Value',
                        data: block.data.data.map((d: any) => d.value),
                        backgroundColor: '#36c0c9',
                        borderRadius: 4
                      }]
                    },
                    options: {
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false } },
                        y: { grid: { borderDash: [2, 2], color: '#f0f0f0' } }
                      }
                    }
                  };
                  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=800&h=350&bkg=white`;
                  return (
                    <div className="my-2">
                      <h3 className="text-[0.9375rem] font-semibold text-[#0D212C] mb-1">{block.data.title}</h3>
                      <p className="text-gray-500 mb-3 text-[0.75rem]">{block.data.description}</p>
                      <div className="w-full flex justify-center">
                        <img src={chartUrl} alt="Chart" className="max-w-full h-auto max-h-[220px]" />
                      </div>
                    </div>
                  );
                }
                return <ReportChart data={block.data} />;
              case 'callout':
                return <ReportCallout data={block.data} isWordDocument={isWordDocument} />;
              case 'swot':
                return <ReportMatrix data={block.data} isWordDocument={isWordDocument} />;
              case 'table':
                return <ReportTable data={block.data} isWordDocument={isWordDocument} />;
              case 'image':
                return (
                  <div className="my-2">
                    <img 
                      src={block.data.src} 
                      alt={block.data.alt} 
                      className="w-full rounded-xl shadow-xs object-cover max-h-[260px]"
                    />
                    {block.data.caption && (
                      <p className="text-[0.75rem] text-gray-500 mt-2 text-center italic">{block.data.caption}</p>
                    )}
                  </div>
                );
              case 'sources-list':
                const sources = block.data.sources || (block.data.icons || []).map((icon: string) => {
                  try {
                    const url = new URL(icon);
                    const domain = url.searchParams.get('domain') || 'Source';
                    return { name: domain.replace('.com', ''), icon, url: `https://${domain}` };
                  } catch {
                    return { name: 'Source', icon, url: '#' };
                  }
                });
                
                if (isWordDocument) {
                  return (
                    <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-gray-100">
                      <span className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider">Sources</span>
                      <ul className="list-disc pl-5">
                        {sources.map((source: any, i: number) => (
                          <li key={i} className="text-[0.75rem] text-gray-600 mb-0.5">
                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[#36c0c9] hover:underline break-all">{source.url}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-2 my-2 pt-3 border-t border-gray-100">
                    <span className="text-[0.6875rem] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      Sources
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {sources.map((source: any, i: number) => (
                          <a key={i} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                             <img src={source.icon} alt={source.name} className="w-3.5 h-3.5 object-contain" />
                             <span className="text-[0.75rem] font-medium text-gray-700">{source.name}</span>
                          </a>
                        ))}
                    </div>
                  </div>
                );
              case 'quote':
                return (
                  <blockquote className="my-2 border-l-3 border-[#36c0c9] pl-4 py-1.5 bg-slate-50/50 rounded-r-lg">
                    <p className="text-[0.875rem] font-light text-gray-900 leading-snug italic">"{block.data.quote}"</p>
                    <footer className="mt-2">
                      <strong className="text-[#0D212C] font-semibold text-[0.8125rem]">{block.data.author}</strong>
                      <span className="text-gray-500 text-[0.75rem] ml-2">— {block.data.role}</span>
                    </footer>
                  </blockquote>
                );
              case 'key-takeaways':
                if (isWordDocument) {
                  return (
                    <div className="my-2 border border-gray-300 p-4 rounded-lg">
                      <h3 className="text-[0.9375rem] font-semibold mb-3 text-black">Key Takeaways</h3>
                      <ul className="space-y-2">
                        {block.data.items.map((item: string, idx: number) => (
                          <li key={idx} className="flex gap-2.5">
                            <span className="font-bold mt-0.5">•</span>
                            <span className="text-gray-800 leading-relaxed text-[0.8125rem]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return (
                  <div className="my-2 bg-[#0D212C] text-white rounded-xl p-5 shadow-xs">
                    <h3 className="text-[0.9375rem] font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#36c0c9]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Key Takeaways
                    </h3>
                    <ul className="space-y-2.5">
                      {block.data.items.map((item: string, idx: number) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-[#36c0c9] font-bold mt-0.5">•</span>
                          <span className="text-gray-100 leading-relaxed text-[0.8125rem]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              case 'recommendation':
                if (isWordDocument) {
                  return (
                    <div className="my-2 border border-gray-300 p-4 rounded-lg">
                      <div className="text-[0.6875rem] font-bold text-gray-700 uppercase tracking-wider mb-2">Priority: {block.data.priority} | Timeline: {block.data.timeline}</div>
                      <h3 className="text-[0.9375rem] font-semibold text-[#0D212C] mb-1.5">{block.data.title}</h3>
                      <p className="text-gray-600 mb-3 text-[0.8125rem]">{block.data.description}</p>
                      <div className="border border-gray-200 p-3 rounded bg-gray-50">
                        <span className="text-[0.625rem] font-bold text-gray-500 uppercase tracking-wider block mb-1">Expected Business Impact</span>
                        <p className="text-[#0D212C] font-medium text-[0.75rem]">{block.data.impact}</p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="my-2 border border-[#36c0c9] rounded-xl p-4 bg-white relative overflow-hidden shadow-xs">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="bg-[#36c0c9] p-1.5 rounded-md text-white">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 bg-[#36c0c9]/10 text-[#36c0c9] text-[0.625rem] font-bold uppercase tracking-wider rounded-full">{block.data.priority} Priority</span>
                        <span className="text-[0.75rem] text-gray-500 font-medium ml-2">{block.data.timeline}</span>
                      </div>
                    </div>
                    <h3 className="text-[0.9375rem] font-semibold text-[#0D212C] mb-1.5">{block.data.title}</h3>
                    <p className="text-gray-600 mb-3 text-[0.8125rem]">{block.data.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <span className="text-[0.625rem] font-bold text-gray-500 uppercase tracking-wider block mb-1">Expected Business Impact</span>
                      <p className="text-[#0D212C] font-medium text-[0.75rem]">{block.data.impact}</p>
                    </div>
                  </div>
                );
              case 'highlight-box':
                if (isWordDocument) {
                  return (
                    <div className="my-2 border border-gray-300 p-4 rounded-lg">
                      <span className="text-gray-700 text-[0.6875rem] font-bold uppercase tracking-wider mb-1 block">{block.data.label}</span>
                      <h4 className="text-[0.875rem] font-semibold text-[#0D212C] mb-1">{block.data.title}</h4>
                      <p className="text-gray-700 leading-relaxed text-[0.8125rem]">{block.data.content}</p>
                    </div>
                  );
                }
                return (
                  <div className="my-2 bg-gradient-to-br from-[#f8fbfa] to-white border border-[#e2ecea] rounded-xl p-4 shadow-xs">
                    <span className="text-[#36c0c9] text-[0.625rem] font-bold uppercase tracking-wider mb-1 block">{block.data.label}</span>
                    <h4 className="text-[0.875rem] font-semibold text-[#0D212C] mb-1">{block.data.title}</h4>
                    <p className="text-gray-700 leading-relaxed text-[0.8125rem]">{block.data.content}</p>
                  </div>
                );
              case 'timeline':
                if (isWordDocument) {
                  return (
                    <div className="my-2 space-y-3">
                      {block.data.events.map((event: any, idx: number) => (
                        <div key={idx} className="border-b border-gray-200 pb-2.5 last:border-0">
                          <span className="text-[0.6875rem] font-bold text-gray-700 mb-0.5 block">Date: {event.date}</span>
                          <h4 className="text-[0.875rem] font-semibold text-[#0D212C] mb-1">{event.title}</h4>
                          <p className="text-gray-600 text-[0.8125rem]">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  );
                }
                return (
                  <div className="my-2 relative pl-6 border-l-2 border-gray-100 space-y-4">
                    {block.data.events.map((event: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] w-3.5 h-3.5 rounded-full bg-white border-3 border-[#36c0c9]" />
                        <span className="text-[0.6875rem] font-bold text-[#36c0c9] mb-0.5 block">{event.date}</span>
                        <h4 className="text-[0.875rem] font-semibold text-[#0D212C] mb-1">{event.title}</h4>
                        <p className="text-gray-600 text-[0.8125rem]">{event.description}</p>
                      </div>
                    ))}
                  </div>
                );
              default:
                console.warn(`Unsupported block type: ${block.type}`);
                return null;
            }
          })()}
        </div>
      ))}
    </div>
  );
};
