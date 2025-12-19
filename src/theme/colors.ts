// Palette based on Tailwind Stone colors
export const colors = {
  canvas: '#F5F5F4', // stone-100 equivalent for background
  paper: '#FFFFFF', // White for the "paper" card
  gridLines: '#E7E5E4', // stone-200
  text: {
    primary: '#292524', // stone-800
    secondary: '#78716C', // stone-500
    tertiary: '#A8A29E', // stone-400 (for dates)
    placeholder: '#D6D3D1', // stone-300
    inverse: '#FFFFFF',
  },
  accent: '#1C1917', // stone-900 (Black-ish)
  hover: '#FAFAF9', // stone-50
  overlay: {
    black: 'rgba(28, 25, 23, 0.4)', // stone-900 with opacity
    white: 'rgba(255, 255, 255, 0.8)',
  }
} as const;
