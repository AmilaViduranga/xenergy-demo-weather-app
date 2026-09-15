import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { Observable, catchError, from, map, of, switchMap, take } from 'rxjs';
import { FIREBASE_AUTH_API } from './firebase-auth-api';
import { FIREBASE_AUTH } from './firebase.tokens';

export type AuthFormResult = { ok: true } | { ok: false; message: string };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(FIREBASE_AUTH);
  private readonly authApi = inject(FIREBASE_AUTH_API);
  private readonly router = inject(Router);

  readonly user$: Observable<User | null> = new Observable<User | null>((subscriber) => {
    const unsubscribe = this.authApi.onAuthStateChanged(this.auth, (user) => subscriber.next(user));
    return () => unsubscribe();
  });

  readonly isLoggedIn$ = this.user$.pipe(map((user) => Boolean(user)));

  register(email: string, password: string): Observable<AuthFormResult> {
    return from(this.authApi.createUserWithEmailAndPassword(this.auth, email.trim(), password)).pipe(
      switchMap(() => from(this.router.navigateByUrl('/'))),
      map(() => ({ ok: true as const })),
      catchError((error: unknown) => of({ ok: false as const, message: this.mapFirebaseError(error) })),
    );
  }

  login(email: string, password: string): Observable<AuthFormResult> {
    return from(this.authApi.signInWithEmailAndPassword(this.auth, email.trim(), password)).pipe(
      switchMap(() => from(this.router.navigateByUrl('/'))),
      map(() => ({ ok: true as const })),
      catchError((error: unknown) => of({ ok: false as const, message: this.mapFirebaseError(error) })),
    );
  }

  logout(): Observable<boolean> {
    return from(this.authApi.signOut(this.auth)).pipe(
      switchMap(() => from(this.router.navigateByUrl('/login'))),
    );
  }

  waitForAuth(): Observable<User | null> {
    return this.user$.pipe(take(1));
  }

  mapFirebaseError(error: unknown): string {
    const code =
      typeof error === 'object' && error && 'code' in error ? String((error as { code: string }).code) : '';

    switch (code) {
      case 'auth/email-already-in-use':
        return 'That email is already registered. Try logging in.';
      case 'auth/invalid-email':
        return 'Enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Email or password is incorrect.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again in a moment.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
}
