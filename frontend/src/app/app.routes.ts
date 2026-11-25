import { Routes } from '@angular/router';
import { sellerGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'explore',
    loadComponent: () =>
      import('./buyer/explore/explore.component').then((m) => m.ExploreComponent),
  },
  {
    path: 'shops',
    loadComponent: () =>
      import('./buyer/shops/shops.component').then((m) => m.ShopsComponent),
  },
  {
    path: 'shops/:id',
    loadComponent: () =>
      import('./buyer/shop-detail/shop-detail.component').then(
        (m) => m.ShopDetailComponent,
      ),
  },
  {
    path: 'assistant',
    loadComponent: () =>
      import('./chatbot/assistant.component').then((m) => m.AssistantComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'seller',
    canActivate: [sellerGuard],
    loadComponent: () =>
      import('./seller/dashboard/seller-dashboard.component').then(
        (m) => m.SellerDashboardComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
