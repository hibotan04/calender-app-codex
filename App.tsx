import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Trash2, Settings, Moon, Sun, FileText, Image as LucideImage, Check, Cloud, Lock, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { StatusBar } from 'expo-status-bar';
import { ActionSheetIOS, ActivityIndicator, Alert, Dimensions, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Keyboard, KeyboardAvoidingView } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useFonts } from 'expo-font';
import * as FileSystem from 'expo-file-system/legacy';
import { GestureHandlerRootView, GestureDetector, Gesture, Directions } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { DailyEntryEditScreen } from './src/screens/DailyEntryEditScreen';

// ==========================================
// ▼▼▼ CONSTANTS & TYPES ▼▼▼
const SCREEN_WIDTH = Dimensions.get('window').width;
const DIARY_FILE_URI = FileSystem.documentDirectory + 'diary_entries_v2.json';
const SETTINGS_FILE_URI = FileSystem.documentDirectory + 'app_settings.json';

const BASE_FONT_FAMILY = Platform.OS === 'ios' ? 'Georgia' : 'serif';
const DIARY_FONT_FAMILY = 'RoundedMplus1c';

type ThemeColor = 'mono' | 'linen' | 'ice' | 'azalea' | 'rose' | 'lilac';
type GridMode = 'standard' | 'sequential' | 'weekly';

interface ThemeColors {
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

// ==========================================
// ▼▼▼ USER CUSTOM PALETTE (Pastel & Dreamy) + ORIGINAL ▼▼▼
const THEMES: Record<ThemeColor, { light: ThemeColors; dark: ThemeColors }> = {
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

const THEME_OPTIONS: { key: ThemeColor; color: string }[] = [
  { key: 'mono', color: '#52525B' },   // Original
  { key: 'linen', color: '#FAEEE5' },  // Warm
  { key: 'ice', color: '#C9E6EE' },    // Blue
  { key: 'azalea', color: '#FAD1D8' }, // Pink 1
  { key: 'rose', color: '#F2C4D6' },   // Pink 2
  { key: 'lilac', color: '#DBC0E7' },  // Purple
];

// ==========================================
// ▼▼▼ DUMMY DATA START ▼▼▼
const generateInitialData = () => {
  const data: Record<string, { text: string; image: string }> = {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Create key manually to avoid syntax parser issues
  const key = `${year}-${month}-5`;

  data[key] = {
    text: "カフェで新しいラテを試した。美味しかった。",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80"
  };
  return data;
};
// ==========================================

type DynamicTextStyle = {
  fontSize: number;
  lineHeight: number;
  textAlign: 'center' | 'left';
};

const getDynamicTextStyle = (text: string): DynamicTextStyle => {
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

const DEFAULT_TEXT_STYLE: DynamicTextStyle = {
  fontSize: 10, lineHeight: 10, textAlign: 'center'
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'NicoMoji': require('./assets/fonts/NicoMoji-Regular.ttf'),
    'RoundedMplus1c': require('./assets/fonts/RoundedMplus1c-Regular.ttf'),
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  // Enhanced Entry Data Type
  const [entries, setEntries] = useState<Record<string, {
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
  }>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempText, setTempText] = useState("");
  const [tempImage, setTempImage] = useState<string | null>(null);

  // === PHOTO PICKER STATE ===
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [pickerPhotos, setPickerPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  // === SETTINGS STATES ===
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPhotoOnly, setIsPhotoOnly] = useState(false);
  const [gridMode, setGridMode] = useState<GridMode>('standard');
  const [themeColor, setThemeColor] = useState<ThemeColor>('mono');

  // Derive Colors
  const currentTheme = THEMES[themeColor] || THEMES['mono'];
  const colors = currentTheme[isDarkMode ? 'dark' : 'light'];

  const scrollViewRef = useRef<ScrollView>(null);


  // STARTUP: Load All Data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Load Diary Entries
        const entriesInfo = await FileSystem.getInfoAsync(DIARY_FILE_URI);
        if (entriesInfo.exists) {
          const content = await FileSystem.readAsStringAsync(DIARY_FILE_URI);
          setEntries(JSON.parse(content));
        } else {
          setEntries({});
        }

        // 2. Load Settings
        const settingsInfo = await FileSystem.getInfoAsync(SETTINGS_FILE_URI);
        if (settingsInfo.exists) {
          const settingsContent = await FileSystem.readAsStringAsync(SETTINGS_FILE_URI);
          const settings = JSON.parse(settingsContent);
          if (settings.isDarkMode !== undefined) setIsDarkMode(settings.isDarkMode);
          if (settings.isPhotoOnly !== undefined) setIsPhotoOnly(settings.isPhotoOnly);
          if (settings.gridMode !== undefined) setGridMode(settings.gridMode);
          if (settings.themeColor !== undefined && THEMES[settings.themeColor as ThemeColor]) setThemeColor(settings.themeColor);
        }
      } catch (e) {
        console.error("Failed to initialize app", e);
      }
    };
    initializeApp();
  }, []);

  // Persist Settings
  useEffect(() => {
    const saveSettings = async () => {
      const settings = { isDarkMode, isPhotoOnly, gridMode, themeColor };
      try {
        await FileSystem.writeAsStringAsync(SETTINGS_FILE_URI, JSON.stringify(settings));
      } catch (e) {
        console.error("Failed to save settings", e);
      }
    };
    saveSettings();
  }, [isDarkMode, isPhotoOnly, themeColor]);


  const saveEntriesToStorage = async (newEntries: Record<string, { text: string; image: string }>) => {
    try {
      await FileSystem.writeAsStringAsync(DIARY_FILE_URI, JSON.stringify(newEntries));
    } catch (e) {
      console.error("Failed to save entries to FileSystem", e);
    }
  };

  useEffect(() => {
    const eventName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const showSubscription = Keyboard.addListener(eventName, () => {
      if (isModalOpen) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    });
    return () => showSubscription.remove();
  }, [isModalOpen]);

  if (!fontsLoaded) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayPress = (day: number) => {
    const dateKey = `${year}-${month + 1}-${day}`; // Fix: 1-indexed month for display/storage
    setSelectedDate(dateKey);
    const existingEntry = entries[dateKey];
    setTempText(existingEntry?.text || "");
    setTempImage(existingEntry?.image || null);
    setIsModalOpen(true);
  };

  const handleSaveEntry = (data: any) => { // Updated to accept full data object
    if (selectedDate) {
      // Merge existing entry logic if needed, but here we replace with the new rich data
      const newEntries = {
        ...entries,
        [selectedDate]: data // 'data' now comes from DailyEntryEditScreen
      };
      setEntries(newEntries);
      saveEntriesToStorage(newEntries);
    }
    setIsModalOpen(false);
  };

  // === CUSTOM PHOTO PICKER LOGIC ===
  const handlePickImage = async () => {
    console.log("handlePickImage called, date:", selectedDate);

    if (!selectedDate) {
      Alert.alert("Error", "No date selected");
      return;
    }

    try {
      // 1. Request MediaLibrary Permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log("Permission status:", status);

      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please allow access to photos to filter by date.");
        return;
      }

      // 2. Calculate Date Range
      // selectedDate is "YYYY-M-D" (Month is 1-indexed now)
      const parts = selectedDate.split('-');
      const y = parseInt(parts[0].trim(), 10);
      const m = parseInt(parts[1].trim(), 10) - 1; // Fix: Convert back to 0-indexed for Date
      const d = parseInt(parts[2].trim(), 10);

      console.log(`Parsing date: Y=${y}, M=${m}, D=${d}`);

      if (isNaN(y) || isNaN(m) || isNaN(d)) {
        Alert.alert("Error", "Invalid date format: " + selectedDate);
        return;
      }

      const startOfDay = new Date(y, m, d, 0, 0, 0).getTime();
      const endOfDay = new Date(y, m, d, 23, 59, 59).getTime();

      setPickerLoading(true);
      setIsPhotoPickerOpen(true); // Open Picker Modal

      const assets = await MediaLibrary.getAssetsAsync({
        createdAfter: startOfDay,
        createdBefore: endOfDay,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: MediaLibrary.SortBy.creationTime,
        first: 100,
      });

      console.log("Assets found:", assets.totalCount);
      // DEBUG: Alert user exactly how many found
      if (assets.totalCount > 0) {
        // Optional: Toast or small indicator, but let's assume if >0 it renders.
        // Alert.alert("Debug", `Found ${assets.totalCount} photos`);
      } else {
        // Handled by empty component
      }
      setPickerPhotos(assets.assets);

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not load photos: " + (e instanceof Error ? e.message : String(e)));
      setIsPhotoPickerOpen(false);
    } finally {
      setPickerLoading(false);
    }
  };

  const handleSelectPhoto = async (asset: MediaLibrary.Asset) => {
    try {
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
      setTempImage(assetInfo.localUri || assetInfo.uri);
      setIsPhotoPickerOpen(false); // Close Picker
    } catch (e) {
      console.error(e);
    }
  };

  // Fallback to Standard Picker
  const handleLaunchStandardPicker = async () => {
    setIsPhotoPickerOpen(false); // Close custom picker if open
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Please allow access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    console.log("Standard picker result:", result);
    if (!result.canceled) {
      setTempImage(result.assets[0].uri);
    }
  };

  const handleDeleteImage = () => setTempImage(null);
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const togglePhotoOnly = () => setIsPhotoOnly(!isPhotoOnly);
  const changeTheme = (color: ThemeColor) => setThemeColor(color);

  const handleProFeatureClick = () => {
    Alert.alert("Premium Feature", "Backup & Sync will be available in the Pro Plan.");
  };



  // SWIPE GESTURES
  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      'worklet';
      runOnJS(nextMonth)();
    });

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      'worklet';
      runOnJS(prevMonth)();
    });

  const composedGestures = Gesture.Simultaneous(flingLeft, flingRight);


  // Helper to render a single day cell
  // Helper to render a single day cell
  const renderDayCell = (day: number, width: any, aspectRatio: number) => {
    // FIX: Match exact format: YYYY-M-D (No spaces, 1-indexed month)
    const dateKey = `${year}-${month + 1}-${day}`;
    const entry = entries[dateKey];
    const dynamicStyle = entry?.text ? getDynamicTextStyle(entry.text) : DEFAULT_TEXT_STYLE;
    const len = entry?.text?.length || 0;
    const newlines = entry?.text ? entry.text.split('\n').length - 1 : 0;
    const forceSingleLine = len <= 7 && newlines === 0;

    // Custom Styles for Grid Modes
    const isLargeGrid = gridMode === 'sequential' || gridMode === 'weekly';
    const hasImage = !!entry?.image;

    // Date Logic
    // 1. Color: If Photo exists, always White + Shadow (for all modes)
    // 2. Size: Larger (13px) only for Sequential/Weekly modes
    const useWhiteDate = hasImage;

    const baseDateStyle = isLargeGrid ? { fontSize: 13, top: 2, left: 4 } : {};
    const colorDateStyle = useWhiteDate
      ? { color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }
      : { color: colors.subText };

    const dateNumStyle = { ...baseDateStyle, ...colorDateStyle };

    // Text Logic
    // Larger text only for Sequential/Weekly modes
    // Weekly (4-col) gets even larger text than Sequential (6-col)
    const isWeekly = gridMode === 'weekly';
    const sizeBoost = isWeekly ? 2.5 : (isLargeGrid ? 1 : 0);

    const textFontSize = dynamicStyle.fontSize + sizeBoost;
    const textLineHeight = dynamicStyle.lineHeight + sizeBoost;

    return (
      <TouchableOpacity key={day} onPress={() => handleDayPress(day)} style={[styles.cell, { width: width, backgroundColor: colors.cellBg, borderColor: colors.border, aspectRatio: aspectRatio }]} activeOpacity={0.7}>
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

  const renderCalendarDays = () => {
    const days: any[] = [];

    // Adjust aspect ratio based on mode
    let cellAspectRatio = isPhotoOnly ? 1 : 0.60;
    if (gridMode === 'weekly' && !isPhotoOnly) {
      cellAspectRatio = 0.70; // Shorter vertical height (taller rectangle -> wider rectangle logic: width/height. Higher = less height for same width.)
    }

    // === 1. STANDARD MODE (7 Cols, Weekday Padding) ===
    if (gridMode === 'standard') {
      const cellWidth = '14.285%'; // 100% / 7
      for (let i = 0; i < firstDay; i++) {
        days.push(<View key={`empty - ${i} `} style={[styles.cell, { width: cellWidth, backgroundColor: colors.cellBg, borderColor: colors.border, aspectRatio: cellAspectRatio }]} />);
      }
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(renderDayCell(day, cellWidth, cellAspectRatio));
      }
      // Trailing Padding
      const totalCells = days.length;
      const remainingInRow = (7 - (totalCells % 7)) % 7;
      if (remainingInRow > 0) {
        for (let i = 0; i < remainingInRow; i++) {
          days.push(<View key={`empty - end - ${i} `} style={[styles.cell, { width: cellWidth, backgroundColor: colors.cellBg, borderColor: colors.border, aspectRatio: cellAspectRatio }]} />);
        }
      }
    }
    // === 2. SEQUENTIAL MODE (6 Cols, No Padding) ===
    else if (gridMode === 'sequential') {
      const cellWidth = '16.666%'; // 100% / 6
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(renderDayCell(day, cellWidth, cellAspectRatio));
      }
      // Trailing Padding
      const totalCells = days.length;
      const remainingInRow = (6 - (totalCells % 6)) % 6;
      if (remainingInRow > 0) {
        for (let i = 0; i < remainingInRow; i++) {
          days.push(<View key={`empty - end - ${i} `} style={[styles.cell, { width: cellWidth, backgroundColor: colors.cellBg, borderColor: colors.border, aspectRatio: cellAspectRatio }]} />);
        }
      }
    }
    // === 3. WEEKLY MODE (4 Cols, 4x2 per week) ===
    else if (gridMode === 'weekly') {
      const cellWidth = '25%'; // 100% / 4

      let currentDay = 1;
      let weekCount = 1;

      while (currentDay <= daysInMonth) {
        // A. Week Label Grid Item
        days.push(
          <View key={`week - label - ${weekCount} `} style={[styles.cell, { width: cellWidth, backgroundColor: colors.weekText, borderColor: colors.border, aspectRatio: cellAspectRatio, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontFamily: BASE_FONT_FAMILY, color: colors.bg, fontWeight: 'bold' }}>Week {weekCount}</Text>
          </View>
        );

        // B. Add 7 Days (or fewer if end of month)
        for (let i = 0; i < 7; i++) {
          if (currentDay <= daysInMonth) {
            days.push(renderDayCell(currentDay, cellWidth, cellAspectRatio));
            currentDay++;
          } else {
            // Empty slot filler
            days.push(<View key={`empty - week - ${weekCount} -${i} `} style={[styles.cell, { width: cellWidth, backgroundColor: colors.cellBg, borderColor: colors.border, aspectRatio: cellAspectRatio }]} />);
          }
        }
        weekCount++;
      }
    }

    return days;
  };



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={colors.bg} />
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>

          {/* 
                   WRAPPER FOR CAPTURE 
                   We capture everything inside this view.
                */}
          <View style={{ flex: 1, backgroundColor: colors.bg }}>

            {/* Header (Arrows Removed) */}
            <View style={[styles.header, { borderBottomColor: colors.border, justifyContent: 'center' }]}>
              <View style={styles.headerTitleContainer}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  {currentDate.toLocaleString('en-US', { month: 'long' })}
                </Text>
                <Text style={[styles.headerYear, { color: colors.subText }]}>{year}</Text>
              </View>
            </View>

            {/* Week Row (Only for Standard Mode) */}
            {gridMode === 'standard' && (
              <View style={styles.weekRow}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, idx) => (
                  <Text key={day} style={[styles.weekText, { color: idx === 0 ? colors.sundayText : colors.weekText }]}>
                    {day}
                  </Text>
                ))}
              </View>
            )}

            {/* Calendar Grid with Swiping */}
            <GestureDetector gesture={composedGestures}>
              <View style={{ flex: 1 }}>
                <ScrollView
                  style={[styles.gridScroll, { backgroundColor: colors.bg }]}
                  contentContainerStyle={[styles.gridContainer, { borderColor: colors.border }]}
                >
                  {renderCalendarDays()}
                </ScrollView>
              </View>
            </GestureDetector>
          </View>

          {/* Settings Menu Expansion */}
          {isSettingsOpen && (
            <View style={[styles.settingsMenu, { bottom: 100 }]}>


              {/* 1. Feature Toggles */}
              <TouchableOpacity onPress={() => {
                if (gridMode === 'standard') setGridMode('sequential');
                else if (gridMode === 'sequential') setGridMode('weekly');
                else setGridMode('standard');
              }} style={[styles.menuItem, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
                <View style={{ width: 20 }}><Check size={20} color={gridMode !== 'standard' ? colors.activeMenu : 'transparent'} /></View>
                <Text style={[styles.menuText, { color: colors.text }]}>
                  Layout: {gridMode === 'standard' ? 'Standard' : gridMode === 'sequential' ? 'Sequential (6x6)' : 'Weekly (4x2)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={togglePhotoOnly} style={[styles.menuItem, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
                {isPhotoOnly ? <FileText size={20} color={colors.activeMenu} /> : <LucideImage size={20} color={colors.text} />}
                <Text style={[styles.menuText, { color: colors.text }]}>{isPhotoOnly ? "Show Text" : "Photo Only"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleDarkMode} style={[styles.menuItem, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
                {isDarkMode ? <Sun size={20} color={colors.activeMenu} /> : <Moon size={20} color={colors.text} />}
                <Text style={[styles.menuText, { color: colors.text }]}>{isDarkMode ? "Light Mode" : "Dark Mode"}</Text>
              </TouchableOpacity>

              {/* 2. Color Picker */}
              <View style={[styles.colorPickerRow, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
                {THEME_OPTIONS.map((theme) => (
                  <TouchableOpacity
                    key={theme.key}
                    onPress={() => changeTheme(theme.key)}
                    style={[styles.colorOption, { backgroundColor: theme.color }]}
                  >
                    {themeColor === theme.key && <Check size={12} color="#FFFFFF" />}
                  </TouchableOpacity>
                ))}
              </View>

              {/* 3. PRO Features Placeholder */}
              <View style={[styles.proSection, { backgroundColor: colors.inputBg }]}>
                <Text style={[styles.proHeader, { color: colors.subText }]}>PREMIUM FEATURES</Text>

                <TouchableOpacity onPress={handleProFeatureClick} style={[styles.proItem, { backgroundColor: colors.modalBg, borderColor: colors.border, opacity: 0.7 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Cloud size={20} color={colors.subText} />
                    <Text style={[styles.menuText, { color: colors.subText }]}>Cloud Backup</Text>
                  </View>
                  <Lock size={14} color={colors.subText} />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleProFeatureClick} style={[styles.proItem, { backgroundColor: colors.modalBg, borderColor: colors.border, opacity: 0.7 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <User size={20} color={colors.subText} />
                    <Text style={[styles.menuText, { color: colors.subText }]}>Account Sync</Text>
                  </View>
                  <Lock size={14} color={colors.subText} />
                </TouchableOpacity>
              </View>

            </View>
          )}

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.modalBg, borderColor: colors.border }]}
            onPress={toggleSettings}
            activeOpacity={0.8}
          >
            {isSettingsOpen ? <X size={24} color={colors.text} /> : <Settings size={24} color={colors.text} />}
          </TouchableOpacity>

          {/* === DIARY ENTRY MODAL (With Embedded Photo Picker) === */}
          <Modal
            visible={isModalOpen}
            animationType="slide" // Better for full screen
            onRequestClose={() => setIsModalOpen(false)}
          >
            {/* Render the Full Screen Canvas Editor if a date is selected */}
            {selectedDate && (
              <DailyEntryEditScreen
                date={new Date(selectedDate)} // selectedDate string YYYY-MM-DD to Date
                initialData={entries[selectedDate]}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEntry}
              />
            )}
          </Modal>

        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 24, fontFamily: BASE_FONT_FAMILY, letterSpacing: 2, textTransform: 'uppercase' },
  headerYear: { fontSize: 12, fontFamily: BASE_FONT_FAMILY, letterSpacing: 2, marginTop: 4 },

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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  modalScrollContent: { flexGrow: 1, padding: 24, paddingTop: 80, paddingBottom: 350 },
  modalContent: { borderRadius: 16, padding: 24, paddingBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalDateTitle: { fontSize: 20, fontFamily: BASE_FONT_FAMILY, letterSpacing: 1 },
  modalDateMonth: { fontSize: 14, textTransform: 'uppercase' },
  closeBtn: { padding: 8, borderRadius: 999 },
  imageSection: { marginBottom: 16, position: 'relative' },
  imageUploadBox: { width: '100%', aspectRatio: 1, borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  uploadedImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { fontSize: 12 },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
  badge: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '500' },
  deleteImageBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(239, 68, 68, 0.9)', borderRadius: 999, padding: 8, zIndex: 10 },
  inputContainer: { marginBottom: 24 },
  textInput: { borderRadius: 6, padding: 12, fontSize: 14, fontFamily: BASE_FONT_FAMILY, height: 60, textAlignVertical: 'top' },
  charCount: { textAlign: 'right', fontSize: 10, marginTop: 4 },
  modalSaveBtn: { width: '100%', paddingVertical: 12, alignItems: 'center', borderRadius: 4 },
  modalSaveBtnText: { fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '500' },

  fab: { position: 'absolute', bottom: 40, right: 24, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 6, borderWidth: 1 },
  settingsMenu: { position: 'absolute', bottom: 100, right: 24, alignItems: 'flex-end' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, minWidth: 140, justifyContent: 'space-between' },
  menuText: { fontSize: 12, fontWeight: '500', marginLeft: 8, fontFamily: BASE_FONT_FAMILY },

  colorPickerRow: { flexDirection: 'row', padding: 8, borderRadius: 8, borderWidth: 1, marginBottom: 12, gap: 8, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  colorOption: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // New Styles for PRO Features
  proSection: { marginTop: 8, padding: 8, borderRadius: 8, minWidth: 140 },
  proHeader: { fontSize: 10, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  proItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginBottom: 6, borderWidth: 1 },
});
