import React from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import Motion from './Motion';
import { useTheme } from '../context/ThemeContext';
export function Label({
  children,
  muted = false,
  large = false,
  style,
  ...rest
}) {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        {
          color: muted ? colors.muted : colors.text,
          fontSize: large ? 24 : 15,
          lineHeight: large ? 32 : 22,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
  danger = false,
  small = false,
  label,
  style,
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label || title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: secondary
            ? colors.soft
            : danger
              ? colors.danger
              : colors.primary,
          borderRadius: 12,
          paddingVertical: small ? 9 : 13,
          paddingHorizontal: small ? 12 : 18,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: secondary ? colors.text : colors.onPrimary,
          fontWeight: '700',
          fontSize: 14,
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({ label, error, style, ...props }) {
  const { colors } = useTheme();
  return (
    <View style={[{ gap: 5, marginBottom: 12 }, style]}>
      <Label style={{ fontWeight: '600' }}>{label}</Label>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        style={{
          color: colors.text,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          borderRadius: 10,
          padding: 13,
          fontSize: 16,
          minHeight: 46,
        }}
      />
      {error ? (
        <Label
          accessibilityRole="alert"
          style={{ color: colors.danger, fontSize: 13 }}
        >
          {error}
        </Label>
      ) : null}
    </View>
  );
}
export function Card({ children, style }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 16,
          padding: 18,
          gap: 12,
          marginBottom: 14,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Row({ children, style }) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Screen({ children, scroll = true }) {
  const { colors } = useTheme();
  const content = (
    <View
      style={{
        width: '100%',
        maxWidth: 1000,
        alignSelf: 'center',
        padding: 20,
        paddingBottom: 32,
      }}
    >
      {children}
    </View>
  );
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </KeyboardAvoidingView>
  );
}
export function Heading({ title, subtitle }) {
  return (
    <Motion>
      <View style={{ marginBottom: 20, gap: 4 }}>
        <Label large style={{ fontWeight: '800' }}>
          {title}
        </Label>
        {subtitle ? <Label muted>{subtitle}</Label> : null}
      </View>
    </Motion>
  );
}
export function Notice({ message, error = false }) {
  const { colors } = useTheme();
  return message ? (
    <Label
      accessibilityRole={error ? 'alert' : undefined}
      style={{
        color: error ? colors.danger : colors.primary,
        marginBottom: 12,
      }}
    >
      {message}
    </Label>
  ) : null;
}
export function StorageNotice({ store }) {
  return store.error ? (
    <View style={{ padding: 12 }}>
      <Notice message={store.error} error />
      <Button title="Retry local storage" onPress={store.retry} />
    </View>
  ) : null;
}
export const styles = StyleSheet.create({
  between: { justifyContent: 'space-between' },
  grow: { flex: 1 },
  bold: { fontWeight: '700' },
});
