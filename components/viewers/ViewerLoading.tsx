import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface ViewerLoadingProps {
  message?: string;
}

export default function ViewerLoading({ message }: ViewerLoadingProps) {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      {message && <Text style={styles.message}>{message}</Text>}
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
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
});
