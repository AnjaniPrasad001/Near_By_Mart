import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/auth/login']);
};

export const sellerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.isSeller()) {
    return true;
  }
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/auth/login']);
  }
  return router.createUrlTree(['/explore']);
};
