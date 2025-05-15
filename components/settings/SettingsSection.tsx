import { colors } from '@/constants/colors';
import { StyleSheet, Text, View } from 'react-native';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  settingsSection: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: colors.text,
  },
});
