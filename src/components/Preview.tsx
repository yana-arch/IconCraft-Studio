import React from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Smartphone, Globe, Folder, Search } from 'lucide-react';
import { IconConfig, IconSetItem } from '../types';
import { getGradientCss, getBackgroundPath, getSvgGradientDef } from '../lib/icon-utils';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface PreviewProps {
  config: IconConfig;
  svgContent: string;
  iconSet?: (IconSetItem & { svgContent?: string })[];
  hideMockups?: boolean;
  onlyMockups?: boolean;
  onSelect?: (id: string, name: string, set: string) => void;
}

export function Preview({ config, svgContent, iconSet, hideMockups = false, onlyMockups = false, onSelect }: PreviewProps) {
  const primaryIconFullId = `${config.iconSet}:${config.iconName}`;
  
  // Logic to identify main and floating icons
  const activeIconId = config.id;
  const mainIcon = iconSet?.find(i => i.id === activeIconId) || { id: activeIconId, name: config.iconName, set: config.iconSet, svgContent };
  const otherIcons = iconSet 
    ? [...iconSet].filter(i => i.id !== activeIconId).sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const IconLayer = ({ fullId = primaryIconFullId, className = "", itemSvg, size = "100%" }: { fullId?: string; className?: string; itemSvg?: string; size?: string | number }) => {
    const currentSvgBody = itemSvg || svgContent || '';
    const iconGradId = `icon-preview-grad-${Math.random().toString(36).substr(2, 9)}`;
    const iconGradDef = config.iconUseGradient ? getSvgGradientDef(iconGradId, config.iconGradient) : '';
    const iconColor = config.iconUseGradient ? `url(#${iconGradId})` : config.iconColor;

    const sizeValue = typeof size === 'number' ? `${size}px` : size;

    return (
      <div 
        className={`flex items-center justify-center overflow-hidden relative ${className}`}
        style={{
          width: sizeValue,
          height: sizeValue,
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

  const midPoint = Math.ceil(otherIcons.length / 2);
  const leftIcons = otherIcons.slice(0, midPoint);
  const rightIcons = otherIcons.slice(midPoint);

  return (
    <div className="flex flex-col md:flex-row w-full h-full min-h-[450px] items-center justify-center p-4 gap-8">
      {/* Left Wing */}
      {iconSet && iconSet.length > 1 && (
        <div className="hidden lg:flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
          {leftIcons.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect?.(item.id, item.name, item.set)}
              className="group relative transition-all duration-200 opacity-60 hover:opacity-100 hover:scale-105"
            >
              <IconLayer size={56} fullId={item.id} itemSvg={item.svgContent} className="rounded-lg shadow-sm border border-slate-100" />
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none uppercase font-bold">
                {item.name}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Focus Stage */}
      <div className="flex-1 flex flex-col items-center justify-center relative min-w-[280px]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeIconId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-56 h-56 sm:w-72 sm:h-72"
          >
            <IconLayer className="shadow-2xl" />
            <p className="text-center mt-6 text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-[0.2em] inline-block left-1/2 relative -translate-x-1/2 border border-slate-200">
              {config.iconName}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Mobile/Small Screen List */}
        {iconSet && iconSet.length > 1 && (
          <div className="flex lg:hidden flex-wrap justify-center gap-3 mt-12 pt-6 border-t border-slate-100 w-full">
            {otherIcons.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect?.(item.id, item.name, item.set)}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <IconLayer size={44} fullId={item.id} itemSvg={item.svgContent} className="rounded shadow-sm" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Wing */}
      {iconSet && iconSet.length > 1 && (
        <div className="hidden lg:flex flex-col gap-4 max-h-[400px] overflow-y-auto pl-2 no-scrollbar">
          {rightIcons.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect?.(item.id, item.name, item.set)}
              className="group relative transition-all duration-200 opacity-60 hover:opacity-100 hover:scale-105"
            >
              <IconLayer size={56} fullId={item.id} itemSvg={item.svgContent} className="rounded-lg shadow-sm border border-slate-100" />
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none uppercase font-bold">
                {item.name}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
