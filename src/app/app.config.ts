import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { requestInterceptorFn } from '../app/components/core/auth/request.interceptor';
import { PermissionsService } from '../app/components/core/permissions/permissions.service';

function initPermissions(perm: PermissionsService): () => Promise<void> {
  return () => perm.load();
}



export const appConfig: ApplicationConfig = {
  providers: [
    
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideClientHydration(),
    provideHttpClient(withFetch(), withInterceptors([requestInterceptorFn])),
    provideAnimationsAsync(),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      useFactory: initPermissions,
      deps: [PermissionsService],
      multi: true
    },
  ],
  
};
