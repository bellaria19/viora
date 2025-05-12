import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface ResetButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  color?: string;
}

export default function ResetButton({ label, onPress, style, textStyle, color }: ResetButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.resetButton, color && { backgroundColor: color }, style]}
      onPress={onPress}
    >
      <Text style={[styles.resetButtonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  resetButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
