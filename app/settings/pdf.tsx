import SettingRenderer from '@/components/settings/SettingRenderer';
import { colors } from '@/constants/colors';
import { useViewerSettings } from '@/hooks/useViewerSettings';
import { SettingSectionData } from '@/types/settings';
import { useCallback, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPdfSections } from '../../utils/sections/pdfSections';

export default function PdfSettingsScreen() {
  const { pdfViewerOptions, updatePDFViewerOptions } = useViewerSettings();

  // 설정 변경 핸들러
  const handleOptionChange = useCallback(
    (key: string, value: any) => {
      updatePDFViewerOptions({ [key]: value });
    },
    [updatePDFViewerOptions],
  );

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
