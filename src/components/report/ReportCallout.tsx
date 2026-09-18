import React from 'react';
import { AlertCircle, Lightbulb, Target, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReportCalloutProps {
  data: {
    calloutType: string; // 'Key Finding', 'Strategic Recommendation', 'Business Impact', 'Watch Out', 'Market Opportunity'
    title: string;
    content: string;
  };
  isWordDocument?: boolean;
}

export const ReportCallout: React.FC<ReportCalloutProps> = ({ data, isWordDocument }) => {
  if (data.calloutType === 'Sources') {
    const sources = [
      { name: 'Financial Times', icon: 'https://www.google.com/s2/favicons?domain=ft.com&sz=128', url: 'https://ft.com' },
      { name: 'Gartner Research', icon: 'https://www.google.com/s2/favicons?domain=gartner.com&sz=128', url: 'https://gartner.com' },
      { name: 'Bloomberg', icon: 'https://www.google.com/s2/favicons?domain=bloomberg.com&sz=128', url: 'https://bloomberg.com' }
    ];
    return (
      <div className="flex flex-col gap-3 mt-8 pt-5 border-t border-gray-100">
         <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wider">Sources</span>
         <div className="flex flex-wrap gap-2.5">
           {sources.map((source: any, i: number) => (
              <a key={i} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors group">
                 <img src={source.icon} alt={source.name} className="w-4 h-4 object-contain group-hover:scale-110 transition-transform" />
                 <span className="text-[13px] text-gray-700 font-medium">{source.name}</span>
              </a>
           ))}
         </div>
      </div>
    );
  }

  const getStyle = () => {
    switch (data.calloutType) {
      case 'Key Finding':
      case 'Business Impact':
        return {
          wrapper: 'bg-blue-50 border-blue-200',
          iconContainer: 'bg-blue-100 text-blue-600',
          title: 'text-blue-900',
          icon: <Lightbulb className="w-5 h-5" />
        };
      case 'Strategic Recommendation':
      case 'Market Opportunity':
        return {
          wrapper: 'bg-[#F2FBFC] border-[#bcecf0]',
          iconContainer: 'bg-[#36c0c9]/20 text-[#36c0c9]',
          title: 'text-[#0D212C]',
          icon: <Target className="w-5 h-5" />
        };
      case 'Watch Out':
      case 'Risk':
        return {
          wrapper: 'bg-orange-50 border-orange-200',
          iconContainer: 'bg-orange-100 text-orange-600',
          title: 'text-orange-900',
          icon: <AlertTriangle className="w-5 h-5" />
        };
      default:
        return {
          wrapper: 'bg-gray-50 border-gray-200',
          iconContainer: 'bg-gray-200 text-gray-600',
          title: 'text-gray-900',
          icon: <Info className="w-5 h-5" />
        };
    }
  };

  const style = getStyle();

  if (isWordDocument) {
    return (
      <div className={`my-8 rounded-2xl p-6 ${style.wrapper} border`}>
        <h4 className={`text-[1rem] font-semibold mb-1.5 ${style.title}`}>{data.title}</h4>
        <p className="leading-relaxed text-gray-800 text-[0.875rem]">{data.content}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`my-8 p-6 rounded-2xl border ${style.wrapper} flex flex-col sm:flex-row gap-4 items-start shadow-sm`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.iconContainer}`}>
        {style.icon}
      </div>
      <div>
        <div className="text-[0.6875rem] font-bold uppercase tracking-widest text-gray-500 mb-1">
          {data.calloutType}
        </div>
        <h4 className={`text-[1rem] font-semibold mb-1.5 ${style.title}`}>
          {data.title}
        </h4>
        <p className="text-gray-700 leading-relaxed text-[0.875rem]">
          {data.content}
        </p>
      </div>
    </motion.div>
  );
};
