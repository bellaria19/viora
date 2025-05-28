import SettingRenderer from '@/components/settings/SettingRenderer';
import { SettingSectionData } from '@/types/settings';
import { FontAwesome6 } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface SettingBottomSheetProps {
  title: string;
  isVisible: boolean;
  onClose: () => void;
  sections: SettingSectionData[];
  onOptionChange: (key: string, value: any) => void;
}

export default function SettingBottomSheet({
  title,
  isVisible,
  onClose,
  sections,
  onOptionChange,
}: SettingBottomSheetProps) {
  // Bottom Sheet ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // 화면 방향 감지
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Snap points: 가로모드에서는 더 높게, 세로모드에서는 표준 높이
  const snapPoints = useMemo(() => {
    return isLandscape ? ['100%'] : ['80%'];
  }, [isLandscape]);

  // Bottom Sheet 열고 닫기 제어
  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  // 백드롭 컴포넌트
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        onPress={onClose}
      />
    ),
    [onClose],
  );

  // Bottom Sheet 변경 이벤트 핸들러
  const handleSheetChanges = useCallback(
    (index: number) => {
      // -1은 완전히 닫힌 상태
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  // 헤더 렌더링
  const renderHeader = useCallback(
    () => (
      <View style={[styles.headerContainer, isLandscape && styles.headerContainerLandscape]}>
        <Text style={styles.headerTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
          <FontAwesome6 name="xmark" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    ),
    [title, onClose, isLandscape],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1} // 초기에는 닫힌 상태
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableDynamicSizing={false}
      // 가로모드에서 중앙 정렬
      style={
        isLandscape
          ? {
              alignSelf: 'center',
              width: '100%',
            }
          : undefined
      }
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      {renderHeader()}

      <BottomSheetScrollView
        contentContainerStyle={[styles.scrollContent, isLandscape && styles.scrollContentLandscape]}
        showsVerticalScrollIndicator={false}
      >
        <SettingRenderer sections={sections} onChange={onOptionChange} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#ddd',
    width: 40,
    height: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContainerLandscape: {
    paddingHorizontal: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  scrollContentLandscape: {
    paddingHorizontal: 24,
  },
});
