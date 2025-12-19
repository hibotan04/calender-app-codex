import React, { useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { colors, layout, spacing, typography } from '../theme';
import { ChevronLeft, ChevronRight, Printer, Image as ImageIcon } from 'lucide-react-native';

interface MonthlyCalendarScreenProps {
  currentDate: Date;
  entries: Record<string, { image?: string | null; text?: string }>;
  onDayPress: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrintPress: () => void;
}

export const MonthlyCalendarScreen: React.FC<MonthlyCalendarScreenProps> = ({
  currentDate,
  entries,
  onDayPress,
  onPrevMonth,
  onNextMonth,
  onPrintPress
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const gridData = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const totalSlots = 42; // 6 rows * 7 columns

    const slots = [];
    for (let i = 0; i < totalSlots; i++) {
      const day = i - firstDay + 1;
      const isCurrentMonth = day > 0 && day <= daysInMonth;
      const dateKey = `${year}-${month + 1}-${day}`;
      const entry = entries[dateKey];

      slots.push({
        day: isCurrentMonth ? day : null,
        entry: isCurrentMonth ? entry : null,
        key: i,
      });
    }
    return slots;
  }, [year, month, entries]);

  return (
    <Layout>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <View style={styles.navLeft}>
          {/* Empty view to balance layout */}
        </View>

        <View style={styles.navCenter}>
          <TouchableOpacity onPress={onPrevMonth} style={styles.navButton}>
            <ChevronLeft size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={onNextMonth} style={styles.navButton}>
            <ChevronRight size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.navRight}>
          <TouchableOpacity onPress={onPrintPress} style={styles.printButton}>
            <Printer size={16} color={colors.text.primary} />
            <Text style={styles.printLabel}>PREVIEW</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area (Paper) */}
      <View style={styles.paperContainer}>
        <View style={styles.paperHeader}>
          <Text style={styles.paperMonth}>
            {currentDate.toLocaleDateString('en-US', { month: 'long' })}
          </Text>
          <Text style={styles.paperYear}>{year}</Text>
        </View>

        <View style={styles.weekdaysRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={styles.weekdayLabel}>{d}</Text>
          ))}
        </View>

        <View style={styles.grid}>
          {gridData.map((slot) => (
            <TouchableOpacity
              key={slot.key}
              style={[
                styles.cell,
                !slot.day && styles.emptyCell,
                // If has entry, maybe subtle border change?
              ]}
              onPress={() => slot.day && onDayPress(slot.day)}
              activeOpacity={0.8}
              disabled={!slot.day}
            >
              {slot.day && (
                <>
                  <Text style={styles.dateNumber}>{slot.day}</Text>

                  {slot.entry?.image ? (
                    <Image
                      source={{ uri: slot.entry.image }}
                      style={styles.cellImage}
                      resizeMode="cover"
                    />
                  ) : slot.entry?.text ? (
                    <View style={styles.textContainer}>
                      <Text style={styles.cellText} numberOfLines={4}>
                        {slot.entry.text}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      {/* Optional placeholder icon */}
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>FRAGMENTS OF TIME — DIGITAL ARCHIVE</Text>
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
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
  navCenter: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.m },
  navRight: { flex: 1, alignItems: 'flex-end' },

  archiveLabel: { ...typography.caption, color: colors.text.primary, opacity: 0 }, // Hide but keep for layout? Or just remove text.
  // Better to just have empty view in navLeft if we want to keep center alignment.

  navButton: { padding: 12 }, // Increased padding from 4 to 12 for better touch target
  monthTitle: { ...typography.caption, fontSize: 12, color: colors.text.secondary, minWidth: 120, textAlign: 'center' },
  printButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, borderWidth: 1, borderColor: colors.text.primary },
  printLabel: { ...typography.caption, fontSize: 8 },

  paperContainer: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    // Removed margin, padding, shadow for full-screen flat look
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
    paddingHorizontal: spacing.l, // Add padding back for text
  },
  paperMonth: { ...typography.monthTitle, color: colors.text.primary },
  paperYear: { ...typography.yearTitle, color: colors.text.placeholder },

  weekdaysRow: {
    width: layout.gridWidth,
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  weekdayLabel: {
    width: layout.cellSize,
    textAlign: 'center',
    ...typography.caption,
    color: colors.text.tertiary,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: layout.gridWidth,
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: colors.gridLines,
  },
  cell: {
    width: layout.cellSize,
    height: layout.cellSize,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.gridLines,
    backgroundColor: '#FFFFFF',
  },
  emptyCell: {
    backgroundColor: colors.hover, // slightly darker for empty
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
  cellImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8, // subtle grayscale feel
  },
  textContainer: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
  },
  footer: {
    width: '100%',
    marginTop: spacing.xl,
    alignItems: 'flex-end',
    paddingRight: spacing.m,
  },
  footerText: {
    ...typography.caption,
    fontSize: 6,
    color: colors.text.placeholder,
    letterSpacing: 3,
  }
});
