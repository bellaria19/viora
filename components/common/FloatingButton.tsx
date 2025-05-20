import { colors } from '@/constants/colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface FloatingButtonProps {
  onPress: () => void;
  iconName?: string;
  backgroundColor: string;
}

export default memo(function FloatingButton({
  onPress,
  iconName,
  backgroundColor,
}: FloatingButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.floatingButton,
        { backgroundColor: backgroundColor || colors.primary, shadowColor: colors.primary },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <FontAwesome6 name={iconName} size={28} color="#fff" />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
});
