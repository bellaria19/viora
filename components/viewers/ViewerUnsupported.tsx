import { StyleSheet, Text, View } from 'react-native';

interface ViewerUnsupportedProps {
  message?: string;
}

export default function ViewerUnsupported({ message }: ViewerUnsupportedProps) {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.unsupportedText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  unsupportedText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
