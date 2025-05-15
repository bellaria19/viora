import { colors } from '@/constants/colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AboutModal({ visible, onClose }: AboutModalProps) {
  if (!visible) return null;

  return (
    <Pressable style={styles.modalBackdrop} onPress={onClose}>
      <BlurView intensity={15} style={styles.blurView}>
        <View style={styles.aboutCard}>
          <TouchableOpacity style={styles.aboutCloseButton} onPress={onClose}>
            <FontAwesome6 name="xmark" size={16} color={colors.secondaryText} />
          </TouchableOpacity>

          <View style={styles.aboutHeader}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.aboutLogo}
              contentFit="contain"
            />
            <Text style={styles.aboutTitle}>Viora</Text>
            <Text style={styles.aboutVersion}>버전 1.0.0</Text>
          </View>

          <Text style={styles.aboutDescription}>
            Viora는 다양한 파일 형식(텍스트, PDF, EPUB, 이미지)을 지원하는 모바일 파일 뷰어
            앱입니다. 간편하게 파일을 관리하고 읽어보세요.
          </Text>

          <View style={styles.aboutLinks}>
            <TouchableOpacity style={styles.aboutLink}>
              <FontAwesome6 name="envelope" size={16} color={colors.primary} />
              <Text style={styles.aboutLinkText}>문의하기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.aboutLink}>
              <FontAwesome6 name="star" size={16} color={colors.primary} />
              <Text style={styles.aboutLinkText}>평가하기</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.aboutLink}>
              <FontAwesome6 name="shield" size={16} color={colors.primary} />
              <Text style={styles.aboutLinkText}>개인정보 처리방침</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.aboutCopyright}>© 2025 Bellaria. All rights reserved.</Text>
        </View>
      </BlurView>
    </Pressable>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalBackdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
  },
  blurView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutCard: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  aboutCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.buttonBackground,
    zIndex: 1,
  },
  aboutHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  aboutLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 20,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  aboutDescription: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 24,
  },
  aboutLinks: {
    width: '100%',
    marginBottom: 24,
  },
  aboutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  aboutLinkText: {
    fontSize: 16,
    color: colors.text,
  },
  aboutCopyright: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
  },
});
