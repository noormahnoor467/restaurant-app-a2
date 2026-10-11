import React from 'react';
import { Text } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';
import ReservationScreen from '../screens/ReservationScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';
import { BRAND_NAME } from '../constants/brand';
const Stack = createNativeStackNavigator(),
  Tabs = createBottomTabNavigator();
const icons = {
  Menu: '☰',
  Cart: '▣',
  Reservation: '▦',
  Orders: '◷',
  Profile: '●',
};
function CustomerTabs() {
  const { colors } = useTheme(),
    { count } = useCart();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          minHeight: 65,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ color }) => (
          <Text style={{ color, fontSize: 20 }}>{icons[route.name]}</Text>
        ),
      })}
    >
      <Tabs.Screen name="Menu" component={MenuScreen} />
      <Tabs.Screen
        name="Cart"
        component={CartScreen}
        options={{ tabBarBadge: count || undefined }}
      />
      <Tabs.Screen name="Reservation" component={ReservationScreen} />
      <Tabs.Screen name="Orders" component={OrdersScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}
export default function AppNavigator() {
  const { user } = useAuth(),
    { colors, mode } = useTheme();
  const theme = {
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === 'dark' ? DarkTheme : DefaultTheme).colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      primary: colors.primary,
      border: colors.border,
    },
  };
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        key={user?.id || 'guest'}
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!user ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : user.role === 'Manager' ? (
          <Stack.Screen
            name="ManagerDashboard"
            component={ManagerDashboardScreen}
            options={{ title: BRAND_NAME }}
          />
        ) : (
          <>
            <Stack.Screen
              name="CustomerTabs"
              component={CustomerTabs}
              options={{ title: BRAND_NAME }}
            />
            <Stack.Screen
              name="OrderSummary"
              component={OrderSummaryScreen}
              options={{ title: 'Order summary' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
