import { colors } from '@/constants/colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ColorPickerProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default memo(function ColorPicker({ value, options, onChange }: ColorPickerProps) {
  return (
    <View style={styles.colorPicker}>
      {options.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorOption,
            { backgroundColor: color === 'transparent' ? '#fff' : color },
            value === color && styles.colorOptionSelected,
          ]}
          onPress={() => {
            onChange(color);
          }}
        >
          {color === 'transparent' && <FontAwesome6 name="slash" size={16} color="#ddd" />}
          {value === color && (
            <FontAwesome6
              name="check"
              size={12}
              color={['#fff', 'transparent'].includes(color) ? '#000' : '#fff'}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
});
