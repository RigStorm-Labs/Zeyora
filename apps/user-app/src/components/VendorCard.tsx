import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import type { Vendor } from '../types';

interface VendorCardProps {
  vendor: Vendor;
  onPress: () => void;
  variant?: 'default' | 'horizontal';
}

export const VendorCard: React.FC<VendorCardProps> = ({
  vendor,
  onPress,
  variant = 'default',
}) => {
  const getBusinessTypeIcon = () => {
    switch (vendor.businessType) {
      case 'restaurant':
        return 'restaurant';
      case 'grocery':
        return 'cart';
      case 'pharmacy':
        return 'medical';
      case 'retail':
        return 'storefront';
      default:
        return 'fast-food';
    }
  };

  const renderHorizontal = () => (
    <TouchableOpacity style={styles.horizontalContainer} onPress={onPress}>
      <Image
        source={{ uri: vendor.imageUrl || 'https://via.placeholder.com/120' }}
        style={styles.horizontalImage}
      />
      <View style={styles.horizontalContent}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {vendor.businessName}
          </Text>
          {!vendor.isOpen && (
            <View style={styles.closedBadge}>
              <Text style={styles.closedText}>Closed</Text>
            </View>
          )}
        </View>
        <View style={styles.typeRow}>
          <Ionicons name={getBusinessTypeIcon() as any} size={14} color={colors.textSecondary} />
          <Text style={styles.type}>{vendor.businessType}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.rating}>{vendor.rating.toFixed(1)}</Text>
            <Text style={styles.totalRatings}>({vendor.totalRatings})</Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.deliveryTime}>{vendor.averagePreparationTime} min</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.deliveryFee}>
            {vendor.deliveryFee === 0 ? 'Free Delivery' : `₹${vendor.deliveryFee} delivery`}
          </Text>
          {vendor.minimumOrder > 0 && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.minOrder}>Min ₹{vendor.minimumOrder}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDefault = () => (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image
        source={{ uri: vendor.imageUrl || 'https://via.placeholder.com/180' }}
        style={styles.image}
      />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {vendor.businessName}
          </Text>
          {!vendor.isOpen && (
            <View style={styles.closedBadge}>
              <Text style={styles.closedText}>Closed</Text>
            </View>
          )}
        </View>
        <View style={styles.typeRow}>
          <Ionicons name={getBusinessTypeIcon() as any} size={14} color={colors.textSecondary} />
          <Text style={styles.type}>{vendor.businessType}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.rating}>{vendor.rating.toFixed(1)}</Text>
            <Text style={styles.totalRatings}>({vendor.totalRatings})</Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.deliveryTime}>{vendor.averagePreparationTime} min</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.deliveryFee}>
            {vendor.deliveryFee === 0 ? 'Free Delivery' : `₹${vendor.deliveryFee} delivery`}
          </Text>
          {vendor.minimumOrder > 0 && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.minOrder}>Min ₹{vendor.minimumOrder}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return variant === 'horizontal' ? renderHorizontal() : renderDefault();
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  horizontalContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: 140,
  },
  horizontalImage: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    margin: spacing.sm,
  },
  content: {
    padding: spacing.md,
  },
  horizontalContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  closedBadge: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  closedText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  type: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 2,
  },
  totalRatings: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  dot: {
    color: colors.textLight,
    marginHorizontal: spacing.xs,
  },
  deliveryTime: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryFee: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  minOrder: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
