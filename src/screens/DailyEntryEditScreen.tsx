import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { colors, layout, spacing, typography } from '../theme';
import { Image as ImageIcon, Type, Check, X, Trash2, Maximize2, RotateCw, Contrast, Sun, Moon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

interface DailyEntryEditScreenProps {
  date: Date;
  initialData?: {
    image?: string | null;
    text?: string;
    // Persisted transforms
    imgScale?: number;
    imgX?: number;
    imgY?: number;
    imgRotation?: number; // Radians
    textX?: number;
    textY?: number;
    textScale?: number;
    textColor?: string;
    dateColor?: string;
    // Filter
    filterColor?: 'none' | 'black' | 'white';
    filterOpacity?: number;
  };
  onClose: () => void;
  onSave: (data: any) => void;
  initialMode?: 'photo' | 'text';
}

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - (spacing.l * 2);
const SCALE_FACTOR = CANVAS_SIZE / layout.cellSize;

// Simple Slider Component
const SimpleSlider = ({ value, onValueChange, width = 200 }: { value: number, onValueChange: (v: number) => void, width?: number }) => {
  // Value is 0..1
  const x = useSharedValue(value * width);

  const gesture = Gesture.Pan()
    .onUpdate(e => {
      let newX = e.x;
      if (newX < 0) newX = 0;
      if (newX > width) newX = width;
      x.value = newX;
      runOnJS(onValueChange)(newX / width);
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }]
  }));

  // Update knob if external value changes (simplified, assuming mainly controlled by gesture)
  useEffect(() => {
    x.value = value * width;
  }, [value]);

  return (
    <View style={{ width: width + 20, height: 40, justifyContent: 'center', alignItems: 'center' }}>
      <GestureDetector gesture={gesture}>
        <View style={{ width: width + 20, height: 30, justifyContent: 'center' }}>
          <View style={{ width: width, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, marginLeft: 10 }}>
            <Animated.View style={[{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF', position: 'absolute', top: -8, left: -10 }, knobStyle]} />
          </View>
        </View>
      </GestureDetector>
    </View>
  );
};

export const DailyEntryEditScreen: React.FC<DailyEntryEditScreenProps> = ({
  date,
  initialData,
  onClose,
  onSave,
  initialMode
}) => {
  const [imageUri, setImageUri] = useState<string | null>(initialData?.image || null);
  const [text, setText] = useState<string>(initialData?.text || '');
  const [textColor, setTextColor] = useState<string>(initialData?.textColor || '#FFF');
  const [dateColor, setDateColor] = useState<string>(initialData?.dateColor || colors.text.tertiary);
  const [activeMode, setActiveMode] = useState<'photo' | 'text' | 'none'>('none');
  const [isEditingTextContent, setIsEditingTextContent] = useState(false);

  // Filter State
  const [filterColor, setFilterColor] = useState<'none' | 'black' | 'white'>(initialData?.filterColor || 'none');
  const [filterOpacity, setFilterOpacity] = useState<number>(initialData?.filterOpacity || 0.3);

  // Initialize active mode based on data or requested mode
  useEffect(() => {
    if (initialMode && (!initialData || (!initialData.image && !initialData.text))) {
      // If explicitly requested (from calendar popup) and no existing complex data
      setActiveMode(initialMode);
      if (initialMode === 'photo') {
        handlePickImage();
      } else if (initialMode === 'text') {
        setIsEditingTextContent(true);
      }
    } else {
      // Default behavior based on existing content
      if (!initialData) {
        setActiveMode('none');
      } else if (initialData.image && !initialData.text) {
        setActiveMode('photo');
      } else {
        setActiveMode('text');
      }
    }
  }, []);

  // --- Image Gestures ---
  const imgScale = useSharedValue(initialData?.imgScale || 1);
  const imgSavedScale = useSharedValue(initialData?.imgScale || 1);
  const imgX = useSharedValue(initialData?.imgX || 0);
  const imgY = useSharedValue(initialData?.imgY || 0);
  const imgSavedX = useSharedValue(initialData?.imgX || 0);
  const imgSavedY = useSharedValue(initialData?.imgY || 0);
  // NEW: Rotation
  const imgRotation = useSharedValue(initialData?.imgRotation || 0);
  const imgSavedRotation = useSharedValue(initialData?.imgRotation || 0);

  const imgPanGesture = Gesture.Pan()
    .enabled(activeMode === 'photo')
    .onUpdate((e) => {
      imgX.value = imgSavedX.value + e.translationX;
      imgY.value = imgSavedY.value + e.translationY;
    })
    .onEnd(() => {
      imgSavedX.value = imgX.value;
      imgSavedY.value = imgY.value;
    });

  const imgPinchGesture = Gesture.Pinch()
    .enabled(activeMode === 'photo')
    .onUpdate((e) => {
      imgScale.value = imgSavedScale.value * e.scale;
    })
    .onEnd(() => {
      imgSavedScale.value = imgScale.value;
    });

  const imgRotationGesture = Gesture.Rotation()
    .enabled(activeMode === 'photo')
    .onUpdate((e) => {
      imgRotation.value = imgSavedRotation.value + e.rotation;
    })
    .onEnd(() => {
      imgSavedRotation.value = imgRotation.value;
    });

  const imgComposedGesture = Gesture.Simultaneous(imgPanGesture, imgPinchGesture, imgRotationGesture);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: imgX.value },
      { translateY: imgY.value },
      { scale: imgScale.value },
      { rotate: `${imgRotation.value}rad` }
    ],
  }));

  // --- Text Gestures ---
  const txtX = useSharedValue(initialData?.textX || 0);
  const txtY = useSharedValue(initialData?.textY || 0);
  const txtSavedX = useSharedValue(initialData?.textX || 0);
  const txtSavedY = useSharedValue(initialData?.textY || 0);
  const txtScale = useSharedValue(initialData?.textScale || 0.4); // Initial scale 0.4 due to large font
  const txtSavedScale = useSharedValue(initialData?.textScale || 0.4);

  const txtPanGesture = Gesture.Pan()
    .enabled(activeMode === 'text')
    .onUpdate((e) => {
      txtX.value = txtSavedX.value + e.translationX;
      txtY.value = txtSavedY.value + e.translationY;
    })
    .onEnd(() => {
      txtSavedX.value = txtX.value;
      txtSavedY.value = txtY.value;
    });

  const txtPinchGesture = Gesture.Pinch()
    .enabled(activeMode === 'text')
    .onUpdate((e) => {
      txtScale.value = txtSavedScale.value * e.scale;
    })
    .onEnd(() => {
      txtSavedScale.value = txtScale.value;
    });

  const txtTapGesture = Gesture.Tap()
    .enabled(activeMode === 'text')
    .onEnd(() => {
      runOnJS(setIsEditingTextContent)(true);
    });

  const txtComposedGesture = Gesture.Race(txtTapGesture, Gesture.Simultaneous(txtPanGesture, txtPinchGesture));

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: txtX.value },
      { translateY: txtY.value },
      { scale: txtScale.value },
    ],
  }));


  // --- Logic ---
  const dayNumber = date.getDate();

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // We do custom editing
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setActiveMode('photo');
    }
  };

  const handleSave = () => {
    onSave({
      image: imageUri,
      text: text,
      imgScale: imgScale.value,
      imgX: imgX.value,
      imgY: imgY.value,
      imgRotation: imgRotation.value,
      textX: txtX.value,
      textY: txtY.value,
      textScale: txtScale.value,
      textColor: textColor,
      dateColor: dateColor,
      filterColor: filterColor,
      filterOpacity: filterOpacity,
    });
  };

  const toggleDateColor = () => {
    if (dateColor === colors.text.tertiary) {
      setDateColor('#FFFFFF');
    } else if (dateColor === '#FFFFFF') {
      setDateColor('#000000');
    } else {
      setDateColor(colors.text.tertiary);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Layout>
        <Header
          title="Edit Entry"
          showBack={false}
          leftIcon={<X size={24} color={colors.text.primary} />}
          onLeftPress={onClose}
          rightIcon={<Check size={24} color={colors.text.primary} />}
          onRightPress={handleSave}
        />


        <View style={styles.content}>

          {/* --- CANVAS AREA --- */}
          <View style={styles.canvasContainer}>
            <View style={styles.canvas}>

              {/* Layer 0: Image Placeholder / Selector */}
              {!imageUri && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Start by selecting a mode below</Text>
                </View>
              )}

              {/* Layer 1: Image */}
              {imageUri && (
                <GestureDetector gesture={imgComposedGesture}>
                  <Animated.Image
                    source={{ uri: imageUri }}
                    style={[styles.imageLayer, animatedImageStyle]}
                    resizeMode="cover"
                  />
                </GestureDetector>
              )}

              {/* NEW: Filter Overlay */}
              {imageUri && filterColor !== 'none' && (
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      backgroundColor: filterColor === 'black' ? '#000' : '#FFF',
                      opacity: filterOpacity,
                      pointerEvents: 'none'
                    }
                  ]}
                />
              )}

              {/* Layer 2: Date Overlay (Toggle Color) */}
              <TouchableOpacity style={styles.dateOverlay} onPress={toggleDateColor} activeOpacity={0.8}>
                <Text style={[styles.dateText, { color: dateColor }]}>{dayNumber}</Text>
              </TouchableOpacity>

              {/* Layer 3: Text */}
              {text ? (
                <Animated.View style={[styles.textLayer]} pointerEvents="none">
                  <Animated.View style={animatedTextStyle}>
                    <Text style={[styles.diaryText, { color: textColor }]}>{text}</Text>
                  </Animated.View>
                </Animated.View>
              ) : null}

              {/* Layer 4: Text Gestures Overlay */}
              {activeMode === 'text' && (
                <GestureDetector gesture={txtComposedGesture}>
                  <View style={styles.gestureOverlay} />
                </GestureDetector>
              )}

              {/* Editing Overlay (When typing text) */}
              {isEditingTextContent && (
                <View style={styles.textInputOverlay}>
                  <TextInput
                    value={text}
                    onChangeText={setText}
                    autoFocus
                    placeholder="Type your memory..."
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    style={[styles.floatingInput, { color: textColor, lineHeight: 28 }]}
                    multiline
                  />
                  <View style={styles.colorPalette}>
                    {['#FFFFFF', '#000000', '#292524', '#78716C'].map(c => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.colorDot, { backgroundColor: c }, textColor === c && styles.activeColorDot]}
                        onPress={() => setTextColor(c)}
                      />
                    ))}
                  </View>
                  <TouchableOpacity style={styles.closeInputBtn} onPress={() => setIsEditingTextContent(false)}>
                    <Check size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              )}

            </View>

            {/* Toolbar Controls */}
            <View style={styles.toolbar}>
              {activeMode === 'photo' && imageUri && (
                <View style={styles.filterControls}>
                  <View style={styles.filterBtns}>
                    <TouchableOpacity onPress={() => setFilterColor('none')} style={[styles.toolBtn, filterColor === 'none' && styles.activeToolBtn]}>
                      <Text style={[styles.toolBtnText, filterColor === 'none' && styles.activeToolBtnText]}>Original</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFilterColor('white')} style={[styles.toolBtn, filterColor === 'white' && styles.activeToolBtn]}>
                      <Sun size={16} color={filterColor === 'white' ? '#FFF' : '#333'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setFilterColor('black')} style={[styles.toolBtn, filterColor === 'black' && styles.activeToolBtn]}>
                      <Moon size={16} color={filterColor === 'black' ? '#FFF' : '#333'} />
                    </TouchableOpacity>
                  </View>

                  {filterColor !== 'none' && (
                    <View style={styles.sliderContainer}>
                      <Text style={styles.sliderLabel}>Opacity</Text>
                      <SimpleSlider value={filterOpacity} onValueChange={setFilterOpacity} width={150} />
                    </View>
                  )}
                </View>
              )}
              <Text style={styles.hintText}>
                {activeMode === 'photo' ? 'Pinch, Drag, Rotate Image' : activeMode === 'text' ? 'Pinch, Drag to adjust Text' : 'Select a mode to edit'}
              </Text>
            </View>
          </View>

        </View>
      </Layout>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.m,
  },
  canvasContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: colors.gridLines,
    overflow: 'hidden', // Mask content
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: { alignItems: 'center', opacity: 0.5 },
  emptyStateText: { ...typography.caption, color: colors.text.tertiary, marginTop: 8 },

  // Layer 1
  imageLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  // Layer 2 (Date) - Scaled to match calendar cell proportion
  dateOverlay: {
    position: 'absolute',
    top: 4 * SCALE_FACTOR,
    left: 6 * SCALE_FACTOR,
    zIndex: 10,
    elevation: 2,
  },
  dateText: {
    ...typography.dateNumber,
    fontSize: typography.dateNumber.fontSize! * SCALE_FACTOR, // Scale font size
    color: colors.text.tertiary,
  },
  yearText: {
    display: 'none',
  },

  // Layer 3: Text
  textLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none', // Touches handled by overlay
  },
  diaryText: {
    ...typography.body,
    fontSize: 48,
    lineHeight: 60,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Gesture Control Overlay (Invisible but catch touches)
  gestureOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30, // Above text
    backgroundColor: 'transparent',
  },

  // Text Input Overlay
  textInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
    padding: 20,
  },
  floatingInput: {
    width: '100%',
    fontSize: 20,
    textAlign: 'center',
    minHeight: 100,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  activeColorDot: {
    borderColor: '#FFF',
    transform: [{ scale: 1.2 }],
  },
  closeInputBtn: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },

  toolbar: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center'
  },
  filterControls: {
    alignItems: 'center',
    gap: 15,
    marginBottom: 10
  },
  filterBtns: {
    flexDirection: 'row',
    gap: 10
  },
  toolBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eee'
  },
  activeToolBtn: {
    backgroundColor: '#333'
  },
  toolBtnText: {
    fontSize: 12,
    color: '#333'
  },
  activeToolBtnText: {
    color: '#FFF'
  },
  sliderContainer: {
    alignItems: 'center'
  },
  sliderLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 5
  },

  hintText: {
    marginTop: spacing.s,
    ...typography.caption,
    color: colors.text.tertiary,
    fontSize: 10,
  },
});
