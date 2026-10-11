import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { RestaurantProvider } from './src/context/RestaurantContext';
import { CartProvider } from './src/context/CartContext';
import { OrdersProvider } from './src/context/OrdersContext';
import AppNavigator from './src/navigation/AppNavigator';
function Content() {
  const { mode } = useTheme();
  return (
    <>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
      />
      <AppNavigator />
    </>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RestaurantProvider>
            <CartProvider>
              <OrdersProvider>
                <Content />
              </OrdersProvider>
            </CartProvider>
          </RestaurantProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
