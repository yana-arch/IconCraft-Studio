import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { 
  Type, 
  Palette, 
  Square, 
  Circle, 
  Hexagon, 
  Shield, 
  Layers, 
  Zap, 
  Download,
  Plus,
  Trash2,
  Move
} from 'lucide-react';
import { IconConfig, GradientConfig, BackgroundShape, PRESET_GRADIENTS } from '../types';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface EditorProps {
  config: IconConfig;
  onChange: (config: IconConfig) => void;
}

const BRAND_PALETTES = [
  { name: 'Cyberpunk', bg: '#0f172a', icon: '#22d3ee', grad: PRESET_GRADIENTS[0] },
  { name: 'Organic', bg: '#f0fdf4', icon: '#166534', grad: PRESET_GRADIENTS[1] },
  { name: 'Luxury', bg: '#fafaf9', icon: '#a16207', grad: PRESET_GRADIENTS[2] },
  { name: 'Deep Sea', bg: '#0c4a6e', icon: '#e0f2fe', grad: PRESET_GRADIENTS[4] },
  { name: 'Sunset', bg: '#fff7ed', icon: '#ea580c', grad: PRESET_GRADIENTS[3] },
  { name: 'Soft Candy', bg: '#fdf2f8', icon: '#be185d', grad: PRESET_GRADIENTS[5] },
];

export function Editor({ config, onChange }: EditorProps) {
  const updateConfig = (updates: Partial<IconConfig>) => {
    onChange({ ...config, ...updates });
  };

  const applyPalette = (p: typeof BRAND_PALETTES[0]) => {
    updateConfig({
      bgColor: p.bg,
      iconColor: p.icon,
      bgUseGradient: false,
      iconUseGradient: true,
      iconGradient: p.grad,
      shadowEnabled: true,
      shadowColor: 'rgba(0,0,0,0.1)',
    });
  };

  const ColorField = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-xs font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger>
          <div 
            className="h-8 w-12 rounded-md border shadow-sm cursor-pointer" 
            style={{ backgroundColor: value }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <HexColorPicker color={value} onChange={onChange} />
          <div className="mt-3 flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: value }} />
            <span className="text-xs font-mono">{value.toUpperCase()}</span>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  const GradientEditor = ({ label, config, onChange }: { label: string; config: GradientConfig; onChange: (g: GradientConfig) => void }) => (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        <Select 
          value={config.type} 
          onValueChange={(val: any) => onChange({ ...config, type: val })}
        >
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="radial">Radial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.type === 'linear' && (
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Angle</span>
            <span>{config.angle}°</span>
          </div>
          <Slider 
            value={[config.angle]} 
            min={0} 
            max={360} 
            step={1} 
            onValueChange={(val) => {
              const value = Array.isArray(val) ? val[0] : val;
              onChange({ ...config, angle: value });
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        {config.points.map((point, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger>
                <div 
                  className="h-6 w-10 rounded border shadow-sm cursor-pointer" 
                  style={{ backgroundColor: point.color }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <HexColorPicker 
                  color={point.color} 
                  onChange={(c) => {
                    const newPoints = [...config.points];
                    newPoints[idx].color = c;
                    onChange({ ...config, points: newPoints });
                  }} 
                />
              </PopoverContent>
            </Popover>
            <Slider 
              value={[point.offset]} 
              min={0} 
              max={100} 
              step={1} 
              className="flex-1"
              onValueChange={(val) => {
                const value = Array.isArray(val) ? val[0] : val;
                const newPoints = [...config.points];
                newPoints[idx].offset = value;
                onChange({ ...config, points: newPoints });
              }}
            />
            {config.points.length > 2 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-destructive"
                onClick={() => {
                  const newPoints = config.points.filter((_, i) => i !== idx);
                  onChange({ ...config, points: newPoints });
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        {config.points.length < 4 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-8 text-[10px]"
            onClick={() => {
              const lastPoint = config.points[config.points.length - 1];
              onChange({ 
                ...config, 
                points: [...config.points, { color: '#ffffff', offset: Math.min(100, lastPoint.offset + 20) }] 
              });
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Color Stop
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-6 gap-2 pt-2">
        {PRESET_GRADIENTS.map((preset, idx) => (
          <button
            key={idx}
            className="h-6 w-full rounded-sm border shadow-sm transition-transform hover:scale-110"
            style={{ backgroundImage: `linear-gradient(${preset.angle}deg, ${preset.points.map(p => `${p.color} ${p.offset}%`).join(', ')})` }}
            onClick={() => onChange(preset)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <ScrollArea className="h-full high-density-scrollbar pb-20 lg:pb-0">
      <div className="p-5 space-y-8">
        <section className="space-y-4">
          <div className="flex flex-col gap-0.5 px-1">
            <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] block">Style Express</label>
            <span className="text-[9px] text-slate-400 font-medium">One-click thematic presets</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 high-density-scrollbar no-scrollbar">
            {BRAND_PALETTES.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPalette(p)}
                className="flex-shrink-0 group flex flex-col gap-2 items-center"
              >
                <div className="w-14 h-14 rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md group-active:scale-95 group-hover:border-indigo-200 relative">
                   <div className="absolute inset-0" style={{ backgroundColor: p.bg }} />
                   <div 
                    className="absolute inset-4 rounded-lg flex items-center justify-center shadow-sm"
                    style={{ background: p.grad.type === 'linear' ? `linear-gradient(${p.grad.angle}deg, ${p.grad.points[0].color}, ${p.grad.points[p.grad.points.length-1].color})` : `radial-gradient(circle, ${p.grad.points[0].color}, ${p.grad.points[p.grad.points.length-1].color})` }}
                   >
                     <Zap className="w-3 h-3 text-white" />
                   </div>
                </div>
                <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-indigo-600 transition-colors tracking-tighter">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] block">Icon Geometry</label>
              <span className="text-[9px] text-slate-400 font-medium">Fine-tune path and scale</span>
            </div>
            <button 
              onClick={() => updateConfig({ iconSize: 60, iconColor: '#ffffff', iconUseGradient: false, strokeWidth: 2 })}
              className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest px-2 py-1 rounded-md hover:bg-indigo-50"
            >
              Reset
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Palette className="h-4 w-4 text-indigo-600" />
                </div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-tight">Icon Gradient</Label>
              </div>
              <Switch 
                checked={config.iconUseGradient} 
                onCheckedChange={(checked) => updateConfig({ iconUseGradient: checked })} 
                className="scale-90 data-[state=checked]:bg-indigo-600"
              />
            </div>
            
            {config.iconUseGradient ? (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 space-y-4 shadow-inner"
              >
                <GradientEditor 
                  label="Icon Color Palette" 
                  config={config.iconGradient} 
                  onChange={(g) => updateConfig({ iconGradient: g })} 
                />
              </motion.div>
            ) : (
              <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all hover:border-slate-300 space-y-4">
                <ColorField 
                  label="Fill Color" 
                  value={config.iconColor} 
                  onChange={(c) => updateConfig({ iconColor: c })} 
                />
                <div className="grid grid-cols-8 gap-1.5 pt-1">
                  {['#ffffff', '#0f172a', '#6366f1', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'].map(c => (
                    <button
                      key={c}
                      className={`h-6 w-full rounded-md border border-slate-200 shadow-sm transition-all active:scale-90 ${config.iconColor === c ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                      onClick={() => updateConfig({ iconColor: c })}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm space-y-4 transition-all hover:border-slate-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Type className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stroke Weight</span>
                </div>
                <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-mono text-indigo-600 font-black">{config.strokeWidth}px</span>
              </div>
              <Slider 
                value={[config.strokeWidth]} 
                min={0} 
                max={12} 
                step={0.5} 
                className="py-2"
                onValueChange={(val) => {
                  const value = Array.isArray(val) ? val[0] : val;
                  updateConfig({ strokeWidth: value });
                }}
              />
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm space-y-4 transition-all hover:border-slate-300">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Move className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Icon Scale</span>
                </div>
                <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-mono text-indigo-600 font-black">{config.iconSize}%</span>
              </div>
              <Slider 
                value={[config.iconSize]} 
                min={5} 
                max={100} 
                step={1} 
                className="py-2"
                onValueChange={(val) => {
                  const value = Array.isArray(val) ? val[0] : val;
                  updateConfig({ iconSize: value });
                }}
              />
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] block">Container Styling</label>
              <span className="text-[9px] text-slate-400 font-medium">Shape, color and padding</span>
            </div>
            <button 
              onClick={() => updateConfig({ bgShape: 'circle', bgPadding: 32, borderRadius: 16, bgUseGradient: true })}
              className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest px-2 py-1 rounded-md hover:bg-indigo-50"
            >
              Reset
            </button>
          </div>
          
          <div className="grid grid-cols-5 gap-2 p-2 bg-slate-100/50 rounded-2xl border border-slate-200 shadow-inner">
            {[
              { id: 'circle', icon: Circle, label: 'Circle' },
              { id: 'square', icon: Square, label: 'Square' },
              { id: 'squircle', icon: Zap, label: 'Squircle' },
              { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
              { id: 'shield', icon: Shield, label: 'Shield' },
            ].map((shape) => (
              <div key={shape.id}>
                <Tooltip>
                  <TooltipTrigger
                    className={`h-10 w-full flex items-center justify-center rounded-xl transition-all ${
                      config.bgShape === shape.id 
                      ? 'bg-white shadow-lg text-indigo-600 scale-105 z-10 font-bold ring-1 ring-slate-200' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                    }`}
                    onClick={() => updateConfig({ bgShape: shape.id as BackgroundShape })}
                  >
                    <shape.icon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[9px] font-black uppercase tracking-tighter">
                    {shape.label}
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-indigo-600" />
                </div>
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-tight">Active Gradient</Label>
              </div>
              <Switch 
                checked={config.bgUseGradient} 
                onCheckedChange={(checked) => updateConfig({ bgUseGradient: checked })} 
                className="scale-90 data-[state=checked]:bg-indigo-600"
              />
            </div>
            
            {config.bgUseGradient ? (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100/50 space-y-4 shadow-inner"
              >
                <GradientEditor 
                  label="Container Palette" 
                  config={config.bgGradient} 
                  onChange={(g) => updateConfig({ bgGradient: g })} 
                />
              </motion.div>
            ) : (
              <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all hover:border-slate-300">
                <ColorField 
                  label="Solid Background" 
                  value={config.bgColor} 
                  onChange={(c) => updateConfig({ bgColor: c })} 
                />
              </div>
            )}

            <div className="grid gap-4">
              {config.bgShape === 'square' && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm space-y-4 transition-all hover:border-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Corner Radius</span>
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-mono text-indigo-600 font-black">{config.borderRadius}px</span>
                  </div>
                  <Slider 
                    value={[config.borderRadius]} 
                    min={0} 
                    max={256} 
                    step={1} 
                    className="py-2"
                    onValueChange={(val) => {
                      const value = Array.isArray(val) ? val[0] : val;
                      updateConfig({ borderRadius: value });
                    }}
                  />
                </div>
              )}
              
              <div className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm space-y-4 transition-all hover:border-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Safe Area Padding</span>
                  <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-mono text-indigo-600 font-black">{config.bgPadding}px</span>
                </div>
                <Slider 
                  value={[config.bgPadding]} 
                  min={0} 
                  max={128} 
                  step={1} 
                  className="py-2"
                  onValueChange={(val) => {
                    const value = Array.isArray(val) ? val[0] : val;
                    updateConfig({ bgPadding: value });
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5 pb-10">
          <div className="flex items-center justify-between px-1">
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] block">Effects & Depth</label>
              <span className="text-[9px] text-slate-400 font-medium">Elevation and shadows</span>
            </div>
            <button 
              onClick={() => updateConfig({ shadowEnabled: true, shadowBlur: 10, shadowX: 0, shadowY: 4 })}
              className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest px-2 py-1 rounded-md hover:bg-indigo-50"
            >
              Reset
            </button>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-indigo-600" />
                  </div>
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-tight">Drop Shadow</Label>
                </div>
              <Switch 
                checked={config.shadowEnabled} 
                onCheckedChange={(checked) => updateConfig({ shadowEnabled: checked })} 
                className="scale-90 data-[state=checked]:bg-indigo-600"
              />
            </div>

            {config.shadowEnabled && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-indigo-50/20 border border-indigo-100/50 space-y-6 shadow-inner"
              >
                <ColorField 
                  label="Shadow Tint" 
                  value={config.shadowColor} 
                  onChange={(c) => updateConfig({ shadowColor: c })} 
                />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Blur Diffusion</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-mono text-indigo-600 font-black">{config.shadowBlur}px</span>
                  </div>
                  <Slider 
                    value={[config.shadowBlur]} 
                    min={0} 
                    max={50} 
                    step={1} 
                    className="py-1"
                    onValueChange={(val) => {
                      const value = Array.isArray(val) ? val[0] : val;
                      updateConfig({ shadowBlur: value });
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Horiz. Offset</div>
                    <Slider 
                      value={[config.shadowX]} 
                      min={-25} 
                      max={25} 
                      step={1} 
                      className="py-1"
                      onValueChange={(val) => {
                        const value = Array.isArray(val) ? val[0] : val;
                        updateConfig({ shadowX: value });
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Vert. Offset</div>
                    <Slider 
                      value={[config.shadowY]} 
                      min={-25} 
                      max={25} 
                      step={1} 
                      className="py-1"
                      onValueChange={(val) => {
                        const value = Array.isArray(val) ? val[0] : val;
                        updateConfig({ shadowY: value });
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}
