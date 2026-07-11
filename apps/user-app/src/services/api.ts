import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.manifest?.extra?.apiUrl || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  message?: string;
}

class ApiService {
  private token: string | null = null;

  async init() {
    this.token = await AsyncStorage.getItem('accessToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      AsyncStorage.setItem('accessToken', token);
    } else {
      AsyncStorage.removeItem('accessToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async register(data: {
    email?: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const response = await this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response;
  }

  async login(data: { email?: string; phone?: string; password: string }) {
    const response = await this.request<{
      user: any;
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    }

    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
    await AsyncStorage.removeItem('refreshToken');
  }

  async refreshToken() {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await this.request<{
      accessToken: string;
      expiresIn: number;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (response.data) {
      this.setToken(response.data.accessToken);
    }

    return response;
  }

  // User
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(data: { firstName?: string; lastName?: string; avatarUrl?: string }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAddresses() {
    return this.request('/users/addresses');
  }

  async addAddress(data: {
    label: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    isDefault?: boolean;
  }) {
    return this.request('/users/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string) {
    return this.request(`/users/addresses/${id}`, { method: 'DELETE' });
  }

  // Vendors
  async getVendors(params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.lat) queryParams.append('lat', params.lat.toString());
    if (params?.lng) queryParams.append('lng', params.lng.toString());
    if (params?.radius) queryParams.append('radius', params.radius.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.request(`/vendors?${queryParams.toString()}`);
  }

  async getVendorById(id: string) {
    return this.request(`/vendors/${id}`);
  }

  async getVendorProducts(vendorId: string, params?: { category?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    return this.request(`/vendors/${vendorId}/products?${queryParams.toString()}`);
  }

  // Orders
  async createOrder(data: {
    vendorId: string;
    orderType: string;
    items: {
      productId: string;
      quantity: number;
      variants?: Record<string, string>;
      addOns?: { name: string; price: number }[];
      specialInstructions?: string;
    }[];
    deliveryAddressId: string;
    paymentMethod: string;
    promoCode?: string;
    specialInstructions?: string;
  }) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return this.request(`/users/orders?${queryParams.toString()}`);
  }

  async getOrderById(id: string) {
    return this.request(`/orders/${id}`);
  }

  async cancelOrder(id: string, reason: string) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async rateOrder(id: string, rating: number, review?: string) {
    return this.request(`/orders/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  }

  async trackOrder(id: string) {
    return this.request(`/orders/${id}/track`);
  }

  // Wallet
  async getWallet() {
    return this.request('/users/wallet');
  }

  // Loyalty
  async getLoyalty() {
    return this.request('/users/loyalty');
  }
}

export const api = new ApiService();
export default api;
