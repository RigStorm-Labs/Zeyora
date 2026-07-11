import { CURRENCY_SYMBOL, GST_RATE, POINTS_PER_RUPEE, REDEMPTION_RATE } from '../constants';

// ============================================
// String Utilities
// ============================================

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  if (username.length <= 2) return email;
  return `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}@${domain}`;
};

export const maskPhone = (phone: string): string => {
  if (phone.length <= 4) return phone;
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
};

// ============================================
// Number Utilities
// ============================================

export const roundToDecimal = (num: number, decimals: number = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return roundToDecimal((value / total) * 100);
};

export const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return showSymbol ? `${CURRENCY_SYMBOL}${formatted}` : formatted;
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]+/g, ''));
};

// ============================================
// Date/Time Utilities
// ============================================

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const d = new Date(date);
  
  switch (format) {
    case 'long':
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
  }
};

export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(date);
};

export const getEstimatedDeliveryTime = (preparationTime: number): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + preparationTime);
  return now;
};

export const isWithinOperatingHours = (
  hours: Record<string, { open: string; close: string; isClosed?: boolean }>
): boolean => {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = hours[dayName];

  if (!todayHours || todayHours.isClosed) return false;

  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime <= closeTime;
};

// ============================================
// Geo Utilities
// ============================================

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'km' | 'm' = 'km'
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return unit === 'km' ? distance : distance * 1000;
};

const toRad = (deg: number): number => deg * (Math.PI / 180);

export const isWithinRadius = (
  centerLat: number,
  centerLon: number,
  pointLat: number,
  pointLon: number,
  radiusKm: number
): boolean => {
  const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
  return distance <= radiusKm;
};

export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
};

// ============================================
// Order Utilities
// ============================================

export const calculateTax = (subtotal: number): number => {
  return roundToDecimal((subtotal * GST_RATE) / 100);
};

export const calculateDeliveryFee = (
  subtotal: number,
  distance: number,
  baseFee: number = 20,
  perKmFee: number = 5,
  freeThreshold: number = 500
): number => {
  if (subtotal >= freeThreshold) return 0;
  const distanceFee = Math.ceil(distance) * perKmFee;
  return roundToDecimal(baseFee + distanceFee);
};

export const calculatePointsValue = (points: number): number => {
  return roundToDecimal(points * REDEMPTION_RATE);
};

export const calculatePointsEarned = (amount: number): number => {
  return Math.floor(amount * POINTS_PER_RUPEE);
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ZY${timestamp}${random}`;
};

// ============================================
// Validation Utilities
// ============================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const isValidPassword = (password: string, minLength: number = 8): boolean => {
  return password.length >= minLength;
};

export const isValidPincode = (pincode: string): boolean => {
  return /^[1-9]\d{5}$/.test(pincode);
};

export const isValidIFSC = (ifsc: string): boolean => {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
};

// ============================================
// Array Utilities
// ============================================

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// ============================================
// Object Utilities
// ============================================

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

// ============================================
// Price Calculation Utilities
// ============================================

export interface PriceCalculation {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  packingFee: number;
  tax: number;
  total: number;
}

export const calculateOrderPrice = (
  items: { price: number; quantity: number }[],
  deliveryFee: number,
  discount: number = 0,
  packingFee: number = 0
): PriceCalculation => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxableAmount = subtotal + packingFee - discount;
  const tax = calculateTax(taxableAmount);
  const total = taxableAmount + tax + deliveryFee;

  return {
    subtotal: roundToDecimal(subtotal),
    discount: roundToDecimal(discount),
    deliveryFee: roundToDecimal(deliveryFee),
    packingFee: roundToDecimal(packingFee),
    tax: roundToDecimal(tax),
    total: roundToDecimal(total),
  };
};

// ============================================
// ID Generation
// ============================================

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ============================================
// Error Handling
// ============================================

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
