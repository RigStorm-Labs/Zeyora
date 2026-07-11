import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { colors, spacing, typography } from '../utils/theme';

const AvailableOrdersScreen = () => (
  <View style={styles.centered}>
    <Text style={styles.placeholderText}>Available Orders Screen</Text>
  </View>
);

const EarningsScreen = () => (
  <View style={styles.centered}>
    <Text style={styles.placeholderText}>Earnings Screen</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.centered}>
    <Text style={styles.placeholderText}>Profile Screen</Text>
  </View>
);

export const AppNavigator = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'earnings' | 'profile'>('dashboard');

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen onNavigate={(screen) => console.log(screen)} />;
      case 'orders':
        return <AvailableOrdersScreen />;
      case 'earnings':
        return <EarningsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <DashboardScreen onNavigate={() => {}} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screen}>{renderScreen()}</View>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons
            name={activeTab === 'dashboard' ? 'home' : 'home-outline'}
            size={24}
            color={activeTab === 'dashboard' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons
            name={activeTab === 'orders' ? 'list' : 'list-outline'}
            size={24}
            color={activeTab === 'orders' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabLabel, activeTab === 'orders' && styles.tabLabelActive]}>
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('earnings')}
        >
          <Ionicons
            name={activeTab === 'earnings' ? 'wallet' : 'wallet-outline'}
            size={24}
            color={activeTab === 'earnings' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabLabel, activeTab === 'earnings' && styles.tabLabelActive]}>
            Earnings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={24}
            color={activeTab === 'profile' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
