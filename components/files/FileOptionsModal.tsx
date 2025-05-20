import { colors } from '@/constants/colors';
import { FileOptionsModalProps } from '@/types/modal';
import { memo } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default memo(function FileOptionsModal({
  visible,
  fileName,
  onRename,
  onDelete,
  onClose,
}: FileOptionsModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.container} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{fileName}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={onRename} style={styles.actionButton}>
              <Text style={styles.renameText}>이름 수정</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  renameText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteText: {
    color: colors.errorText,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.secondaryText,
    fontSize: 15,
  },
});
