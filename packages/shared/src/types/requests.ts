import type {
  User,
  UserAddress,
  Partner,
  Vendor,
  Product,
  Order,
  GeoLocation,
  Coupon,
  Review,
} from './api';

// Auth Requests
export interface RegisterRequest {
  email?: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'customer' | 'vendor' | 'partner';
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface SocialLoginRequest {
  provider: 'google' | 'apple';
  token: string;
  role?: 'customer';
}

export interface ForgotPasswordRequest {
  email?: string;
  phone?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyOTPRequest {
  email?: string;
  phone?: string;
  otp: string;
}

// Auth Responses
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// User Requests
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface AddAddressRequest {
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

// Partner Requests
export interface RegisterPartnerRequest {
  userId: string;
  vehicleType: 'bike' | 'scooter' | 'car' | 'van';
  vehicleNumber: string;
  licenseNumber: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
}

export interface SubmitKYCRequest {
  idCard: string;
  drivingLicense: string;
  vehicleRegistration: string;
  insurance: string;
}

export interface UpdatePartnerLocationRequest {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}

// Vendor Requests
export interface RegisterVendorRequest {
  userId: string;
  businessName: string;
  businessType: 'restaurant' | 'grocery' | 'retail' | 'pharmacy' | 'parcel';
  address: string;
  latitude: number;
  longitude: number;
  operatingHours: Record<string, { open: string; close: string; isClosed?: boolean }>;
  description?: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
}

export interface UpdateVendorRequest {
  businessName?: string;
  description?: string;
  operatingHours?: Record<string, { open: string; close: string; isClosed?: boolean }>;
  isOpen?: boolean;
  minimumOrder?: number;
  deliveryFee?: number;
  averagePreparationTime?: number;
}

// Product Requests
export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  images?: string[];
  price: number;
  compareAtPrice?: number;
  currency?: string;
  unit?: string;
  inStock?: boolean;
  stockQuantity?: number;
  variants?: { name: string; options: { name: string; price: number }[] }[];
  addOns?: { name: string; price: number; isDefault?: boolean }[];
  preparationTime?: number;
  tags?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  isActive?: boolean;
}

// Order Requests
export interface CreateOrderRequest {
  vendorId: string;
  orderType: 'food' | 'grocery' | 'parcel';
  items: {
    productId: string;
    quantity: number;
    variants?: Record<string, string>;
    addOns?: { name: string; price: number }[];
    specialInstructions?: string;
  }[];
  deliveryAddressId: string;
  paymentMethod: 'upi' | 'card' | 'wallet' | 'cod' | 'netbanking';
  specialInstructions?: string;
  promoCode?: string;
}

export interface UpdateOrderStatusRequest {
  status: Order['status'];
  notes?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface RateOrderRequest {
  rating: number;
  review?: string;
  images?: string[];
}

// Payment Requests
export interface CreatePaymentIntentRequest {
  orderId: string;
  paymentMethod: 'upi' | 'card' | 'netbanking';
}

export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface RefundRequest {
  orderId: string;
  amount?: number;
  reason: string;
}

// Search Requests
export interface SearchVendorsRequest {
  query?: string;
  category?: string;
  latitude: number;
  longitude: number;
  radius?: number;
  sortBy?: 'rating' | 'distance' | 'delivery_time';
  limit?: number;
  offset?: number;
}

export interface SearchProductsRequest {
  query?: string;
  vendorId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'popularity' | 'rating';
  limit?: number;
  offset?: number;
}

// Admin Requests
export interface UpdateCommissionRequest {
  vendorId: string;
  commissionRate: number;
}

export interface SuspendEntityRequest {
  entityType: 'user' | 'vendor' | 'partner';
  entityId: string;
  reason: string;
  duration?: number;
}

export interface FraudAlertRequest {
  alertId: string;
  action: 'review' | 'suspend' | 'dismiss';
  notes?: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// Export all types
export type {
  User,
  UserAddress,
  Partner,
  Vendor,
  Product,
  Order,
  GeoLocation,
  Coupon,
  Review,
};
