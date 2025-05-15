import ButtonGroup from '@/components/settings/ButtonGroup';
import ColorPicker from '@/components/settings/ColorPicker';
import SettingItem from '@/components/settings/SettingItem';
import SettingsSection from '@/components/settings/SettingsSection';
import SliderControl from '@/components/settings/SliderControl';
import { colors } from '@/constants/colors';
import { FONTS, THEMES } from '@/constants/option';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EpubSettingsScreen() {
  const { epubViewerOptions, updateEPUBViewerOptions } = useViewerSettings();

  // 설정 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updateEPUBViewerOptions({ [key]: value });
    },
    [updateEPUBViewerOptions],
  );

  // 색상 옵션
  const colorOptions = ['#000', '#fff', '#222', '#444', '#666', '#007AFF', 'transparent'];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SettingsSection title="뷰어 설정">
          <SettingItem label="뷰어 모드">
            <ButtonGroup
              value={epubViewerOptions.viewMode}
              options={[
                { value: 'page', label: '페이지', icon: 'file' },
                { value: 'scroll', label: '스크롤', icon: 'scroll' },
              ]}
              onChange={(value: string) => handleOptionChange('viewMode', value)}
            />
          </SettingItem>

          <SettingItem label="RTL 방향 (오른쪽→왼쪽)">
            <Switch
              value={epubViewerOptions.enableRTL}
              onValueChange={(value) => handleOptionChange('enableRTL', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="글꼴 설정">
          <SettingItem label="글꼴">
            <ButtonGroup
              value={epubViewerOptions.fontFamily}
              options={FONTS.map((f) => ({ value: f.value, label: f.label }))}
              onChange={(value: string) => handleOptionChange('fontFamily', value)}
            />
          </SettingItem>

          <SettingItem label="글자 크기">
            <SliderControl
              value={epubViewerOptions.fontSize}
              min={12}
              max={32}
              step={1}
              unit="px"
              onChange={(value: number) => handleOptionChange('fontSize', value)}
            />
          </SettingItem>

          <SettingItem label="줄 간격">
            <SliderControl
              value={epubViewerOptions.lineHeight}
              min={1.0}
              max={2.5}
              step={0.1}
              formatValue={(value) => value.toFixed(1)}
              onChange={(value: number) => handleOptionChange('lineHeight', value)}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="표시 설정">
          <SettingItem label="테마">
            <ButtonGroup
              value={epubViewerOptions.theme}
              options={THEMES.map((t) => ({ value: t.value, label: t.label }))}
              onChange={(value: string) => handleOptionChange('theme', value)}
            />
          </SettingItem>

          <SettingItem label="글자 색상">
            <ColorPicker
              value={epubViewerOptions.textColor}
              options={colorOptions}
              onChange={(value) => handleOptionChange('textColor', value)}
            />
          </SettingItem>

          <SettingItem label="배경 색상">
            <ColorPicker
              value={epubViewerOptions.backgroundColor}
              options={colorOptions}
              onChange={(value) => handleOptionChange('backgroundColor', value)}
            />
          </SettingItem>

          <SettingItem label="링크 색상">
            <ColorPicker
              value={epubViewerOptions.linkColor}
              options={colorOptions}
              onChange={(value) => handleOptionChange('linkColor', value)}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="기능 설정">
          <SettingItem label="목차 표시">
            <Switch
              value={epubViewerOptions.enableTOC}
              onValueChange={(value) => handleOptionChange('enableTOC', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>

          <SettingItem label="텍스트 선택 기능">
            <Switch
              value={epubViewerOptions.enableTextSelection}
              onValueChange={(value) => handleOptionChange('enableTextSelection', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>

          <SettingItem label="북마크 기능">
            <Switch
              value={epubViewerOptions.enableBookmark}
              onValueChange={(value) => handleOptionChange('enableBookmark', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>

          <SettingItem label="검색 기능">
            <Switch
              value={epubViewerOptions.enableSearch}
              onValueChange={(value) => handleOptionChange('enableSearch', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
});
