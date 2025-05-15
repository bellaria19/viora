import { colors } from '@/constants/colors';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type StepperControlProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  disabled?: boolean;
};

export default function StepperControl({
  value,
  min,
  max,
  step,
  unit = '',
  onChange,
  formatValue,
  disabled = false,
}: StepperControlProps) {
  const displayValue = formatValue ? formatValue(value) : value.toString();
  const canDecrease = value > min && !disabled;
  const canIncrease = value < max && !disabled;

  return (
    <View style={styles.stepperContainer}>
      <TouchableOpacity
        style={[styles.button, !canDecrease && styles.buttonDisabled]}
        onPress={() =>
          canDecrease && onChange(Math.max(min, Math.round((value - step) * 1000) / 1000))
        }
        disabled={!canDecrease}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.valueText}>
        {displayValue}
        {unit}
      </Text>
      <TouchableOpacity
        style={[styles.button, !canIncrease && styles.buttonDisabled]}
        onPress={() =>
          canIncrease && onChange(Math.min(max, Math.round((value + step) * 1000) / 1000))
        }
        disabled={!canIncrease}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.background,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 20,
    color: colors.text,
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 16,
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
});
