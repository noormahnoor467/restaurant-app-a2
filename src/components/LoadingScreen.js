import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
export default function LoadingScreen() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: theme?.colors.background || '#F7F5F0',
      }}
    >
      <ActivityIndicator color={theme?.colors.primary || '#286647'} />
      <Text style={{ color: theme?.colors.text || '#252F29' }}>
        Loading Cafe…
      </Text>
    </View>
  );
}
