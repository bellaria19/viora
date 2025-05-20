import { colors } from '@/constants/colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedbackScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <StatusBar style="auto" />
      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <FontAwesome6 name="envelope" size={32} color={colors.primary} />
          </View>

          <Text style={styles.title}>피드백 보내기</Text>
          <Text style={styles.description}>
            앱 사용 중 발견한 버그나 개선 사항에 대한 의견을 보내주세요. 더 나은 앱을 만드는데
            도움이 됩니다.
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>주제</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="제목을 입력하세요"
                placeholderTextColor={colors.placeholder}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>내용</Text>
            <View style={styles.textareaContainer}>
              <TextInput
                style={styles.textarea}
                placeholder="자세한 내용을 입력하세요"
                placeholderTextColor={colors.placeholder}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>이메일 (선택사항)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="회신받을 이메일 주소"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>피드백 보내기</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>또는</Text>

          <TouchableOpacity
            style={styles.emailButton}
            activeOpacity={0.8}
            onPress={() => Linking.openURL('mailto:support@example.com?subject=Viora 앱 피드백')}
          >
            <FontAwesome6
              name="envelope"
              size={16}
              color={colors.primary}
              style={styles.emailIcon}
            />
            <Text style={styles.emailButtonText}>이메일로 문의하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingTop: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    color: colors.secondaryText,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.text,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  input: {
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  textareaContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
  },
  textarea: {
    padding: 12,
    fontSize: 16,
    color: colors.text,
    height: 120,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 16,
    color: colors.secondaryText,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  emailIcon: {
    marginRight: 8,
  },
  emailButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
