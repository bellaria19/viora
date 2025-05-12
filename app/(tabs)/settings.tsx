import ResetButton from '@/components/ResetButton';
import { colors } from '@/constants/colors';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { resetAllFiles } from '@/utils/fileManager';
import { FontAwesome6 } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Alert, SectionList, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const {
    imageViewerOptions,
    updateImageViewerOptions,
    pdfViewerOptions,
    updatePDFViewerOptions,
    textViewerOptions,
    updateTextViewerOptions,
    epubViewerOptions,
    updateEPUBViewerOptions,
  } = useViewerSettings();

  // 앱 초기화 함수
  const handleResetFiles = () => {
    Alert.alert('파일 초기화', '모든 파일이 삭제됩니다. 계속하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '초기화',
        style: 'destructive',
        onPress: async () => {
          try {
            await resetAllFiles();
            Alert.alert('완료', '모든 파일이 초기화되었습니다.');
          } catch (error) {
            Alert.alert('오류', '파일 초기화 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  // 공통 옵션
  const themeOptions = [
    { value: 'light', label: '라이트' },
    { value: 'dark', label: '다크' },
    { value: 'sepia', label: '세피아' },
  ];
  const contentFitOptions = [
    { value: 'contain', label: 'Contain' },
    { value: 'cover', label: 'Cover' },
    { value: 'fill', label: 'Fill' },
    { value: 'none', label: 'None' },
  ];
  const colorOptions = ['#000', '#fff', '#222', '#007AFF', 'transparent'];
  const fontOptions = [
    { value: 'System', label: '시스템' },
    { value: 'SpaceMono', label: 'SpaceMono' },
  ];

  // Section 데이터
  const sections = [
    // 이미지 뷰어
    {
      title: '이미지 뷰어',
      data: [
        {
          key: 'enableDoubleTapZoom',
          type: 'switch',
          value: imageViewerOptions.enableDoubleTapZoom,
          label: '더블 탭 확대/축소',
          viewer: 'image',
        },
        {
          key: 'enablePreload',
          type: 'switch',
          value: imageViewerOptions.enablePreload,
          label: '이미지 미리 로드',
          viewer: 'image',
        },
        {
          key: 'enableCache',
          type: 'switch',
          value: imageViewerOptions.enableCache,
          label: '이미지 캐싱',
          viewer: 'image',
        },
        {
          key: 'contentFit',
          type: 'button-group',
          value: imageViewerOptions.contentFit,
          label: '이미지 표시 방식',
          options: contentFitOptions,
          viewer: 'image',
        },
        {
          key: 'backgroundColor',
          type: 'color-group',
          value: imageViewerOptions.backgroundColor,
          label: '배경 색상',
          colorOptions,
          viewer: 'image',
        },
        {
          key: 'theme',
          type: 'button-group',
          value: imageViewerOptions.theme,
          label: '테마',
          options: themeOptions,
          viewer: 'image',
        },
      ],
    },
    // PDF 뷰어
    {
      title: 'PDF 뷰어',
      data: [
        {
          key: 'viewMode',
          type: 'button-group',
          value: pdfViewerOptions.viewMode,
          label: '뷰어 모드',
          options: [
            { value: 'scroll', label: '스크롤' },
            { value: 'page', label: '페이지' },
          ],
          viewer: 'pdf',
        },
        {
          key: 'enableRTL',
          type: 'switch',
          value: pdfViewerOptions.enableRTL,
          label: 'RTL(오른쪽→왼쪽)',
          viewer: 'pdf',
        },
        {
          key: 'enableCache',
          type: 'switch',
          value: pdfViewerOptions.enableCache,
          label: '캐싱',
          viewer: 'pdf',
        },
        {
          key: 'enableDoubleTapZoom',
          type: 'switch',
          value: pdfViewerOptions.enableDoubleTapZoom,
          label: '더블 탭 확대/축소',
          viewer: 'pdf',
        },
        {
          key: 'showPageNumbers',
          type: 'switch',
          value: pdfViewerOptions.showPageNumbers,
          label: '페이지 번호 표시',
          viewer: 'pdf',
        },
        {
          key: 'showThumbnails',
          type: 'switch',
          value: pdfViewerOptions.showThumbnails,
          label: '썸네일 표시',
          viewer: 'pdf',
        },
        {
          key: 'theme',
          type: 'button-group',
          value: pdfViewerOptions.theme,
          label: '테마',
          options: themeOptions,
          viewer: 'pdf',
        },
      ],
    },
    // 텍스트 뷰어
    {
      title: '텍스트 뷰어',
      data: [
        {
          key: 'fontSize',
          type: 'slider',
          value: textViewerOptions.fontSize,
          label: '글자 크기',
          min: 10,
          max: 32,
          step: 1,
          unit: 'pt',
          viewer: 'text',
        },
        {
          key: 'lineHeight',
          type: 'slider',
          value: textViewerOptions.lineHeight,
          label: '줄 간격',
          min: 1,
          max: 2.5,
          step: 0.05,
          unit: '',
          viewer: 'text',
        },
        {
          key: 'fontFamily',
          type: 'button-group',
          value: textViewerOptions.fontFamily,
          label: '폰트',
          options: fontOptions,
          viewer: 'text',
        },
        {
          key: 'textColor',
          type: 'color-group',
          value: textViewerOptions.textColor,
          label: '글자 색상',
          colorOptions,
          viewer: 'text',
        },
        {
          key: 'backgroundColor',
          type: 'color-group',
          value: textViewerOptions.backgroundColor,
          label: '배경 색상',
          colorOptions,
          viewer: 'text',
        },
        {
          key: 'marginHorizontal',
          type: 'slider',
          value: textViewerOptions.marginHorizontal,
          label: '가로 여백',
          min: 0,
          max: 64,
          step: 2,
          unit: 'px',
          viewer: 'text',
        },
        {
          key: 'marginVertical',
          type: 'slider',
          value: textViewerOptions.marginVertical,
          label: '세로 여백',
          min: 0,
          max: 64,
          step: 2,
          unit: 'px',
          viewer: 'text',
        },
        {
          key: 'theme',
          type: 'button-group',
          value: textViewerOptions.theme,
          label: '테마',
          options: themeOptions,
          viewer: 'text',
        },
      ],
    },
    // EPUB 뷰어
    {
      title: 'EPUB 뷰어',
      data: [
        {
          key: 'viewMode',
          type: 'button-group',
          value: epubViewerOptions.viewMode,
          label: '뷰어 모드',
          options: [
            { value: 'scroll', label: '스크롤' },
            { value: 'page', label: '페이지' },
          ],
          viewer: 'epub',
        },
        {
          key: 'enableRTL',
          type: 'switch',
          value: epubViewerOptions.enableRTL,
          label: 'RTL(오른쪽→왼쪽)',
          viewer: 'epub',
        },
        {
          key: 'fontSize',
          type: 'slider',
          value: epubViewerOptions.fontSize,
          label: '글자 크기',
          min: 10,
          max: 32,
          step: 1,
          unit: 'pt',
          viewer: 'epub',
        },
        {
          key: 'lineHeight',
          type: 'slider',
          value: epubViewerOptions.lineHeight,
          label: '줄 간격',
          min: 1,
          max: 2.5,
          step: 0.05,
          unit: '',
          viewer: 'epub',
        },
        {
          key: 'fontFamily',
          type: 'button-group',
          value: epubViewerOptions.fontFamily,
          label: '폰트',
          options: fontOptions,
          viewer: 'epub',
        },
        {
          key: 'textColor',
          type: 'color-group',
          value: epubViewerOptions.textColor,
          label: '글자 색상',
          colorOptions,
          viewer: 'epub',
        },
        {
          key: 'backgroundColor',
          type: 'color-group',
          value: epubViewerOptions.backgroundColor,
          label: '배경 색상',
          colorOptions,
          viewer: 'epub',
        },
        {
          key: 'marginHorizontal',
          type: 'slider',
          value: epubViewerOptions.marginHorizontal,
          label: '가로 여백',
          min: 0,
          max: 64,
          step: 2,
          unit: 'px',
          viewer: 'epub',
        },
        {
          key: 'marginVertical',
          type: 'slider',
          value: epubViewerOptions.marginVertical,
          label: '세로 여백',
          min: 0,
          max: 64,
          step: 2,
          unit: 'px',
          viewer: 'epub',
        },
        {
          key: 'enableTOC',
          type: 'switch',
          value: epubViewerOptions.enableTOC,
          label: '목차 표시',
          viewer: 'epub',
        },
        {
          key: 'enableAnnotation',
          type: 'switch',
          value: epubViewerOptions.enableAnnotation,
          label: '주석 기능',
          viewer: 'epub',
        },
        {
          key: 'enableBookmark',
          type: 'switch',
          value: epubViewerOptions.enableBookmark,
          label: '북마크 기능',
          viewer: 'epub',
        },
        {
          key: 'enableSearch',
          type: 'switch',
          value: epubViewerOptions.enableSearch,
          label: '검색 기능',
          viewer: 'epub',
        },
        {
          key: 'enableTextSelection',
          type: 'switch',
          value: epubViewerOptions.enableTextSelection,
          label: '텍스트 선택',
          viewer: 'epub',
        },
        {
          key: 'theme',
          type: 'button-group',
          value: epubViewerOptions.theme,
          label: '테마',
          options: themeOptions,
          viewer: 'epub',
        },
      ],
    },
  ];

  // 옵션 변경 핸들러
  const handleOptionChange = (key: string, value: any, viewer: string) => {
    if (viewer === 'image') updateImageViewerOptions({ [key]: value });
    else if (viewer === 'pdf') updatePDFViewerOptions({ [key]: value });
    else if (viewer === 'text') updateTextViewerOptions({ [key]: value });
    else if (viewer === 'epub') updateEPUBViewerOptions({ [key]: value });
  };

  // 렌더러
  const renderSectionHeader = ({ section }: any) => (
    <Text style={styles.sectionTitle}>{section.title}</Text>
  );

  const renderItem = ({ item }: any) => {
    if (item.type === 'switch') {
      return (
        <View style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <Switch
            value={item.value}
            onValueChange={(v) => handleOptionChange(item.key, v, item.viewer)}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      );
    }
    if (item.type === 'button-group') {
      return (
        <View style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.buttonGroup}>
            {item.options.map((opt: any) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.button, item.value === opt.value && styles.buttonActive]}
                onPress={() => handleOptionChange(item.key, opt.value, item.viewer)}
              >
                <Text
                  style={[styles.buttonText, item.value === opt.value && styles.buttonTextActive]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
    if (item.type === 'color-group') {
      return (
        <View style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.colorGroup}>
            {item.colorOptions.map((color: string) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color === 'transparent' ? '#fff' : color },
                  item.value === color && styles.selectedColorCircle,
                ]}
                onPress={() => handleOptionChange(item.key, color, item.viewer)}
              >
                {color === 'transparent' && <FontAwesome6 name="slash" size={16} color="#ddd" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
    if (item.type === 'slider') {
      return (
        <View style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.secondaryText, fontSize: 15, marginRight: 4 }}>
              {item.value}
              {item.unit}
            </Text>
            <View style={{ width: 120 }}>
              <Slider
                minimumValue={item.min}
                maximumValue={item.max}
                step={item.step}
                value={item.value}
                onValueChange={(v: any) => handleOptionChange(item.key, v, item.viewer)}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <SectionList<any>
        sections={sections as any}
        renderSectionHeader={renderSectionHeader as any}
        renderItem={renderItem as any}
        keyExtractor={(item: any) => item.key + item.viewer}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        stickySectionHeadersEnabled={false}
      />
      <ResetButton label="초기화" onPress={handleResetFiles} color={colors.errorText} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.buttonBackground,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 6,
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    color: colors.text,
    fontSize: 15,
  },
  buttonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  colorGroup: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  selectedColorCircle: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
});
