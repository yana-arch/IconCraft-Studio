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

export function Editor({ config, onChange }: EditorProps) {
  const updateConfig = (updates: Partial<IconConfig>) => {
    onChange({ ...config, ...updates });
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
    <ScrollArea className="h-full high-density-scrollbar pb-16 lg:pb-0">
      <div className="p-4 space-y-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Icon Layer</label>
            <button 
              onClick={() => updateConfig({ iconSize: 60, iconColor: '#ffffff', iconUseGradient: false, strokeWidth: 2 })}
              className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              Reset
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 transition-all hover:border-slate-300/80">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Use Gradient</Label>
              <Switch 
                checked={config.iconUseGradient} 
                onCheckedChange={(checked) => updateConfig({ iconUseGradient: checked })} 
                className="scale-90 data-[state=checked]:bg-indigo-600"
              />
            </div>
            
            {config.iconUseGradient ? (
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <GradientEditor 
                  label="Icon Gradient" 
                  config={config.iconGradient} 
                  onChange={(g) => updateConfig({ iconGradient: g })} 
                />
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 transition-all hover:border-slate-300 space-y-3">
                <ColorField 
                  label="Icon Color" 
                  value={config.iconColor} 
                  onChange={(c) => updateConfig({ iconColor: c })} 
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['#ffffff', '#000000', '#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'].map(c => (
                    <button
                      key={c}
                      className={`h-5 w-5 rounded-md border border-slate-200 shadow-sm transition-transform active:scale-90 ${config.iconColor === c ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => updateConfig({ iconColor: c })}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3 transition-all hover:border-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Stroke / Weight</span>
                <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-indigo-600 font-bold">{config.strokeWidth}px</span>
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

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3 transition-all hover:border-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Icon Scale</span>
                <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-indigo-600 font-bold">{config.iconSize}%</span>
              </div>
              <Slider 
                value={[config.iconSize]} 
                min={10} 
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

        <Separator className="opacity-40" />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Background Layer</label>
            <button 
              onClick={() => updateConfig({ bgShape: 'circle', bgPadding: 32, borderRadius: 16, bgUseGradient: true })}
              className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              Reset
            </button>
          </div>
          
          <div className="grid grid-cols-5 gap-2 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/60 shadow-inner">
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
                    className={`h-9 w-full flex items-center justify-center rounded-lg transition-all transform active:scale-95 ${
                      config.bgShape === shape.id 
                      ? 'bg-white shadow-md ring-1 ring-slate-200 text-indigo-600 scale-105 z-10 font-bold' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                    }`}
                    onClick={() => updateConfig({ bgShape: shape.id as BackgroundShape })}
                  >
                    <shape.icon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-[10px] font-bold uppercase">{shape.label}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 transition-all hover:border-slate-300/80">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Enable Gradient</Label>
              <Switch 
                checked={config.bgUseGradient} 
                onCheckedChange={(checked) => updateConfig({ bgUseGradient: checked })} 
                className="scale-90 data-[state=checked]:bg-indigo-600"
              />
            </div>
            
            {config.bgUseGradient ? (
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <GradientEditor 
                  label="Background Gradient" 
                  config={config.bgGradient} 
                  onChange={(g) => updateConfig({ bgGradient: g })} 
                />
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 transition-all hover:border-slate-300">
                <ColorField 
                  label="Solid Color" 
                  value={config.bgColor} 
                  onChange={(c) => updateConfig({ bgColor: c })} 
                />
              </div>
            )}

            <div className="grid gap-3 pt-2">
              {config.bgShape === 'square' && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3 transition-all hover:border-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Border Radius</span>
                    <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-indigo-600 font-bold">{config.borderRadius}px</span>
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
              
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3 transition-all hover:border-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inner Padding</span>
                  <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-indigo-600 font-bold">{config.bgPadding}px</span>
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

        <Separator className="opacity-40" />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Effects & Depth</label>
            <button 
              onClick={() => updateConfig({ shadowEnabled: true, shadowBlur: 10, shadowX: 0, shadowY: 4 })}
              className="text-[9px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              Reset
            </button>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 transition-all hover:border-slate-300/80">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">Drop Shadow</Label>
              <Switch 
                checked={config.shadowEnabled} 
                onCheckedChange={(checked) => updateConfig({ shadowEnabled: checked })} 
                className="scale-90 data-[state=checked]:bg-indigo-600"
              />
            </div>

            {config.shadowEnabled && (
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <ColorField 
                  label="Shadow Color" 
                  value={config.shadowColor} 
                  onChange={(c) => updateConfig({ shadowColor: c })} 
                />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Blur Strength</span>
                    <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-indigo-600 font-bold">{config.shadowBlur}px</span>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">X Offset</div>
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
                  <div className="space-y-3">
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Y Offset</div>
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
              </div>
            )}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
}
