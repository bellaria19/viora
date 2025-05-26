import { ButtonGroup, CustomColorPicker, StepperControl } from '@/components/common/controls';
import { SettingItem, SettingsSection } from '@/components/settings';
import { colors } from '@/constants/colors';
import { BACKGROUND_COLOR_OPTIONS, FONTS, TEXT_COLOR_OPTIONS } from '@/constants/option';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TextSettingsScreen() {
  const { textViewerOptions, updateTextViewerOptions } = useViewerSettings();

  // 설정 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updateTextViewerOptions({ [key]: value });
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
          <SettingItem label="글자 색상">
            <CustomColorPicker
              value={textViewerOptions.textColor}
              options={TEXT_COLOR_OPTIONS}
              onChange={(value: string) => handleOptionChange('textColor', value)}
            />
          </SettingItem>

          <SettingItem label="배경 색상">
            <CustomColorPicker
              value={textViewerOptions.backgroundColor}
              options={BACKGROUND_COLOR_OPTIONS}
              onChange={(value: string) => handleOptionChange('backgroundColor', value)}
            />
          </SettingItem>

          <SettingItem label="글자 두께">
            <StepperControl
              value={parseInt((textViewerOptions.fontWeight || '400').toString(), 10) / 100}
              min={1}
              max={9}
              step={1}
              onChange={(value) => handleOptionChange('fontWeight', String(value * 100))}
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
