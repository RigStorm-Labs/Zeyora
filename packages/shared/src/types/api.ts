// User Types
export interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'customer' | 'partner' | 'vendor' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted' | 'pending';

export interface UserAddress {
  id: string;
  userId: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

// Partner Types
export interface Partner {
  id: string;
  userId: string;
  user?: User;
  vehicleType: VehicleType;
  vehicleNumber?: string;
  licenseNumber?: string;
  kycStatus: KYCStatus;
  kycDocuments?: KYCDocuments;
  bankDetails?: BankDetails;
  currentLocation?: GeoLocation;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  earningsWallet: number;
  createdAt: string;
}

export type VehicleType = 'bike' | 'scooter' | 'car' | 'van';
export type KYCStatus = 'pending' | 'verified' | 'rejected';

export interface KYCDocuments {
  idCard?: string;
  drivingLicense?: string;
  vehicleRegistration?: string;
  insurance?: string;
}

export interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
}

// Vendor Types
export interface Vendor {
  id: string;
  userId: string;
  user?: User;
  businessName: string;
  businessType: BusinessType;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  operatingHours: OperatingHours;
  isActive: boolean;
  isOpen: boolean;
  rating: number;
  totalRatings: number;
  commissionRate: number;
  minimumOrder: number;
  deliveryFee: number;
  averagePreparationTime: number;
  createdAt: string;
}

export type BusinessType = 'restaurant' | 'grocery' | 'retail' | 'pharmacy' | 'parcel';

export interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
    isClosed?: boolean;
  };
}

// Product Types (MongoDB)
export interface Product {
  _id: string;
  vendorId: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  currency: string;
  unit?: string;
  inStock: boolean;
  stockQuantity: number;
  variants?: ProductVariant[];
  addOns?: ProductAddOn[];
  preparationTime?: number;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  name: string;
  options: VariantOption[];
}

export interface VariantOption {
  name: string;
  price: number;
}

export interface ProductAddOn {
  name: string;
  price: number;
  isDefault?: boolean;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: User;
  vendorId: string;
  vendor?: Vendor;
  partnerId?: string;
  partner?: Partner;
  status: OrderStatus;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  packingFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryAddress: DeliveryAddress;
  pickupAddress?: PickupAddress;
  specialInstructions?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type OrderType = 'food' | 'grocery' | 'parcel';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  variants?: Record<string, string>;
  addOns?: OrderItemAddOn[];
  specialInstructions?: string;
}

export interface OrderItemAddOn {
  name: string;
  price: number;
}

export interface DeliveryAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  label?: string;
}

export interface PickupAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  instructions?: string;
}

export type PaymentMethod = 'upi' | 'card' | 'wallet' | 'cod' | 'netbanking';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

// Transaction Types
export interface Transaction {
  id: string;
  orderId?: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  paymentGateway?: string;
  gatewayTransactionId?: string;
  status: TransactionStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type TransactionType = 'payment' | 'payout' | 'refund' | 'bonus' | 'commission';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Geo Types
export interface GeoLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp?: string;
}

// GeoJSON for tracking
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface TrackingUpdate {
  orderId: string;
  partnerId: string;
  location: GeoLocation;
  eta: number;
  status: OrderStatus;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search & Filter
export interface SearchParams {
  query?: string;
  category?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  deliveryTime?: number;
  sortBy?: 'rating' | 'distance' | 'delivery_time' | 'price';
}

// Review Types
export interface Review {
  id: string;
  orderId: string;
  userId: string;
  user?: User;
  vendorId?: string;
  partnerId?: string;
  rating: number;
  review?: string;
  images?: string[];
  isPublic: boolean;
  createdAt: string;
}

// Loyalty Types
export interface LoyaltyProgram {
  id: string;
  userId: string;
  points: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

// Analytics Types
export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalUsers: number;
  activeVendors: number;
  activePartners: number;
  ordersByStatus: Record<OrderStatus, number>;
  revenueByDay: DailyRevenue[];
  topVendors: VendorAnalytics[];
  topProducts: ProductAnalytics[];
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface VendorAnalytics {
  vendorId: string;
  vendorName: string;
  orders: number;
  revenue: number;
  rating: number;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  orders: number;
  revenue: number;
}
