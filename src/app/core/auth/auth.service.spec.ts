import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth, UserCredential } from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { FIREBASE_AUTH_API, FirebaseAuthApi } from './firebase-auth-api';
import { FIREBASE_AUTH } from './firebase.tokens';

describe('AuthService', () => {
  let service: AuthService;
  let router: jasmine.SpyObj<Router>;
  let authApi: jasmine.SpyObj<FirebaseAuthApi>;

  beforeEach(() => {
    const authMock = jasmine.createSpyObj<Auth>('Auth', [], { currentUser: null });
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);
    router.navigateByUrl.and.returnValue(Promise.resolve(true));

    authApi = jasmine.createSpyObj<FirebaseAuthApi>('FirebaseAuthApi', [
      'onAuthStateChanged',
      'createUserWithEmailAndPassword',
      'signInWithEmailAndPassword',
      'signOut',
    ]);
    authApi.onAuthStateChanged.and.callFake((_auth, next) => {
      next(null);
      return () => undefined;
    });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: FIREBASE_AUTH, useValue: authMock },
        { provide: FIREBASE_AUTH_API, useValue: authApi },
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('maps known Firebase auth errors to readable messages', () => {
    expect(service.mapFirebaseError({ code: 'auth/email-already-in-use' })).toContain('already registered');
    expect(service.mapFirebaseError({ code: 'auth/invalid-email' })).toContain('valid email');
    expect(service.mapFirebaseError({ code: 'auth/weak-password' })).toContain('6 characters');
    expect(service.mapFirebaseError({ code: 'auth/user-not-found' })).toContain('incorrect');
    expect(service.mapFirebaseError({ code: 'auth/wrong-password' })).toContain('incorrect');
    expect(service.mapFirebaseError({ code: 'auth/invalid-credential' })).toContain('incorrect');
    expect(service.mapFirebaseError({ code: 'auth/too-many-requests' })).toContain('Too many');
    expect(service.mapFirebaseError({ code: 'auth/unknown' })).toContain('Authentication failed');
    expect(service.mapFirebaseError('not-an-object')).toContain('Authentication failed');
  });

  it('waitForAuth returns the first auth state', async () => {
    await expectAsync(firstValueFrom(service.waitForAuth())).toBeResolvedTo(null);
  });

  it('login trims email, navigates home, and returns ok on success', async () => {
    authApi.signInWithEmailAndPassword.and.resolveTo({
      user: { email: 'demo@example.com' },
    } as UserCredential);

    const result = await firstValueFrom(service.login('  demo@example.com  ', 'secret1'));

    expect(authApi.signInWithEmailAndPassword).toHaveBeenCalled();
    const [, email, password] = authApi.signInWithEmailAndPassword.calls.mostRecent().args;
    expect(email).toBe('demo@example.com');
    expect(password).toBe('secret1');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    expect(result).toEqual({ ok: true });
  });

  it('login returns a mapped error when Firebase rejects', async () => {
    authApi.signInWithEmailAndPassword.and.rejectWith({ code: 'auth/invalid-credential' });

    const result = await firstValueFrom(service.login('demo@example.com', 'bad'));

    expect(result).toEqual({ ok: false, message: 'Email or password is incorrect.' });
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('register navigates home on success', async () => {
    authApi.createUserWithEmailAndPassword.and.resolveTo({
      user: { email: 'new@example.com' },
    } as UserCredential);

    const result = await firstValueFrom(service.register('new@example.com', 'secret1'));

    expect(result).toEqual({ ok: true });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('register returns a mapped error when the email is taken', async () => {
    authApi.createUserWithEmailAndPassword.and.rejectWith({ code: 'auth/email-already-in-use' });

    const result = await firstValueFrom(service.register('taken@example.com', 'secret1'));

    expect(result.ok).toBeFalse();
    if (!result.ok) {
      expect(result.message).toContain('already registered');
    }
  });

  it('logout signs out and sends the user to login', async () => {
    authApi.signOut.and.resolveTo();

    const navigated = await firstValueFrom(service.logout());

    expect(authApi.signOut).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(navigated).toBeTrue();
  });
});
