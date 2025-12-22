import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { ThemeColors, GridMode, DiaryEntry } from '../types';
import { getDynamicTextStyle, DEFAULT_TEXT_STYLE } from '../utils/textUtils';

const BASE_FONT_FAMILY = Platform.OS === 'ios' ? 'Georgia' : 'serif';
const DIARY_FONT_FAMILY = 'RoundedMplus1c';

interface CalendarGridProps {
  currentDate: Date;
  entries: Record<string, DiaryEntry>;
  colors: ThemeColors;
  gridMode: GridMode;
  isPhotoOnly: boolean;
  onDayPress: (day: number) => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  entries,
  colors,
  gridMode,
  isPhotoOnly,
  onDayPress,
  onSwipeLeft,
  onSwipeRight
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Swipes
  const flingLeft = Gesture.Fling().direction(Directions.LEFT).onEnd(() => runOnJS(onSwipeLeft)());
  const flingRight = Gesture.Fling().direction(Directions.RIGHT).onEnd(() => runOnJS(onSwipeRight)());
  const composedGestures = Gesture.Simultaneous(flingLeft, flingRight);

  // Render Logic
  const renderDayCell = (day: number, width: any, aspectRatio: number) => {
    const dateKey = `${year}-${month + 1}-${day}`;
    const entry = entries[dateKey];
    const dynamicStyle = entry?.text ? getDynamicTextStyle(entry.text) : DEFAULT_TEXT_STYLE;
    const len = entry?.text?.length || 0;
    const newlines = entry?.text ? entry.text.split('\n').length - 1 : 0;
    const forceSingleLine = len <= 7 && newlines === 0;

    const isLargeGrid = gridMode === 'sequential' || gridMode === 'weekly';
    const hasImage = !!entry?.image;
    const useWhiteDate = hasImage;

    const baseDateStyle = isLargeGrid ? { fontSize: 13, top: 2, left: 4 } : {};
    const colorDateStyle = useWhiteDate
      ? { color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }
      : { color: colors.subText };

    const dateNumStyle = { ...baseDateStyle, ...colorDateStyle };

    const isWeekly = gridMode === 'weekly';
    const sizeBoost = isWeekly ? 2.5 : (isLargeGrid ? 1 : 0);
    const textFontSize = dynamicStyle.fontSize + sizeBoost;
    const textLineHeight = dynamicStyle.lineHeight + sizeBoost;

    return (
      <TouchableOpacity
        key={day}
        onPress={() => onDayPress(day)}
        style={[styles.cell, { width: width, backgroundColor: colors.cellBg, borderColor: colors.border, aspectRatio: aspectRatio }]}
        activeOpacity={0.7}
      >
        <Text style={[styles.dateNumber, dateNumStyle]}>{day}</Text>
        <View style={[styles.imageArea, { backgroundColor: colors.placeholder }]}>
          {entry?.image ? (
            <ExpoImage
              source={{ uri: entry.image }}
              style={styles.cellImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : <View style={styles.placeholderContainer} />}
        </View>
        {!isPhotoOnly && (
          <View style={styles.textArea}>
            {entry?.text ? (
              <Text style={[styles.cellText, { fontSize: textFontSize, lineHeight: textLineHeight, textAlign: 'center', color: colors.text }]}
                numberOfLines={forceSingleLine ? 1 : undefined} adjustsFontSizeToFit={forceSingleLine} minimumFontScale={0.5}>
                {entry.text}
              </Text>
            ) : null}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCells = () => {
    const days: any[] = [];
    let cellAspectRatio = isPhotoOnly ? 1 : 0.60;
    if (gridMode === 'weekly' && !isPhotoOnly) {
      cellAspectRatio = 0.70;
    }

    if (gridMode === 'standard') {
      const cellWidth = '14.285%';
      for (let i = 0; i < firstDay; i++) {
        days.push(<View key={`empty-${i}`} style={[styles.cell, { width: cellWidth, backgroundColor: colors.cellBg, borderColor: colors.border, aspectRatio: cellAspectRatio }]} />);
      }
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(renderDayCell(day, cellWidth, cellAspectRatio));
      }
      // Trailing
      const totalCells = days.length;
      const remainingInRow = (7 - (totalCells % 7)) % 7;
      if (remainingInRow > 0) {
        for (let i = 0; i < remainingInRow; i++) {
          days.push(<View key={`empty-end-${i}`} style={[styles.cell, { width: cellWidth, backgroundColor: colors.cellBg, borderColor: colors.border, aspectRatio: cellAspectRatio }]} />);
        }
      }
    }
    else if (gridMode === 'sequential') {
      const cellWidth = '16.666%';
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(renderDayCell(day, cellWidth, cellAspectRatio));
      }
      // Trailing
      const totalCells = days.length;
      const remainingInRow = (6 - (totalCells % 6)) % 6;
      if (remainingInRow > 0) {
        for (let i = 0; i < remainingInRow; i++) {
          days.push(<View key={`empty-end-${i}`} style={[styles.cell, { width: cellWidth, backgroundColor: colors.cellBg, borderColor: colors.border, aspectRatio: cellAspectRatio }]} />);
        }
      }
    }
    else if (gridMode === 'weekly') {
      const cellWidth = '25%';
      let currentDay = 1;
      let weekCount = 1;
      while (currentDay <= daysInMonth) {
        days.push(
          <View key={`week-label-${weekCount}`} style={[styles.cell, { width: cellWidth, backgroundColor: colors.weekText, borderColor: colors.border, aspectRatio: cellAspectRatio, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontFamily: BASE_FONT_FAMILY, color: colors.bg, fontWeight: 'bold' }}>Week {weekCount}</Text>
          </View>
        );
        for (let i = 0; i < 7; i++) {
          if (currentDay <= daysInMonth) {
            days.push(renderDayCell(currentDay, cellWidth, cellAspectRatio));
            currentDay++;
          } else {
            days.push(<View key={`empty-week-${weekCount}-${i}`} style={[styles.cell, { width: cellWidth, backgroundColor: colors.cellBg, borderColor: colors.border, aspectRatio: cellAspectRatio }]} />);
          }
        }
        weekCount++;
      }
    }
    return days;
  };

  return (
    <GestureDetector gesture={composedGestures}>
      <View style={{ flex: 1 }}>
        {/* Week Row (Standard Only) */}
        {gridMode === 'standard' && (
          <View style={styles.weekRow}>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, idx) => (
              <Text key={day} style={[styles.weekText, { color: idx === 0 ? colors.sundayText : colors.weekText }]}>
                {day}
              </Text>
            ))}
          </View>
        )}
        <ScrollView
          style={[styles.gridScroll, { backgroundColor: colors.bg }]}
          contentContainerStyle={[styles.gridContainer, { borderColor: colors.border }]}
        >
          {renderCells()}
        </ScrollView>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  weekRow: { flexDirection: 'row', paddingBottom: 8 },
  weekText: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  gridScroll: { flex: 1 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1 },
  cell: { width: '14.28%', borderRightWidth: 1, borderBottomWidth: 1, padding: 0 },
  dateNumber: { position: 'absolute', top: 2, left: 3, fontSize: 9, fontFamily: BASE_FONT_FAMILY, zIndex: 10 },
  imageArea: { width: '100%', aspectRatio: 1, overflow: 'hidden' },
  cellImage: { width: '100%', height: '100%' },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  textArea: { flex: 1, width: '100%', paddingHorizontal: 0, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  cellText: { width: '100%', fontFamily: DIARY_FONT_FAMILY },
});
