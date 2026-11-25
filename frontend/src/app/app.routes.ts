import { Routes } from '@angular/router';

export const routes: Routes = [
  // Landing page (public)
  {
    path: '',
    loadComponent: () =>
      import('./landing/landing.component').then((m) => m.LandingComponent),
  },

  // Auth routes — Phase 3
  // {
  //   path: 'auth',
  //   loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES),
  // },

  // Buyer routes — Phase 6
  // {
  //   path: '',
  //   loadChildren: () => import('./buyer/buyer.routes').then(m => m.BUYER_ROUTES),
  // },

  // Seller routes — Phase 4
  // {
  //   path: 'seller',
  //   loadChildren: () => import('./seller/seller.routes').then(m => m.SELLER_ROUTES),
  // },

  // Wildcard — redirect to home
  {
    path: '**',
    redirectTo: '',
  },
];
