import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <main class="auth-page container">
      <div class="auth-card card">
        <div class="card-body">
          <h1 class="auth-title">Create your account</h1>
          <p class="auth-subtitle">Join Near By Mart as a buyer or list your local shop as a seller.</p>

          @if (error()) {
            <div class="alert-error">{{ error() }}</div>
          }

          <form (ngSubmit)="submit()">
            <div class="form-group">
              <label class="form-label">Account Type</label>
              <div class="role-toggle">
                <button
                  type="button"
                  class="role-btn"
                  [class.active]="role === 'buyer'"
                  (click)="role = 'buyer'"
                >
                  🛒 Buyer
                </button>
                <button
                  type="button"
                  class="role-btn"
                  [class.active]="role === 'seller'"
                  (click)="role = 'seller'"
                >
                  🏪 Seller
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                class="form-input"
                [(ngModel)]="name"
                name="name"
                placeholder="Your full name"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                class="form-input"
                [(ngModel)]="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-phone">Phone (optional)</label>
              <input
                id="reg-phone"
                type="text"
                class="form-input"
                [(ngModel)]="phone"
                name="phone"
                placeholder="+91 98765 43210"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                class="form-input"
                [(ngModel)]="password"
                name="password"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <button class="btn btn-primary auth-submit" type="submit" [disabled]="loading()">
              {{ loading() ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <p class="auth-footer">
            Already have an account?
            <a routerLink="/auth/login">Sign in</a>
          </p>
        </div>
      </div>
    </main>
  `,
  styles: [
    `
      .auth-page {
        min-height: calc(100vh - var(--header-height));
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-10) var(--space-4);
      }
      .auth-card {
        width: 100%;
        max-width: 460px;
      }
      .auth-title {
        font-size: var(--text-2xl);
        margin-bottom: var(--space-2);
      }
      .auth-subtitle {
        color: var(--color-text-secondary);
        font-size: var(--text-sm);
        margin-bottom: var(--space-6);
      }
      .role-toggle {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-3);
      }
      .role-btn {
        padding: var(--space-3);
        border-radius: var(--radius-lg);
        border: 1.5px solid var(--color-border);
        background: var(--color-bg);
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .role-btn.active {
        border-color: var(--color-primary);
        background: var(--color-primary-50);
        color: var(--color-primary);
      }
      .auth-submit {
        width: 100%;
      }
      .alert-error {
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-md);
        background: rgba(239, 68, 68, 0.1);
        color: var(--color-error);
        font-size: var(--text-sm);
        margin-bottom: var(--space-4);
      }
      .auth-footer {
        margin-top: var(--space-5);
        text-align: center;
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
      }
    `,
  ],
})
export class RegisterComponent {
  name = '';
  email = '';
  phone = '';
  password = '';
  role: UserRole = 'buyer';
  loading = signal(false);
  error = signal('');

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    route: ActivatedRoute,
  ) {
    const qRole = route.snapshot.queryParamMap.get('role');
    if (qRole === 'seller') {
      this.role = 'seller';
    }
  }

  submit(): void {
    if (!this.name.trim() || !this.email.trim() || this.password.length < 6) {
      this.error.set('Please enter name, valid email, and password (6+ characters).');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.auth
      .register({
        name: this.name.trim(),
        email: this.email.trim(),
        password: this.password,
        role: this.role,
        phone: this.phone.trim(),
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.router.navigate([res.data.user.role === 'seller' ? '/seller' : '/explore']);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message || 'Registration failed.');
        },
      });
  }
}
