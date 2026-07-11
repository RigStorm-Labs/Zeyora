import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../utils/theme';

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [isOnline, setIsOnline] = React.useState(false);

  const todayStats = {
    earnings: 1250,
    deliveries: 8,
    hoursOnline: 6,
    rating: 4.8,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning! 🌅</Text>
            <Text style={styles.subtitle}>Ready to deliver?</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Online/Offline Toggle */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>You're currently</Text>
            <Text style={[styles.statusValue, isOnline && styles.statusOnline]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={colors.white}
          />
        </View>

        {/* Today's Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="cash-outline" size={24} color={colors.success} />
              </View>
              <Text style={styles.statValue}>₹{todayStats.earnings}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="bicycle" size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{todayStats.deliveries}</Text>
              <Text style={styles.statLabel}>Deliveries</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="time-outline" size={24} color={colors.warning} />
              </View>
              <Text style={styles.statValue}>{todayStats.hoursOnline}h</Text>
              <Text style={styles.statLabel}>Online</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FCE4EC' }]}>
                <Ionicons name="star" size={24} color="#E91E63" />
              </View>
              <Text style={styles.statValue}>{todayStats.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('AvailableOrders')}>
            <View style={styles.menuIcon}>
              <Ionicons name="list" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Available Orders</Text>
              <Text style={styles.menuSubtitle}>View orders near you</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('ActiveDelivery')}>
            <View style={styles.menuIcon}>
              <Ionicons name="navigate" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Active Delivery</Text>
              <Text style={styles.menuSubtitle}>Current order in progress</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('Earnings')}>
            <View style={styles.menuIcon}>
              <Ionicons name="wallet" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Earnings</Text>
              <Text style={styles.menuSubtitle}>View your earnings report</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => onNavigate('SOS')}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="warning" size={24} color={colors.error} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: colors.error }]}>SOS</Text>
              <Text style={styles.menuSubtitle}>Emergency assistance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  profileButton: {
    width: 44,
    height: 44,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusInfo: {},
  statusLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statusValue: {
    ...typography.h3,
    color: colors.text,
  },
  statusOnline: {
    color: colors.success,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
