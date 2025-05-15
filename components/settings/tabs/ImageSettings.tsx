import ButtonGroup from '@/components/settings/ButtonGroup';
import ColorPicker from '@/components/settings/ColorPicker';
import SettingItem from '@/components/settings/SettingItem';
import SettingsSection from '@/components/settings/SettingsSection';
import { THEMES } from '@/constants/option';
import { ImageViewerOptions } from '@/types/option';
import { StyleSheet, Switch, View } from 'react-native';

interface ImageSettingsProps {
  options: ImageViewerOptions;
  onOptionChange: (key: string, value: any) => void;
  colorOptions: string[];
}

export default function ImageSettings({
  options,
  onOptionChange,
  colorOptions,
}: ImageSettingsProps) {
  return (
    <View style={styles.container}>
      <SettingsSection title="표시 설정">
        <SettingItem label="이미지 표시 방식">
          <ButtonGroup
            value={options.contentFit}
            options={[
              { value: 'contain', label: 'Contain' },
              { value: 'cover', label: 'Cover' },
              { value: 'fill', label: 'Fill' },
              { value: 'none', label: 'None' },
            ]}
            onChange={(value) => onOptionChange('contentFit', value)}
          />
        </SettingItem>

        <SettingItem label="배경 색상">
          <ColorPicker
            value={options.backgroundColor}
            options={colorOptions}
            onChange={(value) => onOptionChange('backgroundColor', value)}
          />
        </SettingItem>

        <SettingItem label="테마">
          <ButtonGroup
            value={options.theme}
            options={THEMES.map((t) => ({ value: t.value, label: t.label }))}
            onChange={(value) => onOptionChange('theme', value)}
          />
        </SettingItem>
      </SettingsSection>

      <SettingsSection title="기능 설정">
        <SettingItem label="더블 탭 확대/축소" description="두 번 탭하여 확대 또는 축소">
          <Switch
            value={options.enableDoubleTapZoom}
            onValueChange={(value) => onOptionChange('enableDoubleTapZoom', value)}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </SettingItem>

        <SettingItem label="페이지 표시기" description="여러 이미지가 있는 경우 페이지 위치 표시">
          <Switch
            value={options.showPageIndicator ?? true}
            onValueChange={(value) => onOptionChange('showPageIndicator', value)}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </SettingItem>
      </SettingsSection>

      <SettingsSection title="성능 설정">
        <SettingItem label="이미지 미리 로드" description="다음 이미지를 미리 로드합니다">
          <Switch
            value={options.enablePreload}
            onValueChange={(value) => onOptionChange('enablePreload', value)}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </SettingItem>

        <SettingItem label="이미지 캐싱" description="메모리 사용량이 증가하지만 성능이 향상됩니다">
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
