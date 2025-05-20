// import { colors } from '@/constants/colors';
// import { FontAwesome6 } from '@expo/vector-icons';
// import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// interface SettingsCardProps {
//   title: string;
//   icon: string;
//   onPress: () => void;
//   selected: boolean;
// }

// export default function SettingsCard({ title, icon, onPress, selected }: SettingsCardProps) {
//   return (
//     <TouchableOpacity
//       style={[
//         styles.settingsCard,
//         selected && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
//       ]}
//       onPress={onPress}
//       activeOpacity={0.7}
//     >
//       <View style={[styles.iconWrapper, selected && { backgroundColor: colors.primary }]}>
//         <FontAwesome6 name={icon} size={20} color={selected ? '#fff' : colors.primary} />
//       </View>
//       <Text
//         style={[styles.settingsCardTitle, selected && { color: colors.primary, fontWeight: '600' }]}
//       >
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   settingsCard: {
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: colors.border,
//     backgroundColor: colors.card,
//     minWidth: 80,
//   },
//   iconWrapper: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: `${colors.primary}15`,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   settingsCardTitle: {
//     fontSize: 14,
//     color: colors.text,
//     textAlign: 'center',
//   },
// });
