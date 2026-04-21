import React from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';
import { Monitor, Smartphone, Globe, Folder, Search } from 'lucide-react';
import { IconConfig, IconSetItem } from '../types';
import { getGradientCss, getBackgroundPath, getSvgGradientDef } from '../lib/icon-utils';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface PreviewProps {
  config: IconConfig;
  svgContent: string;
  iconSet?: IconSetItem[];
  hideMockups?: boolean;
  onlyMockups?: boolean;
}

export function Preview({ config, svgContent, iconSet, hideMockups = false, onlyMockups = false }: PreviewProps) {
  const primaryIconFullId = `${config.iconSet}:${config.iconName}`;
  
  const IconLayer = ({ fullId = primaryIconFullId, className = "", itemSvg }: { fullId?: string; className?: string; itemSvg?: string }) => {
    const currentSvgBody = itemSvg || svgContent || '';
    const iconGradId = `icon-preview-grad-${Math.random().toString(36).substr(2, 9)}`;
    const iconGradDef = config.iconUseGradient ? getSvgGradientDef(iconGradId, config.iconGradient) : '';
    const iconColor = config.iconUseGradient ? `url(#${iconGradId})` : config.iconColor;

    return (
      <div 
        className={`flex items-center justify-center overflow-hidden relative ${className}`}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: !config.bgUseGradient ? config.bgColor : undefined,
          backgroundImage: config.bgUseGradient ? getGradientCss(config.bgGradient) : undefined,
          borderRadius: config.bgShape === 'square' ? `${config.borderRadius}px` : 
                        config.bgShape === 'squircle' ? '25%' : 
                        config.bgShape === 'circle' ? '50%' : '0',
          clipPath: config.bgShape === 'hexagon' ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                    config.bgShape === 'shield' ? 'polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%)' : undefined,
          boxShadow: config.shadowEnabled ? `${config.shadowX}px ${config.shadowY}px ${config.shadowBlur}px ${config.shadowColor}` : 'none'
        }}
      >
        <div 
          style={{
            width: `${config.iconSize}%`,
            height: `${config.iconSize}%`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `${config.bgPadding}px`,
            filter: config.shadowEnabled ? `drop-shadow(${config.shadowX}px ${config.shadowY}px 2px ${config.shadowColor})` : 'none'
          }}
        >
          {currentSvgBody ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
              dangerouslySetInnerHTML={{
                __html: `
                  <defs>${iconGradDef}</defs>
                  <g 
                    fill="${currentSvgBody.includes('fill=') ? iconColor : 'none'}" 
                    stroke="${currentSvgBody.includes('stroke=') || !currentSvgBody.includes('fill=') ? iconColor : 'none'}"
                    stroke-width="${config.strokeWidth}"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    ${currentSvgBody}
                  </g>
                `
              }}
            />
          ) : (
            <div className="animate-pulse bg-slate-200 w-full h-full rounded-md" />
          )}
        </div>
      </div>
    );
  };

  if (onlyMockups) {
    return (
      <div className="flex gap-6 items-center h-full px-2">
        {/* iOS Home */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center p-0 overflow-hidden">
             <IconLayer />
          </div>
          <span className="text-[10px] text-slate-500 font-medium">iOS Home</span>
        </div>

        {/* macOS Dock */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-16 h-16 bg-slate-100/50 rounded-xl border border-slate-200 flex items-end justify-center p-1.5 shadow-inner">
             <div className="w-10 h-10 shadow-lg">
                <IconLayer className="!rounded-lg" />
             </div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">macOS Dock</span>
        </div>

        {/* Windows Taskbar */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-20 h-14 bg-slate-900 rounded border border-slate-800 p-2 flex items-center gap-2">
            <div className="w-6 h-6 shadow-md">
              <IconLayer className="!rounded-sm" />
            </div>
            <div className="h-1 w-8 bg-slate-700 rounded-full"></div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Windows</span>
        </div>

        {/* Browser Tab */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-32 h-10 bg-slate-200/50 rounded-t-lg border border-slate-300 flex items-center px-3 gap-2 overflow-hidden">
             <div className="w-4 h-4">
                <IconLayer className="!rounded-sm" />
             </div>
             <div className="text-[8px] font-medium text-slate-600 truncate">IconCraft Studio</div>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-full">
      {iconSet && iconSet.length > 1 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {iconSet.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-32 h-32">
                <IconLayer fullId={item.id} itemSvg={item.svgContent} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[100px]">{item.name}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          layout
          className="w-48 h-48 sm:w-64 sm:h-64 z-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <IconLayer />
        </motion.div>
      )}
    </div>
  );
}
