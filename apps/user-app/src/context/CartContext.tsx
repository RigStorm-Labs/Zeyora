import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, Product, Vendor, Address, AddOn } from '../types';

interface CartContextType {
  items: CartItem[];
  vendor: Vendor | null;
  deliveryAddress: Address | null;
  promoCode: string | null;
  promoDiscount: number;
  addItem: (product: Product, quantity: number, variants?: Record<string, string>, addOns?: AddOn[], instructions?: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setVendor: (vendor: Vendor) => void;
  setDeliveryAddress: (address: Address) => void;
  setPromoCode: (code: string | null) => void;
  setPromoDiscount: (discount: number) => void;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTax: () => number;
  getTotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'cart_data';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [vendor, setVendorState] = useState<Vendor | null>(null);
  const [deliveryAddress, setDeliveryAddressState] = useState<Address | null>(null);
  const [promoCode, setPromoCodeState] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscountState] = useState(0);

  // Load cart from storage
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage when it changes
  useEffect(() => {
    saveCart();
  }, [items, vendor, promoCode, promoDiscount]);

  const loadCart = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setItems(parsed.items || []);
        setVendorState(parsed.vendor || null);
        setPromoCodeState(parsed.promoCode || null);
        setPromoDiscountState(parsed.promoDiscount || 0);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          items,
          vendor,
          promoCode,
          promoDiscount,
        })
      );
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  };

  const addItem = (
    product: Product,
    quantity: number,
    variants?: Record<string, string>,
    addOns?: AddOn[],
    instructions?: string
  ) => {
    const existingIndex = items.findIndex(
      (item) =>
        item.product._id === product._id &&
        JSON.stringify(item.selectedVariants) === JSON.stringify(variants) &&
        JSON.stringify(item.selectedAddOns) === JSON.stringify(addOns)
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += quantity;
      setItems(newItems);
    } else {
      setItems([
        ...items,
        {
          product,
          quantity,
          selectedVariants: variants,
          selectedAddOns: addOns,
          specialInstructions: instructions,
        },
      ]);
    }
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(
      items.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.product._id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setVendorState(null);
    setPromoCodeState(null);
    setPromoDiscountState(0);
  };

  const setVendor = (newVendor: Vendor) => {
    // Clear cart if adding from different vendor
    if (vendor && vendor.id !== newVendor.id) {
      clearCart();
    }
    setVendorState(newVendor);
  };

  const setDeliveryAddress = (address: Address) => {
    setDeliveryAddressState(address);
  };

  const setPromoCode = (code: string | null) => {
    setPromoCodeState(code);
    if (!code) {
      setPromoDiscountState(0);
    }
  };

  const setPromoDiscount = (discount: number) => {
    setPromoDiscountState(discount);
  };

  const getSubtotal = () => {
    return items.reduce((sum, item) => {
      let itemPrice = item.product.price;
      // Add variant prices
      if (item.selectedVariants && item.product.variants) {
        for (const variant of item.product.variants) {
          const selectedOption = variant.options.find(
            (opt) => opt.name === item.selectedVariants![variant.name]
          );
          if (selectedOption) {
            itemPrice += selectedOption.price;
          }
        }
      }
      // Add add-on prices
      if (item.selectedAddOns) {
        itemPrice += item.selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
      }
      return sum + itemPrice * item.quantity;
    }, 0);
  };

  const getDeliveryFee = () => {
    if (!vendor) return 0;
    if (getSubtotal() >= 500) return 0; // Free delivery above ₹500
    return vendor.deliveryFee;
  };

  const getTax = () => {
    const subtotal = getSubtotal();
    return Math.round((subtotal * 18) / 100); // 18% GST
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryFee() + getTax() - promoDiscount;
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        vendor,
        deliveryAddress,
        promoCode,
        promoDiscount,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        setVendor,
        setDeliveryAddress,
        setPromoCode,
        setPromoDiscount,
        getSubtotal,
        getDeliveryFee,
        getTax,
        getTotal,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
