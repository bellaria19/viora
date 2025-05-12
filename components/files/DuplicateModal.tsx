import { colors } from '@/constants/colors';
import { DuplicateFile } from '@/types/files';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DuplicateFileModalProps {
  visible: boolean;
  currentFile: DuplicateFile | null;
  currentIndex: number;
  totalCount: number;
  onSkip: () => void;
  onOverwrite: () => void;
}

export default function DuplicateFileModal({
  visible,
  currentFile,
  currentIndex,
  totalCount,
  onSkip,
  onOverwrite,
}: DuplicateFileModalProps) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <Pressable style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>중복된 파일</Text>
            <Text style={styles.modalSubtitle}>
              {currentIndex + 1} / {totalCount}
            </Text>
          </View>
          <Text style={styles.modalText}>
            &apos;{currentFile?.fileName}&apos; 파일이 이미 존재합니다.{'\n'}어떻게
            처리하시겠습니까?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSkip]}
              onPress={onSkip}
              activeOpacity={0.85}
            >
              <Text style={[styles.modalButtonText, { color: colors.secondaryText }]}>
                건너뛰기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonOverwrite]}
              onPress={onOverwrite}
              activeOpacity={0.85}
            >
              <Text style={[styles.modalButtonText, styles.modalButtonTextOverwrite]}>
                덮어쓰기
              </Text>
            </TouchableOpacity>
          </View>
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
    padding: 28,
    borderRadius: 18,
    width: '82%',
    maxWidth: 400,
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: colors.secondaryText,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'left',
    marginVertical: 18,
    lineHeight: 24,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonSkip: {
    backgroundColor: colors.buttonBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonOverwrite: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextOverwrite: {
    color: '#fff',
  },
});
