import ButtonGroup from '@/components/settings/ButtonGroup';
import SettingItem from '@/components/settings/SettingItem';
import SettingsSection from '@/components/settings/SettingsSection';
import { THEMES } from '@/constants/option';
import { PDFViewerOptions } from '@/types/option';
import { StyleSheet, Switch, View } from 'react-native';

interface PDFSettingsProps {
  options: PDFViewerOptions;
  onOptionChange: (key: string, value: any) => void;
}

export default function PDFSettings({ options, onOptionChange }: PDFSettingsProps) {
  return (
    <View style={styles.container}>
      <SettingsSection title="뷰어 설정">
        <SettingItem label="뷰어 모드">
          <ButtonGroup
            value={options.viewMode}
            options={[
              { value: 'page', label: '페이지', icon: 'file' },
              { value: 'scroll', label: '스크롤', icon: 'scroll' },
            ]}
            onChange={(value) => onOptionChange('viewMode', value)}
          />
        </SettingItem>

        <SettingItem
          label="RTL 방향 (오른쪽→왼쪽)"
          description="아랍어, 히브리어와 같은 RTL 언어 지원"
        >
          <Switch
            value={options.enableRTL}
            onValueChange={(value) => onOptionChange('enableRTL', value)}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </SettingItem>
      </SettingsSection>

      <SettingsSection title="표시 설정">
        <SettingItem label="테마">
          <ButtonGroup
            value={options.theme}
            options={THEMES.map((t) => ({ value: t.value, label: t.label }))}
            onChange={(value) => onOptionChange('theme', value)}
          />
        </SettingItem>
      </SettingsSection>

      <SettingsSection title="성능 설정">
        <SettingItem label="더블 탭 확대/축소" description="두 번 탭하여 확대 또는 축소">
          <Switch
            value={options.enableDoubleTapZoom}
            onValueChange={(value) => onOptionChange('enableDoubleTapZoom', value)}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </SettingItem>

        <SettingItem label="캐시 사용" description="메모리 사용량이 증가하지만 성능이 향상됩니다">
          <Switch
            value={options.enableCache}
            onValueChange={(value) => onOptionChange('enableCache', value)}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </SettingItem>
      </SettingsSection>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },
});
