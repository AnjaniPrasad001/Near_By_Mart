import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiEnvelope,
  AssistantResponse,
  Product,
  Shop,
} from '../models';

export interface Coordinates {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly apiUrl = environment.apiUrl;
  readonly userLocation = signal<Coordinates | null>(null);

  constructor(private readonly http: HttpClient) {}

  requestLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          this.userLocation.set(coords);
          resolve(coords);
        },
        () => {
          // Fallback to central Hyderabad demo coordinates if permission denied
          const fallback = { lat: 17.4435, lng: 78.3772 };
          this.userLocation.set(fallback);
          resolve(fallback);
        },
        { timeout: 6000 },
      );
    });
  }

  searchProducts(filters: {
    q?: string;
    category?: string;
    inStock?: boolean;
    coords?: Coordinates | null;
  }): Observable<Product[]> {
    let params = new HttpParams();
    if (filters.q?.trim()) params = params.set('q', filters.q.trim());
    if (filters.category && filters.category !== 'All') {
      params = params.set('category', filters.category);
    }
    if (filters.inStock) params = params.set('inStock', 'true');
    if (filters.coords) {
      params = params
        .set('lat', String(filters.coords.lat))
        .set('lng', String(filters.coords.lng));
    }

    return this.http
      .get<ApiEnvelope<Product[]>>(`${this.apiUrl}/products`, { params })
      .pipe(map((res) => res.data));
  }

  getShops(filters?: {
    category?: string;
    search?: string;
    coords?: Coordinates | null;
  }): Observable<Shop[]> {
    let params = new HttpParams();
    if (filters?.category && filters.category !== 'All') {
      params = params.set('category', filters.category);
    }
    if (filters?.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }
    if (filters?.coords) {
      params = params
        .set('lat', String(filters.coords.lat))
        .set('lng', String(filters.coords.lng));
    }

    return this.http
      .get<ApiEnvelope<Shop[]>>(`${this.apiUrl}/shops`, { params })
      .pipe(map((res) => res.data));
  }

  getShopById(id: string, coords?: Coordinates | null): Observable<Shop> {
    let params = new HttpParams();
    if (coords) {
      params = params
        .set('lat', String(coords.lat))
        .set('lng', String(coords.lng));
    }
    return this.http
      .get<ApiEnvelope<Shop>>(`${this.apiUrl}/shops/${id}`, { params })
      .pipe(map((res) => res.data));
  }

  getMyShops(): Observable<Shop[]> {
    return this.http
      .get<ApiEnvelope<Shop[]>>(`${this.apiUrl}/shops/my-shops`)
      .pipe(map((res) => res.data));
  }

  createShop(payload: {
    name: string;
    description: string;
    category: string;
    address: string;
    city: string;
    phone: string;
    lat?: number;
    lng?: number;
  }): Observable<Shop> {
    return this.http
      .post<ApiEnvelope<Shop>>(`${this.apiUrl}/shops`, payload)
      .pipe(map((res) => res.data));
  }

  updateShop(id: string, payload: Partial<Shop>): Observable<Shop> {
    return this.http
      .patch<ApiEnvelope<Shop>>(`${this.apiUrl}/shops/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  createProduct(payload: {
    shopId: string;
    name: string;
    description: string;
    category: string;
    price: number;
    unit: string;
    stockCount: number;
    tags?: string;
  }): Observable<Product> {
    return this.http
      .post<ApiEnvelope<Product>>(`${this.apiUrl}/products`, payload)
      .pipe(map((res) => res.data));
  }

  updateProduct(id: string, payload: Partial<Product>): Observable<Product> {
    return this.http
      .patch<ApiEnvelope<Product>>(`${this.apiUrl}/products/${id}`, payload)
      .pipe(map((res) => res.data));
  }

  deleteProduct(id: string): Observable<{ id: string }> {
    return this.http
      .delete<ApiEnvelope<{ id: string }>>(`${this.apiUrl}/products/${id}`)
      .pipe(map((res) => res.data));
  }

  askAssistant(
    message: string,
    coords?: Coordinates | null,
  ): Observable<AssistantResponse> {
    return this.http
      .post<ApiEnvelope<AssistantResponse>>(`${this.apiUrl}/assistant/chat`, {
        message,
        ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
      })
      .pipe(map((res) => res.data));
  }

  getDirectionsUrl(shop: Shop): string {
    return `https://www.google.com/maps/search/?api=1&query=${shop.location.lat},${shop.location.lng}`;
  }
}
