// API Constants
export const API_VERSION = 'v1';
export const API_BASE_URL = process.env.API_BASE_URL || '/api';

// Auth Constants
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
export const PASSWORD_MIN_LENGTH = 8;
export const OTP_EXPIRY_MINUTES = 10;
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 15;

// Order Constants
export const ORDER_STATUS_FLOW = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  assigned: 'Driver Assigned',
  picked_up: 'Picked Up',
  in_transit: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Payment Constants
export const CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

// Geo Constants
export const DEFAULT_RADIUS_KM = 5;
export const MAX_SEARCH_RADIUS_KM = 50;
export const LOCATION_UPDATE_INTERVAL_MS = 5000;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Loyalty Points
export const POINTS_PER_RUPEE = 1;
export const REDEMPTION_RATE = 0.25; // ₹0.25 per point

export const LOYALTY_TIERS = {
  bronze: { minPoints: 0, multiplier: 1, name: 'Bronze' },
  silver: { minPoints: 500, multiplier: 1.25, name: 'Silver' },
  gold: { minPoints: 1500, multiplier: 1.5, name: 'Gold' },
  platinum: { minPoints: 5000, multiplier: 2, name: 'Platinum' },
};

// Commission Rates
export const DEFAULT_COMMISSION_RATE = 15; // percentage
export const COMMISSION_TIERS = [
  { minOrders: 0, rate: 20 },
  { minOrders: 100, rate: 18 },
  { minOrders: 500, rate: 15 },
  { minOrders: 1000, rate: 12 },
];

// Delivery Fee Calculation
export const BASE_DELIVERY_FEE = 20;
export const DELIVERY_FEE_PER_KM = 5;
export const FREE_DELIVERY_THRESHOLD = 500; // ₹

// Tax Rates
export const GST_RATE = 18; // percentage
export const CGST_RATE = 9;
export const SGST_RATE = 9;

// Timeouts (ms)
export const HTTP_TIMEOUT = 30000;
export const SOCKET_TIMEOUT = 60000;

// Rate Limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const AUTH_RATE_LIMIT = 5;
export const API_RATE_LIMIT = 100;
export const SEARCH_RATE_LIMIT = 30;

// Cache TTL (seconds)
export const CACHE_TTL_SHORT = 60; // 1 minute
export const CACHE_TTL_MEDIUM = 300; // 5 minutes
export const CACHE_TTL_LONG = 3600; // 1 hour
export const CACHE_TTL_DAY = 86400; // 24 hours

// WebSocket Events
export const WS_EVENTS = {
  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  
  // Location events
  PARTNER_LOCATION_UPDATED: 'partner:location_updated',
  LOCATION_TRACKING: 'location:tracking',
  
  // Notification events
  NOTIFICATION: 'notification',
  PUSH_NOTIFICATION: 'push:notification',
  
  // Chat events
  MESSAGE: 'chat:message',
  
  // Admin events
  FRAUD_ALERT: 'admin:fraud_alert',
  SYSTEM_ALERT: 'admin:system_alert',
} as const;

// Error Codes
export const ERROR_CODES = {
  // Auth errors (1000-1099)
  AUTH_INVALID_CREDENTIALS: 'AUTH_1001',
  AUTH_TOKEN_EXPIRED: 'AUTH_1002',
  AUTH_TOKEN_INVALID: 'AUTH_1003',
  AUTH_ACCOUNT_LOCKED: 'AUTH_1004',
  AUTH_EMAIL_EXISTS: 'AUTH_1005',
  AUTH_PHONE_EXISTS: 'AUTH_1006',
  AUTH_OTP_INVALID: 'AUTH_1007',
  AUTH_OTP_EXPIRED: 'AUTH_1008',
  
  // User errors (1100-1199)
  USER_NOT_FOUND: 'USER_1101',
  USER_PROFILE_INCOMPLETE: 'USER_1102',
  USER_SUSPENDED: 'USER_1103',
  
  // Vendor errors (1200-1299)
  VENDOR_NOT_FOUND: 'VENDOR_1201',
  VENDOR_CLOSED: 'VENDOR_1202',
  VENDOR_NOT_ACTIVE: 'VENDOR_1203',
  VENDOR_OUT_OF_RANGE: 'VENDOR_1204',
  
  // Partner errors (1300-1399)
  PARTNER_NOT_FOUND: 'PARTNER_1301',
  PARTNER_KYC_PENDING: 'PARTNER_1302',
  PARTNER_KYC_REJECTED: 'PARTNER_1303',
  PARTNER_NOT_AVAILABLE: 'PARTNER_1304',
  
  // Order errors (1400-1499)
  ORDER_NOT_FOUND: 'ORDER_1401',
  ORDER_CANNOT_CANCEL: 'ORDER_1402',
  ORDER_ALREADY_CANCELLED: 'ORDER_1403',
  ORDER_INVALID_STATUS: 'ORDER_1404',
  ORDER_MIN_VALUE_NOT_MET: 'ORDER_1405',
  ORDER_OUT_OF_DELIVERY_RANGE: 'ORDER_1406',
  
  // Payment errors (1500-1599)
  PAYMENT_FAILED: 'PAYMENT_1501',
  PAYMENT_CANCELLED: 'PAYMENT_1502',
  PAYMENT_REFUND_FAILED: 'PAYMENT_1503',
  PAYMENT_INSUFFICIENT_BALANCE: 'PAYMENT_1504',
  
  // Product errors (1600-1699)
  PRODUCT_NOT_FOUND: 'PRODUCT_1601',
  PRODUCT_OUT_OF_STOCK: 'PRODUCT_1602',
  
  // Coupon errors (1700-1799)
  COUPON_NOT_FOUND: 'COUPON_1701',
  COUPON_EXPIRED: 'COUPON_1702',
  COUPON_ALREADY_USED: 'COUPON_1703',
  COUPON_MIN_VALUE_NOT_MET: 'COUPON_1704',
  COUPON_LIMIT_REACHED: 'COUPON_1705',
  
  // Address errors (1800-1899)
  ADDRESS_NOT_FOUND: 'ADDRESS_1801',
  ADDRESS_OUT_OF_DELIVERY_RANGE: 'ADDRESS_1802',
  
  // General errors (1900-1999)
  VALIDATION_ERROR: 'VALIDATION_1901',
  INTERNAL_ERROR: 'ERROR_1902',
  SERVICE_UNAVAILABLE: 'ERROR_1903',
  NOT_FOUND: 'ERROR_1904',
  FORBIDDEN: 'ERROR_1905',
  CONFLICT: 'ERROR_1906',
} as const;

// Business Types with Icons
export const BUSINESS_TYPES = {
  restaurant: {
    label: 'Restaurant',
    icon: 'restaurant',
    color: '#FF6B35',
  },
  grocery: {
    label: 'Grocery',
    icon: 'shopping-cart',
    color: '#2EC4B6',
  },
  retail: {
    label: 'Retail',
    icon: 'store',
    color: '#004E89',
  },
  pharmacy: {
    label: 'Pharmacy',
    icon: 'local-pharmacy',
    color: '#E74C3C',
  },
  parcel: {
    label: 'Parcel',
    icon: 'local-shipping',
    color: '#F39C12',
  },
} as const;

// Vehicle Types
export const VEHICLE_TYPES = {
  bike: { label: 'Bike', icon: 'two-wheeler', capacity: 'Small' },
  scooter: { label: 'Scooter', icon: 'electric-scooter', capacity: 'Small' },
  car: { label: 'Car', icon: 'directions-car', capacity: 'Medium' },
  van: { label: 'Van', icon: 'local-shipping', capacity: 'Large' },
} as const;
