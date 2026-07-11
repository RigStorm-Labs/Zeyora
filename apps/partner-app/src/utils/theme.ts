export const colors = {
  primary: '#004E89',
  primaryLight: '#2A6497',
  primaryDark: '#003A66',
  accent: '#2EC4B6',
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2D3436',
  textSecondary: '#636E72',
  border: '#DFE6E9',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

export const theme = { colors, spacing, typography };
export default theme;
