import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { ChevronLeft, Printer } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  leftIcon?: React.ReactNode; // Optional custom icon or default back
  rightIcon?: React.ReactNode;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onLeftPress,
  onRightPress,
  rightIcon,
  leftIcon,
  showBack = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
            <ChevronLeft size={24} color={colors.text.primary} strokeWidth={1.5} />
          </TouchableOpacity>
        ) : leftIcon ? (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
            {leftIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.centerContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightContainer}>
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    borderBottomWidth: 0, // No border for clean look, minimal
  },
  leftContainer: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightContainer: {
    width: 44,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.header,
    color: colors.text.primary,
  },
  iconButton: {
    padding: 8,
  }
});
