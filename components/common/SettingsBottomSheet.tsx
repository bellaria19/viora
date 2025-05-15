import ButtonGroup from '@/components/settings/ButtonGroup';
import ColorPicker from '@/components/settings/ColorPicker';
import SettingItem from '@/components/settings/SettingItem';
import SettingsSection from '@/components/settings/SettingsSection';
import StepperControl from '@/components/settings/StepperControl';
import { FontAwesome6 } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 옵션 타입 정의
export interface SettingOption {
  key: string;
  type: 'button-group' | 'slider' | 'switch' | 'color-group' | 'stepper';
  value: any;
  label?: string;
  options?: { value: any; label: string; icon?: string }[]; // button-group, color-group
  min?: number; // slider, stepper
  max?: number; // slider, stepper
  step?: number; // slider, stepper
  unit?: string; // slider, stepper
  colorOptions?: string[]; // color-group
  icon?: string; // button-group
  description?: string; // switch 등에서 사용
}

export interface SettingsSection {
  title: string;
  data: SettingOption[];
}

interface SettingsBottomSheetProps {
  title: string;
  isVisible: boolean;
  onClose: () => void;
  sections: SettingsSection[];
  onOptionChange: (key: string, value: any) => void;
}

export default function SettingsBottomSheet({
  title,
  isVisible,
  onClose,
  sections,
  onOptionChange,
}: SettingsBottomSheetProps) {
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

  // 옵션 타입별로 알맞은 컴포넌트 반환
  function renderOption(option: SettingOption) {
    switch (option.type) {
      case 'button-group':
        return (
          <SettingItem label={option.label ?? ''}>
            <ButtonGroup
              value={option.value}
              options={option.options ?? []}
              onChange={(value) => onOptionChange(option.key, value)}
            />
          </SettingItem>
        );
      case 'color-group':
        return (
          <SettingItem label={option.label ?? ''}>
            <ColorPicker
              value={option.value}
              options={option.colorOptions ?? []}
              onChange={(value) => onOptionChange(option.key, value)}
            />
          </SettingItem>
        );
      case 'switch':
        return (
          <SettingItem label={option.label ?? ''} description={option.description}>
            <Switch
              value={option.value}
              onValueChange={(value) => onOptionChange(option.key, value)}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
            />
          </SettingItem>
        );
      case 'stepper':
        return (
          <SettingItem label={option.label ?? ''}>
            <StepperControl
              value={option.value}
              min={option.min ?? 0}
              max={option.max ?? 100}
              step={option.step ?? 1}
              unit={option.unit}
              onChange={(value) => onOptionChange(option.key, value)}
            />
          </SettingItem>
        );
      case 'slider':
        return (
          <SettingItem label={option.label ?? ''}>
            <View style={styles.sliderRow}>
              <Slider
                style={styles.slider}
                minimumValue={option.min ?? 0}
                maximumValue={option.max ?? 100}
                step={option.step ?? 1}
                value={option.value}
                onValueChange={(value) => onOptionChange(option.key, value)}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#007AFF"
              />
              <Text style={styles.sliderValue}>
                {option.value}
                {option.unit ?? ''}
              </Text>
            </View>
          </SettingItem>
        );
      default:
        return null;
    }
  }

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            transform: [{ translateY }],
            maxHeight: '90%',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: 16,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: 'bold', margin: 16 }}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <FontAwesome6 name="xmark" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {sections.map((section) => (
              <SettingsSection key={section.title} title={section.title}>
                {section.data.map((option) => (
                  <View key={option.key}>{renderOption(option)}</View>
                ))}
              </SettingsSection>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#fff',
  },
  indicator: {
    width: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  buttonGroupRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  buttonActive: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#666',
    fontSize: 14,
  },
  buttonTextActive: {
    color: '#fff',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sliderLabel: {
    width: 80,
    fontSize: 15,
    color: '#333',
  },
  slider: {
    flex: 1,
    marginLeft: 16,
  },
  sliderValue: {
    marginLeft: 8,
    fontSize: 15,
    color: '#333',
    width: 48,
    textAlign: 'right',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 15,
    color: '#333',
  },
  colorGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  colorLabel: {
    fontSize: 15,
    color: '#333',
    marginRight: 12,
  },
  colorOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  // Modal용 추가 스타일
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: '40%',
    maxHeight: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  stepperLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  stepperControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  stepperButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  stepperValue: {
    fontSize: 16,
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
});
