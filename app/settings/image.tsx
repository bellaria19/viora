import { ButtonGroup, CustomColorPicker } from '@/components/common/controls';
import { SettingItem, SettingsSection } from '@/components/settings';
import { colors } from '@/constants/colors';
import { BACKGROUND_COLOR_OPTIONS } from '@/constants/option';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { useCallback } from 'react';
import { ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ImageSettingsScreen() {
  const { imageViewerOptions, updateImageViewerOptions } = useViewerSettings();

  // 설정 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updateImageViewerOptions({ [key]: value });
    },
    [updateImageViewerOptions],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <SettingsSection title="표시 설정">
          <SettingItem label="이미지 표시 방식">
            <ButtonGroup
              value={imageViewerOptions.contentFit}
              options={[
                { value: 'contain', label: 'Contain' },
                { value: 'cover', label: 'Cover' },
                { value: 'fill', label: 'Fill' },
                { value: 'none', label: 'None' },
              ]}
              onChange={(value) => handleOptionChange('contentFit', value)}
            />
          </SettingItem>

          <SettingItem label="배경 색상">
            <CustomColorPicker
              value={imageViewerOptions.backgroundColor}
              options={BACKGROUND_COLOR_OPTIONS}
              onChange={(value) => handleOptionChange('backgroundColor', value)}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection title="기능 설정">
          <SettingItem label="더블 탭 확대/축소" description="두 번 탭하여 확대 또는 축소">
            <Switch
              value={imageViewerOptions.enableDoubleTapZoom}
              onValueChange={(value) => handleOptionChange('enableDoubleTapZoom', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>

          {/*
          <SettingItem label="페이지 표시기" description="여러 이미지가 있는 경우 페이지 위치 표시">
            <Switch
              value={imageViewerOptions.showPageIndicator ?? true}
              onValueChange={(value) => handleOptionChange('showPageIndicator', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>
          */}
        </SettingsSection>

        <SettingsSection title="성능 설정">
          <SettingItem label="이미지 미리 로드" description="다음 이미지를 미리 로드합니다">
            <Switch
              value={imageViewerOptions.enablePreload}
              onValueChange={(value) => handleOptionChange('enablePreload', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>

          <SettingItem
            label="이미지 캐싱"
            description="메모리 사용량이 증가하지만 성능이 향상됩니다"
          >
            <Switch
              value={imageViewerOptions.enableCache}
              onValueChange={(value) => handleOptionChange('enableCache', value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}
