import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { Shop } from '../../core/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-shops',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <main class="shops-page container">
      <div class="page-head">
        <div>
          <h1 class="section-title" style="margin-bottom: 0.25rem">Nearby Local Shops</h1>
          <p class="section-subtitle">
            Browse verified neighborhood stores, check open status, and navigate instantly.
          </p>
        </div>
        <button class="btn btn-outline btn-sm" (click)="sortByDistance()">
          <span class="material-icons" style="font-size: 18px">near_me</span>
          {{ catalog.userLocation() ? 'Sorted by Distance' : 'Sort by Nearest' }}
        </button>
      </div>

      <div class="search-row">
        <div class="search-bar" style="max-width: 520px">
          <span class="material-icons" style="color: var(--color-text-muted)">storefront</span>
          <input
            type="text"
            [(ngModel)]="search"
            (keyup.enter)="loadShops()"
            placeholder="Filter shops by name, area, or city..."
          />
          <button class="btn btn-primary btn-sm" (click)="loadShops()">Filter</button>
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-3">
          @for (i of [1, 2, 3, 4, 5, 6]; track i) {
            <div class="skeleton" style="height: 210px"></div>
          }
        </div>
      } @else if (error()) {
        <div class="card">
          <div class="card-body" style="text-align: center; padding: 2.5rem">
            <h3>Unable to load shops</h3>
            <p style="color: var(--color-text-secondary); margin: 0.5rem 0 1rem">{{ error() }}</p>
            <button class="btn btn-primary btn-sm" (click)="loadShops()">Retry</button>
          </div>
        </div>
      } @else if (shops().length === 0) {
        <div class="card">
          <div class="card-body" style="text-align: center; padding: 2.5rem">
            <h3>No shops found</h3>
            <p style="color: var(--color-text-secondary)">Try a different area or shop name.</p>
          </div>
        </div>
      } @else {
        <div class="grid grid-3">
          @for (shop of shops(); track shop.id) {
            <article class="card shop-card">
              <div class="card-body shop-body">
                <div class="shop-top">
                  <span class="badge badge-primary">{{ shop.category }}</span>
                  <span class="badge" [class.badge-success]="shop.isOpen" [class.badge-error]="!shop.isOpen">
                    {{ shop.isOpen ? 'Open Now' : 'Closed' }}
                  </span>
                </div>

                <h3>{{ shop.name }}</h3>
                <p class="shop-desc">{{ shop.description }}</p>

                <div class="shop-info">
                  <span>📍 {{ shop.address }}, {{ shop.city }}</span>
                  <span>📞 {{ shop.phone }}</span>
                  <span>
                    ⭐ {{ shop.rating }} · {{ shop.productCount || 0 }} products
                    @if (shop.distanceKm !== null && shop.distanceKm !== undefined) {
                      · <strong>{{ shop.distanceKm }} km away</strong>
                    }
                  </span>
                </div>

                <div class="shop-actions">
                  <a class="btn btn-primary btn-sm" [routerLink]="['/shops', shop.id]">
                    Browse Inventory
                  </a>
                  <a
                    class="btn btn-secondary btn-sm"
                    [href]="catalog.getDirectionsUrl(shop)"
                    target="_blank"
                    rel="noopener"
                  >
                    Directions
                  </a>
                </div>
              </div>
            </article>
          }
        </div>
      }
    </main>
  `,
  styles: [
    `
      .shops-page {
        padding: var(--space-8) var(--space-6) var(--space-16);
      }
      .page-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
        flex-wrap: wrap;
      }
      .search-row {
        margin-bottom: var(--space-6);
      }
      .shop-body {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        height: 100%;
      }
      .shop-top {
        display: flex;
        justify-content: space-between;
      }
      .shop-desc {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        flex: 1;
      }
      .shop-info {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
        font-size: var(--text-xs);
        color: var(--color-text-secondary);
      }
      .shop-actions {
        display: flex;
        gap: var(--space-2);
        padding-top: var(--space-2);
      }
      .shop-actions a {
        flex: 1;
      }
    `,
  ],
})
export class ShopsComponent implements OnInit {
  search = '';
  loading = signal(true);
  error = signal('');
  shops = signal<Shop[]>([]);

  constructor(public readonly catalog: CatalogService) {}

  ngOnInit(): void {
    this.loadShops();
  }

  async sortByDistance(): Promise<void> {
    await this.catalog.requestLocation();
    this.loadShops();
  }

  loadShops(): void {
    this.loading.set(true);
    this.error.set('');
    this.catalog
      .getShops({
        search: this.search,
        coords: this.catalog.userLocation(),
      })
      .subscribe({
        next: (list) => {
          this.shops.set(list);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.message || 'Could not reach the backend server.');
          this.loading.set(false);
        },
      });
  }
}
