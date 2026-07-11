import { isValidEmail, isValidPhone, isValidPassword, isValidPincode, isValidIFSC } from '../utils';
import type { RegisterRequest, LoginRequest, CreateOrderRequest } from '../types/requests';

// ============================================
// Auth Validation
// ============================================

export const validateRegistration = (data: RegisterRequest): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  if (!data.email && !data.phone) {
    errors.email = ['Email or phone number is required'];
    errors.phone = ['Email or phone number is required'];
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = ['Invalid email format'];
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = ['Invalid phone number'];
  }

  if (!isValidPassword(data.password)) {
    errors.password = ['Password must be at least 8 characters'];
  }

  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.firstName = ['First name must be at least 2 characters'];
  }

  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.lastName = ['Last name must be at least 2 characters'];
  }

  return errors;
};

export const validateLogin = (data: LoginRequest): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  if (!data.email && !data.phone) {
    errors.email = ['Email or phone number is required'];
    errors.phone = ['Email or phone number is required'];
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = ['Invalid email format'];
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = ['Invalid phone number'];
  }

  if (!data.password) {
    errors.password = ['Password is required'];
  }

  return errors;
};

// ============================================
// Address Validation
// ============================================

export interface AddressValidationData {
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

export const validateAddress = (data: AddressValidationData): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  if (!data.addressLine1 || data.addressLine1.trim().length < 5) {
    errors.addressLine1 = ['Address must be at least 5 characters'];
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.city = ['City is required'];
  }

  if (!data.state || data.state.trim().length < 2) {
    errors.state = ['State is required'];
  }

  if (!isValidPincode(data.postalCode)) {
    errors.postalCode = ['Invalid pincode format'];
  }

  if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
    errors.latitude = ['Invalid latitude'];
  }

  if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
    errors.longitude = ['Invalid longitude'];
  }

  return errors;
};

// ============================================
// Order Validation
// ============================================

export const validateOrder = (data: CreateOrderRequest): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  if (!data.vendorId) {
    errors.vendorId = ['Vendor is required'];
  }

  if (!data.orderType || !['food', 'grocery', 'parcel'].includes(data.orderType)) {
    errors.orderType = ['Invalid order type'];
  }

  if (!data.items || data.items.length === 0) {
    errors.items = ['At least one item is required'];
  } else {
    data.items.forEach((item, index) => {
      if (!item.productId) {
        errors[`items[${index}].productId`] = ['Product ID is required'];
      }
      if (!item.quantity || item.quantity < 1) {
        errors[`items[${index}].quantity`] = ['Quantity must be at least 1'];
      }
    });
  }

  if (!data.deliveryAddressId) {
    errors.deliveryAddressId = ['Delivery address is required'];
  }

  if (!data.paymentMethod || !['upi', 'card', 'wallet', 'cod', 'netbanking'].includes(data.paymentMethod)) {
    errors.paymentMethod = ['Invalid payment method'];
  }

  return errors;
};

// ============================================
// Vendor Validation
// ============================================

export interface VendorValidationData {
  businessName: string;
  businessType: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export const validateVendor = (data: VendorValidationData): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  if (!data.businessName || data.businessName.trim().length < 3) {
    errors.businessName = ['Business name must be at least 3 characters'];
  }

  if (!data.businessType || !['restaurant', 'grocery', 'retail', 'pharmacy', 'parcel'].includes(data.businessType)) {
    errors.businessType = ['Invalid business type'];
  }

  if (!data.address || data.address.trim().length < 5) {
    errors.address = ['Address must be at least 5 characters'];
  }

  if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
    errors.latitude = ['Invalid latitude'];
  }

  if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
    errors.longitude = ['Invalid longitude'];
  }

  return errors;
};

// ============================================
// Partner Validation
// ============================================

export interface PartnerValidationData {
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
}

export const validatePartner = (data: PartnerValidationData): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  if (!data.vehicleType || !['bike', 'scooter', 'car', 'van'].includes(data.vehicleType)) {
    errors.vehicleType = ['Invalid vehicle type'];
  }

  if (!data.vehicleNumber || data.vehicleNumber.trim().length < 5) {
    errors.vehicleNumber = ['Vehicle number is required'];
  }

  if (!data.licenseNumber || data.licenseNumber.trim().length < 5) {
    errors.licenseNumber = ['License number is required'];
  }

  if (!data.bankDetails?.bankName) {
    errors['bankDetails.bankName'] = ['Bank name is required'];
  }

  if (!data.bankDetails?.accountNumber || data.bankDetails.accountNumber.length < 9) {
    errors['bankDetails.accountNumber'] = ['Valid account number is required'];
  }

  if (data.bankDetails?.ifscCode && !isValidIFSC(data.bankDetails.ifscCode)) {
    errors['bankDetails.ifscCode'] = ['Invalid IFSC code'];
  }

  if (!data.bankDetails?.accountHolderName) {
    errors['bankDetails.accountHolderName'] = ['Account holder name is required'];
  }

  return errors;
};

// ============================================
// Product Validation
// ============================================

export interface ProductValidationData {
  name: string;
  category: string;
  price: number;
}

export const validateProduct = (data: ProductValidationData): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = ['Product name must be at least 2 characters'];
  }

  if (!data.category || data.category.trim().length < 2) {
    errors.category = ['Category is required'];
  }

  if (data.price === undefined || data.price < 0) {
    errors.price = ['Price must be a positive number'];
  }

  return errors;
};

// ============================================
// Coupon Validation
// ============================================

export interface CouponValidationData {
  code: string;
  discountType: string;
  discountValue: number;
  minimumOrder: number;
  validFrom: string;
  validUntil: string;
}

export const validateCoupon = (data: CouponValidationData): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  if (!data.code || data.code.trim().length < 3) {
    errors.code = ['Coupon code must be at least 3 characters'];
  }

  if (!data.discountType || !['percentage', 'fixed'].includes(data.discountType)) {
    errors.discountType = ['Invalid discount type'];
  }

  if (data.discountValue === undefined || data.discountValue <= 0) {
    errors.discountValue = ['Discount value must be positive'];
  }

  if (data.discountType === 'percentage' && data.discountValue > 100) {
    errors.discountValue = ['Percentage discount cannot exceed 100'];
  }

  if (data.validFrom && isNaN(Date.parse(data.validFrom))) {
    errors.validFrom = ['Invalid start date'];
  }

  if (data.validUntil && isNaN(Date.parse(data.validUntil))) {
    errors.validUntil = ['Invalid end date'];
  }

  return errors;
};

// ============================================
// Generic Validation
// ============================================

export const hasErrors = (errors: Record<string, string[]>): boolean => {
  return Object.keys(errors).length > 0;
};

export const getFirstError = (errors: Record<string, string[]>): string => {
  const firstKey = Object.keys(errors)[0];
  return errors[firstKey]?.[0] || 'Validation failed';
};
