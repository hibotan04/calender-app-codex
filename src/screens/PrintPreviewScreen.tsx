import React from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { colors, spacing, typography } from '../theme';
import { X } from 'lucide-react-native';

interface PrintPreviewScreenProps {
  onClose: () => void;
}

export const PrintPreviewScreen: React.FC<PrintPreviewScreenProps> = ({ onClose }) => {
  return (
    <Layout>
      <Header
        title="Print Preview"
        leftIcon={<X size={24} color={colors.text.primary} />}
        onLeftPress={onClose}
      />

      <View style={styles.content}>
        <View style={styles.paperPreview}>
          <Text style={styles.previewText}>A4 Preview Here</Text>
          {/* Visual placeholder for grid */}
          <View style={styles.miniGrid} />
        </View>

        <View style={styles.controls}>
          <Text style={styles.controlLabel}>Show Dates</Text>
          <Switch value={true} onValueChange={() => { }} trackColor={{ false: colors.gridLines, true: colors.text.primary }} />
        </View>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.m,
  },
  paperPreview: {
    width: 210, // A4 ratio approx
    height: 297,
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniGrid: {
    width: 150,
    height: 150,
    borderWidth: 0.5,
    borderColor: colors.gridLines,
  },
  previewText: {
    ...typography.body,
    marginBottom: spacing.m,
    color: colors.text.secondary,
  },
  controls: {
    width: '100%',
    padding: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gridLines,
  },
  controlLabel: {
    ...typography.body,
    color: colors.text.primary,
  }
});
