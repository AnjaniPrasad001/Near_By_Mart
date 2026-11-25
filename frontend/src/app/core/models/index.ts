// ──────────────────────────────────────────────
// Application-wide interfaces and type definitions
// ──────────────────────────────────────────────

/** Standard API response envelope */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** User roles */
export type UserRole = 'buyer' | 'seller';

/** User model */
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Auth response (login/register) */
export interface AuthResponse {
  user: User;
  token: string;
}

/** Day of week for shop timings */
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/** Shop timing for a single day */
export interface DayTiming {
  day: DayOfWeek;
  isOpen: boolean;
  is24Hours: boolean;
  openTime?: string;  // HH:mm
  closeTime?: string; // HH:mm
  breakStart?: string;
  breakEnd?: string;
}

/** Shop address */
export interface ShopAddress {
  shopNumber: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

/** Shop location coordinates */
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

/** Shop model */
export interface Shop {
  _id: string;
  sellerId: string;
  name: string;
  description: string;
  sellerName: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  category: string;
  categories: string[];
  image?: string;
  address: ShopAddress;
  location: GeoLocation;
  timings: DayTiming[];
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  totalRatings: number;
  popularityScore: number;
  createdAt: string;
  updatedAt: string;
}

/** Availability status */
export type AvailabilityStatus = 'available' | 'out_of_stock' | 'temporarily_unavailable';

/** Product model */
export interface Product {
  _id: string;
  shopId: string;
  sellerId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  unit: string;
  images: string[];
  keywords: string[];
  availabilityStatus: AvailabilityStatus;
  quantity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Search result with shop and distance info */
export interface SearchResult {
  product: Product;
  shop: Shop;
  distance?: number;     // km
  relevanceScore: number;
}

/** Shop categories */
export const SHOP_CATEGORIES = [
  'Kirana',
  'Pooja',
  'Shoes',
  'Clothing',
  'Electronics',
  'Mobile Accessories',
  'Grocery',
  'Stationery',
  'Pharmacy',
  'Hardware',
  'Cosmetics',
  'Bakery',
  'Furniture',
  'Sports',
  'Home Appliances',
  'General Store',
  'Other',
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];
