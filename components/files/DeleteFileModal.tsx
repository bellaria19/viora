import { colors } from '@/constants/colors';
import { DeleteFileModalProps } from '@/types/modal';
import { memo } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default memo(function DeleteFileModal({
  visible,
  fileName,
  onClose,
  onConfirm,
}: DeleteFileModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>파일 삭제</Text>
          <Text style={styles.message}>정말로 "{fileName}" 파일을 삭제하시겠습니까?</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.button}>
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    minWidth: 260,
    maxWidth: 400,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: colors.secondaryText,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.secondaryText,
    fontSize: 15,
  },
  deleteText: {
    color: colors.errorText,
    fontSize: 15,
    fontWeight: '600',
  },
});
