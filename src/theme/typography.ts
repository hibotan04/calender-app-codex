import { Platform, TextStyle } from 'react-native';

const systemFont = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

// Reference uses "tracking-widest" (letterSpacing), "uppercase", "serif"
// In RN we can use 'Times New Roman' or 'Georgia' for serif if available, or system serif.
const serifFont = Platform.select({
  ios: 'Times New Roman',
  android: 'serif',
  default: 'serif',
});

export const typography = {
  header: {
    fontFamily: systemFont,
    fontWeight: '300', // Light
    fontSize: 16, // Reduced from 24
    letterSpacing: 2, // Reduced tracking
    textTransform: 'uppercase',
  } as TextStyle,
  monthTitle: {
    fontFamily: systemFont,
    fontWeight: '300',
    fontSize: 18, // Reduced from 20
    letterSpacing: 4,
    textTransform: 'uppercase',
  } as TextStyle,
  yearTitle: {
    fontFamily: systemFont,
    fontWeight: '200',
    fontSize: 12, // Reduced from 14
    letterSpacing: 3,
  } as TextStyle,
  dateNumber: {
    fontFamily: systemFont,
    fontWeight: '300',
    fontSize: 10,
    letterSpacing: 0,
  } as TextStyle,
  body: {
    fontFamily: serifFont, // Reference uses font-serif
    fontWeight: '400',
    fontSize: 11, // text-[11px]
    lineHeight: 16, // leading-relaxed
  } as TextStyle,
  caption: {
    fontFamily: systemFont,
    fontSize: 10,
    letterSpacing: 2, // tracking-widest
    textTransform: 'uppercase',
  } as TextStyle,
};
