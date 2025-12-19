import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Calendar Grid Logic
export const COLUMN_COUNT = 7;
export const OUTER_MARGIN = 0; // Remove margin for full width
const AVAILABLE_WIDTH = width; // Use full width

// Calculate cell size ensuring 7 columns fit perfectly
// Subtracting 1px to account for the left border of the grid container avoiding overflow
// The remaining fractional pixels are negligible.
export const CELL_SIZE = (width - 1) / COLUMN_COUNT;
export const GRID_WIDTH = width;

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  outerMargin: 0,
};

export const layout = {
  cellSize: CELL_SIZE,
  gridWidth: GRID_WIDTH,
  borderWidth: 0.8, // Hairline is too thin sometimes, 0.5 or 0.8 is good
};
