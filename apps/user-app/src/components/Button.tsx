import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../utils/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.textLight;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'outline':
      case 'ghost':
        return colors.transparent;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.white;
    switch (variant) {
      case 'primary':
      case 'secondary':
        return colors.white;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.text;
      default:
        return colors.white;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? colors.textLight : colors.primary;
    }
    return colors.transparent;
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'large':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getPadding(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              { color: getTextColor() },
              leftIcon && { marginLeft: spacing.sm },
              rightIcon && { marginRight: spacing.sm },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    ...typography.button,
  },
});
