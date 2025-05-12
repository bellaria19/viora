import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ViewerUnsupportedProps {
  message?: string;
}

const ViewerUnsupported: React.FC<ViewerUnsupportedProps> = ({
  message = '지원하지 않는 파일 형식입니다.',
}) => (
  <View style={styles.centerContainer}>
    <Text style={styles.unsupportedText}>{message}</Text>
  </View>
);

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

export default ViewerUnsupported;
