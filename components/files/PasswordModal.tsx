import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PasswordModalProps {
  visible: boolean;
  value: string;
  onChange: (text: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  error?: string;
}

export default function PasswordModal({
  visible,
  value,
  onChange,
  onCancel,
  onConfirm,
  error,
}: PasswordModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>비밀번호 입력</Text>
          <TextInput
            value={value}
            onChangeText={onChange}
            style={styles.input}
            autoFocus
            placeholder="ZIP 파일 비밀번호"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={onConfirm}
            maxLength={100}
          />
          {!!error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onCancel} style={styles.button}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
    color: '#ff3b30',
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
