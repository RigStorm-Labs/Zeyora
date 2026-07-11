export interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: string;
  status: string;
}

export interface Address {
  id: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface Vendor {
  id: string;
  businessName: string;
  businessType: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  totalRatings: number;
  minimumOrder: number;
  deliveryFee: number;
  averagePreparationTime: number;
  isOpen: boolean;
  imageUrl?: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  variants?: Variant[];
  addOns?: AddOn[];
  category: string;
  tags: string[];
}

export interface Variant {
  name: string;
  options: VariantOption[];
}

export interface VariantOption {
  name: string;
  price: number;
}

export interface AddOn {
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
  selectedAddOns?: AddOn[];
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  orderType: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: Address;
  estimatedDelivery?: string;
  actualDelivery?: string;
  rating?: number;
  review?: string;
  vendor: Pick<Vendor, 'id' | 'businessName'>;
  partner?: {
    id: string;
    name: string;
    phone?: string;
    currentLocation?: GeoLocation;
  };
  createdAt: string;
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

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  variants?: Record<string, string>;
  addOns?: AddOn[];
  specialInstructions?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}

export interface Wallet {
  id: string;
  balance: number;
  currency: string;
}

export interface LoyaltyProgram {
  id: string;
  points: number;
  lifetimePoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  sortBy?: 'rating' | 'distance' | 'delivery_time' | 'price';
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
