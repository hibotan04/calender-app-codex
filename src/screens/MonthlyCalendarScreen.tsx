import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { Layout } from '../components/Layout';
import { colors, layout, spacing, typography } from '../theme';
import { ChevronLeft, ChevronRight, Printer, Image as ImageIcon } from 'lucide-react-native';

interface MonthlyCalendarScreenProps {
  currentDate: Date;
  entries: Record<string, any>;
  onDayPress: (day: number, mode: 'photo' | 'text') => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrintPress: () => void;
  focusDay?: number;
}

const { width } = Dimensions.get('window');
// Calculate Cell Size for "2 Screens Wide"
// Total Grid Width = Screen Width * 2
const GRID_WIDTH = width * 2;
const COLUMNS = 7;
const CELL_SIZE = GRID_WIDTH / COLUMNS;

// Editor Canvas Size Reference (Standard width minus padding)
const EDITOR_CANVAS_REF = 350;
const SCALE_DOWN = CELL_SIZE / EDITOR_CANVAS_REF;

export const MonthlyCalendarScreen: React.FC<MonthlyCalendarScreenProps> = ({
  currentDate,
  entries,
  onDayPress,
  onPrevMonth,
  onNextMonth,
  onPrintPress,
  focusDay
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to focused day on mount or update
  useEffect(() => {
    if (focusDay && scrollViewRef.current) {
      const firstDay = new Date(year, month, 1).getDay();
      const slotIndex = focusDay + firstDay - 1;
      const colIndex = slotIndex % 7;

      const targetX = colIndex * CELL_SIZE;
      // Center the cell on screen
      const centerX = targetX - (width / 2) + (CELL_SIZE / 2);
      // Clamp values
      const maxScroll = GRID_WIDTH - width; // Scrollable area
      const clampedX = Math.max(0, Math.min(centerX, maxScroll));

      // Small timeout to ensure layout is ready
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: clampedX, animated: false });
      }, 100);
    }
  }, [focusDay, year, month]);

  const gridData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const totalSlots = 42;

    const slots = [];
    for (let i = 0; i < totalSlots; i++) {
      const day = i - firstDay + 1;
      const isCurrentMonth = day > 0 && day <= daysInMonth;
      const dateKey = `${year}-${month + 1}-${day}`;
      const entry = entries[dateKey];
      slots.push({ day: isCurrentMonth ? day : null, entry: isCurrentMonth ? entry : null, key: i });
    }
    return slots;
  }, [year, month, entries]);

  const handleCellPress = (day: number) => {
    onDayPress(day, 'photo');
  };

  // Removed handleModeSelect as it's no longer used


  return (
    <Layout>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <View style={styles.navLeft} />

        <View style={styles.navCenter}>
          <TouchableOpacity onPress={onPrevMonth} style={styles.navButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={onNextMonth} style={styles.navButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ChevronRight size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.navRight}>
          <TouchableOpacity onPress={onPrintPress} style={styles.printButton}>
            <Printer size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.paperContainer}>

        {/* Horizontal Scrollable Grid */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.gridScrollContainer}
          contentContainerStyle={{ width: GRID_WIDTH, paddingBottom: 40 }}
        >
          <View>
            {/* Weekday Headers */}
            <View style={styles.weekdaysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <Text key={i} style={[styles.weekdayLabel, { width: CELL_SIZE }]}>{d}</Text>
              ))}
            </View>

            {/* Grid */}
            <View style={[styles.grid, { width: GRID_WIDTH + 5 }]}>
// ... imports ...

              // ... (Start of component)

              // ... (Inside gridData.map loop)
              {gridData.map((slot) => (
                <TouchableOpacity
                  key={slot.key}
                  style={[
                    styles.cell,
                    { width: CELL_SIZE, height: CELL_SIZE },
                    !slot.day && styles.emptyCell,
                  ]}
                  onPress={() => slot.day && handleCellPress(slot.day)}
                  activeOpacity={0.8}
                  disabled={!slot.day}
                >
                  {slot.day && (
                    <>
                      <Text style={[styles.dateNumber, { color: slot.entry?.dateColor || colors.text.tertiary }]}>{slot.day}</Text>

                      <View style={styles.cellContentClipping}>
                        {slot.entry?.image && (
                          <View style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                            <Image
                              source={{ uri: slot.entry.image }}
                              style={[
                                styles.cellImage,
                                {
                                  transform: [
                                    { translateX: (slot.entry.imgX || 0) * SCALE_DOWN },
                                    { translateY: (slot.entry.imgY || 0) * SCALE_DOWN },
                                    { scale: slot.entry.imgScale || 1 },
                                    { rotate: `${slot.entry.imgRotation || 0}rad` }
                                  ]
                                }
                              ]}
                              resizeMode="cover"
                            />
                            {/* Filter Overlay */}
                            {slot.entry.filterColor && slot.entry.filterColor !== 'none' && (
                              <View
                                style={[
                                  StyleSheet.absoluteFillObject,
                                  {
                                    backgroundColor: slot.entry.filterColor === 'black' ? '#000' : '#FFF',
                                    opacity: slot.entry.filterOpacity || 0,
                                  }
                                ]}
                              />
                            )}
                          </View>
                        )}

                        {slot.entry?.text && (
                          <View
                            style={{
                              position: 'absolute',
                              zIndex: 10,
                              width: EDITOR_CANVAS_REF,
                              height: EDITOR_CANVAS_REF,
                              left: (CELL_SIZE - EDITOR_CANVAS_REF) / 2,
                              top: (CELL_SIZE - EDITOR_CANVAS_REF) / 2,
                              transform: [{ scale: SCALE_DOWN }],
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                            pointerEvents="none"
                          >
                            <Text
                              style={[
                                styles.cellText,
                                {
                                  fontSize: 18,
                                  lineHeight: 28,
                                  color: slot.entry.textColor || '#000000',
                                  transform: [
                                    { translateX: slot.entry.textX || 0 },
                                    { translateY: slot.entry.textY || 0 },
                                    { scale: slot.entry.textScale || 1 }
                                  ]
                                }
                              ]}
                            >
                              {slot.entry.text}
                            </Text>
                          </View>
                        )}
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  // Nav Header
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gridLines,
  },
  navLeft: { flex: 1 },
  navCenter: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  navRight: { flex: 1, alignItems: 'flex-end' },

  navButton: { padding: 8 },
  monthTitle: { ...typography.caption, fontSize: 16, fontWeight: '600', color: colors.text.primary, textAlign: 'center', marginHorizontal: 4 },
  printButton: { padding: 10 },

  // Paper Container
  paperContainer: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    paddingTop: spacing.m,
  },
  paperHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.canvas,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.l,
  },
  paperMonth: { ...typography.monthTitle, color: colors.text.primary },
  paperYear: { ...typography.yearTitle, color: colors.text.placeholder },

  // Grid Styles
  gridScrollContainer: {
    flex: 1,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  weekdayLabel: {
    textAlign: 'center',
    ...typography.caption,
    color: colors.text.tertiary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: colors.gridLines,
  },
  cell: {
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.gridLines,
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  emptyCell: {
    backgroundColor: colors.hover,
    opacity: 0.5,
  },
  dateNumber: {
    position: 'absolute',
    top: 4,
    left: 6,
    ...typography.dateNumber,
    color: colors.text.tertiary,
    zIndex: 10,
  },
  cellContentClipping: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cellImage: {
    width: '100%',
    height: '100%',
  },
  cellText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Footer
  footer: {
    width: '100%',
    paddingVertical: spacing.l,
    alignItems: 'flex-end',
    paddingRight: spacing.m,
  },
  footerText: {
    ...typography.caption,
    fontSize: 6,
    color: colors.text.placeholder,
    letterSpacing: 3,
  },

  // Popup Styles
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modeSelectionPopup: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: spacing.l,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  popupTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.l,
    color: colors.text.primary,
  },
  popupButtons: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  modeButton: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.hover,
    minWidth: 80,
  },
  modeButtonText: {
    ...typography.caption,
    color: colors.text.primary,
  }
});
