import SettingRenderer from '@/components/settings/SettingRenderer';
import { colors } from '@/constants/colors';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { SettingSectionData } from '@/types/settings';
import { useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getImageSections } from '../../utils/sections/imageSections';

export default function ImageSettingsScreen() {
  const { imageViewerOptions, updateImageViewerOptions } = useViewerSettings();

  // 설정 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updateImageViewerOptions({ [key]: value });
    },
    [updateImageViewerOptions],
  );

  const sections: SettingSectionData[] = useMemo(
    () => getImageSections(imageViewerOptions),
    [imageViewerOptions],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <SettingRenderer sections={sections} onChange={handleOptionChange} />
      </ScrollView>
    </SafeAreaView>
  );
}
