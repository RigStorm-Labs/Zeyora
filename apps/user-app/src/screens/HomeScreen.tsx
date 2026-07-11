import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { VendorCard } from '../components';
import api from '../services/api';
import type { Vendor, Category } from '../types';

const CATEGORIES: Category[] = [
  { id: '1', name: 'Food', slug: 'restaurant', imageUrl: '' },
  { id: '2', name: 'Grocery', slug: 'grocery', imageUrl: '' },
  { id: '3', name: 'Pharmacy', slug: 'pharmacy', imageUrl: '' },
  { id: '4', name: 'Retail', slug: 'retail', imageUrl: '' },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [featuredVendors, setFeaturedVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadVendors();
  }, [selectedCategory]);

  const loadVendors = async () => {
    try {
      const response = await api.getVendors({
        category: selectedCategory || undefined,
        limit: 20,
      });
      if (response.success && response.data) {
        setVendors(response.data.vendors || []);
        setFeaturedVendors(response.data.vendors?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Failed to load vendors:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadVendors();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Search', { query: searchQuery });
    }
  };

  const handleVendorPress = (vendor: Vendor) => {
    navigation.navigate('VendorDetails', { vendorId: vendor.id });
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.slug && styles.categoryItemSelected,
      ]}
      onPress={() => handleCategoryPress(item.slug)}
    >
      <Ionicons
        name={item.slug === 'restaurant' ? 'restaurant' : 
              item.slug === 'grocery' ? 'cart' :
              item.slug === 'pharmacy' ? 'medical' : 'storefront'}
        size={24}
        color={selectedCategory === item.slug ? colors.white : colors.primary}
      />
      <Text
        style={[
          styles.categoryName,
          selectedCategory === item.slug && styles.categoryNameSelected,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderVendorItem = ({ item }: { item: Vendor }) => (
    <VendorCard vendor={item} onPress={() => handleVendorPress(item)} />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text>
            <Text style={styles.subtitle}>What would you like to eat today?</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, dishes..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Featured */}
        {featuredVendors.length > 0 && !selectedCategory && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featuredVendors}
              renderItem={renderVendorItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
              ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
            />
          </View>
        )}

        {/* All Vendors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory ? `${selectedCategory}s near you` : 'All Restaurants'}
          </Text>
          <View style={styles.vendorsContainer}>
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                onPress={() => handleVendorPress(vendor)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  seeAll: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  categoryItemSelected: {
    backgroundColor: colors.primary,
  },
  categoryName: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  categoryNameSelected: {
    color: colors.white,
  },
  featuredContainer: {
    paddingHorizontal: spacing.md,
  },
  vendorsContainer: {
    paddingHorizontal: spacing.md,
  },
});
