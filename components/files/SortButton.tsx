import { colors } from '@/constants/colors';
import { SortOption, sortOptions } from '@/types/sort';
import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SortButtonProps {
  currentSortOption: SortOption;
  onPress: () => void;
  iconOnly?: boolean;
}

export default function SortButton({ currentSortOption, onPress, iconOnly }: SortButtonProps) {
  const option = sortOptions.find((opt) => opt.id === currentSortOption);

  return (
    <TouchableOpacity style={styles.sortButton} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.sortButtonContent}>
        <FontAwesome6 name="sort" size={16} color={colors.primary} />
        {!iconOnly && <Text style={styles.sortButtonText}>{option?.label}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: colors.buttonBackground,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.tabIconDefault,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  sortButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortButtonText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 8,
  },
});
