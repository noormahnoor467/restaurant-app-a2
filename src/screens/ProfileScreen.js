import React from 'react';
import { Switch } from 'react-native';
import {
  Screen,
  Heading,
  Card,
  Label,
  Row,
  Button,
  styles,
} from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
export function AccountControls() {
  const { logout } = useAuth(),
    { mode, toggleTheme, colors } = useTheme();
  return (
    <Card>
      <Row style={styles.between}>
        <Label>Dark mode</Label>
        {/* ===== DARK MODE ===== */}
        <Switch
          accessibilityLabel="Dark mode"
          value={mode === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </Row>
      {/* ===== LOGOUT BUTTON ===== */}
      <Button title="Logout" secondary onPress={logout} />
    </Card>
  );
}
export default function ProfileScreen() {
  const { user } = useAuth();
  return (
    <Screen>
      <Heading title="Your profile" />
      <Card>
        <Label large>{user.name}</Label>
        <Label>{user.email}</Label>
        <Label muted>{user.role}</Label>
      </Card>
      <AccountControls />
    </Screen>
  );
}
