import { TestBed } from '@angular/core/testing';
import { GuardResult, MaybeAsync, provideRouter, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { authGuard, guestGuard } from './auth.guard';

function asObservable(result: MaybeAsync<GuardResult>): Observable<GuardResult> {
  return result as Observable<GuardResult>;
}

describe('auth guards', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let originalBypass: boolean;

  beforeEach(() => {
    originalBypass = environment.e2eAuthBypass;
    (environment as { e2eAuthBypass: boolean }).e2eAuthBypass = false;

    auth = jasmine.createSpyObj('AuthService', ['waitForAuth']);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  afterEach(() => {
    (environment as { e2eAuthBypass: boolean }).e2eAuthBypass = originalBypass;
  });

  it('authGuard allows authenticated users', (done) => {
    auth.waitForAuth.and.returnValue(of({ uid: '1', email: 'demo@example.com' } as never));

    TestBed.runInInjectionContext(() => {
      asObservable(authGuard({} as never, {} as never)).subscribe((value) => {
        expect(value).toBeTrue();
        done();
      });
    });
  });

  it('authGuard redirects anonymous users to login', (done) => {
    auth.waitForAuth.and.returnValue(of(null));

    TestBed.runInInjectionContext(() => {
      asObservable(authGuard({} as never, {} as never)).subscribe((value) => {
        expect(value instanceof UrlTree).toBeTrue();
        expect(String(value)).toContain('login');
        done();
      });
    });
  });

  it('guestGuard allows anonymous users', (done) => {
    auth.waitForAuth.and.returnValue(of(null));

    TestBed.runInInjectionContext(() => {
      asObservable(guestGuard({} as never, {} as never)).subscribe((value) => {
        expect(value).toBeTrue();
        done();
      });
    });
  });

  it('guestGuard redirects authenticated users to the dashboard', (done) => {
    auth.waitForAuth.and.returnValue(of({ uid: '1', email: 'demo@example.com' } as never));

    TestBed.runInInjectionContext(() => {
      asObservable(guestGuard({} as never, {} as never)).subscribe((value) => {
        expect(value).not.toBeTrue();
        expect(value instanceof UrlTree).toBeTrue();
        done();
      });
    });
  });

  it('authGuard short-circuits when e2eAuthBypass is enabled', () => {
    (environment as { e2eAuthBypass: boolean }).e2eAuthBypass = true;

    TestBed.runInInjectionContext(() => {
      expect(authGuard({} as never, {} as never)).toBeTrue();
      expect(auth.waitForAuth).not.toHaveBeenCalled();
    });
  });

  it('guestGuard short-circuits when e2eAuthBypass is enabled', () => {
    (environment as { e2eAuthBypass: boolean }).e2eAuthBypass = true;

    TestBed.runInInjectionContext(() => {
      expect(guestGuard({} as never, {} as never)).toBeTrue();
      expect(auth.waitForAuth).not.toHaveBeenCalled();
    });
  });
});
