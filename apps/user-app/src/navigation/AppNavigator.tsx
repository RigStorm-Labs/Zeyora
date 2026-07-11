import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { HomeScreen, LoginScreen } from '../screens';
import { colors } from '../utils/theme';

// Placeholder screens
const SearchScreen = () => null;
const CartScreen = () => null;
const OrdersScreen = () => null;
const ProfileScreen = () => null;

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={HomeTabs} />
            <Stack.Screen
              name="VendorDetails"
              component={PlaceholderScreen}
              options={{ headerShown: true, title: 'Restaurant' }}
            />
            <Stack.Screen
              name="OrderDetails"
              component={PlaceholderScreen}
              options={{ headerShown: true, title: 'Order Details' }}
            />
            <Stack.Screen
              name="TrackOrder"
              component={PlaceholderScreen}
              options={{ headerShown: true, title: 'Track Order' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="Register"
              component={PlaceholderScreen}
              options={{ headerShown: true, title: 'Create Account' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const PlaceholderScreen = () => null;
