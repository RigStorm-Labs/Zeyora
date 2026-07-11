export const colors = {
  primary: '#FF6B35',
  primaryLight: '#FF8A5B',
  primaryDark: '#E55A2B',
  secondary: '#004E89',
  secondaryLight: '#2A6497',
  secondaryDark: '#003A66',
  accent: '#2EC4B6',
  accentLight: '#5CD4C8',
  accentDark: '#1FA99B',

  // Status colors
  success: '#2ECC71',
  successLight: '#58D68D',
  successDark: '#27AE60',
  warning: '#F39C12',
  warningLight: '#F5B041',
  warningDark: '#D68910',
  error: '#E74C3C',
  errorLight: '#EC7063',
  errorDark: '#CB4335',
  info: '#3498DB',
  infoLight: '#5DADE2',
  infoDark: '#2980B9',

  // Background colors
  background: '#F8F9FA',
  backgroundDark: '#1A1A2E',
  surface: '#FFFFFF',
  surfaceDark: '#2D2D44',

  // Text colors
  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  textOnPrimary: '#FFFFFF',
  textOnDark: '#FFFFFF',

  // Border colors
  border: '#DFE6E9',
  borderDark: '#4A4A6A',

  // Other
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export default theme;
