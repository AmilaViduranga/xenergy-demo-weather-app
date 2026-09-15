import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  if (environment.e2eAuthBypass) {
    return true;
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.waitForAuth().pipe(
    map((user) => {
      if (user) {
        return true;
      }
      return router.createUrlTree(['/login']);
    }),
  );
};

export const guestGuard: CanActivateFn = () => {
  if (environment.e2eAuthBypass) {
    return true;
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.waitForAuth().pipe(
    map((user) => {
      if (!user) {
        return true;
      }
      return router.createUrlTree(['/']);
    }),
  );
};
