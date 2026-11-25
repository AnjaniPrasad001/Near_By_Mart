import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { Product } from '../../core/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <main class="explore-page container">
      <div class="explore-header">
        <div>
          <h1 class="section-title" style="margin-bottom: 0.25rem">Discover Local Products</h1>
          <p class="section-subtitle">
            Search inventory across nearby shops, compare prices, and get directions.
          </p>
        </div>
        <button class="btn btn-outline btn-sm" (click)="enableLocation()">
          <span class="material-icons" style="font-size: 18px">my_location</span>
          {{ catalog.userLocation() ? 'Sorted by Distance' : 'Use My Location' }}
        </button>
      </div>

      <div class="filter-panel card">
        <div class="card-body filter-row">
          <div class="search-bar" style="max-width: none">
            <span class="material-icons" style="color: var(--color-text-muted)">search</span>
            <input
              type="text"
              [(ngModel)]="query"
              (keyup.enter)="loadProducts()"
              placeholder="Search rice, running shoes, pooja items, charger..."
            />
            <button class="btn btn-primary btn-sm" (click)="loadProducts()">Search</button>
          </div>

          <label class="stock-toggle">
            <input type="checkbox" [(ngModel)]="inStockOnly" (change)="loadProducts()" />
            <span>In stock only</span>
          </label>
        </div>

        <div class="category-chips">
          @for (cat of categories; track cat) {
            <button
              class="chip"
              [class.active]="selectedCategory === cat"
              (click)="selectCategory(cat)"
            >
              {{ cat }}
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-3">
          @for (item of [1, 2, 3, 4, 5, 6]; track item) {
            <div class="skeleton" style="height: 220px"></div>
          }
        </div>
      } @else if (error()) {
        <div class="empty-state card">
          <div class="card-body">
            <h3>Unable to load products</h3>
            <p>{{ error() }}</p>
            <button class="btn btn-primary btn-sm" style="margin-top: 1rem" (click)="loadProducts()">
              Retry
            </button>
          </div>
        </div>
      } @else if (products().length === 0) {
        <div class="empty-state card">
          <div class="card-body">
            <h3>No products matched your search</h3>
            <p>Try clearing filters or asking the AI Assistant for suggestions.</p>
            <div style="display: flex; gap: 0.75rem; justify-content: center; margin-top: 1rem">
              <button class="btn btn-secondary btn-sm" (click)="resetFilters()">Reset Filters</button>
              <a class="btn btn-primary btn-sm" routerLink="/assistant">Ask AI Assistant</a>
            </div>
          </div>
        </div>
      } @else {
        <p class="result-count">Showing {{ products().length }} product(s)</p>
        <div class="grid grid-3">
          @for (product of products(); track product.id) {
            <article class="card product-card">
              <div class="card-body product-body">
                <div class="product-top">
                  <span class="badge badge-primary">{{ product.category }}</span>
                  <span class="badge" [class.badge-success]="product.inStock" [class.badge-error]="!product.inStock">
                    {{ product.inStock ? 'In Stock (' + product.stockCount + ')' : 'Out of Stock' }}
                  </span>
                </div>

                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-desc">{{ product.description }}</p>

                <div class="price-row">
                  <span class="price">₹{{ product.price }}</span>
                  <span class="unit">/ {{ product.unit }}</span>
                </div>

                @if (product.shop) {
                  <div class="shop-meta">
                    <div class="shop-title">
                      <strong>{{ product.shop.name }}</strong>
                      @if (product.distanceKm !== null && product.distanceKm !== undefined) {
                        <span class="distance-pill">{{ product.distanceKm }} km</span>
                      }
                    </div>
                    <p class="shop-addr">{{ product.shop.address }}, {{ product.shop.city }}</p>
                  </div>

                  <div class="card-actions">
                    <a class="btn btn-secondary btn-sm" [routerLink]="['/shops', product.shop.id]">
                      View Shop
                    </a>
                    <a
                      class="btn btn-primary btn-sm"
                      [href]="catalog.getDirectionsUrl(product.shop)"
                      target="_blank"
                      rel="noopener"
                    >
                      Directions
                    </a>
                  </div>
                }
              </div>
            </article>
          }
        </div>
      }
    </main>
  `,
  styles: [
    `
      .explore-page {
        padding: var(--space-8) var(--space-6) var(--space-16);
      }
      .explore-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
        flex-wrap: wrap;
      }
      .filter-panel {
        margin-bottom: var(--space-6);
      }
      .filter-row {
        display: flex;
        gap: var(--space-4);
        align-items: center;
        flex-wrap: wrap;
        padding-bottom: var(--space-4);
      }
      .filter-row .search-bar {
        flex: 1;
        min-width: 260px;
      }
      .stock-toggle {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-sm);
        font-weight: 500;
        cursor: pointer;
      }
      .category-chips {
        display: flex;
        gap: var(--space-2);
        flex-wrap: wrap;
        padding: 0 var(--space-6) var(--space-5);
      }
      .chip {
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-full);
        border: 1px solid var(--color-border);
        background: var(--color-bg);
        font-size: var(--text-xs);
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .chip.active,
      .chip:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }
      .result-count {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        margin-bottom: var(--space-4);
      }
      .product-body {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: var(--space-3);
      }
      .product-top {
        display: flex;
        justify-content: space-between;
        gap: var(--space-2);
      }
      .product-name {
        font-size: var(--text-lg);
      }
      .product-desc {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        flex: 1;
      }
      .price-row {
        display: flex;
        align-items: baseline;
        gap: var(--space-1);
      }
      .price {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: 800;
        color: var(--color-primary);
      }
      .unit {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }
      .shop-meta {
        padding-top: var(--space-3);
        border-top: 1px solid var(--color-border-light);
      }
      .shop-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: var(--text-sm);
      }
      .distance-pill {
        font-size: var(--text-xs);
        font-weight: 600;
        color: var(--color-secondary-dark);
      }
      .shop-addr {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }
      .card-actions {
        display: flex;
        gap: var(--space-2);
      }
      .card-actions a {
        flex: 1;
      }
      .empty-state {
        text-align: center;
        padding: var(--space-10);
      }
    `,
  ],
})
export class ExploreComponent implements OnInit {
  readonly categories = [
    'All',
    'Kirana',
    'Grocery',
    'Pooja',
    'Shoes',
    'Clothing',
    'Electronics',
    'Bakery',
    'Pharmacy',
    'Stationery',
  ];

  query = '';
  selectedCategory = 'All';
  inStockOnly = false;
  loading = signal(true);
  error = signal('');
  products = signal<Product[]>([]);

  constructor(
    public readonly catalog: CatalogService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('q') || '';
      this.selectedCategory = params.get('category') || 'All';
      this.loadProducts();
    });
  }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.loadProducts();
  }

  resetFilters(): void {
    this.query = '';
    this.selectedCategory = 'All';
    this.inStockOnly = false;
    this.loadProducts();
  }

  async enableLocation(): Promise<void> {
    await this.catalog.requestLocation();
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set('');
    this.catalog
      .searchProducts({
        q: this.query,
        category: this.selectedCategory,
        inStock: this.inStockOnly,
        coords: this.catalog.userLocation(),
      })
      .subscribe({
        next: (items) => {
          this.products.set(items);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Could not reach the backend server.');
          this.loading.set(false);
        },
      });
  }
}
