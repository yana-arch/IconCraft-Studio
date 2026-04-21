import { GradientConfig, IconConfig } from "../types";

export function getGradientCss(config: GradientConfig): string {
  const { type, angle, points } = config;
  const stops = points
    .sort((a, b) => a.offset - b.offset)
    .map((p) => `${p.color} ${p.offset}%`)
    .join(", ");

  if (type === "linear") {
    return `linear-gradient(${angle}deg, ${stops})`;
  } else if (type === "radial") {
    return `radial-gradient(circle, ${stops})`;
  } else {
    return `conic-gradient(from ${angle}deg, ${stops})`;
  }
}

export function getSvgGradientDef(id: string, config: GradientConfig): string {
  const { type, angle, points } = config;
  if (type === "linear") {
    const angleRad = (angle * Math.PI) / 180;
    const x1 = Math.round(50 - Math.cos(angleRad) * 50) + "%";
    const y1 = Math.round(50 - Math.sin(angleRad) * 50) + "%";
    const x2 = Math.round(50 + Math.cos(angleRad) * 50) + "%";
    const y2 = Math.round(50 + Math.sin(angleRad) * 50) + "%";
    
    const stops = points
      .map((p) => `<stop offset="${p.offset}%" stop-color="${p.color}" />`)
      .join("");
    return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient>`;
  } else {
    const stops = points
      .map((p) => `<stop offset="${p.offset}%" stop-color="${p.color}" />`)
      .join("");
    return `<radialGradient id="${id}" cx="50%" cy="50%" r="50%">${stops}</radialGradient>`;
  }
}

export function getBackgroundPath(shape: string, size: number, borderRadius: number): string {
  const center = size / 2;
  const radius = size / 2;

  switch (shape) {
    case "square": {
      const r = (borderRadius / 100) * radius;
      return `M ${r} 0 H ${size - r} A ${r} ${r} 0 0 1 ${size} ${r} V ${size - r} A ${r} ${r} 0 0 1 ${size - r} ${size} H ${r} A ${r} ${r} 0 0 1 0 ${size - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
    }
    case "squircle": {
      // Approximated superellipse / squircle
      const r = (borderRadius / 100) * (size / 2);
      const k = size;
      return `M 0,${k/2} C 0,${r} ${r},0 ${k/2},0 S ${k},${r} ${k},${k/2} ${k-r},${k} ${k/2},${k} 0,${k-r} 0,${k/2}`;
    }
    case "hexagon": {
      const w = size;
      const h = size;
      return `M ${w * 0.25} 0 L ${w * 0.75} 0 L ${w} ${h * 0.5} L ${w * 0.75} ${h} L ${w * 0.25} ${h} L 0 ${h * 0.5} Z`;
    }
    case "shield": {
      const w = size;
      const h = size;
      return `M 0 0 H ${w} V ${h * 0.7} C ${w} ${h} ${w * 0.5} ${h} ${w * 0.5} ${h} C ${w * 0.5} ${h} 0 ${h} 0 ${h * 0.7} V 0 Z`;
    }
    case "circle":
    default:
      return `M ${center}, ${center} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
  }
}

export async function renderIconToDataUrl(
  config: IconConfig,
  svgContent: string,
  targetSize: number = 512
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject("Canvas context not found");

    const scale = targetSize / 512;
    const padding = config.bgPadding * scale;
    const iconBaseSize = targetSize - padding * 2;
    const iconSizeFactor = config.iconSize / 100;
    const finalIconSize = iconBaseSize * iconSizeFactor;

    // Build the SVG to render
    const bgPath = getBackgroundPath(config.bgShape, targetSize, config.borderRadius * scale);
    const iconGradId = `icon-grad-${Math.random().toString(36).substr(2, 9)}`;
    const bgGradId = `bg-grad-${Math.random().toString(36).substr(2, 9)}`;

    const defs = [];
    if (config.iconUseGradient) defs.push(getSvgGradientDef(iconGradId, config.iconGradient));
    if (config.bgUseGradient) defs.push(getSvgGradientDef(bgGradId, config.bgGradient));

    // Handle SVG paths from Iconify
    // Iconify SVGs usually have single paths or mixed content. 
    // We expect the svgContent to be just the inner content or full SVG.
    // We will wrap it.
    
    const shadowFilter = config.shadowEnabled 
      ? `<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
           <feGaussianBlur in="SourceAlpha" stdDeviation="${config.shadowBlur * scale}" />
           <feOffset dx="${config.shadowX * scale}" dy="${config.shadowY * scale}" result="offsetblur" />
           <feFlood flood-color="${config.shadowColor}" />
           <feComposite in2="offsetblur" operator="in" />
           <feMerge>
             <feMergeNode />
             <feMergeNode in="SourceGraphic" />
           </feMerge>
         </filter>`
      : "";

    const fullSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${targetSize}" height="${targetSize}" viewBox="0 0 ${targetSize} ${targetSize}">
        <defs>
          ${defs.join("")}
          ${shadowFilter}
        </defs>
        <path d="${bgPath}" fill="${config.bgUseGradient ? `url(#${bgGradId})` : config.bgColor}" />
        <g transform="translate(${(targetSize - finalIconSize) / 2}, ${(targetSize - finalIconSize) / 2}) scale(${finalIconSize / 24})">
          <g filter="${config.shadowEnabled ? 'url(#shadow)' : ''}">
            ${svgContent.replace(/fill="[^"]*"/g, `fill="${config.iconUseGradient ? `url(#${iconGradId})` : config.iconColor}"`)}
          </g>
        </g>
      </svg>
    `;

    const img = new Image();
    const svgBlob = new Blob([fullSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
      URL.revokeObjectURL(url);
    };
    img.onerror = reject;
    img.src = url;
  });
}
