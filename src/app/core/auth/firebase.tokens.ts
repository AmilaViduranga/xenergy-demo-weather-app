import { InjectionToken } from '@angular/core';
import { Auth } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIREBASE_AUTH = new InjectionToken<Auth>('FIREBASE_AUTH');
