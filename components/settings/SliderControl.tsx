import { colors } from '@/constants/colors';
import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

interface SliderControlProps {
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export default function SliderControl({
  value,
  min,
  max,
  step,
  unit = '',
  onChange,
  formatValue,
}: SliderControlProps) {
  const displayValue = formatValue ? formatValue(value) : value.toString();

  return (
    <View style={styles.sliderContainer}>
      <Text style={styles.sliderValue}>
        {displayValue}
        {unit}
      </Text>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  sliderValue: {
    fontSize: 14,
    color: colors.secondaryText,
    width: 40,
    textAlign: 'center',
  },
});
