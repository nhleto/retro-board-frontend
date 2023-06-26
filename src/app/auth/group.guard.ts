import { CanActivateFn } from '@angular/router';

export const groupGuard: CanActivateFn = (route, state) => {
  return route.paramMap.has('id');
};
