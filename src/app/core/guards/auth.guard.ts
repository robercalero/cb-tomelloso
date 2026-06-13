import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/admin/login'], {
      queryParams: { returnUrl: route.url.map(u => u.path).join('/') },
    });
    return false;
  }

  const requiredRoles = route.data?.['roles'] as string[] | undefined;
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = authService.currentUser()?.role;
    if (!userRole || !requiredRoles.includes(userRole)) {
      router.navigate(['/']);
      return false;
    }
  }

  return true;
};
