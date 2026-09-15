import { InjectionToken } from '@angular/core';
import {
  Auth,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  Unsubscribe,
} from 'firebase/auth';

export interface FirebaseAuthApi {
  onAuthStateChanged: (
    auth: Auth,
    nextOrObserver: (user: User | null) => void,
  ) => Unsubscribe;
  createUserWithEmailAndPassword: (
    auth: Auth,
    email: string,
    password: string,
  ) => Promise<UserCredential>;
  signInWithEmailAndPassword: (
    auth: Auth,
    email: string,
    password: string,
  ) => Promise<UserCredential>;
  signOut: (auth: Auth) => Promise<void>;
}

export const FIREBASE_AUTH_API = new InjectionToken<FirebaseAuthApi>('FIREBASE_AUTH_API', {
  providedIn: 'root',
  factory: (): FirebaseAuthApi => ({
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
  }),
});
