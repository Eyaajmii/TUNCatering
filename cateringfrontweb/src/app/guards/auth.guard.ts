import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  let payload: any;
  try {
    payload = JSON.parse(atob(token.split('.')[1]));
  } catch (err) {
    router.navigate(['/login']);
    return false;
  }
  const expectedRoles: string[] = route.data['expectedRoles'];
  const expectedTypes: string[] = route.data['expectedTypes'];

  const userRole = payload.role;
  const userType = payload.roleTunisair
  if (expectedRoles && !expectedRoles.includes(userRole)) {
    router.navigate(['/login']);
    return false;
  }
  if (expectedTypes && !expectedTypes.includes(userType)) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
