import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar />
    <main class="auth-page container">
      <div class="auth-card card">
        <div class="card-body">
          <h1 class="auth-title">Welcome back</h1>
          <p class="auth-subtitle">Sign in to discover local shops or manage your store.</p>

          @if (error()) {
            <div class="alert-error">{{ error() }}</div>
          }

          <form (ngSubmit)="submit()">
            <div class="form-group">
              <label class="form-label" for="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                class="form-input"
                [(ngModel)]="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                class="form-input"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <button class="btn btn-primary auth-submit" type="submit" [disabled]="loading()">
              {{ loading() ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="demo-box">
            <span class="demo-label">Quick Demo Sign-In:</span>
            <div class="demo-btns">
              <button type="button" class="btn btn-secondary btn-sm" (click)="fillDemo('buyer')">
                Demo Buyer
              </button>
              <button type="button" class="btn btn-secondary btn-sm" (click)="fillDemo('seller')">
                Demo Seller
              </button>
            </div>
          </div>

          <p class="auth-footer">
            New to Near By Mart?
            <a routerLink="/auth/register">Create an account</a>
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
        max-width: 440px;
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
      .demo-box {
        margin-top: var(--space-6);
        padding-top: var(--space-4);
        border-top: 1px solid var(--color-border-light);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      .demo-label {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
      }
      .demo-btns {
        display: flex;
        gap: var(--space-2);
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
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  fillDemo(role: 'buyer' | 'seller'): void {
    if (role === 'seller') {
      this.email = 'seller@nearbymart.local';
      this.password = 'Seller@123';
    } else {
      this.email = 'buyer@nearbymart.local';
      this.password = 'Buyer@123';
    }
    this.submit();
  }

  submit(): void {
    if (!this.email || !this.password) {
      this.error.set('Please enter email and password.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        const target = res.data.user.role === 'seller' ? '/seller' : '/explore';
        this.router.navigate([target]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Login failed. Please check your credentials.');
      },
    });
  }
}
