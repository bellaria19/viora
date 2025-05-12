import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ViewerErrorProps {
  message: string;
}

const ViewerError: React.FC<ViewerErrorProps> = ({ message }) => (
  <View style={styles.centerContainer}>
    <Text style={styles.errorText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default ViewerError;
