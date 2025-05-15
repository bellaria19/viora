import AboutModal from '@/components/settings/AboutModal';
import SettingsCard from '@/components/settings/SettingsCard';
import EpubSettings from '@/components/settings/tabs/EpubSettings';
import GeneralSettings from '@/components/settings/tabs/GeneralSettings';
import ImageSettings from '@/components/settings/tabs/ImageSettings';
import PDFSettings from '@/components/settings/tabs/PDFSettings';
import TextSettings from '@/components/settings/tabs/TextSettings';
import { colors } from '@/constants/colors';
import { THEMES } from '@/constants/option';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 탭 유형 정의
type SettingsTab = 'general' | 'text' | 'image' | 'pdf' | 'epub';

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

  // 활성 탭 상태
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [aboutVisible, setAboutVisible] = useState(false);

  // 설정 변경 핸들러
  const handleTextSettingChange = useCallback(
    (key: string, value: any) => {
      if (key === 'theme') {
        const themeObj = THEMES.find((t) => t.value === value);
        updateTextViewerOptions({
          theme: value,
          backgroundColor: themeObj?.bgColor,
          textColor: themeObj?.textColor,
        });
      } else {
        updateTextViewerOptions({ [key]: value });
      }
    },
    [updateTextViewerOptions],
  );

  const handlePdfSettingChange = useCallback(
    (key: string, value: any) => {
      updatePDFViewerOptions({ [key]: value });
    },
    [updatePDFViewerOptions],
  );

  const handleImageSettingChange = useCallback(
    (key: string, value: any) => {
      updateImageViewerOptions({ [key]: value });
    },
    [updateImageViewerOptions],
  );

  const handleEpubSettingChange = useCallback(
    (key: string, value: any) => {
      updateEPUBViewerOptions({ [key]: value });
    },
    [updateEPUBViewerOptions],
  );

  // 탭 항목
  const tabs: { id: SettingsTab; title: string; icon: string }[] = [
    { id: 'general', title: '일반', icon: 'gear' },
    { id: 'text', title: '텍스트', icon: 'file-lines' },
    { id: 'image', title: '이미지', icon: 'image' },
    { id: 'pdf', title: 'PDF', icon: 'file-pdf' },
    { id: 'epub', title: 'EPUB', icon: 'book' },
  ];

  // 공통 옵션
  const colorOptions = ['#000', '#fff', '#222', '#444', '#666', '#007AFF', 'transparent'];

  // FlatList 렌더링 최적화
  const renderTab = useCallback(
    ({ item }: { item: { id: string; title: string; icon: string } }) => (
      <SettingsCard
        title={item.title}
        icon={item.icon}
        onPress={() => {
          setActiveTab(item.id as SettingsTab);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(console.error);
        }}
        selected={activeTab === item.id}
      />
    ),
    [activeTab],
  );

  // 키 추출기
  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  // AboutModal 표시 핸들러
  const handleShowAbout = useCallback(() => {
    setAboutVisible(true);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 탭 메뉴 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      {/* 탭 선택 */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={tabs}
          renderItem={renderTab}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
        />
      </View>

      {/* 탭 컨텐츠 */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'general' && <GeneralSettings onShowAbout={handleShowAbout} />}
        {activeTab === 'text' && (
          <TextSettings
            options={textViewerOptions}
            onOptionChange={handleTextSettingChange}
            colorOptions={colorOptions}
          />
        )}
        {activeTab === 'image' && (
          <ImageSettings
            options={imageViewerOptions}
            onOptionChange={handleImageSettingChange}
            colorOptions={colorOptions}
          />
        )}
        {activeTab === 'pdf' && (
          <PDFSettings options={pdfViewerOptions} onOptionChange={handlePdfSettingChange} />
        )}
        {activeTab === 'epub' && (
          <EpubSettings
            options={epubViewerOptions}
            onOptionChange={handleEpubSettingChange}
            colorOptions={colorOptions}
          />
        )}
      </ScrollView>

      {/* 정보 모달 */}
      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  tabsContainer: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  contentContainer: {
    flex: 1,
  },
});
