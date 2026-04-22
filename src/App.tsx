/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Library,
  Code2,
  Copy,
  Terminal
} from 'lucide-react';
import { IconConfig, IconSetItem, PRESET_GRADIENTS } from './types';
import { IconPicker } from './components/IconPicker';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { ExportPanel } from './components/ExportPanel';
import { Button } from './components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip';
import { Separator } from './components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ScrollArea } from './components/ui/scroll-area';

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
  const [stageTheme, setStageTheme] = useState<'light' | 'dark' | 'grid' | 'mesh'>('grid');
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

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

  const applyPresetStyle = (style: 'flat' | 'glossy' | 'outline' | 'neon') => {
    switch (style) {
      case 'flat':
        setConfig(prev => ({ 
          ...prev, 
          bgUseGradient: false, 
          bgColor: '#3b82f6', 
          iconUseGradient: false, 
          iconColor: '#ffffff',
          shadowEnabled: false
        }));
        break;
      case 'glossy':
        setConfig(prev => ({ 
          ...prev, 
          bgUseGradient: true, 
          bgGradient: PRESET_GRADIENTS[4],
          iconUseGradient: true,
          iconGradient: PRESET_GRADIENTS[3],
          shadowEnabled: true,
          shadowBlur: 15,
          shadowY: 6
        }));
        break;
      case 'outline':
        setConfig(prev => ({ 
          ...prev, 
          bgUseGradient: false, 
          bgColor: '#ffffff',
          iconUseGradient: false,
          iconColor: '#334155',
          strokeWidth: 2,
          shadowEnabled: false
        }));
        break;
      case 'neon':
        setConfig(prev => ({ 
          ...prev, 
          bgUseGradient: false, 
          bgColor: '#0f172a',
          iconUseGradient: true,
          iconGradient: PRESET_GRADIENTS[0],
          shadowEnabled: true,
          shadowColor: 'rgba(240, 147, 251, 0.5)',
          shadowBlur: 20
        }));
        break;
    }
  };

  const primarySvgContent = svgContents[`${config.iconSet}:${config.iconName}`] || '';
  const fullIconSet = iconSet.map(item => ({
    ...item,
    svgContent: svgContents[item.id] || ''
  }));

  const getFullSvgSource = () => {
    const svgEl = document.querySelector('.icon-preview-main svg');
    return svgEl ? svgEl.outerHTML : '';
  };

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
            <div className="hidden md:flex items-center bg-slate-100/80 p-1 rounded-lg border border-slate-200/60 max-w-[200px]">
              {(['flat', 'glossy', 'outline', 'neon'] as const).map(s => (
                <div key={s} className="flex-1">
                  <Tooltip>
                    <TooltipTrigger
                      onClick={() => applyPresetStyle(s)}
                      className="w-full px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all duration-200 hover:bg-white hover:shadow-sm hover:text-indigo-600 text-slate-500"
                    >
                      {s[0]}
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[10px] font-bold">Style: {s.toUpperCase()}</TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
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
            <button 
              onClick={() => setIsInspectorOpen(true)}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
            >
              <Code2 className="h-4 w-4" />
            </button>
            <Button 
              className="bg-indigo-600 text-white hover:bg-indigo-700 h-9 text-xs px-5 rounded-lg shadow-md transition-all active:scale-95"
              onClick={() => {
                const ep = document.querySelector('.export-panel-btn');
                (ep as HTMLElement)?.click();
              }}
            >
              <DownloadIcon className="h-3.5 w-3.5 mr-2" /> Export Pack
            </Button>
          </div>
        </header>

        <main className="flex flex-1 min-h-0 overflow-hidden relative">
          {/* Left Sidebar: Library or Design */}
          <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white shadow-sm shrink-0 overflow-hidden z-10">
            <div className="flex-1 overflow-hidden flex flex-col relative">
              <AnimatePresence mode="wait">
                {leftTab === 'library' ? (
                  <motion.div 
                    key="library"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 overflow-hidden flex flex-col"
                  >
                    <IconPicker 
                      selectedIconName={`${config.iconSet}:${config.iconName}`}
                      onSelect={handleIconSelect}
                      onSetSelect={handleSetSelect}
                      currentSet={iconSet}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="design"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 overflow-hidden flex flex-col"
                  >
                    <Editor config={config} onChange={setConfig} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </aside>

          {/* Central Section: Preview */}
          <section className={`flex-1 flex flex-col min-w-0 overflow-hidden relative transition-colors duration-700 ${
            stageTheme === 'dark' ? 'bg-slate-900' : 
            stageTheme === 'light' ? 'bg-white' : 
            stageTheme === 'mesh' ? 'mesh-gradient' : 'bg-slate-50'
          }`}>
            {stageTheme === 'grid' && <div className="absolute inset-0 studio-grid pointer-events-none opacity-40" />}
            
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center bg-white/70 glass-card p-1 rounded-full shadow-lg">
              {(['light', 'dark', 'grid', 'mesh'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setStageTheme(t)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                    stageTheme === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-auto high-density-scrollbar">
              <div className="relative group">
                <div className="absolute inset-x-0 -bottom-20 flex flex-col items-center gap-3">
                   <div className="glass-card px-4 py-1.5 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Viewport</span>
                      <Separator orientation="vertical" className="h-2.5 mx-1" />
                      <span className="text-[10px] font-mono font-bold text-indigo-600">512×512</span>
                   </div>
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all delay-100 translate-y-2 group-hover:translate-y-0">
                     <Button 
                       variant="secondary" 
                       size="sm" 
                       className="h-8 rounded-full bg-white shadow-sm border-slate-200 text-[10px] uppercase font-black tracking-widest px-6"
                       onClick={() => {
                         const svg = getFullSvgSource();
                         if (svg) {
                           navigator.clipboard.writeText(svg);
                         }
                       }}
                     >
                       <Copy className="h-3 w-3 mr-2" /> Copy Raw SVG
                     </Button>
                   </div>
                </div>
                <div className="relative z-10 transition-transform duration-500 hover:scale-[1.01] icon-preview-main">
                  <Preview 
                    config={config} 
                    svgContent={primarySvgContent} 
                    iconSet={fullIconSet} 
                    hideMockups 
                    onSelect={(id, name, set) => setConfig(prev => ({ ...prev, id, iconName: name, iconSet: set }))}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Tray: Mockups */}
            <div className="h-48 border-t border-slate-200/60 bg-white/70 glass-card p-5 overflow-hidden flex flex-col shrink-0 z-10 rounded-t-3xl">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <Monitor className="h-3.5 w-3.5 text-indigo-600" />
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] block">System Contexts</label>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className="h-1 w-10 bg-indigo-600 rounded-full" />
                   <div className="h-1 w-2 bg-slate-200 rounded-full" />
                   <div className="h-1 w-2 bg-slate-200 rounded-full" />
                </div>
              </div>
              <div className="flex-1 overflow-x-auto high-density-scrollbar pb-2 px-2 scroll-smooth">
                <Preview config={config} svgContent={primarySvgContent} iconSet={fullIconSet} onlyMockups />
              </div>
            </div>
          </section>

          {/* Right Sidebar: Export Settings */}
          <aside className="hidden xl:flex w-80 border-l border-slate-200 bg-white flex-col shrink-0 overflow-y-auto high-density-scrollbar shadow-sm z-10">
             <div className="p-0">
                <ExportPanel config={config} svgContent={primarySvgContent} iconSet={fullIconSet} />
             </div>
             
             <div className="p-5 border-t border-slate-100 flex flex-col gap-5">
               <div className="flex items-center justify-between">
                 <div className="flex flex-col gap-0.5">
                   <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Production Queue</label>
                   <span className="text-[9px] text-slate-400 font-medium">Batch processing ready</span>
                 </div>
                 {iconSet.length > 1 && (
                   <button 
                     onClick={clearSet}
                     className="text-[9px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors uppercase tracking-tighter"
                   >
                     Reset Bundle
                   </button>
                 )}
               </div>
               <div className="flex flex-wrap gap-2.5 max-h-64 overflow-y-auto high-density-scrollbar pb-2">
                 {iconSet.map((item, idx) => (
                   <motion.div 
                     key={idx} 
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className={`group h-12 pl-3 pr-2 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                       config.id === item.id 
                       ? 'bg-indigo-50 border-indigo-200 shadow-md ring-2 ring-indigo-200/50' 
                       : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                     }`}
                     onClick={() => setConfig(prev => ({ ...prev, iconName: item.name, iconSet: item.set, id: item.id }))}
                   >
                     <div className="w-8 h-8 bg-white rounded-lg border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {svgContents[item.id] ? (
                          <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-600" dangerouslySetInnerHTML={{ __html: svgContents[item.id] }} />
                        ) : (
                          <Layers className="w-4 h-4 text-slate-400" />
                        )}
                     </div>
                     <span className={`text-[11px] font-bold truncate max-w-[80px] ${config.id === item.id ? 'text-indigo-700' : 'text-slate-600'}`}>
                       {item.name}
                     </span>
                     {iconSet.length > 1 && (
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           removeItem(item.id);
                         }}
                         className="p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 rounded-xl hover:bg-white shadow-sm transition-all"
                       >
                         <X className="h-3 w-3" />
                       </button>
                     )}
                   </motion.div>
                 ))}
               </div>
             </div>

             <div className="mt-auto p-5 border-t border-slate-100 bg-slate-50/50">
               <div className="flex flex-col gap-3">
                 <div className="flex justify-between items-center text-[11px]">
                   <span className="text-slate-400 uppercase font-black tracking-widest text-[9px]">Inventory Size</span>
                   <span className="font-bold text-slate-900 bg-white border px-2 py-0.5 rounded-md">{iconSet.length} Assets</span>
                 </div>
                 <div className="flex justify-between items-center text-[11px]">
                   <span className="text-slate-400 uppercase font-black tracking-widest text-[9px]">Styles</span>
                   <span className="font-black text-indigo-600">Synchronized</span>
                 </div>
               </div>
             </div>
          </aside>
        </main>

        {/* Code Inspector Dialog */}
        <Dialog open={isInspectorOpen} onOpenChange={setIsInspectorOpen}>
           <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden rounded-3xl border-none">
              <DialogHeader className="p-6 pb-2 shrink-0">
                 <DialogTitle className="flex items-center gap-2 text-lg font-black uppercase tracking-widest">
                    <Terminal className="h-5 w-5 text-indigo-600" />
                    Asset Source Inspector
                 </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden p-6 pt-0">
                 <Tabs defaultValue="svg" className="h-full flex flex-col">
                    <TabsList className="w-full justify-start bg-slate-100 p-1 rounded-xl gap-1 mb-4 h-12">
                       <TabsTrigger value="svg" className="flex-1 h-10 rounded-lg text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">SVG Source</TabsTrigger>
                       <TabsTrigger value="react" className="flex-1 h-10 rounded-lg text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">React Component</TabsTrigger>
                       <TabsTrigger value="tailwind" className="flex-1 h-10 rounded-lg text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Tailwind Snippet</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex-1 overflow-hidden bg-slate-900 rounded-2xl relative shadow-2xl">
                       <TabsContent value="svg" className="h-full m-0">
                          <ScrollArea className="h-full p-6">
                             <pre className="text-[11px] font-mono text-indigo-300 leading-relaxed break-all whitespace-pre-wrap">
                                {getFullSvgSource()}
                             </pre>
                          </ScrollArea>
                       </TabsContent>
                       <TabsContent value="react" className="h-full m-0">
                          <ScrollArea className="h-full p-6">
                             <pre className="text-[11px] font-mono text-indigo-300 leading-relaxed break-all whitespace-pre-wrap">
{`import React from 'react';

export function CustomIcon(props) {
  return (
    ${getFullSvgSource()
      .replace(/class=/g, 'className=')
      .replace(/fill-opacity=/g, 'fillOpacity=')
      .replace(/stroke-width=/g, 'strokeWidth=')
      .replace(/stroke-linecap=/g, 'strokeLinecap=')
      .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
      .replace(/<svg/, '<svg {...props}')}
  );
}`}
                             </pre>
                          </ScrollArea>
                       </TabsContent>
                       <TabsContent value="tailwind" className="h-full m-0">
                          <ScrollArea className="h-full p-6">
                             <pre className="text-[11px] font-mono text-indigo-300 leading-relaxed break-all whitespace-pre-wrap">
{`<div className="w-64 h-64 flex items-center justify-center p-4">
  ${getFullSvgSource()}
</div>`}
                             </pre>
                          </ScrollArea>
                       </TabsContent>
                       
                       <Button 
                          className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl shadow-xl"
                          onClick={() => {
                             const active = document.querySelector('[data-state="active"].flex-1');
                             const tab = active?.getAttribute('value');
                             let text = getFullSvgSource();
                             if (tab === 'react') text = `import React from 'react';\n\nexport function CustomIcon(props) {\n  return (\n    ${text.replace(/class=/g, 'className=')}\n  );\n}`;
                             if (tab === 'tailwind') text = `<div className="w-64 h-64 flex items-center justify-center p-4">\n  ${text}\n</div>`;
                             navigator.clipboard.writeText(text);
                          }}
                       >
                          <Copy className="h-3.5 w-3.5 mr-2" /> Copy to Clipboard
                       </Button>
                    </div>
                 </Tabs>
              </div>
           </DialogContent>
        </Dialog>

        {/* Hidden Trigger for Export */}
        <div 
          className="export-panel-btn hidden" 
          onClick={() => {
            const btn = document.querySelector('button[class*="bg-indigo-600"][class*="w-full"]');
            (btn as HTMLButtonElement)?.click();
          }} 
        />
      </div>

      {/* Mobile Footer Nav (Simplified for Density) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-t flex items-center justify-around px-4 z-40 shadow-2xl">
        <button onClick={() => setLeftTab('library')} className={`p-3 transition-all ${leftTab === 'library' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <Library className="h-6 w-6" />
        </button>
        <button onClick={() => setLeftTab('design')} className={`p-3 transition-all ${leftTab === 'design' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <Palette className="h-6 w-6" />
        </button>
        <button onClick={() => setIsInspectorOpen(true)} className="p-3 text-slate-400">
          <Code2 className="h-6 w-6" />
        </button>
        <button 
          onClick={() => {
            const btn = document.querySelector('button[class*="bg-indigo-600"][class*="w-full"]');
            (btn as HTMLButtonElement)?.click();
          }} 
          className="p-3 text-indigo-600"
        >
          <DownloadIcon className="h-6 w-6" />
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
