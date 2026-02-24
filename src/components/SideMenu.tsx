import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Settings, Check, FileText, Image as LucideImage, Sun, Moon, Cloud, Lock, User } from 'lucide-react-native';
import { ThemeColors, ThemeColor, GridMode } from '../types';
import { THEME_OPTIONS } from '../theme';
import { useAuth } from '../context/AuthContext';

const BASE_FONT_FAMILY = Platform.OS === 'ios' ? 'Georgia' : 'serif';

interface SideMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isPhotoOnly: boolean;
  onTogglePhotoOnly: () => void;
  gridMode: GridMode;
  onGridModeChange: (mode: GridMode) => void;
  themeColor: ThemeColor;
  onThemeChange: (color: ThemeColor) => void;
  colors: ThemeColors;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onToggle,
  isDarkMode,
  onToggleDarkMode,
  isPhotoOnly,
  onTogglePhotoOnly,
  gridMode,
  onGridModeChange,
  themeColor,
  onThemeChange,
  colors
}) => {

  const { user, signInAnonymously } = useAuth();

  const handleProFeatureClick = () => {
    Alert.alert("Premium Feature", "Backup & Sync will be available in the Pro Plan.");
  };

  const cycleGridMode = () => {
    if (gridMode === 'standard') onGridModeChange('sequential');
    else if (gridMode === 'sequential') onGridModeChange('weekly');
    else onGridModeChange('standard');
  };

  return (
    <>
      {/* Settings Menu Expansion */}
      {isOpen && (
        <View style={[styles.settingsMenu, { bottom: 100 }]}>

          {/* 1. Feature Toggles */}
          <TouchableOpacity onPress={cycleGridMode} style={[styles.menuItem, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
            <View style={{ width: 20 }}><Check size={20} color={gridMode !== 'standard' ? colors.activeMenu : 'transparent'} /></View>
            <Text style={[styles.menuText, { color: colors.text }]}>
              Layout: {gridMode === 'standard' ? 'Standard' : gridMode === 'sequential' ? 'Sequential (6x6)' : 'Weekly (4x2)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onTogglePhotoOnly} style={[styles.menuItem, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
            {isPhotoOnly ? <FileText size={20} color={colors.activeMenu} /> : <LucideImage size={20} color={colors.text} />}
            <Text style={[styles.menuText, { color: colors.text }]}>{isPhotoOnly ? "Show Text" : "Photo Only"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleDarkMode} style={[styles.menuItem, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
            {isDarkMode ? <Sun size={20} color={colors.activeMenu} /> : <Moon size={20} color={colors.text} />}
            <Text style={[styles.menuText, { color: colors.text }]}>{isDarkMode ? "Light Mode" : "Dark Mode"}</Text>
          </TouchableOpacity>

          {/* 2. Color Picker */}
          <View style={[styles.colorPickerRow, { backgroundColor: colors.modalBg, borderColor: colors.border }]}>
            {THEME_OPTIONS.map((theme) => (
              <TouchableOpacity
                key={theme.key}
                onPress={() => onThemeChange(theme.key)}
                style={[styles.colorOption, { backgroundColor: theme.color }]}
              >
                {themeColor === theme.key && <Check size={12} color="#FFFFFF" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* 3. PRO Features Placeholder */}
          <View style={[styles.proSection, { backgroundColor: colors.inputBg }]}>
            <Text style={[styles.proHeader, { color: colors.subText }]}>PREMIUM FEATURES</Text>

            <TouchableOpacity onPress={() => {
              if (user) {
                Alert.alert("Backup Active", `ID: ${user.uid}\nEntries are synced to cloud.`);
              } else {
                Alert.alert("Enable Cloud Backup", "Activate anonymous backup?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Activate", onPress: async () => {
                      try { await signInAnonymously(); Alert.alert("Success", "Backup enabled!"); }
                      catch (e) { Alert.alert("Error", String(e)); }
                    }
                  }
                ]);
              }
            }} style={[styles.proItem, { backgroundColor: colors.modalBg, borderColor: colors.border, opacity: user ? 1 : 0.7 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Cloud size={20} color={user ? colors.premium : colors.subText} />
                <Text style={[styles.menuText, { color: user ? colors.text : colors.subText }]}>
                  {user ? "Backup Active" : "Cloud Backup"}
                </Text>
              </View>
              {user ? <Check size={14} color={colors.premium} /> : <Lock size={14} color={colors.subText} />}
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

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.modalBg, borderColor: colors.border }]}
        onPress={onToggle}
      >
        <Settings size={24} color={colors.text} />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  fab: { position: 'absolute', bottom: 40, right: 24, width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 6, borderWidth: 1 },
  settingsMenu: { position: 'absolute', bottom: 100, right: 24, alignItems: 'flex-end' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginBottom: 12, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, minWidth: 140, justifyContent: 'space-between' },
  menuText: { fontSize: 12, fontWeight: '500', marginLeft: 8, fontFamily: BASE_FONT_FAMILY },
  colorPickerRow: { flexDirection: 'row', padding: 8, borderRadius: 8, borderWidth: 1, marginBottom: 12, gap: 8, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  colorOption: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  proSection: { marginTop: 8, padding: 8, borderRadius: 8, minWidth: 140 },
  proHeader: { fontSize: 10, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  proItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginBottom: 6, borderWidth: 1 },
});
