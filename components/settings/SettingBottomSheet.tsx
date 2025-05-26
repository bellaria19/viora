import SettingRenderer from '@/components/settings/SettingRenderer';
import { SettingSectionData } from '@/types/settings';
import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
  // 애니메이션 값
  const translateY = useRef(new Animated.Value(500)).current;

  // 바텀시트 열고 닫기 애니메이션
  useEffect(() => {
    if (isVisible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 500,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, translateY]);

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.modalContainer, { transform: [{ translateY }] }]}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <FontAwesome6 name="xmark" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
            <SettingRenderer sections={sections} onChange={onOptionChange} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
  },
});
