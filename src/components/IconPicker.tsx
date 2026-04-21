import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Search, Loader2, ListPlus, ChevronRight, Check, X, Sparkles } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { IconSetItem } from '../types';
import { suggestIcons } from '../services/aiService';

interface IconPickerProps {
  onSelect: (iconName: string, iconSet: string) => void;
  onSetSelect: (items: IconSetItem[]) => void;
  selectedIconName: string;
  currentSet: IconSetItem[];
}

const ICON_SETS = [
  { id: 'lucide', name: 'Lucide' },
  { id: 'ph', name: 'Phosphor' },
  { id: 'tabler', name: 'Tabler' },
  { id: 'mdi', name: 'Material' },
  { id: 'bi', name: 'Bootstrap' },
  { id: 'ri', name: 'Remix' },
];

export function IconPicker({ onSelect, onSetSelect, selectedIconName, currentSet }: IconPickerProps) {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<{ name: string; set: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSet, setActiveSet] = useState('lucide');

  // Batch states
  const [batchInput, setBatchInput] = useState('');
  const [batchKeywords, setBatchKeywords] = useState<string[]>([]);
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(-1);
  const [batchItems, setBatchItems] = useState<IconSetItem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchIcons = async () => {
      const queryTerm = mode === 'batch' && currentKeywordIndex >= 0 
        ? batchKeywords[currentKeywordIndex] 
        : search;

      if (!queryTerm && !activeSet) return;
      
      setLoading(true);
      try {
        const query = queryTerm ? `${queryTerm}` : 'home';
        const response = await fetch(`https://api.iconify.design/search?query=${query}&prefixes=${activeSet}&limit=60`);
        const data = await response.json();
        
        if (data.icons) {
          const formatted = data.icons.map((fullId: string) => {
             const parts = fullId.split(':');
             return { set: parts[0], name: parts[1] };
          });
          setResults(formatted);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Failed to fetch icons', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchIcons, 400);
    return () => clearTimeout(timer);
  }, [search, activeSet, mode, currentKeywordIndex, batchKeywords]);

  const startBatch = () => {
    const words = batchInput.split(/[,\s]+/).filter(w => w.trim().length > 0);
    if (words.length === 0) return;
    setBatchKeywords(words);
    setCurrentKeywordIndex(0);
    setBatchItems([]);
    setSearch('');
  };

  const handleAiSuggest = async () => {
    if (!batchInput || aiLoading) return;
    setAiLoading(true);
    try {
      const suggestions = await suggestIcons(batchInput);
      if (suggestions.length > 0) {
        setBatchInput(suggestions.join(', '));
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleIconClick = (name: string, set: string) => {
    if (mode === 'batch') {
      const newItem: IconSetItem = { id: `${set}:${name}`, name, set };
      const newBatch = [...batchItems, newItem];
      setBatchItems(newBatch);
      
      if (currentKeywordIndex < batchKeywords.length - 1) {
        setCurrentKeywordIndex(prev => prev + 1);
      } else {
        // Finished batch
        onSetSelect(newBatch);
        setMode('single');
        setCurrentKeywordIndex(-1);
      }
    } else {
      onSelect(name, set);
    }
  };

  const resetBatch = () => {
    setMode('single');
    setCurrentKeywordIndex(-1);
    setBatchItems([]);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 space-y-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            {mode === 'batch' ? `Batch Creation (${currentKeywordIndex + 1}/${batchKeywords.length})` : 'Search Libraries'}
          </label>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-[9px] uppercase font-bold"
            onClick={() => mode === 'single' ? setMode('batch') : resetBatch()}
          >
            {mode === 'single' ? (
              <><ListPlus className="h-3 w-3 mr-1" /> Create Set</>
            ) : (
              <><X className="h-3 w-3 mr-1" /> Cancel</>
            )}
          </Button>
        </div>

        {mode === 'batch' && currentKeywordIndex === -1 ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-500 leading-tight">
                Enter theme or list of icons
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-5 text-indigo-600 hover:text-indigo-700 p-0 px-1 text-[9px] font-bold gap-1 ${!batchInput ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleAiSuggest}
                disabled={!batchInput || aiLoading}
              >
                {aiLoading ? <Loader2 className="h-2 w-2 animate-spin" /> : <Sparkles className="h-2.5 w-2.5" />}
                Magic Suggest
              </Button>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  placeholder="e.g. food, travels, social..." 
                  className="h-8 text-xs bg-slate-50"
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startBatch()}
                />
              </div>
              <Button size="sm" className="h-8 bg-indigo-600 text-white hover:bg-indigo-700" onClick={startBatch}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {mode === 'batch' && (
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {batchKeywords.map((kw, idx) => (
                  <div key={idx} className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition-colors ${
                    idx === currentKeywordIndex ? 'bg-indigo-100 text-indigo-700' : 
                    idx < currentKeywordIndex ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {idx < currentKeywordIndex && <Check className="h-2 w-2 inline mr-1" />}
                    {kw}
                  </div>
                ))}
              </div>
            )}
            
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              <Input 
                placeholder={mode === 'batch' ? `Pick icon for "${batchKeywords[currentKeywordIndex]}"...` : "Search icons..."}
                className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Tabs value={activeSet} onValueChange={setActiveSet}>
              <TabsList className="w-full justify-start overflow-x-auto h-8 p-0.5 bg-slate-100 border border-slate-200">
                {ICON_SETS.map((set) => (
                  <TabsTrigger key={set.id} value={set.id} className="text-[10px] h-7 px-2">
                    {set.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 p-2 high-density-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          </div>
        ) : currentKeywordIndex === -1 && mode === 'batch' ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4 space-y-2">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
              <ListPlus className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-slate-600 uppercase tracking-tighter">Ready to create a set?</p>
            <p className="text-[10px] text-slate-400">Input keywords above to start selecting your icons sequentially.</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {results.map((icon) => {
              const fullId = `${icon.set}:${icon.name}`;
              const isSelected = fullId === selectedIconName;
              return (
                  <button
                    key={fullId}
                    className={`h-11 w-11 p-0 flex items-center justify-center rounded-xl border transition-all relative group shadow-sm active:scale-95 ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-600 ring-2 ring-indigo-500/20' 
                        : 'bg-white border-slate-200/60 hover:border-slate-300 hover:shadow-md text-slate-600'
                    }`}
                    onClick={() => handleIconClick(icon.name, icon.set)}
                  >
                    <Icon icon={fullId} className="h-6 w-6" />
                    {mode === 'single' && !isSelected && (
                      <div 
                        className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 bg-indigo-600 text-white rounded-lg p-1.5 shadow-lg ring-4 ring-white z-20"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetSelect([...currentSet, { id: fullId, name: icon.name, set: icon.set }]);
                        }}
                      >
                        <ListPlus className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </button>
              );
            })}
            {results.length === 0 && !loading && search && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No icons found for "{search}".
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
