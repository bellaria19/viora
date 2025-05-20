import { ButtonGroup, ColorPicker } from '@/components/common/controls';
import { SettingItem, SettingsSection } from '@/components/settings';
import { colors } from '@/constants/colors';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useCallback } from 'react';
import { ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PdfSettingsScreen() {
  const { pdfViewerOptions, updatePDFViewerOptions } = useViewerSettings();

  // 설정 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updatePDFViewerOptions({ [key]: value });
    },
    [updatePDFViewerOptions],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <SettingsSection title="뷰어 설정">
          <SettingItem label="뷰어 모드">
            <ButtonGroup
              value={pdfViewerOptions.viewMode}
              options={[
                { value: 'page', label: '페이지', icon: 'file' },
                { value: 'scroll', label: '스크롤', icon: 'scroll' },
              ]}
              onChange={(value) => handleOptionChange('viewMode', value)}
            />
          </SettingItem>

          <SettingItem label="RTL 방향 (오른쪽→왼쪽)">
            <Switch
              value={pdfViewerOptions.enableRTL}
              onValueChange={(value) => handleOptionChange('enableRTL', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="표시 설정">
          <SettingItem label="배경 색상">
            <ColorPicker
              value={pdfViewerOptions.backgroundColor}
              options={['#000', '#fff', '#222', '#444', '#666', '#007AFF', 'transparent']}
              onChange={(value) => handleOptionChange('backgroundColor', value)}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="성능 설정">
          <SettingItem label="더블 탭 확대/축소" description="두 번 탭하여 확대 또는 축소">
            <Switch
              value={pdfViewerOptions.enableDoubleTapZoom}
              onValueChange={(value) => handleOptionChange('enableDoubleTapZoom', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>

          <SettingItem label="캐시 사용" description="메모리 사용량이 증가하지만 성능이 향상됩니다">
            <Switch
              value={pdfViewerOptions.enableCache}
              onValueChange={(value) => handleOptionChange('enableCache', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
