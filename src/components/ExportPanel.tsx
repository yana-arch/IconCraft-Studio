import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Download as DownloadIcon, 
  Loader2, 
  Check, 
  Globe, 
  Monitor, 
  Box, 
  Smartphone, 
  ChevronRight, 
  ShieldAlert 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IconConfig } from '../types';
import { renderIconToDataUrl } from '../lib/icon-utils';
import { Button } from './ui/button';
import { IconSetItem } from '../types';

interface ExportPanelProps {
  config: IconConfig;
  svgContent: string;
  iconSet?: (IconSetItem & { svgContent: string })[];
}

const EXPORT_PRESETS = [
  { id: 'web', name: 'Web Suite', icon: Globe, detail: 'favicon, apple-touch, manifest', sizes: [16, 32, 180, 192, 512], color: 'text-blue-500' },
  { id: 'windows', name: 'Windows ICO', icon: Monitor, detail: '16, 32, 48, 256px', sizes: [16, 32, 48, 256], color: 'text-sky-500' },
  { id: 'mobile', name: 'Mobile Assets', icon: Smartphone, detail: 'iOS & Android adaptive', sizes: [144, 180, 192, 512], color: 'text-indigo-500' },
  { id: 'linux', name: 'Linux Hicolor', icon: Box, detail: 'hicolor standard icons', sizes: [24, 48, 96, 128, 256], color: 'text-orange-500' },
];

export function ExportPanel({ config, svgContent, iconSet }: ExportPanelProps) {
  const [exporting, setExporting] = useState(false);
  const [selectedPresets, setSelectedPresets] = useState<string[]>(['web']);

  const togglePreset = (id: string) => {
    setSelectedPresets((curr) => 
      curr.includes(id) ? curr.filter(p => p !== id) : [...curr, id]
    );
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    
    try {
      const zip = new JSZip();
      const currentSet = iconSet && iconSet.length > 0 ? iconSet : [{ id: config.id, name: config.iconName, set: config.iconSet, svgContent }];
      
      const allSizes = new Set<number>();
      selectedPresets.forEach(id => {
        const preset = EXPORT_PRESETS.find(p => p.id === id);
        preset?.sizes.forEach(s => allSizes.add(s));
      });
      allSizes.add(512);

      // Process each icon in the set
      for (const item of currentSet) {
        const iconFolder = currentSet.length > 1 ? zip.folder(item.name) : zip;
        if (!iconFolder) continue;

        const pngPromises = Array.from(allSizes).map(async (size) => {
          const dataUrl = await renderIconToDataUrl(config, item.svgContent, size);
          return { size, dataUrl };
        });

        const pngResults = await Promise.all(pngPromises);
        
        pngResults.forEach(({ size, dataUrl }) => {
          const base64 = dataUrl.split(',')[1];
          iconFolder.file(`icons/${size}x${size}.png`, base64, { base64: true });
        });

        if (selectedPresets.includes('web')) {
          iconFolder.file('manifest.json', JSON.stringify({
            name: `IconCraft - ${item.name}`,
            short_name: item.name,
            icons: [
              { src: "icons/192x192.png", sizes: "192x192", type: "image/png" },
              { src: "icons/512x512.png", sizes: "512x512", type: "image/png" }
            ],
            start_url: "/",
            display: "standalone"
          }, null, 2));
        }

        if (selectedPresets.includes('linux')) {
          pngResults.forEach(({ size, dataUrl }) => {
             const base64 = dataUrl.split(',')[1];
             iconFolder.file(`linux/hicolor/${size}x${size}/apps/${item.name}.png`, base64, { base64: true });
          });
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentSet.length > 1 ? `IconSet_${Date.now()}.zip` : `iconcraft-${config.iconName}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#a855f7', '#ec4899']
      });
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 space-y-6">
        <section className="space-y-3">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Export Presets</label>
          <div className="space-y-2">
            {EXPORT_PRESETS.map((preset) => {
              const isActive = selectedPresets.includes(preset.id);
              return (
                <div 
                  key={preset.id}
                  onClick={() => togglePreset(preset.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isActive 
                    ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm ring-1 ring-indigo-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <preset.icon className={`h-4 w-4 ${isActive ? 'text-white' : preset.color}`} />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{preset.name}</span>
                      <span className={`text-[9px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>{preset.detail}</span>
                    </div>
                  </div>
                  {isActive ? (
                    <Check className="h-3 w-3 text-white" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-slate-300" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-3">
           <div className="flex items-start gap-2">
             <ShieldAlert className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
             <div className="space-y-1">
               <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-tighter">Client-Side Engine</p>
               <p className="text-[10px] leading-tight text-indigo-700 opacity-80">
                 Image processing happens locally. No data ever leaves your device.
               </p>
             </div>
           </div>
        </section>

        <Button 
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-200 relative overflow-hidden"
          disabled={exporting || selectedPresets.length === 0}
          onClick={handleExport}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              <span>Generate Pack</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
