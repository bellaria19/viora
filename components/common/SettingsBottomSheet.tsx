import { ButtonGroup, CustomColorPicker, StepperControl } from '@/components/common/controls';
import { SettingItem, SettingsSection } from '@/components/settings';
import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 옵션 타입 정의
export interface SettingOption {
  key: string;
  type: 'button-group' | 'switch' | 'color-group' | 'stepper';
  value: any;
  label?: string;
  options?: { value: any; label: string; icon?: string }[]; // button-group, color-group
  min?: number; // stepper
  max?: number; // stepper
  step?: number; // stepper
  unit?: string; // stepper
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
            <CustomColorPicker
              value={option.value}
              options={option.colorOptions ?? []}
              onChange={(value: string) => onOptionChange(option.key, value)}
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
          <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
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
