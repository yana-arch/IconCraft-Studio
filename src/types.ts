export type GradientType = 'linear' | 'radial' | 'conic';

export interface GradientPoint {
  color: string;
  offset: number;
}

export interface GradientConfig {
  type: GradientType;
  angle: number;
  points: GradientPoint[];
}

export type BackgroundShape = 'circle' | 'square' | 'squircle' | 'hexagon' | 'shield';

export interface IconSetItem {
  id: string;
  name: string;
  set: string;
  svgContent?: string;
}

export interface IconConfig {
  id: string;
  iconName: string;
  iconSet: string;
  // Icon styling
  iconSize: number;
  iconColor: string;
  iconGradient: GradientConfig;
  iconUseGradient: boolean;
  strokeWidth: number;
  // Background styling
  bgShape: BackgroundShape;
  bgUseGradient: boolean;
  bgColor: string;
  bgGradient: GradientConfig;
  bgPadding: number;
  borderRadius: number;
  // Effects
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowX: number;
  shadowY: number;
}

export const PRESET_GRADIENTS: GradientConfig[] = [
  {
    type: 'linear',
    angle: 45,
    points: [{ color: '#f093fb', offset: 0 }, { color: '#f5576c', offset: 100 }]
  },
  {
    type: 'linear',
    angle: 45,
    points: [{ color: '#5eeff2', offset: 0 }, { color: '#4568dc', offset: 100 }]
  },
  {
    type: 'linear',
    angle: 45,
    points: [{ color: '#f6d365', offset: 0 }, { color: '#fda085', offset: 100 }]
  },
  {
    type: 'linear',
    angle: 45,
    points: [{ color: '#a1c4fd', offset: 0 }, { color: '#c2e9fb', offset: 100 }]
  },
  {
    type: 'linear',
    angle: 45,
    points: [{ color: '#6a11cb', offset: 0 }, { color: '#2575fc', offset: 100 }]
  },
  {
    type: 'linear',
    angle: 45,
    points: [{ color: '#00c6fb', offset: 0 }, { color: '#005bea', offset: 100 }]
  }
];
