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
    <div className="flex flex-col lg:flex-row w-full h-full min-h-[500px] items-center justify-center p-4 xl:p-8 gap-8 xl:gap-16">
      {/* Left Wing */}
      {iconSet && iconSet.length > 1 && (
        <div className="hidden lg:flex flex-col gap-6 max-h-[450px] overflow-y-auto pr-4 no-scrollbar">
          {leftIcons.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.5, x: 0 }}
              whileHover={{ 
                opacity: 1, 
                scale: 1.1, 
                x: 5,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              onClick={() => onSelect?.(item.id, item.name, item.set)}
              className="group relative transition-all duration-300"
            >
              <div className="relative">
                <IconLayer size={64} fullId={item.id} itemSvg={item.svgContent} className="rounded-2xl shadow-sm border border-slate-200/50 glass-panel" />
                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 rounded-2xl transition-colors" />
              </div>
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900/90 backdrop-blur text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50 pointer-events-none uppercase font-black tracking-wider shadow-xl border border-white/10">
                {item.name}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Main Focus Stage */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeIconId}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative"
          >
            {/* Dynamic Glow Background */}
            <div 
              className="absolute inset-0 blur-[100px] opacity-20 pointer-events-none transition-all duration-700" 
              style={{ backgroundColor: config.bgUseGradient ? config.bgGradient.colors[0] : config.bgColor }}
            />
            
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 xl:w-96 xl:h-96">
              <IconLayer className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-8 ring-white/10" />
            </div>
            
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-center mt-10"
            >
              <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-5 py-2 rounded-full uppercase tracking-[0.3em] inline-block border border-indigo-100/50 shadow-sm">
                {config.iconName}
              </span>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile/Small Screen List */}
        {iconSet && iconSet.length > 1 && (
          <div className="flex lg:hidden flex-wrap justify-center gap-4 mt-16 pt-8 border-t border-slate-200/50 w-full px-4">
            {otherIcons.map((item) => (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSelect?.(item.id, item.name, item.set)}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <IconLayer size={52} fullId={item.id} itemSvg={item.svgContent} className="rounded-xl shadow-sm border border-slate-100" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Right Wing */}
      {iconSet && iconSet.length > 1 && (
        <div className="hidden lg:flex flex-col gap-6 max-h-[450px] overflow-y-auto pl-4 no-scrollbar">
          {rightIcons.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 0.5, x: 0 }}
              whileHover={{ 
                opacity: 1, 
                scale: 1.1, 
                x: -5,
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              onClick={() => onSelect?.(item.id, item.name, item.set)}
              className="group relative transition-all duration-300"
            >
              <div className="relative">
                <IconLayer size={64} fullId={item.id} itemSvg={item.svgContent} className="rounded-2xl shadow-sm border border-slate-200/50 glass-panel" />
                <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 rounded-2xl transition-colors" />
              </div>
              <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900/90 backdrop-blur text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50 pointer-events-none uppercase font-black tracking-wider shadow-xl border border-white/10">
                {item.name}
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
