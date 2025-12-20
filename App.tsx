import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Modal, Image, Alert, Dimensions, Platform, StatusBar, TextInput, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Camera, ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFonts } from 'expo-font';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ==========================================
// ▼▼▼ フォント変更設定 ▼▼▼
// 全体のフォント（日付など）
const BASE_FONT_FAMILY = Platform.OS === 'ios' ? 'Georgia' : 'serif';

// ★日記のテキストだけのフォント★
const DIARY_FONT_FAMILY = 'RoundedMplus1c';
// ==========================================

// Dummy Data Generation
const generateInitialData = () => {
  const data: Record<string, { text: string; image: string }> = {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  data[`${year}-${month}-5`] = {
    text: "カフェで新しいラテを試した。美味しかった。",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80"
  };
  data[`${year}-${month}-12`] = {
    text: "久しぶりのショッピング。良い靴に出会えた。",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80"
  };
  data[`${year}-${month}-15`] = {
    text: "今日は非常に長い一日でしたが、何とか乗り切ることができました。明日も頑張りましょう。",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80"
  };
  return data;
};

type DynamicTextStyle = {
  fontSize: number;
  lineHeight: number;
};

// Helper to determine text style based on length and newlines
const getDynamicTextStyle = (text: string): DynamicTextStyle => {
  const len = text.length;
  const newlines = text.split('\n').length - 1;

  // If there are many explicit newlines, force smaller size immediately
  if (newlines >= 3) {
    return { fontSize: 5, lineHeight: 6.5 };
  }
  if (newlines >= 2) {
    return { fontSize: 6.5, lineHeight: 8 };
  }

  if (len <= 6) {
    return { fontSize: 13, lineHeight: 18 };
  }
  else if (len <= 16) {
    return { fontSize: 9, lineHeight: 12 };
  }
  else if (len <= 25) {
    return { fontSize: 7, lineHeight: 10 };
  }
  else {
    return { fontSize: 6, lineHeight: 8 };
  }
};

const DEFAULT_TEXT_STYLE: DynamicTextStyle = {
  fontSize: 10, lineHeight: 10
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'NicoMoji': require('./assets/fonts/NicoMoji-Regular.ttf'),
    'RoundedMplus1c': require('./assets/fonts/RoundedMplus1c-Regular.ttf'),
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState(generateInitialData());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempText, setTempText] = useState("");
  const [tempImage, setTempImage] = useState<string | null>(null);

  // Ref for the modal scroll view
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    /* 
       Optimized Scroll Behavior V4:
       - Use 'keyboardWillShow' (iOS) / 'keyboardDidShow' (Android).
       - Huge padding bottom in styles guarantees scroll track length.
       - Offset removed to 0 to prevent gaps.
    */
    const eventName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

    // We scroll smoothly to the 'end' - the massive padding ensures the 'end' is far below the button.
    const showSubscription = Keyboard.addListener(eventName, () => {
      if (isModalOpen) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    });

    return () => {
      showSubscription.remove();
    };
  }, [isModalOpen]);

  if (!fontsLoaded) {
    return null;
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDayPress = (day: number) => {
    const dateKey = `${year}-${month}-${day}`;
    setSelectedDate(dateKey);
    const existingEntry = entries[dateKey];
    setTempText(existingEntry?.text || "");
    setTempImage(existingEntry?.image || null);
    setIsModalOpen(true);
  };

  const handleSaveEntry = () => {
    if (selectedDate) {
      setEntries(prev => ({
        ...prev,
        [selectedDate]: { text: tempText, image: tempImage || '' }
      }));
    }
    setIsModalOpen(false);
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Please allow access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setTempImage(result.assets[0].uri);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={[styles.cell, styles.emptyCell]} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month}-${day}`;
      const entry = entries[dateKey];
      const dynamicStyle = entry?.text ? getDynamicTextStyle(entry.text) : DEFAULT_TEXT_STYLE;

      days.push(
        <TouchableOpacity
          key={day}
          onPress={() => handleDayPress(day)}
          style={styles.cell}
          activeOpacity={0.7}
        >
          <Text style={styles.dateNumber}>{day}</Text>
          <View style={styles.imageArea}>
            {entry?.image ? (
              <Image source={{ uri: entry.image }} style={styles.cellImage} resizeMode="cover" />
            ) : (
              <View style={styles.placeholderContainer}>
                <Camera size={12} color="#E5E7EB" />
              </View>
            )}
          </View>

          {/* Text Area */}
          <View style={styles.textArea}>
            {entry?.text ? (
              <Text
                style={[
                  styles.cellText,
                  {
                    fontSize: dynamicStyle.fontSize,
                    lineHeight: dynamicStyle.lineHeight,
                  }
                ]}
              >
                {entry.text}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    }

    const totalCells = days.length;
    const remainingInRow = (7 - (totalCells % 7)) % 7;
    if (remainingInRow > 0) {
      for (let i = 0; i < remainingInRow; i++) {
        days.push(<View key={`empty-end-${i}`} style={[styles.cell, styles.emptyCell]} />);
      }
    }

    return days;
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <ChevronLeft size={24} color="#4B5563" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {currentDate.toLocaleString('en-US', { month: 'long' })}
            </Text>
            <Text style={styles.headerYear}>{year}</Text>
          </View>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <ChevronRight size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, idx) => (
            <Text key={day} style={[styles.weekText, idx === 0 ? styles.textRed : styles.textGray]}>
              {day}
            </Text>
          ))}
        </View>

        <ScrollView style={styles.gridScroll} contentContainerStyle={styles.gridContainer}>
          {renderCalendarDays()}
        </ScrollView>

        <Modal
          visible={isModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
            keyboardVerticalOffset={0}
          >
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalDateTitle}>
                      {selectedDate ? new Date(selectedDate).getDate() : ''}
                      <Text style={styles.modalDateMonth}>
                        {' '}{selectedDate ? new Date(selectedDate).toLocaleString('en-US', { month: 'short' }) : ''}
                      </Text>
                    </Text>
                    <Text style={styles.modalSubtitle}>EDIT DIARY</Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                    <X size={20} color="#374151" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.imageUploadBox} onPress={handlePickImage} activeOpacity={0.8}>
                  {tempImage ? (
                    <>
                      <Image source={{ uri: tempImage }} style={styles.uploadedImage} resizeMode="cover" />
                      <View style={styles.imageOverlay}>
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>Change Photo</Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={32} color="#D1D5DB" style={{ marginBottom: 8 }} />
                      <Text style={styles.uploadPlaceholder}>Tap to add photo</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={tempText}
                    onChangeText={(text) => setTempText(text)}
                    placeholder="今日はどんな1日でしたか？"
                    placeholderTextColor="#9CA3AF"
                    multiline={true}
                    blurOnSubmit={false}
                    returnKeyType="default"
                    maxLength={40}
                  />
                  <Text style={styles.charCount}>{tempText.length}/40</Text>
                </View>

                <TouchableOpacity onPress={handleSaveEntry} style={styles.modalSaveBtn}>
                  <Text style={styles.modalSaveBtnText}>SAVE ENTRY</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  navBtn: { padding: 8, borderRadius: 999, backgroundColor: 'transparent' },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 24, fontFamily: BASE_FONT_FAMILY, letterSpacing: 2, textTransform: 'uppercase', color: '#1F2937' },
  headerYear: { fontSize: 12, fontFamily: BASE_FONT_FAMILY, letterSpacing: 2, color: '#9CA3AF', marginTop: 4 },

  weekRow: { flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 0 },
  weekText: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  textRed: { color: '#F87171' },
  textGray: { color: '#D1D5DB' },

  gridScroll: { flex: 1, backgroundColor: '#FFFFFF' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderColor: '#F3F4F6' },

  cell: {
    width: '14.28%',
    aspectRatio: 0.60,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    padding: 0,
  },
  emptyCell: { backgroundColor: '#FFFFFF' },
  dateNumber: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: 9,
    fontFamily: BASE_FONT_FAMILY,
    color: '#9CA3AF',
    zIndex: 10,
  },
  imageArea: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  cellImage: { width: '100%', height: '100%' },
  placeholderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  textArea: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cellText: {
    fontFamily: DIARY_FONT_FAMILY,
    color: '#4B5563',
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 350, // Massive padding to force content up
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalDateTitle: {
    fontSize: 20,
    fontFamily: BASE_FONT_FAMILY,
    letterSpacing: 1,
  },
  modalDateMonth: { fontSize: 14, color: '#9CA3AF', textTransform: 'uppercase' },
  modalSubtitle: { fontSize: 10, color: '#9CA3AF', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 },
  closeBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 999 },

  imageUploadBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  uploadedImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { fontSize: 12, color: '#9CA3AF' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '500' },

  inputContainer: { marginBottom: 24 },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    fontFamily: BASE_FONT_FAMILY,
    height: 60,
    textAlignVertical: 'top',
    color: '#1F2937'
  },
  charCount: { textAlign: 'right', fontSize: 10, color: '#9CA3AF', marginTop: 4 },

  modalSaveBtn: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    borderRadius: 4,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  }
});
