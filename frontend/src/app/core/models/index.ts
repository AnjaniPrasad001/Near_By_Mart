export type UserRole = 'buyer' | 'seller';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  isOpen: boolean;
  rating: number;
  productCount?: number;
  distanceKm?: number | null;
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  inStock: boolean;
  stockCount: number;
  tags?: string[];
  distanceKm?: number | null;
  shop?: Shop;
}

export interface AssistantResponse {
  reply: string;
  products: Product[];
  shops: Shop[];
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}
