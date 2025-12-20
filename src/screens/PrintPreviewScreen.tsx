import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Layout } from '../components/Layout';
import { Header } from '../components/Header';
import { colors, spacing, typography } from '../theme';
import { X, Check, Printer as PrinterIcon } from 'lucide-react-native';

interface PrintPreviewScreenProps {
  onClose: () => void;
  currentDate: Date;
  entries: Record<string, any>;
}

type TemplateType = 'A4_Portrait' | 'A4_Landscape' | 'Square';

export const PrintPreviewScreen: React.FC<PrintPreviewScreenProps> = ({ onClose, currentDate, entries }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('A4_Portrait');
  const [isPrinting, setIsPrinting] = useState(false);

  const htmlContent = useMemo(() => {
    return generateHtml(currentDate, entries, selectedTemplate);
  }, [currentDate, entries, selectedTemplate]);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // For actual printing, we generate the clean HTML without preview-specific scaling
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log('File has been saved to:', uri);
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Layout>
      <Header
        title="Print Preview"
        rightIcon={<X size={24} color={colors.text.primary} />}
        onRightPress={onClose}
      />

      <View style={styles.container}>
        {/* Template Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Template:</Text>
          <View style={styles.optionsRow}>
            {(['A4_Portrait', 'A4_Landscape', 'Square'] as TemplateType[]).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.optionBtn, selectedTemplate === t && styles.activeOption]}
                onPress={() => setSelectedTemplate(t)}
              >
                <Text style={[styles.optionText, selectedTemplate === t && styles.activeOptionText]}>
                  {t.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* WebView Preview - The "Canva-like" part */}
        <View style={styles.previewContainer}>
          <View style={styles.webViewWrapper}>
            <WebView
              originWhitelist={['*']}
              source={{ html: getPreviewHtml(htmlContent, selectedTemplate) }}
              style={styles.webView}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <Text style={styles.previewHint}>Pinch to zoom • Drag to pan</Text>
        </View>

        {/* Action Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.printBtn} onPress={handlePrint} disabled={isPrinting}>
            {isPrinting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <PrinterIcon size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.printBtnText}>Generate PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Layout>
  );
};

// Start of Helper Functions -----------------------------------------------------------

/**
 * Wraps the raw PDF HTML in a container that makes it look like a paper on a desk
 * inside the WebView.
 */
function getPreviewHtml(rawHtml: string, template: TemplateType): string {
  // Extract body content from rawHtml to inject into our preview wrapper
  const bodyContent = rawHtml.match(/<body>([\s\S]*)<\/body>/)?.[1] || '';
  const styleContent = rawHtml.match(/<style>([\s\S]*)<\/style>/)?.[1] || '';

  // Calculate aspect ratio for the paper container
  let width = '210mm';
  let height = '297mm';
  if (template === 'A4_Landscape') {
    width = '297mm';
    height = '210mm';
  } else if (template === 'Square') {
    width = '300mm';
    height = '300mm';
  }

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=0.5, maximum-scale=3.0, minimum-scale=0.1, user-scalable=yes" />
          <style>
            ${styleContent}
            
            /* Preview Specific Overrides */
            body { 
                background-color: #f0f0f4; /* Desk color */
                display: flex;
                justify-content: center;
                align-items: flex-start;
                padding: 40px;
                margin: 0;
                min-height: 100vh;
            }
            .preview-paper {
                width: ${width};
                height: ${height};
                background: white;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                position: relative;
                overflow: hidden;
                /* Scale transform to fit screen initially if needed, handled by viewport mostly */
                transform-origin: top center;
            }
            
            /* Ensure the container from original HTML fills the paper */
            .container {
                width: 100% !important;
                height: 100% !important;
            }
          </style>
        </head>
        <body>
            <div class="preview-paper">
                ${bodyContent}
            </div>
        </body>
      </html>
    `;
}

function generateHtml(currentDate: Date, entries: Record<string, any>, template: TemplateType): string {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

  let gridHtml = '';

  // Create grid cells
  // Empty cells for offset
  for (let i = 0; i < firstDay; i++) {
    gridHtml += `<div class="cell empty"></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${month + 1}-${d}`;
    const entry = entries[key];
    let content = '';

    if (entry?.image) {
      // Use base64 if needed, or local uri. 
      // Note: Expo Print supports local URIs.
      content += `<div style="position: absolute; width: 100%; height: 100%; overflow: hidden;">
            <img src="${entry.image}" class="entry-image" style="transform: scale(${entry.imgScale || 1}) translate(${(entry.imgX || 0)}px, ${(entry.imgY || 0)}px) rotate(${entry.imgRotation || 0}rad);" />
            ${(entry.filterColor && entry.filterColor !== 'none') ?
          `<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: ${entry.filterColor === 'black' ? '#000' : '#FFF'}; opacity: ${entry.filterOpacity || 0};"></div>`
          : ''}
        </div>`;
    }
    if (entry?.text) {
      const textColor = entry.textColor || '#000';
      content += `<div class="entry-text" style="color: ${textColor}; transform: scale(${entry.textScale || 1});">${entry.text}</div>`;
    }

    const dateColor = entry?.dateColor || '#CCC';

    gridHtml += `
          <div class="cell">
            <div class="date-number" style="color: ${dateColor}">${d}</div>
            <div class="content-clipping">
               ${content}
            </div>
          </div>
        `;
  }

  // CSS for Templates
  let pageSize = '';
  let cellHeight = '150px';

  if (template === 'A4_Portrait') {
    pageSize = '@page { size: A4 portrait; margin: 0; }'; // We handle margin in container
    cellHeight = '140px';
  } else if (template === 'A4_Landscape') {
    pageSize = '@page { size: A4 landscape; margin: 0; }';
    cellHeight = '105px';
  } else { // Square
    pageSize = '@page { size: 300mm 300mm; margin: 0; }';
    cellHeight = '160px';
  }

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            ${pageSize}
            * { box-sizing: border-box; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
            
            .container { 
                width: 100%; 
                height: 100%; 
                padding: 15mm; /* Paper physical margin */
                display: flex;
                flex-direction: column;
            }
            
            h1 { text-align: center; color: #333; margin-bottom: 20px; font-weight: 300; font-size: 24pt; letter-spacing: 2px; }
            
            .grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                width: 100%;
                border-top: 1px solid #ddd;
                border-left: 1px solid #ddd;
                flex: 1;
            }
            .header-row {
                display: contents;
            }
            .header-cell {
                padding: 10px 5px;
                text-align: center;
                border-right: 1px solid #ddd;
                border-bottom: 1px solid #ddd;
                font-weight: bold;
                color: #666;
                font-size: 10pt;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .cell {
                height: ${cellHeight}; /* Fixed height based on template to ensure fit */
                border-right: 1px solid #ddd;
                border-bottom: 1px solid #ddd;
                position: relative;
                overflow: hidden;
            }
            .empty { background: #fafafa; }
            .date-number {
                position: absolute;
                top: 6px;
                left: 6px;
                font-size: 10pt;
                z-index: 10;
                font-family: monospace;
            }
            .content-clipping {
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .entry-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                position: absolute;
            }
            .entry-text {
                position: absolute;
                width: 100%;
                padding: 4px;
                text-align: center;
                font-size: 10pt;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            
            .footer-branding {
                text-align: right;
                font-size: 8pt;
                color: #aaa;
                margin-top: 10px;
                font-family: sans-serif;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${monthName} ${year}</h1>
            <div class="grid">
                <div class="header-row">
                    <div class="header-cell">Sun</div>
                    <div class="header-cell">Mon</div>
                    <div class="header-cell">Tue</div>
                    <div class="header-cell">Wed</div>
                    <div class="header-cell">Thu</div>
                    <div class="header-cell">Fri</div>
                    <div class="header-cell">Sat</div>
                </div>
                ${gridHtml}
            </div>
            <div class="footer-branding">Calendar Diary App</div>
          </div>
        </body>
      </html>
    `;
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { ...typography.header, marginBottom: spacing.m, textAlign: 'center' },

  selectorContainer: {
    padding: spacing.m,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.gridLines,
  },
  selectorLabel: { ...typography.caption, marginBottom: spacing.s, color: colors.text.secondary },
  optionsRow: { flexDirection: 'row', gap: 10 },
  optionBtn: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 16, borderWidth: 1, borderColor: colors.gridLines,
    backgroundColor: '#f5f5f5'
  },
  activeOption: { backgroundColor: colors.text.primary, borderColor: colors.text.primary },
  optionText: { ...typography.caption, color: colors.text.primary },
  activeOptionText: { color: '#FFF' },

  previewContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0', // Darker gray for desk background
    justifyContent: 'center',
    padding: spacing.s,
  },
  webViewWrapper: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent'
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  previewHint: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },

  footer: {
    padding: spacing.m,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.gridLines,
  },
  printBtn: {
    backgroundColor: colors.text.primary,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  printBtnText: { ...typography.header, color: '#FFF', fontSize: 16 }
});
