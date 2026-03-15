/**
 * Utilitário para gerar uma paleta de cores dinâmica baseada em uma cor primária (estilo Material 3)
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function applyDynamicTheme(hexColor: string) {
  if (!hexColor) return;
  
  // Normalizar hex
  const cleanHex = hexColor.startsWith('#') ? hexColor : `#${cleanHexWithoutHash(hexColor)}`;
  const rgb = hexToRgb(cleanHex);
  if (!rgb) return;

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const root = document.documentElement;

  // Primária
  root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
  // Tons derivados (Material-like logic simplificada)
  root.style.setProperty('--primary-muted', `${hsl.h} ${hsl.s * 0.5}% ${Math.min(hsl.l * 1.5, 30)}%`);
  root.style.setProperty('--primary-accent', `${hsl.h} ${Math.min(hsl.s + 20, 100)}% ${Math.max(hsl.l - 10, 20)}%`);
}

function cleanHexWithoutHash(hex: string): string {
  return hex.replace('#', '');
}

export function saveThemePreference(color: string, useMaterialYou: boolean) {
  localStorage.setItem('streamplay-theme-color', cleanHexWithoutHash(color));
  localStorage.setItem('streamplay-use-material-you', String(useMaterialYou));
}

export function getThemePreference(): { color: string; useMaterialYou: boolean } {
  return {
    color: localStorage.getItem('streamplay-theme-color') || '6366f1',
    useMaterialYou: localStorage.getItem('streamplay-use-material-you') === 'true'
  };
}

export async function getMaterialYouColor(): Promise<string | null> {
  return new Promise((resolve) => {
    // Verifica se o plugin existe no objeto window
    const dynamicColor = (window as any).DynamicColor;
    if (typeof window !== 'undefined' && dynamicColor && typeof dynamicColor.colors === 'function') {
      dynamicColor.colors((colors: any) => {
        resolve(colors.primary || null);
      }, () => {
        resolve(null);
      });
    } else {
      // Fallback ou Log silencioso se não estiver em ambiente nativo suportado
      resolve(null);
    }
  });
}

// Deprecated: used getThemePreference instead for better control
export function getSavedThemeColor(): string {
  return localStorage.getItem('streamplay-theme-color') || '6366f1';
}
