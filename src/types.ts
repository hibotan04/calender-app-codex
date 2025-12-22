
export type ThemeColor = 'mono' | 'linen' | 'ice' | 'azalea' | 'rose' | 'lilac';
export type GridMode = 'standard' | 'sequential' | 'weekly';

export interface ThemeColors {
  bg: string;
  text: string;
  subText: string;
  border: string;
  modalBg: string;
  inputBg: string;
  accent: string;
  weekText: string;
  sundayText: string;
  cellBg: string;
  placeholder: string;
  activeMenu: string;
}

export interface DiaryEntry {
  text: string;
  image: string;
  imgScale?: number;
  imgX?: number;
  imgY?: number;
  imgRotation?: number;
  textX?: number;
  textY?: number;
  textScale?: number;
  textColor?: string;
  dateColor?: string;
  filterColor?: 'none' | 'black' | 'white';
  filterOpacity?: number;
}
