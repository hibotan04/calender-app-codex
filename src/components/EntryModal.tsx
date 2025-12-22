import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { ChevronLeft, X, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import { ThemeColors } from '../types';

const BASE_FONT_FAMILY = Platform.OS === 'ios' ? 'Georgia' : 'serif';

interface EntryModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedDate: string | null;
  text: string;
  setText: (text: string) => void;
  image: string | null;
  onPickImage: () => void; // Opens Date Picker
  onDeleteImage: () => void;
  onSave: () => void;
  colors: ThemeColors;
  isDarkMode: boolean;

  // Photo Picker Props (Passed down)
  isPhotoPickerOpen: boolean;
  onClosePhotoPicker: () => void;
  pickerLoading: boolean;
  pickerPhotos: MediaLibrary.Asset[];
  onSelectPhoto: (asset: MediaLibrary.Asset) => void;
  onLaunchStandardPicker: () => void;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isVisible,
  onClose,
  selectedDate,
  text,
  setText,
  image,
  onPickImage,
  onDeleteImage,
  onSave,
  colors,
  isDarkMode,
  isPhotoPickerOpen,
  onClosePhotoPicker,
  pickerLoading,
  pickerPhotos,
  onSelectPhoto,
  onLaunchStandardPicker
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={() => {
      if (isPhotoPickerOpen) onClosePhotoPicker();
      else onClose();
    }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay} keyboardVerticalOffset={0}>

        {/* === PHOTO PICKER VIEW (Conditionally Rendered) === */}
        {isPhotoPickerOpen ? (
          <View style={[styles.modalContent, { backgroundColor: colors.modalBg, height: '90%', marginTop: 'auto', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClosePhotoPicker} style={[styles.closeBtn, { backgroundColor: colors.border, marginRight: 8 }]}>
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalDateTitle, { color: colors.text, fontSize: 16, flex: 1 }]}>
                Photos: {selectedDate}
              </Text>
              {/* Open Full Library Button in Header */}
              <TouchableOpacity onPress={onLaunchStandardPicker} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.accent, borderRadius: 16 }}>
                <Text style={{ color: isDarkMode ? '#111827' : '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>Library</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            {pickerLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={{ marginTop: 10, color: colors.subText }}>Loading photos...</Text>
              </View>
            ) : pickerPhotos.length > 0 ? (
              <FlatList
                data={pickerPhotos}
                style={{ flex: 1 }}
                keyExtractor={(item) => item.id}
                numColumns={3}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => onSelectPhoto(item)} style={{ width: '33.33%', aspectRatio: 1, padding: 2 }}>
                    <ExpoImage
                      source={{ uri: item.uri }}
                      style={{ width: '100%', height: '100%', borderRadius: 4, backgroundColor: '#eee' }}
                      contentFit="cover"
                      transition={200}
                    />
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <ImageIcon size={48} color={colors.subText} style={{ marginBottom: 16 }} />
                <Text style={{ color: colors.text, fontSize: 16, marginBottom: 8 }}>No photos found for this date.</Text>
                <TouchableOpacity onPress={onLaunchStandardPicker} style={[styles.modalSaveBtn, { backgroundColor: colors.accent, width: '100%' }]}>
                  <Text style={[styles.modalSaveBtnText, { color: isDarkMode ? '#111827' : '#FFFFFF' }]}>OPEN FULL LIBRARY</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* === DIARY FORM VIEW === */
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
            <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
              <View style={styles.modalHeader}>
                <View style={{ marginBottom: 4 }}>
                  <Text style={[styles.modalDateTitle, { color: colors.text }]}>
                    {selectedDate ? new Date(selectedDate).getDate() : ''}
                    <Text style={[styles.modalDateMonth, { color: colors.subText }]}>
                      {' '}{selectedDate ? new Date(selectedDate).toLocaleString('en-US', { month: 'short' }) : ''}
                    </Text>
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.border }]}>
                  <X size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.imageSection}>
                <TouchableOpacity style={[styles.imageUploadBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]} onPress={onPickImage} activeOpacity={0.8}>
                  {image ? (
                    <>
                      <ExpoImage
                        source={{ uri: image }}
                        style={styles.uploadedImage}
                        contentFit="cover"
                        transition={200}
                        cachePolicy="memory-disk"
                      />
                      <View style={styles.imageOverlay}><View style={styles.badge}><Text style={styles.badgeText}>Change</Text></View></View>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={32} color={colors.subText} style={{ marginBottom: 8 }} />
                      <Text style={[styles.uploadPlaceholder, { color: colors.subText }]}>Tap to add photo</Text>
                    </>
                  )}
                </TouchableOpacity>
                {image && <TouchableOpacity style={styles.deleteImageBtn} onPress={onDeleteImage}><Trash2 size={16} color="#FFFFFF" /></TouchableOpacity>}
              </View>

              <View style={styles.inputContainer}>
                {(() => {
                  const LIMIT = 30;
                  const currentLen = text.length;
                  const remaining = LIMIT - currentLen;
                  const isOverLimit = remaining < 0;
                  return (
                    <>
                      <TextInput
                        style={[
                          styles.textInput,
                          { backgroundColor: colors.inputBg, color: colors.text, borderColor: isOverLimit ? '#EF4444' : 'transparent', borderWidth: isOverLimit ? 1 : 0 }
                        ]}
                        value={text}
                        onChangeText={setText}
                        placeholder="今日はどんな1日でしたか？"
                        placeholderTextColor={colors.subText}
                        multiline={true} blurOnSubmit={false} returnKeyType="default"
                      />
                      <Text style={[styles.charCount, { color: isOverLimit ? '#EF4444' : colors.subText }]}>
                        {isOverLimit ? `${remaining} ` : `${currentLen}/${LIMIT}`}
                      </Text >
                    </>
                  );
                })()}
              </View >
              <TouchableOpacity
                onPress={onSave}
                disabled={text.length > 30}
                style={[styles.modalSaveBtn, { backgroundColor: colors.accent, opacity: text.length > 30 ? 0.5 : 1 }]}
              >
                <Text style={[styles.modalSaveBtnText, { color: isDarkMode ? '#111827' : '#FFFFFF' }]}>SAVE ENTRY</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});
