import React, { useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import ViewShot from "react-native-view-shot";
import { X, Check } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 40; // Approx matching simple modal width

interface ImageCropperProps {
  imageUri: string;
  onCancel: () => void;
  onComplete: (croppedUri: string) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageUri, onCancel, onComplete }) => {
  const viewShotRef = useRef<ViewShot>(null);
  const [saving, setSaving] = React.useState(false);

  // Gestures
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotationGesture = Gesture.Rotation()
    .onUpdate((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` }
    ]
  }));

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        onComplete(uri);
      }
    } catch (e) {
      console.error("Capture failed", e);
      alert("Failed to save crop");
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adjust Photo</Text>

      <View style={styles.canvasContainer}>
        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
          <View style={styles.mask}>
            <GestureDetector gesture={composed}>
              <Animated.Image
                source={{ uri: imageUri }}
                style={[styles.image, animatedStyle]}
                resizeMode="cover"
              />
            </GestureDetector>
          </View>
        </ViewShot>
      </View>

      <Text style={styles.hint}>Pinch to Zoom • Drag to Move • Rotate</Text>

      <View style={styles.controls}>
        <TouchableOpacity onPress={onCancel} style={styles.btnCancel}>
          <X color="#333" size={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.btnSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Check color="#FFF" size={24} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#EEE',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mask: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EEE', // Background for transparent pngs
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hint: {
    marginTop: 20,
    color: '#888',
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 30,
  },
  btnCancel: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E4E4E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSave: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#18181B', // Dark accent
    justifyContent: 'center',
    alignItems: 'center',
  }
});
