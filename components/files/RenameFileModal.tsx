import { colors } from '@/constants/colors';
import { RenameFileModalProps } from '@/types/modal';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RenameFileModal({
  visible,
  value,
  onChange,
  onClose,
  onConfirm,
}: RenameFileModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>파일 이름 수정</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            style={styles.input}
            autoFocus
            placeholder="새 파일명 입력"
            returnKeyType="done"
            onSubmitEditing={onConfirm}
            maxLength={100}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.button}>
              <Text style={styles.confirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    width: '100%',
    fontSize: 15,
    marginBottom: 20,
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
  confirmText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
