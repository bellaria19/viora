import ButtonGroup from '@/components/common/controls/ButtonGroup';
import ColorPicker from '@/components/common/controls/ColorPicker';
import StepperControl from '@/components/common/controls/StepperControl';
import SettingItem from '@/components/settings/SettingItem';
import SettingsSection from '@/components/settings/SettingsSection';
import { colors } from '@/constants/colors';
import { COLOR_OPTIONS, FONTS, THEMES } from '@/constants/option';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TextSettingsScreen() {
  const { textViewerOptions, updateTextViewerOptions } = useViewerSettings();

  // 설정 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      if (key === 'theme') {
        const themeObj = THEMES.find((t) => t.value === value);
        updateTextViewerOptions({
          backgroundColor: themeObj?.bgColor,
          textColor: themeObj?.textColor,
        });
      } else {
        updateTextViewerOptions({ [key]: value });
      }
    },
    [updateTextViewerOptions],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <SettingsSection title="글꼴 설정">
          <SettingItem label="글꼴">
            <ButtonGroup
              value={textViewerOptions.fontFamily}
              options={FONTS.map((f) => ({ value: f.value, label: f.label }))}
              onChange={(value) => handleOptionChange('fontFamily', value)}
            />
          </SettingItem>

          <SettingItem label="글자 크기">
            <StepperControl
              value={textViewerOptions.fontSize}
              min={16}
              max={34}
              step={2}
              unit="px"
              onChange={(value) => handleOptionChange('fontSize', value)}
            />
          </SettingItem>

          <SettingItem label="줄 간격">
            <StepperControl
              value={textViewerOptions.lineHeight}
              min={1.0}
              max={2.5}
              step={0.1}
              formatValue={(value) => value.toFixed(1)}
              onChange={(value) => handleOptionChange('lineHeight', value)}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="텍스트 표시">
          {/* <SettingItem label="테마">
            <ButtonGroup
              value={textViewerOptions.theme}
              options={THEMES.map((t) => ({ value: t.value, label: t.label }))}
              onChange={(value) => handleOptionChange('theme', value)}
            />
          </SettingItem> */}

          <SettingItem label="글자 색상">
            <ColorPicker
              value={textViewerOptions.textColor}
              options={COLOR_OPTIONS}
              onChange={(value) => handleOptionChange('textColor', value)}
            />
          </SettingItem>

          <SettingItem label="배경 색상">
            <ColorPicker
              value={textViewerOptions.backgroundColor}
              options={COLOR_OPTIONS}
              onChange={(value) => handleOptionChange('backgroundColor', value)}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="여백">
          <SettingItem label="가로 여백">
            <StepperControl
              value={textViewerOptions.marginHorizontal}
              min={0}
              max={40}
              step={2}
              unit="px"
              onChange={(value) => handleOptionChange('marginHorizontal', value)}
            />
          </SettingItem>

          <SettingItem label="세로 여백">
            <StepperControl
              value={textViewerOptions.marginVertical}
              min={0}
              max={40}
              step={2}
              unit="px"
              onChange={(value) => handleOptionChange('marginVertical', value)}
            />
          </SettingItem>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
