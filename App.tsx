import React, { useCallback, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MonthlyCalendarScreen } from './src/screens/MonthlyCalendarScreen';
import { DailyEntryEditScreen } from './src/screens/DailyEntryEditScreen';
import { PrintPreviewScreen } from './src/screens/PrintPreviewScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

type Screen = 'Calendar' | 'Editor' | 'Print';

export default function App() {
  const [fontsLoaded] = useFonts({});
  const [currentScreen, setCurrentScreen] = useState<Screen>('Calendar');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // State for entries: Key "YYYY-M-D" -> { image: uri, text: string }
  const [entries, setEntries] = useState<Record<string, any>>({});

  const [editingDate, setEditingDate] = useState<Date>(new Date());

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || true) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayPress = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setEditingDate(newDate);
    setCurrentScreen('Editor');
  };

  const handleSaveEntry = (data: { image?: string | null; text?: string }) => {
    const year = editingDate.getFullYear();
    const month = editingDate.getMonth() + 1;
    const day = editingDate.getDate();
    const key = `${year}-${month}-${day}`;

    // Merge or replace entry
    setEntries(prev => ({
      ...prev,
      [key]: data
    }));
    setCurrentScreen('Calendar');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Calendar':
        return (
          <MonthlyCalendarScreen
            currentDate={currentDate}
            entries={entries}
            onDayPress={handleDayPress}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onPrintPress={() => setCurrentScreen('Print')}
          />
        );
      case 'Editor':
        // Find existing entry
        const key = `${editingDate.getFullYear()}-${editingDate.getMonth() + 1}-${editingDate.getDate()}`;
        const existingEntry = entries[key];

        return (
          <DailyEntryEditScreen
            date={editingDate}
            initialData={existingEntry}
            onClose={() => setCurrentScreen('Calendar')}
            onSave={handleSaveEntry}
          />
        );
      case 'Print':
        return (
          <PrintPreviewScreen
            onClose={() => setCurrentScreen('Calendar')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar barStyle="dark-content" />
        {renderScreen()}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
