import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { Shop } from '../../core/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-shop-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <main class="detail-page container">
      <a routerLink="/shops" class="back-link">← Back to Nearby Shops</a>

      @if (loading()) {
        <div class="skeleton" style="height: 260px; margin-top: 1rem"></div>
      } @else if (error()) {
        <div class="card" style="margin-top: 1rem">
          <div class="card-body" style="text-align: center; padding: 2.5rem">
            <h3>{{ error() }}</h3>
            <a class="btn btn-primary btn-sm" routerLink="/shops" style="margin-top: 1rem">
              Browse All Shops
            </a>
          </div>
        </div>
      } @else {
        @if (shop(); as s) {
          <section class="card hero-card">
            <div class="card-body hero-grid">
              <div>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap">
                  <span class="badge badge-primary">{{ s.category }}</span>
                  <span class="badge" [class.badge-success]="s.isOpen" [class.badge-error]="!s.isOpen">
                    {{ s.isOpen ? 'Open Now' : 'Closed' }}
                  </span>
                  <span class="badge badge-warning">⭐ {{ s.rating }}</span>
                  @if (s.distanceKm !== null && s.distanceKm !== undefined) {
                    <span class="badge badge-primary">{{ s.distanceKm }} km away</span>
                  }
                </div>
                <h1>{{ s.name }}</h1>
                <p class="desc">{{ s.description }}</p>
                <p class="meta">📍 {{ s.address }}, {{ s.city }}</p>
                <p class="meta">📞 {{ s.phone }}</p>
              </div>
              <div class="hero-actions">
                <a class="btn btn-outline" [href]="'tel:' + s.phone">
                  Call Seller
                </a>
                <a
                  class="btn btn-primary"
                  [href]="catalog.getDirectionsUrl(s)"
                  target="_blank"
                  rel="noopener"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </section>

          <div class="inv-header">
            <h2 class="section-title" style="margin-bottom: 0">
              Available Products ({{ filteredProducts().length }})
            </h2>
            <input
              type="text"
              class="form-input"
              style="max-width: 280px"
              [ngModel]="productFilter()"
              (ngModelChange)="productFilter.set($event)"
              placeholder="Filter products in this shop..."
            />
          </div>

          @if (filteredProducts().length === 0) {
            <p style="color: var(--color-text-secondary)">No matching products in this shop.</p>
          } @else {
            <div class="grid grid-3">
              @for (p of filteredProducts(); track p.id) {
                <article class="card">
                  <div class="card-body">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem">
                      <span class="badge badge-primary">{{ p.category }}</span>
                      <span class="badge" [class.badge-success]="p.inStock" [class.badge-error]="!p.inStock">
                        {{ p.inStock ? 'In Stock (' + p.stockCount + ')' : 'Out of Stock' }}
                      </span>
                    </div>
                    <h3>{{ p.name }}</h3>
                    <p class="p-desc">{{ p.description }}</p>
                    <div class="p-price">
                      ₹{{ p.price }} <span>/ {{ p.unit }}</span>
                    </div>
                  </div>
                </article>
              }
            </div>
          }
        }
      }
    </main>
  `,
  styles: [
    `
      .detail-page {
        padding: var(--space-8) var(--space-6) var(--space-16);
      }
      .back-link {
        font-size: var(--text-sm);
        font-weight: 600;
      }
      .hero-card {
        margin-top: var(--space-4);
      }
      .hero-grid {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-6);
        flex-wrap: wrap;
      }
      .desc {
        color: var(--color-text-secondary);
        margin: var(--space-2) 0 var(--space-4);
      }
      .meta {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        margin-bottom: var(--space-1);
      }
      .hero-actions {
        display: flex;
        gap: var(--space-3);
        flex-wrap: wrap;
      }
      .inv-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-4);
        margin: var(--space-8) 0 var(--space-5);
        flex-wrap: wrap;
      }
      .p-desc {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        margin: var(--space-2) 0 var(--space-3);
      }
      .p-price {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: 800;
        color: var(--color-primary);
      }
      .p-price span {
        font-size: var(--text-xs);
        font-weight: 500;
        color: var(--color-text-muted);
      }
    `,
  ],
})
export class ShopDetailComponent implements OnInit {
  loading = signal(true);
  error = signal('');
  shop = signal<Shop | null>(null);
  productFilter = signal('');

  filteredProducts = computed(() => {
    const items = this.shop()?.products || [];
    const term = this.productFilter().trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
    );
  });

  constructor(
    public readonly catalog: CatalogService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Shop ID is missing.');
      this.loading.set(false);
      return;
    }

    this.catalog.getShopById(id, this.catalog.userLocation()).subscribe({
      next: (data) => {
        this.shop.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Unable to load shop details.');
        this.loading.set(false);
      },
    });
  }
}
