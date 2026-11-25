import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import { Product, Shop } from '../../core/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar />
    <main class="seller-page container">
      <div class="seller-head">
        <div>
          <h1 class="section-title" style="margin-bottom: 0.25rem">Seller Dashboard</h1>
          <p class="section-subtitle">Manage your local shops, product listings, and live stock availability.</p>
        </div>
        <button class="btn btn-primary btn-sm" (click)="showShopForm.set(!showShopForm())">
          {{ showShopForm() ? 'Close Form' : '+ Register New Shop' }}
        </button>
      </div>

      @if (feedback()) {
        <div class="feedback-banner">{{ feedback() }}</div>
      }
      @if (error()) {
        <div class="error-banner">{{ error() }}</div>
      }

      @if (showShopForm()) {
        <section class="card form-card">
          <div class="card-body">
            <h2 style="margin-bottom: 1rem">Create a Shop</h2>
            <form class="form-grid" (ngSubmit)="createShop()">
              <div class="form-group">
                <label class="form-label">Shop Name</label>
                <input class="form-input" [(ngModel)]="newShop.name" name="name" required placeholder="e.g. Sri Sai Kirana" />
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-input" [(ngModel)]="newShop.category" name="category">
                  @for (cat of categories; track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Address</label>
                <input class="form-input" [(ngModel)]="newShop.address" name="address" required placeholder="Street / Area" />
              </div>
              <div class="form-group">
                <label class="form-label">City</label>
                <input class="form-input" [(ngModel)]="newShop.city" name="city" required placeholder="Hyderabad" />
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <input class="form-input" [(ngModel)]="newShop.phone" name="phone" required placeholder="+91 98765 43210" />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <input class="form-input" [(ngModel)]="newShop.description" name="description" placeholder="What does your shop specialize in?" />
              </div>
              <div style="grid-column: 1 / -1">
                <button class="btn btn-primary" type="submit">Save Shop</button>
              </div>
            </form>
          </div>
        </section>
      }

      @if (loading()) {
        <div class="skeleton" style="height: 240px"></div>
      } @else if (shops().length === 0) {
        <div class="card">
          <div class="card-body" style="text-align: center; padding: 3rem">
            <h3>You haven't added a shop yet</h3>
            <p style="color: var(--color-text-secondary); margin: 0.5rem 0 1rem">
              Click "Register New Shop" above to publish your store and start adding products.
            </p>
          </div>
        </div>
      } @else {
        @for (shop of shops(); track shop.id) {
          <section class="card shop-block">
            <div class="card-body">
              <div class="shop-bar">
                <div>
                  <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem">
                    <h2>{{ shop.name }}</h2>
                    <span class="badge badge-primary">{{ shop.category }}</span>
                    <span class="badge" [class.badge-success]="shop.isOpen" [class.badge-error]="!shop.isOpen">
                      {{ shop.isOpen ? 'Open' : 'Closed' }}
                    </span>
                  </div>
                  <p class="shop-sub">📍 {{ shop.address }}, {{ shop.city }} · 📞 {{ shop.phone }}</p>
                </div>

                <div class="shop-controls">
                  <button class="btn btn-secondary btn-sm" (click)="toggleShopStatus(shop)">
                    {{ shop.isOpen ? 'Mark Closed' : 'Mark Open' }}
                  </button>
                  <button class="btn btn-primary btn-sm" (click)="openProductModal(shop.id)">
                    + Add Product
                  </button>
                </div>
              </div>

              @if (activeShopForProduct() === shop.id) {
                <form class="product-form" (ngSubmit)="addProduct(shop)">
                  <input class="form-input" [(ngModel)]="newProduct.name" name="pName" placeholder="Product name" required />
                  <input class="form-input" type="number" [(ngModel)]="newProduct.price" name="pPrice" placeholder="Price (₹)" required />
                  <input class="form-input" [(ngModel)]="newProduct.unit" name="pUnit" placeholder="Unit (e.g. 1kg, piece)" />
                  <input class="form-input" type="number" [(ngModel)]="newProduct.stockCount" name="pStock" placeholder="Stock qty" />
                  <input class="form-input" [(ngModel)]="newProduct.description" name="pDesc" placeholder="Short description" />
                  <div style="display: flex; gap: 0.5rem">
                    <button class="btn btn-primary btn-sm" type="submit">Add</button>
                    <button class="btn btn-secondary btn-sm" type="button" (click)="activeShopForProduct.set(null)">Cancel</button>
                  </div>
                </form>
              }

              <div class="inventory-list">
                @if (!shop.products || shop.products.length === 0) {
                  <p class="empty-inv">No products in this shop yet.</p>
                } @else {
                  @for (product of shop.products; track product.id) {
                    <div class="inv-row">
                      <div>
                        <strong>{{ product.name }}</strong>
                        <span class="inv-meta"> · ₹{{ product.price }} / {{ product.unit }} · Qty: {{ product.stockCount }}</span>
                      </div>
                      <div class="inv-actions">
                        <button
                          class="btn btn-sm"
                          [class.btn-success]="product.inStock"
                          [class.btn-secondary]="!product.inStock"
                          (click)="toggleProductStock(shop, product)"
                        >
                          {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
                        </button>
                        <button class="btn btn-secondary btn-sm" (click)="removeProduct(shop, product.id)">
                          Delete
                        </button>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          </section>
        }
      }
    </main>
  `,
  styles: [
    `
      .seller-page {
        padding: var(--space-8) var(--space-6) var(--space-16);
      }
      .seller-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: var(--space-4);
        margin-bottom: var(--space-6);
        flex-wrap: wrap;
      }
      .feedback-banner {
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-lg);
        background: rgba(16, 185, 129, 0.12);
        color: var(--color-success);
        font-size: var(--text-sm);
        font-weight: 600;
        margin-bottom: var(--space-5);
      }
      .error-banner {
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-lg);
        background: rgba(239, 68, 68, 0.12);
        color: var(--color-error);
        font-size: var(--text-sm);
        font-weight: 600;
        margin-bottom: var(--space-5);
      }
      .form-card {
        margin-bottom: var(--space-6);
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-4);
      }
      .shop-block {
        margin-bottom: var(--space-6);
      }
      .shop-bar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--space-4);
        flex-wrap: wrap;
        padding-bottom: var(--space-4);
        border-bottom: 1px solid var(--color-border-light);
      }
      .shop-sub {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
      }
      .shop-controls {
        display: flex;
        gap: var(--space-2);
      }
      .product-form {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-3);
        padding: var(--space-4);
        margin-top: var(--space-4);
        background: var(--color-surface);
        border-radius: var(--radius-lg);
      }
      .inventory-list {
        margin-top: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      .inv-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        background: var(--color-bg);
        border-radius: var(--radius-lg);
        flex-wrap: wrap;
      }
      .inv-meta {
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
      }
      .inv-actions {
        display: flex;
        gap: var(--space-2);
      }
      .empty-inv {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
      }
      @media (max-width: 768px) {
        .form-grid,
        .product-form {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SellerDashboardComponent implements OnInit {
  readonly categories = [
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

  loading = signal(true);
  shops = signal<Shop[]>([]);
  showShopForm = signal(false);
  activeShopForProduct = signal<string | null>(null);
  feedback = signal('');
  error = signal('');

  newShop = {
    name: '',
    category: 'Kirana',
    address: '',
    city: 'Hyderabad',
    phone: '',
    description: '',
  };

  newProduct = {
    name: '',
    price: 100,
    unit: 'piece',
    stockCount: 10,
    description: '',
  };

  constructor(private readonly catalog: CatalogService) {}

  ngOnInit(): void {
    this.loadMyShops();
  }

  loadMyShops(): void {
    this.loading.set(true);
    this.error.set('');
    this.catalog.getMyShops().subscribe({
      next: (list) => {
        this.shops.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.showError(err?.error?.message || 'Unable to load your shops.');
        this.loading.set(false);
      },
    });
  }

  createShop(): void {
    if (!this.newShop.name.trim() || !this.newShop.address.trim() || !this.newShop.phone.trim()) {
      this.showError('Shop name, address, and phone are required.');
      return;
    }
    this.catalog.createShop(this.newShop).subscribe({
      next: (created) => {
        this.shops.update((list) => [created, ...list]);
        this.showShopForm.set(false);
        this.newShop = {
          name: '',
          category: 'Kirana',
          address: '',
          city: 'Hyderabad',
          phone: '',
          description: '',
        };
        this.notify('Shop registered successfully.');
      },
      error: (err) => this.showError(err?.error?.message || 'Could not create shop.'),
    });
  }

  toggleShopStatus(shop: Shop): void {
    this.catalog.updateShop(shop.id, { isOpen: !shop.isOpen }).subscribe({
      next: (updated) => {
        this.shops.update((list) =>
          list.map((s) => (s.id === shop.id ? { ...s, isOpen: updated.isOpen } : s)),
        );
        this.notify(`Shop marked as ${updated.isOpen ? 'Open' : 'Closed'}.`);
      },
      error: (err) => this.showError(err?.error?.message || 'Could not update shop status.'),
    });
  }

  openProductModal(shopId: string): void {
    this.activeShopForProduct.set(shopId);
  }

  addProduct(shop: Shop): void {
    if (!this.newProduct.name.trim()) {
      this.showError('Product name is required.');
      return;
    }
    this.catalog
      .createProduct({
        shopId: shop.id,
        name: this.newProduct.name.trim(),
        description: this.newProduct.description.trim(),
        category: shop.category,
        price: Number(this.newProduct.price),
        unit: this.newProduct.unit.trim() || 'piece',
        stockCount: Number(this.newProduct.stockCount),
      })
      .subscribe({
        next: (created) => {
          this.shops.update((list) =>
            list.map((s) =>
              s.id === shop.id
                ? { ...s, products: [created, ...(s.products || [])] }
                : s,
            ),
          );
          this.activeShopForProduct.set(null);
          this.newProduct = {
            name: '',
            price: 100,
            unit: 'piece',
            stockCount: 10,
            description: '',
          };
          this.notify(`Added "${created.name}" to ${shop.name}.`);
        },
        error: (err) => this.showError(err?.error?.message || 'Could not add product.'),
      });
  }

  toggleProductStock(shop: Shop, product: Product): void {
    this.catalog
      .updateProduct(product.id, { inStock: !product.inStock })
      .subscribe({
        next: (updated) => {
          this.shops.update((list) =>
            list.map((s) =>
              s.id === shop.id
                ? {
                    ...s,
                    products: (s.products || []).map((p) =>
                      p.id === product.id ? { ...p, inStock: updated.inStock } : p,
                    ),
                  }
                : s,
            ),
          );
        },
        error: (err) => this.showError(err?.error?.message || 'Could not update product stock.'),
      });
  }

  removeProduct(shop: Shop, productId: string): void {
    this.catalog.deleteProduct(productId).subscribe({
      next: () => {
        this.shops.update((list) =>
          list.map((s) =>
            s.id === shop.id
              ? {
                  ...s,
                  products: (s.products || []).filter((p) => p.id !== productId),
                }
              : s,
          ),
        );
        this.notify('Product removed.');
      },
      error: (err) => this.showError(err?.error?.message || 'Could not remove product.'),
    });
  }

  private notify(msg: string): void {
    this.error.set('');
    this.feedback.set(msg);
    setTimeout(() => this.feedback.set(''), 3500);
  }

  private showError(msg: string): void {
    this.feedback.set('');
    this.error.set(msg);
  }
}
