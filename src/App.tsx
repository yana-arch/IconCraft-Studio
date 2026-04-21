/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Settings2, 
  Eye, 
  Download as DownloadIcon, 
  Menu,
  X,
  Palette,
  Github,
  Layers,
  Monitor,
  CheckCircle2,
  Library
} from 'lucide-react';
import { IconConfig, IconSetItem, PRESET_GRADIENTS } from './types';
import { IconPicker } from './components/IconPicker';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { ExportPanel } from './components/ExportPanel';
import { Button } from './components/ui/button';
import { TooltipProvider } from './components/ui/tooltip';
import { Separator } from './components/ui/separator';

const INITIAL_CONFIG: IconConfig = {
  id: 'initial',
  iconName: 'home',
  iconSet: 'lucide',
  iconSize: 60,
  iconColor: '#ffffff',
  iconGradient: PRESET_GRADIENTS[0],
  iconUseGradient: false,
  strokeWidth: 2,
  bgShape: 'circle',
  bgUseGradient: true,
  bgColor: '#3b82f6',
  bgGradient: PRESET_GRADIENTS[4],
  bgPadding: 32,
  borderRadius: 16,
  shadowEnabled: true,
  shadowColor: 'rgba(0,0,0,0.25)',
  shadowBlur: 10,
  shadowX: 0,
  shadowY: 4,
};

export default function App() {
  const [config, setConfig] = useState<IconConfig>(() => {
    const saved = localStorage.getItem('icon-craft-config');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });
  const [iconSet, setIconSet] = useState<IconSetItem[]>(() => {
    const saved = localStorage.getItem('icon-craft-set');
    return saved ? JSON.parse(saved) : [{ id: 'lucide:home', name: 'home', set: 'lucide' }];
  });
  const [svgContents, setSvgContents] = useState<Record<string, string>>({});
  const [leftTab, setLeftTab] = useState<'library' | 'design'>('library');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('icon-craft-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('icon-craft-set', JSON.stringify(iconSet));
  }, [iconSet]);

  // Fetch SVG bodies for the entire set
  useEffect(() => {
    const fetchSvgs = async () => {
      const neededIds = iconSet.map(item => item.id);
      const newContents = { ...svgContents };
      let changed = false;

      for (const fullId of neededIds) {
        if (!newContents[fullId]) {
          try {
            const [set, name] = fullId.split(':');
            const response = await fetch(`https://api.iconify.design/${set}.json?icons=${name}`);
            const data = await response.json();
            if (data.icons && data.icons[name]) {
              newContents[fullId] = data.icons[name].body;
              changed = true;
            }
          } catch (error) {
            console.error(`Failed to fetch SVG ${fullId}`, error);
          }
        }
      }

      if (changed) {
        setSvgContents(newContents);
      }
    };

    fetchSvgs();
  }, [iconSet]);

  const handleIconSelect = (name: string, set: string) => {
    const fullId = `${set}:${name}`;
    setConfig(prev => ({ ...prev, iconName: name, iconSet: set, id: fullId }));
    setIconSet([{ id: fullId, name, set }]);
  };

  const handleSetSelect = (items: IconSetItem[]) => {
    setIconSet(items);
    if (items.length > 0) {
      const first = items[0];
      setConfig(prev => ({ ...prev, iconName: first.name, iconSet: first.set, id: first.id }));
    }
    setLeftTab('design');
  };

  const removeItem = (id: string) => {
    setIconSet(prev => {
      const filtered = prev.filter(item => item.id !== id);
      if (filtered.length === 0) return prev; // Keep at least one
      return filtered;
    });
  };

  const clearSet = () => {
    const first = iconSet[0];
    setIconSet([first]);
    setConfig(prev => ({ ...prev, id: first.id, iconName: first.name, iconSet: first.set }));
  };

  const primarySvgContent = svgContents[`${config.iconSet}:${config.iconName}`] || '';
  const fullIconSet = iconSet.map(item => ({
    ...item,
    svgContent: svgContents[item.id] || ''
  }));

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100"
            >
              <Palette className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold tracking-tight font-display">IconCraft <span className="text-slate-400 font-normal">Studio v2</span></h1>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Local Session Sync</span>
              </div>
            </div>
            {iconSet.length > 1 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100/50">
                <Layers className="h-3 w-3 text-indigo-500" />
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Set: {iconSet.length}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-lg border border-slate-200/60">
              <button 
                onClick={() => setLeftTab('library')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[11px] font-bold tracking-tight transition-all duration-200 ${leftTab === 'library' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Library className="h-3.5 w-3.5" /> Thư viện
              </button>
              <button 
                onClick={() => setLeftTab('design')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[11px] font-bold tracking-tight transition-all duration-200 ${leftTab === 'design' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Palette className="h-3.5 w-3.5" /> Thiết kế
              </button>
            </div>
            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
            <Button className="bg-slate-900 text-white hover:bg-slate-800 h-9 text-xs px-5 rounded-lg shadow-md transition-all active:scale-95">
              <DownloadIcon className="h-3.5 w-3.5 mr-2" /> Export Pack
            </Button>
          </div>
        </header>

        <main className="flex flex-1 min-h-0 overflow-hidden relative">
          {/* Left Sidebar: Library or Design */}
          <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white shrink-0 overflow-hidden">
            <div className="flex-1 overflow-hidden flex flex-col">
              {leftTab === 'library' ? (
                <IconPicker 
                  selectedIconName={`${config.iconSet}:${config.iconName}`}
                  onSelect={handleIconSelect}
                  onSetSelect={handleSetSelect}
                  currentSet={iconSet}
                />
              ) : (
                <Editor config={config} onChange={setConfig} />
              )}
            </div>
          </aside>

          {/* Central Section: Preview */}
          <section className="flex-1 studio-grid flex flex-col min-w-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] pointer-events-none" />
            
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-auto high-density-scrollbar">
              <div className="relative group">
                <div className="absolute inset-x-0 -bottom-12 flex justify-center">
                   <div className="bg-white/80 backdrop-blur border border-slate-200/50 px-3 py-1 rounded-full shadow-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Draft Viewport</span>
                      <Separator orientation="vertical" className="h-2" />
                      <span className="text-[10px] font-mono text-indigo-600">512×512</span>
                   </div>
                </div>
                <div className="relative z-10 transition-transform duration-500 hover:scale-[1.02]">
                  <Preview config={config} svgContent={primarySvgContent} iconSet={fullIconSet} hideMockups />
                </div>
              </div>
            </div>

            {/* Bottom Tray: Mockups */}
            <div className="h-44 border-t border-slate-200/60 bg-white/70 backdrop-blur-md p-4 overflow-hidden flex flex-col shrink-0">
              <div className="flex items-center justify-between mb-3 px-2">
                <label className="text-[9px] uppercase font-bold text-slate-400 tracking-widest block">System Context Previews</label>
                <div className="flex items-center gap-1">
                   <div className="h-1 w-8 bg-indigo-500 rounded-full" />
                   <div className="h-1 w-2 bg-slate-200 rounded-full" />
                   <div className="h-1 w-2 bg-slate-200 rounded-full" />
                </div>
              </div>
              <div className="flex-1 overflow-x-auto high-density-scrollbar pb-2 px-2">
                <Preview config={config} svgContent={primarySvgContent} iconSet={fullIconSet} onlyMockups />
              </div>
            </div>
          </section>

          {/* Right Sidebar: Export Settings */}
          <aside className="hidden xl:flex w-80 border-l border-slate-200 bg-white flex-col shrink-0 overflow-y-auto high-density-scrollbar">
             <div className="p-0">
                <ExportPanel config={config} svgContent={primarySvgContent} iconSet={fullIconSet} />
             </div>
             
             <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
               <div className="flex items-center justify-between">
                 <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Assets in Pack</label>
                 {iconSet.length > 1 && (
                   <button 
                     onClick={clearSet}
                     className="text-[9px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-tighter"
                   >
                     Clear Set
                   </button>
                 )}
               </div>
               <div className="flex flex-wrap gap-2">
                 {iconSet.map((item, idx) => (
                   <div key={idx} className="group h-8 pl-2 pr-1 rounded bg-slate-50 border border-slate-200 flex items-center gap-1.5 transition-all hover:border-slate-300">
                     <span className="text-[10px] font-medium text-slate-600 truncate max-w-[80px]">{item.name}</span>
                     {iconSet.length > 1 && (
                       <button 
                         onClick={() => removeItem(item.id)}
                         className="p-1 text-slate-300 hover:text-red-500 rounded-sm hover:bg-red-50 transition-colors"
                       >
                         <X className="h-2.5 w-2.5" />
                       </button>
                     )}
                   </div>
                 ))}
               </div>
             </div>

             <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
               <div className="flex flex-col gap-2">
                 <div className="flex justify-between text-[11px]">
                   <span className="text-slate-500">Icons in set:</span>
                   <span className="font-bold">{iconSet.length}</span>
                 </div>
                 <div className="flex justify-between text-[11px]">
                   <span className="text-slate-500">Packaging:</span>
                   <span className="font-bold text-indigo-600">Sync Styles</span>
                 </div>
               </div>
             </div>
          </aside>
        </main>
      </div>

      {/* Mobile Footer Nav (Simplified for Density) */}
      <nav className="lg:hidden fixed bottom-14 left-0 right-0 h-14 bg-white border-t flex items-center justify-around px-4 z-40">
        <button onClick={() => setLeftTab('library')} className={`p-2 transition-colors ${leftTab === 'library' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Library className="h-5 w-5" />
        </button>
        <button onClick={() => setLeftTab('design')} className={`p-2 transition-colors ${leftTab === 'design' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Palette className="h-5 w-5" />
        </button>
        <button className="p-2 text-slate-400">
          <Eye className="h-5 w-5" />
        </button>
        <button className="p-2 text-slate-400">
          <DownloadIcon className="h-5 w-5" />
        </button>
      </nav>
    </TooltipProvider>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-3xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
