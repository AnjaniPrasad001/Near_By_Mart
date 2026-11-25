import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="nbm-header">
      <div class="nbm-header-inner container">
        <a class="nbm-logo" routerLink="/">
          <span class="nbm-logo-icon">🛍️</span>
          <span class="nbm-logo-text">Near<span class="nbm-logo-accent">By</span>Mart</span>
        </a>

        <nav class="nbm-nav" [class.open]="menuOpen()">
          <a routerLink="/explore" routerLinkActive="active" (click)="menuOpen.set(false)">
            Search Products
          </a>
          <a routerLink="/shops" routerLinkActive="active" (click)="menuOpen.set(false)">
            Nearby Shops
          </a>
          <a routerLink="/assistant" routerLinkActive="active" (click)="menuOpen.set(false)">
            AI Assistant
          </a>
          @if (auth.isSeller()) {
            <a routerLink="/seller" routerLinkActive="active" (click)="menuOpen.set(false)">
              Seller Dashboard
            </a>
          }
        </nav>

        <div class="nbm-actions">
          @if (auth.isLoggedIn()) {
            <span class="badge badge-primary">
              {{ auth.currentUser()?.name }} ({{ auth.currentUser()?.role }})
            </span>
            <button class="btn btn-secondary btn-sm" (click)="auth.logout()">Logout</button>
          } @else {
            <a class="btn btn-outline btn-sm" routerLink="/auth/login">Login</a>
            <a class="btn btn-primary btn-sm" routerLink="/auth/register">Register</a>
          }
        </div>

        <button
          class="nbm-menu-btn"
          aria-label="Toggle Menu"
          (click)="menuOpen.set(!menuOpen())"
        >
          <span class="material-icons">{{ menuOpen() ? 'close' : 'menu' }}</span>
        </button>
      </div>
    </header>
  `,
  styles: [
    `
      .nbm-header {
        position: sticky;
        top: 0;
        z-index: var(--z-sticky);
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--color-border-light);
        height: var(--header-height);
      }
      .nbm-header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 100%;
        gap: var(--space-4);
      }
      .nbm-logo {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        text-decoration: none;
      }
      .nbm-logo-icon {
        font-size: 1.4rem;
      }
      .nbm-logo-text {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: 800;
        color: var(--color-text-primary);
      }
      .nbm-logo-accent {
        color: var(--color-primary);
      }
      .nbm-nav {
        display: flex;
        align-items: center;
        gap: var(--space-6);
      }
      .nbm-nav a {
        font-size: var(--text-sm);
        font-weight: 500;
        color: var(--color-text-secondary);
        transition: color var(--transition-fast);
      }
      .nbm-nav a:hover,
      .nbm-nav a.active {
        color: var(--color-primary);
        font-weight: 600;
      }
      .nbm-actions {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }
      .nbm-menu-btn {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-primary);
      }
      @media (max-width: 860px) {
        .nbm-menu-btn {
          display: flex;
          align-items: center;
        }
        .nbm-nav {
          display: none;
          position: absolute;
          top: var(--header-height);
          left: 0;
          right: 0;
          background: white;
          flex-direction: column;
          padding: var(--space-4);
          border-bottom: 1px solid var(--color-border);
          box-shadow: var(--shadow-md);
        }
        .nbm-nav.open {
          display: flex;
        }
        .nbm-actions .badge {
          display: none;
        }
      }
    `,
  ],
})
export class NavbarComponent {
  menuOpen = signal(false);
  constructor(public readonly auth: AuthService) {}
}
