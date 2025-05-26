import SettingRenderer from '@/components/settings/SettingRenderer';
import { colors } from '@/constants/colors';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { SettingSectionData } from '@/types/settings';
import { useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTextSections } from './sections/textSections';

export default function TextSettingsScreen() {
  const { textViewerOptions, updateTextViewerOptions } = useViewerSettings();

  // 설정 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updateTextViewerOptions({ [key]: value });
    },
    [updateTextViewerOptions],
  );

  // SettingRenderer에 전달할 섹션 데이터
  const sections: SettingSectionData[] = useMemo(
    () => getTextSections(textViewerOptions),
    [textViewerOptions],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <SettingRenderer sections={sections} onChange={handleOptionChange} />
      </ScrollView>
    </SafeAreaView>
  );
}
