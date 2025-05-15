import ButtonGroup from '@/components/settings/ButtonGroup';
import ColorPicker from '@/components/settings/ColorPicker';
import SettingItem from '@/components/settings/SettingItem';
import SettingsSection from '@/components/settings/SettingsSection';
import SliderControl from '@/components/settings/SliderControl';
import { FONTS, THEMES } from '@/constants/option';
import { EPUBViewerOptions } from '@/types/option';
import { StyleSheet, Switch, View } from 'react-native';

interface EpubSettingsProps {
  options: EPUBViewerOptions;
  onOptionChange: (key: string, value: any) => void;
  colorOptions: string[];
}

export default function EpubSettings({ options, onOptionChange, colorOptions }: EpubSettingsProps) {
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

      <SettingsSection title="글꼴 설정">
        <SettingItem label="글꼴">
          <ButtonGroup
            value={options.fontFamily}
            options={FONTS.map((f) => ({ value: f.value, label: f.label }))}
            onChange={(value) => onOptionChange('fontFamily', value)}
          />
        </SettingItem>

        <SettingItem label="글자 크기">
          <SliderControl
            value={options.fontSize}
            min={12}
            max={32}
            step={1}
            unit="px"
            onChange={(value) => onOptionChange('fontSize', value)}
          />
        </SettingItem>

        <SettingItem label="줄 간격">
          <SliderControl
            value={options.lineHeight}
            min={1.0}
            max={2.5}
            step={0.1}
            formatValue={(value) => value.toFixed(1)}
            onChange={(value) => onOptionChange('lineHeight', value)}
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

        <SettingItem label="글자 색상">
          <ColorPicker
            value={options.textColor}
            options={colorOptions}
            onChange={(value) => onOptionChange('textColor', value)}
          />
        </SettingItem>

        <SettingItem label="배경 색상">
          <ColorPicker
            value={options.backgroundColor}
            options={colorOptions}
            onChange={(value) => onOptionChange('backgroundColor', value)}
          />
        </SettingItem>

        <SettingItem label="링크 색상">
          <ColorPicker
            value={options.linkColor}
            options={colorOptions}
            onChange={(value) => onOptionChange('linkColor', value)}
          />
        </SettingItem>
      </SettingsSection>

      <SettingsSection title="기능 설정">
        <SettingItem label="목차 표시">
          <Switch
            value={options.enableTOC}
            onValueChange={(value) => onOptionChange('enableTOC', value)}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </SettingItem>

        <SettingItem label="텍스트 선택 기능">
          <Switch
            value={options.enableTextSelection}
            onValueChange={(value) => onOptionChange('enableTextSelection', value)}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </SettingItem>

        <SettingItem label="북마크 기능">
          <Switch
            value={options.enableBookmark}
            onValueChange={(value) => onOptionChange('enableBookmark', value)}
            trackColor={{ false: '#ddd', true: '#007AFF' }}
          />
        </SettingItem>

        <SettingItem label="검색 기능">
          <Switch
            value={options.enableSearch}
            onValueChange={(value) => onOptionChange('enableSearch', value)}
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
