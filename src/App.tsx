/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  const [config, setConfig] = useState<IconConfig>(INITIAL_CONFIG);
  const [iconSet, setIconSet] = useState<IconSetItem[]>([{ id: 'lucide:home', name: 'home', set: 'lucide' }]);
  const [svgContents, setSvgContents] = useState<Record<string, string>>({});
  const [leftTab, setLeftTab] = useState<'library' | 'design'>('library');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const primarySvgContent = svgContents[`${config.iconSet}:${config.iconName}`] || '';
  const fullIconSet = iconSet.map(item => ({
    ...item,
    svgContent: svgContents[item.id] || ''
  }));

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">IconCraft <span className="text-slate-400 font-normal">Studio</span></h1>
            {iconSet.length > 1 && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100">
                <Layers className="h-3 w-3 text-indigo-500" />
                <span className="text-[10px] font-bold text-indigo-600 uppercase">Set: {iconSet.length}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-md border border-slate-200">
              <button 
                onClick={() => setLeftTab('library')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all ${leftTab === 'library' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <Library className="h-3 w-3" /> Library
              </button>
              <button 
                onClick={() => setLeftTab('design')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all ${leftTab === 'design' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                <Palette className="h-3 w-3" /> Design
              </button>
            </div>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-700 h-8 text-xs px-4">
              <DownloadIcon className="h-3 w-3 mr-2" /> Export Pack
            </Button>
          </div>
        </header>

        <main className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Sidebar: Library or Design */}
          <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white shrink-0 overflow-hidden">
            <div className="flex-1 overflow-hidden flex flex-col">
              {leftTab === 'library' ? (
                <IconPicker 
                  selectedIconName={`${config.iconSet}:${config.iconName}`}
                  onSelect={handleIconSelect}
                  onSetSelect={handleSetSelect}
                />
              ) : (
                <Editor config={config} onChange={setConfig} />
              )}
            </div>
          </aside>

          {/* Central Section: Preview */}
          <section className="flex-1 bg-slate-100 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5" 
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
              />
              <div className="relative group">
                <div className="absolute inset-0 bg-white opacity-20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative z-10 transition-transform duration-500 hover:scale-105">
                  <Preview config={config} svgContent={primarySvgContent} iconSet={fullIconSet} hideMockups />
                </div>
              </div>
            </div>

            {/* Bottom Tray: Mockups */}
            <div className="h-48 border-t border-slate-200 bg-white/50 backdrop-blur-sm p-4 overflow-x-auto high-density-scrollbar">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3 block">System Previews</label>
              <div className="h-full">
                <Preview config={config} svgContent={primarySvgContent} iconSet={fullIconSet} onlyMockups />
              </div>
            </div>
          </section>

          {/* Right Sidebar: Export Settings */}
          <aside className="hidden xl:flex w-80 border-l border-slate-200 bg-white flex-col shrink-0 overflow-y-auto high-density-scrollbar">
             <div className="p-0">
                <ExportPanel config={config} svgContent={primarySvgContent} iconSet={fullIconSet} />
             </div>
             
             <div className="p-4 border-t border-slate-100">
               <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3 block">Assets in Pack</label>
               <div className="flex flex-wrap gap-2">
                 {iconSet.map((item, idx) => (
                   <div key={idx} className="h-8 px-2 rounded bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                     <span className="text-[10px] font-medium text-slate-600 truncate max-w-[80px]">{item.name}</span>
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
