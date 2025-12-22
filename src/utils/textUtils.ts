
export type DynamicTextStyle = {
  fontSize: number;
  lineHeight: number;
  textAlign: 'center' | 'left';
};

export const getDynamicTextStyle = (text: string): DynamicTextStyle => {
  const len = text.length;
  const newlines = text.split('\n').length - 1;
  const textAlign = 'center';

  if (newlines >= 3) {
    return { fontSize: 5, lineHeight: 6.5, textAlign };
  }
  if (newlines >= 2) {
    return { fontSize: 6.5, lineHeight: 8, textAlign };
  }

  if (len <= 7) {
    return { fontSize: 9, lineHeight: 12, textAlign };
  }
  else if (len <= 16) {
    return { fontSize: 8, lineHeight: 11, textAlign };
  }
  else if (len <= 25) {
    return { fontSize: 7, lineHeight: 10, textAlign };
  }
  else {
    return { fontSize: 6, lineHeight: 8, textAlign };
  }
};

export const DEFAULT_TEXT_STYLE: DynamicTextStyle = {
  fontSize: 10, lineHeight: 10, textAlign: 'center'
};
