import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Screen,
  Card,
  Heading,
  Field,
  Button,
  Row,
  Label,
  Notice,
} from '../components/UI';
import CategoryChip from '../components/CategoryChip';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import { authErrors } from '../utils/domain';
import { BRAND_NAME } from '../constants/brand';
export default function LoginScreen() {
  const [signupMode, setSignupMode] = useState(false),
    [show, setShow] = useState(false),
    [error, setError] = useState('');
  const { login, signup } = useAuth();
  const form = useForm(
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Customer',
    },
    (v) => authErrors(v, signupMode),
  );
  const submit = async () => {
    setError('');
    if (!form.validate()) return;
    try {
      signupMode ? await signup(form.values) : await login(form.values);
    } catch (e) {
      setError(e.message);
    }
  };
  const mode = () => {
    setSignupMode(!signupMode);
    form.reset();
    setError('');
    setShow(false);
  };
  return (
    <Screen>
      <View
        style={{
          width: '100%',
          maxWidth: 440,
          alignSelf: 'center',
          paddingTop: 30,
        }}
      >
        <Heading
          title={BRAND_NAME}
          subtitle="Good food. A little time for yourself."
        />
        <Card>
          <Heading
            title={signupMode ? 'Create an account' : 'Welcome back'}
            subtitle={
              signupMode
                ? 'Join Cafe to order and reserve a table.'
                : 'Sign in to your Cafe account.'
            }
          />
          {signupMode ? (
            <Field
              label="Full name"
              value={form.values.name}
              onChangeText={(v) => form.setValue('name', v)}
              error={form.errors.name}
              autoComplete="name"
            />
          ) : null}
          <Field
            label="Email"
            value={form.values.email}
            onChangeText={(v) => form.setValue('email', v)}
            error={form.errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Field
            label="Password"
            value={form.values.password}
            onChangeText={(v) => form.setValue('password', v)}
            error={form.errors.password}
            secureTextEntry={!show}
            autoCapitalize="none"
            autoComplete={signupMode ? 'new-password' : 'current-password'}
          />
          {signupMode ? (
            <Field
              label="Confirm password"
              value={form.values.confirmPassword}
              onChangeText={(v) => form.setValue('confirmPassword', v)}
              error={form.errors.confirmPassword}
              secureTextEntry={!show}
              autoCapitalize="none"
            />
          ) : null}
          <Button
            title={show ? 'Hide passwords' : 'Show passwords'}
            secondary
            small
            onPress={() => setShow(!show)}
          />
          <Label>Account role</Label>
          <Row>
            {['Customer', 'Manager'].map((role) => (
              <CategoryChip
                key={role}
                title={role}
                selected={form.values.role === role}
                onPress={() => form.setValue('role', role)}
              />
            ))}
          </Row>
          <Notice message={error} error />
          {/* ===== LOGIN BUTTON ===== */}
          <Button
            title={signupMode ? 'Create account' : 'Login'}
            onPress={submit}
          />
          <Button
            title={
              signupMode ? 'Already registered? Login' : 'Register / Sign Up'
            }
            secondary
            onPress={mode}
          />
        </Card>
        <Card>
          <Label style={{ fontWeight: '700' }}>Demo accounts</Label>
          <Label muted>Customer: customer@example.com / Password123</Label>
          <Label muted>Manager: manager@example.com / Manager123</Label>
          <Label muted>
            Local frontend demo. Use a sample password when signing up.
          </Label>
        </Card>
      </View>
    </Screen>
  );
}
