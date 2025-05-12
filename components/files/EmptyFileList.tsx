import { colors } from '@/constants/colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyFileListProps {
  iconName: string;
  message: string;
  buttonLabel: string;
  onPress: () => void;
}

export default function EmptyFileList({
  iconName,
  message,
  buttonLabel,
  onPress,
}: EmptyFileListProps) {
  return (
    <View style={styles.emptyContainer}>
      <FontAwesome6
        name={iconName}
        size={48}
        color={colors.secondaryText}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyText, { color: colors.secondaryText }]}>{message}</Text>
      <TouchableOpacity style={styles.emptyAddButton} onPress={onPress} activeOpacity={0.85}>
        <FontAwesome6 name="plus" size={22} color="#fff" />
        <Text style={styles.emptyAddButtonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 56,
    backgroundColor: colors.background,
  },
  emptyIcon: {
    marginBottom: 8,
  },
  emptyText: {
    marginTop: 18,
    marginBottom: 28,
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 10,
  },
});
