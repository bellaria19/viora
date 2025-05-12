import { colors } from '@/constants/colors';
import { SortOption, sortOptions } from '@/types/sort';
import { FontAwesome6 } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SortMenuProps {
  visible: boolean;
  onClose: () => void;
  currentSortOption: SortOption;
  onSelect: (option: SortOption) => void;
}

export default function SortMenu({ visible, onClose, currentSortOption, onSelect }: SortMenuProps) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>정렬</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome6 name="xmark" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.modalItem, option.id === currentSortOption && styles.modalItemActive]}
              onPress={() => onSelect(option.id as SortOption)}
              activeOpacity={0.85}
            >
              <FontAwesome6
                name={option.icon as any}
                size={16}
                color={option.id === currentSortOption ? colors.primary : colors.secondaryText}
              />
              <Text
                style={[
                  styles.modalItemText,
                  option.id === currentSortOption && styles.modalItemTextActive,
                ]}
              >
                {option.label}
              </Text>
              {option.id === currentSortOption && (
                <FontAwesome6 name="check" size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 18,
    width: '82%',
    maxWidth: 400,
    padding: 18,
    gap: 8,
    backgroundColor: colors.card,
    shadowColor: colors.tabIconDefault,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 8,
  },
  modalItemActive: {
    backgroundColor: '#e3f2fd',
  },
  modalItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.secondaryText,
  },
  modalItemTextActive: {
    fontWeight: '600',
    color: colors.primary,
  },
});
