import ButtonGroup from '@/components/settings/ButtonGroup';
import ColorPicker from '@/components/settings/ColorPicker';
import SettingItem from '@/components/settings/SettingItem';
import SettingsSection from '@/components/settings/SettingsSection';
import SliderControl from '@/components/settings/SliderControl';
import { FONTS, THEMES } from '@/constants/option';
import { TextViewerOptions } from '@/types/option';
import { StyleSheet, View } from 'react-native';

interface TextSettingsProps {
  options: TextViewerOptions;
  onOptionChange: (key: string, value: any) => void;
  colorOptions: string[];
}

export default function TextSettings({ options, onOptionChange, colorOptions }: TextSettingsProps) {
  return (
    <View style={styles.container}>
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

      <SettingsSection title="텍스트 표시">
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
      </SettingsSection>

      <SettingsSection title="여백">
        <SettingItem label="가로 여백">
          <SliderControl
            value={options.marginHorizontal}
            min={0}
            max={64}
            step={2}
            unit="px"
            onChange={(value) => onOptionChange('marginHorizontal', value)}
          />
        </SettingItem>

        <SettingItem label="세로 여백">
          <SliderControl
            value={options.marginVertical}
            min={0}
            max={64}
            step={2}
            unit="px"
            onChange={(value) => onOptionChange('marginVertical', value)}
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
