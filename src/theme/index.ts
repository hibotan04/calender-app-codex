import { ThemeColor, ThemeColors } from '../types';

// ==========================================
// ▼▼▼ USER CUSTOM PALETTE (Pastel & Dreamy) + ORIGINAL ▼▼▼
export const THEMES: Record<ThemeColor, { light: ThemeColors; dark: ThemeColors }> = {
  // 0. MONO (Original Default) - Atelier Stone
  mono: {
    light: {
      bg: '#FAFAFA',
      text: '#333333',
      subText: '#A1A1AA',
      border: '#E4E4E7',
      modalBg: '#FFFFFF',
      inputBg: '#F4F4F5',
      accent: '#3F3F46',
      weekText: '#D4D4D8',
      sundayText: '#FCA5A5',
      cellBg: '#FFFFFF',
      placeholder: '#F4F4F5',
      activeMenu: '#18181B'
    },
    dark: {
      bg: '#18181B',
      text: '#E4E4E7',
      subText: '#71717A',
      border: '#27272A',
      modalBg: '#18181B',
      inputBg: '#27272A',
      accent: '#FAFAFA',
      weekText: '#3F3F46',
      sundayText: '#9F1239',
      cellBg: '#18181B',
      placeholder: '#27272A',
      activeMenu: '#E4E4E7'
    }
  },
  // 1. LINEN (Default, Warm Paper) - #FAEEE5
  linen: {
    light: {
      bg: '#FAEEE5',
      text: '#5D4037', // Warm Brown
      subText: '#A1887F',
      border: '#E6D0C5',
      modalBg: '#FFFAF8',
      inputBg: '#FFF5F0',
      accent: '#8D6E63',
      weekText: '#BCAAA4',
      sundayText: '#B0898880', // Desaturated Red + Transparency
      cellBg: '#FFFFFF', // Clean White cards on linen bg
      placeholder: '#FFF5F0',
      activeMenu: '#5D4037'
    },
    dark: {
      bg: '#3E2723',
      text: '#D7CCC8',
      subText: '#A1887F',
      border: '#5D4037',
      modalBg: '#4E342E',
      inputBg: '#5D4037',
      accent: '#BCAAA4',
      weekText: '#5D4037',
      sundayText: '#B0898880',
      cellBg: '#2D1B18',
      placeholder: '#4E342E',
      activeMenu: '#D7CCC8'
    }
  },
  // 2. JAGGED ICE (Cool Blue) - #C9E6EE
  ice: {
    light: {
      bg: '#C9E6EE',
      text: '#37474F', // Blue Grey
      subText: '#78909C',
      border: '#B0D4DE',
      modalBg: '#E3F2F6',
      inputBg: '#E1F5FE',
      accent: '#546E7A',
      weekText: '#90A4AE',
      sundayText: '#9FA6B080', // Cool Muted Grey-Red + Transparency
      cellBg: '#FFFFFF',
      placeholder: '#E1F5FE',
      activeMenu: '#263238'
    },
    dark: {
      bg: '#263238',
      text: '#ECEFF1',
      subText: '#90A4AE',
      border: '#37474F',
      modalBg: '#37474F',
      inputBg: '#455A64',
      accent: '#80CBC4',
      weekText: '#455A64',
      sundayText: '#B0A0A080',
      cellBg: '#1F292E',
      placeholder: '#37474F',
      activeMenu: '#80CBC4'
    }
  },
  // 3. AZALEA (Soft Pink) - #FAD1D8
  azalea: {
    light: {
      bg: '#FAD1D8',
      text: '#880E4F', // Dark Pink/Red
      subText: '#BC477B',
      border: '#F4B0C0',
      modalBg: '#FFF0F5',
      inputBg: '#FFEBEE',
      accent: '#C2185B',
      weekText: '#F06292',
      sundayText: '#B0889080', // Muted Rose + Transparency
      cellBg: '#FFFFFF',
      placeholder: '#FFEBEE',
      activeMenu: '#880E4F'
    },
    dark: {
      bg: '#4A081F', // Deep Maroon
      text: '#F8BBD0',
      subText: '#D81B60',
      border: '#880E4F',
      modalBg: '#650F2C',
      inputBg: '#880E4F',
      accent: '#F48FB1',
      weekText: '#880E4F',
      sundayText: '#D8A0B080',
      cellBg: '#380617',
      placeholder: '#650F2C',
      activeMenu: '#F8BBD0'
    }
  },
  // 4. WE PEEP (Rose) - #F2C4D6
  rose: {
    light: {
      bg: '#F2C4D6',
      text: '#4A4A4A', // Soft Black for modern feel
      subText: '#8D6E63',
      border: '#E1A4BC',
      modalBg: '#FFF5F8',
      inputBg: '#FCE4EC',
      accent: '#BA68C8',
      weekText: '#BA68C8',
      sundayText: '#B0889080',
      cellBg: '#FFFFFF',
      placeholder: '#FCE4EC',
      activeMenu: '#4A4A4A'
    },
    dark: {
      bg: '#29181D',
      text: '#F2C4D6',
      subText: '#BA68C8',
      border: '#4A2A36',
      modalBg: '#3D222A',
      inputBg: '#4A2A36',
      accent: '#F48FB1',
      weekText: '#4A2A36',
      sundayText: '#D8A0B080',
      cellBg: '#1F1216',
      placeholder: '#3D222A',
      activeMenu: '#F2C4D6'
    }
  },
  // 5. PRELUDE (Lilac) - #DBC0E7
  lilac: {
    light: {
      bg: '#DBC0E7',
      text: '#4A148C', // Deep Purple
      subText: '#7B1FA2',
      border: '#C09ADB',
      modalBg: '#F3E5F5',
      inputBg: '#F3E5F5',
      accent: '#8E24AA',
      weekText: '#AB47BC',
      sundayText: '#A090B080', // Muted Violet + Transparency
      cellBg: '#FFFFFF',
      placeholder: '#F3E5F5',
      activeMenu: '#4A148C'
    },
    dark: {
      bg: '#200A2E', // Deep Purple Night
      text: '#E1BEE7',
      subText: '#9C27B0',
      border: '#4A148C',
      modalBg: '#311045',
      inputBg: '#4A148C',
      accent: '#CE93D8',
      weekText: '#4A148C',
      sundayText: '#C0B0D080',
      cellBg: '#15061F',
      placeholder: '#311045',
      activeMenu: '#E1BEE7'
    }
  }
};

export const THEME_OPTIONS: { key: ThemeColor; color: string }[] = [
  { key: 'mono', color: '#52525B' },   // Original
  { key: 'linen', color: '#FAEEE5' },  // Warm
  { key: 'ice', color: '#C9E6EE' },    // Blue
  { key: 'azalea', color: '#FAD1D8' }, // Pink 1
  { key: 'rose', color: '#F2C4D6' },   // Pink 2
  { key: 'lilac', color: '#DBC0E7' },  // Purple
];
