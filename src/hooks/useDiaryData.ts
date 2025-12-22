import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { DiaryEntry } from '../types';

const DIARY_FILE_URI = FileSystem.documentDirectory + 'diary_entries_v2.json';

export const useDiaryData = () => {
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>({});

  // Photo Picker / Cropper State
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [pickerPhotos, setPickerPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);

  // Load Entries on Mount
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const entriesInfo = await FileSystem.getInfoAsync(DIARY_FILE_URI);
        if (entriesInfo.exists) {
          const content = await FileSystem.readAsStringAsync(DIARY_FILE_URI);
          setEntries(JSON.parse(content));
        } else {
          setEntries({});
        }
      } catch (e) {
        console.error("Failed to load entries", e);
      }
    };
    loadEntries();
  }, []);

  const saveEntries = async (newEntries: Record<string, DiaryEntry>) => {
    setEntries(newEntries);
    try {
      await FileSystem.writeAsStringAsync(DIARY_FILE_URI, JSON.stringify(newEntries));
    } catch (e) {
      console.error("Failed to save entries", e);
    }
  };

  const addEntry = (dateKey: string, data: DiaryEntry) => {
    const newEntries = { ...entries, [dateKey]: data };
    saveEntries(newEntries);
  };

  // === CUSTOM PHOTO PICKER LOGIC ===
  const launchDatePhotoPicker = async (selectedDate: string) => {
    if (!selectedDate) {
      Alert.alert("Error", "No date selected");
      return;
    }

    try {
      // 1. Request MediaLibrary Permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please allow access to photos to filter by date.");
        return;
      }

      // 2. Calculate Date Range
      const parts = selectedDate.split('-');
      const y = parseInt(parts[0].trim(), 10);
      const m = parseInt(parts[1].trim(), 10) - 1;
      const d = parseInt(parts[2].trim(), 10);

      if (isNaN(y) || isNaN(m) || isNaN(d)) {
        Alert.alert("Error", "Invalid date format: " + selectedDate);
        return;
      }

      const startOfDay = new Date(y, m, d, 0, 0, 0).getTime();
      const endOfDay = new Date(y, m, d, 23, 59, 59).getTime();

      setPickerLoading(true);
      setIsPhotoPickerOpen(true);

      const assets = await MediaLibrary.getAssetsAsync({
        createdAfter: startOfDay,
        createdBefore: endOfDay,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: MediaLibrary.SortBy.creationTime,
        first: 100,
      });

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
      setCroppingImage(assetInfo.localUri || assetInfo.uri);
      setIsPhotoPickerOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Fallback to Standard Picker
  const launchStandardPicker = async (): Promise<string | null> => {
    setIsPhotoPickerOpen(false);
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Please allow access.");
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  return {
    entries,
    addEntry,
    isPhotoPickerOpen,
    setIsPhotoPickerOpen,
    pickerPhotos,
    pickerLoading,
    croppingImage,
    setCroppingImage,
    launchDatePhotoPicker,
    handleSelectPhoto,
    launchStandardPicker
  };
};
