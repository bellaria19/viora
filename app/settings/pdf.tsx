import SettingRenderer from '@/components/settings/SettingRenderer';
import { colors } from '@/constants/colors';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { SettingSectionData } from '@/types/settings';
import { useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPdfSections } from './sections/pdfSections';

export default function PdfSettingsScreen() {
  const { pdfViewerOptions, updatePDFViewerOptions } = useViewerSettings();

  // 설정 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updatePDFViewerOptions({ [key]: value });
    },
    [updatePDFViewerOptions],
  );

  // SettingRenderer에 전달할 섹션 데이터
  const sections: SettingSectionData[] = useMemo(
    () => getPdfSections(pdfViewerOptions),
    [pdfViewerOptions],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <SettingRenderer sections={sections} onChange={handleOptionChange} />
      </ScrollView>
    </SafeAreaView>
  );
}
