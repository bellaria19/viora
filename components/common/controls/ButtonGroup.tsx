import { colors } from '@/constants/colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ButtonOption {
  value: string;
  label: string;
  icon?: string;
}

interface ButtonGroupProps {
  value: string;
  options: ButtonOption[];
  onChange: (value: string) => void;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default memo(function ButtonGroup({
  value,
  options,
  onChange,
  style,
  fullWidth = false,
}: ButtonGroupProps) {
  const BUTTON_HEIGHT = 32;
  const FONT_SIZE = 12;
  const ICON_SIZE = 12;
  const PADDING_HORIZONTAL = 10;

  return (
    <View style={[styles.container, style, fullWidth && styles.fullWidth]}>
      {options.map((option, index) => {
        const isSelected = option.value === value;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.button,
              // 첫 번째 버튼이 아니면 왼쪽 border 추가
              index > 0 && styles.borderLeft,
              { height: BUTTON_HEIGHT, paddingHorizontal: PADDING_HORIZONTAL },
              isSelected && styles.buttonSelected,
              fullWidth && styles.buttonFullWidth,
            ]}
            onPress={() => {
              if (option.value !== value) {
                onChange(option.value);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.buttonContent}>
              {option.icon && (
                <FontAwesome6
                  name={option.icon as any}
                  size={ICON_SIZE}
                  color={isSelected ? colors.primary : colors.text}
                  style={{ marginRight: option.label ? 6 : 0 }}
                />
              )}
              <Text
                style={[
                  styles.buttonText,
                  { fontSize: FONT_SIZE },
                  isSelected && styles.buttonTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  buttonFullWidth: {
    flex: 1,
  },
  buttonSelected: {
    backgroundColor: `${colors.primary}15`,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text,
    fontWeight: '400',
  },
  buttonTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
